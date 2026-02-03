import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PricingCard } from "@/components/PricingCard";

export default async function PricingPage() {
  const user = await currentUser();

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Pricing</h1>
        <p className="text-xl text-gray-600">
          Choose the plan that works for you
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <PricingCard
          name="Free"
          price="$0"
          period="forever"
          features={[
            "View directory (names + public links only)",
            "Basic search and filtering",
          ]}
          priceId={null}
          isPro={false}
        />
        <PricingCard
          name="Pro Monthly"
          price="$29"
          period="per month"
          features={[
            "Full directory access with emails",
            "Email templates",
            "Quarterly workflow",
            "Outreach logging",
            "Advanced filtering",
          ]}
          priceId={process.env.STRIPE_PRO_MONTHLY_PRICE_ID!}
          isPro={true}
        />
        <PricingCard
          name="Pro Annual"
          price="$290"
          period="per year"
          features={[
            "Full directory access with emails",
            "Email templates",
            "Quarterly workflow",
            "Outreach logging",
            "Advanced filtering",
            "Save $58 per year",
          ]}
          priceId={process.env.STRIPE_PRO_ANNUAL_PRICE_ID!}
          isPro={true}
        />
      </div>
    </div>
  );
}
