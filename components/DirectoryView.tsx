"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface Company {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  tags: string[];
  sector: string | null;
  fundingStage: string | null;
  isEcosystemOrg: boolean;
  website: string | null;
  segment: string | null;
  newThisWeek: boolean;
}

interface DirectoryViewProps {
  university: { id: string; slug: string; name: string };
  companies: Company[];
  people: any[];
  isPro: boolean;
  tags: string[];
  segments: string[];
  sectors: string[];
  currentFilters: {
    tag?: string;
    segment?: string;
    sector?: string;
    newThisWeek?: boolean;
    view?: string;
  };
}

export function DirectoryView({
  university,
  companies,
  people,
  isPro,
  tags,
  segments,
  sectors,
  currentFilters,
}: DirectoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"spinouts" | "ecosystem" | "people">(
    (currentFilters.view as "spinouts" | "ecosystem" | "people") || "spinouts"
  );

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/u/${university.slug}/directory?${params.toString()}`);
  };

  const spinouts = companies.filter((c) => !c.isEcosystemOrg);
  const ecosystemOrgs = companies.filter((c) => c.isEcosystemOrg);

  const switchTab = (tab: "spinouts" | "ecosystem" | "people") => {
    setActiveTab(tab);
    updateFilter("view", tab === "spinouts" ? null : tab);
  };

  const STAGE_COLORS: Record<string, string> = {
    "Early Stage": "bg-yellow-100 text-yellow-800",
    Growth: "bg-green-100 text-green-800",
    Acquired: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
        </div>
        <p className="text-gray-600">
          {spinouts.length} spinout companies, {ecosystemOrgs.length} ecosystem orgs, {people.length} people
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mb-6 text-sm">
        <Link
          href={`/u/${university.slug}/feed`}
          className="text-gray-500 hover:text-gray-900 pb-1"
        >
          Activity Feed
        </Link>
        <button
          onClick={() => switchTab("spinouts")}
          className={`pb-1 ${
            activeTab === "spinouts"
              ? "font-medium text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Spinouts ({spinouts.length})
        </button>
        <button
          onClick={() => switchTab("ecosystem")}
          className={`pb-1 ${
            activeTab === "ecosystem"
              ? "font-medium text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Ecosystem ({ecosystemOrgs.length})
        </button>
        <button
          onClick={() => switchTab("people")}
          className={`pb-1 ${
            activeTab === "people"
              ? "font-medium text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          People ({people.length})
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          {activeTab === "spinouts" && sectors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
              <select
                value={currentFilters.sector || ""}
                onChange={(e) => updateFilter("sector", e.target.value || null)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All sectors</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
            <select
              value={currentFilters.tag || ""}
              onChange={(e) => updateFilter("tag", e.target.value || null)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Segment</label>
            <select
              value={currentFilters.segment || ""}
              onChange={(e) => updateFilter("segment", e.target.value || null)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All segments</option>
              {segments.map((seg) => (
                <option key={seg} value={seg}>{seg}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={currentFilters.newThisWeek || false}
                onChange={(e) => updateFilter("newThisWeek", e.target.checked ? "true" : null)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">New this week</span>
            </label>
          </div>
        </div>
      </div>

      {/* Spinouts Tab */}
      {activeTab === "spinouts" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spinouts.map((company) => (
            <Link
              key={company.id}
              href={`/u/${university.slug}/companies/${company.slug}`}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{company.name}</h3>
                {company.fundingStage && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ml-2 ${
                      STAGE_COLORS[company.fundingStage] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {company.fundingStage}
                  </span>
                )}
              </div>
              {company.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{company.description}</p>
              )}
              {company.sector && (
                <div className="text-xs text-gray-500 mb-2">{company.sector}</div>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {company.tags.slice(0, 4).map((tag: string) => (
                  <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
          {spinouts.length === 0 && (
            <div className="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No spinout companies match your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Ecosystem Tab */}
      {activeTab === "ecosystem" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ecosystemOrgs.map((company) => (
            <Link
              key={company.id}
              href={`/u/${university.slug}/companies/${company.slug}`}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-gray-900 mb-2">{company.name}</h3>
              {company.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{company.description}</p>
              )}
              {company.segment && (
                <div className="text-xs text-gray-500 mb-2">{company.segment}</div>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {company.tags.slice(0, 4).map((tag: string) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
          {ecosystemOrgs.length === 0 && (
            <div className="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No ecosystem organisations match your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* People Tab */}
      {activeTab === "people" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person: any) => (
            <Link
              key={person.id}
              href={`/u/${university.slug}/people/${person.slug}`}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-gray-900 mb-1">
                {person.firstName} {person.lastName}
              </h3>
              {person.company && (
                <p className="text-sm text-gray-600 mb-2">{person.company.name}</p>
              )}
              {!isPro && person.email && (
                <p className="text-xs text-gray-500">Email available with Pro</p>
              )}
              {isPro && person.email && (
                <p className="text-sm text-gray-700">{person.email}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {person.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
          {people.length === 0 && (
            <div className="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No people match your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
