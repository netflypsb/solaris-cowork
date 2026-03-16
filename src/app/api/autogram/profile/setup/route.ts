import { NextResponse } from "next/server";
import { authenticateRequest } from "../../_lib/auth";
import { supabaseAdmin, getProfileByUserId } from "../../_lib/supabase";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(req: Request) {
  try {
    const userId = await authenticateRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if profile already exists
    const existing = await getProfileByUserId(userId);
    if (existing) {
      return NextResponse.json(
        { error: "Profile already exists", profile: existing },
        { status: 409 }
      );
    }

    const { username, displayName } = await req.json();

    // Validate username
    if (!username || !USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        {
          error:
            "Invalid username. Must be 3-20 characters, alphanumeric and underscores only.",
        },
        { status: 400 }
      );
    }

    // Validate display name
    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json(
        { error: "Display name is required." },
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
        { error: "Username is already taken." },
        { status: 409 }
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

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("[Autogram] Profile setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
