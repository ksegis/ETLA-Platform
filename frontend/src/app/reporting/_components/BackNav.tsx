"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  href?: string;        // where “Back” should go
  label?: string;       // text next to the arrow
  className?: string;
};

export default function BackNav({
  href = "/",
  label = "Back to app",
  className = "",
}: Props) {
  return (
    <div className={`mb-4 ${className}`}>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    </div>
  );
}
