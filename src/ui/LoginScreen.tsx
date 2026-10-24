
import { useState, type FormEvent } from 'react';
import { useT } from '@/i18n';
import { tokenStore } from '@/auth/tokenStore';
import { LanguageSwitcher } from './LanguageSwitcher';

export function LoginScreen({ onSignIn }: { onSignIn: () => void }) {
  const t = useT();
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState('');

  function handleTokenSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tokenStore.set(accessToken)) {
      setError('Please enter an access token.');
      return;
    }

    setAccessToken('');
    setError('');
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
        <h2>Use an existing access token</h2>
        <p>Enter a valid FamilySearch access token to continue.</p>

        <form onSubmit={handleTokenSubmit}>
          <label htmlFor="access-token">Access token</label>
          <input
            id="access-token"
            name="accessToken"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={accessToken}
            onChange={(event) => {
              setAccessToken(event.target.value);
              setError('');
            }}
            placeholder="Paste your access token"
            required
          />

          <button type="submit" className="button">
            Continue with token
          </button>

          {error && (
            <p className="notice" role="alert">
              {error}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
