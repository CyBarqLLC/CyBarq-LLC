"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ok, fail, runAction, type ActionResult } from "@/lib/actions/result";
import { actionError } from "@/lib/actions/messages";
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
  removePaymentSchema,
  type LineItemInput,
} from "@/lib/validation/finance";
import { audit } from "@/lib/audit";
import { sendMail, renderEmail } from "@/lib/email/resend";
import { siteUrl } from "@/lib/env";
import { pick } from "@/i18n/bilingual";
import { formatMoney, formatDate } from "@/lib/utils/format";

type IdResult = ActionResult<{ id: string }>;
type Prev<T> = ActionResult<T> | null;

const draftItemsSchema = z.array(lineItemSchema).max(100);
const expectedSchema = z.object({ expected_updated_at: z.string().max(64).optional() });

function revalidateFinance() {
  revalidatePath("/[locale]/(platform)/app/finance", "layout");
}

async function localePath(path: string): Promise<string> {
  const locale = await getLocale();
  return `/${locale}${path}`;
}

/** Parses the repeated line item fields; the message names the row that needs attention. */
async function parseItems(formData: FormData): Promise<{ items: LineItemInput[] } | { error: ActionResult<never> }> {
  const parsed = draftItemsSchema.safeParse(readLineItems(formData));
  if (parsed.success) return { items: parsed.data };
  const t = await getTranslations("errors");
  const issue = parsed.error.issues[0];
  const first = issue?.path[0];
  const row = typeof first === "number" ? first + 1 : 0;
  return { error: fail(row ? t("lineItem", { row }) : t("lineItems"), "VALIDATION") };
}

function headerJson(header: z.infer<typeof quoteHeaderSchema> | z.infer<typeof invoiceHeaderSchema>) {
  return {
    client_id: header.client_id,
    project_id: header.project_id ?? "",
    language: header.language,
    currency: header.currency,
    tax_rate: header.tax_rate,
    title_en: header.title_en ?? "",
    title_ar: header.title_ar ?? "",
    notes_en: header.notes_en ?? "",
    notes_ar: header.notes_ar ?? "",
    terms_en: header.terms_en ?? "",
    terms_ar: header.terms_ar ?? "",
    valid_until: "valid_until" in header ? header.valid_until ?? "" : "",
    due_date: "due_date" in header ? header.due_date ?? "" : "",
  };
}

function itemsJson(items: LineItemInput[]) {
  return items.map((it) => ({ description_en: it.description_en, description_ar: it.description_ar ?? "", quantity: it.quantity, unit_price: it.unit_price }));
}

/* ------------------------------------------------------------------------ */
/* Quotes                                                                    */
/* ------------------------------------------------------------------------ */

/** Creates or updates a draft quote with all its items in one transaction. */
async function saveQuote(formData: FormData, mode: "create" | "update"): Promise<IdResult> {
  await requirePermission("finance.write", "action");
  const header = quoteHeaderSchema.parse(formToObject(formData));
  const parsed = await parseItems(formData);
  if ("error" in parsed) return parsed.error;
  const id = mode === "update" ? idSchema.parse({ id: formData.get("id") }).id : undefined;
  const { expected_updated_at } = expectedSchema.parse({ expected_updated_at: formData.get("expected_updated_at") ?? undefined });
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("save_quote", { _header: headerJson(header), _items: itemsJson(parsed.items), _id: id, _expected_updated_at: expected_updated_at || undefined });
  if (error) throw error;
  revalidateFinance();
  return ok({ id: data.id });
}

export async function createQuote(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  const result = await runAction(() => saveQuote(formData, "create"));
  if (result.ok) redirect(await localePath(`/app/finance/quotes/${result.data.id}`));
  return result;
}

export async function updateQuote(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  const result = await runAction(() => saveQuote(formData, "update"));
  if (result.ok) redirect(await localePath(`/app/finance/quotes/${result.data.id}`));
  return result;
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
    const { data, error } = await supabase.rpc("set_quote_status", { _quote_id: input.id, _status: input.status });
    if (error) throw error;
    revalidateFinance();
    return ok({ id: data.id });
  });
}

