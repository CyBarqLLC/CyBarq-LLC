/**
 * Company facts for the public site and the platform. Single source for the
 * name, contact and social details.
 *
 * The public identity is the name and nothing else: CyBarq Technology in
 * English, سايبرق لتكنولوجيا المعلومات in Arabic. No page, header, footer or
 * metadata says where or how the company is registered or licensed.
 */
export const company = {
  name: { en: "CyBarq", ar: "سايبرق" },
  /** The full company name, as it appears in footers, titles and structured data. */
  fullName: { en: "CyBarq Technology", ar: "سايبرق لتكنولوجيا المعلومات" },
  slogan: { en: "Technology, done properly.", ar: "التقنية كما ينبغي." },
  /** Default meta description and the Organization description in structured data. */
  description: {
    en: "CyBarq Technology builds software, runs the infrastructure beneath it and keeps both secure. One team across cybersecurity, digital engineering, AI and infrastructure, working with people and businesses around the world.",
    ar: "سايبرق لتكنولوجيا المعلومات تبني البرمجيات، وتشغّل البنية التي تقوم عليها، وتحافظ على أمن الاثنين. فريق واحد في الأمن السيبراني والهندسة الرقمية والذكاء الاصطناعي والبنية التحتية، يعمل مع الأفراد والشركات حول العالم.",
  },
  foundedYear: 2024,
  domain: "cybarq.com",
  url: "https://cybarq.com",
  emails: {
    general: "info@cybarq.com",
    sales: "sales@cybarq.com",
    support: "support@cybarq.com",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/cybarqtech/",
    instagram: "https://www.instagram.com/cybarqtech",
    facebook: "https://www.facebook.com/cybarqtech",
    x: "https://x.com/cybarqtech",
  },
  /**
   * Issuer details for invoices and quotations only (`src/lib/pdf`). These are
   * commercial and tax documents sent to a client, not part of the website,
   * and nothing under this key may be rendered on a public page.
   */
  documents: {
    legalName: { en: "CyBarq Technology LLC", ar: "سايبرق للتكنولوجيا" },
    registeredName: "برق الفضاء لتكنولوجيا وأمن المعلومات ذ.م.م",
    nationalNumber: "200201310" as string | null,
  },
  /** Figures shown on the site. Update here only. */
  stats: [
    { value: "10+", label: { en: "Years of combined team experience", ar: "سنوات من الخبرة المجمّعة للفريق" } },
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
   * Professional credentials held by the team (vendor and industry exams, as
   * badges supplied in PNG). `name` repeats what each badge
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
