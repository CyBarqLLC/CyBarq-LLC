import type { Bilingual } from "@/i18n/bilingual";

/**
 * About page narrative. The story paragraph is carried over from the
 * existing cybarq.com and extended with the four practice structure.
 */
export const about = {
  title: { en: "A technology company from Amman", ar: "شركة تقنية من عمّان" } satisfies Bilingual,
  lead: {
    en: "We build the software, platforms and infrastructure that organisations run on, and we keep them secure. Four practices, one team, responsible for the whole system.",
    ar: "نبني البرمجيات والمنصات والبنية التحتية التي تعمل عليها المؤسسات، ونحرص على أن تبقى آمنة. أربع ممارسات، وفريق واحد، يتحمل مسؤولية النظام كاملاً.",
  } satisfies Bilingual,
  story: [
    {
      en: "CyBarq officially began in 2024, built on a team with more than 10 years of combined experience across cybersecurity, software development and technical infrastructure. From day one our goal has been clear: building secure, practical technology solutions that help organisations protect their business and strengthen their digital readiness.",
      ar: "بدأت سايبرق رسمياً عام 2024، مستندةً إلى فريق يجمع بين خبرات تتجاوز 10 سنوات في مجالات الأمن السيبراني وتطوير البرمجيات والبنية التقنية. ومنذ البداية كان هدفنا واضحاً: بناء حلول تقنية آمنة وعملية تساعد المؤسسات على حماية أعمالها وتعزيز جاهزيتها الرقمية.",
    },
    {
      en: "Today we operate as a security first technology company across four practices: Cybersecurity, Digital Engineering, Artificial Intelligence, and Technology & Infrastructure. We deliver services, consulting and solutions tailored to each client, with a commitment to precision, quality and reliability in every project.",
      ar: "واليوم نعمل كشركة تقنية يقودها الأمن أولاً، عبر أربع ممارسات: الأمن السيبراني، والهندسة الرقمية، والذكاء الاصطناعي، والتقنية والبنية التحتية. نقدم خدمات واستشارات وحلولاً مصممة لكل عميل، مع التزام بالدقة والجودة والموثوقية في كل مشروع.",
    },
    {
      en: "Our clients range from organisations that need a single penetration test to those that ask us to design, build and run their platforms end to end. What they have in common is a preference for work that is done carefully, explained clearly and built to last.",
      ar: "يتنوع عملاؤنا بين مؤسسات تحتاج إلى اختبار اختراق واحد، وأخرى تطلب منا تصميم منصاتها وبناءها وتشغيلها من البداية إلى النهاية. وما يجمعهم هو تفضيل العمل الذي يُنجز بعناية، ويُشرح بوضوح، ويُبنى ليدوم.",
    },
  ] satisfies Bilingual[],
  practicesTitle: { en: "What we do", ar: "ما نقوم به" } satisfies Bilingual,
  practicesLead: {
    en: "Each practice stands on its own, and the four are stronger together. A platform we build is tested by our own security team. Infrastructure we design is built for the software that will run on it. AI we integrate lives inside systems we understand.",
    ar: "كل ممارسة تقف بذاتها، والأربع معاً أقوى. المنصة التي نبنيها يختبرها فريقنا الأمني. والبنية التحتية التي نصممها مبنية للبرمجيات التي ستعمل عليها. والذكاء الاصطناعي الذي ندمجه يعيش داخل أنظمة نفهمها.",
  } satisfies Bilingual,
  howTitle: { en: "How we work", ar: "كيف نعمل" } satisfies Bilingual,
  registrationTitle: { en: "Officially registered", ar: "مسجلة رسمياً" } satisfies Bilingual,
} as const;
