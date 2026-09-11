"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { createClient, type SupabaseServerClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/lib/supabase/database.types";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { formToObject } from "@/lib/validation/common";
import {
  quoteHeaderSchema,
  invoiceHeaderSchema,
  lineItemSchema,
  readLineItems,
  issueQuoteSchema,
  issueInvoiceSchema,
  quoteStatusSchema,
  voidSchema,
  idSchema,
  paymentSchema,
  type LineItemInput,
  type QuoteHeaderInput,
  type InvoiceHeaderInput,
} from "@/lib/validation/finance";
import { audit } from "@/lib/audit";
import { sendMail, mailLayout } from "@/lib/email/resend";
import { publicEnv } from "@/lib/env";
import { pick } from "@/i18n/bilingual";
import { z } from "zod";

type IdResult = ActionResult<{ id: string }>;
type Prev<T> = ActionResult<T> | null;

const draftItemsSchema = z.array(lineItemSchema).max(100);

function revalidateFinance() {
  revalidatePath("/[locale]/app/finance", "layout");
}

/** Parses the repeated line item fields; errors name the offending row. */
function parseItems(formData: FormData): { items: LineItemInput[] } | { error: ActionResult<never> } {
  const parsed = draftItemsSchema.safeParse(readLineItems(formData));
  if (parsed.success) return { items: parsed.data };
  const issue = parsed.error.issues[0];
  const first = issue?.path[0];
  const second = issue?.path[1];
  const row = typeof first === "number" ? first + 1 : 0;
  const field = typeof second === "string" ? second.replace("_", " ") : "";
  const message = row ? `Line ${row}${field ? ` (${field})` : ""}: ${issue?.message ?? "invalid value"}` : "Line items need attention.";
  return { error: fail(message, "VALIDATION") };
}

function quoteRow(h: QuoteHeaderInput): Omit<TablesInsert<"quotes">, "created_by"> {
  return {
    client_id: h.client_id,
    project_id: h.project_id ?? null,
    language: h.language,
    currency: h.currency,
    tax_rate: h.tax_rate,
    title_en: h.title_en ?? null,
    title_ar: h.title_ar ?? null,
    notes_en: h.notes_en ?? null,
    notes_ar: h.notes_ar ?? null,
    terms_en: h.terms_en ?? null,
    terms_ar: h.terms_ar ?? null,
    valid_until: h.valid_until ?? null,
  };
}

function invoiceRow(h: InvoiceHeaderInput): Omit<TablesInsert<"invoices">, "created_by"> {
  return {
    client_id: h.client_id,
    project_id: h.project_id ?? null,
    language: h.language,
    currency: h.currency,
    tax_rate: h.tax_rate,
    title_en: h.title_en ?? null,
    title_ar: h.title_ar ?? null,
    notes_en: h.notes_en ?? null,
    notes_ar: h.notes_ar ?? null,
    terms_en: h.terms_en ?? null,
    terms_ar: h.terms_ar ?? null,
    due_date: h.due_date ?? null,
  };
}

/** Replaces the items of a draft: delete existing rows, then insert. Triggers recalculate totals. */
async function replaceQuoteItems(supabase: SupabaseServerClient, quoteId: string, items: LineItemInput[]) {
  const { error: delError } = await supabase.from("quote_items").delete().eq("quote_id", quoteId);
  if (delError) throw delError;
  if (items.length === 0) return;
  const rows: TablesInsert<"quote_items">[] = items.map((it, i) => ({
    quote_id: quoteId,
    position: i,
    description_en: it.description_en,
    description_ar: it.description_ar ?? null,
    quantity: it.quantity,
    unit_price: it.unit_price,
  }));
  const { error } = await supabase.from("quote_items").insert(rows);
  if (error) throw error;
}

