import localFont from "next/font/local";

/**
 * Thmanyah Sans: the one typeface for Arabic and English.
 * Light for display, Regular for text, Medium for labels and emphasis.
 */
export const thmanyah = localFont({
  src: [
    { path: "../assets/fonts/ThmanyahSans-Light.woff", weight: "300", style: "normal" },
    { path: "../assets/fonts/ThmanyahSans-Regular.woff", weight: "400", style: "normal" },
    { path: "../assets/fonts/ThmanyahSans-Medium.woff", weight: "500", style: "normal" },
    { path: "../assets/fonts/ThmanyahSans-Bold.woff", weight: "700", style: "normal" },
  ],
  variable: "--font-thmanyah",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Tahoma", "sans-serif"],
  adjustFontFallback: false,
});
