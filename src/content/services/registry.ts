import type { PictogramName } from "@/components/brand/pictogram-paths";
import type { Bilingual } from "@/i18n/bilingual";

/**
 * Service architecture. Four practices, each with services. Slugs are stable
 * and used in URLs: /[locale]/services/[practice]/[service].
 */
export type PracticeSlug = "cybersecurity" | "digital-engineering" | "artificial-intelligence" | "technology-infrastructure";

/**
 * One narrative section of a service page. `heading` is optional: when absent
 * the page uses the standard heading from messages/<locale>/services.json.
 * `items` is a short list used only where a list is the clearest form
 * (deliverables, for example).
 */
export type ServiceSection = { heading?: Bilingual; body: Bilingual; items?: Bilingual[] };

export type ServiceContent = {
  slug: string;
  practice: PracticeSlug;
  pictogram: PictogramName;
  title: Bilingual;
  /** One line used in lists and cards. */
  summary: Bilingual;
  /** Hero statement: short, human, no marketing filler. */
  hero: Bilingual;
  seo: { title: Bilingual; description: Bilingual };
  problem: ServiceSection;
  whereItAppears: ServiceSection;
  approach: ServiceSection;
  engagement: ServiceSection;
  deliverables: ServiceSection;
  /** Optional additional sections rendered after deliverables (each carries its own heading). */
  extraSections?: ServiceSection[];
  businessMeaning: ServiceSection;
  /** Slugs of related services (any practice). */
  related: string[];
  /** Shown on the home page "selected services" strip when true. */
  featured?: boolean;
};

/** Small helper for writing bilingual content modules. */
export const bi = (en: string, ar: string): Bilingual => ({ en, ar });

export type PracticeContent = {
  slug: PracticeSlug;
  pictogram: PictogramName;
  title: Bilingual;
  short: Bilingual;
  intro: Bilingual;
  seo: { title: Bilingual; description: Bilingual };
  /** Projects practice enum value for cross linking with the CMS. */
  practiceEnum: "cybersecurity" | "development" | "ai" | "infrastructure";
};

