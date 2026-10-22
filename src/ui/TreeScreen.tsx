import { useEffect, useMemo, useState } from 'react';
import { UnauthorizedError } from '@/api';
import type { PersonId, ViewLevel } from '@/domain';
import { applyPreferredLocale, useT } from '@/i18n';
import type { Services } from '@/services';
import { layoutFamily } from '@/tree';
import { ExportButton } from './ExportButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { TreeCanvas } from './TreeCanvas';
import { TreeToolbar } from './TreeToolbar';
import { useCurrentUser } from './useCurrentUser';
import { useFamilyTree } from './useFamilyTree';

interface FamilyTreeViewProps {
  services: Services;
  rootId: PersonId;
  onSignOut: () => void;
}

function FamilyTreeView({ services, rootId, onSignOut }: FamilyTreeViewProps) {
  const t = useT();
  const [level, setLevel] = useState<ViewLevel>('V1');
  const tree = useFamilyTree({
    source: services.source,
    rootId,
    level,
    onUnauthorized: onSignOut,
  });
  const layout = useMemo(() => (tree.family ? layoutFamily(tree.family) : undefined), [tree.family]);

  return (
    <>
      <TreeToolbar
        level={level}
        onLevel={setLevel}
        generations={tree.generations}
        busy={tree.busy}
        detailsBusy={tree.detailsBusy}
        canLoadMore={tree.canLoadMore}
        onNext={tree.loadNext}
        onAll={tree.loadAll}
        onStop={tree.stop}
        onSignOut={onSignOut}
      />
      {tree.status === 'error' ? (
        <div role="alert" className="notice">
          <p>{t('tree.error')}</p>
          <button type="button" className="button" onClick={tree.retry}>
            {t('tree.retry')}
          </button>
        </div>
      ) : null}
      {layout ? (
        <>
          <div className="tree-toolbar">
            <ExportButton layout={layout} />
          </div>
          <TreeCanvas layout={layout} />
        </>
      ) : (
        <p role="status" className="notice">
          {t('tree.loading')}
        </p>
      )}
    </>
  );
}

/** The signed-in screen: the current user is the root of the tree (SDD FR-05, FR-11..FR-15). */
export function TreeScreen({ services, onSignOut }: { services: Services; onSignOut: () => void }) {
  const t = useT();
  const user = useCurrentUser(services.client);

  useEffect(() => {
    if (user.status === 'ready') applyPreferredLocale(user.user.preferredLanguage);
  }, [user]);

  useEffect(() => {
    if (user.status === 'error' && user.error instanceof UnauthorizedError) onSignOut();
  }, [user, onSignOut]);

  return (
    <main className="tree-screen">
      <header className="tree-header">
        <h1>{t('tree.heading')}</h1>
        <LanguageSwitcher />
      </header>
      {user.status === 'ready' ? (
        <FamilyTreeView services={services} rootId={user.user.personId} onSignOut={onSignOut} />
      ) : (
        <>
          <p role={user.status === 'error' ? 'alert' : 'status'} className="notice">
            {user.status === 'error' ? t('tree.error') : t('tree.loading')}
          </p>
          <button type="button" className="button" onClick={onSignOut}>
            {t('tree.logout')}
          </button>
        </>
      )}
    </main>
  );
}
