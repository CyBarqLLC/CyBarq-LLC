"use server";

import { revalidatePath } from "next/cache";
import { requireViewer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ok, runAction, type ActionResult } from "@/lib/actions/result";
import { uuid } from "@/lib/validation/common";

function revalidateNotifications() {
  revalidatePath("/[locale]/(platform)/app", "layout");
}

export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireViewer();
    const id = uuid.parse(notificationId);
    const supabase = await createClient();
    const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id).eq("user_id", viewer.userId).is("read_at", null);
    if (error) throw error;
    revalidateNotifications();
    return ok(undefined);
  });
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireViewer();
    const supabase = await createClient();
    const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", viewer.userId).is("read_at", null);
    if (error) throw error;
    revalidateNotifications();
    return ok(undefined);
  });
}
