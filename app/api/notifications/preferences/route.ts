import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json(
    prefs ?? { weeklyDigest: true, newSpinoutAlert: false, email: null }
  );
}

export async function PUT(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { email, weeklyDigest, newSpinoutAlert } = body;

  const prefs = await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      email: email ?? null,
      weeklyDigest: weeklyDigest ?? true,
      newSpinoutAlert: newSpinoutAlert ?? false,
    },
    update: {
      ...(email !== undefined && { email }),
      ...(weeklyDigest !== undefined && { weeklyDigest }),
      ...(newSpinoutAlert !== undefined && { newSpinoutAlert }),
    },
  });

  return NextResponse.json(prefs);
}
