import type { PictogramName } from "@/components/brand/pictogram-paths";
import type { Bilingual } from "@/i18n/bilingual";

export type Principle = { key: string; pictogram: PictogramName; title: Bilingual; body: Bilingual };

/**
 * How CyBarq works. Set as prose on the home page and expanded on the About
 * page. One short paragraph each, written the way the team would say it out
 * loud rather than the way a brochure would.
 */
export const principles: Principle[] = [
  {
    key: "whole-system",
    pictogram: "platform",
    title: { en: "One team, not three companies", ar: "فريق واحد، لا ثلاث شركات" },
    body: {
      en: "The people who build a platform, the people who run the servers under it and the people who test whether it can be broken usually work for three different companies. Here they sit together, on site or remotely. Nothing falls into the gap between them, because there is no gap.",
      ar: "من يبني المنصة، ومن يشغّل الخوادم تحتها، ومن يختبر إمكانية كسرها: ثلاثة أطراف في العادة، وثلاث شركات. عندنا هم فريق واحد، في الموقع أو عن بُعد. فلا يسقط شيء في الفراغ بينهم، لأنه لا فراغ.",
    },
  },
  {
    key: "security-first",
    pictogram: "cybersecurity",
    title: { en: "Security before the first line of code", ar: "الأمن قبل أول سطر من الشيفرة" },
    body: {
      en: "We came out of cybersecurity, and it shows in how we build. Threats are modelled before anything exists, permissions are enforced in the database and not only on the screen, and nothing is handed over until someone whose job is to break it has tried.",
      ar: "خرجنا من الأمن السيبراني، ويظهر ذلك في طريقة بنائنا. ننمذج التهديدات قبل أن يوجد شيء، ونفرض الصلاحيات في قاعدة البيانات لا على الشاشة وحدها، ولا نسلّم شيئاً قبل أن يحاول كسره من مهمته أن يكسره.",
    },
  },
  {
    key: "plain-language",
    pictogram: "consulting",
    title: { en: "Plain language, and all of it written down", ar: "لغة واضحة، وكل شيء مكتوب" },
    body: {
      en: "Scope is agreed in writing before work starts. Findings arrive with the evidence attached. Recommendations say what to do, in what order, and why. Every report is written for the person who has to act on it, whether that is an engineer or a board member.",
      ar: "نتفق على النطاق كتابةً قبل أن يبدأ العمل. وتصلك النتائج ومعها أدلتها. وتقول توصياتنا ما ينبغي فعله، وبأي ترتيب، ولماذا. ونكتب كل تقرير لمن سيعمل به، مهندساً كان أو عضواً في مجلس الإدارة.",
    },
  },
  {
    key: "built-to-last",
    pictogram: "compliance",
    title: { en: "You should be able to leave us", ar: "من حقك أن تستغني عنا" },
    body: {
      en: "We use proven technology, document what we build, and hand over source code and infrastructure definitions in full. A system only we can maintain is a failure on our part. You should be free to walk away, and we work so that you never want to.",
      ar: "نستخدم تقنيات مجرّبة، ونوثّق ما نبنيه، ونسلّم الشيفرة المصدرية وتعريفات البنية التحتية كاملة. فالنظام الذي لا يستطيع صيانته سوانا إخفاق منا. من حقك أن ترحل عنا، ونعمل كي لا ترغب في ذلك.",
    },
  },
];
