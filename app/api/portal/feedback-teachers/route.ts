import { NextResponse } from "next/server";
import { eligibleTeachers, FeedbackError } from "@/lib/feedback/server";
export async function GET(request: Request) {
  try {
    const studentId = new URL(request.url).searchParams.get("studentId") || "";
    if (!/^[0-9a-f-]{36}$/i.test(studentId)) throw new FeedbackError("Invalid learner.");
    return NextResponse.json({ teachers: await eligibleTeachers(studentId) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    return NextResponse.json({ error: "Unable to load feedback teachers." }, { status: e instanceof FeedbackError ? e.status : 500 });
  }
}
