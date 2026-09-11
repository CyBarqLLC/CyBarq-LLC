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
    summary: bi("From a business problem to a working, measured AI feature inside your systems.", "من مشكلة عمل إلى ميزة ذكاء اصطناعي عاملة ومقيسة داخل أنظمتك."),
    hero: bi("We do not train models. We make existing models useful, safe and measurable inside your organisation.", "نحن لا ندرّب النماذج. نجعل النماذج الموجودة مفيدة وآمنة وقابلة للقياس داخل مؤسستك."),
    seo: {
      title: bi("AI Solutions", "حلول الذكاء الاصطناعي"),
      description: bi("Practical AI solutions by CyBarq: scoping the right use case, integrating existing language models, retrieval over your own data, evaluation, guardrails, cost control and clear data boundaries.", "حلول ذكاء اصطناعي عملية من سايبرق: تحديد حالة الاستخدام المناسبة، ودمج النماذج اللغوية الموجودة، والاسترجاع من بياناتك، والتقييم، والضوابط، والتحكم في التكلفة، وحدود واضحة للبيانات."),
    },
    problem: {
      body: bi(
        "Most organisations have been shown what language models can do in a demo and are unsure what they should do in production. Pilots multiply, few reach users, and the ones that do are hard to trust: answers vary, costs are unpredictable, and nobody can say what data left the building. The technology is capable; the missing part is engineering.",
        "معظم المؤسسات رأت ما تستطيع النماذج اللغوية فعله في عرض تجريبي، ولا تعرف ما الذي ينبغي أن تفعله في الإنتاج. تتكاثر التجارب، وقليل منها يصل إلى المستخدمين، وما يصل يصعب الوثوق به: الإجابات متفاوتة، والتكاليف غير متوقعة، ولا أحد يستطيع القول أي بيانات خرجت من المؤسسة. التقنية قادرة؛ الجزء الناقص هو الهندسة.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Support and service desks handling repetitive questions, teams that spend hours summarising or classifying documents, processes that need information extracted from forms and emails, and knowledge that exists in files nobody can search. It also appears as staff pasting company data into public tools because nothing internal exists.",
        "في مكاتب الدعم والخدمة التي تعالج أسئلة متكررة، والفرق التي تقضي ساعات في تلخيص المستندات أو تصنيفها، والإجراءات التي تحتاج إلى استخراج معلومات من النماذج والرسائل، والمعرفة الموجودة في ملفات لا يستطيع أحد البحث فيها. ويظهر أيضاً في موظفين يلصقون بيانات الشركة في أدوات عامة لأن لا بديل داخلياً.",
      ),
    },
    approach: {
      body: bi(
        "We start with the problem and decide honestly whether a language model is the right tool; sometimes a rule or a search index is better. When it is, we integrate commercial or open models through their APIs, ground answers in your own data through retrieval, and wrap the whole in evaluation, guardrails and monitoring. Data boundaries are explicit: what is sent to which provider, what is stored, and for how long.",
        "نبدأ من المشكلة ونقرر بصدق ما إذا كان النموذج اللغوي هو الأداة المناسبة؛ فأحياناً تكون قاعدة أو فهرس بحث أفضل. وحين يكون مناسباً، ندمج نماذج تجارية أو مفتوحة عبر واجهاتها البرمجية، ونُسند الإجابات إلى بياناتك من خلال الاسترجاع، ونحيط النظام كله بالتقييم والضوابط والمراقبة. وحدود البيانات صريحة: ما الذي يُرسل إلى أي مزوّد، وما الذي يُخزَّن، ولأي مدة.",
      ),
    },
    engagement: {
      body: bi(
        "A short assessment identifies one or two use cases with clear value and measurable success criteria. We build a first version against real data in a few weeks, evaluate it against a test set your team helps define, and only then widen the rollout. Costs and latency are measured from the first week so there are no surprises when usage grows.",
        "يحدد تقييم قصير حالة استخدام أو اثنتين بقيمة واضحة ومعايير نجاح قابلة للقياس. نبني نسخة أولى على بيانات حقيقية خلال بضعة أسابيع، ونقيّمها مقابل مجموعة اختبار يساعد فريقك في تحديدها، وبعد ذلك فقط نوسّع الإطلاق. وتُقاس التكاليف وزمن الاستجابة منذ الأسبوع الأول حتى لا تكون هناك مفاجآت حين يزداد الاستخدام.",
      ),
    },
    deliverables: {
      body: bi("A working feature, and the evidence that it works.", "ميزة عاملة، والدليل على أنها تعمل."),
      items: [
        bi("Use case assessment with success criteria, data boundaries and cost estimate", "تقييم لحالة الاستخدام بمعايير نجاح وحدود بيانات وتقدير للتكلفة"),
        bi("Integrated AI feature with retrieval, guardrails and monitoring", "ميزة ذكاء اصطناعي مدمجة مع استرجاع وضوابط ومراقبة"),
        bi("Evaluation set and results, and an operations guide for your team", "مجموعة تقييم ونتائجها، ودليل تشغيل لفريقك"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Hours returned to your people on the work that was consuming them, answers that are grounded in your own information, and an AI capability you can explain to a client or a regulator: what it does, what it sees, and how well it performs.",
        "ساعات تعود إلى فريقك من العمل الذي كان يستهلكه، وإجابات مبنية على معلوماتك أنت، وقدرة ذكاء اصطناعي تستطيع شرحها لعميل أو جهة رقابية: ماذا تفعل، وماذا ترى، وما مستوى أدائها.",
      ),
    },
    related: ["llm-applications", "rag-knowledge-systems", "ai-automation-workflow-integration"],
  },
  {
    slug: "llm-applications",
    practice: "artificial-intelligence",
    pictogram: "ai",
    title: bi("LLM Applications", "تطبيقات النماذج اللغوية"),
    summary: bi("Applications built on large language models, engineered for reliability rather than demos.", "تطبيقات مبنية على النماذج اللغوية الكبيرة، مهندسة للموثوقية لا للعروض التجريبية."),
    hero: bi("A language model is a component, not a product. We build the product around it.", "النموذج اللغوي مكوّن، لا منتج. نبني المنتج حوله."),
    seo: {
      title: bi("LLM Application Development", "تطوير تطبيقات النماذج اللغوية"),
      description: bi("Production LLM applications by CyBarq: prompt and context design, structured outputs, evaluation, fallbacks, cost and latency control, and integration with your data and systems.", "تطبيقات نماذج لغوية جاهزة للإنتاج من سايبرق: تصميم التعليمات والسياق، ومخرجات منظمة، وتقييم، وبدائل عند الفشل، وتحكم في التكلفة وزمن الاستجابة، وتكامل مع بياناتك وأنظمتك."),
    },
    problem: {
      body: bi(
        "A prototype that calls a model API takes an afternoon. A production application takes engineering: outputs must be structured and validated, failures must be handled, prompts must be versioned and tested, and every call has a cost and a latency that users and finance both notice. Without that engineering, the application behaves differently every week.",
        "النموذج الأولي الذي يستدعي واجهة برمجة النموذج يستغرق ظهيرة واحدة. أما التطبيق الإنتاجي فيحتاج إلى هندسة: يجب أن تكون المخرجات منظمة ومتحققاً منها، وأن تُعالج حالات الفشل، وأن تُدار إصدارات التعليمات وتُختبر، ولكل استدعاء تكلفة وزمن استجابة يلاحظهما المستخدمون والمالية معاً. ومن دون هذه الهندسة يتصرف التطبيق بشكل مختلف كل أسبوع.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Document drafting and review tools, summarisation of long records, classification and routing of incoming requests, extraction of structured data from unstructured text, translation between Arabic and English with domain terminology, and conversational interfaces over business functions.",
        "في أدوات صياغة المستندات ومراجعتها، وتلخيص السجلات الطويلة، وتصنيف الطلبات الواردة وتوجيهها، واستخراج بيانات منظمة من نصوص غير منظمة، والترجمة بين العربية والإنجليزية بمصطلحات المجال، والواجهات الحوارية فوق وظائف الأعمال.",
      ),
    },
    approach: {
      body: bi(
        "We design the application around what the model is reliable at and protect against what it is not. Prompts and context are treated as code: versioned, reviewed and tested against an evaluation set. Outputs are structured and validated before they touch your systems. We select models per task on measured quality, cost and latency, and we keep the option to switch providers. Arabic quality is tested explicitly, not assumed.",
        "نصمم التطبيق حول ما يُحسنه النموذج بموثوقية، ونحميه مما لا يُحسنه. تُعامل التعليمات والسياق كشيفرة: مُدارة الإصدارات، ومراجَعة، ومختبرة مقابل مجموعة تقييم. وتُنظَّم المخرجات ويُتحقق منها قبل أن تلمس أنظمتك. نختار النموذج لكل مهمة بناءً على جودة وتكلفة وزمن استجابة مقيسة، ونحتفظ بإمكانية تبديل المزوّد. وجودة العربية تُختبر صراحةً، لا تُفترض.",
      ),
    },
    engagement: {
      body: bi(
        "We define the task, the inputs, the expected outputs and how quality will be judged, then build an evaluation set with your subject matter experts. The first version is built in short cycles and measured against that set. Rollout starts with a small group and widens as the numbers justify it. Monitoring of quality, cost and latency stays in place after launch.",
        "نحدد المهمة والمدخلات والمخرجات المتوقعة وكيف ستُقاس الجودة، ثم نبني مجموعة تقييم مع خبراء المجال لديك. تُبنى النسخة الأولى في دورات قصيرة وتُقاس مقابل تلك المجموعة. ويبدأ الإطلاق مع مجموعة صغيرة ويتسع كلما بررت الأرقام ذلك. وتبقى مراقبة الجودة والتكلفة وزمن الاستجابة قائمة بعد الإطلاق.",
      ),
    },
    deliverables: {
      body: bi("An application your users can rely on, with the numbers to prove it.", "تطبيق يستطيع مستخدموك الاعتماد عليه، مع أرقام تثبت ذلك."),
      items: [
        bi("Production application with structured outputs, validation and fallbacks", "تطبيق إنتاجي بمخرجات منظمة وتحقق وبدائل عند الفشل"),
        bi("Versioned prompts, evaluation set and quality reports", "تعليمات مُدارة الإصدارات ومجموعة تقييم وتقارير جودة"),
        bi("Cost and latency dashboard and a provider switching plan", "لوحة للتكلفة وزمن الاستجابة وخطة لتبديل المزوّد"),
      ],
    },
    businessMeaning: {
      body: bi(
        "A capability that behaves the same on Monday as it did on Friday, with a monthly cost you can forecast and a quality level you can state in writing.",
        "قدرة تتصرف يوم الاثنين كما تصرفت يوم الجمعة، بتكلفة شهرية يمكنك توقعها ومستوى جودة يمكنك ذكره كتابةً.",
      ),
    },
    related: ["ai-solutions", "ai-api-model-integration", "ai-customer-experiences"],
  },
  {
    slug: "ai-agents",
    practice: "artificial-intelligence",
    pictogram: "automation",
    title: bi("AI Agents", "وكلاء الذكاء الاصطناعي"),
    summary: bi("Agents that complete defined, multi step tasks using your tools, within limits you set.", "وكلاء ينجزون مهاماً محددة متعددة الخطوات باستخدام أدواتك، ضمن حدود تضعها أنت."),
    hero: bi("An agent should do a job, not have a personality. We build agents with a clear task, clear tools and clear limits.", "الوكيل يجب أن يؤدي مهمة، لا أن يكون له شخصية. نبني وكلاء بمهمة واضحة وأدوات واضحة وحدود واضحة."),
    seo: {
      title: bi("AI Agents", "وكلاء الذكاء الاصطناعي"),
      description: bi("Task focused AI agents by CyBarq that use your systems through controlled tools, with permissions, human approval steps, audit logs and evaluation built in.", "وكلاء ذكاء اصطناعي موجهون للمهام من سايبرق يستخدمون أنظمتك عبر أدوات محكومة، مع صلاحيات وخطوات موافقة بشرية وسجلات تدقيق وتقييم مدمج."),
    },
    problem: {
      body: bi(
        "Many tasks are not one question but a sequence: look something up, check a rule, update a record, notify someone. Language models can now plan and execute such sequences, which is powerful and also risky. An agent with too much access and too little supervision can take wrong actions quickly and at scale.",
        "كثير من المهام ليست سؤالاً واحداً بل تسلسلاً: ابحث عن شيء، وتحقق من قاعدة، وحدّث سجلاً، وأبلغ شخصاً. تستطيع النماذج اللغوية الآن تخطيط هذه التسلسلات وتنفيذها، وهذا قوي وخطر في آن واحد. فالوكيل الذي يملك صلاحيات واسعة وإشرافاً قليلاً قد يتخذ إجراءات خاطئة بسرعة وعلى نطاق واسع.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Triage of support tickets that need data from several systems, preparation of reports that pull from multiple sources, first line handling of routine requests such as scheduling or status checks, data quality checks across systems, and internal operations that follow a known procedure but have too many steps to automate with simple rules.",
        "في فرز تذاكر الدعم التي تحتاج بيانات من عدة أنظمة، وإعداد التقارير التي تجمع من مصادر متعددة، والتعامل الأولي مع الطلبات الروتينية مثل الجدولة أو الاستعلام عن الحالة، وفحوصات جودة البيانات عبر الأنظمة، والعمليات الداخلية التي تتبع إجراءً معروفاً لكن خطواته أكثر من أن تُؤتمت بقواعد بسيطة.",
      ),
    },
    approach: {
      body: bi(
        "Each agent gets a narrow task, a small set of tools we build and control, and permissions that match the task and nothing more. Actions with consequences require a human approval step until the evidence shows it can be relaxed. Every step is logged. We evaluate agents on real scenarios before rollout and keep measuring afterwards. Where a deterministic workflow does the job, we use that instead.",
        "يحصل كل وكيل على مهمة ضيقة، ومجموعة صغيرة من الأدوات نبنيها ونتحكم فيها، وصلاحيات تطابق المهمة ولا تزيد عنها. والإجراءات ذات العواقب تتطلب خطوة موافقة بشرية إلى أن تُثبت الأدلة إمكانية تخفيفها. وتُسجَّل كل خطوة. نقيّم الوكلاء على سيناريوهات حقيقية قبل الإطلاق ونستمر في القياس بعده. وحيث يؤدي سير عمل حتمي المهمة، نستخدمه بدلاً من ذلك.",
      ),
    },
    engagement: {
      body: bi(
        "We select a task with a clear procedure and a measurable outcome, define the tools and permissions with the system owners, and build the agent with a test harness of realistic cases. It runs first in a mode where it proposes and a person approves. As accuracy is demonstrated, approval is relaxed for low risk actions. Reporting on what the agent did, and where it needed help, is part of the delivery.",
        "نختار مهمة بإجراء واضح ونتيجة قابلة للقياس، ونحدد الأدوات والصلاحيات مع أصحاب الأنظمة، ونبني الوكيل مع بيئة اختبار من حالات واقعية. يعمل أولاً في وضع يقترح فيه ويوافق شخص. ومع إثبات الدقة، تُخفف الموافقة للإجراءات منخفضة المخاطر. والتقارير عمّا فعله الوكيل، وأين احتاج إلى مساعدة، جزء من التسليم.",
      ),
    },
    deliverables: {
      body: bi("An agent you can supervise, and the record to prove what it did.", "وكيل تستطيع الإشراف عليه، وسجل يثبت ما فعله."),
      items: [
        bi("Agent with defined task, controlled tools and scoped permissions", "وكيل بمهمة محددة وأدوات محكومة وصلاحيات مقيّدة"),
        bi("Approval workflow, audit log and evaluation harness", "سير عمل للموافقة وسجل تدقيق وبيئة تقييم"),
        bi("Operational reporting on actions, accuracy and cost", "تقارير تشغيلية عن الإجراءات والدقة والتكلفة"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Multi step work that used to wait for a person gets done in minutes, within rules you set, with a full record. Your team supervises outcomes instead of performing every step.",
        "العمل متعدد الخطوات الذي كان ينتظر شخصاً يُنجز في دقائق، ضمن قواعد تضعها أنت، ومع سجل كامل. يشرف فريقك على النتائج بدلاً من تنفيذ كل خطوة.",
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
    summary: bi("Assistants for your staff that answer from your own documents, policies and systems, with access control.", "مساعدون لموظفيك يجيبون من وثائقك وسياساتك وأنظمتك، مع تحكم في الصلاحيات."),
    hero: bi("An assistant that knows your policies, your procedures and your data, and only shows each person what they are allowed to see.", "مساعد يعرف سياساتك وإجراءاتك وبياناتك، ولا يُظهر لكل شخص إلا ما يُسمح له برؤيته."),
    seo: {
      title: bi("Enterprise AI Assistants", "المساعدون المؤسسيون بالذكاء الاصطناعي"),
      description: bi("Internal AI assistants by CyBarq grounded in your documents and systems, with permission aware retrieval, source citations, Arabic and English support, and no training on your data.", "مساعدون داخليون بالذكاء الاصطناعي من سايبرق مبنيون على وثائقك وأنظمتك، مع استرجاع يراعي الصلاحيات، واستشهاد بالمصادر، ودعم للعربية والإنجليزية، ومن دون تدريب على بياناتك."),
    },
    problem: {
      body: bi(
        "Staff spend a surprising share of their day looking for information that exists: a policy, a procedure, the status of a request, the right template. Public AI tools cannot see that information, and pasting it into them is a data leak. An internal assistant solves this only if it respects who may see what, and only if its answers can be checked.",
        "يقضي الموظفون جزءاً مفاجئاً من يومهم في البحث عن معلومات موجودة أصلاً: سياسة، أو إجراء، أو حالة طلب، أو النموذج الصحيح. أدوات الذكاء الاصطناعي العامة لا ترى هذه المعلومات، ولصقها فيها تسريب للبيانات. ولا يحل المساعد الداخلي هذه المشكلة إلا إذا احترم من يحق له رؤية ماذا، وإلا إذا كانت إجاباته قابلة للتحقق.",
      ),
    },
    whereItAppears: {
      body: bi(
        "HR and policy questions, IT help desk, onboarding of new employees, sales teams looking for the latest proposal material, operations staff checking procedures, and management asking for a quick summary of a long document. Every organisation with more than a few hundred documents has this problem.",
        "في أسئلة الموارد البشرية والسياسات، ومكتب مساعدة تقنية المعلومات، وتهيئة الموظفين الجدد، وفرق المبيعات التي تبحث عن أحدث مواد العروض، وموظفي العمليات الذين يتحققون من الإجراءات، والإدارة التي تطلب ملخصاً سريعاً لمستند طويل. كل مؤسسة لديها أكثر من بضع مئات من المستندات تعاني هذه المشكلة.",
      ),
    },
    approach: {
      body: bi(
        "The assistant answers from your content through retrieval, and it cites its sources so an answer can be verified. Retrieval respects your existing permissions: a person gets answers only from documents they could open themselves. Your data is not used to train any model. Arabic and English are handled as first class, including documents that mix both. We measure answer quality with your own reviewers before and after launch.",
        "يجيب المساعد من محتواك عبر الاسترجاع، ويستشهد بمصادره حتى يمكن التحقق من كل إجابة. ويحترم الاسترجاع صلاحياتك الحالية: لا يحصل الشخص على إجابات إلا من مستندات يستطيع فتحها بنفسه. ولا تُستخدم بياناتك لتدريب أي نموذج. وتُعامل العربية والإنجليزية بالمستوى نفسه، بما في ذلك المستندات التي تجمع بينهما. ونقيس جودة الإجابات مع مراجعين من فريقك قبل الإطلاق وبعده.",
      ),
    },
    engagement: {
      body: bi(
        "We connect one or two content sources first, such as a document library and a policy repository, and build the assistant for a pilot group. Their questions and ratings shape the next iteration. Sources are added one at a time, each with its permission model verified. Deployment can be inside your existing tools, such as a chat platform or intranet, or as a standalone interface.",
        "نربط مصدراً أو مصدرين للمحتوى أولاً، مثل مكتبة مستندات ومستودع سياسات، ونبني المساعد لمجموعة تجريبية. تشكّل أسئلتهم وتقييماتهم النسخة التالية. وتُضاف المصادر واحداً تلو الآخر، مع التحقق من نموذج الصلاحيات لكل منها. ويمكن نشر المساعد داخل أدواتك الحالية، مثل منصة محادثة أو شبكة داخلية، أو كواجهة مستقلة.",
      ),
    },
    deliverables: {
      body: bi("An assistant that knows your organisation and keeps its secrets.", "مساعد يعرف مؤسستك ويحفظ أسرارها."),
      items: [
        bi("Assistant with permission aware retrieval and source citations", "مساعد باسترجاع يراعي الصلاحيات واستشهاد بالمصادر"),
        bi("Connectors to your document and business systems, added incrementally", "موصلات إلى أنظمة المستندات والأعمال لديك، تُضاف تدريجياً"),
        bi("Quality measurements, usage reporting and a data handling statement", "قياسات للجودة وتقارير استخدام وبيان لكيفية التعامل مع البيانات"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Faster answers for everyone, fewer interruptions for the people who used to be the answer, and a safe alternative to public tools for company information.",
        "إجابات أسرع للجميع، ومقاطعات أقل للأشخاص الذين كانوا هم الإجابة، وبديل آمن للأدوات العامة فيما يخص معلومات الشركة.",
      ),
    },
    related: ["rag-knowledge-systems", "ai-internal-tools", "identity-access-architecture"],
  },
  {
    slug: "rag-knowledge-systems",
    practice: "artificial-intelligence",
    pictogram: "database",
    title: bi("RAG & Knowledge Systems", "أنظمة الاسترجاع المعزز والمعرفة"),
    summary: bi("Retrieval pipelines that let models answer accurately from your documents and data.", "خطوط استرجاع تتيح للنماذج الإجابة بدقة من مستنداتك وبياناتك."),
    hero: bi("The model provides the language. Your documents provide the facts. Retrieval is the engineering that connects the two.", "النموذج يوفر اللغة. ومستنداتك توفر الحقائق. والاسترجاع هو الهندسة التي تربط بينهما."),
    seo: {
      title: bi("RAG and Knowledge Systems", "أنظمة الاسترجاع المعزز والمعرفة"),
      description: bi("Retrieval augmented generation and knowledge systems by CyBarq: document ingestion, chunking, embeddings, hybrid search, permission filtering, citations and evaluation of answer accuracy.", "أنظمة توليد معزز بالاسترجاع وأنظمة معرفة من سايبرق: استيعاب المستندات، والتقطيع، والتضمينات، والبحث الهجين، وتصفية الصلاحيات، والاستشهاد بالمصادر، وتقييم دقة الإجابات."),
    },
    problem: {
      body: bi(
        "A language model on its own does not know your contracts, your procedures or last month's reports, and when asked it will produce something plausible anyway. Retrieval augmented generation fixes this by giving the model the right passages at the right time, but the quality of the result depends entirely on how documents are processed, indexed, filtered and ranked. Most disappointing AI assistants are retrieval problems, not model problems.",
        "النموذج اللغوي وحده لا يعرف عقودك ولا إجراءاتك ولا تقارير الشهر الماضي، وحين يُسأل سينتج شيئاً يبدو معقولاً على أي حال. التوليد المعزز بالاسترجاع يعالج ذلك بإعطاء النموذج المقاطع الصحيحة في الوقت الصحيح، لكن جودة النتيجة تعتمد كلياً على كيفية معالجة المستندات وفهرستها وتصفيتها وترتيبها. ومعظم المساعدين المخيّبين للآمال مشكلتهم في الاسترجاع لا في النموذج.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Policy and procedure libraries, contract repositories, technical documentation, regulatory texts, case histories, product manuals, and any archive that mixes PDFs, scans, spreadsheets and email. Arabic documents, scanned documents and tables are where generic solutions fail first.",
        "في مكتبات السياسات والإجراءات، ومستودعات العقود، والوثائق التقنية، والنصوص التنظيمية، وسجلات الحالات، وأدلة المنتجات، وأي أرشيف يجمع ملفات PDF ومستندات ممسوحة وجداول بيانات وبريداً إلكترونياً. والمستندات العربية والممسوحة والجداول هي أول ما تفشل فيه الحلول العامة.",
      ),
    },
    approach: {
      body: bi(
        "We build the pipeline deliberately: extraction that handles Arabic, scans and tables; chunking that follows document structure; embeddings chosen for your languages; hybrid search that combines semantic and keyword retrieval; and filtering that enforces permissions before anything reaches the model. Answers carry citations. We evaluate retrieval quality separately from answer quality so problems can be located and fixed.",
        "نبني خط المعالجة بعناية: استخراج يتعامل مع العربية والمستندات الممسوحة والجداول؛ وتقطيع يتبع بنية المستند؛ وتضمينات مختارة للغاتك؛ وبحث هجين يجمع بين الاسترجاع الدلالي والكلمات المفتاحية؛ وتصفية تفرض الصلاحيات قبل أن يصل أي شيء إلى النموذج. وتحمل الإجابات استشهادات بالمصادر. ونقيّم جودة الاسترجاع بمعزل عن جودة الإجابة حتى يمكن تحديد المشكلات وإصلاحها.",
      ),
    },
    engagement: {
      body: bi(
        "We start with a representative sample of your documents and a set of real questions with known good answers. The pipeline is built and tuned against that set until retrieval accuracy meets the agreed target. Then we connect the full sources, set up incremental updates so new documents appear within minutes, and hand over the monitoring that shows when quality drifts.",
        "نبدأ بعيّنة ممثلة من مستنداتك ومجموعة أسئلة حقيقية بإجابات صحيحة معروفة. يُبنى خط المعالجة ويُضبط مقابل تلك المجموعة حتى تبلغ دقة الاسترجاع الهدف المتفق عليه. ثم نربط المصادر كاملة، ونُعدّ التحديث التدريجي بحيث تظهر المستندات الجديدة خلال دقائق، ونسلّمك المراقبة التي تُظهر متى تتراجع الجودة.",
      ),
    },
    deliverables: {
      body: bi("A retrieval system that can be measured, tuned and trusted.", "نظام استرجاع يمكن قياسه وضبطه والوثوق به."),
      items: [
        bi("Ingestion pipeline for your document types and languages", "خط استيعاب لأنواع مستنداتك ولغاتك"),
        bi("Search index with hybrid retrieval and permission filtering", "فهرس بحث باسترجاع هجين وتصفية للصلاحيات"),
        bi("Evaluation set, accuracy reports and drift monitoring", "مجموعة تقييم وتقارير دقة ومراقبة للتراجع"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Answers you can trace to a source, knowledge that stays inside your boundaries, and a foundation every future assistant or agent in the organisation can build on.",
        "إجابات يمكن تتبعها إلى مصدرها، ومعرفة تبقى داخل حدودك، وأساس يمكن لكل مساعد أو وكيل مستقبلي في المؤسسة أن يبني عليه.",
      ),
    },
    related: ["enterprise-ai-assistants", "ai-solutions", "apis-integrations"],
  },
  {
    slug: "ai-automation-workflow-integration",
    practice: "artificial-intelligence",
    pictogram: "automation",
    title: bi("AI Automation & Workflow Integration", "الأتمتة بالذكاء الاصطناعي وتكامل سير العمل"),
    summary: bi("Language models placed inside existing workflows to remove manual steps, with humans where they matter.", "نماذج لغوية موضوعة داخل سير العمل القائم لإزالة الخطوات اليدوية، مع بقاء الإنسان حيث يهم."),
    hero: bi("The best automation is invisible: a step that used to need a person now just happens, and someone checks the ones that matter.", "أفضل أتمتة هي التي لا تُرى: خطوة كانت تحتاج شخصاً تحدث الآن من تلقاء نفسها، ويراجع أحدهم ما يستحق المراجعة."),
    seo: {
      title: bi("AI Automation and Workflow Integration", "الأتمتة بالذكاء الاصطناعي وتكامل سير العمل"),
      description: bi("AI automation by CyBarq inside your existing workflows: classification, extraction, drafting and routing steps with confidence thresholds, human review and full audit trails.", "أتمتة بالذكاء الاصطناعي من سايبرق داخل سير عملك الحالي: خطوات تصنيف واستخراج وصياغة وتوجيه بعتبات ثقة ومراجعة بشرية وسجلات تدقيق كاملة."),
    },
    problem: {
      body: bi(
        "Many workflows contain a few steps that could never be automated with rules because they involve reading and judgement: classifying an incoming request, extracting fields from a scanned form, drafting a standard reply, deciding where a document belongs. Those steps are where queues form and where people spend hours on work that is important but not interesting.",
        "تحتوي كثير من أسيار العمل على خطوات لم يكن ممكناً أتمتتها بالقواعد لأنها تتطلب قراءة وتقديراً: تصنيف طلب وارد، أو استخراج حقول من نموذج ممسوح، أو صياغة رد قياسي، أو تحديد مكان مستند. عند هذه الخطوات تتشكل طوابير الانتظار، وفيها يقضي الناس ساعات على عمل مهم لكنه غير ممتع.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Invoice and form processing, email and ticket routing, document classification and filing, first draft generation for standard correspondence, data entry from unstructured sources, and quality checks that used to be sampled because nobody could review everything.",
        "في معالجة الفواتير والنماذج، وتوجيه البريد والتذاكر، وتصنيف المستندات وأرشفتها، وتوليد المسودات الأولى للمراسلات القياسية، وإدخال البيانات من مصادر غير منظمة، وفحوصات الجودة التي كانت تُجرى على عيّنات لأن أحداً لم يستطع مراجعة كل شيء.",
      ),
    },
    approach: {
      body: bi(
        "We insert the model as one step in the workflow, not as a replacement for it. Each automated step returns a result and a confidence; results above a threshold proceed, the rest go to a person. Everything is logged so decisions can be reviewed and thresholds adjusted from evidence. Integration uses your workflow system, queue or API, and the deterministic parts stay deterministic.",
        "ندرج النموذج كخطوة واحدة في سير العمل، لا كبديل عنه. تُعيد كل خطوة مؤتمتة نتيجة ودرجة ثقة؛ فتمضي النتائج التي تتجاوز العتبة، ويذهب الباقي إلى شخص. ويُسجَّل كل شيء حتى يمكن مراجعة القرارات وتعديل العتبات بناءً على الأدلة. ويجري التكامل عبر نظام سير العمل أو قائمة الانتظار أو واجهة البرمجة لديك، وتبقى الأجزاء الحتمية حتمية.",
      ),
    },
    engagement: {
      body: bi(
        "We map the workflow, pick the steps where judgement is the bottleneck and measure their current volume and time. The automation is built and run in shadow mode first, producing results that people compare with their own. Once accuracy is established, it takes over the confident cases. We report monthly on volume handled, accuracy and time saved.",
        "نرسم سير العمل، ونختار الخطوات التي يكون فيها التقدير البشري عنق الزجاجة، ونقيس حجمها ووقتها الحالي. تُبنى الأتمتة وتعمل أولاً في وضع الظل، فتنتج نتائج يقارنها الناس بنتائجهم. وبعد إثبات الدقة، تتولى الحالات ذات الثقة العالية. ونقدم تقريراً شهرياً عن الحجم المعالج والدقة والوقت الموفَّر.",
      ),
    },
    deliverables: {
      body: bi("Fewer manual steps, and a record of every automated one.", "خطوات يدوية أقل، وسجل لكل خطوة مؤتمتة."),
      items: [
        bi("Automated workflow steps with confidence thresholds and human review paths", "خطوات سير عمل مؤتمتة بعتبات ثقة ومسارات مراجعة بشرية"),
        bi("Integration with your workflow, queue or business systems", "تكامل مع سير العمل أو قائمة الانتظار أو أنظمة الأعمال لديك"),
        bi("Audit log, accuracy monitoring and monthly reporting", "سجل تدقيق ومراقبة للدقة وتقارير شهرية"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Queues that clear the same day, people freed for the cases that need them, and consistency in decisions that used to depend on who was on shift.",
        "طوابير تُصفّى في اليوم نفسه، وأشخاص يتفرغون للحالات التي تحتاجهم، واتساق في القرارات التي كانت تعتمد على من كان في المناوبة.",
      ),
    },
    related: ["ai-agents", "workflow-systems-digital-portals", "ai-api-model-integration"],
  },
  {
    slug: "ai-api-model-integration",
    practice: "artificial-intelligence",
    pictogram: "integration",
    title: bi("AI API & Model Integration", "دمج واجهات ونماذج الذكاء الاصطناعي"),
    summary: bi("Connecting commercial and open models to your applications through one controlled, observable layer.", "ربط النماذج التجارية والمفتوحة بتطبيقاتك عبر طبقة واحدة محكومة وقابلة للمراقبة."),
    hero: bi("Model providers change prices, limits and behaviour. Your applications should not have to notice.", "مزوّدو النماذج يغيّرون الأسعار والحدود والسلوك. ولا ينبغي أن تلاحظ تطبيقاتك ذلك."),
    seo: {
      title: bi("AI API and Model Integration", "دمج واجهات ونماذج الذكاء الاصطناعي"),
      description: bi("Integration of AI model APIs and self hosted models into your applications by CyBarq: a gateway layer with authentication, routing, caching, rate limits, cost tracking, logging and provider independence.", "دمج واجهات نماذج الذكاء الاصطناعي والنماذج المستضافة ذاتياً في تطبيقاتك من سايبرق: طبقة بوابة بمصادقة وتوجيه وتخزين مؤقت وحدود معدل وتتبع للتكلفة وسجلات واستقلال عن المزوّد."),
    },
    problem: {
      body: bi(
        "When every application calls model providers directly, the organisation ends up with keys scattered across code, no view of total spend, no consistent logging, and a hard dependency on one vendor's pricing and availability. Data handling becomes impossible to describe, because nobody knows which application sends what where.",
        "حين يستدعي كل تطبيق مزوّدي النماذج مباشرة، تنتهي المؤسسة بمفاتيح موزعة في الشيفرة، ومن دون رؤية للإنفاق الإجمالي، ولا سجلات متسقة، ومع اعتماد صعب على تسعير مزوّد واحد وتوفره. ويصبح وصف التعامل مع البيانات مستحيلاً، لأن أحداً لا يعرف أي تطبيق يرسل ماذا وإلى أين.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Organisations with several AI features built by different teams, products that need to offer a choice of models, regulated environments that must keep some data on self hosted models, and finance teams asking why the AI bill doubled.",
        "في المؤسسات التي لديها عدة ميزات ذكاء اصطناعي بنتها فرق مختلفة، والمنتجات التي تحتاج إلى تقديم خيار بين النماذج، والبيئات الخاضعة للتنظيم التي يجب أن تُبقي بعض البيانات على نماذج مستضافة ذاتياً، وفرق المالية التي تسأل لماذا تضاعفت فاتورة الذكاء الاصطناعي.",
      ),
    },
    approach: {
      body: bi(
        "We put one gateway between your applications and the models. It holds the credentials, enforces which data classes may go to which provider, routes requests to the appropriate model, caches where safe, applies rate limits and budgets, and logs every call with cost and latency. Self hosted open models sit behind the same interface for data that must not leave your environment. Switching a provider becomes a configuration change.",
        "نضع بوابة واحدة بين تطبيقاتك والنماذج. تحتفظ بالمفاتيح، وتفرض أي فئات من البيانات يجوز إرسالها إلى أي مزوّد، وتوجّه الطلبات إلى النموذج المناسب، وتخزّن مؤقتاً حيث يكون ذلك آمناً، وتطبّق حدود المعدل والميزانيات، وتسجّل كل استدعاء مع التكلفة وزمن الاستجابة. وتقف النماذج المفتوحة المستضافة ذاتياً خلف الواجهة نفسها للبيانات التي يجب ألا تغادر بيئتك. ويصبح تبديل المزوّد تغييراً في الإعدادات.",
      ),
    },
    engagement: {
      body: bi(
        "We inventory the existing AI integrations and data flows, agree on the data classification and routing rules, and deploy the gateway in your environment. Applications are migrated one at a time. Where self hosting is required we size and deploy the model infrastructure with our infrastructure practice. Dashboards for spend and usage are part of the handover.",
        "نجرد تكاملات الذكاء الاصطناعي وتدفقات البيانات الحالية، ونتفق على تصنيف البيانات وقواعد التوجيه، وننشر البوابة في بيئتك. وتُنقل التطبيقات واحداً تلو الآخر. وحيث تلزم الاستضافة الذاتية نحدد حجم بنية النماذج وننشرها مع فريق البنية التحتية لدينا. ولوحات الإنفاق والاستخدام جزء من التسليم.",
      ),
    },
    deliverables: {
      body: bi("One controlled door to every model you use.", "باب واحد محكوم إلى كل نموذج تستخدمه."),
      items: [
        bi("Model gateway with authentication, routing, caching, limits and logging", "بوابة نماذج بمصادقة وتوجيه وتخزين مؤقت وحدود وسجلات"),
        bi("Data classification and routing policy, enforced in the gateway", "سياسة تصنيف بيانات وتوجيه، مفروضة في البوابة"),
        bi("Spend and usage dashboards, and self hosted model deployment where needed", "لوحات إنفاق واستخدام، ونشر لنماذج مستضافة ذاتياً عند الحاجة"),
      ],
    },
    businessMeaning: {
      body: bi(
        "A single answer to what the organisation spends on AI and where its data goes, resilience against any one provider's outages or price changes, and faster delivery of the next AI feature because the plumbing already exists.",
        "إجابة واحدة عمّا تنفقه المؤسسة على الذكاء الاصطناعي وأين تذهب بياناتها، ومرونة أمام انقطاع أي مزوّد أو تغيّر أسعاره، وتسليم أسرع للميزة التالية لأن البنية الأساسية موجودة أصلاً.",
      ),
    },
    related: ["llm-applications", "apis-integrations", "cloud-architecture"],
  },
  {
    slug: "ai-internal-tools",
    practice: "artificial-intelligence",
    pictogram: "platform",
    title: bi("AI Internal Tools", "أدوات داخلية بالذكاء الاصطناعي"),
    summary: bi("Small, focused tools that give a team a specific AI capability inside its daily work.", "أدوات صغيرة ومركزة تمنح فريقاً قدرة ذكاء اصطناعي محددة داخل عمله اليومي."),
    hero: bi("Not every AI need is a platform. Sometimes one team needs one tool that does one thing well.", "ليست كل حاجة إلى الذكاء الاصطناعي منصة. أحياناً يحتاج فريق واحد إلى أداة واحدة تؤدي شيئاً واحداً جيداً."),
    seo: {
      title: bi("AI Internal Tools", "أدوات داخلية بالذكاء الاصطناعي"),
      description: bi("Focused internal AI tools by CyBarq for specific teams: document review helpers, drafting assistants, data extraction utilities and analysis tools, built quickly and governed properly.", "أدوات ذكاء اصطناعي داخلية مركزة من سايبرق لفرق محددة: مساعدات مراجعة المستندات، ومساعدات الصياغة، وأدوات استخراج البيانات، وأدوات التحليل، تُبنى بسرعة وتُحكم بشكل سليم."),
    },
    problem: {
      body: bi(
        "Teams find their own uses for language models quickly, usually in personal accounts on public tools, with company data and no oversight. The alternative offered is often a large platform project that will arrive next year. What teams actually need is a small, sanctioned tool for the specific task in front of them.",
        "تجد الفرق استخداماتها الخاصة للنماذج اللغوية بسرعة، وغالباً في حسابات شخصية على أدوات عامة، ببيانات الشركة ومن دون رقابة. والبديل المعروض عادةً مشروع منصة كبير سيصل العام المقبل. وما تحتاجه الفرق فعلاً هو أداة صغيرة معتمدة للمهمة المحددة أمامها.",
      ),
    },
    whereItAppears: {
      body: bi(
        "A legal team reviewing contracts against a checklist, a finance team reconciling documents, an HR team screening applications against criteria, a marketing team producing bilingual drafts in the house style, an analyst summarising research, and a security team triaging alerts.",
        "في فريق قانوني يراجع العقود وفق قائمة تحقق، وفريق مالي يطابق المستندات، وفريق موارد بشرية يفرز الطلبات وفق معايير، وفريق تسويق ينتج مسودات ثنائية اللغة بأسلوب الشركة، ومحلل يلخص الأبحاث، وفريق أمني يفرز التنبيهات.",
      ),
    },
    approach: {
      body: bi(
        "We build each tool small and specific, on the same governed foundation: the model gateway, the data rules, the logging. The interface is designed for the team's actual workflow, often as a step inside a tool they already use. Prompts are written with the team's experts and tested on their real examples. Because the foundation is shared, the second tool is faster than the first.",
        "نبني كل أداة صغيرة ومحددة، على الأساس المحكوم نفسه: بوابة النماذج، وقواعد البيانات، والسجلات. وتُصمم الواجهة لسير العمل الفعلي للفريق، وغالباً كخطوة داخل أداة يستخدمها بالفعل. وتُكتب التعليمات مع خبراء الفريق وتُختبر على أمثلتهم الحقيقية. ولأن الأساس مشترك، تكون الأداة الثانية أسرع من الأولى.",
      ),
    },
    engagement: {
      body: bi(
        "A tool starts with a half day session with the team to define the task, the inputs and what a good result looks like. A first version is usually ready to try within two to three weeks. The team uses it, we adjust, and we agree when it is done. Tools are catalogued so the organisation knows what exists and who owns it.",
        "تبدأ الأداة بجلسة نصف يوم مع الفريق لتحديد المهمة والمدخلات وشكل النتيجة الجيدة. وتكون النسخة الأولى جاهزة للتجربة عادةً خلال أسبوعين إلى ثلاثة. يستخدمها الفريق، ونعدّل، ونتفق متى تكتمل. وتُفهرس الأدوات لتعرف المؤسسة ما الموجود ومن يملكه.",
      ),
    },
    deliverables: {
      body: bi("A tool the team actually uses, on a foundation the organisation controls.", "أداة يستخدمها الفريق فعلاً، على أساس تتحكم فيه المؤسسة."),
      items: [
        bi("Purpose built tool with tested prompts and the team's own examples", "أداة مبنية لغرض محدد بتعليمات مختبرة وأمثلة الفريق نفسه"),
        bi("Integration with the gateway, logging and data rules", "تكامل مع البوابة والسجلات وقواعد البيانات"),
        bi("Short user guide and an entry in the organisation's AI tool catalogue", "دليل مستخدم قصير وإدخال في فهرس أدوات الذكاء الاصطناعي في المؤسسة"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Teams get the capability they were going to find anyway, but inside your boundaries, with your data rules, and in weeks rather than quarters.",
        "تحصل الفرق على القدرة التي كانت ستجدها على أي حال، لكن داخل حدودك، وبقواعد بياناتك، وخلال أسابيع لا أرباع سنوات.",
      ),
    },
    related: ["ai-api-model-integration", "custom-business-software", "enterprise-ai-assistants"],
  },
  {
    slug: "ai-customer-experiences",
    practice: "artificial-intelligence",
    pictogram: "web",
    title: bi("AI Customer Experiences", "تجارب العملاء بالذكاء الاصطناعي"),
    summary: bi("Customer facing assistants and features that are accurate, on brand, bilingual and safe to put in front of the public.", "مساعدون وميزات موجهة للعملاء دقيقة ومتوافقة مع العلامة وثنائية اللغة وآمنة للعرض أمام الجمهور."),
    hero: bi("Anything you put in front of customers speaks for you. We build AI experiences that can be trusted to do that.", "كل ما تضعه أمام عملائك يتحدث باسمك. نبني تجارب ذكاء اصطناعي يمكن الوثوق بها لتفعل ذلك."),
    seo: {
      title: bi("AI Customer Experiences", "تجارب العملاء بالذكاء الاصطناعي"),
      description: bi("Customer facing AI by CyBarq: support assistants, guided self service and personalised features grounded in your knowledge base, with guardrails, escalation to humans and Arabic and English support.", "ذكاء اصطناعي موجه للعملاء من سايبرق: مساعدو دعم، وخدمة ذاتية موجهة، وميزات مخصصة مبنية على قاعدة معرفتك، مع ضوابط وتصعيد إلى البشر ودعم للعربية والإنجليزية."),
    },
    problem: {
      body: bi(
        "Customer facing AI carries the highest stakes: a wrong answer about a price, a policy or a delivery is a complaint at best and a liability at worst. Generic chatbots frustrate customers because they do not know your business, and unrestricted ones embarrass it because they will say anything. Arabic speaking customers are often served worst of all.",
        "الذكاء الاصطناعي الموجه للعملاء يحمل أعلى المخاطر: إجابة خاطئة عن سعر أو سياسة أو موعد تسليم هي شكوى في أحسن الأحوال ومسؤولية قانونية في أسوئها. روبوتات المحادثة العامة تُحبط العملاء لأنها لا تعرف عملك، وغير المقيدة منها تُحرجه لأنها تقول أي شيء. والعملاء الناطقون بالعربية غالباً هم الأسوأ خدمةً.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Customer support on websites and messaging channels, order and account self service, product guidance and recommendations, onboarding flows, and after hours coverage where a human team is not available.",
        "في دعم العملاء على المواقع وقنوات المراسلة، والخدمة الذاتية للطلبات والحسابات، وإرشادات المنتجات والتوصيات، ومسارات تهيئة العملاء الجدد، والتغطية خارج ساعات العمل حين لا يتوفر فريق بشري.",
      ),
    },
    approach: {
      body: bi(
        "Answers are grounded in your approved knowledge base and, where relevant, in the customer's own account data through authenticated integrations. The assistant is constrained to your domain, declines what it should not answer, and hands over to a person with full context when needed. Tone and terminology follow your brand in both languages. We test with adversarial inputs before launch and monitor conversations for quality afterwards.",
        "تُبنى الإجابات على قاعدة معرفتك المعتمدة، وعند الحاجة على بيانات حساب العميل نفسه عبر تكاملات موثّقة. ويُقيَّد المساعد بمجالك، ويرفض ما لا ينبغي أن يجيب عنه، ويحوّل إلى شخص مع السياق الكامل عند الحاجة. وتتبع النبرة والمصطلحات علامتك في اللغتين. ونختبر بمدخلات عدائية قبل الإطلاق ونراقب المحادثات للجودة بعده.",
      ),
    },
    engagement: {
      body: bi(
        "We start from your existing support data: the questions customers really ask and the answers your team gives. The assistant is built against that, reviewed by your support leads, and launched to a fraction of traffic with clear escalation paths. Coverage widens as resolution rates and satisfaction justify it. Reporting shows what was resolved, what was escalated and why.",
        "نبدأ من بيانات الدعم الحالية لديك: الأسئلة التي يطرحها العملاء فعلاً والإجابات التي يقدمها فريقك. يُبنى المساعد على هذا الأساس، ويراجعه قادة الدعم لديك، ويُطلق على جزء من الحركة مع مسارات تصعيد واضحة. وتتسع التغطية كلما بررت معدلات الحل ورضا العملاء ذلك. وتُظهر التقارير ما حُل وما صُعّد ولماذا.",
      ),
    },
    deliverables: {
      body: bi("A customer experience you would be comfortable having a journalist test.", "تجربة عملاء لا تمانع أن يختبرها صحفي."),
      items: [
        bi("Customer facing assistant grounded in your knowledge base and account data", "مساعد موجه للعملاء مبني على قاعدة معرفتك وبيانات الحسابات"),
        bi("Guardrails, escalation to humans and bilingual brand voice", "ضوابط وتصعيد إلى البشر وصوت علامة ثنائي اللغة"),
        bi("Adversarial test results, conversation quality monitoring and reporting", "نتائج اختبارات عدائية ومراقبة لجودة المحادثات وتقارير"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Customers get accurate answers at any hour in the language they prefer, your team handles the conversations that need judgement, and the assistant represents your business the way you would.",
        "يحصل العملاء على إجابات دقيقة في أي ساعة وباللغة التي يفضلونها، ويتولى فريقك المحادثات التي تحتاج إلى تقدير بشري، ويمثّل المساعد عملك كما تفعل أنت.",
      ),
    },
    related: ["enterprise-ai-assistants", "rag-knowledge-systems", "enterprise-web-platforms"],
  },
];
