// frontend/src/app/reporting/[group]/page.tsx
import ClientGroupPage from "./ClientGroupPage";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const p = await params; // ✅ your PageProps expects params as a Promise
  return <ClientGroupPage params={p} />;
}
