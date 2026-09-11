import { bi, type ServiceContent } from "./registry";

/**
 * Cybersecurity practice. The six original CyBarq services are carried over
 * (their problem, approach and outcome copy improved, not replaced) and joined
 * by security assessments and consulting.
 */
export const cybersecurityServices: ServiceContent[] = [
  {
    slug: "penetration-testing",
    practice: "cybersecurity",
    pictogram: "cybersecurity",
    featured: true,
    title: bi("Penetration Testing", "اختبار الاختراق"),
    summary: bi("Realistic attack simulation against your applications, networks, cloud and internal systems.", "محاكاة هجوم واقعية على تطبيقاتك وشبكاتك وبيئتك السحابية وأنظمتك الداخلية."),
    hero: bi("We test your systems the way a skilled attacker would, then show you exactly what to fix and in what order.", "نختبر أنظمتك كما يفعل مهاجم محترف، ثم نريك بالضبط ما الذي يجب إصلاحه وبأي ترتيب."),
    seo: {
      title: bi("Penetration Testing", "اختبار الاختراق"),
      description: bi("Manual, evidence based penetration testing of web applications, APIs, networks, cloud and internal systems by CyBarq in Amman. Clear findings, remediation guidance and retesting.", "اختبار اختراق يدوي مدعوم بالأدلة لتطبيقات الويب وواجهات البرمجة والشبكات والبيئات السحابية والأنظمة الداخلية من سايبرق في عمّان. نتائج واضحة، إرشادات معالجة، وإعادة اختبار."),
    },
    problem: {
      body: bi(
        "Cyber threats evolve constantly, and most organisations do not know where their weakest points really are. Automated scanners miss the vulnerabilities that skilled attackers exploit most easily: logic flaws, chained weaknesses, misconfigurations that only make sense in context. Without a clear, human assessment, those risks stay hidden until they become a costly breach.",
        "تتطور التهديدات باستمرار، ومعظم المؤسسات لا تعرف نقاط ضعفها الحقيقية. أدوات الفحص الآلي وحدها تغفل عن الثغرات التي يستغلها المهاجمون المحترفون بسهولة: أخطاء في منطق التطبيق، وسلاسل من نقاط الضعف الصغيرة، وإعدادات خاطئة لا يظهر خطرها إلا في سياقها. ومن دون تقييم بشري واضح تبقى هذه المخاطر مخفية إلى أن تتحول إلى اختراق مكلف.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Customer facing web applications and APIs, mobile apps and the backends behind them, external network perimeters, cloud accounts and the internal network an attacker reaches after one successful phishing email. It also appears in the places nobody owns: forgotten test environments, shared credentials, and integrations added under time pressure.",
        "في تطبيقات الويب وواجهات البرمجة الموجهة للعملاء، وفي تطبيقات الهاتف والخوادم التي تقف خلفها، وفي محيط الشبكة الخارجي، وفي الحسابات السحابية، وفي الشبكة الداخلية التي يصل إليها المهاجم بعد رسالة تصيد واحدة ناجحة. ويظهر أيضاً في الأماكن التي لا يملكها أحد: بيئات اختبار منسية، وبيانات دخول مشتركة، وتكاملات أُضيفت على عجل.",
      ),
    },
    approach: {
      body: bi(
        "Our penetration testing simulates real attacks using advanced manual techniques supported by intelligent tooling. We examine applications, networks, cloud assets and internal systems with the mindset of an adversary: what can be reached, what can be chained, and what an attacker would actually do with it. Every finding is supported by evidence and paired with practical, actionable remediation steps.",
        "نحاكي هجمات حقيقية بخبرة يدوية متقدمة تدعمها أدوات ذكية. نفحص التطبيقات والشبكات والأصول السحابية والأنظمة الداخلية بعقلية المهاجم: ما الذي يمكن الوصول إليه، وما الذي يمكن ربطه ببعضه، وماذا سيفعل المهاجم به فعلاً. كل ثغرة نسلّمها مدعومة بالدليل ومعها خطوات معالجة عملية قابلة للتنفيذ.",
      ),
    },
    engagement: {
      body: bi(
        "We start with scoping: which assets are in scope, which are not, the testing window and the rules of engagement, all agreed in writing before anything is touched. Testing runs against a written authorisation, with a named lead you can reach at any time. Critical findings are reported the moment they are confirmed, not at the end. The engagement closes with a walkthrough of the report with your technical team.",
        "نبدأ بتحديد النطاق: ما الأصول المشمولة وما غير المشمول، ونافذة الاختبار، وقواعد التعامل، وكل ذلك متفق عليه كتابةً قبل لمس أي شيء. يجري الاختبار بموجب تفويض مكتوب، ومع مسؤول محدد يمكنك الوصول إليه في أي وقت. الثغرات الحرجة نبلّغ عنها لحظة تأكيدها، لا في نهاية العمل. ونختم بجلسة مراجعة للتقرير مع فريقك التقني.",
      ),
    },
    deliverables: {
      body: bi("You receive one report written for two audiences: a management summary that explains the risk in business terms, and a technical section your engineers can act on directly.", "تتسلم تقريراً واحداً مكتوباً لجمهورين: ملخص للإدارة يشرح المخاطر بلغة الأعمال، وقسم تقني يستطيع مهندسوك العمل به مباشرة."),
      items: [
        bi("Findings rated by severity, each with evidence and reproduction steps", "ثغرات مصنفة حسب الخطورة، ولكل منها دليل وخطوات إعادة إنتاج"),
        bi("A prioritised remediation plan", "خطة معالجة مرتبة حسب الأولوية"),
        bi("A retest of fixed findings and a closure letter", "إعادة اختبار للثغرات المعالجة وخطاب إغلاق"),
      ],
    },
    extraSections: [
      {
        heading: bi("Findings and remediation guidance", "النتائج وإرشادات المعالجة"),
        body: bi(
          "A finding is only useful if your team can act on it. For every issue we explain what it is, how we exploited it, what an attacker could gain, and the specific change that closes it: a configuration, a code pattern, a control. Where a fix is not immediate we suggest a compensating control so the risk is reduced while the permanent change is planned.",
          "لا قيمة لأي ثغرة إن لم يستطع فريقك التعامل معها. لكل مشكلة نشرح ما هي، وكيف استغللناها، وما الذي يمكن أن يكسبه المهاجم منها، والتغيير المحدد الذي يغلقها: إعداد، أو نمط برمجي، أو ضابط تحكم. وحين لا يكون الإصلاح فورياً نقترح ضابطاً تعويضياً يقلل المخاطر ريثما يُخطط للتغيير الدائم.",
        ),
      },
      {
        heading: bi("Retesting", "إعادة الاختبار"),
        body: bi(
          "Once your team has applied the fixes, we retest each finding and confirm whether it is closed. The report is updated with the retest result so you hold a record of what was found, what was fixed, and what was verified.",
          "بعد أن يطبّق فريقك الإصلاحات، نعيد اختبار كل ثغرة ونؤكد ما إذا أُغلقت. ويُحدَّث التقرير بنتيجة إعادة الاختبار، فيبقى لديك سجل بما وُجد، وما أُصلح، وما جرى التحقق منه.",
        ),
      },
    ],
    businessMeaning: {
      body: bi(
        "You know exactly where you stand: a full picture of your vulnerabilities and a prioritised roadmap to close them, so your team can secure systems and protect data with confidence. It also gives you something to show a client, a regulator or a board: independent evidence that the system was tested and the findings were addressed.",
        "تعرف بالضبط أين تقف: صورة كاملة عن ثغراتك، وخطة معالجة مرتبة حسب الأولوية، ليتمكن فريقك من تأمين الأنظمة وحماية البيانات بثقة. وتحصل أيضاً على ما تقدمه لعميل أو جهة رقابية أو مجلس إدارة: دليل مستقل على أن النظام اختُبر وأن النتائج عولجت.",
      ),
    },
    related: ["security-assessments", "compromise-assessment", "security-consulting-architecture"],
  },
  {
    slug: "digital-forensics-incident-response",
    practice: "cybersecurity",
    pictogram: "response",
    featured: true,
    title: bi("Digital Forensics & Incident Response", "التحقيق الرقمي والاستجابة للحوادث"),
    summary: bi("When something has happened: find out what, contain it, and recover with the evidence intact.", "عندما يقع شيء ما: نعرف ماذا حدث، ونحتويه، ونعيدك إلى العمل مع الحفاظ على الأدلة."),
    hero: bi("When an incident hits, you need to know what happened, whether it is over, and how to get back to normal. We answer all three.", "حين يقع حادث أمني تحتاج أن تعرف ماذا حدث، وهل انتهى، وكيف تعود إلى وضعك الطبيعي. نجيب عن الأسئلة الثلاثة."),
    seo: {
      title: bi("Digital Forensics and Incident Response (DFIR)", "التحقيق الرقمي والاستجابة للحوادث"),
      description: bi("Incident response and digital forensics from CyBarq: investigation across endpoints, servers, logs and network traffic, attack timeline reconstruction, containment, evidence preservation and guided recovery.", "استجابة للحوادث وتحقيق رقمي من سايبرق: تحقيق في الأجهزة والخوادم والسجلات وحركة الشبكة، إعادة بناء الجدول الزمني للهجوم، الاحتواء، حفظ الأدلة، ومرافقة التعافي."),
    },
    problem: {
      body: bi(
        "Security incidents disrupt operations, expose sensitive data and damage reputation. Many organisations struggle to identify what happened, how it happened, or whether the attackers still have access. Acting without that clarity means restoring systems that are still compromised, or destroying the evidence you will later need.",
        "عندما يقع حادث أمني تتعطل الأعمال وتتعرض البيانات للخطر وتتضرر السمعة. وكثير من المؤسسات لا تعرف ما الذي حدث فعلاً، ولا كيف حدث، ولا ما إذا كان المهاجم ما يزال داخل أنظمتها. والتصرف من دون هذا الوضوح يعني استعادة أنظمة ما تزال مخترقة، أو إتلاف أدلة ستحتاجها لاحقاً.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Ransomware on file servers and workstations, business email compromise and fraudulent payment requests, a web application defaced or abused, credentials found in a public leak, or an alert from a partner or regulator that your data is circulating. It often begins with a small anomaly that someone noticed and could not explain.",
        "برامج فدية على خوادم الملفات وأجهزة الموظفين، اختراق بريد العمل وطلبات دفع احتيالية، تطبيق ويب تعرّض للتشويه أو الاستغلال، بيانات دخول ظهرت في تسريب عام، أو تنبيه من شريك أو جهة رقابية بأن بياناتك متداولة. وكثيراً ما يبدأ الأمر بخلل صغير لاحظه أحدهم ولم يجد له تفسيراً.",
      ),
    },
    approach: {
      body: bi(
        "Our DFIR specialists conduct deep investigations across endpoints, servers, logs and network traffic. We reconstruct the full attack timeline, identify the attacker's path and the systems and data they touched, and preserve evidence in a way that holds up to legal and regulatory scrutiny. After containing the threat we guide you step by step through recovery, and we tell you plainly what allowed the incident to happen.",
        "يحقق فريقنا بعمق في الأجهزة والخوادم والسجلات وحركة الشبكة، ويعيد بناء القصة الكاملة للهجوم: من أين دخل المهاجم، وماذا فعل، وما الأنظمة والبيانات التي وصل إليها، مع حفظ الأدلة بطريقة تصمد أمام أي مراجعة قانونية أو رقابية. نحتوي التهديد، ثم نرافقك خطوة بخطوة حتى تعود أعمالك إلى طبيعتها، ونخبرك بوضوح ما الذي سمح للحادث بأن يقع.",
      ),
    },
    engagement: {
      body: bi(
        "Incident response starts with a call. We agree on immediate containment steps you can take safely, then collect evidence before anything is rebuilt. Investigation and containment run in parallel, with a short written update at the end of every day. Recovery is planned with your team so that systems come back clean and in the right order. Organisations that want faster response can agree on a retainer in advance, with contacts, access and procedures already in place.",
        "تبدأ الاستجابة باتصال. نتفق على خطوات احتواء فورية يمكنك تنفيذها بأمان، ثم نجمع الأدلة قبل إعادة بناء أي شيء. يسير التحقيق والاحتواء بالتوازي، مع تحديث مكتوب قصير في نهاية كل يوم. ونخطط للتعافي مع فريقك لتعود الأنظمة نظيفة وبالترتيب الصحيح. والمؤسسات التي تريد استجابة أسرع يمكنها الاتفاق مسبقاً على عقد جاهزية تكون فيه جهات الاتصال والصلاحيات والإجراءات معدّة سلفاً.",
      ),
    },
    deliverables: {
      body: bi("Everything you need to make decisions during the incident and to answer questions after it.", "كل ما تحتاجه لاتخاذ القرارات أثناء الحادث وللإجابة عن الأسئلة بعده."),
      items: [
        bi("Attack timeline, root cause and scope of affected systems and data", "الجدول الزمني للهجوم، والسبب الجذري، ونطاق الأنظمة والبيانات المتأثرة"),
        bi("Preserved evidence with a documented chain of custody", "أدلة محفوظة مع سلسلة حيازة موثقة"),
        bi("Containment and recovery plan, then a final incident report with lessons learned", "خطة احتواء وتعافٍ، ثم تقرير نهائي للحادث مع الدروس المستفادة"),
      ],
    },
    businessMeaning: {
      body: bi(
        "You regain control quickly, with a clear picture of what happened and what it affected. You can report to clients, insurers and regulators with facts rather than guesses, and you come out of the incident with the specific changes that stop it from happening again.",
        "تستعيد السيطرة بسرعة، ومعك صورة واضحة عمّا حدث وما الذي تأثر به. تستطيع إبلاغ العملاء وشركات التأمين والجهات الرقابية بحقائق لا بتخمينات، وتخرج من الحادث بتغييرات محددة تمنع تكراره.",
      ),
    },
    related: ["compromise-assessment", "penetration-testing", "professional-security-services"],
  },
  {
    slug: "training-awareness",
    practice: "cybersecurity",
    pictogram: "certification",
    title: bi("Cybersecurity Training & Awareness", "التدريب والتوعية بالأمن السيبراني"),
    summary: bi("Practical training and realistic phishing simulations that change how people behave, not just what they know.", "تدريب عملي ومحاكاة تصيد واقعية تغيّر سلوك الناس لا معلوماتهم فقط."),
    hero: bi("Most successful attacks start with a person. We help your people recognise them and respond well.", "معظم الهجمات الناجحة تبدأ بإنسان. نساعد فريقك على التعرف عليها والتصرف بشكل صحيح."),
    seo: {
      title: bi("Cybersecurity Training and Awareness", "التدريب والتوعية بالأمن السيبراني"),
      description: bi("Security awareness programmes, phishing simulations and hands on workshops from CyBarq, tailored to departments and roles, with measurable results over time.", "برامج توعية أمنية ومحاكاة تصيد وورش عملية من سايبرق، مصممة لكل إدارة ودور وظيفي، بنتائج قابلة للقياس مع الوقت."),
    },
    problem: {
      body: bi(
        "Human error remains one of the leading causes of successful cyberattacks. A single phishing email that one employee acts on can bypass your strongest technical defences. Generic once a year training does not change behaviour, and people rarely remember a slide deck when a convincing email arrives on a busy afternoon.",
        "الخطأ البشري من أكثر أسباب نجاح الهجمات شيوعاً. رسالة تصيد واحدة يقع فيها موظف قد تتجاوز أقوى الدفاعات التقنية لديك. والتدريب العام الذي يُعقد مرة في السنة لا يغيّر السلوك، وقلّما يتذكر أحد عرضاً تقديمياً حين تصله رسالة مقنعة في ظهيرة يوم مزدحم.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Finance teams that process payment requests, executives whose names are used in impersonation, IT staff with privileged access, new joiners who do not yet know what normal looks like, and anyone who handles client data. The weak point is rarely a lack of intelligence. It is a lack of practice.",
        "في فرق المالية التي تعالج طلبات الدفع، وفي المديرين الذين تُستخدم أسماؤهم في انتحال الشخصية، وفي موظفي تقنية المعلومات أصحاب الصلاحيات العالية، وفي الموظفين الجدد الذين لا يعرفون بعد شكل الوضع الطبيعي، وفي كل من يتعامل مع بيانات العملاء. نقطة الضعف نادراً ما تكون نقص ذكاء، بل نقص تمرين.",
      ),
    },
    approach: {
      body: bi(
        "We provide engaging training, realistic phishing simulations and hands on workshops tailored to different departments and roles. Content uses the situations your people actually face, in their language, with the systems they use. Simulations run over time so you can see whether behaviour is changing, and the results feed back into the next round of training rather than into blame.",
        "نقدم تدريباً عملياً وجذاباً، مع محاكاة تصيد واقعية وورش مخصصة لكل إدارة ودور وظيفي. المحتوى مبني على المواقف التي يواجهها موظفوك فعلاً، بلغتهم، وعلى الأنظمة التي يستخدمونها. وتستمر المحاكاة على فترات لترى ما إذا كان السلوك يتغير، وتُستخدم النتائج لتحسين الجولة التالية من التدريب، لا لتوجيه اللوم.",
      ),
    },
    engagement: {
      body: bi(
        "We begin with a short baseline: a simulation and a conversation with the people who own the risk. From there we agree on a programme: sessions per department, simulation frequency, and how results are reported. Sessions run on site in Amman or remotely, in Arabic or English. Executive briefings are short and specific to the decisions leadership makes.",
        "نبدأ بقياس أولي قصير: محاكاة وحوار مع المسؤولين عن المخاطر. ثم نتفق على برنامج: جلسات لكل إدارة، ووتيرة المحاكاة، وطريقة عرض النتائج. تُعقد الجلسات حضورياً في عمّان أو عن بُعد، بالعربية أو الإنجليزية. أما إحاطات الإدارة العليا فقصيرة ومركزة على القرارات التي تتخذها القيادة.",
      ),
    },
    deliverables: {
      body: bi("A programme, not a single event.", "برنامج متكامل، لا فعالية واحدة."),
      items: [
        bi("Role based training sessions and materials in Arabic and English", "جلسات ومواد تدريبية حسب الدور الوظيفي بالعربية والإنجليزية"),
        bi("Phishing simulation campaigns with results by department over time", "حملات محاكاة تصيد مع نتائج لكل إدارة عبر الزمن"),
        bi("A simple reporting procedure your staff can use when something looks wrong", "إجراء إبلاغ بسيط يستخدمه موظفوك عندما يبدو شيء ما مريباً"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Fewer incidents that start with a click, faster reporting when something does get through, and a workforce that treats security as part of doing the job well. It is also one of the few controls that improves every other control you have.",
        "حوادث أقل تبدأ بنقرة، وإبلاغ أسرع حين ينجح شيء ما في المرور، وفريق يتعامل مع الأمن كجزء من إتقان العمل. وهو من الضوابط القليلة التي تحسّن كل ضابط آخر لديك.",
      ),
    },
    related: ["professional-security-services", "penetration-testing", "security-assessments"],
  },
  {
    slug: "compromise-assessment",
    practice: "cybersecurity",
    pictogram: "monitoring",
    title: bi("Compromise Assessment", "تقييم الاختراق"),
    summary: bi("A targeted hunt for signs that an attacker is already inside your environment.", "بحث موجّه عن أي أثر لمهاجم موجود فعلاً داخل بيئتك."),
    hero: bi("Some attackers are quiet. A compromise assessment answers one question: is anyone already inside?", "بعض المهاجمين يعملون بصمت. تقييم الاختراق يجيب عن سؤال واحد: هل هناك من هو داخل أنظمتك الآن؟"),
    seo: {
      title: bi("Compromise Assessment", "تقييم الاختراق"),
      description: bi("Threat hunting across endpoints, servers and network evidence to detect hidden or persistent intrusions, by CyBarq. Clear answer on whether your environment is compromised and what to do next.", "اصطياد تهديدات عبر الأجهزة والخوادم وأدلة الشبكة للكشف عن اختراقات خفية أو مستمرة، من سايبرق. إجابة واضحة عمّا إذا كانت بيئتك مخترقة وما الخطوة التالية."),
    },
    problem: {
      body: bi(
        "Sophisticated threats, especially advanced persistent threats, are designed to slip into environments quietly and stay hidden for long periods. Traditional monitoring tools often miss them because they look like normal activity. By the time the intrusion is obvious, data has usually been leaving for months.",
        "التهديدات المتقدمة، وخصوصاً التهديدات المستمرة، مصممة لتدخل بهدوء وتبقى مختبئة لفترات طويلة. وأدوات المراقبة التقليدية كثيراً ما تغفل عنها لأنها تبدو نشاطاً طبيعياً. وحين يصبح الاختراق واضحاً تكون البيانات في الغالب قد تسربت منذ شهور.",
      ),
    },
    whereItAppears: {
      body: bi(
        "After a merger or acquisition, before connecting a new partner to your network, when a supplier reports a breach, when unexplained activity has been seen but not investigated, or simply when leadership wants an honest answer rather than an assumption. It is also a sensible check before a major launch or audit.",
        "بعد اندماج أو استحواذ، وقبل ربط شريك جديد بشبكتك، وحين يبلغ مورّد عن اختراق، وحين يُلاحظ نشاط غير مفسر ولم يُحقق فيه، أو ببساطة حين تريد الإدارة إجابة صادقة لا افتراضاً. وهو فحص معقول أيضاً قبل إطلاق كبير أو تدقيق.",
      ),
    },
    approach: {
      body: bi(
        "Our compromise assessment is a deep, targeted review of your environment. We combine threat hunting, endpoint and network forensics, behavioural analysis and indicators linked to known threat groups to uncover hidden activity, persistence mechanisms and traces of data theft. We look for what the tools were not configured to see.",
        "نفحص بيئتك فحصاً معمقاً وموجّهاً بحثاً عن أي أثر لتسلل: اصطياد تهديدات متقدم، وتحليل جنائي للأجهزة والشبكة، وتحليل سلوكي، ومقارنة بمؤشرات مجموعات الهجوم المعروفة عالمياً، للكشف عن النشاط الخفي وآليات البقاء وآثار سرقة البيانات. نبحث عمّا لم تُضبط الأدوات لرؤيته.",
      ),
    },
    engagement: {
      body: bi(
        "We agree on the scope: which systems, which time window, which data sources. Collection is done with minimal disruption, using your existing telemetry where it exists and lightweight collectors where it does not. Analysis takes a defined number of days. If we find an active intrusion, the assessment turns into incident response on the spot, with your agreement.",
        "نتفق على النطاق: أي الأنظمة، وأي نافذة زمنية، وأي مصادر بيانات. يجري الجمع بأقل قدر من التعطيل، باستخدام بيانات المراقبة الموجودة لديك حيث توجد، وأدوات جمع خفيفة حيث لا توجد. ويستغرق التحليل عدداً محدداً من الأيام. وإذا وجدنا اختراقاً نشطاً، يتحول التقييم فوراً إلى استجابة للحادث بموافقتك.",
      ),
    },
    deliverables: {
      body: bi("A definite answer and the evidence behind it.", "إجابة قاطعة والأدلة التي تدعمها."),
      items: [
        bi("A statement of whether compromise was found, with supporting evidence", "بيان بما إذا وُجد اختراق، مع الأدلة الداعمة"),
        bi("Details of any persistence, lateral movement or data access identified", "تفاصيل أي آليات بقاء أو تحرك داخلي أو وصول إلى بيانات"),
        bi("Detection gaps and the monitoring changes that would close them", "فجوات الكشف والتغييرات في المراقبة التي تغلقها"),
      ],
    },
    businessMeaning: {
      body: bi(
        "You either confirm that your environment is clean, with evidence, or you find an intrusion early and on your own terms. Either way you gain visibility into weaknesses and a clear set of actions to strengthen defences before they are tested for real.",
        "إما أن تتأكد بالدليل أن بيئتك نظيفة، أو تكتشف اختراقاً مبكراً وبشروطك أنت. وفي الحالتين تحصل على رؤية واضحة لنقاط الضعف ومجموعة إجراءات محددة لتقوية دفاعاتك قبل أن تُختبر فعلياً.",
      ),
    },
    related: ["digital-forensics-incident-response", "penetration-testing", "observability"],
  },
  {
    slug: "security-assessments",
    practice: "cybersecurity",
    pictogram: "assessment",
    title: bi("Security Assessments", "التقييمات الأمنية"),
    summary: bi("Configuration, cloud, architecture and code reviews that show where controls are missing or misapplied.", "مراجعات للإعدادات والبيئة السحابية والبنية والشيفرة تُظهر أين تغيب الضوابط أو تُطبق خطأً."),
    hero: bi("Not every weakness needs an attack to find it. A structured assessment shows where your controls stand against what they are supposed to do.", "ليست كل نقطة ضعف تحتاج هجوماً لاكتشافها. التقييم المنهجي يُظهر أين تقف ضوابطك مقارنة بما يُفترض أن تفعله."),
    seo: {
      title: bi("Security Assessments", "التقييمات الأمنية"),
      description: bi("Cloud configuration reviews, secure architecture reviews, code reviews and control gap assessments from CyBarq, mapped to recognised frameworks and written for action.", "مراجعات إعدادات البيئة السحابية، ومراجعات البنية الآمنة، ومراجعات الشيفرة، وتقييمات فجوات الضوابط من سايبرق، مرتبطة بأطر معترف بها ومكتوبة للتنفيذ."),
    },
    problem: {
      body: bi(
        "Most environments are not insecure by design. They drift. A cloud account grows over three years, permissions accumulate, a firewall rule added for one project is never removed, a library is never updated. Nobody has a current picture of the whole, and a penetration test alone will not show what is merely fragile rather than already broken.",
        "معظم البيئات لم تُصمم لتكون غير آمنة، لكنها تنجرف مع الوقت. حساب سحابي ينمو على مدى ثلاث سنوات، وصلاحيات تتراكم، وقاعدة جدار ناري أُضيفت لمشروع واحد ولم تُزل، ومكتبة لم تُحدَّث. لا أحد يملك صورة حالية للمشهد كاملاً، واختبار الاختراق وحده لا يُظهر ما هو هش ولم يُكسر بعد.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Cloud accounts on AWS, Azure or Google Cloud, Microsoft 365 and identity configuration, network segmentation, application code and dependencies, and the gap between a written policy and what is actually enforced. It is common before certification audits, after a change of provider, and when a client questionnaire asks questions nobody can answer with confidence.",
        "في الحسابات السحابية على AWS أو Azure أو Google Cloud، وفي إعدادات Microsoft 365 والهوية، وفي تقسيم الشبكة، وفي شيفرة التطبيقات ومكتباتها، وفي الفجوة بين السياسة المكتوبة وما يُطبق فعلاً. ويظهر كثيراً قبل تدقيقات الشهادات، وبعد تغيير مزوّد خدمة، وحين يطرح استبيان عميل أسئلة لا يستطيع أحد الإجابة عنها بثقة.",
      ),
    },
    approach: {
      body: bi(
        "We choose the assessment that matches the question: a cloud configuration review against provider best practice, an architecture review of a system before it is built or expanded, a code review focused on security, or a control gap assessment against a framework such as ISO 27001 or the NIST Cybersecurity Framework. The output is always the same shape: what is in place, what is missing, why it matters, and what to do.",
        "نختار نوع التقييم الذي يناسب السؤال: مراجعة إعدادات سحابية وفق أفضل ممارسات المزوّد، أو مراجعة بنية نظام قبل بنائه أو توسيعه، أو مراجعة شيفرة تركّز على الأمان، أو تقييم فجوات الضوابط وفق إطار مثل ISO 27001 أو إطار NIST للأمن السيبراني. والمخرجات دائماً بالشكل نفسه: ما هو موجود، وما هو ناقص، ولماذا يهم، وماذا تفعل.",
      ),
    },
    engagement: {
      body: bi(
        "Assessments are mostly read only. We need documentation, read access to the relevant consoles or repositories, and time with the people who run the systems. Fieldwork takes one to three weeks depending on scope. We review the draft with your team before it is final so that context is not missing from the findings.",
        "التقييمات في معظمها قراءة فقط. نحتاج إلى الوثائق، وصلاحية قراءة على لوحات التحكم أو المستودعات المعنية، ووقتاً مع من يشغّلون الأنظمة. ويستغرق العمل الميداني من أسبوع إلى ثلاثة أسابيع حسب النطاق. ونراجع المسودة مع فريقك قبل اعتمادها حتى لا يغيب السياق عن النتائج.",
      ),
    },
    deliverables: {
      body: bi("A report you can hand to an auditor and a plan you can hand to an engineer.", "تقرير تسلّمه لمدقق، وخطة تسلّمها لمهندس."),
      items: [
        bi("Findings with severity, evidence and the control or configuration that resolves each", "نتائج مع درجة الخطورة والدليل والضابط أو الإعداد الذي يعالج كلاً منها"),
        bi("A mapping to the framework or benchmark you care about", "ربط بالإطار أو المعيار الذي يهمك"),
        bi("A prioritised improvement plan with effort estimates", "خطة تحسين مرتبة حسب الأولوية مع تقدير للجهد"),
      ],
    },
    businessMeaning: {
      body: bi(
        "You replace assumptions with an inventory of real controls and real gaps. Budget goes to the changes that reduce the most risk, audit preparation stops being a scramble, and client questionnaires get answered from evidence.",
        "تستبدل الافتراضات بجرد حقيقي للضوابط والفجوات. تذهب الميزانية إلى التغييرات التي تقلل المخاطر أكثر، ويتوقف الاستعداد للتدقيق عن كونه سباقاً مع الوقت، وتُجاب استبيانات العملاء من الأدلة.",
      ),
    },
    related: ["penetration-testing", "security-consulting-architecture", "cloud-architecture"],
  },
  {
    slug: "professional-security-services",
    practice: "cybersecurity",
    pictogram: "protection",
    title: bi("Professional Security Services", "خدمات الأمن المهنية"),
    summary: bi("Ongoing security leadership, governance and operations support for teams that need more than tooling.", "قيادة أمنية مستمرة، وحوكمة، ودعم للعمليات لفرق تحتاج أكثر من مجرد أدوات."),
    hero: bi("Modern security requires more than tooling. We work alongside your teams to build the practices that make the tools worth having.", "الأمن الحديث يحتاج أكثر من الأدوات. نعمل إلى جانب فرقك لبناء الممارسات التي تجعل هذه الأدوات ذات قيمة."),
    seo: {
      title: bi("Professional Security Services", "خدمات الأمن المهنية"),
      description: bi("Security maturity assessment, governance, policies, virtual CISO support and ongoing security operations guidance from CyBarq for organisations without a full in house security team.", "تقييم النضج الأمني، والحوكمة، والسياسات، ودعم مدير أمن معلومات افتراضي، وإرشاد مستمر للعمليات الأمنية من سايبرق للمؤسسات التي لا تملك فريق أمن داخلياً كاملاً."),
    },
    problem: {
      body: bi(
        "Modern security requires more than tooling. Without aligned architecture, mature processes and clear governance, controls drift, gaps multiply and the tools you paid for end up half configured. Many organisations cannot justify a full security team, yet the responsibility does not go away.",
        "الأدوات وحدها لا تصنع أمناً حقيقياً. فمن دون بنية سليمة وعمليات ناضجة وحوكمة واضحة تنجرف الضوابط، وتتراكم الفجوات، وتنتهي الأدوات التي دفعت ثمنها نصف مضبوطة. وكثير من المؤسسات لا تستطيع تبرير فريق أمن كامل، لكن المسؤولية لا تختفي.",
      ),
    },
    whereItAppears: {
      body: bi(
        "An IT manager who is also the security function, policies written for an audit and never read again, alerts that nobody triages, vendors that no one assesses, and board questions about risk that get answered from memory. It appears whenever security depends on one person's attention rather than on a process.",
        "مدير تقنية معلومات يقوم أيضاً بدور وظيفة الأمن بأكملها، وسياسات كُتبت لتدقيق ولم تُقرأ بعده، وتنبيهات لا يفرزها أحد، ومورّدون لا يقيّمهم أحد، وأسئلة من مجلس الإدارة عن المخاطر تُجاب من الذاكرة. يظهر ذلك كلما اعتمد الأمن على انتباه شخص واحد بدلاً من إجراء.",
      ),
    },
    approach: {
      body: bi(
        "We work alongside your teams to assess maturity, design pragmatic improvements and embed durable practices that scale with your business. That can mean a virtual CISO who owns the security agenda, a governance framework sized for your organisation, policies people can actually follow, vendor and risk management, or steady guidance for the people running day to day operations.",
        "نعمل مع فرقك كشريك واحد: نقيّم مستوى النضج الأمني، ونصمم تحسينات عملية من دون تعقيد، ونرسّخ ممارسات تدوم وتنمو مع أعمالك. قد يعني ذلك مدير أمن معلومات افتراضياً يتولى الأجندة الأمنية، أو إطار حوكمة بحجم يناسب مؤسستك، أو سياسات يستطيع الناس اتباعها فعلاً، أو إدارة للمورّدين والمخاطر، أو إرشاداً منتظماً لمن يشغّلون العمليات اليومية.",
      ),
    },
    engagement: {
      body: bi(
        "We start with a maturity assessment that takes a few weeks and produces a roadmap. From there most clients choose a monthly arrangement: a fixed number of days, a named lead, a standing agenda, and quarterly reporting to leadership. The arrangement is reviewed every six months against the roadmap, and it ends when your own capability no longer needs it.",
        "نبدأ بتقييم للنضج يستغرق بضعة أسابيع وينتج خارطة طريق. بعدها يختار معظم العملاء ترتيباً شهرياً: عدد أيام ثابت، ومسؤول محدد، وأجندة دائمة، وتقارير ربع سنوية للقيادة. يُراجع الترتيب كل ستة أشهر مقابل خارطة الطريق، وينتهي حين لا تعود قدراتك الداخلية بحاجة إليه.",
      ),
    },
    deliverables: {
      body: bi("A security function that runs on a calendar instead of on emergencies.", "وظيفة أمنية تعمل وفق تقويم منتظم بدلاً من حالات الطوارئ."),
      items: [
        bi("Maturity assessment and a prioritised security roadmap", "تقييم للنضج وخارطة طريق أمنية مرتبة حسب الأولوية"),
        bi("Policies, standards and procedures sized for your organisation", "سياسات ومعايير وإجراءات بحجم يناسب مؤسستك"),
        bi("Regular risk reporting for leadership and support for audits and client due diligence", "تقارير مخاطر منتظمة للقيادة ودعم للتدقيقات ومتطلبات العناية الواجبة للعملاء"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Security becomes something the organisation manages rather than something that happens to it. Decisions about risk are made deliberately, with a view of the whole, and you can demonstrate that to clients, partners and regulators without building a department to do it.",
        "يصبح الأمن شيئاً تديره المؤسسة لا شيئاً يحدث لها. تُتخذ قرارات المخاطر عن قصد ومع رؤية للمشهد كاملاً، وتستطيع إثبات ذلك للعملاء والشركاء والجهات الرقابية من دون بناء إدارة كاملة لهذا الغرض.",
      ),
    },
    related: ["security-consulting-architecture", "security-assessments", "training-awareness"],
  },
  {
    slug: "security-consulting-architecture",
    practice: "cybersecurity",
    pictogram: "consulting",
    title: bi("Security Consulting, Architecture & Hardening", "الاستشارات الأمنية والبنية والتحصين"),
    summary: bi("Design decisions and hardening work that make systems harder to attack before they go live.", "قرارات تصميم وأعمال تحصين تجعل الأنظمة أصعب على الهجوم قبل إطلاقها."),
    hero: bi("The cheapest vulnerability to fix is the one that was never built. We help you design and harden systems so it stays that way.", "أرخص ثغرة تُصلحها هي التي لم تُبنَ أصلاً. نساعدك على تصميم الأنظمة وتحصينها لتبقى كذلك."),
    seo: {
      title: bi("Security Consulting, Architecture and Hardening", "الاستشارات الأمنية والبنية والتحصين"),
      description: bi("Secure architecture design, threat modelling, hardening of servers, cloud and identity, and security advice for engineering teams from CyBarq.", "تصميم بنية آمنة، ونمذجة التهديدات، وتحصين الخوادم والبيئات السحابية والهوية، واستشارات أمنية لفرق الهندسة من سايبرق."),
    },
    problem: {
      body: bi(
        "Security added at the end of a project is expensive and incomplete. Architectural choices, such as how services trust each other, where secrets live and how users are identified, decide most of the risk before a single line of code is reviewed. Default configurations of servers, cloud services and identity providers are built for convenience, not for your threat model.",
        "الأمن الذي يُضاف في نهاية المشروع مكلف وناقص. فالخيارات المعمارية، مثل كيف تثق الخدمات ببعضها، وأين تُحفظ الأسرار، وكيف تُحدَّد هوية المستخدمين، تقرر معظم المخاطر قبل مراجعة سطر واحد من الشيفرة. والإعدادات الافتراضية للخوادم والخدمات السحابية ومزوّدي الهوية مبنية للراحة، لا لنموذج التهديد الخاص بك.",
      ),
    },
    whereItAppears: {
      body: bi(
        "New platforms about to be designed, systems moving to the cloud, integrations between organisations, identity and single sign on rollouts, and production estates that were never hardened beyond their defaults. It also appears when an engineering team is asked a security question by a client and has no one to turn to.",
        "في المنصات الجديدة التي على وشك التصميم، والأنظمة المنتقلة إلى السحابة، والتكاملات بين المؤسسات، ومشاريع الهوية وتسجيل الدخول الموحد، والبيئات الإنتاجية التي لم تُحصَّن يوماً بما يتجاوز إعداداتها الافتراضية. ويظهر أيضاً حين يطرح عميل سؤالاً أمنياً على فريق هندسي لا يجد من يلجأ إليه.",
      ),
    },
    approach: {
      body: bi(
        "We work as the security voice inside the design. Threat modelling sessions with your architects identify what matters and what could go wrong. We propose concrete patterns: network segmentation, secrets management, authentication and authorisation design, logging that supports investigation. For hardening we apply recognised benchmarks to servers, cloud accounts, databases and identity, and we test that the result still works.",
        "نعمل كصوت الأمن داخل التصميم. تحدد جلسات نمذجة التهديدات مع مهندسيك ما الذي يهم وما الذي قد يسوء. ونقترح أنماطاً ملموسة: تقسيم الشبكة، وإدارة الأسرار، وتصميم المصادقة والتفويض، وسجلات تدعم التحقيق. وفي التحصين نطبّق معايير معترفاً بها على الخوادم والحسابات السحابية وقواعد البيانات والهوية، ونتأكد من أن النتيجة ما تزال تعمل.",
      ),
    },
    engagement: {
      body: bi(
        "Consulting is arranged around your delivery calendar: design reviews at the points where decisions are made, and a retained number of hours for questions in between. Hardening is scoped per environment, done in agreed maintenance windows, with a rollback plan for every change. We document what was changed and why so that your team can maintain it.",
        "تُرتَّب الاستشارات وفق جدول تسليمك: مراجعات تصميم عند نقاط اتخاذ القرار، وعدد ساعات محجوز للأسئلة بينها. أما التحصين فيُحدد نطاقه لكل بيئة على حدة، ويُنفذ في نوافذ صيانة متفق عليها، مع خطة تراجع لكل تغيير. ونوثّق ما تغيّر ولماذا ليتمكن فريقك من صيانته.",
      ),
    },
    deliverables: {
      body: bi("Decisions written down, and systems measurably harder to attack.", "قرارات موثقة، وأنظمة أصعب على الهجوم بشكل قابل للقياس."),
      items: [
        bi("Threat model and secure architecture recommendations for the system in question", "نموذج تهديدات وتوصيات بنية آمنة للنظام المعني"),
        bi("Hardening baselines applied and documented per environment", "معايير تحصين مطبقة وموثقة لكل بيئة"),
        bi("Verification that hardened systems meet the agreed benchmark", "تحقق من أن الأنظمة المحصّنة تلبي المعيار المتفق عليه"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Fewer findings when the system is eventually tested, less rework late in the project, and a defensible answer when a client or auditor asks how the platform was designed to protect their data.",
        "نتائج أقل حين يُختبر النظام لاحقاً، وإعادة عمل أقل في مراحل المشروع المتأخرة، وإجابة يمكن الدفاع عنها حين يسأل عميل أو مدقق كيف صُممت المنصة لحماية بياناته.",
      ),
    },
    related: ["security-assessments", "identity-access-architecture", "cloud-architecture"],
  },
];
