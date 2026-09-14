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
    summary: bi("Accounts, networks and permissions laid out on purpose, so the environment stays secure, affordable and easy to run.", "حسابات وشبكات وصلاحيات مرتّبة عن قصد، لتبقى البيئة آمنة ومعقولة التكلفة وسهلة التشغيل."),
    hero: bi("A cloud environment is a stack of decisions. Made early and on purpose they cost very little, and left to happen by themselves they are paid for over years.", "البيئة السحابية سلسلة قرارات. إن اتُّخذت مبكراً وعن قصد كانت كلفتها زهيدة، وإن تُركت لتحدث وحدها دُفع ثمنها سنوات."),
    seo: {
      title: bi("Cloud Architecture", "البنية السحابية"),
      description: bi("Cloud architecture design and review by CyBarq on AWS, Azure and Google Cloud: accounts, networks, identity, security baselines and cost planning.", "تصميم ومراجعة البنية السحابية من سايبرق على AWS وAzure وGoogle Cloud: الحسابات والشبكات والهوية وخطوط الأساس الأمنية وتخطيط التكلفة."),
    },
    problem: {
      body: bi(
        "Most cloud environments were never designed. One account was opened for one project, then everything else moved in beside it: more projects, permissions handed out to unblock someone, networks that overlap, and a bill nobody can split by team. Each step made sense at the time, and together they produce an estate that is hard to secure, hard to audit and expensive to rearrange.",
        "معظم البيئات السحابية لم تُصمَّم. فُتح حساب واحد لمشروع واحد، ثم انتقل إليه كل ما تبعه: مشاريع أخرى، وصلاحيات مُنحت على عجل لإزاحة عائق، وشبكات متداخلة، وفاتورة لا يعرف أحد كيف يوزّعها على الفرق. كل خطوة كانت منطقية حين اتُّخذت، لكنها اجتمعت في بيئة يصعب تأمينها وتدقيقها ويكلّف تغييرها كثيراً.",
      ),
    },
    whereItAppears: {
      body: bi(
        "You see it before a first move to the cloud, and in environments that grew for years without a plan. You see it in estates spread across two or three providers after an acquisition or a vendor decision, and in workloads that must keep data inside a particular country. You also see it when the cloud bill grows faster than the business does.",
        "يظهر هذا قبل أول انتقال إلى السحابة، وفي بيئات نمت سنوات بلا خطة. ويظهر في بيئات موزّعة على مزوّدَين أو ثلاثة بعد استحواذ أو قرار مورّد، وفي أحمال عمل يجب أن تبقى بياناتها داخل بلد بعينه. ويظهر أيضاً حين تنمو الفاتورة السحابية أسرع من نمو العمل نفسه.",
      ),
    },
    approach: {
      body: bi(
        "We settle the foundation first: how accounts or subscriptions are split, who gets access to what, how the network is laid out, what gets logged, and the guardrails that stop the whole thing drifting. All of it is written as infrastructure code, so an environment can be rebuilt and reviewed like any other file. Cost is modelled per workload and tagged from day one. Where a migration is involved we plan it in waves with the business, not over one weekend.",
        "نبدأ بالأساس: كيف تُقسَّم الحسابات أو الاشتراكات، ومن يصل إلى ماذا، وكيف تُرسم الشبكة، وما الذي يُسجَّل، والضوابط التي تمنع انجراف البيئة. ونكتب هذا كله بنية تحتية كشيفرة، فتُبنى البيئة من جديد وتُراجع كأي ملف. ونُنمذج التكلفة لكل حمل عمل ونضع الوسوم من اليوم الأول. وإن كان هناك ترحيل، خطّطناه على موجات مع أصحاب العمل، لا في عطلة نهاية أسبوع.",
      ),
    },
    engagement: {
      body: bi(
        "A review or design phase runs two to four weeks and ends with three things: an architecture document, a security baseline and a cost model. We then build the foundation as infrastructure code, with your engineers working on it so that it is theirs afterwards. Migrations are scheduled one workload at a time, each with a way back. When the build is done we can stay on call for the architecture decisions that come later.",
        "تستغرق مرحلة المراجعة أو التصميم من أسبوعين إلى أربعة، وتنتهي بثلاثة أشياء: وثيقة بنية، وخط أساس أمني، ونموذج تكلفة. ثم نبني الأساس بنية تحتية كشيفرة، ويعمل عليه مهندسوك ليكون لهم بعد انتهائنا. وتُجدول عمليات الترحيل حملاً بعد حمل، ولكل واحد طريق رجوع. ويمكننا البقاء بعد ذلك مرجعاً لقرارات البنية التي تأتي لاحقاً.",
      ),
    },
    deliverables: {
      body: bi("A foundation that is written down, can be rebuilt from its own code, and is safe by default.", "أساس مكتوب، يمكن إعادة بنائه من شيفرته، وآمن افتراضياً."),
      items: [
        bi("Architecture document covering accounts, network, identity and logging", "وثيقة بنية تغطي الحسابات والشبكة والهوية والسجلات"),
        bi("Infrastructure code for the foundation and the security guardrails", "شيفرة بنية تحتية للأساس وللضوابط الأمنية"),
        bi("Cost model with tagging and budgets, plus a migration plan where one is needed", "نموذج تكلفة بالوسوم والميزانيات، وخطة ترحيل عند الحاجة"),
      ],
    },
    businessMeaning: {
      body: bi(
        "You can walk an auditor through the environment without a week of preparation. You can tell finance which product and which team spent what. New projects start on top of something solid instead of inventing their own accounts and their own rules.",
        "تستطيع أن تشرح البيئة لمدقق من دون أسبوع تحضير. وتستطيع أن تخبر المالية ما الذي أنفقه كل منتج وكل فريق. وتبدأ المشاريع الجديدة فوق أساس قائم، بدل أن تخترع لنفسها حسابات وقواعد جديدة.",
      ),
    },
    related: ["application-deployment-infrastructure", "identity-access-architecture", "cloud-applications"],
  },
  {
    slug: "application-deployment-infrastructure",
    practice: "technology-infrastructure",
    pictogram: "deployment",
    title: bi("Application & Deployment Infrastructure", "بنية التطبيقات والنشر"),
    summary: bi("Everything between a commit and production: pipelines, environments, secrets and a way back when a release goes wrong.", "كل ما يقع بين الالتزام البرمجي والإنتاج: خطوط النشر والبيئات والأسرار وطريق للرجوع إن ساء الإصدار."),
    hero: bi("Deploying should be uneventful. When a release needs a plan, a late evening and one particular person, the infrastructure is what needs attention.", "النشر ينبغي أن يمرّ بلا أحداث. فإن احتاج الإصدار إلى خطة ومساء متأخر وشخص بعينه، فالبنية التحتية هي ما يحتاج إلى عناية."),
    seo: {
      title: bi("Application and Deployment Infrastructure", "بنية التطبيقات والنشر"),
      description: bi("CyBarq builds deployment pipelines, environments and runtime platforms: CI/CD, Kubernetes where it fits, secrets management and safe rollouts.", "تبني سايبرق خطوط النشر والبيئات ومنصات التشغيل: CI/CD، وKubernetes حيث تناسب، وإدارة الأسرار، وإطلاق تدريجي آمن."),
    },
    problem: {
      body: bi(
        "In a lot of organisations a deployment is still one person, one evening and a checklist they carry in their head. The environments differ from each other in ways nobody wrote down, secrets sit in files on servers, and rolling back means restoring a backup. So releases get saved up to reduce the pain, which makes each one bigger and more dangerous than the last.",
        "في كثير من المؤسسات ما يزال النشر يعني شخصاً واحداً ومساءً واحداً وقائمة تحقق في رأسه. تختلف البيئات عن بعضها بطرق لم يدوّنها أحد، وتبقى الأسرار في ملفات على الخوادم، والتراجع يعني استعادة نسخة احتياطية. فتُجمَّع الإصدارات تخفيفاً للألم، فيصير كل إصدار أكبر وأخطر مما قبله.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Teams that ship less often than they want to. Incidents that turn out to be one setting that differed between staging and production. Applications only one person knows how to deploy, container platforms adopted without anyone to run them, and audit questions about who changed what in production and when.",
        "فرق تُصدر أقل مما تريد. وحوادث يتبيّن أنها إعداد واحد اختلف بين بيئة الاختبار والإنتاج. وتطبيقات لا يعرف نشرها إلا شخص واحد، ومنصات حاويات اعتُمدت من دون من يشغّلها، وأسئلة تدقيق عمّن غيّر ماذا في الإنتاج ومتى.",
      ),
    },
    approach: {
      body: bi(
        "We build the path from commit to production as code. Pipelines run the tests, scan the code and produce a versioned artefact. Every environment comes from the same definitions, so staging and production stop drifting apart, and secrets live in a store and are injected at runtime rather than committed. Releases go out gradually and can be reversed in minutes. We pick the runtime to match the team: a managed platform when that is enough, Kubernetes when the scale and the people to operate it are both there.",
        "نبني المسار من الالتزام البرمجي إلى الإنتاج كشيفرة. تُشغّل خطوط النشر الاختبارات، وتفحص الشيفرة، وتنتج مخرجاً بإصدار محدد. وتُنشأ كل بيئة من التعريفات نفسها، فتتوقف بيئة الاختبار والإنتاج عن التباعد، وتبقى الأسرار في مخزن تُحقن منه وقت التشغيل لا في المستودع. وتخرج الإصدارات تدريجياً ويمكن عكسها خلال دقائق. ونختار بيئة التشغيل بما يناسب الفريق: منصة مُدارة حين تكفي، وKubernetes حين يتوفر الحجم ومن يشغّلها معاً.",
      ),
    },
    engagement: {
      body: bi(
        "We start with one application and take it the whole way: pipeline, environments, secrets, rollout and rollback. That application becomes the template for the rest. Your engineers build it with us, so the result belongs to them. Within a few weeks releasing the first application is routine, and we apply the same pattern to the others in the order that is worth most to you.",
        "نبدأ بتطبيق واحد ونأخذه إلى آخر الطريق: خط النشر، والبيئات، والأسرار، والطرح، والتراجع. ويصير هذا التطبيق قالباً لما بعده. ويبنيه مهندسوك معنا، فتكون النتيجة لهم. وخلال أسابيع قليلة يصبح إصدار التطبيق الأول أمراً روتينياً، ثم نطبّق النمط نفسه على البقية بترتيب ما يهمّك أكثر.",
      ),
    },
    deliverables: {
      body: bi("A release process that works the same whoever is on shift.", "عملية إصدار تسير كما هي أياً كان من في المناوبة."),
      items: [
        bi("Pipelines that test, scan and store build artefacts", "خطوط CI/CD تختبر وتفحص وتحفظ المخرجات"),
        bi("Environment definitions as code, secrets management and a runtime platform", "تعريفات البيئات كشيفرة، وإدارة الأسرار، ومنصة تشغيل"),
        bi("Gradual rollout and rollback procedures, written down and rehearsed", "إجراءات طرح تدريجي وتراجع، مكتوبة ومجرَّبة"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Releases get smaller and more frequent, so each one carries less risk. Fewer incidents start with a difference between two environments. Every change that reached production has a record showing who made it and when.",
        "تصغر الإصدارات وتتكرر، فتقل المخاطرة في كل منها. وتقلّ الحوادث التي تبدأ باختلاف بين بيئتين. ولكل تغيير وصل إلى الإنتاج سجل يبيّن من أجراه ومتى.",
      ),
    },
    related: ["platform-reliability-devops", "cloud-architecture", "observability"],
  },
  {
    slug: "platform-reliability-devops",
    practice: "technology-infrastructure",
    pictogram: "performance",
    title: bi("Platform Reliability & DevOps", "موثوقية المنصات وDevOps"),
    summary: bi("Keeping platforms up against a target you chose, and building the habits that keep them there.", "إبقاء المنصات متاحة وفق هدف اخترته، وبناء العادات التي تُبقيها كذلك."),
    hero: bi("Reliability starts as a business question: how much downtime can you live with? The engineering comes after the answer.", "تبدأ الموثوقية بسؤال عن العمل: كم من التوقف تحتمله؟ وتأتي الهندسة بعد الجواب."),
    seo: {
      title: bi("Platform Reliability and DevOps", "موثوقية المنصات وDevOps"),
      description: bi("Reliability engineering and DevOps from CyBarq: service level objectives, incident process, capacity planning, on call readiness and managed operations.", "هندسة الموثوقية وممارسات DevOps من سايبرق: أهداف مستوى الخدمة، وإجراءات الحوادث، وتخطيط السعة، وجاهزية المناوبة، والعمليات المُدارة."),
    },
    problem: {
      body: bi(
        "Outages cost money. So does building for an availability nobody asked for. Without an agreed target a team swings between firefighting and gold plating, the operational knowledge sits with two or three people, incidents are handled from memory, and the same failure happens a second time because the first time was never written down.",
        "الانقطاعات تكلّف مالاً. والبناء من أجل إتاحة لم يطلبها أحد يكلّف أيضاً. ومن دون هدف متفق عليه يتأرجح الفريق بين إطفاء الحرائق والمبالغة، وتبقى المعرفة التشغيلية عند شخصين أو ثلاثة، وتُعالَج الحوادث من الذاكرة، ويتكرر العطل نفسه لأن المرة الأولى لم تُدوَّن.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Platforms that customers or staff rely on through the working day. Systems with a peak, such as a payroll run or a campaign. Services with an availability commitment written into a contract, and teams where the same engineers write the code and also carry the pager.",
        "منصات يعتمد عليها العملاء أو الموظفون طوال يوم العمل. وأنظمة لها ذروة، كدورة رواتب أو حملة. وخدمات عليها التزام إتاحة في عقد، وفرق يكتب فيها المهندسون أنفسهم الشيفرة ويتولّون المناوبة.",
      ),
    },
    approach: {
      body: bi(
        "First we agree service level objectives that mean something to the business, then we engineer to meet them. That means redundancy where it pays for itself, capacity planned from measured load rather than guesswork, health checks and alerts tied to what users actually feel, and a runbook for each failure we know will happen. Incidents get a light process and a review that looks for causes rather than culprits, so every outage leaves the system a little better. Work that gets repeated by hand gets automated.",
        "نتفق أولاً على أهداف مستوى خدمة تعني شيئاً للعمل، ثم نهندس لتحقيقها. أي تكرار حيث يستحق كلفته، وسعة مخطط لها من حمل مقيس لا من تخمين، وفحوص سلامة وتنبيهات مرتبطة بما يشعر به المستخدم فعلاً، ودليل تشغيل لكل عطل نعرف أنه سيقع. وللحوادث إجراء خفيف ومراجعة تبحث عن السبب لا عن المذنب، فيترك كل انقطاع النظام أحسن قليلاً. وما يتكرر يدوياً نؤتمته.",
      ),
    },
    engagement: {
      body: bi(
        "A reliability review of one to two weeks tells you where availability stands today, what threatens it and what is missing against the target. We then work through the improvements with your team in priority order. Some clients keep us on for managed operations, with agreed response times and a monthly report against the objectives. Others take the practices in house after a handover period, which is a fine outcome.",
        "تكشف مراجعة موثوقية من أسبوع إلى أسبوعين أين تقف الإتاحة اليوم، وما الذي يهددها، وما الناقص مقابل الهدف. ثم ننفّذ التحسينات مع فريقك بترتيب الأولوية. يُبقينا بعض العملاء لعمليات مُدارة بأزمنة استجابة متفق عليها وتقرير شهري مقابل الأهداف. ويتولّى غيرهم الممارسات داخلياً بعد فترة تسليم، وهذه نتيجة جيدة أيضاً.",
      ),
    },
    deliverables: {
      body: bi("A number you agreed to, the engineering that meets it, and the reports that show you did.", "رقم اتفقتم عليه، وهندسة تحققه، وتقارير تُظهر أنكم حققتموه."),
      items: [
        bi("Service level objectives and a reliability review with actions in priority order", "أهداف مستوى الخدمة ومراجعة موثوقية بإجراءات مرتبة حسب الأولوية"),
        bi("Alerting, runbooks, an incident process and a capacity plan", "تنبيهات وأدلة تشغيل وإجراء للحوادث وخطة سعة"),
        bi("Automation of routine operations and monthly availability reporting", "أتمتة للعمليات الروتينية وتقرير شهري للإتاحة"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Availability that matches what the business actually needs, rather than a number someone picked. Incidents that end sooner and happen less often. An operations capability that does not depend on one person's phone being switched on.",
        "إتاحة تطابق ما يحتاجه العمل فعلاً، لا رقماً اختاره أحدهم. وحوادث تنتهي أسرع وتتكرر أقل. وقدرة تشغيلية لا تتوقف على هاتف شخص واحد.",
      ),
    },
    related: ["observability", "application-deployment-infrastructure", "backup-resilience"],
  },
  {
    slug: "observability",
    practice: "technology-infrastructure",
    pictogram: "monitoring",
    title: bi("Observability", "المراقبة والرصد"),
    summary: bi("Logs, metrics and traces chosen so that you can answer real questions later, operational ones and security ones.", "سجلات ومقاييس وتتبعات مختارة لتجيب عن أسئلة حقيقية لاحقاً، تشغيلية كانت أو أمنية."),
    hero: bi("Most of an outage is spent finding out where to look. Observability is the work that removes that part.", "يُقضى معظم وقت الانقطاع في البحث عن مكان النظر. المراقبة هي العمل الذي يحذف هذا الجزء."),
    seo: {
      title: bi("Observability", "المراقبة والرصد"),
      description: bi("Observability engineering from CyBarq: centralised logging, metrics, tracing, dashboards and alerting for operations and security investigation.", "هندسة المراقبة من سايبرق: سجلات مركزية ومقاييس وتتبع ولوحات وتنبيهات للعمليات والتحقيق الأمني معاً."),
    },
    problem: {
      body: bi(
        "Logs sit on twenty servers in twenty formats. Metrics exist for the infrastructure but not for the application, and there is no way to follow a single request as it crosses services. In a security incident the gap turns serious: the evidence you need was never collected, or it was overwritten last week.",
        "السجلات موزّعة على عشرين خادماً بعشرين صيغة. والمقاييس موجودة للبنية التحتية لا للتطبيق، ولا سبيل لتتبّع طلب واحد وهو يعبر الخدمات. وفي حادث أمني تصبح الفجوة خطيرة: الدليل المطلوب لم يُجمع أصلاً، أو كُتب فوقه الأسبوع الماضي.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Distributed applications and microservices. Cloud environments stitched together from many managed services. Systems with logging requirements set by an auditor or a regulator, teams who hear about an outage first from a customer, and investigations that end with the sentence we cannot tell.",
        "التطبيقات الموزّعة والخدمات المصغّرة. والبيئات السحابية المركّبة من خدمات مُدارة كثيرة. والأنظمة التي يفرض عليها مدقق أو جهة تنظيمية متطلبات تسجيل، والفرق التي تسمع بالانقطاع من العميل أولاً، والتحقيقات التي تنتهي بعبارة لا نستطيع الجزم.",
      ),
    },
    approach: {
      body: bi(
        "We decide what to collect before we pick a tool. The logs, metrics and traces are the ones that answer questions you will really ask, written in a consistent structure so they can be correlated across services. Dashboards are built around the services users touch, not around servers, and alerts are tied to symptoms someone cares about and tuned until people trust them again. Retention and access follow your legal and security obligations, and the security team sees the same data as the operations team.",
        "نقرر ما نجمعه قبل أن نختار الأداة. والسجلات والمقاييس والتتبعات هي التي تجيب عن أسئلة ستُطرح فعلاً، بصيغة واحدة متسقة تسمح بالربط بين الخدمات. وتُبنى اللوحات حول الخدمات التي يلمسها المستخدم لا حول الخوادم، وتُربط التنبيهات بأعراض يهتم بها أحد وتُضبط حتى يعود الناس يثقون بها. ويتبع الاحتفاظ والوصول التزاماتك القانونية والأمنية، ويرى الفريق الأمني البيانات نفسها التي يراها فريق العمليات.",
      ),
    },
    engagement: {
      body: bi(
        "We start from the questions you need answered and measure today's coverage against them. Then we build in stages: central logging first, then metrics and service dashboards, then tracing where the architecture calls for it. Tools are chosen to fit your environment and budget, open source or managed, whichever costs you less to run. We hand over with a runbook for each alert and a review of the first month, so the noisy alerts get fixed rather than ignored.",
        "نبدأ من الأسئلة التي تحتاج إلى إجابتها، ونقيس التغطية الحالية مقابلها. ثم نبني على مراحل: السجلات المركزية أولاً، ثم المقاييس ولوحات الخدمات، ثم التتبع حيث تستدعيه البنية. وتُختار الأدوات بما يناسب بيئتك وميزانيتك، مفتوحة المصدر أو مُدارة، أيّهما أقل كلفة في التشغيل. ونسلّم مع دليل تشغيل لكل تنبيه ومراجعة للشهر الأول، فتُصلَح التنبيهات المزعجة بدل أن تُتجاهل.",
      ),
    },
    deliverables: {
      body: bi("One place to look, and good reason to believe the answer is in it.", "مكان واحد تنظر فيه، وسبب وجيه للاعتقاد بأن الجواب موجود فيه."),
      items: [
        bi("Central, structured logging with retention that matches your obligations", "سجلات مركزية منظمة باحتفاظ يطابق التزاماتك"),
        bi("Service level dashboards, tracing where it is warranted, and tuned alerts", "لوحات على مستوى الخدمة، وتتبع حيث يلزم، وتنبيهات مضبوطة"),
        bi("A runbook per alert, and access for operations and security investigation alike", "دليل تشغيل لكل تنبيه، ووصول للعمليات وللتحقيق الأمني على السواء"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Diagnosis gets faster when something breaks, and you get warning before it does. When an auditor or an investigator asks what happened, you answer with records instead of estimates.",
        "يصبح التشخيص أسرع حين يتعطل شيء، ويصلك إنذار قبل أن يتعطل. وحين يسأل مدقق أو محقق عمّا جرى، تجيب بسجلات لا بتقديرات.",
      ),
    },
    related: ["platform-reliability-devops", "compromise-assessment", "performance-platform-architecture"],
  },
  {
    slug: "identity-access-architecture",
    practice: "technology-infrastructure",
    pictogram: "identity",
    title: bi("Identity & Access Architecture", "بنية الهوية والوصول"),
    summary: bi("One answer to who can reach what, applied the same way across applications, cloud and infrastructure.", "جواب واحد عمّن يصل إلى ماذا، مطبَّق بالطريقة نفسها عبر التطبيقات والسحابة والبنية التحتية."),
    hero: bi("Most unwanted access arrives through a door that was opened for a good reason and never closed again.", "معظم الوصول غير المرغوب يأتي من باب فُتح لسبب وجيه ولم يُغلق بعده."),
    seo: {
      title: bi("Identity and Access Architecture", "بنية الهوية والوصول"),
      description: bi("Identity and access management from CyBarq: single sign on, MFA, role design, privileged access, joiner and leaver processes and cloud identity.", "إدارة الهوية والوصول من سايبرق: تسجيل دخول موحد، ومصادقة متعددة العوامل، وتصميم الأدوار، والوصول المميز، وحوكمة الهوية السحابية."),
    },
    problem: {
      body: bi(
        "Access accumulates. Someone changes role and keeps the old permissions, a shared account is created because it was quicker, a contractor finishes and the credentials still work, a cloud role is widened until the job runs. Each one is small on its own, and together they are the path an attacker takes once inside. Ask for a current list of who can reach what, and nobody can produce one.",
        "الوصول يتراكم. ينتقل موظف إلى دور جديد ويحتفظ بصلاحياته القديمة، ويُنشأ حساب مشترك لأنه أسرع، وينتهي عقد متعاقد وبيانات دخوله ما تزال تعمل، وتُوسَّع صلاحية سحابية حتى تنجح المهمة. كل واحدة صغيرة وحدها، ومجتمعةً هي الطريق الذي يسلكه المهاجم بعد الدخول. واطلب قائمة حالية بمن يصل إلى ماذا، فلن يجدها أحد.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Organisations with many applications and as many separate logins. Cloud accounts where permissions were granted by hand, admin credentials a whole team knows, and systems that partners and contractors log into. It also shows up as an audit finding about leavers who still have access, or about privileged accounts nobody owns.",
        "مؤسسات فيها تطبيقات كثيرة وتسجيلات دخول بعددها. وحسابات سحابية مُنحت صلاحياتها يدوياً، وبيانات دخول إدارية يعرفها فريق كامل، وأنظمة يدخلها الشركاء والمتعاقدون. ويظهر أيضاً في ملاحظة تدقيق عن مغادرين ما زال وصولهم قائماً، أو عن حسابات مميزة بلا مالك.",
      ),
    },
    approach: {
      body: bi(
        "We treat identity as one system rather than a setting inside each application. That means a central identity provider, single sign on for the applications, multi factor authentication everywhere it matters, and roles defined by the job a person does instead of by the history of what they once asked for. Privileged access is kept separate, granted for a limited time and logged. Joiner, mover and leaver steps are automated so access follows the person's role, and cloud permissions get the same treatment, with least privilege enforced by policy rather than by anyone's memory.",
        "نتعامل مع الهوية كنظام واحد، لا كإعداد داخل كل تطبيق. أي مزوّد هوية مركزي، وتسجيل دخول موحد للتطبيقات، ومصادقة متعددة العوامل في كل موضع مهم، وأدوار تُحدَّد بالوظيفة التي يؤديها الشخص لا بتاريخ ما طلبه يوماً. ويبقى الوصول المميز منفصلاً، يُمنح لوقت محدود ويُسجَّل. وتُؤتمت خطوات الالتحاق والانتقال والمغادرة ليتبع الوصول دور الشخص، وتأخذ الصلاحيات السحابية المعاملة نفسها، بحد أدنى تفرضه السياسة لا ذاكرة أحد.",
      ),
    },
    engagement: {
      body: bi(
        "We start with an inventory: the identities, the applications and the permissions that exist today. Then we design the target model with your HR and IT owners, because access follows employment and not only technology. Implementation is phased: identity provider and MFA first, then applications onto single sign on in order of risk, then privileged access and cloud policy. Each phase closes with an access review, so the clean state is checked rather than assumed.",
        "نبدأ بجرد: الهويات والتطبيقات والصلاحيات الموجودة اليوم. ثم نصمم النموذج المستهدف مع مسؤولي الموارد البشرية وتقنية المعلومات، لأن الوصول يتبع علاقة العمل لا التقنية وحدها. ويُنفَّذ على مراحل: مزوّد الهوية والمصادقة متعددة العوامل أولاً، ثم نقل التطبيقات إلى تسجيل الدخول الموحد بترتيب المخاطر، ثم الوصول المميز والسياسات السحابية. وتُختم كل مرحلة بمراجعة وصول، فيُتحقَّق من الوضع النظيف بدل افتراضه.",
      ),
    },
    deliverables: {
      body: bi("One current answer to who can reach what, and the controls that keep it current.", "جواب واحد حديث عمّن يصل إلى ماذا، وضوابط تُبقيه حديثاً."),
      items: [
        bi("Identity architecture, a role model and written access policies", "بنية هوية ونموذج أدوار وسياسات وصول مكتوبة"),
        bi("Single sign on, MFA and privileged access in place across applications and cloud", "تسجيل دخول موحد ومصادقة متعددة العوامل ووصول مميز عبر التطبيقات والسحابة"),
        bi("Automated joiner, mover and leaver steps, and access reviews on a schedule", "خطوات مؤتمتة للالتحاق والانتقال والمغادرة، ومراجعات وصول وفق جدول"),
      ],
    },
    businessMeaning: {
      body: bi(
        "An attacker who gets in has fewer places to go. Staff sign in once instead of managing a password for every system. Auditors get a straight answer, and you stop discovering that a contractor who left last year still has the keys.",
        "يجد المهاجم الذي يدخل أماكن أقل يتحرك إليها. ويسجّل الموظفون الدخول مرة واحدة بدل إدارة كلمة مرور لكل نظام. ويحصل المدققون على جواب مباشر، وتتوقف عن اكتشاف أن متعاقداً غادر العام الماضي ما زال يملك المفاتيح.",
      ),
    },
    related: ["security-consulting-architecture", "cloud-architecture", "enterprise-ai-assistants"],
  },
  {
    slug: "backup-resilience",
    practice: "technology-infrastructure",
    pictogram: "dataCentre",
    title: bi("Backup & Resilience", "النسخ الاحتياطي والمرونة"),
    summary: bi("Backups that have actually been restored, recovery that has been rehearsed, and a written plan for the day data is lost.", "نسخ احتياطية جرت استعادتها فعلاً، واستعادة تُدرَّب عليها، وخطة مكتوبة ليوم تُفقد فيه البيانات."),
    hero: bi("A backup nobody has restored is a guess. We turn it into two numbers: how much you lose, and how long you wait.", "النسخة الاحتياطية التي لم يستعدها أحد تخمين. نحوّلها إلى رقمين: كم تفقد، وكم تنتظر."),
    seo: {
      title: bi("Backup and Resilience", "النسخ الاحتياطي والمرونة"),
      description: bi("Backup and disaster recovery from CyBarq: recovery objectives, immutable offsite copies, ransomware resilient design and tested restore procedures.", "النسخ الاحتياطي والتعافي من الكوارث من سايبرق: أهداف الاستعادة، ونسخ غير قابلة للتعديل خارج الموقع، وتصميم يقاوم برامج الفدية، واختبار الاستعادة."),
    },
    problem: {
      body: bi(
        "Almost every organisation has backups. Far fewer have restored from them recently, can say how long a full recovery would take, or have checked that the copies sit out of reach of the ransomware that would make them necessary. That gap is normally found on the worst possible day.",
        "كل مؤسسة تقريباً لديها نسخ احتياطية. لكن قلة استعادت منها مؤخراً، أو تعرف كم تستغرق الاستعادة الكاملة، أو تحققت من أن النسخ بعيدة عن متناول برامج الفدية التي ستجعلها ضرورية. وتُكتشف هذه الفجوة عادةً في أسوأ يوم ممكن.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Databases and file stores that have never been restored from end to end. Backups reachable with the same credentials as the systems they protect. Cloud services everyone assumes the provider backs up, deployments that live in one region, and a recovery plan that exists as a document nobody has opened since the day it was written.",
        "قواعد بيانات ومخازن ملفات لم تُستعد يوماً من أولها إلى آخرها. ونسخ احتياطية يمكن الوصول إليها ببيانات الدخول نفسها للأنظمة التي تحميها. وخدمات سحابية يفترض الجميع أن المزوّد يحفظ نسخها، ونشر يعيش في منطقة واحدة، وخطة تعافٍ موجودة كوثيقة لم يفتحها أحد منذ يوم كتابتها.",
      ),
    },
    approach: {
      body: bi(
        "We start with two numbers per system: how much data you can afford to lose, and how long you can be without it. Then we build backups that meet those numbers: copies that cannot be altered, kept offsite or in another region, with credentials separate from production, and covering the cloud services people forget to include. Restores are tested on a schedule, timed and written up. For the systems that cannot wait, we design a failover and then actually run it.",
        "نبدأ برقمين لكل نظام: كم من البيانات تحتمل فقدانه، وكم من الوقت تحتمل غيابه. ثم نبني نسخاً احتياطية تحقق هذين الرقمين: نسخ لا يمكن تعديلها، محفوظة خارج الموقع أو في منطقة أخرى، ببيانات دخول منفصلة عن الإنتاج، وتشمل الخدمات السحابية التي ينسى الناس إدراجها. وتُختبر الاستعادة وفق جدول، ويُقاس زمنها وتُوثَّق. وللأنظمة التي لا تحتمل الانتظار نصمم تحويلاً احتياطياً ثم نجرّبه فعلاً.",
      ),
    },
    engagement: {
      body: bi(
        "A resilience review of one to two weeks maps each system to a recovery objective and lists the gaps. We then close them in priority order. The first full restore test is run together, with a clock on it, and written up whatever the result. You keep a testing calendar and a recovery runbook per critical system, and if you want it we come back and run the test with you periodically.",
        "تربط مراجعة مرونة من أسبوع إلى أسبوعين كل نظام بهدف استعادة، وتُحصي الفجوات. ثم نغلقها بترتيب الأولوية. ويُجرى أول اختبار استعادة كامل معاً، بساعة تقيس الزمن، ويُوثَّق مهما كانت النتيجة. ويبقى لديك تقويم للاختبارات ودليل تعافٍ لكل نظام حرج، وإن أردت عدنا لننفّذ الاختبار معك دورياً.",
      ),
    },
    deliverables: {
      body: bi("A recovery you have watched succeed, with the timings written down.", "استعادة رأيتها تنجح، وأزمنتها مكتوبة."),
      items: [
        bi("Recovery objectives per system and an assessment of the gaps", "أهداف استعادة لكل نظام وتقييم للفجوات"),
        bi("Backups with immutability, separated credentials and offsite copies", "نسخ احتياطية غير قابلة للتعديل، ببيانات دخول منفصلة ونسخ خارج الموقع"),
        bi("Tested restore procedures, recovery runbooks and a testing calendar", "إجراءات استعادة مختبرة وأدلة تعافٍ وتقويم للاختبارات"),
      ],
    },
    businessMeaning: {
      body: bi(
        "A ransomware incident becomes a recovery exercise instead of a negotiation. A failed disk or a bad day at the provider becomes a known number of hours. When the board asks what would happen, leadership can answer with something it has watched work.",
        "يتحول حادث برامج الفدية إلى تمرين استعادة بدل مفاوضة. ويصبح قرص معطّل أو يوم سيئ عند المزوّد عدداً معروفاً من الساعات. وحين يسأل المجلس ماذا سيحدث، تجيب القيادة بشيء رأته يعمل.",
      ),
    },
    related: ["platform-reliability-devops", "digital-forensics-incident-response", "infrastructure-modernisation"],
  },
  {
    slug: "infrastructure-modernisation",
    practice: "technology-infrastructure",
    pictogram: "network",
    title: bi("Infrastructure Modernisation", "تحديث البنية التحتية"),
    summary: bi("Getting off ageing servers, flat networks and unsupported platforms, in stages, without stopping the business.", "الخروج من خوادم متقادمة وشبكات مسطحة ومنصات بلا دعم، على مراحل، من دون توقيف العمل."),
    hero: bi("Old infrastructure rarely fails all at once. It fails a little each month, until the month it stops.", "نادراً ما تفشل البنية التحتية القديمة دفعة واحدة. تفشل قليلاً كل شهر، حتى يأتي الشهر الذي تتوقف فيه."),
    seo: {
      title: bi("Infrastructure Modernisation", "تحديث البنية التحتية"),
      description: bi("Infrastructure modernisation from CyBarq: assessing servers, networks and data centres, migrating to cloud or modern platforms, network redesign.", "تحديث البنية التحتية من سايبرق: تقييم الخوادم والشبكات ومراكز البيانات، والترحيل إلى السحابة أو منصات حديثة، وإعادة تصميم الشبكة."),
    },
    problem: {
      body: bi(
        "Servers past their support date. A flat network where any machine can reach any other. A virtualisation platform nobody has upgraded in years, and a server room that doubles as the store cupboard. The systems still work, which is exactly why the budget goes somewhere else, and every year the migration you will eventually have to do gets bigger and riskier.",
        "خوادم تجاوزت تاريخ انتهاء دعمها. وشبكة مسطحة يصل فيها أي جهاز إلى أي جهاز. ومنصة افتراضية لم يحدّثها أحد منذ سنوات، وغرفة خوادم تعمل مخزناً في الوقت نفسه. ما تزال الأنظمة تعمل، ولهذا بالذات تذهب الميزانية إلى غيرها، ومع كل سنة يكبر الترحيل الذي لا مفر منه ويزداد خطره.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Estates that grew on premises over a decade. Branch networks where every site has different equipment. Operating systems past end of life that can no longer be patched, storage that is both full and unsupported, and an audit or insurance finding that names a date by which something must change.",
        "بيئات محلية تراكمت على مدى عقد. وشبكات فروع لكل موقع فيها معدات مختلفة. وأنظمة تشغيل انتهى عمرها ولم تعد تقبل التحديثات الأمنية، ومخازن ممتلئة وبلا دعم، وملاحظة تدقيق أو تأمين تحدد تاريخاً يجب أن يتغير شيء قبله.",
      ),
    },
    approach: {
      body: bi(
        "We assess the estate honestly: what each system does, what depends on it, what its real risk is, and where it should end up. For some systems that is the cloud, for others a modern platform in your own building, a managed service, or retirement. The network is redesigned in segments, so one compromised laptop cannot reach everything. Migration is ordered by dependency, and every stage leaves behind a state that is supported and documented, even if the programme pauses there.",
        "نقيّم البيئة بصراحة: ماذا يفعل كل نظام، وما الذي يعتمد عليه، وما خطره الحقيقي، وأين يجب أن ينتهي به الأمر. بعض الأنظمة وجهتها السحابة، وبعضها منصة حديثة في مبناك، أو خدمة مُدارة، أو الاستغناء عنها. ونعيد تصميم الشبكة على شكل مقاطع، فلا يصل حاسوب مخترق واحد إلى كل شيء. ويُرتَّب الترحيل حسب التبعيات، وتترك كل مرحلة خلفها وضعاً مدعوماً وموثقاً، حتى لو توقف البرنامج عندها.",
      ),
    },
    engagement: {
      body: bi(
        "The assessment takes a few weeks and produces a roadmap with costs, order of work and the risk of each step. Implementation runs in stages agreed with the business and scheduled around its calendar, each stage with a way back. We work with the IT staff and the vendors you already have, not around them. If it helps, we run the new platform for a period while your team takes it over.",
        "يستغرق التقييم بضعة أسابيع، وينتج خارطة طريق بالتكاليف وترتيب العمل ومخاطر كل خطوة. ويسير التنفيذ على مراحل متفق عليها مع أصحاب العمل ومجدولة حول تقويمهم، ولكل مرحلة طريق رجوع. ونعمل مع موظفي تقنية المعلومات والمورّدين الموجودين لديك، لا من حولهم. وإن كان ذلك مفيداً، شغّلنا المنصة الجديدة فترة ريثما يتسلّمها فريقك.",
      ),
    },
    deliverables: {
      body: bi("An estate that is supported, segmented and written down, reached one stage at a time.", "بيئة مدعومة ومقسّمة وموثّقة، بُلغت مرحلةً بعد مرحلة."),
      items: [
        bi("Infrastructure assessment and a staged modernisation roadmap", "تقييم للبنية التحتية وخارطة طريق تحديث على مراحل"),
        bi("Systems migrated or replaced, and a network redesigned in segments", "أنظمة مرحّلة أو مستبدلة، وشبكة أعيد تصميمها على مقاطع"),
        bi("Documentation, monitoring and a handover to your operations team", "وثائق ومراقبة وتسليم إلى فريق العمليات لديك"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Risk that built up quietly for years comes down inside a programme you control. Security improves at every stage rather than only at the end. Infrastructure stops being the reason a project cannot start this quarter.",
        "تنخفض المخاطر التي تراكمت بهدوء لسنوات ضمن برنامج تتحكم فيه. ويتحسن الأمان في كل مرحلة لا في نهايتها وحدها. وتتوقف البنية التحتية عن كونها سبب تعذّر بدء مشروع هذا الربع.",
      ),
    },
    related: ["cloud-architecture", "legacy-modernisation", "backup-resilience"],
  },
  {
    slug: "technical-architecture-consulting",
    practice: "technology-infrastructure",
    pictogram: "consulting",
    title: bi("Technical Architecture Consulting", "استشارات البنية التقنية"),
    summary: bi("Independent advice on the technical decisions that are expensive to reverse.", "رأي مستقل في القرارات التقنية التي يكلّف التراجع عنها كثيراً."),
    hero: bi("Some choices are made once and lived with for years. Those are the ones worth a second opinion before they are made.", "بعض الخيارات تُتخذ مرة ويُعاش معها سنوات. وهي التي تستحق رأياً ثانياً قبل اتخاذها."),
    seo: {
      title: bi("Technical Architecture Consulting", "استشارات البنية التقنية"),
      description: bi("Independent architecture consulting from CyBarq: technology and vendor selection, architecture reviews, build or buy decisions and due diligence.", "استشارات بنية تقنية مستقلة من سايبرق: اختيار التقنيات والمورّدين، ومراجعات البنية، وقرارات البناء أو الشراء، والعناية الواجبة التقنية."),
    },
    problem: {
      body: bi(
        "Picking a platform, a vendor, a database or an integration approach sets your cost and your risk for years. The choice is usually made under time pressure, on advice from the people selling the options, with nobody in the room whose job is to ask the uncomfortable questions. A wrong choice rarely fails straight away. It becomes the constraint that every project after it has to work around.",
        "اختيار منصة أو مورّد أو قاعدة بيانات أو أسلوب تكامل يحدد تكلفتك ومخاطرك لسنوات. ويُتخذ القرار عادةً تحت ضغط الوقت، بنصيحة ممّن يبيعون الخيارات، ولا أحد في الغرفة مهمته طرح الأسئلة غير المريحة. والخيار الخاطئ نادراً ما يفشل فوراً. بل يصير القيد الذي يلتف حوله كل مشروع بعده.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Choosing a platform or a vendor. Deciding whether to build something or buy it. Reading a supplier's proposal before signing, checking a company or a system you are about to acquire, setting the architecture for a new product, and settling a disagreement between two teams who both have a case.",
        "اختيار منصة أو مورّد. وقرار بناء شيء أو شرائه. وقراءة عرض مورّد قبل التوقيع، وفحص شركة أو نظام على وشك الاستحواذ عليه، ووضع بنية منتج جديد، وحسم خلاف بين فريقين لكلٍّ منهما حجة.",
      ),
    },
    approach: {
      body: bi(
        "We have nothing to sell you, so the advice is about your situation and not our catalogue. Before recommending anything we look at the business constraints, what your team can realistically operate, and what you already run. Options are compared in writing on total cost, risk, security, how hard each is to operate, and what it would cost to leave later. The trade offs are stated plainly, and when we advise against the popular option we explain why.",
        "ليس لدينا ما نبيعه، فالنصيحة عن وضعك لا عن قائمة منتجاتنا. وقبل أي توصية ننظر في قيود العمل، وما يستطيع فريقك تشغيله فعلاً، وما تملكه اليوم. وتُقارن الخيارات كتابةً على أساس التكلفة الإجمالية والمخاطر والأمان وصعوبة التشغيل وكلفة الخروج لاحقاً. وتُذكر المفاضلات بوضوح، وحين ننصح بترك الخيار الرائج نشرح السبب.",
      ),
    },
    engagement: {
      body: bi(
        "The engagement is sized to the decision: a review of a few days, an evaluation of a few weeks, or a retained architect who sits in your design discussions on a regular basis. The output is a written recommendation with the reasoning behind it, so you can argue with it now and reopen it in two years. We are happy to be in the room when it goes to leadership.",
        "يُقاس حجم العمل بحجم القرار: مراجعة من أيام، أو تقييم من أسابيع، أو مهندس بنية محجوز يجلس في نقاشات التصميم بانتظام. والمخرج توصية مكتوبة ومعها أسبابها، فتستطيع مناقشتها اليوم والعودة إليها بعد سنتين. ويسعدنا الحضور حين تُعرض على القيادة.",
      ),
    },
    deliverables: {
      body: bi("A decision you can defend now, and the reasoning to reopen it later.", "قرار تستطيع الدفاع عنه الآن، وأسباب تفتحه بها من جديد لاحقاً."),
      items: [
        bi("A written comparison of the options with costs, risks and trade offs", "مقارنة مكتوبة للخيارات بالتكاليف والمخاطر والمفاضلات"),
        bi("An architecture recommendation or review, with actions in priority order", "توصية أو مراجعة للبنية بإجراءات مرتبة حسب الأولوية"),
        bi("A presentation to leadership, and support during vendor negotiation where useful", "عرض للقيادة، ودعم أثناء التفاوض مع المورّدين عند الحاجة"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Fewer expensive reversals two years in. Better terms from vendors, because you walk into the negotiation knowing what you actually need. Technology choices the organisation can live with for as long as it has to.",
        "تراجعات مكلفة أقل بعد سنتين. وشروط أفضل من المورّدين، لأنك تدخل التفاوض عارفاً ما تحتاجه فعلاً. وخيارات تقنية تستطيع المؤسسة العيش معها المدة المطلوبة كلها.",
      ),
    },
    related: ["performance-platform-architecture", "security-consulting-architecture", "cloud-architecture"],
  },
];
