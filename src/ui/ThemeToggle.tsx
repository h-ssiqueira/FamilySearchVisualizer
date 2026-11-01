import { useSyncExternalStore } from 'react';
import { useT } from '@/i18n';
import { isDark, themeStore } from './theme';

/** Switches between the light and the dark theme; the first press follows what is shown now. */
export function ThemeToggle() {
  const t = useT();
  const choice = useSyncExternalStore(themeStore.subscribe, themeStore.get, themeStore.get);
  const dark = isDark(choice);
  return (
    <button
      type="button"
      className="button button--toggle"
      aria-pressed={dark}
      onClick={() => themeStore.set(dark ? 'light' : 'dark')}
    >
      {t('theme.dark')}
    </button>
  );
}
