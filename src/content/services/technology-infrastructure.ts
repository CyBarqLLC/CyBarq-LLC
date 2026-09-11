import { bi, type ServiceContent } from "./registry";

/**
 * Technology & Infrastructure practice. The systems underneath the systems:
 * cloud, deployment, reliability, observability, identity, backup and the
 * architecture decisions that hold them together.
 */
export const technologyInfrastructureServices: ServiceContent[] = [
  {
    slug: "cloud-architecture",
    practice: "technology-infrastructure",
    pictogram: "cloud",
    featured: true,
    title: bi("Cloud Architecture", "البنية السحابية"),
    summary: bi("Cloud environments designed for security, cost and operability from the account structure up.", "بيئات سحابية مصممة للأمان والتكلفة وسهولة التشغيل بدءاً من بنية الحسابات."),
    hero: bi("A cloud environment is a set of decisions. We help you make them deliberately, before they are made for you.", "البيئة السحابية مجموعة من القرارات. نساعدك على اتخاذها عن قصد، قبل أن تُتخذ نيابة عنك."),
    seo: {
      title: bi("Cloud Architecture", "البنية السحابية"),
      description: bi("Cloud architecture design and review by CyBarq on AWS, Azure and Google Cloud: account and network structure, identity, security baselines, landing zones, cost control and migration planning.", "تصميم ومراجعة البنية السحابية من سايبرق على AWS وAzure وGoogle Cloud: بنية الحسابات والشبكة، والهوية، وخطوط الأساس الأمنية، ومناطق الهبوط، والتحكم في التكلفة، وتخطيط الترحيل."),
    },
    problem: {
      body: bi(
        "Most cloud environments were not designed. They started with one account for one project and grew by accretion: more projects in the same account, permissions granted to unblock someone, networks that overlap, and a bill nobody can attribute. The result is hard to secure, hard to audit and expensive to change later.",
        "معظم البيئات السحابية لم تُصمم. بدأت بحساب واحد لمشروع واحد ونمت بالتراكم: مشاريع أكثر في الحساب نفسه، وصلاحيات مُنحت لتجاوز عائق أمام أحدهم، وشبكات متداخلة، وفاتورة لا يستطيع أحد نسبتها إلى جهة. والنتيجة صعبة التأمين والتدقيق ومكلفة التغيير لاحقاً.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Organisations preparing a first move to the cloud, environments that grew without a plan, multi cloud estates that arrived through acquisitions or vendor choices, workloads with data residency requirements, and cloud bills that rise faster than the business.",
        "في المؤسسات التي تستعد لأول انتقال إلى السحابة، والبيئات التي نمت من دون خطة، والبيئات متعددة السحابات التي جاءت عبر استحواذات أو خيارات مورّدين، وأحمال العمل ذات متطلبات إقامة البيانات، والفواتير السحابية التي ترتفع أسرع من نمو العمل.",
      ),
    },
    approach: {
      body: bi(
        "We design the foundation first: account or subscription structure, identity and access, network layout, logging and security baselines, and the guardrails that stop drift. Everything is expressed as infrastructure code so environments can be reproduced and reviewed. Cost is modelled per workload and tagged from the start. Where a migration is involved we plan it in waves with the business, not in one weekend.",
        "نصمم الأساس أولاً: بنية الحسابات أو الاشتراكات، والهوية والوصول، وتخطيط الشبكة، والسجلات وخطوط الأساس الأمنية، والضوابط التي تمنع الانجراف. ويُعبَّر عن كل شيء كبنية تحتية كشيفرة ليمكن إعادة إنشاء البيئات ومراجعتها. وتُنمذج التكلفة لكل حمل عمل وتُوسم من البداية. وحين يكون هناك ترحيل، نخطط له على موجات مع الأعمال، لا في عطلة نهاية أسبوع واحدة.",
      ),
    },
    engagement: {
      body: bi(
        "A review or design phase takes two to four weeks and produces an architecture document, a security baseline and a cost model. Implementation of the foundation follows as infrastructure code, with your team involved so that they own it. Migrations are scheduled per workload with rollback plans. We can continue as an advisory presence for architecture decisions afterwards.",
        "تستغرق مرحلة المراجعة أو التصميم من أسبوعين إلى أربعة وتنتج وثيقة بنية وخط أساس أمني ونموذج تكلفة. ويلي ذلك تنفيذ الأساس كبنية تحتية كشيفرة، بمشاركة فريقك ليمتلكه. وتُجدول عمليات الترحيل لكل حمل عمل مع خطط تراجع. ويمكننا الاستمرار كحضور استشاري لقرارات البنية بعد ذلك.",
      ),
    },
    deliverables: {
      body: bi("A cloud foundation that is documented, reproducible and secure by default.", "أساس سحابي موثق وقابل لإعادة الإنشاء وآمن افتراضياً."),
      items: [
        bi("Architecture document with account, network, identity and logging design", "وثيقة بنية بتصميم الحسابات والشبكة والهوية والسجلات"),
        bi("Infrastructure code for the foundation and security guardrails", "شيفرة بنية تحتية للأساس والضوابط الأمنية"),
        bi("Cost model with tagging and budgets, and a migration plan where relevant", "نموذج تكلفة بوسوم وميزانيات، وخطة ترحيل عند الحاجة"),
      ],
    },
    businessMeaning: {
      body: bi(
        "A cloud estate you can explain to an auditor, a bill you can attribute to products and teams, and a foundation that new projects land on safely instead of starting from scratch.",
        "بيئة سحابية تستطيع شرحها لمدقق، وفاتورة تستطيع نسبتها إلى المنتجات والفرق، وأساس تهبط عليه المشاريع الجديدة بأمان بدلاً من البدء من الصفر.",
      ),
    },
    related: ["application-deployment-infrastructure", "identity-access-architecture", "cloud-applications"],
  },
  {
    slug: "application-deployment-infrastructure",
    practice: "technology-infrastructure",
    pictogram: "deployment",
    title: bi("Application & Deployment Infrastructure", "بنية التطبيقات والنشر"),
    summary: bi("The environments, pipelines and runtime platforms that take code from a repository to production safely.", "البيئات وخطوط النشر ومنصات التشغيل التي تنقل الشيفرة من المستودع إلى الإنتاج بأمان."),
    hero: bi("Deploying should be routine. When it is an event, the infrastructure is telling you something.", "النشر يجب أن يكون أمراً روتينياً. وحين يصبح حدثاً، فالبنية التحتية تخبرك بشيء."),
    seo: {
      title: bi("Application and Deployment Infrastructure", "بنية التطبيقات والنشر"),
      description: bi("Deployment pipelines, container platforms, environments and release infrastructure by CyBarq: CI/CD, Kubernetes or simpler runtimes where they fit, secrets management and safe rollouts.", "خطوط نشر ومنصات حاويات وبيئات وبنية إصدارات من سايبرق: CI/CD، وKubernetes أو بيئات تشغيل أبسط حيث تناسب، وإدارة الأسرار، وإطلاقات آمنة."),
    },
    problem: {
      body: bi(
        "In many organisations a deployment still means one person, one evening and a checklist in their head. Environments differ from each other in ways nobody has written down, secrets live in files, and rolling back means restoring a backup. Releases get batched to reduce the pain, which makes each one larger and riskier.",
        "في كثير من المؤسسات ما يزال النشر يعني شخصاً واحداً ومساءً واحداً وقائمة تحقق في رأسه. تختلف البيئات عن بعضها بطرق لم يدوّنها أحد، وتعيش الأسرار في ملفات، والتراجع يعني استعادة نسخة احتياطية. وتُجمَّع الإصدارات لتقليل الألم، فيصبح كل إصدار أكبر وأخطر.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Teams shipping less often than they would like, production incidents traced to a configuration difference, applications that only one person knows how to deploy, container platforms adopted without the operations to support them, and audit questions about who changed what in production.",
        "في الفرق التي تُصدر أقل مما تريد، والحوادث الإنتاجية التي تُعزى إلى اختلاف في الإعدادات، والتطبيقات التي لا يعرف نشرها إلا شخص واحد، ومنصات الحاويات التي اعتُمدت من دون عمليات تدعمها، وأسئلة التدقيق عمّن غيّر ماذا في الإنتاج.",
      ),
    },
    approach: {
      body: bi(
        "We build the path from commit to production as code: pipelines that test, scan and build artefacts; environments that are created from the same definitions; secrets held in a proper store and injected at runtime; and deployments that roll out gradually and can be reversed in minutes. We choose the runtime to fit the team: a managed platform where that is enough, Kubernetes where the scale and the operations capacity justify it.",
        "نبني المسار من الالتزام البرمجي إلى الإنتاج كشيفرة: خطوط تختبر وتفحص وتبني المخرجات؛ وبيئات تُنشأ من التعريفات نفسها؛ وأسرار محفوظة في مخزن مناسب وتُحقن وقت التشغيل؛ وعمليات نشر تُطرح تدريجياً ويمكن عكسها في دقائق. ونختار بيئة التشغيل بما يناسب الفريق: منصة مُدارة حين تكفي، وKubernetes حين يبرر الحجم وقدرة التشغيل ذلك.",
      ),
    },
    engagement: {
      body: bi(
        "We start with one application and take it end to end: pipeline, environments, secrets, rollout and rollback. That becomes the template for the rest. Your engineers work alongside us so that the result is theirs. Within a few weeks releases are routine for the first application, and the pattern is applied to the others in order of value.",
        "نبدأ بتطبيق واحد ونأخذه من البداية إلى النهاية: خط النشر، والبيئات، والأسرار، والطرح، والتراجع. ويصبح ذلك القالب للبقية. يعمل مهندسوك إلى جانبنا لتكون النتيجة ملكهم. وخلال بضعة أسابيع تصبح الإصدارات روتينية للتطبيق الأول، ويُطبَّق النمط على البقية بترتيب القيمة.",
      ),
    },
    deliverables: {
      body: bi("A release process that does not depend on who is on shift.", "عملية إصدار لا تعتمد على من هو في المناوبة."),
      items: [
        bi("CI/CD pipelines with testing, scanning and artefact management", "خطوط CI/CD مع اختبار وفحص وإدارة للمخرجات"),
        bi("Environment definitions as code, secrets management and runtime platform", "تعريفات بيئات كشيفرة وإدارة أسرار ومنصة تشغيل"),
        bi("Gradual rollout and rollback procedures, documented and rehearsed", "إجراءات طرح تدريجي وتراجع، موثقة ومتدرَّب عليها"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Smaller, more frequent releases with less risk in each, fewer incidents caused by environment differences, and a clear record of every change that reached production.",
        "إصدارات أصغر وأكثر تكراراً بمخاطر أقل في كل منها، وحوادث أقل بسبب اختلاف البيئات، وسجل واضح لكل تغيير وصل إلى الإنتاج.",
      ),
    },
    related: ["platform-reliability-devops", "cloud-architecture", "observability"],
  },
  {
    slug: "platform-reliability-devops",
    practice: "technology-infrastructure",
    pictogram: "performance",
    title: bi("Platform Reliability & DevOps", "موثوقية المنصات وDevOps"),
    summary: bi("Keeping platforms available, measured against targets you have agreed, with the practices to sustain it.", "إبقاء المنصات متاحة، مقيسة وفق أهداف اتفقت عليها، مع الممارسات اللازمة للاستمرار."),
    hero: bi("Reliability is a decision about how much downtime you can accept, and then the engineering to stay within it.", "الموثوقية قرار بشأن مقدار التوقف الذي يمكنك قبوله، ثم الهندسة اللازمة للبقاء ضمنه."),
    seo: {
      title: bi("Platform Reliability and DevOps", "موثوقية المنصات وDevOps"),
      description: bi("Reliability engineering and DevOps practices by CyBarq: service level objectives, incident process, capacity planning, on call readiness, automation and managed operations for platforms that must stay up.", "هندسة الموثوقية وممارسات DevOps من سايبرق: أهداف مستوى الخدمة، وإجراءات الحوادث، وتخطيط السعة، وجاهزية المناوبة، والأتمتة، والعمليات المُدارة للمنصات التي يجب أن تبقى متاحة."),
    },
    problem: {
      body: bi(
        "Outages are expensive, but so is over engineering for an availability nobody asked for. Without agreed targets, teams either firefight constantly or gold plate everything. Operational knowledge lives with a few people, incidents are handled from memory, and the same failure happens twice because the first time was never written down.",
        "الانقطاعات مكلفة، لكن الإفراط في الهندسة من أجل إتاحة لم يطلبها أحد مكلف أيضاً. ومن دون أهداف متفق عليها، إما أن تطفئ الفرق الحرائق باستمرار أو تبالغ في كل شيء. وتعيش المعرفة التشغيلية مع قلة من الأشخاص، وتُعالج الحوادث من الذاكرة، ويتكرر الفشل نفسه مرتين لأن المرة الأولى لم تُدوَّن.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Platforms that customers or staff depend on during working hours, systems with peak periods such as payroll runs or campaigns, services with contractual availability commitments, and teams where the developers are also the operators and are stretched across both.",
        "في المنصات التي يعتمد عليها العملاء أو الموظفون خلال ساعات العمل، والأنظمة ذات فترات الذروة مثل دورات الرواتب أو الحملات، والخدمات ذات التزامات الإتاحة التعاقدية، والفرق التي يكون فيها المطورون هم المشغّلون أيضاً ومشتّتون بين الدورين.",
      ),
    },
    approach: {
      body: bi(
        "We agree on service level objectives that reflect the business, then engineer to meet them: redundancy where it pays off, capacity planning from measured load, health checks and alerting tied to user impact, and runbooks for the failures that will happen. Incidents get a lightweight process with blameless reviews so each one improves the system. Repetitive operational work is automated.",
        "نتفق على أهداف مستوى خدمة تعكس الأعمال، ثم نهندس لتحقيقها: تكرار حيث يستحق، وتخطيط للسعة من الحمل المقيس، وفحوصات سلامة وتنبيهات مرتبطة بأثر المستخدم، وأدلة تشغيل للأعطال التي ستقع. وتحصل الحوادث على إجراء خفيف مع مراجعات لا تبحث عن مذنب، فيحسّن كل حادث النظام. ويُؤتمت العمل التشغيلي المتكرر.",
      ),
    },
    engagement: {
      body: bi(
        "A reliability review of one to two weeks establishes current availability, the risks and the gaps against the target. We then implement the improvements in priority order alongside your team. Some clients keep us on for managed operations, with defined response times and monthly reporting against the objectives; others take the practices in house after a handover period.",
        "تحدد مراجعة موثوقية من أسبوع إلى أسبوعين الإتاحة الحالية والمخاطر والفجوات مقابل الهدف. ثم ننفذ التحسينات بترتيب الأولوية مع فريقك. يُبقينا بعض العملاء لعمليات مُدارة بأزمنة استجابة محددة وتقارير شهرية مقابل الأهداف؛ ويتولى آخرون الممارسات داخلياً بعد فترة تسليم.",
      ),
    },
    deliverables: {
      body: bi("Targets, the engineering to meet them, and the evidence that you do.", "أهداف، والهندسة اللازمة لتحقيقها، والدليل على أنك تحققها."),
      items: [
        bi("Service level objectives and a reliability review with prioritised actions", "أهداف مستوى الخدمة ومراجعة موثوقية بإجراءات مرتبة"),
        bi("Alerting, runbooks, incident process and capacity plan", "تنبيهات وأدلة تشغيل وإجراء للحوادث وخطة سعة"),
        bi("Automation of routine operations and monthly availability reporting", "أتمتة للعمليات الروتينية وتقارير شهرية للإتاحة"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Availability that matches what the business actually needs, incidents that are shorter and rarer, and an operations capability that does not rest on one person's phone.",
        "إتاحة تطابق ما تحتاجه الأعمال فعلاً، وحوادث أقصر وأندر، وقدرة تشغيلية لا تعتمد على هاتف شخص واحد.",
      ),
    },
    related: ["observability", "application-deployment-infrastructure", "backup-resilience"],
  },
  {
    slug: "observability",
    practice: "technology-infrastructure",
    pictogram: "monitoring",
    title: bi("Observability", "المراقبة والرصد"),
    summary: bi("Logs, metrics and traces designed so that you can answer questions about your systems, including security questions.", "سجلات ومقاييس وتتبعات مصممة لتتمكن من الإجابة عن أسئلة حول أنظمتك، بما فيها الأسئلة الأمنية."),
    hero: bi("You cannot secure, fix or improve what you cannot see. Observability is the ability to see.", "لا يمكنك تأمين ما لا تراه ولا إصلاحه ولا تحسينه. المراقبة هي القدرة على الرؤية."),
    seo: {
      title: bi("Observability", "المراقبة والرصد"),
      description: bi("Observability engineering by CyBarq: centralised logging, metrics, tracing, dashboards and alerting designed for both operations and security investigation, with retention that fits your obligations.", "هندسة المراقبة من سايبرق: سجلات مركزية ومقاييس وتتبع ولوحات وتنبيهات مصممة للعمليات والتحقيق الأمني معاً، مع احتفاظ يناسب التزاماتك."),
    },
    problem: {
      body: bi(
        "When something goes wrong, the first hour is usually spent finding out where to look. Logs are on twenty servers in twenty formats, metrics exist for the infrastructure but not for the application, and there is no way to follow one request across services. During a security incident this gap becomes critical: the evidence needed was never collected, or was overwritten last week.",
        "حين يحدث خلل، تُقضى الساعة الأولى عادةً في معرفة أين تنظر. السجلات على عشرين خادماً بعشرين صيغة، والمقاييس موجودة للبنية التحتية لا للتطبيق، ولا سبيل لتتبع طلب واحد عبر الخدمات. وخلال حادث أمني تصبح هذه الفجوة حرجة: الأدلة المطلوبة لم تُجمع أصلاً، أو كُتب فوقها الأسبوع الماضي.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Distributed applications and microservices, cloud environments with many managed services, systems subject to audit or regulatory logging requirements, teams that learn about outages from customers, and incident investigations that end with the phrase we cannot tell.",
        "في التطبيقات الموزعة والخدمات المصغرة، والبيئات السحابية بخدمات مُدارة كثيرة، والأنظمة الخاضعة لمتطلبات تدقيق أو تسجيل تنظيمية، والفرق التي تعرف بالانقطاعات من العملاء، وتحقيقات الحوادث التي تنتهي بعبارة لا نستطيع الجزم.",
      ),
    },
    approach: {
      body: bi(
        "We design what to collect before choosing tools: the logs, metrics and traces that answer real operational and security questions, with consistent structure and correlation across services. Dashboards are built around user facing services, not around servers. Alerts are tied to symptoms people care about and tuned until they are trusted. Retention and access follow your legal and security obligations, and the security team gets the same data the operations team does.",
        "نصمم ما يجب جمعه قبل اختيار الأدوات: السجلات والمقاييس والتتبعات التي تجيب عن أسئلة تشغيلية وأمنية حقيقية، ببنية متسقة وربط عبر الخدمات. وتُبنى اللوحات حول الخدمات الموجهة للمستخدم لا حول الخوادم. وتُربط التنبيهات بأعراض يهتم بها الناس وتُضبط حتى تصبح موثوقة. ويتبع الاحتفاظ والوصول التزاماتك القانونية والأمنية، ويحصل الفريق الأمني على البيانات نفسها التي يحصل عليها فريق العمليات.",
      ),
    },
    engagement: {
      body: bi(
        "We assess current coverage against the questions you need to answer, then implement in stages: centralised logging first, then metrics and service dashboards, then tracing where the architecture warrants it. Tooling is chosen to fit your environment and budget, open source or managed. We hand over with alert runbooks and a review of the first month's signal to noise.",
        "نقيّم التغطية الحالية مقابل الأسئلة التي تحتاج إلى إجابتها، ثم ننفذ على مراحل: السجلات المركزية أولاً، ثم المقاييس ولوحات الخدمات، ثم التتبع حيث تستدعي البنية ذلك. وتُختار الأدوات بما يناسب بيئتك وميزانيتك، مفتوحة المصدر أو مُدارة. ونسلّم مع أدلة تشغيل للتنبيهات ومراجعة لنسبة الإشارة إلى الضجيج في الشهر الأول.",
      ),
    },
    deliverables: {
      body: bi("One place to look, and the confidence that the answer is there.", "مكان واحد تنظر إليه، وثقة بأن الإجابة موجودة فيه."),
      items: [
        bi("Centralised, structured logging with retention aligned to your obligations", "سجلات مركزية منظمة باحتفاظ يتوافق مع التزاماتك"),
        bi("Service level dashboards, tracing where relevant, and tuned alerting", "لوحات على مستوى الخدمة وتتبع عند الحاجة وتنبيهات مضبوطة"),
        bi("Alert runbooks and access for both operations and security investigation", "أدلة تشغيل للتنبيهات ووصول لكل من العمليات والتحقيق الأمني"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Faster diagnosis when something breaks, earlier warning before it does, and the evidence to answer a security or audit question with facts instead of estimates.",
        "تشخيص أسرع حين يتعطل شيء، وإنذار أبكر قبل أن يتعطل، والأدلة اللازمة للإجابة عن سؤال أمني أو تدقيقي بحقائق لا بتقديرات.",
      ),
    },
    related: ["platform-reliability-devops", "compromise-assessment", "performance-platform-architecture"],
  },
  {
    slug: "identity-access-architecture",
    practice: "technology-infrastructure",
    pictogram: "identity",
    title: bi("Identity & Access Architecture", "بنية الهوية والوصول"),
    summary: bi("Who can access what, designed and enforced consistently across applications, cloud and infrastructure.", "من يستطيع الوصول إلى ماذا، مصمم ومفروض باتساق عبر التطبيقات والسحابة والبنية التحتية."),
    hero: bi("Identity is the new perimeter. Most breaches walk in through a door that was left open on purpose and forgotten.", "الهوية هي المحيط الجديد. معظم الاختراقات تدخل من باب فُتح عمداً ثم نُسي."),
    seo: {
      title: bi("Identity and Access Architecture", "بنية الهوية والوصول"),
      description: bi("Identity and access management architecture by CyBarq: single sign on, multi factor authentication, role and permission design, privileged access, joiner and leaver processes and cloud identity governance.", "بنية إدارة الهوية والوصول من سايبرق: تسجيل دخول موحد، ومصادقة متعددة العوامل، وتصميم أدوار وصلاحيات، ووصول مميز، وإجراءات الالتحاق والمغادرة، وحوكمة الهوية السحابية."),
    },
    problem: {
      body: bi(
        "Access accumulates. People change roles and keep old permissions, shared accounts are created for convenience, contractors leave with credentials still valid, and cloud roles are granted broadly to make something work. Each is small; together they are how attackers move once they are in. Nobody can produce a current list of who can access what.",
        "الوصول يتراكم. يغيّر الناس أدوارهم ويحتفظون بالصلاحيات القديمة، وتُنشأ حسابات مشتركة للراحة، ويغادر المتعاقدون وبيانات دخولهم ما تزال صالحة، وتُمنح الأدوار السحابية بشكل واسع لتشغيل شيء ما. كل منها صغير؛ ومعاً هي الطريقة التي يتحرك بها المهاجمون بعد الدخول. ولا أحد يستطيع إنتاج قائمة حالية بمن يستطيع الوصول إلى ماذا.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Organisations with many applications and separate logins, cloud accounts with hand granted permissions, admin access shared by a team, systems accessed by partners and contractors, and audit findings about leaver access and privileged accounts.",
        "في المؤسسات ذات التطبيقات الكثيرة وتسجيلات الدخول المنفصلة، والحسابات السحابية بصلاحيات مُنحت يدوياً، ووصول المسؤولين المشترك بين فريق، والأنظمة التي يصل إليها الشركاء والمتعاقدون، وملاحظات التدقيق حول وصول المغادرين والحسابات المميزة.",
      ),
    },
    approach: {
      body: bi(
        "We design identity as one system: a central identity provider, single sign on for applications, multi factor authentication everywhere it matters, and roles defined by job rather than by request history. Privileged access is separated, time limited and logged. Joiner, mover and leaver processes are automated so access follows the person's role. Cloud identity gets the same treatment, with least privilege enforced by policy rather than by memory.",
        "نصمم الهوية كنظام واحد: مزوّد هوية مركزي، وتسجيل دخول موحد للتطبيقات، ومصادقة متعددة العوامل في كل مكان يهم، وأدوار محددة حسب الوظيفة لا حسب تاريخ الطلبات. ويُفصل الوصول المميز ويُقيَّد زمنياً ويُسجَّل. وتُؤتمت إجراءات الالتحاق والانتقال والمغادرة بحيث يتبع الوصول دور الشخص. وتحصل الهوية السحابية على المعاملة نفسها، مع فرض الحد الأدنى من الصلاحيات بالسياسة لا بالذاكرة.",
      ),
    },
    engagement: {
      body: bi(
        "We inventory identities, applications and permissions, then design the target model with your HR and IT owners. Implementation is phased: identity provider and MFA first, then applications onto single sign on in order of risk, then privileged access and cloud policies. Each phase ends with an access review so that the clean state is verified, not assumed.",
        "نجرد الهويات والتطبيقات والصلاحيات، ثم نصمم النموذج المستهدف مع مسؤولي الموارد البشرية وتقنية المعلومات لديك. ويُنفَّذ على مراحل: مزوّد الهوية والمصادقة متعددة العوامل أولاً، ثم نقل التطبيقات إلى تسجيل الدخول الموحد بترتيب المخاطر، ثم الوصول المميز والسياسات السحابية. وتنتهي كل مرحلة بمراجعة للوصول ليكون الوضع النظيف مُتحققاً منه لا مفترضاً.",
      ),
    },
    deliverables: {
      body: bi("A single, current answer to who can access what, and the controls that keep it that way.", "إجابة واحدة حالية عمّن يستطيع الوصول إلى ماذا، والضوابط التي تبقيها كذلك."),
      items: [
        bi("Identity architecture, role model and access policies", "بنية هوية ونموذج أدوار وسياسات وصول"),
        bi("Single sign on, MFA and privileged access implemented across applications and cloud", "تسجيل دخول موحد ومصادقة متعددة العوامل ووصول مميز منفذة عبر التطبيقات والسحابة"),
        bi("Automated joiner, mover and leaver processes and periodic access reviews", "إجراءات مؤتمتة للالتحاق والانتقال والمغادرة ومراجعات دورية للوصول"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Fewer ways for an attacker to move, less friction for staff who sign in once, clean answers for auditors, and no more discovering that a former contractor still has the keys.",
        "طرق أقل يتحرك بها المهاجم، واحتكاك أقل للموظفين الذين يسجلون الدخول مرة واحدة، وإجابات نظيفة للمدققين، ولا مزيد من اكتشاف أن متعاقداً سابقاً ما يزال يملك المفاتيح.",
      ),
    },
    related: ["security-consulting-architecture", "cloud-architecture", "enterprise-ai-assistants"],
  },
  {
    slug: "backup-resilience",
    practice: "technology-infrastructure",
    pictogram: "dataCentre",
    title: bi("Backup & Resilience", "النسخ الاحتياطي والمرونة"),
    summary: bi("Backups that are tested, recovery that is rehearsed, and a plan for the day something is lost.", "نسخ احتياطية مختبرة، واستعادة متدرَّب عليها، وخطة لليوم الذي يُفقد فيه شيء ما."),
    hero: bi("A backup is a hope. A tested restore is a plan. We make sure you have the second one.", "النسخة الاحتياطية أمل. والاستعادة المختبرة خطة. نتأكد من أن لديك الثانية."),
    seo: {
      title: bi("Backup and Resilience", "النسخ الاحتياطي والمرونة"),
      description: bi("Backup and disaster recovery engineering by CyBarq: recovery objectives, immutable and offsite backups, ransomware resilient design, restore testing and documented recovery procedures.", "هندسة النسخ الاحتياطي والتعافي من الكوارث من سايبرق: أهداف الاستعادة، ونسخ احتياطية غير قابلة للتعديل وخارج الموقع، وتصميم مقاوم لبرامج الفدية، واختبار الاستعادة، وإجراءات تعافٍ موثقة."),
    },
    problem: {
      body: bi(
        "Almost everyone has backups. Far fewer have restored from them recently, know how long a full recovery would take, or have checked that the backups are out of reach of the ransomware that would make them necessary. The gap is usually discovered on the worst possible day.",
        "الجميع تقريباً لديه نسخ احتياطية. لكن القليلين استعادوا منها مؤخراً، أو يعرفون كم ستستغرق الاستعادة الكاملة، أو تحققوا من أن النسخ بعيدة عن متناول برامج الفدية التي ستجعلها ضرورية. وتُكتشف هذه الفجوة عادةً في أسوأ يوم ممكن.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Databases and file stores that have never been restored end to end, backups reachable with the same credentials as production, cloud services assumed to be backed up by the provider, single region deployments, and recovery plans that exist as a document nobody has read since it was written.",
        "في قواعد البيانات ومخازن الملفات التي لم تُستعد يوماً بالكامل، والنسخ الاحتياطية التي يمكن الوصول إليها ببيانات الدخول نفسها للإنتاج، والخدمات السحابية المفترض أن المزوّد يحفظ نسخاً منها، والنشر في منطقة واحدة، وخطط التعافي الموجودة كوثيقة لم يقرأها أحد منذ كتابتها.",
      ),
    },
    approach: {
      body: bi(
        "We start with what the business can tolerate: how much data can be lost and how long systems can be down, per system. Then we design backups to meet those numbers: immutable copies, offsite or cross region, separated credentials, and coverage of the cloud services people forget. Restores are tested on a schedule, timed, and documented. For critical systems we design failover that has actually been exercised.",
        "نبدأ بما تستطيع الأعمال تحمّله: كم من البيانات يمكن فقدانها، وكم من الوقت يمكن أن تتوقف الأنظمة، لكل نظام على حدة. ثم نصمم النسخ الاحتياطية لتحقيق هذه الأرقام: نسخ غير قابلة للتعديل، خارج الموقع أو عبر مناطق، ببيانات دخول منفصلة، مع تغطية للخدمات السحابية التي ينساها الناس. وتُختبر الاستعادة وفق جدول، وتُقاس زمنياً، وتُوثَّق. وللأنظمة الحرجة نصمم تحويلاً احتياطياً جرى تمرينه فعلاً.",
      ),
    },
    engagement: {
      body: bi(
        "A resilience review of one to two weeks maps systems to recovery objectives and finds the gaps. Implementation follows in priority order. The first full restore test is done together, timed and written up. We leave you with a testing calendar, a recovery runbook per critical system, and, if you want it, a periodic test we run with you.",
        "تربط مراجعة مرونة من أسبوع إلى أسبوعين الأنظمة بأهداف الاستعادة وتكشف الفجوات. ويلي ذلك التنفيذ بترتيب الأولوية. ويُجرى أول اختبار استعادة كامل معاً، مع قياس الزمن وتوثيق النتيجة. ونترك لديك تقويماً للاختبارات، ودليل تعافٍ لكل نظام حرج، وإن شئت اختباراً دورياً ننفذه معك.",
      ),
    },
    deliverables: {
      body: bi("Recovery you have seen work, with the numbers to prove it.", "استعادة رأيتها تعمل، مع أرقام تثبت ذلك."),
      items: [
        bi("Recovery objectives per system and a resilience gap assessment", "أهداف استعادة لكل نظام وتقييم لفجوات المرونة"),
        bi("Backup implementation with immutability, separation and offsite copies", "تنفيذ نسخ احتياطي بعدم قابلية التعديل والفصل ونسخ خارج الموقع"),
        bi("Tested restore procedures, recovery runbooks and a testing calendar", "إجراءات استعادة مختبرة وأدلة تعافٍ وتقويم للاختبارات"),
      ],
    },
    businessMeaning: {
      body: bi(
        "A ransomware incident becomes a recovery exercise instead of a negotiation, hardware or cloud failures become a known number of hours, and leadership can state the organisation's recovery capability with confidence.",
        "يتحول حادث برامج الفدية إلى تمرين استعادة بدلاً من مفاوضة، وتصبح أعطال العتاد أو السحابة عدداً معروفاً من الساعات، وتستطيع القيادة ذكر قدرة المؤسسة على التعافي بثقة.",
      ),
    },
    related: ["platform-reliability-devops", "digital-forensics-incident-response", "infrastructure-modernisation"],
  },
  {
    slug: "infrastructure-modernisation",
    practice: "technology-infrastructure",
    pictogram: "network",
    title: bi("Infrastructure Modernisation", "تحديث البنية التحتية"),
    summary: bi("Moving from ageing servers, networks and data centres to infrastructure that is supported, secure and manageable.", "الانتقال من خوادم وشبكات ومراكز بيانات متقادمة إلى بنية تحتية مدعومة وآمنة وقابلة للإدارة."),
    hero: bi("Old infrastructure does not fail all at once. It fails a little every month, until the month it does not.", "البنية التحتية القديمة لا تفشل دفعة واحدة. تفشل قليلاً كل شهر، حتى الشهر الذي تفشل فيه كلياً."),
    seo: {
      title: bi("Infrastructure Modernisation", "تحديث البنية التحتية"),
      description: bi("Infrastructure modernisation by CyBarq: assessment of servers, networks and data centre estates, migration to cloud or modern on premises platforms, network redesign and secure, staged transition.", "تحديث البنية التحتية من سايبرق: تقييم الخوادم والشبكات ومراكز البيانات، والترحيل إلى السحابة أو منصات محلية حديثة، وإعادة تصميم الشبكة، وانتقال آمن على مراحل."),
    },
    problem: {
      body: bi(
        "Servers past their support dates, flat networks where everything can reach everything, virtualisation platforms nobody upgrades, and a data centre room that is also the store cupboard. The systems still work, which is why the budget keeps going elsewhere, and every year the eventual migration gets larger and riskier.",
        "خوادم تجاوزت مواعيد دعمها، وشبكات مسطحة يصل فيها كل شيء إلى كل شيء، ومنصات افتراضية لا يحدّثها أحد، وغرفة مركز بيانات هي أيضاً مخزن. ما تزال الأنظمة تعمل، ولهذا تذهب الميزانية إلى غيرها، ومع كل سنة يصبح الترحيل الحتمي أكبر وأخطر.",
      ),
    },
    whereItAppears: {
      body: bi(
        "On premises estates built up over a decade, branch networks with inconsistent equipment, end of life operating systems that cannot be patched, storage that is full and unsupported, and audit or insurance findings that require remediation by a date.",
        "في البيئات المحلية التي تراكمت على مدى عقد، وشبكات الفروع بمعدات غير متسقة، وأنظمة تشغيل انتهى دعمها ولا يمكن تحديثها أمنياً، ومخازن ممتلئة وغير مدعومة، وملاحظات تدقيق أو تأمين تتطلب معالجة قبل تاريخ محدد.",
      ),
    },
    approach: {
      body: bi(
        "We assess the estate honestly: what each system does, what depends on it, what its real risk is, and what the right destination is, which may be cloud, a modern on premises platform, a managed service or retirement. The network is redesigned with segmentation so a compromised device cannot reach everything. Migration is staged by dependency, with each stage leaving a supported, documented state behind.",
        "نقيّم البيئة بصدق: ماذا يفعل كل نظام، وما الذي يعتمد عليه، وما مخاطره الحقيقية، وما الوجهة الصحيحة له، والتي قد تكون السحابة أو منصة محلية حديثة أو خدمة مُدارة أو الاستغناء عنه. ويُعاد تصميم الشبكة بالتقسيم بحيث لا يصل جهاز مخترق إلى كل شيء. ويُرحَّل على مراحل حسب التبعيات، وتترك كل مرحلة وراءها حالة مدعومة وموثقة.",
      ),
    },
    engagement: {
      body: bi(
        "The assessment takes a few weeks and produces a modernisation roadmap with costs, sequencing and risk. Implementation proceeds in stages agreed with the business, scheduled around its calendar, each with a rollback plan. We work with your existing IT staff and vendors, and we can operate the new platform for a period while your team takes it on.",
        "يستغرق التقييم بضعة أسابيع وينتج خارطة طريق للتحديث بالتكاليف والتسلسل والمخاطر. ويسير التنفيذ على مراحل متفق عليها مع الأعمال، مجدولة حول تقويمها، ولكل مرحلة خطة تراجع. نعمل مع موظفي تقنية المعلومات ومورّديك الحاليين، ويمكننا تشغيل المنصة الجديدة لفترة ريثما يتولاها فريقك.",
      ),
    },
    deliverables: {
      body: bi("A supported, segmented, documented estate, delivered without a big bang.", "بيئة مدعومة ومقسّمة وموثقة، مسلَّمة من دون انتقال دفعة واحدة."),
      items: [
        bi("Infrastructure assessment and staged modernisation roadmap", "تقييم للبنية التحتية وخارطة طريق تحديث مرحلية"),
        bi("Migrated or replaced systems, network redesign with segmentation", "أنظمة مرحّلة أو مستبدلة، وإعادة تصميم للشبكة مع تقسيم"),
        bi("Documentation, monitoring and handover to your operations team", "وثائق ومراقبة وتسليم إلى فريق العمليات لديك"),
      ],
    },
    businessMeaning: {
      body: bi(
        "The slow accumulation of risk is reversed in a controlled programme, security improves with every stage, and infrastructure stops being the reason a project cannot start.",
        "يُعكس التراكم البطيء للمخاطر في برنامج مضبوط، ويتحسن الأمان مع كل مرحلة، وتتوقف البنية التحتية عن كونها السبب في تعذّر بدء مشروع ما.",
      ),
    },
    related: ["cloud-architecture", "legacy-modernisation", "backup-resilience"],
  },
  {
    slug: "technical-architecture-consulting",
    practice: "technology-infrastructure",
    pictogram: "consulting",
    title: bi("Technical Architecture Consulting", "استشارات البنية التقنية"),
    summary: bi("Independent architecture advice for decisions that are expensive to get wrong.", "استشارات بنية مستقلة للقرارات التي يكلّف الخطأ فيها كثيراً."),
    hero: bi("Some decisions you make once and live with for years. Those are the ones worth a second opinion.", "بعض القرارات تتخذها مرة وتعيش معها لسنوات. تلك هي التي تستحق رأياً ثانياً."),
    seo: {
      title: bi("Technical Architecture Consulting", "استشارات البنية التقنية"),
      description: bi("Independent technical architecture consulting by CyBarq: technology selection, vendor and platform evaluation, architecture reviews, build or buy decisions and technical due diligence.", "استشارات بنية تقنية مستقلة من سايبرق: اختيار التقنيات، وتقييم المورّدين والمنصات، ومراجعات البنية، وقرارات البناء أو الشراء، والعناية الواجبة التقنية."),
    },
    problem: {
      body: bi(
        "Choosing a platform, a vendor, a database or an integration approach is a decision that shapes cost and risk for years. It is usually made under time pressure, with advice from the people selling the options, and without anyone whose job is to ask the uncomfortable questions. The wrong choice rarely fails immediately; it becomes the constraint every later project works around.",
        "اختيار منصة أو مورّد أو قاعدة بيانات أو نهج تكامل قرار يشكّل التكلفة والمخاطر لسنوات. ويُتخذ عادةً تحت ضغط الوقت، بنصيحة ممن يبيعون الخيارات، ومن دون أحد مهمته طرح الأسئلة غير المريحة. والخيار الخاطئ نادراً ما يفشل فوراً؛ بل يصبح القيد الذي يلتف حوله كل مشروع لاحق.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Platform and vendor selection, build or buy decisions, reviews of a proposal from a supplier, due diligence on a company or a system being acquired, architecture for a new product, and disagreements between teams that need an independent view.",
        "في اختيار المنصات والمورّدين، وقرارات البناء أو الشراء، ومراجعة عرض مقدم من مورّد، والعناية الواجبة على شركة أو نظام قيد الاستحواذ، وبنية منتج جديد، والخلافات بين الفرق التي تحتاج إلى رأي مستقل.",
      ),
    },
    approach: {
      body: bi(
        "We have no products to sell, so the advice is about your situation. We understand the business constraints, the team's real capacity and the existing estate before recommending anything. Options are compared on total cost, risk, security, operability and exit cost, in writing, with the trade offs stated plainly. Where we recommend against something popular, we explain why.",
        "ليست لدينا منتجات نبيعها، فالنصيحة عن وضعك أنت. نفهم قيود الأعمال، والقدرة الحقيقية للفريق، والبيئة القائمة قبل التوصية بأي شيء. وتُقارن الخيارات على أساس التكلفة الإجمالية والمخاطر والأمان وسهولة التشغيل وتكلفة الخروج، كتابةً، مع ذكر المفاضلات بوضوح. وحين نوصي بعدم اختيار شيء رائج، نشرح السبب.",
      ),
    },
    engagement: {
      body: bi(
        "Engagements are scoped to the decision: a review of a few days, an evaluation of a few weeks, or a retained architect who joins your design discussions on a regular basis. The output is a written recommendation with the reasoning, so it can be challenged and revisited. We are happy to be in the room when it is presented to leadership.",
        "تُحدد الارتباطات بحجم القرار: مراجعة من بضعة أيام، أو تقييم من بضعة أسابيع، أو مهندس بنية محجوز ينضم إلى نقاشات التصميم لديك بانتظام. والمخرج توصية مكتوبة مع أسبابها، ليمكن مناقشتها وإعادة النظر فيها. ويسعدنا الحضور حين تُعرض على القيادة.",
      ),
    },
    deliverables: {
      body: bi("A decision you can defend, and the reasoning to revisit it later.", "قرار تستطيع الدفاع عنه، وأسباب تعود إليها لاحقاً."),
      items: [
        bi("Written evaluation of options with costs, risks and trade offs", "تقييم مكتوب للخيارات بالتكاليف والمخاطر والمفاضلات"),
        bi("Architecture recommendation or review with prioritised actions", "توصية أو مراجعة للبنية بإجراءات مرتبة"),
        bi("Presentation to leadership and support during vendor negotiation where relevant", "عرض للقيادة ودعم أثناء التفاوض مع المورّدين عند الحاجة"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Fewer expensive reversals, better terms with vendors because you know what you need, and technology choices that the organisation can live with for as long as it has to.",
        "تراجعات مكلفة أقل، وشروط أفضل مع المورّدين لأنك تعرف ما تحتاجه، وخيارات تقنية تستطيع المؤسسة العيش معها طوال المدة اللازمة.",
      ),
    },
    related: ["performance-platform-architecture", "security-consulting-architecture", "cloud-architecture"],
  },
];
