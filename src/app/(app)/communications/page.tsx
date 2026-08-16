"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import {
  Plus,
  Mail,
  Send,
  Loader2,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getCommunicationTemplates,
  createCommunicationTemplate,
  updateCommunicationTemplate,
  deleteCommunicationTemplate,
  getCandidateMessages,
  sendMessageToCandidate,
} from "@/lib/actions/communications";
import { getCandidates } from "@/lib/actions/candidates";
import { RoleGuard } from "@/components/auth/role-guard";

function CommunicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const normalizeTab = (t: string | null): string => {
    if (!t || t === "templates") return "templates";
    if (t === "history") return "history";
    return "templates";
  };

  const [activeTab, setActiveTab] = useState(normalizeTab(tabParam));
  const [templates, setTemplates] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit Template Modal
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [tplName, setTplName] = useState("");
  const [tplStage, setTplStage] = useState("applied");
  const [tplSubject, setTplSubject] = useState("");
  const [tplBody, setTplBody] = useState("");
  const [isSavingTpl, setIsSavingTpl] = useState(false);

  // Send Message Modal
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [targetCandidateId, setTargetCandidateId] = useState("");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tpls, msgs, cands] = await Promise.all([
        getCommunicationTemplates(),
        getCandidateMessages(),
        getCandidates(),
      ]);
      setTemplates(tpls);
      setMessages(msgs);
      setCandidates(cands);
      if (cands[0]) setTargetCandidateId(cands[0].id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load communications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveTab(normalizeTab(tabParam));
  }, [tabParam]);

  useEffect(() => {
    loadData();
  }, []);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const targetUrl = newTab === "templates" ? "/communications" : `/communications?tab=${newTab}`;
    router.replace(targetUrl);
  };

  const handleOpenCreateTpl = () => {
    setEditingTemplateId(null);
    setTplName("");
    setTplStage("applied");
    setTplSubject("Update regarding your application for {{job_title}}");
    setTplBody("Dear {{candidate_name}},\n\nThank you for taking the time to apply...");
    setTemplateModalOpen(true);
  };

  const handleOpenEditTpl = (tpl: any) => {
    setEditingTemplateId(tpl.id);
    setTplName(tpl.name);
    setTplStage(tpl.triggerEvent || "applied");
    setTplSubject(tpl.subject);
    setTplBody(tpl.bodyTemplate);
    setTemplateModalOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!tplName || !tplSubject || !tplBody) {
      toast.error("Please fill in template name, subject, and body");
      return;
    }
    setIsSavingTpl(true);
    try {
      if (editingTemplateId) {
        await updateCommunicationTemplate(editingTemplateId, {
          name: tplName,
          triggerEvent: tplStage,
          subject: tplSubject,
          bodyTemplate: tplBody,
        });
        toast.success("Template updated successfully!");
      } else {
        await createCommunicationTemplate({
          name: tplName,
          triggerEvent: tplStage,
          subject: tplSubject,
          bodyTemplate: tplBody,
        });
        toast.success("New communication template created!");
      }
      setTemplateModalOpen(false);
      await loadData();
    } catch {
      toast.error("Failed to save template");
    } finally {
      setIsSavingTpl(false);
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Delete template "${name}"?`)) return;
    try {
      await deleteCommunicationTemplate(id);
      toast.success("Template deleted");
      await loadData();
    } catch {
      toast.error("Failed to delete template");
    }
  };

  const handleSendMessage = async () => {
    if (!targetCandidateId || !msgSubject || !msgBody) {
      toast.error("Please fill in candidate, subject, and email body");
      return;
    }
    const matchedCandidate = candidates.find((c) => c.id === targetCandidateId);
    if (!matchedCandidate) {
      toast.error("Candidate not found");
      return;
    }

    setIsSending(true);
    try {
      await sendMessageToCandidate({
        candidateId: targetCandidateId,
        recipientEmail: matchedCandidate.email,
        subject: msgSubject,
        body: msgBody,
      });
      toast.success("Email sent to candidate and logged to recruitment audit trail!");
      setSendModalOpen(false);
      await loadData();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Candidate Communications &amp; Automated Templates"
        description="Configure standardized email templates with smart merge tokens and send direct applicant communications."
        actions={
          <div className="flex items-center gap-2">
            <RoleGuard permission="canSendCommunications">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setMsgSubject("Invitation to Discuss Technical Architecture");
                  setMsgBody("Hi there,\n\nWe were very impressed by your profile and would love to schedule a 45-minute technical conversation...");
                  setSendModalOpen(true);
                }}
                className="gap-1 text-xs"
              >
                <Mail className="size-3.5" />
                <span>Send Candidate Email</span>
              </Button>
            </RoleGuard>

            <RoleGuard permission="canManageSettings">
              <Button
                size="sm"
                variant="accent"
                onClick={handleOpenCreateTpl}
                className="gap-1 text-xs"
              >
                <Plus className="size-3.5" />
                <span>New Template</span>
              </Button>
            </RoleGuard>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border w-fit">
        <button
          type="button"
          onClick={() => handleTabChange("templates")}
          className={cn(
            "text-xs py-2 px-1 font-medium transition-all border-b-2 -mb-px whitespace-nowrap",
            activeTab === "templates"
              ? "border-copper text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60",
          )}
        >
          Email Templates ({templates.length})
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("history")}
          className={cn(
            "text-xs py-2 px-1 font-medium transition-all border-b-2 -mb-px whitespace-nowrap",
            activeTab === "history"
              ? "border-copper text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60",
          )}
        >
          Delivery Audit History ({messages.length})
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="size-4 animate-spin text-copper" />
          <span>Loading communications data...</span>
        </div>
      ) : activeTab === "templates" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="shadow-none border border-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-semibold">{tpl.name}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Trigger: Stage <strong className="text-foreground capitalize">{tpl.triggerEvent}</strong>
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-2.5 bg-muted/40 rounded-xs border border-border text-[11px] text-foreground space-y-1">
                  <div className="text-muted-foreground font-sans text-[10px] uppercase font-semibold">
                    Subject Line Preview
                  </div>
                  <div className="truncate">{tpl.subject}</div>
                </div>

                <div className="p-2.5 bg-card rounded-xs border border-border/80 text-[11px] text-muted-foreground line-clamp-3 leading-relaxed whitespace-pre-wrap">
                  {tpl.bodyTemplate}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-[10px] text-muted-foreground">
                    Updated {new Date(tpl.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleOpenEditTpl(tpl)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                      className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Sent Messages Log Table */
        <Card className="shadow-none overflow-hidden">
          {messages.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No communication history found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Candidate Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((msg) => (
                  <TableRow key={msg.id} className="text-xs">
                    <TableCell className="font-medium">
                      <div>
                        <span className="font-semibold text-foreground block">
                          {msg.candidateName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {msg.candidateEmail}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-foreground text-xs">{msg.subject}</span>
                      <p className="text-[10px] text-muted-foreground truncate max-w-md">
                        {msg.body}
                      </p>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {msg.channel}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {new Date(msg.sentAt).toLocaleDateString()} at{" "}
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </TableCell>

                    <TableCell>
                      <Badge variant="soft-success" className="gap-1 text-[10px]">
                        <CheckCircle2 className="size-3" />
                        <span>Delivered</span>
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Create/Edit Template Modal */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {editingTemplateId ? "Edit Communication Template" : "Create Communication Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="field-label">Template Name</label>
              <Input
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
                placeholder="e.g. Technical Round Invitation"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="field-label">ATS Stage Trigger</label>
              <select
                value={tplStage}
                onChange={(e) => setTplStage(e.target.value)}
                className="w-full h-8 px-2 text-xs rounded-xs border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
              >
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="evaluation">Evaluation</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="field-label">Email Subject</label>
              <Input
                value={tplSubject}
                onChange={(e) => setTplSubject(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="field-label">Email Content Body</label>
                <span className="text-[10px] text-muted-foreground">
                  Available: {"{{candidate_name}}"}, {"{{job_title}}"}
                </span>
              </div>
              <Textarea
                rows={5}
                value={tplBody}
                onChange={(e) => setTplBody(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button size="xs" variant="outline" onClick={() => setTemplateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="xs"
              variant="accent"
              disabled={isSavingTpl}
              onClick={handleSaveTemplate}
              className="gap-1"
            >
              {isSavingTpl ? <Loader2 className="size-3 animate-spin" /> : null}
              <span>Save Template</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message to Candidate Modal */}
      <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Compose Candidate Message
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="field-label">Recipient Candidate</label>
              <select
                value={targetCandidateId}
                onChange={(e) => setTargetCandidateId(e.target.value)}
                className="w-full h-8 px-2 text-xs rounded-xs border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
              >
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="field-label">Subject</label>
              <Input
                value={msgSubject}
                onChange={(e) => setMsgSubject(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="field-label">Message Body</label>
              <Textarea
                rows={5}
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button size="xs" variant="outline" onClick={() => setSendModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="xs"
              variant="accent"
              disabled={isSending}
              onClick={handleSendMessage}
              className="gap-1"
            >
              {isSending ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
              <span>Send Email</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CommunicationsPage() {
  return (
    <Suspense fallback={<div className="page p-8 text-xs text-muted-foreground">Loading communications...</div>}>
      <CommunicationsContent />
    </Suspense>
  );
}
