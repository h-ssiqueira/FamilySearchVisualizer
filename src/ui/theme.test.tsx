import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, setLocale } from '@/i18n';
import { ThemeToggle } from './ThemeToggle';
import { THEME_STORAGE_KEY, applyTheme, themeStore } from './theme';

afterEach(() => {
  window.localStorage.clear();
  act(() => themeStore.set('system'));
  applyTheme('system');
  setLocale(DEFAULT_LOCALE, false);
});

describe('dark theme (FR-35)', () => {
  it('switches to dark, marks the page and remembers the choice', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Dark mode' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('switches back to light and removes the dark marker from the stored choice', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Dark mode' });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('leaves the page to the system setting when the choice is "system"', () => {
    applyTheme('dark');
    applyTheme('system');
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it('labels the button in pt-BR', () => {
    setLocale('pt-BR', false);
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Modo escuro' })).toBeInTheDocument();
  });
});
