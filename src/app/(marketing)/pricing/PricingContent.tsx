"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function PricingContent() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>}>
      <PricingContentInner />
    </Suspense>
  );
}

function PricingContentInner() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkoutCanceled = searchParams.get("checkout") === "canceled";

  // Check if the user already has an active subscription
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setCheckingSubscription(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/user/subscription");
        if (res.ok) {
          const data = await res.json();
          setHasSubscription(data.hasSubscription);
        }
      } catch {
        // ignore
      } finally {
        setCheckingSubscription(false);
      }
    })();
  }, [isLoaded, isSignedIn]);

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      router.push("/sign-up");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to open portal");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPortalLoading(false);
    }
  };

  const features = [
    ">100 AI models",
    "BYOK (Bring Your Own Key)",
    "Multiple AI Providers",
    "Desktop app access",
    "Priority support",
    "Key management dashboard",
  ];

  return (
    <div className="max-w-md mx-auto">
      {checkoutCanceled && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
          <p className="text-yellow-300 text-sm">
            Checkout was canceled. You can try again when you&apos;re ready.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Pro Plan Card */}
      <div className="relative p-8 bg-[#1a1a2e] border border-indigo-500/30 rounded-2xl overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/10 blur-3xl" />

        <div className="relative">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Pro Plan
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-white">$10</span>
              <span className="text-gray-400">/month</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              One AI to replace all your apps
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-indigo-400" />
                </div>
                <span className="text-sm text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          {!isLoaded || checkingSubscription ? (
            <div className="flex justify-center py-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          ) : hasSubscription ? (
            <div className="space-y-3">
              <Link
                href="/dashboard/api-key"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                <Check className="w-4 h-4" />
                You&apos;re Subscribed — Go to Dashboard
              </Link>
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#2a2a3e] hover:bg-[#3a3a4e] text-gray-300 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
              >
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                Manage Subscription
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting to Checkout...
                </>
              ) : isSignedIn ? (
                "Subscribe Now"
              ) : (
                "Sign Up & Subscribe"
              )}
            </button>
          )}
        </div>
      </div>

      {/* FAQ or note */}
      <p className="text-center text-xs text-gray-500 mt-6">
        Secure payment powered by Stripe. Cancel anytime.
      </p>
    </div>
  );
}
