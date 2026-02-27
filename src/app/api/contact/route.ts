import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

    // Create mailto link data
    const emailData = {
      to: "solaris-app@outlook.com",
      subject: `[Solaris Feedback] ${subject}`,
      body: `From: ${userEmail || "Anonymous User"}\nUser ID: ${userId}\n\n${message}`,
    };

    // In production, you would use a service like Resend, SendGrid, or Nodemailer
    // For now, we'll use a simple fetch to a serverless function or return success
    // Since we can't directly send emails from the browser, we'll use Resend API
    
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      // Fallback: Log to console for development
      console.log("Contact form submission:", emailData);
      return NextResponse.json(
        { 
          success: true, 
          message: "Message received (email service not configured)" 
        },
        { status: 200 }
      );
    }

    // Send email using Resend
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
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
