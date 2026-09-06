export const TEACHER_AGREEMENT_VERSION = "1.1";

export const TEACHER_AGREEMENT_TITLE = "Teacher Agreement";

export type TeacherAgreementSection = {
  number: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  important?: boolean;
};

export const TEACHER_AGREEMENT_SECTIONS: TeacherAgreementSection[] = [
  {
    number: "01",
    title: "Agreement Overview",
    paragraphs: [
      "This Teacher Agreement sets out the terms, responsibilities, expectations, and policies applicable to teachers providing English lessons through Hamkke English.",
      "By accepting this agreement, the teacher confirms that they have read, understood, and agreed to follow the terms of this agreement and the applicable policies of Hamkke English.",
    ],
  },

  {
    number: "02",
    title: "Teacher Responsibilities",
    paragraphs: [
      "Teachers are expected to conduct every lesson in a professional, respectful, and prepared manner.",
    ],
    bullets: [
      "Arrive on time and be ready to teach at the scheduled lesson time.",
      "Follow the assigned lesson schedule and lesson duration.",
      "Maintain accurate attendance and lesson records.",
      "Communicate promptly when an issue may affect a scheduled lesson.",
      "Treat students respectfully and maintain appropriate professional boundaries.",
      "Provide a consistent and constructive learning environment.",
    ],
  },

  {
    number: "03",
    title: "Schedule & Availability",
    paragraphs: [
      "Once a lesson schedule has been assigned and accepted, the scheduled time is considered reserved for the assigned Hamkke student.",
      "Teachers are responsible for maintaining accurate availability and should not accept conflicting commitments that may interfere with assigned Hamkke lessons.",
    ],
    bullets: [
      "Keep availability information accurate and up to date.",
      "Notify Hamkke as soon as possible if regular availability changes.",
      "Avoid accepting other commitments that conflict with assigned Hamkke lessons.",
      "Honor confirmed lesson schedules unless a cancellation or change is properly communicated.",
    ],
  },

  {
    number: "04",
    title: "Compensation & Payroll",
    paragraphs: [
      "Teacher compensation is based on completed lessons and the applicable teacher rate at the time the lesson is completed.",
      "The standard starting rate is ₱125 for a 25-minute lesson and ₱250 for a 50-minute lesson.",
      "Teacher compensation increases by ₱25 per 50-minute lesson every six (6) months of continuous teaching service. The 25-minute lesson rate increases proportionally.",
    ],
    bullets: [
      "0–less than 6 months: ₱250 per 50-minute lesson / ₱125 per 25-minute lesson.",
      "6–less than 12 months: ₱275 per 50-minute lesson / ₱137.50 per 25-minute lesson.",
      "12–less than 18 months: ₱300 per 50-minute lesson / ₱150 per 25-minute lesson.",
      "The same six-month progression applies thereafter.",
      "Payroll periods run from the 1st through the 15th and from the 16th through the last day of each month.",
      "Only lessons properly recorded in the Hamkke system and eligible for payment are included in payroll.",
    ],
    important: true,
  },

  {
    number: "05",
    title: "Attendance & Lesson Records",
    paragraphs: [
      "Teachers are responsible for recording lesson attendance and lesson status accurately and promptly.",
    ],
    bullets: [
      "Completed lessons must be recorded accurately.",
      "Student no-shows and qualifying late cancellations may be recorded as payable according to Hamkke policy.",
      "Teacher cancellations are generally not payable unless otherwise approved by Hamkke.",
      "Attendance records should be entered promptly and before the applicable payroll period is finalized.",
      "Teachers must not intentionally alter, falsify, or misrepresent attendance or lesson records.",
    ],
  },

  {
    number: "06",
    title: "Cancellations & Changes",
    paragraphs: [
      "Teachers are expected to honor confirmed schedules and avoid unnecessary cancellations.",
      "When an unavoidable cancellation or schedule issue occurs, the teacher must notify Hamkke as soon as reasonably possible.",
    ],
    bullets: [
      "Emergency situations should be communicated as soon as possible.",
      "Repeated or avoidable cancellations may be reviewed by Hamkke.",
      "Teachers should cooperate with reasonable efforts to maintain lesson continuity.",
      "Schedule changes should not be arranged directly with students outside the approved Hamkke process.",
    ],
  },

  {
    number: "07",
    title: "Student Communication & Professional Boundaries",
    paragraphs: [
      "Teachers must maintain respectful, professional, and appropriate communication with Hamkke students at all times.",
      "Teachers should maintain reasonable professional boundaries and must not use student contact information for purposes unrelated to Hamkke teaching.",
    ],
    bullets: [
      "Do not engage in inappropriate, abusive, threatening, or discriminatory communication.",
      "Do not request or use a student's personal contact information for unrelated purposes.",
      "Do not pressure, manipulate, or encourage students to leave Hamkke.",
      "Do not independently solicit, recruit, invite, encourage, redirect, or otherwise attempt to move any Hamkke student to private lessons outside Hamkke without prior written approval from Hamkke.",
      "Do not arrange private teaching relationships with Hamkke students using information, contact details, relationships, or opportunities obtained through Hamkke.",
      "This restriction applies during the teacher's active relationship with Hamkke and after the teacher stops teaching through Hamkke.",
    ],
    important: true,
  },

  {
    number: "08",
    title: "Confidentiality",
    paragraphs: [
      "Teachers may have access to confidential information relating to Hamkke, its students, families, operations, materials, schedules, and records.",
      "Such information must be treated as confidential and used only for legitimate teaching or Hamkke-related purposes.",
    ],
    bullets: [
      "Do not share student information with unauthorized persons.",
      "Do not copy, distribute, or disclose confidential Hamkke records.",
      "Do not use confidential student or business information for personal or competing business purposes.",
      "Confidentiality obligations continue after the teacher's relationship with Hamkke ends.",
    ],
  },

  {
    number: "09",
    title: "Teaching Materials & Intellectual Property",
    paragraphs: [
      "Materials provided or created by Hamkke for its teaching operations remain subject to applicable intellectual property rights.",
    ],
    bullets: [
      "Do not redistribute, sell, publish, or commercially share Hamkke materials without permission.",
      "Do not represent Hamkke-owned materials as independently owned materials.",
      "Respect the intellectual property rights of Hamkke, its students, teachers, and third-party material providers.",
    ],
  },

  {
    number: "10",
    title: "Ending the Teacher Relationship",
    paragraphs: [
      "Either the teacher or Hamkke may end the teaching relationship, subject to applicable law and the terms of this agreement.",
      "When reasonably possible, advance notice should be provided to allow Hamkke to arrange a proper transition.",
      "Teachers are expected to cooperate with reasonable handover procedures for assigned students, schedules, records, and other teaching responsibilities.",
    ],
    bullets: [
      "Hamkke may end the teacher relationship immediately in cases involving serious misconduct.",
      "Immediate termination may apply to repeated or major unreliability, inappropriate treatment of students, serious confidentiality concerns, falsification of records, or other serious breaches of this agreement.",
      "Unauthorized solicitation, recruitment, or movement of Hamkke students to private lessons is a serious breach and may result in immediate termination without further notice.",
      "Where permitted by applicable law, unpaid compensation connected to an affected student, affected lessons, or an affected payroll period may be withheld or forfeited when the teacher has materially breached this agreement.",
      "Termination does not erase historical attendance, payroll, assignment, contract, or other administrative records.",
    ],
    important: true,
  },

  {
    number: "11",
    title: "Agreement & Digital Acceptance",
    paragraphs: [
      "By digitally accepting this agreement, the teacher confirms that they have had an opportunity to read and understand the agreement and agree to comply with its terms.",
      "The teacher may request clarification from Hamkke before accepting the agreement.",
      "Digital acceptance may be recorded electronically together with the applicable acceptance date and related technical information.",
    ],
    important: true,
  },
];

export const TEACHER_AGREEMENT_ACCEPTANCE_FIELDS = [
  "Teacher",
  "Teacher No.",
  "Signature / Digital Acceptance",
  "Date",
  "Hamkke Representative",
  "Date",
] as const;