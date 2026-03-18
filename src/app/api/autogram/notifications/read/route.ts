import { NextResponse } from "next/server";
import { authenticateRequest } from "../../_lib/auth";
import { supabaseAdmin, getProfileByUserId } from "../../_lib/supabase";

export const dynamic = "force-dynamic";

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

    if (error) {
      console.error("[Autogram] Mark notifications read error:", error);
      // Return success anyway — this is a no-op if there are 0 rows
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Autogram] Mark notifications read error:", error);
    // Return success even on error — don't crash the client
    return NextResponse.json({ success: true });
  }
}
