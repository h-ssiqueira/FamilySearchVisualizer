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
  onNext: () => void;
  onAll: () => void;
  onStop: () => void;
  onSignOut: () => void;
}

export function TreeToolbar(props: TreeToolbarProps) {
  const t = useT();
  const { level, busy, detailsBusy, canLoadMore } = props;
  const status = busy
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
      </p>
      <button type="button" className="button" onClick={props.onSignOut}>
        {t('tree.logout')}
      </button>
    </div>
  );
}
