import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Box,
  Building2,
  PlusCircle,
  Search,
  BarChart3,
  Settings,
  HelpCircle,
  Menu,
  X,
  House,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/map", label: "3D Map", icon: Box },
  { to: "/properties", label: "Properties", icon: Building2 },
  { to: "/add", label: "Add Property", icon: PlusCircle },
  { to: "/search", label: "ULPIN Search", icon: Search },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

const bottom = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help", icon: HelpCircle },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <House className="size-5" />
        </span>
        <span className="leading-tight">
          <span className="block text-base font-semibold text-sidebar-foreground">3D ULPIN</span>
          <span className="block text-xs text-muted-foreground">Property Mapping System</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            activeOptions={{ exact: to === "/" }}
            activeProps={{
              className: "bg-primary/10 text-primary font-semibold",
            }}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent"
          >
            <Icon className="size-4.5" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border p-3">
        {bottom.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            activeProps={{ className: "bg-primary/10 text-primary font-semibold" }}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent"
          >
            <Icon className="size-4.5" />
            {label}
          </Link>
        ))}
        <div className="mt-2 flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            SO
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-medium text-sidebar-foreground">Survey Officer</span>
            <span className="block text-xs text-muted-foreground">Demo account</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <NavList />
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-border p-2 text-foreground"
        >
          <Menu className="size-5" />
        </button>
        <span className="flex items-center gap-2 font-semibold">
          <House className="size-4 text-primary" /> 3D ULPIN
        </span>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-sidebar shadow-xl">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-muted-foreground"
            >
              <X className="size-5" />
            </button>
            <NavList onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className={cn("lg:pl-64")}>{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border bg-card px-5 py-6 md:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
