import { afterEach, describe, expect, it } from 'vitest';
import { formatDate } from '@/domain';
import { DEFAULT_LOCALE, setLocale } from './index';
import { formatNumber } from './format';

afterEach(() => {
  setLocale(DEFAULT_LOCALE, false);
});

describe('formatting per locale (NFR-08)', () => {
  it('formats numbers with the separators of the locale', () => {
    expect(formatNumber(1234, 'en')).toBe('1,234');
    expect(formatNumber(1234, 'pt-BR')).toBe('1.234');
  });

  it('keeps complete dates in the yyyy-MM-dd form in every locale (FR-25)', () => {
    setLocale('pt-BR', false);
    expect(formatDate({ text: '+1800-12-31', source: 'formal' })).toBe('1800-12-31');
  });

  it('shows the localized prose dates from FamilySearch as they were received', () => {
    setLocale('pt-BR', false);
    expect(formatDate({ text: '26 de setembro de 1908', source: 'normalized' })).toBe(
      '26 de setembro de 1908',
    );
  });
});
