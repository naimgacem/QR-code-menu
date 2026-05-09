"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LANG,
  LANG_DIR,
  SUPPORTED_LANGS,
  t as translate,
  type Lang,
  type MessageKey,
} from "@/lib/i18n";

const STORAGE_KEY = "deb-lang";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  dir: "ltr" | "rtl";
  t: (key: MessageKey, r?: Record<string, string | number>) => string;
};

const LangContext = createContext<Ctx | null>(null);

const isLang = (v: string | null): v is Lang =>
  v !== null && (SUPPORTED_LANGS as readonly string[]).includes(v);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    // Always default to French. Only honor an explicit user choice
    // saved via the language picker — never auto-detect from the
    // browser locale.
    let chosen: Lang = DEFAULT_LANG;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLang(stored)) chosen = stored;
    } catch {
      // localStorage may be unavailable in private mode
    }
    setLangState(chosen);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANG_DIR[lang];
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      dir: LANG_DIR[lang],
      t: (key, r) => translate(lang, key, r),
    }),
    [lang, setLang]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LanguageProvider>");
  return ctx;
}

export function useT() {
  return useLang().t;
}
