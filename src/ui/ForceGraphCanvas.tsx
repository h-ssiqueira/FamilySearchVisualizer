import { useEffect, useRef } from 'react';
import ForceGraph from 'force-graph';
import { cardLines, formatDate, type FamilyCard, type LifeEvent, type PersonId } from '@/domain';
import { boxCollisionForce, nodeLines, type GraphData } from '@/graph';
import { downloadBlob } from './download';
import { themeStore } from './theme';

/**
 * The graph is a network view, not the tree: each person is a circle with the name under it. The
 * cards stay in the tree page (the card layout is too heavy for a graph).
 */
const NODE_RADIUS = 9;
const LABEL_GAP = 4;
const LABEL_MAX_WIDTH = 150;
/** Room kept around each circle for its label, so the collision force leaves space for the text. */
const COLLIDE_SIZE = 2 * NODE_RADIUS + 60;
const FILL = { male: '#7ea6e0', female: '#ea6b66', unknown: '#b3b3b3' } as const;
const STROKE = { male: '#2f5d9e', female: '#9a3b37', unknown: '#555555' } as const;
const SYMBOL = { male: '\u2642', female: '\u2640', unknown: '?' } as const;
const REPEAT_SYMBOL = '\u{1F504}';
const LINK_COLOR = '#8a939c';
const TEXT_COLOR = '#111111';
/**
 * Spacing of the network (OQ-27). The values are first decided for a tree of about 200 people:
 * the parent-child links are long enough that the names do not overlap, the marriage link is
 * shorter so that the partners stay together, and the charge pushes unrelated people apart.
 */
const PARENT_LINK_DISTANCE = 200;
const MARRIAGE_LINK_DISTANCE = 120;
const CHARGE_STRENGTH = -300;

/** A node as the library hands it back: our data plus the position the library computes. */
interface PaintedNode {
  id: PersonId;
  x?: number;
  y?: number;
  width: number;
  height: number;
  card: FamilyCard;
}

interface PaintedLink {
  kind: 'parent' | 'marriage';
  event?: LifeEvent;
}

/** The marriage line shows its date and place, as on the tree (TC-65). */
function marriageText(link: PaintedLink): string {
  if (link.kind !== 'marriage') return '';
  return [formatDate(link.event?.date), link.event?.place?.text ?? '']
    .filter((line) => line !== '')
    .join(' \u00b7 ');
}

/**
 * The part of the library this page uses, kept in one place: a change in the library touches this
 * file only. The library's own typings are not relied on.
 */
interface GraphHandle {
  width(px: number): GraphHandle;
  height(px: number): GraphHandle;
  nodeCanvasObjectMode(mode: () => 'replace'): GraphHandle;
  nodeCanvasObject(
    paint: (node: object, ctx: CanvasRenderingContext2D, scale: number) => void,
  ): GraphHandle;
  nodeLabel(label: (node: object) => string): GraphHandle;
  linkColor(color: () => string): GraphHandle;
  linkLineDash(dash: (link: object) => number[]): GraphHandle;
  linkLabel(label: (link: object) => string): GraphHandle;
  onNodeClick(handler: (node: object) => void): GraphHandle;
  d3Force(name: string): unknown;
  d3Force(name: string, force: unknown): GraphHandle;
  graphData(data: { nodes: object[]; links: object[] }): GraphHandle;
  _destructor(): void;
}

/** The part of the link force this page sets: the distance of each link. */
type LinkForce = { distance?: (distance: (link: object) => number) => unknown };

/** The part of the charge force this page sets: how strongly people push each other apart. */
type ChargeForce = { strength?: (value: number) => unknown };

