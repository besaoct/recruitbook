"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Calendar,
  Gift,
  XCircle,
  Clock,
  Star,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getApplications, updateApplicationStage, rejectApplication, type ApplicationStage } from "@/lib/actions/applications";
import { getJobs } from "@/lib/actions/jobs";
import { RoleGuard } from "@/components/auth/role-guard";

const KANBAN_STAGES: { id: ApplicationStage; name: string; color: string }[] = [
  { id: "applied", name: "Applied", color: "border-t-bark-muted" },
  { id: "screening", name: "Screening", color: "border-t-copper-deep" },
  { id: "shortlisted", name: "Shortlisted", color: "border-t-copper" },
  { id: "interview", name: "Interview", color: "border-t-sage-deep" },
  { id: "evaluation", name: "Evaluation", color: "border-t-sage" },
  { id: "selected", name: "Selected", color: "border-t-bark" },
  { id: "offer", name: "Offer Stage", color: "border-t-accent" },
  { id: "hired", name: "Hired (HRM)", color: "border-t-success" },
];

function ApplicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawJobId = searchParams.get("jobId");
  const rawStage = searchParams.get("stage");

  const [activeView, setActiveView] = useState<"kanban" | "list">("kanban");
  const [selectedJobId, setSelectedJobId] = useState(rawJobId || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reject modal
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("Profile does not meet core technical bar.");
  const [isRejecting, setIsRejecting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appList, jobList] = await Promise.all([
        getApplications({
          jobId: selectedJobId === "all" ? undefined : selectedJobId,
        }),
        getJobs(),
      ]);
      setApplications(appList);
      setJobs(jobList);
    } catch (err) {
      console.error("Failed to load applications:", err);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedJobId]);

  const handleStageChange = async (appId: string, newStage: ApplicationStage) => {
    // Optimistic update
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, stage: newStage } : app)),
    );

    try {
      await updateApplicationStage(appId, newStage);
      toast.success(`Application updated to ${newStage.toUpperCase()}`);
    } catch {
      toast.error("Failed to update application stage");
      await loadData();
    }
  };

  const handleReject = async () => {
    if (!rejectingAppId) return;
    setIsRejecting(true);
    try {
      await rejectApplication(rejectingAppId, rejectReason);
      toast.success("Application marked as rejected.");
      setRejectingAppId(null);
      await loadData();
    } catch {
      toast.error("Failed to reject application");
    } finally {
      setIsRejecting(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = app.candidateName?.toLowerCase().includes(q);
      const matchJob = app.jobTitle?.toLowerCase().includes(q);
      const matchEmail = app.candidateEmail?.toLowerCase().includes(q);
      if (!matchName && !matchJob && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div className="page max-w-full">
      <PageHeader
        title="ATS Candidate Kanban & Pipeline"
        description="Live 8-stage recruitment pipeline, structured panel interview routing, and offer generation."
        actions={
          <div className="flex items-center gap-2">
            <RoleGuard permission="canScheduleInterviews">
              <Link href="/interviews/schedule">
                <Button size="sm" variant="outline" className="gap-1 text-xs">
                  <Calendar className="size-3.5" />
                  <span>Schedule Interview</span>
                </Button>
              </Link>
            </RoleGuard>
            <RoleGuard permission="canCreateOffers">
              <Link href="/offers/new">
                <Button size="sm" variant="accent" className="gap-1 text-xs">
                  <Gift className="size-3.5" />
                  <span>Generate Offer</span>
                </Button>
              </Link>
            </RoleGuard>
          </div>
        }
      />

      {/* Filter and View Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 border-b border-border w-fit">
          <button
            type="button"
            onClick={() => setActiveView("kanban")}
            className={cn(
              "text-xs py-2 px-1 font-medium transition-all border-b-2 -mb-px whitespace-nowrap",
              activeView === "kanban"
                ? "border-copper text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60",
            )}
          >
            Kanban Board
          </button>
          <button
            type="button"
            onClick={() => setActiveView("list")}
            className={cn(
              "text-xs py-2 px-1 font-medium transition-all border-b-2 -mb-px whitespace-nowrap",
              activeView === "list"
                ? "border-copper text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60",
            )}
          >
            List View
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Job Filter Dropdown */}
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="h-7 px-2.5 text-xs rounded-xs border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
          >
            <option value="all">All Job Requisitions ({applications.length})</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.departmentName || "General"})
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search applicants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-7 text-xs bg-card"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="size-4 animate-spin text-copper" />
          <span>Loading ATS Kanban pipeline from database...</span>
        </div>
      ) : activeView === "kanban" ? (
        /* KANBAN BOARD VIEW (8 Stages) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8 gap-3 overflow-x-auto pb-4">
          {KANBAN_STAGES.map((col) => {
            const colApps = filteredApplications.filter((a) => a.stage === col.id);
            return (
              <div
                key={col.id}
                className={`flex flex-col bg-muted/30 rounded-xs border border-border border-t-4 ${col.color} p-2.5 min-h-[480px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
                  <span className="font-semibold text-xs text-foreground truncate">
                    {col.name}
                  </span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-xs bg-muted text-muted-foreground">
                    {colApps.length}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {colApps.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-[11px] text-muted-foreground border border-dashed border-border/60 rounded-xs">
                      No candidates
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <Card
                        key={app.id}
                        className="shadow-none border border-border bg-card hover:border-copper/60 transition-all p-3 space-y-2.5"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <span className="font-semibold text-xs text-foreground block hover:text-copper transition-colors">
                              {app.candidateName}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate block">
                              {app.jobTitle}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-[9px] shrink-0">
                            {app.fitScore}%
                          </Badge>
                        </div>

                        {/* Experience / Info */}
                        <div className="text-[11px] text-muted-foreground space-y-0.5">
                          <div>{app.currentDesignation || "Software Engineer"}</div>
                          <div className="text-[10px] flex items-center gap-1">
                            <Clock className="size-3 text-muted-foreground" />
                            <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Quick Stage Mover Dropdown */}
                        <RoleGuard permission="canAdvancePipeline">
                          <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-1">
                            <select
                              value={app.stage}
                              onChange={(e) => handleStageChange(app.id, e.target.value as any)}
                              className="h-6 text-[10px] rounded-xs border border-border bg-muted/50 px-1 text-foreground focus:outline-none w-full"
                            >
                              {KANBAN_STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  Move: {s.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </RoleGuard>

                        {/* Quick Actions Bar */}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                          <RoleGuard permission="canScheduleInterviews">
                            <Link
                              href={`/interviews/schedule?candidateId=${app.candidateId}&applicationId=${app.id}`}
                              className="hover:text-copper flex items-center gap-0.5"
                              title="Schedule Interview"
                            >
                              <Calendar className="size-3 text-copper" />
                              <span>Interview</span>
                            </Link>
                          </RoleGuard>

                          <RoleGuard permission="canCreateOffers">
                            <Link
                              href={`/offers/new?candidateId=${app.candidateId}&applicationId=${app.id}`}
                              className="hover:text-copper flex items-center gap-0.5"
                              title="Generate Offer"
                            >
                              <Gift className="size-3 text-sage-deep" />
                              <span>Offer</span>
                            </Link>
                          </RoleGuard>

                          <RoleGuard permission="canAdvancePipeline">
                            <button
                              onClick={() => setRejectingAppId(app.id)}
                              className="hover:text-destructive flex items-center gap-0.5"
                              title="Reject Candidate"
                            >
                              <XCircle className="size-3 text-destructive/70" />
                              <span>Reject</span>
                            </button>
                          </RoleGuard>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <Card className="shadow-none overflow-hidden">
          <div className="divide-y divide-border">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="p-3 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">
                      {app.candidateName}
                    </span>
                    <StatusBadge status={app.stage} />
                    <Badge variant="outline" className="text-[10px]">
                      Fit: {app.fitScore}%
                    </Badge>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-3 text-[11px]">
                    <span>Target: {app.jobTitle}</span>
                    <span>•</span>
                    <span>{app.candidateEmail}</span>
                    <span>•</span>
                    <span>Source: {app.source}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <select
                    value={app.stage}
                    onChange={(e) => handleStageChange(app.id, e.target.value as any)}
                    className="h-7 text-xs rounded-xs border border-border bg-card px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
                  >
                    {KANBAN_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <Link
                    href={`/interviews/schedule?candidateId=${app.candidateId}&applicationId=${app.id}`}
                  >
                    <Button size="xs" variant="outline" className="gap-1">
                      <Calendar className="size-3" />
                      <span>Interview</span>
                    </Button>
                  </Link>

                  <Link
                    href={`/offers/new?candidateId=${app.candidateId}&applicationId=${app.id}`}
                  >
                    <Button size="xs" variant="accent" className="gap-1">
                      <Gift className="size-3" />
                      <span>Offer</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Reject Application Modal */}
      <Dialog open={!!rejectingAppId} onOpenChange={(open) => !open && setRejectingAppId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Reject Candidate Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              Provide feedback or rejection reason for internal records:
            </p>
            <div className="space-y-1">
              <label className="field-label">Reason / Feedback</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xs border border-border bg-card p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-destructive"
              />
            </div>
          </div>
          <DialogFooter>
            <Button size="xs" variant="outline" onClick={() => setRejectingAppId(null)}>
              Cancel
            </Button>
            <Button
              size="xs"
              variant="destructive"
              disabled={isRejecting}
              onClick={handleReject}
              className="gap-1"
            >
              {isRejecting ? <Loader2 className="size-3 animate-spin" /> : null}
              <span>Confirm Rejection</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="page p-8 text-xs text-muted-foreground">Loading ATS Kanban...</div>}>
      <ApplicationsContent />
    </Suspense>
  );
}
