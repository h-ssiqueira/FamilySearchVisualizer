import type { DateText } from './types';

const ISO_PARTIAL = /^\+?(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

export function isIsoDate(value: string): boolean {
  return ISO_PARTIAL.test(value.trim());
}

/** `+1800-12-31` becomes `1800-12-31`; partial dates keep only what is known. */
export function toIsoDisplay(value: string): string | undefined {
  const match = ISO_PARTIAL.exec(value.trim());
  if (!match) return undefined;
  const [, year, month, day] = match;
  return [year, month, day].filter(Boolean).join('-');
}

export interface RawDate {
  formalText?: string | null;
  normalizedText?: string | null;
  localizedText?: string | null;
}

/**
 * Picks the best text for a date: a formal ISO date first, otherwise localized prose as it is
 * (never parsed), otherwise the raw formal text (approximate dates, ranges).
 */
export function makeDateText(raw: RawDate | null | undefined): DateText | undefined {
  if (!raw) return undefined;
  const formal = raw.formalText?.trim();
  if (formal && isIsoDate(formal)) return { text: formal, source: 'formal' };
  const prose = raw.normalizedText?.trim() || raw.localizedText?.trim();
  if (prose) return { text: prose, source: 'normalized' };
  if (formal) return { text: formal, source: 'formal' };
  return undefined;
}

export function formatDate(date: DateText | undefined): string {
  if (!date) return '';
  if (date.source === 'formal') return toIsoDisplay(date.text) ?? date.text;
  return date.text;
}
