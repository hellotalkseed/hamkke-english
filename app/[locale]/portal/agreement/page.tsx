import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "./PrintButton";

interface ContractPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ enrollment?: string }>;
}

interface EnrollmentSchedule {
  id: string;
  enrollment_id: string;
  student_id: string | null;
  day_of_week: number;
  schedule_time: string;
}

interface Participant {
  id: string;
  full_name: string;
  preferred_name: string | null;
  timezone: string | null;
}

interface ScheduleItem {
  day: string;
  time: string;
}

interface ParticipantSchedule {
  participant: Participant;
  schedule: ScheduleItem[];
}

/* -------------------------------------------------------------------------- */
/* DAY LABELS                                                                 */
/* -------------------------------------------------------------------------- */

const DAY_LABELS: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

const agreementCopy = {
  en: {
    back: "{t.back}",
    print: "Print Contract",
    privateLessons: "{t.privateLessons}",
    lessonAgreement: "{t.lessonAgreement}",
    student: "Student", students: "Students",
    contractNumber: "Contract Number", agreementDate: "Agreement Date",
    overview: "Agreement Overview", enrollmentDetails: "Enrollment Details",
    tuitionPayment: "Tuition & Payment", cancellation: "Cancellation & Rescheduling",
    unexpected: "Unexpected Circumstances", lateArrivals: "Late Arrivals",
    teacherCancellations: "Teacher Cancellations", repeatedCancellations: "Repeated Cancellations",
    refundsTransfers: "Refunds & Transfers", communication: "Communication",
    acceptance: "Agreement & Acceptance", digitalAgreement: "{t.digitalAgreement}",
    paymentAcceptance: "{t.paymentAcceptance}", ofAgreement: "of this {t.lessonAgreement}.",
    package: "Package", numberLessons: "Number of Lessons", lessonDuration: "Lesson Duration",
    lessonsPerWeek: "Lessons Per Week", startDate: "Start Date", lessonDays: "Lesson Days",
    lessonSchedule: "Lesson Schedule", studentTimezone: "Student Timezone", tuition: "Tuition",
    acceptedBy: "Accepted By", relationship: "Relationship to Student",
    toBeConfirmed: "To be confirmed", lessons: "lessons", minutes: "minutes",
    footer1: "These guidelines are here to help keep lessons predictable, respectful, and comfortable for both sides.",
    footer2: "{t.footer2}",
  },
  ko: {
    back: "수강 등록으로 돌아가기",
    print: "계약서 인쇄",
    privateLessons: "개인 영어 수업", lessonAgreement: "수업 계약서",
    student: "학생", students: "학생",
    contractNumber: "계약 번호", agreementDate: "계약일",
    overview: "계약 개요", enrollmentDetails: "수강 정보",
    tuitionPayment: "수강료 및 결제", cancellation: "취소 및 일정 변경",
    unexpected: "예기치 못한 상황", lateArrivals: "지각",
    teacherCancellations: "교사 수업 취소", repeatedCancellations: "반복적인 취소",
    refundsTransfers: "환불 및 양도", communication: "연락 및 소통",
    acceptance: "계약 및 동의", digitalAgreement: "전자 계약",
    paymentAcceptance: "결제는 본 계약에 대한 동의를 의미합니다",
    ofAgreement: "본 수업 계약의 조건에 동의한 것으로 간주됩니다.",
    package: "수업 패키지", numberLessons: "수업 횟수", lessonDuration: "수업 시간",
    lessonsPerWeek: "주당 수업 횟수", startDate: "시작일", lessonDays: "수업 요일",
    lessonSchedule: "수업 일정", studentTimezone: "학생 시간대", tuition: "수강료",
    acceptedBy: "동의자", relationship: "학생과의 관계",
    toBeConfirmed: "확정 예정", lessons: "회", minutes: "분",
    footer1: "본 안내는 학생과 Hamkke 모두에게 예측 가능하고 존중받으며 편안한 수업 환경을 제공하기 위한 것입니다.",
    footer2: "함께 정한 수업 시간을 소중히 지켜 주셔서 감사합니다.",
  },
  zh: {
    back: "返回报名信息",
    print: "打印合同",
    privateLessons: "私人英语课程", lessonAgreement: "课程协议",
    student: "学生", students: "学生",
    contractNumber: "协议编号", agreementDate: "协议日期",
    overview: "协议概述", enrollmentDetails: "报名详情",
    tuitionPayment: "学费与付款", cancellation: "取消与改期",
    unexpected: "突发情况", lateArrivals: "迟到",
    teacherCancellations: "教师取消课程", repeatedCancellations: "多次取消",
    refundsTransfers: "退款与转让", communication: "沟通",
    acceptance: "协议与接受", digitalAgreement: "电子协议",
    paymentAcceptance: "付款即表示接受", ofAgreement: "本课程协议。",
    package: "课程套餐", numberLessons: "课程数量", lessonDuration: "课程时长",
    lessonsPerWeek: "每周课程数", startDate: "开始日期", lessonDays: "上课日",
    lessonSchedule: "课程安排", studentTimezone: "学生时区", tuition: "学费",
    acceptedBy: "接受人", relationship: "与学生的关系",
    toBeConfirmed: "待确认", lessons: "节课", minutes: "分钟",
    footer1: "这些规则旨在让双方的课程安排更加明确、互相尊重并保持舒适。",
    footer2: "感谢您珍惜我们共同预留的每一次交流时间。",
  },
  ja: {
    back: "受講登録に戻る",
    print: "契約書を印刷",
    privateLessons: "プライベート英語レッスン", lessonAgreement: "レッスン契約書",
    student: "受講生", students: "受講生",
    contractNumber: "契約番号", agreementDate: "契約日",
    overview: "契約概要", enrollmentDetails: "受講情報",
    tuitionPayment: "受講料と支払い", cancellation: "キャンセルと日程変更",
    unexpected: "予期せぬ事情", lateArrivals: "遅刻",
    teacherCancellations: "講師によるキャンセル", repeatedCancellations: "繰り返しのキャンセル",
    refundsTransfers: "返金と譲渡", communication: "連絡",
    acceptance: "契約と同意", digitalAgreement: "電子契約",
    paymentAcceptance: "支払いをもって本契約への同意とします",
    ofAgreement: "本レッスン契約に同意したものとみなされます。",
    package: "レッスンパッケージ", numberLessons: "レッスン回数", lessonDuration: "レッスン時間",
    lessonsPerWeek: "週あたりの回数", startDate: "開始日", lessonDays: "レッスン曜日",
    lessonSchedule: "レッスンスケジュール", studentTimezone: "受講生のタイムゾーン", tuition: "受講料",
    acceptedBy: "同意者", relationship: "受講生との関係",
    toBeConfirmed: "確認予定", lessons: "回", minutes: "分",
    footer1: "このガイドラインは、双方にとって予測しやすく、互いを尊重した快適なレッスン環境を保つためのものです。",
    footer2: "一緒に確保したレッスン時間を大切にしていただき、ありがとうございます。",
  },
} as const;


