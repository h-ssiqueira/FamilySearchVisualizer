import { useMemo } from 'react';
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
}

function Authenticated({ config, factory, transport, requireToken }: AuthenticatedProps) {
  const services = useMemo(
    () => factory(config, { transport, requireToken }),
    [config, factory, transport, requireToken],
  );
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

  return (
    <Routes>
      <Route
        path="/"
        element={
          signedIn ? (
            <Authenticated
              config={config}
              factory={factory}
              transport={connection?.fetch}
              requireToken={connection === undefined}
            />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
