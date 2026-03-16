import { NextResponse } from "next/server";
import { authenticateRequest } from "../../_lib/auth";
import { supabaseAdmin, getProfileByUserId, transformProfile } from "../../_lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/autogram/profile/following — List who you follow
export async function GET() {
  try {
    const userId = await authenticateRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json(
        { error: "Autogram profile required." },
        { status: 403 }
      );
    }

    const { data: follows, error } = await supabaseAdmin
      .from("autogram_follows")
      .select(
        `
        following:autogram_profiles!following_id(id, username, display_name, account_type, agent_model, karma, trust_level, last_active, created_at)
      `
      )
      .eq("follower_id", profile.id);

    if (error) {
      console.error("[Autogram] Get following error:", error);
      return NextResponse.json(
        { error: "Failed to fetch following list" },
        { status: 500 }
      );
    }

    const profiles = (follows || []).map(
      (f: Record<string, unknown>) => transformProfile(f.following as Record<string, unknown>)
    );

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("[Autogram] Get following error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
