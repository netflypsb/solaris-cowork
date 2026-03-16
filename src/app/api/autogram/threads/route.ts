import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "../_lib/auth";
import { supabaseAdmin, getProfileByUserId } from "../_lib/supabase";
import { checkThreadRateLimit } from "../_lib/rate-limit";

// GET /api/autogram/threads — Feed with pagination
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
        author:autogram_profiles!author_id(id, username, display_name, account_type, agent_model, karma, trust_level),
        board:autogram_boards!board_id(id, name, display_name)
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
        // Supabase doesn't support computed column ordering directly,
        // so we order by upvotes desc as a reasonable approximation
        query = query.order("upvotes", { ascending: false });
        break;
      case "hot":
      default:
        // Order by created_at desc — hot ranking is done client-side or
        // via a materialized view for v1 we use recency + votes as proxy
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

    // Attach current user's votes if profile exists
    let threadsWithVotes = threads || [];
    if (profile && threadsWithVotes.length > 0) {
      const threadIds = threadsWithVotes.map((t: Record<string, unknown>) => t.id);
      const { data: votes } = await supabaseAdmin
        .from("autogram_votes")
        .select("target_id, vote_type")
        .eq("user_id", profile.id)
        .eq("target_type", "thread")
        .in("target_id", threadIds);

      const voteMap = new Map(
        (votes || []).map((v: Record<string, unknown>) => [v.target_id, v.vote_type])
      );

      threadsWithVotes = threadsWithVotes.map((t: Record<string, unknown>) => ({
        ...t,
        userVote: voteMap.get(t.id) || null,
      }));
    }

    // Determine next cursor
    const nextCursor =
      threadsWithVotes.length === limit
        ? (threadsWithVotes[threadsWithVotes.length - 1] as Record<string, unknown>).created_at
        : null;

    return NextResponse.json({ threads: threadsWithVotes, nextCursor });
  } catch (error) {
    console.error("[Autogram] Get feed error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/autogram/threads — Create thread
export async function POST(req: Request) {
  try {
    const userId = await authenticateRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json(
        { error: "Autogram profile required. Please set up your profile first." },
        { status: 403 }
      );
    }

    // Rate limit
    const allowed = await checkThreadRateLimit(profile.id);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limited. You can create one thread every 5 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { title, content, boardId, threadType, tags, metadata } = body;

    // Validate
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    if (!boardId) {
      return NextResponse.json(
        { error: "Board ID is required." },
        { status: 400 }
      );
    }

    // Verify board exists
    const { data: board } = await supabaseAdmin
      .from("autogram_boards")
      .select("id")
      .eq("id", boardId)
      .single();

    if (!board) {
      return NextResponse.json(
        { error: "Invalid board ID." },
        { status: 400 }
      );
    }

    // Merge metadata with author info
    const threadMetadata = {
      ...(metadata || {}),
      author_type: profile.account_type,
      agent_model: profile.agent_model || null,
    };

    const { data: thread, error } = await supabaseAdmin
      .from("autogram_threads")
      .insert({
        author_id: profile.id,
        board_id: boardId,
        title: title.trim(),
        content: content || "",
        thread_type: threadType || "discussion",
        tags: tags || [],
        metadata: threadMetadata,
      })
      .select(
        `
        *,
        author:autogram_profiles!author_id(id, username, display_name, account_type, agent_model, karma, trust_level),
        board:autogram_boards!board_id(id, name, display_name)
      `
      )
      .single();

    if (error) {
      console.error("[Autogram] Create thread error:", error);
      return NextResponse.json(
        { error: "Failed to create thread." },
        { status: 500 }
      );
    }

    // Update last_active
    await supabaseAdmin
      .from("autogram_profiles")
      .update({ last_active: new Date().toISOString() })
      .eq("id", profile.id);

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    console.error("[Autogram] Create thread error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
