"use client";

import Link from "next/link";

interface PaginationBarProps {
  page: number;
  total: number;
  pageSize: number;
  baseUrl: string;
  preserveParams: Record<string, string | undefined>;
}

export function PaginationBar({
  page,
  total,
  pageSize,
  baseUrl,
  preserveParams,
}: PaginationBarProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const buildUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    Object.entries(preserveParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (targetPage > 1) {
      params.set("page", String(targetPage));
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  };

  return (
    <div className="flex items-center justify-center gap-3 mt-8 col-span-full">
      {page > 1 ? (
        <Link
          href={buildUrl(page - 1)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
        >
          ← Prev
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed">
          ← Prev
        </span>
      )}
      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
        <span className="text-gray-400 ml-1">({total} total)</span>
      </span>
      {page < totalPages ? (
        <Link
          href={buildUrl(page + 1)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
        >
          Next →
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed">
          Next →
        </span>
      )}
    </div>
  );
}
