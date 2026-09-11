import type { Bilingual } from "@/i18n/bilingual";

export type LegalSection = { title: Bilingual; paragraphs: Bilingual[] };
export type LegalDocument = { title: Bilingual; updated: string; intro: Bilingual; sections: LegalSection[] };

/**
 * Privacy notice and terms of use for cybarq.com and the CyBarq platform.
 * Written for CyBarq Technology LLC, a limited liability company registered in
 * the Hashemite Kingdom of Jordan. No legal citations are invented here; the
 * text describes what the company actually does with data.
 */
export const privacy: LegalDocument = {
  title: { en: "Privacy notice", ar: "إشعار الخصوصية" },
  updated: "2026-09-01",
  intro: {
    en: "This notice explains what personal data CyBarq Technology LLC collects through cybarq.com and the CyBarq platform, why we collect it, where it is stored, how long we keep it, and how to contact us about it. We have tried to write it plainly.",
    ar: "يوضح هذا الإشعار البيانات الشخصية التي تجمعها شركة سايبرق للتكنولوجيا عبر موقع cybarq.com ومنصة سايبرق، ولماذا نجمعها، وأين تُخزَّن، وكم نحتفظ بها، وكيف تتواصل معنا بشأنها. حاولنا كتابته بلغة واضحة.",
  },
  sections: [
    {
      title: { en: "Who we are", ar: "من نحن" },
      paragraphs: [
        {
          en: "CyBarq Technology LLC is a technology company registered in the Hashemite Kingdom of Jordan and based in Amman. For the purposes of this notice, CyBarq is the party responsible for the personal data described here. You can reach us at info@cybarq.com.",
          ar: "سايبرق للتكنولوجيا شركة تقنية مسجلة في المملكة الأردنية الهاشمية ومقرها عمّان. ولأغراض هذا الإشعار، سايبرق هي الجهة المسؤولة عن البيانات الشخصية الموصوفة هنا. يمكنك التواصل معنا على info@cybarq.com.",
        },
      ],
    },
    {
      title: { en: "What we collect on the public website", ar: "ما نجمعه على الموقع العام" },
      paragraphs: [
        {
          en: "When you use the contact form we collect the details you enter: your name, work email address, company and country if you provide them, the service you are interested in, and your message. We also record the date and time of the submission and a one way hash of your IP address, which we use to limit abuse of the form and cannot reverse to identify you.",
          ar: "حين تستخدم نموذج التواصل نجمع البيانات التي تدخلها: اسمك، وبريد العمل، والشركة والدولة إن قدمتهما، والخدمة التي تهمك، ورسالتك. ونسجل أيضاً تاريخ الإرسال ووقته، وقيمة تجزئة أحادية الاتجاه لعنوان IP الخاص بك نستخدمها للحد من إساءة استخدام النموذج ولا يمكن عكسها لتحديد هويتك.",
        },
        {
          en: "When you verify a certificate we process the verification code you enter and return only the information printed on that certificate. We do not store the codes you look up beyond the short period needed to limit repeated requests.",
          ar: "حين تتحقق من شهادة نعالج رمز التحقق الذي تدخله ونعيد فقط المعلومات المطبوعة على تلك الشهادة. ولا نخزن الرموز التي تبحث عنها لأكثر من الفترة القصيرة اللازمة للحد من الطلبات المتكررة.",
        },
        {
          en: "Our hosting provider records standard server logs, including IP addresses, browser type and the pages requested, for security and to keep the site running. We do not use advertising trackers or analytics that follow you across other websites.",
          ar: "يسجل مزوّد الاستضافة لدينا سجلات خادم قياسية، تشمل عناوين IP ونوع المتصفح والصفحات المطلوبة، لأغراض الأمان واستمرار عمل الموقع. ولا نستخدم متتبعات إعلانية أو أدوات تحليل تتبعك عبر مواقع أخرى.",
        },
      ],
    },
    {
      title: { en: "What we collect on the platform and client portal", ar: "ما نجمعه على المنصة وبوابة العملاء" },
      paragraphs: [
        {
          en: "The CyBarq platform is available to our employees and to client users we have invited. For those accounts we hold the name, email address and role of the user, the records of the projects, engagements, documents and communications they take part in, and an audit log of significant actions with the time, the acting user and the originating IP address. This data is needed to deliver our services and to keep the platform secure.",
          ar: "منصة سايبرق متاحة لموظفينا ولمستخدمي العملاء الذين ندعوهم. ولهذه الحسابات نحتفظ باسم المستخدم وبريده الإلكتروني ودوره، وسجلات المشاريع والارتباطات والمستندات والمراسلات التي يشارك فيها، وسجل تدقيق للإجراءات المهمة مع الوقت والمستخدم المنفذ وعنوان IP المصدر. هذه البيانات لازمة لتقديم خدماتنا وللحفاظ على أمان المنصة.",
        },
        {
          en: "Files uploaded to the platform, including security reports, project documents and certificates, are stored in private storage and are only available to the users authorised for the record they belong to.",
          ar: "تُخزَّن الملفات المرفوعة إلى المنصة، بما فيها التقارير الأمنية ومستندات المشاريع والشهادات، في تخزين خاص، ولا تتاح إلا للمستخدمين المخولين بالسجل الذي تنتمي إليه.",
        },
      ],
    },
    {
      title: { en: "Why we use it", ar: "لماذا نستخدمها" },
      paragraphs: [
        {
          en: "We use contact form data to respond to your enquiry and, where you have asked about our services, to follow up on it. We use platform data to deliver the work we have agreed with our clients, to manage our relationship with them, to meet our legal and contractual obligations, and to protect the platform and its users from abuse. We do not sell personal data and we do not use it for advertising.",
          ar: "نستخدم بيانات نموذج التواصل للرد على استفسارك، ولمتابعته حين تكون قد سألت عن خدماتنا. ونستخدم بيانات المنصة لتقديم العمل المتفق عليه مع عملائنا، وإدارة علاقتنا بهم، والوفاء بالتزاماتنا القانونية والتعاقدية، وحماية المنصة ومستخدميها من إساءة الاستخدام. ولا نبيع البيانات الشخصية ولا نستخدمها للإعلانات.",
        },
      ],
    },
    {
      title: { en: "Cookies", ar: "ملفات تعريف الارتباط" },
      paragraphs: [
        {
          en: "The public website sets a cookie that remembers your language preference. The platform and client portal set the cookies needed to keep you signed in during a session. We do not set marketing or third party tracking cookies. You can clear these cookies in your browser at any time; doing so will sign you out of the platform.",
          ar: "يضع الموقع العام ملف تعريف ارتباط يتذكر لغتك المفضلة. وتضع المنصة وبوابة العملاء ملفات تعريف الارتباط اللازمة لإبقائك مسجل الدخول أثناء الجلسة. ولا نضع ملفات تعريف ارتباط تسويقية أو تتبعية من أطراف ثالثة. يمكنك مسح هذه الملفات من متصفحك في أي وقت، وسيؤدي ذلك إلى تسجيل خروجك من المنصة.",
        },
      ],
    },
    {
      title: { en: "Where data is stored and who processes it", ar: "أين تُخزَّن البيانات ومن يعالجها" },
      paragraphs: [
        {
          en: "The website and platform are hosted on Vercel, and the database, authentication and file storage are provided by Supabase. Both are established infrastructure providers with published security practices, and data is stored in their data centres outside Jordan. Transactional email, such as contact confirmations and account invitations, is sent through Resend. These providers process data on our behalf and under our instructions; they do not use it for their own purposes.",
          ar: "يُستضاف الموقع والمنصة على Vercel، وتُقدَّم قاعدة البيانات والمصادقة وتخزين الملفات عبر Supabase. وكلاهما مزوّدا بنية تحتية راسخان لهما ممارسات أمنية منشورة، وتُخزَّن البيانات في مراكز بياناتهما خارج الأردن. أما رسائل البريد الإلكتروني التشغيلية، مثل تأكيدات التواصل ودعوات الحسابات، فتُرسل عبر Resend. يعالج هؤلاء المزوّدون البيانات نيابة عنا ووفق تعليماتنا، ولا يستخدمونها لأغراضهم الخاصة.",
        },
        {
          en: "Within CyBarq, access to personal data is limited to the employees who need it for their role and is enforced by permissions in the platform itself.",
          ar: "داخل سايبرق، يقتصر الوصول إلى البيانات الشخصية على الموظفين الذين يحتاجونها لأداء دورهم، ويُفرض ذلك عبر الصلاحيات في المنصة نفسها.",
        },
      ],
    },
    {
      title: { en: "How long we keep it", ar: "كم نحتفظ بها" },
      paragraphs: [
        {
          en: "Contact form submissions are kept for up to 24 months after our last exchange with you, then deleted, unless they led to a client relationship, in which case they become part of that client's records. Platform and portal records are kept for the duration of the client relationship and for the period afterwards that our contractual and legal obligations require. Audit logs are retained for the life of the platform because they are part of how we protect it. Server logs held by our hosting provider are kept for a short rolling period.",
          ar: "نحتفظ برسائل نموذج التواصل لمدة تصل إلى 24 شهراً بعد آخر تواصل معك ثم نحذفها، ما لم تكن قد أفضت إلى علاقة عمل، فتصبح عندها جزءاً من سجلات ذلك العميل. ونحتفظ بسجلات المنصة والبوابة طوال مدة العلاقة مع العميل وللفترة اللاحقة التي تقتضيها التزاماتنا التعاقدية والقانونية. ويُحتفظ بسجلات التدقيق طوال عمر المنصة لأنها جزء من طريقة حمايتنا لها. أما سجلات الخادم لدى مزوّد الاستضافة فتُحفظ لفترة قصيرة متجددة.",
        },
      ],
    },
    {
      title: { en: "Your choices", ar: "خياراتك" },
      paragraphs: [
        {
          en: "You can ask us what personal data we hold about you, ask us to correct it, or ask us to delete it where we no longer need it for the purposes above or for a legal obligation. Client users can also ask their organisation's administrator to update their account. Write to info@cybarq.com and we will respond within a reasonable time.",
          ar: "يمكنك أن تسألنا عن البيانات الشخصية التي نحتفظ بها عنك، أو تطلب تصحيحها، أو تطلب حذفها حين لا نعود بحاجة إليها للأغراض المذكورة أعلاه أو لالتزام قانوني. ويمكن لمستخدمي العملاء أيضاً أن يطلبوا من مسؤول مؤسستهم تحديث حساباتهم. راسلنا على info@cybarq.com وسنرد خلال وقت معقول.",
        },
      ],
    },
    {
      title: { en: "Changes to this notice", ar: "التغييرات على هذا الإشعار" },
      paragraphs: [
        {
          en: "When we change how we handle personal data we will update this page and the date at the top. Significant changes affecting platform users will also be communicated to them directly.",
          ar: "حين نغيّر طريقة تعاملنا مع البيانات الشخصية سنحدّث هذه الصفحة والتاريخ في أعلاها. وسيُبلَّغ مستخدمو المنصة مباشرة بالتغييرات الجوهرية التي تمسّهم.",
        },
      ],
    },
  ],
};

