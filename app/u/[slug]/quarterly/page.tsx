import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { canAccessProFeatures } from "@/lib/access";
import { QuarterlyWorkflowView } from "@/components/QuarterlyWorkflowView";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function QuarterlyPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const isPro = await canAccessProFeatures();
  if (!isPro) {
    redirect("/pricing");
  }

  const university = await prisma.university.findUnique({
    where: { slug },
  });

  if (!university) {
    notFound();
  }

  const templates = await prisma.template.findMany({
    where: { universityId: university.id },
    orderBy: { name: "asc" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const people = await prisma.person.findMany({
    where: {
      universityId: university.id,
      OR: [
        { nextTouchAt: { lte: today } },
        { nextTouchAt: null },
      ],
    },
    include: {
      company: true,
    },
    orderBy: { nextTouchAt: "asc" },
  });

  return (
    <QuarterlyWorkflowView
      university={university}
      people={people}
      templates={templates}
    />
  );
}
