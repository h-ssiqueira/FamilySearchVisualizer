import { useMemo } from 'react';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { startLogin, useToken } from '@/auth';
import type { AppConfig, ConfigResult } from '@/config';
import { useT } from '@/i18n';
import { useRelayState } from '@/relay/relayStore';
import { createServices, type ServiceOptions, type Services } from '@/services';
import { expireSession, isSessionExpired, signOut } from '@/state';
import { ConfigError } from '@/ui/ConfigError';
import { LoginScreen } from '@/ui/LoginScreen';
import { TreeScreen } from '@/ui/TreeScreen';

/** The graph page is its own chunk: the library is downloaded only when the page opens (OQ-31). */
const GraphScreen = lazy(() =>
  import('@/ui/GraphScreen').then((module) => ({ default: module.GraphScreen })),
);

interface AppProps {
  configResult: ConfigResult;
  /** Replaceable in tests. */
  createServices?: (config: AppConfig, options: ServiceOptions) => Services;
}

interface AuthenticatedProps {
  config: AppConfig;
  factory: (config: AppConfig, options: ServiceOptions) => Services;
  transport?: typeof fetch;
  requireToken: boolean;
  page: 'tree' | 'graph';
}

/**
 * Both pages share one set of services, so the cache and the queue serve both (FR-41). The view
 * level is kept in the view store, so the two pages show the same level.
 */
function Authenticated({ config, factory, transport, requireToken, page }: AuthenticatedProps) {
  const t = useT();
  const services = useMemo(
    () => factory(config, { transport, requireToken }),
    [config, factory, transport, requireToken],
  );
  if (page === 'graph') {
    return (
      <Suspense fallback={<p role="status" className="notice">{t('graph.loading')}</p>}>
        <GraphScreen services={services} onSignOut={signOut} onExpired={expireSession} />
      </Suspense>
    );
  }
  return <TreeScreen services={services} onSignOut={signOut} onExpired={expireSession} />;
}

/**
 * A typed token (fallback) wins. Otherwise a connected relay signs the app in: its tab carries
 * the user's session, so no token is needed (SDD FR-02, FR-34).
 */
export function App({ configResult, createServices: factory = createServices }: AppProps) {
  const t = useT();
  const token = useToken();
  const relay = useRelayState();

  if (!configResult.ok) return <ConfigError missing={configResult.missing} />;
  const { config } = configResult;

  const connection = token === null && relay.status === 'connected' ? relay.connection : undefined;
  const signedIn = token !== null || connection !== undefined;
  const expired = !signedIn && isSessionExpired();

  const signedInAt = (page: 'tree' | 'graph') => (
    <Authenticated
      config={config}
      factory={factory}
      transport={connection?.fetch}
      requireToken={connection === undefined}
      page={page}
    />
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          signedIn ? (
            signedInAt('tree')
          ) : (
            <>
              {expired ? (
                <p role="alert" className="screen notice">
                  {t('login.expired')}
                </p>
              ) : null}
              <LoginScreen onSignIn={() => startLogin(config.loginUrl)} />
            </>
          )
        }
      />
      <Route
        path="/graph"
        element={signedIn ? signedInAt('graph') : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