async function replaceInvoiceItems(supabase: SupabaseServerClient, invoiceId: string, items: LineItemInput[]) {
  const { error: delError } = await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
  if (delError) throw delError;
  if (items.length === 0) return;
  const rows: TablesInsert<"invoice_items">[] = items.map((it, i) => ({
    invoice_id: invoiceId,
    position: i,
    description_en: it.description_en,
    description_ar: it.description_ar ?? null,
    quantity: it.quantity,
    unit_price: it.unit_price,
  }));
  const { error } = await supabase.from("invoice_items").insert(rows);
  if (error) throw error;
}

async function loadQuote(supabase: SupabaseServerClient, id: string): Promise<Tables<"quotes"> | null> {
  const { data, error } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

async function loadInvoice(supabase: SupabaseServerClient, id: string): Promise<Tables<"invoices"> | null> {
  const { data, error } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

async function localePath(path: string): Promise<string> {
  const locale = await getLocale();
  return `/${locale}${path}`;
}

/* ------------------------------------------------------------------------ */
/* Quotes                                                                    */
/* ------------------------------------------------------------------------ */

export async function createQuote(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  const result = await runAction<{ id: string }>(async () => {
    const viewer = await requirePermission("finance.write", "action");
    const header = quoteHeaderSchema.parse(formToObject(formData));
    const parsed = parseItems(formData);
    if ("error" in parsed) return parsed.error;
    const supabase = await createClient();
    const { data, error } = await supabase.from("quotes").insert({ ...quoteRow(header), created_by: viewer.userId }).select("id").single();
    if (error) throw error;
    await replaceQuoteItems(supabase, data.id, parsed.items);
    revalidateFinance();
    return ok({ id: data.id });
  });
  if (result.ok) redirect(await localePath(`/app/finance/quotes/${result.data.id}`));
  return result;
}

export async function updateQuote(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  return runAction<{ id: string }>(async () => {
    await requirePermission("finance.write", "action");
    const { id } = idSchema.parse({ id: formData.get("id") });
    const header = quoteHeaderSchema.parse(formToObject(formData));
    const parsed = parseItems(formData);
    if ("error" in parsed) return parsed.error;
    const supabase = await createClient();
    const quote = await loadQuote(supabase, id);
    if (!quote) return fail("Not found.", "NOT_FOUND");
    if (quote.status !== "draft") return fail("Issued quotes cannot be edited. Void it and issue a new one.", "CONFLICT");
    const { error } = await supabase.from("quotes").update(quoteRow(header)).eq("id", id).eq("status", "draft");
    if (error) throw error;
    await replaceQuoteItems(supabase, id, parsed.items);
    revalidateFinance();
    return ok({ id });
  });
}

export async function issueQuote(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  return runAction<{ id: string }>(async () => {
    await requirePermission("finance.issue", "action");
    const input = issueQuoteSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("issue_quote", {
      _quote_id: input.id,
      _expected_updated_at: input.expected_updated_at,
      _issue_date: input.issue_date,
      _valid_until: input.valid_until,
    });
    if (error) throw error;
    revalidateFinance();
    return ok({ id: data.id });
  });
}

export async function setQuoteStatus(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  return runAction<{ id: string }>(async () => {
    await requirePermission("finance.write", "action");
    const input = quoteStatusSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.from("quotes").update({ status: input.status }).eq("id", input.id).eq("status", "sent").select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail("Only sent quotes can change to this status.", "CONFLICT");
    revalidateFinance();
    return ok({ id: input.id });
  });
}

export async function voidQuote(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  return runAction<{ id: string }>(async () => {
    await requirePermission("finance.issue", "action");
    const { id } = idSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("quotes")
      .update({ status: "void", pdf_path: null })
      .eq("id", id)
      .in("status", ["sent", "accepted", "declined", "expired"])
      .select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail("This quote cannot be voided in its current state.", "CONFLICT");
    revalidateFinance();
    return ok({ id });
  });
}

export async function deleteDraftQuote(_prev: Prev<undefined>, formData: FormData): Promise<ActionResult> {
  const result = await runAction<undefined>(async () => {
    await requirePermission("finance.write", "action");
    const { id } = idSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const { data, error } = await supabase.from("quotes").delete().eq("id", id).eq("status", "draft").select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail("Only drafts can be deleted.", "CONFLICT");
    revalidateFinance();
    return ok(undefined);
  });
  if (result.ok) redirect(await localePath("/app/finance/quotes"));
  return result;
}

/** Copies a quote (any status) into a new draft. */
export async function duplicateQuote(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  const result = await runAction<{ id: string }>(async () => {
    const viewer = await requirePermission("finance.write", "action");
    const { id } = idSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const source = await loadQuote(supabase, id);
    if (!source) return fail("Not found.", "NOT_FOUND");
    const { data: items, error: itemsError } = await supabase.from("quote_items").select("description_en, description_ar, quantity, unit_price").eq("quote_id", id).order("position");
    if (itemsError) throw itemsError;
    const { data, error } = await supabase
      .from("quotes")
      .insert({
        client_id: source.client_id,
        project_id: source.project_id,
        language: source.language,
        currency: source.currency,
        tax_rate: source.tax_rate,
        title_en: source.title_en,
        title_ar: source.title_ar,
        notes_en: source.notes_en,
        notes_ar: source.notes_ar,
        terms_en: source.terms_en,
        terms_ar: source.terms_ar,
        created_by: viewer.userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    await replaceQuoteItems(
      supabase,
      data.id,
      (items ?? []).map((it) => ({ description_en: it.description_en, description_ar: it.description_ar ?? undefined, quantity: Number(it.quantity), unit_price: Number(it.unit_price) })),
    );
    revalidateFinance();
    return ok({ id: data.id });
  });
  if (result.ok) redirect(await localePath(`/app/finance/quotes/${result.data.id}`));
  return result;
}

/** Turns an accepted quote into a draft invoice (header and items copied, quote linked). */
export async function convertQuoteToInvoice(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  const result = await runAction<{ id: string }>(async () => {
    const viewer = await requirePermission("finance.write", "action");
    const { id } = idSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const source = await loadQuote(supabase, id);
    if (!source) return fail("Not found.", "NOT_FOUND");
    if (source.status !== "accepted") return fail("Only accepted quotes can be converted to an invoice.", "CONFLICT");
    const { data: items, error: itemsError } = await supabase.from("quote_items").select("description_en, description_ar, quantity, unit_price").eq("quote_id", id).order("position");
    if (itemsError) throw itemsError;
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        client_id: source.client_id,
        project_id: source.project_id,
        quote_id: source.id,
        language: source.language,
        currency: source.currency,
        tax_rate: source.tax_rate,
        title_en: source.title_en,
        title_ar: source.title_ar,
        notes_en: source.notes_en,
        notes_ar: source.notes_ar,
        terms_en: source.terms_en,
        terms_ar: source.terms_ar,
        created_by: viewer.userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    await replaceInvoiceItems(
      supabase,
      data.id,
      (items ?? []).map((it) => ({ description_en: it.description_en, description_ar: it.description_ar ?? undefined, quantity: Number(it.quantity), unit_price: Number(it.unit_price) })),
    );
    revalidateFinance();
    return ok({ id: data.id });
  });
  if (result.ok) redirect(await localePath(`/app/finance/invoices/${result.data.id}`));
  return result;
}

/* ------------------------------------------------------------------------ */
/* Invoices                                                                  */
/* ------------------------------------------------------------------------ */

export async function createInvoice(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  const result = await runAction<{ id: string }>(async () => {
    const viewer = await requirePermission("finance.write", "action");
    const header = invoiceHeaderSchema.parse(formToObject(formData));
    const parsed = parseItems(formData);
    if ("error" in parsed) return parsed.error;
    const supabase = await createClient();
    const { data, error } = await supabase.from("invoices").insert({ ...invoiceRow(header), created_by: viewer.userId }).select("id").single();
    if (error) throw error;
    await replaceInvoiceItems(supabase, data.id, parsed.items);
    revalidateFinance();
    return ok({ id: data.id });
  });
  if (result.ok) redirect(await localePath(`/app/finance/invoices/${result.data.id}`));
  return result;
}

export async function updateInvoice(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  return runAction<{ id: string }>(async () => {
    await requirePermission("finance.write", "action");
    const { id } = idSchema.parse({ id: formData.get("id") });
    const header = invoiceHeaderSchema.parse(formToObject(formData));
    const parsed = parseItems(formData);
    if ("error" in parsed) return parsed.error;
    const supabase = await createClient();
    const invoice = await loadInvoice(supabase, id);
    if (!invoice) return fail("Not found.", "NOT_FOUND");
    if (invoice.status !== "draft") return fail("Issued invoices cannot be edited. Void it and issue a replacement.", "CONFLICT");
    const { error } = await supabase.from("invoices").update(invoiceRow(header)).eq("id", id).eq("status", "draft");
    if (error) throw error;
    await replaceInvoiceItems(supabase, id, parsed.items);
    revalidateFinance();
    return ok({ id });
  });
}

export async function issueInvoice(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  return runAction<{ id: string }>(async () => {
    await requirePermission("finance.issue", "action");
    const input = issueInvoiceSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("issue_invoice", {
      _invoice_id: input.id,
      _expected_updated_at: input.expected_updated_at,
      _issue_date: input.issue_date,
      _due_date: input.due_date,
    });
    if (error) throw error;
    revalidateFinance();
    return ok({ id: data.id });
  });
}

export async function voidInvoice(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  return runAction<{ id: string }>(async () => {
    await requirePermission("finance.issue", "action");
    const input = voidSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("void_invoice", { _invoice_id: input.id, _reason: input.reason });
    if (error) throw error;
    // The stored PDF predates the void stamp; drop it so the next download re-renders.
    await supabase.from("invoices").update({ pdf_path: null }).eq("id", data.id);
    revalidateFinance();
    return ok({ id: data.id });
  });
}

export async function recordPayment(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  return runAction<{ id: string }>(async () => {
    const viewer = await requirePermission("finance.write", "action");
    const input = paymentSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const invoice = await loadInvoice(supabase, input.invoice_id);
    if (!invoice) return fail("Not found.", "NOT_FOUND");
    if (invoice.status === "draft" || invoice.status === "void") return fail("Payments can only be recorded against issued invoices.", "CONFLICT");
    const { data, error } = await supabase
      .from("payments")
      .insert({
        invoice_id: input.invoice_id,
        amount: input.amount,
        paid_at: input.paid_at,
        method: input.method,
        reference: input.reference ?? null,
        notes: input.notes ?? null,
        recorded_by: viewer.userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    // Paid and balance lines change: invalidate the stored PDF.
    await supabase.from("invoices").update({ pdf_path: null }).eq("id", input.invoice_id);
    await audit("payment.recorded", "invoice", input.invoice_id, { payment_id: data.id, amount: input.amount, method: input.method, currency: invoice.currency }, invoice.client_id);
    revalidateFinance();
    return ok({ id: data.id });
  });
}

/** Creates a new draft that copies an issued or void invoice and points back to it. */
export async function issueReplacement(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  const result = await runAction<{ id: string }>(async () => {
    const viewer = await requirePermission("finance.write", "action");
    const { id } = idSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const source = await loadInvoice(supabase, id);
    if (!source) return fail("Not found.", "NOT_FOUND");
    if (source.status === "draft") return fail("Drafts can be edited directly.", "CONFLICT");
    const { data: items, error: itemsError } = await supabase.from("invoice_items").select("description_en, description_ar, quantity, unit_price").eq("invoice_id", id).order("position");
    if (itemsError) throw itemsError;
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        client_id: source.client_id,
        project_id: source.project_id,
        quote_id: source.quote_id,
        replaces_invoice_id: source.id,
        language: source.language,
        currency: source.currency,
        tax_rate: source.tax_rate,
        title_en: source.title_en,
        title_ar: source.title_ar,
        notes_en: source.notes_en,
        notes_ar: source.notes_ar,
        terms_en: source.terms_en,
        terms_ar: source.terms_ar,
        created_by: viewer.userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    await replaceInvoiceItems(
      supabase,
      data.id,
      (items ?? []).map((it) => ({ description_en: it.description_en, description_ar: it.description_ar ?? undefined, quantity: Number(it.quantity), unit_price: Number(it.unit_price) })),
    );
    revalidateFinance();
    return ok({ id: data.id });
  });
  if (result.ok) redirect(await localePath(`/app/finance/invoices/${result.data.id}`));
  return result;
}

export async function deleteDraftInvoice(_prev: Prev<undefined>, formData: FormData): Promise<ActionResult> {
  const result = await runAction<undefined>(async () => {
    await requirePermission("finance.write", "action");
    const { id } = idSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const { data, error } = await supabase.from("invoices").delete().eq("id", id).eq("status", "draft").select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail("Only drafts can be deleted.", "CONFLICT");
    revalidateFinance();
    return ok(undefined);
  });
  if (result.ok) redirect(await localePath("/app/finance/invoices"));
  return result;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Emails the client's primary contact a link to the portal and marks the invoice as sent. */
export async function sendInvoiceToClient(_prev: Prev<{ email: string }>, formData: FormData): Promise<ActionResult<{ email: string }>> {
  return runAction<{ email: string }>(async () => {
    await requirePermission("finance.write", "action");
    const { id } = idSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const invoice = await loadInvoice(supabase, id);
    if (!invoice) return fail("Not found.", "NOT_FOUND");
    if (invoice.status !== "issued") return fail("Only issued invoices can be sent.", "CONFLICT");
    const { data: client, error: clientError } = await supabase.from("clients").select("name_en, name_ar, primary_contact_name, primary_contact_email").eq("id", invoice.client_id).maybeSingle();
    if (clientError) throw clientError;
    const email = client?.primary_contact_email?.trim();
    if (!client || !email) return fail("The client has no primary contact email. Add one on the client record first.", "VALIDATION");

    const locale = invoice.language;
    const base = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
    const link = `${base}/${locale}/portal/finance`;
    const number = invoice.number ?? "";
    const clientName = escapeHtml(pick(client, "name", locale));
    const contact = escapeHtml(client.primary_contact_name ?? "");
    const subject = locale === "ar" ? `فاتورة ${number} من سايبرق` : `Invoice ${number} from CyBarq`;
    const body =
      locale === "ar"
        ? `<p>${contact ? `مرحباً ${contact}،` : "مرحباً،"}</p><p>أصدرنا الفاتورة رقم <strong>${escapeHtml(number)}</strong> لصالح ${clientName}. يمكنكم الاطلاع عليها وتنزيلها من بوابة العملاء:</p><p><a href="${link}">${link}</a></p><p>شكراً لتعاملكم معنا.</p>`
        : `<p>${contact ? `Hello ${contact},` : "Hello,"}</p><p>Invoice <strong>${escapeHtml(number)}</strong> for ${clientName} has been issued. You can view and download it from the client portal:</p><p><a href="${link}">${link}</a></p><p>Thank you for working with us.</p>`;
    const text = locale === "ar" ? `أصدرنا الفاتورة رقم ${number}. يمكنكم الاطلاع عليها من بوابة العملاء: ${link}` : `Invoice ${number} has been issued. View it in the client portal: ${link}`;

    await sendMail({ to: email, subject, html: mailLayout(subject, body, locale), text });

    const { data, error } = await supabase.from("invoices").update({ status: "sent" }).eq("id", id).eq("status", "issued").select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail("The invoice changed while sending. Reload and try again.", "CONFLICT");
    await audit("invoice.sent", "invoice", id, { number, to: email }, invoice.client_id);
    revalidateFinance();
    return ok({ email });
  });
}
