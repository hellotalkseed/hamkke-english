const originalSections = [
  ["Package details", { period: "Term covered", level: "CEFR level", book: "Book used" }],
  ["Attendance and participation", { attendance: "Attendance", participation: "Class participation", initiative: "Speaking initiative" }],
  ["Speaking", { speakingRating: "Current performance", speaking: "Comments and examples" }],
  ["Listening", { listeningRating: "Current performance", listening: "Comments and examples" }],
  ["Reading", { readingRating: "Current performance", reading: "Comments and examples" }],
  ["Writing", { writingRating: "Current performance", writing: "Comments and examples" }],
  ["Looking ahead", { strengths: "Strengths", goals: "What we’ll work on next", comment: "Teacher’s comment" }],
] as const;

const conversationSections = [
  ["Package details", { period: "Term covered", level: "CEFR level", book: "Materials used" }],
  ["Attendance and participation", { attendance: "Attendance", participation: "Class participation", initiative: "Speaking initiative" }],
  ["Conversation skills", {
    comprehension: "Listening and responding",
    interaction: "Starting and sustaining a conversation",
    expression: "Expressing and developing ideas",
    language: "Vocabulary and grammar in conversation",
    clarity: "Fluency and pronunciation",
  }],
  ["Term review", { strengths: "Progress observed this term", goals: "Priorities for the next package", comment: "Teacher’s comment" }],
] as const;

export const newConversationTerm = { format: "conversation-v1" };

export function sectionsFor(data: TermAssessment) {
  return data.format === newConversationTerm.format ? conversationSections : originalSections;
}

export const observationPrompts: Record<string, string> = {
  comprehension: "How independently does the learner understand a question and respond to what was said?",
  interaction: "Describe a time the learner asked a follow-up question, took a turn, or asked for clarification.",
  expression: "How does the learner explain a preference, add a reason, or tell a short story?",
  language: "Which words or sentence patterns does the learner now use in spontaneous speech?",
  clarity: "How easily can you follow the learner’s speech? Consider pacing, word stress, and intelligibility.",
  strengths: "Describe one change since the beginning of this package and a moment when you noticed it.",
  goals: "Identify one or two speaking goals and how you will practise them together.",
};

export type TermAssessment = Partial<Record<string, string>>;

// Only known report fields travel between the editor, database and family view.
export function readTerm(value: unknown): TermAssessment | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const result: TermAssessment = {};
  if (input.format === newConversationTerm.format) result.format = newConversationTerm.format;
  for (const [, fields] of sectionsFor(result)) {
    for (const key of Object.keys(fields)) {
      const entry = input[key];
      if (typeof entry === "string" && entry.trim()) result[key] = entry.trim();
    }
  }
  if(result.format) for(const key of ["studentName","packageName"]) if(typeof input[key]==="string") result[key]=input[key].trim();
  if (result.format && isFamilyLanguage(input.familyLanguage)) {
    result.familyLanguage = input.familyLanguage;
    const fields = translationFields(result);
    if (matchesTranslation(input.sourceSnapshot, fields)) {
      result.sourceSnapshot = JSON.stringify(fields);
      for (const key of Object.keys(fields)) {
        const text = input["translated_"+key];
        if (typeof text === "string") result["translated_"+key] = text.trim();
      }
    }
  }
  return result;
}

export const familyLanguages = { ko: "한국어", ja: "日本語", zh: "简体中文" } as const;
export type FamilyLanguage = keyof typeof familyLanguages;
export function isFamilyLanguage(value: unknown): value is FamilyLanguage {
  return value === "ko" || value === "ja" || value === "zh";
}
export function englishFields(data: TermAssessment) {
  const fields: Record<string,string> = {};
  for (const [,group] of sectionsFor(data)) {
    for (const key of Object.keys(group)) {
      if (data[key]?.trim()) fields[key] = data[key]!.trim();
    }
  }
  return fields;
}
export function translationFields(data: TermAssessment) {
  const fields = englishFields(data);
  delete fields.period;
  delete fields.level;
  delete fields.book;
  return fields;
}

// Older reviews snapshot package details along with the feedback.
export function matchesTranslation(snapshot: unknown, fields: Record<string,string>) {
  if (typeof snapshot !== "string") return false;
  try {
    const saved = JSON.parse(snapshot);
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return false;
    const keys = Object.keys(saved).filter(key => !["period","level","book"].includes(key));
    return keys.length === Object.keys(fields).length && keys.every(key => saved[key] === fields[key]);
  } catch { return false; }
}

export function hasTranslation(data: TermAssessment) {
  const fields = translationFields(data);
  return isFamilyLanguage(data.familyLanguage) && Object.keys(fields).length > 0 &&
    matchesTranslation(data.sourceSnapshot, fields) &&
    Object.keys(fields).every(key => data["translated_"+key]?.trim());
}

export const reportChoices: Record<string, readonly string[]> = {
  level: ["Pre-A1","A1","A1+","A2","A2+","B1","B1+","B2","B2+","C1","C2"],
  attendance: ["Excellent","Regular","Occasional absences","Frequent absences"],
  participation: ["Actively participates","Usually participates","Participates with prompting","Rarely participates"],
  initiative: ["Often starts conversations","Sometimes initiates","Usually responds when invited","Needs encouragement to speak"],
};

export const rephraseFields = new Set([
  "comprehension","interaction","expression","language","clarity","strengths","goals","comment",
  "speaking","listening","reading","writing","communication_expression","speaking_interaction",
  "vocabulary_expression_range","grammar_sentence_building","pronunciation_clarity",
  "confidence_participation","overall_progress","next_focus","teacher_note","working_notes",
]);
