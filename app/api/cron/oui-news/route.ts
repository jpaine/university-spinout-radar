import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron";
import { prisma } from "@/lib/prisma";

const OUI_RSS_URL = "https://innovation.ox.ac.uk/feed/";

// Keywords that indicate a spinout/licensing story worth surfacing
const SPINOUT_KEYWORDS = [
  "spinout", "spin-out", "spin out",
  "licensing", "licence", "licensed",
  "commercialise", "commercialize",
  "founded", "startup", "start-up",
  "raised", "funding", "investment",
  "technology transfer",
];

function containsKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return SPINOUT_KEYWORDS.some((kw) => lower.includes(kw));
}

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

  for (const match of itemMatches) {
    const content = match[1];

    const title = content.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1] ??
                  content.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    const link = content.match(/<link>(.*?)<\/link>|<guid[^>]*>(.*?)<\/guid>/)?.[1] ?? "";
    const pubDate = content.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
    const description = content.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/)?.[1] ?? "";

    if (title && link) {
      items.push({ title: title.trim(), link: link.trim(), pubDate, description: description.trim() });
    }
  }

  return items;
}

export async function GET(req: NextRequest) {
  const authError = verifyCronSecret(req);
  if (authError) return authError;

  try {
    const response = await fetch(OUI_RSS_URL, {
      headers: { "User-Agent": "Oxford Deal Flow / feed aggregator" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `RSS fetch failed: ${response.status}` }, { status: 502 });
    }

    const xml = await response.text();
    const items = parseRssItems(xml);

    const university = await prisma.university.findUnique({ where: { slug: "oxford" } });
    if (!university) {
      return NextResponse.json({ error: "Oxford university not found" }, { status: 404 });
    }

    let created = 0;
    let skipped = 0;

    for (const item of items) {
      // Only surface spinout/licensing relevant items
      const isRelevant = containsKeyword(item.title) || containsKeyword(item.description);
      if (!isRelevant) { skipped++; continue; }

      // Dedup by sourceUrl
      const existing = await prisma.feedItem.findFirst({
        where: { universityId: university.id, sourceUrl: item.link },
      });
      if (existing) { skipped++; continue; }

      // Strip HTML tags from description for summary
      const summary = item.description
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 280);

      await prisma.feedItem.create({
        data: {
          universityId: university.id,
          type: "news",
          title: item.title,
          summary: summary || null,
          sourceUrl: item.link,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        },
      });
      created++;
    }

    return NextResponse.json({
      ok: true,
      parsed: items.length,
      created,
      skipped,
    });
  } catch (error) {
    console.error("[cron/oui-news]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
