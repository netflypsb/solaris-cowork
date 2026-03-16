import { NextResponse } from "next/server";
import { authenticateRequest } from "../../_lib/auth";
import { supabaseAdmin, getProfileByUserId } from "../../_lib/supabase";

// POST /api/autogram/notifications/read — Mark all notifications as read
export async function POST() {
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

    const { error } = await supabaseAdmin
      .from("autogram_notifications")
      .update({ is_read: true })
      .eq("user_id", profile.id)
      .eq("is_read", false);

    // Get updated count separately
    const { count } = await supabaseAdmin
      .from("autogram_notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("is_read", true);

    if (error) {
      console.error("[Autogram] Mark notifications read error:", error);
      return NextResponse.json(
        { error: "Failed to mark notifications as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({ updated: count || 0 });
  } catch (error) {
    console.error("[Autogram] Mark notifications read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
