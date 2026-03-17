import { NextResponse } from "next/server";
import { authenticateRequest } from "../_lib/auth";
import { supabaseAdmin, getProfileByUserId } from "../_lib/supabase";
import { createNotification } from "../_lib/notifications";

export const dynamic = "force-dynamic";

// POST /api/autogram/vote — Vote on a thread or comment
export async function POST(req: Request) {
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

    const body = await req.json();
    // Accept both snake_case (desktop) and camelCase field names
    const targetType = body.target_type || body.targetType;
    const targetId = body.target_id || body.targetId;
    const voteType = body.vote_type || body.voteType;

    // Validate inputs
    if (!targetType || !["thread", "comment"].includes(targetType)) {
      return NextResponse.json(
        { error: 'target_type must be "thread" or "comment"' },
        { status: 400 }
      );
    }

    if (!targetId) {
      return NextResponse.json(
        { error: "target_id is required" },
        { status: 400 }
      );
    }

    if (!voteType || !["up", "down"].includes(voteType)) {
      return NextResponse.json(
        { error: 'vote_type must be "up" or "down"' },
        { status: 400 }
      );
    }

    // Check for existing vote
    const { data: existingVote } = await supabaseAdmin
      .from("autogram_votes")
      .select("id, vote_type")
      .eq("user_id", profile.id)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .single();

    let action: string;

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Same vote type — toggle off (remove vote)
        await supabaseAdmin
          .from("autogram_votes")
          .delete()
          .eq("id", existingVote.id);
        action = "removed";
      } else {
        // Different vote type — delete old and insert new (switch)
        await supabaseAdmin
          .from("autogram_votes")
          .delete()
          .eq("id", existingVote.id);

        await supabaseAdmin.from("autogram_votes").insert({
          user_id: profile.id,
          target_type: targetType,
          target_id: targetId,
          vote_type: voteType,
        });
        action = "switched";
      }
    } else {
      // No existing vote — insert new
      const { error } = await supabaseAdmin.from("autogram_votes").insert({
        user_id: profile.id,
        target_type: targetType,
        target_id: targetId,
        vote_type: voteType,
      });

      if (error) {
        console.error("[Autogram] Vote error:", error);
        return NextResponse.json(
          { error: "Failed to vote" },
          { status: 500 }
        );
      }
      action = "added";
    }

    // Notify content author on upvote (not on downvote, not on removal)
    if (action === "added" && voteType === "up") {
      let authorId: string | null = null;

      if (targetType === "thread") {
        const { data: thread } = await supabaseAdmin
          .from("autogram_threads")
          .select("author_id")
          .eq("id", targetId)
          .single();
        authorId = thread?.author_id || null;
      } else {
        const { data: comment } = await supabaseAdmin
          .from("autogram_comments")
          .select("author_id")
          .eq("id", targetId)
          .single();
        authorId = comment?.author_id || null;
      }

      if (authorId && authorId !== profile.id) {
        await createNotification(authorId, "vote", {
          targetType,
          targetId,
          actorId: profile.id,
          actorName: profile.display_name || profile.username,
        });
      }
    }

    return NextResponse.json({ action });
  } catch (error) {
    console.error("[Autogram] Vote error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
