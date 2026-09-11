import type { MaintenanceLang } from "@/lib/site-lock";

export type MaintenanceCopy = {
  title: string;
  lines: [string, string];
  access: string;
  passwordLabel: string;
  enter: string;
  checking: string;
  invalid: string;
  rateLimited: string;
  unavailable: string;
  company: string;
  city: string;
  metaTitle: string;
};

export const MAINTENANCE_COPY: Record<MaintenanceLang, MaintenanceCopy> = {
  en: {
    title: "Something new is taking shape.",
    lines: ["We’re refining the CyBarq experience.", "We’ll be back shortly."],
    access: "Development Team Access",
    passwordLabel: "Password",
    enter: "Enter",
    checking: "Checking",
    invalid: "That password is not correct.",
    rateLimited: "Too many attempts. Try again in a few minutes.",
    unavailable: "Something went wrong. Please try again.",
    company: "CyBarq Technology LLC",
    city: "Amman",
    metaTitle: "CyBarq",
  },
  ar: {
    title: "شيء جديد يتشكّل.",
    lines: ["نعمل على صقل تجربة سايبرق.", "سنعود قريباً."],
    access: "دخول فريق التطوير",
    passwordLabel: "كلمة المرور",
    enter: "دخول",
    checking: "جارٍ التحقق",
    invalid: "كلمة المرور غير صحيحة.",
    rateLimited: "محاولات كثيرة. حاول مجدداً بعد دقائق.",
    unavailable: "حدث خطأ ما. حاول مرة أخرى.",
    company: "سايبرق للتكنولوجيا",
    city: "عمّان",
    metaTitle: "سايبرق",
  },
};
