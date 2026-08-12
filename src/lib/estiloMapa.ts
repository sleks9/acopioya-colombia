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
