import { useT } from '@/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

/** Placeholder: the tree views (V1 to V3) are built after the scaffold is merged. */
export function TreeScreen({ onSignOut }: { onSignOut: () => void }) {
  const t = useT();
  return (
    <main className="screen">
      <LanguageSwitcher />
      <h1>{t('tree.heading')}</h1>
      <p>{t('tree.placeholder')}</p>
      <button type="button" className="button" onClick={onSignOut}>
        {t('tree.logout')}
      </button>
    </main>
  );
}
