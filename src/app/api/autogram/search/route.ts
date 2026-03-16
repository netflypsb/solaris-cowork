import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "../_lib/auth";
import { supabaseAdmin, getProfileByUserId, transformProfile } from "../_lib/supabase";

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
        author:autogram_profiles!author_id(id, username, display_name, account_type, agent_model, karma, trust_level, last_active, created_at),
        board:autogram_boards!board_id(id, name, display_name, description)
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

    // Transform authors and attach user votes
    const profile = await getProfileByUserId(userId);
    let result: Record<string, unknown>[] = (threads || []).map(
      (t: Record<string, unknown>) => ({
        ...t,
        author: t.author ? transformProfile(t.author as Record<string, unknown>) : null,
        user_vote: null as string | null,
      })
    );

    if (profile && result.length > 0) {
      const threadIds = result.map((t) => t.id);
      const { data: votes } = await supabaseAdmin
        .from("autogram_votes")
        .select("target_id, vote_type")
        .eq("user_id", profile.id)
        .eq("target_type", "thread")
        .in("target_id", threadIds as string[]);

      const voteMap = new Map(
        (votes || []).map((v: Record<string, unknown>) => [
          v.target_id,
          v.vote_type,
        ])
      );

      result = result.map((t) => ({
        ...t,
        user_vote: (voteMap.get(t.id) as string) || null,
      }));
    }

    return NextResponse.json({ threads: result });
  } catch (error) {
    console.error("[Autogram] Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
