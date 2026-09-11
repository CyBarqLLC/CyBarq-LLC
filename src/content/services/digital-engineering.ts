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
    summary: bi("Large, multi user web platforms built to be operated for years, not demonstrated once.", "منصات ويب كبيرة متعددة المستخدمين مبنية لتُشغَّل لسنوات، لا لتُعرض مرة واحدة."),
    hero: bi("A platform your organisation will run on for years deserves to be engineered like one.", "المنصة التي ستعمل عليها مؤسستك لسنوات تستحق أن تُهندس على هذا الأساس."),
    seo: {
      title: bi("Enterprise Web Platforms", "منصات الويب المؤسسية"),
      description: bi("Design and development of enterprise web platforms by CyBarq: multi user, role based, bilingual, secure by design and built to be maintained.", "تصميم وتطوير منصات ويب مؤسسية من سايبرق: متعددة المستخدمين، مبنية على الأدوار، ثنائية اللغة، آمنة بالتصميم، وقابلة للصيانة."),
    },
    problem: {
      body: bi(
        "Building reliable digital solutions is hard. Tight deadlines, evolving requirements and rising security expectations often force teams to choose between speed and safety. The result is a platform that works on launch day and becomes harder to change every month after, until nobody dares to touch it.",
        "بناء منتج رقمي موثوق ليس سهلاً. المواعيد الضيقة والمتطلبات المتغيرة والتوقعات الأمنية المتزايدة تدفع الفرق غالباً إلى الاختيار بين السرعة والأمان. والنتيجة منصة تعمل يوم الإطلاق ثم تصبح أصعب في التعديل شهراً بعد شهر، حتى لا يجرؤ أحد على لمسها.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Customer portals, operations platforms used by hundreds of staff, marketplaces and service platforms, and any system where several kinds of user need different views of the same data. It shows up as slow pages, permissions that are wrong in subtle ways, an Arabic version that lags behind, and releases that everyone fears.",
        "في بوابات العملاء، ومنصات العمليات التي يستخدمها مئات الموظفين، والأسواق الإلكترونية ومنصات الخدمات، وأي نظام يحتاج فيه عدة أنواع من المستخدمين إلى رؤى مختلفة للبيانات نفسها. ويظهر على شكل صفحات بطيئة، وصلاحيات خاطئة بطرق خفية، ونسخة عربية متأخرة عن الأصل، وإصدارات يخشاها الجميع.",
      ),
    },
    approach: {
      body: bi(
        "Our engineers integrate security throughout the development lifecycle, ship dependable architectures and align every release with your goals. We design the data model and permissions first, build Arabic and English as one product rather than a translation, and keep the codebase in a state where a new engineer can understand it. Performance, accessibility and observability are requirements, not polish.",
        "يدمج مهندسونا الأمان في كل مرحلة من دورة التطوير، ويبنون بنى موثوقة، ويجعلون كل إصدار متوافقاً مع أهدافك. نصمم نموذج البيانات والصلاحيات أولاً، ونبني العربية والإنجليزية كمنتج واحد لا كترجمة، ونبقي الشيفرة في حالة يستطيع فيها مهندس جديد فهمها. الأداء وإمكانية الوصول والمراقبة متطلبات أساسية، لا لمسات أخيرة.",
      ),
    },
    engagement: {
      body: bi(
        "We begin with a discovery phase of two to four weeks that ends in a written scope, an architecture and a plan. Delivery runs in short cycles with a working, reviewable version at the end of each. You see progress in a staging environment, not in slides. After launch we offer a support and improvement arrangement, and we hand over documentation and source in full either way.",
        "نبدأ بمرحلة استكشاف من أسبوعين إلى أربعة تنتهي بنطاق مكتوب وبنية وخطة. ثم يسير التنفيذ في دورات قصيرة تنتهي كل منها بنسخة عاملة قابلة للمراجعة. ترى التقدم في بيئة تجريبية لا في شرائح عرض. وبعد الإطلاق نقدم ترتيباً للدعم والتحسين، ونسلّمك الوثائق والشيفرة المصدرية كاملة في كل الأحوال.",
      ),
    },
    deliverables: {
      body: bi("A platform you own outright, with everything needed to run and extend it.", "منصة تملكها بالكامل، مع كل ما يلزم لتشغيلها وتوسيعها."),
      items: [
        bi("Architecture, data model and permission design, documented", "بنية ونموذج بيانات وتصميم صلاحيات، موثقة جميعها"),
        bi("Source code, automated tests and deployment pipeline", "الشيفرة المصدرية والاختبارات الآلية وخط النشر"),
        bi("Bilingual interface, admin tooling and operations runbook", "واجهة ثنائية اللغة وأدوات إدارة ودليل تشغيل"),
      ],
    },
    businessMeaning: {
      body: bi(
        "A platform that keeps up with your organisation instead of holding it back: new features ship without fear, security is part of the design rather than a separate audit, and you are not locked to any single vendor, including us.",
        "منصة تواكب مؤسستك بدلاً من أن تعيقها: ميزات جديدة تصدر من دون خوف، وأمان مدمج في التصميم لا في تدقيق منفصل، ومن دون ارتباط بمورّد واحد، بما فينا نحن.",
      ),
    },
    related: ["internal-business-systems", "apis-integrations", "performance-platform-architecture"],
  },
  {
    slug: "internal-business-systems",
    practice: "digital-engineering",
    pictogram: "platform",
    title: bi("Internal Business Systems", "أنظمة الأعمال الداخلية"),
    summary: bi("The systems your teams use every day: operations, records, approvals and reporting, built around how you actually work.", "الأنظمة التي تستخدمها فرقك يومياً: العمليات والسجلات والموافقات والتقارير، مبنية حول طريقة عملك الفعلية."),
    hero: bi("Off the shelf software fits the average company. Your operations are not average.", "البرمجيات الجاهزة تناسب الشركة المتوسطة. وعملياتك ليست متوسطة."),
    seo: {
      title: bi("Internal Business Systems", "أنظمة الأعمال الداخلية"),
      description: bi("Custom internal systems by CyBarq for operations, records, approvals, HR, finance and reporting, replacing spreadsheets and disconnected tools with one secure system.", "أنظمة داخلية مخصصة من سايبرق للعمليات والسجلات والموافقات والموارد البشرية والمالية والتقارير، تستبدل جداول البيانات والأدوات المتفرقة بنظام واحد آمن."),
    },
    problem: {
      body: bi(
        "Most organisations run on a mixture of spreadsheets, email threads, a generic tool that half fits and a lot of memory in a few people's heads. Data is duplicated, approvals get lost, reports take days to assemble, and nobody can say with confidence what the current state of anything is.",
        "معظم المؤسسات تعمل على خليط من جداول البيانات وسلاسل البريد وأداة عامة تناسب نصف الاحتياج وكثير من المعلومات المحفوظة في رؤوس قلة من الناس. تتكرر البيانات، وتضيع الموافقات، ويستغرق تجميع التقارير أياماً، ولا يستطيع أحد أن يقول بثقة ما الوضع الحالي لأي شيء.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Case and request management, inventory and asset tracking, HR and leave processes, procurement and approvals, client records, scheduling, and management reporting. It is usually most visible at month end, during audits, and whenever a key employee is on leave.",
        "في إدارة الحالات والطلبات، وتتبع المخزون والأصول، وإجراءات الموارد البشرية والإجازات، والمشتريات والموافقات، وسجلات العملاء، والجدولة، والتقارير الإدارية. ويكون أكثر وضوحاً في نهاية الشهر، وخلال التدقيقات، وكلما كان موظف أساسي في إجازة.",
      ),
    },
    approach: {
      body: bi(
        "We start by understanding the process as it is really performed, not as the org chart describes it. Then we build a system around that: clear records, roles and permissions, approvals with an audit trail, and reports that come from the data rather than from someone's weekend. We integrate with the tools you keep, and we design for the people who will use it eight hours a day.",
        "نبدأ بفهم الإجراء كما يُنفَّذ فعلاً، لا كما يصفه الهيكل التنظيمي. ثم نبني نظاماً حوله: سجلات واضحة، وأدوار وصلاحيات، وموافقات مع سجل تدقيق، وتقارير تأتي من البيانات لا من عطلة نهاية أسبوع أحدهم. نتكامل مع الأدوات التي ستحتفظ بها، ونصمم لمن سيستخدم النظام ثماني ساعات يومياً.",
      ),
    },
    engagement: {
      body: bi(
        "A short discovery with the people who do the work produces a scoped first version that replaces the most painful part of the current process. We deliver that first, put it into use, and then extend it in cycles. Data migration from existing spreadsheets and tools is planned as part of the work, not left to the end.",
        "استكشاف قصير مع من يؤدون العمل ينتج نسخة أولى محددة النطاق تستبدل الجزء الأكثر إيلاماً من الإجراء الحالي. نسلّم هذه النسخة أولاً، ونضعها قيد الاستخدام، ثم نوسعها في دورات. ويُخطط لنقل البيانات من جداول البيانات والأدوات الحالية كجزء من العمل، لا يُترك للنهاية.",
      ),
    },
    deliverables: {
      body: bi("One system of record for the process, owned by you.", "نظام واحد مرجعي للإجراء، تملكه أنت."),
      items: [
        bi("A bilingual web application with roles, approvals and audit trail", "تطبيق ويب ثنائي اللغة مع أدوار وموافقات وسجل تدقيق"),
        bi("Migrated data and integrations with the systems you keep", "بيانات منقولة وتكاملات مع الأنظمة التي تحتفظ بها"),
        bi("Reports and exports, documentation and training for administrators", "تقارير وتصدير للبيانات، ووثائق وتدريب للمسؤولين"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Less time spent chasing information and more spent using it. Fewer errors, faster approvals, reporting that is current, and a process that keeps running when a key person is away.",
        "وقت أقل في ملاحقة المعلومات ووقت أكثر في استخدامها. أخطاء أقل، وموافقات أسرع، وتقارير محدّثة، وإجراء يستمر في العمل حين يغيب شخص أساسي.",
      ),
    },
    related: ["workflow-systems-digital-portals", "custom-business-software", "legacy-modernisation"],
  },
  {
    slug: "saas-platforms",
    practice: "digital-engineering",
    pictogram: "software",
    title: bi("SaaS Platforms", "منصات SaaS"),
    summary: bi("Multi tenant products built for subscription businesses: isolation, billing, onboarding and scale from the first version.", "منتجات متعددة المستأجرين مبنية لأعمال الاشتراك: العزل والفوترة وتهيئة العملاء والتوسع منذ النسخة الأولى."),
    hero: bi("A SaaS product is a business and a system at the same time. We build the system so the business can grow.", "منتج SaaS هو عمل تجاري ونظام في آن واحد. نبني النظام ليتمكن العمل من النمو."),
    seo: {
      title: bi("SaaS Platform Development", "تطوير منصات SaaS"),
      description: bi("Multi tenant SaaS platform engineering by CyBarq: tenant isolation, subscription and billing, onboarding, admin tooling, security and the operations to run it.", "هندسة منصات SaaS متعددة المستأجرين من سايبرق: عزل المستأجرين، والاشتراكات والفوترة، وتهيئة العملاء، وأدوات الإدارة، والأمان، والعمليات اللازمة للتشغيل."),
    },
    problem: {
      body: bi(
        "The first version of a SaaS product is usually built to win the first customers. The decisions made then, about how tenants are separated, how billing works and how data is structured, become very expensive to change once there are a hundred customers relying on them. Security incidents in multi tenant systems are also uniquely damaging: one flaw affects everyone.",
        "النسخة الأولى من منتج SaaS تُبنى عادةً لكسب أول العملاء. والقرارات التي تُتخذ حينها، عن كيفية فصل المستأجرين، وطريقة عمل الفوترة، وبنية البيانات، تصبح مكلفة جداً في التغيير حين يعتمد عليها مئة عميل. والحوادث الأمنية في الأنظمة متعددة المستأجرين مدمّرة بشكل خاص: ثغرة واحدة تصيب الجميع.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Startups moving from a prototype to a product, established companies turning an internal tool into something they sell, and products that have grown to the point where tenant data, billing edge cases and support requests are consuming the engineering team.",
        "في الشركات الناشئة المنتقلة من نموذج أولي إلى منتج، وفي الشركات القائمة التي تحوّل أداة داخلية إلى منتج تبيعه، وفي المنتجات التي نمت إلى حد صارت فيه بيانات المستأجرين وحالات الفوترة الاستثنائية وطلبات الدعم تستهلك فريق الهندسة.",
      ),
    },
    approach: {
      body: bi(
        "We design tenancy first: how data is isolated, how it is enforced at the database level rather than only in application code, and how it is tested. Subscriptions, billing, onboarding and admin tooling are built as product features with the same care as the core. We keep the architecture simple enough to operate with a small team and instrumented enough to know what customers are doing and where it hurts.",
        "نصمم نموذج تعدد المستأجرين أولاً: كيف تُعزل البيانات، وكيف يُفرض العزل على مستوى قاعدة البيانات لا في شيفرة التطبيق فقط، وكيف يُختبر. وتُبنى الاشتراكات والفوترة وتهيئة العملاء وأدوات الإدارة كميزات منتج بالعناية نفسها التي نبني بها الجوهر. ونبقي البنية بسيطة بما يكفي ليشغّلها فريق صغير، ومزوّدة بما يكفي من أدوات القياس لتعرف ماذا يفعل العملاء وأين تؤلمهم.",
      ),
    },
    engagement: {
      body: bi(
        "For a new product we run a focused discovery on the business model and the first customers, then build a first release in a fixed number of cycles. For an existing product we start with an architecture and security review and agree on a sequence of changes that can be shipped without stopping the business. Either way, your team is involved throughout so that they can own the product afterwards.",
        "للمنتج الجديد نجري استكشافاً مركزاً على نموذج العمل وأول العملاء، ثم نبني الإصدار الأول في عدد محدد من الدورات. وللمنتج القائم نبدأ بمراجعة للبنية والأمان ونتفق على تسلسل تغييرات يمكن إطلاقها من دون إيقاف العمل. وفي الحالتين يشارك فريقك طوال الوقت ليتمكن من امتلاك المنتج بعد ذلك.",
      ),
    },
    deliverables: {
      body: bi("A product platform and the operating knowledge that goes with it.", "منصة منتج، ومعها المعرفة التشغيلية اللازمة."),
      items: [
        bi("Multi tenant architecture with isolation enforced and tested", "بنية متعددة المستأجرين مع عزل مفروض ومختبر"),
        bi("Subscription, billing, onboarding and administration features", "ميزات الاشتراك والفوترة وتهيئة العملاء والإدارة"),
        bi("Deployment pipeline, monitoring and a security baseline you can show prospects", "خط نشر ومراقبة وخط أساس أمني يمكنك عرضه على العملاء المحتملين"),
      ],
    },
    businessMeaning: {
      body: bi(
        "You can take on customers without taking on proportionally more risk or cost. Enterprise prospects get credible answers to their security questions, and the engineering team spends its time on the product rather than on tenant emergencies.",
        "تستطيع استقبال عملاء جدد من دون أن تزداد المخاطر أو التكاليف بالنسبة نفسها. يحصل العملاء المؤسسيون المحتملون على إجابات موثوقة عن أسئلتهم الأمنية، ويقضي فريق الهندسة وقته على المنتج بدلاً من طوارئ المستأجرين.",
      ),
    },
    related: ["cloud-applications", "identity-access-architecture", "platform-reliability-devops"],
  },
  {
    slug: "apis-integrations",
    practice: "digital-engineering",
    pictogram: "integration",
    title: bi("APIs & Integrations", "واجهات البرمجة والتكاملات"),
    summary: bi("Well designed APIs and reliable integrations between the systems you already run.", "واجهات برمجة مصممة جيداً وتكاملات موثوقة بين الأنظمة التي تشغّلها بالفعل."),
    hero: bi("Your systems already hold the data. The work is making them talk to each other reliably and safely.", "أنظمتك تحتفظ بالبيانات بالفعل. العمل الحقيقي هو جعلها تتحدث مع بعضها بموثوقية وأمان."),
    seo: {
      title: bi("APIs and Integrations", "واجهات البرمجة والتكاملات"),
      description: bi("API design and integration engineering by CyBarq: connecting ERP, CRM, payment, government and partner systems with secure, monitored, documented interfaces.", "تصميم واجهات برمجة وهندسة تكاملات من سايبرق: ربط أنظمة ERP وCRM والدفع والأنظمة الحكومية وأنظمة الشركاء بواجهات آمنة ومراقبة وموثقة."),
    },
    problem: {
      body: bi(
        "Integrations built in a hurry are the most fragile part of most estates. They fail silently, retry badly, duplicate records, and carry credentials nobody rotates. An API exposed to partners without proper design becomes a permanent liability: hard to change, hard to secure, hard to version.",
        "التكاملات التي تُبنى على عجل هي الجزء الأكثر هشاشة في معظم البيئات. تفشل بصمت، وتعيد المحاولة بطريقة سيئة، وتكرر السجلات، وتحمل بيانات دخول لا يبدّلها أحد. وواجهة البرمجة التي تُعرض للشركاء من دون تصميم سليم تصبح عبئاً دائماً: يصعب تغييرها وتأمينها وإدارة إصداراتها.",
      ),
    },
    whereItAppears: {
      body: bi(
        "ERP and CRM synchronisation, payment gateways, e-invoicing and government platforms, logistics partners, identity providers, and the growing number of SaaS tools each department adopts. It shows up as data that does not match between systems and as manual re-entry that everyone has stopped noticing.",
        "في مزامنة أنظمة ERP وCRM، وبوابات الدفع، والفوترة الإلكترونية والمنصات الحكومية، وشركاء الخدمات اللوجستية، ومزوّدي الهوية، والعدد المتزايد من أدوات SaaS التي تتبناها كل إدارة. ويظهر على شكل بيانات غير متطابقة بين الأنظمة، وإدخال يدوي متكرر لم يعد أحد يلاحظه.",
      ),
    },
    approach: {
      body: bi(
        "We design APIs as products: consistent, versioned, documented, authenticated and rate limited from the start. Integrations are built to be idempotent and observable, so a failure is retried safely and visible to someone. We prefer boring, proven patterns over clever ones, and we make sure the credentials and data flows involved are understood and controlled.",
        "نصمم واجهات البرمجة كمنتجات: متسقة، ومُدارة الإصدارات، وموثقة، ومحمية بالمصادقة وتحديد المعدل منذ البداية. وتُبنى التكاملات لتكون آمنة عند التكرار وقابلة للمراقبة، فيُعاد تنفيذ الفشل بأمان ويراه أحد ما. نفضّل الأنماط البسيطة المثبتة على الذكية، ونتأكد من أن بيانات الدخول وتدفقات البيانات المعنية مفهومة وتحت السيطرة.",
      ),
    },
    engagement: {
      body: bi(
        "We map the systems, the data that needs to move and the rules that govern it, then agree on interfaces with the owners of each system. Delivery is incremental: one integration at a time, tested against sandbox environments, then cut over with a fallback. For public APIs we produce documentation and a sandbox your partners can use before go live.",
        "نرسم خريطة للأنظمة، والبيانات التي يجب أن تنتقل، والقواعد التي تحكمها، ثم نتفق على الواجهات مع أصحاب كل نظام. والتسليم تدريجي: تكامل واحد في كل مرة، يُختبر على بيئات تجريبية، ثم يُطلق مع خطة تراجع. ولواجهات البرمجة العامة ننتج وثائق وبيئة تجريبية يستخدمها شركاؤك قبل الإطلاق.",
      ),
    },
    deliverables: {
      body: bi("Interfaces that are documented, monitored and safe to depend on.", "واجهات موثقة ومراقبة ويمكن الاعتماد عليها بأمان."),
      items: [
        bi("API specification, documentation and sandbox", "مواصفة واجهة البرمجة والوثائق والبيئة التجريبية"),
        bi("Integration services with retries, logging and alerts", "خدمات تكامل مع إعادة محاولة وسجلات وتنبيهات"),
        bi("A data flow and credentials inventory for your security records", "جرد لتدفقات البيانات وبيانات الدخول لسجلاتك الأمنية"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Data that agrees with itself across systems, processes that run without re-keying, and the ability to add a partner or a tool without a new project each time.",
        "بيانات متطابقة عبر الأنظمة، وإجراءات تعمل من دون إعادة إدخال، وقدرة على إضافة شريك أو أداة من دون مشروع جديد في كل مرة.",
      ),
    },
    related: ["ai-api-model-integration", "internal-business-systems", "identity-access-architecture"],
  },
  {
    slug: "workflow-systems-digital-portals",
    practice: "digital-engineering",
    pictogram: "automation",
    title: bi("Workflow Systems & Digital Portals", "أنظمة سير العمل والبوابات الرقمية"),
    summary: bi("Portals for clients, citizens or members, and the workflow engines behind them.", "بوابات للعملاء أو المواطنين أو الأعضاء، ومحركات سير العمل التي تقف خلفها."),
    hero: bi("A good portal is a promise: submit here, and the process will move. We build the part that keeps the promise.", "البوابة الجيدة وعد: قدّم طلبك هنا وسيتحرك الإجراء. نبني الجزء الذي يفي بهذا الوعد."),
    seo: {
      title: bi("Workflow Systems and Digital Portals", "أنظمة سير العمل والبوابات الرقمية"),
      description: bi("Client, member and service portals with the workflow, case management and notification systems behind them, built by CyBarq in Arabic and English.", "بوابات للعملاء والأعضاء والخدمات مع أنظمة سير العمل وإدارة الحالات والإشعارات التي تقف خلفها، من سايبرق بالعربية والإنجليزية."),
    },
    problem: {
      body: bi(
        "Many portals are a form in front of an email inbox. The request arrives, and from that moment nobody outside the organisation knows where it is, and often nobody inside does either. Status calls pile up, deadlines are missed, and the portal that was meant to reduce work creates a new kind of it.",
        "كثير من البوابات ليست سوى نموذج أمام صندوق بريد. يصل الطلب، ومن تلك اللحظة لا يعرف أحد خارج المؤسسة أين هو، وغالباً لا يعرف أحد في داخلها أيضاً. تتراكم مكالمات الاستفسار عن الحالة، وتفوت المواعيد، والبوابة التي كان يُفترض أن تقلل العمل تخلق نوعاً جديداً منه.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Service requests, applications and licensing, onboarding of clients or suppliers, support and ticketing, document submission and approvals across several departments. Anywhere a request has to pass through more than two people before it is done.",
        "في طلبات الخدمة، والطلبات والتراخيص، وتهيئة العملاء أو المورّدين، والدعم والتذاكر، وتقديم المستندات والموافقات عبر عدة إدارات. في أي مكان يجب أن يمر فيه الطلب بأكثر من شخصين قبل إنجازه.",
      ),
    },
    approach: {
      body: bi(
        "We model the process explicitly: states, transitions, who can act at each step, what happens on a deadline. The portal shows applicants exactly where their request is and what is needed from them. Staff get a queue, not an inbox. Notifications go out by email or SMS at the right moments, and every step is recorded so the history of a case is never in doubt.",
        "ننمذج الإجراء بوضوح: الحالات، والانتقالات، ومن يستطيع التصرف في كل خطوة، وما يحدث عند انتهاء المهلة. تُظهر البوابة لمقدّم الطلب بالضبط أين طلبه وما المطلوب منه. ويحصل الموظفون على قائمة انتظار منظمة لا صندوق بريد. وتُرسل الإشعارات بالبريد أو الرسائل النصية في اللحظات المناسبة، وتُسجَّل كل خطوة فلا يكون تاريخ أي حالة موضع شك.",
      ),
    },
    engagement: {
      body: bi(
        "We start with the process owners and map the workflow as it should run, including the exceptions that make real processes messy. The first release covers one complete workflow end to end. Subsequent workflows reuse the same engine, so each one is faster than the last. Integration with identity, payment and records systems is scoped explicitly.",
        "نبدأ مع أصحاب الإجراء ونرسم سير العمل كما ينبغي أن يجري، بما في ذلك الاستثناءات التي تجعل الإجراءات الحقيقية معقدة. يغطي الإصدار الأول سير عمل واحداً كاملاً من البداية إلى النهاية. وتعيد أسيار العمل اللاحقة استخدام المحرك نفسه، فيكون كل منها أسرع من سابقه. ويُحدد التكامل مع أنظمة الهوية والدفع والسجلات بوضوح في النطاق.",
      ),
    },
    deliverables: {
      body: bi("A portal people can trust and a back office that can keep up with it.", "بوابة يثق بها الناس، ومكتب خلفي قادر على مواكبتها."),
      items: [
        bi("Public or client portal with accounts, submissions and status tracking", "بوابة عامة أو للعملاء مع حسابات وتقديم طلبات وتتبع للحالة"),
        bi("Workflow engine with roles, deadlines, escalations and audit history", "محرك سير عمل مع أدوار ومهل وتصعيد وسجل تدقيق"),
        bi("Staff console, notifications, reporting and integration with your records", "لوحة للموظفين وإشعارات وتقارير وتكامل مع سجلاتك"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Requests move on time and visibly. Fewer calls asking about status, fewer things lost between departments, and a record you can rely on when a case is questioned.",
        "تتحرك الطلبات في وقتها وبشكل مرئي. مكالمات أقل للسؤال عن الحالة، وأشياء أقل تضيع بين الإدارات، وسجل يمكنك الاعتماد عليه حين تُطرح أسئلة عن أي حالة.",
      ),
    },
    related: ["internal-business-systems", "enterprise-web-platforms", "ai-automation-workflow-integration"],
  },
  {
    slug: "cloud-applications",
    practice: "digital-engineering",
    pictogram: "cloud",
    title: bi("Cloud Applications", "التطبيقات السحابية"),
    summary: bi("Applications designed for the cloud they run in: scalable, resilient and cost aware.", "تطبيقات مصممة للسحابة التي تعمل فيها: قابلة للتوسع، ومرنة، وواعية بالتكلفة."),
    hero: bi("Running in the cloud is easy. Being designed for it is what makes the difference in cost, reliability and security.", "التشغيل في السحابة سهل. أما التصميم لها فهو ما يصنع الفرق في التكلفة والموثوقية والأمان."),
    seo: {
      title: bi("Cloud Application Development", "تطوير التطبيقات السحابية"),
      description: bi("Cloud native application development by CyBarq on AWS, Azure and Google Cloud: managed services, serverless where it fits, infrastructure as code and security built in.", "تطوير تطبيقات سحابية أصيلة من سايبرق على AWS وAzure وGoogle Cloud: خدمات مُدارة، وحوسبة بلا خوادم حيث تناسب، وبنية تحتية كشيفرة، وأمان مدمج."),
    },
    problem: {
      body: bi(
        "An application moved to the cloud without being designed for it usually costs more than it did on premises and is no more reliable. Cloud services reward specific patterns and punish others, and the bill arrives monthly either way. Security in the cloud is also different: the perimeter is identity and configuration, not a firewall.",
        "التطبيق الذي يُنقل إلى السحابة من دون أن يُصمم لها يكلف عادةً أكثر مما كان يكلف محلياً، ولا يكون أكثر موثوقية. الخدمات السحابية تكافئ أنماطاً محددة وتعاقب غيرها، والفاتورة تصل شهرياً في الحالتين. والأمان في السحابة مختلف أيضاً: المحيط هو الهوية والإعدادات، لا جدار الحماية.",
      ),
    },
    whereItAppears: {
      body: bi(
        "New products that need to scale with demand, applications with uneven load such as seasonal or campaign driven traffic, data processing pipelines, and systems that must be recoverable in a different region. It also appears as the surprise in the second month's cloud invoice.",
        "في المنتجات الجديدة التي تحتاج إلى التوسع مع الطلب، والتطبيقات ذات الحمل المتفاوت مثل الحركة الموسمية أو المرتبطة بالحملات، وخطوط معالجة البيانات، والأنظمة التي يجب أن تكون قابلة للاستعادة في منطقة أخرى. ويظهر أيضاً كمفاجأة في فاتورة السحابة في الشهر الثاني.",
      ),
    },
    approach: {
      body: bi(
        "We choose managed services where they remove operational work and avoid them where they create lock in without benefit. Serverless and containers are tools, not a philosophy; we pick per workload. Infrastructure is defined as code, environments are reproducible, and cost is a design input from the first architecture diagram. Identity, secrets and network boundaries are designed with our security practice.",
        "نختار الخدمات المُدارة حيث تزيل عملاً تشغيلياً، ونتجنبها حيث تخلق ارتباطاً بمزوّد من دون فائدة. الحوسبة بلا خوادم والحاويات أدوات لا فلسفة؛ نختار لكل حمل عمل ما يناسبه. البنية التحتية معرّفة كشيفرة، والبيئات قابلة لإعادة الإنشاء، والتكلفة مدخل في التصميم منذ أول مخطط للبنية. وتُصمم الهوية والأسرار وحدود الشبكة مع فريقنا الأمني.",
      ),
    },
    engagement: {
      body: bi(
        "Discovery covers the workload, its growth expectations, its data and its compliance constraints, including where data may reside. We produce an architecture with a cost model before building. Delivery is in cycles with a staging environment identical to production. We hand over infrastructure code, runbooks and a cost dashboard, and we can run the platform for you if you prefer.",
        "يغطي الاستكشاف حمل العمل، وتوقعات نموه، وبياناته، وقيود الامتثال، بما فيها أين يجوز أن تقيم البيانات. ننتج بنية مع نموذج تكلفة قبل البناء. والتسليم في دورات مع بيئة تجريبية مطابقة للإنتاج. نسلّمك شيفرة البنية التحتية وأدلة التشغيل ولوحة للتكاليف، ويمكننا تشغيل المنصة نيابة عنك إن فضّلت ذلك.",
      ),
    },
    deliverables: {
      body: bi("An application and the cloud environment it needs, both under version control.", "تطبيق والبيئة السحابية التي يحتاجها، وكلاهما تحت إدارة الإصدارات."),
      items: [
        bi("Application code and infrastructure as code for every environment", "شيفرة التطبيق والبنية التحتية كشيفرة لكل بيئة"),
        bi("Deployment pipeline, monitoring, backups and a recovery procedure", "خط نشر ومراقبة ونسخ احتياطي وإجراء استعادة"),
        bi("Cost model, security baseline and operations documentation", "نموذج تكلفة وخط أساس أمني ووثائق تشغيل"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Capacity that follows demand, a cloud bill you can explain, and an application that can be rebuilt from code in hours if it ever has to be.",
        "سعة تتبع الطلب، وفاتورة سحابية يمكنك تفسيرها، وتطبيق يمكن إعادة بنائه من الشيفرة في ساعات إذا اضطررت يوماً إلى ذلك.",
      ),
    },
    related: ["cloud-architecture", "application-deployment-infrastructure", "saas-platforms"],
  },
  {
    slug: "legacy-modernisation",
    practice: "digital-engineering",
    pictogram: "database",
    title: bi("Legacy Modernisation", "تحديث الأنظمة القديمة"),
    summary: bi("Moving critical systems off ageing technology without stopping the business that depends on them.", "نقل الأنظمة الحرجة عن التقنيات المتقادمة من دون إيقاف العمل الذي يعتمد عليها."),
    hero: bi("The old system works, and that is exactly why replacing it is delicate. We modernise in steps, with the business running throughout.", "النظام القديم يعمل، وهذا بالضبط ما يجعل استبداله حساساً. نحدّثه على مراحل، والعمل مستمر طوال الوقت."),
    seo: {
      title: bi("Legacy System Modernisation", "تحديث الأنظمة القديمة"),
      description: bi("Incremental modernisation of legacy applications and databases by CyBarq: assessment, strangler migration, data migration and secure replacement without a big bang cutover.", "تحديث تدريجي للتطبيقات وقواعد البيانات القديمة من سايبرق: تقييم، وترحيل تدريجي، ونقل للبيانات، واستبدال آمن من دون انتقال دفعة واحدة."),
    },
    problem: {
      body: bi(
        "Systems built ten or fifteen years ago still run payroll, billing and core operations in many organisations. They depend on unsupported platforms, on one or two people who understand them, and on security assumptions from a different era. Replacing them all at once is the riskiest project most organisations will ever attempt, so it keeps being postponed.",
        "أنظمة بُنيت قبل عشر أو خمس عشرة سنة ما تزال تشغّل الرواتب والفوترة والعمليات الأساسية في كثير من المؤسسات. تعتمد على منصات لم تعد مدعومة، وعلى شخص أو اثنين يفهمانها، وعلى افتراضات أمنية من عصر آخر. واستبدالها دفعة واحدة هو أخطر مشروع قد تخوضه معظم المؤسسات، ولذلك يُؤجَّل باستمرار.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Desktop applications on old frameworks, databases with logic in stored procedures nobody dares edit, systems that can no longer be patched, integrations held together by scheduled scripts, and vendors that have gone out of business. The trigger is often an audit finding, a failed hardware component, or the retirement of the one person who knew.",
        "في تطبيقات سطح المكتب على أطر قديمة، وقواعد بيانات تحمل منطقاً في إجراءات مخزنة لا يجرؤ أحد على تعديلها، وأنظمة لم يعد بالإمكان تحديثها أمنياً، وتكاملات تتماسك بسكربتات مجدولة، ومورّدين خرجوا من السوق. وغالباً ما يكون المحفّز ملاحظة تدقيق، أو عطل في عتاد، أو تقاعد الشخص الوحيد الذي كان يعرف.",
      ),
    },
    approach: {
      body: bi(
        "We begin with an honest assessment: what the system does, what it depends on, what data it holds and what can be retired outright. Then we modernise incrementally, replacing one capability at a time behind a stable interface while the old system keeps running. Data is migrated with reconciliation at every step. Security is improved as we go rather than promised for the end.",
        "نبدأ بتقييم صادق: ماذا يفعل النظام، وعلى ماذا يعتمد، وما البيانات التي يحتفظ بها، وما الذي يمكن الاستغناء عنه مباشرة. ثم نحدّث تدريجياً، فنستبدل قدرة واحدة في كل مرة خلف واجهة مستقرة بينما يستمر النظام القديم في العمل. وتُنقل البيانات مع مطابقة في كل خطوة. ويتحسن الأمان مع تقدم العمل بدلاً من الوعد به في النهاية.",
      ),
    },
    engagement: {
      body: bi(
        "The assessment phase takes a few weeks and produces a modernisation plan with sequencing, risks and a realistic timeline. Delivery is organised in stages, each with its own cutover and rollback plan and each leaving the business in a better state than before. We work with your existing staff and vendors, and we document the new system as if we were leaving tomorrow.",
        "تستغرق مرحلة التقييم بضعة أسابيع وتنتج خطة تحديث بتسلسل ومخاطر وجدول زمني واقعي. ويُنظَّم التنفيذ في مراحل، لكل منها خطة انتقال وتراجع خاصة بها، وتترك كل مرحلة العمل في حال أفضل مما كان. نعمل مع موظفيك ومورّديك الحاليين، ونوثّق النظام الجديد كما لو كنا سنغادر غداً.",
      ),
    },
    deliverables: {
      body: bi("A modern system, a clean migration and no dependence on tribal knowledge.", "نظام حديث، وترحيل نظيف، ومن دون اعتماد على معرفة محصورة في أشخاص."),
      items: [
        bi("Assessment report and staged modernisation plan", "تقرير تقييم وخطة تحديث مرحلية"),
        bi("Replacement components delivered stage by stage with reconciled data", "مكونات بديلة تُسلَّم مرحلة بمرحلة مع بيانات مطابقة"),
        bi("Documentation, tests and a supported platform your team can maintain", "وثائق واختبارات ومنصة مدعومة يستطيع فريقك صيانتها"),
      ],
    },
    businessMeaning: {
      body: bi(
        "The risk that has been quietly growing for years is retired in a controlled way. Operations continue, the security posture improves stage by stage, and the organisation stops depending on technology and people it cannot replace.",
        "المخاطر التي كانت تنمو بصمت لسنوات تُنهى بطريقة مضبوطة. تستمر العمليات، ويتحسن الوضع الأمني مرحلة بعد مرحلة، وتتوقف المؤسسة عن الاعتماد على تقنيات وأشخاص لا يمكن تعويضهم.",
      ),
    },
    related: ["infrastructure-modernisation", "internal-business-systems", "backup-resilience"],
  },
  {
    slug: "performance-platform-architecture",
    practice: "digital-engineering",
    pictogram: "performance",
    title: bi("Performance & Platform Architecture", "الأداء وبنية المنصات"),
    summary: bi("Architecture reviews and performance engineering for systems that have grown past their original design.", "مراجعات للبنية وهندسة للأداء للأنظمة التي تجاوزت تصميمها الأصلي."),
    hero: bi("Slow systems are rarely slow for mysterious reasons. We find the actual cause and fix the architecture, not the symptom.", "الأنظمة البطيئة نادراً ما تكون بطيئة لأسباب غامضة. نجد السبب الفعلي ونصلح البنية لا العَرَض."),
    seo: {
      title: bi("Performance and Platform Architecture", "الأداء وبنية المنصات"),
      description: bi("Architecture review, performance diagnosis and scalability engineering by CyBarq for platforms that have outgrown their original design.", "مراجعة البنية وتشخيص الأداء وهندسة قابلية التوسع من سايبرق للمنصات التي تجاوزت تصميمها الأصلي."),
    },
    problem: {
      body: bi(
        "A platform designed for a hundred users behaves differently at ten thousand. Queries that were fine become the bottleneck, a shared database becomes a single point of failure, and adding servers stops helping. Teams often respond by adding caches and hardware, which hides the problem for a while and makes it harder to diagnose later.",
        "المنصة المصممة لمئة مستخدم تتصرف بشكل مختلف مع عشرة آلاف. الاستعلامات التي كانت مقبولة تصبح عنق الزجاجة، وقاعدة البيانات المشتركة تصبح نقطة فشل واحدة، وإضافة الخوادم تتوقف عن الإفادة. وكثيراً ما ترد الفرق بإضافة ذاكرات تخزين مؤقت وعتاد، فيختفي المشكل لفترة ويصعب تشخيصه لاحقاً.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Page loads that get slower every quarter, reports that time out, batch jobs that no longer finish overnight, outages during peak periods, and cloud costs rising faster than usage. It is common in successful products that grew faster than planned.",
        "في صفحات تزداد بطئاً كل ربع سنة، وتقارير تنتهي مهلتها قبل اكتمالها، ومهام دفعية لم تعد تنتهي خلال الليل، وانقطاعات في أوقات الذروة، وتكاليف سحابية ترتفع أسرع من الاستخدام. وهو شائع في المنتجات الناجحة التي نمت أسرع مما كان مخططاً.",
      ),
    },
    approach: {
      body: bi(
        "We measure before we change anything. Profiling, load testing and a review of the architecture and data model show where time and resources actually go. Then we recommend changes in order of impact: query and index work, caching with clear invalidation, separating workloads, asynchronous processing, or structural changes where they are genuinely needed. We avoid rewrites unless the evidence demands one.",
        "نقيس قبل أن نغيّر أي شيء. يُظهر التحليل واختبار الحمل ومراجعة البنية ونموذج البيانات أين يذهب الوقت والموارد فعلاً. ثم نوصي بالتغييرات بترتيب الأثر: تحسين الاستعلامات والفهارس، وتخزين مؤقت بقواعد إبطال واضحة، وفصل أحمال العمل، والمعالجة غير المتزامنة، أو تغييرات هيكلية حين تكون ضرورية حقاً. ونتجنب إعادة الكتابة الكاملة ما لم تفرضها الأدلة.",
      ),
    },
    engagement: {
      body: bi(
        "A diagnostic phase of two to three weeks produces a findings report with measured evidence and a ranked plan. Implementation can be done by your team with our guidance or by us, in increments that each show a measurable improvement. We set up the performance monitoring that lets you see regressions before users do.",
        "تنتج مرحلة تشخيص من أسبوعين إلى ثلاثة تقريراً بالنتائج مدعوماً بقياسات وخطة مرتبة. ويمكن أن ينفذ فريقك التغييرات بإرشادنا أو أن ننفذها نحن، على دفعات يُظهر كل منها تحسناً قابلاً للقياس. ونُعدّ مراقبة الأداء التي تتيح لك رؤية التراجع قبل أن يراه المستخدمون.",
      ),
    },
    deliverables: {
      body: bi("Evidence, a plan and a faster system.", "أدلة، وخطة، ونظام أسرع."),
      items: [
        bi("Performance diagnostic report with measurements and root causes", "تقرير تشخيص للأداء بقياسات وأسباب جذرية"),
        bi("Architecture recommendations ranked by impact and effort", "توصيات للبنية مرتبة حسب الأثر والجهد"),
        bi("Implemented improvements with before and after measurements, plus monitoring", "تحسينات منفذة مع قياسات قبل وبعد، ومراقبة مستمرة"),
      ],
    },
    businessMeaning: {
      body: bi(
        "A platform that handles growth without emergencies, infrastructure spend that tracks value, and an engineering team that understands its own system again.",
        "منصة تستوعب النمو من دون طوارئ، وإنفاق على البنية التحتية يعكس القيمة، وفريق هندسي يفهم نظامه من جديد.",
      ),
    },
    related: ["technical-architecture-consulting", "observability", "cloud-architecture"],
  },
  {
    slug: "custom-business-software",
    practice: "digital-engineering",
    pictogram: "software",
    title: bi("Custom Business Software", "برمجيات الأعمال المخصصة"),
    summary: bi("Purpose built software for a specific business need, when nothing on the market fits well enough.", "برمجيات مبنية لغرض محدد لاحتياج عمل بعينه، حين لا يناسبك شيء مما في السوق."),
    hero: bi("Sometimes the right tool does not exist yet. We build it, and we build it to last.", "أحياناً لا توجد الأداة المناسبة بعد. نبنيها، ونبنيها لتدوم."),
    seo: {
      title: bi("Custom Business Software", "برمجيات الأعمال المخصصة"),
      description: bi("Custom software development by CyBarq for specific business needs: web and mobile applications, dashboards and tools, secure by design and delivered with source and documentation.", "تطوير برمجيات مخصصة من سايبرق لاحتياجات عمل محددة: تطبيقات ويب وهاتف، ولوحات وأدوات، آمنة بالتصميم ومسلّمة مع الشيفرة والوثائق."),
    },
    problem: {
      body: bi(
        "Every organisation has a few processes that are genuinely its own. Forcing them into generic software means workarounds, exports and a growing list of things the tool cannot do. Building custom software has its own risks: unclear scope, quality that depends on who was available, and code that only the original developer can maintain.",
        "في كل مؤسسة بضعة إجراءات تخصها وحدها. وإجبارها على العمل داخل برمجيات عامة يعني حلولاً التفافية وتصديراً للبيانات وقائمة متزايدة بما لا تستطيع الأداة فعله. ولبناء برمجيات مخصصة مخاطره أيضاً: نطاق غير واضح، وجودة تعتمد على من كان متاحاً، وشيفرة لا يستطيع صيانتها إلا من كتبها.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Field operations apps, specialised calculators and configurators, dashboards over data from several sources, tools for a regulated process, client facing utilities, and the internal tool everyone uses that started as one person's script.",
        "في تطبيقات العمليات الميدانية، والحاسبات والمكوّنات المتخصصة، ولوحات المتابعة فوق بيانات من عدة مصادر، وأدوات الإجراءات الخاضعة للتنظيم، والأدوات الموجهة للعملاء، والأداة الداخلية التي يستخدمها الجميع وبدأت كسكربت كتبه شخص واحد.",
      ),
    },
    approach: {
      body: bi(
        "We treat scope as the first deliverable: what the software must do, what it must not do, and how we will know it is done. We use proven, well supported technology so that any competent team can maintain the result. Security, testing and documentation are part of the definition of done. Mobile, web or both, the design starts from the people who will use it.",
        "نعتبر النطاق أول المخرجات: ما الذي يجب أن تفعله البرمجية، وما الذي يجب ألا تفعله، وكيف سنعرف أنها اكتملت. نستخدم تقنيات مثبتة ومدعومة جيداً ليستطيع أي فريق كفء صيانة النتيجة. الأمان والاختبار والتوثيق جزء من تعريف الاكتمال. وسواء كان التطبيق للهاتف أو للويب أو لكليهما، يبدأ التصميم من الأشخاص الذين سيستخدمونه.",
      ),
    },
    engagement: {
      body: bi(
        "A short discovery produces a written scope, a design and a fixed price or a clear estimate, depending on how well defined the need is. Delivery runs in cycles with a working version you can try after each. You receive the source, the documentation and the deployment setup, and you can choose ongoing support or take it in house.",
        "ينتج استكشاف قصير نطاقاً مكتوباً وتصميماً وسعراً ثابتاً أو تقديراً واضحاً، بحسب مدى وضوح الاحتياج. ويسير التنفيذ في دورات تنتهي كل منها بنسخة عاملة يمكنك تجربتها. تتسلم الشيفرة والوثائق وإعدادات النشر، ويمكنك اختيار الدعم المستمر أو تولي الأمر داخلياً.",
      ),
    },
    deliverables: {
      body: bi("Software that does the job, and everything needed to keep it doing the job.", "برمجية تؤدي المهمة، وكل ما يلزم لتبقى تؤديها."),
      items: [
        bi("Scope document, design and acceptance criteria", "وثيقة نطاق وتصميم ومعايير قبول"),
        bi("Tested application with source code and deployment configuration", "تطبيق مختبر مع الشيفرة المصدرية وإعدادات النشر"),
        bi("User and administrator documentation, and a support option", "وثائق للمستخدمين والمسؤولين، وخيار للدعم"),
      ],
    },
    businessMeaning: {
      body: bi(
        "A tool that fits the way you work instead of the other way round, with a cost and timeline you agreed to in advance, and no dependence on a single developer afterwards.",
        "أداة تناسب طريقة عملك بدلاً من العكس، بتكلفة وجدول زمني اتفقت عليهما مسبقاً، ومن دون اعتماد على مطوّر واحد بعد ذلك.",
      ),
    },
    related: ["internal-business-systems", "apis-integrations", "ai-internal-tools"],
  },
];
