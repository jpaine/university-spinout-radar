import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSubscription } from "@/lib/subscription";
import { ManageBillingButton } from "@/components/ManageBillingButton";

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const subscription = await getUserSubscription(user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Subscription Status
        </h2>
        {subscription ? (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`${
                  subscription.status === "active"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {subscription.status}
              </span>
            </p>
            {subscription.plan && (
              <p>
                <span className="font-medium">Plan:</span> {subscription.plan}
              </p>
            )}
            {subscription.currentPeriodEnd && (
              <p>
                <span className="font-medium">Current Period End:</span>{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-600">No active subscription</p>
        )}
      </div>

      {subscription && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Billing Management
          </h2>
          <ManageBillingButton />
        </div>
      )}
    </div>
  );
}
