"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Briefcase,
  MapPin,
  Building2,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getJobById } from "@/lib/actions/jobs";
import { submitApplicationFromPortal } from "@/lib/actions/applications";
import { bridge } from "@/lib/microfrontend/bridge";

export default function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [job, setJob] = useState<any>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("San Francisco, CA");
  const [currentDesignation, setCurrentDesignation] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [experienceYears, setExperienceYears] = useState("5");
  const [expectedSalary, setExpectedSalary] = useState("180000");
  const [noticePeriodDays, setNoticePeriodDays] = useState("30");
  const [skills, setSkills] = useState("TypeScript, React, Node.js, PostgreSQL");
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    async function loadJob() {
      try {
        const j = await getJobById(id);
        setJob(j);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingJob(false);
      }
    }
    loadJob();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      toast.error("Please fill in candidate name and email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);

      const result = await submitApplicationFromPortal({
        jobId: id,
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
        coverLetter,
      });

      bridge.emit("application:received", {
        applicationId: result.id,
        candidateId: result.candidateId,
        jobId: id,
        fullName,
        email,
      });

      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 shadow-none border border-border space-y-4">
          <div className="size-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Application Received</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Thank you for applying for <strong>{job?.title || "the position"}</strong>. Our talent acquisition team will review your profile and reach out shortly.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/careers">
              <Button size="sm" variant="accent" className="text-xs w-full">
                Back to Careers Board
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card h-14 flex items-center px-4 sm:px-6">
        <Link href="/careers" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium">
          <ArrowLeft className="size-3.5" />
          <span>Back to All Openings</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {loadingJob ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-copper" />
            <span>Loading requisition details...</span>
          </div>
        ) : !job ? (
          <div className="p-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xs">
            Job requisition not found or closed.
          </div>
        ) : (
          <>
            {/* Job Summary Banner */}
            <div className="p-4 bg-muted/40 rounded-xs border border-border space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-lg font-semibold text-foreground">{job.title}</h1>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{job.departmentName || "Engineering"}</span>
                    <span>•</span>
                    <span>{job.locationName || job.locationText}</span>
                    <span>•</span>
                    <span className="capitalize">{job.workMode.replace("_", " ")}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-semibold">
                  ${(job.salaryMin || 0).toLocaleString()} – ${(job.salaryMax || 0).toLocaleString()} USD
                </Badge>
              </div>
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Card className="shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">1. Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="field-label">Full Legal Name *</label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="h-8 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="field-label">Email Address *</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. alex@example.com"
                        className="h-8 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="field-label">Phone Number</label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="field-label">Current City</label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">2. Experience &amp; Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="field-label">Current Role / Title</label>
                      <Input
                        value={currentDesignation}
                        onChange={(e) => setCurrentDesignation(e.target.value)}
                        placeholder="e.g. Senior Software Engineer"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="field-label">Current Employer</label>
                      <Input
                        value={currentCompany}
                        onChange={(e) => setCurrentCompany(e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="field-label">Total Experience (Years)</label>
                      <Input
                        type="number"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="h-8 text-xs tabular"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="field-label">Expected Annual Compensation ($ USD)</label>
                      <Input
                        type="number"
                        value={expectedSalary}
                        onChange={(e) => setExpectedSalary(e.target.value)}
                        className="h-8 text-xs tabular"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="field-label">Notice Period (Days)</label>
                      <Input
                        type="number"
                        value={noticePeriodDays}
                        onChange={(e) => setNoticePeriodDays(e.target.value)}
                        className="h-8 text-xs tabular"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="field-label">Primary Tech Stack &amp; Skills</label>
                      <Input
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. Go, Kubernetes, PostgreSQL, AWS"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="field-label">Cover Note / Why this role?</label>
                      <Textarea
                        rows={3}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Brief summary of your background and interest in joining..."
                        className="text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Link href="/careers">
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
                  <span>Submit Application</span>
                </Button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
