import { useEffect, useMemo, useState } from 'react';
import { UnauthorizedError } from '@/api';
import type { PersonId, ViewLevel } from '@/domain';
import { applyPreferredLocale, useT } from '@/i18n';
import type { Services } from '@/services';
import { viewStore } from '@/state/viewStore';
import { layoutFamily } from '@/tree';
import { ExportButton } from './ExportButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { PersonPanel } from './PersonPanel';
import { TreeCanvas } from './TreeCanvas';
import { TreeToolbar } from './TreeToolbar';
import { useCurrentUser } from './useCurrentUser';
import { useFamilyTree } from './useFamilyTree';
import { useQueueWait } from './useQueueWait';

interface FamilyTreeViewProps {
  services: Services;
  rootId: PersonId;
  onSignOut: () => void;
  onExpired: () => void;
}

function FamilyTreeView({ services, rootId, onSignOut, onExpired }: FamilyTreeViewProps) {
  const t = useT();
  // The view survives an expiry: signing in again returns to it (FR-04).
  const [level, setLevelState] = useState<ViewLevel>(() => viewStore.get());
  const setLevel = (next: ViewLevel): void => {
    viewStore.set(next);
    setLevelState(next);
  };
  const [selectedId, setSelectedId] = useState<PersonId | undefined>(undefined);
  const tree = useFamilyTree({
    source: services.source,
    rootId,
    level,
    onUnauthorized: onExpired,
  });
  const waitSeconds = useQueueWait(services.queue);
  const layout = useMemo(() => (tree.family ? layoutFamily(tree.family) : undefined), [tree.family]);
  const selected = layout?.cards.find((entry) => entry.card.id === selectedId)?.card;

  return (
    <>
      <TreeToolbar
        level={level}
        onLevel={setLevel}
        generations={tree.generations}
        busy={tree.busy}
        detailsBusy={tree.detailsBusy}
        canLoadMore={tree.canLoadMore}
        failedCount={tree.failed}
        onRetry={tree.retry}
        waitSeconds={waitSeconds}
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
          <div className="tree-body">
            <TreeCanvas
              layout={layout}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId((current) => (current === id ? undefined : id))}
            />
            {selected ? (
              <PersonPanel
                key={selected.id}
                person={selected.person}
                source={services.source}
                onClose={() => setSelectedId(undefined)}
              />
            ) : null}
          </div>
        </>
      ) : (
        <p role="status" className="notice">
          {t('tree.loading')}
        </p>
      )}
    </>
  );
}

/**
 * The signed-in screen: the current user is the root of the tree (SDD FR-05, FR-11..FR-16).
 * A rejected session goes to `onExpired` (FR-04); the explicit sign-out button goes to `onSignOut`.
 */
export function TreeScreen({
  services,
  onSignOut,
  onExpired,
}: {
  services: Services;
  onSignOut: () => void;
  onExpired: () => void;
}) {
  const t = useT();
  const user = useCurrentUser(services.client);

  useEffect(() => {
    if (user.status === 'ready') applyPreferredLocale(user.user.preferredLanguage);
  }, [user]);

  useEffect(() => {
    if (user.status === 'error' && user.error instanceof UnauthorizedError) onExpired();
  }, [user, onExpired]);

  return (
    <main className="tree-screen">
      <header className="tree-header">
        <h1>{t('tree.heading')}</h1>
        <LanguageSwitcher />
      </header>
      {user.status === 'ready' ? (
        <FamilyTreeView
          services={services}
          rootId={user.user.personId}
          onSignOut={onSignOut}
          onExpired={onExpired}
        />
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
