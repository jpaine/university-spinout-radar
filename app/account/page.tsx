import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSubscription } from "@/lib/subscription";
import { ManageBillingButton } from "@/components/ManageBillingButton";
import { NotificationPreferencesForm } from "@/components/NotificationPreferencesForm";
import { ProSuccessBanner } from "@/components/ProSuccessBanner";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const [subscription, params] = await Promise.all([
    getUserSubscription(user.id),
    searchParams,
  ]);

  const showSuccess = params.success === "true";

  const formatPlanName = (plan: string | null) => {
    if (plan === "pro_monthly") return "Pro Monthly";
    if (plan === "pro_annual") return "Pro Annual";
    return plan ?? "—";
  };

  const formatStatus = (status: string) => {
    if (status === "trialing") return "Free Trial";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account</h1>
      <ProSuccessBanner show={showSuccess} />

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
                  subscription.status === "active" || subscription.status === "trialing"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatStatus(subscription.status)}
              </span>
            </p>
            {subscription.plan && (
              <p>
                <span className="font-medium">Plan:</span> {formatPlanName(subscription.plan)}
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
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Billing Management
          </h2>
          <ManageBillingButton />
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Email Notifications
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Choose what you hear about and how often.
        </p>
        <NotificationPreferencesForm />
      </div>
    </div>
  );
}
