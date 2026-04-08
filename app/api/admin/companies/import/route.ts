import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { universityId, rows } = await req.json();

    if (!universityId || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: "universityId and rows are required" },
        { status: 400 }
      );
    }

    let created = 0;
    let updated = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed, accounting for header row

      if (!row.name?.trim()) {
        errors.push({ row: rowNum, message: "name is required" });
        continue;
      }

      const slug = row.slug?.trim() || slugify(row.name.trim());
      if (!slug) {
        errors.push({ row: rowNum, message: "could not generate slug from name" });
        continue;
      }

      const tags = row.tags
        ? row.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];

      const data = {
        universityId,
        name: row.name.trim(),
        slug,
        description: row.description?.trim() || null,
        website: row.website?.trim() || null,
        linkedinUrl: row.linkedin?.trim() || null,
        tags,
        sector: row.sector?.trim() || null,
        fundingStage: row.fundingStage?.trim() || null,
        fundingRaised: row.fundingRaised?.trim() || null,
        investmentStatus: row.investmentStatus?.trim() || null,
        foundedDate: row.foundedDate?.trim()
          ? new Date(row.foundedDate.trim())
          : null,
      };

      try {
        const existing = await prisma.company.findFirst({
          where: { universityId, slug },
          select: { id: true },
        });

        if (existing) {
          await prisma.company.update({
            where: { id: existing.id },
            data: {
              name: data.name,
              description: data.description,
              website: data.website,
              linkedinUrl: data.linkedinUrl,
              tags: data.tags,
              sector: data.sector,
              fundingStage: data.fundingStage,
              fundingRaised: data.fundingRaised,
              investmentStatus: data.investmentStatus,
              foundedDate: data.foundedDate,
            },
          });
          updated++;
        } else {
          await prisma.company.create({ data });
          created++;
        }
      } catch (err) {
        errors.push({
          row: rowNum,
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({ created, updated, errors });
  } catch (error) {
    console.error("[admin/companies/import]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
