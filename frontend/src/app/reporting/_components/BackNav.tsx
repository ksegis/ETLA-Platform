"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Props = {
  /** Label for the crumb link (default "All Reports") */
  label?: string;
  /** Href for the crumb link (default "/reporting") */
  href?: string;
};

export default function BackNav({ label = "All Reports", href = "/reporting" }: Props) {
  const router = useRouter();

  return (
    <div className="mb-4 flex items-center gap-3">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back
      </button>

      <span className="text-gray-300">/</span>

      <Link
        href={href}
        className="text-sm text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline"
      >
        {label}
      </Link>
    </div>
  );
}
