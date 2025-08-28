'use client';

import { useEffect, useState } from 'react';

type Row = {
  id?: string;
  checkNumber?: string;
  employeeId?: string;
  employeeName?: string;
  payDate?: string;
  payPeriodStart?: string;
  payPeriodEnd?: string;
  netPay?: number;
  depositLast4?: string;
};

export default function DebugPayStatements() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/reports/checks/pay-statements/preview', { cache: 'no-store' });
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!rows.length) return <div className="p-6">No rows returned.</div>;

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Pay Statements (mock)</h1>
      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-left">Check #</th>
            <th className="border p-2 text-left">Employee</th>
            <th className="border p-2 text-left">Pay Date</th>
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
              <td className="border p-2 text-right">{r.netPay}</td>
              <td className="border p-2">{r.depositLast4}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
