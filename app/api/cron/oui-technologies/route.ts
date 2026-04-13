import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://innovation.ox.ac.uk";
const LISTING_URL = `${BASE_URL}/technologies-available/technology-licensing/`;
const USER_AGENT = "Oxford Deal Flow / technology pipeline tracker";
// Be polite — delay between detail page fetches
const DETAIL_FETCH_DELAY_MS = 250;
// Max new technology detail pages to fetch per run (prevents timeout on first run)
const MAX_DETAIL_FETCHES = 40;

interface ScrapedTech {
  sourceUrl: string;
  title: string;
  summary: string;
}

interface TechDetail {
  ouiRef: string | null;
  sector: string | null;
  fullTitle: string | null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function scrapePage(pageNum: number): Promise<ScrapedTech[]> {
  const url =
    pageNum === 1
      ? LISTING_URL
      : `${LISTING_URL}page/${pageNum}/`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return [];

  const html = await res.text();
  const items: ScrapedTech[] = [];

  // Each technology is in an <article> block
  const articleMatches = html.matchAll(/<article>([\s\S]*?)<\/article>/g);
  for (const match of articleMatches) {
    const content = match[1];

    const linkMatch = content.match(
      /href="(https:\/\/innovation\.ox\.ac\.uk\/licence-details\/[^"]+)"/
    );
    const titleMatch = content.match(/<h3>([\s\S]*?)<\/h3>/);
    const summaryMatch = content.match(/<p>([\s\S]*?)<\/p>/);

    if (!linkMatch || !titleMatch) continue;

    const title = titleMatch[1]
      .replace(/&#8203;/g, "")
      .replace(/&#8200;/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&ndash;/g, "–")
      .replace(/&mdash;/g, "—")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const summary = summaryMatch
      ? summaryMatch[1]
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 280)
      : "";

    if (title) {
      items.push({ sourceUrl: linkMatch[1], title, summary });
    }
  }

  return items;
}

