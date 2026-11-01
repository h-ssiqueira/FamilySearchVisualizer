import { useCallback, useState } from 'react';

export interface Transform {
  x: number;
  y: number;
  scale: number;
}

export interface Size {
  width: number;
  height: number;
}

export const MIN_SCALE = 0.1;
export const MAX_SCALE = 2;
export const ZOOM_STEP = 1.2;

const clampScale = (scale: number): number => Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

/** Pan and zoom state of the tree canvas (SDD FR-21). */
export function usePanZoom() {
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });

  /** Zooms around `origin` (viewport coordinates) so the point under it stays put. */
  const zoomBy = useCallback((factor: number, origin: { x: number; y: number } = { x: 0, y: 0 }) => {
    setTransform((current) => {
      const scale = clampScale(current.scale * factor);
      const ratio = scale / current.scale;
      return {
        scale,
        x: origin.x - (origin.x - current.x) * ratio,
        y: origin.y - (origin.y - current.y) * ratio,
      };
    });
  }, []);

  const panBy = useCallback((dx: number, dy: number) => {
    setTransform((current) => ({ ...current, x: current.x + dx, y: current.y + dy }));
  }, []);

  const fit = useCallback((content: Size, viewport: Size) => {
    if (content.width <= 0 || content.height <= 0) return;
    if (viewport.width <= 0 || viewport.height <= 0) return;
    const scale = clampScale(
      Math.min(1, viewport.width / content.width, viewport.height / content.height),
    );
    setTransform({
      scale,
      x: (viewport.width - content.width * scale) / 2,
      y: (viewport.height - content.height * scale) / 2,
    });
  }, []);

  return { transform, zoomBy, panBy, fit };
}
