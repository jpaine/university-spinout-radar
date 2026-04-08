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

    // Preload all companies for slug → id resolution (avoids N+1 queries)
    const allCompanies = await prisma.company.findMany({
      where: { universityId },
      select: { id: true, slug: true },
    });
    const companyMap = new Map(allCompanies.map((c) => [c.slug, c.id]));

    let created = 0;
    let updated = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed, accounting for header row

      if (!row.firstName?.trim() || !row.lastName?.trim()) {
        errors.push({ row: rowNum, message: "firstName and lastName are required" });
        continue;
      }

      const fullName = `${row.firstName.trim()} ${row.lastName.trim()}`;
      const slug = slugify(fullName);
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

      const companyId =
        row.companySlug?.trim() ? (companyMap.get(row.companySlug.trim()) ?? null) : null;

      const data = {
        universityId,
        firstName: row.firstName.trim(),
        lastName: row.lastName.trim(),
        slug,
        email: row.email?.trim() || null,
        companyId,
        linkedinUrl: row.linkedin?.trim() || null,
        tags,
        segment: row.segment?.trim() || null,
      };

      try {
        const existing = await prisma.person.findFirst({
          where: { universityId, slug },
          select: { id: true },
        });

        if (existing) {
          await prisma.person.update({
            where: { id: existing.id },
            data: {
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              companyId: data.companyId,
              linkedinUrl: data.linkedinUrl,
              tags: data.tags,
              segment: data.segment,
            },
          });
          updated++;
        } else {
          await prisma.person.create({ data });
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
    console.error("[admin/people/import]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
