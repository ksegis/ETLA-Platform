'use client';
import { useEffect, useState } from 'react';

type Col = { key: string; label: string; align?: 'left'|'right'|'center' };
type Row = Record<string, any>;

export default function GenericReportTable({
  title, reportId, customerId, start, end, columns,
}: {
  title: string;
  reportId: string;
  customerId: string;
  start?: string;
  end?: string;
  columns: Col[];
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const qs = new URLSearchParams({ customerId });
        if (start) qs.set('start', start);
        if (end)   qs.set('end', end);
        const res = await fetch(`/api/reports/${reportId}/preview?${qs}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (e:any) {
        setErr(e?.message ?? 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [reportId, customerId, start, end]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!rows.length) return <div className="p-6">No rows.</div>;

  const qs = new URLSearchParams({ customerId });
  if (start) qs.set('start', start);
  if (end)   qs.set('end', end);

  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <a href={`/api/reports/${reportId}/export?${qs}`} className="rounded px-3 py-1.5 border">
          Export CSV
        </a>
      </div>

      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`border p-2 text-${c.align ?? 'left'}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? `row-${i}`}>
              {columns.map((c) => (
                <td key={c.key} className={`border p-2 text-${c.align ?? 'left'}`}>
                  {r[c.key] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
