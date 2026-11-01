import { describe, expect, it } from 'vitest';
import { formatDate, isIsoDate, makeDateText, toIsoDisplay } from './dates';

describe('makeDateText', () => {
  it('prefers a formal ISO date', () => {
    expect(makeDateText({ formalText: '+1800-12-31', normalizedText: '31 December 1800' })).toEqual({
      text: '+1800-12-31',
      source: 'formal',
    });
  });

  it('falls back to normalized prose when the formal date is null', () => {
    expect(makeDateText({ formalText: null, normalizedText: '2 July 1799' })).toEqual({
      text: '2 July 1799',
      source: 'normalized',
    });
  });

  it('uses localized text when normalized text is missing', () => {
    expect(makeDateText({ localizedText: '2 de julho de 1799' })).toEqual({
      text: '2 de julho de 1799',
      source: 'normalized',
    });
  });

  it('prefers prose over a formal date that is not plain ISO (approximate, range)', () => {
    expect(makeDateText({ formalText: 'A+1800', normalizedText: 'about 1800' })).toEqual({
      text: 'about 1800',
      source: 'normalized',
    });
  });

  it('keeps the raw formal text when nothing else exists', () => {
    expect(makeDateText({ formalText: 'A+1800' })).toEqual({ text: 'A+1800', source: 'formal' });
  });

  it('returns undefined when there is nothing to show', () => {
    expect(makeDateText(null)).toBeUndefined();
    expect(makeDateText({})).toBeUndefined();
    expect(makeDateText({ formalText: '  ', normalizedText: '' })).toBeUndefined();
  });
});

describe('formatDate', () => {
  it('shows ISO dates without the plus sign and keeps partial dates partial', () => {
    expect(formatDate({ text: '+1800-12-31', source: 'formal' })).toBe('1800-12-31');
    expect(formatDate({ text: '+1800-12', source: 'formal' })).toBe('1800-12');
    expect(formatDate({ text: '+1800', source: 'formal' })).toBe('1800');
  });

  it('shows normalized prose and non-ISO formal text as they are', () => {
    expect(formatDate({ text: '2 July 1799', source: 'normalized' })).toBe('2 July 1799');
    expect(formatDate({ text: 'A+1800', source: 'formal' })).toBe('A+1800');
  });

  it('returns an empty string for a missing date', () => {
    expect(formatDate(undefined)).toBe('');
  });
});

describe('isIsoDate / toIsoDisplay', () => {
  it('recognises only plain ISO dates', () => {
    expect(isIsoDate('+1800-12-31')).toBe(true);
    expect(isIsoDate('1800')).toBe(true);
    expect(isIsoDate('A+1800')).toBe(false);
    expect(toIsoDisplay('A+1800')).toBeUndefined();
  });
});
