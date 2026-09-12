import type { Locale } from "@/i18n/routing";
import type { Enums } from "@/lib/supabase/database.types";

/**
 * One value in both languages. Commercial documents print English first and
 * Arabic underneath; `ar` is null when only one wording was recorded, and then
 * nothing is printed in its place.
 */
export type BiText = { en: string; ar: string | null };

export type PartyBlock = {
  name: BiText;
  legalName?: string | null;
  taxNumber?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
};

export type CommercialItem = {
  description: BiText;
  quantity: number;
  unitPrice: number;
  amount: number;
};

/** Everything the fixed page footer prints, already localised. */
export type DocumentFooterData = {
  /** Website as printed (cybarq.com). */
  website: string;
  /** Website as encoded in the QR code (https://cybarq.com). */
  websiteUrl: string;
  /** General, sales and support addresses, in print order. */
  emails: string[];
  /**
   * Legal block, printed in order: the legal name first (set in the heavier
   * weight), then the Jordan registered name on commercial documents and the
   * national establishment number. Each line holds a single script so the
   * bilingual footer never mixes English and Arabic inside one run.
   */
  legalLines: string[];
  /** PNG data URL of a QR code that opens the website. */
  websiteQrDataUrl: string;
  /**
   * The electronic-issuance statement, printed in small type directly above
   * the footer rule: English at the start of the line, Arabic at the end.
   */
  issuance?: { en: string; ar: string } | null;
};

/**
 * Everything the invoice and quote templates need. These documents are always
 * bilingual: English leads and Arabic follows, in one file, so the client
 * never has to choose a language to download.
 */
export type CommercialDocumentData = {
  kind: "invoice" | "quote";
  /**
   * Correspondence language recorded on the record. It decides the file name
   * of an unnumbered draft and the covering email — never the document, which
   * carries both languages.
   */
  language: Locale;
  /** Assigned number, or null for drafts. */
  number: string | null;
  status: string;
  title: BiText | null;
  issueDate: string | null;
  /** Invoice due date. */
  dueDate?: string | null;
  /** Quote validity. */
  validUntil?: string | null;
  currency: string;
  client: PartyBlock;
  items: CommercialItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  /** Invoice only. */
  amountPaid?: number;
  notes: BiText | null;
  terms: BiText | null;
  /** Invoice: number of the invoice this one replaces. */
  replacesNumber?: string | null;
  /** Invoice: number of the quote it came from. */
  quoteNumber?: string | null;
  /** Code of the project the document belongs to, when linked. */
  projectCode?: string | null;
  voidReason?: string | null;
  footer: DocumentFooterData;
};

export type CertificateDocumentData = {
  language: Locale;
  type: Enums<"certificate_type">;
  status: Enums<"certificate_status">;
  certificateNo: string | null;
  recipientName: string;
  title: string;
  description: string | null;
  programName: string | null;
  roleTitle: string | null;
  startDate: string | null;
  endDate: string | null;
  hours: number | null;
  issueDate: string | null;
  signatoryName: string | null;
  signatoryTitle: string | null;
  verificationUrl: string;
  /** PNG data URL of the verification QR code. */
  qrDataUrl: string;
  footer: DocumentFooterData;
};
