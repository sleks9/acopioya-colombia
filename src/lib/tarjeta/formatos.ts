/**
 * Los tres lienzos y su escala tipográfica.
 *
 * Cada formato trae su propia escala en vez de derivarla del ancho: `enlace` es
 * apaisado y necesita proporciones distintas a las verticales, aunque midan lo
 * mismo de ancho. El factor `k` reescala todo el conjunto de una vez, que es lo
 * que permite generar previsualizaciones pequeñas con las mismas plantillas.
 */

export type Formato = "historia" | "feed" | "enlace";

export const FORMATOS: Formato[] = ["historia", "feed", "enlace"];

export function esFormato(v: string | null): v is Formato {
  return v === "historia" || v === "feed" || v === "enlace";
}

export const CATALOGO: Record<Formato, { etiqueta: string; detalle: string }> = {
  historia: {
    etiqueta: "Historia",
    detalle: "Estado de WhatsApp, historias de Instagram y Facebook",
  },
  feed: {
    etiqueta: "Publicación",
    detalle: "Feed de Instagram y grupos de WhatsApp",
  },
  enlace: {
    etiqueta: "Enlace",
    detalle: "Se genera sola al pegar el enlace en un chat",
  },
};

export type Medidas = {
  formato: Formato;
  ancho: number;
  alto: number;
  vertical: boolean;
  /** Tipografía */
  sello: number;
  titular: number;
  subtitulo: number;
  cuerpo: number;
  pie: number;
  /** Espaciado */
  margen: number;
  /** Zona segura: en `historia` la app tapa arriba y abajo (ver abajo). */
  aire_arriba: number;
  aire_abajo: number;
  hueco: number;
  radio: number;
  qr: number;
};

/**
 * Zona segura: los Estados de WhatsApp y las Historias de Instagram dibujan
 * encima de la imagen —barra de progreso y avatar arriba, campo de respuesta
 * abajo—. Lo que caiga ahí no se lee. La franja inferior necesita más aire que
 * la superior porque el campo de respuesta es más alto que la barra.
 */
const BASE: Record<Formato, Omit<Medidas, "formato">> = {
  historia: {
    ancho: 1080, alto: 1920, vertical: true,
    sello: 44, titular: 76, subtitulo: 40, cuerpo: 32, pie: 24,
    margen: 64, aire_arriba: 190, aire_abajo: 240, hueco: 28, radio: 28, qr: 168,
  },
  feed: {
    ancho: 1080, alto: 1350, vertical: true,
    sello: 40, titular: 66, subtitulo: 37, cuerpo: 30, pie: 23,
    margen: 60, aire_arriba: 56, aire_abajo: 56, hueco: 24, radio: 26, qr: 150,
  },
  enlace: {
    // X recorta 1200×630 hacia 16:9, así que los bordes de arriba y abajo son
    // sacrificables: nada crítico puede vivir en ellos.
    //
    // Sin QR a propósito: esta imagen solo aparece pegada JUNTO al enlace, en
    // un chat donde tocar el enlace es más fácil que escanear nada. El QR
    // existe para la imagen que se reenvía suelta y pierde el enlace por el
    // camino; aquí solo robaría el sitio que necesitan los datos.
    // Titular a 50 y no a 54: a 54 un nombre largo se va a dos líneas y arrastra
    // fuera del recorte la última línea de contenido, que queda cortada por la
    // mitad. Ocho píxeles menos compran una línea entera.
    ancho: 1200, alto: 630, vertical: false,
    sello: 28, titular: 50, subtitulo: 28, cuerpo: 25, pie: 19,
    margen: 52, aire_arriba: 20, aire_abajo: 20, hueco: 16, radio: 20, qr: 0,
  },
};

/** Ancho mínimo que sigue siendo legible; por debajo la previsualización engaña. */
export const ANCHO_MIN = 320;

export function medidas(formato: Formato, anchoDeseado?: number): Medidas {
  const b = BASE[formato];
  const k = anchoDeseado ? Math.max(ANCHO_MIN, Math.min(anchoDeseado, b.ancho)) / b.ancho : 1;
  const e = (n: number) => Math.round(n * k);

  return {
    formato,
    ancho: e(b.ancho), alto: e(b.alto), vertical: b.vertical,
    sello: e(b.sello), titular: e(b.titular), subtitulo: e(b.subtitulo),
    cuerpo: e(b.cuerpo), pie: e(b.pie),
    margen: e(b.margen), aire_arriba: e(b.aire_arriba), aire_abajo: e(b.aire_abajo),
    hueco: e(b.hueco), radio: e(b.radio), qr: e(b.qr),
  };
}
