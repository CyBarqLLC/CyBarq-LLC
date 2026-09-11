import type { Locale } from "@/i18n/routing";
import type { Enums } from "@/lib/supabase/database.types";

export type PartyBlock = {
  name: string;
  legalName?: string | null;
  taxNumber?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
};

export type CommercialItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

/** Everything the invoice and quote templates need, already localised. */
export type CommercialDocumentData = {
  kind: "invoice" | "quote";
  language: Locale;
  /** Assigned number, or null for drafts. */
  number: string | null;
  status: string;
  title: string | null;
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
  notes: string | null;
  terms: string | null;
  /** Invoice: number of the invoice this one replaces. */
  replacesNumber?: string | null;
  /** Invoice: number of the quote it came from. */
  quoteNumber?: string | null;
  voidReason?: string | null;
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
  /** PNG data URL. */
  qrDataUrl: string;
};
