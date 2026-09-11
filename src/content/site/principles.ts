import type { PictogramName } from "@/components/brand/pictogram-paths";
import type { Bilingual } from "@/i18n/bilingual";

export type Principle = { key: string; pictogram: PictogramName; title: Bilingual; body: Bilingual };

/**
 * How CyBarq works. Used on the home page ("How we work") and expanded on the
 * About page. Prose, not bullets: each principle is one short paragraph.
 */
export const principles: Principle[] = [
  {
    key: "whole-system",
    pictogram: "platform",
    title: { en: "One team for the whole system", ar: "فريق واحد للنظام كاملاً" },
    body: {
      en: "The people who build a platform, the people who run its infrastructure and the people who test its security usually work for three different companies. At CyBarq they sit in one room. Decisions about design, deployment and protection are made together, so nothing falls between the gaps.",
      ar: "من يبنون المنصة، ومن يشغّلون بنيتها التحتية، ومن يختبرون أمنها يعملون عادةً في ثلاث شركات مختلفة. في سايبرق يجلسون في غرفة واحدة. تُتخذ قرارات التصميم والنشر والحماية معاً، فلا يسقط شيء بين الفجوات.",
    },
  },
  {
    key: "security-first",
    pictogram: "cybersecurity",
    title: { en: "Security is part of the design", ar: "الأمن جزء من التصميم" },
    body: {
      en: "We started in cybersecurity, and it shows in how we build. Threat modelling happens before the first line of code, permissions are enforced in the database and not only in the interface, and every system we deliver has been looked at by someone whose job is to break it.",
      ar: "بدأنا من الأمن السيبراني، ويظهر ذلك في طريقة بنائنا. تُنمذج التهديدات قبل أول سطر من الشيفرة، وتُفرض الصلاحيات في قاعدة البيانات لا في الواجهة فقط، وكل نظام نسلّمه نظر إليه شخص مهمته أن يكسره.",
    },
  },
  {
    key: "plain-language",
    pictogram: "consulting",
    title: { en: "Plain language, written down", ar: "لغة واضحة، مكتوبة" },
    body: {
      en: "Scope is agreed in writing before work starts. Findings come with evidence. Recommendations say what to do, in what order, and why. Reports are written for the person who has to act on them, whether that is an engineer or a board member.",
      ar: "يُتفق على النطاق كتابةً قبل بدء العمل. وتأتي النتائج مع أدلتها. وتقول التوصيات ماذا تفعل، وبأي ترتيب، ولماذا. وتُكتب التقارير لمن سيتصرف بناءً عليها، سواء كان مهندساً أو عضو مجلس إدارة.",
    },
  },
  {
    key: "built-to-last",
    pictogram: "compliance",
    title: { en: "Built to be maintained", ar: "مبني ليُصان" },
    body: {
      en: "We use proven technology, document what we build, and hand over source code and infrastructure definitions in full. A system that only we can maintain is a failure on our part. You should be able to leave us, and we work so that you never want to.",
      ar: "نستخدم تقنيات مثبتة، ونوثّق ما نبنيه، ونسلّم الشيفرة المصدرية وتعريفات البنية التحتية كاملة. النظام الذي لا يستطيع صيانته سوانا إخفاق من جانبنا. ينبغي أن تكون قادراً على تركنا، ونعمل حتى لا ترغب في ذلك أبداً.",
    },
  },
];
