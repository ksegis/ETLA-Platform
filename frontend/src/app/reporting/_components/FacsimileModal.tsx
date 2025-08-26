// frontend/src/app/reporting/_components/FacsimileModal.tsx
// Single modal that renders the correct facsimile form (paystub, timecard, W-2)
// based on `kind`. It's deliberately forgiving with props to avoid build/runtime churn.

"use client";

import React from "react";

// Your existing forms:
import PayStatement from "./forms/PayStatement";
import TimecardForm from "./forms/TimecardForm";
import W2Form from "./forms/W2Form";

type FacsimileKind = "paystub" | "timecard" | "w2";

export default function FacsimileModal({
  open,
  kind,
  data,
  onClose,
  title,
}: {
  open: boolean;
  kind: FacsimileKind;
  data: any;
  onClose: () => void;
  title?: string;
}) {
  if (!open) return null;

  // Be very permissive with props so existing components keep working.
  const commonProps = { data, row: data, record: data };

  const Body = (() => {
    switch (kind) {
      case "paystub":
        return <PayStatement {...commonProps} />;
      case "timecard":
        // @ts-ignore
        return <TimecardForm {...commonProps} />;
      case "w2":
        // @ts-ignore
        return <W2Form {...commonProps} />;
      default:
        return null;
    }
  })();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="relative max-h-[92vh] w-[1000px] max-w-[96vw] overflow-auto rounded-xl bg-white p-4 shadow-2xl">
        <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 flex items-center justify-between border-b bg-white/95 px-4 py-3">
          <div className="text-base font-semibold">
            {title ?? (kind === "paystub" ? "Pay Statement" : kind === "timecard" ? "Timecard" : "W-2")}
          </div>
          <div className="space-x-2">
            <button
              onClick={() => window.print()}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        {Body}
      </div>
    </div>
  );
}
