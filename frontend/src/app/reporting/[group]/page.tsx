import React from "react";
import type { GroupKey } from "../_data";
import ClientGroupPage from "./ClientGroupPage";

export default async function GroupReportsPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const g = (group as GroupKey) ?? "employee";
  return <ClientGroupPage group={g} />;
}
