"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { PaginationBar } from "@/components/PaginationBar";

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
    sort?: string;
  };
  page?: number;
  pageSize?: number;
  totalCompanies?: number;
  totalPeople?: number;
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
  page = 1,
  pageSize = 50,
  totalCompanies,
  totalPeople,
}: DirectoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"spinouts" | "ecosystem" | "people">(
    (currentFilters.view as "spinouts" | "ecosystem" | "people") || "spinouts"
  );
  const [search, setSearch] = useState("");

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

  // Use server totals when paginating, fall back to current page counts
  const displayTotalCompanies = totalCompanies ?? companies.length;
  const displayTotalPeople = totalPeople ?? people.length;

  const filteredSpinouts = useMemo(() => {
    if (!search.trim()) return spinouts;
    const q = search.toLowerCase();
    return spinouts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.sector?.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [spinouts, search]);

  const filteredEcosystem = useMemo(() => {
    if (!search.trim()) return ecosystemOrgs;
    const q = search.toLowerCase();
    return ecosystemOrgs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [ecosystemOrgs, search]);

  const filteredPeople = useMemo(() => {
    if (!search.trim()) return people;
    const q = search.toLowerCase();
    return people.filter(
      (p) =>
        p.firstName?.toLowerCase().includes(q) ||
        p.lastName?.toLowerCase().includes(q) ||
        p.company?.name?.toLowerCase().includes(q) ||
        p.tags?.some((t: string) => t.toLowerCase().includes(q))
    );
  }, [people, search]);

  const switchTab = (tab: "spinouts" | "ecosystem" | "people") => {
    setActiveTab(tab);
    updateFilter("view", tab === "spinouts" ? null : tab);
  };

  const STAGE_COLORS: Record<string, string> = {
    "Pre-Seed": "bg-orange-100 text-orange-800",
    "Seed": "bg-yellow-100 text-yellow-800",
    "Early Stage": "bg-blue-100 text-blue-800",
    "Series A": "bg-indigo-100 text-indigo-800",
    "Series B": "bg-purple-100 text-purple-800",
    "Series C": "bg-violet-100 text-violet-800",
    "Growth": "bg-green-100 text-green-800",
    "Acquired": "bg-gray-200 text-gray-700",
    "Listed": "bg-emerald-100 text-emerald-800",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Companies</h1>
        <p className="text-gray-500 text-sm">
          {displayTotalCompanies} companies &middot; {displayTotalPeople} people
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-4 mb-6 text-sm border-b border-gray-200">
        <Link
          href={`/u/${university.slug}/feed`}
          className="text-gray-500 hover:text-gray-900 pb-3"
        >
          Activity Feed
        </Link>
        <button
          onClick={() => switchTab("spinouts")}
          className={`pb-3 -mb-px ${
            activeTab === "spinouts"
              ? "font-medium text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Spinouts ({spinouts.length})
        </button>
        <button
          onClick={() => switchTab("ecosystem")}
          className={`pb-3 -mb-px ${
            activeTab === "ecosystem"
              ? "font-medium text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Ecosystem ({ecosystemOrgs.length})
        </button>
        <button
          onClick={() => switchTab("people")}
          className={`pb-3 -mb-px ${
            activeTab === "people"
              ? "font-medium text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          People ({people.length})
        </button>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder={
                activeTab === "people"
                  ? "Search people, companies..."
                  : "Search companies, sectors, tags..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          {/* Sector filter — spinouts only */}
          {activeTab === "spinouts" && sectors.filter(s => s !== "Other").length > 0 && (
            <div className="md:w-48">
              <select
                value={currentFilters.sector || ""}
                onChange={(e) => updateFilter("sector", e.target.value || null)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All sectors</option>
                {sectors.filter(s => s !== "Other").map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
          {/* Tag filter */}
          <div className="md:w-48">
            <select
              value={currentFilters.tag || ""}
              onChange={(e) => updateFilter("tag", e.target.value || null)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          {/* Sort */}
          <div className="md:w-40">
            <select
              value={currentFilters.sort || "name"}
              onChange={(e) => updateFilter("sort", e.target.value === "name" ? null : e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="name">Name A–Z</option>
              <option value="newest">Newest first</option>
              <option value="stage">By stage</option>
            </select>
          </div>
          {/* New this week */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={currentFilters.newThisWeek || false}
                onChange={(e) => updateFilter("newThisWeek", e.target.checked ? "true" : null)}
                className="rounded"
              />
              New this week
            </label>
          </div>
        </div>
        {search && (
          <div className="mt-2 text-xs text-gray-500">
            {activeTab === "spinouts" && `${filteredSpinouts.length} of ${spinouts.length} companies on this page`}
            {activeTab === "ecosystem" && `${filteredEcosystem.length} of ${ecosystemOrgs.length} orgs on this page`}
            {activeTab === "people" && `${filteredPeople.length} of ${people.length} people on this page`}
          </div>
        )}
      </div>

      {/* Spinouts Tab */}
      {activeTab === "spinouts" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpinouts.map((company) => (
            <Link
              key={company.id}
              href={`/u/${university.slug}/companies/${company.slug}`}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 leading-tight">{company.name}</h3>
                {company.fundingStage && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ml-2 ${
                      STAGE_COLORS[company.fundingStage] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {company.fundingStage}
                  </span>
                )}
              </div>
              {company.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{company.description}</p>
              )}
              {company.sector && company.sector !== "Other" && (
                <div className="text-xs text-gray-400 mb-2">{company.sector}</div>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {company.tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
          {filteredSpinouts.length === 0 && (
            <div className="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No spinout companies match your filters.</p>
              {search && (
                <button onClick={() => setSearch("")} className="text-sm text-blue-600 mt-2 hover:underline">
                  Clear search
                </button>
              )}
            </div>
          )}
          {!search && (
            <PaginationBar
              page={page}
              total={displayTotalCompanies}
              pageSize={pageSize}
              baseUrl={`/u/${university.slug}/directory`}
              preserveParams={{
                tag: currentFilters.tag,
                sector: currentFilters.sector,
                segment: currentFilters.segment,
                newThisWeek: currentFilters.newThisWeek ? "true" : undefined,
                sort: currentFilters.sort,
              }}
            />
          )}
        </div>
      )}

      {/* Ecosystem Tab */}
      {activeTab === "ecosystem" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEcosystem.map((company) => (
            <Link
              key={company.id}
              href={`/u/${university.slug}/companies/${company.slug}`}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">{company.name}</h3>
              {company.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{company.description}</p>
              )}
              {company.segment && (
                <div className="text-xs text-gray-400 mb-2">{company.segment}</div>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {company.tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
          {filteredEcosystem.length === 0 && (
            <div className="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No ecosystem organisations match your filters.</p>
              {search && (
                <button onClick={() => setSearch("")} className="text-sm text-blue-600 mt-2 hover:underline">
                  Clear search
                </button>
              )}
            </div>
          )}
          {!search && (
            <PaginationBar
              page={page}
              total={displayTotalCompanies}
              pageSize={pageSize}
              baseUrl={`/u/${university.slug}/directory`}
              preserveParams={{
                tag: currentFilters.tag,
                sector: currentFilters.sector,
                segment: currentFilters.segment,
                newThisWeek: currentFilters.newThisWeek ? "true" : undefined,
                sort: currentFilters.sort,
                view: "ecosystem",
              }}
            />
          )}
        </div>
      )}

      {/* People Tab */}
      {activeTab === "people" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person: any) => (
            <Link
              key={person.id}
              href={`/u/${university.slug}/people/${person.slug}`}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-1">
                {person.firstName} {person.lastName}
              </h3>
              {person.company && (
                <p className="text-sm text-gray-500 mb-2">{person.company.name}</p>
              )}
              {!isPro && person.email && (
                <a
                  href="/pricing"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium hover:bg-blue-100 transition-colors mt-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Unlock with Pro →
                </a>
              )}
              {isPro && person.email && (
                <p className="text-sm text-gray-700">{person.email}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {person.tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
          {filteredPeople.length === 0 && (
            <div className="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No people match your filters.</p>
              {search && (
                <button onClick={() => setSearch("")} className="text-sm text-blue-600 mt-2 hover:underline">
                  Clear search
                </button>
              )}
            </div>
          )}
          {!search && (
            <PaginationBar
              page={page}
              total={displayTotalPeople}
              pageSize={pageSize}
              baseUrl={`/u/${university.slug}/directory`}
              preserveParams={{
                tag: currentFilters.tag,
                segment: currentFilters.segment,
                newThisWeek: currentFilters.newThisWeek ? "true" : undefined,
                sort: currentFilters.sort,
                view: "people",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
