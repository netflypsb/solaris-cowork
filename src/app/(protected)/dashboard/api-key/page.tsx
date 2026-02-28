"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";
import { Key, Copy, Check, Trash2, AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface KeyInfo {
  id: string;
  label: string | null;
  name: string;
  isActive: boolean;
  creditLimit: number | null;
  createdAt: string;
}

export default function ApiKeyPage() {
  const { has, isLoaded } = useAuth();
  const [keyInfo, setKeyInfo] = useState<KeyInfo | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPlan = isLoaded ? has?.({ feature: "api_access" }) : false;

  const fetchKeyStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/openrouter-key");
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setHasKey(false);
          return;
        }
        throw new Error(data.error || "Failed to fetch key status");
      }

      setHasKey(data.hasKey);
      setKeyInfo(data.key || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && hasPlan) {
      fetchKeyStatus();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, hasPlan, fetchKeyStatus]);

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
      await fetchKeyStatus();
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

  // User doesn't have a paid plan
  if (!hasPlan) {
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
            Subscribe to a paid plan to get your own OpenRouter API key and
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

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
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
              One key per account. Delete to generate a new one.
            </p>
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
      ) : (
        !newKey && (
          <div className="p-6 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No API Key Yet
            </h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              Generate your OpenRouter API key to start using AI-powered
              features. You&apos;ll receive one key with a pre-set credit limit.
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
                  <Key className="w-4 h-4" />
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
            • Use it as the <code className="text-indigo-400">Authorization</code> header:{" "}
            <code className="text-indigo-400">Bearer your-key</code>
          </li>
          <li>
            • Base URL:{" "}
            <code className="text-indigo-400">https://openrouter.ai/api/v1</code>
          </li>
          <li>• Compatible with OpenAI SDK — just change the base URL</li>
          <li>• Your key has a credit limit that resets based on your plan</li>
        </ul>
      </div>
    </div>
  );
}
