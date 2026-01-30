"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";

export default function HomeButton() {
  const pathname = usePathname();
  if (pathname === "/dashboard") return null;

  return (
    <Link
      href="/dashboard"
      className="fixed z-50 bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-black/30 backdrop-blur transition hover:bg-black/80"
      aria-label="Go to dashboard"
    >
      <LayoutGrid className="h-4 w-4" />
      Dashboard
    </Link>
  );
}
