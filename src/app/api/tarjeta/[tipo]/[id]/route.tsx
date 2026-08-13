/**
 * Genera la tarjeta compartible de un punto, en los tres formatos.
 *
 *   /api/tarjeta/centro/<uuid>?formato=historia
 *
 * Este mismo endpoint alimenta dos cosas a la vez: la imagen que el encargado
 * descarga para mandar por WhatsApp, y la previsualización que las apps generan
 * solas al pegar el enlace (`openGraph.images` apunta aquí). Una sola plantilla
 * cubre los dos caminos.
 *
 * Corre en Node, no en Edge, porque sharp hace dos trabajos que aquí no son
 * opcionales: decodificar el WebP que satori ignora en silencio, y sacar el
 * resultado en JPEG. Una historia con foto pesa 885 KB en PNG y 102 KB en JPEG
 * —la diferencia entre una imagen que carga con mala red y otra que no—.
 */

import { ImageResponse } from "next/og";
import sharp from "sharp";
import { obtenerCentro, obtenerMascota, obtenerSolicitud } from "@/lib/datos";
import { esFormato, medidas } from "@/lib/tarjeta/formatos";
import { FUENTES } from "@/lib/tarjeta/fuentes";
import { fotoParaTarjeta } from "@/lib/tarjeta/foto";
import { qrDataUri } from "@/lib/tarjeta/qr";
import { urlPublica } from "@/lib/tarjeta/texto";
import { PlantillaCentro } from "@/lib/tarjeta/PlantillaCentro";
import { PlantillaMascota } from "@/lib/tarjeta/PlantillaMascota";
import { PlantillaSolicitud } from "@/lib/tarjeta/PlantillaSolicitud";

export const runtime = "nodejs";

const TIPOS = ["centro", "mascota", "solicitud"] as const;
type Tipo = (typeof TIPOS)[number];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tipo: string; id: string }> }
) {
  const { tipo, id } = await params;
  if (!TIPOS.includes(tipo as Tipo) || !UUID.test(id)) {
    return new Response("No encontrado", { status: 404 });
  }

  const q = new URL(req.url).searchParams;
  const pedido = q.get("formato");
  const formato = esFormato(pedido) ? pedido : "enlace";
  const anchoPedido = Number(q.get("ancho"));
  const m = medidas(
    formato,
    Number.isFinite(anchoPedido) && anchoPedido > 0 ? anchoPedido : undefined
  );

  const url = urlPublica(tipo as Tipo, id);
  const qr = await qrDataUri(url);

  // Ancho real al que se dibuja la foto: pedirla más grande solo cuesta tiempo.
  const anchoFoto = m.ancho - m.margen * 2;

  let elemento: React.ReactElement;
  let conFoto: boolean;

  if (tipo === "centro") {
    const c = await obtenerCentro(id);
    if (!c) return new Response("No encontrado", { status: 404 });
    const foto = formato === "historia" ? await fotoParaTarjeta(c.foto_url, anchoFoto) : null;
    conFoto = Boolean(foto);
    elemento = <PlantillaCentro c={c} m={m} qr={qr} foto={foto} />;
  } else if (tipo === "mascota") {
    const mascota = await obtenerMascota(id);
    if (!mascota) return new Response("No encontrado", { status: 404 });
    const foto = await fotoParaTarjeta(mascota.foto_url, anchoFoto);
    conFoto = Boolean(foto);
    elemento = <PlantillaMascota mascota={mascota} m={m} qr={qr} foto={foto} />;
  } else {
    const s = await obtenerSolicitud(id);
    if (!s) return new Response("No encontrado", { status: 404 });
    const foto = formato === "historia" ? await fotoParaTarjeta(s.foto_url, anchoFoto) : null;
    conFoto = Boolean(foto);
    elemento = <PlantillaSolicitud s={s} m={m} qr={qr} foto={foto} />;
  }

  const png = Buffer.from(
    await new ImageResponse(elemento, {
      width: m.ancho,
      height: m.alto,
      fonts: FUENTES,
    }).arrayBuffer()
  );

  // Sin foto, la tarjeta es texto sobre planos de color: PNG la comprime mejor
  // que JPEG y sin ensuciar los bordes de las letras. Con foto es al revés, y
  // por mucho.
  const cuerpo = conFoto
    ? await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toBuffer()
    : png;

  return new Response(new Uint8Array(cuerpo), {
    headers: {
      "content-type": conFoto ? "image/jpeg" : "image/png",
      // Cinco minutos en el CDN: el estado de un punto puede cambiar en
      // cualquier momento, pero regenerar la imagen en cada visita sería
      // gastar CPU para nada.
      "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
