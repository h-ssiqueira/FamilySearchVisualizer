import { useState, type FormEvent } from 'react';
import { tokenStore } from '@/auth';
import { useT } from '@/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export function LoginScreen({ onSignIn }: { onSignIn: () => void }) {
  const t = useT();
  const [accessToken, setAccessToken] = useState('');
  const [empty, setEmpty] = useState(false);

  function handleTokenSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    // People often copy the whole header value: accept it with or without the Bearer prefix.
    const cleaned = accessToken.replace(/^\s*bearer\s+/i, '');
    if (!tokenStore.set(cleaned)) {
      setEmpty(true);
      return;
    }
    setAccessToken('');
    setEmpty(false);
  }

  return (
    <main className="screen">
      <LanguageSwitcher />

      <h1>{t('login.heading')}</h1>
      <p>{t('login.description')}</p>

      <button type="button" className="button" onClick={onSignIn}>
        {t('login.button')}
      </button>

      <p className="notice">{t('login.privacy')}</p>

      <section className="manual-login">
        <h2>{t('login.manual.heading')}</h2>
        <p>{t('login.manual.description')}</p>
        <details>
          <summary>{t('login.manual.helpSummary')}</summary>
          <p className="notice">{t('login.manual.help')}</p>
        </details>

        <form onSubmit={handleTokenSubmit}>
          <label htmlFor="access-token">{t('login.manual.label')}</label>
          <input
            id="access-token"
            name="accessToken"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={accessToken}
            onChange={(event) => {
              setAccessToken(event.target.value);
              setEmpty(false);
            }}
            placeholder={t('login.manual.placeholder')}
            required
          />

          <button type="submit" className="button">
            {t('login.manual.submit')}
          </button>

          {empty ? (
            <p className="notice" role="alert">
              {t('login.manual.empty')}
            </p>
          ) : null}
        </form>
      </section>
    </main>
  );
}
