// at the top of the file (or wherever Props/Col are declared)

// If you already have this type, keep it as-is.
export type Col = {
  key: string;
  label: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
};

// ✅ Add these two optional props
type Props = {
  title: string;
  reportId: string;
  customerId: string;
  start?: string;
  end?: string;
  columns: Col[];
  keyField?: string;
  pageSize?: number;

  // NEW — allow ReportModal to pass these without type errors
  filters?: Record<string, any>;
  hasFacsimile?: boolean;
};

// Make sure your component signature includes the new props (even if unused)
export default function GenericReportTable({
  title,
  reportId,
  customerId,
  start,
  end,
  columns,
  keyField,
  pageSize,

  // NEW — keep them to satisfy TS, you don't have to use them yet
  filters,
  hasFacsimile,
}: Props) {
  // ...existing code remains unchanged
}
