import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      country,
      timezone,
      level,
      goal,
      message,
    } = body;

    await resend.emails.send({
      from: "Hamkke <onboarding@resend.dev>",
      to: "hamkke.english@gmail.com",
      replyTo: email,
      subject: `New Hamkke Inquiry from ${name}`,
      html: `
        <h2>New Hamkke Inquiry</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Time Zone:</strong> ${timezone}</p>
        <p><strong>English Level:</strong> ${level}</p>
        <p><strong>Learning Goal:</strong> ${goal}</p>

        <hr />

        <p>${message}</p>
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