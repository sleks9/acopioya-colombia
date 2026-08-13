/**
 * Deja la foto del punto en un formato que satori sepa leer.
 *
 * Satori NO decodifica WebP: no falla, devuelve la tarjeta sin la foto y con
 * código 200. Es la peor forma de romperse, porque nadie se entera. Como
 * `comprimirImagen.ts` sube WebP siempre que el navegador pueda, la mayoría de
 * las fotos nuevas caen justo en ese hueco. Aquí se transcodifican a JPEG con
 * sharp y se devuelven como data URI.
 *
 * De paso se reescalan al ancho que la tarjeta va a usar de verdad: pasarle a
 * resvg una foto más grande de lo necesario solo cuesta tiempo.
 */

import sharp from "sharp";
import { urlFoto } from "@/lib/tipos";
import { origen } from "./marca";

/** Si la red se cae o Storage tarda, mejor tarjeta sin foto que tarjeta que nunca llega. */
const ESPERA_MS = 6000;

async function bajar(url: string): Promise<Buffer | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(ESPERA_MS) });
    if (!r.ok) return null;
    return Buffer.from(await r.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * @param fotoUrl la URL pública guardada en la base de datos
 * @param ancho   ancho al que se va a dibujar dentro de la tarjeta
 * @returns data URI listo para `<img src>`, o null si no hay foto o no se pudo traer
 */
export async function fotoParaTarjeta(
  fotoUrl: string | null,
  ancho: number
): Promise<string | null> {
  if (!fotoUrl) return null;

  // Primero por nuestro proxy: lo sirve el CDN y no consume transferencia de
  // Supabase. Si el proxy no responde, se cae a la URL original antes que
  // quedarse sin foto.
  const porProxy = urlFoto(fotoUrl);
  const bruto =
    (porProxy?.startsWith("/") ? await bajar(`${origen()}${porProxy}`) : null) ??
    (await bajar(fotoUrl));

  if (!bruto) return null;

  try {
    const jpeg = await sharp(bruto)
      .resize({ width: Math.round(ancho), withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    // Formato que sharp tampoco entiende (HEIC sin soporte, archivo corrupto).
    return null;
  }
}
