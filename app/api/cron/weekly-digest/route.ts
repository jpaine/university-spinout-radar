import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { WeeklyDigest } from "@/emails/WeeklyDigest";
import React from "react";

export async function GET(req: NextRequest) {
  const authError = verifyCronSecret(req);
  if (authError) return authError;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://university-spinout-radar.vercel.app";

  try {
    const university = await prisma.university.findUnique({ where: { slug: "oxford" } });
    if (!university) {
      return NextResponse.json({ error: "Oxford university not found" }, { status: 404 });
    }

    // Get feed items from the last 7 days
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentItems = await prisma.feedItem.findMany({
      where: {
        universityId: university.id,
        publishedAt: { gte: oneWeekAgo },
      },
      include: { company: { select: { name: true, slug: true } } },
      orderBy: { publishedAt: "desc" },
    });

    const newSpinouts = recentItems.filter((i) => i.type === "new_spinout");
    const fundingEvents = recentItems.filter((i) => i.type === "funding_round");
    const newsItems = recentItems.filter((i) => i.type === "news");

    const totalSpinouts = await prisma.company.count({
      where: { universityId: university.id, isEcosystemOrg: false },
    });

    // Get all users with weekly digest enabled
    const prefs = await prisma.notificationPreference.findMany({
      where: { weeklyDigest: true, email: { not: null } },
    });

    let sent = 0;
    let failed = 0;

    for (const pref of prefs) {
      if (!pref.email) continue;
      try {
        await sendEmail({
          to: pref.email,
          subject: newSpinouts.length > 0
            ? `${newSpinouts.length} new Oxford spinout${newSpinouts.length > 1 ? "s" : ""} this week`
            : "Your Oxford Deal Flow weekly digest",
          react: React.createElement(WeeklyDigest, {
            newSpinouts,
            fundingEvents,
            newsItems,
            totalSpinouts,
            appUrl,
          }),
        });
        sent++;
      } catch (err) {
        console.error(`[weekly-digest] Failed to send to ${pref.email}:`, err);
        failed++;
      }
    }

    return NextResponse.json({
      ok: true,
      recipients: prefs.length,
      sent,
      failed,
      digest: {
        newSpinouts: newSpinouts.length,
        fundingEvents: fundingEvents.length,
        newsItems: newsItems.length,
      },
    });
  } catch (error) {
    console.error("[cron/weekly-digest]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
