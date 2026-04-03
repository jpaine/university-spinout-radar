"use client";

import Link from "next/link";

interface FeedItem {
  id: string;
  type: string;
  title: string;
  summary: string | null;
  sourceUrl: string | null;
  publishedAt: string | Date;
  company: { name: string; slug: string } | null;
}

interface FeedViewProps {
  university: { slug: string; name: string };
  feedItems: FeedItem[];
  stats: { totalSpinouts: number; recentSpinouts: number };
}

const TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  new_spinout: { label: "New Spinout", color: "bg-green-100 text-green-800", icon: "🚀" },
  funding_round: { label: "Funding", color: "bg-blue-100 text-blue-800", icon: "💰" },
  event: { label: "Event", color: "bg-purple-100 text-purple-800", icon: "📅" },
  news: { label: "News", color: "bg-gray-100 text-gray-800", icon: "📰" },
  new_person: { label: "New Person", color: "bg-yellow-100 text-yellow-800", icon: "👤" },
};

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function FeedView({ university, feedItems, stats }: FeedViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Oxford Deal Flow</h1>
        <p className="text-gray-600">
          Latest spinout activity, funding rounds, and ecosystem news from {university.name}.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.totalSpinouts}</div>
          <div className="text-sm text-gray-500">Active Spinouts</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{stats.recentSpinouts}</div>
          <div className="text-sm text-gray-500">New This Month</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {feedItems.filter((i) => i.type === "funding_round").length}
          </div>
          <div className="text-sm text-gray-500">Funding Events</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {feedItems.filter((i) => i.type === "event").length}
          </div>
          <div className="text-sm text-gray-500">Events</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mb-6 text-sm border-b border-gray-200">
        <Link
          href={`/u/${university.slug}/feed`}
          className="font-medium text-gray-900 border-b-2 border-gray-900 pb-3 -mb-px"
        >
          Activity Feed
        </Link>
        <Link
          href={`/u/${university.slug}/directory`}
          className="text-gray-500 hover:text-gray-900 pb-3"
        >
          Companies
        </Link>
        <Link
          href={`/u/${university.slug}/technologies`}
          className="text-gray-500 hover:text-gray-900 pb-3"
        >
          IP Pipeline
        </Link>
      </div>

      {/* Feed */}
      {feedItems.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">No activity yet. Run the import script to seed the feed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedItems.map((item) => {
            const typeInfo = TYPE_LABELS[item.type] || TYPE_LABELS.news;
            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{typeInfo.icon}</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}
                      >
                        {typeInfo.label}
                      </span>
                      {item.company && (
                        <Link
                          href={`/u/${university.slug}/companies/${item.company.slug}`}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {item.company.name}
                        </Link>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {item.sourceUrl ? (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600"
                        >
                          {item.title}
                        </a>
                      ) : (
                        item.title
                      )}
                    </h3>
                    {item.summary && (
                      <p className="text-sm text-gray-600 line-clamp-2">{item.summary}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-gray-500">{timeAgo(item.publishedAt)}</div>
                    <div className="text-xs text-gray-400">{formatDate(item.publishedAt)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
