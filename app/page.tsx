import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  try {
    const user = await currentUser();
    if (user) {
      redirect("/welcome");
    }
  } catch (error) {
    console.error("Error checking user:", error);
  }

  let recentItems: Array<{
    id: string;
    type: string;
    title: string;
    summary: string | null;
    publishedAt: Date;
    company: { name: string } | null;
  }> = [];
  let spinoutCount = 0;
  let sectorCounts: Record<string, number> = {};
  let newThisQuarter = 0;
  let recentFundingRounds = 0;
  let founderCount = 0;

  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [items, total, quarterCount, fundingCount, founders, sectors] =
      await Promise.all([
        prisma.feedItem.findMany({
          orderBy: { publishedAt: "desc" },
          take: 6,
          select: {
            id: true,
            type: true,
            title: true,
            summary: true,
            publishedAt: true,
            company: { select: { name: true } },
          },
        }),
        prisma.company.count({ where: { isEcosystemOrg: false } }),
        prisma.company.count({
          where: {
            isEcosystemOrg: false,
            createdAt: { gte: threeMonthsAgo },
          },
        }),
        prisma.feedItem.count({
          where: {
            type: "funding_round",
            publishedAt: { gte: threeMonthsAgo },
          },
        }),
        prisma.person.count(),
        prisma.company.groupBy({
          by: ["sector"],
          where: { isEcosystemOrg: false, sector: { not: null } },
          _count: { sector: true },
          orderBy: { _count: { sector: "desc" } },
          take: 4,
        }),
      ]);

    recentItems = items;
    spinoutCount = total;
    newThisQuarter = quarterCount;
    recentFundingRounds = fundingCount;
    founderCount = founders;
    sectors.forEach((s) => {
      if (s.sector && s.sector !== "Other") sectorCounts[s.sector] = s._count.sector;
    });
  } catch {
    // Database may not be connected — show landing page anyway
  }

  const TYPE_ICONS: Record<string, string> = {
    new_spinout: "\u{1F680}",
    funding_round: "\u{1F4B0}",
    event: "\u{1F4C5}",
    news: "\u{1F4F0}",
    new_person: "\u{1F464}",
  };

  const TYPE_COLORS: Record<string, string> = {
    new_spinout: "bg-green-100 text-green-700",
    funding_round: "bg-blue-100 text-blue-700",
    event: "bg-purple-100 text-purple-700",
    news: "bg-gray-100 text-gray-600",
    new_person: "bg-yellow-100 text-yellow-700",
  };

  const TYPE_LABELS: Record<string, string> = {
    new_spinout: "New Spinout",
    funding_round: "Funding",
    event: "Event",
    news: "News",
    new_person: "New Person",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            {spinoutCount > 0 ? `${spinoutCount}+ Oxford spinouts tracked` : "Oxford spinout intelligence"}
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
            Every Oxford spinout.<br />
            Every funding round.<br />
            Every week.
          </h1>
          <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
            Track {spinoutCount > 0 ? `${spinoutCount}+` : ""} Oxford spinouts before anyone else.
            Weekly intelligence on funding rounds, new companies, and founder contacts
            — so you never miss the next big Oxford deal.
          </p>
          <div className="flex gap-3 justify-center items-center">
            <Link
              href="/sign-up"
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors text-base"
            >
              Start your 7-day free trial
            </Link>
            <Link
              href="/sign-in"
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Free tier included. No credit card required to start.
          </p>
        </div>
      </div>

      {/* Dynamic stats bar */}
      {(spinoutCount > 0 || newThisQuarter > 0 || founderCount > 0) && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{spinoutCount}+</div>
                <div className="text-xs text-gray-500 mt-0.5">Spinouts tracked</div>
              </div>
              {newThisQuarter > 0 && (
                <div>
                  <div className="text-2xl font-bold text-green-600">{newThisQuarter}</div>
                  <div className="text-xs text-gray-500 mt-0.5">New this quarter</div>
                </div>
              )}
              {recentFundingRounds > 0 && (
                <div>
                  <div className="text-2xl font-bold text-blue-600">{recentFundingRounds}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Recent funding rounds</div>
                </div>
              )}
              <div>
                <div className="text-2xl font-bold text-gray-900">{founderCount > 0 ? `${founderCount}+` : "500+"}</div>
                <div className="text-xs text-gray-500 mt-0.5">Founder profiles</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* What you get — horizontal strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: "\u{1F50D}", title: "Complete Directory", desc: "Every spinout with sector, stage, and founders" },
            { icon: "\u26A1", title: "Activity Feed", desc: "Funding rounds and events as they happen" },
            { icon: "\u{1F9EC}", title: "IP Pipeline", desc: "Pre-company OUI tech available for licensing" },
            { icon: "\u{1F4E7}", title: "Outreach Tools", desc: "Email templates and pipeline tracking" },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="text-xl mb-2">{item.icon}</div>
              <div className="text-sm font-semibold text-gray-900 mb-1">{item.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-12">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide text-center mb-6">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Browse the directory", desc: "Search and filter 500+ Oxford spinouts by sector, funding stage, and founding date." },
              { step: "2", title: "Set up deal alerts", desc: "Choose sectors and stages you care about. Get notified when new spinouts match your criteria." },
              { step: "3", title: "Get weekly intelligence", desc: "Receive a weekly digest with new companies, funding rounds, and ecosystem events." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">{item.title}</div>
                <div className="text-sm text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Live Feed — left, takes 3 cols */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Latest Activity
              </h2>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Updated weekly
              </span>
            </div>

            {recentItems.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
                {recentItems.map((item) => (
                  <div key={item.id} className="px-5 py-4 flex items-start gap-3">
                    <span className="text-lg mt-0.5 shrink-0">{TYPE_ICONS[item.type] ?? "\u{1F4F0}"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${TYPE_COLORS[item.type] ?? "bg-gray-100 text-gray-600"}`}>
                          {TYPE_LABELS[item.type] ?? "News"}
                        </span>
                        {item.company && (
                          <span className="text-xs text-gray-500 truncate">{item.company.name}</span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900 leading-snug">{item.title}</div>
                      {item.summary && (
                        <div className="text-sm text-gray-500 mt-0.5 line-clamp-1">{item.summary}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 shrink-0">
                      {new Date(item.publishedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
                Activity feed loading...
              </div>
            )}

            <p className="text-center text-sm text-gray-500 mt-4">
              <Link href="/sign-up" className="text-blue-600 hover:underline font-medium">
                Sign up free
              </Link>{" "}
              to see the full feed, company profiles, and more.
            </p>
          </div>

          {/* Sidebar — right, 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sector breakdown */}
            {Object.keys(sectorCounts).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Sectors</h3>
                <div className="space-y-3">
                  {Object.entries(sectorCounts).map(([sector, count]) => (
                    <div key={sector} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{sector}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 bg-blue-100 rounded-full w-16 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, (count / spinoutCount) * 100 * 3)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social proof */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Built for Oxford investors</h3>
              <div className="space-y-4">
                <div className="text-sm text-gray-600 leading-relaxed">
                  &ldquo;Finally, one place to track every Oxford spinout without trawling
                  through OUI, Companies House, and LinkedIn separately.&rdquo;
                </div>
                <div className="text-xs text-gray-400">
                  &mdash; Early-stage VC, Oxford-focused fund
                </div>
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Used by investors at Oxford-focused funds, family offices, and angel syndicates</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data sources */}
            <p className="text-xs text-gray-400 leading-relaxed">
              Data sourced from Oxford University Innovation, Oxford Science Enterprises,
              Oxford Founders Guide, and Oxford Equinox.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-white rounded-xl border border-gray-200 p-10 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Don&apos;t miss the next Oxford deal
          </h2>
          <p className="text-gray-500 mb-6 max-w-lg mx-auto">
            Join investors who track Oxford spinouts weekly. Free to browse,
            Pro for founder contacts and deal alerts.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors text-base"
          >
            Start your 7-day free trial
          </Link>
          <p className="text-xs text-gray-400 mt-3">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
