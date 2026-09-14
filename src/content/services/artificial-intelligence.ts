import { bi, type ServiceContent } from "./registry";

/**
 * Artificial Intelligence practice. CyBarq integrates existing language
 * models into real systems. We do not train foundation models. Every service
 * here is about retrieval over the client's own data, evaluation, guardrails,
 * cost and latency, and clear data boundaries.
 */
export const artificialIntelligenceServices: ServiceContent[] = [
  {
    slug: "ai-solutions",
    practice: "artificial-intelligence",
    pictogram: "ai",
    featured: true,
    title: bi("AI Solutions", "حلول الذكاء الاصطناعي"),
    summary: bi("We take one business problem and build the AI feature that answers it, inside your own systems.", "نأخذ مشكلة عمل واحدة ونبني ميزة الذكاء الاصطناعي التي تعالجها، داخل أنظمتك أنت."),
    hero: bi("We do not train models. We take the ones that already exist and make them useful, safe and measurable inside your organisation.", "نحن لا ندرّب النماذج. نأخذ الموجود منها ونجعله مفيداً وآمناً وقابلاً للقياس داخل مؤسستك."),
    seo: {
      title: bi("AI Solutions", "حلول الذكاء الاصطناعي"),
      description: bi("We scope the use case, integrate existing language models, ground answers in your own data, and measure quality, cost and data boundaries.", "نحدد حالة الاستخدام، وندمج النماذج الموجودة، ونُسند الإجابات إلى بياناتك، ونقيس الجودة والتكلفة وحدود البيانات."),
    },
    problem: {
      body: bi(
        "Most organisations have seen a demo and are unsure what belongs in production. Pilots pile up, few reach real users, and the ones that do are hard to trust: answers vary, costs drift, and nobody can say which data left the building. The models are capable. The missing part is engineering.",
        "رأت معظم المؤسسات عرضاً تجريبياً، ولا تعرف ما الذي يصلح للإنتاج. تتراكم التجارب، وقليل منها يصل إلى المستخدمين، وما يصل يصعب الوثوق به: الإجابات متفاوتة، والتكلفة غير متوقعة، ولا أحد يعرف أي بيانات خرجت من المؤسسة. النماذج قادرة، والناقص هو الهندسة.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Service desks answering the same questions every week. Teams that spend afternoons summarising or classifying documents. Information sitting in files nobody can search, and forms and emails someone has to read and retype. It also shows up as staff pasting company data into public tools, because there is nothing internal to use.",
        "في مكاتب الخدمة التي تجيب عن الأسئلة نفسها كل أسبوع. وفي الفرق التي تقضي ساعات في تلخيص المستندات أو تصنيفها. وفي معلومات حبيسة ملفات لا يبحث فيها أحد، ونماذج ورسائل يقرأها موظف ويعيد كتابتها بيده. ويظهر أيضاً حين يلصق الموظفون بيانات الشركة في أدوات عامة، لأن لا بديل داخلياً.",
      ),
    },
    approach: {
      body: bi(
        "We start from the problem and say honestly whether a language model is the right tool. Often a rule, a search index or a fixed workflow is better, and we say so. When a model does fit, we integrate a commercial or open one through its API, ground the answers in your own data, and put evaluation, guardrails and monitoring around it. The data boundary is written down: what goes to which provider, what is stored, and for how long.",
        "نبدأ من المشكلة، ونقول بصراحة إن كان النموذج اللغوي هو الأداة المناسبة. كثيراً ما تكون قاعدة أو فهرس بحث أو سير عمل ثابت أفضل، ونقول ذلك. وحين يكون النموذج مناسباً، ندمج نموذجاً تجارياً أو مفتوحاً عبر واجهته البرمجية، ونُسند الإجابات إلى بياناتك، ونضع حوله التقييم والضوابط والمراقبة. وحدود البيانات مكتوبة: ما الذي يذهب إلى أي مزوّد، وما الذي يُخزَّن، ولأي مدة.",
      ),
    },
    engagement: {
      body: bi(
        "A short assessment picks one or two use cases with clear value and a success test we both agree on. We build a first version against real data in a few weeks and measure it on an evaluation set your team helps write. Only then do we widen it. Cost and response time are measured from the first week, so nothing surprises you when usage grows.",
        "يختار تقييم قصير حالة استخدام أو اثنتين بقيمة واضحة ومعيار نجاح نتفق عليه. نبني نسخة أولى على بيانات حقيقية خلال أسابيع، ونقيسها على مجموعة تقييم يشارك فريقك في كتابتها. وبعدها فقط نوسّع الاستخدام. وتُقاس التكلفة وزمن الاستجابة من الأسبوع الأول، فلا تفاجئك الأرقام حين يزيد الاستخدام.",
      ),
    },
    deliverables: {
      body: bi("A feature that works, and the evidence that it does.", "ميزة تعمل، والدليل على أنها تعمل."),
      items: [
        bi("A use case assessment with the success test, the data boundaries and a cost estimate", "تقييم لحالة الاستخدام، مع معيار النجاح وحدود البيانات وتقدير التكلفة"),
        bi("The AI feature itself, integrated, with retrieval, guardrails and monitoring", "ميزة الذكاء الاصطناعي نفسها مدمجة، مع الاسترجاع والضوابط والمراقبة"),
        bi("The evaluation set, its results, and an operations guide your team can work from", "مجموعة التقييم ونتائجها، ودليل تشغيل يعمل به فريقك"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Hours back for the people the work was eating. Answers that come from your own information rather than a model's guess. And a capability you can describe to a client or a regulator: what it does, what it can see, and how well it performs.",
        "ساعات تعود إلى من كان العمل يستهلك وقتهم. وإجابات تأتي من معلوماتك أنت، لا من تخمين النموذج. وقدرة تستطيع وصفها لعميل أو جهة رقابية: ماذا تفعل، وماذا ترى، وما مستوى أدائها.",
      ),
    },
    related: ["llm-applications", "rag-knowledge-systems", "ai-automation-workflow-integration"],
  },
  {
    slug: "llm-applications",
    practice: "artificial-intelligence",
    pictogram: "ai",
    title: bi("LLM Applications", "تطبيقات النماذج اللغوية"),
    summary: bi("Applications built on language models and engineered to behave the same way every day.", "تطبيقات مبنية على النماذج اللغوية، مهندسة لتتصرف بالطريقة نفسها كل يوم."),
    hero: bi("A language model is a component, not a product. The product is everything we build around it.", "النموذج اللغوي مكوّن، لا منتج. المنتج هو كل ما نبنيه حوله."),
    seo: {
      title: bi("LLM Application Development", "تطوير تطبيقات النماذج اللغوية"),
      description: bi("Production LLM applications: versioned prompts, structured outputs, evaluation, fallbacks, and control over cost, latency and Arabic quality.", "تطبيقات نماذج لغوية للإنتاج: تعليمات مُدارة الإصدارات، ومخرجات منظمة، وتقييم، وبدائل عند الفشل، وتحكم في التكلفة وزمن الاستجابة وجودة العربية."),
    },
    problem: {
      body: bi(
        "Calling a model API takes an afternoon. Running that call in production takes engineering: outputs have to be structured and checked, failures have to be handled, prompts have to be versioned and tested, and every call carries a cost and a delay that users and finance both notice. Skip that work and the application behaves differently every week.",
        "استدعاء واجهة النموذج يستغرق بعد الظهر. أما تشغيل الاستدعاء نفسه في الإنتاج فيحتاج هندسة: مخرجات منظمة يجري التحقق منها، ومعالجة لحالات الفشل، وتعليمات مُدارة الإصدارات ومختبرة، ولكل استدعاء تكلفة وتأخير يلاحظهما المستخدم والمالية معاً. وإن أُهمل هذا العمل، تصرّف التطبيق بشكل مختلف كل أسبوع.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Drafting and reviewing documents. Summarising long records. Classifying incoming requests and routing them. Pulling structured fields out of free text. Translating between Arabic and English with your own terminology. And chat interfaces sitting over a business function people already use.",
        "في صياغة المستندات ومراجعتها. وتلخيص السجلات الطويلة. وتصنيف الطلبات الواردة وتوجيهها. واستخراج حقول منظمة من نص حر. والترجمة بين العربية والإنجليزية بمصطلحاتك أنت. وفي واجهات المحادثة فوق وظيفة عمل يستخدمها الناس أصلاً.",
      ),
    },
    approach: {
      body: bi(
        "We design the application around what the model does reliably, and guard the places where it does not. Prompts and context are treated as code: versioned, reviewed, and tested against an evaluation set. Outputs are structured and validated before they reach your systems. We pick a model per task on measured quality, cost and latency, and keep the ability to move to another provider. Arabic quality is tested, not assumed.",
        "نصمم التطبيق حول ما يُتقنه النموذج، ونضع حماية حيث لا يُتقن. وتُعامل التعليمات والسياق كشيفرة: إصدارات ومراجعة واختبار على مجموعة تقييم. وتُنظَّم المخرجات ويُتحقق منها قبل أن تصل إلى أنظمتك. ونختار النموذج لكل مهمة بجودة وتكلفة وزمن استجابة مقيسة، مع إبقاء إمكانية الانتقال إلى مزوّد آخر. وجودة العربية تُختبر، لا تُفترض.",
      ),
    },
    engagement: {
      body: bi(
        "We agree the task, the inputs, the expected output and how quality will be judged, then build an evaluation set with the people who know the subject. The first version is built in short cycles and scored against that set every time. Rollout starts with a small group and widens when the numbers say it should. Quality, cost and latency stay monitored after launch.",
        "نتفق على المهمة والمدخلات والمخرجات المتوقعة وكيف تُحكم الجودة، ثم نبني مجموعة تقييم مع من يعرفون المجال. تُبنى النسخة الأولى في دورات قصيرة وتُقاس على تلك المجموعة في كل دورة. ويبدأ الإطلاق بمجموعة صغيرة ويتسع حين تقول الأرقام ذلك. وتبقى الجودة والتكلفة وزمن الاستجابة تحت المراقبة بعد الإطلاق.",
      ),
    },
    deliverables: {
      body: bi("An application your users can rely on, and the numbers that say why.", "تطبيق يعتمد عليه مستخدموك، والأرقام التي تشرح السبب."),
      items: [
        bi("The application in production, with structured outputs, validation and fallbacks", "التطبيق في الإنتاج، بمخرجات منظمة وتحقق وبدائل عند الفشل"),
        bi("Versioned prompts, the evaluation set, and quality reports over time", "تعليمات مُدارة الإصدارات، ومجموعة التقييم، وتقارير جودة على مدى الوقت"),
        bi("A cost and latency dashboard, and a written plan for switching provider", "لوحة للتكلفة وزمن الاستجابة، وخطة مكتوبة لتبديل المزوّد"),
      ],
    },
    businessMeaning: {
      body: bi(
        "A capability that behaves on Monday the way it behaved on Friday, with a monthly cost you can forecast and a quality level you can put in writing.",
        "قدرة تتصرف يوم الاثنين كما تصرفت يوم الجمعة، بتكلفة شهرية يمكنك توقعها، ومستوى جودة يمكنك كتابته في وثيقة.",
      ),
    },
    related: ["ai-solutions", "ai-api-model-integration", "ai-customer-experiences"],
  },
  {
    slug: "ai-agents",
    practice: "artificial-intelligence",
    pictogram: "automation",
    title: bi("AI Agents", "وكلاء الذكاء الاصطناعي"),
    summary: bi("Agents that finish a defined, multi step task using your tools, inside limits you set.", "وكلاء ينهون مهمة محددة متعددة الخطوات باستخدام أدواتك، ضمن حدود تضعها أنت."),
    hero: bi("An agent should do a job, not have a personality. Each one we build has a clear task, a small set of tools, and limits it cannot cross.", "الوكيل يؤدي مهمة، ولا حاجة له بشخصية. لكل وكيل نبنيه مهمة واضحة، وأدوات قليلة، وحدود لا يتجاوزها."),
    seo: {
      title: bi("AI Agents", "وكلاء الذكاء الاصطناعي"),
      description: bi("Task focused AI agents that use your systems through controlled tools, with scoped permissions, human approval steps, audit logs and evaluation.", "وكلاء ذكاء اصطناعي لمهام محددة يستخدمون أنظمتك عبر أدوات محكومة، بصلاحيات مقيّدة وخطوات موافقة بشرية وسجلات تدقيق وتقييم."),
    },
    problem: {
      body: bi(
        "Plenty of work is not one question but a sequence: look something up, check a rule, update a record, tell someone. Language models can now plan and run sequences like that, which is useful and also risky. An agent with wide access and thin supervision can make the wrong move quickly, and then repeat it.",
        "كثير من العمل ليس سؤالاً واحداً بل سلسلة: تبحث عن معلومة، وتتحقق من قاعدة، وتحدّث سجلاً، وتُبلغ شخصاً. صارت النماذج اللغوية قادرة على تخطيط هذه السلاسل وتنفيذها، وهذا مفيد وخطر معاً. فالوكيل الواسع الصلاحيات قليل الإشراف قد يخطئ بسرعة، ثم يكرر خطأه.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Triaging support tickets that need data from three systems. Building a report that pulls from several sources. Handling routine requests such as scheduling or a status check. Running data quality checks across systems. In general: procedures everyone knows, with too many steps to write as simple rules.",
        "في فرز تذاكر الدعم التي تحتاج بيانات من ثلاثة أنظمة. وفي إعداد تقرير يجمع من مصادر عدة. وفي الطلبات الروتينية مثل الجدولة أو الاستعلام عن حالة. وفي فحوصات جودة البيانات بين الأنظمة. وعموماً: إجراءات معروفة للجميع، لكن خطواتها أكثر من أن تُكتب كقواعد بسيطة.",
      ),
    },
    approach: {
      body: bi(
        "Each agent gets one narrow task, a small set of tools we build ourselves, and permissions that match the task and nothing beyond it. Anything with consequences waits for a person to approve it, until the record shows that step can be relaxed. Every action is logged. We test agents on real scenarios before rollout and keep measuring after. Where a fixed workflow would do the same job, we build that instead.",
        "يحصل كل وكيل على مهمة ضيقة، وأدوات قليلة نبنيها بأنفسنا، وصلاحيات بقدر المهمة لا أكثر. وكل إجراء له عواقب ينتظر موافقة شخص، إلى أن يثبت السجل أن هذه الخطوة يمكن تخفيفها. ويُسجَّل كل إجراء. ونختبر الوكلاء على سيناريوهات حقيقية قبل الإطلاق ونواصل القياس بعده. وحيث يكفي سير عمل ثابت، نبنيه بدل الوكيل.",
      ),
    },
    engagement: {
      body: bi(
        "We pick a task with a known procedure and a result that can be measured, then agree the tools and the permissions with the people who own those systems. The agent is built with a test set of realistic cases. It runs first in a mode where it proposes and a person approves. As the accuracy holds, approval is dropped for the low risk actions. Reporting on what it did, and where it asked for help, comes with the delivery.",
        "نختار مهمة بإجراء معروف ونتيجة قابلة للقياس، ثم نتفق على الأدوات والصلاحيات مع أصحاب الأنظمة. ويُبنى الوكيل مع مجموعة اختبار من حالات واقعية. ويعمل أولاً في وضع يقترح فيه ويوافق شخص. ومع ثبات الدقة، تُرفع الموافقة عن الإجراءات قليلة المخاطر. ويأتي مع التسليم تقرير عمّا فعله الوكيل وأين طلب المساعدة.",
      ),
    },
    deliverables: {
      body: bi("An agent you can supervise, and a record of everything it did.", "وكيل تستطيع الإشراف عليه، وسجل بكل ما فعله."),
      items: [
        bi("An agent with a defined task, tools we control, and scoped permissions", "وكيل بمهمة محددة، وأدوات نتحكم فيها، وصلاحيات مقيّدة"),
        bi("The approval step, the audit log, and the evaluation harness", "خطوة الموافقة، وسجل التدقيق، وبيئة التقييم"),
        bi("Operational reporting on actions taken, accuracy and cost", "تقارير تشغيلية عن الإجراءات المنفذة والدقة والتكلفة"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Work that used to sit in a queue waiting for a person now finishes in minutes, inside your rules, with a full record. Your team supervises the outcome instead of typing every step.",
        "عمل كان ينتظر في الطابور شخصاً يُنجَز الآن في دقائق، ضمن قواعدك، وبسجل كامل. ويشرف فريقك على النتيجة بدل تنفيذ كل خطوة بيده.",
      ),
    },
    related: ["ai-automation-workflow-integration", "enterprise-ai-assistants", "ai-internal-tools"],
  },
  {
    slug: "enterprise-ai-assistants",
    practice: "artificial-intelligence",
    pictogram: "support",
    featured: true,
    title: bi("Enterprise AI Assistants", "المساعدون المؤسسيون بالذكاء الاصطناعي"),
    summary: bi("An assistant for your staff that answers from your own documents, policies and systems, and respects who may see what.", "مساعد لموظفيك يجيب من وثائقك وسياساتك وأنظمتك، ويحترم من يحق له رؤية ماذا."),
    hero: bi("An assistant that knows your policies, your procedures and your data, and shows each person only what they were already allowed to open.", "مساعد يعرف سياساتك وإجراءاتك وبياناتك، ولا يُظهر لكل شخص إلا ما كان يستطيع فتحه أصلاً."),
    seo: {
      title: bi("Enterprise AI Assistants", "المساعدون المؤسسيون بالذكاء الاصطناعي"),
      description: bi("Internal AI assistants grounded in your documents and systems: permission aware retrieval, source citations, Arabic and English, no training on your data.", "مساعدون داخليون مبنيون على وثائقك وأنظمتك: استرجاع يراعي الصلاحيات، واستشهاد بالمصادر، ودعم العربية والإنجليزية، ولا تدريب على بياناتك."),
    },
    problem: {
      body: bi(
        "Staff lose a surprising share of the day looking for things that already exist: a policy, a procedure, the status of a request, the right template. Public AI tools cannot see any of it, and pasting it in is a data leak. An internal assistant only helps if it respects who may see what, and if every answer can be checked against its source.",
        "يضيع من يوم الموظف وقت كثير في البحث عن أشياء موجودة أصلاً: سياسة، أو إجراء، أو حالة طلب، أو النموذج الصحيح. والأدوات العامة لا ترى شيئاً من ذلك، ولصق المحتوى فيها تسريب. والمساعد الداخلي لا ينفع إلا إذا احترم من يحق له رؤية ماذا، وإلا إذا أمكن التحقق من كل إجابة بالرجوع إلى مصدرها.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Questions about HR and policy. The IT help desk. New employees in their first month. Sales looking for the current version of a proposal. Operations checking a procedure. A manager who needs the gist of a long document before a meeting. Any organisation past a few hundred documents has this.",
        "في أسئلة الموارد البشرية والسياسات. وفي مكتب مساعدة تقنية المعلومات. وفي الموظف الجديد في شهره الأول. وفي المبيعات التي تبحث عن النسخة الحالية من عرض. وفي العمليات التي تتحقق من إجراء. وفي مدير يريد خلاصة مستند طويل قبل اجتماع. وكل مؤسسة تجاوزت بضع مئات من المستندات تعرف هذا.",
      ),
    },
    approach: {
      body: bi(
        "The assistant answers from your content through retrieval, and it cites the source so the answer can be checked. Retrieval runs behind your existing permissions: a person gets answers only from documents they could open themselves. Your data is not used to train any model. Arabic and English are treated equally, including documents that mix the two. Answer quality is measured by your own reviewers, before launch and after.",
        "يجيب المساعد من محتواك عبر الاسترجاع، ويذكر المصدر ليمكن التحقق من الإجابة. ويجري الاسترجاع خلف صلاحياتك القائمة: لا يصل الشخص إلا إلى إجابات من مستندات يستطيع فتحها بنفسه. ولا تُستخدم بياناتك لتدريب أي نموذج. وتُعامل العربية والإنجليزية بالقدر نفسه، بما فيها المستندات التي تخلط بينهما. وتُقاس جودة الإجابات بمراجعين من عندك، قبل الإطلاق وبعده.",
      ),
    },
    engagement: {
      body: bi(
        "We connect one or two sources first, a document library and a policy repository for example, and put the assistant in front of a pilot group. Their questions and ratings shape the next version. Sources are added one at a time, and each one has its permission model checked before it goes live. It can live inside a tool people already use, a chat platform or the intranet, or stand on its own.",
        "نربط مصدراً أو اثنين في البداية، مكتبة مستندات ومستودع سياسات مثلاً، ونضع المساعد بين يدي مجموعة تجريبية. أسئلتهم وتقييماتهم تصنع النسخة التالية. وتُضاف المصادر واحداً بعد آخر، ويُفحص نموذج الصلاحيات لكل مصدر قبل تشغيله. ويمكن أن يعيش المساعد داخل أداة يستخدمها الناس أصلاً، منصة محادثة أو الشبكة الداخلية، أو أن يعمل وحده.",
      ),
    },
    deliverables: {
      body: bi("An assistant that knows your organisation and keeps its secrets.", "مساعد يعرف مؤسستك ويحفظ أسرارها."),
      items: [
        bi("The assistant, with permission aware retrieval and a citation on every answer", "المساعد، باسترجاع يراعي الصلاحيات واستشهاد بالمصدر في كل إجابة"),
        bi("Connectors to your document and business systems, added one source at a time", "موصلات إلى أنظمة المستندات والأعمال لديك، تُضاف مصدراً بعد مصدر"),
        bi("Quality measurements, usage reporting, and a written statement of how data is handled", "قياسات الجودة، وتقارير الاستخدام، وبيان مكتوب لكيفية التعامل مع البيانات"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Faster answers for everyone, and fewer interruptions for the few people who used to be the answer. And a safe place for company information, so nobody has to reach for a public tool.",
        "إجابات أسرع للجميع، ومقاطعات أقل لمن كانوا هم الإجابة. ومكان آمن لمعلومات الشركة، فلا يضطر أحد إلى أداة عامة.",
      ),
    },
    related: ["rag-knowledge-systems", "ai-internal-tools", "identity-access-architecture"],
  },
  {
    slug: "rag-knowledge-systems",
    practice: "artificial-intelligence",
    pictogram: "database",
    title: bi("RAG & Knowledge Systems", "أنظمة الاسترجاع المعزز والمعرفة"),
    summary: bi("Retrieval pipelines that let a model answer from your documents and data, with a source behind every answer.", "خطوط استرجاع تتيح للنموذج أن يجيب من مستنداتك وبياناتك، مع مصدر خلف كل إجابة."),
    hero: bi("The model supplies the language. Your documents supply the facts. Retrieval is the engineering between them.", "النموذج يعطي اللغة، ومستنداتك تعطي الحقائق، والاسترجاع هو الهندسة بينهما."),
    seo: {
      title: bi("RAG and Knowledge Systems", "أنظمة الاسترجاع المعزز والمعرفة"),
      description: bi("Retrieval augmented generation: document ingestion, chunking, embeddings, hybrid search, permission filtering, citations and measured answer accuracy.", "توليد معزز بالاسترجاع: استيعاب المستندات، والتقطيع، والتضمينات، والبحث الهجين، وتصفية الصلاحيات، والاستشهاد بالمصادر، وقياس دقة الإجابات."),
    },
    problem: {
      body: bi(
        "A model on its own does not know your contracts, your procedures or last month's report, and if you ask anyway it will write something that reads well. Retrieval fixes that by handing the model the right passages at the right moment. Whether it works depends entirely on how documents are read, split, indexed, filtered and ranked. Most disappointing assistants have a retrieval problem, not a model problem.",
        "النموذج وحده لا يعرف عقودك ولا إجراءاتك ولا تقرير الشهر الماضي، وإن سألته فسيكتب نصاً يبدو سليماً. والاسترجاع يعالج ذلك بأن يضع بين يدي النموذج المقاطع الصحيحة في اللحظة الصحيحة. ونجاحه يعتمد كله على كيفية قراءة المستندات وتقسيمها وفهرستها وتصفيتها وترتيبها. ومعظم المساعدين المخيّبين مشكلتهم في الاسترجاع لا في النموذج.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Policy and procedure libraries. Contract repositories. Technical documentation, regulatory texts, case histories, product manuals. Any archive that mixes PDFs, scans, spreadsheets and email. Arabic text, scanned pages and tables are where off the shelf tools fail first.",
        "في مكتبات السياسات والإجراءات. وفي مستودعات العقود. وفي الوثائق التقنية والنصوص التنظيمية وسجلات الحالات وأدلة المنتجات. وفي أي أرشيف يخلط ملفات PDF والمستندات الممسوحة وجداول البيانات والبريد. والنص العربي والصفحات الممسوحة والجداول هي أول ما تتعثر فيه الأدوات الجاهزة.",
      ),
    },
    approach: {
      body: bi(
        "We build the pipeline on purpose, piece by piece: extraction that handles Arabic, scans and tables; splitting that follows the structure of the document; embeddings chosen for your languages; hybrid search that uses meaning and keywords together; and a filter that applies permissions before anything reaches the model. Every answer carries its citation. We score retrieval separately from the answer, so a problem can be located instead of guessed at.",
        "نبني خط المعالجة بقصد، قطعة قطعة: استخراج يتعامل مع العربية والمستندات الممسوحة والجداول؛ وتقسيم يتبع بنية المستند؛ وتضمينات مختارة للغاتك؛ وبحث هجين يستخدم المعنى والكلمات المفتاحية معاً؛ وتصفية تطبّق الصلاحيات قبل أن يصل شيء إلى النموذج. وتحمل كل إجابة مصدرها. ونقيس الاسترجاع بمعزل عن الإجابة، ليُحدَّد موضع الخلل بدل تخمينه.",
      ),
    },
    engagement: {
      body: bi(
        "We start with a representative sample of your documents and a list of real questions whose right answers are already known. The pipeline is built and tuned against that list until retrieval reaches the target you agreed. Then we connect the full sources, set up incremental updates so a new document appears within minutes, and hand over the monitoring that shows when quality starts to slip.",
        "نبدأ بعيّنة تمثل مستنداتك، وقائمة أسئلة حقيقية إجاباتها الصحيحة معروفة سلفاً. ويُبنى خط المعالجة ويُضبط على تلك القائمة حتى يبلغ الاسترجاع الهدف المتفق عليه. ثم نربط المصادر كاملة، ونُعدّ تحديثاً تدريجياً يُظهر المستند الجديد خلال دقائق، ونسلّم المراقبة التي تكشف متى تبدأ الجودة بالتراجع.",
      ),
    },
    deliverables: {
      body: bi("A retrieval system that can be measured, tuned and trusted.", "نظام استرجاع يمكن قياسه وضبطه والوثوق به."),
      items: [
        bi("An ingestion pipeline for your document types and your languages", "خط استيعاب لأنواع مستنداتك وللغاتك"),
        bi("A search index with hybrid retrieval and permission filtering", "فهرس بحث باسترجاع هجين وتصفية للصلاحيات"),
        bi("The evaluation set, accuracy reports, and monitoring for drift", "مجموعة التقييم، وتقارير الدقة، ومراقبة لتراجع الجودة"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Answers you can trace back to a document, knowledge that stays inside your own boundary, and a base that every assistant or agent you build later can stand on.",
        "إجابات يمكن تتبعها إلى مستند، ومعرفة تبقى داخل حدودك، وأساس يقف عليه كل مساعد أو وكيل تبنيه لاحقاً.",
      ),
    },
    related: ["enterprise-ai-assistants", "ai-solutions", "apis-integrations"],
  },
  {
    slug: "ai-automation-workflow-integration",
    practice: "artificial-intelligence",
    pictogram: "automation",
    title: bi("AI Automation & Workflow Integration", "الأتمتة بالذكاء الاصطناعي وتكامل سير العمل"),
    summary: bi("A model placed inside an existing workflow to take out the manual steps, with a person kept where judgement matters.", "نموذج يوضع داخل سير عمل قائم ليزيل الخطوات اليدوية، مع بقاء إنسان حيث يلزم التقدير."),
    hero: bi("Good automation is quiet: a step that used to need a person now happens on its own, and someone still checks the cases that matter.", "الأتمتة الجيدة هادئة: خطوة كانت تحتاج شخصاً تجري الآن وحدها، ويبقى من يراجع الحالات التي تستحق."),
    seo: {
      title: bi("AI Automation and Workflow Integration", "الأتمتة بالذكاء الاصطناعي وتكامل سير العمل"),
      description: bi("AI steps inside your existing workflows: classification, extraction, drafting and routing, with confidence thresholds, human review and full audit trails.", "خطوات ذكاء اصطناعي داخل سير عملك القائم: تصنيف واستخراج وصياغة وتوجيه، بعتبات ثقة ومراجعة بشرية وسجلات تدقيق كاملة."),
    },
    problem: {
      body: bi(
        "Most workflows have two or three steps that rules could never handle, because they need reading and judgement: classifying a request, pulling fields off a scanned form, drafting a standard reply, deciding where a document belongs. Those are the steps where the queue forms. They are also where people spend hours on work that matters and holds nobody's interest.",
        "في معظم مسارات العمل خطوتان أو ثلاث لا تصلح لها القواعد، لأنها تحتاج قراءة وتقديراً: تصنيف طلب، أو سحب حقول من نموذج ممسوح، أو صياغة رد قياسي، أو تحديد مكان مستند. عند هذه الخطوات يتشكل الطابور. وفيها يقضي الناس ساعات على عمل مهم لا يثير اهتمام أحد.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Invoice and form processing. Routing email and tickets. Classifying and filing documents. First drafts of standard correspondence. Data entry out of unstructured sources. And quality checks that used to be done on a sample, because nobody could review everything.",
        "في معالجة الفواتير والنماذج. وتوجيه البريد والتذاكر. وتصنيف المستندات وأرشفتها. والمسودات الأولى للمراسلات القياسية. وإدخال البيانات من مصادر غير منظمة. وفحوصات الجودة التي كانت تجري على عيّنة، لأن أحداً لا يستطيع مراجعة كل شيء.",
      ),
    },
    approach: {
      body: bi(
        "We add the model as one step in the workflow, not as a replacement for it. Each automated step returns a result and a confidence score. Results above the threshold carry on; the rest go to a person. Everything is logged, so decisions can be reviewed and thresholds moved on evidence rather than opinion. We integrate through your workflow system, queue or API, and the deterministic parts stay deterministic.",
        "نضيف النموذج كخطوة واحدة في سير العمل، لا بديلاً عنه. وتُعيد كل خطوة مؤتمتة نتيجة ودرجة ثقة. فما تجاوز العتبة يمضي، وما دونها يذهب إلى شخص. ويُسجَّل كل شيء، فتُراجع القرارات وتُعدَّل العتبات بالأدلة لا بالانطباع. ويجري التكامل عبر نظام سير العمل أو قائمة الانتظار أو واجهة البرمجة لديك، وتبقى الأجزاء الحتمية حتمية.",
      ),
    },
    engagement: {
      body: bi(
        "We map the workflow, find the steps where judgement is the bottleneck, and measure how much volume and time they take today. The automation then runs in shadow mode, producing results your team compares with their own. Once the accuracy is established it takes the confident cases. Every month you get the volume handled, the accuracy and the time saved.",
        "نرسم سير العمل، ونحدد الخطوات التي يكون فيها التقدير البشري عنق الزجاجة، ونقيس حجمها ووقتها اليوم. ثم تعمل الأتمتة في وضع الظل، فتنتج نتائج يقارنها فريقك بنتائجه. وحين تثبت الدقة، تتولى الحالات عالية الثقة. وتصلك كل شهر أرقام الحجم المعالج والدقة والوقت الموفَّر.",
      ),
    },
    deliverables: {
      body: bi("Fewer manual steps, and a record of every automated one.", "خطوات يدوية أقل، وسجل لكل خطوة مؤتمتة."),
      items: [
        bi("Automated steps with confidence thresholds and a human review path", "خطوات مؤتمتة بعتبات ثقة ومسار مراجعة بشرية"),
        bi("Integration with your workflow system, queue or business applications", "تكامل مع نظام سير العمل أو قائمة الانتظار أو تطبيقات الأعمال لديك"),
        bi("An audit log, accuracy monitoring and a monthly report", "سجل تدقيق، ومراقبة للدقة، وتقرير شهري"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Queues that clear the same day. People free for the cases that need them. And decisions that come out the same way whoever is on shift.",
        "طوابير تُصفّى في يومها. وأشخاص يتفرغون للحالات التي تحتاجهم. وقرارات تخرج بالشكل نفسه أياً كان من في المناوبة.",
      ),
    },
    related: ["ai-agents", "workflow-systems-digital-portals", "ai-api-model-integration"],
  },
  {
    slug: "ai-api-model-integration",
    practice: "artificial-intelligence",
    pictogram: "integration",
    title: bi("AI API & Model Integration", "دمج واجهات ونماذج الذكاء الاصطناعي"),
    summary: bi("One controlled layer between your applications and every model you use, commercial or self hosted.", "طبقة واحدة محكومة بين تطبيقاتك وكل نموذج تستخدمه، تجارياً كان أو مستضافاً عندك."),
    hero: bi("Model providers change their prices, their limits and their behaviour. Your applications should not have to notice.", "مزوّدو النماذج يغيّرون الأسعار والحدود والسلوك. ولا ينبغي أن تنتبه تطبيقاتك لذلك."),
    seo: {
      title: bi("AI API and Model Integration", "دمج واجهات ونماذج الذكاء الاصطناعي"),
      description: bi("A gateway between your applications and AI models: credentials, routing, caching, rate limits, cost tracking, logging and provider independence.", "بوابة بين تطبيقاتك ونماذج الذكاء الاصطناعي: مفاتيح وتوجيه وتخزين مؤقت وحدود معدل وتتبع للتكلفة وسجلات واستقلال عن المزوّد."),
    },
    problem: {
      body: bi(
        "When every application calls a provider directly, keys end up scattered through the code, nobody can see the total spend, logging is inconsistent, and the organisation is tied to one vendor's prices and uptime. Describing how data is handled becomes impossible, because no one can say which application sends what, and to whom.",
        "حين يستدعي كل تطبيق المزوّد مباشرة، تتناثر المفاتيح في الشيفرة، ولا أحد يرى الإنفاق الكلي، والسجلات غير متسقة، وترتبط المؤسسة بأسعار مزوّد واحد وبتوفره. ويصبح وصف التعامل مع البيانات مستحيلاً، لأن لا أحد يعرف أي تطبيق يرسل ماذا وإلى من.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Organisations with several AI features built by different teams. Products that need to offer a choice of model. Regulated environments where some data must stay on a self hosted model. And the finance team asking why the AI bill doubled this quarter.",
        "في المؤسسات التي لديها عدة ميزات ذكاء اصطناعي بنتها فرق مختلفة. وفي المنتجات التي تعرض خياراً بين النماذج. وفي البيئات الخاضعة للتنظيم حيث يجب أن تبقى بعض البيانات على نموذج مستضاف عندك. وعند فريق المالية الذي يسأل لماذا تضاعفت فاتورة الذكاء الاصطناعي هذا الربع.",
      ),
    },
    approach: {
      body: bi(
        "We put one gateway between your applications and the models. It holds the credentials, enforces which class of data may go to which provider, routes each request to the right model, caches where caching is safe, applies rate limits and budgets, and logs every call with its cost and latency. Self hosted open models sit behind the same interface, for data that must not leave your environment. Changing provider becomes a configuration change.",
        "نضع بوابة واحدة بين تطبيقاتك والنماذج. تحفظ المفاتيح، وتفرض أي فئة بيانات تذهب إلى أي مزوّد، وتوجّه كل طلب إلى النموذج المناسب، وتخزّن مؤقتاً حيث يكون ذلك آمناً، وتطبّق حدود المعدل والميزانيات، وتسجّل كل استدعاء بتكلفته وزمنه. وتقف النماذج المفتوحة المستضافة عندك خلف الواجهة نفسها، للبيانات التي يجب ألا تغادر بيئتك. ويصير تبديل المزوّد تعديلاً في الإعدادات.",
      ),
    },
    engagement: {
      body: bi(
        "We list the AI integrations and data flows you already have, agree the data classification and the routing rules that follow from it, and deploy the gateway inside your environment. Applications move over one at a time. Where self hosting is required, our infrastructure team sizes and deploys the model servers. Spend and usage dashboards are part of the handover.",
        "نجرد تكاملات الذكاء الاصطناعي وتدفقات البيانات الموجودة عندك، ونتفق على تصنيف البيانات وقواعد التوجيه المترتبة عليه، وننشر البوابة داخل بيئتك. وتنتقل التطبيقات واحداً بعد آخر. وحيث تلزم الاستضافة الذاتية، يحدد فريق البنية التحتية لدينا حجم خوادم النماذج وينشرها. ولوحات الإنفاق والاستخدام جزء من التسليم.",
      ),
    },
    deliverables: {
      body: bi("One controlled door to every model you use.", "باب واحد محكوم إلى كل نموذج تستخدمه."),
      items: [
        bi("The gateway: authentication, routing, caching, limits and logging", "البوابة: مصادقة وتوجيه وتخزين مؤقت وحدود وسجلات"),
        bi("A data classification and routing policy, enforced in the gateway itself", "سياسة لتصنيف البيانات والتوجيه، مفروضة داخل البوابة نفسها"),
        bi("Spend and usage dashboards, and self hosted model deployment where it is needed", "لوحات للإنفاق والاستخدام، ونشر نماذج مستضافة عندك حيث يلزم"),
      ],
    },
    businessMeaning: {
      body: bi(
        "One answer to what the organisation spends on AI and where its data goes. Room to survive a provider's outage or price change. And a shorter path to the next AI feature, because the plumbing is already there.",
        "إجابة واحدة عمّا تنفقه المؤسسة على الذكاء الاصطناعي وأين تذهب بياناتها. ومتسع للنجاة من انقطاع مزوّد أو تغيّر أسعاره. وطريق أقصر إلى الميزة التالية، لأن البنية الأساسية جاهزة.",
      ),
    },
    related: ["llm-applications", "apis-integrations", "cloud-architecture"],
  },
  {
    slug: "ai-internal-tools",
    practice: "artificial-intelligence",
    pictogram: "platform",
    title: bi("AI Internal Tools", "أدوات داخلية بالذكاء الاصطناعي"),
    summary: bi("Small, focused tools that give one team one AI capability inside the work it already does.", "أدوات صغيرة مركزة تمنح فريقاً واحداً قدرة ذكاء اصطناعي واحدة داخل عمله القائم."),
    hero: bi("Not every AI need is a platform. Often a team needs one tool that does one thing well.", "ليست كل حاجة إلى الذكاء الاصطناعي منصة. كثيراً ما يحتاج فريق أداة واحدة تؤدي عملاً واحداً جيداً."),
    seo: {
      title: bi("AI Internal Tools", "أدوات داخلية بالذكاء الاصطناعي"),
      description: bi("Focused internal AI tools for a single team: document review, drafting, extraction and analysis, built in weeks on a governed foundation.", "أدوات ذكاء اصطناعي داخلية مركزة لفريق واحد: مراجعة مستندات وصياغة واستخراج وتحليل، تُبنى خلال أسابيع على أساس محكوم."),
    },
    problem: {
      body: bi(
        "Teams find their own uses for language models quickly, usually on personal accounts, with company data, and with no oversight. What they are offered instead is often a large platform project arriving next year. What they actually need is a small, approved tool for the task in front of them this week.",
        "تجد الفرق استخداماتها للنماذج اللغوية بسرعة، غالباً على حسابات شخصية، ببيانات الشركة، ومن دون رقابة. وما يُعرض عليها بدلاً من ذلك مشروع منصة كبير يصل العام المقبل. وما تحتاجه فعلاً أداة صغيرة معتمدة للمهمة التي أمامها هذا الأسبوع.",
      ),
    },
    whereItAppears: {
      body: bi(
        "A legal team checking contracts against a checklist. Finance reconciling documents. HR screening applications against stated criteria. Marketing producing bilingual drafts in the house style. An analyst summarising research. A security team sorting alerts.",
        "في فريق قانوني يفحص العقود وفق قائمة تحقق. وفي المالية التي تطابق المستندات. وفي الموارد البشرية التي تفرز الطلبات وفق معايير معلنة. وفي التسويق الذي ينتج مسودات بلغتين بأسلوب الشركة. وفي محلل يلخص أبحاثاً. وفي فريق أمني يرتب التنبيهات.",
      ),
    },
    approach: {
      body: bi(
        "Each tool stays small and specific, and sits on the same governed foundation: the model gateway, the data rules, the logging. The interface follows the team's real workflow, often as one step inside software they already open every day. Prompts are written with the team's own experts and tested on their own examples. Because the foundation is shared, the second tool takes less time than the first.",
        "تبقى كل أداة صغيرة ومحددة، وتقف على الأساس المحكوم نفسه: بوابة النماذج، وقواعد البيانات، والسجلات. وتتبع الواجهة سير العمل الفعلي للفريق، وغالباً كخطوة داخل برنامج يفتحه كل يوم. وتُكتب التعليمات مع خبراء الفريق وتُختبر على أمثلتهم. ولأن الأساس مشترك، تأخذ الأداة الثانية وقتاً أقل من الأولى.",
      ),
    },
    engagement: {
      body: bi(
        "A tool starts with a half day session with the team: the task, the inputs, and what a good result looks like. A first version is usually ready to try in two to three weeks. They use it, we adjust, and we agree together when it is finished. Every tool is listed in a catalogue, so the organisation knows what exists and who owns it.",
        "تبدأ الأداة بجلسة نصف يوم مع الفريق: المهمة، والمدخلات، وشكل النتيجة الجيدة. وتكون النسخة الأولى جاهزة للتجربة عادةً خلال أسبوعين إلى ثلاثة. يستخدمونها، ونعدّل، ونتفق معاً متى تنتهي. وتُدرج كل أداة في فهرس، لتعرف المؤسسة ما الموجود ومن يملكه.",
      ),
    },
    deliverables: {
      body: bi("A tool the team actually uses, on a foundation the organisation controls.", "أداة يستخدمها الفريق فعلاً، على أساس تتحكم فيه المؤسسة."),
      items: [
        bi("The tool itself, with prompts tested on the team's own examples", "الأداة نفسها، بتعليمات مختبرة على أمثلة الفريق"),
        bi("Integration with the gateway, the logging and the data rules", "تكامل مع البوابة والسجلات وقواعد البيانات"),
        bi("A short user guide, and an entry in your AI tool catalogue", "دليل مستخدم قصير، وإدخال في فهرس أدوات الذكاء الاصطناعي لديك"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Teams get the capability they were going to find one way or another, but inside your boundary, under your data rules, and in weeks rather than quarters.",
        "تحصل الفرق على القدرة التي كانت ستصل إليها بطريقة أو بأخرى، لكن داخل حدودك، وتحت قواعد بياناتك، وخلال أسابيع لا أرباع سنة.",
      ),
    },
    related: ["ai-api-model-integration", "custom-business-software", "enterprise-ai-assistants"],
  },
  {
    slug: "ai-customer-experiences",
    practice: "artificial-intelligence",
    pictogram: "web",
    title: bi("AI Customer Experiences", "تجارب العملاء بالذكاء الاصطناعي"),
    summary: bi("Assistants and features you can put in front of customers: accurate, on brand, bilingual, and tested before launch.", "مساعدون وميزات تصلح للعرض أمام العملاء: دقيقة، وبأسلوب علامتك، وبلغتين، ومختبرة قبل الإطلاق."),
    hero: bi("Anything you put in front of customers speaks for you. We build AI experiences that can be trusted with that.", "كل ما تضعه أمام عملائك يتحدث باسمك. نبني تجارب ذكاء اصطناعي تصلح لهذه المهمة."),
    seo: {
      title: bi("AI Customer Experiences", "تجارب العملاء بالذكاء الاصطناعي"),
      description: bi("Customer facing AI grounded in your knowledge base and account data, with guardrails, escalation to a person, and Arabic and English support.", "ذكاء اصطناعي موجه للعملاء مبني على قاعدة معرفتك وبيانات الحسابات، مع ضوابط وتصعيد إلى موظف ودعم العربية والإنجليزية."),
    },
    problem: {
      body: bi(
        "Customer facing AI carries the highest stakes. A wrong answer about a price, a policy or a delivery date is a complaint on a good day and a liability on a bad one. Generic chatbots annoy customers because they know nothing about your business, and unrestricted ones embarrass it because they will say anything. Arabic speaking customers usually get the worst of both.",
        "الذكاء الاصطناعي الموجه للعملاء أعلى المخاطر. فإجابة خاطئة عن سعر أو سياسة أو موعد تسليم شكوى في أحسن الأحوال، ومسؤولية قانونية في أسوئها. وروبوتات المحادثة العامة تُضجر العملاء لأنها لا تعرف شيئاً عن عملك، وغير المقيدة منها تُحرجه لأنها تقول أي شيء. والعميل الناطق بالعربية ينال عادةً أسوأ ما في الاثنين.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Support on your website and messaging channels. Self service for orders and accounts. Product guidance and recommendations. Onboarding flows for new customers. And the hours when nobody is on shift.",
        "في الدعم على موقعك وقنوات المراسلة. وفي الخدمة الذاتية للطلبات والحسابات. وفي إرشاد العملاء إلى المنتج المناسب. وفي مسارات استقبال العملاء الجدد. وفي الساعات التي لا يكون فيها أحد في المناوبة.",
      ),
    },
    approach: {
      body: bi(
        "Answers come from your approved knowledge base, and where it is relevant from the customer's own account data through an authenticated integration. The assistant stays inside your subject, declines what it should not answer, and hands over to a person with the full conversation attached. Tone and terminology follow your brand in both languages. We attack it with hostile inputs before launch, and read real conversations after.",
        "تأتي الإجابات من قاعدة معرفتك المعتمدة، وعند الحاجة من بيانات حساب العميل عبر تكامل موثّق. ويبقى المساعد داخل مجالك، ويمتنع عمّا لا ينبغي أن يجيب عنه، ويحوّل إلى موظف ومعه المحادثة كاملة. وتتبع النبرة والمصطلحات علامتك في اللغتين. ونهاجمه بمدخلات عدائية قبل الإطلاق، ونقرأ محادثات حقيقية بعده.",
      ),
    },
    engagement: {
      body: bi(
        "We start from the support data you already have: the questions customers really ask, and the answers your team gives today. The assistant is built against that, reviewed by your support leads, and launched to a small share of traffic with a clear route to a human. Coverage grows as resolution rates and satisfaction allow. Reporting shows what was resolved, what was escalated, and why.",
        "نبدأ من بيانات الدعم الموجودة عندك: الأسئلة التي يطرحها العملاء فعلاً، والإجابات التي يقدمها فريقك اليوم. يُبنى المساعد على هذا الأساس، ويراجعه مسؤولو الدعم لديك، ويُطلق على جزء صغير من الحركة مع طريق واضح إلى موظف. وتتسع التغطية كلما سمحت معدلات الحل ورضا العملاء. وتبيّن التقارير ما حُلّ وما صُعّد ولماذا.",
      ),
    },
    deliverables: {
      body: bi("A customer experience you would be happy to let a journalist test.", "تجربة عملاء لا تمانع أن يجربها صحفي."),
      items: [
        bi("A customer facing assistant grounded in your knowledge base and account data", "مساعد للعملاء مبني على قاعدة معرفتك وبيانات الحسابات"),
        bi("Guardrails, escalation to a person, and a brand voice in Arabic and English", "ضوابط، وتصعيد إلى موظف، وصوت علامة بالعربية والإنجليزية"),
        bi("Results of the hostile input testing, plus conversation quality monitoring and reporting", "نتائج اختبارات المدخلات العدائية، ومراقبة لجودة المحادثات وتقارير عنها"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Customers get an accurate answer at any hour, in the language they chose. Your team keeps the conversations that need judgement. And the assistant represents the business the way you would.",
        "يحصل العميل على إجابة دقيقة في أي ساعة، وباللغة التي اختارها. ويحتفظ فريقك بالمحادثات التي تحتاج تقديراً. ويمثّل المساعد عملك كما تمثّله أنت.",
      ),
    },
    related: ["enterprise-ai-assistants", "rag-knowledge-systems", "enterprise-web-platforms"],
  },
];