export async function voidQuote(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  return runAction<{ id: string }>(async () => {
    await requirePermission("finance.issue", "action");
    const { id } = idSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("set_quote_status", { _quote_id: id, _status: "void" });
    if (error) throw error;
    revalidateFinance();
    return ok({ id: data.id });
  });
}

export async function deleteDraftQuote(_prev: Prev<undefined>, formData: FormData): Promise<ActionResult> {
  const result = await runAction<undefined>(async () => {
    await requirePermission("finance.write", "action");
    const { id } = idSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const { data, error } = await supabase.from("quotes").delete().eq("id", id).eq("status", "draft").select("id");
    if (error) throw error;
    if (!data || data.length === 0) return fail(await actionError("onlyDraftsDeletable"), "CONFLICT");
    revalidateFinance();
    return ok(undefined);
  });
  if (result.ok) redirect(await localePath("/app/finance/quotes"));
  return result;
}

/** Copies a quote (any status) into a new draft. */
export async function duplicateQuote(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  const result = await runAction<{ id: string }>(async () => {
    await requirePermission("finance.write", "action");
    const { id } = idSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("duplicate_quote", { _quote_id: id });
    if (error) throw error;
    revalidateFinance();
    return ok({ id: data.id });
  });
  if (result.ok) redirect(await localePath(`/app/finance/quotes/${result.data.id}`));
  return result;
}

/** Turns an accepted quote into a draft invoice. Running it twice opens the same invoice. */
export async function convertQuoteToInvoice(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  const result = await runAction<{ id: string }>(async () => {
    await requirePermission("finance.write", "action");
    const { id } = idSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("convert_quote_to_invoice", { _quote_id: id });
    if (error) throw error;
    revalidateFinance();
    return ok({ id: data.id });
  });
  if (result.ok) redirect(await localePath(`/app/finance/invoices/${result.data.id}`));
  return result;
}

/* ------------------------------------------------------------------------ */
/* Invoices                                                                  */
/* ------------------------------------------------------------------------ */

async function saveInvoice(formData: FormData, mode: "create" | "update"): Promise<IdResult> {
  await requirePermission("finance.write", "action");
  const header = invoiceHeaderSchema.parse(formToObject(formData));
  const parsed = await parseItems(formData);
  if ("error" in parsed) return parsed.error;
  const id = mode === "update" ? idSchema.parse({ id: formData.get("id") }).id : undefined;
  const { expected_updated_at } = expectedSchema.parse({ expected_updated_at: formData.get("expected_updated_at") ?? undefined });
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("save_invoice", { _header: headerJson(header), _items: itemsJson(parsed.items), _id: id, _expected_updated_at: expected_updated_at || undefined });
  if (error) throw error;
  revalidateFinance();
  return ok({ id: data.id });
}

export async function createInvoice(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  const result = await runAction(() => saveInvoice(formData, "create"));
  if (result.ok) redirect(await localePath(`/app/finance/invoices/${result.data.id}`));
  return result;
}

export async function updateInvoice(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  const result = await runAction(() => saveInvoice(formData, "update"));
  if (result.ok) redirect(await localePath(`/app/finance/invoices/${result.data.id}`));
  return result;
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
    revalidateFinance();
    return ok({ id: data.id });
  });
}

/** Records a payment. The database locks the invoice, rejects overpayment and updates the status. */
export async function recordPayment(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  return runAction<{ id: string }>(async () => {
    await requirePermission("finance.write", "action");
    const input = paymentSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("record_payment", {
      _invoice_id: input.invoice_id,
      _amount: input.amount,
      _paid_at: input.paid_at,
      _method: input.method,
      _reference: input.reference,
      _notes: input.notes,
    });
    if (error) throw error;
    await audit("payment.recorded", "invoice", input.invoice_id, { payment_id: data.id, amount: input.amount, method: input.method });
    revalidateFinance();
    return ok({ id: data.id });
  });
}

/** Removes a payment recorded by mistake (with a reason, audited in the database). */
export async function removePayment(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  return runAction<{ id: string }>(async () => {
    await requirePermission("finance.issue", "action");
    const input = removePaymentSchema.parse(formToObject(formData));
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("remove_payment", { _payment_id: input.payment_id, _reason: input.reason });
    if (error) throw error;
    revalidateFinance();
    return ok({ id: data.id });
  });
}

