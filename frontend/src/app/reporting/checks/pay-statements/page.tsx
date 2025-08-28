'use client';

import { useEffect, useState } from 'react';

type Row = {
  id: string; checkNumber: string; employeeId: string; employeeName: string;
  payDate: string; payPeriodStart: string; payPeriodEnd: string; netPay: number;
  depositLast4?: string | null;
};

export default function PayStatementsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const sp = new URLSearchParams(window.location.search);
        const qs = new URLSearchParams();
        const start = sp.get('start'); const end = sp.get('end');
        if (start) qs.set('start', start);
        if (end) qs.set('end', end);

        const res = await fetch(`/api/reports/checks/pay-statements/preview?${qs.toString()}`, {
          cache: 'no-store', credentials: 'include'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.message ?? 'Failed to load pay statements');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!rows.length) return <div className="p-6">No pay statements found.</div>;

  const linkQs = new URLSearchParams(window.location.search);

  return (
    <main className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Pay Statements</h1>
        <a
          href={`/api/reports/checks/pay-statements/export?${linkQs.toString()}`}
          className="rounded px-3 py-1.5 border hover:bg-gray-50"
        >
          Export CSV
        </a>
      </div>
      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border p-2 text-left">Check #</th>
            <th className="border p-2 text-left">Employee</th>
            <th className="border p-2 text-left">Pay Date</th>
            <th className="border p-2 text-left">Period</th>
            <th className="border p-2 text-right">Net Pay</th>
            <th className="border p-2 text-left">Acct Last4</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? r.checkNumber ?? `row-${i}`}>
              <td className="border p-2">{r.checkNumber}</td>
              <td className="border p-2">{r.employeeName}</td>
              <td className="border p-2">{r.payDate}</td>
              <td className="border p-2">{r.payPeriodStart} → {r.payPeriodEnd}</td>
              <td className="border p-2 text-right">{r.netPay}</td>
              <td className="border p-2">{r.depositLast4 ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
