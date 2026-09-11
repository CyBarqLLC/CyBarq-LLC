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
  /** Default meta description and the Organization description in structured data. */
  description: {
    en: "CyBarq is a technology company registered in Jordan and the United States, with a local team and a hybrid way of working that combines remote collaboration with presence on site. Our expertise spans technology engineering, cybersecurity and AI.",
    ar: "سايبرق شركة تقنية مسجلة في الأردن والولايات المتحدة، بفريق محلي ونموذج عمل هجين يجمع بين العمل عن بُعد والحضور المباشر. تشمل خبرتنا تطوير التقنية والأمن السيبراني والذكاء الاصطناعي.",
  },
  /** Registered office city. Used on documents (PDF headers and certificates). */
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
  /**
   * Official registration number in Jordan. Shown publicly ("Registration No.")
   * only once it is set here; until then nothing is rendered in its place.
   */
  registrationNumber: null as string | null,
  /** Figures carried over from the existing site. Update here only. */
  stats: [
    { value: "2024", label: { en: "Officially registered", ar: "تاريخ التسجيل الرسمي" } },
    { value: "10+", label: { en: "Years of combined team experience", ar: "سنوات من الخبرة المجمّعة للفريق" } },
    { value: "8+", label: { en: "Specialists on the team", ar: "متخصصون في الفريق" } },
    { value: "300+", label: { en: "Cases handled", ar: "حالة تم التعامل معها" } },
  ],
  /**
   * Partner logos as supplied (single colour SVG). `name` is the alternative
   * text; `ratio` is the artwork's width to height ratio from its viewBox.
   */
  partners: [
    { name: "Trellix", logo: "/images/partners/partner1.svg", ratio: 299 / 74.9 },
    { name: "42Crunch", logo: "/images/partners/partner2.svg", ratio: 332.16 / 93.07 },
    { name: "Cloudera", logo: "/images/partners/partner3.svg", ratio: 621.6 / 77.45 },
    { name: "Cyware", logo: "/images/partners/partner4.svg", ratio: 527.49 / 101.82 },
    { name: "EfficientIP", logo: "/images/partners/partner5.svg", ratio: 367.19 / 63.5 },
    { name: "Elastic", logo: "/images/partners/partner6.svg", ratio: 437.75 / 140.08 },
    { name: "Ivanti", logo: "/images/partners/partner7.svg", ratio: 373.6 / 133.1 },
    { name: "Splunk", logo: "/images/partners/partner8.svg", ratio: 358.72 / 106.41 },
  ],
  /**
   * Certification badges as supplied (PNG). `name` repeats what each badge
   * reads and is used as its alternative text; `ratio` is the image's pixel
   * width to height.
   */
  certifications: [
    { name: "AWS Certified Cloud Practitioner", logo: "/images/certifications/Certifications1.png", ratio: 512 / 268 },
    { name: "Certified Red Team Professional", logo: "/images/certifications/Certifications2.png", ratio: 413 / 413 },
    { name: "Splunk Enterprise Certified Admin", logo: "/images/certifications/Certifications3.png", ratio: 340 / 340 },
    { name: "Huawei Certification HCIP", logo: "/images/certifications/Certifications4.png", ratio: 512 / 384 },
    { name: "eWPT", logo: "/images/certifications/Certifications5.png", ratio: 279 / 369 },
    { name: "Splunk Core Certified Power User", logo: "/images/certifications/Certifications6.png", ratio: 340 / 340 },
    { name: "Fortinet Certified", logo: "/images/certifications/Certifications7.png", ratio: 927 / 1024 },
    { name: "Offensive Security OSCP", logo: "/images/certifications/Certifications8.png", ratio: 512 / 268 },
    { name: "EC-Council Certified Ethical Hacker (CEH)", logo: "/images/certifications/Certifications9.png", ratio: 512 / 512 },
    { name: "EC-Council Certified Incident Handler (ECIH)", logo: "/images/certifications/Certifications10.png", ratio: 340 / 340 },
    { name: "Huawei Certification HCIA", logo: "/images/certifications/Certifications11.png", ratio: 500 / 300 },
    { name: "eCDFP", logo: "/images/certifications/Certifications12.png", ratio: 464 / 613 },
    { name: "eCIR, Certified Incident Responder", logo: "/images/certifications/Certifications13.png", ratio: 400 / 400 },
    { name: "eCTHP", logo: "/images/certifications/Certifications14.png", ratio: 279 / 369 },
  ],
} as const;
