import "server-only";
import QRCode from "qrcode";

/** PNG data URL for a QR code in Graphite on white, margin free. */
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 0, width: 512, color: { dark: "#0D0E13", light: "#FFFFFF" } });
}
