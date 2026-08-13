/**
 * El QR que devuelve la imagen a los datos vivos.
 *
 * Una imagen reenviada por WhatsApp es un dato muerto: va a seguir circulando
 * cuando el punto ya cerró, que es exactamente la patología que esta plataforma
 * existe para corregir. El QR es el puente de vuelta — quien recibe el reenvío
 * puede comprobar si sigue vigente en lugar de salir a un lugar que ya no está.
 *
 * No es, ni va a ser nunca, un QR de pago. `/como-funciona` y `/privacidad`
 * prometen que aquí no se publican, y por eso en la tarjeta va rotulado.
 */

import QRCode from "qrcode";

/**
 * Corrección media: aguanta que WhatsApp recomprima la imagen y que la pantalla
 * tenga reflejos, sin engordar la rejilla como haría el nivel alto.
 */
export async function qrDataUri(url: string): Promise<string> {
  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    color: { dark: "#0d1b16", light: "#ffffff" },
  });
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
