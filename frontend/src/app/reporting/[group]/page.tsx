import ClientGroupPage from "./ClientGroupPage";
import type { GroupKey } from "../_data";

// Next.js 15: `params` is a Promise and there is no exported PageProps type.
// Type inline and await it.
export default async function GroupPage(
  { params }: { params: Promise<{ group: string }> }
) {
  const { group } = await params;
  return <ClientGroupPage params={{ group: group as GroupKey }} />;
}
