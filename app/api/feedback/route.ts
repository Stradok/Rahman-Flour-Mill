import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subject, message, issueType } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const ownerEmail = "khawajaamman@gmail.com";
    const userEmail = (session.user as any).email || session.user.name;
    const userName = session.user.name || "Unknown User";
    const userRole = (session.user as any).role || "staff";

    const emailBody = `
Version Issue/Feedback Report
============================
From: ${userName} (${userRole})
Email: ${userEmail}
Type: ${issueType || "General"}
Subject: ${subject}

Message:
${message}

---
App Version: 0.1.0 (Beta)
Sent: ${new Date().toISOString()}
    `.trim();

    try {
      const mailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.SENDGRID_API_KEY || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: ownerEmail }],
              subject: `[Al Rehman] ${subject}`,
            },
          ],
          from: { email: "noreply@alrehmanmills.local", name: "Al Rehman Flour Mills" },
          content: [
            {
              type: "text/plain",
              value: emailBody,
            },
          ],
          reply_to: { email: userEmail },
        }),
      });

      if (!mailResponse.ok && process.env.SENDGRID_API_KEY) {
        return NextResponse.json(
          { error: "Failed to send feedback" },
          { status: 500 }
        );
      }
    } catch (emailErr) {
      console.log("Email service not available, but feedback received:", { subject, message });
    }

    return NextResponse.json({
      success: true,
      message: "Feedback received. Thank you for your report!",
    });
  } catch (err) {
    console.error("Feedback error:", err);
    return NextResponse.json(
      { error: "Failed to process feedback" },
      { status: 500 }
    );
  }
}
