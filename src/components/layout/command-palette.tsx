"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Briefcase,
  Users,
  Calendar,
  FileCheck,
  Plus,
  Building2,
  Layers,
  Search,
  Settings,
  Mail,
  ChartColumn,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { hasPermission, isSuperAdmin } = useAuth();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange],
  );

  const canCreateJob = isSuperAdmin || hasPermission("canCreateJobs");
  const canAddCandidate = isSuperAdmin || hasPermission("canManageCandidates");
  const canScheduleInterview = isSuperAdmin || hasPermission("canScheduleInterviews");
  const canCreateOffer = isSuperAdmin || hasPermission("canCreateOffers");

  const canViewJobs = isSuperAdmin || hasPermission("canCreateJobs") || hasPermission("canEditJobs");
  const canViewApplications = isSuperAdmin || hasPermission("canAdvancePipeline") || hasPermission("canManageCandidates");
  const canViewCandidates = isSuperAdmin || hasPermission("canManageCandidates");
  const canViewInterviews = isSuperAdmin || hasPermission("canViewScorecards") || hasPermission("canScheduleInterviews");
  const canViewOffers = isSuperAdmin || hasPermission("canCreateOffers") || hasPermission("canApproveOffers");
  const canViewComms = isSuperAdmin || hasPermission("canSendCommunications");
  const canViewReports = isSuperAdmin || hasPermission("canViewReports");
  const canViewSettings = isSuperAdmin || hasPermission("canManageSettings") || hasPermission("canManageUsers") || hasPermission("canAssignRoles");

  const hasAnyQuickAction = canCreateJob || canAddCandidate || canScheduleInterview || canCreateOffer;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg sm:max-w-xl">
        <Command className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 **:[[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-2 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4">
          <CommandInput placeholder="Type a command or search candidates, jobs, stages..." />
          <CommandList className="max-h-85 overflow-y-auto">
            <CommandEmpty>No results found.</CommandEmpty>
            
            {hasAnyQuickAction && (
              <>
                <CommandGroup heading="Quick Actions">
                  {canCreateJob && (
                    <CommandItem
                      onSelect={() => runCommand(() => router.push("/jobs/new"))}
                      className="gap-2 text-xs"
                    >
                      <Plus className="size-4 text-copper" />
                      <span>Create New Job Opening</span>
                    </CommandItem>
                  )}
                  {canAddCandidate && (
                    <CommandItem
                      onSelect={() => runCommand(() => router.push("/candidates/new"))}
                      className="gap-2 text-xs"
                    >
                      <Users className="size-4 text-copper" />
                      <span>Add Candidate / Upload Resume</span>
                    </CommandItem>
                  )}
                  {canScheduleInterview && (
                    <CommandItem
                      onSelect={() => runCommand(() => router.push("/interviews/schedule"))}
                      className="gap-2 text-xs"
                    >
                      <Calendar className="size-4 text-copper" />
                      <span>Schedule Interview Round</span>
                    </CommandItem>
                  )}
                  {canCreateOffer && (
                    <CommandItem
                      onSelect={() => runCommand(() => router.push("/offers/new"))}
                      className="gap-2 text-xs"
                    >
                      <FileCheck className="size-4 text-copper" />
                      <span>Generate Offer Letter</span>
                    </CommandItem>
                  )}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            <CommandGroup heading="Recruitment Navigation">
              <CommandItem
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="gap-2 text-xs"
              >
                <Building2 className="size-4 text-muted-foreground" />
                <span>Dashboard Overview</span>
              </CommandItem>
              
              {canViewJobs && (
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/jobs"))}
                  className="gap-2 text-xs"
                >
                  <Briefcase className="size-4 text-muted-foreground" />
                  <span>Active Job Requisitions</span>
                </CommandItem>
              )}

              {canViewApplications && (
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/applications"))}
                  className="gap-2 text-xs"
                >
                  <Layers className="size-4 text-muted-foreground" />
                  <span>Recruitment Pipeline Kanban</span>
                </CommandItem>
              )}

              {canViewCandidates && (
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/candidates"))}
                  className="gap-2 text-xs"
                >
                  <Users className="size-4 text-muted-foreground" />
                  <span>Candidates &amp; Talent Pool</span>
                </CommandItem>
              )}

              {canViewInterviews && (
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/interviews"))}
                  className="gap-2 text-xs"
                >
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>Interviews &amp; Panel Rounds</span>
                </CommandItem>
              )}

              {canViewOffers && (
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/offers"))}
                  className="gap-2 text-xs"
                >
                  <FileCheck className="size-4 text-muted-foreground" />
                  <span>Offers &amp; Compensation</span>
                </CommandItem>
              )}

              {canViewComms && (
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/communications"))}
                  className="gap-2 text-xs"
                >
                  <Mail className="size-4 text-muted-foreground" />
                  <span>Candidate Communications</span>
                </CommandItem>
              )}

              {canViewReports && (
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/reports"))}
                  className="gap-2 text-xs"
                >
                  <ChartColumn className="size-4 text-muted-foreground" />
                  <span>Recruitment Analytics &amp; Reports</span>
                </CommandItem>
              )}

              {canViewSettings && (
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/settings"))}
                  className="gap-2 text-xs"
                >
                  <Settings className="size-4 text-muted-foreground" />
                  <span>System &amp; Access Settings</span>
                </CommandItem>
              )}

              <CommandItem
                onSelect={() => runCommand(() => router.push("/careers"))}
                className="gap-2 text-xs"
              >
                <Search className="size-4 text-muted-foreground" />
                <span>Public Careers Portal</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