export const terms: LegalDocument = {
  title: { en: "Terms of use", ar: "شروط الاستخدام" },
  updated: "2026-09-01",
  intro: {
    en: "These terms govern the use of cybarq.com and of the CyBarq platform and client portal operated by CyBarq Technology LLC. Services we deliver to clients are governed by the written agreement for each engagement; where these terms and that agreement differ, the agreement applies.",
    ar: "تحكم هذه الشروط استخدام موقع cybarq.com ومنصة سايبرق وبوابة العملاء التي تشغّلها شركة سايبرق للتكنولوجيا. أما الخدمات التي نقدمها للعملاء فيحكمها الاتفاق المكتوب لكل ارتباط؛ وحين تختلف هذه الشروط عن ذلك الاتفاق، يسري الاتفاق.",
  },
  sections: [
    {
      title: { en: "The website", ar: "الموقع" },
      paragraphs: [
        {
          en: "The content of cybarq.com is provided for general information about CyBarq and its services. We take care to keep it accurate, but it does not constitute professional advice for any specific situation, and it is not an offer capable of acceptance. Any engagement begins only with a written agreement.",
          ar: "يُقدَّم محتوى موقع cybarq.com لأغراض التعريف العام بسايبرق وخدماتها. نحرص على دقته، لكنه لا يشكّل استشارة مهنية لأي حالة بعينها، ولا يُعدّ عرضاً قابلاً للقبول. ولا يبدأ أي ارتباط إلا باتفاق مكتوب.",
        },
        {
          en: "The CyBarq name, logo, symbol, pictograms and the written content of this site belong to CyBarq Technology LLC. You may quote or link to the site; you may not reproduce our brand assets or present our content as your own. Partner and certification logos belong to their respective owners and are shown to indicate a relationship, not endorsement of any third party.",
          ar: "اسم سايبرق وشعارها ورمزها ورموزها التصويرية والمحتوى المكتوب لهذا الموقع ملك لشركة سايبرق للتكنولوجيا. يجوز لك الاقتباس من الموقع أو الربط إليه؛ ولا يجوز لك إعادة إنتاج أصول علامتنا أو تقديم محتوانا على أنه محتواك. وتعود شعارات الشركاء والشهادات إلى أصحابها وتُعرض للدلالة على علاقة، لا على تأييد أي طرف ثالث.",
        },
      ],
    },
    {
      title: { en: "Contact form and certificate verification", ar: "نموذج التواصل والتحقق من الشهادات" },
      paragraphs: [
        {
          en: "The contact form is for genuine enquiries. Automated, bulk or abusive submissions are not permitted and are rate limited. The certificate verification service confirms whether a certificate bearing a given code was issued by CyBarq and whether it remains valid; it is provided as is for the benefit of certificate holders and the parties they show certificates to, and it must not be used to enumerate or harvest codes.",
          ar: "نموذج التواصل مخصص للاستفسارات الحقيقية. ولا يُسمح بالإرسال الآلي أو الجماعي أو المسيء، وهو محدود المعدل. وتؤكد خدمة التحقق من الشهادات ما إذا كانت شهادة تحمل رمزاً معيناً صادرة عن سايبرق وما إذا كانت ما تزال سارية؛ وتُقدَّم كما هي لصالح حاملي الشهادات والجهات التي يعرضونها عليها، ولا يجوز استخدامها لتعداد الرموز أو جمعها.",
        },
      ],
    },
    {
      title: { en: "Platform and client portal accounts", ar: "حسابات المنصة وبوابة العملاء" },
      paragraphs: [
        {
          en: "Accounts on the CyBarq platform are created by CyBarq for its employees and for named users at client organisations. An account is personal to the user it was issued to. You are responsible for keeping your credentials confidential, for enabling any additional protections we make available, and for telling us promptly at support@cybarq.com if you believe your account has been used without your authority.",
          ar: "تُنشئ سايبرق حسابات المنصة لموظفيها ولمستخدمين محددين بالاسم لدى المؤسسات العميلة. والحساب شخصي للمستخدم الذي صدر له. وأنت مسؤول عن الحفاظ على سرية بيانات دخولك، وعن تفعيل أي حماية إضافية نتيحها، وعن إبلاغنا فوراً على support@cybarq.com إذا اعتقدت أن حسابك استُخدم من دون إذنك.",
        },
        {
          en: "You must not attempt to access records, files or functions that your permissions do not cover, to interfere with the platform's operation, or to test its security without our written authorisation. We log significant actions on the platform and may suspend an account while we investigate suspected misuse.",
          ar: "لا يجوز لك محاولة الوصول إلى سجلات أو ملفات أو وظائف لا تغطيها صلاحياتك، أو التدخل في تشغيل المنصة، أو اختبار أمنها من دون تفويض كتابي منا. ونسجّل الإجراءات المهمة على المنصة، وقد نعلّق حساباً أثناء التحقيق في اشتباه بإساءة استخدام.",
        },
        {
          en: "Documents and reports made available through the client portal are provided under the engagement they belong to and are confidential to that client. They may be shared within the client organisation as that engagement allows and must not be published or passed to third parties without agreement.",
          ar: "تُقدَّم المستندات والتقارير المتاحة عبر بوابة العملاء بموجب الارتباط الذي تنتمي إليه، وهي سرية لذلك العميل. ويجوز مشاركتها داخل المؤسسة العميلة بحسب ما يسمح به الارتباط، ولا يجوز نشرها أو تمريرها إلى أطراف ثالثة من دون اتفاق.",
        },
      ],
    },
    {
      title: { en: "Availability and liability", ar: "الإتاحة والمسؤولية" },
      paragraphs: [
        {
          en: "We work to keep the website and platform available and secure, but we do not promise uninterrupted access, and we may take them offline for maintenance or in response to a security concern. To the extent permitted by the applicable law, CyBarq is not liable for loss arising from reliance on the general content of the website or from interruptions to it. Liability in connection with client engagements is set out in the relevant agreement.",
          ar: "نعمل على إبقاء الموقع والمنصة متاحين وآمنين، لكننا لا نعد بوصول من دون انقطاع، وقد نوقفهما مؤقتاً للصيانة أو استجابةً لشاغل أمني. وإلى الحد الذي يسمح به القانون الواجب التطبيق، لا تتحمل سايبرق المسؤولية عن خسارة ناشئة عن الاعتماد على المحتوى العام للموقع أو عن انقطاعه. أما المسؤولية المتعلقة بارتباطات العملاء فيحددها الاتفاق ذو الصلة.",
        },
      ],
    },
    {
      title: { en: "Governing law", ar: "القانون الواجب التطبيق" },
      paragraphs: [
        {
          en: "These terms are governed by the laws of the Hashemite Kingdom of Jordan, and the courts of Amman have jurisdiction over any dispute arising from them, unless a client agreement provides otherwise.",
          ar: "تخضع هذه الشروط لقوانين المملكة الأردنية الهاشمية، وتختص محاكم عمّان بالنظر في أي نزاع ينشأ عنها، ما لم ينص اتفاق مع العميل على خلاف ذلك.",
        },
      ],
    },
    {
      title: { en: "Contact", ar: "التواصل" },
      paragraphs: [
        {
          en: "Questions about these terms can be sent to info@cybarq.com. We will update this page and the date at the top when the terms change.",
          ar: "يمكن إرسال الأسئلة حول هذه الشروط إلى info@cybarq.com. وسنحدّث هذه الصفحة والتاريخ في أعلاها عند تغيّر الشروط.",
        },
      ],
    },
  ],
};
