"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Technology {
  id: string;
  title: string;
  summary: string | null;
  sector: string | null;
  tags: string[];
  status: string;
  sourceUrl: string | null;
  ouiRef: string | null;
  publishedAt: Date | null;
}

interface TechnologiesViewProps {
  university: { id: string; slug: string; name: string };
  technologies: Technology[];
  allSectors: string[];
  allStatuses: string[];
  allTags: string[];
  currentFilters: {
    sector?: string;
    status?: string;
    tag?: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  licensed: "bg-blue-100 text-blue-800",
  spinout_formed: "bg-purple-100 text-purple-800",
};

const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  licensed: "Licensed",
  spinout_formed: "Spinout Formed",
};

export function TechnologiesView({
  university,
  technologies,
  allSectors,
  allStatuses,
  allTags,
  currentFilters,
}: TechnologiesViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/u/${university.slug}/technologies?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">IP Pipeline</h1>
        <p className="text-gray-600">
          {technologies.length} technologies available for licensing — the earliest deal signal from Oxford labs.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mb-6 text-sm">
        <Link href={`/u/${university.slug}/feed`} className="text-gray-500 hover:text-gray-900 pb-1">
          Activity Feed
        </Link>
        <Link href={`/u/${university.slug}/directory`} className="text-gray-500 hover:text-gray-900 pb-1">
          Companies
        </Link>
        <span className="font-medium text-gray-900 border-b-2 border-gray-900 pb-1">
          IP Pipeline ({technologies.length})
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          {allSectors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
              <select
                value={currentFilters.sector || ""}
                onChange={(e) => updateFilter("sector", e.target.value || null)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All sectors</option>
                {allSectors.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
          {allStatuses.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={currentFilters.status || ""}
                onChange={(e) => updateFilter("status", e.target.value || null)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All statuses</option>
                {allStatuses.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                ))}
              </select>
            </div>
          )}
          {allTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
              <select
                value={currentFilters.tag || ""}
                onChange={(e) => updateFilter("tag", e.target.value || null)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Technology Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technologies.map((tech) => (
          <div key={tech.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2">{tech.title}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${
                  STATUS_COLORS[tech.status] ?? "bg-gray-100 text-gray-800"
                }`}
              >
                {STATUS_LABELS[tech.status] ?? tech.status}
              </span>
            </div>
            {tech.summary && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{tech.summary}</p>
            )}
            {tech.sector && (
              <div className="text-xs text-gray-500 mb-2">{tech.sector}</div>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tech.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
            {tech.ouiRef && (
              <div className="text-xs text-gray-400 mt-2">OUI Ref: {tech.ouiRef}</div>
            )}
            {tech.sourceUrl && (
              <a
                href={tech.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline mt-1 block"
                onClick={(e) => e.stopPropagation()}
              >
                View on OUI →
              </a>
            )}
          </div>
        ))}
        {technologies.length === 0 && (
          <div className="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500">No technologies match your filters.</p>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>About this pipeline:</strong> These are technologies available for licensing from Oxford University Innovation (OUI) —
          pre-company IP representing the earliest investment signal. Companies have not yet been formed around this IP.
          Source: <a href="https://innovation.ox.ac.uk/technologies-available/" target="_blank" rel="noopener noreferrer" className="underline">OUI Technology Licensing</a>
        </p>
      </div>
    </div>
  );
}
