import { useT } from '@/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export function LoginScreen({ onSignIn }: { onSignIn: () => void }) {
  const t = useT();
  return (
    <main className="screen">
      <LanguageSwitcher />
      <h1>{t('login.heading')}</h1>
      <p>{t('login.description')}</p>
      <button type="button" className="button" onClick={onSignIn}>
        {t('login.button')}
      </button>
      <p className="notice">{t('login.privacy')}</p>
    </main>
  );
}
