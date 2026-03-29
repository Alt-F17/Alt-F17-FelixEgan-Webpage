import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { enMessages } from "@/i18n/messages/en";
import { frMessages } from "@/i18n/messages/fr";
import type { AppMessages, Locale } from "@/i18n/types";
import { trackEvent } from "@/lib/plausible";

type LanguageContextValue = {
  locale: Locale;
  messages: AppMessages;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
};

const STORAGE_KEY = "site_locale";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const detectInitialLocale = (): Locale => {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "fr") {
    return saved;
  }

  const browserLocale = window.navigator.language.toLowerCase();
  return browserLocale.startsWith("fr") ? "fr" : "en";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(detectInitialLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    trackEvent("language_switch", { locale: next });
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "fr" : "en");
  }, [locale, setLocale]);

  const messages = useMemo(() => (locale === "fr" ? frMessages : enMessages), [locale]);

  const value = useMemo(
    () => ({ locale, messages, setLocale, toggleLocale }),
    [locale, messages, setLocale, toggleLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
};
