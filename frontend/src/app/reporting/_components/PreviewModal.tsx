'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { Download } from 'lucide-react';
import type { ReportType } from '../_data';

// -------- utilities --------
const n = (v: unknown) => (typeof v === 'number' ? v : Number(v ?? 0)) || 0;

// Build chart points from the same rows the table would show
function toChartData(report: ReportType, rows: any[]) {
  if (!rows?.length) return [];

  // Department Analysis — totals by department
  if (/department/i.test(report.title)) {
    const map = new Map<
      string,
      { name: string; regular: number; overtime: number; bonus: number }
    >();

    rows.forEach((r) => {
      const dep = String(r.DEPARTMENT ?? r.department ?? 'Unknown');
      const reg = n(r.REGULARPAY ?? r.regularpay);
      const ot = n(r.OTPAY ?? r.overtime);
      const bn = n(r.BONUS ?? r.bonus);
      const curr = map.get(dep) ?? { name: dep, regular: 0, overtime: 0, bonus: 0 };
      curr.regular += reg;
      curr.overtime += ot;
      curr.bonus += bn;
      map.set(dep, curr);
    });

    return Array.from(map.values());
  }

  // Job/Position history — count changes by period (month label or start date)
  if (/job history|position history/i.test(report.title)) {
    const map = new Map<string, { name: string; changes: number }>();
    rows.forEach((r) => {
      const period =
        String(r.PERIODLABEL ?? r.periodlabel ?? r.PERIODSTART ?? r.periodstart ?? '')
          .slice(0, 7) || 'Unknown';
      const curr = map.get(period) ?? { name: period, changes: 0 };
      curr.changes += 1;
      map.set(period, curr);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  // Check / payroll type — show gross vs net by employee
  if (/check|payroll|tax/i.test(report.title)) {
    return rows.slice(0, 20).map((r: any) => ({
      name: String(r.EMPLOYEENAME ?? r.name ?? r.EMPLOYEEID ?? '—'),
      gross: n(r.GROSS ?? r.gross),
      net: n(r.NETPAY ?? r.net ?? r.netpay),
    }));
  }

  // Fallback: first numeric column
  const keys = Object.keys(rows[0] ?? {});
  const firstNumKey = keys.find((k) => typeof rows[0]?.[k] === 'number');
  return rows.slice(0, 20).map((r, i) => ({
    name: String(r.DEPARTMENT ?? r.EMPLOYEENAME ?? `Row ${i + 1}`),
    value: n(firstNumKey ? r[firstNumKey] : 0),
  }));
}

// Try to get the same rows used by the table without depending on internal helpers
async function resolveRows(report: ReportType): Promise<any[]> {
  const r: any = report;

  // Common shapes we’ve seen in the app so far:
  // - report.buildRows(filters)
  // - report.fetchRows(filters)
  // - report.rows / report.data (arrays)
  try {
    if (typeof r.buildRows === 'function') return await r.buildRows({});
    if (typeof r.fetchRows === 'function') return await r.fetchRows({});
    if (Array.isArray(r.rows)) return r.rows as any[];
    if (Array.isArray(r.data)) return r.data as any[];
  } catch {
    // ignore, fall through to empty
  }
  return [];
}

// -------- component --------
type Props = {
  open: boolean;
  report: ReportType;
  onClose: () => void;
};

export default function PreviewModal({ open, report, onClose }: Props) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
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

  // fetch rows when opened / report changes
  React.useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      const data = await resolveRows(report);
      if (alive) setRows(data ?? []);
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
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-6xl rounded-xl bg-white shadow-xl"
      >
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
                // quick CSV export of the visible rows
                const headers = Object.keys(rows[0] ?? {});
                const csv = [
                  headers.join(','),
                  ...rows.map((r: any) =>
                    headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')
                  ),
                ].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${report.slug ?? report.title}.csv`;
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
          <div className="mb-2 flex items-center gap-2 text-sm">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
              Chart
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">Table</span>
          </div>

          <div className="h-[420px] w-full">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                No data to chart yet.
              </div>
            ) : /job history|position history/i.test(report.title) ? (
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="changes" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : /check|payroll|tax/i.test(report.title) ? (
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="gross" fill="#0ea5e9" />
                  <Bar dataKey="net" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {/* will render only the keys that exist in the data */}
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
