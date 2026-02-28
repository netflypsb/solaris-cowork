"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback, Suspense } from "react";
import {
  Key,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface KeyInfo {
  label: string | null;
  name: string;
  isActive: boolean;
  creditLimit: number | null;
  createdAt: string;
}

interface SubscriptionInfo {
  status: string;
  tier: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export default function ApiKeyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>}>
      <ApiKeyPageInner />
    </Suspense>
  );
}

function ApiKeyPageInner() {
  const { isLoaded } = useAuth();
  const searchParams = useSearchParams();
  const [keyInfo, setKeyInfo] = useState<KeyInfo | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null
  );
  const [hasSubscription, setHasSubscription] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkoutSuccess = searchParams.get("checkout") === "success";

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/user/subscription");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch status");
      }

      setHasSubscription(data.hasSubscription);
      setSubscription(data.subscription);
      setHasKey(data.apiKey?.hasKey || false);
      if (data.apiKey?.hasKey) {
        setKeyInfo({
          label: data.apiKey.label,
          name: data.apiKey.name,
          isActive: data.apiKey.isActive,
          creditLimit: data.apiKey.creditLimit,
          createdAt: data.apiKey.createdAt,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      fetchStatus();
    }
  }, [isLoaded, fetchStatus]);

  const generateKey = async () => {
    try {
      setGenerating(true);
      setError(null);
      setNewKey(null);

      const res = await fetch("/api/openrouter-key", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate key");
      }

      setNewKey(data.apiKey);
      setHasKey(true);
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const deleteKey = async () => {
    if (!confirm("Are you sure? This will permanently revoke your API key.")) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      const res = await fetch("/api/openrouter-key", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete key");
      }

      setHasKey(false);
      setKeyInfo(null);
      setNewKey(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPortalLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  // User doesn't have a subscription
  if (!hasSubscription) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            API Key Access
          </h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Subscribe to the Pro plan to get your own OpenRouter API key and
            unlock AI-powered capabilities.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">API Key</h1>
        <p className="text-gray-400">
          Manage your OpenRouter API key for AI-powered features.
        </p>
      </div>

      {/* Checkout success banner */}
      {checkoutSuccess && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-emerald-300 text-sm font-medium">
              Subscription activated!
            </p>
            <p className="text-emerald-200/70 text-xs mt-1">
              Your API key has been automatically generated.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Subscription status card */}
      {subscription && (
        <div className="mb-6 p-4 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">Subscription</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white capitalize">
                {subscription.tier} Plan
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  subscription.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-yellow-500/10 text-yellow-400"
                }`}
              >
                {subscription.status}
              </span>
            </div>
            {subscription.cancelAtPeriodEnd && (
              <p className="text-xs text-yellow-400 mt-1">
                Cancels at end of period
              </p>
            )}
          </div>
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="flex items-center gap-2 px-3 py-2 bg-[#2a2a3e] hover:bg-[#3a3a4e] text-gray-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            {portalLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <ExternalLink className="w-3 h-3" />
            )}
            Manage
          </button>
        </div>
      )}

      {/* Newly generated key — shown only once */}
      {newKey && (
        <div className="mb-6 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-emerald-300">
              Key Generated Successfully
            </h3>
          </div>
          <p className="text-sm text-emerald-200/70 mb-4">
            Copy your API key now. It will <strong>not</strong> be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/40 text-emerald-300 px-4 py-3 rounded-lg text-sm font-mono break-all">
              {newKey}
            </code>
            <button
              onClick={() => copyToClipboard(newKey)}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex-shrink-0"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Copy className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Key status card */}
      {hasKey && keyInfo ? (
        <div className="p-6 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{keyInfo.name}</h3>
                <p className="text-sm text-gray-500">
                  Created {new Date(keyInfo.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                keyInfo.isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {keyInfo.isActive ? "Active" : "Disabled"}
            </span>
          </div>

          {keyInfo.label && (
            <div className="mb-4 p-3 bg-black/20 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Key Preview</p>
              <code className="text-sm text-gray-300 font-mono">
                {keyInfo.label}
              </code>
            </div>
          )}

          {keyInfo.creditLimit !== null && (
            <div className="mb-6 p-3 bg-black/20 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Credit Limit</p>
              <p className="text-sm text-white font-medium">
                ${keyInfo.creditLimit}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#2a2a3e]">
            <p className="text-xs text-gray-500">
              One key per account. Delete to regenerate.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={deleteKey}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {deleting ? "Revoking..." : "Revoke Key"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        !newKey && (
          <div className="p-6 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No API Key Yet
            </h3>
            <p className="text-gray-400 text-sm mb-2 max-w-sm mx-auto">
              Your API key should have been generated automatically with your
              subscription. If not, click below to generate one.
            </p>
            <p className="text-gray-500 text-xs mb-6">
              You&apos;ll receive one key with a pre-set credit limit.
            </p>
            <button
              onClick={generateKey}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Generate API Key
                </>
              )}
            </button>
          </div>
        )
      )}

      {/* Usage info */}
      <div className="mt-8 p-4 bg-[#1a1a2e]/50 border border-[#2a2a3e] rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-2">
          How to use your API key
        </h4>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>
            • Use it as the{" "}
            <code className="text-indigo-400">Authorization</code> header:{" "}
            <code className="text-indigo-400">Bearer your-key</code>
          </li>
          <li>
            • Base URL:{" "}
            <code className="text-indigo-400">
              https://openrouter.ai/api/v1
            </code>
          </li>
          <li>• Compatible with OpenAI SDK — just change the base URL</li>
          <li>• Your key has a credit limit that resets based on your plan</li>
          <li>
            • Use the same account in the{" "}
            <strong className="text-gray-300">Solaris Desktop App</strong> to
            access AI features
          </li>
        </ul>
      </div>
    </div>
  );
}
