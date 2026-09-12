import type { Tables } from "@/lib/supabase/database.types";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/i18n/bilingual";
import { publicEnv } from "@/lib/env";
import { company } from "@/content/site/company";
import { qrDataUrl } from "./qr";
import type { BiText, CertificateDocumentData, CommercialDocumentData, DocumentFooterData, PartyBlock } from "./types";

type ClientRow = Pick<Tables<"clients">, "name_en" | "name_ar" | "legal_name" | "tax_number" | "address" | "city" | "country">;
type ItemRow = Pick<Tables<"invoice_items">, "description_en" | "description_ar" | "quantity" | "unit_price" | "amount">;

/** Numbers of related records, looked up by the caller. */
export type CommercialRefs = {
  /** Invoice: number of the invoice this one replaces. */
  replacesNumber?: string | null;
  /** Invoice: number of the quote it came from. */
  quoteNumber?: string | null;
  /** Code of the linked project, if any. */
  projectCode?: string | null;
};

/** The company facts the footer prints. Defaults to the site's company file. */
export type CompanyFacts = {
  url: string;
  domain: string;
  emails: { general: string; sales: string; support: string };
  legalName: Record<Locale, string>;
  jordanLegalName: string;
  nationalNumber: string | null;
};

const NATIONAL_NUMBER_LABEL: Record<Locale, string> = { en: "Jordanian National Establishment No.", ar: "الرقم الوطني الأردني للمنشأة" };

/** Website QR, generated once per process and URL (it never changes between renders). */
const websiteQrCache = new Map<string, Promise<string>>();
function websiteQrDataUrl(url: string): Promise<string> {
  let pending = websiteQrCache.get(url);
  if (!pending) {
    pending = qrDataUrl(url).catch((error: unknown) => {
      websiteQrCache.delete(url);
      throw error;
    });
    websiteQrCache.set(url, pending);
  }
  return pending;
}

/**
 * Footer contents for one document. The Jordan registered name is legal and
 * tax material, so it goes on invoices and quotations only. `bilingual` prints
 * the English legal name, the Arabic registered name and the national
 * establishment number under both labels — one script per line.
 */
export async function documentFooterData(locale: Locale, options: { jordanLegalName: boolean; bilingual?: boolean; reference?: string | null }, facts: CompanyFacts = company): Promise<DocumentFooterData> {
  const legalLines = options.bilingual ? [facts.legalName.en] : [facts.legalName[locale]];
  if (options.jordanLegalName) legalLines.push(facts.jordanLegalName);
  if (facts.nationalNumber) {
    if (options.bilingual) {
      legalLines.push(`${NATIONAL_NUMBER_LABEL.en} ${facts.nationalNumber}`, `${NATIONAL_NUMBER_LABEL.ar} ${facts.nationalNumber}`);
    } else {
      legalLines.push(`${NATIONAL_NUMBER_LABEL[locale]} ${facts.nationalNumber}`);
    }
  }
  return {
    website: facts.domain,
    websiteUrl: facts.url,
    emails: [facts.emails.general, facts.emails.sales, facts.emails.support],
    legalLines,
    websiteQrDataUrl: await websiteQrDataUrl(facts.url),
    reference: options.reference ?? null,
  };
}

/**
 * Both wordings of a `_en` / `_ar` pair, for documents that print the two
 * languages together. Only one recorded wording is printed alone rather than
 * duplicated, and an Arabic line identical to the English one is dropped.
 */
function both<T extends Record<string, unknown>>(row: T, key: string): BiText | null {
  const value = (suffix: "en" | "ar") => {
    const v = row[`${key}_${suffix}`];
    return typeof v === "string" ? v.trim() : "";
  };
  const en = value("en");
  const ar = value("ar");
  if (!en && !ar) return null;
  if (!en) return { en: ar, ar: null };
  return { en, ar: ar && ar !== en ? ar : null };
}

const EMPTY: BiText = { en: "", ar: null };

function party(client: ClientRow | null): PartyBlock {
  if (!client) return { name: EMPTY };
  return {
    name: both(client, "name") ?? EMPTY,
    legalName: client.legal_name,
    taxNumber: client.tax_number,
    address: client.address,
    city: client.city,
    country: client.country,
  };
}

function items(rows: ItemRow[]): CommercialDocumentData["items"] {
  return rows.map((r) => ({
    description: both(r, "description") ?? EMPTY,
    quantity: Number(r.quantity),
    unitPrice: Number(r.unit_price),
    amount: r.amount === null ? Number(r.quantity) * Number(r.unit_price) : Number(r.amount),
  }));
}

/**
 * Maps an invoice row plus its items and client to the template input. The
 * document itself is bilingual whatever the recorded correspondence language.
 */
export async function invoiceDocumentData(invoice: Tables<"invoices">, itemRows: ItemRow[], client: ClientRow | null, refs: CommercialRefs = {}): Promise<CommercialDocumentData> {
  return {
    kind: "invoice",
    language: invoice.language,
    number: invoice.number,
    status: invoice.status,
    title: both(invoice, "title"),
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    currency: invoice.currency,
    client: party(client),
    items: items(itemRows),
    subtotal: Number(invoice.subtotal),
    taxRate: Number(invoice.tax_rate),
    taxAmount: Number(invoice.tax_amount),
    total: Number(invoice.total),
    amountPaid: Number(invoice.amount_paid),
    notes: both(invoice, "notes"),
    terms: both(invoice, "terms"),
    replacesNumber: refs.replacesNumber ?? null,
    quoteNumber: refs.quoteNumber ?? null,
    projectCode: refs.projectCode ?? null,
    voidReason: invoice.status === "void" ? invoice.void_reason : null,
    footer: await documentFooterData("en", { jordanLegalName: true, bilingual: true, reference: invoice.number }),
  };
}

/** Maps a quote row plus its items and client to the template input. */
export async function quoteDocumentData(quote: Tables<"quotes">, itemRows: ItemRow[], client: ClientRow | null, refs: Pick<CommercialRefs, "projectCode"> = {}): Promise<CommercialDocumentData> {
  return {
    kind: "quote",
    language: quote.language,
    number: quote.number,
    status: quote.status,
    title: both(quote, "title"),
    issueDate: quote.issue_date,
    validUntil: quote.valid_until,
    currency: quote.currency,
    client: party(client),
    items: items(itemRows),
    subtotal: Number(quote.subtotal),
    taxRate: Number(quote.tax_rate),
    taxAmount: Number(quote.tax_amount),
    total: Number(quote.total),
    notes: both(quote, "notes"),
    terms: both(quote, "terms"),
    projectCode: refs.projectCode ?? null,
    footer: await documentFooterData("en", { jordanLegalName: true, bilingual: true, reference: quote.number }),
  };
}

/** Public verification URL printed on the certificate and encoded in its QR code. */
export function certificateVerificationUrl(certificate: Pick<Tables<"certificates">, "language" | "verification_code">): string {
  const base = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  return `${base}/${certificate.language}/verify/${certificate.verification_code}`;
}

/** Maps a certificate row to the template input, generating the QR codes. */
export async function certificateDocumentData(certificate: Tables<"certificates">): Promise<CertificateDocumentData> {
  const language = certificate.language;
  const verificationUrl = certificateVerificationUrl(certificate);
  const [qr, footer] = await Promise.all([qrDataUrl(verificationUrl), documentFooterData(language, { jordanLegalName: false, reference: certificate.certificate_no })]);
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
    footer,
  };
}
