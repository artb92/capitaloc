import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Lang, type Messages, messages } from "./messages";

const browserLang = (): Lang =>
  typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("fr")
    ? "fr"
    : "en";

type LangState = { lang: Lang; setLang: (lang: Lang) => void };

export const useLang = create<LangState>()(
  persist((set) => ({ lang: browserLang(), setLang: (lang) => set({ lang }) }), {
    name: "capitaloc:lang",
  }),
);

export function useI18n(): { lang: Lang; t: Messages } {
  const lang = useLang((s) => s.lang);
  return { lang, t: messages[lang] };
}
