import { describe, expect, it } from 'vitest';
import type { FamilyCard, FamilyCouple, FamilyView, PersonRef } from '@/domain';
import { CARD, cardWidth } from '@/tree';
import { nodeLines, toGraphData } from './graphData';

const card = (id: string, row: number, extra: Partial<PersonRef> = {}, name = id): FamilyCard => ({
  id,
  person: { id, name, gender: 'unknown', living: false, ...extra },
  role: 'line',
  row,
});

const parents = (partnerIds: string[], childIds: string[]): FamilyCouple => ({
  id: `p:${partnerIds.join('+')}`,
  kind: 'parents',
  partnerIds,
  childIds,
});

const union = (partnerIds: string[], childIds: string[]): FamilyCouple => ({
  id: `u:${partnerIds.join('+')}`,
  kind: 'union',
  partnerIds,
  childIds,
});

const view = (cards: FamilyCard[], couples: FamilyCouple[]): FamilyView => ({
  view: 'V2',
  rootId: 'R',
  cards,
  couples,
});

describe('graph nodes (FR-40, FR-43, TC-87)', () => {
  it('has one node per card, sized like the tree card', () => {
    const data = toGraphData(view([card('R', 0, {}, 'R Example')], []));
    expect(data.nodes).toHaveLength(1);
    expect(data.nodes[0]?.width).toBe(cardWidth(card('R', 0, {}, 'R Example').person));
    expect(data.nodes[0]?.height).toBe(CARD.height);
  });

  it('gives the same four lines as the tree card for a normal person', () => {
    const lines = nodeLines(card('R', 0, {}, 'R Example'));
    expect(lines.name).toBe('R Example');
    expect(lines.id).toBe('R');
    expect(lines.repeated).toBe(false);
    expect(lines.note).toBeUndefined();
  });

  it('names the unexpected and unavailable states, and blanks the dates', () => {
    expect(nodeLines(card('A', 1, { invalid: true })).note).toBe('unexpected');
    expect(nodeLines(card('B', 1, { unavailable: true })).note).toBe('unavailable');
    expect(nodeLines(card('B', 1, { unavailable: true })).dates).toBe('');
  });

  it('flags a repeated ancestor (TC-22)', () => {
    expect(nodeLines(card('P', 2, { repeated: true })).repeated).toBe(true);
  });
});

describe('graph links follow the tree rules (FR-42, TC-86)', () => {
  it('joins the two partners of a parents couple with a marriage link and each partner to the child', () => {
    const data = toGraphData(
      view(
        [card('R', 0), card('F', 1), card('M', 1)],
        [parents(['F', 'M'], ['R'])],
      ),
    );
    expect(data.links).toContainEqual(expect.objectContaining({ kind: 'marriage', source: 'F', target: 'M' }));
    expect(data.links).toContainEqual(expect.objectContaining({ kind: 'parent', source: 'F', target: 'R' }));
    expect(data.links).toContainEqual(expect.objectContaining({ kind: 'parent', source: 'M', target: 'R' }));
    expect(data.links).toHaveLength(3);
  });

  it('draws a single parent without a marriage link', () => {
    const data = toGraphData(view([card('R', 0), card('F', 1)], [parents(['F'], ['R'])]));
    expect(data.links.filter((link) => link.kind === 'marriage')).toHaveLength(0);
    expect(data.links).toEqual([expect.objectContaining({ kind: 'parent', source: 'F', target: 'R' })]);
  });

  it('joins a person and a spouse with a marriage link and each of them to the children of the union', () => {
    const data = toGraphData(
      view(
        [card('R', 0), card('S', 0), card('K', -1)],
        [union(['R', 'S'], ['K'])],
      ),
    );
    expect(data.links).toContainEqual(expect.objectContaining({ kind: 'marriage', source: 'R', target: 'S' }));
    expect(data.links).toContainEqual(expect.objectContaining({ kind: 'parent', source: 'R', target: 'K' }));
    expect(data.links).toContainEqual(expect.objectContaining({ kind: 'parent', source: 'S', target: 'K' }));
  });

  it('never links to a person that is not on the view', () => {
    const data = toGraphData(view([card('R', 0), card('F', 1)], [parents(['F', 'GHOST'], ['R', 'MISSING'])]));
    const ends = data.links.flatMap((link) => [link.source, link.target]);
    expect(ends).not.toContain('GHOST');
    expect(ends).not.toContain('MISSING');
  });

  it('does not repeat the same parent-child link', () => {
    const data = toGraphData(
      view([card('R', 0), card('F', 1)], [parents(['F'], ['R']), parents(['F'], ['R'])]),
    );
    expect(data.links.filter((link) => link.kind === 'parent')).toHaveLength(1);
  });
});
