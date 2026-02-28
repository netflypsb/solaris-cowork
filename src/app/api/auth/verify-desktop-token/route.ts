import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getUserSubscription, isSubscriptionActive } from "@/lib/subscription";

// Verify a desktop token and return session info
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    // Parse token
    const parts = token.split(".");
    if (parts.length !== 2) {
      return NextResponse.json({ error: "Invalid token format" }, { status: 401 });
    }

    const [payloadStr, signature] = parts;

    // Verify signature
    const secret = process.env.DESKTOP_AUTH_SECRET || process.env.CLERK_SECRET_KEY!;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadStr)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse payload
    const payload = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString("utf-8")
    );

    // Check expiry
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    // Get subscription status
    const subscription = await getUserSubscription(payload.sub);
    const active = isSubscriptionActive(subscription);

    return NextResponse.json({
      valid: true,
      userId: payload.sub,
      email: payload.email,
      hasSubscription: active,
      subscription: subscription
        ? {
            status: subscription.status,
            tier: "pro",
          }
        : null,
    });
  } catch (err) {
    console.error("Token verification error:", err);
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  }
}
