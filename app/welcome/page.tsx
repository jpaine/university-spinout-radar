import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DEFAULT_UNIVERSITY_SLUG } from "@/lib/university";

export default async function WelcomePage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Fire welcome email for brand-new users (signed up within the last 2 minutes)
  const isNewUser = Date.now() - user.createdAt < 2 * 60 * 1000;
  if (isNewUser) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    // Fire-and-forget — don't block page render
    fetch(`${appUrl}/api/welcome-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    }).catch(() => {});
  }

  const firstName = user.firstName ?? "there";
  const u = DEFAULT_UNIVERSITY_SLUG;

  const features = [
    {
      icon: "🔍",
      title: "Complete Directory",
      description:
        "Browse 500+ Oxford spinouts filtered by sector, funding stage, and founding date.",
      href: `/u/${u}/directory`,
      cta: "Browse directory",
    },
    {
      icon: "⚡",
      title: "Activity Feed",
      description:
        "Track funding rounds, new spinouts, and ecosystem events as they happen.",
      href: `/u/${u}/feed`,
      cta: "View feed",
    },
    {
      icon: "📋",
      title: "Quarterly Workflow",
      description:
        "Manage your outreach pipeline with email templates and contact tracking.",
      href: "/pricing",
      cta: "Unlock with Pro",
      isPro: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Account created
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Welcome, {firstName}!
          </h1>
          <p className="text-lg text-gray-500">
            Oxford Deal Flow tracks every spinout, funding round, and key contact
            from the University of Oxford ecosystem.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-semibold text-gray-900">{f.title}</h2>
                {f.isPro && (
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
                    Pro
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 flex-1 mb-4">{f.description}</p>
              <Link
                href={f.href}
                className={`text-sm font-medium text-center px-4 py-2 rounded-lg transition-colors ${
                  f.isPro
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {f.cta} →
              </Link>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <div className="text-center">
          <Link
            href={`/u/${u}/directory`}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors text-base"
          >
            Start exploring the directory →
          </Link>
          <p className="text-sm text-gray-400 mt-3">
            Or{" "}
            <Link href="/pricing" className="text-blue-600 hover:underline">
              upgrade to Pro
            </Link>{" "}
            to unlock emails, outreach templates, and deal alerts.
          </p>
        </div>
      </div>
    </div>
  );
}
