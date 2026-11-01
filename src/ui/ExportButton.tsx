import { useT } from '@/i18n';
import { layoutToSvg, type FamilyLayout } from '@/tree';
import { downloadText } from './download';

/** Exports the current view as an SVG image (SDD FR-22). */
export function ExportButton({ layout }: { layout: FamilyLayout }) {
  const t = useT();
  return (
    <button
      type="button"
      className="button"
      disabled={layout.cards.length === 0}
      onClick={() => downloadText('family-tree.svg', layoutToSvg(layout), 'image/svg+xml')}
    >
      {t('tree.export')}
    </button>
  );
}
