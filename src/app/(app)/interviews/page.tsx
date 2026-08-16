"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatTile, StatGrid } from "@/components/shared/stat-tile";
import { cn } from "@/lib/utils";
import {
  Clock,
  Plus,
  Video,
  Star,
  CheckCircle2,
  XCircle,
  FileCheck,
  Loader2,
  Calendar,
  Eye,
  Award,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getInterviews, submitScorecard, updateInterviewStatus } from "@/lib/actions/interviews";
import { RoleGuard } from "@/components/auth/role-guard";
import { toast } from "sonner";

function InterviewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  const normalizeView = (v: string | null): string => {
    if (!v || v === "all") return "all";
    if (v === "upcoming") return "upcoming";
    if (v === "completed") return "completed";
    if (v === "cancelled") return "cancelled";
    return "all";
  };

  const [activeView, setActiveView] = useState(normalizeView(viewParam));
  const [interviewsList, setInterviewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Scorecard modal state
  const [activeScorecardInterview, setActiveScorecardInterview] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [recommendation, setRecommendation] = useState<"strong_hire" | "hire" | "no_hire" | "strong_no_hire">("strong_hire");
  const [techScore, setTechScore] = useState(5);
  const [cultureScore, setCultureScore] = useState(5);
  const [commScore, setCommScore] = useState(5);
  const [strengths, setStrengths] = useState("");
  const [concerns, setConcerns] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmittingScorecard, setIsSubmittingScorecard] = useState(false);

  // View scorecard modal
  const [viewScorecardInterview, setViewScorecardInterview] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getInterviews({
        status: activeView === "upcoming" ? "scheduled" : activeView === "completed" ? "completed" : activeView === "cancelled" ? "cancelled" : undefined,
      });
      setInterviewsList(data);
    } catch (err) {
      console.error("Failed to load interviews:", err);
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveView(normalizeView(viewParam));
  }, [viewParam]);

  useEffect(() => {
    loadData();
  }, [activeView]);

  const handleViewChange = (newView: string) => {
    setActiveView(newView);
    const targetUrl = newView === "all" ? "/interviews" : `/interviews?view=${newView}`;
    router.replace(targetUrl);
  };

  const handleOpenScorecard = (intv: any) => {
    setActiveScorecardInterview(intv);
    setRating(5);
    setRecommendation("strong_hire");
    setTechScore(5);
    setCultureScore(5);
    setCommScore(5);
    setStrengths("Clear architectural thinking, strong concurrency fundamentals.");
    setConcerns("None noted.");
    setNotes("Excellent panel interaction.");
  };

  const handleSubmitScorecard = async () => {
    if (!activeScorecardInterview) return;
    setIsSubmittingScorecard(true);
    try {
      await submitScorecard({
        interviewId: activeScorecardInterview.id,
        overallRating: rating,
        recommendation,
        technicalScore: techScore,
        cultureScore,
        communicationScore: commScore,
        strengths,
        concerns,
        feedbackNotes: notes,
      });
      toast.success("Scorecard and feedback submitted successfully!");
      setActiveScorecardInterview(null);
      await loadData();
    } catch {
      toast.error("Failed to submit scorecard");
    } finally {
      setIsSubmittingScorecard(false);
    }
  };

  const handleCancelInterview = async (id: string) => {
    if (!confirm("Cancel this scheduled interview round?")) return;
    try {
      await updateInterviewStatus(id, "cancelled");
      toast.success("Interview cancelled.");
      await loadData();
    } catch {
      toast.error("Failed to cancel interview");
    }
  };

  const scheduledCount = interviewsList.filter((i) => i.status === "scheduled").length;
  const completedCount = interviewsList.filter((i) => i.status === "completed").length;

  return (
    <div className="page">
      <PageHeader
        title="Interview Scheduling &amp; Scorecards"
        description="Manage panel interview rounds, structured scorecards, candidate availability, and hiring recommendations."
        actions={
          <RoleGuard permission="canScheduleInterviews">
            <Link href="/interviews/schedule">
              <Button size="sm" variant="accent" className="gap-1 text-xs">
                <Plus className="size-3.5" />
                <span>Schedule Interview</span>
              </Button>
            </Link>
          </RoleGuard>
        }
      />

      <StatGrid>
        <StatTile
          label="Scheduled Rounds"
          value={String(scheduledCount)}
          sublabel="Pending evaluation"
          icon="Clock"
          tone="accent"
        />
        <StatTile
          label="Completed Evaluations"
          value={String(completedCount)}
          sublabel="Scorecards recorded"
          icon="CheckCircle"
          tone="success"
        />
        <StatTile
          label="Avg Panel Rating"
          value="4.8 / 5.0"
          sublabel="Top-tier candidate pool"
          icon="Star"
          tone="warning"
        />
      </StatGrid>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border w-fit overflow-x-auto">
        {[
          { id: "all", label: "All Rounds" },
          { id: "upcoming", label: "Upcoming" },
          { id: "completed", label: "Completed & Evaluated" },
          { id: "cancelled", label: "Cancelled" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleViewChange(tab.id)}
            className={cn(
              "text-xs py-2 px-1 font-medium transition-all border-b-2 -mb-px whitespace-nowrap",
              activeView === tab.id
                ? "border-copper text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Interviews Table */}
      <Card className="shadow-none overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-copper" />
            <span>Loading scheduled interviews...</span>
          </div>
        ) : interviewsList.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <div>No interview rounds found in this view.</div>
            <RoleGuard permission="canScheduleInterviews">
              <Link href="/interviews/schedule">
                <Button size="xs" variant="outline" className="gap-1 mt-2">
                  <Plus className="size-3" />
                  <span>Schedule First Round</span>
                </Button>
              </Link>
            </RoleGuard>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead>Candidate &amp; Position</TableHead>
                <TableHead>Interview Round</TableHead>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Meeting Format</TableHead>
                <TableHead>Scorecard Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviewsList.map((intv) => (
                <TableRow key={intv.id} className="text-xs">
                  <TableCell className="font-medium">
                    <div>
                      <span className="font-semibold text-foreground text-sm block">
                        {intv.candidateName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {intv.jobTitle}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-medium text-foreground text-xs">
                        {intv.roundTitle}
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                        {intv.roundType} ({intv.durationMinutes} min)
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs text-foreground font-medium flex items-center gap-1">
                      <Clock className="size-3 text-copper" />
                      <span>{new Date(intv.scheduledStart).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(intv.scheduledStart).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </TableCell>

                  <TableCell>
                    {intv.meetingLink ? (
                      <a
                        href={intv.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-muted hover:bg-copper/20 hover:text-copper transition-colors text-[11px] text-foreground font-medium"
                      >
                        <Video className="size-3 text-copper" />
                        <span>Join Session</span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-[11px] capitalize">
                        {intv.format}
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    {intv.scorecards && intv.scorecards.length > 0 ? (
                      <button
                        onClick={() => setViewScorecardInterview(intv)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-success hover:underline"
                      >
                        <CheckCircle2 className="size-3" />
                        <span>{intv.scorecards[0].recommendation.replace("_", " ").toUpperCase()} ({intv.scorecards[0].overallRating}/5)</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        Pending Evaluation
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={intv.status} />
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {intv.scorecards && intv.scorecards.length > 0 ? (
                        <RoleGuard permission="canViewScorecards">
                          <Button
                            size="xs"
                            variant="ghost"
                            title="View Scorecard"
                            onClick={() => setViewScorecardInterview(intv)}
                            className="h-7 px-2 text-xs gap-1 text-foreground hover:text-copper"
                          >
                            <Eye className="size-3.5" />
                            <span>Scorecard</span>
                          </Button>
                        </RoleGuard>
                      ) : (
                        <RoleGuard permission="canSubmitScorecard">
                          <Button
                            size="xs"
                            variant="accent"
                            title="Submit Scorecard"
                            onClick={() => handleOpenScorecard(intv)}
                            className="h-7 px-2 text-xs gap-1"
                          >
                            <Star className="size-3" />
                            <span>Evaluate</span>
                          </Button>
                        </RoleGuard>
                      )}

                      {intv.status === "scheduled" && (
                        <Button
                          size="xs"
                          variant="ghost"
                          title="Cancel Round"
                          onClick={() => handleCancelInterview(intv.id)}
                          className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive"
                        >
                          <XCircle className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Submit Scorecard Modal */}
      <Dialog
        open={!!activeScorecardInterview}
        onOpenChange={(open) => !open && setActiveScorecardInterview(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Submit Scorecard: {activeScorecardInterview?.candidateName}
            </DialogTitle>
            <div className="text-xs text-muted-foreground">
              Round: {activeScorecardInterview?.roundTitle} • {activeScorecardInterview?.jobTitle}
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="field-label">Overall Rating (1 - 5 Stars)</label>
                <select
                  value={rating}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRating(Number(e.target.value))}
                  className="w-full h-8 px-2 text-xs rounded-xs border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
                >
                  <option value={5}>5 - Outstanding (Exceeds Bar)</option>
                  <option value={4}>4 - Strong Hire</option>
                  <option value={3}>3 - Neutral / Leaning Hire</option>
                  <option value={2}>2 - Leaning No Hire</option>
                  <option value={1}>1 - Strong No Hire</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="field-label">Recommendation</label>
                <select
                  value={recommendation}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRecommendation(e.target.value as any)}
                  className="w-full h-8 px-2 text-xs rounded-xs border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
                >
                  <option value="strong_hire">Strong Hire</option>
                  <option value="hire">Hire</option>
                  <option value="no_hire">No Hire</option>
                  <option value="strong_no_hire">Strong No Hire</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="field-label">Technical Score</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={techScore}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTechScore(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="field-label">Communication</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={commScore}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommScore(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="field-label">Culture &amp; Values</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={cultureScore}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCultureScore(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="field-label">Strengths &amp; Key Signals</label>
              <textarea
                rows={2}
                value={strengths}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStrengths(e.target.value)}
                placeholder="Key technical strengths observed during the session..."
                className="w-full rounded-xs border border-border bg-card p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
              />
            </div>

            <div className="space-y-1">
              <label className="field-label">Concerns or Areas of Growth</label>
              <textarea
                rows={2}
                value={concerns}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConcerns(e.target.value)}
                placeholder="Any hesitation or areas needing further inquiry..."
                className="w-full rounded-xs border border-border bg-card p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
              />
            </div>

            <div className="space-y-1">
              <label className="field-label">Detailed Notes &amp; Summary</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                placeholder="Overall summary for hiring committee review..."
                className="w-full rounded-xs border border-border bg-card p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              size="xs"
              variant="outline"
              onClick={() => setActiveScorecardInterview(null)}
            >
              Cancel
            </Button>
            <Button
              size="xs"
              variant="accent"
              disabled={isSubmittingScorecard}
              onClick={handleSubmitScorecard}
              className="gap-1"
            >
              {isSubmittingScorecard ? <Loader2 className="size-3 animate-spin" /> : null}
              <span>Submit Evaluation Scorecard</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Scorecard Modal */}
      <Dialog
        open={!!viewScorecardInterview}
        onOpenChange={(open) => !open && setViewScorecardInterview(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <span>Evaluation Scorecard</span>
              <Badge variant="soft-success" className="text-[10px] uppercase">
                {viewScorecardInterview?.scorecards?.[0]?.recommendation.replace("_", " ")}
              </Badge>
            </DialogTitle>
            <div className="text-xs text-muted-foreground">
              Candidate: {viewScorecardInterview?.candidateName} • {viewScorecardInterview?.roundTitle}
            </div>
          </DialogHeader>

          {viewScorecardInterview?.scorecards?.[0] && (
            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-3 gap-2 p-3 bg-muted/40 rounded-xs border border-border text-center">
                <div>
                  <div className="text-[10px] text-muted-foreground">Technical</div>
                  <div className="text-sm font-semibold text-foreground">
                    {viewScorecardInterview.scorecards[0].technicalScore}/5
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Culture</div>
                  <div className="text-sm font-semibold text-foreground">
                    {viewScorecardInterview.scorecards[0].cultureScore}/5
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Communication</div>
                  <div className="text-sm font-semibold text-foreground">
                    {viewScorecardInterview.scorecards[0].communicationScore}/5
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-foreground text-[11px]">Observed Strengths:</div>
                <p className="text-muted-foreground leading-relaxed">
                  {viewScorecardInterview.scorecards[0].strengths}
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-foreground text-[11px]">Concerns / Gaps:</div>
                <p className="text-muted-foreground leading-relaxed">
                  {viewScorecardInterview.scorecards[0].concerns}
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-foreground text-[11px]">Feedback Notes:</div>
                <p className="text-muted-foreground leading-relaxed">
                  {viewScorecardInterview.scorecards[0].feedbackNotes}
                </p>
              </div>

              <div className="text-[10px] text-muted-foreground pt-2 border-t border-border">
                Evaluator: {viewScorecardInterview.scorecards[0].interviewerName} • Submitted{" "}
                {new Date(viewScorecardInterview.scorecards[0].submittedAt).toLocaleDateString()}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button size="xs" variant="outline" onClick={() => setViewScorecardInterview(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function InterviewsPage() {
  return (
    <Suspense fallback={<div className="page p-8 text-xs text-muted-foreground">Loading interviews...</div>}>
      <InterviewsContent />
    </Suspense>
  );
}
