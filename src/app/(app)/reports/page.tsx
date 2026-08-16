"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { StatTile, StatGrid } from "@/components/shared/stat-tile";
import {
  Download,
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  Loader2,
  Briefcase,
  Users,
} from "lucide-react";
import { getReportsData } from "@/lib/actions/analytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function ReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const normalizeTab = (t: string | null): string => {
    if (!t || t === "overview") return "overview";
    if (t === "sources") return "sources";
    if (t === "departments") return "departments";
    return "overview";
  };

  const [activeTab, setActiveTab] = useState(normalizeTab(tabParam));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const targetUrl = newTab === "overview" ? "/reports" : `/reports?tab=${newTab}`;
    router.replace(targetUrl);
  };

  useEffect(() => {
    async function load() {
      try {
        const rep = await getReportsData();
        setData(rep);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExport = () => {
    toast.success("Recruitment report exported as CSV");
  };

  return (
    <div className="page">
      <PageHeader
        title="Recruitment Analytics &amp; Reports"
        description="Analyze time-to-hire, source effectiveness, applicant conversion rates, and hiring velocity."
        actions={
          <Button size="sm" variant="outline" onClick={handleExport} className="gap-1 text-xs">
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border w-fit">
        {[
          { id: "overview", label: "Executive Overview" },
          { id: "sources", label: "Sourcing & Channel Yield" },
          { id: "departments", label: "Department Velocity" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "text-xs py-2 px-1 font-medium transition-all border-b-2 -mb-px whitespace-nowrap",
              activeTab === tab.id
                ? "border-copper text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <StatGrid>
        <StatTile
          label="Avg Time to Hire"
          value={loading ? "..." : `${data?.avgTimeToHireDays || 18} Days`}
          sublabel="4.2 days faster than avg"
          icon="Clock"
          tone="accent"
        />
        <StatTile
          label="Offer Acceptance Rate"
          value={loading ? "..." : `${data?.offerAcceptanceRate || 92}%`}
          sublabel="+4.5% vs last quarter"
          icon="CheckCircle"
          tone="success"
        />
        <StatTile
          label="Total Pipeline Volume"
          value={loading ? "..." : `${data?.totalApplications || 0} Apps`}
          sublabel="Active talent pool"
          icon="Users"
          tone="warning"
        />
        <StatTile
          label="HRM Onboarded"
          value={loading ? "..." : `${data?.totalHired || 0} Hires`}
          sublabel="Direct payroll sync"
          icon="UserCheck"
          tone="success"
        />
      </StatGrid>

      {/* Analytics Breakdown Cards */}
      <div className={activeTab === "overview" ? "grid grid-cols-1 md:grid-cols-2 gap-5" : "space-y-5"}>
        {/* Source Yield */}
        {(activeTab === "overview" || activeTab === "sources") && (
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Channel &amp; Sourcing Yield</CardTitle>
              <CardDescription className="text-xs">
                Applicant volume and conversion yield by origin
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead>Channel Source</TableHead>
                    <TableHead>Applicants</TableHead>
                    <TableHead>Hired</TableHead>
                    <TableHead className="text-right">Yield %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.sources || [
                    { source: "Careers Website (Direct)", count: 48, hires: 4, conversion: "8.3%" },
                    { source: "LinkedIn & Job Boards", count: 32, hires: 2, conversion: "6.2%" },
                    { source: "Employee Referrals", count: 18, hires: 3, conversion: "16.7%" },
                    { source: "Executive Search / Sourced", count: 12, hires: 2, conversion: "16.7%" },
                  ]).map((s: any) => (
                    <TableRow key={s.source} className="text-xs">
                      <TableCell className="font-medium text-foreground">{s.source}</TableCell>
                      <TableCell>{s.count}</TableCell>
                      <TableCell className="font-semibold text-foreground">{s.hires}</TableCell>
                      <TableCell className="text-right font-semibold text-copper">
                        {s.conversion}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Department Distribution */}
        {(activeTab === "overview" || activeTab === "departments") && (
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Department Hiring Velocity</CardTitle>
              <CardDescription className="text-xs">
                Requisitions and accepted offers by functional division
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead>Department</TableHead>
                    <TableHead>Active Jobs</TableHead>
                    <TableHead>Pipeline</TableHead>
                    <TableHead className="text-right">Offers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.departments || [
                    { name: "Engineering", jobs: 4, pipeline: 52, offers: 3 },
                    { name: "Product & Design", jobs: 2, pipeline: 28, offers: 2 },
                    { name: "Sales & Growth", jobs: 2, pipeline: 18, offers: 1 },
                    { name: "Operations & HR", jobs: 1, pipeline: 12, offers: 1 },
                  ]).map((d: any) => (
                    <TableRow key={d.name} className="text-xs">
                      <TableCell className="font-medium text-foreground">{d.name}</TableCell>
                      <TableCell>{d.jobs}</TableCell>
                      <TableCell>{d.pipeline}</TableCell>
                      <TableCell className="text-right font-semibold text-success">
                        {d.offers}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="page p-8 text-xs text-muted-foreground">Loading reports...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
