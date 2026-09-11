import type { Viewport } from "next";
import { thmanyah } from "@/lib/fonts";
import "@/styles/globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

/** Root layout for the maintenance screen (outside the localized site tree). */
export default async function MaintenanceLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const ar = lang === "ar";
  return (
    <html lang={ar ? "ar" : "en"} dir={ar ? "rtl" : "ltr"} className={thmanyah.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
