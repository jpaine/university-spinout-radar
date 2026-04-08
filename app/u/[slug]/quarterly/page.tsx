import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { canAccessProFeatures } from "@/lib/access";
import { QuarterlyWorkflowView } from "@/components/QuarterlyWorkflowView";
import { QuarterlyTeaser } from "@/components/QuarterlyTeaser";
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

  const university = await prisma.university.findUnique({
    where: { slug },
  });

  if (!university) {
    notFound();
  }

  const isPro = await canAccessProFeatures();
  if (!isPro) {
    return <QuarterlyTeaser university={university} />;
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

  const personIds = people.map((p) => p.id);
  const logs = await prisma.outreachLog.findMany({
    where: { personId: { in: personIds } },
    include: { template: { select: { name: true } } },
    orderBy: { sentAt: "desc" },
  });

  const outreachLogs: Record<string, typeof logs> = {};
  for (const log of logs) {
    if (!outreachLogs[log.personId]) outreachLogs[log.personId] = [];
    outreachLogs[log.personId].push(log);
  }

  return (
    <QuarterlyWorkflowView
      university={university}
      people={people}
      templates={templates}
      outreachLogs={outreachLogs}
    />
  );
}
