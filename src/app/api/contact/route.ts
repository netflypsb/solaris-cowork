import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userEmail, subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    // Store message in Supabase
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        user_email: userEmail,
        subject,
        message,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      // Fallback to email if Supabase fails
      return await sendEmailFallback(userEmail, subject, message, userId);
    }

    console.log("Contact message stored in Supabase:", data);

    // Also try to send email notification
    await sendEmailNotification(userEmail, subject, message, userId);

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}

async function sendEmailNotification(
  userEmail: string,
  subject: string,
  message: string,
  userId: string
) {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.log("Email service not configured, message stored in database");
    return;
  }

  try {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Solaris Website <onboarding@resend.dev>",
        to: "solaris-app@outlook.com",
        reply_to: userEmail || undefined,
        subject: `[Solaris Feedback] ${subject}`,
        text: `From: ${userEmail || "Anonymous User"}\nUser ID: ${userId}\n\n${message}`,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend API error:", errorData);
    }
  } catch (error) {
    console.error("Email sending error:", error);
  }
}

async function sendEmailFallback(
  userEmail: string,
  subject: string,
  message: string,
  userId: string
) {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.log("Contact form submission (fallback):", {
      userEmail,
      subject,
      message,
      userId,
    });
    return NextResponse.json(
      { 
        success: true, 
        message: "Message received (database not configured)" 
      },
      { status: 200 }
    );
  }

  // Send email using Resend as fallback
  try {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Solaris Website <onboarding@resend.dev>",
        to: "solaris-app@outlook.com",
        reply_to: userEmail || undefined,
        subject: `[Solaris Feedback] ${subject}`,
        text: `From: ${userEmail || "Anonymous User"}\nUser ID: ${userId}\n\n${message}`,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend API error:", errorData);
      throw new Error("Failed to send email");
    }

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send message. Please try again later.");
  }
}
