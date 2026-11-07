import { createAdminClient } from "@/lib/supabase/admin";
import { QR_BUCKET, QR_MAX_BYTES, requiredContactMethods, type ContactDrafts, type ContactDetails } from "./contactDetails";

export function parseContactDrafts(value: unknown): ContactDrafts {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: ContactDrafts = {};
  for (const key of ["kakaotalk", "wechat", "whatsapp", "line", "microsoft_teams"]) {
    const d = (value as Record<string, unknown>)[key];
    if (!d || typeof d !== "object" || Array.isArray(d)) continue;
    const item = d as Record<string, unknown>;
    result[key] = {
      mode: item.mode === "qr" ? "qr" : "id",
      text: typeof item.text === "string" ? item.text : "",
      useEmail: item.useEmail === true,
    };
  }
  return result;
}

export async function prepareQRImages(files: Record<string, File>, methods: string[], drafts: ContactDrafts) {
  const prepared: Record<string, { bytes: Buffer; type: string; extension: string }> = {};
  for (const method of methods) {
    if (drafts[method]?.mode !== "qr") continue;
    const file = files[method];
    if (!file || file.size < 1 || file.size > QR_MAX_BYTES) throw new Error("Invalid QR image.");
    const bytes = Buffer.from(await file.arrayBuffer());
    const png = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp = bytes.toString("ascii",0,4) === "RIFF" && bytes.toString("ascii",8,12) === "WEBP";
    const type = png ? "image/png" : jpg ? "image/jpeg" : webp ? "image/webp" : null;
    if (!type || type !== file.type) throw new Error("Invalid QR image.");
    prepared[method] = { bytes, type, extension: png ? "png" : jpg ? "jpg" : "webp" };
  }
  return prepared;
}

export async function saveContactDetails(
  admin: ReturnType<typeof createAdminClient>, method: string, platform: string, email: string,
  drafts: ContactDrafts, images: Awaited<ReturnType<typeof prepareQRImages>>, uploaded: string[]
): Promise<ContactDetails> {
  const details: ContactDetails = {};
  const batch = crypto.randomUUID();
  for (const key of requiredContactMethods(method, platform)) {
    const d = drafts[key];
    if (d.mode === "qr") {
      const image = images[key];
      const path = `${batch}/${key}.${image.extension}`;
      const { error } = await admin.storage.from(QR_BUCKET).upload(path, image.bytes, {
        contentType: image.type, upsert: false, cacheControl: "0",
      });
      if (error) throw new Error("Unable to store the QR image. Please try again.");
      uploaded.push(path);
      details[key] = { mode: "qr", value: null, qr_path: path };
    } else {
      let value = (key === "microsoft_teams" && d.useEmail ? email : d.text).trim();
      if (key === "whatsapp") value = value.replace(/[\s()-]/g, "");
      details[key] = { mode: "id", value, qr_path: null };
    }
  }
  return details;
}
