import { currentUser } from "@clerk/nextjs/server";
import { PricingCard } from "@/components/PricingCard";
import Link from "next/link";

export default async function PricingPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Simple pricing</h1>
          <p className="text-lg text-gray-500">
            Free to browse. Investor tier includes a 7-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <PricingCard
            name="Free"
            price="£0"
            period="forever"
            features={[
              "Browse all Oxford spinouts",
              "Activity feed",
              "IP Pipeline (pre-company tech)",
              "Sector and stage filters",
              "Search across 500+ companies",
            ]}
            priceId={null}
            isPro={false}
          />
          <PricingCard
            name="Investor"
            price="£99"
            period="per month"
            highlight={true}
            features={[
              "Everything in Free",
              "Full founder profiles + emails",
              "Deal alerts by sector or stage",
              "Weekly digest email",
              "Outreach templates + logging",
              "IP Pipeline licensing alerts",
            ]}
            priceId={process.env.STRIPE_PRO_MONTHLY_PRICE_ID || null}
            isPro={true}
            trialDays={7}
          />
          <PricingCard
            name="Investor Annual"
            price="£990"
            period="per year"
            features={[
              "Everything in Investor Monthly",
              "Save £198 vs monthly",
              "Priority data updates",
            ]}
            priceId={process.env.STRIPE_PRO_ANNUAL_PRICE_ID || null}
            isPro={true}
            trialDays={7}
          />
        </div>

        {/* FAQ / context */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-2xl mx-auto">
          <h3 className="text-base font-semibold text-gray-900 mb-4">What&apos;s the difference?</h3>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-medium text-gray-700">Free tier</dt>
              <dd className="text-gray-500 mt-1">
                See every Oxford spinout, browse the IP pipeline, and follow the activity feed.
                No credit card required. Perfect for staying aware of what&apos;s happening.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">Investor tier</dt>
              <dd className="text-gray-500 mt-1">
                Get founder contact details, set up deal alerts so new spinouts in your focus area
                land in your inbox, and track your outreach pipeline. Built for investors who are
                actively deploying into Oxford deals.
              </dd>
            </div>
          </dl>
          {!user && (
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <Link href="/sign-up" className="text-blue-600 hover:underline text-sm font-medium">
                Start free — no credit card required →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
