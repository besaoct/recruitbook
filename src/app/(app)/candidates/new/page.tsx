"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import {
  Upload,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { createCandidate } from "@/lib/actions/candidates";
import { getJobs } from "@/lib/actions/jobs";
import { submitApplicationFromPortal } from "@/lib/actions/applications";

export default function AddCandidatePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("San Francisco, CA");
  const [currentDesignation, setCurrentDesignation] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [experienceYears, setExperienceYears] = useState("4");
  const [expectedSalary, setExpectedSalary] = useState("140000");
  const [noticePeriodDays, setNoticePeriodDays] = useState("30");
  const [skills, setSkills] = useState("React, TypeScript, Node.js");
  const [targetJobId, setTargetJobId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const jList = await getJobs();
        setJobs(jList);
        if (jList[0]) setTargetJobId(jList[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingJobs(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error("Please fill in candidate name and email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);

      if (targetJobId) {
        await submitApplicationFromPortal({
          jobId: targetJobId,
          fullName,
          email,
          phone,
          city,
          currentDesignation,
          currentCompany,
          totalExperienceYears: parseInt(experienceYears) || 3,
          expectedSalary: parseInt(expectedSalary) || 120000,
          noticePeriodDays: parseInt(noticePeriodDays) || 30,
          skills: skillsArray,
          coverLetter: notes,
        });
      } else {
        await createCandidate({
          fullName,
          email,
          phone,
          city,
          currentDesignation,
          currentCompany,
          totalExperienceYears: parseInt(experienceYears) || 3,
          expectedSalary: parseInt(expectedSalary) || 120000,
          noticePeriodDays: parseInt(noticePeriodDays) || 30,
          skills: skillsArray,
          notes,
          inTalentPool: true,
        });
      }

      toast.success(`Candidate ${fullName} saved to recruitment directory!`);
      router.push("/candidates");
    } catch (err: any) {
      toast.error(err.message || "Failed to create candidate");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page max-w-4xl">
      <PageHeader
        title="Add New Candidate"
        description="Direct candidate entry, resume intake, professional background, and requisition assignment."
        breadcrumbs={[
          { label: "Candidates", href: "/candidates" },
          { label: "New Candidate" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/candidates">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <ArrowLeft className="size-3.5" />
                <span>Cancel</span>
              </Button>
            </Link>
            <Button
              size="sm"
              variant="accent"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="gap-1 text-xs"
            >
              {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              <span>Save Candidate</span>
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Contact & Personal Info */}
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">1. Basic Information</CardTitle>
            <CardDescription className="text-xs">
              Primary candidate contact coordinates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="field-label">Full Name *</label>
                <Input
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Email Address *</label>
                <Input
                  type="email"
                  placeholder="e.g. candidate@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Phone Number</label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Current City / Location</label>
                <Input
                  placeholder="e.g. San Francisco, CA / London"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Experience & Skills */}
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">2. Professional Background</CardTitle>
            <CardDescription className="text-xs">
              Current employment, total experience, skills, and target job opening
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="field-label">Current Designation</label>
                <Input
                  placeholder="e.g. Senior Software Engineer"
                  value={currentDesignation}
                  onChange={(e) => setCurrentDesignation(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Current Company</label>
                <Input
                  placeholder="e.g. CloudScale Systems"
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Total Experience (Years)</label>
                <Input
                  type="number"
                  placeholder="e.g. 7"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Expected Salary ($)</label>
                <Input
                  type="number"
                  placeholder="e.g. 140000"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="field-label">Target Requisition (Optional)</label>
                <select
                  value={targetJobId}
                  onChange={(e) => setTargetJobId(e.target.value)}
                  className="h-8 w-full rounded-xs border border-border bg-card px-2.5 text-xs text-foreground focus:border-ring"
                >
                  <option value="">General Talent Pool (No Specific Job)</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.departmentName || "General"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="field-label">Key Skills (comma separated)</label>
                <Input
                  placeholder="e.g. Go, Distributed Systems, Kubernetes, PostgreSQL, AWS"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="field-label">Recruiter Initial Notes</label>
              <Textarea
                rows={3}
                placeholder="Initial sourcing notes, referrals, or compensation discussions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Link href="/candidates">
            <Button variant="outline" size="sm" className="text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            variant="accent"
            disabled={isSubmitting}
            className="gap-1.5 text-xs"
          >
            {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
            <span>Create Candidate Record</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
