"use client";

import { useState } from "react";
import Link from "next/link";
import { DEFAULT_UNIVERSITY_SLUG } from "@/lib/university";

export function ProSuccessBanner({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(show);

  if (!visible) return null;

  const u = DEFAULT_UNIVERSITY_SLUG;

  return (
    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="font-semibold text-green-900 mb-1">
          🎉 Welcome to Pro! You now have access to founder emails, the quarterly workflow, and deal alerts.
        </p>
        <div className="flex flex-wrap gap-3 mt-2">
          <Link
            href={`/u/${u}/directory?view=people`}
            className="text-sm bg-green-700 text-white px-3 py-1.5 rounded-md hover:bg-green-800 transition-colors"
          >
            Explore the directory →
          </Link>
          <Link
            href={`/u/${u}/quarterly`}
            className="text-sm text-green-700 hover:text-green-900 underline self-center"
          >
            Open quarterly workflow →
          </Link>
        </div>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-green-500 hover:text-green-700 text-xl leading-none shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
