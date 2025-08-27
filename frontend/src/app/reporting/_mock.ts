import type { Report } from "./_data";
import { getReportById } from "./_data";
import { getDemoRows } from "./_mock_demographics";

// Generic dictionary type
export type Dict<T = any> = Record<string, T>;

/**
 * Returns mock rows for a report id.
 * Accepts (id), or (id, filters, limit) for API route compatibility.
 */
export async function getMockRows(
  id: string,
  filters: Dict = {},
  limit = 50
): Promise<Dict[]> {
  // If it's one of our demographic reports, delegate.
  const rpt = getReportById(id) as Report | undefined;
  if (rpt && rpt.group === "employee") {
    return getDemoRows(id, limit);
  }

  // Fallback: empty set rather than leaking check columns everywhere.
  return [];
}