const agreementBody = {
  en: {
    overview: [
      "This Lesson Agreement sets out the terms and policies applicable to the private English lessons arranged between Hamkke and the student(s) named above.",
      "The lesson package, schedule, tuition, and policies described in this agreement apply to the enrollment identified below.",
      "This agreement is provided digitally before payment. By proceeding with payment for the lesson package, the person accepting this agreement confirms that they have had the opportunity to review the agreement and agree to the terms and lesson policies contained herein."
    ],
    tuition: [
      "The tuition for this enrollment is {tuition} for the lesson package described above.",
      "Tuition is set according to the selected lesson duration, term length, and displayed currency. The amount stated in this agreement is the applicable tuition for this enrollment.",
      "The tuition stated in this agreement is fixed for the duration of this lesson package. Any later tuition adjustment will apply only to a future enrollment or renewal and will not affect lessons already purchased under this agreement.",
      "Tuition is reviewed annually and may be adjusted to reflect inflation and changes in operating costs. Any tuition changes will be communicated in advance before payment for the applicable future enrollment or renewal.",
      "The lesson package is reserved upon payment. Payment confirms acceptance of this agreement and the lesson policies set out below.",
      "Because lessons are purchased as a package, refunds are generally not available once the package has been paid for, subject to the exceptions described in the Refunds & Transfers section of this agreement."
    ],
    cancellationIntro: "Each lesson is reserved specifically for the student(s). If the student(s) need to cancel or reschedule a lesson, notice should be provided at least 2 hours before the scheduled lesson.",
    cancellationPolicies: [
      ["With 2+ hours' notice", "The student may reschedule the lesson or receive credit for a future session."],
      ["With less than 2 hours' notice", "The lesson will be counted as completed."],
      ["No-show without notice", "The lesson will be counted as completed."]
    ],
    cancellationEnd: "If something unexpected comes up, the student(s) are encouraged to communicate as soon as reasonably possible. Hamkke will do its best to accommodate reasonable circumstances when possible.",
    unexpected: [
      "Not everything is within either party's control. Power outages, internet or connection problems, emergencies, and other unexpected circumstances may occasionally make it difficult to attend a lesson.",
      "If an unexpected circumstance occurs, the affected party should communicate as soon as reasonably possible.",
      "Depending on the circumstances, Hamkke may provide a reasonable solution such as rescheduling the lesson or providing lesson credit.",
      "This also applies when an unexpected issue on Hamkke's side prevents a lesson from taking place as planned."
    ],
    late: [
      "If the student is running late, they should let Hamkke know when they can.",
      "A late arrival does not extend the scheduled lesson. The lesson will still end at its originally scheduled time.",
      "Example: If a lesson is scheduled from 8:00–8:25 PM and the student joins at 8:10 PM, the lesson will run from 8:10–8:25 PM.",
      "If the student does not join within 10 minutes and has not contacted Hamkke, the lesson will be considered a no-show and counted as completed."
    ],
    teacherCancel: [
      "Sometimes Hamkke may need to cancel a lesson.",
      "If this happens, Hamkke will communicate the cancellation as soon as possible.",
      "The student will receive either a replacement lesson or full credit for the missed session."
    ],
    repeated: [
      "There is no fixed limit on cancellations. Hamkke understands that unexpected situations can happen.",
      "However, if frequent cancellations or rescheduling begin to affect lesson availability, Hamkke may contact the student to discuss the regular schedule and find an arrangement that works better for both parties.",
      "The purpose of this provision is to keep reserved lesson times useful and fair for everyone."
    ],
    refunds: [
      "Because lessons are purchased as a package, refunds are generally not available once a package has been paid for.",
      "If the student is unable to continue their lessons, they may request to transfer their remaining unused lessons instead of receiving a refund.",
      "Lesson transfers apply only to unused lessons and should be discussed before the package ends. Any new arrangement will depend on the circumstances and availability.",
      "In exceptional circumstances, a refund may be considered at Hamkke's discretion.",
      "If an unexpected situation arises, the student is encouraged to communicate with Hamkke first so that a fair and reasonable solution can be considered."
    ],
    communication: [
      "Students are encouraged to communicate scheduling changes, technical issues, emergencies, and other circumstances as soon as possible.",
      "Clear and timely communication helps both parties manage reserved lesson times fairly and avoid unnecessary misunderstandings."
    ],
    acceptance: [
      "This agreement is provided digitally before payment so that the person accepting it may review the lesson package and applicable policies in advance.",
      "By proceeding with payment for this enrollment, the person accepting this agreement confirms that they have read and understood the agreement and agree to the lesson package details and policies described herein.",
      "No handwritten signature is required for this digital agreement. The payment associated with this enrollment serves as confirmation of acceptance of these terms."
    ]
  },
  ko: {
    overview: [
      "본 수업 계약서는 위에 명시된 학생과 Hamkke 간에 진행되는 개인 영어 수업에 적용되는 조건과 정책을 규정합니다.",
      "본 계약서에 기재된 수업 패키지, 일정, 수강료 및 정책은 아래에 명시된 수강 등록에 적용됩니다.",
      "본 계약서는 결제 전에 전자 문서로 제공됩니다. 수업 패키지의 결제를 진행함으로써 계약 동의자는 본 계약서를 검토할 기회가 있었으며, 여기에 명시된 조건과 수업 정책에 동의함을 확인합니다."
    ],
    tuition: [
      "본 수강 등록의 수강료는 위에 명시된 수업 패키지에 대해 {tuition}입니다.",
      "수강료는 선택한 수업 시간, 수강 기간 및 표시된 통화를 기준으로 정해집니다. 본 계약서에 명시된 금액이 해당 수강 등록에 적용되는 수강료입니다.",
      "본 계약서에 명시된 수강료는 해당 수업 패키지 기간 동안 고정됩니다. 이후의 수강료 조정은 향후 신규 등록 또는 갱신에만 적용되며, 본 계약에 따라 이미 구매한 수업에는 영향을 미치지 않습니다.",
      "수강료는 매년 검토되며 물가 상승 및 운영 비용의 변동을 반영하여 조정될 수 있습니다. 수강료가 변경되는 경우 해당 신규 등록 또는 갱신의 결제 전에 미리 안내됩니다.",
      "결제가 완료되면 해당 수업 패키지가 예약됩니다. 결제는 본 계약서와 아래에 명시된 수업 정책에 대한 동의를 의미합니다.",
      "수업은 패키지 단위로 구매되므로, 결제가 완료된 후에는 원칙적으로 환불이 제공되지 않습니다. 단, 본 계약서의 '환불 및 양도' 조항에 명시된 예외 사항은 적용될 수 있습니다."
    ],
    cancellationIntro: "각 수업 시간은 학생을 위해 별도로 예약됩니다. 수업을 취소하거나 일정을 변경해야 하는 경우, 예정된 수업 시작 최소 2시간 전에 알려 주시기 바랍니다.",
    cancellationPolicies: [
      ["2시간 이상 전에 연락한 경우", "수업 일정을 변경하거나 추후 수업에 사용할 수 있는 수업 크레딧을 받을 수 있습니다."],
      ["2시간 미만 전에 연락한 경우", "해당 수업은 완료된 수업으로 처리됩니다."],
      ["사전 연락 없이 결석한 경우", "해당 수업은 완료된 수업으로 처리됩니다."]
    ],
    cancellationEnd: "예기치 못한 상황이 발생한 경우 가능한 한 빨리 연락해 주시기 바랍니다. Hamkke는 상황이 합리적인 범위 내에서 가능한 해결 방법을 제공하기 위해 노력합니다.",
    unexpected: [
      "모든 상황을 어느 한쪽이 통제할 수 있는 것은 아닙니다. 정전, 인터넷 또는 연결 문제, 긴급 상황 및 기타 예기치 못한 사정으로 인해 수업 참석이 어려울 수 있습니다.",
      "예기치 못한 상황이 발생한 경우 영향을 받은 당사자는 가능한 한 빨리 상대방에게 알려야 합니다.",
      "상황에 따라 Hamkke는 수업 일정 변경 또는 수업 크레딧 제공과 같은 합리적인 해결 방법을 제공할 수 있습니다.",
      "Hamkke 측의 예기치 못한 문제로 예정된 수업을 진행할 수 없는 경우에도 동일하게 적용됩니다."
    ],
    late: [
      "학생이 수업에 늦는 경우 가능한 때에 Hamkke에 알려 주시기 바랍니다.",
      "지각으로 인해 예정된 수업 시간이 연장되지는 않습니다. 수업은 원래 예정된 종료 시간에 종료됩니다.",
      "예: 수업이 오후 8:00~8:25로 예정되어 있고 학생이 오후 8:10에 접속한 경우, 수업은 오후 8:10~8:25에 진행됩니다.",
      "학생이 수업 시작 후 10분 이내에 접속하지 않고 Hamkke에 별도의 연락도 하지 않은 경우, 해당 수업은 무단 결석으로 간주되어 완료된 수업으로 처리됩니다."
    ],
    teacherCancel: [
      "경우에 따라 Hamkke가 수업을 취소해야 할 수 있습니다.",
      "이 경우 Hamkke는 가능한 한 빨리 수업 취소 사실을 안내합니다.",
      "학생에게는 보강 수업 또는 취소된 수업에 대한 전액 수업 크레딧이 제공됩니다."
    ],
    repeated: [
      "수업 취소 횟수에 정해진 제한은 없습니다. Hamkke는 예기치 못한 상황이 발생할 수 있음을 이해합니다.",
      "다만 잦은 취소나 일정 변경으로 인해 수업 시간 확보에 영향을 주기 시작하는 경우, Hamkke는 정규 수업 일정에 대해 학생과 상의하고 양측 모두에게 더 적합한 일정을 찾을 수 있습니다.",
      "이 조항의 목적은 예약된 수업 시간을 모두에게 유용하고 공정하게 유지하는 데 있습니다."
    ],
    refunds: [
      "수업은 패키지 단위로 구매되므로, 패키지 결제가 완료된 후에는 원칙적으로 환불이 제공되지 않습니다.",
      "학생이 수업을 계속할 수 없는 경우 환불 대신 남아 있는 미사용 수업의 양도를 요청할 수 있습니다.",
      "수업 양도는 사용하지 않은 수업에만 적용되며 패키지가 종료되기 전에 상의해야 합니다. 새로운 일정이나 방식은 당시 상황과 가능 여부에 따라 결정됩니다.",
      "예외적인 상황에서는 Hamkke의 판단에 따라 환불을 고려할 수 있습니다.",
      "예기치 못한 상황이 발생한 경우, 공정하고 합리적인 해결 방법을 검토할 수 있도록 먼저 Hamkke와 상의해 주시기 바랍니다."
    ],
    communication: [
      "학생은 일정 변경, 기술적 문제, 긴급 상황 및 기타 사정이 발생한 경우 가능한 한 빨리 알려 주시기 바랍니다.",
      "명확하고 신속한 소통은 양측이 예약된 수업 시간을 공정하게 관리하고 불필요한 오해를 방지하는 데 도움이 됩니다."
    ],
    acceptance: [
      "본 계약서는 결제 전에 전자 문서로 제공되며, 계약 동의자가 수업 패키지와 적용되는 정책을 미리 검토할 수 있도록 합니다.",
      "본 수강 등록의 결제를 진행함으로써 계약 동의자는 본 계약서를 읽고 이해했으며, 여기에 명시된 수업 패키지의 세부 내용과 정책에 동의함을 확인합니다.",
      "본 전자 계약에는 자필 서명이 필요하지 않습니다. 해당 수강 등록과 관련된 결제는 본 계약 조건에 대한 동의를 확인하는 것으로 간주됩니다."
    ]
  },
  zh: {
    overview: [
      "本课程协议规定了 Hamkke 与上述学生之间私人英语课程所适用的条款和政策。",
      "本协议所述的课程套餐、上课安排、学费及相关政策适用于下方所列的本次报名。",
      "本协议会在付款前以电子形式提供。完成课程套餐付款，即表示协议接受人确认已有机会阅读本协议，并同意其中所列的条款及课程政策。"
    ],
    tuition: [
      "本次报名中上述课程套餐的学费为 {tuition}。",
      "学费根据所选择的课程时长、学习周期及所显示的币种确定。本协议中列明的金额即为本次报名适用的学费。",
      "本协议所列学费在本课程套餐期间保持不变。之后的任何学费调整仅适用于未来的新报名或续课，不影响已根据本协议购买的课程。",
      "学费每年进行审核，并可能根据通货膨胀及运营成本变化进行调整。如有学费变更，将在相关新报名或续课付款前提前通知。",
      "付款后，该课程套餐即为学生保留。付款表示接受本协议以及下方所列的课程政策。",
      "由于课程以套餐形式购买，套餐付款完成后通常不予退款，但本协议“退款与转让”部分所述的例外情况除外。"
    ],
    cancellationIntro: "每节课都会专门为学生预留时间。如需取消或更改课程时间，应至少在预定上课时间前 2 小时通知。",
    cancellationPolicies: [
      ["提前 2 小时或以上通知", "学生可以改期，或获得可用于之后课程的课时额度。"],
      ["提前不足 2 小时通知", "该节课程将按已完成课程计算。"],
      ["未通知且未出席", "该节课程将按已完成课程计算。"]
    ],
    cancellationEnd: "如遇突发情况，建议学生在合理可行的情况下尽快联系。条件允许时，Hamkke 会尽力根据实际情况提供合理安排。",
    unexpected: [
      "并非所有情况都在双方的控制范围内。停电、网络或连接问题、紧急情况及其他突发事件有时可能导致无法正常参加课程。",
      "如发生突发情况，受影响的一方应在合理可行的情况下尽快联系对方。",
      "根据具体情况，Hamkke 可提供合理的解决方式，例如重新安排课程或提供课时额度。",
      "如果因 Hamkke 一方的突发问题导致课程无法按计划进行，同样适用上述处理方式。"
    ],
    late: [
      "如果学生将迟到，应在方便时告知 Hamkke。",
      "迟到不会延长原定课程时间，课程仍会在原定结束时间结束。",
      "例如：课程原定为晚上 8:00–8:25，学生在晚上 8:10 加入，则课程将在晚上 8:10–8:25 进行。",
      "如果学生在课程开始后 10 分钟内仍未加入，并且没有联系 Hamkke，该课程将被视为缺席，并按已完成课程计算。"
    ],
    teacherCancel: [
      "有时 Hamkke 可能需要取消课程。",
      "如发生这种情况，Hamkke 会尽快通知学生。",
      "学生将获得补课，或获得该次未进行课程的完整课时额度。"
    ],
    repeated: [
      "课程取消没有固定次数限制。Hamkke 理解突发情况可能会发生。",
      "但是，如果频繁取消或改期开始影响课程时间安排，Hamkke 可能会与学生联系，讨论固定上课时间，并寻找更适合双方的安排。",
      "本条款旨在确保预留的课程时间得到合理使用，并对所有人保持公平。"
    ],
    refunds: [
      "由于课程以套餐形式购买，套餐付款完成后通常不予退款。",
      "如果学生无法继续上课，可以申请将剩余未使用的课程转让给他人，以替代退款。",
      "课程转让仅适用于尚未使用的课程，并应在套餐结束前进行沟通。任何新的安排将视具体情况及时间安排而定。",
      "在特殊情况下，Hamkke 可酌情考虑退款。",
      "如遇突发情况，建议学生先与 Hamkke 沟通，以便考虑公平且合理的解决方案。"
    ],
    communication: [
      "如有课程时间变更、技术问题、紧急情况或其他状况，建议学生尽快进行沟通。",
      "清晰及时的沟通有助于双方公平管理已预留的课程时间，并避免不必要的误解。"
    ],
    acceptance: [
      "本协议会在付款前以电子形式提供，以便协议接受人提前查看课程套餐及适用政策。",
      "完成本次报名付款，即表示协议接受人确认已阅读并理解本协议，并同意其中所述的课程套餐详情及相关政策。",
      "本电子协议无需手写签名。与本次报名相关的付款即作为接受本协议条款的确认。"
    ]
  },
  ja: {
    overview: [
      "本レッスン契約書は、上記の受講生と Hamkke の間で行われるプライベート英語レッスンに適用される条件および方針を定めるものです。",
      "本契約書に記載されたレッスンパッケージ、スケジュール、受講料および方針は、以下に示す受講登録に適用されます。",
      "本契約書は支払い前に電子形式で提供されます。レッスンパッケージの支払いを行うことにより、契約に同意する方は本契約書を確認する機会があり、ここに記載された条件およびレッスン方針に同意したことを確認します。"
    ],
    tuition: [
      "本受講登録の受講料は、上記のレッスンパッケージについて {tuition} です。",
      "受講料は、選択されたレッスン時間、受講期間、および表示通貨に基づいて設定されます。本契約書に記載された金額が、本受講登録に適用される受講料です。",
      "本契約書に記載された受講料は、このレッスンパッケージの期間中は固定されます。その後の受講料の変更は、将来の新規登録または更新にのみ適用され、本契約に基づいてすでに購入されたレッスンには影響しません。",
      "受講料は毎年見直され、物価上昇や運営費の変化を反映して調整される場合があります。受講料に変更がある場合は、対象となる新規登録または更新の支払い前に事前にお知らせします。",
      "支払いが完了すると、レッスンパッケージが確保されます。支払いは、本契約書および以下に記載されたレッスン方針への同意を意味します。",
      "レッスンはパッケージとして購入されるため、パッケージの支払い完了後は原則として返金できません。ただし、本契約書の「返金と譲渡」に記載された例外が適用される場合があります。"
    ],
    cancellationIntro: "各レッスン時間は受講生のために個別に確保されています。レッスンをキャンセルまたは日程変更する必要がある場合は、予定されたレッスン開始時刻の少なくとも2時間前までにご連絡ください。",
    cancellationPolicies: [
      ["2時間以上前に連絡した場合", "レッスンの日程変更、または今後のレッスンに使用できるレッスンクレジットを受けることができます。"],
      ["2時間未満前の連絡の場合", "そのレッスンは実施済みとして扱われます。"],
      ["連絡なしの欠席", "そのレッスンは実施済みとして扱われます。"]
    ],
    cancellationEnd: "予期せぬ事情が生じた場合は、合理的に可能な範囲でできるだけ早くご連絡ください。Hamkke は、可能な場合には状況に応じた合理的な対応に努めます。",
    unexpected: [
      "すべての状況をどちらか一方が管理できるわけではありません。停電、インターネットや接続の問題、緊急事態、その他の予期せぬ事情により、レッスンへの参加が難しくなることがあります。",
      "予期せぬ事情が発生した場合、影響を受けた側は合理的に可能な範囲でできるだけ早く連絡するものとします。",
      "状況に応じて、Hamkke はレッスンの日程変更やレッスンクレジットの付与など、合理的な対応を行う場合があります。",
      "Hamkke 側の予期せぬ問題により予定どおりレッスンを実施できない場合にも、同様に適用されます。"
    ],
    late: [
      "受講生が遅れる場合は、可能なときに Hamkke へご連絡ください。",
      "遅刻によって予定されたレッスン時間が延長されることはありません。レッスンは当初予定されていた終了時刻に終了します。",
      "例：レッスンが午後8:00～8:25に予定され、受講生が午後8:10に参加した場合、レッスンは午後8:10～8:25に行われます。",
      "受講生が開始後10分以内に参加せず、Hamkke への連絡もない場合、そのレッスンは無断欠席とみなされ、実施済みとして扱われます。"
    ],
    teacherCancel: [
      "Hamkke がレッスンをキャンセルする必要が生じる場合があります。",
      "その場合、Hamkke はできるだけ早くキャンセルについてご連絡します。",
      "受講生には振替レッスン、または実施できなかったレッスン分の全額レッスンクレジットが提供されます。"
    ],
    repeated: [
      "キャンセル回数に固定の上限はありません。Hamkke は予期せぬ事情が起こり得ることを理解しています。",
      "ただし、頻繁なキャンセルや日程変更がレッスン枠の確保に影響し始めた場合、Hamkke は受講生に連絡し、通常のスケジュールについて相談したうえで、双方にとってより適した方法を検討することがあります。",
      "本条項の目的は、確保されたレッスン時間をすべての方にとって有効かつ公平に保つことです。"
    ],
    refunds: [
      "レッスンはパッケージとして購入されるため、パッケージの支払い完了後は原則として返金できません。",
      "受講生がレッスンを継続できない場合、返金の代わりに残っている未使用レッスンの譲渡を申請することができます。",
      "レッスンの譲渡は未使用のレッスンにのみ適用され、パッケージ終了前に相談する必要があります。新しい取り決めは、その時点の状況および空き状況によって決まります。",
      "例外的な事情がある場合、Hamkke の判断により返金を検討することがあります。",
      "予期せぬ事情が発生した場合は、公平で合理的な解決方法を検討できるよう、まず Hamkke へご相談ください。"
    ],
    communication: [
      "スケジュール変更、技術的な問題、緊急事態、その他の事情がある場合、受講生はできるだけ早く連絡することが推奨されます。",
      "明確で迅速な連絡は、双方が確保されたレッスン時間を公平に管理し、不必要な誤解を避けるために役立ちます。"
    ],
    acceptance: [
      "本契約書は支払い前に電子形式で提供され、契約に同意する方がレッスンパッケージおよび適用される方針を事前に確認できるようにしています。",
      "本受講登録の支払いを行うことにより、契約に同意する方は本契約書を読み、理解し、ここに記載されたレッスンパッケージの詳細および方針に同意したことを確認します。",
      "本電子契約には手書きの署名は必要ありません。本受講登録に関連する支払いをもって、本契約条件への同意が確認されたものとします。"
    ]
  }
} as const;


