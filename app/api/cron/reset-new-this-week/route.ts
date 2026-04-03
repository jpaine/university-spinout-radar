import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authError = verifyCronSecret(req);
  if (authError) return authError;

  try {
    const university = await prisma.university.findUnique({ where: { slug: "oxford" } });
    if (!university) {
      return NextResponse.json({ error: "Oxford university not found" }, { status: 404 });
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Reset all to false
    await prisma.company.updateMany({
      where: { universityId: university.id },
      data: { newThisWeek: false },
    });

    // Set true for companies created in the last 7 days
    const { count } = await prisma.company.updateMany({
      where: {
        universityId: university.id,
        createdAt: { gte: oneWeekAgo },
      },
      data: { newThisWeek: true },
    });

    return NextResponse.json({ ok: true, newThisWeek: count });
  } catch (error) {
    console.error("[cron/reset-new-this-week]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
