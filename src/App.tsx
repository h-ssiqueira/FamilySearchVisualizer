import { Navigate, Route, Routes } from 'react-router-dom';
import { startLogin, useToken } from '@/auth';
import type { ConfigResult } from '@/config';
import { signOut } from '@/state';
import { ConfigError } from '@/ui/ConfigError';
import { LoginScreen } from '@/ui/LoginScreen';
import { TreeScreen } from '@/ui/TreeScreen';

export function App({ configResult }: { configResult: ConfigResult }) {
  const token = useToken();

  if (!configResult.ok) return <ConfigError missing={configResult.missing} />;
  const { loginUrl } = configResult.config;

  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? (
            <TreeScreen onSignOut={signOut} />
          ) : (
            <LoginScreen onSignIn={() => startLogin(loginUrl)} />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
