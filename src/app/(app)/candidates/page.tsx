"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
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
  Mail,
  MapPin,
  FileText,
  Star,
  Loader2,
  Trash2,
  Edit2,
  Eye,
  BookmarkCheck,
  Bookmark,
  Calendar,
  Building,
  Briefcase,
  Award,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  toggleTalentPool,
} from "@/lib/actions/candidates";
import { RoleGuard } from "@/components/auth/role-guard";
import { toast } from "sonner";

function CandidatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const normalizeTab = (t: string | null): string => {
    if (!t || t === "all") return "all";
    if (t === "talent-pool" || t === "pool") return "talent-pool";
    return "all";
  };

  const [tab, setTab] = useState(normalizeTab(tabParam));
  const [searchQuery, setSearchQuery] = useState("");
  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Candidate detail drawer
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit candidate modal
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editExp, setEditExp] = useState(3);
  const [editSalary, setEditSalary] = useState(120000);
  const [isSaving, setIsSaving] = useState(false);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await getCandidates({
        search: searchQuery || undefined,
        inTalentPool: tab === "talent-pool" ? true : undefined,
      });
      setCandidatesList(data);
    } catch (err) {
      console.error("Failed to load candidates:", err);
      toast.error("Failed to load candidates directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTab(normalizeTab(tabParam));
  }, [tabParam]);

  useEffect(() => {
    loadCandidates();
  }, [tab, searchQuery]);

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    const targetUrl = newTab === "all" ? "/candidates" : `/candidates?tab=${newTab}`;
    router.replace(targetUrl);
  };

  const handleViewDetails = async (id: string) => {
    setDetailLoading(true);
    try {
      const cand = await getCandidateById(id);
      setSelectedCandidate(cand);
    } catch {
      toast.error("Failed to load candidate details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleTogglePool = async (cand: any) => {
    try {
      const newState = !cand.inTalentPool;
      await toggleTalentPool(cand.id, newState);
      toast.success(
        newState ? `Added ${cand.fullName} to Talent Pool` : `Removed from Talent Pool`,
      );
      await loadCandidates();
    } catch {
      toast.error("Failed to toggle talent pool");
    }
  };

  const handleOpenEdit = (cand: any) => {
    setEditingCandidate(cand);
    setEditName(cand.fullName);
    setEditEmail(cand.email);
    setEditRole(cand.currentDesignation || "");
    setEditCompany(cand.currentCompany || "");
    setEditExp(cand.totalExperienceYears || 3);
    setEditSalary(cand.expectedSalary || 120000);
  };

  const handleSaveEdit = async () => {
    if (!editingCandidate) return;
    setIsSaving(true);
    try {
      await updateCandidate(editingCandidate.id, {
        fullName: editName,
        email: editEmail,
        currentDesignation: editRole,
        currentCompany: editCompany,
        totalExperienceYears: Number(editExp),
        expectedSalary: Number(editSalary),
      });
      toast.success("Candidate profile updated!");
      setEditingCandidate(null);
      await loadCandidates();
    } catch {
      toast.error("Failed to update candidate");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete candidate "${name}"?`)) return;
    try {
      await deleteCandidate(id);
      toast.success(`Candidate ${name} deleted.`);
      await loadCandidates();
    } catch {
      toast.error("Failed to delete candidate");
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Candidate Directory & Talent Pool"
        description="Unified database of applicants, sourced talent, evaluation scorecards, and resumes."
        actions={
          <RoleGuard permission="canManageCandidates">
            <Link href="/candidates/new">
              <Button size="sm" variant="accent" className="gap-1 text-xs">
                <Plus className="size-3.5" />
                <span>Add Candidate</span>
              </Button>
            </Link>
          </RoleGuard>
        }
      />

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 border-b border-border w-fit">
          <button
            type="button"
            onClick={() => handleTabChange("all")}
            className={cn(
              "text-xs py-2 px-1 font-medium transition-all border-b-2 -mb-px whitespace-nowrap",
              tab === "all"
                ? "border-copper text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60",
            )}
          >
            All Candidates
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("talent-pool")}
            className={cn(
              "text-xs py-2 px-1 font-medium transition-all border-b-2 -mb-px whitespace-nowrap",
              tab === "talent-pool"
                ? "border-copper text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60",
            )}
          >
            Curated Talent Pool
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search candidates by name, email, skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-7 text-xs bg-card"
          />
        </div>
      </div>

      {/* Candidates Table */}
      <Card className="shadow-none overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-copper" />
            <span>Loading candidates from database...</span>
          </div>
        ) : candidatesList.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <div>No candidates found matching criteria.</div>
            <RoleGuard permission="canManageCandidates">
              <Link href="/candidates/new">
                <Button size="xs" variant="outline" className="gap-1 mt-2">
                  <Plus className="size-3" />
                  <span>Add First Candidate</span>
                </Button>
              </Link>
            </RoleGuard>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead>Candidate</TableHead>
                <TableHead>Current Role &amp; Company</TableHead>
                <TableHead>Experience &amp; Notice</TableHead>
                <TableHead>Core Skills</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Talent Pool</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidatesList.map((cand) => (
                <TableRow key={cand.id} className="text-xs">
                  <TableCell className="font-medium">
                    <div>
                      <button
                        onClick={() => handleViewDetails(cand.id)}
                        className="font-semibold text-foreground text-sm hover:text-copper transition-colors text-left block"
                      >
                        {cand.fullName}
                      </button>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="size-3 text-muted-foreground" />
                          <span>{cand.email}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-muted-foreground" />
                          <span>{cand.city || "San Francisco"}</span>
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-medium text-foreground text-xs">
                        {cand.currentDesignation || "Software Engineer"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {cand.currentCompany || "Enterprise Corp"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs text-foreground font-medium">
                      {cand.totalExperienceYears || 3} years exp
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {cand.noticePeriodDays || 30} days notice
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(cand.skills || []).slice(0, 3).map((skill: string) => (
                        <span
                          key={skill}
                          className="px-1.5 py-0.5 rounded-xs bg-muted text-[10px] text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                      {(cand.skills || []).length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{cand.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                      <Star className="size-3 text-copper fill-copper" />
                      <span>{cand.rating || "4.8"}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleTogglePool(cand)}
                      title={cand.inTalentPool ? "In Talent Pool" : "Add to Talent Pool"}
                      className="h-7 px-2 text-xs gap-1"
                    >
                      {cand.inTalentPool ? (
                        <>
                          <BookmarkCheck className="size-3.5 text-copper" />
                          <span className="text-[11px] text-copper font-medium">Curated</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="size-3.5 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">Add to Pool</span>
                        </>
                      )}
                    </Button>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="xs"
                        variant="ghost"
                        title="View Profile"
                        onClick={() => handleViewDetails(cand.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="size-3.5" />
                      </Button>

                      <RoleGuard permission="canManageCandidates">
                        <Button
                          size="xs"
                          variant="ghost"
                          title="Edit Profile"
                          onClick={() => handleOpenEdit(cand)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>

                        <Button
                          size="xs"
                          variant="ghost"
                          title="Delete Candidate"
                          onClick={() => handleDelete(cand.id, cand.fullName)}
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

      {/* Candidate Profile Details Modal */}
      <Dialog open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                  <span>{selectedCandidate?.fullName}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {selectedCandidate?.rating} ★
                  </Badge>
                </DialogTitle>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {selectedCandidate?.currentDesignation} • {selectedCandidate?.currentCompany}
                </div>
              </div>
            </div>
          </DialogHeader>

          {selectedCandidate && (
            <div className="space-y-4 py-2 text-xs">
              {/* Contact & Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-muted/40 rounded-xs border border-border">
                <div>
                  <div className="text-[10px] text-muted-foreground">Email</div>
                  <div className="font-medium text-foreground truncate">{selectedCandidate.email}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Phone</div>
                  <div className="font-medium text-foreground">{selectedCandidate.phone || "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Expected Comp</div>
                  <div className="font-medium text-foreground">
                    ${(selectedCandidate.expectedSalary || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Notice Period</div>
                  <div className="font-medium text-foreground">
                    {selectedCandidate.noticePeriodDays || 30} days
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <div className="font-semibold text-foreground text-xs">Skills &amp; Competencies</div>
                <div className="flex flex-wrap gap-1">
                  {(selectedCandidate.skills || []).map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Application History */}
              <div className="space-y-2">
                <div className="font-semibold text-foreground text-xs flex items-center justify-between">
                  <span>Applications History</span>
                  <span className="text-[11px] text-muted-foreground">
                    {selectedCandidate.applications?.length || 0} active
                  </span>
                </div>
                {selectedCandidate.applications?.length === 0 ? (
                  <div className="p-3 text-center text-muted-foreground bg-card rounded-xs border border-border">
                    No active job applications found.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {selectedCandidate.applications?.map((app: any) => (
                      <div
                        key={app.id}
                        className="p-2.5 rounded-xs border border-border bg-card flex items-center justify-between"
                      >
                        <div>
                          <span className="font-medium text-foreground block">{app.jobTitle}</span>
                          <span className="text-[10px] text-muted-foreground">
                            Applied on {new Date(app.createdAt).toLocaleDateString()} • Source: {app.source}
                          </span>
                        </div>
                        <StatusBadge status={app.stage} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedCandidate.notes && (
                <div className="p-3 bg-muted/20 rounded-xs border border-border space-y-1">
                  <div className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                    Recruiter Notes
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    {selectedCandidate.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button size="xs" variant="outline" onClick={() => setSelectedCandidate(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Candidate Modal */}
      <Dialog open={!!editingCandidate} onOpenChange={(open) => !open && setEditingCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Edit Candidate Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="field-label">Full Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="field-label">Email</label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="field-label">Current Role</label>
                <Input
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="field-label">Company</label>
                <Input
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="field-label">Years of Experience</label>
                <Input
                  type="number"
                  value={editExp}
                  onChange={(e) => setEditExp(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="field-label">Expected Salary ($)</label>
                <Input
                  type="number"
                  value={editSalary}
                  onChange={(e) => setEditSalary(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button size="xs" variant="outline" onClick={() => setEditingCandidate(null)}>
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

export default function CandidatesPage() {
  return (
    <Suspense fallback={<div className="page p-8 text-xs text-muted-foreground">Loading candidates...</div>}>
      <CandidatesContent />
    </Suspense>
  );
}
