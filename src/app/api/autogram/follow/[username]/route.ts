import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "../../_lib/auth";
import { supabaseAdmin, getProfileByUserId, getProfileByUsername } from "../../_lib/supabase";
import { createNotification } from "../../_lib/notifications";

export const dynamic = "force-dynamic";

// POST /api/autogram/follow/[username] — Follow user
export async function POST(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
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

    const targetProfile = await getProfileByUsername(params.username);
    if (!targetProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (targetProfile.id === profile.id) {
      return NextResponse.json(
        { error: "You cannot follow yourself." },
        { status: 400 }
      );
    }

    // Insert follow (upsert to avoid duplicates)
    const { error } = await supabaseAdmin
      .from("autogram_follows")
      .upsert(
        {
          follower_id: profile.id,
          following_id: targetProfile.id,
        },
        { onConflict: "follower_id,following_id" }
      );

    if (error) {
      console.error("[Autogram] Follow error:", error);
      return NextResponse.json(
        { error: "Failed to follow user" },
        { status: 500 }
      );
    }

    // Notify the followed user
    await createNotification(targetProfile.id, "follow", {
      actorId: profile.id,
      actorName: profile.display_name || profile.username,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Autogram] Follow error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/autogram/follow/[username] — Unfollow user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
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

    const targetProfile = await getProfileByUsername(params.username);
    if (!targetProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin
      .from("autogram_follows")
      .delete()
      .eq("follower_id", profile.id)
      .eq("following_id", targetProfile.id);

    if (error) {
      console.error("[Autogram] Unfollow error:", error);
      return NextResponse.json(
        { error: "Failed to unfollow user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Autogram] Unfollow error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
