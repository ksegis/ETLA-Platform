"use client";

import React, { useMemo, useState } from "react";
import type { JSX } from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  Edit3,
  Briefcase,
  Banknote,
  Building2,
  History,
  BadgeInfo,
  ClipboardList,
  CalendarDays,
  BarChart3,
  ShieldCheck,
  Search,
  Star,
  Download,
  X,
} from "lucide-react";

/** ---------------------------
 * Types
 * --------------------------*/
type Category = "payroll" | "hr" | "executive";

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof IconLib;
  category: Category;
  fields: number;
  estimatedRecords: number;
  isFavorite?: boolean;
  lastGenerated?: string; // ISO string
}

interface KPIData {
  label: string;
  value: number;
  change: number; // percent
  trend: "up" | "down" | "neutral";
}

/** ---------------------------
 * Icon Library (no raw SVGs)
 * --------------------------*/
const IconLib = {
  users: Users,
  dollars: DollarSign,
  trend: TrendingUp,
  edit: Edit3,
  briefcase: Briefcase,
  banknote: Banknote,
  building: Building2,
  history: History,
  info: BadgeInfo,
  clipboard: ClipboardList,
  calendar: CalendarDays,
  chart: BarChart3,
  shield: ShieldCheck,
  star: Star,
  download: Download,
  close: X,
  search: Search,
};

/** ---------------------------
 * Theming helpers
 * --------------------------*/
const categoryTheme: Record<
  Category,
  { bg: string; ring: string; headline: string }
> = {
  payroll: {
    bg: "bg-blue-50",
    ring: "ring-blue-200",
    headline: "text-blue-800",
  },
  hr: { bg: "bg-green-50", ring: "ring-green-200", headline: "text-green-800" },
  executive: {
    bg: "bg-purple-50",
    ring: "ring-purple-200",
    headline: "text-purple-800",
  },
};

/** ---------------------------
 * Static preview data (accurate counts)
 * --------------------------*/
const KPI_PREVIEW: KPIData[] = [
  { label: "Total Employees", value: 2113, change: 3.1, trend: "up" },
  { label: "Payroll Volume", value: 1850000, change: -1.2, trend: "down" },
  { label: "Status Changes", value: 67, change: 0, trend: "neutral" },
  { label: "Pay Adjustments", value: 24, change: 1.8, trend: "up" },
];

const REPORTS: ReportType[] = [
  // Payroll (5)
  {
    id: "pay_period_analysis",
    title: "Pay Period Analysis",
    description: "Summary by period",
    icon: "dollars",
    category: "payroll",
    fields: 8,
    estimatedRecords: 500,
  },
  {
    id: "benefit_group_analysis",
    title: "Benefit Group Analysis",
    description: "Benefit groups by cost",
    icon: "briefcase",
    category: "payroll",
    fields: 12,
    estimatedRecords: 150,
  },
  {
    id: "department_analysis",
    title: "Department Analysis",
    description: "Cost by department",
    icon: "building",
    category: "payroll",
    fields: 15,
    estimatedRecords: 2500,
  },
  {
    id: "compensation_history",
    title: "Compensation History",
    description: "Changes over time",
    icon: "history",
    category: "payroll",
    fields: 10,
    estimatedRecords: 890,
  },
  {
    id: "tax_information",
    title: "Tax Information",
    description: "Jurisdictions & withholdings",
    icon: "banknote",
    category: "payroll",
    fields: 26,
    estimatedRecords: 1850,
  },

  // HR (4)
  {
    id: "current_demographics",
    title: "Current Demographics",
    description: "Workforce snapshot",
    icon: "users",
    category: "hr",
    fields: 35,
    estimatedRecords: 2113,
  },
  {
    id: "employee_status_history",
    title: "Employee Status History",
    description: "Active/inactive changes",
    icon: "clipboard",
    category: "hr",
    fields: 6,
    estimatedRecords: 450,
  },
  {
    id: "position_history",
    title: "Position History",
    description: "Role changes",
    icon: "edit",
    category: "hr",
    fields: 13,
    estimatedRecords: 670,
  },
  {
    id: "custom_fields",
    title: "Custom Fields",
    description: "User-defined attributes",
    icon: "info",
    category: "hr",
    fields: 5,
    estimatedRecords: 320,
  },

  // Executive (3)
  {
    id: "monthly_executive_report",
    title: "Monthly Executive Report",
    description: "High-level KPIs",
    icon: "chart",
    category: "executive",
    fields: 25,
    estimatedRecords: 12,
  },
  {
    id: "detailed_analytics",
    title: "Detailed Analytics",
    description: "Deep-dive dataset",
    icon: "trend",
    category: "executive",
    fields: 50,
    estimatedRecords: 5000,
  },
  {
    id: "compliance_report",
    title: "Compliance Report",
    description: "Audit readiness",
    icon: "shield",
    category: "executive",
    fields: 30,
    estimatedRecords: 2113,
  },
];

/** ---------------------------
 * Small presentational pieces
 * --------------------------*/
