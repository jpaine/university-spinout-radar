import { prisma } from "@/lib/prisma";
import { canAccessProFeatures } from "@/lib/access";
import { PersonDetailView } from "@/components/PersonDetailView";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string; personSlug: string }>;
}

export default async function PersonDetailPage({ params }: PageProps) {
  const { slug, personSlug } = await params;

  const university = await prisma.university.findUnique({
    where: { slug },
  });

  if (!university) {
    notFound();
  }

  const person = await prisma.person.findUnique({
    where: {
      universityId_slug: {
        universityId: university.id,
        slug: personSlug,
      },
    },
    include: {
      company: true,
    },
  });

  if (!person) {
    notFound();
  }

  const templates = await prisma.template.findMany({
    where: { universityId: university.id },
    orderBy: { name: "asc" },
  });

  const isPro = await canAccessProFeatures();

  return (
    <PersonDetailView
      university={university}
      person={person}
      templates={templates}
      isPro={isPro}
    />
  );
}
