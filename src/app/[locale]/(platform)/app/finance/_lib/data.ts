import "server-only";
import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/lib/supabase/database.types";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import type { ClientOption, ProjectOption } from "@/components/finance/document-form";

/** Today's date in Amman as yyyy-mm-dd. */
export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Amman", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/**
 * Marks issued or sent invoices whose due date has passed as overdue. One
 * UPDATE through the user's client: RLS restricts it to finance.write holders
 * and it is a no-op for everyone else.
 */
export async function markOverdueInvoices(supabase: SupabaseServerClient): Promise<void> {
  const { error } = await supabase.from("invoices").update({ status: "overdue" }).in("status", ["issued", "sent"]).lt("due_date", todayIso());
  if (error && error.code !== "42501") console.error("[finance] overdue sweep failed", error.message);
}

/** Escapes user input used inside a PostgREST `or` filter. */
function likeTerm(q: string): string {
  const cleaned = q.replace(/[,()%\\]/g, " ").trim();
  return `%${cleaned}%`;
}

export type QuoteListRow = Pick<Tables<"quotes">, "id" | "number" | "client_id" | "status" | "title_en" | "title_ar" | "total" | "currency" | "issue_date" | "valid_until" | "updated_at">;
export type InvoiceListRow = Pick<Tables<"invoices">, "id" | "number" | "client_id" | "status" | "title_en" | "title_ar" | "total" | "amount_paid" | "currency" | "issue_date" | "due_date" | "updated_at">;

type ListFilters = { status?: string; client?: string; q?: string; from: number; to: number };

const QUOTE_STATUSES: Enums<"quote_status">[] = ["draft", "sent", "accepted", "declined", "expired", "void"];
const INVOICE_STATUSES: Enums<"invoice_status">[] = ["draft", "issued", "sent", "partially_paid", "paid", "overdue", "void"];

export function isQuoteStatus(v: string | undefined): v is Enums<"quote_status"> {
  return v !== undefined && (QUOTE_STATUSES as string[]).includes(v);
}
export function isInvoiceStatus(v: string | undefined): v is Enums<"invoice_status"> {
  return v !== undefined && (INVOICE_STATUSES as string[]).includes(v);
}
export { QUOTE_STATUSES, INVOICE_STATUSES };

export async function listQuotes(supabase: SupabaseServerClient, f: ListFilters): Promise<{ rows: QuoteListRow[]; total: number }> {
  let query = supabase
    .from("quotes")
    .select("id, number, client_id, status, title_en, title_ar, total, currency, issue_date, valid_until, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(f.from, f.to);
  if (isQuoteStatus(f.status)) query = query.eq("status", f.status);
  if (f.client) query = query.eq("client_id", f.client);
  if (f.q) {
    const term = likeTerm(f.q);
    query = query.or(`number.ilike.${term},title_en.ilike.${term},title_ar.ilike.${term}`);
  }
  const { data, count, error } = await query;
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function listInvoices(supabase: SupabaseServerClient, f: ListFilters): Promise<{ rows: InvoiceListRow[]; total: number }> {
  let query = supabase
    .from("invoices")
    .select("id, number, client_id, status, title_en, title_ar, total, amount_paid, currency, issue_date, due_date, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(f.from, f.to);
  if (isInvoiceStatus(f.status)) query = query.eq("status", f.status);
  if (f.client) query = query.eq("client_id", f.client);
  if (f.q) {
    const term = likeTerm(f.q);
    query = query.or(`number.ilike.${term},title_en.ilike.${term},title_ar.ilike.${term}`);
  }
  const { data, count, error } = await query;
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export type ClientName = Pick<Tables<"clients">, "id" | "name_en" | "name_ar">;

/** Names for a set of client ids (RLS decides which are visible). */
export async function clientNames(supabase: SupabaseServerClient, ids: string[]): Promise<Map<string, ClientName>> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return new Map();
  const { data } = await supabase.from("clients").select("id, name_en, name_ar").in("id", unique);
  return new Map<string, ClientName>((data ?? []).map((c) => [c.id, c] as [string, ClientName]));
}

export function clientLabel(map: Map<string, ClientName>, id: string, locale: Locale): string {
  const c = map.get(id);
  return c ? pick(c, "name", locale) : "";
}

export async function clientOptions(supabase: SupabaseServerClient, locale: Locale): Promise<ClientOption[]> {
  const { data } = await supabase.from("clients").select("id, name_en, name_ar").order("name_en");
  return (data ?? []).map((c) => ({ id: c.id, name: pick(c, "name", locale) }));
}

export async function projectOptions(supabase: SupabaseServerClient, locale: Locale): Promise<ProjectOption[]> {
  const { data } = await supabase.from("projects").select("id, code, name_en, name_ar, client_id").order("code");
  return (data ?? []).map((p) => ({ id: p.id, name: `${p.code} · ${pick(p, "name", locale)}`, client_id: p.client_id }));
}

/** Line items of a document, ordered. */
export async function quoteItems(supabase: SupabaseServerClient, quoteId: string) {
  const { data } = await supabase.from("quote_items").select("id, description_en, description_ar, quantity, unit_price, amount").eq("quote_id", quoteId).order("position");
  return data ?? [];
}

export async function invoiceItems(supabase: SupabaseServerClient, invoiceId: string) {
  const { data } = await supabase.from("invoice_items").select("id, description_en, description_ar, quantity, unit_price, amount").eq("invoice_id", invoiceId).order("position");
  return data ?? [];
}

export type AuditRow = Pick<Tables<"audit_logs">, "id" | "action" | "actor_email" | "created_at" | "metadata">;

/** Status history from the audit log. Returns nothing unless the viewer holds audit.read. */
export async function documentHistory(supabase: SupabaseServerClient, entityType: "invoice" | "quote" | "certificate", id: string, canRead: boolean): Promise<AuditRow[]> {
  if (!canRead) return [];
  const { data } = await supabase.from("audit_logs").select("id, action, actor_email, created_at, metadata").eq("entity_type", entityType).eq("entity_id", id).order("created_at", { ascending: false }).limit(50);
  return data ?? [];
}
