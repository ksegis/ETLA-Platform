'use client';

import * as React from 'react';
import { Dialog } from '@headlessui/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Download } from 'lucide-react';
import { buildReportRows, type ReportType } from '../_data'; // whatever helper you already use for demo/filters

type Props = {
  open: boolean;
  report: ReportType;
  onClose: () => void;
};

// safe number coercion
const n = (v: unknown) => (typeof v === 'number' ? v : Number(v ?? 0)) || 0;

// Build a small set of chart points from the same rows the table is showing.
// We keep this very defensive so it works across datasets.
function toChartData(report: ReportType, rows: any[]) {
  if (!rows?.length) return [];

  // Department Analysis — totals by department
  if (/department/i.test(report.title)) {
    const map = new Map<string, { name: string; regular: number; overtime: number; bonus: number }>();

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

  // Job / Position History — simple change counts by month/period
  if (/job history|position history/i.test(report.title)) {
    const map = new Map<string, { name: string; changes: number }>();

    rows.forEach((r) => {
      const period = String(r.PERIODLABEL ?? r.periodlabel ?? r.PERIODSTART ?? '').slice(0, 7) || 'Unknown';
      const curr = map.get(period) ?? { name: period, changes: 0 };
      curr.changes += 1;
      map.set(period, curr);
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  // Checks / payroll-like reports — simple gross/net by employee
  if (/check|payroll|tax/i.test(report.title)) {
    return rows.slice(0, 20).map((r: any) => ({
      name: String(r.EMPLOYEENAME ?? r.name ?? r.EMPLOYEEID ?? '—'),
      gross: n(r.GROSS ?? r.gross),
      net: n(r.NETPAY ?? r.net ?? r.netpay),
    }));
  }

  // Default: a tiny bar using the first numeric column we can find
  const keys = Object.keys(rows[0] ?? {});
  const firstNumKey = keys.find((k) => typeof rows[0]?.[k] === 'number');
  return rows.slice(0, 20).map((r, i) => ({
    name: String(r.DEPARTMENT ?? r.EMPLOYEENAME ?? `Row ${i + 1}`),
    value: n(firstNumKey ? r[firstNumKey] : 0),
  }));
}

export default function PreviewModal({ open, report, onClose }: Props) {
  // IMPORTANT: build the same rows the table is using (demo toggle + filters are handled inside buildReportRows)
  const [rows, setRows] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      const data = await buildReportRows(report); // your existing sync/async helper
      if (alive) setRows(data ?? []);
    })();
    return () => {
      alive = false;
    };
  }, [open, report]);

  const chartData = React.useMemo(() => toChartData(report, rows), [report, rows]);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-start justify-center p-4 sm:p-6">
        <Dialog.Panel className="w-full max-w-6xl rounded-xl bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-gray-900">{report.title}</Dialog.Title>
            <button
              onClick={() => {/* hook up export-to-excel here if you want */}}
              className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </button>
          </div>

          {/* Toggle */}
          <div className="mb-2 flex items-center gap-2 text-sm">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">Chart</span>
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
                  <Line type="monotone" dataKey="changes" stroke="#8884d8" strokeWidth={2} dot={false} />
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
                  <Bar dataKey="regular" stackId="a" fill="#0ea5e9" />
                  <Bar dataKey="overtime" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="bonus" stackId="a" fill="#22c55e" />
                  {/* fallback single-series */}
                  <Bar dataKey="value" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
