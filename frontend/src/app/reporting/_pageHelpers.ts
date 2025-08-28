// src/app/reporting/_pageHelpers.ts
export type SP = Promise<Record<string, string | string[]>>;

export function parseParams(
  spRec: Record<string, string | string[]>,
  defCustomer = "DEMO"
) {
  const get = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);
  return {
    start: get(spRec.start),
    end: get(spRec.end),
    customerId:
      get(spRec.customerId) ??
      process.env.NEXT_PUBLIC_DEMO_CUSTOMER_ID ??
      defCustomer,
  };
}
