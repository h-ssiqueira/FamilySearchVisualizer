import { useEffect, useRef } from 'react';
import ForceGraph from 'force-graph';
import type { FamilyCard } from '@/domain';
import type { PersonId } from '@/domain';
import { nodeLines, type GraphData } from '@/graph';

const FILL = { male: '#dae8fc', female: '#f8cecc', unknown: '#f5f5f5' } as const;
const STROKE = { male: '#6c8ebf', female: '#b85450', unknown: '#666666' } as const;
const SYMBOL = { male: '\u2642', female: '\u2640', unknown: '?' } as const;
const REPEAT_SYMBOL = '\u{1F504}';
const LINE_Y = [22, 42, 60, 78];
const LINK_COLOR = '#8a939c';
const MARRIAGE_DASH = [6, 4];

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
  linkColor(color: () => string): GraphHandle;
  linkLineDash(dash: (link: object) => number[]): GraphHandle;
  onNodeClick(handler: (node: object) => void): GraphHandle;
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
  noteText: (note: 'unexpected' | 'unavailable') => string;
}

/**
 * The canvas of the graph page. The library owns the canvas and the physics; React only passes the
 * data and listens to clicks. The library is created once and fed new data when the view changes.
 */
export function ForceGraphCanvas({ data, selectedId, onSelect, label, noteText }: ForceGraphCanvasProps) {
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
      .linkColor(() => LINK_COLOR)
      .linkLineDash((link) => ((link as PaintedLink).kind === 'marriage' ? MARRIAGE_DASH : []))
      .onNodeClick((node) => onSelectRef.current((node as PaintedNode).id));
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

  useEffect(() => {
    handleRef.current?.graphData({
      nodes: data.nodes.map((node) => ({ ...node })),
      links: data.links.map((link) => ({ ...link })),
    });
  }, [data]);

  return <div ref={containerRef} role="img" aria-label={label} style={{ width: '100%', height: '100%' }} />;
}
