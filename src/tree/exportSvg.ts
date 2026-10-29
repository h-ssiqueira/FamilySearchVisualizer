import type { FamilyLayout } from './familyLayout';
import { cardLines, formatDate, type Gender } from '@/domain';
import type { MarriageLink } from './familyLayout';
import { CARD } from './layout';

const COLORS: Record<Gender, { top: string; bottom: string; stroke: string }> = {
  male: { top: '#dae8fc', bottom: '#7ea6e0', stroke: '#6c8ebf' },
  female: { top: '#f8cecc', bottom: '#ea6b66', stroke: '#b85450' },
  unknown: { top: '#f5f5f5', bottom: '#b3b3b3', stroke: '#666666' },
};
const SYMBOL: Record<Gender, string> = { male: '♂', female: '♀', unknown: '?' };
const GENDERS: readonly Gender[] = ['male', 'female', 'unknown'];
const MAX_CHARS = 34;

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const clip = (text: string): string =>
  text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS - 1)}…` : text;

function marriageLines(link: MarriageLink): string[] {
  return [formatDate(link.event?.date), link.event?.place?.text ?? ''].filter((line) => line !== '');
}

/**
 * A standalone SVG image of the current view (SDD FR-22): same cards, links and marriage labels
 * as on screen, with no script and no external reference. Text is escaped.
 */
export function layoutToSvg(layout: FamilyLayout): string {
  const gradients = GENDERS.map(
    (gender) =>
      `<linearGradient id="fill-${gender}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${COLORS[gender].top}"/>` +
      `<stop offset="1" stop-color="${COLORS[gender].bottom}"/></linearGradient>`,
  ).join('');

  const descents = layout.descents
    .map(
      (link) =>
        `<polyline fill="none" stroke="#555555" stroke-width="2" points="${link.points
          .map(([x, y]) => `${x},${y}`)
          .join(' ')}"/>`,
    )
    .join('');

  const marriages = layout.marriages
    .map((link) => {
      const lines = marriageLines(link);
      const labels = lines
        .map(
          (line, index) =>
            `<text x="${(link.x1 + link.x2) / 2}" y="${link.y - 6 - (lines.length - 1 - index) * 13}" ` +
            `font-size="11" text-anchor="middle" fill="#222222">${escapeXml(clip(line))}</text>`,
        )
        .join('');
      return `<line x1="${link.x1}" x2="${link.x2}" y1="${link.y}" y2="${link.y}" stroke="#555555" stroke-width="2"/>${labels}`;
    })
    .join('');

  const people = layout.cards
    .map((entry) => {
      const person = entry.card.person;
      const lines = cardLines(person);
      const colors = COLORS[person.gender];
      const cx = entry.x + entry.width / 2;
      const text = (y: number, content: string, extra = ''): string =>
        content === ''
          ? ''
          : `<text x="${cx}" y="${entry.y + y}" font-size="12" text-anchor="middle" fill="#000000"${extra}>${escapeXml(clip(content))}</text>`;
      return (
        `<g><rect x="${entry.x}" y="${entry.y}" width="${entry.width}" height="${CARD.height}" ` +
        `fill="url(#fill-${person.gender})" stroke="${colors.stroke}"/>` +
        text(22, `${SYMBOL[person.gender]} ${lines.name}`, ' font-weight="bold"') +
        text(42, lines.dates) +
        text(60, lines.places) +
        text(78, lines.id) +
        '</g>'
      );
    })
    .join('');

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" ` +
    `viewBox="0 0 ${layout.width} ${layout.height}" font-family="system-ui, sans-serif">` +
    `<defs>${gradients}</defs>` +
    `<rect width="${layout.width}" height="${layout.height}" fill="#ffffff"/>` +
    `${descents}${marriages}${people}</svg>`
  );
}
