import en from "./en";

const ko = {
  ...en,

  nav: {
    ...en.nav,

    home: "홈",
    approach: "Hamkke 방식",
    lessons: "수업",
    teachers: "선생님",
    policy: "수업 정책",
    about: "Hamkke 소개",
    login: "로그인",

    experience: "수업 경험",
    goals: "목표",
    stories: "이야기",
    startConversation: "대화 시작하기",
  },

  info: {
    ...en.info,

    title: "안내",
    pricing: "수업료",
    howItWorks: "수업 진행 방식",
    platform: "수업 플랫폼",
    policy: "수업 정책",
    faq: "자주 묻는 질문",
  },

  policy: {
    ...en.policy,

    eyebrow: "Hamkke 수업 정책",

    title: "수업 정책",

    intro:
      "각 수업 시간은 한 분의 학습자를 위해 미리 확보됩니다. 모두가 편안하고 공정하게 수업 일정을 이용할 수 있도록 몇 가지 간단한 기준을 안내드립니다.",

    quickGuide: {
      eyebrow: "한눈에 보기",

      notice: {
        title: "수업 2시간 전까지",
        text: "일정 변경 또는 수업 크레딧으로 처리할 수 있습니다.",
      },

      lateNotice: {
        title: "수업까지 2시간 미만",
        text: "해당 수업은 진행된 것으로 처리됩니다.",
      },

      noShow: {
        title: "무단 결석",
        text: "해당 수업은 진행된 것으로 처리됩니다.",
      },

      note:
        "예외 상황이나 예상하지 못한 사정에 대해서는 아래의 상세 정책을 확인해 주세요.",
    },

    details: {
      eyebrow: "상세 정책",
      description:
        "각 항목을 선택하면 자세한 내용을 확인할 수 있습니다.",
    },

    cancellation: {
      title: "취소 및 일정 변경",

      intro:
        "일정은 언제든 달라질 수 있다는 점을 이해합니다. 수업을 취소하거나 일정을 변경해야 하는 경우, 예정된 수업 시간 최소 2시간 전까지 알려 주세요.",

      notice: {
        title: "2시간 이상 전에 알려 주신 경우",
        text:
          "수업 일정을 변경하거나 추후 수업에 사용할 수 있는 크레딧으로 처리할 수 있습니다.",
      },

      lateNotice: {
        title: "2시간 미만을 남기고 알려 주신 경우",
        text:
          "해당 수업은 진행된 것으로 처리됩니다.",
      },

      noShow: {
        title: "연락 없이 수업에 참여하지 않은 경우",
        text:
          "해당 수업은 진행된 것으로 처리됩니다.",
      },

      note:
        "예상하지 못한 일이 생겼다면 가능한 한 빨리 알려 주세요. 상황이 허락하는 범위에서 적절한 방법을 함께 찾아보겠습니다.",
    },

    unexpected: {
      title: "예상하지 못한 상황",

      intro:
        "모든 상황을 미리 예상하거나 통제할 수 있는 것은 아닙니다.",

      text:
        "정전, 인터넷 또는 연결 문제, 긴급 상황 등 예상하지 못한 사정으로 수업 참여가 어려워질 수 있습니다.",

      action:
        "이런 상황이 생기면 가능한 한 빨리 알려 주세요.",

      resolution:
        "상황에 따라 수업 일정 변경이나 수업 크레딧 제공 등 합리적인 방법을 함께 찾아보겠습니다.",

      teacher:
        "선생님 측의 예상하지 못한 사정으로 예정된 수업을 진행하기 어려운 경우에도 동일하게 적용됩니다.",
    },

    lateArrivals: {
      title: "수업 지각",

      intro:
        "수업에 늦게 될 경우 가능할 때 알려 주세요.",

      rule:
        "늦게 입장하더라도 수업은 원래 예정된 시간에 종료됩니다.",

      example:
        "예를 들어 수업이 오후 8:00–8:25로 예정되어 있고 오후 8:10에 입장한 경우, 수업은 오후 8:10–8:25까지 진행됩니다.",

      noContact:
        "수업 시작 후 10분 이내에 입장하지 않고 별도의 연락도 없는 경우, 무단 결석으로 간주되어 해당 수업은 진행된 것으로 처리됩니다.",
    },

    teacherCancellations: {
      title: "선생님의 수업 취소",

      intro:
        "선생님도 부득이하게 수업을 취소해야 하는 상황이 생길 수 있습니다.",

      text:
        "수업을 취소해야 하는 경우 가능한 한 빨리 안내드리겠습니다.",

      resolution:
        "취소된 수업은 보강 수업을 제공하거나 해당 수업 전체를 크레딧으로 처리합니다.",
    },

    repeatedCancellations: {
      title: "반복적인 취소 및 일정 변경",

      intro:
        "언제나 계획대로 일정을 지키기 어려울 수 있다는 점을 이해합니다.",

      rule:
        "수업 취소 횟수에 정해진 제한은 없습니다. 예상하지 못한 일이 생길 수 있다는 점을 충분히 이해합니다.",

      text:
        "다만 잦은 취소나 일정 변경으로 정기적인 수업 시간 확보가 어려워지는 경우, 현재 일정을 함께 확인하고 서로에게 더 잘 맞는 방법을 찾아보기 위해 연락드릴 수 있습니다.",

      note:
        "이 정책의 목적은 수업을 어렵게 만드는 것이 아니라, 미리 확보된 수업 시간을 모두가 공정하고 의미 있게 이용할 수 있도록 하는 것입니다.",
    },

    tuition: {
      title: "수업료 및 가격",

      intro:
        "수업료는 선택한 수업 시간, 수강 횟수, 그리고 페이지에 표시된 통화에 따라 책정됩니다.",

      rule:
        "수업료는 매년 검토되며 물가 상승 및 운영 비용의 변동을 반영하여 조정될 수 있습니다.",

      notice:
        "수업료가 변경되는 경우 사전에 안내드립니다.",
    },

    refunds: {
      title: "환불 및 수업 양도",

      intro:
        "수업은 정해진 횟수의 term 단위로 등록되므로, 결제가 완료된 후에는 일반적으로 환불이 어렵습니다.",

      rule:
        "수업을 계속하기 어려운 경우 환불 대신 남아 있는 미사용 수업을 다른 사람에게 양도하는 방법을 요청할 수 있습니다.",

      transfer:
        "수업 양도는 아직 사용하지 않은 수업에 한해 검토되며, 현재 term이 종료되기 전에 미리 상의해 주세요. 실제 진행 방법은 상황과 가능한 일정에 따라 달라질 수 있습니다.",

      exception:
        "특별한 사정이 있는 경우 Hamkke의 판단에 따라 환불을 검토할 수 있습니다.",

      note:
        "예상하지 못한 상황이 생겼다면 먼저 이야기해 주세요. 가능한 한 공정하고 합리적인 방법을 함께 찾아보겠습니다.",
    },

    closing: {
      eyebrow: "Hamkke에서 전하는 안내",

      title: "마지막으로",

      text:
        "이 정책은 수업을 복잡하게 만들기 위한 것이 아닙니다.",

      textTwo:
        "서로의 시간을 존중하면서 보다 안정적이고 편안하게 수업을 이어가기 위한 간단한 기준입니다.",

      thankYou:
        "매 수업을 위해 함께 정해 둔 시간을 소중히 지켜 주셔서 감사합니다.",
    },
  },

  pricing: {
    ...en.pricing,

    title: "수업료",

    intro:
      "한 사람에게 집중하는 영어 수업을 위한 간단하고 명확한 수업료 안내입니다.",

    privateLessons: {
      title: "1:1 개인 영어 수업",
      package: "20회 · 회당 25분",

      description:
        "편안하게 말하고, 생각하고, 실수하면서 영어로 표현하는 데 조금씩 익숙해질 수 있는 개인 수업입니다.",
    },

    waysToLearn: {
      title: "두 가지 수업 방향",

      subtitle: "먼저 목표를 봅니다.",

      description:
        "일상에서 영어로 더 편안하게 말하고 싶은 분도 있고, 면접이나 업무처럼 특정 상황을 준비하고 싶은 분도 있습니다. Hamkke에서는 두 가지 모두 가능합니다.",

      general: {
        title: "일반 영어",

        subtitle: "일상적인 대화를 위해.",

        description:
          "나에게 중요한 이야기를 영어로 조금 더 자연스럽게 표현할 수 있도록 말하기 자신감을 키웁니다.",

        points: [
          "일상 대화",
          "더 자연스럽게 말하기",
          "어휘와 표현",
          "생각 표현하기",
          "말하기 자신감",
          "실제 대화 속 문법",
        ],
      },

      specialized: {
        title: "목적별 영어",

        subtitle: "구체적인 목표를 위해.",

        description:
          "특정 상황이나 목표, 의사소통 과제에 맞춰 수업을 구성합니다.",

        points: [
          "취업 면접",
          "업무 영어",
          "프레젠테이션",
          "여행 영어",
          "학술적 토론",
          "그 밖의 구체적인 의사소통 목표",
        ],
      },
    },

    lessonFlow: {
      title: "수업에서는 무엇을 하나요?",

      intro: "영어를 공부하는 데서 끝나지 않습니다.",

      introHighlight: "직접 사용합니다.",

      steps: {
        conversation: {
          number: "01",
          title: "대화",
          text:
            "나와 관련 있는 주제로 실제 이야기를 나눕니다.",
        },

        feedback: {
          number: "02",
          title: "피드백",
          text:
            "문법, 어휘, 발음, 표현에서 도움이 될 부분을 함께 살펴봅니다.",
        },

        refinement: {
          number: "03",
          title: "다듬기",
          text:
            "내가 말하고 싶은 내용을 더 분명하고 자연스럽게 표현하는 방법을 찾아봅니다.",
        },

        practice: {
          number: "04",
          title: "다시 사용하기",
          text:
            "배운 표현이 내 것이 될 수 있도록 다시 대화 속에서 사용해 봅니다.",
        },
      },
    },

    practical: {
      title: "수업 기본 정보",

      intro: "처음부터 간단하고 명확하게.",

      details: {
        lessonLength: {
          label: "수업 시간",
          value: "25분",
        },

        package: {
          label: "수강 횟수",
          value: "1:1 수업 20회",
        },

        format: {
          label: "수업 방식",
          value: "온라인 · 1:1",
        },

        tuition: {
          label: "수업료",
        },
      },

      policy: "수업 정책",
    },
  },

  platform: {
    ...en.platform,

    title: "편한 플랫폼에서 만나요",

    intro:
      "가장 편하게 사용할 수 있는 플랫폼을 선택해 주세요. 어디에서 만나든 수업의 방향은 같습니다.",

    available: {
      title: "사용 가능한 플랫폼",

      subtitle: "편한 곳에서 만나요.",

      description:
        "Hamkke 수업은 여러 익숙한 온라인 플랫폼에서 진행할 수 있어, 본인에게 가장 편한 방법을 선택할 수 있습니다.",
    },

    note:
      "완벽한 장비는 필요하지 않습니다. 안정적인 인터넷 연결과 마이크, 그리고 편하게 말할 수 있는 조용한 공간이 있다면 충분합니다.",

    beforeLesson: {
      title: "수업 전에",

      subtitle: "몇 가지만 준비하면 충분합니다.",

      description:
        "복잡한 장비나 특별한 공부 공간은 필요하지 않습니다. 실제로 영어를 말하는 데 시간을 쓸 수 있도록 기본적인 것만 준비해 주세요.",

      items: [
        {
          number: "01",
          title: "기기",
          text:
            "선택한 플랫폼에 접속할 수 있는 컴퓨터, 태블릿 또는 스마트폰.",
        },

        {
          number: "02",
          title: "인터넷",
          text:
            "대화를 원활하게 이어갈 수 있는 안정적인 인터넷 연결.",
        },

        {
          number: "03",
          title: "마이크",
          text:
            "서로의 목소리를 또렷하게 들을 수 있는 이어폰 또는 마이크.",
        },

        {
          number: "04",
          title: "조용한 공간",
          text:
            "방해를 많이 받지 않고 편하게 말할 수 있는 공간.",
        },
      ],
    },

    closing: {
      text:
        "플랫폼은 우리가 만나는 장소일 뿐입니다. 더 중요한 것은 그곳에서 나누는 대화입니다.",
    },
  },

  faq: {
    ...en.faq,

    title: "자주 묻는 질문",

    intro:
      "첫 수업 전에 궁금할 수 있는 내용을 정리했습니다.",

    questions: [
      {
        question:
          "영어로 말하는 것이 긴장되거나 자신이 없으면 어떡하나요?",

        answer:
          "괜찮습니다. 처음부터 완벽하게 말할 필요는 없습니다. 대화를 이어갈 수 있도록 질문을 드리고, 생각할 시간을 충분히 드리며, 조금씩 더 편하게 표현할 수 있도록 도와드립니다.",
      },

      {
        question:
          "수업 중에 질문해도 되나요?",

        answer:
          "물론입니다. 이해되지 않는 부분이 있거나, 다른 방식으로 표현하고 싶거나, 더 알고 싶은 것이 있다면 언제든 질문해 주세요.",
      },

      {
        question:
          "교재나 책을 따로 구매해야 하나요?",

        answer:
          "아니요. 일반 수업을 위해 별도의 교재나 자료를 구매할 필요는 없습니다. 수업과 학습 목표에 맞춰 필요한 자료를 준비합니다.",
      },

      {
        question:
          "수업 전에 따로 준비해야 할 것이 있나요?",

        answer:
          "대부분은 없습니다. 편하게 수업에 들어와 대화를 시작하면 됩니다. 미리 준비할 내용이 있는 경우에는 사전에 안내드립니다.",
      },

      {
        question:
          "제가 원하는 자료나 주제를 사용해도 되나요?",

        answer:
          "네. 함께 이야기하고 싶은 주제, 기사, 영상, 프레젠테이션 또는 다른 자료가 있다면 가져와 주세요. 실제 대화와 연습에 활용할 수 있습니다.",
      },

      {
        question: "결제는 어떻게 하나요?",

        answer:
          "수업 일정을 정할 때 결제 방법을 함께 안내드립니다. 결제 과정이 어렵거나 궁금한 점이 있다면 편하게 문의해 주세요.",
      },

      {
        question: "수업료는 환불할 수 있나요?",

        answer:
          "환불과 수업 양도는 Hamkke 수업 정책에 따라 처리됩니다. 자세한 내용은 수업 정책을 확인해 주세요.",
      },

      {
        question:
          "다음 term의 수업료는 언제 결제하나요?",

        answer:
          "현재 term이 끝나기 전에 다음 term의 결제를 안내드립니다.",
      },

      {
        question:
          "수업을 취소하거나 빠져야 하면 어떻게 하나요?",

        answer:
          "수업 취소, 결석, 일정 변경에 관한 자세한 기준은 수업 정책에서 확인할 수 있습니다.",
      },
    ],

    closing:
      "아직 궁금한 점이 있다면 언제든 문의해 주세요.",
  },

  howItWorks: {
    ...en.howItWorks,

    title: "수업 시작 과정",

    intro:
      "첫 문의부터 첫 수업까지 간단하게 진행됩니다.",

    steps: {
      inquire: {
        number: "01",
        title: "문의하기",
        text:
          "현재 영어 학습 상황과 개선하고 싶은 부분, 수업을 통해 이루고 싶은 목표를 간단히 알려 주세요.",
      },

      assessment: {
        number: "02",
        title: "무료 레벨 확인",
        text:
          "현재 영어 수준과 말하기 습관, 필요한 학습 지원을 이해하기 위해 짧은 assessment를 진행합니다.",
      },

      decide: {
        number: "03",
        title: "함께 확인하기",
        text:
          "어떤 수업이 필요한지 이야기하고 Hamkke 수업이 잘 맞을지 함께 확인합니다. 바로 등록해야 한다는 부담은 없습니다.",
      },

      details: {
        number: "04",
        title: "수업 정보 확인",
        text:
          "함께 수업하기로 결정하면 수업 방식, 일정, 수업료, 결제 방법 등 필요한 내용을 안내드립니다.",
      },

      contract: {
        number: "05",
        title: "계약",
        text:
          "모든 내용을 확인한 뒤 수업 계약과 일정을 확정합니다.",
      },

      payment: {
        number: "06",
        title: "결제",
        text:
          "수업 시작 전에 결제를 진행합니다. 결제가 확인되면 수업 준비가 완료됩니다.",
      },

      begin: {
        number: "07",
        title: "수업 시작",
        text:
          "이제 대화를 시작합니다. 영어를 직접 사용하면서 목표를 향해 나아가고, 실제 대화를 통해 조금씩 자신감을 키웁니다.",
      },
    },

    closing: {
      title: "복잡한 과정은 없습니다.",

      text:
        "현재 어디에 있는지, 어디까지 가고 싶은지, 그리고 Hamkke가 그 과정에 잘 맞는지 함께 이야기하는 것부터 시작합니다.",
    },
  },

  hero: {
    ...en.hero,

    eyebrow: "1:1 온라인 영어",

    titleFirst: "Small Talk에서",
    titleSecond: "",
    titleAccent: "Big Ideas까지.",

    descriptionFirst:
      "영어는 실제로 사용할 수 있을 때 더 의미 있어집니다.",

    descriptionSecond:
      "이미 알고 있는 영어에서 시작해, 내가 정말 하고 싶은 말을 더 많이 표현해 보세요.",

    assessment: "무료 레벨 상담 신청",

    features: {
      conversation: "대화 중심",
      learners: "어린이부터 성인까지",
      online: "100% 온라인",
      personalized: "맞춤형 수업",
    },
  },

  findYourLesson: {
    ...en.findYourLesson,

    eyebrow: "나에게 맞는 수업 찾기",

    title: "나에게 맞는 수업을 찾아보세요.",

    description:
      "수업 방식, 수강 횟수, 수업료를 확인한 후 편하게 결정하세요.",

    online: "1:1 온라인",

    lesson: "Conversation Lesson",

    learners: "어린이 · 청소년 · 성인",

    platforms: "플랫폼",

    format: "수업 방식",

    voice: "오디오",
    voiceDetail: "카메라 OFF",

    video: "비디오",
    videoDetail: "카메라 선택",

    durationLabel: "수업 시간",
    perLesson: "회당",

    lessonsLabel: "수강 횟수",
    lessons: "20회",
    perPackage: "term 기준",

    tuitionLabel: "수업료",

    tuitionReview:
      "수업료는 매년 검토되며 물가 상승 및 운영 비용의 변동을 반영하여 조정될 수 있습니다.",

    term: {
      label: "수강 횟수",
      lessons: "{count}회",
      flexible: "10회 또는 20회",
      standard: "20회 term",
      perTerm: "{count}회 term 기준",
      choose10: "10회 선택",
      choose20: "20회 선택",
    },

    chooseLesson: "이 수업 선택하기",

    decreaseDuration: "수업 시간 줄이기",
    increaseDuration: "수업 시간 늘리기",
  },

  hamkkeApproach: {
    ...en.hamkkeApproach,

    eyebrow: "The Hamkke Approach",

    title: {
      lineOne:
        "대화를 위해 영어를 준비하는 것이 아닙니다.",
      lineTwo:
        "그 대화 자체가 수업이 됩니다.",
    },

    description: {
      text:
        "하나의 생각이 질문으로 이어지고, 질문은 더 잘 표현할 수 있는 방법으로 이어집니다. 그리고 다시 말해 볼 때마다 대화 속에서 영어도 함께 자랍니다.",

      highlights: [
        "더 잘 표현할 수 있는 방법",
        "대화 속에서 영어도 함께 자랍니다",
      ],
    },

    steps: {
      talk: {
        number: "01",
        title: "We Talk",
        description:
          "먼저 내가 하고 싶은 이야기에서 시작합니다.",
      },

      goDeeper: {
        number: "02",
        title: "We Go Deeper",
        description:
          "이어지는 질문을 통해 생각을 조금 더 깊고 구체적으로 발전시킵니다.",
      },

      refine: {
        number: "03",
        title: "We Refine",
        description:
          "대화 속에서 자연스럽게 나온 영어를 선생님과 함께 더 분명하고 자연스럽게 다듬습니다.",
      },

      tryAgain: {
        number: "04",
        title: "You Try Again",
        description:
          "배운 영어를 다시 사용해 내 생각을 더 분명하고 자신 있게 표현해 봅니다.",
      },
    },

    continuation: {
      lineOne: "그리고 대화는",
      lineTwo: "계속됩니다.",
    },

    explore: "Hamkke Approach 자세히 보기",
  },

  learnerStages: {
    ...en.learnerStages,

    eyebrow: "모든 단계의 학습자를 위해",

    title:
      "성장할수록 대화도 함께 달라집니다.",

    description: {
      text:
        "이야기에 필요한 단어를 찾아가는 어린이, 자신의 의견을 설명하는 법을 배우는 청소년, 그리고 자신이 정말 하고 싶은 말을 정확하게 표현하고 싶은 성인. 목표는 달라질 수 있지만, Hamkke는 각 학습자의 대화가 시작되는 곳에서 함께합니다.",

      highlights: [
        "정말 하고 싶은 말을 정확하게 표현",
        "대화가 시작되는 곳",
      ],
    },

    start: {
      number: "01",
      text: "지금 있는 곳에서 시작하세요.",
    },

    stages: {
      kids: {
        number: "02",
        title: "어린이",
        tagline:
          "짧은 대답을 대화로 이어갑니다.",
        description:
          "이야기, 질문, 일상적인 주제를 통해 영어로 자신의 생각을 표현할 기회를 충분히 경험하며 말하기 자신감을 키웁니다.",
      },

      teens: {
        number: "03",
        title: "청소년",
        tagline:
          "할 말을 늘리고, 표현하는 방법을 배웁니다.",
        description:
          "짧은 대답에서 벗어나 의견을 만들고, 이유를 설명하고, 질문하며, 점점 더 복잡한 생각을 영어로 표현하는 연습을 합니다.",
      },

      adults: {
        number: "04",
        title: "성인",
        tagline:
          "내 영어가 조금 더 나답게 들리도록.",
        description:
          "나에게 중요한 대화를 영어로 나누면서 필요한 어휘, 문장 구조, 표현을 자연스럽게 다듬어 갑니다.",
      },
    },

    further: "함께, 더 멀리.",
    keepGrowing: "계속 성장하기",
  },

  teachers: {
    ...en.teachers,

    section: {
      eyebrow: "Hamkke 선생님",
      title: "대화 뒤에 있는 사람들.",
      viewAll: "선생님 만나보기",
    },

    directory: {
      eyebrow: "Hamkke 선생님",
      title: "편하게 이야기할 수 있는 선생님을 찾아보세요.",

      description: {
        text:
          "Hamkke의 선생님들은 각자의 개성과 경험을 가지고 있지만, 학습자가 편안하게 말하고 성장할 수 있도록 돕는 하나의 교육 방향을 함께합니다.",

        highlights: ["편안하게 말하고 성장"],
      },

      mascotAlt:
        "Hamkke 선생님 캐릭터",

      empty:
        "현재 소개할 수 있는 선생님이 없습니다.",

      viewProfile: "프로필 보기",
    },

    card: {
      teacherLabel: "Hamkke 선생님",
      learners: "수업 대상",
      specialties: "수업 분야",
      viewProfile: "프로필 보기",
      avatarAlt: "{name} 선생님",
    },

    learnerGroups: {
      kids: "어린이",
      teens: "청소년",
      adults: "성인",
    },

    presentations: {
      jesica: {
        role: "Hamkke 선생님",

        quote:
          "내가 정말 하고 싶은 말을 영어로 더 많이 표현할 수 있도록 함께합니다.",

        specialties: {
          conversation: {
            title: "대화",
            detail: "실제 의사소통",
          },

          interview: {
            title: "면접 준비",
            detail: "OPIC, 항공사 면접 등",
          },

          supportive: {
            title: "편안하고 세심한 수업",
            detail: "나의 속도에 맞춰 배우기",
          },
        },
      },

      default: {
        role: "Hamkke 선생님",

        quote:
          "의미 있는 대화를 통해 영어를 직접 사용할 수 있도록 돕습니다.",

        specialties: {
          conversation: {
            title: "대화",
            detail: "실제 의사소통",
          },

          personalized: {
            title: "맞춤형 수업",
            detail: "나에게 맞는 수업",
          },

          supportive: {
            title: "편안한 수업",
            detail: "나의 속도에 맞춰 배우기",
          },
        },
      },
    },
  },

  learnerStories: {
    ...en.learnerStories,

    eyebrow: "Passed Along",

    title:
      "학습자들이 전해 준 이야기.",

    description: {
      text:
        "Hamkke와 함께하는 과정에서 학습자와 가족들이 나누어 준 경험, 변화, 그리고 생각을 담았습니다.",

      highlights: ["학습자와 가족들"],
    },

    closing: {
      text:
        "대화와 성장, 그리고 함께 배워 온 시간 속에서 전해진 이야기들을 모았습니다.",

      highlights: [
        "대화와 성장, 그리고 함께 배워 온 시간",
      ],
    },

    explore: "학습자 이야기 보기",

    readMore: "더 보기",

    modal: {
      ariaLabel: "학습자 이야기",
      close: "학습자 이야기 닫기",
    },
  },

  getStarted: {
    ...en.getStarted,

    eyebrow: "준비되었을 때",

    title:
      "모든 의미 있는 대화에는 시작이 있습니다.",

    subtitle:
      "당신의 시작은 여기일지도 모릅니다.",

    steps: {
      introduction: {
        number: "01",
        title: "나에 대해 알려 주세요.",
        description:
          "목표, 현재 영어 수준, 필요한 도움에 대해 이야기해 주세요.",
      },

      conversation: {
        number: "02",
        title: "먼저 대화해 보세요.",
        description:
          "선생님을 만나 편하게 이야기를 나눠 봅니다.",
      },

      lessons: {
        number: "03",
        title: "수업을 시작하세요.",
        description:
          "일정을 정하고 수업을 시작합니다.",
      },
    },

    invitation:
      "첫걸음을 함께 시작해 볼까요?",

    button: "무료 레벨 상담 신청",
  },

  lessonsPage: {
  ...en.lessonsPage,

  hero: {
    eyebrow: "1:1 온라인 영어",

    title:
      "말하기 위해 배우고, 대화하면서 성장하는 수업.",

    description: {
      text:
        "Hamkke의 1:1 온라인 영어 수업은 실제 대화를 중심으로 진행됩니다. 이미 알고 있는 영어를 사용하면서 필요한 표현을 배우고, 조금씩 더 분명하고 편안하게 말할 수 있도록 도와드립니다.",

      highlights: [
        "실제 대화",
        "더 분명하고 편안하게",
      ],
    },
  },

  audience: {
    eyebrow: "누구를 위한 수업인가요?",

    title:
      "나에게 맞는 지점을 찾아보세요.",

    description: {
      text:
        "같은 대화 중심의 접근 방식도 학습자의 나이와 목표에 따라 달라집니다. 무엇을 이야기하는지, 그리고 선생님이 어떻게 도와주는지도 학습자에 맞게 조정됩니다.",

      highlight:
        "학습자의 나이와 목표에 따라 달라집니다",
    },

    groups: {
      kids: {
        label: "Kids",

        title:
          "배우고 있는 영어를 직접 사용할 기회를 더 많이.",

        description:
          "영어를 배우고 있지만, 대화 속에서 대답하고, 설명하고, 자신의 생각을 표현할 기회가 더 필요한 아이들을 위한 수업입니다.",

        goals: [
          "말하기 연습",
          "대화 속 어휘",
          "더 긴 대답",
          "말하기 자신감",
        ],
      },

      teens: {
        label: "Teens",

        title:
          "짧은 대답에서 한 걸음 더.",

        description:
          "자신의 의견을 표현하고, 생각을 설명하며, 영어로 더 긴 대화를 편안하게 이어가고 싶은 청소년을 위한 수업입니다.",

        goals: [
          "대화",
          "의견과 생각",
          "학교 영어",
          "말하기 자신감",
        ],
      },

      adults: {
        label: "Adults",

        title:
          "나에게 중요한 상황에서 영어를 사용하세요.",

        description:
          "일상생활, 직장, 여행, 또는 개인적으로 중요한 대화에서 영어로 더 편안하게 소통하고 싶은 성인을 위한 수업입니다.",

        goals: [
          "일상 영어",
          "업무",
          "면접",
          "여행",
          "자유 대화",
        ],
      },
    },
  },

  details: {
    eyebrow: "수업 정보",

    title:
      "나에게 맞는 수업 구성을 선택하세요.",

    description:
      "나에게 맞는 수업 시간과 수강 횟수를 선택할 수 있습니다.",

    online: "1:1 온라인",

    lesson: "Conversation Lesson",

    learners: "Kids · Teens · Adults",

    platforms: "플랫폼",

    format: "수업 방식",

    audio: {
      title: "오디오",
      description: "카메라 OFF",
    },

    video: {
      title: "비디오",
      description: "카메라 선택 가능",
    },

    duration: {
      label: "수업 시간",

      minutes: "{count}분",

      perLesson: "1회 수업",

      decrease:
        "수업 시간을 줄이기",

      increase:
        "수업 시간을 늘리기",
    },

    term: {
      label: "수강 횟수",

      lessons: "{count}회",

      flexible:
        "10회 또는 20회 중 선택",

      standard:
        "25~35분 수업은 20회 term",

      choose10:
        "10회 수업 선택",

      choose20:
        "20회 수업 선택",
    },

    tuition: {
      label: "수업료",

      perTerm:
        "{count}회 term 기준",

      review:
        "수업료는 매년 검토되며, 물가 상승 및 운영 비용의 변화를 반영하여 조정될 수 있습니다.",
    },

    chooseLesson:
      "이 수업 선택하기",
  },

  nextStep: {
    eyebrow: "Teachers",

    title:
      "편하게 이야기할 수 있을 것 같은 선생님을 찾아보세요.",

    button:
      "선생님 만나보기",
  },
},

  approachPage: {
  ...en.approachPage,

  hero: {
    eyebrow: "The Hamkke Approach",

    title:
      "대화가 일어나는 곳에서 배움도 시작됩니다.",

    description: {
      text:
        "Hamkke에서는 영어를 먼저 완벽하게 배운 뒤 대화하는 것이 아니라, 대화하면서 필요한 영어를 발견하고 배우고 다시 사용합니다.",

      highlights: [
        "대화하면서",
        "발견하고 배우고 다시 사용",
      ],
    },
  },

  whyConversation: {
    eyebrow: "왜 대화인가요?",

    title:
      "영어를 아는 것과 사용하는 것은 다릅니다.",

    firstParagraph: {
      text:
        "단어를 알고, 문법을 이해하고, 문제에서 정답을 알아볼 수 있어도 막상 내가 말할 차례가 되면 여전히 망설일 수 있습니다.",

      highlight:
        "막상 내가 말할 차례가 되면 여전히 망설일 수 있습니다",
    },

    secondParagraph: {
      text:
        "Hamkke는 바로 그 차이에 집중합니다. 영어가 완벽해질 때까지 기다리는 대신, 이미 알고 있는 영어를 직접 사용하고, 대화하면서 필요한 것을 발견한 뒤 그곳에서부터 하나씩 쌓아 갑니다.",

      highlights: [
        "바로 그 차이",
        "이미 알고 있는 영어를 직접 사용",
      ],
    },
  },

  framework: {
    eyebrow: "수업의 흐름",

    title:
      "정해진 대본이 아니라, 반복되는 하나의 흐름입니다.",

    description:
      "대화의 내용은 매번 달라질 수 있지만, 학습이 일어나는 기본적인 흐름은 일관되게 유지됩니다.",

    steps: {
      talk: {
        number: "01",
        title: "We Talk",
        description:
          "먼저 학습자가 말하고 싶은 것에서 시작합니다.",
        short:
          "당신의 생각에서 대화가 시작됩니다.",
      },

      goDeeper: {
        number: "02",
        title: "We Go Deeper",
        description:
          "질문을 통해 생각을 더 구체적으로 설명하고 발전시킵니다.",
        short:
          "하나의 대답이 진짜 대화로 이어집니다.",
      },

      refine: {
        number: "03",
        title: "We Refine",
        description:
          "대화 속에서 실제로 필요한 어휘, 문법, 발음, 표현을 함께 다듬습니다.",
        short:
          "그 순간 필요한 영어를 함께 다듬습니다.",
      },

      tryAgain: {
        number: "04",
        title: "You Try Again",
        description:
          "배운 영어를 다시 사용해 같은 생각을 더 분명하게 표현합니다.",
        short:
          "배운 영어를 대화 속에서 다시 사용합니다.",
      },
    },

    cycle: {
      title:
        "대본이 아니라, 반복되는 사이클입니다.",

      description:
        "대화는 이 단계를 여러 번 오갈 수 있습니다. 하나의 생각을 더 오래 이야기할 수도 있고, 필요한 표현을 다듬은 뒤 바로 대화로 돌아갈 수도 있습니다. 기본적인 학습 구조는 일관되게 유지하면서도 대화는 유연하게 이어집니다.",
    },
  },

  teacherRole: {
    eyebrow: "선생님의 역할",

    title:
      "대화를 대신하지 않는 도움.",

    description: {
      text:
        "선생님은 대화가 자연스럽게 이어지도록 도우면서도, 학습자가 직접 생각하고, 대답하고, 영어를 사용해 볼 수 있는 충분한 공간을 줍니다.",

      highlight:
        "직접 생각하고, 대답하고, 영어를 사용해 볼 수 있는 충분한 공간",
    },

    roles: {
      listen: {
        number: "01",
        title: "듣기",
        description:
          "모든 문장이 완벽한지만 보는 것이 아니라, 학습자가 무엇을 표현하려고 하는지 먼저 살펴봅니다.",
      },

      ask: {
        number: "02",
        title: "질문하기",
        description:
          "의미 있는 후속 질문을 통해 생각을 더 발전시키고 계속 이야기할 수 있도록 돕습니다.",
      },

      refine: {
        number: "03",
        title: "다듬기",
        description:
          "대화에 도움이 되는 순간에 더 분명하거나 자연스러운 영어 표현을 알려 줍니다.",
      },

      giveBack: {
        number: "04",
        title: "다시 맡기기",
        description:
          "선생님이 대신 말하기보다, 학습자가 배운 영어를 직접 사용해 볼 수 있도록 충분한 공간을 줍니다.",
      },
    },
  },

  principles: {
    eyebrow: "수업 원칙",

    title:
      "대화를 중심에 두되, 방향 없이 흘러가지는 않습니다.",

    communication: {
      title: "완벽함보다 의사소통",
      description:
        "먼저 생각을 표현할 수 있도록 돕고, 정확성은 그 의사소통을 더 잘할 수 있도록 지원합니다.",
    },

    listen: {
      title: "가르치기 전에 듣기",
      description:
        "무엇을 가르칠지 결정하기 전에 학습자가 무엇을 말하려는지 먼저 이해합니다.",
    },

    thought: {
      title: "학습자의 생각을 따라가기",
      description:
        "미리 정해 둔 답으로 이끌기보다 학습자의 생각이 발전하는 방향을 따라갑니다.",
    },

    questions: {
      title: "목적 있는 질문",
      description:
        "질문은 단순히 대화를 길게 하기 위한 것이 아니라 생각과 표현을 확장하기 위해 사용합니다.",
    },

    correction: {
      title: "선택적인 교정",
      description:
        "모든 실수를 즉시 고치지 않습니다. 현재 대화와 학습에 실제로 도움이 되는 부분을 선택합니다.",
    },

    voice: {
      title: "학습자의 목소리 유지하기",
      description:
        "더 자연스러운 영어를 제안하더라도 학습자가 원래 표현하려던 의미와 개성을 유지합니다.",
    },

    context: {
      title: "맥락 속에서 배우기",
      description:
        "어휘와 문법을 따로 떼어 배우기보다 실제 대화 속에서 필요한 순간에 익힙니다.",
    },

    reuse: {
      title: "다시 사용할 기회",
      description:
        "새롭게 배운 영어를 다시 말해 보며 실제로 사용할 수 있는 언어로 만들어 갑니다.",
    },

    adapt: {
      title: "필요한 만큼 지원하기",
      description:
        "학습자의 수준과 상황에 따라 질문, 설명, 교정, 생각할 시간을 조절합니다.",
    },

    independence: {
      title: "독립성이 곧 성장",
      description:
        "점점 더 적은 도움으로 자신의 생각을 표현하고 발전시킬 수 있을 때 진짜 성장이 나타납니다.",
    },
  },

  teachers: {
    eyebrow: "하나의 교육 기준",

    title:
      "선생님은 달라도, 교육의 방향은 같습니다.",

    description: {
      text:
        "각 선생님은 자신의 성격, 경험, 전문적인 판단을 수업에 가져옵니다. Hamkke는 모두가 공유하는 교육 기준을 제공합니다.",

      highlights: [
        "각 선생님",
        "공유하는 교육 기준",
      ],
    },

    standard:
      "Different teachers. Different learners. One shared educational standard.",
  },

  progress: {
    eyebrow: "Hamkke가 바라보는 성장",

    title:
      "얼마나 많이 아는지가 아니라, 영어로 무엇을 할 수 있게 되었는가.",

    description: {
      text:
        "성장은 단어를 더 많이 외우거나 문법 문제를 더 많이 맞히는 것만으로 보지 않습니다. 자신의 생각을 더 길게 설명하고, 질문하고, 다시 표현하고, 점점 더 적은 도움으로 대화를 이어갈 수 있는지도 함께 봅니다.",

      highlights: [
        "영어로 무엇을 할 수 있게 되었는가",
        "점점 더 적은 도움",
      ],
    },
  },

  nextStep: {
    eyebrow: "From Small Talk to Big Ideas",

    title:
      "이미 알고 있는 영어에서 시작하세요.",

    description:
      "나에게 맞는 수업 구성을 찾고, 실제 대화에서 영어를 직접 사용해 보세요.",

    button: "나에게 맞는 수업 찾기",
  },

  closing: {
    eyebrow: "계속되는 대화",

    title:
      "대화할 때마다 영어도 조금씩 더 내 것이 됩니다.",

    description:
      "한 번의 완벽한 문장보다, 생각하고 말하고 다듬고 다시 시도하는 경험이 쌓이는 것을 중요하게 생각합니다.",

    button: "무료 레벨 상담 신청",
  },
},

  aboutPage: {
    ...en.aboutPage,

    hero: {
      eyebrow: "Hamkke 소개",

      title:
        "함께 배울 때, 배움의 느낌도 달라집니다.",

      description: {
        text:
          "Hamkke는 의미 있는 대화와 세심한 수업을 중심으로 만들어진 온라인 영어 학습 공간입니다. 영어는 실제로 사용할 기회가 있을 때 더 의미 있는 언어가 된다고 믿습니다.",

        highlights: [
          "의미 있는 대화",
          "실제로 사용할 기회",
        ],
      },
    },

    name: {
      korean: "함께",
      meaning: "Together",

      title: "왜 Hamkke일까요?",

      paragraphs: [
        {
          text:
            "함께는 영어로 together라는 뜻입니다.",
          highlights: ["함께", "together"],
        },

        {
          text:
            "이 이름을 선택한 이유는 언어를 배우는 모든 과정을 혼자서 해결해야 할 필요는 없다고 생각하기 때문입니다.",
          highlights: ["혼자서 해결"],
        },

        {
          text:
            "때로는 누군가와 이야기하고, 생각할 시간을 충분히 가지고, 실수하고, 다시 시도하면서 내가 정말 하고 싶은 말을 조금씩 찾아가는 것만으로도 배움은 앞으로 나아갑니다.",
          highlights: ["생각할 시간을 충분히"],
        },

        {
          text:
            "Hamkke가 그런 공간이기를 바랍니다. 학습자와 선생님이 함께 조금씩 앞으로 나아가는 곳.",
          highlights: ["함께 조금씩 앞으로 나아가는 곳"],
        },
      ],
    },

    purpose: {
      eyebrow: "Hamkke가 존재하는 이유",

      title:
        "영어를 아는 것과 실제로 사용하는 것은 항상 같지 않습니다.",

      paragraphs: [
        {
          text:
            "문법을 이해하고, 단어를 알고, 문제를 풀고, 글을 잘 읽는 학습자도 실제 대화에서는 자신의 생각을 자연스럽게 표현하는 것이 어려울 수 있습니다.",

          highlights: [
            "자신의 생각을 자연스럽게 표현",
          ],
        },

        {
          text:
            "Hamkke는 바로 그 차이에서 시작되었습니다.",
          highlights: ["그 차이"],
        },

        {
          text:
            "Hamkke는 대화를 배움이 일어나는 과정의 일부로 봅니다. 의미 있는 대화를 통해 학습자는 이미 표현할 수 있는 것이 무엇인지, 어디에서 도움이 필요한지, 그리고 자신의 생각을 더 많이 말하기 위해 어떤 영어가 필요한지 발견합니다.",

          highlights: [
            "대화를 배움이 일어나는 과정의 일부",
            "자신의 생각을 더 많이 말하기",
          ],
        },
      ],
    },

    beliefs: {
      eyebrow: "Hamkke가 믿는 것",

      title:
        "영어는 실제로 사용할 수 있는 언어가 되어야 합니다.",

      communication: {
        title: "의사소통",

        description: {
          text:
            "모든 문장을 완벽하게 만들려고 걱정하기 전에 자신의 생각을 표현할 수 있는 공간이 필요합니다. 정확성도 중요하지만, 말하는 것을 막는 것이 아니라 의사소통을 돕는 역할을 해야 합니다.",

          highlights: [
            "자신의 생각을 표현",
            "의사소통을 돕는",
          ],
        },
      },

      responsiveness: {
        title: "학습자에 맞춘 수업",

        description: {
          text:
            "학습자마다 필요한 도움, 구조, 도전의 정도, 생각할 시간이 다릅니다. 수업은 지금 앞에 있는 학습자에게 맞춰 달라져야 합니다.",

          highlights: [
            "지금 앞에 있는 학습자에게 맞춰",
          ],
        },
      },

      independence: {
        title: "독립성",

        description: {
          text:
            "성장은 영어를 더 많이 아는 것만을 의미하지 않습니다. 점점 더 적은 도움으로 자신의 생각을 표현하고, 명확하게 하고, 발전시킬 수 있을 때도 성장은 나타납니다.",

          highlights: ["점점 더 적은 도움으로"],
        },
      },
    },

    sharedStandard: {
      eyebrow: "하나의 교육 기준",

      title: {
        lineOne: "선생님은 달라도.",
        lineTwo: "학습자는 달라도.",
        lineThree: "교육의 목적은 하나입니다.",
      },

      firstParagraph: {
        text:
          "각 선생님은 자신의 성격과 경험, 전문적인 판단을 수업에 가져옵니다. Hamkke는 그 뒤에서 모두가 공유하는 교육적 기반을 제공합니다.",

        highlights: [
          "모두가 공유하는 교육적 기반",
        ],
      },

      secondParagraph: {
        text:
          "모든 선생님이 똑같이 가르치는 것이 목표는 아닙니다. 의미 있는 의사소통, 세심한 지원, 유용한 피드백, 그리고 점점 커지는 학습자의 독립성을 중심으로 일관된 학습 경험을 만드는 것이 목표입니다.",

        highlights: [
          "똑같이 가르치는 것이 목표는 아닙니다",
          "학습자의 독립성",
        ],
      },

      approachButton:
        "Hamkke Approach 자세히 보기",

      teachersButton: "선생님 만나보기",

      visual: {
        korean: "함께",
        principles: "배우고 · 연습하고 · 성장하고",
        together: "함께.",
      },
    },

    closing: {
      eyebrow: "함께, 앞으로",

      title:
        "배움은 계속 이어지는 과정입니다.",

      firstParagraph: {
        text:
          "매 대화는 알아차리고, 시도하고, 다듬고, 이전보다 조금 더 말해 볼 수 있는 새로운 기회가 됩니다.",

        highlights: [
          "알아차리고, 시도하고, 다듬고",
        ],
      },

      secondParagraph: {
        text:
          "Hamkke는 그 과정에 필요한 공간을 만들고, 학습자가 자신이 하고 싶은 말을 영어로 더 독립적이고 편안하게 표현할 수 있도록 돕습니다.",

        highlights: [
          "더 독립적이고 편안하게",
        ],
      },
    },
  },

  teacherProfilePage: {
    ...en.teacherProfilePage,

    breadcrumb: {
      label: "현재 위치",
      home: "홈",
      teachers: "선생님",
    },

    teacher: {
      label: "Hamkke 선생님",
      avatarAlt: "{name} Hamkke 선생님",
    },

    audio: {
      greeting: "{name} 선생님의 짧은 인사",
      comingSoon:
        "오디오 소개를 준비하고 있습니다.",

      play:
        "{name} 선생님의 오디오 소개 재생",

      pause:
        "{name} 선생님의 오디오 소개 일시정지",

      progress: "오디오 재생 진행률",
    },

    getStarted: {
      eyebrow: "여기서 시작하세요",

      title:
        "{name} 선생님과 대화를 시작해 보세요.",

      description:
        "무료 assessment를 통해 목표에 대해 이야기하고 어떤 도움을 드릴 수 있을지 함께 확인해 보세요.",

      details: {
        format: "1:1 온라인 수업",
        duration: "25–50분",
        atmosphere:
          "부담 없이 편안한 대화",
      },

      button: "무료 레벨 상담 신청",
    },
  },

  teacherProfile: {
    ...en.teacherProfile,

    tabs: {
      about: "소개",
      qualifications: "경력 및 자격",
      learnerStories: "학습자 이야기",
      availability: "가능한 시간",
    },

    about: {
      title: "선생님 이야기",
    },

    qualifications: {
      title: "경력 및 자격",

      description:
        "영어 수업에 도움이 되는 교육, 자격, 그리고 경험을 확인할 수 있습니다.",

      empty:
        "경력 및 자격 정보를 준비하고 있습니다.",
    },

    stories: {
      title: "학습자들이 전한 이야기",

      story: "이야기",
      stories: "이야기",
      shared: "공유됨",

      rating: "5점 만점에 {rating}점",

      readMore: "더 보기",
      showFewer: "접기",

      showAll:
        "이야기 {count}개 모두 보기",

      empty:
        "아직 공유된 학습자 이야기가 없습니다.",

      modal: {
        label: "학습자 이야기",

        ariaLabel:
          "{name}님의 학습자 이야기",

        close: "학습자 이야기 닫기",
      },
    },

    availability: {
      title: "주간 수업 가능 시간",

      description:
        "현재 예약 가능한 시간과 정기 수업이 있는 시간을 간단히 확인할 수 있습니다.",

      previousWeek: "이전 주",
      today: "오늘",
      nextWeek: "다음 주",

      loading: "수업 가능 시간을 불러오는 중...",
      error:
        "수업 가능 시간을 불러올 수 없습니다.",

      timezone: {
        label: "시간대",
        philippines: "필리핀",
        korea: "한국",
        japan: "일본",
        china: "중국",
        vietnam: "베트남",
      },

      status: {
        available: "예약 가능",
        regularStudent: "정기 수업",
        regularShort: "정기",
      },

      empty:
        "이번 주에는 표시할 수 있는 빈 수업 시간이 없습니다.",

      note:
        "시간은 {timezone} 시간대를 기준으로 표시됩니다. 수업 배정이나 일정 변경에 따라 가능한 시간은 달라질 수 있습니다.",
    },

    days: {
      sun: "일",
      mon: "월",
      tue: "화",
      wed: "수",
      thu: "목",
      fri: "금",
      sat: "토",
    },
  },

  footer: {
    ...en.footer,

    brand: "Hamkke │ 함께",
    tagline: "From Small Talk to Big Ideas.",

    description:
      "이미 알고 있는 영어를 실제 대화에서 더 많이 사용할 수 있도록 돕는 대화 중심 영어 수업입니다.",

    groups: {
      learn: "수업",
      hamkke: "Hamkke",
      connect: "연결",
    },

    links: {
      lessons: "수업",
      approach: "Hamkke 방식",
      teachers: "선생님",
      about: "Hamkke 소개",
      policy: "수업 정책",
      startConversation: "대화 시작하기",
      instagram: "Instagram",
    },

    copyright:
      "© 2026 Hamkke │ 함께. All rights reserved.",

    lessons: "수업",
    lessonsGroup: "수업",
    howItWorks: "수업 진행 방식",
    pricing: "수업료",
    platform: "플랫폼",
    hamkkeGroup: "Hamkke",
    about: "Hamkke 소개",
    faq: "자주 묻는 질문",
    policy: "수업 정책",
    connectGroup: "연결",
    startConversation: "대화 시작하기",
  },

  inquiry: {
    ...en.inquiry,

    brand: "Hamkke │ 함께",

    headings: {
      experience:
        "Hamkke가 영어를 어떻게 바라보는지 확인해 보세요.",

      goals:
        "영어로 무엇을 하고 싶은지 이야기해 볼까요?",

      stories:
        "앞으로 어디까지 가고 싶은지 이야기해 보세요.",

      startAConversation:
        "먼저 대화에서 시작해 볼까요?",
    },

    intro:
      "현재 영어 학습 상황과 함께 연습하고 싶은 내용을 간단히 알려 주세요.",

    reassurance: {
      personalReply:
        "24시간 이내 직접 답변",

      informationSafe:
        "개인정보는 안전하게 보호됩니다.",
    },

    fields: {
      name: "어떻게 불러드리면 될까요?",
      email: "이메일 주소",

      contactMethod:
        "어떤 방법으로 연락드릴까요?",

      contactId:
        "ID, 사용자 이름 또는 전화번호",

      level:
        "현재 영어로 말하는 것이 어느 정도 편한가요?",

      goal:
        "어떤 부분을 연습하고 싶나요? 그 이유도 알려 주세요.",

      message:
        "그 밖에 알려 주고 싶은 내용이 있나요? (선택)",
    },

    options: {
      contactMethod: {
        kakaoTalk: "카카오톡",
        whatsApp: "WhatsApp",
        weChat: "WeChat",
      },

      level: {
        justGettingStarted:
          "영어를 이제 막 시작하고 있어요.",

        understandingButSpeakingIsDifficult:
          "영어는 이해하지만 말하는 것이 어려워요.",

        simpleConversationsButStillHesitate:
          "간단한 대화는 가능하지만 아직 많이 망설여요.",

        communicateWellButWantToSpeakMoreNaturally:
          "의사소통은 가능하지만 더 자연스럽게 말하고 싶어요.",

        comfortableSpeakingButWantToBecomeMoreFluent:
          "말하는 것은 편하지만 더 유창해지고 싶어요.",
      },

      goal: {
        speakMoreConfidently:
          "더 자신 있게 말하고 싶어요.",

        improveEverydayConversation:
          "일상 영어 회화를 향상하고 싶어요.",

        englishForWork:
          "업무에 영어가 필요해요.",

        interviewPreparation:
          "영어 면접을 준비하고 있어요.",

        travelMoreComfortably:
          "여행에서 영어를 더 편하게 사용하고 싶어요.",

        improveOverallEnglish:
          "전반적인 영어 실력을 향상하고 싶어요.",

        somethingElse: "다른 목표가 있어요.",
      },
    },

    submit: "문의 보내기",
    sending: "보내는 중...",

    privacy:
      "개인정보를 소중히 다루며 제3자에게 공유하지 않습니다.",

    success: {
      title: "감사합니다.",

      message:
        "문의가 정상적으로 접수되었습니다. 24시간 이내에 직접 답변드리겠습니다. 현재 영어와 목표에 대해 더 알아가고, 앞으로의 영어 학습을 함께할 수 있기를 기대합니다.",

      closing: "곧 뵙겠습니다.",
    },

    errors: {
      general:
        "문제가 발생했습니다. 다시 시도해 주세요.",

      network:
        "메시지를 전송할 수 없습니다. 다시 시도해 주세요.",
    },
  },

  language: {
    english: "English",
    korean: "한국어",
    chinese: "中文",
    japanese: "日本語",
  },
};

export default ko;






