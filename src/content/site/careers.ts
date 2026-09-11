import type { Bilingual } from "@/i18n/bilingual";

/**
 * Careers page. No fake openings: an honest description of how the team
 * works, what it looks for, and one email to write to.
 */
export const careers = {
  title: { en: "Working at CyBarq", ar: "العمل في سايبرق" } satisfies Bilingual,
  lead: {
    en: "A small, local team that builds and secures systems for organisations that depend on them. We work in a hybrid way, remotely and on site. We hire carefully and rarely, and we are always glad to hear from people who do good work.",
    ar: "فريق محلي صغير يبني الأنظمة ويؤمّنها لمؤسسات تعتمد عليها. نعمل بنموذج هجين يجمع بين العمل عن بُعد والحضور المباشر. نوظّف بعناية وعلى فترات متباعدة، ويسعدنا دائماً أن نسمع ممن يتقنون عملهم.",
  } satisfies Bilingual,
  sections: [
    {
      title: { en: "How the team works", ar: "كيف يعمل الفريق" },
      body: {
        en: "We work in small groups with a clear owner for every piece of work. Engineers talk to clients directly. Security specialists work alongside developers, and infrastructure decisions are made with the people who will run the result. We collaborate remotely and work on site when a project calls for it. Most of our work is delivered in short cycles with something reviewable at the end of each, and we write things down: scope, decisions, findings, and what we learned.",
        ar: "نعمل في مجموعات صغيرة، ولكل جزء من العمل مسؤول واضح. يتحدث المهندسون مع العملاء مباشرة، ويعمل المتخصصون في الأمن إلى جانب المطورين، وتُتخذ قرارات البنية التحتية مع من سيتولون تشغيلها. نتعاون عن بُعد، ونعمل في الموقع حين يتطلب المشروع ذلك. ونسلّم معظم عملنا على دورات قصيرة تنتهي كل منها بما يمكن مراجعته، ونوثّق كل شيء كتابةً: النطاق، والقرارات، والنتائج، وما تعلمناه.",
      },
    },
    {
      title: { en: "What we look for", ar: "ما نبحث عنه" },
      body: {
        en: "Depth in at least one of our four practices and curiosity about the others. Care in the details, because in our work the details are where the risk is. The ability to explain a technical matter to someone who is not technical, in Arabic or English, in writing. Honesty about what you know and what you do not. Experience matters, but we have hired people early in their careers who showed the rest.",
        ar: "معرفة عميقة بواحد على الأقل من مجالاتنا الأربعة، وفضول تجاه البقية. عناية بالتفاصيل، لأن المخاطر في عملنا تكمن فيها. القدرة على شرح مسألة تقنية لشخص غير متخصص، كتابةً، بالعربية أو الإنجليزية. الصدق فيما تعرفه وما لا تعرفه. للخبرة وزنها، لكننا وظّفنا أشخاصاً في بداية مسيرتهم توافرت فيهم بقية هذه الصفات.",
      },
    },
    {
      title: { en: "Students and graduates", ar: "الطلاب والخريجون" },
      body: {
        en: "We take a small number of interns and recent graduates when we have the capacity to teach them properly. Internships are paid, supervised, and involve real work on real systems under the guidance of a senior engineer. Certificates issued for training and internships at CyBarq can be verified on this site.",
        ar: "نستقبل عدداً محدوداً من المتدربين والخريجين الجدد حين تتوفر لدينا القدرة على تعليمهم كما ينبغي. التدريب مدفوع الأجر، ويجري تحت إشراف، ويتضمن عملاً حقيقياً على أنظمة حقيقية بتوجيه من مهندس ذي خبرة. ويمكن التحقق عبر هذا الموقع من الشهادات التي تصدرها سايبرق للتدريب والتدريب العملي.",
      },
    },
  ] satisfies { title: Bilingual; body: Bilingual }[],
  applyTitle: { en: "How to get in touch", ar: "كيف تتواصل معنا" } satisfies Bilingual,
  applyBody: {
    en: "We do not run an applicant tracking system. Send an email with a short note about the work you are proudest of, links to anything public, and your CV. We read every message and reply to each one, even when the answer is not yet.",
    ar: "لا نستخدم نظاماً لتتبع المتقدمين. أرسل إلينا بريداً إلكترونياً فيه نبذة قصيرة عن أكثر عمل تفخر به، وروابط لأي أعمال منشورة، وسيرتك الذاتية. نقرأ كل رسالة ونرد عليها، حتى حين يكون الجواب: ليس الآن.",
  } satisfies Bilingual,
} as const;
