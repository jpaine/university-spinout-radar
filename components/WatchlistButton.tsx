"use client";

import { useState, useEffect } from "react";

interface WatchlistButtonProps {
  companyId: string;
  compact?: boolean;
  initialWatched?: boolean;
}

export function WatchlistButton({ companyId, compact = false, initialWatched }: WatchlistButtonProps) {
  const [watching, setWatching] = useState(initialWatched ?? false);
  const [loading, setLoading] = useState(initialWatched === undefined);

  useEffect(() => {
    if (initialWatched !== undefined) return;
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((items: { companyId: string }[]) => {
        setWatching(items.some((i) => i.companyId === companyId));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [companyId, initialWatched]);

  const toggle = async () => {
    setLoading(true);
    try {
      if (watching) {
        await fetch(`/api/watchlist?companyId=${companyId}`, { method: "DELETE" });
        setWatching(false);
      } else {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId }),
        });
        setWatching(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={(e) => { e.preventDefault(); toggle(); }}
        disabled={loading}
        title={watching ? "Unwatch" : "Watch this company"}
        className={`p-1.5 rounded-md transition-colors ${
          watching
            ? "text-yellow-500 hover:text-yellow-600"
            : "text-gray-400 hover:text-gray-600"
        } disabled:opacity-50`}
      >
        {watching ? "★" : "☆"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        watching
          ? "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
      } disabled:opacity-50`}
    >
      {watching ? "★ Watching" : "☆ Watch"}
    </button>
  );
}
