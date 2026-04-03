/**
 * Enriches companies with founding dates from Companies House API.
 * Matches Oxford spinout companies by name and fills in foundedDate.
 *
 * Usage:
 *   COMPANIES_HOUSE_API_KEY=xxx DATABASE_URL=xxx npx tsx scripts/enrich-founded-dates.ts
 *   Add --dry-run to preview without writing to DB
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const API_KEY = process.env.COMPANIES_HOUSE_API_KEY;
const DRY_RUN = process.argv.includes("--dry-run");

if (!API_KEY) {
  console.error("COMPANIES_HOUSE_API_KEY env var is required");
  process.exit(1);
}

async function searchCompaniesHouse(name: string): Promise<{
  name: string;
  incorporatedOn: string | null;
  companyNumber: string;
} | null> {
  const url = `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(name)}&items_per_page=5`;
  const res = await fetch(url, {
    headers: { Authorization: `Basic ${Buffer.from(`${API_KEY}:`).toString("base64")}` },
  });

  if (!res.ok) {
    console.warn(`  CH API error ${res.status} for "${name}"`);
    return null;
  }

  const data = await res.json();
  const items: any[] = data.items ?? [];

  // Find best match: exact name or starts-with match, active companies preferred
  const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = normalise(name);

  const match = items.find((i: any) => normalise(i.title) === target && i.company_status === "active")
    ?? items.find((i: any) => normalise(i.title) === target)
    ?? items.find((i: any) => normalise(i.title).startsWith(target) && i.company_status === "active")
    ?? null;

  if (!match) return null;

  return {
    name: match.title,
    companyNumber: match.company_number,
    incorporatedOn: match.date_of_creation ?? null,
  };
}

async function main() {
  console.log(`\n🔍 Enriching founding dates from Companies House${DRY_RUN ? " [DRY RUN]" : ""}\n`);

  const companies = await prisma.company.findMany({
    where: { foundedDate: null, isEcosystemOrg: false },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  console.log(`Found ${companies.length} companies missing foundedDate\n`);

  let updated = 0;
  let notFound = 0;

  for (const company of companies) {
    process.stdout.write(`  ${company.name}... `);

    // Rate limit: CH API allows 600 req/5min = 2 req/sec
    await new Promise((r) => setTimeout(r, 550));

    const result = await searchCompaniesHouse(company.name);

    if (!result || !result.incorporatedOn) {
      console.log("not found");
      notFound++;
      continue;
    }

    const foundedDate = new Date(result.incorporatedOn);
    console.log(`✓ ${result.name} — incorporated ${result.incorporatedOn}`);

    if (!DRY_RUN) {
      await prisma.company.update({
        where: { id: company.id },
        data: { foundedDate },
      });
    }

    updated++;
  }

  console.log(`\n✅ Done: ${updated} updated, ${notFound} not found`);
  if (DRY_RUN) console.log("   (dry run — no DB writes)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
