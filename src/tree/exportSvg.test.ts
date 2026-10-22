import { describe, expect, it } from 'vitest';
import type { FamilyCard, FamilyView, LifeEvent } from '@/domain';
import { escapeXml, layoutToSvg } from './exportSvg';
import { layoutFamily } from './familyLayout';

const card = (id: string, row: number, name = id): FamilyCard => ({
  id,
  person: { id, name, gender: 'male', living: false },
  role: 'line',
  row,
});

const marriage: LifeEvent = {
  date: { text: '+1825-05-20', source: 'formal' },
  place: { text: 'Campinas, Brazil' },
};

const view: FamilyView = {
  view: 'V1',
  rootId: 'R',
  cards: [card('R', 0), card('F', 1, 'Tom & <b>Jerry</b>'), card('M', 1)],
  couples: [
    { id: 'p:F+M', kind: 'parents', partnerIds: ['F', 'M'], childIds: ['R'], event: marriage },
  ],
};
const layout = layoutFamily(view);

describe('layoutToSvg (FR-22)', () => {
  it('is a standalone SVG with the size of the drawing', () => {
    const svg = layoutToSvg(layout);
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toContain(`width="${layout.width}"`);
    expect(svg).toContain(`viewBox="0 0 ${layout.width} ${layout.height}"`);
    expect(svg).not.toContain('undefined');
    expect(svg).not.toContain('<script');
  });

  it('draws one rectangle per card plus the background, and the links', () => {
    const svg = layoutToSvg(layout);
    expect(svg.match(/<rect /g)).toHaveLength(layout.cards.length + 1);
    expect(svg.match(/<polyline /g)).toHaveLength(layout.descents.length);
    expect(svg.match(/<line /g)).toHaveLength(layout.marriages.length);
  });

  it('writes the marriage label and the person data', () => {
    const svg = layoutToSvg(layout);
    expect(svg).toContain('1825-05-20');
    expect(svg).toContain('Campinas, Brazil');
    expect(svg).toContain('♂ R');
  });

  it('escapes text coming from FamilySearch', () => {
    const svg = layoutToSvg(layout);
    expect(svg).toContain('Tom &amp; &lt;b&gt;Jerry&lt;/b&gt;');
    expect(svg).not.toContain('<b>');
  });

  it('truncates very long text with an ellipsis', () => {
    const long = 'A very long name that certainly does not fit in a card of 250 pixels';
    const svg = layoutToSvg(layoutFamily({ ...view, cards: [card('R', 0, long)], couples: [] }));
    expect(svg).toContain('…');
    expect(svg).not.toContain(long);
  });

  it('gives an empty image for an empty layout', () => {
    const svg = layoutToSvg({ cards: [], marriages: [], descents: [], width: 0, height: 0 });
    expect(svg.match(/<rect /g)).toHaveLength(1);
  });
});

describe('escapeXml', () => {
  it('escapes the five XML special characters', () => {
    expect(escapeXml('<a href="x">&')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;');
  });
});
