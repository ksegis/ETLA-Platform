'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Download } from 'lucide-react';
import type { ReportType } from '../_data';

/** Helpers */
const n = (v: unknown) => (typeof v === 'number' ? v : Number(v ?? 0)) || 0;
const fileSafe = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

/** Try to fetch the same rows the table would use */
async function resolveRows(report: ReportType): Promise<any[]> {
  const r: any = report;
  try {
    if (typeof r.buildRows === 'function') return await r.buildRows({});
    if (typeof r.fetchRows === 'function') return await r.fetchRows({});
    if (Array.isArray(r.rows)) return r.rows;
    if (Array.isArray(r.data)) return r.data;
  } catch {
    /* ignore */
  }
  return [];
}

/** Generate sensible demo rows when no data is available */
function synthRows(report: ReportType, count = 160): any[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const depts = ['SALES', 'SRV/HUB', 'TEACH', 'WORSHIP', 'OPS', 'HR'];
  const names = ['Aeryn Sun', 'John Crichton', 'B. Stark', 'C. Copeland', 'R. Lofthouse'];
  const isDept = /department/i.test(report.title);
  const isJob = /job history/i.test(report.title);
  const isPos = /position history/i.test(report.title);
  const isCheck = /check|payroll|pay stub|tax/i.test(report.title);

  const rows: any[] = [];
  for (let i = 0; i < count; i++) {
    const m = i % months.length;
    const periodstart = `2025-${String(m + 1).padStart(2, '0')}-01`;
    const periodlabel = `${months[m]} 2025`;
    const department = depts[i % depts.length];

    if (isDept) {
      rows.push({
        periodstart,
        periodlabel,
        department,
        regularpay: 15000 + (i % 9) * 800,
        otpay: [0, 300, 315, 330, 840, 0][i % 6],
        bonus: [0, 0, 500, 0, 1200, 0][i % 6],
      });
    } else if (isJob) {
      rows.push({
        effectivedate: periodstart,
        periodlabel,
        employee: names[i % names.length],
        employeeid: `E${String(1 + (i % 250)).padStart(3, '0')}`,
        title: ['Sales Associate', 'Server', 'Teacher', 'Worship Lead', 'HR Gen'][i % 5],
        department,
        action: ['Promotion', 'Transfer', 'New Hire', 'Lateral Move'][i % 4],
        reason: ['Merit', 'Reorg', 'Backfill', 'Request'][i % 4],
      });
    } else if (isPos) {
      rows.push({
        effectivedate: periodstart,
        periodlabel,
        employee: names[i % names.length],
        employeeid: `E${String(1 + (i % 250)).padStart(3, '0')}`,
        position: ['Associate', 'Sr Associate', 'Lead', 'Manager'][i % 4],
        department,
        reason: ['Backfill', 'New role', 'Restructure'][i % 3],
      });
    } else if (isCheck) {
      const gross = 2000 + (i % 6) * 120;
      rows.push({
        EMPLOYEENAME: names[i % names.length],
        EMPLOYEEID: `E${String(1 + (i % 250)).padStart(3, '0')}`,
        PAYDATE: periodstart,
        GROSS: gross,
        TAX: Math.round(gross * 0.24),
        NETPAY: Math.round(gross * 0.76),
      });
    } else {
      // generic row
      rows.push({
        periodlabel,
        department,
        value: 100 + (i % 15) * 7,
      });
    }
  }
  return rows;
}

/** Build chart points from rows */
function toChartData(report: ReportType, rows: any[]) {
  if (!rows?.length) return [];

  if (/department/i.test(report.title)) {
    const map = new Map<
      string,
      { name: string; regular: number; overtime: number; bonus: number }
    >();
    rows.forEach((r) => {
      const dep = String(r.DEPARTMENT ?? r.department ?? 'Unknown');
      const reg = n(r.REGULARPAY ?? r.regularpay);
      const ot = n(r.OTPAY ?? r.overtime ?? r.otpay);
      const bn = n(r.BONUS ?? r.bonus);
      const curr = map.get(dep) ?? { name: dep, regular: 0, overtime: 0, bonus: 0 };
      curr.regular += reg;
      curr.overtime += ot;
      curr.bonus += bn;
      map.set(dep, curr);
    });
    return Array.from(map.values());
  }

  if (/job history|position history/i.test(report.title)) {
    const map = new Map<string, { name: string; changes: number }>();
    rows.forEach((r) => {
      const p =
        String(r.PERIODLABEL ?? r.periodlabel ?? r.PERIODSTART ?? r.periodstart ?? '')
          .slice(0, 7) || 'Unknown';
      const curr = map.get(p) ?? { name: p, changes: 0 };
      curr.changes += 1;
      map.set(p, curr);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  if (/check|payroll|pay stub|tax/i.test(report.title)) {
    return rows.slice(0, 25).map((r: any) => ({
      name: String(r.EMPLOYEENAME ?? r.name ?? r.EMPLOYEEID ?? '—'),
      gross: n(r.GROSS ?? r.gross),
      net: n(r.NETPAY ?? r.net ?? r.netpay),
    }));
  }

  // fallback: first numeric column
  const keys = Object.keys(rows[0] ?? {});
  const numKey = keys.find((k) => typeof rows[0]?.[k] === 'number');
  return rows.slice(0, 25).map((r, i) => ({
    name: String(r.DEPARTMENT ?? r.EMPLOYEENAME ?? r.department ?? `Row ${i + 1}`),
    value: n(numKey ? r[numKey] : 0),
  }));
}

/** Component */
type Props = {
  open: boolean;
  report: ReportType;
  onClose: () => void;
};

export default function PreviewModal({ open, report, onClose }: Props) {
  const [rows, setRows] = React.useState<any[]>([]);

  // lock body scroll while open
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Load rows (or synthesize) when opened or report changes
  React.useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      let data = await resolveRows(report);
      if (!data || data.length === 0) data = synthRows(report);
      if (alive) setRows(data);
    })();
    return () => {
      alive = false;
    };
  }, [open, report]);

  const chartData = React.useMemo(() => toChartData(report, rows), [report, rows]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6"
      aria-modal="true"
      role="dialog"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* panel */}
      <div className="relative z-10 w-full max-w-6xl rounded-xl bg-white shadow-xl">
        {/* header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{report.title}</h2>
            {report.description ? (
              <p className="mt-0.5 text-xs text-gray-600">{report.description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const headers = Object.keys(rows[0] ?? {});
                const csv = [
                  headers.join(','),
                  ...rows.map((r: any) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')),
                ].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                // ✅ use a safe filename from id or title (no slug field required)
                const name = fileSafe(report.id || report.title || 'report');
                a.download = `${name}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Download className="h-4 w-4" />
              Export to CSV
            </button>
            <button
              onClick={onClose}
              className="rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        {/* content */}
        <div className="px-4 pb-4 pt-3">
          <div className="mb-2 text-xs text-gray-600">Showing <b>{rows.length}</b> rows</div>

          <div className="h-[420px] w-full">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                No data to chart yet.
              </div>
            ) : /job history|position history/i.test(report.title) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="changes" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : /check|payroll|pay stub|tax/i.test(report.title) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="gross" fill="#0ea5e9" />
                  <Bar dataKey="net" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {/* stacked if dept analysis data is present; otherwise fallback to single value */}
                  <Bar dataKey="regular" stackId="a" fill="#0ea5e9" />
                  <Bar dataKey="overtime" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="bonus" stackId="a" fill="#22c55e" />
                  <Bar dataKey="value" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
