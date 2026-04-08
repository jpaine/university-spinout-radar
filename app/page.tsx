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

  try {
    recentItems = await prisma.feedItem.findMany({
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
    });
    spinoutCount = await prisma.company.count({ where: { isEcosystemOrg: false } });
    const sectors = await prisma.company.groupBy({
      by: ["sector"],
      where: { isEcosystemOrg: false, sector: { not: null } },
      _count: { sector: true },
      orderBy: { _count: { sector: "desc" } },
      take: 4,
    });
    sectors.forEach((s) => {
      if (s.sector && s.sector !== "Other") sectorCounts[s.sector] = s._count.sector;
    });
  } catch {
    // Database may not be connected — show landing page anyway
  }

  const TYPE_ICONS: Record<string, string> = {
    new_spinout: "🚀",
    funding_round: "💰",
    event: "📅",
    news: "📰",
    new_person: "👤",
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
          <p className="text-xl text-gray-500 mb-8 max-w-xl mx-auto">
            The investor intelligence platform for Oxford University deals.
            Never miss a spinout, raise, or event again.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/sign-up"
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors text-base"
            >
              Get Started Free
            </Link>
            <Link
              href="/sign-in"
              className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-base"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Live Feed — left, takes 3 cols */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Latest Activity
              </h2>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Live
              </span>
            </div>

            {recentItems.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
                {recentItems.map((item) => (
                  <div key={item.id} className="px-5 py-4 flex items-start gap-3">
                    <span className="text-lg mt-0.5 shrink-0">{TYPE_ICONS[item.type] ?? "📰"}</span>
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

            {/* What you get */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">What you get</h3>
              <ul className="space-y-3">
                {[
                  { icon: "🔍", title: "Complete Directory", desc: `${spinoutCount > 0 ? spinoutCount + "+" : ""} spinouts with sector, stage, and founders` },
                  { icon: "⚡", title: "Activity Feed", desc: "Spinouts, funding rounds, and events as they happen" },
                  { icon: "🧬", title: "IP Pipeline", desc: "Pre-company OUI technologies available for licensing" },
                  { icon: "📧", title: "Outreach Tools", desc: "Email templates and pipeline tracking (Pro)" },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Data sources */}
            <p className="text-xs text-gray-400 leading-relaxed">
              Data sourced from Oxford University Innovation, Oxford Science Enterprises,
              Oxford Founders Guide, and Oxford Equinox.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
