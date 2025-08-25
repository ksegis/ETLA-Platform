// Server wrapper for the client page, typed for Next.js 15 PageProps where params is a Promise.

import ClientGroupPage from "./ClientGroupPage";
import type { GroupKey } from "../_data";
import type { PageProps } from "next";

export default async function GroupPage(
  { params }: PageProps<{ group: string }>
) {
  const { group } = await params; // Next 15: params is a Promise
  return <ClientGroupPage params={{ group: group as GroupKey }} />;
}
