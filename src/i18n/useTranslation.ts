import { useAuthStore } from '../store/authStore';
import { translations, TranslationKey, Language } from './translations';

export const useTranslation = () => {
  const user = useAuthStore((state) => state.user);
  const lang: Language = user?.preferences?.language === 'uk' ? 'uk' : 'en';

  const t = (key: TranslationKey | string, fallback?: string): string => {
    // If we have strict types, we can use TranslationKey
    const dictionary = translations[lang] as Record<string, string>;
    if (dictionary[key]) {
      return dictionary[key];
    }
    // Fallback to english if missing in uk
    const enDictionary = translations['en'] as Record<string, string>;
    if (enDictionary[key]) {
      return enDictionary[key];
    }
    return fallback || key;
  };

  return { t, lang };
};
