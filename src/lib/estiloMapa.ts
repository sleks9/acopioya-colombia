import type { StyleSpecification } from "maplibre-gl";

/**
 * Base ráster en vez de vectorial. La razón es doble:
 *
 * 1. Peso. Una tesela vectorial de OpenFreeMap sobre Bogotá a z14 pesa 381 KB;
 *    la ráster equivalente, 31 KB. Doce veces menos, y en zona de desastre la
 *    red es mala y a veces se paga por megabyte.
 *
 * 2. Robustez. Lo vectorial se descarga, se parsea en un Web Worker y se dibuja
 *    con shaders de WebGL: tres puntos donde un navegador con escudos activos,
 *    un bloqueador o una GPU modesta pueden dejar el mapa en blanco sin emitir
 *    ningún error. Una imagen PNG o se ve o no se ve.
 *
 * Se pierde el rotulado dinámico y el mapa se ve mas simple. Para un directorio
 * de acopios eso no cambia nada: lo que importa es ubicar el punto.
 */

/**
 * Miniatura estática de un punto, para las tarjetas que no tienen foto.
 *
 * No hace falta un servicio de "static maps" con API key: basta la tesela
 * rastera que contiene el punto (unos 30 KB) mas la posicion exacta del punto
 * DENTRO de ella. La tarjeta la desplaza para centrarlo.
 *
 * Ventaja secundaria: los puntos de una misma zona comparten tesela, asi que el
 * cache del navegador cubre buena parte del listado con una sola descarga.
 */
export type Miniatura = {
  url: string;
  /** Posición del punto dentro de la tesela, en px sobre 256. */
  px: number;
  py: number;
  tamano: number;
};

/**
 * Zoom 13 y no 14: a menor zoom cada tesela cubre mas area, asi que mas puntos
 * comparten la misma y el navegador la descarga una sola vez. Medido sobre los
 * 31 puntos sin foto: 25 teselas a z14 (~0,73 MB) contra 18 a z13 (~0,53 MB),
 * un 27% menos, y a z13 todavia se ven las calles. A z12 se ahorra poco mas
 * pero la miniatura ya no ubica nada.
 */
export function miniaturaDe(lat: number, lng: number, zoom = 13): Miniatura {
  const n = 2 ** zoom;
  const x = ((lng + 180) / 360) * n;
  const latR = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2) * n;

  const tx = Math.floor(x);
  const ty = Math.floor(y);
  // Subdominio estable por tesela: reparte la carga sin romper el cache.
  const sub = ["a", "b", "c"][(tx + ty) % 3];

  return {
    url: `https://${sub}.basemaps.cartocdn.com/light_all/${zoom}/${tx}/${ty}.png`,
    px: Math.round((x % 1) * 256),
    py: Math.round((y % 1) * 256),
    tamano: 256,
  };
}

/** En pantallas retina la tesela @2x pesa casi el triple. Solo si hay red. */
function usarAltaDensidad(): boolean {
  if (typeof window === "undefined") return false;
  if (window.devicePixelRatio < 1.5) return false;

  const c = (navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean };
  }).connection;
  if (!c) return true;
  if (c.saveData) return false;
  return c.effectiveType === "4g" || c.effectiveType === undefined;
}

export function estiloMapa(): StyleSpecification {
  const r = usarAltaDensidad() ? "@2x" : "";

  return {
    version: 8,
    // Los subdominios permiten al navegador abrir varias descargas en paralelo.
    sources: {
      base: {
        type: "raster",
        tiles: [
          `https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}${r}.png`,
          `https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}${r}.png`,
          `https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}${r}.png`,
        ],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 19,
        attribution:
          '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">&copy; OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
      },
    },
    layers: [
      // Fondo propio: si una tesela tarda, no queda un hueco negro.
      { id: "fondo", type: "background", paint: { "background-color": "#eef2f0" } },
      { id: "base", type: "raster", source: "base" },
    ],
  };
}
