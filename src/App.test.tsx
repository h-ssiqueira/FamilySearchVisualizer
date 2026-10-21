import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { tokenStore } from '@/auth';
import type { ConfigResult } from '@/config';
import type { CurrentUser } from '@/domain';
import type { Services } from '@/services';
import { signOut } from '@/state';
import { App } from './App';

const valid: ConfigResult = {
  ok: true,
  config: {
    basePath: '/FamilySearchVisualizer/',
    loginUrl: 'https://ident.familysearch.org/oauth2/authorization/google',
    apiBase: 'https://www.familysearch.org',
  },
};

// A client that never answers: these tests are about routing, not about loading the tree.
const idleServices = (): Services => ({
  client: {
    getCurrentUser: () => new Promise<CurrentUser>(() => undefined),
    getPersonDetails: () => Promise.reject(new Error('not used')),
  },
  source: { getPerson: async () => null },
});

function renderApp(configResult: ConfigResult = valid, entries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={entries}>
      <App configResult={configResult} createServices={idleServices} />
    </MemoryRouter>,
  );
}

afterEach(() => {
  signOut();
});

describe('App', () => {
  it('shows the login screen without a token', () => {
    renderApp();
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('shows the tree screen with a token and goes back to login on sign-out (TC-06)', async () => {
    tokenStore.set('synthetic-token');
    renderApp();
    expect(screen.getByRole('heading', { name: 'Your family tree' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(
      await screen.findByRole('button', { name: /sign in with google/i }),
    ).toBeInTheDocument();
    expect(tokenStore.get()).toBeNull();
  });

  it('names the invalid settings instead of failing silently', () => {
    renderApp({ ok: false, missing: ['VITE_FS_LOGIN_URL'] });
    expect(screen.getByRole('heading', { name: 'Configuration problem' })).toBeInTheDocument();
    expect(screen.getByText('VITE_FS_LOGIN_URL')).toBeInTheDocument();
  });

  it('sends unknown routes back to the start', () => {
    renderApp(valid, ['/no/such/page']);
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });
});
