import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { registerPdfFonts } from "./fonts";
import { CommercialDocument } from "./commercial";
import { CertificateDocument } from "./certificate";
import type { CertificateDocumentData, CommercialDocumentData } from "./types";

/** Renders an invoice or quotation to a PDF buffer. Server only. */
export async function renderCommercialPdf(data: CommercialDocumentData): Promise<Buffer> {
  registerPdfFonts();
  return renderToBuffer(<CommercialDocument data={data} />);
}

/** Renders a certificate to a PDF buffer. Server only. */
export async function renderCertificatePdf(data: CertificateDocumentData): Promise<Buffer> {
  registerPdfFonts();
  return renderToBuffer(<CertificateDocument data={data} />);
}
