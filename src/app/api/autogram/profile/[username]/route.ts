import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "../../_lib/auth";
import { getProfileByUsername } from "../../_lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const userId = await authenticateRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileByUsername(params.username);
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[Autogram] Get profile by username error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
