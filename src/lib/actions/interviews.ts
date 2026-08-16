"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { interviews, interviewScorecards, candidates, jobApplications, jobOpenings, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/rbac";

export async function getInterviews(params?: {
  status?: string;
}) {
  try {
    const conditions = [];
    if (params?.status && params.status !== "all") {
      conditions.push(eq(interviews.status, params.status as any));
    }

    const interviewList = await db
      .select({
        id: interviews.id,
        roundTitle: interviews.roundTitle,
        roundType: interviews.roundType,
        scheduledStart: interviews.scheduledStart,
        durationMinutes: interviews.durationMinutes,
        format: interviews.format,
        meetingLink: interviews.meetingLink,
        panelMemberIds: interviews.panelMemberIds,
        status: interviews.status,
        notes: interviews.notes,
        createdAt: interviews.createdAt,
        applicationId: jobApplications.id,
        candidateId: candidates.id,
        candidateName: candidates.fullName,
        candidateEmail: candidates.email,
        jobId: jobOpenings.id,
        jobTitle: jobOpenings.title,
      })
      .from(interviews)
      .leftJoin(jobApplications, eq(interviews.applicationId, jobApplications.id))
      .leftJoin(candidates, eq(interviews.candidateId, candidates.id))
      .leftJoin(jobOpenings, eq(jobApplications.jobId, jobOpenings.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(interviews.scheduledStart));

    // Fetch scorecards for these interviews
    const scorecardList = await db
      .select({
        id: interviewScorecards.id,
        interviewId: interviewScorecards.interviewId,
        overallRating: interviewScorecards.overallRating,
        recommendation: interviewScorecards.recommendation,
        technicalScore: interviewScorecards.technicalScore,
        cultureScore: interviewScorecards.cultureScore,
        communicationScore: interviewScorecards.communicationScore,
        strengths: interviewScorecards.strengths,
        concerns: interviewScorecards.concerns,
        feedbackNotes: interviewScorecards.feedbackNotes,
        submittedAt: interviewScorecards.submittedAt,
        interviewerName: users.name,
      })
      .from(interviewScorecards)
      .leftJoin(users, eq(interviewScorecards.interviewerId, users.id));

    // Group scorecards by interviewId
    const scorecardsByInterview: Record<string, typeof scorecardList> = {};
    for (const sc of scorecardList) {
      if (!scorecardsByInterview[sc.interviewId]) {
        scorecardsByInterview[sc.interviewId] = [];
      }
      scorecardsByInterview[sc.interviewId].push(sc);
    }

    return interviewList.map((intv) => ({
      ...intv,
      scorecards: scorecardsByInterview[intv.id] || [],
    }));
  } catch (error) {
    console.error("Failed to fetch interviews:", error);
    return [];
  }
}

export async function scheduleInterview(data: {
  applicationId: string;
  candidateId: string;
  roundTitle: string;
  roundType?: string;
  scheduledStart: Date | string;
  durationMinutes?: number;
  format?: string;
  meetingLink?: string;
  panelMemberIds?: string[];
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canScheduleInterviews", user.permissions);

  const newId = `intv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await db.insert(interviews).values({
    id: newId,
    applicationId: data.applicationId,
    candidateId: data.candidateId,
    roundTitle: data.roundTitle,
    roundType: data.roundType || "technical",
    scheduledStart: new Date(data.scheduledStart),
    durationMinutes: data.durationMinutes || 60,
    format: data.format || "video",
    meetingLink: data.meetingLink || "https://meet.google.com/rec-interview-session",
    panelMemberIds: data.panelMemberIds || [user.id],
    status: "scheduled",
    notes: data.notes || "Technical round evaluation",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Advance application to interview stage if in earlier stage
  await db
    .update(jobApplications)
    .set({ stage: "interview", updatedAt: new Date() })
    .where(eq(jobApplications.id, data.applicationId));

  revalidatePath("/interviews");
  revalidatePath("/applications");
  revalidatePath("/dashboard");

  return { success: true, id: newId };
}

export async function updateInterviewStatus(
  id: string,
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "rescheduled",
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canScheduleInterviews", user.permissions);

  await db
    .update(interviews)
    .set({ status, updatedAt: new Date() })
    .where(eq(interviews.id, id));

  revalidatePath("/interviews");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function submitScorecard(data: {
  interviewId: string;
  overallRating: number;
  recommendation: "strong_hire" | "hire" | "no_hire" | "strong_no_hire";
  technicalScore?: number;
  communicationScore?: number;
  cultureScore?: number;
  strengths?: string;
  concerns?: string;
  feedbackNotes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canSubmitScorecard", user.permissions);

  const newId = `sc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await db.insert(interviewScorecards).values({
    id: newId,
    interviewId: data.interviewId,
    interviewerId: user.id,
    overallRating: data.overallRating,
    recommendation: data.recommendation,
    technicalScore: data.technicalScore || 4,
    communicationScore: data.communicationScore || 4,
    cultureScore: data.cultureScore || 4,
    strengths: data.strengths || "Strong technical depth and systematic reasoning.",
    concerns: data.concerns || "None noted.",
    feedbackNotes: data.feedbackNotes || "Clear hire recommendation.",
    submittedAt: new Date(),
  });

  // Mark interview as completed
  await db
    .update(interviews)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(interviews.id, data.interviewId));

  revalidatePath("/interviews");
  revalidatePath("/applications");
  revalidatePath("/dashboard");

  return { success: true, id: newId };
}
