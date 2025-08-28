export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getCheckRegisterMock } from "@/mocks/checkRegister.mock";
// import { fetchCheckRegister } from "@/lib/data-sources/checkRegister";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start") ?? undefined;
  const end   = searchParams.get("end")   ?? undefined;

  let rows: ReturnType<typeof getCheckRegisterMock> = [];
  try {
    // rows = await fetchCheckRegister({ start, end });
    rows = [];
  } catch {
    rows = [];
  }

  const demoFlag = (process.env.DEMO_MOCKS ?? process.env.NEXT_PUBLIC_DEMO_MOCKS ?? "")
    .toString()
    .toLowerCase();

  if (demoFlag === "on" || rows.length === 0) rows = getCheckRegisterMock();
  return NextResponse.json(rows);
}
