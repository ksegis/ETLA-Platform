import { NextResponse } from "next/server";
import { getDirectDepositRegisterMock } from "@/mocks/directDepositRegister.mock";
// import { fetchDirectDepositRegister } from "@/lib/data-sources/directDepositRegister";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start") ?? undefined;
  const end   = searchParams.get("end")   ?? undefined;

  let rows: ReturnType<typeof getDirectDepositRegisterMock> = [];
  try {
    // rows = await fetchDirectDepositRegister({ start, end });
    rows = [];
  } catch {
    rows = [];
  }

  const demoFlag = (process.env.DEMO_MOCKS ?? process.env.NEXT_PUBLIC_DEMO_MOCKS ?? "")
    .toString()
    .toLowerCase();

  if (demoFlag === "on" || rows.length === 0) rows = getDirectDepositRegisterMock();
  return NextResponse.json(rows);
}
