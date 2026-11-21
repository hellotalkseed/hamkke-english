import type { FamilyLanguage } from "./termAssessment";
const headings:Record<string,[string,string,string]> = {
  "End-of-Term Conversation Report":["학기말 영어 회화 보고서","英会話コース修了レポート","英语会话课程总结"],
  "Term covered":["평가 기간","対象期間","评估时段"],
  "Teacher":["담당 선생님","担当講師","授课老师"],
  "Lesson package":["수강 과정","受講コース","课程套餐"],"CEFR level":["CEFR 수준","CEFRレベル","CEFR 等级"],"Materials":["수업 교재","使用教材","使用教材"],
  "Progress this term":["이번 과정에서의 성장","今回のコースでの成長","本期学习进步"],
  "Conversation skills":["영어 회화 능력","会話力","会话能力"],
  "Listening and responding":["듣고 대답하기","聞いて答える力","听懂并回应"],
  "Conversation and turn-taking":["대화 주고받기","会話のやり取り","互动与接话"],
  "Expressing ideas":["생각 표현하기","考えを伝える力","表达想法"],
  "Vocabulary and grammar":["어휘와 문법","語彙と文法","词汇与语法"],
  "Fluency and pronunciation":["유창성과 발음","流暢さと発音","流利度与发音"],
  "Attendance":["출석","出席状況","出勤情况"],"Participation":["수업 참여","授業への参加","课堂参与"],
  "Speaking initiative":["자발적인 발화","発言の積極性","主动表达"],
  "Next package goals":["다음 과정의 목표","次のコースの目標","下一期的学习目标"],
  "Teacher’s comment":["선생님의 한마디","講師からのひとこと","老师寄语"],
};
export function familyLabel(text:string,language?:FamilyLanguage) {
  return language ? headings[text]?.[{ko:0,ja:1,zh:2}[language]] ?? text : text;
}
