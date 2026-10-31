/**
 * A minimal PDF writer: one page showing one RGB image (SDD FR-22). It has no dependency: the
 * image bytes are compressed by the caller (zlib, FlateDecode) and written here as they are.
 */

export interface PdfImage {
  width: number;
  height: number;
  /** zlib stream (FlateDecode) of the RGB pixels, row by row, three bytes per pixel. */
  deflated: Uint8Array;
}

const encoder = new TextEncoder();

function concat(parts: readonly Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function streamObject(dictionary: string, data: Uint8Array): Uint8Array {
  return concat([
    encoder.encode(`<<${dictionary} /Length ${data.length} >>\nstream\n`),
    data,
    encoder.encode('\nendstream'),
  ]);
}

/** Builds the PDF bytes: catalog, pages, page, image, content, cross-reference table. */
export function buildPdf(image: PdfImage): Uint8Array {
  const { width, height } = image;
  const content = encoder.encode(`q ${width} 0 0 ${height} 0 0 cm /Im0 Do Q\n`);
  const objects: Uint8Array[] = [
    encoder.encode('<< /Type /Catalog /Pages 2 0 R >>'),
    encoder.encode('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    encoder.encode(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] ` +
        '/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>',
    ),
    streamObject(
      ` /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode`,
      image.deflated,
    ),
    streamObject('', content),
  ];

  const parts: Uint8Array[] = [encoder.encode('%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n')];
  let length = parts[0]?.length ?? 0;
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(length);
    const head = encoder.encode(`${index + 1} 0 obj\n`);
    const tail = encoder.encode('\nendobj\n');
    parts.push(head, body, tail);
    length += head.length + body.length + tail.length;
  });

  const xrefOffset = length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) xref += `${String(offset).padStart(10, '0')} 00000 n \n`;
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  parts.push(encoder.encode(xref));
  return concat(parts);
}

/** Drops the alpha channel: RGBA pixels (as canvas gives them) become RGB bytes. */
export function rgbFromRgba(rgba: Uint8ClampedArray | Uint8Array, pixels: number): Uint8Array {
  const rgb = new Uint8Array(pixels * 3);
  for (let index = 0; index < pixels; index += 1) {
    rgb[index * 3] = rgba[index * 4] ?? 0;
    rgb[index * 3 + 1] = rgba[index * 4 + 1] ?? 0;
    rgb[index * 3 + 2] = rgba[index * 4 + 2] ?? 0;
  }
  return rgb;
}
