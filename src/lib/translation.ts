import type { IQuestion, IQuestionOption } from "@/lib/models/Question";
import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
  SUPPORTED_LANGUAGES,
} from "@/lib/i18n/config";

type QuestionLike = Pick<IQuestion, "text" | "options"> & {
  translations?: QuestionTranslations;
  _id?: string;
};

type QuestionOptionLike = IQuestionOption;

export type QuestionTranslations = {
  [lang in LanguageCode]?: {
    text: string;
    options: Pick<QuestionOptionLike, "label" | "text">[];
    updatedAt: Date;
  };
};

type CachedTranslation = {
  text: string;
  options: Pick<QuestionOptionLike, "label" | "text">[];
  updatedAt: Date;
};

const translationCache = new Map<string, CachedTranslation>();

function buildCacheKey(
  question: QuestionLike,
  targetLang: LanguageCode,
): string {
  const baseId = question._id ?? `${question.text}-${question.options.length}`;
  return `${baseId}:${targetLang}`;
}

async function callExternalTranslationAPI(
  texts: string[],
  targetLang: LanguageCode,
): Promise<string[]> {
  if (texts.length === 0 || targetLang === DEFAULT_LANGUAGE) {
    return texts;
  }

  const apiUrl = process.env.TRANSLATION_API_URL;
  const apiKey = process.env.TRANSLATION_API_KEY;

  if (!apiUrl || !apiKey) {
    // Translation API not configured - return original texts
    // In production, you should configure TRANSLATION_API_URL and TRANSLATION_API_KEY
    console.warn(
      `Translation API not configured. Questions will be shown in English. To enable translations, set TRANSLATION_API_URL and TRANSLATION_API_KEY environment variables.`,
    );
    return texts;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        targetLang,
        texts,
      }),
    });

    if (!response.ok) {
      return texts;
    }

    const data = (await response.json()) as { translations?: string[] };
    if (!data.translations || data.translations.length !== texts.length) {
      return texts;
    }

    return data.translations;
  } catch {
    return texts;
  }
}

export async function translateQuestion<T extends QuestionLike>(
  question: T,
  targetLang: LanguageCode,
): Promise<T> {
  if (!SUPPORTED_LANGUAGES.includes(targetLang) || targetLang === "en") {
    return question;
  }

  const cacheKey = buildCacheKey(question, targetLang);
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return {
      ...question,
      text: cached.text,
      options: question.options.map((opt) => {
        const translatedOption = cached.options.find(
          (o) => o.label === opt.label,
        );
        return {
          ...opt,
          text: translatedOption?.text ?? opt.text,
        };
      }),
    };
  }

  const existing = question.translations?.[targetLang];
  if (existing) {
    return {
      ...question,
      text: existing.text,
      options: question.options.map((opt) => {
        const translatedOption = existing.options.find(
          (o) => o.label === opt.label,
        );
        return {
          ...opt,
          text: translatedOption?.text ?? opt.text,
        };
      }),
    };
  }

  const baseTexts = [
    question.text,
    ...question.options.map((opt) => opt.text),
  ];

  const translatedTexts = await callExternalTranslationAPI(
    baseTexts,
    targetLang,
  );

  const [translatedQuestionText, ...translatedOptionTexts] = translatedTexts;

  const translated = {
    text: translatedQuestionText,
    options: question.options.map((opt, index) => ({
      label: opt.label,
      text: translatedOptionTexts[index] ?? opt.text,
    })),
    updatedAt: new Date(),
  };

  translationCache.set(cacheKey, translated);

  return {
    ...question,
    text: translated.text,
    options: question.options.map((opt, index) => ({
      ...opt,
      text: translated.options[index]?.text ?? opt.text,
    })),
    translations: {
      ...(question.translations ?? {}),
      [targetLang]: translated,
    },
  };
}

