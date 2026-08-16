"use server";

import { db } from "@/db";
import { jobOpenings, jobApplications, candidates, interviews, offers, departments } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/rbac";

export async function getDashboardMetrics() {
  try {
    // 1. Total active jobs
    const activeJobsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobOpenings)
      .where(eq(jobOpenings.status, "published"));
    const activeJobsCount = activeJobsResult[0]?.count || 0;

    // 2. Total active candidates in pipeline
    const candidatesResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(candidates);
    const candidatesCount = candidatesResult[0]?.count || 0;

    // 3. Upcoming interviews scheduled
    const interviewsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(interviews)
      .where(eq(interviews.status, "scheduled"));
    const upcomingInterviewsCount = interviewsResult[0]?.count || 0;

    // 4. Hired / HRM synced offers
    const hiredResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(offers)
      .where(eq(offers.status, "accepted"));
    const hiredCount = hiredResult[0]?.count || 0;

    // 5. Pipeline stage breakdown
    const stages = [
      { key: "applied", label: "Applied", color: "bg-bark-muted" },
      { key: "screening", label: "Screening", color: "bg-copper-deep" },
      { key: "shortlisted", label: "Shortlisted", color: "bg-copper" },
      { key: "interview", label: "Interviewing", color: "bg-sage-deep" },
      { key: "evaluation", label: "Evaluation", color: "bg-sage" },
      { key: "selected", label: "Selected", color: "bg-bark" },
      { key: "offer", label: "Offer Stage", color: "bg-accent" },
      { key: "hired", label: "Hired (HRM)", color: "bg-success" },
    ];

    const stageCountsResult = await db
      .select({
        stage: jobApplications.stage,
        count: sql<number>`count(*)::int`,
      })
      .from(jobApplications)
      .groupBy(jobApplications.stage);

    const countsMap: Record<string, number> = {};
    let totalApps = 0;
    for (const r of stageCountsResult) {
      countsMap[r.stage] = r.count;
      totalApps += r.count;
    }

    const pipelineStages = stages.map((s) => {
      const count = countsMap[s.key] || 0;
      const percentage = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;
      return {
        name: s.label,
        count,
        percentage,
        color: s.color,
      };
    });

    // 6. Recent applications
    const recentApps = await db
      .select({
        id: jobApplications.id,
        candidateName: candidates.fullName,
        candidateEmail: candidates.email,
        jobTitle: jobOpenings.title,
        departmentName: departments.name,
        stage: jobApplications.stage,
        fitScore: jobApplications.fitScore,
        createdAt: jobApplications.createdAt,
      })
      .from(jobApplications)
      .leftJoin(candidates, eq(jobApplications.candidateId, candidates.id))
      .leftJoin(jobOpenings, eq(jobApplications.jobId, jobOpenings.id))
      .leftJoin(departments, eq(jobOpenings.departmentId, departments.id))
      .orderBy(desc(jobApplications.createdAt))
      .limit(6);

    // 7. Recent interviews
    const upcomingInterviews = await db
      .select({
        id: interviews.id,
        roundTitle: interviews.roundTitle,
        scheduledStart: interviews.scheduledStart,
        durationMinutes: interviews.durationMinutes,
        meetingLink: interviews.meetingLink,
        status: interviews.status,
        candidateName: candidates.fullName,
        jobTitle: jobOpenings.title,
      })
      .from(interviews)
      .leftJoin(candidates, eq(interviews.candidateId, candidates.id))
      .leftJoin(jobApplications, eq(interviews.applicationId, jobApplications.id))
      .leftJoin(jobOpenings, eq(jobApplications.jobId, jobOpenings.id))
      .orderBy(desc(interviews.scheduledStart))
      .limit(4);

    return {
      activeJobsCount,
      candidatesCount,
      upcomingInterviewsCount,
      hiredCount,
      totalApps,
      pipelineStages,
      recentApps,
      upcomingInterviews,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard metrics:", error);
    return null;
  }
}

export async function getReportsData() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canViewReports", user.permissions);

  try {
    const jobsByDeptResult = await db
      .select({
        departmentName: departments.name,
        count: sql<number>`count(${jobOpenings.id})::int`,
      })
      .from(departments)
      .leftJoin(jobOpenings, eq(departments.id, jobOpenings.departmentId))
      .groupBy(departments.name);

    const appsByStageResult = await db
      .select({
        stage: jobApplications.stage,
        count: sql<number>`count(*)::int`,
      })
      .from(jobApplications)
      .groupBy(jobApplications.stage);

    const offersResult = await db
      .select({
        status: offers.status,
        count: sql<number>`count(*)::int`,
      })
      .from(offers)
      .groupBy(offers.status);

    return {
      jobsByDept: jobsByDeptResult,
      appsByStage: appsByStageResult,
      offersByStatus: offersResult,
    };
  } catch (error) {
    console.error("Failed to fetch reports data:", error);
    return null;
  }
}
