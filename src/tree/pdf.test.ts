import { describe, expect, it } from 'vitest';
import { buildPdf, rgbFromRgba } from './pdf';

const text = (bytes: Uint8Array): string => new TextDecoder('latin1').decode(bytes);

describe('PDF writer (FR-22)', () => {
  const pdf = buildPdf({ width: 2, height: 1, deflated: new Uint8Array([120, 156, 3, 0, 0, 0, 0, 1]) });

  it('starts with the PDF header and ends with the end-of-file marker', () => {
    expect(text(pdf).startsWith('%PDF-1.4')).toBe(true);
    expect(text(pdf).trimEnd().endsWith('%%EOF')).toBe(true);
  });

  it('declares the image size and the flate filter', () => {
    const body = text(pdf);
    expect(body).toContain('/Width 2 /Height 1');
    expect(body).toContain('/Filter /FlateDecode');
    expect(body).toContain('/ColorSpace /DeviceRGB');
  });

  it('points startxref at the cross-reference table', () => {
    const body = text(pdf);
    const match = /startxref\n(\d+)\n%%EOF/.exec(body);
    expect(match).not.toBeNull();
    const offset = Number(match?.[1]);
    expect(body.slice(offset, offset + 4)).toBe('xref');
  });

  it('has one cross-reference entry per object', () => {
    const entries = text(pdf).match(/\d{10} 00000 n \n/g) ?? [];
    expect(entries).toHaveLength(5);
  });
});

describe('pixel conversion for the PDF image', () => {
  it('keeps red, green and blue and drops the alpha channel', () => {
    const rgba = new Uint8Array([255, 0, 0, 255, 0, 255, 0, 128]);
    expect(Array.from(rgbFromRgba(rgba, 2))).toEqual([255, 0, 0, 0, 255, 0]);
  });
});
