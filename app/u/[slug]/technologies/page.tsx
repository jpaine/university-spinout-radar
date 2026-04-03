import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TechnologiesView } from "@/components/TechnologiesView";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TechnologiesPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  let university;
  try {
    university = await prisma.university.findUnique({ where: { slug } });
  } catch (error) {
    console.error("Database error:", error);
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-900 mb-2">Database Connection Error</h1>
          <p className="text-red-700">Unable to connect to the database.</p>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-yellow-900 mb-2">University Not Found</h1>
          <p className="text-yellow-700">The university &quot;{slug}&quot; was not found.</p>
        </div>
      </div>
    );
  }

  const searchParamsResolved = await searchParams;
  const sector = searchParamsResolved.sector as string | undefined;
  const status = searchParamsResolved.status as string | undefined;
  const tag = searchParamsResolved.tag as string | undefined;

  const technologies = await prisma.technology.findMany({
    where: {
      universityId: university.id,
      ...(sector && { sector }),
      ...(status && { status }),
      ...(tag && { tags: { has: tag } }),
    },
    orderBy: { createdAt: "desc" },
  });

  const allTechnologies = await prisma.technology.findMany({
    where: { universityId: university.id },
    select: { sector: true, status: true, tags: true },
  });

  const allSectors = Array.from(
    new Set(allTechnologies.map((t) => t.sector).filter((s): s is string => s !== null))
  ).sort();

  const allStatuses = Array.from(
    new Set(allTechnologies.map((t) => t.status))
  ).sort();

  const allTags = Array.from(
    new Set(allTechnologies.flatMap((t) => t.tags))
  ).sort();

  return (
    <TechnologiesView
      university={university}
      technologies={technologies}
      allSectors={allSectors}
      allStatuses={allStatuses}
      allTags={allTags}
      currentFilters={{ sector, status, tag }}
    />
  );
}
