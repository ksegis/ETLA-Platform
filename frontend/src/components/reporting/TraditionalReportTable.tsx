"use client";
type Col = { key: string; label: string };
type Props = { columns: Col[]; rows: Record<string, any>[] };

export default function TraditionalReportTable({ columns, rows }: Props) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>{columns.map(c => (<th key={c.key} className="border px-2 py-1 text-left">{c.label}</th>))}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {columns.map(c => (<td key={c.key} className="border px-2 py-1">{String(r[c.key] ?? "")}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

