"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Icon } from "@/components/layout/icon";
import { cn } from "@/lib/utils";
import type { NavNodeView } from "@/lib/navigation";

function isExactActive(
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>,
  href: string,
): boolean {
  const [hrefPath, hrefQuery] = href.split("?");

  if (pathname !== hrefPath) {
    return false;
  }

  // If the target href has NO query parameters (e.g. "/jobs" -> "All Openings")
  if (!hrefQuery) {
    // If the current URL has search parameters, don't mark "All" as active
    if (searchParams && searchParams.toString().length > 0) {
      return false;
    }
    return true;
  }

  // If the target href HAS query parameters (e.g. "/jobs?status=open")
  if (!searchParams) return false;

  const targetParams = new URLSearchParams(hrefQuery);
  for (const [key, value] of targetParams.entries()) {
    if (searchParams.get(key) !== value) {
      return false;
    }
  }

  return true;
}

function isParentActive(pathname: string, href: string): boolean {
  if (href === "/dashboard" || href === "/") {
    return pathname === href;
  }
  const cleanHref = href.split("?")[0];
  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

function SidebarNavContent({
  items,
  collapsed,
}: {
  items: NavNodeView[];
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className="flex flex-1 min-h-0 flex-col gap-0.5 overflow-y-auto overflow-x-hidden px-2 py-3 scrollbar-thin">
      {items.map((item) => (
        <NavItem
          key={item.href + item.label}
          item={item}
          collapsed={collapsed}
          pathname={pathname}
          searchParams={searchParams}
        />
      ))}
    </nav>
  );
}

export function SidebarNav({
  items,
  collapsed,
}: {
  items: NavNodeView[];
  collapsed: boolean;
}) {
  return (
    <Suspense fallback={<nav className="flex flex-1 px-2 py-3" />}>
      <SidebarNavContent items={items} collapsed={collapsed} />
    </Suspense>
  );
}

function NavItem({
  item,
  collapsed,
  pathname,
  searchParams,
}: {
  item: NavNodeView;
  collapsed: boolean;
  pathname: string;
  searchParams: ReturnType<typeof useSearchParams>;
}) {
  const hasChildren = Boolean(item.children?.length);
  const sectionActive = isParentActive(pathname, item.href);
  const childActive = item.children?.some((c) =>
    isExactActive(pathname, searchParams, c.href),
  );
  const active = sectionActive || Boolean(childActive);

  const [override, setOverride] = useState<boolean | null>(null);
  const [lastActive, setLastActive] = useState(active);

  if (lastActive !== active) {
    setLastActive(active);
    setOverride(null);
  }

  const open = override ?? active;

  if (collapsed) {
    return (
      <Link
        href={item.href}
        title={item.label}
        className={cn(
          "flex h-9 items-center justify-center rounded-xs transition-colors",
          active
            ? "bg-shell-active text-shell-active-foreground"
            : "text-shell-muted hover:bg-shell-foreground/10 hover:text-shell-foreground",
        )}
      >
        <Icon name={item.icon} />
        {item.badge ? (
          <span className="ml-1 rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <div>
      {hasChildren ? (
        <button
          type="button"
          onClick={() => setOverride(!open)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xs px-2.5 py-2 text-left text-sm font-medium transition-colors",
            active
              ? "bg-shell-foreground/10 text-shell-foreground"
              : "text-shell-muted hover:bg-shell-foreground/10 hover:text-shell-foreground",
          )}
          aria-expanded={open}
        >
          <Icon name={item.icon} className="size-4 shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge ? (
            <span className="rounded-full bg-accent px-1.5 text-[10px] font-bold leading-4 text-accent-foreground mr-1">
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          ) : null}
          {open ? (
            <ChevronDown className="size-3.5 shrink-0 opacity-60" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0 opacity-60" />
          )}
        </button>
      ) : (
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-2.5 rounded-xs px-2.5 py-2 text-sm font-medium transition-colors",
            active
              ? "bg-shell-active text-shell-active-foreground font-semibold"
              : "text-shell-muted hover:bg-shell-foreground/10 hover:text-shell-foreground",
          )}
        >
          <Icon name={item.icon} className="size-4 shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge ? (
            <span className="rounded-full bg-accent px-1.5 text-[10px] font-bold leading-4 text-accent-foreground">
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          ) : null}
        </Link>
      )}

      {hasChildren && open ? (
        <div className="relative ml-[19px] mt-0.5 space-y-px">
          {/* Vertical rail connecting the child links to their parent */}
          <span className="absolute bottom-2 left-0 top-0 w-px bg-shell-foreground/15" />
          {item.children!.map((child) => {
            const childIsActive = isExactActive(
              pathname,
              searchParams,
              child.href,
            );
            return (
              <div key={child.href} className="relative pl-3.5">
                <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-shell-foreground/15" />
                <Link
                  href={child.href}
                  className={cn(
                    "flex items-center justify-between rounded-xs px-2.5 py-1.5 text-[13px] transition-colors",
                    childIsActive
                      ? "bg-shell-active text-shell-active-foreground font-semibold"
                      : "text-shell-muted hover:bg-shell-foreground/10 hover:text-shell-foreground",
                  )}
                >
                  <span className="truncate">{child.label}</span>
                  {child.badge ? (
                    <span className="ml-1 rounded-full bg-accent/90 px-1 text-[9px] font-bold text-accent-foreground">
                      {child.badge}
                    </span>
                  ) : null}
                </Link>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
