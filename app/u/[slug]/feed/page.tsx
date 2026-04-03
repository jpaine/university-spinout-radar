import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { FeedView } from "@/components/FeedView";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function FeedPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const university = await prisma.university.findUnique({
    where: { slug },
  });

  if (!university) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-yellow-900 mb-2">University Not Found</h1>
          <p className="text-yellow-700">
            The university &quot;{slug}&quot; was not found.
          </p>
        </div>
      </div>
    );
  }

  const feedItems = await prisma.feedItem.findMany({
    where: { universityId: university.id },
    include: {
      company: { select: { name: true, slug: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  // Stats for the header
  const totalSpinouts = await prisma.company.count({
    where: { universityId: university.id, isEcosystemOrg: false },
  });
  const recentSpinouts = await prisma.company.count({
    where: {
      universityId: university.id,
      isEcosystemOrg: false,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  return (
    <FeedView
      university={university}
      feedItems={feedItems}
      stats={{ totalSpinouts, recentSpinouts }}
    />
  );
}
