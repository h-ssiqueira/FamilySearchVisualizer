import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { tokenStore } from '@/auth';
import type { ConfigResult } from '@/config';
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

function renderApp(configResult: ConfigResult = valid, entries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={entries}>
      <App configResult={configResult} />
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

  it('shows the tree placeholder with a token and goes back to login on sign-out (TC-06)', async () => {
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
