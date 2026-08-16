"use server";

import { db } from "@/db";
import { jobOpenings, jobApplications, interviews, interviewScorecards, offers } from "@/db/schema";
import { eq, sql, and, ne, notExists } from "drizzle-orm";

export interface NavigationBadgeCounts {
  openJobs: number;
  activeApplications: number;
  screeningCount: number;
  interviewsToday: number;
  pendingFeedback: number;
  draftOffers: number;
  pendingOffers: number;
  [key: string]: number;
}

export async function getNavigationBadgeCounts(): Promise<NavigationBadgeCounts> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      openJobsCount,
      activeAppsCount,
      screeningAppsCount,
      interviewsTodayCount,
      pendingFeedbackCount,
      pendingOffersCount,
    ] = await Promise.all([
      // 1. Open / Published Jobs
      db
        .select({ count: sql<number>`count(*)` })
        .from(jobOpenings)
        .where(eq(jobOpenings.status, "published")),

      // 2. Active Applications (not rejected or hired)
      db
        .select({ count: sql<number>`count(*)` })
        .from(jobApplications)
        .where(
          and(
            ne(jobApplications.stage, "rejected")
          )
        ),

      // 3. Screening / New Applications
      db
        .select({ count: sql<number>`count(*)` })
        .from(jobApplications)
        .where(
          sql`${jobApplications.stage} IN ('applied', 'screening')`
        ),

      // 4. Interviews scheduled for today
      db
        .select({ count: sql<number>`count(*)` })
        .from(interviews)
        .where(
          and(
            sql`${interviews.scheduledStart} >= ${today}`,
            sql`${interviews.scheduledStart} < ${tomorrow}`
          )
        ),

      // 5. Pending scorecards / feedback
      db
        .select({ count: sql<number>`count(*)` })
        .from(interviews)
        .where(
          and(
            sql`${interviews.status} IN ('completed', 'scheduled')`,
            notExists(
              db
                .select()
                .from(interviewScorecards)
                .where(eq(interviewScorecards.interviewId, interviews.id))
            )
          )
        ),

      // 6. Pending / Draft Offers
      db
        .select({ count: sql<number>`count(*)` })
        .from(offers)
        .where(
          sql`${offers.status} IN ('draft', 'pending_approval')`
        ),
    ]);

    return {
      openJobs: Number(openJobsCount[0]?.count || 0),
      activeApplications: Number(activeAppsCount[0]?.count || 0),
      screeningCount: Number(screeningAppsCount[0]?.count || 0),
      interviewsToday: Number(interviewsTodayCount[0]?.count || 0),
      pendingFeedback: Number(pendingFeedbackCount[0]?.count || 0),
      draftOffers: Number(pendingOffersCount[0]?.count || 0),
      pendingOffers: Number(pendingOffersCount[0]?.count || 0),
    };
  } catch (err) {
    console.error("Failed to query live navigation badge counts:", err);
    return {
      openJobs: 0,
      activeApplications: 0,
      screeningCount: 0,
      interviewsToday: 0,
      pendingFeedback: 0,
      draftOffers: 0,
      pendingOffers: 0,
    };
  }
}
