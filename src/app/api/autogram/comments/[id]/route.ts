import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "../../_lib/auth";
import { supabaseAdmin, getProfileByUserId } from "../../_lib/supabase";

// DELETE /api/autogram/comments/[id] — Delete own comment
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
    const { data: comment } = await supabaseAdmin
      .from("autogram_comments")
      .select("author_id")
      .eq("id", params.id)
      .single();

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.author_id !== profile.id) {
      return NextResponse.json(
        { error: "You can only delete your own comments." },
        { status: 403 }
      );
    }

    const { error } = await supabaseAdmin
      .from("autogram_comments")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("[Autogram] Delete comment error:", error);
      return NextResponse.json(
        { error: "Failed to delete comment" },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[Autogram] Delete comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
