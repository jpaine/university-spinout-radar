import { prisma } from "@/lib/prisma";
import { canAccessProFeatures } from "@/lib/access";
import { CompanyDetailView } from "@/components/CompanyDetailView";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string; companySlug: string }>;
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { slug, companySlug } = await params;

  const university = await prisma.university.findUnique({
    where: { slug },
  });

  if (!university) {
    notFound();
  }

  const company = await prisma.company.findUnique({
    where: {
      universityId_slug: {
        universityId: university.id,
        slug: companySlug,
      },
    },
    include: {
      people: {
        orderBy: { lastName: "asc" },
      },
    },
  });

  if (!company) {
    notFound();
  }

  const isPro = await canAccessProFeatures();

  return (
    <CompanyDetailView
      university={university}
      company={company}
      isPro={isPro}
    />
  );
}
