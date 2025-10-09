"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Receipt, Briefcase, DollarSign, Clock } from "lucide-react";

const NAV = [
  { key: "employee", label: "Employee", icon: Users },
  { key: "checks", label: "Checks", icon: Receipt },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "salary", label: "Salary", icon: DollarSign },
  { key: "timecards", label: "Timecards", icon: Clock },
  { key: "all", label: "All Reports", icon: Receipt },
] as const;

export default function ReportingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="px-4 py-3 sm:px-6">
          <h1 className="text-lg font-semibold text-gray-900">HR/Payroll Reporting</h1>
        </div>
      </header>

      {/* App frame: left rail is truly flush-left */}
      <div className="flex">
        {/* Left rail */}
        <aside className="hidden lg:block w-56 shrink-0 border-r border-gray-200 bg-white">
          <div className="sticky top-[57px] h-[calc(100vh-57px)] overflow-auto p-3">
            <nav className="space-y-1" aria-label="Report groups">
              {NAV.map((n) => {
                const href = n.key === "all" ? "/reporting" : `/reporting/${n.key}`;
                const active = pathname === href;
                const Icon = n.icon;
                return (
                  <Link
                    key={n.key}
                    href={href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-white" : "text-gray-600"}`} />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-h-[calc(100vh-57px)] flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
