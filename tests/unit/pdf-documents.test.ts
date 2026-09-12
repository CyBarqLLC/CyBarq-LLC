import { beforeEach, describe, expect, it, vi } from "vitest";
import QRCode from "qrcode";
import type { Tables } from "@/lib/supabase/database.types";
import { company } from "@/content/site/company";
import { certificateDocumentData, certificateVerificationUrl, documentFooterData, invoiceDocumentData, quoteDocumentData } from "@/lib/pdf/documents";

/* No PNG encoding in tests: the data URL only has to look like one. */
vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn(async (text: string) => `data:image/png;base64,${Buffer.from(text, "utf8").toString("base64")}`),
  },
}));

const DATA_URL = /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/;

function invoiceRow(overrides: Partial<Tables<"invoices">> = {}): Tables<"invoices"> {
  return {
    id: "3f2a6b7e-1c4d-4e5f-8a9b-0c1d2e3f4a5b",
    number: "INV-2026-0042",
    client_id: "c1",
    project_id: null,
    quote_id: null,
    replaces_invoice_id: null,
    language: "en",
    currency: "JOD",
    status: "issued",
    issue_date: "2026-09-01",
    due_date: "2026-09-30",
    subtotal: 1000,
    tax_rate: 16,
    tax_amount: 160,
    total: 1160,
    amount_paid: 500,
    title_en: "Security assessment, phase one",
    title_ar: "تقييم أمني، المرحلة الأولى",
    notes_en: "Thank you.",
    notes_ar: null,
    terms_en: "Net 30.",
    terms_ar: "30 يوماً.",
    pdf_path: null,
    void_reason: null,
    voided_at: null,
    created_by: null,
    issued_by: null,
    issued_at: null,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

function quoteRow(overrides: Partial<Tables<"quotes">> = {}): Tables<"quotes"> {
  return {
    id: "8b1c2d3e-4f5a-4b6c-9d7e-8f9a0b1c2d3e",
    number: "QUO-2026-0007",
    client_id: "c1",
    project_id: null,
    language: "ar",
    currency: "USD",
    status: "sent",
    issue_date: "2026-09-11",
    valid_until: "2026-10-11",
    subtotal: 250.5,
    tax_rate: 0,
    tax_amount: 0,
    total: 250.5,
    title_en: "Penetration test",
    title_ar: "",
    notes_en: null,
    notes_ar: null,
    terms_en: "Valid for 30 days.",
    terms_ar: null,
    pdf_path: null,
    created_by: null,
    issued_by: null,
    issued_at: null,
    created_at: "2026-09-11T00:00:00Z",
    updated_at: "2026-09-11T00:00:00Z",
    ...overrides,
  };
}

function certificateRow(overrides: Partial<Tables<"certificates">> = {}): Tables<"certificates"> {
  return {
    id: "5d6e7f8a-9b0c-4d1e-8f2a-3b4c5d6e7f8a",
    certificate_no: "CERT-2026-0003",
    verification_code: "abcdef0123456789",
    type: "training",
    status: "issued",
    language: "en",
    recipient_name_en: "Rana Haddad",
    recipient_name_ar: "رنا حداد",
    recipient_email: null,
    recipient_user_id: null,
    title_en: "Incident response fundamentals",
    title_ar: "أساسيات الاستجابة للحوادث",
    description_en: null,
    description_ar: null,
    program_name_en: "Blue team programme",
    program_name_ar: null,
    role_title_en: null,
    role_title_ar: null,
    start_date: "2026-03-01",
    end_date: "2026-06-30",
    hours: 40,
    issue_date: "2026-07-01",
    issued_at: null,
    issued_by: null,
    signatory_name_en: null,
    signatory_name_ar: null,
    signatory_title_en: null,
    signatory_title_ar: null,
    revoked_at: null,
    revoked_by: null,
    revoke_reason: null,
    pdf_path: null,
    metadata: {},
    created_by: null,
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
    ...overrides,
  };
}

const client = { name_en: "Acme Holdings", name_ar: "شركة أكمي", legal_name: "Acme Holdings Ltd", tax_number: "TX-1", address: "12 King Hussein St", city: "Amman", country: "Jordan" };

const items = [
  { description_en: "Consulting day", description_ar: "يوم استشاري", quantity: 2, unit_price: 400, amount: 800 },
  { description_en: "Report", description_ar: null, quantity: 1, unit_price: 200, amount: null },
];

const facts = {
  url: "https://cybarq.com",
  domain: "cybarq.com",
  emails: { general: "info@cybarq.com", sales: "sales@cybarq.com", support: "support@cybarq.com" },
  legalName: { en: "CyBarq Technology LLC", ar: "سايبرق للتكنولوجيا" },
  jordanLegalName: "برق الفضاء لتكنولوجيا وأمن المعلومات ذ.م.م",
  nationalNumber: null,
};

/** The national establishment number lines the real company facts add to every footer. */
const nationalLines = (locale: "en" | "ar") =>
  company.nationalNumber ? [`${locale === "ar" ? "الرقم الوطني للمنشأة" : "National Establishment No."} ${company.nationalNumber}`] : [];

describe("document footer data", () => {
  beforeEach(() => {
    vi.mocked(QRCode.toDataURL).mockClear();
  });

  it("prints the website, the three emails and a website QR", async () => {
    const footer = await documentFooterData("en", { jordanLegalName: true });
    expect(footer.website).toBe("cybarq.com");
    expect(footer.websiteUrl).toBe("https://cybarq.com");
    expect(footer.emails).toEqual([company.emails.general, company.emails.sales, company.emails.support]);
    expect(footer.websiteQrDataUrl).toMatch(DATA_URL);
    expect(Buffer.from(footer.websiteQrDataUrl.split(",")[1] ?? "", "base64").toString("utf8")).toBe("https://cybarq.com");
  });

  it("localises the legal line and adds the Jordan name on commercial documents only", async () => {
    const en = await documentFooterData("en", { jordanLegalName: true }, facts);
    expect(en.legalLines).toEqual(["CyBarq Technology LLC", facts.jordanLegalName]);
    const ar = await documentFooterData("ar", { jordanLegalName: false }, facts);
    expect(ar.legalLines).toEqual(["سايبرق للتكنولوجيا"]);
  });

  it("prints the national establishment number only once it is known", async () => {
    const without = await documentFooterData("en", { jordanLegalName: false }, facts);
    expect(without.legalLines.join(" ")).not.toMatch(/National Establishment/);
    const withNumber = await documentFooterData("en", { jordanLegalName: false }, { ...facts, nationalNumber: "200123456" });
    expect(withNumber.legalLines).toContain("National Establishment No. 200123456");
    const arabic = await documentFooterData("ar", { jordanLegalName: false }, { ...facts, nationalNumber: "200123456" });
    expect(arabic.legalLines).toContain("الرقم الوطني للمنشأة 200123456");
  });

  it("gives a bilingual footer the English legal name and both national number labels", async () => {
    const both = await documentFooterData("en", { jordanLegalName: true, bilingual: true }, { ...facts, nationalNumber: "200123456" });
    expect(both.legalLines).toEqual([facts.legalName.en, facts.jordanLegalName, "National Establishment No. 200123456", "الرقم الوطني للمنشأة 200123456"]);
    /* Every line holds one script: the bilingual footer never mixes them in a run. */
    expect(both.legalLines.filter((line) => /[؀-ۿ]/.test(line) && /[A-Za-z]/.test(line))).toEqual([]);
  });

  it("generates the website QR once per URL", async () => {
    await documentFooterData("en", { jordanLegalName: true }, facts);
    await documentFooterData("ar", { jordanLegalName: false }, facts);
    const calls = vi.mocked(QRCode.toDataURL).mock.calls.filter((call) => String(call[0]) === facts.url);
    expect(calls.length).toBeLessThanOrEqual(1);
  });
});

describe("invoice document data", () => {
  it("maps totals, items, party and references", async () => {
    const data = await invoiceDocumentData(invoiceRow({ project_id: "p1", quote_id: "q1" }), items, client, { quoteNumber: "QUO-2026-0007", projectCode: "CYB-0101" });
    expect(data.kind).toBe("invoice");
    expect(data.language).toBe("en");
    expect(data.number).toBe("INV-2026-0042");
    expect(data.subtotal).toBe(1000);
    expect(data.taxRate).toBe(16);
    expect(data.taxAmount).toBe(160);
    expect(data.total).toBe(1160);
    expect(data.amountPaid).toBe(500);
    expect(data.items).toEqual([
      { description: { en: "Consulting day", ar: "يوم استشاري" }, quantity: 2, unitPrice: 400, amount: 800 },
      { description: { en: "Report", ar: null }, quantity: 1, unitPrice: 200, amount: 200 },
    ]);
    expect(data.client).toEqual({ name: { en: "Acme Holdings", ar: "شركة أكمي" }, legalName: "Acme Holdings Ltd", taxNumber: "TX-1", address: "12 King Hussein St", city: "Amman", country: "Jordan" });
    expect(data.quoteNumber).toBe("QUO-2026-0007");
    expect(data.replacesNumber).toBeNull();
    expect(data.projectCode).toBe("CYB-0101");
    expect(data.title).toEqual({ en: "Security assessment, phase one", ar: "تقييم أمني، المرحلة الأولى" });
    expect(data.notes).toEqual({ en: "Thank you.", ar: null });
    expect(data.terms).toEqual({ en: "Net 30.", ar: "30 يوماً." });
    expect(data.voidReason).toBeNull();
    expect(data.dueDate).toBe("2026-09-30");
  });

  it("carries the footer with the Jordan legal name", async () => {
    const data = await invoiceDocumentData(invoiceRow(), [], null);
    expect(data.footer.legalLines[0]).toBe(company.legalName.en);
    expect(data.footer.legalLines).toContain(company.jordanLegalName);
    expect(data.footer.legalLines).toEqual([company.legalName.en, company.jordanLegalName, ...nationalLines("en"), ...nationalLines("ar")]);
    expect(data.footer.websiteQrDataUrl).toMatch(DATA_URL);
    expect(data.client).toEqual({ name: { en: "", ar: null } });
  });

  it("carries both languages whatever the correspondence language of the record", async () => {
    const data = await invoiceDocumentData(invoiceRow({ language: "ar" }), items, client);
    expect(data.language).toBe("ar");
    expect(data.client.name).toEqual({ en: "Acme Holdings", ar: "شركة أكمي" });
    expect(data.title).toEqual({ en: "Security assessment, phase one", ar: "تقييم أمني، المرحلة الأولى" });
    /* Only one wording recorded: printed once, never duplicated. */
    expect(data.notes).toEqual({ en: "Thank you.", ar: null });
    expect(data.terms).toEqual({ en: "Net 30.", ar: "30 يوماً." });
    expect(data.items.map((i) => i.description)).toEqual([{ en: "Consulting day", ar: "يوم استشاري" }, { en: "Report", ar: null }]);
    /* The footer of a bilingual document always leads with the English name. */
    expect(data.footer.legalLines[0]).toBe(company.legalName.en);
  });

  it("keeps drafts unnumbered and exposes the void reason only when void", async () => {
    const draft = await invoiceDocumentData(invoiceRow({ number: null, status: "draft", issue_date: null, void_reason: "stale" }), [], client);
    expect(draft.number).toBeNull();
    expect(draft.status).toBe("draft");
    expect(draft.voidReason).toBeNull();
    const voided = await invoiceDocumentData(invoiceRow({ status: "void", void_reason: "Issued in error" }), [], client);
    expect(voided.voidReason).toBe("Issued in error");
  });
});

describe("quote document data", () => {
  it("maps validity, currency and the project code", async () => {
    const data = await quoteDocumentData(quoteRow(), items, client, { projectCode: "CYB-0102" });
    expect(data.kind).toBe("quote");
    expect(data.language).toBe("ar");
    expect(data.validUntil).toBe("2026-10-11");
    expect(data.dueDate).toBeUndefined();
    expect(data.amountPaid).toBeUndefined();
    expect(data.currency).toBe("USD");
    expect(data.total).toBe(250.5);
    expect(data.projectCode).toBe("CYB-0102");
    /* `title_ar` is empty on this row: the English wording stands alone. */
    expect(data.title).toEqual({ en: "Penetration test", ar: null });
    expect(data.terms).toEqual({ en: "Valid for 30 days.", ar: null });
    expect(data.notes).toBeNull();
    expect(data.footer.legalLines).toEqual([company.legalName.en, company.jordanLegalName, ...nationalLines("en"), ...nationalLines("ar")]);
  });
});

describe("certificate document data", () => {
  it("builds the verification URL from the site origin", () => {
    expect(certificateVerificationUrl(certificateRow())).toMatch(/^https?:\/\/.+\/en\/verify\/abcdef0123456789$/);
    expect(certificateVerificationUrl(certificateRow({ language: "ar" }))).toMatch(/\/ar\/verify\/abcdef0123456789$/);
  });

  it("maps the certificate and carries both QR codes", async () => {
    const data = await certificateDocumentData(certificateRow());
    expect(data.type).toBe("training");
    expect(data.recipientName).toBe("Rana Haddad");
    expect(data.programName).toBe("Blue team programme");
    expect(data.roleTitle).toBeNull();
    expect(data.hours).toBe(40);
    expect(data.startDate).toBe("2026-03-01");
    expect(data.endDate).toBe("2026-06-30");
    expect(data.issueDate).toBe("2026-07-01");
    expect(data.signatoryName).toBeNull();
    expect(data.verificationUrl).toBe(certificateVerificationUrl(certificateRow()));
    expect(data.qrDataUrl).toMatch(DATA_URL);
    expect(Buffer.from(data.qrDataUrl.split(",")[1] ?? "", "base64").toString("utf8")).toBe(data.verificationUrl);
    expect(data.footer.websiteQrDataUrl).toMatch(DATA_URL);
    expect(data.footer.websiteQrDataUrl).not.toBe(data.qrDataUrl);
    expect(data.footer.legalLines).toEqual([company.legalName.en, ...nationalLines("en")]);
  });

  it("localises to Arabic with the English fallback", async () => {
    const data = await certificateDocumentData(certificateRow({ language: "ar", hours: null }));
    expect(data.language).toBe("ar");
    expect(data.recipientName).toBe("رنا حداد");
    expect(data.title).toBe("أساسيات الاستجابة للحوادث");
    expect(data.programName).toBe("Blue team programme");
    expect(data.hours).toBeNull();
    expect(data.footer.legalLines).toEqual([company.legalName.ar, ...nationalLines("ar")]);
  });
});
