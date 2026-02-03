"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface DirectoryViewProps {
  university: { id: string; slug: string; name: string };
  companies: any[];
  people: any[];
  isPro: boolean;
  tags: string[];
  segments: string[];
  currentFilters: {
    tag?: string;
    segment?: string;
    newThisWeek?: boolean;
  };
}

export function DirectoryView({
  university,
  companies,
  people,
  isPro,
  tags,
  segments,
  currentFilters,
}: DirectoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/u/${university.slug}/directory?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {university.name} Directory
        </h1>
        <p className="text-gray-600">
          {companies.length} companies, {people.length} people
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag
            </label>
            <select
              value={currentFilters.tag || ""}
              onChange={(e) => updateFilter("tag", e.target.value || null)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Segment
            </label>
            <select
              value={currentFilters.segment || ""}
              onChange={(e) => updateFilter("segment", e.target.value || null)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All segments</option>
              {segments.map((seg) => (
                <option key={seg} value={seg}>
                  {seg}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={currentFilters.newThisWeek || false}
                onChange={(e) =>
                  updateFilter("newThisWeek", e.target.checked ? "true" : null)
                }
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                New this week
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Companies */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Companies</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/u/${university.slug}/companies/${company.slug}`}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                {company.name}
              </h3>
              {company.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {company.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {company.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* People */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">People</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person) => (
            <Link
              key={person.id}
              href={`/u/${university.slug}/people/${person.slug}`}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-gray-900 mb-1">
                {person.firstName} {person.lastName}
              </h3>
              {person.company && (
                <p className="text-sm text-gray-600 mb-2">
                  {person.company.name}
                </p>
              )}
              {!isPro && person.email && (
                <p className="text-xs text-gray-500">
                  Email available with Pro
                </p>
              )}
              {isPro && person.email && (
                <p className="text-sm text-gray-700">{person.email}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {person.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
