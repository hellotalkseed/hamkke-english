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
    const safeMessage = escapeHtml(message)
      .replace(/\r?\n/g, "<br />");
    const optionalDetails = [
      { label: "English level", value: level },
      { label: "Learning goal", value: goal },
    ].filter((item) => item.value);
    const detailRows = [
      { label: "Name", value: name },
      { label: "Email", value: email },
      { label: "Preferred contact", value: "Email" },
      ...optionalDetails,
    ];
    const detailsHtml = detailRows.map((item) => `
      <tr>
        <td style="padding:8px 0;vertical-align:top;">
          <div style="font-size:12px;line-height:18px;color:#647568;">${escapeHtml(item.label)}</div>
          <div style="font-size:15px;line-height:23px;color:#293B30;overflow-wrap:anywhere;word-break:break-word;">${escapeHtml(item.value).replace(/\r?\n/g, "<br />")}</div>
        </td>
      </tr>`).join("");
    const subjectName = name.replace(/[\r\n]+/g, " ");

    const { error: resendError } =
      await resend.emails.send({
        from: "Hamkke <hello@hamkkeenglish.com>",
        to: "hamkke.english@gmail.com",
        replyTo: email,
        subject: `New Contact Message from ${subjectName} | Hamkke`,
        text: [
          "HAMKKE | 함께",
          "New Contact Message",
          "",
          ...detailRows.map((item) => `${item.label}: ${item.value}`),
          "",
          "Message",
          message,
          "",
          "Sent through the Hamkke contact form.",
          "Use Reply to respond directly to the sender.",
        ].join("\n"),
        html: `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#F4F5F0;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F5F0;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#FFFDF8;border:1px solid #DEE5D9;border-radius:16px;">
        <tr><td style="padding:28px 24px;background-color:#E8EEE2;border-bottom:1px solid #DEE5D9;border-radius:16px 16px 0 0;">
          <div style="font-size:13px;letter-spacing:2px;line-height:20px;color:#506B56;">HAMKKE | 함께</div>
          <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:27px;line-height:35px;font-weight:normal;color:#293B30;">New Contact Message</h1>
        </td></tr>
        <tr><td style="padding:20px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${detailsHtml}</table>
        </td></tr>
        <tr><td style="padding:0 24px 28px;">
          <h2 style="margin:0 0 12px;font-size:16px;line-height:24px;color:#293B30;">Message</h2>
          <div style="padding:18px;background-color:#F2F5EE;border:1px solid #DEE5D9;border-radius:10px;font-size:16px;line-height:26px;color:#293B30;overflow-wrap:anywhere;word-break:break-word;">${safeMessage}</div>
        </td></tr>
        <tr><td style="padding:18px 24px;border-top:1px solid #DEE5D9;font-size:12px;line-height:20px;color:#647568;">
          Sent through the Hamkke contact form.<br />Use Reply to respond directly to ${safeName} (${safeEmail}).
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
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