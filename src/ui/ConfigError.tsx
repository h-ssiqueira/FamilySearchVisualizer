import { useT } from '@/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export function ConfigError({ missing }: { missing: string[] }) {
  const t = useT();
  return (
    <main className="screen">
      <LanguageSwitcher />
      <h1>{t('config.heading')}</h1>
      <p>{t('config.body')}</p>
      <ul>
        {missing.map((name) => (
          <li key={name}>
            <code>{name}</code>
          </li>
        ))}
      </ul>
      <p>{t('config.hint')}</p>
    </main>
  );
}