/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default async function ContractPage({
  params,
  searchParams,
}: ContractPageProps) {
  const { locale } = await params;
  const t = agreementCopy[locale as keyof typeof agreementCopy] ?? agreementCopy.en;
  const body = agreementBody[locale as keyof typeof agreementBody] ?? agreementBody.en;
  const { enrollment: enrollmentId } = await searchParams;

  if (!enrollmentId) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/portal/login`);
  }

  const account = await supabase
    .from("portal_accounts")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (account.error || account.data?.status !== "active") {
    redirect(`/${locale}/portal/login?error=access`);
  }

  /*
   * IMPORTANT:
   *
   * The owner/admin contract page remains owner-only.
   * This student route does not query admin-protected tables directly.
   *
   * The SECURITY DEFINER RPC verifies auth.uid(), confirms that the requested
   * enrollment belongs to a student linked to the current portal account,
   * and returns only the fields required to render the {t.lessonAgreement}.
   */
  const { data: agreementData, error: agreementError } =
    await supabase.rpc("get_portal_lesson_agreement", {
      p_enrollment_id: enrollmentId,
    });

  if (agreementError) {
    console.error("Portal lesson agreement RPC error:", agreementError);
    notFound();
  }

  if (!agreementData || typeof agreementData !== "object") {
    notFound();
  }

  const payload = agreementData as {
    student: Participant;
    enrollment: {
      id: string;
      student_id: string | null;
      package_name: string | null;
      number_of_lessons: number | null;
      lesson_duration: number | null;
      lessons_per_week: number | null;
      start_date: string | null;
      tuition_amount: number | string | null;
      currency: string | null;
      schedule_days: unknown;
      schedule_time: string | null;
    };
    participants: Participant[];
    schedules: EnrollmentSchedule[];
    contract: {
      id: string;
      contract_number: string | null;
      agreement_date: string | null;
      accepted_by_name: string | null;
      accepted_by_relationship: string | null;
    };
  };

  const student = payload.student;
  const enrollment = payload.enrollment;
  const contract = payload.contract;
  const participants = Array.isArray(payload.participants)
    ? payload.participants
    : [];
  const enrollmentSchedules = Array.isArray(payload.schedules)
    ? payload.schedules
    : [];

  if (!student || !enrollment || !contract) {
    notFound();
  }

  const isSharedEnrollment = participants.length > 1;

  /* ---------------------------------------------------------------------- */
  /* BASIC VALUES                                                            */
  /* ---------------------------------------------------------------------- */

  const studentName = isSharedEnrollment
    ? participants
        .map(
          (participant) =>
            participant.preferred_name ||
            participant.full_name
        )
        .join(" & ")
    : student.full_name;

  const contractNumber =
    contract.contract_number ||
    "To be confirmed";

  const agreementDate = formatDate(
    contract.agreement_date,
    "To be confirmed"
  );

  const acceptedByRelationshipValue =
    contract.accepted_by_relationship
      ?.trim()
      .toLowerCase() ?? null;

  const usesParentOrGuardianAcceptance =
    Boolean(
      contract.accepted_by_name &&
      (
        acceptedByRelationshipValue === "parent" ||
        acceptedByRelationshipValue === "guardian"
      )
    );

  const acceptedByName =
    contract.accepted_by_name ||
    "";

  const acceptedByRelationship =
    formatAcceptedByRelationship(
      contract.accepted_by_relationship
    );

  const startDate = formatDate(
    enrollment.start_date,
    "To be confirmed"
  );

  /* ---------------------------------------------------------------------- */
  /* PARTICIPANT SCHEDULES                                                   */
  /* ---------------------------------------------------------------------- */

  const participantSchedules: ParticipantSchedule[] =
    participants.map((participant) => {
      const participantRows =
        enrollmentSchedules.filter(
          (schedule) =>
            schedule.student_id ===
            participant.id
        );

      /*
       * For shared enrollments, schedules are participant-specific.
       *
       * For an individual enrollment, student_id may be null
       * on older rows, so use all rows as the fallback.
       */

      const usableRows =
        participantRows.length > 0
          ? participantRows
          : !isSharedEnrollment
            ? enrollmentSchedules
            : [];

      const schedule =
        getEnrollmentSchedule(
          usableRows,
          enrollment.schedule_days,
          enrollment.schedule_time
        );

      return {
        participant,
        schedule,
      };
    });

  /*
   * If no participant-specific schedules were found at all,
   * build one legacy schedule for the enrollment.
   */

  const hasAnyParticipantSchedule =
    participantSchedules.some(
      (item) => item.schedule.length > 0
    );

  if (
    !hasAnyParticipantSchedule &&
    enrollmentSchedules.length === 0
  ) {
    const fallbackSchedule =
      getEnrollmentSchedule(
        [],
        enrollment.schedule_days,
        enrollment.schedule_time
      );

    if (participantSchedules.length > 0) {
      participantSchedules[0] = {
        ...participantSchedules[0],
        schedule: fallbackSchedule,
      };
    }
  }

  /* ---------------------------------------------------------------------- */
  /* SCHEDULE SUMMARY                                                        */
  /* ---------------------------------------------------------------------- */

  /*
   * For individual contracts:
   *
   * Monday · Tuesday · Wednesday
   *
   * For shared contracts:
   *
   * Dasom: Monday · Tuesday · Wednesday
   * Bin: Monday · Wednesday · Friday
   */

  const scheduleDays = isSharedEnrollment
    ? participantSchedules
        .filter(
          (item) =>
            item.schedule.length > 0
        )
        .map((item) => {
          const name =
            item.participant.preferred_name ||
            item.participant.full_name;

          return `${name}: ${item.schedule
            .map(
              (schedule) =>
                schedule.day
            )
            .join(" · ")}`;
        })
        .join("  |  ")
    : participantSchedules[0]?.schedule
        .map((item) => item.day)
        .join(" · ") ||
      "To be confirmed";

  /*
   * Full compact schedule.
   *
   * Individual:
   * Monday (6:00 PM), Tuesday (11:30 AM)
   *
   * Shared:
   * Dasom — Monday (6:00 PM), Tuesday (11:30 AM)
   * Bin — Monday (10:30 PM), Wednesday (10:30 PM)
   */

  const scheduleText = isSharedEnrollment
    ? participantSchedules
        .filter(
          (item) =>
            item.schedule.length > 0
        )
        .map((item) => {
          const name =
            item.participant.preferred_name ||
            item.participant.full_name;

          return `${name} — ${item.schedule
            .map(
              (schedule) =>
                `${schedule.day} (${schedule.time})`
            )
            .join(", ")}`;
        })
        .join(" | ")
    : participantSchedules[0]?.schedule
        .map(
          (item) =>
            `${item.day} (${item.time})`
        )
        .join(", ") ||
      "To be confirmed";

  /* ---------------------------------------------------------------------- */
  /* TUITION                                                                 */
  /* ---------------------------------------------------------------------- */

  const currency =
    enrollment.currency || "KRW";

  const tuition =
    new Intl.NumberFormat("en-US").format(
      Number(
        enrollment.tuition_amount || 0
      )
    );

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#F3F3F1] text-[#222] print:min-h-0 print:bg-white">

      {/* ================================================================== */}
      {/* ADMIN NAVIGATION                                                    */}
      {/* ================================================================== */}

      <div className="w-full py-5 print:hidden">
        <div className="flex w-full items-center justify-between px-5 sm:px-8 lg:px-10">

          <Link
            href={`/${locale}/portal?view=enrollment&student=${student.id}`}
            className="
              inline-flex
              items-center
              gap-2
              font-sans
              text-[13px]
              text-[#555]
              hover:text-[#222]
            "
          >
            <ArrowLeft
              size={15}
              strokeWidth={1.5}
            />

            Back to Enrollment
          </Link>

          <PrintButton label={t.print} />

        </div>
      </div>

      {/* ================================================================== */}
      {/* A4 DOCUMENT                                                         */}
      {/* ================================================================== */}

      <div
        className="
          mx-auto
          w-full
          max-w-[794px]
          px-0
          pb-12
          print:max-w-none
          print:p-0
        "
      >
        <article
          className="
            bg-white
            px-[52px]
            py-[48px]
            shadow-[0_2px_12px_rgba(0,0,0,0.06)]
            print:shadow-none
            print:px-0
            print:py-0
          "
        >

          {/* ============================================================ */}
          {/* HEADER                                                        */}
          {/* ============================================================ */}

          <header className="contract-header border-b border-[#CFCFCB] pb-6">

            <div className="flex items-start justify-between gap-8">

              <div>

                <div
  className="
    font-serif
    text-[25px]
    leading-none
    tracking-[-0.02em]
    text-[#6F8F72]
  "
>
  Hamkke │ 함께
</div>

<p
  className="
    mt-2
    font-sans
    text-[9px]
    uppercase
    tracking-[0.16em]
    text-[#6F8F72]
  "
>
  From Small Talk to Big Ideas
</p>

              </div>

              <div className="text-right">

                <p
                  className="
                    font-sans
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.14em]
                    text-[#666]
                  "
                >
                  {t.privateLessons}
                </p>

                <p
                  className="
                    mt-1
                    font-serif
                    text-[17px]
                    leading-tight
                    text-[#222]
                  "
                >
                  {t.lessonAgreement}
                </p>

              </div>

            </div>

          </header>

          {/* ============================================================ */}
          {/* AGREEMENT INFORMATION                                         */}
          {/* ============================================================ */}

          <section className="contract-summary border-b border-[#CFCFCB] py-5">

            <div className="grid grid-cols-3">

              <SummaryItem
                label={
                  isSharedEnrollment
                    ? "Students"
                    : "Student"
                }
                value={studentName}
                className="
                  border-r
                  border-[#D5D5D1]
                  pr-6
                "
              />

              <SummaryItem
                label={t.contractNumber}
                value={contractNumber}
                className="
                  border-r
                  border-[#D5D5D1]
                  px-6
                "
              />

              <SummaryItem
                label={t.agreementDate}
                value={agreementDate}
                className="pl-6"
              />

            </div>

          </section>

          {/* ============================================================ */}
          {/* 01                                                             */}
          {/* ============================================================ */}

          <Section
            number="01"
            title={t.overview}
          >
            {body.overview.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </Section>

          {/* ============================================================ */}
          {/* 02                                                             */}
          {/* ============================================================ */}

          <Section
            number="02"
            title={t.enrollmentDetails}
          >

            <div className="detail-table">

              <DetailRow
                label={t.package}
                value={
                  enrollment.package_name ||
                  "To be confirmed"
                }
                strong
              />

              <DetailRow
                label={t.numberLessons}
                value={`${enrollment.number_of_lessons ?? 0} lessons`}
              />

              <DetailRow
                label={t.lessonDuration}
                value={`${enrollment.lesson_duration ?? 0} minutes`}
              />

              <DetailRow
                label={t.lessonsPerWeek}
                value={`${enrollment.lessons_per_week ?? 0}`}
              />

              <DetailRow
                label={t.startDate}
                value={startDate}
              />

              {isSharedEnrollment && (
                <DetailRow
                  label="Students"
                  value={participants
                    .map(
                      (participant) =>
                        participant.preferred_name ||
                        participant.full_name
                    )
                    .join(" & ")}
                />
              )}

              <DetailRow
                label={t.lessonDays}
                value={scheduleDays}
              />

              {/* ====================================================== */}
              {/* COMPACT PER-DAY LESSON SCHEDULE                        */}
              {/* ====================================================== */}

              <div
                className="
                  detail-row
                  grid
                  grid-cols-[155px_minmax(0,1fr)]
                  items-baseline
                  gap-6
                  py-2.5
                  border-b
                  border-[#E1E0DC]
                "
              >

                <p
                  className="
                    font-sans
                    text-[8.5px]
                    font-medium
                    uppercase
                    tracking-[0.11em]
                    text-[#666]
                  "
                >
                  {t.lessonSchedule}
                </p>

                <div
                  className="
                    space-y-1.5
                    font-serif
                    text-[13.5px]
                    leading-[1.5]
                    text-[#222]
                  "
                >
                  {isSharedEnrollment ? (
                    participantSchedules.some(
                      (item) =>
                        item.schedule.length > 0
                    ) ? (
                      participantSchedules.map(
                        (item) => {
                          const name =
                            item.participant
                              .preferred_name ||
                            item.participant
                              .full_name;

                          return (
                            <p
                              key={
                                item.participant.id
                              }
                            >
                              <span className="font-medium">
                                {name}:
                              </span>{" "}
                              {item.schedule.length >
                              0
                                ? item.schedule
                                    .map(
                                      (schedule) =>
                                        `${schedule.day} (${schedule.time})`
                                    )
                                    .join(", ")
                                : "To be confirmed"}
                            </p>
                          );
                        }
                      )
                    ) : (
                      <p>
                        {scheduleText}
                      </p>
                    )
                  ) : (
                    <p>
                      {scheduleText}
                    </p>
                  )}
                </div>

              </div>

              <DetailRow
                label={t.studentTimezone}
                value={
                  isSharedEnrollment
                    ? participants
                        .map(
                          (participant) =>
                            `${participant.preferred_name || participant.full_name}: ${
                              participant.timezone ||
                              "To be confirmed"
                            }`
                        )
                        .join(" | ")
                    : student.timezone ||
                      "To be confirmed"
                }
              />

              <DetailRow
                label={t.tuition}
                value={`${currency} ${tuition}`}
                strong
                last
              />

            </div>

          </Section>

          {/* ========================================================== */}
{/* 03                                                         */}
{/* ========================================================== */}

<Section
  number="03"
  title={t.tuitionPayment}
>
            {body.tuition.map((paragraph, index) => (
              <p key={index}>
                {paragraph.replace("{tuition}", `${currency} ${tuition}`)}
              </p>
            ))}
          </Section>

          {/* ============================================================ */}
          {/* 04                                                             */}
          {/* ============================================================ */}

          <Section
            number="04"
            title={t.cancellation}
          >
            <p>{body.cancellationIntro}</p>
            <div className="policy-table">
              {body.cancellationPolicies.map(([title, policyText], index) => (
                <Policy
                  key={title}
                  title={title}
                  text={policyText}
                  last={index === body.cancellationPolicies.length - 1}
                />
              ))}
            </div>
            <p>{body.cancellationEnd}</p>
          </Section>

          {/* ============================================================ */}
          {/* 05                                                             */}
          {/* ============================================================ */}

          <Section
            number="05"
            title={t.unexpected}
          >
            {body.unexpected.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </Section>

          {/* ============================================================ */}
          {/* 06                                                             */}
          {/* ============================================================ */}

          <Section
            number="06"
            title={t.lateArrivals}
          >
            {body.late.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </Section>

          {/* ============================================================ */}
          {/* 07                                                             */}
          {/* ============================================================ */}

          <Section
            number="07"
            title={t.teacherCancellations}
          >
            {body.teacherCancel.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </Section>

          {/* ============================================================ */}
          {/* 08                                                             */}
          {/* ============================================================ */}

          <Section
            number="08"
            title={t.repeatedCancellations}
          >
            {body.repeated.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </Section>

          {/* ============================================================ */}
          {/* 09                                                             */}
          {/* ============================================================ */}

          <Section
            number="09"
            title={t.refundsTransfers}
          >
            {body.refunds.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </Section>

          {/* ============================================================ */}
          {/* 10                                                             */}
          {/* ============================================================ */}

          <Section
            number="10"
            title={t.communication}
          >
            {body.communication.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </Section>

          {/* ============================================================ */}
          {/* 11                                                             */}
          {/* ============================================================ */}

          <Section
            number="11"
            title={t.acceptance}
          >
            {body.acceptance.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </Section>

          {/* ============================================================ */}
          {/* AGREEMENT RECORD                                               */}
          {/* ============================================================ */}

          <section className="agreement-record border-b border-[#CFCFCB] py-7">

            <div className="border border-[#C8C8C4]">

              <div className="border-b border-[#C8C8C4] px-5 py-4 text-center">

                <p
                  className="
                    font-sans
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.14em]
                    text-[#555]
                  "
                >
                  Digital Agreement
                </p>

                <h2
                  className="
                    mt-1.5
                    font-serif
                    text-[21px]
                    font-normal
                    text-[#222]
                  "
                >
                  Payment constitutes acceptance
                </h2>

                <p
                  className="
                    mt-1
                    font-sans
                    text-[11px]
                    text-[#666]
                  "
                >
                  of this {t.lessonAgreement}.
                </p>

              </div>

              {usesParentOrGuardianAcceptance ? (
                <div className="grid grid-cols-2">

                  <div className="border-r border-b border-[#C8C8C4] px-5 py-4">

                    <Info
                      label={
                        isSharedEnrollment
                          ? "Students"
                          : "Student"
                      }
                      value={studentName}
                    />

                  </div>

                  <div className="border-b border-[#C8C8C4] px-5 py-4">

                    <Info
                      label={t.acceptedBy}
                      value={acceptedByName}
                    />

                  </div>

                  <div className="border-r border-b border-[#C8C8C4] px-5 py-4">

                    <Info
                      label={t.contractNumber}
                      value={contractNumber}
                    />

                  </div>

                  <div className="border-b border-[#C8C8C4] px-5 py-4">

                    <Info
                      label={t.relationship}
                      value={acceptedByRelationship}
                    />

                  </div>

                  <div className="col-span-2 px-5 py-4">

                    <Info
                      label={t.agreementDate}
                      value={agreementDate}
                    />

                  </div>

                </div>
              ) : (
                <div className="grid grid-cols-3">

                  <div className="border-r border-[#C8C8C4] px-5 py-4">

                    <Info
                      label={
                        isSharedEnrollment
                          ? "Students"
                          : "Student"
                      }
                      value={studentName}
                    />

                  </div>

                  <div className="border-r border-[#C8C8C4] px-5 py-4">

                    <Info
                      label={t.contractNumber}
                      value={contractNumber}
                    />

                  </div>

                  <div className="px-5 py-4">

                    <Info
                      label={t.agreementDate}
                      value={agreementDate}
                    />

                  </div>

                </div>
              )}

            </div>

          </section>

          {/* ============================================================ */}
          {/* FOOTER                                                        */}
          {/* ============================================================ */}

          <footer className="pt-6 text-center">

            <div
              className="
                font-serif
                text-[18px]
                text-[#222]
              "
            >
              Hamkke │ 함께
            </div>

            <p
              className="
                mx-auto
                mt-3
                max-w-[570px]
                font-sans
                text-[9.5px]
                leading-[1.6]
                text-[#777]
              "
            >
              {t.footer1}
            </p>

            <p
              className="
                mt-1
                font-sans
                text-[9.5px]
                leading-[1.6]
                text-[#777]
              "
            >
              Thank you for respecting the time we've set aside for each conversation.
            </p>

          </footer>

        </article>
      </div>

      {/* ================================================================== */}
      {/* PRINT STYLES                                                        */}
      {/* ================================================================== */}

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm 17mm 16mm;
          }

          html,
          body {
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          main {
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          article {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
          }

          .contract-header {
            break-after: avoid;
            page-break-after: avoid;
          }

          .contract-summary {
            break-after: avoid;
            page-break-after: avoid;
          }

          .contract-section {
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
          }

          .contract-section > div:first-child {
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
          }

          .detail-table {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .detail-row {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .policy-table {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .policy-row {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .agreement-record {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          footer {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          h1,
          h2,
          h3 {
            break-after: avoid;
            page-break-after: avoid;
          }

          p {
            orphans: 3;
            widows: 3;
          }

          a {
            color: inherit !important;
            text-decoration: none !important;
          }
        }
      `}</style>

    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* SECTION                                                                    */
