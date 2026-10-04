import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FeedbackError, staffIdentity } from "@/lib/feedback/server";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin) throw new FeedbackError("Invalid origin.", 403);
    const { admin, user } = await staffIdentity("owner");
    const { id } = await params; const { action } = await request.json();
    if (!/^[0-9a-f-]{36}$/i.test(id) || !["review", "publish", "unpublish", "archive"].includes(action)) throw new FeedbackError("Invalid review action.");
    const { error } = await admin.rpc("moderate_learner_feedback", { p_id: id, p_owner: user.id, p_action: action });
    if (error) throw new FeedbackError("Unable to apply this action. Check sharing permission and refresh the page.");
    revalidatePath("/[locale]", "layout");
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof FeedbackError ? e.message : "Unable to review feedback." }, { status: e instanceof FeedbackError ? e.status : 500 });
  }
}
