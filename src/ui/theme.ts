/** Light, dark or the system setting (SDD FR-35). */
export type ThemeChoice = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'fsv.theme';

function readStored(): ThemeChoice {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

export function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

/** Whether the theme that is really shown is the dark one. */
export function isDark(choice: ThemeChoice): boolean {
  return choice === 'dark' || (choice === 'system' && systemPrefersDark());
}

/** `data-theme` is set only for an explicit choice; `system` leaves the page to the CSS media query. */
export function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;
  if (choice === 'system') delete root.dataset.theme;
  else root.dataset.theme = choice;
}

let current: ThemeChoice = readStored();
applyTheme(current);
const listeners = new Set<() => void>();

export const themeStore = {
  get: (): ThemeChoice => current,
  set(next: ThemeChoice): void {
    if (next === current) return;
    current = next;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable (private mode): the choice then lasts for this session only.
    }
    applyTheme(next);
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
