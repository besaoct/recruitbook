"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Field, FormError } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEMO_ACCOUNTS = [
  {
    label: "Recruiter",
    email: "recruiter@myorganisation.com",
    desc: "Full requisition management, ATS candidate progression & interview rounds.",
  },
  {
    label: "System Admin",
    email: "admin@myorganisation.com",
    desc: "Universal control over organization settings, RBAC roles & integrations.",
  },
  {
    label: "Hiring Manager",
    email: "david.kim@myorganisation.com",
    desc: "Engineering candidate evaluation, review scorecards & hiring decisions.",
  },
  {
    label: "Interviewer",
    email: "sarah.lopez@myorganisation.com",
    desc: "Conducts panel interviews, submits candidate ratings & feedback.",
  },
];

const DEMO_PASSWORD = "RecruitBook2026!";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("recruiter@myorganisation.com");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Invalid email or password.");
        toast.error(data.error || "Authentication failed");
        setLoading(false);
        return;
      }

      toast.success(`Welcome back, ${data.user.name}`);
      window.location.href = redirectUrl;
    } catch {
      setErrorMsg("Unable to connect to server. Please try again.");
      toast.error("Network error");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormError message={errorMsg} />

        <Field label="Email address" htmlFor="email" required>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@myorganisation.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            disabled={loading}
          />
        </Field>

        <Field label="Password" htmlFor="password" required>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </Field>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {/* Demo credentials, so the seeded workspace is easy to explore. */}
      <div className="rounded-xs border border-border bg-muted/50 px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Demo accounts
          </span>
          <code className="rounded-xs bg-card px-1.5 py-0.5 text-[11px]">
            {DEMO_PASSWORD}
          </code>
        </div>
        <div className="mt-2.5 flex flex-col gap-1.5">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email);
                setPassword(DEMO_PASSWORD);
                setErrorMsg(null);
                toast.info(`Selected ${account.label}`);
              }}
              className="group flex flex-col gap-0.5 rounded-xs border border-transparent bg-transparent px-2 py-1.5 text-left text-[11px] text-muted-foreground transition-all hover:border-border hover:bg-card hover:text-foreground"
            >
              <span className="font-semibold text-foreground group-hover:text-accent">
                {account.label}
              </span>
              <span className="text-[10px] text-muted-foreground/80">
                {account.email}
              </span>
              <span className="text-[10px] leading-normal text-muted-foreground/75 group-hover:text-muted-foreground">
                {account.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
