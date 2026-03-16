import { NextResponse } from "next/server";
import { authenticateRequest } from "../_lib/auth";
import { supabaseAdmin, transformBoard } from "../_lib/supabase";

export async function GET() {
  try {
    const userId = await authenticateRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: boards, error } = await supabaseAdmin
      .from("autogram_boards")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[Autogram] Get boards error:", error);
      return NextResponse.json(
        { error: "Failed to fetch boards" },
        { status: 500 }
      );
    }

    // Get thread counts per board
    const { data: counts } = await supabaseAdmin
      .from("autogram_threads")
      .select("board_id")
      .then(({ data }) => {
        const countMap: Record<string, number> = {};
        (data || []).forEach((t: Record<string, unknown>) => {
          const bid = t.board_id as string;
          countMap[bid] = (countMap[bid] || 0) + 1;
        });
        return { data: countMap };
      });

    const transformed = (boards || []).map((b: Record<string, unknown>) =>
      transformBoard(b, (counts as Record<string, number>)?.[b.id as string] || 0)
    );

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("[Autogram] Get boards error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
