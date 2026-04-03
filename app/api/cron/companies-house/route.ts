import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron";
import { prisma } from "@/lib/prisma";

// Companies House API — free, no key required for basic search
// Searches for new companies incorporated in Oxford in the last 7 days
const CH_BASE = "https://api.company-information.service.gov.uk";

// Oxford area postcodes to search
const OXFORD_POSTCODES = ["OX1", "OX2", "OX3", "OX4"];

interface CHCompany {
  company_name: string;
  company_number: string;
  date_of_creation: string;
  registered_office_address?: {
    postal_code?: string;
    locality?: string;
  };
  company_status: string;
}

async function searchNewCompanies(postcode: string, apiKey: string): Promise<CHCompany[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 8); // last 8 days

  const params = new URLSearchParams({
    q: postcode,
    restrictions: "active-companies",
    "incorporated_from": cutoff.toISOString().split("T")[0],
  });

  const res = await fetch(`${CH_BASE}/advanced-search/companies?${params}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.items ?? [];
}

export async function GET(req: NextRequest) {
  const authError = verifyCronSecret(req);
  if (authError) return authError;

  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      message: "COMPANIES_HOUSE_API_KEY not configured — register free at developer.company-information.service.gov.uk",
    });
  }

  try {
    const university = await prisma.university.findUnique({ where: { slug: "oxford" } });
    if (!university) {
      return NextResponse.json({ error: "Oxford university not found" }, { status: 404 });
    }

    const allCompanies: CHCompany[] = [];
    for (const postcode of OXFORD_POSTCODES) {
      const results = await searchNewCompanies(postcode, apiKey);
      allCompanies.push(...results);
    }

    // Deduplicate by company number
    const seen = new Set<string>();
    const unique = allCompanies.filter((c) => {
      if (seen.has(c.company_number)) return false;
      seen.add(c.company_number);
      return true;
    });

    let created = 0;
    let skipped = 0;

    for (const company of unique) {
      // Skip if already in feed
      const chUrl = `https://find-and-update.company-information.service.gov.uk/company/${company.company_number}`;
      const existing = await prisma.feedItem.findFirst({
        where: { universityId: university.id, sourceUrl: chUrl },
      });
      if (existing) { skipped++; continue; }

      await prisma.feedItem.create({
        data: {
          universityId: university.id,
          type: "new_spinout",
          title: `${company.company_name} incorporated`,
          summary: `New company registered in ${company.registered_office_address?.locality ?? "Oxford"} on ${company.date_of_creation}`,
          sourceUrl: chUrl,
          publishedAt: new Date(company.date_of_creation),
        },
      });
      created++;
    }

    return NextResponse.json({
      ok: true,
      found: unique.length,
      created,
      skipped,
    });
  } catch (error) {
    console.error("[cron/companies-house]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
