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
      en: "The people who build a platform, the people who run its infrastructure and the people who test its security usually work for three different companies. At CyBarq they are one team, whether they meet on site or work together remotely. Decisions about design, deployment and protection are made together, so nothing is lost between them.",
      ar: "في العادة، يعمل من يبني المنصة ومن يشغّل بنيتها التحتية ومن يختبر أمنها لدى ثلاث شركات مختلفة. أما في سايبرق فهم فريق واحد، سواء التقوا في الموقع أو عملوا معاً عن بُعد. تُتخذ قرارات التصميم والنشر والحماية معاً، فلا يضيع شيء بين الأطراف.",
    },
  },
  {
    key: "security-first",
    pictogram: "cybersecurity",
    title: { en: "Security is part of the design", ar: "الأمن جزء من التصميم" },
    body: {
      en: "We started in cybersecurity, and it shows in how we build. Threat modelling happens before the first line of code, permissions are enforced in the database and not only in the interface, and every system we deliver has been looked at by someone whose job is to break it.",
      ar: "بدأنا من الأمن السيبراني، ويظهر ذلك في طريقة بنائنا. نبدأ بنمذجة التهديدات قبل كتابة أول سطر من الشيفرة، ونفرض الصلاحيات في قاعدة البيانات لا في الواجهة وحدها، ولا نسلّم نظاماً قبل أن يفحصه مختص مهمته أن يكسره.",
    },
  },
  {
    key: "plain-language",
    pictogram: "consulting",
    title: { en: "Plain language, written down", ar: "لغة واضحة، وكل شيء مكتوب" },
    body: {
      en: "Scope is agreed in writing before work starts. Findings come with evidence. Recommendations say what to do, in what order, and why. Reports are written for the person who has to act on them, whether that is an engineer or a board member.",
      ar: "نتفق على النطاق كتابةً قبل أن يبدأ العمل. ونقدّم النتائج مدعومة بأدلتها. وتوضح توصياتنا ما ينبغي فعله، وبأي ترتيب، ولماذا. ونكتب تقاريرنا لمن سيعمل بها، مهندساً كان أو عضواً في مجلس الإدارة.",
    },
  },
  {
    key: "built-to-last",
    pictogram: "compliance",
    title: { en: "Built to be maintained", ar: "مبني لتسهل صيانته" },
    body: {
      en: "We use proven technology, document what we build, and hand over source code and infrastructure definitions in full. A system that only we can maintain is a failure on our part. You should be able to leave us, and we work so that you never want to.",
      ar: "نستخدم تقنيات مجرّبة، ونوثّق ما نبنيه، ونسلّم الشيفرة المصدرية وتعريفات البنية التحتية كاملة. فالنظام الذي لا يستطيع أحد صيانته سوانا إخفاق منا. من حقك أن تستطيع الاستغناء عنا، ونعمل كي لا ترغب في ذلك أبداً.",
    },
  },
];
