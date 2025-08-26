// frontend/src/app/reporting/_components/PaystubModal.tsx
// Simple modal wrapper that renders PayStatement with the selected row.

import React from "react";
import PayStatement from "./forms/PayStatement";

export default function PaystubModal({
  open,
  row,
  onClose,
}: {
  open: boolean;
  row: any;
  onClose: () => void;
}) {
  if (!open) return null;

  // If the row is just the summary line, you can enrich here if needed.
  const data = row ?? {};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="relative max-h-[90vh] overflow-auto rounded-xl bg-white p-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md border px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
          aria-label="Close"
        >
          Close
        </button>

        <PayStatement data={data} />
      </div>
    </div>
  );
}
