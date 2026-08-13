/**
 * Inter para satori.
 *
 * `next/font/google` entrega woff2 y satori solo lee ttf, otf y woff, así que la
 * fuente del sitio no sirve tal cual: hay una copia en `assets/fuentes`. Son los
 * subsets latinos que publica Google (66 KB cada peso), no los archivos
 * completos con cirílico y griego que nadie va a leer aquí.
 *
 * Se leen una sola vez al cargar el módulo, no en cada petición.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";

const dir = join(process.cwd(), "assets", "fuentes");

const [regular, negrita] = await Promise.all([
  readFile(join(dir, "Inter-Regular.ttf")),
  readFile(join(dir, "Inter-Bold.ttf")),
]);

export const FUENTES = [
  { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
  { name: "Inter", data: negrita, weight: 700 as const, style: "normal" as const },
];
