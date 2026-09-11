import type { Bilingual } from "@/i18n/bilingual";

/**
 * Careers page. No fake openings: an honest description of how the team
 * works, what it looks for, and one email to write to.
 */
export const careers = {
  title: { en: "Working at CyBarq", ar: "العمل في سايبرق" } satisfies Bilingual,
  lead: {
    en: "A small team in Amman that builds and secures systems for organisations that depend on them. We hire carefully and rarely, and we are always glad to hear from people who do good work.",
    ar: "فريق صغير في عمّان يبني الأنظمة ويؤمّنها لمؤسسات تعتمد عليها. نوظف بعناية وعلى فترات متباعدة، ويسعدنا دائماً أن نسمع ممن يتقنون عملهم.",
  } satisfies Bilingual,
  sections: [
    {
      title: { en: "How the team works", ar: "كيف يعمل الفريق" },
      body: {
        en: "We work in small groups with a clear owner for every piece of work. Engineers talk to clients directly. Security specialists sit with developers, and infrastructure decisions are made with the people who will run the result. Most of our work is delivered in short cycles with something reviewable at the end of each, and we write things down: scope, decisions, findings, and what we learned.",
        ar: "نعمل في مجموعات صغيرة مع مسؤول واضح عن كل جزء من العمل. يتحدث المهندسون مع العملاء مباشرة. ويجلس المتخصصون في الأمن مع المطورين، وتُتخذ قرارات البنية التحتية مع من سيشغّلون النتيجة. ويُسلَّم معظم عملنا في دورات قصيرة تنتهي كل منها بشيء قابل للمراجعة، ونكتب الأشياء: النطاق، والقرارات، والنتائج، وما تعلمناه.",
      },
    },
    {
      title: { en: "What we look for", ar: "ما نبحث عنه" },
      body: {
        en: "Depth in at least one of our four practices and curiosity about the others. Care in the details, because in our work the details are where the risk is. The ability to explain a technical matter to someone who is not technical, in Arabic or English, in writing. Honesty about what you know and what you do not. Experience matters, but we have hired people early in their careers who showed the rest.",
        ar: "عمق في واحدة على الأقل من ممارساتنا الأربع وفضول تجاه الأخرى. عناية بالتفاصيل، لأن التفاصيل في عملنا هي موضع المخاطر. القدرة على شرح مسألة تقنية لشخص غير تقني، بالعربية أو الإنجليزية، كتابةً. الصدق فيما تعرفه وما لا تعرفه. للخبرة وزنها، لكننا وظفنا أشخاصاً في بداية مسيرتهم أظهروا ما عدا ذلك.",
      },
    },
    {
      title: { en: "Students and graduates", ar: "الطلاب والخريجون" },
      body: {
        en: "We take a small number of interns and recent graduates when we have the capacity to teach them properly. Internships are paid, supervised, and involve real work on real systems under the guidance of a senior engineer. Certificates issued for training and internships at CyBarq can be verified on this site.",
        ar: "نستقبل عدداً محدوداً من المتدربين والخريجين الجدد حين تكون لدينا القدرة على تعليمهم كما ينبغي. التدريب مدفوع الأجر، وتحت إشراف، ويتضمن عملاً حقيقياً على أنظمة حقيقية بتوجيه من مهندس أول. ويمكن التحقق من الشهادات الصادرة عن سايبرق للتدريب والتدريب العملي على هذا الموقع.",
      },
    },
  ] satisfies { title: Bilingual; body: Bilingual }[],
  applyTitle: { en: "How to get in touch", ar: "كيف تتواصل معنا" } satisfies Bilingual,
  applyBody: {
    en: "We do not run an applicant tracking system. Send an email with a short note about the work you are proudest of, links to anything public, and your CV. We read every message and reply to each one, even when the answer is not yet.",
    ar: "لا نستخدم نظاماً لتتبع المتقدمين. أرسل بريداً إلكترونياً مع ملاحظة قصيرة عن العمل الذي تفخر به أكثر، وروابط لأي شيء منشور، وسيرتك الذاتية. نقرأ كل رسالة ونرد على كل واحدة، حتى حين تكون الإجابة ليس الآن.",
  } satisfies Bilingual,
} as const;
