import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { canAccessProFeatures } from "@/lib/access";
import { DirectoryView } from "@/components/DirectoryView";
import { redirect } from "next/navigation";

const PAGE_SIZE = 50;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DirectoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  let university;
  try {
    university = await prisma.university.findUnique({
      where: { slug },
    });
  } catch (error) {
    console.error("Database error:", error);
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-900 mb-2">Database Connection Error</h1>
          <p className="text-red-700">
            Unable to connect to the database. Please ensure the database is configured in Vercel.
          </p>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-yellow-900 mb-2">University Not Found</h1>
          <p className="text-yellow-700">
            The university &quot;{slug}&quot; was not found. Please seed the database or contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  const isPro = await canAccessProFeatures();
  const searchParamsResolved = await searchParams;
  const tag = searchParamsResolved.tag as string | undefined;
  const segment = searchParamsResolved.segment as string | undefined;
  const sector = searchParamsResolved.sector as string | undefined;
  const newThisWeek = searchParamsResolved.newThisWeek === "true";
  const view = searchParamsResolved.view as string | undefined;
  const page = Math.max(1, parseInt((searchParamsResolved.page as string) || "1", 10));
  const skip = (page - 1) * PAGE_SIZE;
  const sort = (searchParamsResolved.sort as string) || "name";

  const companyOrderBy =
    sort === "newest" ? { createdAt: "desc" as const } :
    sort === "stage"  ? { fundingStage: "asc" as const } :
                        { name: "asc" as const };

  const peopleOrderBy =
    sort === "newest" ? { createdAt: "desc" as const } :
                        { lastName: "asc" as const };

  // Build reusable where clauses
  const companyWhere = {
    universityId: university.id,
    ...(tag && { tags: { has: tag } }),
    ...(segment && { segment }),
    ...(sector && { sector }),
    ...(newThisWeek && { newThisWeek: true }),
  };

  const peopleWhere = {
    universityId: university.id,
    ...(tag && { tags: { has: tag } }),
    ...(segment && { segment }),
    ...(newThisWeek && { newThisWeek: true }),
  };

  const [companies, totalCompanies, people, totalPeople] = await Promise.all([
    prisma.company.findMany({
      where: companyWhere,
      include: { people: true },
      orderBy: companyOrderBy,
      take: PAGE_SIZE,
      skip,
    }),
    prisma.company.count({ where: companyWhere }),
    prisma.person.findMany({
      where: peopleWhere,
      include: { company: true },
      orderBy: peopleOrderBy,
      take: PAGE_SIZE,
      skip,
    }),
    prisma.person.count({ where: peopleWhere }),
  ]);

  // Get all unique tags, segments, and sectors for filters (no pagination — need full set)
  const [allCompanies, allPeople] = await Promise.all([
    prisma.company.findMany({
      where: { universityId: university.id },
      select: { tags: true, segment: true, sector: true },
    }),
    prisma.person.findMany({
      where: { universityId: university.id },
      select: { tags: true, segment: true },
    }),
  ]);

  const allTags = Array.from(
    new Set([
      ...allCompanies.flatMap((c) => c.tags),
      ...allPeople.flatMap((p) => p.tags),
    ])
  ).sort();

  const allSegments = Array.from(
    new Set([
      ...allCompanies.map((c) => c.segment).filter((s): s is string => s !== null),
      ...allPeople.map((p) => p.segment).filter((s): s is string => s !== null),
    ])
  ).sort();

  const allSectors = Array.from(
    new Set(
      allCompanies.map((c) => c.sector).filter((s): s is string => s !== null)
    )
  ).sort();

  return (
    <DirectoryView
      university={university}
      companies={companies}
      people={people}
      isPro={isPro}
      tags={allTags}
      segments={allSegments}
      sectors={allSectors}
      currentFilters={{ tag, segment, sector, newThisWeek, view, sort }}
      page={page}
      pageSize={PAGE_SIZE}
      totalCompanies={totalCompanies}
      totalPeople={totalPeople}
    />
  );
}
