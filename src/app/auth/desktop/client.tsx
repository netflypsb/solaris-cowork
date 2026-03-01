"use client";

import { useAuth, useUser, SignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function DesktopAuthClient() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<
    "loading" | "signing-in" | "generating" | "redirecting" | "error"
  >("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      generateTokenAndRedirect();
    } else {
      setStatus("signing-in");
    }
  }, [isSignedIn, isLoaded, user]);

  const generateTokenAndRedirect = async () => {
    setStatus("generating");
    try {
      const res = await fetch("/api/auth/generate-desktop-token", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to generate authentication token");
      }

      const { token } = await res.json();
      setStatus("redirecting");

      // Redirect to the desktop app via custom protocol
      window.location.href = `solaris://auth/callback?token=${token}`;

      // Show a message in case the redirect doesn't work
      setTimeout(() => {
        setStatus("error");
        setError(
          "Could not open the Solaris desktop app. Please make sure the app is installed and try again."
        );
      }, 3000);
    } catch (err) {
      console.error("[Desktop Auth] Error:", err);
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "signing-in") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#0a0a0f]">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white">
            Sign in to Solaris
          </h1>
          <p className="text-gray-400 mt-2">
            Sign in to connect your Solaris account with the desktop app.
          </p>
        </div>
        <SignIn
          forceRedirectUrl="/auth/desktop"
        />
      </div>
    );
  }

  if (status === "generating") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-400">
            Connecting to desktop app...
          </p>
        </div>
      </div>
    );
  }

  if (status === "redirecting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-emerald-400"
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
          </div>
          <h2 className="text-xl font-semibold text-white">
            Authentication successful!
          </h2>
          <p className="text-gray-400 mt-2">
            Redirecting you to the Solaris desktop app...
          </p>
          <p className="text-sm text-gray-500 mt-4">
            If the app doesn&apos;t open automatically,{" "}
            <button
              onClick={generateTokenAndRedirect}
              className="text-indigo-400 underline"
            >
              click here to try again
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white">
          Something went wrong
        </h2>
        <p className="text-red-400 mt-2">{error}</p>
        <button
          onClick={generateTokenAndRedirect}
          className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
