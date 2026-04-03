import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/watchlist — list user's watched companies/sectors
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.watchlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

// POST /api/watchlist — add a watch
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { companyId, sector, fundingStage } = body;

  if (!companyId && !sector && !fundingStage) {
    return NextResponse.json({ error: "Provide companyId, sector, or fundingStage" }, { status: 400 });
  }

  // Check for duplicate
  const existing = await prisma.watchlist.findFirst({
    where: { userId: user.id, companyId: companyId ?? null, sector: sector ?? null },
  });
  if (existing) {
    return NextResponse.json(existing);
  }

  const item = await prisma.watchlist.create({
    data: { userId: user.id, companyId, sector, fundingStage },
  });

  return NextResponse.json(item, { status: 201 });
}

// DELETE /api/watchlist?id=xxx
export async function DELETE(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const companyId = searchParams.get("companyId");

  if (!id && !companyId) {
    return NextResponse.json({ error: "Provide id or companyId" }, { status: 400 });
  }

  if (id) {
    await prisma.watchlist.deleteMany({ where: { id, userId: user.id } });
  } else if (companyId) {
    await prisma.watchlist.deleteMany({ where: { companyId, userId: user.id } });
  }

  return NextResponse.json({ ok: true });
}