function KpiCard({ kpi }: { kpi: KPIData }) {
  const TrendIcon = kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingUp : TrendingUp;
  const trendClass =
    kpi.trend === "up"
      ? "text-emerald-600"
      : kpi.trend === "down"
      ? "text-rose-600 rotate-180"
      : "text-gray-500 opacity-50";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{kpi.label}</div>
        <TrendIcon className={`h-4 w-4 ${trendClass}`} aria-hidden />
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">
        {kpi.label === "Payroll Volume" ? `$${kpi.value.toLocaleString()}` : kpi.value.toLocaleString()}
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {kpi.trend === "neutral" ? "0.0%" : `${kpi.change > 0 ? "+" : ""}${kpi.change.toFixed(1)}%`} vs last period
      </div>
      {/* Simple sparkline substitute (bars) – avoids heavy chart deps */}
      <div className="mt-3 grid grid-cols-12 gap-1">
        {Array.from({ length: 12 }).map((_, i) => {
          const height = 3 + ((i * 7) % 12); // fake little ups/downs
          return <div key={i} style={{ height }} className="w-full rounded bg-gray-200" />;
        })}
      </div>
    </div>
  );
}

function ReportCard({
  report,
  onSelect,
}: {
  report: ReportType;
  onSelect: (r: ReportType) => void;
}) {
  const Icon = IconLib[report.icon];
  return (
    <button
      type="button"
      onClick={() => onSelect(report)}
      className={`group flex w-full items-start gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${categoryTheme[report.category].ring}`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${categoryTheme[report.category].bg}`}
      >
        <Icon className={`h-5 w-5 ${categoryTheme[report.category].headline}`} aria-hidden />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">{report.title}</h4>
          <span className="text-xs text-gray-500">
            {report.fields} fields · ~{report.estimatedRecords.toLocaleString()} rows
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-600">{report.description}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          <Star className="h-4 w-4 opacity-60" />
          <span>Favorite</span>
          <span className="opacity-60">•</span>
          <span>Last run: {report.lastGenerated ? new Date(report.lastGenerated).toLocaleDateString() : "—"}</span>
        </div>
      </div>
    </button>
  );
}

/** ---------------------------
 * Right-panel configuration (slides in)
 * --------------------------*/
function ConfigPanel({
  open,
  report,
  onClose,
}: {
  open: boolean;
  report: ReportType | null;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-y-0 right-0 z-40 w-full max-w-lg transform border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
      role="dialog"
      aria-label="Report configuration"
    >
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-700" />
          <h3 className="text-base font-semibold text-gray-900">{report?.title ?? "Configure Report"}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Close configuration"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Simple config controls – hook these to your SP/SQL later */}
      <div className="space-y-4 p-4">
        <div>
          <label className="text-sm text-gray-700">Date range</label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <input type="date" className="rounded-lg border border-gray-300 p-2" />
            <input type="date" className="rounded-lg border border-gray-300 p-2" />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-700">Filters</label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 p-2"
            placeholder="Search or add filters…"
          />
        </div>

        <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
          Estimated records:{" "}
          <span className="font-medium">
            {report ? report.estimatedRecords.toLocaleString() : 0}
          </span>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 font-medium text-white hover:bg-black"
          onClick={() => {
            // Stub: wire this up to your excel_export_service in a later step.
            // Keeping it a stub avoids bundling-time failures if the service path differs.
            console.log("Export requested for:", report?.id);
            alert("Export queued (stub). Wire to excel_export_service next.");
          }}
        >
          <Download className="h-4 w-4" /> Export to Excel
        </button>
      </div>
    </div>
  );
}

/** ---------------------------
 * Main Page
 * --------------------------*/
export default function ReportingDashboard(): JSX.Element {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [openConfig, setOpenConfig] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return REPORTS;
    return REPORTS.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }, [query]);

  const byCategory = useMemo(() => {
    return {
      payroll: filtered.filter((r) => r.category === "payroll"),
      hr: filtered.filter((r) => r.category === "hr"),
      executive: filtered.filter((r) => r.category === "executive"),
    } as Record<Category, ReportType[]>;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-semibold text-gray-900">HR/Payroll Reporting</h1>
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-gray-400"
                placeholder="Search reports, categories…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        {/* KPI Cards */}
        <section aria-label="KPIs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {KPI_PREVIEW.map((k) => (
              <KpiCard key={k.label} kpi={k} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mt-8 space-y-10">
          {/* Payroll */}
          <CategoryBlock
            title="Payroll Reports"
            category="payroll"
            items={byCategory.payroll}
            onSelect={(r) => {
              setSelectedReport(r);
              setOpenConfig(true);
            }}
          />
          {/* HR */}
          <CategoryBlock
            title="HR Reports"
            category="hr"
            items={byCategory.hr}
            onSelect={(r) => {
              setSelectedReport(r);
              setOpenConfig(true);
            }}
          />
          {/* Executive */}
          <CategoryBlock
            title="Executive Reports"
            category="executive"
            items={byCategory.executive}
            onSelect={(r) => {
              setSelectedReport(r);
              setOpenConfig(true);
            }}
          />
        </section>
      </main>

      {/* Config panel */}
      <ConfigPanel open={openConfig} report={selectedReport} onClose={() => setOpenConfig(false)} />
    </div>
  );
}

/** ---------------------------
 * Category block
 * --------------------------*/
function CategoryBlock({
  title,
  category,
  items,
  onSelect,
}: {
  title: string;
  category: Category;
  items: ReportType[];
  onSelect: (r: ReportType) => void;
}) {
  return (
    <div>
      <h2 className={`mb-3 text-base font-semibold ${categoryTheme[category].headline}`}>{title}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((r) => (
          <ReportCard key={r.id} report={r} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
