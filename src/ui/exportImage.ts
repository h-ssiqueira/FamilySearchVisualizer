import { buildPdf, rgbFromRgba } from '@/tree/pdf';

/**
 * Draws an SVG image onto a canvas, scaled up for a sharper export (FR-22). The SVG has no
 * external references, so the canvas is not tainted.
 */
export async function rasterize(
  svg: string,
  width: number,
  height: number,
  scale: number,
): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The image could not be drawn'));
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No 2D canvas context');
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.drawImage(image, 0, 0, width, height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('The PNG could not be made'));
    }, 'image/png');
  });
}

/** The canvas as a one-page PDF; the pixels are compressed with the browser's zlib (FlateDecode). */
export async function canvasToPdf(canvas: HTMLCanvasElement): Promise<Blob> {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No 2D canvas context');
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const rgb = rgbFromRgba(data, canvas.width * canvas.height);
  const compressed = new Blob([rgb as BlobPart]).stream().pipeThrough(new CompressionStream('deflate'));
  const deflated = new Uint8Array(await new Response(compressed).arrayBuffer());
  return new Blob(
    [buildPdf({ width: canvas.width, height: canvas.height, deflated }) as BlobPart],
    { type: 'application/pdf' },
  );
}
