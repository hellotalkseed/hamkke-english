const en = {
  nav: {
    home: "Home",
    approach: "Approach",
    lessons: "Lessons",
    teachers: "Teachers",
    policy: "Policy",
    about: "About",
    login: "Login",

    // Legacy keys retained temporarily during migration.
    experience: "Experience",
    goals: "Goals",
    stories: "Stories",
    startConversation: "Start a Conversation",
  },

  info: {
    title: "Info",
    pricing: "Pricing",
    howItWorks: "How It Works",
    platform: "Platform",
    policy: "Policy",
    faq: "FAQ",
  },

  policy: {
    eyebrow: "Hamkke Policy",

    title: "Lesson Policy",

    intro:
      "Each lesson is reserved especially for you, so a few simple guidelines help keep scheduling fair and comfortable for everyone.",

    quickGuide: {
      eyebrow: "Quick guide",

      notice: {
        title: "2+ hours before class",
        text: "Reschedule or receive lesson credit.",
      },

      lateNotice: {
        title: "Less than 2 hours",
        text: "The lesson is counted as completed.",
      },

      noShow: {
        title: "No-show",
        text: "The lesson is counted as completed.",
      },

      note:
        "Please see the detailed policy below for exceptions and unexpected circumstances.",
    },

    details: {
      eyebrow: "Policy details",
      description:
        "Select a section to read the full guidelines.",
    },

    cancellation: {
      title: "Cancellation & Rescheduling",

      intro:
        "Plans can change, and I understand that. If you need to cancel or reschedule, please let me know at least 2 hours before your scheduled lesson.",

      notice: {
        title: "With 2+ hours' notice",
        text:
          "You may reschedule your lesson or receive credit for a future session.",
      },

      lateNotice: {
        title: "With less than 2 hours' notice",
        text: "The lesson will be counted as completed.",
      },

      noShow: {
        title: "No-show without notice",
        text: "The lesson will be counted as completed.",
      },

      note:
        "If something unexpected comes up, please let me know as soon as you can. I'll do my best to accommodate you when possible.",
    },

    unexpected: {
      title: "Unexpected Circumstances",

      intro: "Not everything is within our control.",

      text:
        "Power outages, internet or connection problems, emergencies, and other unexpected circumstances may occasionally make it difficult to attend a lesson.",

      action:
        "If something like this happens, please let me know as soon as possible.",

      resolution:
        "I'll do my best to find a reasonable solution, such as rescheduling the lesson or providing credit.",

      teacher:
        "This also applies if an unexpected issue on my side prevents us from having the lesson as planned.",
    },

    lateArrivals: {
      title: "Late Arrivals",

      intro:
        "If you're running late, just let me know when you can.",

      rule:
        "Your lesson will still end at its originally scheduled time.",

      example:
        "For example, if your lesson is scheduled from 8:00–8:25 PM and you join at 8:10 PM, the lesson will run from 8:10–8:25 PM.",

      noContact:
        "If you don't join within 10 minutes and haven't contacted me, the lesson will be considered a no-show and counted as completed.",
    },

    teacherCancellations: {
      title: "Teacher Cancellations",

      intro:
        "Sometimes I may need to cancel a lesson too.",

      text:
        "If I ever need to cancel a lesson, I'll let you know as soon as possible.",

      resolution:
        "You will receive either a replacement lesson or full credit for the missed session.",
    },

    repeatedCancellations: {
      title: "Repeated Cancellations",

      intro: "Life doesn't always go according to plan.",

      rule:
        "There is no fixed limit on cancellations. I understand that unexpected things happen.",

      text:
        "However, if frequent cancellations or rescheduling begin to affect lesson availability, I may reach out to discuss your regular schedule and find an arrangement that works better for both of us.",

      note:
        "The goal isn't to make things difficult. It's simply to make sure that reserved lesson times remain useful and fair for everyone.",
    },

    tuition: {
      title: "Tuition & Pricing",

      intro:
        "Tuition is set according to the selected lesson duration, term length, and displayed currency.",

      rule:
        "Tuition is reviewed annually and may be adjusted to reflect inflation and changes in operating costs.",

      notice:
        "Any tuition changes will be communicated in advance.",
    },

    refunds: {
      title: "Refunds & Transfers",

      intro:
        "Because lessons are purchased as a package, refunds are generally not available once a package has been paid for.",

      rule:
        "If you are unable to continue your lessons, you may request to transfer your remaining unused lessons instead of receiving a refund.",

      transfer:
        "Lesson transfers are considered for unused lessons only and should be discussed before the package ends. The new arrangement will depend on the circumstances and availability.",

      exception:
        "In exceptional circumstances, a refund may be considered at Hamkke's discretion.",

      note:
        "If something unexpected comes up, please talk to me first. I'll always try to find a fair and reasonable way forward.",
    },

    closing: {
      eyebrow: "A note from Hamkke",

      title: "A final note",

      text:
        "These guidelines aren't meant to make things complicated.",

      textTwo:
        "They're simply here to help keep our lessons predictable, respectful, and comfortable for both of us.",

      thankYou:
        "Thank you for respecting the time we've set aside for each conversation.",
    },
  },

  pricing: {
    title: "Pricing",

    intro:
      "Simple pricing for thoughtful, one-on-one English lessons.",

    privateLessons: {
      title: "Private 1:1 English",
      package: "20 lessons · 25 minutes each",

      description:
        "A private space to speak, think, make mistakes, and gradually become more comfortable in English.",
    },

    waysToLearn: {
      title: "Two ways to learn",

      subtitle: "The goal comes first.",

      description:
        "Some students want to become more comfortable speaking English in everyday life. Others have a particular situation they want to prepare for. Both are welcome at Hamkke.",

      general: {
        title: "General English",

        subtitle: "For everyday conversations.",

        description:
          "Build the confidence to speak more naturally about the things that matter to you.",

        points: [
          "Everyday conversation",
          "Speaking more naturally",
          "Vocabulary and expressions",
          "Expressing your thoughts",
          "Building speaking confidence",
          "Grammar through real conversation",
        ],
      },

      specialized: {
        title: "Specialized English",

        subtitle: "For something specific.",

        description:
          "Shape your lessons around a particular situation, goal, or communication challenge.",

        points: [
          "Job interviews",
          "Workplace communication",
          "Presentations",
          "Travel English",
          "Academic discussions",
          "Other specific communication goals",
        ],
      },
    },

    lessonFlow: {
      title: "What happens in a lesson",

      intro: "We don't just study English.",

      introHighlight: "We use it.",

      steps: {
        conversation: {
          number: "01",
          title: "Conversation",
          text:
            "We talk about things that are relevant to you.",
        },

        feedback: {
          number: "02",
          title: "Feedback",
          text:
            "I'll help you notice grammar, vocabulary, pronunciation, and expressions.",
        },

        refinement: {
          number: "03",
          title: "Refinement",
          text:
            "We find clearer and more natural ways to express what you mean.",
        },

        practice: {
          number: "04",
          title: "Practice",
          text:
            "Then you use those expressions again until they start feeling like your own.",
        },
      },
    },

    practical: {
      title: "The practical side",

      intro: "Simple from the beginning.",

      details: {
        lessonLength: {
          label: "Lesson length",
          value: "25 minutes",
        },

        package: {
          label: "Package",
          value: "20 private lessons",
        },

        format: {
          label: "Format",
          value: "Online · 1:1",
        },

        tuition: {
          label: "Tuition",
        },
      },

      policy: "Lesson Policy",
    },
  },

  platform: {
    title: "Online lessons, your way",

    intro:
      "Choose the platform that feels most comfortable for you. The lesson stays the same, wherever we meet.",

    available: {
      title: "Available platforms",

      subtitle: "Meet where you're comfortable.",

      description:
        "Hamkke lessons are available across several familiar platforms, so you can choose the one that works best for you.",
    },

    note:
      "You don't need to worry about having the perfect setup. As long as you have a stable internet connection, a microphone, and a quiet place to speak, you're ready.",

    beforeLesson: {
      title: "Before your lesson",

      subtitle: "A few simple things are enough.",

      description:
        "You don't need complicated equipment or a special study space. Just prepare a few basics so we can spend our time actually speaking English.",

      items: [
        {
          number: "01",
          title: "A device",
          text:
            "A computer, tablet, or smartphone that can connect to your chosen platform.",
        },

        {
          number: "02",
          title: "Internet",
          text:
            "A stable internet connection so we can have a smooth conversation.",
        },

        {
          number: "03",
          title: "A microphone",
          text:
            "Built-in earphones or a microphone that lets us hear each other clearly.",
        },

        {
          number: "04",
          title: "A quiet space",
          text:
            "Somewhere you can speak comfortably without too many distractions.",
        },
      ],
    },

    closing: {
      text:
        "The platform is just where we meet. What matters is the conversation we have there.",
    },
  },

  faq: {
    title: "Frequently Asked Questions",

    intro:
      "A few things you might be wondering before your first lesson.",

    questions: [
      {
        question:
          "What if I'm nervous or not confident in English?",

        answer:
          "That's completely okay. You don't need to speak perfectly to begin. I'll guide the conversation, give you time to think, and help you express yourself more comfortably as we go.",
      },

      {
        question:
          "Can I ask questions during the lesson?",

        answer:
          "Of course. Questions are always welcome. If there's something you don't understand, want to express differently, or simply want to know more about, just ask.",
      },

      {
        question:
          "Do I need to buy books or materials?",

        answer:
          "No. You don't need to purchase a textbook or other materials for regular lessons. I'll prepare what we need based on the lesson and your goals.",
      },

      {
        question:
          "Do I need to prepare anything before class?",

        answer:
          "Usually, no. You can simply come to class and start talking. If there's something specific I'd like you to prepare beforehand, I'll let you know.",
      },

      {
        question:
          "Can I use my own materials or topics?",

        answer:
          "Yes. If there's a topic, article, video, presentation, or other material you'd like to work with, feel free to bring it to class. We can use it as part of our conversation and practice.",
      },

      {
        question: "How do I pay?",

        answer:
          "Payment details will be provided when we arrange your lessons. If you're unsure about the payment process, just ask and I'll guide you through it.",
      },

      {
        question: "Is the fee refundable?",

        answer:
          "Refunds and lesson transfers are handled according to the Lesson Policy. Please review the policy for the full details.",
      },

      {
        question:
          "When do I need to pay for the next term?",

        answer:
          "Payment for the next package is arranged before your current package ends. I'll let you know when it's time to renew.",
      },

      {
        question:
          "What happens if I need to cancel or miss a lesson?",

        answer:
          "Please refer to the Lesson Policy for the rules regarding cancellations, missed lessons, and rescheduling.",
      },
    ],

    closing:
      "If you still have a question, feel free to reach out.",
  },

  howItWorks: {
    title: "How It Works",

    intro:
      "A simple process from your first inquiry to your first lesson.",

    steps: {
      inquire: {
        number: "01",
        title: "Inquire",
        text:
          "Tell me a little about yourself, what you'd like to improve, and what you're hoping to get from your lessons.",
      },

      assessment: {
        number: "02",
        title: "Schedule an Assessment",
        text:
          "We'll arrange a short assessment so I can understand your current English level, speaking habits, and learning needs.",
      },

      decide: {
        number: "03",
        title: "Decide Together",
        text:
          "We'll talk about what you need and whether my lessons are a good fit for you. There's no pressure to continue.",
      },

      details: {
        number: "04",
        title: "Go Over the Details",
        text:
          "If we decide to work together, we'll go over the lesson format, schedule, tuition, payment, and other practical details.",
      },

      contract: {
        number: "05",
        title: "Contract",
        text:
          "Once everything is clear, we'll confirm the agreement and your lesson schedule.",
      },

      payment: {
        number: "06",
        title: "Payment",
        text:
          "Payment is made before your package begins. Once payment is confirmed, your lessons are ready to begin.",
      },

      begin: {
        number: "07",
        title: "Begin Your Lessons",
        text:
          "Then we start talking. We'll use English, work toward your goals, and gradually build your confidence through real conversation.",
      },
    },

    closing: {
      title: "No complicated process.",

      text:
        "Just a clear conversation about where you are, where you'd like to go, and whether Hamkke is the right place to get there.",
    },
  },

  hero: {
    eyebrow: "1:1 ONLINE ENGLISH",

    titleFirst: "From Small Talk",
    titleSecond: "to",
    titleAccent: "Big Ideas.",

    descriptionFirst:
      "English becomes more useful when you can actually use it.",

    descriptionSecond:
      "Start with what you already know, and learn to say more of what you mean.",

    assessment: "Book a Free Assessment",

    features: {
      conversation: "Conversation-focused",
      learners: "Kids to Adults",
      online: "100% Online",
      personalized: "Personalized Lessons",
    },
  },

  findYourLesson: {
    eyebrow: "FIND YOUR LESSON",
    title: "Find the lesson that fits you.",

    description:
      "See the lesson format, term, and tuition before you continue.",

    online: "1:1 ONLINE",
    lesson: "Conversation Lesson",
    learners: "Kids · Teens · Adults",

    platforms: "PLATFORMS",

    format: "LESSON FORMAT",

    voice: "Audio",
    voiceDetail: "Camera off",

    video: "Video",
    videoDetail: "Camera optional",

    durationLabel: "LESSON DURATION",
    perLesson: "per lesson",

    lessonsLabel: "LESSONS",
    lessons: "20 lessons",
    perPackage: "per term",

    tuitionLabel: "TUITION",

    tuitionReview:
      "Tuition is reviewed annually and may be adjusted to reflect inflation and changes in operating costs.",

    term: {
      label: "Term",
      lessons: "{count} lessons",
      flexible: "10 or 20 lessons",
      standard: "20-lesson term",
      perTerm: "per {count}-lesson term",
      choose10: "Choose 10 lessons",
      choose20: "Choose 20 lessons",
    },

    chooseLesson: "Choose This Lesson",

    decreaseDuration: "Shorten lesson duration",
    increaseDuration: "Extend lesson duration",
  },

  hamkkeApproach: {
    eyebrow: "The Hamkke Approach",

    title: {
      lineOne:
        "We don't prepare you for the conversation.",
      lineTwo: "The conversation is the lesson.",
    },

    description: {
      text:
        "One thought leads to a question. A question leads to a better way to say it. And each time you try again, your English grows with the conversation.",

      highlights: [
        "a better way to say it",
        "your English grows with the conversation",
      ],
    },

    steps: {
      talk: {
        number: "01",
        title: "We Talk",
        description:
          "Start with something you want to say.",
      },

      goDeeper: {
        number: "02",
        title: "We Go Deeper",
        description:
          "Follow-up questions help you develop the idea.",
      },

      refine: {
        number: "03",
        title: "We Refine",
        description:
          "Your teacher helps improve the English that naturally comes up in the conversation.",
      },

      tryAgain: {
        number: "04",
        title: "You Try Again",
        description:
          "Use the English again to express yourself more clearly and with confidence.",
      },
    },

    continuation: {
      lineOne: "And the conversation",
      lineTwo: "continues.",
    },

    explore: "Explore the Hamkke Approach",
  },

  learnerStages: {
    eyebrow: "For Every Stage",

    title:
      "The conversation changes as you grow.",

    description: {
      text:
        "A child finding the words for a story, a teenager learning to explain an opinion, and an adult trying to say exactly what they mean. The goal may change, but we meet every learner where the conversation begins.",

      highlights: [
        "say exactly what they mean",
        "where the conversation begins",
      ],
    },

    start: {
      number: "01",
      text: "Start where you are.",
    },

    stages: {
      kids: {
        number: "02",
        title: "Kids",
        tagline:
          "Turn answers into conversations.",
        description:
          "Build confidence speaking through stories, questions, everyday topics, and plenty of chances to express their own ideas.",
      },

      teens: {
        number: "03",
        title: "Teens",
        tagline:
          "Have more to say, and learn how to say it.",
        description:
          "Move beyond short answers by developing opinions, explaining reasons, asking questions, and expressing increasingly complex ideas in English.",
      },

      adults: {
        number: "04",
        title: "Adults",
        tagline:
          "Make English sound more like you.",
        description:
          "Use English for the conversations that matter to you, while refining the vocabulary, structure, and expression you need along the way.",
      },
    },

    further: "Further together.",
    keepGrowing: "Keep growing",
  },

  teachers: {
    section: {
      eyebrow: "Meet Our Teachers",
      title:
        "The people behind the conversations.",
      viewAll: "View All Teachers",
    },

    directory: {
      description: {
        text:
          "Find someone you'd feel comfortable talking with.",
        highlight: "comfortable",
      },

      mascotAlt: "Hamkke teacher mascot",

      empty: {
        title:
          "Teacher profiles are being prepared.",
        description:
          "Please check back soon to meet the Hamkke teachers.",
      },
    },

    ui: {
      previous: "Previous teachers",
      next: "Next teachers",
      swipeHint: "Swipe to meet more teachers.",
      meetTeacher: "Meet {name}",
    },

    learnerGroups: {
      kids: "Kids",
      teens: "Teens",
      adults: "Adults",
    },

    presentations: {
      default: {
        role: "Hamkke Teacher",

        quote:
          "Helping learners use English through meaningful conversation.",

        specialties: [
          {
            title: "Conversation",
            description: "Real communication",
          },
          {
            title: "Personalized",
            description: "Lessons that fit you",
          },
          {
            title: "Supportive",
            description: "Learn at your own pace",
          },
        ],
      },

      jesica: {
        role: "Hamkke Teacher",

        quote:
          "Helping you say more of what you actually want to say.",

        specialties: [
          {
            title: "Conversation",
            description: "Real communication",
          },
          {
            title: "Interview Prep",
            description:
              "OPIC, airline, and more",
          },
          {
            title: "Patient & Supportive",
            description:
              "Learn at your own pace",
          },
        ],
      },
    },
  },

  learnerStories: {
    eyebrow: "Passed Along",

    title: "Kind words, passed along.",

    description: {
      text:
        "Experiences, milestones, and thoughts shared by learners and families along the way.",
      highlights: ["learners and families"],
    },

    countLabel: "Learner stories",
    readMore: "Read more",
    withTeacher: "with {name}",

    closing: {
      text:
        "A collection of thoughts shared through conversations, progress, and time spent learning together.",

      highlights: [
        "conversations, progress, and time spent learning together",
      ],
    },

    explore: "Explore learner stories",

    modal: {
      ariaLabel: "Learner story from {name}",
      close: "Close learner story",
    },
  },

  getStarted: {
    eyebrow: "Ready When You Are",

    title:
      "Every meaningful conversation starts somewhere.",

    subtitle: "Perhaps yours starts here.",

    steps: {
      introduction: {
        number: "01",
        title: "Tell us about yourself.",
        description:
          "Your goals, your English, your needs.",
      },

      conversation: {
        number: "02",
        title: "Have a conversation.",
        description:
          "Meet your teacher and talk naturally.",
      },

      lessons: {
        number: "03",
        title: "Start your lessons.",
        description:
          "Choose your schedule and begin.",
      },
    },

    invitation:
      "Let's take the first step together.",

    assessment: "Book a Free Assessment",
  },

  lessonsPage: {
    hero: {
      eyebrow: "Lessons",

      title:
        "English lessons for different learners, goals, and stages.",

      description: {
        text:
          "One-on-one online lessons shaped around who you are, what you want to express, and where you want to use your English.",

        highlights: [
          "what you want to express",
          "where you want to use your English",
        ],
      },
    },

    audience: {
      eyebrow: "Who lessons are for",
      title: "Find where you fit.",

      description: {
        text:
          "The same conversation-centered approach adapts to different ages and goals. What we talk about and how your teacher supports you changes with the learner.",

        highlight:
          "adapts to different ages and goals",
      },

      groups: {
        kids: {
          label: "Kids",

          title:
            "More chances to use the English they are learning.",

          description:
            "For children who are learning English but need more opportunities to answer, explain, and express themselves in conversation.",

          goals: [
            "Speaking practice",
            "Vocabulary in conversation",
            "Longer answers",
            "Speaking confidence",
          ],
        },

        teens: {
          label: "Teens",

          title: "Move beyond short answers.",

          description:
            "For teens who want to express opinions, explain their ideas, and become more comfortable having longer conversations in English.",

          goals: [
            "Conversation",
            "Opinions & ideas",
            "School English",
            "Speaking confidence",
          ],
        },

        adults: {
          label: "Adults",

          title:
            "Use English for the situations that matter to you.",

          description:
            "For adults who want to communicate more comfortably in everyday life, at work, while traveling, or in conversations that are personally important.",

          goals: [
            "Everyday English",
            "Work",
            "Interviews",
            "Travel",
            "Free conversation",
          ],
        },
      },
    },

    details: {
      eyebrow: "Lesson details",

      title: "Choose your lesson setup.",

      description:
        "Choose the lesson duration and term length that work best for you.",

      online: "1:1 Online",
      lesson: "Conversation Lesson",
      learners: "Kids · Teens · Adults",

      platforms: "Platforms",
      format: "Lesson format",

      audio: {
        title: "Audio",
        description: "Camera off",
      },

      video: {
        title: "Video",
        description: "Camera optional",
      },

      duration: {
        label: "Duration",
        minutes: "{count} min",
        perLesson: "per lesson",
        decrease: "Decrease lesson duration",
        increase: "Increase lesson duration",
      },

      term: {
        label: "Term",
        lessons: "{count} lessons",
        choose10: "Choose 10 lessons",
        choose20: "Choose 20 lessons",

        standard:
          "20-lesson term for 25–35 minute lessons",

        flexible:
          "10 or 20 lessons per term",
      },

      tuition: {
        label: "Tuition",
        perTerm: "per {count}-lesson term",

        review:
          "Tuition is reviewed annually and may be adjusted to reflect inflation and changes in operating costs.",
      },

      chooseLesson: "Choose This Lesson",
    },

    nextStep: {
      eyebrow: "Teachers",

      title:
        "Find someone you'd feel comfortable talking with.",

      button: "Meet Our Teachers",
    },
  },

  approachPage: {
    hero: {
      eyebrow: "The Hamkke Approach",

      title:
        "Conversation is where the learning happens.",

      description: {
        text:
          "The Hamkke Approach is a conversation-centered teaching framework that helps learners move from knowing English to using it meaningfully and independently.",

        highlights: [
          "knowing English",
          "using it meaningfully and independently",
        ],
      },
    },

    whyConversation: {
      eyebrow: "Why conversation?",

      title:
        "Knowing English is different from using it.",

      firstParagraph: {
        text:
          "You may know the vocabulary, understand the grammar, and recognize the right answer on a page, but still pause when it is your turn to speak.",

        highlight:
          "still pause when it is your turn to speak",
      },

      secondParagraph: {
        text:
          "Hamkke works on that gap. Instead of waiting until your English feels complete, you use what you already know, discover what you need while talking, and build from there.",

        highlights: [
          "that gap",
          "use what you already know",
        ],
      },
    },

    framework: {
      eyebrow: "How it works",

      title:
        "A simple cycle that keeps you speaking.",

      description:
        "The four parts work together throughout the lesson. They are not timed activities or a script your teacher has to follow.",

      steps: {
        talk: {
          number: "01",
          title: "We Talk",

          description:
            "Start with something you actually want to say. It might come from your day, a question, a lesson topic, or an idea you want to explore.",

          short:
            "You bring the thought. We begin there.",
        },

        goDeeper: {
          number: "02",
          title: "We Go Deeper",

          description:
            "Your teacher asks follow-up questions that help you explain, connect, compare, and develop your idea instead of stopping at a short answer.",

          short:
            "One answer becomes a real conversation.",
        },

        refine: {
          number: "03",
          title: "We Refine",

          description:
            "As useful English naturally comes up, your teacher helps you make it clearer, more natural, or more precise without interrupting every mistake.",

          short:
            "We improve the English you need in that moment.",
        },

        tryAgain: {
          number: "04",
          title: "You Try Again",

          description:
            "You get another chance to use what you just learned so the correction becomes something you can use in your own communication.",

          short:
            "You use it again in the conversation.",
        },
      },

      cycle: {
        title: "It's a cycle, not a script.",

        description:
          "A conversation can move through these steps several times. Your teacher may spend longer on one idea or return to conversation immediately after a useful correction. The framework stays consistent while the conversation stays flexible.",
      },
    },

    teacherRole: {
      eyebrow: "Your teacher's role",

      title: "Guidance without taking over.",

      description: {
        text:
          "Your teacher helps the conversation move while giving you enough space to think, respond, and try the English yourself.",

        highlight:
          "space to think, respond, and try the English yourself",
      },

      roles: {
        listen: {
          number: "01",
          title: "Listen",

          description:
            "Notice what you are trying to express, not only whether every sentence is perfect.",
        },

        ask: {
          number: "02",
          title: "Ask",

          description:
            "Use meaningful follow-up questions to help you develop your thoughts and keep speaking.",
        },

        refine: {
          number: "03",
          title: "Refine",

          description:
            "Introduce clearer or more natural English when it becomes useful to the conversation.",
        },

        giveBack: {
          number: "04",
          title: "Give it back",

          description:
            "Give you space to try the language yourself instead of doing the speaking for you.",
        },
      },
    },

    nextStep: {
      eyebrow: "From Small Talk to Big Ideas",

      title:
        "Start with the English you already know.",

      description:
        "Find the lesson setup that works for you and start using your English in conversation.",

      button: "Find Your Lesson",
    },
  },

  aboutPage: {
    hero: {
      eyebrow: "About Hamkke",

      title:
        "Learning feels different when we do it together.",

      description: {
        text:
          "Hamkke is an online English learning space built around meaningful conversation, thoughtful teaching, and the belief that English becomes more useful when learners have opportunities to actually use it.",

        highlights: [
          "meaningful conversation",
          "actually use it",
        ],
      },
    },

    name: {
      korean: "함께",
      meaning: "Together",
      title: "Why Hamkke?",

      paragraphs: [
        {
          text: "함께 means together in Korean.",
          highlights: ["함께", "together"],
        },
        {
          text:
            "We chose this name because learning a language does not have to be something you figure out entirely on your own.",
          highlights: ["entirely on your own"],
        },
        {
          text:
            "Sometimes progress happens through something much simpler: having someone to talk with, being given space to think, making mistakes, trying again, and gradually finding the words for what you really want to say.",
          highlights: ["space to think"],
        },
        {
          text:
            "That is what Hamkke hopes to be: a place where learners and teachers keep moving forward together.",
          highlights: ["moving forward together"],
        },
      ],
    },

    purpose: {
      eyebrow: "Why we exist",

      title:
        "Knowing English and using English are not always the same thing.",

      paragraphs: [
        {
          text:
            "A learner may understand grammar, know vocabulary, complete exercises, or read well and still find it difficult to express a thought naturally in conversation.",

          highlights: [
            "express a thought naturally in conversation",
          ],
        },
        {
          text:
            "Hamkke was built around that gap.",
          highlights: ["that gap"],
        },
        {
          text:
            "We see conversation as part of how learning happens. Through meaningful interaction, learners discover what they can already express, where they need support, and what language can help them say more of what they mean.",

          highlights: [
            "conversation as part of how learning happens",
            "say more of what they mean",
          ],
        },
      ],
    },

    beliefs: {
      eyebrow: "What we believe",

      title:
        "English should become something you can use.",

      communication: {
        title: "Communication",

        description: {
          text:
            "Learners need room to express an idea before worrying about making every sentence perfect. Accuracy matters, but it should support communication rather than prevent it.",

          highlights: [
            "express an idea",
            "support communication",
          ],
        },
      },

      responsiveness: {
        title: "Responsiveness",

        description: {
          text:
            "Different learners need different levels of support, structure, challenge, and thinking time. Teaching should respond to the learner in front of us.",

          highlights: [
            "respond to the learner",
          ],
        },
      },

      independence: {
        title: "Independence",

        description: {
          text:
            "Progress is not only about knowing more English. It also appears when learners can increasingly express, clarify, and develop their own thoughts with less support.",

          highlights: ["with less support"],
        },
      },
    },

    sharedStandard: {
      eyebrow: "A shared standard",

      title: {
        lineOne: "Different teachers.",
        lineTwo: "Different learners.",
        lineThree: "One educational purpose.",
      },

      firstParagraph: {
        text:
          "Teachers bring their own personality, experience, and professional judgment to each lesson. Hamkke provides the shared educational foundation behind them.",

        highlights: [
          "shared educational foundation",
        ],
      },

      secondParagraph: {
        text:
          "The goal is not identical teaching. It is a consistent learning experience built around meaningful communication, thoughtful support, useful feedback, and growing independence.",

        highlights: [
          "not identical teaching",
          "growing independence",
        ],
      },

      approachButton:
        "Explore the Hamkke Approach",

      teachersButton: "Meet the teachers",

      visual: {
        korean: "함께",
        principles: "Learn · Practice · Grow",
        together: "together.",
      },
    },

    closing: {
      eyebrow: "Moving forward, together",

      title:
        "Learning is something we keep doing.",

      firstParagraph: {
        text:
          "Every conversation gives us another chance to notice, try, refine, and say a little more than before.",

        highlights: ["notice, try, refine,"],
      },

      secondParagraph: {
        text:
          "Hamkke makes space for that process, helping learners grow more independent and comfortable using English for what they want to say.",

        highlights: [
          "more independent and comfortable",
        ],
      },
    },
  },

  teacherProfilePage: {
    breadcrumb: {
      label: "Breadcrumb",
      home: "Home",
      teachers: "Teachers",
    },

    teacher: {
      label: "Hamkke Teacher",
      avatarAlt: "{name}, Hamkke teacher",
    },

    audio: {
      greeting: "A short hello from {name}",
      comingSoon:
        "Audio introduction coming soon",

      play:
        "Play {name}'s audio introduction",

      pause:
        "Pause {name}'s audio introduction",

      progress: "Audio progress",
    },

    getStarted: {
      eyebrow: "Start Here",

      title:
        "Start a conversation with {name}",

      description:
        "Book a free assessment and let's see how I can support your goals.",

      details: {
        format: "1:1 online class",
        duration: "25–50 minutes",
        atmosphere:
          "No pressure, just a friendly chat",
      },

      button: "Book a Free Assessment",
    },
  },

  teacherProfile: {
    tabs: {
      about: "About",
      qualifications: "Qualifications",
      learnerStories: "Learner Stories",
      availability: "Availability",
    },

    about: {
      title: "A little about me",
    },

    qualifications: {
      title: "Qualifications & experience",

      description:
        "Training, education, and experience that support my work as an English teacher.",

      empty:
        "Qualifications are being prepared.",
    },

    stories: {
      title: "From my learners",

      story: "story",
      stories: "stories",
      shared: "shared",

      rating: "{rating} out of 5 stars",

      readMore: "Read more",
      showFewer: "Show fewer",

      showAll:
        "Show all {count} stories",

      empty:
        "No learner stories have been shared yet.",

      modal: {
        label: "Learner story",

        ariaLabel:
          "Learner story from {name}",

        close: "Close learner story",
      },
    },

    availability: {
      title: "Weekly availability",

      description:
        "A simple view of currently open and regularly occupied lesson times.",

      previousWeek: "Previous week",
      today: "Today",
      nextWeek: "Next week",

      loading: "Loading availability...",
      error: "Unable to load availability.",

      timezone: {
        label: "Your timezone",
        philippines: "Philippines",
        korea: "Korea",
        japan: "Japan",
        china: "China",
        vietnam: "Vietnam",
      },

      status: {
        available: "Available",
        regularStudent: "Regular Student",
        regularShort: "Regular",
      },

      empty:
        "No open lesson times are shown for this week.",

      note:
        "Times are shown in {timezone} time. Availability can change as lessons are assigned or schedules are updated.",
    },

    days: {
      sun: "Sun",
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
    },
  },

  /*
   * ============================================================
   * LEGACY HOMEPAGE CONTENT
   * Retained temporarily until component migration is complete.
   * ============================================================
   */

  studentProblem: {
    brand: "Hamkke │ 함께",

    title: "You know more English than you think.",

    intro:
      "Sometimes, knowing English and using it comfortably are two different things.",

    experiences: {
      understand: {
        title: "You understand.",
        description:
          "You can follow what people say, but finding the right words takes time.",
      },

      know: {
        title: "You know.",
        description:
          "You understand the grammar, but speaking still feels uncomfortable.",
      },

      somethingToSay: {
        title: "You have something to say.",
        description:
          "You can answer a question, but explaining your thoughts in detail is difficult.",
      },
    },

    closing: "That's where we start.",
  },

  lessonExperience: {
    brand: "Hamkke │ 함께",

    title: "The Hamkke Approach",

    steps: {
      talk: {
        title: "We talk.",
        description:
          "We start with something real and relevant to you.",
      },

      goDeeper: {
        title: "We go deeper.",
        description:
          "I'll ask questions that help you explain, clarify, and expand your thoughts.",
      },

      refine: {
        title: "We refine.",
        description:
          "I'll help you notice vocabulary, pronunciation, grammar, and expressions that can make your English more natural.",
      },

      tryAgain: {
        title: "You try again.",
        description:
          "You take what you've learned and use it in another conversation.",
      },
    },

    closing: "That's how we grow.",
  },

  lessonDetails: {
    brand: "Hamkke │ 함께",

    title:
      "Private English lessons, built around real conversation.",

    description:
      "A space to use the English you already know, build on it, and become more comfortable expressing what you really want to say.",

    details: {
      private: {
        title: "1:1 Online Lessons",
        text:
          "Your lesson is focused entirely on you and how you communicate.",
      },

      duration: {
        title: "25 Minutes",
        text:
          "Focused time for conversation, practice, and feedback that fits naturally into your day.",
      },

      personalized: {
        title: "Personalized to You",
        text:
          "Your level, interests, goals, and the things you actually want to talk about shape the lesson.",
      },

      feedback: {
        title: "Natural Feedback",
        text:
          "We work on grammar, vocabulary, pronunciation, and expression without losing the flow of the conversation.",
      },

      teacher: {
        title: "A Consistent Teacher",
        text:
          "Learn with someone who gets to know how you speak, where you struggle, and what you're working toward.",
      },
    },

    link: "See How Lessons Work",
  },

  audience: {
    brand: "Hamkke │ 함께",

    title:
      "Different goals. One conversation at a time.",

    description:
      "Whether you're learning English to...",

    goals: {
      everyday: {
        title:
          "Speak more confidently in everyday life",
        text:
          "Express yourself more naturally in conversations, social situations, and everyday interactions.",
      },

      work: {
        title:
          "Express yourself more clearly at work",
        text:
          "Communicate your ideas, participate in discussions, and feel more comfortable using English professionally.",
      },

      interview: {
        title: "Prepare for an interview",
        text:
          "Practice answering questions clearly and confidently while learning how to express your experiences and ideas naturally.",
      },

      travel: {
        title: "Travel with less hesitation",
        text:
          "Feel more prepared for the conversations and situations you're likely to encounter while traveling.",
      },

      conversation: {
        title:
          "Feel more comfortable speaking with other people",
        text:
          "Build the confidence to keep conversations going, even when you don't have the perfect words.",
      },
    },

    closing: {
      lineOne:
        "The common thread isn't the goal.",

      lineTwo:
        "It's being able to use English when the moment comes.",
    },
  },

  reflections: {
    brand: "Hamkke │ 함께",

    title:
      "Progress doesn't always look the way you expect it to.",

    description: {
      lineOne:
        "Sometimes it's speaking without preparing every sentence in your head.",

      lineTwo:
        "Sometimes it's finally feeling comfortable enough to keep a conversation going.",
    },

    readMore: "Read More Stories →",
    readMoreCard: "Read More →",

    galleryTitleLineOne: "Stories From",
    galleryTitleLineTwo: "Our Conversations",

    galleryDescription:
      "Every reflection here was written by a student or parent who chose to share part of their English journey with Hamkke.",

    storiesShared: "Stories Shared",
  },

  whatYouWontFindHere: {
    brand: "Hamkke │ 함께",

    title: "What You Won't Find Here",

    points: {
      memorizedScripts: {
        title: "No memorized scripts.",
        text:
          "Because real conversations don't follow one.",
      },

      pressure: {
        title:
          "No pressure to speak perfectly.",
        text:
          "Because confidence grows through trying.",
      },

      oneSizeFitsAll: {
        title:
          "No one-size-fits-all lessons.",
        text:
          "Because your goals and challenges are different from someone else's.",
      },

      constantCorrection: {
        title:
          "No correcting every sentence.",
        text: "Because communication comes first.",
      },
    },
  },

  meetYourCoach: {
    brand: "Hamkke │ 함께",

    title: "Meet Your Coach",

    greeting: "Hi, I'm Jesica.",

    qualifications: "Qualifications",

    teachingSince:
      "Teaching English since 2019",

    certifications: {
      advancedTesol: {
        title: "150-Hour Advanced TESOL",
        organization:
          "International Open Academy",
      },

      youngLearners: {
        title:
          "Teaching English to Young Learners",
        organization:
          "International Open Academy",
      },

      tefl: {
        title: "120-Hour TEFL",
        organization:
          "TEFL Professional Institute",
      },
    },

    story: {
      paragraphOne:
        "I started teaching English in 2019, while I was still studying business at university. What began as a way to teach part-time gradually became something I wanted to build my work around.",

      paragraphTwo:
        "Since then, I've worked with students with very different goals, personalities, and levels of English. Some wanted to feel more comfortable in everyday conversations. Others were preparing for interviews, traveling, or trying to communicate more confidently at work.",

      realization:
        "And the more people I taught, the more I realized that knowing English doesn't always mean feeling comfortable using it.",

      realizationHighlight:
        "Knowing English and feeling comfortable using it are not always the same thing.",

      paragraphFour:
        "Some students know exactly what they want to say but can't find the words quickly enough. Others understand grammar well but hesitate when it's time to speak. Some simply need a little more time, patience, and space to find their voice.",

      paragraphFive:
        "Teaching different learners has taught me to listen first. To pay attention not only to what a student says, but also to what makes speaking difficult for them.",

      paragraphSix:
        "That's what eventually led me to create Hamkke.",

      paragraphSeven:
        "Not because I wanted to create another English class, but because I wanted to create the kind of learning space where I had seen students become more comfortable, more curious, and more willing to speak.",

      paragraphEight:
        "A place where you can come as you are, have a real conversation, and gradually become more comfortable expressing what you actually want to say.",

      closing:
        "I'm still learning from every student I teach. And that's probably one of my favorite parts of being a teacher.",
    },
  },

  cta: {
    title: "Start with a conversation.",

    description:
      "Tell me a little about where you are with English and what you'd like to be able to do. We'll take it from there.",

    button: "Start a Conversation",
  },

  footer: {
    brand: "Hamkke │ 함께",
    tagline: "From Small Talk to Big Ideas.",

    description:
      "Conversation-centered English lessons that help learners use more of the English they already know.",

    groups: {
      learn: "Learn",
      hamkke: "Hamkke",
      connect: "Connect",
    },

    links: {
      lessons: "Lessons",
      approach: "Approach",
      teachers: "Teachers",
      about: "About",
      policy: "Policy",
      startConversation: "Start a Conversation",
      instagram: "Instagram",
    },

    copyright:
      "© 2026 Hamkke │ 함께. All rights reserved.",

    /*
     * Legacy footer keys retained temporarily.
     */
    lessons: "Lessons",
    lessonsGroup: "Lessons",
    howItWorks: "How It Works",
    pricing: "Pricing",
    platform: "Platform",
    hamkkeGroup: "Hamkke",
    about: "About",
    faq: "FAQ",
    policy: "Lesson Policy",
    connectGroup: "Connect",
    startConversation: "Start a Conversation",
  },

  inquiry: {
    brand: "Hamkke │ 함께",

    headings: {
      experience:
        "See how I approach English.",

      goals:
        "Let’s talk about what you want to achieve.",

      stories:
        "Let’s talk about where you want to go next.",

      startAConversation:
        "Let’s start with a conversation.",
    },

    intro:
      "Tell me a little about you and what you’d like to work on.",

    reassurance: {
      personalReply:
        "Personal reply within 24 hours",

      informationSafe:
        "Your information is safe with me",
    },

    fields: {
      name: "What should I call you?",
      email: "Email address",

      contactMethod:
        "How should I contact you?",

      contactId:
        "Your ID, username, or phone number",

      level:
        "How comfortable are you with English?",

      goal:
        "What would you like to work on, and why?",

      message:
        "Anything else you’d like me to know? (Optional)",
    },

    options: {
      contactMethod: {
        kakaoTalk: "KakaoTalk",
        whatsApp: "WhatsApp",
        weChat: "WeChat",
      },

      level: {
        justGettingStarted:
          "I’m just getting started",

        understandingButSpeakingIsDifficult:
          "I understand English, but speaking is difficult",

        simpleConversationsButStillHesitate:
          "I can have simple conversations, but I still hesitate",

        communicateWellButWantToSpeakMoreNaturally:
          "I can communicate well, but I want to speak more naturally",

        comfortableSpeakingButWantToBecomeMoreFluent:
          "I’m comfortable speaking, but I want to become even more fluent",
      },

      goal: {
        speakMoreConfidently:
          "I want to speak more confidently",

        improveEverydayConversation:
          "I want to improve everyday conversation",

        englishForWork:
          "I need English for work",

        interviewPreparation:
          "I’m preparing for an interview",

        travelMoreComfortably:
          "I want to travel more comfortably",

        improveOverallEnglish:
          "I want to improve my overall English",

        somethingElse: "Something else",
      },
    },

    submit: "Send inquiry",
    sending: "Sending...",

    privacy:
      "I respect your privacy and will never share your information.",

    success: {
      title: "Thank you.",

      message:
        "I’ve received your message and I’ll personally get back to you within 24 hours. I look forward to learning more about you and helping you on your English journey.",

      closing: "See you soon.",
    },

    errors: {
      general:
        "Something went wrong. Please try again.",

      network:
        "Unable to send your message. Please try again.",
    },
  },

  language: {
    english: "English",
    korean: "한국어",
    chinese: "中文",
    japanese: "日本語",
  },
};

export default en;