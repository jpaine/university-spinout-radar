import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  try {
    const user = await currentUser();

    if (user) {
      redirect("/u/oxford/feed");
    }
  } catch (error) {
    console.error("Error checking user:", error);
  }

  // Fetch recent feed items for the public preview
  let recentItems: Array<{
    id: string;
    type: string;
    title: string;
    summary: string | null;
    publishedAt: Date;
  }> = [];
  let spinoutCount = 0;

  try {
    recentItems = await prisma.feedItem.findMany({
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: { id: true, type: true, title: true, summary: true, publishedAt: true },
    });
    spinoutCount = await prisma.company.count({
      where: { isEcosystemOrg: false },
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Every Oxford spinout.<br />
          Every funding round.<br />
          Every week.
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          The investor intelligence platform for Oxford University deals.
          {spinoutCount > 0 && (
            <span className="block mt-2 text-lg">
              Tracking <span className="font-semibold text-gray-900">{spinoutCount}+ spinout companies</span> across
              Deep Tech, Life Sciences, and HealthTech.
            </span>
          )}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/sign-up"
            className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 text-lg"
          >
            Get Started Free
          </Link>
          <Link
            href="/sign-in"
            className="bg-white text-gray-900 border border-gray-300 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 text-lg"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Live Feed Preview */}
      {recentItems.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Latest Activity
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            {recentItems.map((item) => (
              <div key={item.id} className="px-5 py-4 flex items-start gap-3">
                <span className="text-lg mt-0.5">{TYPE_ICONS[item.type] || "📰"}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
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
          <p className="text-center text-sm text-gray-500 mt-3">
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign up
            </Link>{" "}
            to see the full feed, company profiles, and deal alerts.
          </p>
        </div>
      )}

      {/* Value Props */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-2xl mb-3">🔍</div>
          <h3 className="font-semibold text-gray-900 mb-2">Complete Directory</h3>
          <p className="text-sm text-gray-600">
            Every Oxford spinout company with sector, stage, funding history, and founder details.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-2xl mb-3">⚡</div>
          <h3 className="font-semibold text-gray-900 mb-2">Real-Time Feed</h3>
          <p className="text-sm text-gray-600">
            New spinouts, funding rounds, acquisitions, and events — as they happen.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-2xl mb-3">📧</div>
          <h3 className="font-semibold text-gray-900 mb-2">Direct Outreach</h3>
          <p className="text-sm text-gray-600">
            Contact founders directly with email templates and track your outreach pipeline.
          </p>
        </div>
      </div>

      {/* Data Sources */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Data sourced from Oxford University Innovation, Oxford Science Enterprises,
          Oxford Founders Guide, and Oxford Equinox.
        </p>
      </div>
    </div>
  );
}
