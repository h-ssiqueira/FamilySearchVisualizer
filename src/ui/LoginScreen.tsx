import { fireEvent, render, screen } from '@testing-library/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { tokenStore } from '@/auth';
import { useT } from '@/i18n';
import { bookmarkletHref } from '@/relay/bookmarklet';
import { relayStore, useRelayState } from '@/relay/relayStore';
import { LanguageSwitcher } from './LanguageSwitcher';

const FAMILYSEARCH_HOME = 'https://www.familysearch.org/';

/** The bookmarklet is set after render: React would refuse a `javascript:` URL in an attribute. */
function BookmarkletLink({ label }: { label: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    ref.current?.setAttribute('href', bookmarkletHref());
  }, []);
  return (
    <a ref={ref} className="bookmarklet" href={FAMILYSEARCH_HOME}>
      {label}
    </a>
  );
}

function RelaySection() {
  const t = useT();
  const relay = useRelayState();
  const connecting = relay.status === 'connecting';

  return (
    <section className="relay-login">
      <h2>{t('login.relay.heading')}</h2>
      <p>{t('login.relay.description')}</p>
      {connecting ? (
        <>
          <p role="status" className="notice">
            {t('login.relay.waiting')}
          </p>
          <button type="button" className="button" onClick={() => relayStore.disconnect()}>
            {t('login.relay.cancel')}
          </button>
        </>
      ) : (
        <button type="button" className="button" onClick={() => relayStore.connect()}>
          {t('login.relay.open')}
        </button>
      )}
      {relay.status === 'failed' ? (
        <p role="alert" className="notice">
          {t(`login.relay.failed.${relay.reason}`)}
        </p>
      ) : null}
      <details>
        <summary>{t('login.relay.bookmarkletSummary')}</summary>
        <p className="notice">{t('login.relay.bookmarkletHelp')}</p>
        <BookmarkletLink label={t('login.relay.bookmarkletLabel')} />
      </details>
    </section>
  );
}

/** Fallback: the user pastes a bearer token (SDD FR-02). */
function TokenForm() {
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
  );
}

export function LoginScreen({ onSignIn }: { onSignIn: () => void }) {
  const t = useT();

  return (
    <main className="screen">
      <LanguageSwitcher />

      <h1>{t('login.heading')}</h1>
      <p>{t('login.description')}</p>

      <RelaySection />

      <button type="button" className="button" onClick={onSignIn}>
        {t('login.button')}
      </button>

      <p className="notice">{t('login.privacy')}</p>

      <TokenForm />
    </main>
  );
}
