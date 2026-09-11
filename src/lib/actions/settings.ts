"use server";

import { revalidatePath } from "next/cache";
import { requireViewer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { signedUploadUrl } from "@/lib/storage";
import { profileSchema, avatarRequestSchema, avatarSaveSchema, avatarExtension } from "@/lib/validation/settings";
import type { UploadTicket } from "@/components/ui/file-upload";

/** Own profile only. Protected columns (kind, email, is_active) are refused by a database trigger. */
export async function updateProfile(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireViewer();
    const input = profileSchema.parse(Object.fromEntries(formData));
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: input.full_name,
        full_name_ar: input.full_name_ar === undefined || input.full_name_ar === "" ? null : input.full_name_ar,
        phone: input.phone === undefined || input.phone === "" ? null : input.phone,
        locale: input.locale,
      })
      .eq("id", viewer.userId);
    if (error) throw error;
    revalidatePath("/[locale]/(platform)/app", "layout");
    revalidatePath("/[locale]/(portal)/portal", "layout");
    return ok(undefined);
  });
}

/** Avatars live in the public-content bucket under avatars/<user id>/. */
export async function requestAvatarUpload(file: { name: string; size: number; type: string }): Promise<ActionResult<UploadTicket>> {
  return runAction(async () => {
    const viewer = await requireViewer();
    const parsed = avatarRequestSchema.safeParse(file);
    if (!parsed.success) return fail("Choose a PNG, JPEG or WebP image up to 2 MB.", "VALIDATION");
    const path = `avatars/${viewer.userId}/${crypto.randomUUID()}.${avatarExtension(parsed.data.type)}`;
    const ticket = await signedUploadUrl("public-content", path);
    return ok(ticket);
  });
}

export async function saveAvatar(input: { path: string }): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireViewer();
    const { path } = avatarSaveSchema.parse(input);
    if (!path.startsWith(`avatars/${viewer.userId}/`)) return fail("Invalid file path.", "VALIDATION");
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", viewer.userId);
    if (error) throw error;
    revalidatePath("/[locale]/(platform)/app", "layout");
    revalidatePath("/[locale]/(portal)/portal", "layout");
    return ok(undefined);
  });
}

export async function removeAvatar(): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireViewer();
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update({ avatar_path: null }).eq("id", viewer.userId);
    if (error) throw error;
    revalidatePath("/[locale]/(platform)/app", "layout");
    revalidatePath("/[locale]/(portal)/portal", "layout");
    return ok(undefined);
  });
}
