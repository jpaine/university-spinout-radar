"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  priceId: string | null;
  isPro: boolean;
  highlight?: boolean;
  trialDays?: number;
}

export function PricingCard({
  name,
  price,
  period,
  features,
  priceId,
  isPro,
  highlight,
  trialDays,
}: PricingCardProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      router.push("/sign-in?redirect=/pricing");
      return;
    }

    if (!priceId) {
      return; // Free plan
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 503) {
          alert("Payment processing is not yet configured. Please contact support.");
        } else {
          alert(data.error || "Failed to start checkout. Please try again.");
        }
        return;
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = () => {
    if (loading) return "Loading...";
    if (!priceId && isPro) return "Coming Soon";
    if (!priceId) return "Current Plan";
    if (!isSignedIn) return "Sign in to start free trial";
    if (trialDays) return `Start ${trialDays}-day free trial`;
    return "Subscribe";
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-7 relative ${
        highlight ? "border-2 border-blue-500 shadow-blue-100" : "border border-gray-200"
      }`}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
      <div className="mb-1">
        <span className="text-4xl font-bold text-gray-900">{price}</span>
        <span className="text-gray-600 ml-2">{period}</span>
      </div>
      {isPro && trialDays && priceId && (
        <p className="text-xs text-green-600 font-medium mb-4">
          ✓ {trialDays}-day free trial — no card charged until day {trialDays + 1}
        </p>
      )}
      {(!isPro || !trialDays || !priceId) && <div className="mb-4" />}
      <ul className="mb-6 space-y-2">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <svg
              className="w-5 h-5 text-green-500 mr-2 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={handleSubscribe}
        disabled={loading || (!priceId && !isPro)}
        className={`w-full py-3 px-4 rounded-lg font-medium ${
          isPro
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-200 text-gray-900 hover:bg-gray-300"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {buttonLabel()}
      </button>
    </div>
  );
}
