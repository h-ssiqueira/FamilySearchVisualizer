import { SUPPORTED_LOCALES, matchLocale, setLocale, useLocale, useT } from '@/i18n';

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useT();
  return (
    <label className="language-switcher">
      <span>{t('language.label')}</span>
      <select
        value={locale}
        onChange={(event) => {
          const next = matchLocale(event.target.value);
          if (next) setLocale(next);
        }}
      >
        {SUPPORTED_LOCALES.map((option) => (
          <option key={option} value={option}>
            {t(`language.${option}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
