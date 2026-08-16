/**
 * ReqruitBook Microfrontend & External Integration Architecture
 * 
 * Provides contract types for:
 * 1. Embedding ReqruitBook inside host applications (HRM, ERP, ATS Hubs).
 * 2. Cross-microfrontend event communication.
 * 3. Hired candidate conversion payload to HRM/Payroll systems.
 */

export type ReqruitBookModuleSlug =
  | "dashboard"
  | "jobs"
  | "applications"
  | "candidates"
  | "interviews"
  | "offers"
  | "communications"
  | "reports"
  | "settings"
  | "careers";

export interface HiredCandidatePayload {
  candidateId: string;
  applicationId: string;
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  salary: number;
  currency: string;
  joiningDate: string;
  reportingManagerId?: string;
  workLocation?: string;
  documents: {
    name: string;
    type: "resume" | "offer_letter" | "certificate" | "other";
    url: string;
  }[];
}

export type ReqruitBookEventType =
  | "candidate:hired"
  | "candidate:stage_changed"
  | "job:created"
  | "job:published"
  | "job:closed"
  | "interview:scheduled"
  | "offer:sent"
  | "offer:accepted"
  | "application:received"
  | "navigate:requested";

export interface ReqruitBookEvent<T = any> {
  type: ReqruitBookEventType;
  payload: T;
  timestamp: string;
  source: "reqruitbook-core" | "reqruitbook-embed";
}

export type ReqruitBookEventHandler<T = any> = (event: ReqruitBookEvent<T>) => void;

export interface ReqruitBookHostConfig {
  isEmbedded?: boolean;
  hostName?: string;
  activeDepartmentId?: string;
  theme?: "light" | "dark" | "system";
  onNavigate?: (path: string) => void;
  onCandidateHired?: (payload: HiredCandidatePayload) => void;
  onEvent?: ReqruitBookEventHandler;
  permissions?: string[];
  hiddenModules?: ReqruitBookModuleSlug[];
  readOnly?: boolean;
}
