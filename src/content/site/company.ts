/**
 * Company facts carried over from the existing cybarq.com and the 2026 brand
 * guidelines. Single source for contact, legal and social details.
 */
export const company = {
  name: { en: "CyBarq", ar: "سايبرق" },
  legalName: { en: "CyBarq Technology LLC", ar: "سايبرق للتكنولوجيا" },
  /** Jordan registered name. Legal, tax and government use only. */
  jordanLegalName: "برق الفضاء لتكنولوجيا وأمن المعلومات ذ.م.م",
  slogan: { en: "Technology, done properly.", ar: "التقنية كما ينبغي." },
  description: {
    en: "CyBarq is a technology company in Amman. We build the software, platforms and infrastructure that organisations run on, and we keep them secure. One team, responsible for the whole system.",
    ar: "سايبرق شركة تقنية من عمّان. نبني البرمجيات والمنصات والبنية التحتية التي تعمل عليها المؤسسات، ونحرص على أن تبقى آمنة. فريق واحد يتحمّل مسؤولية النظام كاملاً.",
  },
  city: { en: "Amman, Jordan", ar: "عمّان، الأردن" },
  foundedYear: 2024,
  domain: "cybarq.com",
  url: "https://cybarq.com",
  emails: {
    general: "info@cybarq.com",
    sales: "sales@cybarq.com",
    support: "support@cybarq.com",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/cybarqllc/",
    instagram: "https://www.instagram.com/cybarqllc",
    facebook: "https://www.facebook.com/cybarqllc",
    x: "https://x.com/cybarqllc",
  },
  registration: {
    en: "CyBarq is registered with the Companies Control Department in the Hashemite Kingdom of Jordan. Licensing was completed following the required regulatory approvals from the Ministry of Digital Economy and Entrepreneurship and the National Cyber Security Center.",
    ar: "سايبرق شركة مسجلة رسمياً لدى دائرة مراقبة الشركات في المملكة الأردنية الهاشمية، واستكملت إجراءات الترخيص وفق الموافقات النظامية الصادرة عن وزارة الاقتصاد الرقمي والريادة والمركز الوطني للأمن السيبراني.",
  },
  /** Figures carried over from the existing site. Update here only. */
  stats: [
    { value: "2024", label: { en: "Officially registered", ar: "تاريخ التسجيل الرسمي" } },
    { value: "10+", label: { en: "Years of combined team experience", ar: "سنوات من الخبرة المجمّعة للفريق" } },
    { value: "8+", label: { en: "Specialists on the team", ar: "متخصصون في الفريق" } },
    { value: "300+", label: { en: "Cases handled", ar: "حالة تم التعامل معها" } },
  ],
  partnerLogos: Array.from({ length: 8 }, (_, i) => `/images/partners/partner${i + 1}.svg`),
  certificationLogos: Array.from({ length: 14 }, (_, i) => `/images/certifications/Certifications${i + 1}.png`),
} as const;