/* -------------------------------------------------------------------------- */

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="
        contract-section
        border-b
        border-[#CFCFCB]
        py-6
      "
    >

      <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">

        <div
          className="
            pt-[3px]
            font-sans
            text-[9px]
            font-medium
            tracking-[0.08em]
            text-[#555]
          "
        >
          {number}
        </div>

        <div>

          <h2
            className="
              font-serif
              text-[21px]
              font-normal
              leading-[1.2]
              tracking-[-0.015em]
              text-[#222]
            "
          >
            {title}
          </h2>

          <div
            className="
              mt-3.5
              space-y-3
              font-sans
              text-[12.5px]
              leading-[1.65]
              text-[#444]
            "
          >
            {children}
          </div>

        </div>

      </div>

    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* SUMMARY                                                                    */
/* -------------------------------------------------------------------------- */

function SummaryItem({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>

      <p
        className="
          font-sans
          text-[8.5px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#666]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          font-serif
          text-[16px]
          leading-[1.3]
          text-[#222]
        "
      >
        {value}
      </p>

    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DETAIL ROW                                                                 */
/* -------------------------------------------------------------------------- */

function DetailRow({
  label,
  value,
  strong = false,
  last = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`
        detail-row
        grid
        grid-cols-[155px_minmax(0,1fr)]
        items-baseline
        gap-6
        py-2.5
        ${!last ? "border-b border-[#E1E0DC]" : ""}
      `}
    >

      <p
        className="
          font-sans
          text-[8.5px]
          font-medium
          uppercase
          tracking-[0.11em]
          text-[#666]
        "
      >
        {label}
      </p>

      <p
        className={`
          font-serif
          leading-[1.3]
          text-[#222]
          ${strong ? "text-[15px]" : "text-[13.5px]"}
        `}
      >
        {value}
      </p>

    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* INFO                                                                       */
/* -------------------------------------------------------------------------- */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p
        className="
          font-sans
          text-[8.5px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#666]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          font-serif
          text-[15px]
          leading-[1.3]
          text-[#222]
        "
      >
        {value}
      </p>

    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* POLICY                                                                     */
/* -------------------------------------------------------------------------- */

function Policy({
  title,
  text,
  last = false,
}: {
  title: string;
  text: string;
  last?: boolean;
}) {
  return (
    <div
      className={`
        policy-row
        py-3
        ${!last ? "border-b border-[#E1E0DC]" : ""}
      `}
    >

      <div className="grid grid-cols-[155px_minmax(0,1fr)] gap-6">

        <p
          className="
            font-sans
            text-[9px]
            font-medium
            uppercase
            tracking-[0.09em]
            text-[#444]
          "
        >
          {title}
        </p>

        <p
          className="
            font-sans
            text-[12px]
            leading-[1.6]
            text-[#555]
          "
        >
          {text}
        </p>

      </div>

    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SCHEDULE                                                                   */
/* -------------------------------------------------------------------------- */

function getEnrollmentSchedule(
  schedules: EnrollmentSchedule[],
  scheduleDays: unknown,
  scheduleTime: string | null | undefined
): ScheduleItem[] {

  /*
   * PRIMARY SOURCE:
   *
   * enrollment_schedules
   */

  if (schedules.length > 0) {
    return [...schedules]
      .sort((a, b) => {

        const dayDifference =
          Number(a.day_of_week) -
          Number(b.day_of_week);

        if (dayDifference !== 0) {
          return dayDifference;
        }

        return String(
          a.schedule_time ?? ""
        ).localeCompare(
          String(
            b.schedule_time ?? ""
          )
        );
      })
      .map((schedule) => ({
        day:
          DAY_LABELS[
            Number(schedule.day_of_week)
          ] ??
          `Day ${schedule.day_of_week}`,

        time: formatTime(
          schedule.schedule_time
        ),
      }));
  }

  /*
   * FALLBACK:
   *
   * Older enrollments may not have rows in
   * enrollment_schedules.
   */

  const fallbackDays =
    normalizeScheduleDays(scheduleDays);

  if (
    fallbackDays.length > 0 &&
    scheduleTime
  ) {
    return fallbackDays.map(
      (day) => ({
        day,
        time: formatTime(
          scheduleTime
        ),
      })
    );
  }

  /*
   * FINAL FALLBACK:
   */

  if (scheduleTime) {
    return [
      {
        day: "Time",
        time: formatTime(
          scheduleTime
        ),
      },
    ];
  }

  return [];
}

/* -------------------------------------------------------------------------- */
/* NORMALIZE SCHEDULE DAYS                                                    */
/* -------------------------------------------------------------------------- */

function normalizeScheduleDays(
  value: unknown
): string[] {

  if (!Array.isArray(value)) {
    return [];
  }

  const dayNames: Record<
    string,
    string
  > = {

    sun: "Sunday",
    sunday: "Sunday",

    mon: "Monday",
    monday: "Monday",

    tue: "Tuesday",
    tues: "Tuesday",
    tuesday: "Tuesday",

    wed: "Wednesday",
    wednesday: "Wednesday",

    thu: "Thursday",
    thurs: "Thursday",
    thursday: "Thursday",

    fri: "Friday",
    friday: "Friday",

    sat: "Saturday",
    saturday: "Saturday",
  };

  return value
    .flatMap((day) =>
      String(day)
        .replace(/Â·/g, "·")
        .split("·")
        .map((part) =>
          part.trim()
        )
        .filter(Boolean)
    )
    .map((day) => {

      const normalized =
        day
          .toLowerCase()
          .trim();

      /*
       * Support numeric PostgreSQL-style
       * day values as well.
       */

      if (
        normalized !== "" &&
        !Number.isNaN(
          Number(normalized)
        )
      ) {

        const numericDay =
          Number(normalized);

        return (
          DAY_LABELS[
            numericDay
          ] ?? day
        );
      }

      return (
        dayNames[
          normalized
        ] ?? day
      );
    })
    .filter(
      (day, index, array) =>
        array.indexOf(day) === index
    );
}

/* -------------------------------------------------------------------------- */
/* ACCEPTANCE RELATIONSHIP                                                    */
/* -------------------------------------------------------------------------- */

function formatAcceptedByRelationship(
  value: string | null | undefined
): string {
  const normalized =
    value?.trim().toLowerCase();

  const labels: Record<string, string> = {
    self: "Self",
    parent: "Parent",
    guardian: "Guardian",
  };

  return normalized
    ? labels[normalized] ?? value ?? "To be confirmed"
    : "To be confirmed";
}

/* -------------------------------------------------------------------------- */
/* DATE FORMAT                                                                */
/* -------------------------------------------------------------------------- */

function formatDate(
  value:
    | string
    | null
    | undefined,
  fallback = "Not set"
): string {

  if (!value) {
    return fallback;
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return fallback;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}

/* -------------------------------------------------------------------------- */
/* TIME FORMAT                                                                */
/* -------------------------------------------------------------------------- */

function formatTime(
  value:
    | string
    | null
    | undefined
): string {

  if (!value) {
    return "To be confirmed";
  }

  /*
   * PostgreSQL TIME values normally arrive as:
   *
   * 18:00:00
   * 11:30:00
   *
   * This also accepts:
   *
   * 18:00
   * 11:30
   */

  const match =
    /^(\d{1,2}):(\d{2})/.exec(
      String(value).trim()
    );

  if (!match) {
    return String(value);
  }

  const hours =
    Number(match[1]);

  const minutes =
    Number(match[2]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return String(value);
  }

  const suffix =
    hours >= 12
      ? "PM"
      : "AM";

  const hour12 =
    hours % 12 || 12;

  return `${hour12}:${String(
    minutes
  ).padStart(2, "0")} ${suffix}`;
}