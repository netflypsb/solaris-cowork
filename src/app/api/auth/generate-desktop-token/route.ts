import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createDesktopToken } from "@/lib/auth/desktop-token";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await createDesktopToken(userId);
    return NextResponse.json({ token });
  } catch (error) {
    console.error("[Generate Token] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
