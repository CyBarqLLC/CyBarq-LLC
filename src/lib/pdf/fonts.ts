import path from "node:path";
import { Font } from "@react-pdf/renderer";

/** The one typeface for Arabic and English. Weights: 300, 400, 500, 700. */
export const PDF_FONT_FAMILY = "Thmanyah Sans";

type FontFlag = { __cybarqPdfFontsRegistered?: boolean };

/**
 * Registers Thmanyah Sans with react-pdf once per process. The flag lives on
 * globalThis so hot module reloads in development do not register twice.
 */
export function registerPdfFonts(): void {
  const flag = globalThis as FontFlag;
  if (flag.__cybarqPdfFontsRegistered) return;
  flag.__cybarqPdfFontsRegistered = true;

  const dir = path.join(process.cwd(), "src/assets/fonts");
  Font.register({
    family: PDF_FONT_FAMILY,
    fonts: [
      { src: path.join(dir, "ThmanyahSans-Light.otf"), fontWeight: 300 },
      { src: path.join(dir, "ThmanyahSans-Regular.otf"), fontWeight: 400 },
      { src: path.join(dir, "ThmanyahSans-Medium.otf"), fontWeight: 500 },
      { src: path.join(dir, "ThmanyahSans-Bold.otf"), fontWeight: 700 },
    ],
  });
  // Never hyphenate: Arabic words must not be broken and English labels are short.
  Font.registerHyphenationCallback((word) => [word]);
}
