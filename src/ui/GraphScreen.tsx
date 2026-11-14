import { useEffect, useMemo, useState } from 'react';
import { UnauthorizedError } from '@/api';
import type { PersonId, ViewLevel } from '@/domain';
import { cardLines } from '@/domain';
import { toGraphData } from '@/graph';
import { applyPreferredLocale, useT } from '@/i18n';
import type { Services } from '@/services';
import { viewStore } from '@/state/viewStore';
import { ForceGraphCanvas } from './ForceGraphCanvas';
import { LanguageSwitcher } from './LanguageSwitcher';
import { PersonPanel } from './PersonPanel';
import { TreeToolbar } from './TreeToolbar';
import { useCurrentUser } from './useCurrentUser';
import { useFamilyTree } from './useFamilyTree';
import { useQueueWait } from './useQueueWait';

interface GraphViewProps {
  services: Services;
  rootId: PersonId;
  onSignOut: () => void;
  onExpired: () => void;
}

/** The graph of the same view as the tree page: same data, same loading, same panel (FR-40 to FR-45). */
function GraphView({ services, rootId, onSignOut, onExpired }: GraphViewProps) {
  const t = useT();
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
  const data = useMemo(() => (tree.family ? toGraphData(tree.family) : undefined), [tree.family]);
  const selected = data?.nodes.find((node) => node.id === selectedId)?.card;
  const onSelect = (id: PersonId): void =>
    setSelectedId((current) => (current === id ? undefined : id));

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
      {data ? (
        <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: '0.5rem' }}>
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, position: 'relative' }}>
            <ForceGraphCanvas
              data={data}
              selectedId={selectedId}
              onSelect={onSelect}
              label={t('graph.canvas')}
              noteText={(note) => t(`card.${note}`)}
            />
          </div>
          <section aria-label={t('graph.listHeading')} style={{ width: '14rem', overflow: 'auto' }}>
            <h2 style={{ fontSize: '1rem' }}>{t('graph.listHeading')}</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {data.nodes.map((node) => {
                const lines = cardLines(node.card.person);
                return (
                  <li key={node.id} style={{ margin: '0.25rem 0' }}>
                    <button
                      type="button"
                      className="button button--toggle"
                      aria-pressed={selectedId === node.id}
                      onClick={() => onSelect(node.id)}
                    >
                      {lines.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
          {selected ? (
            <PersonPanel
              key={selected.id}
              person={selected.person}
              source={services.source}
              onClose={() => setSelectedId(undefined)}
            />
          ) : null}
        </div>
      ) : (
        <p role="status" className="notice">
          {t('graph.loading')}
        </p>
      )}
    </>
  );
}

/**
 * The graph page (SDD FR-40). It shows the same people and relations as the tree page, drawn with
 * the force-graph library, and a list of the same people for keyboard and screen-reader use (FR-45).
 */
export function GraphScreen({
  services,
  onSignOut,
  onExpired = onSignOut,
}: {
  services: Services;
  onSignOut: () => void;
  onExpired?: () => void;
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
        <h1>{t('graph.heading')}</h1>
        <a href="#/">{t('graph.toTree')}</a>
        <LanguageSwitcher />
      </header>
      {user.status === 'ready' ? (
        <GraphView
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
