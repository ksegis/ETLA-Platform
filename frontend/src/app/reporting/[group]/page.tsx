// frontend/src/app/reporting/[group]/page.tsx
import ClientGroupPage from "./ClientGroupPage";

export default function GroupPage({
  params,
}: {
  params: { group: string };
}) {
  // Just forward the route params as-is to the client component
  return <ClientGroupPage params={params} />;
}
