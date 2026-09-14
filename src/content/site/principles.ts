import type { PictogramName } from "@/components/brand/pictogram-paths";
import type { Bilingual } from "@/i18n/bilingual";

export type Principle = { key: string; pictogram: PictogramName; title: Bilingual; body: Bilingual };

/**
 * How CyBarq works. Four short passages on the home page, expanded on the
 * About page. Each is one calm sentence or two: what we hold to, said once.
 */
export const principles: Principle[] = [
  {
    key: "whole-system",
    pictogram: "platform",
    title: { en: "One team for the whole system", ar: "فريق واحد للنظام كاملاً" },
    body: {
      en: "The people who build a platform, the people who run it and the people who check its security are usually three different companies. With us they are one team, so nothing is lost between them.",
      ar: "من يبني المنصة، ومن يشغّلها، ومن يتحقق من أمنها: ثلاث شركات في العادة. أما عندنا فهم فريق واحد، فلا يضيع شيء بينهم.",
    },
  },
  {
    key: "security-first",
    pictogram: "cybersecurity",
    title: { en: "Security from the beginning", ar: "الأمن من البداية" },
    body: {
      en: "We came from cybersecurity, and it shows in how we build. Protection is considered before the first line of code rather than added at the end.",
      ar: "جئنا من الأمن السيبراني، ويظهر ذلك في طريقة بنائنا. نفكر في الحماية قبل أول سطر من الشيفرة، لا نضيفها في النهاية.",
    },
  },
  {
    key: "plain-language",
    pictogram: "consulting",
    title: { en: "Clear words, written down", ar: "كلمات واضحة، ومكتوبة" },
    body: {
      en: "We agree the scope in writing, explain what we find in plain language, and say what to do next and why. Every report is written for the person who has to act on it.",
      ar: "نتفق على النطاق كتابةً، ونشرح ما نجده بلغة واضحة، ونقول ما ينبغي فعله ولماذا. ونكتب كل تقرير لمن سيعمل به.",
    },
  },
  {
    key: "built-to-last",
    pictogram: "compliance",
    title: { en: "Built to be handed over", ar: "مبني ليُسلَّم" },
    body: {
      en: "We use proven technology, document what we build, and hand everything over in full, so your team can carry it on without us.",
      ar: "نستخدم تقنيات مجرّبة، ونوثّق ما نبنيه، ونسلّم كل شيء كاملاً، ليتمكن فريقك من متابعته من دوننا.",
    },
  },
];
