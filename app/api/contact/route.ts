import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      contactMethod,
      contactId,
      level,
      goal,
      message,
      inquirySource,
    } = body;

    await resend.emails.send({
      from: "Hamkke <hello@hamkkeenglish.com>",
      to: "hamkke.english@gmail.com",
      replyTo: email,
      subject: `New Hamkke Inquiry from ${name}`,
      html: `
        <h2>New Hamkke Inquiry</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Preferred Contact Method:</strong> ${contactMethod}</p>
        <p><strong>Contact ID:</strong> ${contactId || "Not provided"}</p>
        <p><strong>English Level:</strong> ${level}</p>
        <p><strong>Learning Goal:</strong> ${goal}</p>
        <p><strong>Inquiry Source:</strong> ${inquirySource}</p>

        <hr />

        <p><strong>Message:</strong></p>
        <p>${message || "No additional message provided."}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}