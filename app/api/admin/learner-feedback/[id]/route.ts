import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FeedbackError, staffIdentity } from "@/lib/feedback/server";

type Context = { params: Promise<{ id: string }> };
function validate(request: Request, id: string) {
  if (request.headers.get("origin") !== new URL(request.url).origin) throw new FeedbackError("Invalid origin.", 403);
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new FeedbackError("Invalid feedback ID.");
}
export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    validate(request, id);
    const { admin, user } = await staffIdentity("owner");
    const { action } = await request.json();
    if (action !== "approve") throw new FeedbackError("Invalid review action.");
    const row = await admin.from("learner_feedback").select("id, share_with_teacher, publish_consent, published_reflection_id").eq("id", id).maybeSingle();
    if (row.error) throw new FeedbackError("Unable to load feedback.");
    if (!row.data) throw new FeedbackError("Feedback not found. Refresh the page.", 404);
    const reviewed = await admin.rpc("moderate_learner_feedback", { p_id: id, p_owner: user.id, p_action: "review" });
    if (reviewed.error) throw new FeedbackError("Unable to approve feedback. Refresh and try again.");
    revalidatePath("/[locale]", "layout");
    // The existing RPC verifies publication permission again in the database.
    if (row.data.share_with_teacher && row.data.publish_consent && !row.data.published_reflection_id) {
      const published = await admin.rpc("moderate_learner_feedback", { p_id: id, p_owner: user.id, p_action: "publish" });
      if (published.error) throw new FeedbackError("Teacher review was saved, but website publication failed. Retry Approve to finish.", 409);
      revalidatePath("/[locale]", "layout");
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof FeedbackError ? e.message : "Unable to approve feedback." }, { status: e instanceof FeedbackError ? e.status : 500 });
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    validate(request, id);
    const { admin } = await staffIdentity("owner");
    // Approved or published feedback must be managed directly in Supabase.
    // Both predicates are part of the DELETE to guard concurrent approval.
    const { data, error } = await admin.from("learner_feedback").delete().eq("id", id)
      .neq("review_status", "reviewed").is("published_reflection_id", null).select("id").maybeSingle();
    if (error) throw new FeedbackError("Unable to delete feedback. Refresh and try again.");
    if (!data) throw new FeedbackError("Feedback was not deleted. It may already be approved or removed. Approved feedback can only be removed through Supabase.", 409);
    revalidatePath("/[locale]", "layout");
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof FeedbackError ? e.message : "Unable to delete feedback." }, { status: e instanceof FeedbackError ? e.status : 500 });
  }
}
