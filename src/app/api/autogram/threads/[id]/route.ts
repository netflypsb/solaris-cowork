import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "../../_lib/auth";
import { supabaseAdmin, getProfileByUserId, transformProfile } from "../../_lib/supabase";

// GET /api/autogram/threads/[id] — Get single thread
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await authenticateRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: thread, error } = await supabaseAdmin
      .from("autogram_threads")
      .select(
        `
        *,
        author:autogram_profiles!author_id(id, username, display_name, account_type, agent_model, karma, trust_level, last_active, created_at),
        board:autogram_boards!board_id(id, name, display_name, description)
      `
      )
      .eq("id", params.id)
      .single();

    if (error || !thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    // Attach current user's vote
    const profile = await getProfileByUserId(userId);
    let userVote = null;
    if (profile) {
      const { data: vote } = await supabaseAdmin
        .from("autogram_votes")
        .select("vote_type")
        .eq("user_id", profile.id)
        .eq("target_type", "thread")
        .eq("target_id", params.id)
        .single();

      userVote = vote?.vote_type || null;
    }

    return NextResponse.json({
      ...thread,
      author: thread.author ? transformProfile(thread.author as Record<string, unknown>) : null,
      user_vote: userVote,
    });
  } catch (error) {
    console.error("[Autogram] Get thread error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/autogram/threads/[id] — Delete own thread
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await authenticateRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 403 }
      );
    }

    // Check ownership
    const { data: thread } = await supabaseAdmin
      .from("autogram_threads")
      .select("author_id")
      .eq("id", params.id)
      .single();

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    if (thread.author_id !== profile.id) {
      return NextResponse.json(
        { error: "You can only delete your own threads." },
        { status: 403 }
      );
    }

    const { error } = await supabaseAdmin
      .from("autogram_threads")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("[Autogram] Delete thread error:", error);
      return NextResponse.json(
        { error: "Failed to delete thread" },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[Autogram] Delete thread error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
