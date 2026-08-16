"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
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
  DollarSign,
  Clock,
  GraduationCap,
  Award,
  Globe,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { getJobById } from "@/lib/actions/jobs";
import { submitApplicationFromPortal } from "@/lib/actions/applications";
import { bridge } from "@/lib/microfrontend/bridge";
import { BENEFIT_CATEGORIES, BenefitItem } from "@/components/jobs/benefits-repeater";

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
        if (j?.skills && Array.isArray(j.skills) && j.skills.length > 0) {
          setSkills(j.skills.join(", "));
        }
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

  const getCategoryMeta = (cat: string) => {
    return BENEFIT_CATEGORIES.find((c) => c.value === cat) || BENEFIT_CATEGORIES[6];
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

  // Parse benefits list if available, or legacy string
  let benefitsListToRender: BenefitItem[] = [];
  if (job?.benefitsList && Array.isArray(job.benefitsList) && job.benefitsList.length > 0) {
    benefitsListToRender = job.benefitsList;
  } else if (job?.benefits) {
    benefitsListToRender = job.benefits.split(",").map((b: string, idx: number) => ({
      id: `b_${idx}`,
      title: b.trim(),
      category: "custom" as const,
    }));
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card h-14 flex items-center justify-between px-4 sm:px-8">
        <Link href="/careers" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
          <ArrowLeft className="size-3.5" />
          <span>Back to All Openings</span>
        </Link>
        <span className="text-xs text-muted-foreground">
          {job?.reqCode || "REQ-OPENING"}
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {loadingJob ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-copper" />
            <span>Loading requisition specifications...</span>
          </div>
        ) : !job ? (
          <div className="p-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xs">
            Job requisition not found or closed.
          </div>
        ) : (
          <>
            {/* Job Summary Banner */}
            <div className="p-6 bg-card rounded-xs border border-border space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">{job.title}</h1>
                    {job.reqCode && (
                      <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                        {job.reqCode}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <Building2 className="size-3 text-copper" />
                      <span>{job.departmentName || "Engineering"}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-copper" />
                      <span>{job.locationName || job.locationText}</span>
                    </span>
                    <span>•</span>
                    <span className="capitalize">{job.workMode?.replace(/_/g, " ")}</span>
                    <span>•</span>
                    <span className="capitalize">{job.employmentType?.replace(/_/g, " ")}</span>
                    {job.experienceLevel && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{job.experienceLevel.replace(/_/g, " ")} Level</span>
                      </>
                    )}
                  </div>
                </div>

                {job.isSalaryPublic !== false && job.salaryMin && (
                  <div className="text-right sm:text-right shrink-0">
                    <div className="text-sm sm:text-base font-bold text-copper">
                      {job.currency || "$"} {(job.salaryMin || 0).toLocaleString()} – {(job.salaryMax || 0).toLocaleString()}
                    </div>
                    <span className="text-[11px] text-muted-foreground block capitalize">
                      {job.payFrequency ? `${job.payFrequency} compensation` : "Annual Base"}
                    </span>
                  </div>
                )}
              </div>

              {/* Extra Highlights: Equity, Bonus, Relocation */}
              {(job.equityRange || job.bonusStructure || job.relocationAssistance) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/20 rounded-xs border border-border/80 text-xs">
                  {job.equityRange && (
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Equity / Stock Grants</span>
                      <span className="font-medium text-foreground">{job.equityRange}</span>
                    </div>
                  )}
                  {job.bonusStructure && (
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Performance Bonus</span>
                      <span className="font-medium text-foreground">{job.bonusStructure}</span>
                    </div>
                  )}
                  {job.relocationAssistance && (
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Relocation / Visa</span>
                      <span className="font-medium text-foreground">{job.relocationAssistance}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Role Overview */}
              {job.summary && (
                <div className="space-y-1.5 text-xs">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-copper">Role Mission &amp; Overview</h3>
                  <div
                    dangerouslySetInnerHTML={{ __html: job.summary }}
                    className="text-foreground/90 text-xs leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-xs [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-copper [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:text-copper [&_a]:underline"
                  />
                </div>
              )}

              {/* Key Responsibilities */}
              {job.responsibilities && job.responsibilities !== job.summary && (
                <div className="space-y-1.5 text-xs pt-3 border-t border-border/60">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-copper">Key Deliverables &amp; Responsibilities</h3>
                  <div
                    dangerouslySetInnerHTML={{ __html: job.responsibilities }}
                    className="text-foreground/90 text-xs leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-xs [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-copper [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:text-copper [&_a]:underline"
                  />
                </div>
              )}

              {/* Mandatory Requirements */}
              {job.requirements && (
                <div className="space-y-1.5 text-xs pt-3 border-t border-border/60">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-copper">Qualifications &amp; Requirements</h3>
                  <div
                    dangerouslySetInnerHTML={{ __html: job.requirements }}
                    className="text-foreground/90 text-xs leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-xs [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-copper [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:text-copper [&_a]:underline"
                  />
                </div>
              )}

              {/* Nice to Have */}
              {job.niceToHave && (
                <div className="space-y-1.5 text-xs pt-3 border-t border-border/60">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-copper">Preferred / Nice-to-Have Experience</h3>
                  <div
                    dangerouslySetInnerHTML={{ __html: job.niceToHave }}
                    className="text-foreground/90 text-xs leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-xs [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-copper [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:text-copper [&_a]:underline"
                  />
                </div>
              )}

              {/* Technical Skills Badges */}
              {((job.skills && job.skills.length > 0) || (job.secondarySkills && job.secondarySkills.length > 0)) && (
                <div className="space-y-2 pt-3 border-t border-border/60">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-copper">Relevant Technologies &amp; Competencies</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills?.map((s: string) => (
                      <Badge key={s} variant="outline" className="text-xs px-2 py-0.5 border-copper/40 text-foreground bg-copper/5">
                        {s}
                      </Badge>
                    ))}
                    {job.secondarySkills?.map((s: string) => (
                      <Badge key={s} variant="outline" className="text-xs px-2 py-0.5 border-border text-muted-foreground">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Structured Benefits & Perks Grid */}
              {benefitsListToRender.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-copper">
                      Benefits, Perks &amp; Total Rewards ({benefitsListToRender.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {benefitsListToRender.map((b) => {
                      const meta = getCategoryMeta(b.category || "custom");

                      return (
                        <div
                          key={b.id || b.title}
                          className="p-3.5 rounded-xs border border-border bg-card/60 hover:border-copper/40 transition-colors space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-semibold text-xs text-foreground block">
                              {b.title}
                            </span>
                            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border shrink-0 ${meta.color}`}>
                              {meta.label}
                            </Badge>
                          </div>
                          {b.description && (
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              {b.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* About Team */}
              {job.aboutTeam && (
                <div className="space-y-1.5 text-xs pt-3 border-t border-border/60">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-copper">About the Team &amp; Work Culture</h3>
                  <div
                    dangerouslySetInnerHTML={{ __html: job.aboutTeam }}
                    className="text-foreground/90 text-xs leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-xs [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-copper [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:text-copper [&_a]:underline"
                  />
                </div>
              )}
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center space-y-1 pt-2">
                <h2 className="text-lg font-bold text-foreground">Apply for this Position</h2>
                <p className="text-xs text-muted-foreground">
                  Submit your credentials directly to the hiring team for <strong>{job.title}</strong>.
                </p>
              </div>

              <Card className="shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">1. Candidate Contact Information</CardTitle>
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
                      <label className="field-label">Current City &amp; Country</label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. London, United Kingdom"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">2. Experience &amp; Compensation Expectations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="field-label">Current Designation / Role</label>
                      <Input
                        value={currentDesignation}
                        onChange={(e) => setCurrentDesignation(e.target.value)}
                        placeholder="e.g. Senior Backend Engineer"
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
                      <label className="field-label">Expected Annual Compensation ({job.currency || "USD"})</label>
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
                      <label className="field-label">Primary Tech Stack &amp; Key Competencies</label>
                      <Input
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. TypeScript, Distributed Systems, PostgreSQL, AWS"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="field-label">Cover Note / Why do you want to join us?</label>
                      <Textarea
                        rows={3}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Brief summary of your background, achievements, and interest in this specific role..."
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
                  className="gap-1.5 text-xs min-w-35"
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