// Discover total page count from pagination on page 1
async function getTotalPages(html: string): Promise<number> {
  // Pagination links: page/N/ — find highest N
  const matches = [...html.matchAll(/\/page\/(\d+)\//g)];
  if (matches.length === 0) return 1;
  const nums = matches.map((m) => parseInt(m[1], 10));
  return Math.max(...nums);
}

async function fetchTechDetail(sourceUrl: string): Promise<TechDetail> {
  try {
    const res = await fetch(sourceUrl, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { ouiRef: null, sector: null, fullTitle: null };

    const html = await res.text();

    // Project Number (OUI ref): <div class="title">Project Number:</div>\n<p>24477</p>
    const ouiRefMatch = html.match(
      /Project Number:<\/div>\s*(?:<p>)?\s*(\d+)\s*(?:<\/p>)?/
    );

    // Industry Categories: <div class="title">Industry Categories:</div>\n<p><a href="...">Medtech</a></p>
    const sectorBlockMatch = html.match(
      /Industry Categories:<\/div>\s*<p>([\s\S]*?)<\/p>/
    );
    const sector = sectorBlockMatch
      ? sectorBlockMatch[1].replace(/<[^>]+>/g, ", ").replace(/,\s*,/g, ",").trim().replace(/^,|,$/, "").trim()
      : null;

    // Full title from <h1>
    const titleMatch = html.match(/<h1>([\s\S]*?)<\/h1>/);
    const fullTitle = titleMatch
      ? titleMatch[1].replace(/<[^>]+>/g, "").trim()
      : null;

    return {
      ouiRef: ouiRefMatch?.[1] ?? null,
      sector: sector || null,
      fullTitle,
    };
  } catch {
    return { ouiRef: null, sector: null, fullTitle: null };
  }
}

export async function GET(req: NextRequest) {
  const authError = verifyCronSecret(req);
  if (authError) return authError;

  try {
    const university = await prisma.university.findUnique({
      where: { slug: process.env.DEFAULT_UNIVERSITY_SLUG ?? process.env.NEXT_PUBLIC_DEFAULT_UNIVERSITY_SLUG ?? "oxford" },
    });
    if (!university) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }

    // Step 1: Scrape all listing pages
    const page1Res = await fetch(LISTING_URL, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15000),
    });
    if (!page1Res.ok) {
      return NextResponse.json(
        { error: `OUI listing fetch failed: ${page1Res.status}` },
        { status: 502 }
      );
    }

    const page1Html = await page1Res.text();
    const totalPages = await getTotalPages(page1Html);

    const allScraped: ScrapedTech[] = [];

    // Parse page 1 from already-fetched HTML
    const page1Items = await scrapePage(1);
    allScraped.push(...page1Items);

    // Fetch remaining pages
    for (let p = 2; p <= totalPages; p++) {
      const items = await scrapePage(p);
      allScraped.push(...items);
      await sleep(100); // be polite
    }

    const scrapedUrls = new Set(allScraped.map((t) => t.sourceUrl));

    // Step 2: Load existing Technology records for this university
    const existing = await prisma.technology.findMany({
      where: { universityId: university.id },
      select: { id: true, sourceUrl: true, status: true },
    });

    const existingByUrl = new Map(existing.map((t) => [t.sourceUrl, t]));

    // Step 3: Detect disappeared technologies → mark as "licensed"
    let licensed = 0;
    for (const tech of existing) {
      if (tech.status === "available" && tech.sourceUrl && !scrapedUrls.has(tech.sourceUrl)) {
        await prisma.technology.update({
          where: { id: tech.id },
          data: { status: "licensed" },
        });

        // Fire a FeedItem so it appears in the feed and weekly digest
        const techRecord = await prisma.technology.findUnique({
          where: { id: tech.id },
        });
        if (techRecord) {
          await prisma.feedItem.create({
            data: {
              universityId: university.id,
              type: "news",
              title: `IP licensed: ${techRecord.title}`,
              summary: `An Oxford technology has been licensed — a spinout may be forming. Previously listed by OUI as available for licensing.`,
              sourceUrl: tech.sourceUrl ?? undefined,
              publishedAt: new Date(),
            },
          });
        }
        licensed++;
      }
    }

    // Step 4: Create new Technology records
    const newTechs = allScraped.filter((t) => !existingByUrl.has(t.sourceUrl));
    let created = 0;
    let detailsFetched = 0;

    for (const tech of newTechs) {
      let ouiRef: string | null = null;
      let sector: string | null = null;
      let fullTitle = tech.title;

      // Fetch detail page for new technologies (up to MAX_DETAIL_FETCHES per run)
      if (detailsFetched < MAX_DETAIL_FETCHES) {
        await sleep(DETAIL_FETCH_DELAY_MS);
        const detail = await fetchTechDetail(tech.sourceUrl);
        if (detail.ouiRef) ouiRef = detail.ouiRef;
        if (detail.sector) sector = detail.sector;
        if (detail.fullTitle) fullTitle = detail.fullTitle;
        detailsFetched++;
      }

      await prisma.technology.create({
        data: {
          universityId: university.id,
          title: fullTitle,
          summary: tech.summary || null,
          sector,
          ouiRef,
          sourceUrl: tech.sourceUrl,
          status: "available",
          publishedAt: new Date(),
          tags: [],
        },
      });

      // FeedItem for new technology (only create for genuinely new ones this run)
      await prisma.feedItem.create({
        data: {
          universityId: university.id,
          type: "news",
          title: `New IP available: ${fullTitle}`,
          summary: tech.summary
            ? `OUI technology available for licensing.${sector ? ` Sector: ${sector}.` : ""} ${tech.summary.slice(0, 180)}`
            : `New OUI technology available for licensing.${sector ? ` Sector: ${sector}.` : ""}`,
          sourceUrl: tech.sourceUrl,
          publishedAt: new Date(),
        },
      });

      created++;
    }

    return NextResponse.json({
      ok: true,
      scraped: allScraped.length,
      pages: totalPages,
      created,
      licensed,
      detailsFetched,
      existing: existing.length,
    });
  } catch (error) {
    console.error("[cron/oui-technologies]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
