import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

type ContactBody = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  contactMethod?: unknown;
  contactId?: unknown;
  level?: unknown;
  goal?: unknown;
  inquirySource?: unknown;
  turnstileToken?: unknown;
};

type TurnstileVerification = {
  success: boolean;
  "error-codes"?: string[];
};

function cleanText(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    let body: ContactBody;

    try {
      body = (await request.json()) as ContactBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request.",
        },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request.",
        },
        { status: 400 }
      );
    }

    const name = cleanText(body.name);
    const email = cleanText(body.email);
    const message = cleanText(body.message);
    const contactMethod = cleanText(
      body.contactMethod
    );
    const contactId = cleanText(body.contactId);
    const level = cleanText(body.level);
    const goal = cleanText(body.goal);
    const inquirySource = cleanText(
      body.inquirySource
    );
    const turnstileToken = cleanText(
  body.turnstileToken
);

    if (!name || !email || !message || !turnstileToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email, and message are required.",
        },
        { status: 400 }
      );
    }

    if (
      name.length > 100 ||
      email.length > 254 ||
      message.length > 5000 ||
      contactId.length > 254 ||
      level.length > 100 ||
      goal.length > 500
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "One or more fields are too long.",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    if (
      contactMethod !== "email" ||
      inquirySource !== "start-a-conversation"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request.",
        },
        { status: 400 }
      );
    }

    if (contactId !== email) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid contact information.",
        },
        { status: 400 }
      );
    }

    const safeName = escapeHtml(name);
const turnstileSecret =
  process.env.TURNSTILE_SECRET_KEY;

if (!turnstileSecret) {
  console.error(
    "TURNSTILE_SECRET_KEY is not configured."
  );

  return NextResponse.json(
    { success: false },
    { status: 500 }
  );
}

const verificationResponse = await fetch(
  "https://challenges.cloudflare.com/turnstile/v0/siteverify",
  {
    method: "POST",
    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret: turnstileSecret,
      response: turnstileToken,
    }),
    cache: "no-store",
  }
);

if (!verificationResponse.ok) {
  console.error(
    "Turnstile verification request failed:",
    verificationResponse.status
  );

  return NextResponse.json(
    { success: false },
    { status: 502 }
  );
}

const verification =
  (await verificationResponse.json()) as
    TurnstileVerification;

if (!verification.success) {
  console.warn(
    "Turnstile verification rejected the request.",
    verification["error-codes"] ?? []
  );

  return NextResponse.json(
    {
      success: false,
      error: "Security verification failed.",
    },
    { status: 403 }
  );
}
    const safeEmail = escapeHtml(email);
    const safeContactMethod =
      escapeHtml(contactMethod);
    const safeContactId = escapeHtml(contactId);
    const safeLevel = escapeHtml(level);
    const safeGoal = escapeHtml(goal);
    const safeInquirySource =
      escapeHtml(inquirySource);
    const safeMessage = escapeHtml(message)
      .replace(/\r?\n/g, "<br />");

    const { error: resendError } =
      await resend.emails.send({
        from: "Hamkke <hello@hamkkeenglish.com>",
        to: "hamkke.english@gmail.com",
        replyTo: email,
        subject: `New Hamkke Inquiry from ${name}`,
        html: `
          <h2>New Hamkke Inquiry</h2>

          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Preferred Contact Method:</strong> ${safeContactMethod}</p>
          <p><strong>Contact ID:</strong> ${safeContactId || "Not provided"}</p>
          <p><strong>English Level:</strong> ${safeLevel || "Not provided"}</p>
          <p><strong>Learning Goal:</strong> ${safeGoal || "Not provided"}</p>
          <p><strong>Inquiry Source:</strong> ${safeInquirySource}</p>

          <hr />

          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        `,
      });

    if (resendError) {
      console.error(
        "Contact email delivery error:",
        resendError
      );

      return NextResponse.json(
        { success: false },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Contact API error:",
      error
    );

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}