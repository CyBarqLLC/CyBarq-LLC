import QRCode from "qrcode";
import { PDF_COLORS } from "./theme";

/**
 * PNG data URL for a QR code: Graphite modules on white, with the one module
 * of quiet zone a scanner looks for. The colour on the page is the thin blue
 * frame drawn around it, never the code itself — a tinted code costs contrast
 * for nothing.
 */
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 512, color: { dark: PDF_COLORS.graphite, light: PDF_COLORS.white } });
}
