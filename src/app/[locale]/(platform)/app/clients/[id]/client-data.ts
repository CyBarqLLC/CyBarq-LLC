import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One client through the caller's RLS scoped client, once per request. */
export const getClientRecord = cache(async (id: string) => {
  if (!UUID.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("id, reference, name_en, name_ar, legal_name, country, city, address, tax_number, website, primary_contact_name, primary_contact_email, phone, status, notes, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  return data;
});

export type ClientRecord = NonNullable<Awaited<ReturnType<typeof getClientRecord>>>;
