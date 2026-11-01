import { cardLines, type Person, type PersonRef } from '@/domain';

/** Width limits of a card (SDD OQ-22, FR-24). */
export const CARD_MIN_WIDTH = 250;
export const CARD_MAX_WIDTH = 360;

/** Approximate width of one character at the card's font size (0.8rem, Latin text). */
const CHAR_PX = 7.2;
/** The name is bold and carries the gender symbol and, sometimes, the repeat symbol. */
const NAME_CHAR_PX = 8.2;
/** Card padding and border. */
const PADDING_PX = 24;

/**
 * Width of a person's card, estimated from its text so that the layout can place it (OQ-19, OQ-22):
 * at least 250 px, at most 360 px. Longer text is still truncated with an ellipsis by the card.
 * The estimate is deterministic, so the layout and the card always agree on it.
 */
export function cardWidth(person: Person | PersonRef): number {
  const lines = cardLines(person);
  const nameWidth = (lines.name.length + 2) * NAME_CHAR_PX;
  const otherWidth = Math.max(lines.dates.length, lines.places.length, lines.id.length) * CHAR_PX;
  const wanted = Math.ceil(Math.max(nameWidth, otherWidth) + PADDING_PX);
  return Math.min(CARD_MAX_WIDTH, Math.max(CARD_MIN_WIDTH, wanted));
}
