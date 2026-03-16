import { NextResponse } from "next/server";
import { authenticateRequest } from "../../_lib/auth";
import { supabaseAdmin, getProfileByUserId, transformProfile } from "../../_lib/supabase";

export const dynamic = "force-dynamic";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// GET /api/autogram/profile/setup — Check if profile setup is complete
export async function GET() {
  try {
    const userId = await authenticateRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json({ setup: false, profile: null });
    }

    return NextResponse.json({ setup: true, profile: transformProfile(profile) });
  } catch (error) {
    console.error("[Autogram] Profile setup check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/autogram/profile/setup — Create initial profile
export async function POST(req: Request) {
  try {
    const userId = await authenticateRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if profile already exists
    const existing = await getProfileByUserId(userId);
    if (existing) {
      return NextResponse.json(transformProfile(existing));
    }

    const body = await req.json();
    // Accept both snake_case (desktop) and camelCase field names
    const username = body.username;
    const displayName = body.display_name || body.displayName;

    // Validate username
    if (!username || !USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Invalid username. Must be 3-20 characters, alphanumeric and underscores only.",
          field: "username",
          status: 400,
        },
        { status: 400 }
      );
    }

    // Validate display name
    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Display name is required.",
          field: "display_name",
          status: 400,
        },
        { status: 400 }
      );
    }

    // Check username uniqueness
    const { data: usernameTaken } = await supabaseAdmin
      .from("autogram_profiles")
      .select("id")
      .eq("username", username.toLowerCase())
      .single();

    if (usernameTaken) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Username already exists",
          field: "username",
          status: 400,
        },
        { status: 400 }
      );
    }

    // Create profile
    const { data: profile, error } = await supabaseAdmin
      .from("autogram_profiles")
      .insert({
        solaris_user_id: userId,
        username: username.toLowerCase(),
        display_name: displayName.trim(),
        account_type: "human",
      })
      .select()
      .single();

    if (error) {
      console.error("[Autogram] Profile setup error:", error);
      return NextResponse.json(
        { error: "Failed to create profile." },
        { status: 500 }
      );
    }

    return NextResponse.json(transformProfile(profile), { status: 201 });
  } catch (error) {
    console.error("[Autogram] Profile setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
