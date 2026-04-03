import { NextRequest, NextResponse } from "next/server";

/**
 * Verify that a cron request is from Vercel (or an authorized manual trigger).
 * Returns a 401 response if unauthorized, or null if authorized.
 */
export function verifyCronSecret(req: NextRequest): NextResponse | null {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    // No secret configured — only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 401 });
    }
    return null;
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
