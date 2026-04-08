import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { sendEmail } from "@/lib/email";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import React from "react";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only send for genuinely new accounts (created within the last 5 minutes)
    const isNewUser = Date.now() - user.createdAt < 5 * 60 * 1000;
    if (!isNewUser) {
      return NextResponse.json({ skipped: true, reason: "Account not new" });
    }

    const email = user.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ skipped: true, reason: "No email address" });
    }

    const firstName = user.firstName ?? "there";
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://university-spinout-radar.vercel.app";

    await sendEmail({
      to: email,
      subject: "Welcome to Oxford Deal Flow",
      react: React.createElement(WelcomeEmail, { firstName, appUrl }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[welcome-email]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
