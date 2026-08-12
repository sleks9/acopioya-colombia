/**
 * Comprime la foto en el celular ANTES de subirla.
 *
 * Una foto de camara moderna pesa entre 3 y 8 MB. Ese archivo se sube una vez
 * (datos del que reporta) pero se descarga una vez por cada persona que abre la
 * ficha. Con mil visitas, una sola foto de 4 MB son 4 GB de trafico: casi todo
 * el plan gratuito de Supabase por un punto.
 *
 * Reducida a 1280 px de lado mayor y WebP al 78%, la misma foto queda en unos
 * 80 KB —suficiente para ver que el sitio existe y hay senalizacion— y baja el
 * consumo unas cincuenta veces. Tambien sube muchisimo mas rapido con mala red,
 * que es cuando mas se abandona un formulario.
 */

const LADO_MAX = 1280;
const CALIDAD = 0.78;

export type Comprimida = {
  archivo: File;
  bytesOriginal: number;
  bytesFinal: number;
};

export async function comprimirImagen(original: File): Promise<Comprimida> {
  // Si no es imagen o el navegador no puede procesarla, se sube tal cual.
  if (!original.type.startsWith("image/")) {
    return { archivo: original, bytesOriginal: original.size, bytesFinal: original.size };
  }

  try {
    const bitmap = await crearBitmap(original);

    const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * escala);
    const h = Math.round(bitmap.height * escala);

    const lienzo = document.createElement("canvas");
    lienzo.width = w;
    lienzo.height = h;
    const ctx = lienzo.getContext("2d");
    if (!ctx) throw new Error("sin contexto 2d");

    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    // WebP donde se pueda; JPEG como respaldo (Safari viejo).
    const blob =
      (await aBlob(lienzo, "image/webp", CALIDAD)) ??
      (await aBlob(lienzo, "image/jpeg", CALIDAD));
    if (!blob) throw new Error("no se pudo codificar");

    // Si comprimir no ayudo (imagen ya pequeña), no se toca el original.
    if (blob.size >= original.size) {
      return { archivo: original, bytesOriginal: original.size, bytesFinal: original.size };
    }

    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    const archivo = new File([blob], `foto.${ext}`, { type: blob.type });
    return { archivo, bytesOriginal: original.size, bytesFinal: archivo.size };
  } catch {
    // Cualquier fallo: mejor subir la original que perder el reporte.
    return { archivo: original, bytesOriginal: original.size, bytesFinal: original.size };
  }
}

async function crearBitmap(f: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap === "function") {
    // La orientacion EXIF importa: sin esto las fotos verticales salen giradas.
    return createImageBitmap(f, { imageOrientation: "from-image" });
  }
  throw new Error("sin createImageBitmap");
}

function aBlob(
  lienzo: HTMLCanvasElement,
  tipo: string,
  calidad: number
): Promise<Blob | null> {
  return new Promise((res) => {
    lienzo.toBlob((b) => res(b && b.type === tipo ? b : null), tipo, calidad);
  });
}
