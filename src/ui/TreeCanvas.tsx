/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex --
   The viewport is a pan/zoom surface: it has to be focusable to be operated with the keyboard. */
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from 'react';
import { cardLines, formatDate, type PersonId } from '@/domain';
import { useT } from '@/i18n';
import { CARD, type FamilyLayout, type MarriageLink } from '@/tree';
import { PersonCard } from './PersonCard';
import { ZOOM_STEP, usePanZoom, type Size } from './usePanZoom';

const KEY_STEP = 60;
/** Cards this far outside the viewport are still rendered (SDD NFR-02: culling). */
const CULL_MARGIN = 300;
const LABEL_MAX = 24;
/** A pointer that moves less than this is a click on a card, not a drag of the canvas. */
const DRAG_THRESHOLD = 4;

function useElementSize(ref: RefObject<HTMLElement | null>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const update = (): void => setSize({ width: element.clientWidth, height: element.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

const clip = (text: string): string =>
  text.length > LABEL_MAX ? `${text.slice(0, LABEL_MAX - 1)}…` : text;

/** Marriage date and place, one line each; lines that are unknown are left out. */
function marriageLines(link: MarriageLink): string[] {
  return [formatDate(link.event?.date), link.event?.place?.text ?? '']
    .filter((line) => line !== '')
    .map(clip);
}

interface TreeCanvasProps {
  layout: FamilyLayout;
  /** The card whose panel is open. */
  selectedId?: PersonId;
  /** When given, every card gets a button that selects it (SDD FR-16). */
  onSelect?: (id: PersonId) => void;
}

export function TreeCanvas({ layout, selectedId, onSelect }: TreeCanvasProps) {
  const t = useT();
  const viewportRef = useRef<HTMLDivElement>(null);
  const size = useElementSize(viewportRef);
  const { transform, zoomBy, panBy, fit } = usePanZoom();
  const drag = useRef<{ x: number; y: number; startX: number; startY: number; panning: boolean } | null>(
    null,
  );
  const fitted = useRef(false);
  const center = { x: size.width / 2, y: size.height / 2 };

  useEffect(() => {
    if (fitted.current || size.width === 0 || layout.cards.length === 0) return;
    fitted.current = true;
    fit(layout, size);
  }, [layout, size, fit]);

  // A wheel listener has to be non-passive to stop the page from scrolling while zooming.
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent): void => {
      event.preventDefault();
      const box = element.getBoundingClientRect();
      zoomBy(event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP, {
        x: event.clientX - box.left,
        y: event.clientY - box.top,
      });
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [zoomBy]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    // Keys pressed on a card button belong to the button, not to the canvas.
    if (event.target !== event.currentTarget) return;
    switch (event.key) {
      case 'ArrowLeft':
        panBy(KEY_STEP, 0);
        break;
      case 'ArrowRight':
        panBy(-KEY_STEP, 0);
        break;
      case 'ArrowUp':
        panBy(0, KEY_STEP);
        break;
      case 'ArrowDown':
        panBy(0, -KEY_STEP);
        break;
      case '+':
      case '=':
        zoomBy(ZOOM_STEP, center);
        break;
      case '-':
        zoomBy(1 / ZOOM_STEP, center);
        break;
      case '0':
        fit(layout, size);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  // The pointer is captured only once it really drags, so a plain click still reaches the card.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0) return;
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      panning: false,
    };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    const state = drag.current;
    if (!state) return;
    if (!state.panning) {
      const moved = Math.abs(event.clientX - state.startX) + Math.abs(event.clientY - state.startY);
      if (moved <= DRAG_THRESHOLD) return;
      state.panning = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    panBy(event.clientX - state.x, event.clientY - state.y);
    state.x = event.clientX;
    state.y = event.clientY;
  };
  const endDrag = (): void => {
    drag.current = null;
  };

  // Only cards near the viewport are rendered; with an unknown size everything is.
  const visible =
    size.width === 0
      ? layout.cards
      : layout.cards.filter((entry) => {
          const left = -transform.x / transform.scale - CULL_MARGIN;
          const right = (size.width - transform.x) / transform.scale + CULL_MARGIN;
          const top = -transform.y / transform.scale - CULL_MARGIN;
          const bottom = (size.height - transform.y) / transform.scale + CULL_MARGIN;
          return (
            entry.x + CARD.width >= left &&
            entry.x <= right &&
            entry.y + CARD.height >= top &&
            entry.y <= bottom
          );
        });

  return (
    <div className="tree-canvas">
      <div className="tree-zoom">
        <button type="button" className="button" onClick={() => zoomBy(ZOOM_STEP, center)}>
          {t('tree.zoomIn')}
        </button>
        <button type="button" className="button" onClick={() => zoomBy(1 / ZOOM_STEP, center)}>
          {t('tree.zoomOut')}
        </button>
        <button type="button" className="button" onClick={() => fit(layout, size)}>
          {t('tree.fit')}
        </button>
      </div>
      <div
        ref={viewportRef}
        className="tree-viewport"
        role="region"
        aria-label={t('tree.canvas')}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="tree-stage"
          data-scale={transform.scale}
          data-x={transform.x}
          data-y={transform.y}
          style={{
            width: layout.width,
            height: layout.height,
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          <svg
            className="tree-links"
            width={layout.width}
            height={layout.height}
            aria-hidden="true"
            focusable="false"
          >
            {layout.descents.map((link) => (
              <polyline
                key={`${link.coupleId}:${link.parentId}:${link.childId}`}
                className="tree-link"
                points={link.points.map(([x, y]) => `${x},${y}`).join(' ')}
              />
            ))}
            {layout.marriages.map((link) => {
              const lines = marriageLines(link);
              return (
                <g key={link.coupleId}>
                  <line className="tree-marriage" x1={link.x1} x2={link.x2} y1={link.y} y2={link.y} />
                  {lines.map((line, index) => (
                    <text
                      key={line}
                      className="tree-label"
                      x={(link.x1 + link.x2) / 2}
                      y={link.y - 6 - (lines.length - 1 - index) * 13}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}
          </svg>
          {visible.map((entry) => (
            <div key={entry.card.id} className="tree-card" style={{ left: entry.x, top: entry.y }}>
              <PersonCard person={entry.card.person} />
              {onSelect ? (
                <button
                  type="button"
                  className="tree-card-button"
                  aria-label={t('tree.select', { name: cardLines(entry.card.person).name })}
                  aria-pressed={selectedId === entry.card.id}
                  onClick={() => onSelect(entry.card.id)}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
