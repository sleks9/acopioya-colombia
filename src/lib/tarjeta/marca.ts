/**
 * La paleta, en hexadecimal literal.
 *
 * Satori no resuelve `var(--primario)`: no hay hoja de estilos ni cascada, solo
 * un árbol con estilos en línea. Estos valores son copia del tema CLARO de
 * `globals.css`. Las tarjetas van siempre en claro aunque el sitio esté en
 * oscuro, porque se ven sobre fondos ajenos —el chat de otra persona— donde no
 * controlamos nada. Si cambian los tokens de `globals.css`, hay que cambiarlos
 * aquí a mano; es el precio de salir del navegador.
 */

import type { Estado } from "@/lib/tipos";
import type { Urgencia } from "@/lib/solicitudes";

export const C = {
  fondo: "#f8faf9",
  superficie: "#ffffff",
  superficie2: "#f1f5f3",
  borde: "#dfe5e2",
  bordeFuerte: "#c3cec9",
  texto: "#0d1b16",
  textoSuave: "#55635c",
  primario: "#059669",
  primarioFuerte: "#047857",
  primarioFondo: "#ecfdf5",
  sobrePrimario: "#ffffff",
  acento: "#b45309",
  acentoFondo: "#fef6e7",
  peligro: "#c0271f",
  peligroFondo: "#fdeeed",
  info: "#14508c",
  infoFondo: "#e9f0f8",
} as const;

/** Verde opera, ámbar advierte, rojo detiene. Nunca solo color: siempre con texto. */
export const COLOR_ESTADO: Record<Estado, { fondo: string; texto: string; rotulo: string }> = {
  abierto: { fondo: C.primario, texto: C.sobrePrimario, rotulo: "ABIERTO" },
  lleno: { fondo: C.acento, texto: "#ffffff", rotulo: "LLENO · NO LLEVAR MÁS" },
  cerrado: { fondo: C.peligro, texto: "#ffffff", rotulo: "CERRADO" },
};

export const COLOR_URGENCIA: Record<Urgencia, { fondo: string; texto: string; rotulo: string }> = {
  critica: { fondo: C.peligro, texto: "#ffffff", rotulo: "URGENCIA CRÍTICA" },
  alta: { fondo: C.acento, texto: "#ffffff", rotulo: "URGENCIA ALTA" },
  normal: { fondo: C.info, texto: "#ffffff", rotulo: "URGENCIA NORMAL" },
};

/**
 * Fecha y hora en Colombia, no en la del servidor de Vercel ni la de quien mira.
 * Es el dato que permite que la imagen envejezca con honestidad cuando alguien
 * la reenvíe tres días después.
 */
export function selloDeTiempo(d = new Date()): string {
  const f = new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
  return f.replace(",", " ·");
}

/** Origen público del sitio, sin barra final. */
export function origen(): string {
  const u = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return u.replace(/\/+$/, "");
}

/** Cómo se lee el dominio en la tarjeta: sin protocolo ni www. */
export function dominio(): string {
  return origen().replace(/^https?:\/\//, "").replace(/^www\./, "");
}
