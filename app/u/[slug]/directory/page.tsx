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

  const university = await prisma.university.findUnique({
    where: { slug },
  });

  if (!university) {
    return <div className="p-8">University not found</div>;
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
      ...allCompanies.flatMap((c) => c.tags),
      ...allPeople.flatMap((p) => p.tags),
    ])
  ).sort();

  const allSegments = Array.from(
    new Set([
      ...allCompanies.map((c) => c.segment).filter(Boolean),
      ...allPeople.map((p) => p.segment).filter(Boolean),
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
