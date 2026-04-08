import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { WatchlistButton } from "@/components/WatchlistButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const STAGE_COLORS: Record<string, string> = {
  "Pre-Seed": "bg-gray-100 text-gray-700",
  Seed: "bg-blue-100 text-blue-700",
  "Series A": "bg-purple-100 text-purple-700",
  "Series B": "bg-indigo-100 text-indigo-700",
  "Series C+": "bg-green-100 text-green-700",
  Listed: "bg-yellow-100 text-yellow-700",
  Acquired: "bg-red-100 text-red-700",
};

export default async function WatchlistPage({ params }: PageProps) {
  const { slug } = await params;

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const university = await prisma.university.findUnique({ where: { slug } });
  if (!university) notFound();

  // Fetch user's watchlist entries
  const watchlistItems = await prisma.watchlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const companyIds = watchlistItems
    .filter((w) => w.companyId)
    .map((w) => w.companyId as string);

  const companies =
    companyIds.length > 0
      ? await prisma.company.findMany({
          where: { id: { in: companyIds } },
          include: { people: { select: { id: true } } },
        })
      : [];

  // Preserve watchlist order
  const companyMap = new Map(companies.map((c) => [c.id, c]));
  const orderedCompanies = companyIds
    .map((id) => companyMap.get(id))
    .filter(Boolean) as typeof companies;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Watchlist</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {orderedCompanies.length}{" "}
            {orderedCompanies.length === 1 ? "company" : "companies"} watched
          </p>
        </div>
        <Link
          href={`/u/${slug}/directory`}
          className="text-sm text-blue-600 hover:underline"
        >
          Browse directory →
        </Link>
      </div>

      {orderedCompanies.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="text-4xl mb-4">⭐</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Your watchlist is empty
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Visit a company&apos;s page and click the star icon to add it to
            your watchlist and receive deal alerts.
          </p>
          <Link
            href={`/u/${slug}/directory`}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Browse spinouts →
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderedCompanies.map((company) => {
            const stageColor =
              STAGE_COLORS[company.fundingStage ?? ""] ?? "bg-gray-100 text-gray-700";

            return (
              <div
                key={company.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link
                    href={`/u/${slug}/companies/${company.slug}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors leading-snug"
                  >
                    {company.name}
                  </Link>
                  <WatchlistButton companyId={company.id} initialWatched={true} compact />
                </div>

                {company.sector && (
                  <p className="text-xs text-gray-500 mb-2">{company.sector}</p>
                )}

                {company.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 flex-1 mb-3">
                    {company.description}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap mt-auto">
                  {company.fundingStage && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${stageColor}`}
                    >
                      {company.fundingStage}
                    </span>
                  )}
                  {company.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
