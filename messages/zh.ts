import en from "./en";

const zh = {
  ...en,

  nav: {
    ...en.nav,

    home: "首页",
    approach: "Hamkke 教学方式",
    lessons: "课程",
    teachers: "老师",
    policy: "课程政策",
    about: "关于 Hamkke",
    login: "登录",

    experience: "课程体验",
    goals: "学习目标",
    stories: "学员故事",
    startConversation: "开始交流",
  },

  info: {
    ...en.info,

    title: "课程信息",
    pricing: "课程费用",
    howItWorks: "课程流程",
    platform: "上课平台",
    policy: "课程政策",
    faq: "常见问题",
  },

  policy: {
    ...en.policy,

    eyebrow: "Hamkke 课程政策",

    title: "课程政策",

    intro:
      "每一节课都会专门为你预留时间。以下简单的规则可以帮助我们更公平、更顺畅地安排课程。",

    quickGuide: {
      eyebrow: "快速指南",

      notice: {
        title: "上课前 2 小时以上",
        text: "可以改期，或保留为之后可使用的课程次数。",
      },

      lateNotice: {
        title: "距离上课不足 2 小时",
        text: "该节课程将视为已完成。",
      },

      noShow: {
        title: "未出席且未提前联系",
        text: "该节课程将视为已完成。",
      },

      note:
        "有关特殊情况和突发状况，请查看下方的详细课程政策。",
    },

    details: {
      eyebrow: "详细政策",
      description:
        "选择一个项目即可查看完整说明。",
    },

    cancellation: {
      title: "取消与改期",

      intro:
        "计划有时会发生变化，我完全理解。如果需要取消或调整课程时间，请至少在原定上课时间的 2 小时前联系我。",

      notice: {
        title: "提前 2 小时以上通知",
        text:
          "你可以重新安排课程时间，或将该节课保留为之后可使用的课程次数。",
      },

      lateNotice: {
        title: "提前不足 2 小时通知",
        text: "该节课程将视为已完成。",
      },

      noShow: {
        title: "未通知且未出席",
        text: "该节课程将视为已完成。",
      },

      note:
        "如果遇到突发情况，请尽快告诉我。在条件允许的情况下，我会尽量和你一起找到合适的处理方式。",
    },

    unexpected: {
      title: "突发情况",

      intro:
        "并不是所有事情都在我们的控制范围之内。",

      text:
        "停电、网络或连接问题、紧急情况以及其他突发状况，有时可能会影响正常上课。",

      action:
        "如果发生类似情况，请尽快告诉我。",

      resolution:
        "我会尽量根据实际情况提供合理的解决方式，例如重新安排课程或保留课程次数。",

      teacher:
        "如果因为老师这边的突发情况无法按计划上课，也会按照同样的原则处理。",
    },

    lateArrivals: {
      title: "迟到",

      intro:
        "如果你可能会迟到，可以在方便的时候告诉我。",

      rule:
        "即使迟到，课程仍会按照原定的结束时间结束。",

      example:
        "例如，如果课程原定为晚上 8:00–8:25，而你在 8:10 进入课堂，那么实际上课时间将是 8:10–8:25。",

      noContact:
        "如果课程开始后 10 分钟内仍未进入课堂，并且没有联系我，该节课程将视为未出席，并计为已完成。",
    },

    teacherCancellations: {
      title: "老师取消课程",

      intro:
        "有时老师这边也可能因为特殊情况需要取消课程。",

      text:
        "如果我需要取消课程，会尽快提前告诉你。",

      resolution:
        "你可以获得一节补课，或完整保留该节课程次数。",
    },

    repeatedCancellations: {
      title: "频繁取消或改期",

      intro:
        "生活并不总是能够完全按照计划进行。",

      rule:
        "课程取消没有固定的次数限制。我理解每个人都有可能遇到突发情况。",

      text:
        "不过，如果频繁取消或改期开始影响课程时间的安排，我可能会与你沟通目前的固定时间，并一起寻找更适合双方的安排。",

      note:
        "这样做并不是为了让上课变得麻烦，而是希望已经预留的课程时间能够对每个人都保持公平和有效。",
    },

    tuition: {
      title: "课程费用",

      intro:
        "课程费用会根据所选择的单节课程时长、课时数量以及页面显示的货币计算。",

      rule:
        "课程费用每年都会进行审核，并可能根据通货膨胀和运营成本的变化进行调整。",

      notice:
        "如课程费用发生变化，我们会提前通知。",
    },

    refunds: {
      title: "退款与课程转让",

      intro:
        "由于课程是按一定课时数量购买的，一旦完成付款，原则上不提供退款。",

      rule:
        "如果你无法继续上课，可以申请将剩余未使用的课程转让给其他人，而不是申请退款。",

      transfer:
        "课程转让仅适用于尚未使用的课程，并应在当前课程期结束前进行沟通。具体安排会根据实际情况和课程时间而定。",

      exception:
        "在特殊情况下，Hamkke 可能会酌情考虑退款。",

      note:
        "如果遇到特殊情况，请先和我沟通。我会尽量和你一起找到公平、合理的解决方式。",
    },

    closing: {
      eyebrow: "Hamkke 的小提醒",

      title: "最后想说",

      text:
        "这些规则并不是为了让上课变得复杂。",

      textTwo:
        "它们只是为了让我们的课程安排更加稳定、互相尊重，也让双方都能更安心地上课。",

      thankYou:
        "谢谢你珍惜我们为每一次交流专门预留的时间。",
    },
  },

  pricing: {
    ...en.pricing,

    title: "课程费用",

    intro:
      "简单清晰的一对一英语课程费用说明，让你在开始之前就了解课程安排。",

    privateLessons: {
      title: "一对一在线英语课程",
      package: "20 节课 · 每节 25 分钟",

      description:
        "通过真实的交流、思考、尝试和犯错，慢慢习惯用英语表达自己的一对一课程。",
    },

    waysToLearn: {
      title: "两种学习方向",

      subtitle: "先从你的目标开始。",

      description:
        "有些学习者希望在日常交流中更自然地使用英语，也有人需要为面试、工作或其他具体场景做准备。Hamkke 可以根据不同的目标调整课程。",

      general: {
        title: "综合英语",

        subtitle: "为了日常交流。",

        description:
          "通过与你真正有关的话题，培养更自然地表达自己以及持续交流的能力和信心。",

        points: [
          "日常会话",
          "更自然的表达",
          "词汇与实用表达",
          "表达自己的想法",
          "建立开口说英语的信心",
          "在真实语境中学习语法",
        ],
      },

      specialized: {
        title: "目标型英语",

        subtitle: "为了更具体的目标。",

        description:
          "根据特定场景、目标或沟通需求来安排课程内容。",

        points: [
          "求职面试",
          "商务英语",
          "演讲与表达",
          "旅行英语",
          "学术讨论",
          "其他具体的英语沟通目标",
        ],
      },
    },

    lessonFlow: {
      title: "一节课会怎么进行？",

      intro: "我们不只是学习英语。",

      introHighlight: "我们会真正使用它。",

      steps: {
        conversation: {
          number: "01",
          title: "交流",
          text:
            "围绕与你有关的话题，用英语进行真实的交流。",
        },

        feedback: {
          number: "02",
          title: "反馈",
          text:
            "从语法、词汇、发音和表达中，选择当前对交流最有帮助的部分进行反馈。",
        },

        refinement: {
          number: "03",
          title: "优化表达",
          text:
            "一起找到更清楚、更自然的方式来表达你真正想说的内容。",
        },

        practice: {
          number: "04",
          title: "再次使用",
          text:
            "在交流中再次使用刚刚学到的英语，让它逐渐成为你真正会使用的语言。",
        },
      },
    },

    practical: {
      title: "课程基本信息",

      intro: "从一开始就保持简单清楚。",

      details: {
        lessonLength: {
          label: "单节课时长",
          value: "25 分钟",
        },

        package: {
          label: "课时数量",
          value: "20 节一对一课程",
        },

        format: {
          label: "课程形式",
          value: "在线 · 一对一",
        },

        tuition: {
          label: "课程费用",
        },
      },

      policy: "课程政策",
    },
  },

  platform: {
    ...en.platform,

    title: "使用你熟悉的平台上课",

    intro:
      "选择你最方便使用的平台。无论我们在哪里见面，课程的核心方式都不会改变。",

    available: {
      title: "可使用的平台",

      subtitle: "在你觉得方便的地方见面。",

      description:
        "Hamkke 的课程可以通过多种常用的在线平台进行，你可以选择自己最熟悉、最方便的方式。",
    },

    note:
      "不需要特别的设备。稳定的网络、可以清楚收音的麦克风，以及一个能够安心交流的环境就足够了。",

    beforeLesson: {
      title: "上课前",

      subtitle: "只需要做一点简单的准备。",

      description:
        "不需要复杂的设备，也不需要特别布置学习空间。准备好基本的工具，把更多时间留给真正的英语交流。",

      items: [
        {
          number: "01",
          title: "设备",
          text:
            "可以连接所选上课平台的电脑、平板电脑或手机。",
        },

        {
          number: "02",
          title: "网络",
          text:
            "能够支持顺畅交流的稳定网络连接。",
        },

        {
          number: "03",
          title: "麦克风",
          text:
            "能够让彼此清楚听到声音的耳机或麦克风。",
        },

        {
          number: "04",
          title: "安静的环境",
          text:
            "尽量选择一个不会经常被打扰、可以安心交流的地方。",
        },
      ],
    },

    closing: {
      text:
        "平台只是我们见面的地方。真正重要的是，我们在那里进行的交流。",
    },
  },

  faq: {
    ...en.faq,

    title: "常见问题",

    intro:
      "这里整理了一些学习者在开始第一节课前经常会问的问题。",

    questions: [
      {
        question:
          "如果我说英语时很紧张，或者没有信心，也可以上课吗？",

        answer:
          "当然可以。你不需要从一开始就说得很完美。我会通过提问、给你思考时间以及适当的提示，让你慢慢习惯用英语表达自己。",
      },

      {
        question:
          "上课的时候可以随时提问吗？",

        answer:
          "当然可以。如果有不理解的地方、想知道另一种表达方式，或者想进一步了解某个内容，都可以随时提问。",
      },

      {
        question:
          "需要另外购买教材或课本吗？",

        answer:
          "通常不需要。一般课程不要求另外购买教材。我会根据课程内容和你的学习目标准备需要的资料。",
      },

      {
        question:
          "上课前需要提前准备什么吗？",

        answer:
          "大多数情况下不需要特别准备。你可以直接来上课，我们从交流开始。如果某节课需要提前准备，我会事先告诉你。",
      },

      {
        question:
          "我可以带自己想学习的材料或话题来上课吗？",

        answer:
          "可以。如果你有想讨论的话题、文章、视频、演讲材料或其他内容，都可以带到课堂上，我们可以把它们用于真实的交流和练习。",
      },

      {
        question: "课程费用怎么支付？",

        answer:
          "确认课程安排时，我会同时说明可使用的付款方式。如果对付款流程有任何疑问，可以直接联系我。",
      },

      {
        question: "课程费用可以退款吗？",

        answer:
          "退款和课程转让会按照 Hamkke 的课程政策处理。详细内容请查看课程政策页面。",
      },

      {
        question:
          "下一期课程什么时候付款？",

        answer:
          "在当前课程期结束前，我们会确认是否继续下一期课程，并提供相应的付款信息。",
      },

      {
        question:
          "如果需要取消、缺席或调整课程时间怎么办？",

        answer:
          "有关取消、缺席和改期的具体规则，请查看 Hamkke 的课程政策。",
      },
    ],

    closing:
      "如果还有其他想了解的问题，欢迎随时联系。",
  },

  howItWorks: {
    ...en.howItWorks,

    title: "如何开始课程",

    intro:
      "从第一次联系到正式开始上课，整个过程都会尽量保持简单清楚。",

    steps: {
      inquire: {
        number: "01",
        title: "联系 Hamkke",
        text:
          "简单告诉我们你目前学习英语的情况、希望提升的地方，以及你想通过课程实现什么目标。",
      },

      assessment: {
        number: "02",
        title: "免费评估",
        text:
          "通过简短的交流了解你目前的英语水平、表达习惯，以及可能需要哪些方面的支持。",
      },

      decide: {
        number: "03",
        title: "一起确认",
        text:
          "我们会聊聊你需要什么样的课程，也一起看看 Hamkke 是否适合你。不需要当场决定是否报名。",
      },

      details: {
        number: "04",
        title: "确认课程安排",
        text:
          "如果决定一起开始学习，我们会确认课程形式、时间安排、费用和付款方式等信息。",
      },

      contract: {
        number: "05",
        title: "确认协议",
        text:
          "确认课程内容后，我们会完成课程协议并确定上课时间。",
      },

      payment: {
        number: "06",
        title: "付款",
        text:
          "课程开始前完成付款。确认付款后，就可以准备正式开始课程。",
      },

      begin: {
        number: "07",
        title: "开始上课",
        text:
          "从这里开始真正的交流。你会在实际使用英语的过程中朝自己的目标前进，并逐渐建立表达的信心。",
      },
    },

    closing: {
      title: "不需要复杂的流程。",

      text:
        "我们只是从了解你现在在哪里、想走到哪里，以及 Hamkke 是否适合陪你完成这段学习过程开始。",
    },
  },

  hero: {
    ...en.hero,

    eyebrow: "一对一在线英语",

    titleFirst: "From Small Talk",
    titleSecond: "",
    titleAccent: "to Big Ideas.",

    descriptionFirst:
      "当你真正能够使用英语时，它才会变得更有用。",

    descriptionSecond:
      "从你已经会的英语开始，慢慢学会表达更多你真正想说的话。",

    assessment: "预约免费评估",

    features: {
      conversation: "以交流为中心",
      learners: "儿童到成人",
      online: "100% 在线",
      personalized: "个性化课程",
    },
  },

  findYourLesson: {
    ...en.findYourLesson,

    eyebrow: "选择你的课程",

    title: "找到适合你的课程。",

    description:
      "继续之前，可以先查看课程形式、课时数量和课程费用。",

    online: "一对一在线",

    lesson: "Conversation Lesson",

    learners: "儿童 · 青少年 · 成人",

    platforms: "上课平台",

    format: "课程形式",

    voice: "音频",
    voiceDetail: "关闭摄像头",

    video: "视频",
    videoDetail: "摄像头可选",

    durationLabel: "单节课时长",
    perLesson: "每节",

    lessonsLabel: "课时数量",
    lessons: "20 节",
    perPackage: "课程期",

    tuitionLabel: "课程费用",

    tuitionReview:
      "课程费用每年都会进行审核，并可能根据通货膨胀和运营成本的变化进行调整。",

    term: {
      label: "课时数量",
      lessons: "{count} 节",
      flexible: "10 节或 20 节",
      standard: "20 节课程",
      perTerm: "{count} 节课程",
      choose10: "10 节",
      choose20: "20 节",
    },

    chooseLesson: "选择这项课程",

    decreaseDuration: "缩短单节课时长",
    increaseDuration: "延长单节课时长",
  },

  hamkkeApproach: {
    ...en.hamkkeApproach,

    eyebrow: "The Hamkke Approach",

    title: {
      lineOne:
        "我们不是先为交流学好英语。",
      lineTwo:
        "交流本身就是学习的一部分。",
    },

    description: {
      text:
        "一个想法带来一个问题，一个问题又带来更好的表达方式。每当你再次尝试表达时，你的英语也会随着交流一起成长。",

      highlights: [
        "更好的表达方式",
        "英语也会随着交流一起成长",
      ],
    },

    steps: {
      talk: {
        number: "01",
        title: "We Talk",
        description:
          "从你真正想说的事情开始。",
      },

      goDeeper: {
        number: "02",
        title: "We Go Deeper",
        description:
          "通过进一步的问题，让你的想法变得更具体、更完整。",
      },

      refine: {
        number: "03",
        title: "We Refine",
        description:
          "老师会帮助你优化交流中自然出现的英语表达。",
      },

      tryAgain: {
        number: "04",
        title: "You Try Again",
        description:
          "再次使用刚刚学到的英语，更清楚、更有信心地表达自己。",
      },
    },

    continuation: {
      lineOne: "然后，交流",
      lineTwo: "继续下去。",
    },

    explore: "了解 Hamkke 教学方式",
  },

  learnerStages: {
    ...en.learnerStages,

    eyebrow: "适合不同学习阶段",

    title:
      "随着你的成长，交流的方式也会改变。",

    description: {
      text:
        "孩子正在寻找讲故事需要的词语，青少年正在学习如何解释自己的观点，而成人可能希望更准确地表达真正想说的话。目标会改变，但 Hamkke 会从每一位学习者当前能够开始交流的地方出发。",

      highlights: [
        "更准确地表达真正想说的话",
        "能够开始交流的地方",
      ],
    },

    start: {
      number: "01",
      text: "从你现在的位置开始。",
    },

    stages: {
      kids: {
        number: "02",
        title: "儿童",
        tagline:
          "把简单的回答变成真正的交流。",
        description:
          "通过故事、问题和熟悉的话题，让孩子练习用英语表达自己的想法，并逐渐建立开口交流的信心。",
      },

      teens: {
        number: "03",
        title: "青少年",
        tagline:
          "有更多想说的，也知道怎样表达。",
        description:
          "从简单回答进一步发展自己的观点、解释原因、提出问题，并练习用英语表达更复杂的想法。",
      },

      adults: {
        number: "04",
        title: "成人",
        tagline:
          "让英语听起来更像你自己。",
        description:
          "围绕对自己真正重要的话题进行交流，并在过程中自然地调整需要的词汇、句子结构和表达方式。",
      },
    },

    further: "一起再向前一点。",
    keepGrowing: "继续成长",
  },

  teachers: {
    ...en.teachers,

    section: {
      eyebrow: "Hamkke 老师",
      title: "陪你一起交流的人。",
      viewAll: "查看老师",
    },

    directory: {
      eyebrow: "Hamkke 老师",

      title:
        "找到一位让你愿意安心交流的老师。",

      description: {
        text:
          "每位 Hamkke 老师都有不同的个性和经验，但我们共同重视同一件事：让学习者能够安心表达，并在真实的交流中成长。",

        highlights: ["安心表达"],
      },

      mascotAlt:
        "Hamkke 老师角色",

      empty:
        "目前还没有可以展示的老师。",

      viewProfile: "查看老师资料",
    },

    card: {
      teacherLabel: "Hamkke 老师",
      learners: "适合学员",
      specialties: "擅长领域",
      viewProfile: "查看老师资料",
      avatarAlt: "{name}老师",
    },

    learnerGroups: {
      kids: "儿童",
      teens: "青少年",
      adults: "成人",
    },

    presentations: {
      jesica: {
        role: "Hamkke 老师",

        quote:
          "帮助你用英语说出更多自己真正想表达的内容。",

        specialties: {
          conversation: {
            title: "会话",
            detail: "真实沟通",
          },

          interview: {
            title: "面试准备",
            detail: "OPIC、航空公司面试等",
          },

          supportive: {
            title: "耐心与支持",
            detail: "按照自己的节奏学习",
          },
        },
      },

      default: {
        role: "Hamkke 老师",

        quote:
          "通过有意义的交流，帮助学习者真正使用英语。",

        specialties: {
          conversation: {
            title: "会话",
            detail: "真实沟通",
          },

          personalized: {
            title: "个性化",
            detail: "适合你的课程",
          },

          supportive: {
            title: "支持",
            detail: "按照自己的节奏学习",
          },
        },
      },
    },
  },

  learnerStories: {
    ...en.learnerStories,

    eyebrow: "Passed Along",

    title:
      "来自学习者的话。",

    description: {
      text:
        "这里记录了学习者和家人在学习过程中分享的经历、成长时刻以及他们真实的感受。",

      highlights: ["学习者和家人"],
    },

    closing: {
      text:
        "这些话来自一次次交流、成长，以及我们一起学习所经历的时间。",

      highlights: [
        "交流、成长，以及我们一起学习所经历的时间",
      ],
    },

    explore: "查看学员故事",

    readMore: "阅读更多",

    modal: {
      ariaLabel: "学员故事",
      close: "关闭学员故事",
    },
  },

  getStarted: {
    ...en.getStarted,

    eyebrow: "准备好了就开始",

    title:
      "每一次有意义的交流，都有一个开始。",

    subtitle:
      "也许你的开始，就在这里。",

    steps: {
      introduction: {
        number: "01",
        title: "告诉我们你的情况。",
        description:
          "你的目标、目前的英语情况，以及你需要什么样的帮助。",
      },

      conversation: {
        number: "02",
        title: "先聊一聊。",
        description:
          "认识你的老师，自然地进行一次交流。",
      },

      lessons: {
        number: "03",
        title: "开始课程。",
        description:
          "选择适合你的时间，然后正式开始学习。",
      },
    },

    invitation:
      "一起迈出第一步吧。",

    button: "预约免费评估",
  },

  lessonsPage: {
  ...en.lessonsPage,

  hero: {
    eyebrow: "1对1 在线英语",

    title:
      "为了表达而学习，在对话中不断进步。",

    description: {
      text:
        "Hamkke的1对1在线英语课程以真实对话为中心。使用你已经会的英语，在交流中学习真正需要的表达，并一步一步更清楚、更自在地说出自己的想法。",

      highlights: [
        "真实对话",
        "更清楚、更自在地",
      ],
    },
  },

  audience: {
    eyebrow: "课程适合谁？",

    title:
      "找到适合你的学习方式。",

    description: {
      text:
        "同样以对话为中心的学习方式，也会根据不同的年龄和目标进行调整。聊什么，以及老师如何提供支持，都会根据学习者的需要而变化。",

      highlight:
        "根据不同的年龄和目标进行调整",
    },

    groups: {
      kids: {
        label: "儿童",

        title:
          "让正在学习的英语，有更多真正用出来的机会。",

        description:
          "适合正在学习英语，但需要更多机会在对话中回答问题、进行解释，并表达自己想法的孩子。",

        goals: [
          "口语练习",
          "在对话中学习词汇",
          "更完整的回答",
          "口语自信",
        ],
      },

      teens: {
        label: "青少年",

        title:
          "不只停留在简短回答。",

        description:
          "适合希望表达自己的观点、解释想法，并更自在地用英语进行较长对话的青少年。",

        goals: [
          "对话",
          "观点与想法",
          "学校英语",
          "口语自信",
        ],
      },

      adults: {
        label: "成人",

        title:
          "在对你重要的场合，真正用上英语。",

        description:
          "适合希望在日常生活、工作、旅行，或对自己重要的交流中，更自在地使用英语沟通的成人。",

        goals: [
          "日常英语",
          "工作",
          "面试",
          "旅行",
          "自由对话",
        ],
      },
    },
  },

  details: {
    eyebrow: "课程详情",

    title:
      "选择适合你的课程设置。",

    description:
      "选择适合你的课程时长和课次。",

    online: "1对1 在线",

    lesson: "Conversation Lesson",

    learners: "儿童 · 青少年 · 成人",

    platforms: "上课平台",

    format: "上课方式",

    audio: {
      title: "语音",
      description: "关闭摄像头",
    },

    video: {
      title: "视频",
      description: "可选择是否开启摄像头",
    },

    duration: {
      label: "课程时长",

      minutes: "{count}分钟",

      perLesson: "每节课",

      decrease:
        "缩短课程时长",

      increase:
        "延长课程时长",
    },

    term: {
      label: "课次",

      lessons: "{count}节课",

      flexible:
        "可选择10节或20节",

      standard:
        "25～35分钟课程为20节一期",

      choose10:
        "选择10节课",

      choose20:
        "选择20节课",
    },

    tuition: {
      label: "学费",

      perTerm:
        "每期{count}节课",

      review:
        "学费每年进行审核，并可能根据通货膨胀及运营成本的变化进行调整。",
    },

    chooseLesson:
      "选择这个课程",
  },

  nextStep: {
    eyebrow: "老师",

    title:
      "找到一位让你觉得可以自在交流的老师。",

    button:
      "认识我们的老师",
  },
},

  approachPage: {
  ...en.approachPage,

  hero: {
    eyebrow: "The Hamkke Approach",

    title:
      "对话发生的地方，也是学习开始的地方。",

    description: {
      text:
        "在 Hamkke，我们不是等英语学得足够完美以后才开始对话，而是在对话中发现自己需要的英语，学习它，再把它用出来。",

      highlights: [
        "在对话中",
        "发现自己需要的英语，学习它，再把它用出来",
      ],
    },
  },

  whyConversation: {
    eyebrow: "为什么是对话？",

    title:
      "知道英语，和真正用英语，是两回事。",

    firstParagraph: {
      text:
        "你可能认识很多单词，理解语法，也能在题目中找出正确答案，但轮到自己开口时，还是会停下来，不知道该怎么说。",

      highlight:
        "但轮到自己开口时，还是会停下来，不知道该怎么说",
    },

    secondParagraph: {
      text:
        "Hamkke关注的正是这个差距。与其等到英语足够完美才开始使用，不如先用你已经会的英语，在对话中发现自己还需要什么，再从那里一点一点继续学习。",

      highlights: [
        "正是这个差距",
        "先用你已经会的英语",
      ],
    },
  },

  framework: {
    eyebrow: "课堂流程",

    title:
      "不是固定的脚本，而是一个不断循环的过程。",

    description:
      "每一次对话的内容都可能不同，但学习发生的基本过程始终保持一致。",

    steps: {
      talk: {
        number: "01",
        title: "We Talk",
        description:
          "从学习者真正想说的事情开始。",
        short:
          "对话从你的想法开始。",
      },

      goDeeper: {
        number: "02",
        title: "We Go Deeper",
        description:
          "通过进一步的问题，把想法说得更具体，也发展得更深入。",
        short:
          "一个回答，慢慢变成真正的对话。",
      },

      refine: {
        number: "03",
        title: "We Refine",
        description:
          "一起调整对话中真正需要的词汇、语法、发音和表达方式。",
        short:
          "一起调整当下真正需要的英语。",
      },

      tryAgain: {
        number: "04",
        title: "You Try Again",
        description:
          "再次使用刚刚学到的英语，把同一个想法表达得更清楚。",
        short:
          "把学到的英语重新用回对话中。",
      },
    },

    cycle: {
      title:
        "这是一个循环，而不是固定的脚本。",

      description:
        "在一次对话中，我们可能会在这些步骤之间来回几次。有时会围绕一个想法多聊一会儿，有时调整好一个有用的表达后，就马上回到对话中。基本的学习框架保持一致，但对话本身始终是灵活的。",
    },
  },

  teacherRole: {
    eyebrow: "老师的角色",

    title:
      "给予引导，但不替你完成对话。",

    description: {
      text:
        "老师会帮助对话自然地继续，同时给学习者足够的空间，让你自己思考、回答，并尝试用英语表达。",

      highlight:
        "让你自己思考、回答，并尝试用英语表达",
    },

    roles: {
      listen: {
        number: "01",
        title: "倾听",
        description:
          "关注你真正想表达的内容，而不只是检查每一句话是否完美。",
      },

      ask: {
        number: "02",
        title: "提问",
        description:
          "通过有意义的追问，帮助你进一步发展自己的想法，并继续说下去。",
      },

      refine: {
        number: "03",
        title: "调整",
        description:
          "在对话真正需要的时候，提供更清楚、更自然的英语表达。",
      },

      giveBack: {
        number: "04",
        title: "交还给你",
        description:
          "老师不会替你把话说完，而是把空间留给你，让你自己尝试使用刚刚学到的英语。",
      },
    },
  },

  principles: {
    eyebrow: "课堂原则",

    title:
      "以对话为中心，但不是没有方向地聊天。",

    communication: {
      title: "沟通先于完美",
      description:
        "先帮助学习者把自己的想法表达出来，再通过准确性让沟通变得更清楚、更有效。",
    },

    listen: {
      title: "先听，再教",
      description:
        "在决定要教什么之前，先理解学习者真正想表达什么。",
    },

    thought: {
      title: "跟随学习者的想法",
      description:
        "不是把学习者带向预先设定的答案，而是跟随他们的想法自然发展。",
    },

    questions: {
      title: "有目的地提问",
      description:
        "提问不只是为了让对话变长，而是为了帮助学习者扩展想法和表达。",
    },

    correction: {
      title: "有选择地纠正",
      description:
        "不会立刻纠正每一个错误，而是选择真正有助于当前对话和学习的部分。",
    },

    voice: {
      title: "保留学习者自己的表达",
      description:
        "即使提供更自然的英语，也会尽量保留学习者原本想表达的意思和个人风格。",
    },

    context: {
      title: "在语境中学习",
      description:
        "不是把词汇和语法完全分开学习，而是在真实对话中需要它们的时候去理解和使用。",
    },

    reuse: {
      title: "再次使用",
      description:
        "把新学到的英语再说一次，让它慢慢变成真正能够使用的语言。",
    },

    adapt: {
      title: "根据需要调整支持",
      description:
        "根据学习者的水平和当下的情况，调整问题、解释、纠正方式以及思考时间。",
    },

    independence: {
      title: "独立表达也是进步",
      description:
        "当学习者能够用越来越少的帮助表达并发展自己的想法时，这也是重要的进步。",
    },
  },

  teachers: {
    eyebrow: "共同的教学标准",

    title:
      "老师不同，学习的方向一致。",

    description: {
      text:
        "每位老师都会把自己的个性、经验和专业判断带进课堂，而 Hamkke 提供的是大家共同遵循的教学标准。",

      highlights: [
        "每位老师",
        "共同遵循的教学标准",
      ],
    },

    standard:
      "Different teachers. Different learners. One shared educational standard.",
  },

  progress: {
    eyebrow: "Hamkke如何看待进步",

    title:
      "重要的不只是知道多少，而是现在能用英语做什么。",

    description: {
      text:
        "我们不会只用记住了多少单词、做对了多少语法题来判断进步。我们也会关注学习者是否能把自己的想法解释得更完整，能不能提问、重新表达，以及能否在越来越少的帮助下继续对话。",

      highlights: [
        "现在能用英语做什么",
        "越来越少的帮助",
      ],
    },
  },

  nextStep: {
    eyebrow: "From Small Talk to Big Ideas",

    title:
      "从你已经会的英语开始。",

    description:
      "找到适合你的课程设置，然后开始在真实的对话中使用英语。",

    button: "找到适合你的课程",
  },

  closing: {
    eyebrow: "继续下去的对话",

    title:
      "每一次对话，都让英语更像是你自己的语言。",

    description:
      "比起一次说出完美的句子，我们更重视一次次思考、表达、调整，再重新尝试的过程。",

    button: "预约免费评估",
  },
},

  aboutPage: {
    ...en.aboutPage,

    hero: {
      eyebrow: "关于 Hamkke",

      title:
        "当有人陪你一起学习，学习本身也会变得不一样。",

      description: {
        text:
          "Hamkke 是一个以有意义的交流和细致支持为核心的在线英语学习空间。我们相信，当学习者有机会真正使用英语时，语言才会变得更有意义。",

        highlights: [
          "有意义的交流",
          "真正使用英语",
        ],
      },
    },

    name: {
      korean: "함께",
      meaning: "Together",

      title: "为什么叫 Hamkke？",

      paragraphs: [
        {
          text:
            "함께（Hamkke）在韩语中是“一起”的意思。",
          highlights: ["함께", "一起"],
        },

        {
          text:
            "选择这个名字，是因为我们一直认为，学习一门语言并不意味着所有事情都必须靠自己摸索。",
          highlights: ["并不意味着所有事情都必须靠自己摸索"],
        },

        {
          text:
            "有时，进步就发生在一些很简单的事情里：有人陪你交流，有时间思考，犯错后可以再次尝试，然后慢慢找到自己真正想表达的内容。",
          highlights: ["有时间思考"],
        },

        {
          text:
            "这就是我们希望 Hamkke 成为的地方。学习者和老师可以一起，一点一点地继续向前。",
          highlights: ["一起，一点一点地继续向前"],
        },
      ],
    },

    purpose: {
      eyebrow: "Hamkke 的目的",

      title:
        "知道英语，和真正能够使用英语，并不总是同一件事。",

      paragraphs: [
        {
          text:
            "学习者可能理解语法、认识单词、会做题，也能阅读文章，但到了真实交流中，还是可能很难自然地表达自己的想法。",

          highlights: [
            "自然地表达自己的想法",
          ],
        },

        {
          text:
            "Hamkke 就从这个差距开始。",
          highlights: ["这个差距"],
        },

        {
          text:
            "在 Hamkke，交流本身就是学习的一部分。通过有意义的交流，学习者会逐渐发现自己已经能够表达什么、在哪里需要帮助，以及还需要哪些英语才能说出更多真正想说的内容。",

          highlights: [
            "交流本身就是学习的一部分",
            "说出更多真正想说的内容",
          ],
        },
      ],
    },

    beliefs: {
      eyebrow: "Hamkke 相信什么",

      title:
        "英语应该成为真正可以使用的语言。",

      communication: {
        title: "沟通",

        description: {
          text:
            "在担心每一句话是否完美之前，学习者首先需要一个可以安心表达想法的空间。准确度很重要，但它应该帮助沟通，而不是阻止学习者开口。",

          highlights: [
            "安心表达想法",
            "帮助沟通",
          ],
        },
      },

      responsiveness: {
        title: "根据学习者调整",

        description: {
          text:
            "每个人需要的支持、学习结构、挑战程度和思考时间都不同。课程应该根据眼前这位学习者真正需要什么而调整。",

          highlights: [
            "眼前这位学习者真正需要什么",
          ],
        },
      },

      independence: {
        title: "独立表达",

        description: {
          text:
            "进步不只是知道更多英语。当学习者逐渐能够在更少帮助的情况下表达、澄清和发展自己的想法，这也是非常重要的成长。",

          highlights: ["更少帮助的情况下"],
        },
      },
    },

    sharedStandard: {
      eyebrow: "共同的教学标准",

      title: {
        lineOne: "不同的老师。",
        lineTwo: "不同的学习者。",
        lineThree: "共同的教育目标。",
      },

      firstParagraph: {
        text:
          "每位老师都会把自己的个性、经验和专业判断带进课堂。与此同时，Hamkke 也有共同的教学理念作为课程的基础。",

        highlights: [
          "共同的教学理念",
        ],
      },

      secondParagraph: {
        text:
          "我们的目标并不是让每位老师用完全相同的方式教学，而是在有意义的沟通、细致的支持、实用的反馈以及学习者逐渐独立表达的基础上，提供一致的学习体验。",

        highlights: [
          "不是让每位老师用完全相同的方式教学",
          "学习者逐渐独立表达",
        ],
      },

      approachButton:
        "了解 Hamkke 教学方式",

      teachersButton: "认识我们的老师",

      visual: {
        korean: "함께",
        principles: "学习 · 练习 · 成长",
        together: "一起。",
      },
    },

    closing: {
      eyebrow: "一起继续向前",

      title:
        "学习是一个不断继续的过程。",

      firstParagraph: {
        text:
          "每一次交流，都是一次新的机会：发现、尝试、调整，然后比上一次再多表达一点。",

        highlights: [
          "发现、尝试、调整",
        ],
      },

      secondParagraph: {
        text:
          "Hamkke 希望提供这样的空间，让学习者能够越来越独立、越来越自在地用英语表达自己真正想说的内容。",

        highlights: [
          "越来越独立、越来越自在",
        ],
      },
    },
  },

  teacherProfilePage: {
    ...en.teacherProfilePage,

    breadcrumb: {
      label: "当前位置",
      home: "首页",
      teachers: "老师",
    },

    teacher: {
      label: "Hamkke 老师",
      avatarAlt: "{name}，Hamkke 老师",
    },

    audio: {
      greeting: "来自{name}老师的简短问候",

      comingSoon:
        "音频介绍正在准备中",

      play:
        "播放{name}老师的音频介绍",

      pause:
        "暂停{name}老师的音频介绍",

      progress: "音频播放进度",
    },

    getStarted: {
      eyebrow: "从这里开始",

      title:
        "和{name}老师开始一次交流。",

      description:
        "预约免费评估，一起聊聊你的目标，也看看老师可以怎样支持你。",

      details: {
        format: "一对一在线课程",
        duration: "25–50 分钟",
        atmosphere:
          "没有压力，轻松交流",
      },

      button: "预约免费评估",
    },
  },

  teacherProfile: {
    ...en.teacherProfile,

    tabs: {
      about: "关于老师",
      qualifications: "资历与经验",
      learnerStories: "学员故事",
      availability: "可预约时间",
    },

    about: {
      title: "关于我",
    },

    qualifications: {
      title: "资历与教学经验",

      description:
        "支持我英语教学工作的培训、教育背景和相关经验。",

      empty:
        "资历信息正在准备中。",
    },

    stories: {
      title: "来自学员的话",

      story: "则故事",
      stories: "则故事",
      shared: "已分享",

      rating: "满分 5 分，评分 {rating}",

      readMore: "阅读更多",
      showFewer: "收起",

      showAll:
        "查看全部 {count} 则故事",

      empty:
        "目前还没有学员分享故事。",

      modal: {
        label: "学员故事",

        ariaLabel:
          "来自{name}的学员故事",

        close: "关闭学员故事",
      },
    },

    availability: {
      title: "每周可预约时间",

      description:
        "简单查看目前开放的课程时间，以及已有固定学员的时间。",

      previousWeek: "上一周",
      today: "今天",
      nextWeek: "下一周",

      loading: "正在加载可预约时间...",
      error:
        "无法加载可预约时间。",

      timezone: {
        label: "你的时区",
        philippines: "菲律宾",
        korea: "韩国",
        japan: "日本",
        china: "中国",
        vietnam: "越南",
      },

      status: {
        available: "可预约",
        regularStudent: "固定学员",
        regularShort: "固定",
      },

      empty:
        "本周暂时没有显示开放的课程时间。",

      note:
        "时间以{timezone}时间显示。随着课程安排或时间调整，可预约情况可能发生变化。",
    },

    days: {
      sun: "周日",
      mon: "周一",
      tue: "周二",
      wed: "周三",
      thu: "周四",
      fri: "周五",
      sat: "周六",
    },
  },

  footer: {
    ...en.footer,

    brand: "Hamkke │ 함께",
    tagline: "From Small Talk to Big Ideas.",

    description:
      "以交流为中心的英语课程，帮助学习者真正使用更多自己已经会的英语。",

    groups: {
      learn: "学习",
      hamkke: "Hamkke",
      connect: "联系",
    },

    links: {
      lessons: "课程",
      approach: "Hamkke 教学方式",
      teachers: "老师",
      about: "关于 Hamkke",
      policy: "课程政策",
      startConversation: "开始交流",
      instagram: "Instagram",
    },

    copyright:
      "© 2026 Hamkke │ 함께. All rights reserved.",

    lessons: "课程",
    lessonsGroup: "学习",
    howItWorks: "课程流程",
    pricing: "课程费用",
    platform: "上课平台",
    hamkkeGroup: "Hamkke",
    about: "关于 Hamkke",
    faq: "常见问题",
    policy: "课程政策",
    connectGroup: "联系",
    startConversation: "开始交流",
  },

  inquiry: {
    ...en.inquiry,

    brand: "Hamkke │ 함께",

    headings: {
      experience:
        "想先了解一下 Hamkke 是怎样看待英语学习的吗？",

      goals:
        "你希望自己能够用英语做到什么？",

      stories:
        "告诉我们，你希望自己的英语走到哪里。",

      startAConversation:
        "先从一次交流开始吧。",
    },

    intro:
      "简单告诉我们你目前学习英语的情况，以及你希望一起练习什么。",

    reassurance: {
      personalReply:
        "我会在 24 小时内亲自回复",

      informationSafe:
        "你的个人信息会得到妥善保护。",
    },

    fields: {
      name: "姓名或你希望我们怎样称呼你",
      email: "电子邮箱",

      contactMethod:
        "你希望我们通过什么方式联系你？",

      contactId:
        "ID、用户名或电话号码",

      level:
        "目前用英语交流时，你觉得自己处于什么状态？",

      goal:
        "你最希望练习什么？为什么？",

      message:
        "还有其他想告诉我们的事情吗？（选填）",
    },

    options: {
      contactMethod: {
        kakaoTalk: "KakaoTalk",
        whatsApp: "WhatsApp",
        weChat: "WeChat",
      },

      level: {
        justGettingStarted:
          "我刚刚开始学习英语。",

        understandingButSpeakingIsDifficult:
          "我能理解英语，但开口说比较困难。",

        simpleConversationsButStillHesitate:
          "我可以进行简单交流，但说话时还是经常犹豫。",

        communicateWellButWantToSpeakMoreNaturally:
          "我可以正常交流，但希望表达得更自然。",

        comfortableSpeakingButWantToBecomeMoreFluent:
          "我已经比较习惯说英语，但希望变得更流利。",
      },

      goal: {
        speakMoreConfidently:
          "更有信心地说英语",

        improveEverydayConversation:
          "提高日常英语交流能力",

        englishForWork:
          "在工作中使用英语",

        interviewPreparation:
          "准备英语面试",

        travelMoreComfortably:
          "旅行时更自在地使用英语",

        improveOverallEnglish:
          "全面提高英语能力",

        somethingElse: "其他",
      },
    },

    submit: "发送咨询",
    sending: "正在发送...",

    privacy:
      "你的个人信息会得到妥善保护，不会与第三方分享。",

    success: {
      title: "谢谢你。",

      message:
        "我们已经收到你的咨询。我会在 24 小时内亲自回复。很期待进一步了解你的英语情况和学习目标，也一起看看接下来可以怎样继续学习。",

      closing: "期待很快和你聊聊。",
    },

    errors: {
      general:
        "出现了一些问题，请再试一次。",

      network:
        "消息发送失败，请再试一次。",
    },
  },

  language: {
    english: "English",
    korean: "한국어",
    chinese: "中文",
    japanese: "日本語",
  },
};

export default zh;






