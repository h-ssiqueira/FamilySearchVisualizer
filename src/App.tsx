import { useMemo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { startLogin, useToken } from '@/auth';
import type { AppConfig, ConfigResult } from '@/config';
import { createServices, type Services } from '@/services';
import { signOut } from '@/state';
import { ConfigError } from '@/ui/ConfigError';
import { LoginScreen } from '@/ui/LoginScreen';
import { TreeScreen } from '@/ui/TreeScreen';

interface AppProps {
  configResult: ConfigResult;
  /** Replaceable in tests. */
  createServices?: (config: AppConfig) => Services;
}

function Authenticated({
  config,
  factory,
}: {
  config: AppConfig;
  factory: (config: AppConfig) => Services;
}) {
  const services = useMemo(() => factory(config), [config, factory]);
  return <TreeScreen services={services} onSignOut={signOut} />;
}

export function App({ configResult, createServices: factory = createServices }: AppProps) {
  const token = useToken();

  if (!configResult.ok) return <ConfigError missing={configResult.missing} />;
  const { config } = configResult;

  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? (
            <Authenticated config={config} factory={factory} />
          ) : (
            <LoginScreen onSignIn={() => startLogin(config.loginUrl)} />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
