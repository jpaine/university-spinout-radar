import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { DealAlert } from "@/emails/DealAlert";
import React from "react";

export async function GET(req: NextRequest) {
  const authError = verifyCronSecret(req);
  if (authError) return authError;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://university-spinout-radar.vercel.app";

  try {
    // Find new spinouts added in the last 7 days or flagged as new this week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newCompanies = await prisma.company.findMany({
      where: {
        isEcosystemOrg: false,
        OR: [{ newThisWeek: true }, { createdAt: { gte: oneWeekAgo } }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sector: true,
        description: true,
      },
    });

    if (newCompanies.length === 0) {
      return NextResponse.json({ ok: true, message: "No new companies this week", sent: 0 });
    }

    // Get users with deal alerts enabled
    const prefs = await prisma.notificationPreference.findMany({
      where: { newSpinoutAlert: true, email: { not: null } },
    });

    if (prefs.length === 0) {
      return NextResponse.json({ ok: true, message: "No subscribers for deal alerts", sent: 0 });
    }

    // Fetch watchlists for all interested users
    const userIds = prefs.map((p) => p.userId);
    const watchlists = await prisma.watchlist.findMany({
      where: { userId: { in: userIds } },
    });

    const newCompanyIds = new Set(newCompanies.map((c) => c.id));
    const newCompanySectors = new Set(
      newCompanies.map((c) => c.sector).filter(Boolean) as string[]
    );

    let sent = 0;
    let failed = 0;

    for (const pref of prefs) {
      if (!pref.email) continue;

      const userWatchlist = watchlists.filter((w) => w.userId === pref.userId);

      // Determine which new companies match this user's watchlist
      const matchedCompanies = newCompanies.filter((company) => {
        // Matches a specific watched company
        const watchesCompany = userWatchlist.some(
          (w) => w.companyId === company.id
        );
        // Matches a watched sector
        const watchesSector =
          company.sector &&
          userWatchlist.some((w) => w.sector === company.sector);
        return watchesCompany || watchesSector;
      });

      // If user has no specific watchlist entries, send all new companies
      const companiesToSend =
        userWatchlist.length === 0 ? newCompanies : matchedCompanies;

      if (companiesToSend.length === 0) continue;

      try {
        await sendEmail({
          to: pref.email,
          subject: `${companiesToSend.length} new Oxford spinout${companiesToSend.length !== 1 ? "s" : ""} on your radar`,
          react: React.createElement(DealAlert, {
            newCompanies: companiesToSend,
            appUrl,
          }),
        });
        sent++;
      } catch (err) {
        console.error(`[deal-alerts] Failed to send to ${pref.email}:`, err);
        failed++;
      }
    }

    return NextResponse.json({
      ok: true,
      newCompanies: newCompanies.length,
      recipients: prefs.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error("[cron/deal-alerts]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
