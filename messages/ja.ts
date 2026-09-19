import en from "./en";

const ja = {
  ...en,

  nav: {
    ...en.nav,

    home: "ホーム",
    approach: "Hamkkeのアプローチ",
    lessons: "レッスン",
    teachers: "講師",
    policy: "レッスンポリシー",
    about: "Hamkkeについて",
    login: "ログイン",

    experience: "レッスン体験",
    goals: "目標",
    stories: "ストーリー",
    startConversation: "会話を始める",
  },

  info: {
    ...en.info,

    title: "ご案内",
    pricing: "料金",
    howItWorks: "レッスンの流れ",
    platform: "レッスンプラットフォーム",
    policy: "レッスンポリシー",
    faq: "よくある質問",
  },

  policy: {
    ...en.policy,

    eyebrow: "Hamkke レッスンポリシー",

    title: "レッスンポリシー",

    intro:
      "一つひとつのレッスン時間は、学習者一人ひとりのために確保されています。皆さまが気持ちよく公平にスケジュールを利用できるよう、いくつかのシンプルなルールを設けています。",

    quickGuide: {
      eyebrow: "クイックガイド",

      notice: {
        title: "レッスンの2時間以上前",
        text: "日程変更、またはレッスンクレジットとして対応できます。",
      },

      lateNotice: {
        title: "レッスンまで2時間未満",
        text: "そのレッスンは実施済みとして扱われます。",
      },

      noShow: {
        title: "無断欠席",
        text: "そのレッスンは実施済みとして扱われます。",
      },

      note:
        "例外や予期せぬ事情については、下記の詳細なポリシーをご確認ください。",
    },

    details: {
      eyebrow: "ポリシー詳細",
      description:
        "各項目を選択すると、詳しいガイドラインをご確認いただけます。",
    },

    cancellation: {
      title: "キャンセル・日程変更",

      intro:
        "予定が変わることは誰にでもあります。レッスンのキャンセルや日程変更が必要な場合は、予定時刻の少なくとも2時間前までにご連絡ください。",

      notice: {
        title: "2時間以上前にご連絡いただいた場合",
        text:
          "レッスンの日程変更、または今後のレッスンに使えるクレジットとして対応できます。",
      },

      lateNotice: {
        title: "2時間未満でのご連絡の場合",
        text:
          "そのレッスンは実施済みとして扱われます。",
      },

      noShow: {
        title: "連絡なしで欠席された場合",
        text:
          "そのレッスンは実施済みとして扱われます。",
      },

      note:
        "予期せぬ事情が発生した場合は、できるだけ早くご連絡ください。可能な範囲で、状況に合った方法を一緒に考えます。",
    },

    unexpected: {
      title: "予期せぬ事情",

      intro:
        "すべての状況を事前に予測したり、コントロールしたりできるわけではありません。",

      text:
        "停電、インターネットや接続の問題、緊急事態など、予期せぬ事情によってレッスンへの参加が難しくなることがあります。",

      action:
        "そのような場合は、できるだけ早くご連絡ください。",

      resolution:
        "状況に応じて、レッスンの日程変更やクレジットの付与など、できるだけ合理的な方法を一緒に考えます。",

      teacher:
        "講師側の予期せぬ事情により、予定どおりレッスンを行えない場合にも同様に対応します。",
    },

    lateArrivals: {
      title: "遅刻",

      intro:
        "レッスンに遅れそうな場合は、可能なときにご連絡ください。",

      rule:
        "遅れて参加された場合でも、レッスンは当初予定されていた時刻に終了します。",

      example:
        "たとえば、レッスンが午後8:00〜8:25の予定で、午後8:10に参加した場合、レッスンは午後8:10〜8:25までとなります。",

      noContact:
        "レッスン開始から10分以内に参加がなく、ご連絡もない場合は無断欠席とみなし、そのレッスンは実施済みとして扱われます。",
    },

    teacherCancellations: {
      title: "講師によるキャンセル",

      intro:
        "講師側でも、やむを得ずレッスンをキャンセルしなければならない場合があります。",

      text:
        "レッスンをキャンセルする必要がある場合は、できるだけ早くご連絡します。",

      resolution:
        "キャンセルされたレッスンについては、振替レッスンまたは全額分のレッスンクレジットを提供します。",
    },

    repeatedCancellations: {
      title: "繰り返しのキャンセル・日程変更",

      intro:
        "いつも予定どおりにいかないことがあるのは当然です。",

      rule:
        "キャンセル回数に固定の上限はありません。予期せぬことが起こることも理解しています。",

      text:
        "ただし、頻繁なキャンセルや日程変更によってレッスン時間の確保が難しくなってきた場合は、現在の定期スケジュールについてご相談し、お互いにとってより良い方法を一緒に考えることがあります。",

      note:
        "このルールは、レッスンを難しくするためのものではありません。確保されたレッスン時間を、皆さまが公平かつ有意義に利用できるようにするためのものです。",
    },

    tuition: {
      title: "レッスン料金",

      intro:
        "料金は、選択したレッスン時間、受講回数、表示されている通貨に基づいて設定されます。",

      rule:
        "レッスン料金は毎年見直され、物価上昇や運営コストの変化を反映して調整される場合があります。",

      notice:
        "料金に変更がある場合は、事前にお知らせします。",
    },

    refunds: {
      title: "返金・レッスンの譲渡",

      intro:
        "レッスンは一定回数のterm単位でお申し込みいただくため、お支払い完了後の返金は原則として行っていません。",

      rule:
        "レッスンを継続できなくなった場合は、返金の代わりに、残っている未使用レッスンを他の方へ譲渡できるかご相談いただけます。",

      transfer:
        "レッスンの譲渡は未使用分のみが対象となり、現在のtermが終了する前にご相談ください。実際の対応は、状況やスケジュールの空き状況によって異なります。",

      exception:
        "特別な事情がある場合は、Hamkkeの判断により返金を検討することがあります。",

      note:
        "予期せぬ事情がある場合は、まずご相談ください。できるだけ公平で無理のない方法を一緒に考えます。",
    },

    closing: {
      eyebrow: "Hamkkeからのご案内",

      title: "最後に",

      text:
        "これらのガイドラインは、レッスンを複雑にするためのものではありません。",

      textTwo:
        "お互いの時間を尊重しながら、安心して気持ちよくレッスンを続けるためのシンプルなルールです。",

      thankYou:
        "一つひとつの会話のために確保した時間を大切にしてくださり、ありがとうございます。",
    },
  },

  pricing: {
    ...en.pricing,

    title: "レッスン料金",

    intro:
      "一人ひとりに向き合う英語レッスンの、シンプルでわかりやすい料金案内です。",

    privateLessons: {
      title: "1対1 オンライン英語レッスン",
      package: "20レッスン · 1回25分",

      description:
        "話したり、考えたり、間違えたりしながら、少しずつ英語で自分を表現することに慣れていくための個人レッスンです。",
    },

    waysToLearn: {
      title: "2つの学び方",

      subtitle: "まずは目標から考えます。",

      description:
        "日常の英会話をもっと自然に楽しみたい方もいれば、面接や仕事など特定の場面に備えたい方もいます。Hamkkeでは、どちらの目標にも対応できます。",

      general: {
        title: "一般英語",

        subtitle: "日常の会話のために。",

        description:
          "自分にとって大切なことを英語でより自然に表現できるよう、会話力と自信を育てます。",

        points: [
          "日常会話",
          "より自然な話し方",
          "語彙と表現",
          "自分の考えを伝える",
          "話す自信",
          "実際の会話の中で学ぶ文法",
        ],
      },

      specialized: {
        title: "目的別英語",

        subtitle: "具体的な目標のために。",

        description:
          "特定の場面や目標、コミュニケーション上の課題に合わせてレッスンを組み立てます。",

        points: [
          "就職面接",
          "ビジネス英語",
          "プレゼンテーション",
          "旅行英語",
          "アカデミックディスカッション",
          "その他の具体的なコミュニケーション目標",
        ],
      },
    },

    lessonFlow: {
      title: "レッスンでは何をするの？",

      intro: "英語を学ぶだけではありません。",

      introHighlight: "実際に使います。",

      steps: {
        conversation: {
          number: "01",
          title: "会話",
          text:
            "自分に関係のあるテーマについて、実際に英語で話します。",
        },

        feedback: {
          number: "02",
          title: "フィードバック",
          text:
            "文法、語彙、発音、表現の中から、今の会話に役立つポイントを一緒に確認します。",
        },

        refinement: {
          number: "03",
          title: "表現を整える",
          text:
            "自分が伝えたいことを、より明確で自然に表現する方法を考えます。",
        },

        practice: {
          number: "04",
          title: "もう一度使う",
          text:
            "学んだ表現を自分の英語にできるよう、会話の中でもう一度使ってみます。",
        },
      },
    },

    practical: {
      title: "レッスン基本情報",

      intro: "最初からシンプルでわかりやすく。",

      details: {
        lessonLength: {
          label: "レッスン時間",
          value: "25分",
        },

        package: {
          label: "受講回数",
          value: "1対1レッスン 20回",
        },

        format: {
          label: "レッスン形式",
          value: "オンライン · 1対1",
        },

        tuition: {
          label: "レッスン料金",
        },
      },

      policy: "レッスンポリシー",
    },
  },

  platform: {
    ...en.platform,

    title: "使いやすいプラットフォームで",

    intro:
      "一番使いやすいプラットフォームを選んでください。どこで会っても、レッスンの考え方は変わりません。",

    available: {
      title: "利用できるプラットフォーム",

      subtitle: "使いやすい場所で会いましょう。",

      description:
        "Hamkkeのレッスンは、使い慣れた複数のオンラインプラットフォームで受講できます。自分にとって一番使いやすい方法を選べます。",
    },

    note:
      "特別な機材は必要ありません。安定したインターネット接続、マイク、そして落ち着いて話せる場所があれば十分です。",

    beforeLesson: {
      title: "レッスンの前に",

      subtitle: "必要なのは、ほんの少しの準備だけ。",

      description:
        "複雑な機材や特別な学習スペースは必要ありません。英語を話すことに時間を使えるよう、基本的なものだけ準備してください。",

      items: [
        {
          number: "01",
          title: "デバイス",
          text:
            "選択したプラットフォームに接続できるパソコン、タブレット、またはスマートフォン。",
        },

        {
          number: "02",
          title: "インターネット",
          text:
            "会話をスムーズに続けられる安定したインターネット接続。",
        },

        {
          number: "03",
          title: "マイク",
          text:
            "お互いの声をはっきり聞けるイヤホンまたはマイク。",
        },

        {
          number: "04",
          title: "静かな場所",
          text:
            "できるだけ邪魔が入らず、安心して話せる場所。",
        },
      ],
    },

    closing: {
      text:
        "プラットフォームは、私たちが会う場所にすぎません。大切なのは、そこで交わす会話です。",
    },
  },

  faq: {
    ...en.faq,

    title: "よくある質問",

    intro:
      "初めてのレッスンの前に気になりやすいことをまとめました。",

    questions: [
      {
        question:
          "英語を話すのが緊張したり、自信がなかったりしても大丈夫ですか？",

        answer:
          "もちろんです。最初から完璧に話す必要はありません。会話を続けやすいように質問をしたり、考える時間を取ったりしながら、少しずつ安心して表現できるようサポートします。",
      },

      {
        question:
          "レッスン中に質問してもいいですか？",

        answer:
          "もちろんです。わからないことがあるとき、別の言い方を知りたいとき、もっと詳しく知りたいときは、いつでも質問してください。",
      },

      {
        question:
          "教材や本を別に購入する必要がありますか？",

        answer:
          "いいえ。通常のレッスンのために、別途教材を購入する必要はありません。レッスン内容や学習目標に合わせて、必要な資料を準備します。",
      },

      {
        question:
          "レッスン前に何か準備する必要がありますか？",

        answer:
          "ほとんどの場合、特別な準備は必要ありません。気軽に参加して、会話を始めれば大丈夫です。事前準備が必要な場合はこちらからお知らせします。",
      },

      {
        question:
          "自分が使いたい教材やテーマを持ち込んでもいいですか？",

        answer:
          "はい。話してみたいテーマ、記事、動画、プレゼンテーション、その他の資料があれば、ぜひ持ってきてください。実際の会話や練習に活用できます。",
      },

      {
        question: "支払いはどのように行いますか？",

        answer:
          "レッスンスケジュールを決める際に、お支払い方法もご案内します。手続きについてわからないことがあれば、気軽にお問い合わせください。",
      },

      {
        question: "レッスン料金は返金できますか？",

        answer:
          "返金やレッスンの譲渡については、Hamkkeのレッスンポリシーに基づいて対応します。詳しくはレッスンポリシーをご確認ください。",
      },

      {
        question:
          "次のtermの料金はいつ支払いますか？",

        answer:
          "現在のtermが終了する前に、次のtermのお支払いについてご案内します。",
      },

      {
        question:
          "レッスンをキャンセルしたり欠席したりする場合はどうなりますか？",

        answer:
          "キャンセル、欠席、日程変更についての詳しいルールは、レッスンポリシーをご確認ください。",
      },
    ],

    closing:
      "ほかにも気になることがあれば、いつでもお問い合わせください。",
  },

  howItWorks: {
    ...en.howItWorks,

    title: "レッスン開始までの流れ",

    intro:
      "最初のお問い合わせから初回レッスンまで、シンプルに進みます。",

    steps: {
      inquire: {
        number: "01",
        title: "お問い合わせ",
        text:
          "現在の英語学習の状況、伸ばしたいこと、レッスンを通して達成したい目標を簡単に教えてください。",
      },

      assessment: {
        number: "02",
        title: "無料アセスメント",
        text:
          "現在の英語レベルや話し方の傾向、どのようなサポートが必要かを知るために、短いアセスメントを行います。",
      },

      decide: {
        number: "03",
        title: "一緒に確認",
        text:
          "どのようなレッスンが必要かを話し、Hamkkeのレッスンが合っているか一緒に確認します。その場ですぐに申し込む必要はありません。",
      },

      details: {
        number: "04",
        title: "レッスン詳細の確認",
        text:
          "一緒にレッスンを始めることになったら、レッスン形式、スケジュール、料金、お支払い方法など必要な情報をご案内します。",
      },

      contract: {
        number: "05",
        title: "契約",
        text:
          "内容を確認した後、レッスン契約とスケジュールを確定します。",
      },

      payment: {
        number: "06",
        title: "お支払い",
        text:
          "レッスン開始前にお支払いを行います。お支払いの確認後、レッスン開始の準備が整います。",
      },

      begin: {
        number: "07",
        title: "レッスン開始",
        text:
          "ここから会話が始まります。実際に英語を使いながら目標に向かって進み、会話を通して少しずつ自信を育てていきます。",
      },
    },

    closing: {
      title: "複雑なプロセスはありません。",

      text:
        "今どこにいるのか、どこまで行きたいのか、そしてHamkkeがその過程に合っているのかを一緒に話すことから始めます。",
    },
  },

  hero: {
    ...en.hero,

    eyebrow: "1対1 オンライン英語",

    titleFirst: "Small Talkから",
    titleSecond: "",
    titleAccent: "Big Ideasへ。",

    descriptionFirst:
      "英語は、実際に使えるようになるともっと役立つものになります。",

    descriptionSecond:
      "すでに知っている英語から始めて、本当に伝えたいことをもっと表現できるようになりましょう。",

    assessment: "無料アセスメントを予約",

    features: {
      conversation: "会話中心",
      learners: "子どもから大人まで",
      online: "100%オンライン",
      personalized: "一人ひとりに合わせたレッスン",
    },
  },

  findYourLesson: {
    ...en.findYourLesson,

    eyebrow: "レッスンを探す",

    title: "自分に合ったレッスンを見つけよう。",

    description:
      "レッスン形式、受講回数、料金を確認してから次に進めます。",

    online: "1対1 オンライン",

    lesson: "Conversation Lesson",

    learners: "子ども · ティーン · 大人",

    platforms: "プラットフォーム",

    format: "レッスン形式",

    voice: "オーディオ",
    voiceDetail: "カメラOFF",

    video: "ビデオ",
    videoDetail: "カメラは任意",

    durationLabel: "レッスン時間",
    perLesson: "1回",

    lessonsLabel: "受講回数",
    lessons: "20回",
    perPackage: "term",

    tuitionLabel: "レッスン料金",

    tuitionReview:
      "レッスン料金は毎年見直され、物価上昇や運営コストの変化を反映して調整される場合があります。",

    term: {
      label: "受講回数",
      lessons: "{count}回",
      flexible: "10回または20回",
      standard: "20回term",
      perTerm: "{count}回term",
      choose10: "10回",
      choose20: "20回",
    },

    chooseLesson: "このレッスンを選ぶ",

    decreaseDuration: "レッスン時間を短くする",
    increaseDuration: "レッスン時間を長くする",
  },

  hamkkeApproach: {
    ...en.hamkkeApproach,

    eyebrow: "The Hamkke Approach",

    title: {
      lineOne:
        "会話のために英語を準備するのではありません。",
      lineTwo:
        "会話そのものがレッスンです。",
    },

    description: {
      text:
        "一つの考えが質問につながり、その質問がより良い伝え方につながります。そして、もう一度言ってみるたびに、会話とともに英語も育っていきます。",

      highlights: [
        "より良い伝え方",
        "会話とともに英語も育っていきます",
      ],
    },

    steps: {
      talk: {
        number: "01",
        title: "We Talk",
        description:
          "まずは、自分が話したいことから始めます。",
      },

      goDeeper: {
        number: "02",
        title: "We Go Deeper",
        description:
          "続く質問を通して、考えをもう少し深く、具体的にしていきます。",
      },

      refine: {
        number: "03",
        title: "We Refine",
        description:
          "会話の中で自然に出てきた英語を、講師と一緒により明確で自然な表現へ整えます。",
      },

      tryAgain: {
        number: "04",
        title: "You Try Again",
        description:
          "学んだ英語をもう一度使い、自分の考えをより明確に、自信を持って表現します。",
      },
    },

    continuation: {
      lineOne: "そして会話は",
      lineTwo: "続いていきます。",
    },

    explore: "Hamkke Approachを見る",
  },

  learnerStages: {
    ...en.learnerStages,

    eyebrow: "すべての学習ステージに",

    title:
      "成長するにつれて、会話も変わっていきます。",

    description: {
      text:
        "物語を話すための言葉を探している子ども、自分の意見を説明する方法を学ぶティーン、そして本当に伝えたいことを正確に表現したい大人。目標は変わっても、Hamkkeは一人ひとりの会話が始まる場所から一緒に進みます。",

      highlights: [
        "本当に伝えたいことを正確に表現",
        "会話が始まる場所",
      ],
    },

    start: {
      number: "01",
      text: "今いるところから始めよう。",
    },

    stages: {
      kids: {
        number: "02",
        title: "子ども",
        tagline:
          "短い答えを、会話へつなげる。",
        description:
          "物語や質問、身近なテーマを通して、自分の考えを英語で表現する経験を重ねながら、話す自信を育てます。",
      },

      teens: {
        number: "03",
        title: "ティーン",
        tagline:
          "話したいことを増やし、伝え方を学ぶ。",
        description:
          "短い答えから一歩進み、意見をつくり、理由を説明し、質問しながら、より複雑な考えを英語で表現する練習をします。",
      },

      adults: {
        number: "04",
        title: "大人",
        tagline:
          "英語を、もっと自分らしい言葉に。",
        description:
          "自分にとって大切なことを英語で話しながら、必要な語彙、文の組み立て方、表現を自然に整えていきます。",
      },
    },

    further: "一緒に、もう少し先へ。",
    keepGrowing: "学びを続ける",
  },

  teachers: {
    ...en.teachers,

    section: {
      eyebrow: "Hamkkeの講師",
      title: "会話を支える人たち。",
      viewAll: "先生を見る",
    },

    directory: {
      eyebrow: "Hamkkeの講師",

      title:
        "気軽に話せそうな講師を見つけてください。",

      description: {
        text:
          "Hamkkeの講師はそれぞれ異なる個性や経験を持っていますが、学習者が安心して話し、成長できるよう支えるという共通の教育方針を大切にしています。",

        highlights: ["安心して話し、成長できる"],
      },

      mascotAlt:
        "Hamkke 講師キャラクター",

      empty:
        "現在ご紹介できる講師はいません。",

      viewProfile: "プロフィールを見る",
    },

    card: {
      teacherLabel: "Hamkke 講師",
      learners: "対象",
      specialties: "得意分野",
      viewProfile: "プロフィールを見る",
      avatarAlt: "{name}先生",
    },

    learnerGroups: {
      kids: "子ども",
      teens: "ティーン",
      adults: "大人",
    },

    presentations: {
      jesica: {
        role: "Hamkke 講師",

        quote:
          "本当に伝えたいことを、英語でもっと表現できるようサポートします。",

        specialties: {
          conversation: {
            title: "会話",
            detail: "実際のコミュニケーション",
          },

          interview: {
            title: "面接対策",
            detail: "OPIC、航空会社面接など",
          },

          supportive: {
            title: "丁寧で安心できるサポート",
            detail: "自分のペースで学ぶ",
          },
        },
      },

      default: {
        role: "Hamkke 講師",

        quote:
          "意味のある会話を通して、英語を実際に使えるようサポートします。",

        specialties: {
          conversation: {
            title: "会話",
            detail: "実際のコミュニケーション",
          },

          personalized: {
            title: "パーソナライズ",
            detail: "一人ひとりに合ったレッスン",
          },

          supportive: {
            title: "安心できるサポート",
            detail: "自分のペースで学ぶ",
          },
        },
      },
    },
  },

  learnerStories: {
    ...en.learnerStories,

    eyebrow: "Passed Along",

    title:
      "学習者から届いた言葉。",

    description: {
      text:
        "Hamkkeで学ぶ中で、学習者やご家族が共有してくださった経験、節目、そして感じたことをご紹介します。",

      highlights: ["学習者やご家族"],
    },

    closing: {
      text:
        "会話や成長、そして一緒に学んできた時間の中で寄せられた言葉を集めています。",

      highlights: [
        "会話や成長、そして一緒に学んできた時間",
      ],
    },

    explore: "学習者のストーリーを見る",

    readMore: "続きを読む",

    modal: {
      ariaLabel: "学習者のストーリー",
      close: "ストーリーを閉じる",
    },
  },

  getStarted: {
    ...en.getStarted,

    eyebrow: "準備ができたら",

    title:
      "意味のある会話にも、始まりがあります。",

    subtitle:
      "あなたの始まりは、ここかもしれません。",

    steps: {
      introduction: {
        number: "01",
        title: "あなたのことを教えてください。",
        description:
          "目標、現在の英語、必要としているサポートについて教えてください。",
      },

      conversation: {
        number: "02",
        title: "まずは話してみましょう。",
        description:
          "講師と会い、自然に会話してみましょう。",
      },

      lessons: {
        number: "03",
        title: "レッスンを始めましょう。",
        description:
          "スケジュールを決めて、レッスンをスタートします。",
      },
    },

    invitation:
      "最初の一歩を、一緒に始めませんか？",

    button: "無料アセスメントを予約",
  },

  lessonsPage: {
  ...en.lessonsPage,

  hero: {
    eyebrow: "1対1 オンライン英語",

    title:
      "話すために学び、会話しながら成長するレッスン。",

    description: {
      text:
        "Hamkkeの1対1オンライン英語レッスンは、実際の会話を中心に進みます。すでに知っている英語を使いながら、必要な表現を学び、少しずつより明確に、安心して話せるようサポートします。",

      highlights: [
        "実際の会話",
        "より明確に、安心して",
      ],
    },
  },

  audience: {
    eyebrow: "どんな方のためのレッスン？",

    title:
      "自分に合う学び方を見つけよう。",

    description: {
      text:
        "同じ会話中心のアプローチでも、年齢や目標に合わせて学び方は変わります。何を話すのか、そして講師がどのようにサポートするのかも、学習者に合わせて調整します。",

      highlight:
        "年齢や目標に合わせて学び方は変わります",
    },

    groups: {
      kids: {
        label: "子ども",

        title:
          "学んでいる英語を、実際に使う機会をもっと。",

        description:
          "英語を学んでいても、会話の中で答えたり、説明したり、自分の考えを表現したりする機会がもっと必要な子どものためのレッスンです。",

        goals: [
          "スピーキング練習",
          "会話の中で学ぶ語彙",
          "より長い答え",
          "話す自信",
        ],
      },

      teens: {
        label: "ティーン",

        title:
          "短い答えから、もう一歩先へ。",

        description:
          "自分の意見を伝え、考えを説明し、英語でより長い会話を自然に続けられるようになりたいティーンのためのレッスンです。",

        goals: [
          "会話",
          "意見・考え",
          "学校英語",
          "話す自信",
        ],
      },

      adults: {
        label: "大人",

        title:
          "自分にとって大切な場面で、英語を使えるように。",

        description:
          "日常生活、仕事、旅行、そして自分にとって大切な会話の中で、より自然に英語でコミュニケーションを取りたい大人のためのレッスンです。",

        goals: [
          "日常英語",
          "仕事",
          "面接",
          "旅行",
          "フリートーク",
        ],
      },
    },
  },

  details: {
    eyebrow: "レッスン詳細",

    title:
      "自分に合ったレッスン設定を選んでください。",

    description:
      "自分に合ったレッスン時間と受講回数を選べます。",

    online: "1対1 オンライン",

    lesson: "Conversation Lesson",

    learners: "子ども · ティーン · 大人",

    platforms: "プラットフォーム",

    format: "レッスン形式",

    audio: {
      title: "オーディオ",
      description: "カメラOFF",
    },

    video: {
      title: "ビデオ",
      description: "カメラは任意",
    },

    duration: {
      label: "レッスン時間",

      minutes: "{count}分",

      perLesson: "1回のレッスン",

      decrease:
        "レッスン時間を短くする",

      increase:
        "レッスン時間を長くする",
    },

    term: {
      label: "受講回数",

      lessons: "{count}回",

      flexible:
        "10回または20回から選択",

      standard:
        "25〜35分のレッスンは20回term",

      choose10:
        "10回を選択",

      choose20:
        "20回を選択",
    },

    tuition: {
      label: "レッスン料金",

      perTerm:
        "{count}回term",

      review:
        "レッスン料金は毎年見直され、物価上昇や運営コストの変化を反映して調整される場合があります。",
    },

    chooseLesson:
      "このレッスンを選ぶ",
  },

  nextStep: {
    eyebrow: "講師",

    title:
      "気軽に話せそうな講師を見つけてください。",

    button:
      "講師を見る",
  },
},

  approachPage: {
  ...en.approachPage,

  hero: {
    eyebrow: "The Hamkke Approach",

    title:
      "会話が生まれる場所で、学びも始まります。",

    description: {
      text:
        "Hamkkeでは、英語を完璧に学んでから会話するのではありません。会話しながら必要な英語を見つけ、学び、もう一度使います。",

      highlights: [
        "会話しながら",
        "見つけ、学び、もう一度使います",
      ],
    },
  },

  whyConversation: {
    eyebrow: "なぜ会話なのか",

    title:
      "英語を知っていることと、使うことは違います。",

    firstParagraph: {
      text:
        "単語を知り、文法を理解し、問題を見れば正しい答えがわかっていても、いざ自分が話す番になると、言葉に詰まってしまうことがあります。",

      highlight:
        "いざ自分が話す番になると、言葉に詰まってしまうことがあります",
    },

    secondParagraph: {
      text:
        "Hamkkeが大切にしているのは、まさにそのギャップです。英語が完璧になるまで待つのではなく、すでに知っている英語を実際に使い、会話しながら必要なことを見つけ、そこから少しずつ積み重ねていきます。",

      highlights: [
        "まさにそのギャップ",
        "すでに知っている英語を実際に使い",
      ],
    },
  },

  framework: {
    eyebrow: "レッスンの流れ",

    title:
      "台本ではなく、繰り返される一つのサイクル。",

    description:
      "会話の内容は毎回変わっても、学びにつながる基本的な流れは一貫しています。",

    steps: {
      talk: {
        number: "01",
        title: "We Talk",
        description:
          "まず、学習者が話したいことから始めます。",
        short:
          "あなたの考えから、会話が始まります。",
      },

      goDeeper: {
        number: "02",
        title: "We Go Deeper",
        description:
          "質問を通して、考えをより具体的に説明し、発展させます。",
        short:
          "一つの答えが、本当の会話へつながります。",
      },

      refine: {
        number: "03",
        title: "We Refine",
        description:
          "会話の中で実際に必要になった語彙、文法、発音、表現を一緒に整えます。",
        short:
          "その瞬間に必要な英語を一緒に整えます。",
      },

      tryAgain: {
        number: "04",
        title: "You Try Again",
        description:
          "学んだ英語をもう一度使い、同じ考えをより明確に表現します。",
        short:
          "学んだ英語を会話の中でもう一度使います。",
      },
    },

    cycle: {
      title:
        "台本ではなく、繰り返されるサイクルです。",

      description:
        "会話の中では、この流れを何度も行き来することがあります。一つの考えをじっくり掘り下げることもあれば、役立つ表現を整えたあと、すぐに会話へ戻ることもあります。基本となる学習の枠組みは一貫していますが、会話そのものは柔軟に変化します。",
    },
  },

  teacherRole: {
    eyebrow: "講師の役割",

    title:
      "会話を奪わずに、必要なサポートを。",

    description: {
      text:
        "講師は会話が自然に続くようサポートしながら、学習者自身が考え、答え、自分で英語を使ってみるための十分な時間と余白を大切にします。",

      highlight:
        "学習者自身が考え、答え、自分で英語を使ってみるための十分な時間と余白",
    },

    roles: {
      listen: {
        number: "01",
        title: "聞く",
        description:
          "一つひとつの文が完璧かどうかだけではなく、学習者が何を伝えようとしているのかを受け取ります。",
      },

      ask: {
        number: "02",
        title: "質問する",
        description:
          "意味のある問いかけを重ねながら、考えを深め、会話を続けられるようサポートします。",
      },

      refine: {
        number: "03",
        title: "整える",
        description:
          "会話の中で必要になったときに、より明確で自然な英語表現を提案します。",
      },

      giveBack: {
        number: "04",
        title: "学習者に返す",
        description:
          "講師が代わりに話すのではなく、学習者自身がその英語を使ってみるための時間をつくります。",
      },
    },
  },

  principles: {
    eyebrow: "レッスンの原則",

    title:
      "会話を中心に。でも、ただ自由に話すだけではありません。",

    communication: {
      title: "完璧さよりコミュニケーション",
      description:
        "まずは考えを伝えられることを大切にし、正確さはそのコミュニケーションをより良くするために使います。",
    },

    listen: {
      title: "教える前に聞く",
      description:
        "何を教えるか決める前に、学習者が何を伝えようとしているのかを理解します。",
    },

    thought: {
      title: "学習者の考えを追う",
      description:
        "あらかじめ決めた答えへ導くのではなく、学習者の考えが進んでいく方向を大切にします。",
    },

    questions: {
      title: "目的のある質問",
      description:
        "質問は単に会話を長くするためではなく、考えや表現を広げるために使います。",
    },

    correction: {
      title: "必要なところを選んで直す",
      description:
        "すべての間違いをすぐに訂正するわけではありません。その会話や学びに本当に役立つ部分を選びます。",
    },

    voice: {
      title: "学習者らしさを残す",
      description:
        "より自然な英語を提案するときも、学習者がもともと伝えたかった意味や個性を大切にします。",
    },

    context: {
      title: "文脈の中で学ぶ",
      description:
        "語彙や文法を切り離して学ぶのではなく、実際の会話の中で必要になったときに学びます。",
    },

    reuse: {
      title: "もう一度使う機会",
      description:
        "新しく学んだ英語をもう一度口にすることで、実際に使える言葉へ変えていきます。",
    },

    adapt: {
      title: "必要に合わせてサポートする",
      description:
        "学習者のレベルや状況に合わせて、質問、説明、訂正、考える時間を調整します。",
    },

    independence: {
      title: "自立が成長につながる",
      description:
        "少しずつサポートが少なくても、自分の考えを表現し、発展させられるようになることを大切な成長と考えます。",
    },
  },

  teachers: {
    eyebrow: "一つの教育基準",

    title:
      "講師は違っても、学びの方向は同じ。",

    description: {
      text:
        "それぞれの講師が、自分の個性、経験、専門的な判断をレッスンに持ち込みます。その一方でHamkkeでは、共通する教育基準を大切にしています。",

      highlights: [
        "それぞれの講師",
        "共通する教育基準",
      ],
    },

    standard:
      "Different teachers. Different learners. One shared educational standard.",
  },

  progress: {
    eyebrow: "Hamkkeが考える成長",

    title:
      "どれだけ知っているかではなく、英語で何ができるようになったか。",

    description: {
      text:
        "成長は、覚えた単語の数や正解できる文法問題の数だけでは測りません。自分の考えをより長く説明できるか、質問できるか、言い直せるか、そして少しずつサポートが少なくても会話を続けられるかも大切にします。",

      highlights: [
        "英語で何ができるようになったか",
        "サポートが少なくても",
      ],
    },
  },

  nextStep: {
    eyebrow: "From Small Talk to Big Ideas",

    title:
      "すでに知っている英語から始めよう。",

    description:
      "自分に合ったレッスン設定を見つけて、実際の会話の中で英語を使い始めましょう。",

    button: "自分に合ったレッスンを探す",
  },

  closing: {
    eyebrow: "続いていく会話",

    title:
      "会話するたびに、英語が少しずつ自分の言葉になっていきます。",

    description:
      "一度の完璧な文よりも、考え、話し、整え、もう一度挑戦する経験が積み重なることを大切にしています。",

    button: "無料アセスメントを予約",
  },
},

  aboutPage: {
    ...en.aboutPage,

    hero: {
      eyebrow: "Hamkkeについて",

      title:
        "一緒に学ぶと、学び方も少し変わります。",

      description: {
        text:
          "Hamkkeは、意味のある会話と丁寧なサポートを中心につくられたオンライン英語学習の場です。英語は、実際に使う機会があるときに、より意味のある言葉になると考えています。",

        highlights: [
          "意味のある会話",
          "実際に使う機会",
        ],
      },
    },

    name: {
      korean: "함께",
      meaning: "Together",

      title: "なぜHamkke？",

      paragraphs: [
        {
          text:
            "함께（Hamkke）は、韓国語で「一緒に」という意味です。",
          highlights: ["함께", "一緒に"],
        },

        {
          text:
            "この名前を選んだのは、言語を学ぶすべての過程を一人で乗り越える必要はないと考えているからです。",
          highlights: ["一人で乗り越える必要はない"],
        },

        {
          text:
            "誰かと話し、考える時間を持ち、間違え、もう一度試しながら、本当に伝えたいことを少しずつ見つけていく。そんなシンプルな経験の中でも、学びは前に進んでいきます。",
          highlights: ["考える時間を持ち"],
        },

        {
          text:
            "Hamkkeが、そんな場所であってほしいと思っています。学習者と講師が、一緒に少しずつ前へ進める場所です。",
          highlights: ["一緒に少しずつ前へ進める場所"],
        },
      ],
    },

    purpose: {
      eyebrow: "Hamkkeの目的",

      title:
        "英語を知っていることと、実際に使えることは、いつも同じではありません。",

      paragraphs: [
        {
          text:
            "文法を理解し、単語を知り、問題を解き、文章を読める学習者でも、実際の会話では自分の考えを自然に表現することが難しい場合があります。",

          highlights: [
            "自分の考えを自然に表現",
          ],
        },

        {
          text:
            "Hamkkeは、そのギャップから始まりました。",
          highlights: ["そのギャップ"],
        },

        {
          text:
            "Hamkkeでは、会話そのものを学びの一部と考えています。意味のある会話を通して、学習者は今すでに表現できること、どこでサポートが必要なのか、そして自分の考えをもっと伝えるためにどんな英語が必要なのかを見つけていきます。",

          highlights: [
            "会話そのものを学びの一部",
            "自分の考えをもっと伝える",
          ],
        },
      ],
    },

    beliefs: {
      eyebrow: "Hamkkeが大切にしていること",

      title:
        "英語は、実際に使える言葉であってほしい。",

      communication: {
        title: "コミュニケーション",

        description: {
          text:
            "すべての文を完璧にしようと心配する前に、まず自分の考えを表現できる場所が必要です。正確さも大切ですが、それは話すことを止めるためではなく、コミュニケーションを助けるためにあります。",

          highlights: [
            "自分の考えを表現",
            "コミュニケーションを助ける",
          ],
        },
      },

      responsiveness: {
        title: "一人ひとりに合わせる",

        description: {
          text:
            "必要なサポート、学習の構造、挑戦のレベル、考える時間は人によって異なります。レッスンは、目の前にいる学習者に合わせて変わるべきだと考えています。",

          highlights: [
            "目の前にいる学習者に合わせて",
          ],
        },
      },

      independence: {
        title: "自立",

        description: {
          text:
            "成長とは、英語の知識が増えることだけではありません。少しずつサポートが少なくても、自分の考えを表現し、明確にし、発展させられるようになることも大切な成長です。",

          highlights: ["サポートが少なくても"],
        },
      },
    },

    sharedStandard: {
      eyebrow: "一つの教育基準",

      title: {
        lineOne: "講師はそれぞれ違う。",
        lineTwo: "学習者もそれぞれ違う。",
        lineThree: "でも、教育の目的は一つ。",
      },

      firstParagraph: {
        text:
          "それぞれの講師が、自分の個性、経験、専門的な判断をレッスンに持ち込みます。Hamkkeはその土台として、共通する教育の考え方を大切にしています。",

        highlights: [
          "共通する教育の考え方",
        ],
      },

      secondParagraph: {
        text:
          "すべての講師がまったく同じように教えることが目的ではありません。意味のあるコミュニケーション、丁寧なサポート、役立つフィードバック、そして学習者の自立を大切にしながら、一貫した学習体験をつくることを目指しています。",

        highlights: [
          "まったく同じように教えることが目的ではありません",
          "学習者の自立",
        ],
      },

      approachButton:
        "Hamkke Approachを見る",

      teachersButton: "講師を見る",

      visual: {
        korean: "함께",
        principles: "学ぶ · 練習する · 成長する",
        together: "一緒に。",
      },
    },

    closing: {
      eyebrow: "一緒に、その先へ",

      title:
        "学びは、続いていくプロセスです。",

      firstParagraph: {
        text:
          "一つひとつの会話が、気づき、試し、整え、前よりもう少し伝えてみる新しい機会になります。",

        highlights: [
          "気づき、試し、整え",
        ],
      },

      secondParagraph: {
        text:
          "Hamkkeはそのための場所をつくり、学習者が本当に伝えたいことを、英語でより自立して、安心して表現できるようサポートします。",

        highlights: [
          "より自立して、安心して",
        ],
      },
    },
  },

  teacherProfilePage: {
    ...en.teacherProfilePage,

    breadcrumb: {
      label: "現在位置",
      home: "ホーム",
      teachers: "講師",
    },

    teacher: {
      label: "Hamkke 講師",
      avatarAlt: "{name}先生、Hamkke講師",
    },

    audio: {
      greeting: "{name}先生からの短いごあいさつ",

      comingSoon:
        "オーディオ紹介は現在準備中です。",

      play:
        "{name}先生のオーディオ紹介を再生",

      pause:
        "{name}先生のオーディオ紹介を一時停止",

      progress: "オーディオ再生位置",
    },

    getStarted: {
      eyebrow: "ここから始める",

      title:
        "{name}先生と会話を始めてみましょう。",

      description:
        "無料アセスメントで目標について話し、どのようなサポートができるか一緒に確認してみましょう。",

      details: {
        format: "1対1 オンラインレッスン",
        duration: "25〜50分",
        atmosphere:
          "プレッシャーのない、気軽な会話",
      },

      button: "無料アセスメントを予約",
    },
  },

  teacherProfile: {
    ...en.teacherProfile,

    tabs: {
      about: "紹介",
      qualifications: "経歴・資格",
      learnerStories: "学習者の声",
      availability: "空き時間",
    },

    about: {
      title: "講師について",
    },

    qualifications: {
      title: "経歴・資格",

      description:
        "英語講師としてのレッスンを支える研修、学歴、経験をご紹介します。",

      empty:
        "経歴・資格情報は現在準備中です。",
    },

    stories: {
      title: "学習者からの声",

      story: "ストーリー",
      stories: "ストーリー",
      shared: "共有",

      rating: "5点満点中{rating}点",

      readMore: "続きを読む",
      showFewer: "閉じる",

      showAll:
        "{count}件のストーリーをすべて見る",

      empty:
        "まだ学習者のストーリーはありません。",

      modal: {
        label: "学習者のストーリー",

        ariaLabel:
          "{name}さんからの学習者ストーリー",

        close: "ストーリーを閉じる",
      },
    },

    availability: {
      title: "週間空き時間",

      description:
        "現在予約できる時間と、定期レッスンが入っている時間を簡単に確認できます。",

      previousWeek: "前の週",
      today: "今日",
      nextWeek: "次の週",

      loading: "空き時間を読み込んでいます...",
      error:
        "空き時間を読み込めませんでした。",

      timezone: {
        label: "タイムゾーン",
        philippines: "フィリピン",
        korea: "韓国",
        japan: "日本",
        china: "中国",
        vietnam: "ベトナム",
      },

      status: {
        available: "予約可能",
        regularStudent: "定期レッスン",
        regularShort: "定期",
      },

      empty:
        "今週表示できる空き時間はありません。",

      note:
        "時間は{timezone}時間で表示されています。レッスンの割り当てやスケジュール変更により、空き状況は変わる場合があります。",
    },

    days: {
      sun: "日",
      mon: "月",
      tue: "火",
      wed: "水",
      thu: "木",
      fri: "金",
      sat: "土",
    },
  },

  footer: {
    ...en.footer,

    brand: "Hamkke │ 함께",
    tagline: "From Small Talk to Big Ideas.",

    description:
      "すでに知っている英語を、実際の会話でもっと使えるようにする会話中心の英語レッスンです。",

    groups: {
      learn: "レッスン",
      hamkke: "Hamkke",
      connect: "つながる",
    },

    links: {
      lessons: "レッスン",
      approach: "Hamkkeのアプローチ",
      teachers: "講師",
      about: "Hamkkeについて",
      policy: "レッスンポリシー",
      startConversation: "会話を始める",
      instagram: "Instagram",
    },

    copyright:
      "© 2026 Hamkke │ 함께. All rights reserved.",

    lessons: "レッスン",
    lessonsGroup: "レッスン",
    howItWorks: "レッスンの流れ",
    pricing: "料金",
    platform: "プラットフォーム",
    hamkkeGroup: "Hamkke",
    about: "Hamkkeについて",
    faq: "よくある質問",
    policy: "レッスンポリシー",
    connectGroup: "つながる",
    startConversation: "会話を始める",
  },

  inquiry: {
    ...en.inquiry,

    brand: "Hamkke │ 함께",

    headings: {
      experience:
        "Hamkkeが英語をどう考えているか、少し見てみませんか？",

      goals:
        "英語で何ができるようになりたいですか？",

      stories:
        "これからどこまで進みたいか、聞かせてください。",

      startAConversation:
        "まずは会話から始めませんか？",
    },

    intro:
      "現在の英語学習の状況や、一緒に練習したいことを簡単に教えてください。",

    reassurance: {
      personalReply:
        "24時間以内に直接お返事します",

      informationSafe:
        "個人情報は大切に取り扱います。",
    },

    fields: {
      name: "お名前、または呼ばれたい名前",
      email: "メールアドレス",

      contactMethod:
        "どの方法で連絡するのがよいですか？",

      contactId:
        "ID、ユーザー名、または電話番号",

      level:
        "現在、英語で話すことにどのくらい慣れていますか？",

      goal:
        "どんなことを練習したいですか？理由も教えてください。",

      message:
        "ほかに伝えておきたいことはありますか？（任意）",
    },

    options: {
      contactMethod: {
        kakaoTalk: "KakaoTalk",
        whatsApp: "WhatsApp",
        weChat: "WeChat",
      },

      level: {
        justGettingStarted:
          "英語を始めたばかりです。",

        understandingButSpeakingIsDifficult:
          "英語は理解できますが、話すのが難しいです。",

        simpleConversationsButStillHesitate:
          "簡単な会話はできますが、まだよく迷います。",

        communicateWellButWantToSpeakMoreNaturally:
          "コミュニケーションはできますが、もっと自然に話したいです。",

        comfortableSpeakingButWantToBecomeMoreFluent:
          "話すことには慣れていますが、もっと流暢になりたいです。",
      },

      goal: {
        speakMoreConfidently:
          "もっと自信を持って話したい",

        improveEverydayConversation:
          "日常英会話を上達させたい",

        englishForWork:
          "仕事で英語を使いたい",

        interviewPreparation:
          "英語面接の準備をしたい",

        travelMoreComfortably:
          "旅行で英語をもっと気軽に使いたい",

        improveOverallEnglish:
          "総合的な英語力を伸ばしたい",

        somethingElse: "その他",
      },
    },

    submit: "問い合わせを送る",
    sending: "送信中...",

    privacy:
      "個人情報は大切に取り扱い、第三者と共有することはありません。",

    success: {
      title: "ありがとうございます。",

      message:
        "お問い合わせを受け付けました。24時間以内に直接お返事します。現在の英語や目標について知り、これからの学びを一緒に考えられることを楽しみにしています。",

      closing: "またすぐにお話ししましょう。",
    },

    errors: {
      general:
        "問題が発生しました。もう一度お試しください。",

      network:
        "メッセージを送信できませんでした。もう一度お試しください。",
    },
  },

  language: {
    english: "English",
    korean: "한국어",
    chinese: "中文",
    japanese: "日本語",
  },
};

export default ja;






