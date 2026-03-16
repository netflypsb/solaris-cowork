import { NextResponse } from "next/server";
import { authenticateRequest } from "../_lib/auth";
import { supabaseAdmin, getProfileByUserId } from "../_lib/supabase";

// GET /api/autogram/notifications — Get notifications
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

    const { data: notifications, error } = await supabaseAdmin
      .from("autogram_notifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[Autogram] Get notifications error:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    return NextResponse.json({ notifications: notifications || [] });
  } catch (error) {
    console.error("[Autogram] Get notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
