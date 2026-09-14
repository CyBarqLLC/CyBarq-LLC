import { bi, type ServiceContent } from "./registry";

/**
 * Cybersecurity practice. Five services carried over from the original CyBarq
 * site, joined by security assessments and by consulting, architecture and
 * hardening. Copy is bilingual: the Arabic is written to read as Arabic, not
 * as a translation of the English.
 */
export const cybersecurityServices: ServiceContent[] = [
  {
    slug: "penetration-testing",
    practice: "cybersecurity",
    pictogram: "cybersecurity",
    featured: true,
    title: bi("Penetration Testing", "اختبار الاختراق"),
    summary: bi("A controlled test of your applications, networks, cloud and internal systems, carried out by hand before anyone else tries.", "اختبار محكوم لتطبيقاتك وشبكاتك وبيئتك السحابية وأنظمتك الداخلية، يجري يدوياً قبل أن يحاوله غيرنا."),
    hero: bi("We examine your systems with an attacker's method and a client's interest, then set out what to fix and in what order.", "نفحص أنظمتك بمنهج المهاجم وبمصلحة العميل، ثم نبيّن ما ينبغي إصلاحه وبأي ترتيب."),
    seo: {
      title: bi("Penetration Testing", "اختبار الاختراق"),
      description: bi("Manual penetration testing of web applications, APIs, networks, cloud and internal systems by CyBarq in Amman. Evidence, fix guidance and a retest.", "اختبار اختراق يدوي لتطبيقات الويب وواجهات البرمجة والشبكات والبيئات السحابية والأنظمة الداخلية من سايبرق في عمّان، مع الأدلة وإرشادات المعالجة وإعادة الاختبار."),
    },
    problem: {
      body: bi(
        "Most teams know their systems have weak points. Few know which ones an attacker would reach first. Scanners only find what they were taught to look for, so logic flaws, small weaknesses that only matter when combined, and settings that are wrong only because of where they sit stay quiet until someone else finds them.",
        "معظم الفرق تعرف أن في أنظمتها نقاط ضعف، لكن قليلين يعرفون أيّها يصل إليه المهاجم أولاً. أدوات الفحص الآلي لا ترى إلا ما عُلّمت البحث عنه. أما أخطاء منطق التطبيق، والثغرات الصغيرة التي تصبح خطيرة حين تجتمع، والإعدادات التي لا يظهر خطؤها إلا في سياقها، فتبقى صامتة حتى يجدها غيرك.",
      ),
    },
    whereItAppears: {
      body: bi(
        "In the web applications and APIs your customers use, in mobile apps and the systems behind them, at the edge of your network, in your cloud accounts, and in the internal network an attacker reaches after one employee opens one email. It also appears in the places nobody owns: a test environment left running, a password shared between two teams, an integration added the week before a launch.",
        "في تطبيقات الويب وواجهات البرمجة التي يستخدمها عملاؤك، وفي تطبيقات الهاتف والأنظمة التي تقف خلفها، وعند حدود شبكتك، وفي حساباتك السحابية، وفي الشبكة الداخلية التي يصل إليها المهاجم بعد أن يفتح موظف واحد رسالة واحدة. ويظهر كذلك فيما لا يملكه أحد: بيئة اختبار بقيت تعمل، وكلمة مرور تتشاركها إدارتان، وتكامل أُضيف قبل الإطلاق بأسبوع.",
      ),
    },
    approach: {
      body: bi(
        "We test by hand and use tools to cover ground, not to do the thinking. We work the way an attacker works: what can be reached from outside, where one foothold leads, and what that access is actually worth. Every finding arrives with its evidence, the steps to reproduce it, and the change that closes it.",
        "نختبر يدوياً، ونستخدم الأدوات لتغطية المساحة لا للتفكير نيابةً عنا. نعمل بمنطق المهاجم: ما الذي يمكن الوصول إليه من الخارج، وإلى أين يقود أول موطئ قدم، وما قيمة هذا الوصول فعلاً. وتصلك كل ثغرة ومعها دليلها وخطوات إعادة إنتاجها والتغيير الذي يغلقها.",
      ),
    },
    engagement: {
      body: bi(
        "We agree the scope in writing first: which assets are in, which are out, the testing window and the rules. Testing runs against a written authorisation, with a named lead you can reach at any time. Anything critical reaches you the hour we confirm it, not in the report. We close with a session where we walk your engineers through what we found.",
        "نتفق على النطاق كتابةً قبل أي شيء: ما المشمول وما غير المشمول، ونافذة الاختبار، وقواعد العمل. يجري الاختبار بتفويض مكتوب، ومع مسؤول باسمه يمكنك الوصول إليه في أي وقت. وما كان حرجاً يصلك ساعة تأكيده لا في التقرير. ونختم بجلسة نمرّ فيها على النتائج مع مهندسيك.",
      ),
    },
    deliverables: {
      body: bi("One report written for two readers: a summary that tells management what the risk is, and a technical section your engineers can work from directly.", "تقرير واحد لقارئين: ملخص يقول للإدارة ما حجم الخطر، وقسم تقني يعمل به مهندسوك مباشرة."),
      items: [
        bi("Findings rated by severity, each with evidence and steps to reproduce it", "ثغرات مصنفة حسب الخطورة، مع دليل وخطوات إعادة إنتاج لكل واحدة"),
        bi("A remediation plan in the order we would fix them", "خطة معالجة بالترتيب الذي كنا سنصلح به"),
        bi("A retest of what you fixed, and a closure letter", "إعادة اختبار لما أصلحته، وخطاب إغلاق"),
      ],
    },
    extraSections: [
      {
        heading: bi("What each finding tells you", "ماذا تقول كل ثغرة"),
        body: bi(
          "A finding is only useful if someone can act on it. For each one we write what it is, how we exploited it, what the attacker gains from it, and the exact change that closes it: a setting, a code change, a control. When the real fix will take months, we also give you something to do this week that lowers the risk in the meantime.",
          "لا فائدة من ثغرة لا يستطيع أحد التعامل معها. نكتب لكل واحدة: ما هي، وكيف استغللناها، وماذا يكسب المهاجم منها، والتغيير المحدد الذي يغلقها، سواء كان إعداداً أو تعديلاً في الشيفرة أو ضابط تحكم. وإن كان الإصلاح الحقيقي يحتاج شهوراً، نعطيك ما يمكن فعله هذا الأسبوع لتقليل الخطر ريثما يتم.",
        ),
      },
      {
        heading: bi("Retesting", "إعادة الاختبار"),
        body: bi(
          "When your team has applied the fixes, we test each finding again and say whether it is closed. The report is updated with the result, so you keep one record of what was found, what was fixed and what we verified.",
          "حين يطبّق فريقك الإصلاحات، نختبر كل ثغرة من جديد ونقول إن كانت أُغلقت أم لا. ويُحدَّث التقرير بالنتيجة، فيبقى لديك سجل واحد لما وُجد وما أُصلح وما تحققنا منه.",
        ),
      },
    ],
    businessMeaning: {
      body: bi(
        "You stop guessing where you stand. You get a picture of your real weaknesses and an order to work through them, so your team spends its effort where it counts. You also get something to show a client, a regulator or a board: independent evidence that the system was tested and that the findings were dealt with.",
        "تتوقف عن التخمين. تحصل على صورة لنقاط ضعفك الحقيقية وترتيب لمعالجتها، فيصرف فريقك جهده حيث يفيد. ويبقى معك ما تقدمه لعميل أو جهة رقابية أو مجلس إدارة: دليل مستقل على أن النظام اختُبر وأن نتائجه عولجت.",
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
    summary: bi("Something happened. We work out what, stop it spreading, and keep the evidence intact while you recover.", "وقع شيء ما. نعرف ماذا حدث، ونمنع اتساعه، ونحفظ الأدلة بينما تعود إلى العمل."),
    hero: bi("In an incident you need three answers: what happened, is it over, and how do we get back to work. We give you all three.", "في أي حادث تحتاج ثلاث إجابات: ماذا حدث، وهل انتهى، وكيف نعود إلى العمل. نعطيك الثلاث."),
    seo: {
      title: bi("Digital Forensics and Incident Response (DFIR)", "التحقيق الرقمي والاستجابة للحوادث"),
      description: bi("Incident response and digital forensics from CyBarq: what happened, how far it went, containment, preserved evidence and a guided recovery.", "استجابة للحوادث وتحقيق رقمي من سايبرق: ماذا حدث، وإلى أين وصل، والاحتواء، وحفظ الأدلة، ومرافقتك حتى التعافي."),
    },
    problem: {
      body: bi(
        "An incident stops work, exposes data and gets talked about outside the company. The hard part is not the disruption. It is not knowing what was touched, how they got in, or whether they are still there, because without that you rebuild systems that are still open and wipe the evidence you will need later.",
        "الحادث يوقف العمل، ويعرّض البيانات، ويخرج الحديث عنه من حدود المؤسسة. لكن الأصعب ليس التعطل، بل ألا تعرف ما الذي مسّه المهاجم، ولا كيف دخل، ولا إن كان ما يزال في الداخل. ومن دون ذلك تعيد بناء أنظمة ما تزال مفتوحة، وتمسح أدلة ستحتاجها لاحقاً.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Ransomware on a file server on a Sunday morning. A finance email thread where the bank details quietly changed. A web application serving pages nobody wrote. Staff passwords appearing in a public leak, or a partner calling to say your data is being sold. Most of it starts as one small thing somebody noticed and could not explain.",
        "برنامج فدية على خادم ملفات صباح الأحد. سلسلة بريد في المالية تغيّرت فيها بيانات الحساب البنكي بهدوء. تطبيق ويب يعرض صفحات لم يكتبها أحد. كلمات مرور لموظفيك تظهر في تسريب عام، أو شريك يتصل ليقول إن بياناتك تُباع. وغالباً يبدأ الأمر بشيء صغير لاحظه أحدهم ولم يجد له تفسيراً.",
      ),
    },
    approach: {
      body: bi(
        "We collect the evidence and read it: endpoints, servers, logs and network traffic. From it we build the timeline of the attack, where the attacker entered, what they ran, and which systems and data they reached, and we preserve that evidence so it holds up if a lawyer or a regulator asks. We contain the threat, stay with you through recovery, and tell you plainly what let this happen.",
        "نجمع الأدلة ونقرأها: الأجهزة والخوادم والسجلات وحركة الشبكة. منها نبني خط الحادث الزمني: من أين دخل المهاجم، وماذا نفّذ، وأي الأنظمة والبيانات وصل إليها. ونحفظ الأدلة بطريقة تصمد أمام محامٍ أو جهة رقابية. نحتوي التهديد، ونبقى معك حتى التعافي، ونقول لك بصراحة ما الذي سمح بحدوث هذا.",
      ),
    },
    engagement: {
      body: bi(
        "It starts with a call. We agree the containment steps you can take safely right now, then collect evidence before anything is rebuilt. Investigation and containment run together, and you get a short written update at the end of each day. Recovery is planned with your team so systems come back clean and in the right order. If you want the response to start faster, we can agree a retainer in advance, with the contacts, access and procedures already in place.",
        "تبدأ باتصال. نتفق على خطوات الاحتواء التي يمكنك تنفيذها الآن بأمان، ثم نجمع الأدلة قبل إعادة بناء أي شيء. يسير التحقيق والاحتواء معاً، ويصلك تحديث مكتوب قصير في نهاية كل يوم. ونخطط للتعافي مع فريقك لتعود الأنظمة نظيفة وبالترتيب الصحيح. وإن أردت استجابة أسرع، نتفق مسبقاً على عقد جاهزية تكون فيه جهات الاتصال والصلاحيات والإجراءات معدّة.",
      ),
    },
    deliverables: {
      body: bi("What you need to decide during the incident, and what you need to answer questions after it.", "ما تحتاجه لاتخاذ القرار أثناء الحادث، وما تحتاجه للإجابة عن الأسئلة بعده."),
      items: [
        bi("The attack timeline, the root cause, and which systems and data were affected", "خط الحادث الزمني، والسبب الجذري، والأنظمة والبيانات المتأثرة"),
        bi("Evidence preserved, with a documented chain of custody", "أدلة محفوظة مع سلسلة حيازة موثقة"),
        bi("A containment and recovery plan, then a final report with what we would change", "خطة احتواء وتعافٍ، ثم تقرير نهائي بما نرى تغييره"),
      ],
    },
    businessMeaning: {
      body: bi(
        "You get control back sooner, and you know what was affected. You can talk to clients, insurers and regulators with facts instead of guesses. And you leave the incident with a short list of specific changes that stop the same thing happening twice.",
        "تستعيد السيطرة أسرع، وتعرف ما الذي تأثر. وتتحدث إلى عملائك وشركات التأمين والجهات الرقابية بحقائق لا بتخمين. وتخرج من الحادث بقائمة قصيرة من التغييرات المحددة تمنع تكراره.",
      ),
    },
    related: ["compromise-assessment", "penetration-testing", "professional-security-services"],
  },
  {
    slug: "training-awareness",
    practice: "cybersecurity",
    pictogram: "certification",
    title: bi("Cybersecurity Training & Awareness", "التدريب والتوعية بالأمن السيبراني"),
    summary: bi("Training and phishing simulations built around the emails your staff actually receive.", "تدريب ومحاكاة تصيد مبنية على الرسائل التي تصل موظفيك فعلاً."),
    hero: bi("Most attacks that work start with a person doing something that looked reasonable. We give your people the practice to notice when it is not.", "معظم الهجمات الناجحة تبدأ بشخص يفعل شيئاً بدا معقولاً. نمنح فريقك التمرين الذي يجعله ينتبه حين لا يكون كذلك."),
    seo: {
      title: bi("Cybersecurity Training and Awareness", "التدريب والتوعية بالأمن السيبراني"),
      description: bi("Security awareness training, phishing simulations and workshops from CyBarq, built per department and role, in Arabic and English, measured over time.", "تدريب توعية أمنية ومحاكاة تصيد وورش عمل من سايبرق، لكل إدارة ودور وظيفي، بالعربية والإنجليزية، ونتائج تُقاس مع الوقت."),
    },
    problem: {
      body: bi(
        "One person acting on one convincing email can walk past defences you spent years buying. Training once a year does not change that, because nobody recalls a slide deck at 4pm when an email arrives that looks like the last twenty real ones. What changes behaviour is practice, repeated, on situations people recognise.",
        "شخص واحد يستجيب لرسالة مقنعة واحدة يتجاوز دفاعات اشتريتها على مدى سنوات. والتدريب مرة في السنة لا يغيّر ذلك، لأن أحداً لا يتذكر عرضاً تقديمياً عند الرابعة عصراً حين تصله رسالة تشبه تماماً ما سبقها من رسائل حقيقية. ما يغيّر السلوك هو التمرين المتكرر على مواقف يعرفها الناس.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Finance staff who process payment requests. Executives whose names get used to ask for a favour quickly. IT staff with the widest access. New joiners who do not yet know what normal looks like here. Anyone who handles client data. The gap is rarely intelligence. It is practice.",
        "موظفو المالية الذين يعالجون طلبات الدفع. المديرون الذين تُستخدم أسماؤهم لطلب خدمة على عجل. موظفو تقنية المعلومات أصحاب أوسع صلاحيات. الموظفون الجدد الذين لا يعرفون بعد ما هو الطبيعي هنا. وكل من يتعامل مع بيانات العملاء. الفجوة نادراً ما تكون في الذكاء، بل في التمرين.",
      ),
    },
    approach: {
      body: bi(
        "We run sessions, workshops and phishing simulations shaped around each department and role. The examples come from the systems your people use and the requests they really get, in Arabic or English. Simulations repeat over months so you can see whether behaviour moved, and the results go into planning the next round, not into a list of names.",
        "نعقد جلسات وورشاً ومحاكاة تصيد مصممة لكل إدارة ودور وظيفي. تأتي الأمثلة من الأنظمة التي يستخدمها موظفوك ومن الطلبات التي تصلهم فعلاً، بالعربية أو الإنجليزية. وتتكرر المحاكاة على مدى شهور لترى إن تغيّر السلوك، وتُستخدم النتائج في تخطيط الجولة التالية، لا في إعداد قائمة بالأسماء.",
      ),
    },
    engagement: {
      body: bi(
        "We start with a baseline: one simulation and a conversation with the people who carry the risk. Then we agree the programme: which departments get which sessions, how often simulations run, and who sees the results. Sessions run on site in Amman or remotely, in Arabic or English. Briefings for leadership are short and tied to the decisions they actually make.",
        "نبدأ بقياس أولي: محاكاة واحدة وحوار مع من يتحملون المخاطر. ثم نتفق على البرنامج: أي إدارة تأخذ أي جلسة، وكم مرة تتكرر المحاكاة، ومن يطّلع على النتائج. تُعقد الجلسات حضورياً في عمّان أو عن بُعد، بالعربية أو الإنجليزية. أما إحاطات القيادة فقصيرة ومرتبطة بالقرارات التي تتخذها فعلاً.",
      ),
    },
    deliverables: {
      body: bi("A programme that runs across the year, not a single morning.", "برنامج يمتد على مدار السنة، لا صباح واحد."),
      items: [
        bi("Sessions and materials per role, in Arabic and English", "جلسات ومواد لكل دور وظيفي، بالعربية والإنجليزية"),
        bi("Phishing simulation campaigns, with results per department tracked over time", "حملات محاكاة تصيد، مع نتائج لكل إدارة تُتابع مع الوقت"),
        bi("A reporting route simple enough that staff use it when something looks wrong", "طريقة إبلاغ بسيطة بما يكفي ليستخدمها الموظفون حين يبدو شيء مريباً"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Fewer incidents that begin with a click. Faster reporting when one gets through, which is usually what decides how bad it becomes. And a team that treats security as part of doing the work properly, rather than as somebody else's department.",
        "حوادث أقل تبدأ بنقرة. وإبلاغ أسرع حين تمرّ إحداها، وهو ما يحدد عادةً حجم الضرر. وفريق يرى الأمن جزءاً من إتقان عمله، لا مسؤولية إدارة أخرى.",
      ),
    },
    related: ["professional-security-services", "penetration-testing", "security-assessments"],
  },
  {
    slug: "compromise-assessment",
    practice: "cybersecurity",
    pictogram: "monitoring",
    title: bi("Compromise Assessment", "تقييم الاختراق"),
    summary: bi("A careful check for signs that someone has already reached inside your environment.", "فحص دقيق بحثاً عن إشارات إلى أن أحداً وصل إلى داخل بيئتك."),
    hero: bi("Some intrusions leave no noise behind. This work answers one question calmly: is there anyone in your environment who should not be?", "بعض الاختراقات لا تترك ضجيجاً. وهذا العمل يجيب بهدوء عن سؤال واحد: هل في بيئتك من لا ينبغي أن يكون فيها؟"),
    seo: {
      title: bi("Compromise Assessment", "تقييم الاختراق"),
      description: bi("Threat hunting across endpoints, servers and network evidence by CyBarq: a clear answer on whether your environment is compromised, and what to do next.", "اصطياد تهديدات في الأجهزة والخوادم وأدلة الشبكة من سايبرق: إجابة واضحة عن كون بيئتك مخترقة أم لا، وما الخطوة التالية."),
    },
    problem: {
      body: bi(
        "A patient attacker does not set off alarms. They use accounts that already exist, tools that are already installed, and traffic that looks like everything else, so monitoring built to spot malware reports nothing. By the time the intrusion is obvious, data has usually been leaving for months.",
        "المهاجم الصبور لا يُطلق الإنذارات. يستخدم حسابات موجودة أصلاً، وأدوات مثبّتة أصلاً، وحركة شبكة تشبه بقية الحركة، فلا تجد المراقبة المبنية على اصطياد البرمجيات الخبيثة ما تبلّغ عنه. وحين يصبح الاختراق واضحاً تكون البيانات غالباً قد خرجت منذ شهور.",
      ),
    },
    whereItAppears: {
      body: bi(
        "After an acquisition, when you inherit an environment nobody on your team built. Before a partner is connected to your network. When a supplier tells you they were breached. When something odd was noticed months ago and never explained. Or when leadership wants an answer rather than an assumption, ahead of an audit or a launch.",
        "بعد استحواذ، حين ترث بيئة لم يبنِها أحد من فريقك. وقبل ربط شريك بشبكتك. وحين يخبرك مورّد أنه تعرّض لاختراق. وحين لوحظ شيء غريب قبل شهور ولم يُفسَّر. أو حين تريد الإدارة إجابة بدل افتراض، قبل تدقيق أو إطلاق.",
      ),
    },
    approach: {
      body: bi(
        "We hunt rather than scan. We go through endpoint and network forensics, look at behaviour instead of signatures, and compare what we see against indicators tied to known attack groups, searching for persistence, movement between systems and traces of data leaving. In short, we look for what your tools were never configured to see.",
        "نصطاد ولا نفحص. نحلّل الأجهزة والشبكة تحليلاً جنائياً، وننظر إلى السلوك لا إلى البصمات، ونقارن ما نراه بمؤشرات مرتبطة بمجموعات هجوم معروفة، بحثاً عن آليات بقاء، وتنقّل بين الأنظمة، وآثار خروج بيانات. باختصار: نبحث عمّا لم تُضبط أدواتك لرؤيته.",
      ),
    },
    engagement: {
      body: bi(
        "We agree the scope first: which systems, which time window, which data sources. Collection uses the telemetry you already have, with light collectors only where there is none, and it runs with little disruption. Analysis takes a set number of days. If we find an active intrusion we stop and, with your agreement, switch to incident response the same day.",
        "نتفق على النطاق أولاً: أي الأنظمة، وأي فترة زمنية، وأي مصادر بيانات. يعتمد الجمع على بيانات المراقبة الموجودة لديك، ونضيف أدوات جمع خفيفة حيث لا توجد، ويجري بأقل تعطيل. ويستغرق التحليل عدداً محدداً من الأيام. وإن وجدنا اختراقاً نشطاً توقفنا، وبموافقتك انتقلنا إلى الاستجابة للحادث في اليوم نفسه.",
      ),
    },
    deliverables: {
      body: bi("A straight answer, and the evidence it rests on.", "إجابة صريحة، والأدلة التي تقوم عليها."),
      items: [
        bi("A clear statement of whether compromise was found, with the evidence", "بيان واضح بوجود اختراق من عدمه، مع الأدلة"),
        bi("Details of any persistence, movement between systems or access to data we identified", "تفاصيل ما وجدناه من آليات بقاء أو تنقّل بين الأنظمة أو وصول إلى بيانات"),
        bi("The gaps in your detection, and the monitoring changes that close them", "فجوات الكشف لديك، وتغييرات المراقبة التي تغلقها"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Either your environment is clean and you can say so with evidence behind it, or you find the intrusion early, while you still choose the timing and the terms. Both outcomes leave you knowing where your blind spots are and what to change before the question is settled for you.",
        "إما أن تكون بيئتك نظيفة فتقول ذلك ومعك دليل، أو تكتشف الاختراق مبكراً وأنت من يحدد التوقيت والشروط. وفي الحالتين تعرف أين مناطقك العمياء وما الذي تغيّره قبل أن يُحسم الأمر بدلاً عنك.",
      ),
    },
    related: ["digital-forensics-incident-response", "penetration-testing", "observability"],
  },
  {
    slug: "security-assessments",
    practice: "cybersecurity",
    pictogram: "assessment",
    title: bi("Security Assessments", "التقييمات الأمنية"),
    summary: bi("Reviews of cloud configuration, architecture, code and controls that show where the gaps are.", "مراجعات للإعدادات السحابية والبنية والشيفرة والضوابط تُظهر أين الفجوات."),
    hero: bi("Not every weakness needs an attack to find it. A review compares what your controls do with what they were meant to do.", "ليست كل نقطة ضعف تحتاج هجوماً لاكتشافها. المراجعة تقارن ما تفعله ضوابطك بما كان يُفترض أن تفعله."),
    seo: {
      title: bi("Security Assessments", "التقييمات الأمنية"),
      description: bi("Cloud configuration, architecture, code and control gap reviews from CyBarq, mapped to frameworks such as ISO 27001 and written to be acted on.", "مراجعات للإعدادات السحابية والبنية والشيفرة وفجوات الضوابط من سايبرق، مرتبطة بأطر مثل ISO 27001 ومكتوبة للتنفيذ."),
    },
    problem: {
      body: bi(
        "Few environments are insecure by design. They drift. A cloud account grows for three years, permissions pile up, a firewall rule opened for one project outlives it, a library stops being updated, and nobody holds a current picture of the whole. A penetration test shows you what is already broken. It does not show you what is merely fragile.",
        "قليل من البيئات صُمم ليكون غير آمن، لكنها تنجرف. حساب سحابي ينمو ثلاث سنوات، وصلاحيات تتراكم، وقاعدة جدار ناري فُتحت لمشروع واحد تبقى بعده، ومكتبة تتوقف تحديثاتها، ولا أحد يملك صورة حالية للمشهد كله. اختبار الاختراق يُظهر ما انكسر فعلاً، لكنه لا يُظهر ما هو هشّ فقط.",
      ),
    },
    whereItAppears: {
      body: bi(
        "Cloud accounts on AWS, Azure or Google Cloud. Identity configuration in Microsoft 365. Network segmentation. Application code and the libraries it depends on. And the distance between the policy that is written down and what the systems actually enforce. It usually surfaces before a certification audit, after changing provider, or when a client questionnaire asks something nobody can answer with confidence.",
        "الحسابات السحابية على AWS أو Azure أو Google Cloud. وإعدادات الهوية في Microsoft 365. وتقسيم الشبكة. وشيفرة التطبيقات والمكتبات التي تعتمد عليها. والمسافة بين السياسة المكتوبة وما تفرضه الأنظمة فعلاً. ويظهر ذلك عادةً قبل تدقيق شهادة، أو بعد تغيير مزوّد، أو حين يسأل استبيان عميل سؤالاً لا يجيب عنه أحد بثقة.",
      ),
    },
    approach: {
      body: bi(
        "We pick the review that fits the question. A cloud configuration review against the provider's own guidance. An architecture review of a system before it is built or extended. A code review that looks only at security. Or a control gap assessment against a framework such as ISO 27001 or the NIST Cybersecurity Framework. The output has the same shape every time: what is in place, what is missing, why it matters, and what to do.",
        "نختار المراجعة التي تناسب السؤال. مراجعة إعدادات سحابية وفق إرشادات المزوّد نفسه. أو مراجعة بنية نظام قبل بنائه أو توسيعه. أو مراجعة شيفرة تنظر إلى الأمان وحده. أو تقييم فجوات ضوابط وفق إطار مثل ISO 27001 أو إطار NIST للأمن السيبراني. والمخرج بالشكل نفسه في كل مرة: ما هو موجود، وما هو ناقص، ولماذا يهم، وماذا تفعل.",
      ),
    },
    engagement: {
      body: bi(
        "Most of the work is read only. We need the documentation, read access to the relevant consoles or repositories, and time with the people who run the systems. Fieldwork runs one to three weeks depending on scope. We go through the draft with your team before it is final, so findings arrive with their context rather than without it.",
        "معظم العمل قراءة فقط. نحتاج الوثائق، وصلاحية قراءة على لوحات التحكم أو المستودعات المعنية، ووقتاً مع من يشغّلون الأنظمة. ويستغرق العمل الميداني من أسبوع إلى ثلاثة أسابيع حسب النطاق. ونمرّ على المسودة مع فريقك قبل اعتمادها، لتصل النتائج ومعها سياقها.",
      ),
    },
    deliverables: {
      body: bi("A report an auditor can read, and a plan an engineer can start on.", "تقرير يقرؤه مدقق، وخطة يبدأ بها مهندس."),
      items: [
        bi("Findings with severity, evidence, and the control or setting that resolves each one", "نتائج مع درجة الخطورة والدليل والضابط أو الإعداد الذي يعالج كلاً منها"),
        bi("A mapping to the framework or benchmark you are measured against", "ربط بالإطار أو المعيار الذي تُقاس به"),
        bi("An improvement plan in priority order, with an estimate of the effort each item takes", "خطة تحسين مرتبة حسب الأولوية، مع تقدير للجهد الذي يحتاجه كل بند"),
      ],
    },
    businessMeaning: {
      body: bi(
        "You trade assumptions for a list of the controls you actually have and the ones you do not. Budget goes to the changes that remove the most risk. Audit preparation stops being a scramble, and client questionnaires get answered from evidence instead of memory.",
        "تستبدل الافتراضات بقائمة بما لديك من ضوابط وما ينقصك منها. وتذهب الميزانية إلى التغييرات التي تزيل أكبر قدر من المخاطر. ويتوقف الاستعداد للتدقيق عن كونه سباقاً مع الوقت، وتُجاب استبيانات العملاء من الأدلة لا من الذاكرة.",
      ),
    },
    related: ["penetration-testing", "security-consulting-architecture", "cloud-architecture"],
  },
  {
    slug: "professional-security-services",
    practice: "cybersecurity",
    pictogram: "protection",
    title: bi("Professional Security Services", "خدمات الأمن المهنية"),
    summary: bi("Security leadership, governance and day to day support for teams that have no security department.", "قيادة أمنية وحوكمة ودعم يومي لفرق لا تملك إدارة أمن."),
    hero: bi("Tools do not run themselves. We sit with your team and build the routines that let the tools do what they were bought for.", "الأدوات لا تشغّل نفسها. نجلس مع فريقك ونبني الإجراءات التي تجعل الأدوات تؤدي ما اشتُريت من أجله."),
    seo: {
      title: bi("Professional Security Services", "خدمات الأمن المهنية"),
      description: bi("Maturity assessment, governance, policies, virtual CISO support and operations guidance from CyBarq for teams with no security department.", "تقييم النضج الأمني والحوكمة والسياسات ودعم مدير أمن معلومات افتراضي وإرشاد للعمليات من سايبرق، للمؤسسات التي لا تملك إدارة أمن."),
    },
    problem: {
      body: bi(
        "Buying tools is the easy part. Without an owner, a process and a written decision about what matters, controls drift, gaps accumulate, and half the tools stay half configured. Most organisations of this size cannot justify a security department, and the responsibility stays with them anyway.",
        "شراء الأدوات هو الجزء السهل. فمن دون مسؤول وإجراء وقرار مكتوب بما يهم، تنجرف الضوابط، وتتراكم الفجوات، ويبقى نصف الأدوات نصف مضبوط. ومعظم المؤسسات في هذا الحجم لا تستطيع تبرير إدارة أمن كاملة، لكن المسؤولية تبقى عليها.",
      ),
    },
    whereItAppears: {
      body: bi(
        "The IT manager who is also, unofficially, the security function. Policies written for one audit and never opened since. Alerts nobody triages. Vendors nobody assesses. Board questions about risk answered from memory. It shows up wherever security depends on one person remembering, rather than on a process.",
        "مدير تقنية المعلومات الذي يقوم أيضاً، بلا تكليف رسمي، بدور وظيفة الأمن. سياسات كُتبت لتدقيق واحد ولم تُفتح بعده. تنبيهات لا يفرزها أحد. مورّدون لا يقيّمهم أحد. أسئلة من مجلس الإدارة عن المخاطر تُجاب من الذاكرة. يظهر ذلك كلما اعتمد الأمن على تذكّر شخص واحد بدل إجراء ثابت.",
      ),
    },
    approach: {
      body: bi(
        "We work next to your team, not above it. That can be a virtual CISO who owns the security agenda and is in the room when decisions are made, a governance structure sized for the organisation you are rather than the one in the template, policies short enough that people follow them, vendor and risk management, or regular time with whoever runs operations. We start from where you are and change one thing at a time.",
        "نعمل إلى جانب فريقك لا فوقه. قد يكون ذلك مدير أمن معلومات افتراضياً يتولى الأجندة الأمنية ويحضر اتخاذ القرار، أو بنية حوكمة بحجم مؤسستك كما هي لا كما في القوالب، أو سياسات قصيرة بما يكفي ليتبعها الناس، أو إدارة للمورّدين والمخاطر، أو وقتاً منتظماً مع من يشغّلون العمليات. نبدأ من حيث أنت، ونغيّر شيئاً واحداً في كل مرة.",
      ),
    },
    engagement: {
      body: bi(
        "We begin with a maturity assessment that takes a few weeks and ends in a roadmap. Most clients then move to a monthly arrangement: a fixed number of days, a named lead, a standing agenda and a quarterly report for leadership. We review the arrangement against the roadmap every six months, and it ends when your own people no longer need it.",
        "نبدأ بتقييم للنضج يستغرق أسابيع قليلة وينتهي بخارطة طريق. ثم ينتقل معظم العملاء إلى ترتيب شهري: عدد أيام ثابت، ومسؤول باسمه، وأجندة دائمة، وتقرير ربع سنوي للقيادة. نراجع الترتيب مقابل خارطة الطريق كل ستة أشهر، وينتهي حين لا يعود فريقك بحاجة إليه.",
      ),
    },
    deliverables: {
      body: bi("A security function that runs to a calendar instead of to emergencies.", "وظيفة أمنية تسير وفق تقويم لا وفق حالات الطوارئ."),
      items: [
        bi("A maturity assessment and a roadmap in priority order", "تقييم للنضج وخارطة طريق مرتبة حسب الأولوية"),
        bi("Policies, standards and procedures sized for your organisation", "سياسات ومعايير وإجراءات بحجم مؤسستك"),
        bi("Regular risk reporting for leadership, and support during audits and client due diligence", "تقارير مخاطر منتظمة للقيادة، ودعم أثناء التدقيقات وعمليات العناية الواجبة للعملاء"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Security becomes something you manage rather than something that happens to you. Risk decisions get made on purpose, with the whole picture in view, and you can show clients, partners and regulators how they were made without hiring a department to do it.",
        "يصبح الأمن شيئاً تديره، لا شيئاً يقع عليك. وتُتخذ قرارات المخاطر عن قصد ومع رؤية للمشهد كله، وتستطيع أن تبيّن للعملاء والشركاء والجهات الرقابية كيف اتُّخذت، من دون توظيف إدارة كاملة.",
      ),
    },
    related: ["security-consulting-architecture", "security-assessments", "training-awareness"],
  },
  {
    slug: "security-consulting-architecture",
    practice: "cybersecurity",
    pictogram: "consulting",
    title: bi("Security Consulting, Architecture & Hardening", "الاستشارات الأمنية والبنية والتحصين"),
    summary: bi("Design decisions, threat modelling and hardening that make a system harder to attack before it goes live.", "قرارات تصميم ونمذجة تهديدات وتحصين تجعل النظام أصعب على الهجوم قبل إطلاقه."),
    hero: bi("The cheapest vulnerability is the one that was never built. We help you make the design decisions that keep it that way.", "أرخص ثغرة هي التي لم تُبنَ أصلاً. نساعدك على اتخاذ قرارات التصميم التي تُبقي الأمر كذلك."),
    seo: {
      title: bi("Security Consulting, Architecture and Hardening", "الاستشارات الأمنية والبنية والتحصين"),
      description: bi("Secure architecture design, threat modelling, and hardening of servers, cloud and identity from CyBarq, plus security advice for engineering teams.", "تصميم بنية آمنة، ونمذجة تهديدات، وتحصين الخوادم والبيئات السحابية والهوية من سايبرق، مع استشارة أمنية لفرق الهندسة."),
    },
    problem: {
      body: bi(
        "Security added at the end of a project is expensive and partial. The architecture decides most of the risk long before anyone reviews code: how services trust each other, where secrets are kept, how a user is identified. And the defaults you inherit from servers, cloud services and identity providers were chosen to make setup easy, not to match your threat model.",
        "الأمن الذي يُضاف في نهاية المشروع مكلف وناقص. فالبنية تحسم معظم المخاطر قبل أن يراجع أحد سطراً من الشيفرة: كيف تثق الخدمات ببعضها، وأين تُحفظ الأسرار، وكيف تُعرَف هوية المستخدم. أما الإعدادات الافتراضية للخوادم والخدمات السحابية ومزوّدي الهوية، فاختيرت لتسهيل التركيب لا لتناسب نموذج التهديد لديك.",
      ),
    },
    whereItAppears: {
      body: bi(
        "A platform about to be designed. A system moving to the cloud. An integration between two organisations trusting each other for the first time. A single sign on rollout. A production estate still running on the settings it shipped with. It also appears when a client sends an engineering team a security question and there is nobody to ask.",
        "منصة على وشك التصميم. نظام ينتقل إلى السحابة. تكامل بين مؤسستين تثق كل منهما بالأخرى لأول مرة. مشروع تسجيل دخول موحد. بيئة إنتاج ما تزال تعمل بالإعدادات التي جاءت بها. ويظهر ذلك أيضاً حين يرسل عميل سؤالاً أمنياً إلى فريق هندسي لا يجد من يسأله.",
      ),
    },
    approach: {
      body: bi(
        "We are the security voice in the design meetings. Threat modelling with your architects sets out what is worth protecting and what could go wrong. From there we propose specific patterns: how the network is segmented, where secrets live, how authentication and authorisation are designed, and what the logs need to record so an investigation is possible later. For hardening we apply recognised benchmarks to servers, cloud accounts, databases and identity, then check that everything still works.",
        "نكون صوت الأمن في اجتماعات التصميم. تحدد جلسات نمذجة التهديدات مع مهندسيك ما يستحق الحماية وما الذي قد يسوء. ومنها نقترح أنماطاً محددة: كيف تُقسَّم الشبكة، وأين تُحفظ الأسرار، وكيف تُصمَّم المصادقة والتفويض، وماذا يجب أن تسجّله السجلات ليصبح التحقيق ممكناً لاحقاً. وفي التحصين نطبّق معايير معترفاً بها على الخوادم والحسابات السحابية وقواعد البيانات والهوية، ثم نتأكد أن كل شيء ما يزال يعمل.",
      ),
    },
    engagement: {
      body: bi(
        "Consulting fits around your delivery calendar: design reviews at the points where a decision gets made, and a reserved number of hours for the questions in between. Hardening is scoped per environment and done in agreed maintenance windows, with a way back from every change. We write down what we changed and why, so your team can keep it that way without us.",
        "تُرتَّب الاستشارة حول جدول تسليمك: مراجعات تصميم عند نقاط اتخاذ القرار، وساعات محجوزة للأسئلة بينها. ويُحدَّد نطاق التحصين لكل بيئة، ويُنفَّذ في نوافذ صيانة متفق عليها، ولكل تغيير طريق للعودة. ونكتب ما غيّرناه ولماذا، ليبقى فريقك قادراً على صيانته من دوننا.",
      ),
    },
    deliverables: {
      body: bi("Decisions written down, and systems measurably harder to attack.", "قرارات مكتوبة، وأنظمة أصعب على الهجوم بصورة قابلة للقياس."),
      items: [
        bi("A threat model and architecture recommendations for the system in question", "نموذج تهديدات وتوصيات بنية للنظام المعني"),
        bi("Hardening baselines applied per environment and documented", "معايير تحصين مطبقة لكل بيئة وموثقة"),
        bi("Verification that each hardened system meets the benchmark we agreed", "تحقق من أن كل نظام محصَّن يلبي المعيار المتفق عليه"),
      ],
    },
    businessMeaning: {
      body: bi(
        "Fewer findings when the system is finally tested. Less rework in the weeks before launch, when rework costs the most. And a straight answer when a client or an auditor asks how the platform was designed to protect their data.",
        "نتائج أقل حين يُختبر النظام أخيراً. وإعادة عمل أقل في الأسابيع السابقة للإطلاق، حين تكون أغلى ما تكون. وإجابة واضحة حين يسأل عميل أو مدقق كيف صُممت المنصة لحماية بياناته.",
      ),
    },
    related: ["security-assessments", "identity-access-architecture", "cloud-architecture"],
  },
];
