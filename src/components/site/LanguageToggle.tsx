import { useLanguage } from "@/i18n/LanguageProvider";

export const LanguageToggle = () => {
  const { locale, toggleLocale } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-200 hover:border-zinc-500"
      aria-label={locale === "en" ? "Switch to French" : "Passer en anglais"}
    >
      {locale === "en" ? "EN / FR" : "FR / EN"}
    </button>
  );
};
