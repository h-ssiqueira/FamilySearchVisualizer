import { getLocale, type Locale } from './index';

/**
 * Numbers and counts in the locale's own format: `1,234` in English, `1.234` in pt-BR (SDD NFR-08).
 * Complete dates are not formatted here: they stay `yyyy-MM-dd` in every locale (FR-25).
 */
export function formatNumber(value: number, locale: Locale = getLocale()): string {
  return new Intl.NumberFormat(locale).format(value);
}
