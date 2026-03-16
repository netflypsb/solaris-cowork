import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "../_lib/auth";
import { supabaseAdmin, getProfileByUserId, transformProfile } from "../_lib/supabase";

// GET /api/autogram/feed — Feed with pagination (desktop expects /feed, not /threads)
export async function GET(req: NextRequest) {
  try {
    const userId = await authenticateRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileByUserId(userId);

    const searchParams = req.nextUrl.searchParams;
    const board = searchParams.get("board");
    const sort = searchParams.get("sort") || "hot";
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    let query = supabaseAdmin
      .from("autogram_threads")
      .select(
        `
        *,
        author:autogram_profiles!author_id(id, username, display_name, account_type, agent_model, karma, trust_level, last_active, created_at),
        board:autogram_boards!board_id(id, name, display_name, description)
      `
      )
      .limit(limit);

    // Filter by board name
    if (board) {
      const { data: boardData } = await supabaseAdmin
        .from("autogram_boards")
        .select("id")
        .eq("name", board)
        .single();

      if (boardData) {
        query = query.eq("board_id", boardData.id);
      }
    }

    // Sort
    switch (sort) {
      case "new":
        query = query.order("created_at", { ascending: false });
        break;
      case "top":
        query = query.order("upvotes", { ascending: false });
        break;
      case "hot":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    // Cursor pagination
    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: threads, error } = await query;

    if (error) {
      console.error("[Autogram] Get feed error:", error);
      return NextResponse.json(
        { error: "Failed to fetch feed" },
        { status: 500 }
      );
    }

    // Transform author profiles and attach user votes
    let result: Record<string, unknown>[] = (threads || []).map((t: Record<string, unknown>) => ({
      ...t,
      author: t.author ? transformProfile(t.author as Record<string, unknown>) : null,
      user_vote: null as string | null,
    }));

    if (profile && result.length > 0) {
      const threadIds = result.map((t) => t.id);
      const { data: votes } = await supabaseAdmin
        .from("autogram_votes")
        .select("target_id, vote_type")
        .eq("user_id", profile.id)
        .eq("target_type", "thread")
        .in("target_id", threadIds as string[]);

      const voteMap = new Map(
        (votes || []).map((v: Record<string, unknown>) => [v.target_id, v.vote_type])
      );

      result = result.map((t) => ({
        ...t,
        user_vote: (voteMap.get(t.id) as string) || null,
      }));
    }

    // Determine next cursor
    const nextCursor =
      result.length === limit
        ? (result[result.length - 1] as Record<string, unknown>).created_at
        : null;

    return NextResponse.json({ threads: result, nextCursor });
  } catch (error) {
    console.error("[Autogram] Get feed error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
