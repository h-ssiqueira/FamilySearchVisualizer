import { useEffect, useRef } from 'react';
import ForceGraph from 'force-graph';
import { cardLines, formatDate, type FamilyCard, type LifeEvent, type PersonId } from '@/domain';
import { boxCollisionForce, nodeLines, type GraphData } from '@/graph';
import { downloadBlob } from './download';
import { themeStore } from './theme';

const FILL = { male: '#dae8fc', female: '#f8cecc', unknown: '#f5f5f5' } as const;
const STROKE = { male: '#6c8ebf', female: '#b85450', unknown: '#666666' } as const;
const SYMBOL = { male: '\u2642', female: '\u2640', unknown: '?' } as const;
const REPEAT_SYMBOL = '\u{1F504}';
const LINE_Y = [22, 42, 60, 78];
const LINK_COLOR = '#8a939c';
/** Same look as the tree (TC-65, TC-67): a parent and a child, or two partners, are joined by solid lines. */
const PARENT_LINK_DISTANCE = 130;
const MARRIAGE_LINK_DISTANCE = 70;

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

/** Cuts the text with an ellipsis so that it fits the width (the same rule as the tree card). */
function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}\u2026`).width > maxWidth) {
    cut = cut.slice(0, -1);
  }
  return `${cut}\u2026`;
}

/** Draws one card on the canvas: the same colours, the same four lines and notes as the tree (FR-43). */
function paintNode(
  node: PaintedNode,
  ctx: CanvasRenderingContext2D,
  selected: boolean,
  noteText: (note: 'unexpected' | 'unavailable') => string,
): void {
  const x = (node.x ?? 0) - node.width / 2;
  const y = (node.y ?? 0) - node.height / 2;
  const gender = node.card.person.gender;
  ctx.fillStyle = FILL[gender];
  ctx.fillRect(x, y, node.width, node.height);
  ctx.lineWidth = selected ? 3 : 1;
  ctx.strokeStyle = STROKE[gender];
  ctx.strokeRect(x, y, node.width, node.height);

  const lines = nodeLines(node.card);
  const rows = [
    `${SYMBOL[gender]} ${lines.name}${lines.repeated ? ` ${REPEAT_SYMBOL}` : ''}`,
    lines.note ? noteText(lines.note) : lines.dates,
    lines.places,
    lines.id,
  ];
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  rows.forEach((text, index) => {
    if (text === '') return;
    ctx.font = index === 0 ? 'bold 12px system-ui, sans-serif' : '12px system-ui, sans-serif';
    ctx.fillText(fit(ctx, text, node.width - 16), x + node.width / 2, y + (LINE_Y[index] ?? 0));
  });
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
          (note) => noteTextRef.current(note),
        );
      })
      // Hovering a node shows its full name (FR-44): the card may truncate the text.
      .nodeLabel((node) => cardLines((node as PaintedNode).card.person).name)
      // Same style as the tree: solid lines for parents and children and for the marriage (TC-65, TC-67).
      .linkLineDash(() => [])
      .linkLabel((link) => marriageText(link as PaintedLink))
      .onNodeClick((node) => onSelectRef.current((node as PaintedNode).id))
      // Keeps the cards apart: a pair that overlaps is pushed apart (OQ-27 gap, design section 4).
      .d3Force('collide', boxCollisionForce());
    // Partners are close (the marriage link is short) and children sit at a normal distance.
    const linkForce = handle.d3Force('link') as
      | { distance?: (distance: (link: object) => number) => unknown }
      | undefined;
    linkForce?.distance?.((link) =>
      (link as PaintedLink).kind === 'marriage' ? MARRIAGE_LINK_DISTANCE : PARENT_LINK_DISTANCE,
    );
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

  // The link colour follows the theme (FR-35): read the variable again whenever the theme changes.
  useEffect(() => {
    const apply = (): void => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue('--line')
        .trim();
      const color = value === '' ? LINK_COLOR : value;
      handleRef.current?.linkColor(() => color);
    };
    apply();
    return themeStore.subscribe(apply);
  }, []);

  useEffect(() => {
    handleRef.current?.graphData({
      nodes: data.nodes.map((node) => ({ ...node })),
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
