import { z } from "zod";
import { optionalString, optionalUuid, uuid, optionalDate, dateString, localeEnum } from "./common";

export const CURRENCIES = ["JOD", "USD", "EUR", "SAR", "AED"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const currencyEnum = z.enum(CURRENCIES);

export const PAYMENT_METHODS = ["bank_transfer", "cash", "card", "cheque", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const percent = z.preprocess(
  (v) => (typeof v === "string" ? (v.trim() === "" ? 0 : Number(v.replace(/,/g, ""))) : v),
  z.number().finite().min(0).max(100),
);

const positiveNumber = z.preprocess((v) => (typeof v === "string" ? Number(v.replace(/,/g, "")) : v), z.number().finite().positive().max(1e9));
const nonNegativeNumber = z.preprocess((v) => (typeof v === "string" ? Number(v.replace(/,/g, "")) : v), z.number().finite().nonnegative().max(1e12));

/** Shared header fields of quotes and invoices while they are drafts. */
export const documentHeaderSchema = z.object({
  client_id: uuid,
  project_id: optionalUuid,
  language: localeEnum,
  currency: currencyEnum,
  tax_rate: percent,
  title_en: optionalString(200),
  title_ar: optionalString(200),
  notes_en: optionalString(4000),
  notes_ar: optionalString(4000),
  terms_en: optionalString(4000),
  terms_ar: optionalString(4000),
});

export const quoteHeaderSchema = documentHeaderSchema.extend({
  valid_until: optionalDate,
});

export const invoiceHeaderSchema = documentHeaderSchema.extend({
  due_date: optionalDate,
});

export type QuoteHeaderInput = z.infer<typeof quoteHeaderSchema>;
export type InvoiceHeaderInput = z.infer<typeof invoiceHeaderSchema>;

export const lineItemSchema = z.object({
  description_en: z.string().trim().min(1).max(500),
  description_ar: optionalString(500),
  quantity: positiveNumber,
  unit_price: nonNegativeNumber,
});
export type LineItemInput = z.infer<typeof lineItemSchema>;

export const lineItemsSchema = z.array(lineItemSchema).min(1).max(100);

/** Field names used by the line items editor (repeated per row). */
export const ITEM_FIELDS = {
  description_en: "item_description_en",
  description_ar: "item_description_ar",
  quantity: "item_quantity",
  unit_price: "item_unit_price",
} as const;

/**
 * Reads the repeated line item fields out of a FormData. Rows whose fields are
 * all empty are skipped so a blank trailing row never blocks a submit.
 */
export function readLineItems(formData: FormData): unknown[] {
  const asStrings = (key: string) => formData.getAll(key).map((v) => (typeof v === "string" ? v : ""));
  const en = asStrings(ITEM_FIELDS.description_en);
  const ar = asStrings(ITEM_FIELDS.description_ar);
  const qty = asStrings(ITEM_FIELDS.quantity);
  const price = asStrings(ITEM_FIELDS.unit_price);
  const rows: unknown[] = [];
  for (let i = 0; i < en.length; i++) {
    const row = { description_en: en[i] ?? "", description_ar: ar[i] ?? "", quantity: qty[i] ?? "", unit_price: price[i] ?? "" };
    if (row.description_en.trim() === "" && row.description_ar.trim() === "" && row.quantity.trim() === "" && row.unit_price.trim() === "") continue;
    rows.push(row);
  }
  return rows;
}

export const issueQuoteSchema = z.object({
  id: uuid,
  expected_updated_at: z.string().min(1),
  issue_date: optionalDate,
  valid_until: optionalDate,
});

export const issueInvoiceSchema = z.object({
  id: uuid,
  expected_updated_at: z.string().min(1),
  issue_date: optionalDate,
  due_date: optionalDate,
});

export const quoteStatusSchema = z.object({
  id: uuid,
  status: z.enum(["accepted", "declined", "expired"]),
});

export const voidSchema = z.object({
  id: uuid,
  reason: z.string().trim().min(3).max(500),
});

export const idSchema = z.object({ id: uuid });

export const paymentSchema = z.object({
  invoice_id: uuid,
  amount: positiveNumber,
  paid_at: dateString,
  method: z.enum(PAYMENT_METHODS),
  reference: optionalString(120),
  notes: optionalString(500),
});
export type PaymentInput = z.infer<typeof paymentSchema>;

export const removePaymentSchema = z.object({
  payment_id: uuid,
  reason: z.string().trim().min(3).max(500),
});
