"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Briefcase,
  Search,
  MapPin,
  Building2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Globe,
  Clock,
  Loader2,
} from "lucide-react";
import { getJobs } from "@/lib/actions/jobs";
import { getOrganizationSettings } from "@/lib/actions/settings";

export default function CareersPublicPage() {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [jobs, setJobs] = useState<any[]>([]);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [jList, orgData] = await Promise.all([
          getJobs({ status: "published" }),
          getOrganizationSettings(),
        ]);
        setJobs(jList);
        setOrg(orgData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const departments = ["All", ...Array.from(new Set(jobs.map((j) => j.departmentName).filter(Boolean)))];

  const filtered = jobs.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.departmentName && j.departmentName.toLowerCase().includes(search.toLowerCase())) ||
      (j.locationText && j.locationText.toLowerCase().includes(search.toLowerCase()));
    const matchDept = selectedDept === "All" || j.departmentName === selectedDept;
    return matchSearch && matchDept;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Public Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="My Organisation Logo"
              width={32}
              height={32}
              className="size-8 rounded-xs object-contain"
            />
            <div>
              <span className="font-semibold text-sm text-foreground block leading-tight">
                {org?.name || "My Organisation"}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Careers &amp; Opportunities               </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-bark text-parchment py-12 px-4 sm:px-6 border-b border-bark-muted">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <Badge
            variant="outline"
            className="border-copper text-copper bg-copper/10 px-2.5 py-0.5 text-xs"
          >
            We Are Hiring
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-parchment">
            Build High-Impact Systems at {org?.name || "My Organisation"}
          </h1>
          <p className="text-xs sm:text-sm text-parchment/80 max-w-2xl mx-auto leading-relaxed">
            Join a forward-thinking global team building scalable enterprise infrastructure, delightful user interfaces, and next-generation applications.
          </p>
        </div>
      </section>

      {/* Job Search & Filter */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by role, keyword, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-card"
            />
          </div>

          <div className="flex items-center gap-4 border-b border-border w-fit overflow-x-auto">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={cn(
                  "text-xs py-2 px-1 font-medium transition-all border-b-2 -mb-px whitespace-nowrap",
                  selectedDept === dept
                    ? "border-copper text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60",
                )}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Job Requisitions List */}
        {loading ? (
          <div className="p-16 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-copper" />
            <span>Loading career openings...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xs">
            No open requisitions match your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((job) => (
              <Card
                key={job.id}
                className="shadow-none border border-border hover:border-copper transition-all p-4 flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/careers/apply/${job.id}`}>
                        <h3 className="font-semibold text-sm text-foreground group-hover:text-copper transition-colors">
                          {job.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Building2 className="size-3 text-copper" />
                          <span>{job.departmentName || "Engineering"}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-copper" />
                          <span>{job.locationName || job.locationText}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="capitalize text-[10px] bg-card border-copper/30 text-copper">
                        {job.workMode?.replace(/_/g, " ")}
                      </Badge>
                      {job.employmentType && (
                        <Badge variant="outline" className="capitalize text-[10px] bg-card border-border text-muted-foreground">
                          {job.employmentType?.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {job.summary
                      ? job.summary.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim()
                      : "Join our fast growing team to solve interesting challenges at scale."}
                  </p>

                  {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {job.skills.slice(0, 4).map((s: string) => (
                        <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0 border-border bg-muted/30 text-muted-foreground">
                          {s}
                        </Badge>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="text-[10px] text-muted-foreground self-center">
                          +{job.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-border flex items-center justify-between">
                  <div>
                    {job.salaryMin ? (
                      <span className="text-xs font-bold text-copper">
                        {job.currency || "$"} {(job.salaryMin || 0).toLocaleString()} – {(job.salaryMax || 0).toLocaleString()}
                        <span className="text-[10px] text-muted-foreground font-normal ml-1">
                          / {job.payFrequency === "hourly" ? "hr" : "yr"}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Competitive Compensation</span>
                    )}
                  </div>

                  <Link href={`/careers/apply/${job.id}`}>
                    <Button size="xs" variant="accent" className="gap-1 text-xs">
                      <span>Apply Now</span>
                      <ArrowRight className="size-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {org?.name || "My Organisation"}. Powered by ReqruitBook ATS &amp; HRM Platform.
      </footer>
    </div>
  );
}
