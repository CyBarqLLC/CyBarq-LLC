import type { Bilingual } from "@/i18n/bilingual";

/**
 * About page narrative. The story is carried over from the existing
 * cybarq.com, extended with the four practice structure and the company's
 * positioning (registered in Jordan and the United States, a local team,
 * a hybrid way of working).
 */
export const about = {
  title: { en: "A local team, working across borders", ar: "فريق محلي، يعمل عبر الحدود" } satisfies Bilingual,
  lead: {
    en: "CyBarq is a technology company registered in Jordan and the United States. Our expertise spans technology engineering, cybersecurity and AI. We combine remote collaboration with presence on site, and shape every engagement around what the project calls for.",
    ar: "سايبرق شركة تقنية مسجلة في الأردن والولايات المتحدة. تشمل خبرتنا تطوير التقنية والأمن السيبراني والذكاء الاصطناعي. نجمع بين العمل عن بُعد والحضور المباشر، ونبني كل تعاون على ما يحتاجه المشروع فعلاً.",
  } satisfies Bilingual,
  story: [
    {
      en: "CyBarq officially began in 2024, built on a team with more than 10 years of combined experience across cybersecurity, software development and technical infrastructure. From day one our goal has been clear: building secure, practical technology solutions that help organisations protect their business and strengthen their digital readiness.",
      ar: "بدأت سايبرق رسمياً عام 2024، مستندةً إلى فريق تتجاوز خبرته المجمّعة 10 سنوات في الأمن السيبراني وتطوير البرمجيات والبنية التقنية. ومنذ اليوم الأول كان هدفنا واضحاً: بناء حلول تقنية آمنة وعملية تساعد المؤسسات على حماية أعمالها وتعزيز جاهزيتها الرقمية.",
    },
    {
      en: "Our team is local and our way of working is hybrid: we collaborate remotely, and we are on site whenever the work is better done in the room. Some projects stay close to home. Others cross borders.",
      ar: "فريقنا محلي، ونموذج عملنا هجين: نتعاون عن بُعد، ونحضر إلى الموقع كلما كان العمل أجدى بالحضور المباشر. بعض مشاريعنا قريب منا، وبعضها يعبر الحدود.",
    },
    {
      en: "Today we operate as a security first technology company across four practices: Cybersecurity, Digital Engineering, Artificial Intelligence, and Technology & Infrastructure. We deliver services, consulting and solutions tailored to each client, with a commitment to precision, quality and reliability in every project.",
      ar: "واليوم نعمل شركةً تقنيةً تضع الأمن أولاً، عبر أربعة مجالات: الأمن السيبراني، والهندسة الرقمية، والذكاء الاصطناعي، والتقنية والبنية التحتية. نقدم خدمات واستشارات وحلولاً تناسب احتياجات كل عميل، ونلتزم بالدقة والجودة والموثوقية في كل مشروع.",
    },
    {
      en: "Our clients range from organisations that need a single penetration test to those that ask us to design, build and run their platforms end to end. What they have in common is a preference for work that is done carefully, explained clearly and built to last.",
      ar: "يتنوع عملاؤنا بين مؤسسات تحتاج إلى اختبار اختراق واحد، وأخرى تطلب منا تصميم منصاتها وبناءها وتشغيلها من البداية إلى النهاية. وما يجمعهم تقديرهم للعمل الذي يُنجز بعناية، ويُشرح بوضوح، ويُبنى ليدوم.",
    },
  ] satisfies Bilingual[],
  practicesTitle: { en: "What we do", ar: "ما نقدمه" } satisfies Bilingual,
  practicesLead: {
    en: "Each practice stands on its own, and the four are stronger together. A platform we build is tested by our own security team. Infrastructure we design is built for the software that will run on it. AI we integrate lives inside systems we understand.",
    ar: "لكل مجال قيمته بذاته، والمجالات الأربعة معاً أقوى. المنصة التي نبنيها يختبرها فريقنا الأمني، والبنية التحتية التي نصممها تُبنى للبرمجيات التي ستعمل عليها، والذكاء الاصطناعي الذي ندمجه يعمل داخل أنظمة نفهمها جيداً.",
  } satisfies Bilingual,
  howTitle: { en: "How we work", ar: "كيف نعمل" } satisfies Bilingual,
  registrationTitle: { en: "Where we are registered", ar: "أين نحن مسجلون" } satisfies Bilingual,
} as const;
