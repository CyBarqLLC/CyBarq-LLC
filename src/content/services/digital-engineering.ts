import { bi, type ServiceContent } from "./registry";

/**
 * Digital Engineering practice. Grew out of the original "IT Development and
 * Digital Solutions" service: building reliable, secure software is hard, and
 * teams should not have to choose between speed and safety.
 */
export const digitalEngineeringServices: ServiceContent[] = [
  {
    slug: "enterprise-web-platforms",
    practice: "digital-engineering",
    pictogram: "web",
    featured: true,
    title: bi("Enterprise Web Platforms", "منصات الويب المؤسسية"),
    summary: bi("Web platforms that many people use daily, built to be operated for years rather than demonstrated once.", "منصات ويب يستخدمها كثيرون كل يوم، مبنية لتُشغَّل سنوات لا لتُعرض مرة واحدة."),
    hero: bi("Your organisation will depend on this platform for years. We build it on that assumption.", "ستعتمد مؤسستك على هذه المنصة سنوات. نبنيها على هذا الأساس."),
    seo: {
      title: bi("Enterprise Web Platforms", "منصات الويب المؤسسية"),
      description: bi("CyBarq designs and builds enterprise web platforms: many users and roles, Arabic and English, security in the design, built to be maintained.", "تصميم وبناء منصات ويب مؤسسية من سايبرق: مستخدمون وأدوار متعددة، عربية وإنجليزية، أمان في صميم التصميم، وقابلية للصيانة."),
    },
    problem: {
      body: bi(
        "Deadlines are short, requirements keep moving, and security expectations keep rising. Under that pressure teams give up the parts nobody sees: the data model, the permission rules, the tests. The platform works on launch day, then gets harder to change every month until nobody wants to touch it.",
        "المواعيد قصيرة، والمتطلبات تتغير، والتوقعات الأمنية ترتفع. وتحت هذا الضغط تتنازل الفرق عمّا لا يراه أحد: نموذج البيانات، وقواعد الصلاحيات، والاختبارات. تعمل المنصة يوم الإطلاق، ثم يصعب تعديلها شهراً بعد شهر حتى لا يرغب أحد في الاقتراب منها.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Customer portals, operations platforms used by hundreds of staff, marketplaces, and any system where different kinds of user need a different view of the same data. You notice it as slow pages, and as permissions that are wrong in ways nobody spots for months. You notice it as an Arabic version that always trails the English one, and as releases the team dreads.",
        "بوابات العملاء، ومنصات العمليات التي يستخدمها مئات الموظفين، والأسواق الإلكترونية، وكل نظام يحتاج فيه مستخدمون مختلفون إلى رؤية مختلفة للبيانات نفسها. تلاحظه في صفحات بطيئة، وفي صلاحيات خاطئة لا ينتبه إليها أحد شهوراً. وتلاحظه في نسخة عربية متأخرة دائماً عن الإنجليزية، وفي إصدارات يخشاها الفريق.",
      ),
    },
    approach: {
      body: bi(
        "We design the data model and the permission rules before we build screens, and we enforce those rules in the database as well as in the interface. Arabic and English are built as one product, not a translation added afterwards. Security review happens in every cycle, and we keep the code in a state where a new engineer can read it and understand it. Performance, accessibility and monitoring are requirements we test against, not polish at the end.",
        "نصمم نموذج البيانات وقواعد الصلاحيات قبل أن نبني الشاشات، ونفرض هذه القواعد في قاعدة البيانات لا في الواجهة وحدها. ونبني العربية والإنجليزية كمنتج واحد، لا كترجمة تُضاف لاحقاً. وتجري المراجعة الأمنية في كل دورة، ونُبقي الشيفرة في حال يقرؤها مهندس جديد فيفهمها. أما الأداء وسهولة الوصول والمراقبة فمتطلبات نختبرها، لا لمسات أخيرة.",
      ),
    },
    engagement: {
      body: bi(
        "We start with a discovery phase of two to four weeks. It ends with a written scope, an architecture and a plan you can read. Delivery then runs in short cycles, each one ending in a working version on a staging environment you open yourself. After launch you can take a support and improvement arrangement, and in either case you receive the documentation and the full source.",
        "نبدأ باستكشاف من أسبوعين إلى أربعة. ينتهي بنطاق مكتوب وبنية وخطة تستطيع قراءتها. ثم يسير التنفيذ في دورات قصيرة، تنتهي كل دورة بنسخة عاملة على بيئة تجريبية تفتحها بنفسك. وبعد الإطلاق يمكنك الاتفاق على الدعم والتحسين، وفي الحالتين تتسلم الوثائق والشيفرة المصدرية كاملة.",
      ),
    },
    deliverables: {
      body: bi("A platform you own outright, with everything needed to run it and extend it.", "منصة تملكها بالكامل، ومعها ما يلزم لتشغيلها وتوسيعها."),
      items: [
        bi("Architecture, data model and permission design, written down", "البنية ونموذج البيانات وتصميم الصلاحيات، موثقة"),
        bi("Source code, automated tests and the deployment pipeline", "الشيفرة المصدرية والاختبارات الآلية وخط النشر"),
        bi("An Arabic and English interface, admin tools and an operations runbook", "واجهة بالعربية والإنجليزية، وأدوات إدارة، ودليل تشغيل"),
      ],
    },
    businessMeaning: {
      body: bi(
        "New features ship without an argument about whether the platform can take them. Security is part of the design, so an audit finds fewer surprises. And because you hold the code and the infrastructure definitions, you are not tied to any vendor, including us.",
        "تصدر الميزات الجديدة من دون نقاش حول قدرة المنصة على احتمالها. والأمان جزء من التصميم، فيجد التدقيق مفاجآت أقل. ولأنك تملك الشيفرة وتعريفات البنية التحتية، فلست مرتبطاً بأي مورّد، بما فينا.",
      ),
    },
    related: ["internal-business-systems", "apis-integrations", "performance-platform-architecture"],
  },
  {
    slug: "internal-business-systems",
    practice: "digital-engineering",
    pictogram: "platform",
    title: bi("Internal Business Systems", "أنظمة الأعمال الداخلية"),
    summary: bi("The systems your teams use every day: records, approvals, operations and reporting, built around how the work is really done.", "الأنظمة التي تستخدمها فرقك كل يوم: السجلات والموافقات والعمليات والتقارير، مبنية على طريقة العمل الفعلية."),
    hero: bi("Ready made software is built for the average company. Where your work differs from the average is where it starts to break.", "البرمجيات الجاهزة مصنوعة للشركة المتوسطة. وحيث يختلف عملك عن المتوسط تبدأ الحلول الالتفافية."),
    seo: {
      title: bi("Internal Business Systems", "أنظمة الأعمال الداخلية"),
      description: bi("Custom internal systems by CyBarq for operations, records, approvals, HR, finance and reporting: one system in place of spreadsheets and scattered tools.", "أنظمة داخلية مخصصة من سايبرق للعمليات والسجلات والموافقات والموارد البشرية والمالية والتقارير: نظام واحد بدل جداول البيانات والأدوات المتفرقة."),
    },
    problem: {
      body: bi(
        "Most organisations run on spreadsheets, email threads, a generic tool that covers half the need, and a lot of knowledge held in a few people's heads. The same data gets entered twice, approvals sit in an inbox, and a report takes days to assemble. Ask what the current state of anything is and you get an estimate.",
        "معظم المؤسسات تعمل بجداول بيانات، وسلاسل بريد، وأداة عامة تغطي نصف الحاجة، ومعرفة محفوظة في رؤوس أشخاص قليلين. تُدخل البيانات نفسها مرتين، وتبقى الموافقات في صندوق بريد، ويستغرق إعداد تقرير أياماً. واسأل عن حال أي ملف اليوم، تحصل على تقدير لا على جواب.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Case and request management, inventory and assets, leave and HR processes, procurement and approvals, client records, scheduling, and management reporting. It is easiest to see at month end, during an audit, and in the week a key employee is on leave.",
        "في إدارة الحالات والطلبات، والمخزون والأصول، وإجراءات الإجازات والموارد البشرية، والمشتريات والموافقات، وسجلات العملاء، والجدولة، والتقارير الإدارية. وأوضح ما يكون في نهاية الشهر، وأثناء التدقيق، وفي الأسبوع الذي يغيب فيه موظف أساسي.",
      ),
    },
    approach: {
      body: bi(
        "We start by watching how the process is actually carried out, which is rarely how the written procedure describes it. Then we build around that: clear records, roles and permissions, approvals that leave a trail, and reports that read from the data instead of from someone's weekend. We connect to the tools you are keeping, and we design the screens for the people who will sit in front of them all day.",
        "نبدأ بمتابعة كيف يُنفَّذ الإجراء فعلاً، وهو نادراً ما يطابق ما تقوله التعليمات المكتوبة. ثم نبني على هذا الأساس: سجلات واضحة، وأدوار وصلاحيات، وموافقات تترك أثراً، وتقارير تقرأ من البيانات لا من عطلة أحدهم. ونربط النظام بالأدوات التي ستبقى عندك، ونصمم الشاشات لمن سيجلس أمامها طوال اليوم.",
      ),
    },
    engagement: {
      body: bi(
        "A short discovery with the people who do the work gives us a scoped first version. That version replaces the most painful part of the current process, goes into use, and grows in cycles from there. Moving the data out of the existing spreadsheets and tools is planned with the rest of the work, not left to the last week.",
        "استكشاف قصير مع من يؤدون العمل يعطينا نسخة أولى محددة النطاق. تعالج هذه النسخة أشد أجزاء الإجراء إيلاماً، ثم تدخل الاستخدام وتتوسع في دورات. ونقل البيانات من جداول البيانات والأدوات الحالية يُخطط له مع بقية العمل، لا في الأسبوع الأخير.",
      ),
    },
    deliverables: {
      body: bi("One place where the process lives, owned by you.", "مكان واحد يعيش فيه الإجراء، وتملكه أنت."),
      items: [
        bi("A web application in Arabic and English with roles, approvals and an audit trail", "تطبيق ويب بالعربية والإنجليزية، مع أدوار وموافقات وسجل تدقيق"),
        bi("Your existing data moved in, and links to the systems you keep", "بياناتك الحالية منقولة إليه، وروابط مع الأنظمة التي تحتفظ بها"),
        bi("Reports and exports, documentation, and training for the administrators", "تقارير وتصدير للبيانات، ووثائق، وتدريب للمسؤولين"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Less time spent finding information and more spent using it. Approvals move, reporting is current, and the mistakes that came from copying between files disappear. The process keeps running in the week the person who knows everything is away.",
        "وقت أقل في البحث عن المعلومة ووقت أكثر في استخدامها. تتحرك الموافقات، وتبقى التقارير محدّثة، وتختفي الأخطاء الناتجة عن النسخ بين الملفات. ويستمر العمل في الأسبوع الذي يغيب فيه الشخص الذي يعرف كل شيء.",
      ),
    },
    related: ["workflow-systems-digital-portals", "custom-business-software", "legacy-modernisation"],
  },
  {
    slug: "saas-platforms",
    practice: "digital-engineering",
    pictogram: "software",
    title: bi("SaaS Platforms", "منصات SaaS"),
    summary: bi("Products sold by subscription, with tenant isolation, billing and onboarding built in from the first version.", "منتجات تُباع بالاشتراك، مع عزل المستأجرين والفوترة وتهيئة العملاء منذ النسخة الأولى."),
    hero: bi("In a SaaS product the business model is written into the code. We build the system so the business can grow without a rewrite.", "في منتج SaaS يكون نموذج العمل مكتوباً داخل الشيفرة. نبني النظام لينمو العمل من دون إعادة كتابته."),
    seo: {
      title: bi("SaaS Platform Development", "تطوير منصات SaaS"),
      description: bi("CyBarq builds multi tenant SaaS platforms: tenant isolation, subscriptions and billing, onboarding, admin tools, security and the operations to run it.", "نبني في سايبرق منصات SaaS متعددة المستأجرين: عزل المستأجرين، والاشتراكات والفوترة، وتهيئة العملاء، وأدوات الإدارة، والأمان، وتشغيل المنصة."),
    },
    problem: {
      body: bi(
        "The first version of a SaaS product is built to win the first few customers. How tenants are separated, how billing works and how the data is shaped all get decided in that rush, and they become very expensive to change once 100 customers depend on them. Multi tenant systems also fail in one particular way: a single flaw in the isolation exposes everyone at once.",
        "النسخة الأولى من منتج SaaS تُبنى لكسب أول العملاء. وفي تلك العجلة تُحسم طريقة فصل المستأجرين، وآلية الفوترة، وشكل البيانات، ويصير تغييرها مكلفاً جداً حين يعتمد عليها 100 عميل. وللأنظمة متعددة المستأجرين عطب من نوع خاص: ثغرة واحدة في العزل تكشف الجميع دفعة واحدة.",
      ),
    },
    whereItAppears: {
      body: bi(
        "A prototype that now has to become a product. An internal tool a company has decided to sell. A product that has grown until questions about tenant data, billing exceptions and support requests take up most of the engineering team's week.",
        "في نموذج أولي صار عليه أن يصير منتجاً. وفي أداة داخلية قررت الشركة بيعها. وفي منتج نما حتى صارت أسئلة بيانات المستأجرين وحالات الفوترة الاستثنائية وطلبات الدعم تستهلك معظم أسبوع فريق الهندسة.",
      ),
    },
    approach: {
      body: bi(
        "We settle the tenancy model first: how data is separated, how that separation is enforced in the database and not only in application code, and how we test that it holds. Subscriptions, billing, onboarding and the admin console are built with the same care as the main product, because a customer meets them first. We keep the architecture small enough for a few people to operate, and measured enough to show what customers do and where they get stuck.",
        "نحسم نموذج تعدد المستأجرين أولاً: كيف تُفصل البيانات، وكيف يُفرض الفصل في قاعدة البيانات لا في شيفرة التطبيق وحدها، وكيف نتأكد باختبار من أنه صامد. ونبني الاشتراكات والفوترة وتهيئة العملاء ولوحة الإدارة بالعناية نفسها التي نبني بها الجوهر، لأن العميل يلتقي بها أولاً. ونُبقي البنية صغيرة بما يكفي ليشغّلها فريق قليل العدد، ومزوّدة بقياسات تكشف ما يفعله العملاء وأين يتعثرون.",
      ),
    },
    engagement: {
      body: bi(
        "For a new product we run a short discovery on the business model and the first customers, then build a first release in an agreed number of cycles. For a product that already exists we begin with a review of the architecture and the security, then agree a sequence of changes that can ship while you keep selling. Your engineers work alongside ours throughout, so that running the product afterwards is theirs to do.",
        "للمنتج الجديد نجري استكشافاً قصيراً لنموذج العمل وأول العملاء، ثم نبني الإصدار الأول في عدد متفق عليه من الدورات. وللمنتج القائم نبدأ بمراجعة البنية والأمان، ثم نتفق على تسلسل تغييرات يمكن إطلاقها والبيع مستمر. ويعمل مهندسوك مع مهندسينا طوال الوقت ليصير تشغيل المنتج بأيديهم بعد ذلك.",
      ),
    },
    deliverables: {
      body: bi("A product platform, and the knowledge needed to operate it.", "منصة منتج، والمعرفة اللازمة لتشغيلها."),
      items: [
        bi("A multi tenant architecture with isolation enforced and tested", "بنية متعددة المستأجرين بعزل مفروض ومختبر"),
        bi("Subscriptions, billing, customer onboarding and an admin console", "الاشتراكات والفوترة وتهيئة العملاء ولوحة الإدارة"),
        bi("Deployment pipeline, monitoring, and a security baseline you can show a prospect", "خط نشر ومراقبة وخط أساس أمني تستطيع عرضه على عميل محتمل"),
      ],
    },
    businessMeaning: {
      body: bi(
        "You can add customers without adding risk and cost at the same rate. When an enterprise buyer sends a security questionnaire, you have real answers to give. Your engineers spend the week on the product instead of on tenant emergencies.",
        "تضيف عملاء من دون أن تزيد المخاطر والتكاليف بالوتيرة نفسها. وحين يرسل عميل مؤسسي استبياناً أمنياً تكون لديك إجابات حقيقية. ويقضي مهندسوك أسبوعهم على المنتج بدل طوارئ المستأجرين.",
      ),
    },
    related: ["cloud-applications", "identity-access-architecture", "platform-reliability-devops"],
  },
  {
    slug: "apis-integrations",
    practice: "digital-engineering",
    pictogram: "integration",
    title: bi("APIs & Integrations", "واجهات البرمجة والتكاملات"),
    summary: bi("APIs designed to be used by other people, and integrations between the systems you already run.", "واجهات برمجة مصممة ليستخدمها غيرك، وتكاملات بين الأنظمة التي تشغّلها الآن."),
    hero: bi("The data is already in your systems. The work is moving it between them without losing it or exposing it.", "البيانات موجودة في أنظمتك أصلاً. والعمل هو نقلها بينها من دون ضياع ولا انكشاف."),
    seo: {
      title: bi("APIs and Integrations", "واجهات البرمجة والتكاملات"),
      description: bi("API design and integration work by CyBarq: connecting ERP, CRM, payment, government and partner systems with documented, monitored interfaces.", "تصميم واجهات برمجة وهندسة تكاملات من سايبرق: ربط أنظمة ERP وCRM والدفع والأنظمة الحكومية وأنظمة الشركاء بواجهات موثقة ومراقبة."),
    },
    problem: {
      body: bi(
        "Integrations built in a hurry are the most fragile part of most estates. They fail quietly, retry in ways that create duplicate records, and run on credentials nobody has changed since the day they were set. An API opened to partners without a design behind it becomes permanent: hard to change, hard to secure, hard to version.",
        "التكاملات المبنية على عجل هي أهش ما في معظم البيئات التقنية. تفشل بصمت، وتعيد المحاولة بطريقة تُنتج سجلات مكررة، وتعمل ببيانات دخول لم يبدّلها أحد منذ يوم إنشائها. أما واجهة البرمجة التي تُفتح للشركاء بلا تصميم فتصير دائمة: يصعب تغييرها وتأمينها وإدارة إصداراتها.",
      ),
    },
    whereItAppears: {
      body: bi(
        "ERP and CRM synchronisation, payment gateways, electronic invoicing and government platforms, logistics partners, identity providers, and the SaaS tools each department signs up for on its own. You see it as two systems that disagree about the same customer, and as staff retyping data from one screen into another without noticing it any more.",
        "في مزامنة ERP وCRM، وبوابات الدفع، والفوترة الإلكترونية والمنصات الحكومية، وشركاء النقل، ومزوّدي الهوية، وأدوات SaaS التي تشترك فيها كل إدارة على حدة. تراه في نظامين يختلفان على العميل نفسه، وفي موظفين ينسخون البيانات من شاشة إلى أخرى ولم يعودوا ينتبهون لذلك.",
      ),
    },
    approach: {
      body: bi(
        "We design an API the way a product is designed: consistent naming, versions, documentation, authentication and rate limits from the first endpoint. Integrations are built so that running the same message twice is safe, and so that a failure is recorded and seen by a person. We choose dull, proven patterns over clever ones, and we write down which credentials exist and what data each flow carries.",
        "نصمم واجهة البرمجة كما يُصمم المنتج: تسمية متسقة، وإصدارات، ووثائق، ومصادقة، وحدود للمعدل منذ أول نقطة وصول. ونبني التكاملات بحيث يكون تنفيذ الرسالة نفسها مرتين آمناً، ويكون الفشل مسجَّلاً ويراه إنسان. ونختار الأنماط المملة المجرّبة لا الذكية، ونكتب ما لدينا من بيانات دخول وما تحمله كل قناة من بيانات.",
      ),
    },
    engagement: {
      body: bi(
        "We map the systems, the data that has to move and the rules that govern it, then agree each interface with the person who owns that system. Delivery is one integration at a time, tested against sandbox environments, then switched over with a way back. For an API your partners will use, we produce the documentation and a sandbox they can work against before launch.",
        "نرسم خريطة الأنظمة، والبيانات التي يجب أن تنتقل، والقواعد التي تحكمها، ثم نتفق على كل واجهة مع صاحب النظام المعني. والتسليم تكامل واحد في كل مرة، يُختبر على بيئات تجريبية، ثم يُشغَّل مع طريق للعودة. وإن كانت الواجهة للشركاء، نُعدّ لهم الوثائق وبيئة تجريبية يجرّبون عليها قبل الإطلاق.",
      ),
    },
    deliverables: {
      body: bi("Interfaces that are documented, watched, and safe to build on.", "واجهات موثقة ومراقبة يمكن البناء عليها بأمان."),
      items: [
        bi("API specification, documentation and a sandbox", "مواصفة الواجهة والوثائق وبيئة تجريبية"),
        bi("Integration services with retries, logs and alerts", "خدمات تكامل مع إعادة محاولة وسجلات وتنبيهات"),
        bi("A written inventory of data flows and credentials for your security records", "جرد مكتوب لتدفقات البيانات وبيانات الدخول لسجلاتك الأمنية"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Systems that agree with each other, work that moves without anyone retyping it, and a new partner or tool added without starting a project each time.",
        "أنظمة تتفق فيما بينها، وعمل ينتقل من دون إعادة إدخال، وشريك جديد أو أداة جديدة تُضاف من دون مشروع جديد في كل مرة.",
      ),
    },
    related: ["ai-api-model-integration", "internal-business-systems", "identity-access-architecture"],
  },
  {
    slug: "workflow-systems-digital-portals",
    practice: "digital-engineering",
    pictogram: "automation",
    title: bi("Workflow Systems & Digital Portals", "أنظمة سير العمل والبوابات الرقمية"),
    summary: bi("Portals for clients, citizens or members, and the workflow engine that moves what they submit.", "بوابات للعملاء أو المواطنين أو الأعضاء، ومحرك سير العمل الذي يحرّك ما يقدّمونه."),
    hero: bi("A portal makes a promise: submit here and the process will move. Most of the work is in keeping that promise.", "البوابة وعد: قدّم طلبك هنا وسيتحرك الإجراء. ومعظم العمل يقع في الوفاء بهذا الوعد."),
    seo: {
      title: bi("Workflow Systems and Digital Portals", "أنظمة سير العمل والبوابات الرقمية"),
      description: bi("Client, member and service portals from CyBarq in Arabic and English, with the workflow, case management and notification systems behind them.", "بوابات للعملاء والأعضاء والخدمات من سايبرق بالعربية والإنجليزية، مع أنظمة سير العمل وإدارة الحالات والإشعارات التي تقف خلفها."),
    },
    problem: {
      body: bi(
        "Many portals are a form in front of an inbox. The request arrives, and from that moment nobody outside the organisation knows where it is, and often nobody inside does either. Calls asking for status pile up, deadlines pass, and the portal that was meant to save work has created a new kind of it.",
        "كثير من البوابات نموذج أمام صندوق بريد. يصل الطلب، ومنذ تلك اللحظة لا يعرف أحد خارج المؤسسة أين صار، وغالباً لا يعرف أحد في الداخل أيضاً. تتراكم مكالمات السؤال عن الحالة، وتمضي المواعيد، وتصنع البوابة التي جاءت لتخفف العمل عملاً من نوع آخر.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Service requests, applications and licensing, onboarding a client or a supplier, support tickets, and document submissions that several departments have to approve. Anywhere a request passes through more than two people before it is finished.",
        "في طلبات الخدمة، والطلبات والتراخيص، وتهيئة عميل أو مورّد، وتذاكر الدعم، وتقديم مستندات توافق عليها عدة إدارات. في كل موضع يمر فيه الطلب بأكثر من شخصين قبل أن ينتهي.",
      ),
    },
    approach: {
      body: bi(
        "We write the process down as states: who can act at each one, what moves a request to the next, and what happens when a deadline passes. The applicant sees where the request has reached and what is still needed from them. Staff get a work queue ordered by age and urgency instead of an inbox. Notifications go out by email or SMS at the moments that matter, and every step is recorded, so the history of a case is never argued about.",
        "نكتب الإجراء على شكل حالات: من يتصرف في كل حالة، وما الذي ينقل الطلب إلى التالية، وماذا يحدث حين تنقضي المهلة. يرى مقدّم الطلب أين وصل طلبه وما بقي مطلوباً منه. ويحصل الموظف على قائمة عمل مرتبة بالأقدم والأكثر إلحاحاً بدل صندوق بريد. وتُرسل الإشعارات بالبريد أو الرسائل النصية في اللحظات المهمة، وتُسجَّل كل خطوة فلا يُختلف على تاريخ أي معاملة.",
      ),
    },
    engagement: {
      body: bi(
        "We sit with the people who own the process and map it as it should run, including the exceptions that make real processes untidy. The first release covers one workflow from submission to closure. Each workflow after that reuses the same engine, so it takes less time than the one before. Connections to identity, payment and records systems are agreed in the scope rather than discovered later.",
        "نجلس مع أصحاب الإجراء ونرسمه كما ينبغي أن يجري، بما فيه الاستثناءات التي تجعل الإجراءات الحقيقية غير مرتبة. ويغطي الإصدار الأول سير عمل واحداً من التقديم إلى الإغلاق. ويستخدم كل سير عمل تالٍ المحرك نفسه، فيأخذ وقتاً أقل مما قبله. ويُتفق على الربط بأنظمة الهوية والدفع والسجلات ضمن النطاق، لا يُكتشف لاحقاً.",
      ),
    },
    deliverables: {
      body: bi("A portal people can trust, and a back office that can keep up with it.", "بوابة يثق بها الناس، ومكتب خلفي يلحق بها."),
      items: [
        bi("A public or client portal with accounts, submissions and status tracking", "بوابة عامة أو للعملاء فيها حسابات وتقديم طلبات وتتبع للحالة"),
        bi("A workflow engine with roles, deadlines, escalation and a full history", "محرك سير عمل فيه أدوار ومهل وتصعيد وسجل كامل"),
        bi("A staff console, notifications, reports and links to your records", "لوحة للموظفين وإشعارات وتقارير وروابط مع سجلاتك"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Requests move on time, and anyone can see where they are. Fewer calls about status, fewer files lost between departments, and a record you can stand behind when a decision is questioned.",
        "تتحرك الطلبات في وقتها ويرى الجميع أين هي. مكالمات أقل عن الحالة، ومعاملات أقل تضيع بين الإدارات، وسجل تستند إليه حين يُسأل عن قرار.",
      ),
    },
    related: ["internal-business-systems", "enterprise-web-platforms", "ai-automation-workflow-integration"],
  },
  {
    slug: "cloud-applications",
    practice: "digital-engineering",
    pictogram: "cloud",
    title: bi("Cloud Applications", "التطبيقات السحابية"),
    summary: bi("Applications built for the cloud they run in, so scale, recovery and cost are decided in the design.", "تطبيقات مبنية للسحابة التي تعمل فيها، فيُحسم التوسع والاستعادة والتكلفة في التصميم."),
    hero: bi("Moving an application to the cloud is easy. Designing it for the cloud is what changes the bill and the uptime.", "نقل التطبيق إلى السحابة سهل. أما تصميمه لها فهو ما يغيّر الفاتورة ونسبة التوفر."),
    seo: {
      title: bi("Cloud Application Development", "تطوير التطبيقات السحابية"),
      description: bi("Cloud application development by CyBarq on AWS, Azure and Google Cloud: managed services, infrastructure as code, cost planning and security by design.", "تطوير تطبيقات سحابية من سايبرق على AWS وAzure وGoogle Cloud: خدمات مُدارة، وبنية تحتية كشيفرة، ونموذج تكلفة، وأمان في التصميم."),
    },
    problem: {
      body: bi(
        "An application lifted into the cloud without being designed for it usually costs more than it did in your own data centre and is no more reliable. Cloud services reward a few specific patterns and charge for everything else, and the invoice arrives every month either way. Security also works differently there: the boundary is identity and configuration, not a firewall at the edge.",
        "التطبيق الذي يُنقل إلى السحابة كما هو يكلف عادةً أكثر مما كان يكلفه في مركز بياناتك، ولا يكون أكثر موثوقية. الخدمات السحابية تكافئ أنماطاً قليلة محددة وتحاسب على ما عداها، والفاتورة تأتي كل شهر في الحالين. والأمان هناك مختلف: الحد هو الهوية والإعدادات، لا جدار حماية على الأطراف.",
      ),
    },
    whereItAppears: {
      body: bi(
        "New products that have to grow with demand, applications with uneven load such as a season or a campaign, data processing that runs in batches, and systems that must come back in another region after a failure. It also appears in the second month's invoice.",
        "في المنتجات الجديدة التي يجب أن تنمو مع الطلب، والتطبيقات ذات الحمل المتفاوت كموسم أو حملة، ومعالجة البيانات على دفعات، والأنظمة التي يجب أن تعود في منطقة أخرى بعد عطل. ويظهر أيضاً في فاتورة الشهر الثاني.",
      ),
    },
    approach: {
      body: bi(
        "We use managed services where they remove work you would otherwise do by hand, and avoid them where they tie you to one provider for nothing in return. Serverless and containers are tools, and we choose per workload rather than by preference. Infrastructure is written as code so any environment can be rebuilt, and the monthly cost is estimated while the architecture is still a drawing. Identity, secrets and network boundaries are designed together with our security practice.",
        "نستخدم الخدمات المُدارة حيث توفّر عملاً يدوياً، ونتجنبها حيث تربطك بمزوّد واحد بلا مقابل. والحوسبة بلا خوادم والحاويات أدوات، نختار بينها بحسب حمل العمل لا بحسب التفضيل. ونكتب البنية التحتية كشيفرة ليمكن إعادة بناء أي بيئة، ونقدّر الكلفة الشهرية والبنية ما تزال رسماً على الورق. وتُصمم الهوية والأسرار وحدود الشبكة مع فريقنا الأمني.",
      ),
    },
    engagement: {
      body: bi(
        "Discovery covers the workload, how much it is expected to grow, the data it holds and where that data is allowed to live. We produce an architecture with a cost model before anyone writes code. Delivery runs in cycles against a staging environment built the same way as production. You receive the infrastructure code, the runbooks and a cost dashboard, and we can operate the platform for you if you would rather not.",
        "يغطي الاستكشاف حمل العمل، وتوقع نموه، والبيانات التي يحملها، وأين يجوز أن تُخزَّن. وننتج بنية مع نموذج تكلفة قبل كتابة أي شيفرة. ويسير التنفيذ في دورات على بيئة تجريبية مبنية بالطريقة نفسها التي بُني بها الإنتاج. وتتسلم شيفرة البنية التحتية وأدلة التشغيل ولوحة للتكاليف، ويمكننا تشغيل المنصة عنك إن لم ترغب في تشغيلها.",
      ),
    },
    deliverables: {
      body: bi("An application and the cloud environment it runs in, both kept in version control.", "تطبيق والبيئة السحابية التي يعمل فيها، وكلاهما محفوظ في إدارة الإصدارات."),
      items: [
        bi("Application code, and infrastructure as code for every environment", "شيفرة التطبيق، والبنية التحتية كشيفرة لكل بيئة"),
        bi("Deployment pipeline, monitoring, backups and a recovery procedure", "خط نشر ومراقبة ونسخ احتياطي وإجراء استعادة"),
        bi("Cost model, security baseline and operations documentation", "نموذج تكلفة وخط أساس أمني ووثائق تشغيل"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Capacity that follows demand instead of a guess made last year. A cloud bill whose lines you can explain. And an application that can be rebuilt from code in hours if it ever has to be.",
        "سعة تتبع الطلب بدل تقدير وُضع العام الماضي. وفاتورة سحابية تستطيع تفسير بنودها. وتطبيق يمكن إعادة بنائه من الشيفرة في ساعات إن اضطررت يوماً إلى ذلك.",
      ),
    },
    related: ["cloud-architecture", "application-deployment-infrastructure", "saas-platforms"],
  },
  {
    slug: "legacy-modernisation",
    practice: "digital-engineering",
    pictogram: "database",
    title: bi("Legacy Modernisation", "تحديث الأنظمة القديمة"),
    summary: bi("Moving critical systems off ageing technology while the business that depends on them keeps running.", "نقل الأنظمة الحرجة عن تقنيات متقادمة، والعمل الذي يعتمد عليها مستمر."),
    hero: bi("The old system still works. That is what makes replacing it delicate, so we replace it one piece at a time.", "النظام القديم ما زال يعمل. وهذا ما يجعل استبداله حساساً، لذلك نستبدله قطعة قطعة."),
    seo: {
      title: bi("Legacy System Modernisation", "تحديث الأنظمة القديمة"),
      description: bi("Incremental legacy modernisation by CyBarq: assessment, staged replacement, data migration and reconciliation, with no big bang cutover.", "تحديث تدريجي للأنظمة القديمة من سايبرق: تقييم، واستبدال على مراحل، ونقل للبيانات ومطابقتها، من دون انتقال دفعة واحدة."),
    },
    problem: {
      body: bi(
        "Systems written ten or fifteen years ago still run payroll, billing and core operations in many organisations. They sit on platforms that no longer receive updates, depend on one or two people who understand them, and were designed when security meant something else. Replacing all of it at once is the riskiest project the organisation will ever attempt, so the decision keeps being postponed.",
        "أنظمة كُتبت قبل عشر أو خمس عشرة سنة ما زالت تشغّل الرواتب والفوترة والعمليات الأساسية في مؤسسات كثيرة. تقوم على منصات لم تعد تتلقى تحديثات، وتعتمد على شخص أو اثنين يفهمانها، وصُمّمت يوم كان للأمان معنى آخر. واستبدالها كلها دفعة واحدة أخطر مشروع قد تخوضه المؤسسة، فيُؤجَّل القرار مرة بعد مرة.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Desktop applications on frameworks that are no longer supported, business rules buried in stored procedures nobody will touch, systems that can no longer be patched, integrations held together by scheduled scripts, and vendors that have closed. The trigger is usually an audit finding, a failed piece of hardware, or the retirement of the one person who knew.",
        "في تطبيقات سطح مكتب على أطر لم تعد مدعومة، وقواعد عمل مدفونة في إجراءات مخزنة لا يمسّها أحد، وأنظمة لم يعد بالإمكان ترقيعها أمنياً، وتكاملات تتماسك بسكربتات مجدولة، ومورّدين أغلقوا أبوابهم. والمحفّز عادةً ملاحظة تدقيق، أو عطل في عتاد، أو تقاعد الشخص الوحيد الذي كان يعرف.",
      ),
    },
    approach: {
      body: bi(
        "We start with an honest assessment: what the system does, what it depends on, what data it holds, and which parts can simply be switched off. Then we replace one capability at a time behind a stable interface, while the old system keeps serving everything else. Data moves with a reconciliation at each step, so you can see for yourself that nothing was lost. Security improves along the way instead of being promised for the end.",
        "نبدأ بتقييم صريح: ماذا يفعل النظام، وعلى ماذا يعتمد، وما البيانات التي يحتفظ بها، وأي أجزائه يمكن إطفاؤها ببساطة. ثم نستبدل قدرة واحدة في كل مرة خلف واجهة ثابتة، والنظام القديم يواصل خدمة ما تبقى. وتنتقل البيانات مع مطابقة في كل خطوة، فترى بنفسك أن شيئاً لم يضع. ويتحسن الأمان مع الطريق، لا في وعد مؤجل إلى النهاية.",
      ),
    },
    engagement: {
      body: bi(
        "The assessment takes a few weeks and ends in a plan: what is replaced in what order, the risks at each step, and a timeline we believe in. Delivery is organised in stages, each with a cutover and a way back, and each leaving you better off than it found you. We work with your staff and your existing vendors, and we document the new system as if we were leaving tomorrow.",
        "يستغرق التقييم بضعة أسابيع وينتهي بخطة: ما الذي يُستبدل وبأي ترتيب، ومخاطر كل خطوة، وجدول زمني نصدّقه. ويُنظَّم التنفيذ في مراحل، لكل مرحلة انتقال وطريق للعودة، وتترك كل مرحلة وضعك أفضل مما وجدته. ونعمل مع موظفيك ومورّديك الحاليين، ونوثّق النظام الجديد كأننا سنغادر غداً.",
      ),
    },
    deliverables: {
      body: bi("A current system, a clean migration, and nothing left that only one person understands.", "نظام حديث، وترحيل نظيف، ولا شيء يبقى لا يفهمه إلا شخص واحد."),
      items: [
        bi("An assessment report and a staged modernisation plan", "تقرير تقييم وخطة تحديث على مراحل"),
        bi("Replacement components delivered stage by stage, with the data reconciled", "مكونات بديلة تُسلَّم مرحلة بعد مرحلة، مع مطابقة البيانات"),
        bi("Documentation, tests and a supported platform your team can maintain", "وثائق واختبارات ومنصة مدعومة يستطيع فريقك صيانتها"),
      ],
    },
    businessMeaning: {
      body: bi(
        "A risk that has been growing quietly for years is closed in a controlled way. Operations carry on, the security position improves at each stage, and the organisation stops depending on technology and people it cannot replace.",
        "خطر كان ينمو بصمت سنوات يُغلق بطريقة مضبوطة. تستمر العمليات، ويتحسن الوضع الأمني في كل مرحلة، وتكفّ المؤسسة عن الاعتماد على تقنية وأشخاص لا بديل لهم.",
      ),
    },
    related: ["infrastructure-modernisation", "internal-business-systems", "backup-resilience"],
  },
  {
    slug: "performance-platform-architecture",
    practice: "digital-engineering",
    pictogram: "performance",
    title: bi("Performance & Platform Architecture", "الأداء وبنية المنصات"),
    summary: bi("Architecture review and performance work for systems that have grown past the design they started with.", "مراجعة للبنية وعمل على الأداء لأنظمة تجاوزت التصميم الذي بدأت به."),
    hero: bi("Slow systems are slow for a reason you can measure. We find the cause and fix the architecture instead of the symptom.", "الأنظمة البطيئة بطيئة لسبب يمكن قياسه. نجد السبب ونعالج البنية لا العَرَض."),
    seo: {
      title: bi("Performance and Platform Architecture", "الأداء وبنية المنصات"),
      description: bi("Architecture review, performance diagnosis and scalability work by CyBarq for platforms that have outgrown the design they started with.", "مراجعة بنية وتشخيص أداء وعمل على قابلية التوسع من سايبرق للمنصات التي تجاوزت تصميمها الأول."),
    },
    problem: {
      body: bi(
        "A platform built for 100 users behaves differently with 10,000. Queries that were fine become the bottleneck, one shared database becomes the point everything waits on, and adding servers stops helping. The usual answer is another cache and more hardware, which hides the problem for a while and makes it harder to find later.",
        "منصة بُنيت لخدمة 100 مستخدم تتصرف تصرفاً آخر مع 10,000. الاستعلامات التي كانت مقبولة تصير عنق الزجاجة، وقاعدة البيانات المشتركة تصير النقطة التي ينتظرها كل شيء، وإضافة الخوادم تكفّ عن الإفادة. والجواب المعتاد ذاكرة تخزين مؤقت أخرى وعتاد أكثر، فتختفي المشكلة حيناً ويصعب العثور عليها لاحقاً.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Pages that get slower every quarter, reports that time out, overnight jobs that no longer finish by morning, outages at peak hours, and a cloud bill rising faster than usage. It is common in products that succeeded faster than anyone planned for.",
        "في صفحات تزداد بطئاً كل ربع سنة، وتقارير تنقضي مهلتها قبل أن تكتمل، ومهام ليلية لم تعد تنتهي قبل الصباح، وانقطاعات في ساعات الذروة، وفاتورة سحابية ترتفع أسرع من الاستخدام. وهذا شائع في المنتجات التي نجحت أسرع مما خُطط له.",
      ),
    },
    approach: {
      body: bi(
        "We measure before we change anything. Profiling, load tests and a look at the data model show where the time and the money actually go, which is often not where the team expected. Then we propose changes in order of effect: indexes and queries first, caching with a clear rule for when it expires, splitting workloads apart, moving slow work off the request. We recommend a rewrite only when the measurements leave nothing else.",
        "نقيس قبل أن نغيّر شيئاً. يكشف التحليل واختبار الحمل ومراجعة نموذج البيانات أين يذهب الوقت والمال فعلاً، وغالباً في غير ما يتوقعه الفريق. ثم نقترح التغييرات بترتيب أثرها: الفهارس والاستعلامات أولاً، ثم تخزين مؤقت بقاعدة واضحة لانتهاء صلاحيته، ثم فصل أحمال العمل، ونقل العمل البطيء خارج الطلب. ولا نوصي بإعادة الكتابة إلا حين لا تترك القياسات خياراً آخر.",
      ),
    },
    engagement: {
      body: bi(
        "A diagnostic phase of two to three weeks produces a report with the measurements behind each finding and a plan ordered by what each step will buy you. Your team can carry out the changes with our guidance, or we can, in increments where each one shows a measurable difference. We leave behind the monitoring that lets you see a regression before your users report it.",
        "تنتج مرحلة تشخيص من أسبوعين إلى ثلاثة تقريراً فيه القياسات وراء كل نتيجة، وخطة مرتبة بما تعود به كل خطوة عليك. ويستطيع فريقك تنفيذ التغييرات بإرشادنا، أو ننفذها نحن، على دفعات يُظهر كل منها فرقاً قابلاً للقياس. ونترك لك المراقبة التي ترى بها التراجع قبل أن يبلّغك به المستخدمون.",
      ),
    },
    deliverables: {
      body: bi("Measurements, a plan, and a faster system.", "قياسات، وخطة، ونظام أسرع."),
      items: [
        bi("A diagnostic report with measurements and root causes", "تقرير تشخيص فيه القياسات والأسباب الجذرية"),
        bi("Architecture recommendations ordered by effect and effort", "توصيات للبنية مرتبة بحسب الأثر والجهد"),
        bi("The improvements implemented, with numbers before and after, plus monitoring", "التحسينات منفذة، مع أرقام قبل وبعد، ومراقبة مستمرة"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Growth stops arriving as an emergency. Infrastructure spending follows what the system is actually doing, and your engineers understand their own platform again.",
        "لم يعد النمو يصل على هيئة طارئ. وينسجم الإنفاق على البنية التحتية مع ما يقوم به النظام فعلاً، ويعود مهندسوك يفهمون منصتهم.",
      ),
    },
    related: ["technical-architecture-consulting", "observability", "cloud-architecture"],
  },
  {
    slug: "custom-business-software",
    practice: "digital-engineering",
    pictogram: "software",
    title: bi("Custom Business Software", "برمجيات الأعمال المخصصة"),
    summary: bi("Software built for one specific need, when nothing on the market fits it well enough.", "برمجية تُبنى لحاجة واحدة بعينها، حين لا يناسبها شيء مما في السوق."),
    hero: bi("Sometimes the tool you need does not exist. We build it, and we build it so that someone else could maintain it.", "أحياناً لا تكون الأداة التي تحتاجها موجودة. نبنيها، ونبنيها بحيث يستطيع غيرنا صيانتها."),
    seo: {
      title: bi("Custom Business Software", "برمجيات الأعمال المخصصة"),
      description: bi("Custom software development by CyBarq: web and mobile applications, dashboards and internal tools, delivered with source code, tests and documentation.", "تطوير برمجيات مخصصة من سايبرق: تطبيقات ويب وهاتف، ولوحات وأدوات داخلية، تُسلَّم مع الشيفرة المصدرية والاختبارات والوثائق."),
    },
    problem: {
      body: bi(
        "Every organisation has a few processes that are genuinely its own. Pushing them into generic software produces workarounds, exports to a spreadsheet, and a growing list of things the tool cannot do. Building your own has its own risks: scope that was never written down, quality that depended on who was free that month, and code only its author can change.",
        "في كل مؤسسة إجراءات قليلة تخصها وحدها. وحشرها في برمجية عامة يُنتج حلولاً التفافية، وتصديراً إلى جدول بيانات، وقائمة تطول بما لا تستطيع الأداة فعله. وللبناء الخاص مخاطره أيضاً: نطاق لم يُكتب يوماً، وجودة تعتمد على من كان متفرغاً ذلك الشهر، وشيفرة لا يعدّلها إلا كاتبها.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Apps for field teams, calculators and configurators for a specialised product, dashboards over data from several sources, tools for a process a regulator inspects, small utilities your clients use, and the internal tool everyone now depends on that began as one person's script.",
        "في تطبيقات الفرق الميدانية، وحاسبات ومكوّنات لمنتج متخصص، ولوحات متابعة فوق بيانات من مصادر عدة، وأدوات لإجراء تفتّشه جهة تنظيمية، وأدوات صغيرة يستخدمها عملاؤك، والأداة الداخلية التي صار الجميع يعتمد عليها وقد بدأت سكربتاً كتبه شخص واحد.",
      ),
    },
    approach: {
      body: bi(
        "Scope is the first thing we deliver: what the software must do, what it will not do, and how we will both know it is finished. We use technology that is widely supported, so any competent team can pick the result up after us. Tests, security review and documentation are part of being finished, not extras. Whether it is web, mobile or both, the design starts from the people who will use it and the conditions they use it in.",
        "النطاق أول ما نسلّمه: ما الذي يجب أن تفعله البرمجية، وما الذي لن تفعله، وكيف نعرف معاً أنها اكتملت. ونستخدم تقنيات واسعة الدعم ليستطيع أي فريق كفء أن يكمل من بعدنا. والاختبار والمراجعة الأمنية والتوثيق جزء من الاكتمال لا إضافة عليه. وسواء كانت على الويب أو الهاتف أو كليهما، يبدأ التصميم من الناس الذين سيستخدمونها ومن الظروف التي يستخدمونها فيها.",
      ),
    },
    engagement: {
      body: bi(
        "A short discovery produces a written scope, a design, and either a fixed price or a clear estimate, depending on how well defined the need is. Delivery runs in cycles, and after each one there is a working version you can try. You receive the source, the documentation and the deployment setup, and you choose between a support arrangement and taking it in house.",
        "ينتج استكشاف قصير نطاقاً مكتوباً وتصميماً، ثم سعراً ثابتاً أو تقديراً واضحاً بحسب وضوح الحاجة. ويسير التنفيذ في دورات، وبعد كل دورة نسخة عاملة تستطيع تجربتها. وتتسلم الشيفرة والوثائق وإعدادات النشر، وتختار بين ترتيب للدعم أو تولّي الأمر داخلياً.",
      ),
    },
    deliverables: {
      body: bi("Software that does the job, and everything needed to keep it doing the job.", "برمجية تؤدي المهمة، ومعها ما يلزم لتبقى تؤديها."),
      items: [
        bi("A written scope, a design and the acceptance criteria", "نطاق مكتوب وتصميم ومعايير قبول"),
        bi("A tested application with its source code and deployment configuration", "تطبيق مختبر مع شيفرته المصدرية وإعدادات نشره"),
        bi("Documentation for users and administrators, and the option of support", "وثائق للمستخدمين والمسؤولين، وخيار الدعم"),
      ],
    },
    businessMeaning: {
      body: bi(
        "A tool shaped around your work rather than the other way round, at a cost and a timeline you agreed before we started. Once it is delivered you depend on documentation and tests, not on the developer who wrote it.",
        "أداة مصوغة على شكل عملك لا العكس، بتكلفة وجدول اتفقنا عليهما قبل البدء. وعند التسليم يكون اعتمادك على الوثائق والاختبارات، لا على المطوّر الذي كتبها.",
      ),
    },
    related: ["internal-business-systems", "apis-integrations", "ai-internal-tools"],
  },
];
