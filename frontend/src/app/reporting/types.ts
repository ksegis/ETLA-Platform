export type GroupKey = "employee" | "checks" | "jobs" | "salary" | "timecards";

export type ColumnDef = { key: string; label: string; type?: "text"|"number"|"date"|"money" };

export type Report = {
  id: string;                  // stable id used in routes
  title: string;
  description?: string;
  group: GroupKey;
  slug?: string;               // optional, used for filenames/links
  category?: string;           // optional metadata
  fields?: string;             // short description (columns count, etc.)
  approxRows?: number;         // used in tables
  docBased?: boolean;          // if the preview shows 1..N documents
  procedure?: string;          // server-side SP name if used
  columns?: ColumnDef[];       // canonical column list for preview/export
};