/** Cuts the text with an ellipsis so that it fits the width. */
function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}\u2026`).width > maxWidth) {
    cut = cut.slice(0, -1);
  }
  return `${cut}\u2026`;
}

/**
 * Draws one person: a circle coloured by gender, with the gender symbol and the name under it. A
 * person whose data is unexpected or unavailable is drawn as a dashed hollow circle, and the note is
 * written after the name, so the state is never shown by colour alone (NFR-06).
 */
function paintNode(
  node: PaintedNode,
  ctx: CanvasRenderingContext2D,
  selected: boolean,
  textColor: string,
  noteText: (note: 'unexpected' | 'unavailable') => string,
): void {
  const cx = node.x ?? 0;
  const cy = node.y ?? 0;
  const lines = nodeLines(node.card);
  const gender = node.card.person.gender;
  const hollow = lines.note !== undefined;

  ctx.beginPath();
  ctx.arc(cx, cy, NODE_RADIUS, 0, 2 * Math.PI);
  ctx.fillStyle = hollow ? '#ffffff' : FILL[gender];
  ctx.fill();
  ctx.lineWidth = selected ? 3 : 1.5;
  ctx.strokeStyle = STROKE[gender];
  ctx.setLineDash(hollow ? [3, 2] : []);
  ctx.stroke();
  ctx.setLineDash([]);

  const name = `${SYMBOL[gender]} ${lines.name}${lines.repeated ? ` ${REPEAT_SYMBOL}` : ''}`;
  const label = lines.note ? `${name} \u00b7 ${noteText(lines.note)}` : name;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText(fit(ctx, label, LABEL_MAX_WIDTH), cx, cy + NODE_RADIUS + LABEL_GAP);
}

interface ForceGraphCanvasProps {
  data: GraphData;
  selectedId?: PersonId;
  onSelect: (id: PersonId) => void;
  label: string;
  exportLabel: string;
  noteText: (note: 'unexpected' | 'unavailable') => string;
}

/**
 * The canvas of the graph page. The library owns the canvas and the physics; React only passes the
 * data and listens to clicks. The library is created once and fed new data when the view changes.
 */
export function ForceGraphCanvas({
  data,
  selectedId,
  onSelect,
  label,
  exportLabel,
  noteText,
}: ForceGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<GraphHandle | undefined>(undefined);
  const selectedRef = useRef<PersonId | undefined>(selectedId);
  const onSelectRef = useRef(onSelect);
  const noteTextRef = useRef(noteText);
  const textColorRef = useRef(TEXT_COLOR);

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);
  useEffect(() => {
    onSelectRef.current = onSelect;
    noteTextRef.current = noteText;
  }, [onSelect, noteText]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;
    const handle = new ForceGraph(element) as unknown as GraphHandle;
    handle
      .width(element.clientWidth)
      .height(element.clientHeight)
      .nodeCanvasObjectMode(() => 'replace')
      .nodeCanvasObject((node, ctx) => {
        const painted = node as PaintedNode;
        paintNode(
          painted,
          ctx,
          painted.id === selectedRef.current,
          textColorRef.current,
          (note) => noteTextRef.current(note),
        );
      })
      // Hovering a node shows its full name, since the label may be cut.
      .nodeLabel((node) => cardLines((node as PaintedNode).card.person).name)
      // Same style as the tree: solid lines for parents and children and for the marriage.
      .linkLineDash(() => [])
      .linkLabel((link) => marriageText(link as PaintedLink))
      .onNodeClick((node) => onSelectRef.current((node as PaintedNode).id))
      // Keeps the circles and their labels apart (OQ-27 gap, design section 4).
      .d3Force('collide', boxCollisionForce());
    // Spacing (OQ-27): longer links for parents and children, shorter for partners, and a stronger
    // charge so that unrelated people do not crowd each other.
    const linkForce = handle.d3Force('link') as LinkForce | undefined;
    linkForce?.distance?.((link) =>
      (link as PaintedLink).kind === 'marriage' ? MARRIAGE_LINK_DISTANCE : PARENT_LINK_DISTANCE,
    );
    const chargeForce = handle.d3Force('charge') as ChargeForce | undefined;
    chargeForce?.strength?.(CHARGE_STRENGTH);
    handleRef.current = handle;

    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(() => {
            handle.width(element.clientWidth).height(element.clientHeight);
          });
    observer?.observe(element);

    return () => {
      observer?.disconnect();
      handle._destructor();
      handleRef.current = undefined;
    };
  }, []);

  // The colours follow the theme (FR-35): read the variables again whenever the theme changes.
  useEffect(() => {
    const apply = (): void => {
      const style = getComputedStyle(document.documentElement);
      const line = style.getPropertyValue('--line').trim();
      const text = style.getPropertyValue('--text').trim();
      textColorRef.current = text === '' ? TEXT_COLOR : text;
      const color = line === '' ? LINK_COLOR : line;
      handleRef.current?.linkColor(() => color);
    };
    apply();
    return themeStore.subscribe(apply);
  }, []);

  useEffect(() => {
    handleRef.current?.graphData({
      // The collision force uses the size of the circle plus its label; the drawing uses the radius.
      nodes: data.nodes.map((node) => ({
        ...node,
        width: COLLIDE_SIZE,
        height: COLLIDE_SIZE,
      })),
      links: data.links.map((link) => ({ ...link })),
    });
  }, [data]);

  /** Saves what is on the canvas as a PNG (FR-22, OQ-30). The canvas is the only thing in it. */
  const exportPng = (): void => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) downloadBlob('family-graph.png', blob);
    }, 'image/png');
  };

  return (
    <>
      <div
        ref={containerRef}
        role="img"
        aria-label={label}
        style={{ width: '100%', height: '100%' }}
      />
      <button
        type="button"
        className="button"
        onClick={exportPng}
        style={{ position: 'absolute', top: 4, right: 4, zIndex: 2 }}
      >
        {exportLabel}
      </button>
    </>
  );
}
