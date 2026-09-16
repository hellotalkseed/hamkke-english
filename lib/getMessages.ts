import en from "../messages/en";
import ko from "../messages/ko";
import zh from "../messages/zh";
import ja from "../messages/ja";

import type { Locale } from "./i18n";

const messages = {
  en,
  ko,
  zh,
  ja,
};

export function getMessages(locale: Locale) {
  return messages[locale];
}