export const practices: PracticeContent[] = [
  {
    slug: "cybersecurity",
    pictogram: "cybersecurity",
    practiceEnum: "cybersecurity",
    title: { en: "Cybersecurity", ar: "الأمن السيبراني" },
    short: { en: "Testing, response, assessment and advisory for systems that matter.", ar: "اختبار واستجابة وتقييم واستشارات للأنظمة التي تهمّك." },
    intro: {
      en: "Security is where CyBarq started. We test systems the way attackers do, investigate incidents when they happen, and help teams build the processes that keep risk manageable over time.",
      ar: "بدأت سايبرق من الأمن السيبراني. نختبر الأنظمة كما يفعل المهاجمون، ونحقق في الحوادث حين تقع، ونساعد الفرق على بناء إجراءات تُبقي المخاطر تحت السيطرة مع الوقت.",
    },
    seo: {
      title: { en: "Cybersecurity services", ar: "خدمات الأمن السيبراني" },
      description: { en: "Penetration testing, digital forensics and incident response, compromise assessment, security assessments, training and consulting from CyBarq in Amman.", ar: "اختبار الاختراق، التحقيق الرقمي والاستجابة للحوادث، تقييم الاختراق، التقييمات الأمنية، التدريب والاستشارات من سايبرق في عمّان." },
    },
  },
  {
    slug: "digital-engineering",
    pictogram: "software",
    practiceEnum: "development",
    title: { en: "Digital Engineering", ar: "الهندسة الرقمية" },
    short: { en: "Platforms, internal systems, portals and integrations, built to last.", ar: "منصات وأنظمة داخلية وبوابات وتكاملات مبنية لتدوم." },
    intro: {
      en: "We design and build the software organisations run on: enterprise platforms, internal systems, SaaS products, APIs and the integrations between them. Security and maintainability are part of the design, not a later phase.",
      ar: "نصمم ونبني البرمجيات التي تعمل عليها المؤسسات: منصات مؤسسية، أنظمة داخلية، منتجات SaaS، واجهات برمجية والتكاملات بينها. الأمان وقابلية الصيانة جزء من التصميم، لا مرحلة لاحقة.",
    },
    seo: {
      title: { en: "Digital engineering services", ar: "خدمات الهندسة الرقمية" },
      description: { en: "Enterprise web platforms, internal business systems, SaaS, APIs and integrations, workflow systems, portals, cloud applications and legacy modernisation.", ar: "منصات ويب مؤسسية، أنظمة أعمال داخلية، SaaS، واجهات برمجية وتكاملات، أنظمة سير عمل، بوابات، تطبيقات سحابية وتحديث الأنظمة القديمة." },
    },
  },
  {
    slug: "artificial-intelligence",
    pictogram: "ai",
    practiceEnum: "ai",
    title: { en: "Artificial Intelligence", ar: "الذكاء الاصطناعي" },
    short: { en: "LLM applications, agents, retrieval and automation inside real workflows.", ar: "تطبيقات النماذج اللغوية، الوكلاء، الاسترجاع والأتمتة داخل سير العمل الفعلي." },
    intro: {
      en: "We integrate language models into the systems people already use: assistants that answer from your own documents, agents that complete defined tasks, and automation that removes manual steps. We do not train foundation models. We make existing models useful, safe and measurable inside your organisation.",
      ar: "ندمج النماذج اللغوية في الأنظمة التي يستخدمها الناس فعلاً: مساعدون يجيبون من وثائقك، وكلاء ينجزون مهاماً محددة، وأتمتة تلغي الخطوات اليدوية. نحن لا ندرّب نماذج أساسية، بل نجعل النماذج الموجودة مفيدة وآمنة وقابلة للقياس داخل مؤسستك.",
    },
    seo: {
      title: { en: "Artificial intelligence services", ar: "خدمات الذكاء الاصطناعي" },
      description: { en: "LLM applications, AI agents, enterprise assistants, RAG and knowledge systems, AI automation and model integration built into your workflows by CyBarq.", ar: "تطبيقات النماذج اللغوية، وكلاء الذكاء الاصطناعي، مساعدون مؤسسيون، أنظمة RAG والمعرفة، الأتمتة ودمج النماذج داخل سير عملك من سايبرق." },
    },
  },
  {
    slug: "technology-infrastructure",
    pictogram: "cloud",
    practiceEnum: "infrastructure",
    title: { en: "Technology & Infrastructure", ar: "التقنية والبنية التحتية" },
    short: { en: "Cloud architecture, reliability, identity, observability and resilience.", ar: "بنية سحابية، موثوقية، هوية، مراقبة ومرونة." },
    intro: {
      en: "The systems underneath the systems. We design cloud and application infrastructure, deployment pipelines, identity and access, observability and backup so that platforms stay available, recoverable and understood.",
      ar: "الأنظمة التي تقف تحت الأنظمة. نصمم البنية السحابية وبنية التطبيقات، وخطوط النشر، والهوية والوصول، والمراقبة والنسخ الاحتياطي، لتبقى المنصات متاحة وقابلة للاستعادة ومفهومة.",
    },
    seo: {
      title: { en: "Technology and infrastructure services", ar: "خدمات التقنية والبنية التحتية" },
      description: { en: "Cloud architecture, application and deployment infrastructure, platform reliability, DevOps, observability, identity and access, backup and resilience, and technical architecture consulting.", ar: "بنية سحابية، بنية تطبيقات ونشر، موثوقية المنصات، DevOps، مراقبة، هوية ووصول، نسخ احتياطي ومرونة، واستشارات البنية التقنية." },
    },
  },
];

export function getPractice(slug: string): PracticeContent | undefined {
  return practices.find((p) => p.slug === slug);
}

export function isPracticeSlug(value: string): value is PracticeSlug {
  return practices.some((p) => p.slug === value);
}

/** Maps the CMS `practice` enum back to the practice content (undefined for `mixed`). */
export function practiceByEnum(value: string): PracticeContent | undefined {
  return practices.find((p) => p.practiceEnum === value);
}
