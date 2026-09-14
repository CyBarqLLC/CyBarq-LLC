import type { Bilingual } from "@/i18n/bilingual";

/**
 * The About page, written as the team would tell it: how the company started,
 * why it is arranged the way it is, and what does not change from one project
 * to the next.
 */
export const about = {
  title: { en: "A Jordanian technology company, built around one team", ar: "شركة تقنية أردنية، مبنية حول فريق واحد" } satisfies Bilingual,
  lead: {
    en: "CyBarq is registered in Amman and works with clients here and across the region. We are a small team: we build software, run the infrastructure under it, secure both, and use AI where it genuinely helps. We work remotely, and we come into the room when the work is better done there.",
    ar: "سايبرق مسجّلة في عمّان، وتعمل مع عملائها هنا وفي المنطقة. نحن فريق صغير: نبني البرمجيات، ونشغّل البنية التي تقوم عليها، ونؤمّن الاثنين، ونستخدم الذكاء الاصطناعي حيث ينفع فعلاً. نعمل عن بُعد، ونحضر إلى الغرفة حين يكون العمل أجدى بالحضور.",
  } satisfies Bilingual,
  story: [
    {
      en: "We began in 2024, with a team that had already spent more than ten years between cybersecurity, software and technical infrastructure. The idea was not complicated: most organisations do not need three suppliers who blame each other when something breaks. They need one team that can build the thing and defend it.",
      ar: "بدأنا عام 2024 بفريق كان قد أمضى أكثر من عشر سنوات بين الأمن السيبراني والبرمجيات والبنية التقنية. ولم تكن الفكرة معقدة: معظم المؤسسات لا تحتاج إلى ثلاثة موردين يتبادلون اللوم حين يتعطل شيء، بل إلى فريق واحد يستطيع أن يبني الشيء وأن يدافع عنه.",
    },
    {
      en: "Some of our clients are a few streets away, others are in another city. What does not change is how the work is done: agreed in writing before it starts, built carefully, looked at by someone whose job is to find the weak point, and handed over in full.",
      ar: "بعض عملائنا على بعد شارعين، وبعضهم في مدينة أخرى. وما لا يتغير هو طريقة العمل: اتفاق مكتوب قبل أن يبدأ، وبناء متأنٍّ، ومراجعة من شخص مهمته أن يجد نقطة الضعف، وتسليم كامل.",
    },
    {
      en: "Today the work sits in four practices: Cybersecurity, Digital Engineering, Artificial Intelligence, and Technology and Infrastructure. Some clients come for a single penetration test. Others ask us to design, build and run the platform their business depends on. Both are welcome, and both get the same care.",
      ar: "واليوم يتوزع عملنا على أربعة مجالات: الأمن السيبراني، والهندسة الرقمية، والذكاء الاصطناعي، والتقنية والبنية التحتية. بعض العملاء يأتي لاختبار اختراق واحد، وبعضهم يطلب منا تصميم المنصة التي يقوم عليها عمله وبناءها وتشغيلها. وكلاهما مرحّب به، وكلاهما يلقى العناية نفسها.",
    },
    {
      en: "We would rather turn down work we are not the right team for than take it and discover that halfway through. When that happens we say so, and where we can we point you to someone who is.",
      ar: "ونفضّل أن نعتذر عن عمل لسنا الفريق الأنسب له، على أن نأخذه ثم نكتشف ذلك في منتصف الطريق. وحين يحدث ذلك نقولها بوضوح، وندلّك على من يناسبك متى استطعنا.",
    },
  ] satisfies Bilingual[],
  practicesTitle: { en: "What we do", ar: "ما نقدمه" } satisfies Bilingual,
  practicesLead: {
    en: "Each practice stands on its own, and the four are stronger together. A platform we build is tested by our own security team. Infrastructure we design is built for the software that will run on it. AI we integrate lives inside systems we already understand.",
    ar: "لكل مجال قيمته بذاته، والمجالات الأربعة معاً أقوى. المنصة التي نبنيها يختبرها فريقنا الأمني، والبنية التحتية التي نصممها تُبنى للبرمجيات التي ستعمل عليها، والذكاء الاصطناعي الذي ندمجه يعمل داخل أنظمة نفهمها أصلاً.",
  } satisfies Bilingual,
  howTitle: { en: "How we work", ar: "كيف نعمل" } satisfies Bilingual,
  registrationTitle: { en: "Our registration", ar: "تسجيلنا الرسمي" } satisfies Bilingual,
} as const;
