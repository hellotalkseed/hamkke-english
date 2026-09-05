import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const MODEL = "gemini-3.1-flash-lite";

const POLISHING_INSTRUCTIONS = `
You are an assistant helping Hamkke English teachers polish their lesson notes and student observations.

Your task is to improve the teacher's original writing while preserving its exact meaning.

The goal is:

"A thoughtful teacher took their own notes and cleaned them up."

It should NOT sound like:

"An AI generated a standardized student evaluation."

POLISHING STANDARD:

1. Correct grammar, spelling, punctuation, word choice, and awkward phrasing.

2. Improve sentence structure, clarity, flow, and organization where needed.

3. Make the writing sound natural, warm, and professionally written.

4. Keep the writing personal and specific to the student.

5. Preserve every factual detail provided by the teacher.

6. Do NOT add information, observations, achievements, abilities, progress, participation, understanding, strengths, difficulties, or conclusions that the teacher did not write.

7. Do NOT exaggerate positive or negative observations.

8. Do NOT assume that a student understood something, improved, participated actively, performed well, or made progress unless the teacher explicitly stated it.

9. Preserve the teacher's level of certainty.

For example:

Teacher:
"Bin seemed interested in the topic."

Good:
"Bin seemed interested in the topic."

Bad:
"Bin showed strong interest and engagement in the topic."

The second version adds information that the teacher did not explicitly state.

10. Do NOT turn simple lesson notes into a standardized evaluation or formal academic report.

11. Avoid generic educational phrases such as:
- "demonstrated excellent communication skills"
- "showed significant improvement"
- "displayed strong comprehension"
- "actively participated"
- "made remarkable progress"

unless the teacher actually expressed that specific observation.

12. Keep the teacher's personal voice.

Natural phrases such as:
- "We talked about..."
- "We practiced..."
- "Bin seemed..."
- "I noticed..."
- "She had some difficulty with..."
are completely appropriate.

13. Do not make the writing unnecessarily formal.

14. Do not make a short note longer just to make it sound more professional.

15. Remove unnecessary repetition when doing so does not change the meaning.

16. Do not change the student's name.

17. Do not change lesson topics, examples, vocabulary, difficulties, activities, or other specific details.

18. If the original writing is already clear and natural, make only minimal changes.

19. Never invent missing information.

20. Preserve tentative language.

For example:

"She seemed interested."

should NOT become:

"She was very interested."

"She tried to use the new words."

should NOT become:

"She successfully used the new vocabulary."

"Bin was able to make a few sentences."

should NOT become:

"Bin demonstrated strong sentence construction skills."

The polished version should remain faithful to what the teacher actually observed.

Return ONLY the polished version.
`;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    console.log("=== HAMKKE GEMINI POLISH START ===");

    const apiKey = process.env.GEMINI_API_KEY;

    console.log("Gemini API key exists:", !!apiKey);
    console.log(
      "Gemini API key length:",
      apiKey ? apiKey.length : 0
    );

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is missing. Make sure it is in .env.local and restart the development server.",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const { lessonId } = await params;

    console.log("Lesson ID:", lessonId);

    if (!lessonId) {
      return NextResponse.json(
        {
          error: "Lesson ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const type = body?.type;
    const text = body?.text;

    console.log("Polish type:", type);

    if (
      type !== "notes" &&
      type !== "teacher_observation"
    ) {
      return NextResponse.json(
        {
          error: "Invalid polishing type.",
        },
        { status: 400 }
      );
    }

    if (typeof text !== "string") {
      return NextResponse.json(
        {
          error: "Text is required.",
        },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();

    console.log("Text length:", trimmedText.length);

    if (!trimmedText) {
      return NextResponse.json(
        {
          error:
            "Please write something before using AI polishing.",
        },
        { status: 400 }
      );
    }

    if (trimmedText.length > 10000) {
      return NextResponse.json(
        {
          error: "The text is too long to polish.",
        },
        { status: 400 }
      );
    }

    const fieldName =
      type === "notes"
        ? "Lesson Notes"
        : "Teacher Observation";

    const prompt = `
${POLISHING_INSTRUCTIONS}

The teacher is polishing the following ${fieldName}.

Lesson ID:
${lessonId}

Original teacher writing:

"""
${trimmedText}
"""

Now polish the teacher's writing.

IMPORTANT:

- Preserve the teacher's exact meaning.
- Preserve all facts.
- Do not invent information.
- Do not add student progress or abilities.
- Do not make assumptions.
- Do not exaggerate.
- Do not turn the writing into a formal evaluation.
- Keep the teacher's personal voice.
- Keep the result concise and natural.
- If the original is already clear, make only small corrections.
- Return ONLY the polished version.
`;

    console.log("Calling Gemini...");
    console.log("Model:", MODEL);

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    console.log("Gemini request completed.");

    const polishedText = response.text?.trim();

    console.log(
      "Polished text received:",
      !!polishedText
    );

    if (!polishedText) {
      console.error(
        "Gemini returned no output text.",
        response
      );

      return NextResponse.json(
        {
          error:
            "The AI did not return a polished version.",
        },
        { status: 500 }
      );
    }

    console.log("=== HAMKKE GEMINI POLISH SUCCESS ===");

    return NextResponse.json({
      success: true,
      polishedText,
    });
  } catch (error: any) {
    console.error("=== HAMKKE GEMINI POLISH ERROR ===");
    console.error(error);

    const status =
      typeof error?.status === "number"
        ? error.status
        : 500;

    const message =
      error?.message ||
      "Something went wrong while polishing the text.";

    console.error("Error message:", message);
    console.error("Error status:", status);
    console.error("Error code:", error?.code);
    console.error("Error type:", error?.type);

    if (status === 429) {
      return NextResponse.json(
        {
          error:
            "Gemini's free-tier usage limit has been reached temporarily. Please try again later.",
        },
        { status: 429 }
      );
    }

    if (status === 503) {
      return NextResponse.json(
        {
          error:
            "Gemini is temporarily busy. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: message,
        code: error?.code || null,
        type: error?.type || null,
      },
      {
        status,
      }
    );
  }
}