import Link from "next/link";
import { WatchlistButton } from "@/components/WatchlistButton";

interface FeedItem {
  id: string;
  type: string;
  title: string;
  summary: string | null;
  sourceUrl: string | null;
  publishedAt: Date;
}

interface Person {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  email: string | null;
  linkedinUrl: string | null;
  tags: string[];
}

interface Company {
  name: string;
  description: string | null;
  website: string | null;
  linkedinUrl: string | null;
  tags: string[];
  sector: string | null;
  segment: string | null;
  fundingStage: string | null;
  fundingRaised: string | null;
  investmentStatus: string | null;
  technologySummary: string | null;
  foundedDate: Date | null;
  isEcosystemOrg: boolean;
  people: Person[];
  feedItems: FeedItem[];
}

interface CompanyDetailViewProps {
  university: { id: string; slug: string; name: string };
  company: Company & { id: string };
  isPro: boolean;
}

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

const INVESTMENT_STATUS_COLORS: Record<string, string> = {
  "Raising": "bg-green-100 text-green-800",
  "Funded": "bg-blue-100 text-blue-800",
  "Bootstrapped": "bg-gray-100 text-gray-700",
};

const TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  new_spinout: { label: "New Spinout", color: "bg-green-100 text-green-800", icon: "🚀" },
  funding_round: { label: "Funding", color: "bg-blue-100 text-blue-800", icon: "💰" },
  event: { label: "Event", color: "bg-purple-100 text-purple-800", icon: "📅" },
  news: { label: "News", color: "bg-gray-100 text-gray-800", icon: "📰" },
  new_person: { label: "New Person", color: "bg-yellow-100 text-yellow-800", icon: "👤" },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(date: Date): string {
  const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export function CompanyDetailView({
  university,
  company,
  isPro,
}: CompanyDetailViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href={`/u/${university.slug}/directory`}
        className="text-sm text-gray-500 hover:text-gray-900 mb-6 inline-flex items-center gap-1"
      >
        ← Back to Companies
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{company.name}</h1>
            {company.sector && company.sector !== "Other" && (
              <p className="text-sm text-gray-500">{company.sector}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <WatchlistButton companyId={company.id} />
            {company.fundingStage && (
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${STAGE_COLORS[company.fundingStage] ?? "bg-gray-100 text-gray-700"}`}>
                {company.fundingStage}
              </span>
            )}
            {company.investmentStatus && (
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${INVESTMENT_STATUS_COLORS[company.investmentStatus] ?? "bg-gray-100 text-gray-600"}`}>
                {company.investmentStatus}
              </span>
            )}
          </div>
        </div>

        {company.description && (
          <p className="text-gray-700 mb-5 leading-relaxed">{company.description}</p>
        )}

        {/* Key facts grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 p-4 bg-gray-50 rounded-lg">
          {company.foundedDate && (
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Founded</div>
              <div className="text-sm font-medium text-gray-900">
                {new Date(company.foundedDate).getFullYear()}
              </div>
            </div>
          )}
          {company.fundingRaised && (
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Raised</div>
              <div className="text-sm font-medium text-gray-900">{company.fundingRaised}</div>
            </div>
          )}
          {company.fundingStage && (
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Stage</div>
              <div className="text-sm font-medium text-gray-900">{company.fundingStage}</div>
            </div>
          )}
          {company.sector && company.sector !== "Other" && (
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Sector</div>
              <div className="text-sm font-medium text-gray-900">{company.sector}</div>
            </div>
          )}
        </div>

        {/* Technology summary */}
        {company.technologySummary && (
          <div className="mb-5 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Technology</div>
            <p className="text-sm text-indigo-900">{company.technologySummary}</p>
          </div>
        )}

        {/* Links row */}
        <div className="flex flex-wrap gap-3 mb-5">
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-gray-700 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              <span>🌐</span> Website
            </a>
          )}
          {company.linkedinUrl && (
            <a
              href={company.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-gray-700 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              <span>💼</span> LinkedIn
            </a>
          )}
        </div>

        {/* Tags */}
        {company.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {company.tags.map((tag) => (
              <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* People */}
      {company.people.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Team ({company.people.length})
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {company.people.map((person) => (
              <Link
                key={person.id}
                href={`/u/${university.slug}/people/${person.slug}`}
                className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 shrink-0">
                  {person.firstName[0]}{person.lastName[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {person.firstName} {person.lastName}
                  </div>
                  {isPro && person.email && (
                    <div className="text-xs text-gray-500 truncate">{person.email}</div>
                  )}
                  {!isPro && person.email && (
                    <div className="text-xs text-gray-400 italic">Email with Pro</div>
                  )}
                  {person.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {person.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {person.linkedinUrl && (
                  <a
                    href={person.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-400 hover:text-blue-600 shrink-0 ml-auto"
                    title="LinkedIn"
                  >
                    💼
                  </a>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related activity */}
      {company.feedItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {company.feedItems.map((item) => {
              const typeInfo = TYPE_LABELS[item.type] ?? TYPE_LABELS.news;
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <span className="text-base mt-0.5">{typeInfo.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      <span className="text-xs text-gray-400">{timeAgo(item.publishedAt)}</span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {item.sourceUrl ? (
                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                          {item.title}
                        </a>
                      ) : item.title}
                    </p>
                    {item.summary && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.summary}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 shrink-0">{formatDate(item.publishedAt)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
