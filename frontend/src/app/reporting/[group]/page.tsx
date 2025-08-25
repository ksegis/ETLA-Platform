// Server wrapper (no state/hooks here); passes params into the client page.

import ClientGroupPage from "./ClientGroupPage";
import type { GroupKey } from "../_data";

export default function GroupPage({ params }: { params: { group: string } }) {
  return <ClientGroupPage params={{ group: params.group as GroupKey }} />;
}
