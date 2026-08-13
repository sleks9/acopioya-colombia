/**
 * Los pocos iconos que la tarjeta necesita, como data URI.
 *
 * `lucide-react` no se puede montar aquí: satori no ejecuta componentes que
 * dependan del runtime del navegador, y su soporte de SVG en línea es
 * irregular. Estos son los mismos trazos de Lucide que usa el resto del sitio,
 * servidos como imagen. Cero emojis, igual que en la interfaz: un emoji cambia
 * de forma según el sistema y no se puede teñir.
 */

const TRAZOS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  equis: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  alerta:
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  reloj: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  telefono:
    '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
  calendario:
    '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  usuarios:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
} as const;

export type Icono = keyof typeof TRAZOS;

/**
 * @param grosor sube a 3 en los rótulos pequeños: a tamaño de miniatura un
 *   trazo de 2 se difumina cuando WhatsApp recomprime la imagen.
 */
export function icono(nombre: Icono, color: string, grosor = 2.25): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ` +
    `stroke="${color}" stroke-width="${grosor}" stroke-linecap="round" ` +
    `stroke-linejoin="round">${TRAZOS[nombre]}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
