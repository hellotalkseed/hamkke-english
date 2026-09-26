import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MODEL = "gemini-3.1-flash-lite";

const INTRO_INSTRUCTIONS = `
You are helping a Hamkke English teacher write a short signature line for their public teacher profile.

Transform the teacher's About Me into ONE warm, thoughtful public introduction.

STYLE:
- Warm, natural, reflective, and slightly poetic.
- Human and understated, not dramatic or flowery.
- It should feel personal rather than like marketing copy.
- Preserve the heart of what the teacher actually wrote.
- Prefer simple, memorable language.
- Aim for about 10 to 20 words.
- Two short sentences are allowed when they sound more natural.
- A gentle image of conversation, learning, finding one's voice, beginning, or growing may be used ONLY when it naturally reflects the About Me.

AVOID:
- Generic motivational quotes.
- Corporate or promotional language.
- Cliches.
- Exaggerated claims.
- Describing the teacher as caring, patient, passionate, experienced, friendly, inspiring, or similar unless the About Me clearly supports it.
- Inventing credentials, qualifications, teaching methods, specialties, personality traits, learner outcomes, achievements, or facts.
- Adding information that is not present in or reasonably expressed by the About Me.
- Simply copying or truncating a sentence from the About Me.

The line should sound like a thoughtful expression of the teacher's own teaching perspective, not an AI summary.

Return ONLY the introduction.
Do not add quotation marks, labels, explanations, alternatives, or markdown.
`;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle();

    if (
      !profile ||
      profile.role !== "teacher" ||
      profile.status !== "active"
    ) {
      return NextResponse.json(
        { error: "Teacher access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const about =
      typeof body?.about === "string"
        ? body.about.trim()
        : "";

    if (!about) {
      return NextResponse.json(
        {
          error:
            "Write your About Me before generating an introduction.",
        },
        { status: 400 }
      );
    }

    if (about.length > 5000) {
      return NextResponse.json(
        { error: "About Me is too long." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `${INTRO_INSTRUCTIONS}

Teacher's About Me:
"""
${about}
"""`;

    const response =
      await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
      });

    let introduction =
      response.text?.trim() ?? "";

    introduction = introduction
      .replace(/^["“”']+/, "")
      .replace(/["“”']+$/, "")
      .trim();

    if (!introduction) {
      return NextResponse.json(
        {
          error:
            "The AI did not return an introduction.",
        },
        { status: 500 }
      );
    }

    if (introduction.length > 300) {
      return NextResponse.json(
        {
          error:
            "The generated introduction was unexpectedly long. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      introduction,
    });
  } catch (error: any) {
    console.error(
      "Public introduction generation failed:",
      error
    );

    const message =
      typeof error?.message === "string"
        ? error.message
        : "Unable to generate an introduction.";

    const lower = message.toLowerCase();

    if (
      lower.includes("quota") ||
      lower.includes("resource_exhausted") ||
      lower.includes("429")
    ) {
      return NextResponse.json(
        {
          error:
            "AI generation is temporarily unavailable because the usage limit has been reached. Please try again later.",
        },
        { status: 429 }
      );
    }

    if (
      lower.includes("503") ||
      lower.includes("unavailable")
    ) {
      return NextResponse.json(
        {
          error:
            "AI generation is temporarily busy. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: message },
      {
        status:
          typeof error?.status === "number"
            ? error.status
            : 500,
      }
    );
  }
}
