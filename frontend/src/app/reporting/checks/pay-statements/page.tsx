import PayStatementsTable from "@/features/reports/checks/PayStatements/PayStatementsTable";

// Next 15 passes `searchParams` as a Promise on server pages.
type SP = Promise<Record<string, string | string[]>>;

export default async function PayStatementsPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;
  const start = Array.isArray(sp.start) ? sp.start[0] : sp.start;
  const end   = Array.isArray(sp.end) ? sp.end[0] : sp.end;

  return <PayStatementsTable start={start} end={end} />;
}