/** Creates a draft copy of a void invoice that points back to it. Running it twice opens the same draft. */
export async function issueReplacement(_prev: Prev<{ id: string }>, formData: FormData): Promise<IdResult> {
  const result = await runAction<{ id: string }>(async () => {
    await requirePermission("finance.write", "action");
    const { id } = idSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("create_replacement_invoice", { _invoice_id: id });
    if (error) throw error;
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
    if (!data || data.length === 0) return fail(await actionError("onlyDraftsDeletable"), "CONFLICT");
    revalidateFinance();
    return ok(undefined);
  });
  if (result.ok) redirect(await localePath("/app/finance/invoices"));
  return result;
}

/**
 * Emails the client's primary contact a link to the invoice in the portal and
 * marks it as sent. The email carries an idempotency key, so a double click or
 * a retry delivers one message.
 */
export async function sendInvoiceToClient(_prev: Prev<{ email: string }>, formData: FormData): Promise<ActionResult<{ email: string }>> {
  return runAction<{ email: string }>(async () => {
    await requirePermission("finance.write", "action");
    const { id } = idSchema.parse({ id: formData.get("id") });
    const supabase = await createClient();
    const { data: invoice, error: loadError } = await supabase
      .from("invoices")
      .select("id, number, status, language, total, currency, due_date, client_id, client:clients(name_en, name_ar, primary_contact_name, primary_contact_email)")
      .eq("id", id)
      .maybeSingle();
    if (loadError) throw loadError;
    if (!invoice) return fail(await actionError("notFound"), "NOT_FOUND");
    if (invoice.status !== "issued" && invoice.status !== "sent") return fail(await actionError("invoiceNotSendable"), "CONFLICT");
    const client = invoice.client;
    const email = client?.primary_contact_email?.trim();
    if (!client || !email) return fail(await actionError("noPrimaryEmail"), "VALIDATION");

    const locale = invoice.language;
    const number = invoice.number ?? "";
    const link = `${siteUrl()}/${locale}/portal/finance`;
    const contact = client.primary_contact_name ?? "";
    const amount = formatMoney(invoice.total, invoice.currency, locale);
    const due = formatDate(invoice.due_date, locale, "long");
    const copy =
      locale === "ar"
        ? {
            subject: `فاتورة ${number} من سايبرق`,
            title: `الفاتورة ${number}`,
            paragraphs: [
              contact ? `مرحباً ${contact}،` : "مرحباً،",
              `أصدرنا الفاتورة رقم ${number} لصالح ${pick(client, "name", locale)} بقيمة ${amount}${due ? `، ويستحق سدادها في ${due}` : ""}.`,
              "يمكنكم الاطلاع عليها وتنزيل نسخة PDF من بوابة العملاء.",
            ],
            action: "عرض الفاتورة",
            note: "شكراً لتعاملكم مع سايبرق.",
          }
        : {
            subject: `Invoice ${number} from CyBarq`,
            title: `Invoice ${number}`,
            paragraphs: [
              contact ? `Hello ${contact},` : "Hello,",
              `We have issued invoice ${number} to ${pick(client, "name", locale)} for ${amount}${due ? `, due on ${due}` : ""}.`,
              "You can view it and download a PDF copy in the client portal.",
            ],
            action: "View invoice",
            note: "Thank you for working with CyBarq.",
          };
    const { html, text } = renderEmail({ locale, title: copy.title, paragraphs: copy.paragraphs, action: { label: copy.action, url: link }, note: copy.note });
    const mail = await sendMail({ to: email, subject: copy.subject, html, text, idempotencyKey: `invoice-sent/${invoice.id}/${number}` });
    if (!mail.sent) return fail(await actionError("emailNotSent"), "ERROR");

    const { error } = await supabase.rpc("mark_invoice_sent", { _invoice_id: id });
    if (error) throw error;
    await audit("invoice.sent", "invoice", id, { number, to: email }, invoice.client_id);
    revalidateFinance();
    return ok({ email });
  });
}
