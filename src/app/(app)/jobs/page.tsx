"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Users,
  Building2,
  ExternalLink,
  MapPin,
  Loader2,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getJobs, updateJob, deleteJob, duplicateJob } from "@/lib/actions/jobs";
import { RoleGuard } from "@/components/auth/role-guard";
import { toast } from "sonner";

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");

  const normalizeStatus = (s: string | null): string => {
    if (!s || s === "all") return "all";
    if (s === "published" || s === "open") return "published";
    if (s === "draft") return "draft";
    if (s === "on_hold") return "on_hold";
    if (s === "closed") return "closed";
    return "all";
  };

  const [filter, setFilter] = useState(normalizeStatus(statusParam));
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editingJob, setEditingJob] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState<any>("published");
  const [editSalaryMin, setEditSalaryMin] = useState(100000);
  const [editSalaryMax, setEditSalaryMax] = useState(150000);
  const [editVacancies, setEditVacancies] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await getJobs({
        status: filter === "all" ? undefined : filter,
        search: searchQuery || undefined,
      });
      setJobs(data);
    } catch (error) {
      console.error("Failed to load jobs:", error);
      toast.error("Failed to load job openings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilter(normalizeStatus(statusParam));
  }, [statusParam]);

  useEffect(() => {
    loadJobs();
  }, [filter, searchQuery]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    const targetUrl = newFilter === "all" ? "/jobs" : `/jobs?status=${newFilter}`;
    router.replace(targetUrl);
  };

  const handleOpenEdit = (job: any) => {
    setEditingJob(job);
    setEditTitle(job.title);
    setEditStatus(job.status);
    setEditSalaryMin(job.salaryMin || 100000);
    setEditSalaryMax(job.salaryMax || 150000);
    setEditVacancies(job.vacancies || 1);
  };

  const handleSaveEdit = async () => {
    if (!editingJob) return;
    setIsSaving(true);
    try {
      await updateJob(editingJob.id, {
        title: editTitle,
        status: editStatus,
        salaryMin: Number(editSalaryMin),
        salaryMax: Number(editSalaryMax),
        vacancies: Number(editVacancies),
      });
      toast.success("Job requisition updated successfully!");
      setEditingJob(null);
      await loadJobs();
    } catch {
      toast.error("Failed to update job");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteJob(id);
      toast.success(`Deleted job: ${title}`);
      await loadJobs();
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await duplicateJob(id);
      toast.success("Job duplicated as draft!");
      await loadJobs();
    } catch {
      toast.error("Failed to duplicate job");
    }
  };

  const handleQuickStatusChange = async (id: string, status: any) => {
    try {
      await updateJob(id, { status });
      toast.success(`Job marked as ${status}`);
      await loadJobs();
    } catch {
      toast.error("Failed to change status");
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Job Openings & Requisitions"
        description="Create, publish, and manage hiring requisitions across global departments."
        actions={
          <RoleGuard permission="canCreateJobs">
            <Link href="/jobs/new">
              <Button size="sm" variant="accent" className="gap-1 text-xs">
                <Plus className="size-3.5" />
                <span>Create Requisition</span>
              </Button>
            </Link>
          </RoleGuard>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 border-b border-border w-fit overflow-x-auto">
          {[
            { id: "all", label: "All Openings" },
            { id: "published", label: "Published" },
            { id: "draft", label: "Drafts" },
            { id: "on_hold", label: "On Hold" },
            { id: "closed", label: "Closed" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleFilterChange(tab.id)}
              className={cn(
                "text-xs py-2 px-1 font-medium transition-all border-b-2 -mb-px whitespace-nowrap",
                filter === tab.id
                  ? "border-copper text-foreground font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search requisitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-7 text-xs bg-card"
          />
        </div>
      </div>

      {/* Jobs Table */}
      <Card className="shadow-none overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-copper" />
            <span>Loading job requisitions from database...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <div>No requisitions found matching your filter.</div>
            <RoleGuard permission="canCreateJobs">
              <Link href="/jobs/new">
                <Button size="xs" variant="outline" className="gap-1 mt-2">
                  <Plus className="size-3" />
                  <span>Create First Requisition</span>
                </Button>
              </Link>
            </RoleGuard>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead>Requisition</TableHead>
                <TableHead>Department &amp; Location</TableHead>
                <TableHead>Work Mode</TableHead>
                <TableHead>Compensation</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} className="text-xs">
                  <TableCell className="font-medium">
                    <div>
                      <span className="font-semibold text-foreground text-sm block">
                        {job.title}
                      </span>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>{job.vacancies} {job.vacancies === 1 ? "vacancy" : "vacancies"}</span>
                        <span>•</span>
                        <span>Recruiter: {job.recruiterName || "Unassigned"}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <Building2 className="size-3 text-muted-foreground" />
                        <span>{job.departmentName || "General"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="size-3 text-muted-foreground" />
                        <span>{job.locationName || job.locationText}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {job.workMode.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <span className="text-xs text-foreground">
                      ${(job.salaryMin || 0).toLocaleString()} – ${(job.salaryMax || 0).toLocaleString()}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/applications?jobId=${job.id}`}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-muted/60 hover:bg-copper/10 hover:text-copper transition-colors"
                    >
                      <Users className="size-3 text-muted-foreground" />
                      <span className="font-semibold">{job.applicantCount || 0}</span>
                    </Link>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={job.status} />
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <RoleGuard permission="canEditJobs">
                        {job.status === "published" ? (
                          <Button
                            size="xs"
                            variant="ghost"
                            title="Close Requisition"
                            onClick={() => handleQuickStatusChange(job.id, "closed")}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <XCircle className="size-3.5" />
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            variant="ghost"
                            title="Publish Requisition"
                            onClick={() => handleQuickStatusChange(job.id, "published")}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-success"
                          >
                            <CheckCircle2 className="size-3.5" />
                          </Button>
                        )}
                      </RoleGuard>

                      <RoleGuard permission="canCreateJobs">
                        <Button
                          size="xs"
                          variant="ghost"
                          title="Duplicate Job"
                          onClick={() => handleDuplicate(job.id)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="size-3.5" />
                        </Button>
                      </RoleGuard>

                      <RoleGuard permission="canEditJobs">
                        <Button
                          size="xs"
                          variant="ghost"
                          title="Edit Job"
                          onClick={() => handleOpenEdit(job)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                      </RoleGuard>

                      <RoleGuard permission="canDeleteJobs">
                        <Button
                          size="xs"
                          variant="ghost"
                          title="Delete Job"
                          onClick={() => handleDelete(job.id, job.title)}
                          className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </RoleGuard>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Edit Job Modal */}
      <Dialog open={!!editingJob} onOpenChange={(open) => !open && setEditingJob(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Edit Requisition</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="field-label">Job Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="field-label">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full h-8 px-2 text-xs rounded-xs border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="on_hold">On Hold</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="field-label">Vacancies</label>
                <Input
                  type="number"
                  value={editVacancies}
                  onChange={(e) => setEditVacancies(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="field-label">Min Salary ($)</label>
                <Input
                  type="number"
                  value={editSalaryMin}
                  onChange={(e) => setEditSalaryMin(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="field-label">Max Salary ($)</label>
                <Input
                  type="number"
                  value={editSalaryMax}
                  onChange={(e) => setEditSalaryMax(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              size="xs"
              variant="outline"
              onClick={() => setEditingJob(null)}
            >
              Cancel
            </Button>
            <Button
              size="xs"
              variant="accent"
              disabled={isSaving}
              onClick={handleSaveEdit}
              className="gap-1"
            >
              {isSaving ? <Loader2 className="size-3 animate-spin" /> : null}
              <span>Save Changes</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="page p-8 text-xs text-muted-foreground">Loading jobs...</div>}>
      <JobsContent />
    </Suspense>
  );
}
