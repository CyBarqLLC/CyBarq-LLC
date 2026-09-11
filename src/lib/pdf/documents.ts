import "server-only";
import type { Tables } from "@/lib/supabase/database.types";
import { pick } from "@/i18n/bilingual";
import { publicEnv } from "@/lib/env";
import { qrDataUrl } from "./qr";
import type { CertificateDocumentData, CommercialDocumentData, PartyBlock } from "./types";

type ClientRow = Pick<Tables<"clients">, "name_en" | "name_ar" | "legal_name" | "tax_number" | "address" | "city" | "country">;
type ItemRow = Pick<Tables<"invoice_items">, "description_en" | "description_ar" | "quantity" | "unit_price" | "amount">;

function party(client: ClientRow | null, language: "en" | "ar"): PartyBlock {
  if (!client) return { name: "" };
  return {
    name: pick(client, "name", language),
    legalName: client.legal_name,
    taxNumber: client.tax_number,
    address: client.address,
    city: client.city,
    country: client.country,
  };
}

function items(rows: ItemRow[], language: "en" | "ar"): CommercialDocumentData["items"] {
  return rows.map((r) => ({
    description: pick(r, "description", language),
    quantity: Number(r.quantity),
    unitPrice: Number(r.unit_price),
    amount: r.amount === null ? Number(r.quantity) * Number(r.unit_price) : Number(r.amount),
  }));
}

/** Maps an invoice row plus its items and client to the template input. */
export function invoiceDocumentData(
  invoice: Tables<"invoices">,
  itemRows: ItemRow[],
  client: ClientRow | null,
  refs: { replacesNumber?: string | null; quoteNumber?: string | null } = {},
): CommercialDocumentData {
  const language = invoice.language;
  return {
    kind: "invoice",
    language,
    number: invoice.number,
    status: invoice.status,
    title: pick(invoice, "title", language) || null,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    currency: invoice.currency,
    client: party(client, language),
    items: items(itemRows, language),
    subtotal: Number(invoice.subtotal),
    taxRate: Number(invoice.tax_rate),
    taxAmount: Number(invoice.tax_amount),
    total: Number(invoice.total),
    amountPaid: Number(invoice.amount_paid),
    notes: pick(invoice, "notes", language) || null,
    terms: pick(invoice, "terms", language) || null,
    replacesNumber: refs.replacesNumber ?? null,
    quoteNumber: refs.quoteNumber ?? null,
    voidReason: invoice.status === "void" ? invoice.void_reason : null,
  };
}

/** Maps a quote row plus its items and client to the template input. */
export function quoteDocumentData(quote: Tables<"quotes">, itemRows: ItemRow[], client: ClientRow | null): CommercialDocumentData {
  const language = quote.language;
  return {
    kind: "quote",
    language,
    number: quote.number,
    status: quote.status,
    title: pick(quote, "title", language) || null,
    issueDate: quote.issue_date,
    validUntil: quote.valid_until,
    currency: quote.currency,
    client: party(client, language),
    items: items(itemRows, language),
    subtotal: Number(quote.subtotal),
    taxRate: Number(quote.tax_rate),
    taxAmount: Number(quote.tax_amount),
    total: Number(quote.total),
    notes: pick(quote, "notes", language) || null,
    terms: pick(quote, "terms", language) || null,
  };
}

/** Public verification URL printed on the certificate and encoded in its QR code. */
export function certificateVerificationUrl(certificate: Pick<Tables<"certificates">, "language" | "verification_code">): string {
  const base = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  return `${base}/${certificate.language}/verify/${certificate.verification_code}`;
}

/** Maps a certificate row to the template input, generating the QR code. */
export async function certificateDocumentData(certificate: Tables<"certificates">): Promise<CertificateDocumentData> {
  const language = certificate.language;
  const verificationUrl = certificateVerificationUrl(certificate);
  const qr = await qrDataUrl(verificationUrl);
  return {
    language,
    type: certificate.type,
    status: certificate.status,
    certificateNo: certificate.certificate_no,
    recipientName: pick(certificate, "recipient_name", language),
    title: pick(certificate, "title", language),
    description: pick(certificate, "description", language) || null,
    programName: pick(certificate, "program_name", language) || null,
    roleTitle: pick(certificate, "role_title", language) || null,
    startDate: certificate.start_date,
    endDate: certificate.end_date,
    hours: certificate.hours === null ? null : Number(certificate.hours),
    issueDate: certificate.issue_date,
    signatoryName: pick(certificate, "signatory_name", language) || null,
    signatoryTitle: pick(certificate, "signatory_title", language) || null,
    verificationUrl,
    qrDataUrl: qr,
  };
}
