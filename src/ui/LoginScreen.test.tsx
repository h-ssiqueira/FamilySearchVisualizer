import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tokenStore } from '@/auth';
import { DEFAULT_LOCALE, setLocale } from '@/i18n';
import { LoginScreen } from './LoginScreen';

afterEach(() => {
  tokenStore.clear();
  window.localStorage.clear();
  setLocale(DEFAULT_LOCALE, false);
});

function submitToken(value: string): void {
  const input = screen.getByLabelText('Access token');
  fireEvent.change(input, { target: { value } });
  const form = input.closest('form');
  if (!form) throw new Error('the token form is missing');
  fireEvent.submit(form);
}

describe('LoginScreen', () => {
  it('shows one sign-in button that starts the login (TC-01)', () => {
    const onSignIn = vi.fn();
    render(<LoginScreen onSignIn={onSignIn} />);
    const button = screen.getByRole('button', { name: 'Sign in with Google (FamilySearch)' });
    fireEvent.click(button);
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  it('explains that the token stays in the browser tab', () => {
    render(<LoginScreen onSignIn={() => undefined} />);
    expect(screen.getByText(/stay in this browser tab/)).toBeInTheDocument();
  });

  it('switches the language and the document language (ADR-11)', () => {
    render(<LoginScreen onSignIn={() => undefined} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pt-BR' } });
    expect(
      screen.getByRole('button', { name: 'Entrar com Google (FamilySearch)' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Token de acesso')).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('pt-BR');
  });
});

describe('LoginScreen with a pasted token (FR-02)', () => {
  it('keeps the token in memory and clears the field', () => {
    render(<LoginScreen onSignIn={() => undefined} />);
    submitToken('synthetic-token');
    expect(tokenStore.get()).toBe('synthetic-token');
    expect(screen.getByLabelText('Access token')).toHaveValue('');
  });

  it('accepts the whole header value, with the Bearer prefix', () => {
    render(<LoginScreen onSignIn={() => undefined} />);
    submitToken('Bearer synthetic-token');
    expect(tokenStore.get()).toBe('synthetic-token');
  });

  it('asks for a token when the field is blank', () => {
    render(<LoginScreen onSignIn={() => undefined} />);
    submitToken('   ');
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter an access token.');
    expect(tokenStore.get()).toBeNull();
  });

  it('hides what is typed and never stores it in the browser (TC-04)', () => {
    render(<LoginScreen onSignIn={() => undefined} />);
    expect(screen.getByLabelText('Access token')).toHaveAttribute('type', 'password');
    submitToken('synthetic-token');
    expect(JSON.stringify({ ...window.localStorage })).not.toContain('synthetic-token');
    expect(JSON.stringify({ ...window.sessionStorage })).not.toContain('synthetic-token');
  });

  it('tells the user where to find the token', () => {
    render(<LoginScreen onSignIn={() => undefined} />);
    expect(screen.getByText('Where do I find the token?')).toBeInTheDocument();
  });
});
