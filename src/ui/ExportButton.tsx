import type { FamilyLayout } from '@/tree';
import { useT } from '@/i18n';
import { layoutToSvg } from '@/tree';
import { downloadBlob, downloadText } from './download';
import { canvasToPdf, canvasToPng, rasterize } from './exportImage';

/** PNG and PDF are drawn at twice the size, so that they stay sharp when printed or zoomed. */
const RASTER_SCALE = 2;

/** Exports the current view as SVG, PNG or PDF (SDD FR-22). */
export function ExportButton({ layout }: { layout: FamilyLayout }) {
  const t = useT();
  const disabled = layout.cards.length === 0;
  const svg = (): string => layoutToSvg(layout);

  const exportRaster = async (kind: 'png' | 'pdf'): Promise<void> => {
    try {
      const canvas = await rasterize(svg(), layout.width, layout.height, RASTER_SCALE);
      if (kind === 'png') {
        downloadBlob('family-tree.png', await canvasToPng(canvas));
      } else {
        downloadBlob('family-tree.pdf', await canvasToPdf(canvas));
      }
    } catch (error) {
      // Logged by class only: never the content of the tree (SDD NFR-05).
      console.warn('Export failed:', error instanceof Error ? error.name : 'unknown');
    }
  };

  return (
    <>
      <button
        type="button"
        className="button"
        disabled={disabled}
        onClick={() => downloadText('family-tree.svg', svg(), 'image/svg+xml')}
      >
        {t('tree.export')}
      </button>
      <button type="button" className="button" disabled={disabled} onClick={() => void exportRaster('png')}>
        {t('tree.exportPng')}
      </button>
      <button type="button" className="button" disabled={disabled} onClick={() => void exportRaster('pdf')}>
        {t('tree.exportPdf')}
      </button>
    </>
  );
}
