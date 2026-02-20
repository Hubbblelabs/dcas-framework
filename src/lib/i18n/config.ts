export const SUPPORTED_LANGUAGES = [
  "en", // English (base)
  "hi", // Hindi
  "pa", // Punjabi
  "gu", // Gujarati
  "ta", // Tamil
  "te", // Telugu
  "ml", // Malayalam
  "mr", // Marathi
  "bn", // Bengali
  "kn", // Kannada
  "or", // Odia
  "as", // Assamese
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: "English",
  hi: "Hindi",
  pa: "Punjabi",
  gu: "Gujarati",
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam",
  mr: "Marathi",
  bn: "Bengali",
  kn: "Kannada",
  or: "Odia",
  as: "Assamese",
};

export const DEFAULT_LANGUAGE: LanguageCode = "en";

