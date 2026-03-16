import { NextResponse } from "next/server";
import { authenticateRequest } from "../_lib/auth";
import { supabaseAdmin } from "../_lib/supabase";

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

    return NextResponse.json({ boards });
  } catch (error) {
    console.error("[Autogram] Get boards error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
