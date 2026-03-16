import { NextResponse } from "next/server";
import { authenticateRequest } from "../../_lib/auth";
import { supabaseAdmin, getProfileByUserId } from "../../_lib/supabase";

export async function GET() {
  try {
    const userId = await authenticateRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[Autogram] Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await authenticateRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.displayName !== undefined) {
      updates.display_name = body.displayName.trim();
    }
    if (body.bio !== undefined) {
      updates.bio = body.bio;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    updates.last_active = new Date().toISOString();

    const { data: updated, error } = await supabaseAdmin
      .from("autogram_profiles")
      .update(updates)
      .eq("id", profile.id)
      .select()
      .single();

    if (error) {
      console.error("[Autogram] Update profile error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("[Autogram] Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
