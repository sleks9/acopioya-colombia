import type { MetadataRoute } from "next";

/**
 * Instalable en el celular. En una emergencia importa: quien consulta el mapa
 * a diario prefiere un icono en la pantalla de inicio a recordar una URL.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AcopioYa — Centros de acopio en Colombia",
    short_name: "AcopioYa",
    description:
      "Mapa vivo de centros de acopio tras el terremoto. Qué reciben, qué NO reciben y si siguen abiertos.",
    start_url: "/mapa",
    display: "standalone",
    background_color: "#f8faf9",
    theme_color: "#059669",
    lang: "es-CO",
    icons: [
      { src: "/icono-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
