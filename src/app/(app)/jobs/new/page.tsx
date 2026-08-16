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
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { createJob } from "@/lib/actions/jobs";
import { getDepartments, getLocations } from "@/lib/actions/settings";

export default function CreateJobPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [locationText, setLocationText] = useState("San Francisco, CA / Remote");
  const [workMode, setWorkMode] = useState<"hybrid" | "remote" | "on_site">("hybrid");
  const [employmentType, setEmploymentType] = useState<"full_time" | "part_time" | "contract" | "internship">("full_time");
  const [vacancies, setVacancies] = useState("1");
  const [salaryMin, setSalaryMin] = useState("160000");
  const [salaryMax, setSalaryMax] = useState("200000");
  const [summary, setSummary] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("Health, Dental, 401(k) Match, Learning Stipend");

  useEffect(() => {
    async function loadMeta() {
      try {
        const [deptList, locList] = await Promise.all([
          getDepartments(),
          getLocations(),
        ]);
        setDepartments(deptList);
        setLocations(locList);
        if (deptList[0]) setDepartmentId(deptList[0].id);
        if (locList[0]) setLocationId(locList[0].id);
      } catch (err) {
        console.error("Failed to load metadata:", err);
      } finally {
        setLoadingLookups(false);
      }
    }
    loadMeta();
  }, []);

  const handleSubmit = async (e: React.FormEvent, publish = true) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a job title");
      return;
    }

    setIsSubmitting(true);
    try {
      await createJob({
        title,
        departmentId: departmentId || undefined,
        locationId: locationId || undefined,
        locationText,
        workMode,
        employmentType,
        vacancies: parseInt(vacancies) || 1,
        salaryMin: parseInt(salaryMin) || 120000,
        salaryMax: parseInt(salaryMax) || 160000,
        currency: "USD",
        summary,
        responsibilities: summary,
        requirements,
        benefits,
        status: publish ? "published" : "draft",
        skills: ["System Design", "TypeScript", "PostgreSQL"],
      });

      toast.success(
        publish
          ? `Job opening "${title}" published live to Careers portal!`
          : `Job draft "${title}" saved successfully.`,
      );

      router.push("/jobs");
    } catch (err: any) {
      toast.error(err.message || "Failed to create job requisition");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page max-w-4xl">
      <PageHeader
        title="Create Job Opening"
        description="Configure requisition details, target department, salary range, and candidate requirements."
        breadcrumbs={[
          { label: "Jobs", href: "/jobs" },
          { label: "Create Opening" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/jobs">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <ArrowLeft className="size-3.5" />
                <span>Cancel</span>
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, false)}
              className="text-xs"
            >
              Save as Draft
            </Button>
            <Button
              size="sm"
              variant="accent"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, true)}
              className="gap-1 text-xs"
            >
              {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              <span>Publish Opening</span>
            </Button>
          </div>
        }
      />

      <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-5">
        {/* Basic Information */}
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">1. Role Information</CardTitle>
            <CardDescription className="text-xs">
              Primary designation, department, and work location settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="field-label">Job Title *</label>
                <Input
                  placeholder="e.g. Staff Backend Engineer (Distributed Systems)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Department *</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="h-8 w-full rounded-xs border border-border bg-card px-2.5 text-xs text-foreground focus:border-ring"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Office Location</label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="h-8 w-full rounded-xs border border-border bg-card px-2.5 text-xs text-foreground focus:border-ring"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.city}, {l.country})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Work Mode</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as any)}
                  className="h-8 w-full rounded-xs border border-border bg-card px-2.5 text-xs text-foreground focus:border-ring"
                >
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                  <option value="on_site">On-site</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as any)}
                  className="h-8 w-full rounded-xs border border-border bg-card px-2.5 text-xs text-foreground focus:border-ring"
                >
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Number of Vacancies</label>
                <Input
                  type="number"
                  min="1"
                  value={vacancies}
                  onChange={(e) => setVacancies(e.target.value)}
                  className="h-8 text-xs tabular"
                />
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Location Text Display</label>
                <Input
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="e.g. San Francisco, CA / London / Remote"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compensation */}
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">2. Compensation &amp; Salary Band</CardTitle>
            <CardDescription className="text-xs">
              Annual salary range visible to candidates and internal approvers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="field-label">Minimum Salary (USD)</label>
                <Input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="h-8 text-xs tabular"
                />
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Maximum Salary (USD)</label>
                <Input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="h-8 text-xs tabular"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description & Requirements */}
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">3. Job Description &amp; Candidate Requirements</CardTitle>
            <CardDescription className="text-xs">
              Responsibilities, required tech stack, qualifications, and team benefits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="field-label">Job Summary &amp; Key Responsibilities</label>
              <Textarea
                rows={4}
                placeholder="Describe role mission, day-to-day impact, and team structure..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="field-label">Requirements &amp; Preferred Skills</label>
              <Textarea
                rows={4}
                placeholder="List required years of experience, core technologies, and qualifications..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="field-label">Benefits &amp; Perks</label>
              <Input
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Link href="/jobs">
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
            <span>Publish Job Opening</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
