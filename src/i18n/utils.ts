import { i18n, type Locale } from './config';
import ja from './locales/ja.json';
import en from './locales/en.json';
import zh from './locales/zh.json';

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/');
  const firstSegment = segments[1];

  if (i18n.locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }

  return i18n.defaultLocale;
}

const dictionaries = {
  ja,
  en,
  zh,
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
