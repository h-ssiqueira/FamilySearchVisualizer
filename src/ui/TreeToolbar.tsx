import type { ViewLevel } from '@/domain';
import { useT } from '@/i18n';

const VIEWS: readonly ViewLevel[] = ['V1', 'V2', 'V3'];

export interface TreeToolbarProps {
  level: ViewLevel;
  onLevel: (level: ViewLevel) => void;
  generations: number;
  busy: boolean;
  detailsBusy: boolean;
  canLoadMore: boolean;
  /** People that could not be loaded yet (FR-33). */
  failedCount?: number;
  onRetry?: () => void;
  /** Seconds FamilySearch asked us to wait; shown while the queue is paused (FR-09). */
  waitSeconds?: number;
  onNext: () => void;
  onAll: () => void;
  onStop: () => void;
  onSignOut: () => void;
}

export function TreeToolbar(props: TreeToolbarProps) {
  const t = useT();
  const { level, busy, detailsBusy, canLoadMore, failedCount = 0, waitSeconds = 0 } = props;
  const status =
    waitSeconds > 0
      ? t('tree.waiting', { seconds: waitSeconds })
      : busy
        ? t('tree.loading')
        : detailsBusy
          ? t('tree.loadingDetails')
          : t('tree.generations', { count: props.generations });

  return (
    <div className="tree-toolbar">
      <div role="group" aria-label={t('tree.view.label')} className="tree-views">
        {VIEWS.map((option) => (
          <button
            key={option}
            type="button"
            className="button button--toggle"
            aria-pressed={level === option}
            onClick={() => props.onLevel(option)}
          >
            {t(`tree.view.${option}`)}
          </button>
        ))}
      </div>
      <button type="button" className="button" disabled={!canLoadMore} onClick={props.onNext}>
        {t('tree.next')}
      </button>
      <button type="button" className="button" disabled={!canLoadMore} onClick={props.onAll}>
        {t('tree.all')}
      </button>
      <button type="button" className="button" disabled={!busy} onClick={props.onStop}>
        {t('tree.stop')}
      </button>
      <p role="status" className="tree-status">
        {status}
        {failedCount > 0 ? ` · ${t('tree.failed', { count: failedCount })}` : ''}
      </p>
      {failedCount > 0 && props.onRetry ? (
        <button type="button" className="button" disabled={busy} onClick={props.onRetry}>
          {t('tree.retryFailed')}
        </button>
      ) : null}
      <button type="button" className="button" onClick={props.onSignOut}>
        {t('tree.logout')}
      </button>
    </div>
  );
}
