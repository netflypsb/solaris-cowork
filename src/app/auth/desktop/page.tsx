import { auth, currentUser } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-server";

// This page handles the desktop app auth flow:
// 1. If user is not signed in → show sign-in
// 2. If user is signed in → generate a short-lived token and show deep link

async function generateDesktopToken(userId: string, email: string): Promise<string> {
  const payload = {
    sub: userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 300, // 5 min expiry
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const secret = process.env.DESKTOP_AUTH_SECRET || process.env.CLERK_SECRET_KEY!;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadStr)
    .digest("base64url");

  const token = `${payloadStr}.${signature}`;

  // Store token hash for verification
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await supabaseAdmin.from("desktop_sessions").upsert(
    {
      clerk_user_id: userId,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 300 * 1000).toISOString(),
      is_active: true,
    },
    { onConflict: "clerk_user_id" }
  );

  return token;
}

export default async function DesktopAuthPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Sign in to Solaris Desktop
          </h1>
          <p className="text-gray-400 mb-8">
            Sign in with the same account you use on the website.
          </p>
          <SignIn
            routing="hash"
            forceRedirectUrl="/auth/desktop"
          />
        </div>
      </div>
    );
  }

  const user = await currentUser();
  const email =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress || user?.emailAddresses[0]?.emailAddress || "";

  const token = await generateDesktopToken(userId, email);
  const deepLink = `solaris://auth/callback?token=${encodeURIComponent(token)}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Authentication Successful
        </h1>
        <p className="text-gray-400 mb-6">
          Click the button below to open the Solaris desktop app.
        </p>
        <a
          href={deepLink}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          Open Solaris Desktop
        </a>
        <p className="text-xs text-gray-500 mt-4">
          If the app doesn&apos;t open automatically, make sure it&apos;s installed.
        </p>
        <p className="text-xs text-gray-600 mt-2">
          This link expires in 5 minutes.
        </p>
      </div>
    </div>
  );
}
