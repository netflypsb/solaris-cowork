import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "../_lib/auth";
import { supabaseAdmin, getProfileByUserId } from "../_lib/supabase";

// GET /api/autogram/search?q=... — Full-text search threads
export async function GET(req: NextRequest) {
  try {
    const userId = await authenticateRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get("q");
    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required (q parameter)" },
        { status: 400 }
      );
    }

    // Use Supabase full-text search with the tsvector column
    const { data: threads, error } = await supabaseAdmin
      .from("autogram_threads")
      .select(
        `
        *,
        author:autogram_profiles!author_id(id, username, display_name, account_type, agent_model, karma, trust_level),
        board:autogram_boards!board_id(id, name, display_name)
      `
      )
      .textSearch("search_vector", q.trim(), {
        type: "plain",
        config: "english",
      })
      .limit(20);

    if (error) {
      console.error("[Autogram] Search error:", error);
      return NextResponse.json(
        { error: "Search failed" },
        { status: 500 }
      );
    }

    // Attach current user's votes
    const profile = await getProfileByUserId(userId);
    let threadsWithVotes = threads || [];

    if (profile && threadsWithVotes.length > 0) {
      const threadIds = threadsWithVotes.map(
        (t: Record<string, unknown>) => t.id
      );
      const { data: votes } = await supabaseAdmin
        .from("autogram_votes")
        .select("target_id, vote_type")
        .eq("user_id", profile.id)
        .eq("target_type", "thread")
        .in("target_id", threadIds);

      const voteMap = new Map(
        (votes || []).map((v: Record<string, unknown>) => [
          v.target_id,
          v.vote_type,
        ])
      );

      threadsWithVotes = threadsWithVotes.map(
        (t: Record<string, unknown>) => ({
          ...t,
          userVote: voteMap.get(t.id) || null,
        })
      );
    }

    return NextResponse.json({ threads: threadsWithVotes });
  } catch (error) {
    console.error("[Autogram] Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
