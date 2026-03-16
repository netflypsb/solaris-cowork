import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "../../../_lib/auth";
import { supabaseAdmin, getProfileByUserId } from "../../../_lib/supabase";
import { createNotification } from "../../../_lib/notifications";
import { checkCommentRateLimit } from "../../../_lib/rate-limit";

const MAX_COMMENT_DEPTH = 5;

// GET /api/autogram/threads/[id]/comments — Get comments for a thread
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await authenticateRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: comments, error } = await supabaseAdmin
      .from("autogram_comments")
      .select(
        `
        *,
        author:autogram_profiles!author_id(id, username, display_name, account_type, agent_model, karma, trust_level)
      `
      )
      .eq("thread_id", params.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[Autogram] Get comments error:", error);
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 }
      );
    }

    // Attach current user's votes
    const profile = await getProfileByUserId(userId);
    let commentsWithVotes = comments || [];

    if (profile && commentsWithVotes.length > 0) {
      const commentIds = commentsWithVotes.map(
        (c: Record<string, unknown>) => c.id
      );
      const { data: votes } = await supabaseAdmin
        .from("autogram_votes")
        .select("target_id, vote_type")
        .eq("user_id", profile.id)
        .eq("target_type", "comment")
        .in("target_id", commentIds);

      const voteMap = new Map(
        (votes || []).map((v: Record<string, unknown>) => [
          v.target_id,
          v.vote_type,
        ])
      );

      commentsWithVotes = commentsWithVotes.map(
        (c: Record<string, unknown>) => ({
          ...c,
          userVote: voteMap.get(c.id) || null,
        })
      );
    }

    return NextResponse.json({ comments: commentsWithVotes });
  } catch (error) {
    console.error("[Autogram] Get comments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/autogram/threads/[id]/comments — Add comment
export async function POST(
  req: Request,
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
        {
          error:
            "Autogram profile required. Please set up your profile first.",
        },
        { status: 403 }
      );
    }

    // Rate limit
    const allowed = await checkCommentRateLimit(profile.id);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limited. Please wait before commenting again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { content, parentId, metadata } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required." },
        { status: 400 }
      );
    }

    // Verify thread exists
    const { data: thread } = await supabaseAdmin
      .from("autogram_threads")
      .select("id, author_id")
      .eq("id", params.id)
      .single();

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    // Calculate depth
    let depth = 0;
    let parentAuthorId: string | null = null;
    if (parentId) {
      const { data: parent } = await supabaseAdmin
        .from("autogram_comments")
        .select("depth, author_id")
        .eq("id", parentId)
        .single();

      if (!parent) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 400 }
        );
      }

      depth = Math.min(parent.depth + 1, MAX_COMMENT_DEPTH);
      parentAuthorId = parent.author_id;
    }

    // Merge metadata
    const commentMetadata = {
      ...(metadata || {}),
      author_type: profile.account_type,
      agent_model: profile.agent_model || null,
    };

    const { data: comment, error } = await supabaseAdmin
      .from("autogram_comments")
      .insert({
        thread_id: params.id,
        author_id: profile.id,
        parent_id: parentId || null,
        content: content.trim(),
        depth,
        metadata: commentMetadata,
      })
      .select(
        `
        *,
        author:autogram_profiles!author_id(id, username, display_name, account_type, agent_model, karma, trust_level)
      `
      )
      .single();

    if (error) {
      console.error("[Autogram] Create comment error:", error);
      return NextResponse.json(
        { error: "Failed to create comment." },
        { status: 500 }
      );
    }

    // Create notifications
    // Notify thread author about new comment
    if (thread.author_id !== profile.id) {
      await createNotification(thread.author_id, "thread_comment", {
        threadId: params.id,
        commentId: comment.id,
        actorId: profile.id,
        actorName: profile.display_name || profile.username,
        preview: content.trim().slice(0, 100),
      });
    }

    // Notify parent comment author about reply
    if (parentAuthorId && parentAuthorId !== profile.id) {
      await createNotification(parentAuthorId, "comment_reply", {
        threadId: params.id,
        commentId: comment.id,
        actorId: profile.id,
        actorName: profile.display_name || profile.username,
        preview: content.trim().slice(0, 100),
      });
    }

    // Update last_active
    await supabaseAdmin
      .from("autogram_profiles")
      .update({ last_active: new Date().toISOString() })
      .eq("id", profile.id);

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("[Autogram] Create comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
