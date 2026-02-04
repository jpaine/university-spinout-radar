import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { canAccessProFeatures } from "@/lib/access";
import { DirectoryView } from "@/components/DirectoryView";
import { redirect } from "next/navigation";

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
  const newThisWeek = searchParamsResolved.newThisWeek === "true";

  const companies = await prisma.company.findMany({
    where: {
      universityId: university.id,
      ...(tag && { tags: { has: tag } }),
      ...(segment && { segment }),
      ...(newThisWeek && { newThisWeek: true }),
    },
    include: {
      people: true,
    },
    orderBy: { name: "asc" },
  });

  const people = await prisma.person.findMany({
    where: {
      universityId: university.id,
      ...(tag && { tags: { has: tag } }),
      ...(segment && { segment }),
      ...(newThisWeek && { newThisWeek: true }),
    },
    include: {
      company: true,
    },
    orderBy: { lastName: "asc" },
  });

  // Get all unique tags and segments for filters
  const allCompanies = await prisma.company.findMany({
    where: { universityId: university.id },
    select: { tags: true, segment: true },
  });
  const allPeople = await prisma.person.findMany({
    where: { universityId: university.id },
    select: { tags: true, segment: true },
  });

  const allTags = Array.from(
    new Set([
      ...allCompanies.flatMap((c: { tags: string[] }) => c.tags),
      ...allPeople.flatMap((p: { tags: string[] }) => p.tags),
    ])
  ).sort();

  const allSegments = Array.from(
    new Set([
      ...allCompanies.map((c: { segment: string | null }) => c.segment).filter((s: string | null): s is string => s !== null),
      ...allPeople.map((p: { segment: string | null }) => p.segment).filter((s: string | null): s is string => s !== null),
    ])
  ).sort();

  return (
    <DirectoryView
      university={university}
      companies={companies}
      people={people}
      isPro={isPro}
      tags={allTags}
      segments={allSegments}
      currentFilters={{ tag, segment, newThisWeek }}
    />
  );
}
