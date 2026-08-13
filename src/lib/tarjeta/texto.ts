/**
 * Recortes y los mensajes que acompañan a la imagen.
 *
 * La imagen viaja sola en un estado de WhatsApp, pero cuando se comparte en un
 * chat va con texto, y ese texto tiene que decir lo mismo. Sin emojis, igual
 * que el resto del producto.
 */

import type { Centro } from "@/lib/tipos";
import { jornadaVigente, nombreInsumo, textoJornada } from "@/lib/tipos";
import type { Mascota } from "@/lib/mascotas";
import { haceDias, nombreEspecie, tituloMascota } from "@/lib/mascotas";
import type { Solicitud } from "@/lib/solicitudes";
import { nombreNecesidad, URGENCIAS } from "@/lib/solicitudes";
import { origen } from "./marca";

/** Corta por palabras y cierra con puntos suspensivos; nunca parte una palabra. */
export function recortar(t: string, max: number): string {
  const limpio = t.trim().replace(/\s+/g, " ");
  if (limpio.length <= max) return limpio;
  const corte = limpio.slice(0, max - 1);
  const espacio = corte.lastIndexOf(" ");
  const base = espacio > max * 0.6 ? corte.slice(0, espacio) : corte;
  // Sin la limpieza, un corte tras un punto deja cuatro seguidos: "derecho...."
  return base.replace(/[\s.,;:·-]+$/, "") + "…";
}

/**
 * Los catálogos tienen 12 y 16 entradas. Un punto que marque todas convierte la
 * tarjeta en un muro de texto ilegible en miniatura, así que se muestran unas
 * pocas y se cuenta el resto.
 */
export function primeros(ids: string[], cuantos: number, nombre: (id: string) => string) {
  return { visibles: ids.slice(0, cuantos).map(nombre), resto: Math.max(0, ids.length - cuantos) };
}

export function listaLegible(nombres: string[], resto = 0): string {
  const base = nombres.join(", ");
  return resto > 0 ? `${base} y ${resto} más` : base;
}

export type TextosCompartir = { whatsapp: string; x: string; plano: string; titulo: string };

/**
 * Solo los campos que cada mensaje usa de verdad.
 *
 * Los paneles del enlace mágico trabajan con una versión recortada de cada
 * entidad —la RPC por token no devuelve la fila entera—, y pedir el tipo
 * completo obligaría a una consulta extra solo para armar un texto. Con esto
 * la misma función sirve en la ficha pública y en el panel.
 */
export type DatosCentro = Pick<
  Centro,
  "id" | "nombre" | "estado" | "direccion" | "ciudad" | "departamento" | "necesita" | "no_necesita" | "horario"
> &
  Partial<Pick<Centro, "jornada_inicio" | "jornada_fin">>;

export type DatosMascota = Pick<
  Mascota,
  "id" | "caso" | "especie" | "nombre" | "color" | "municipio" | "departamento" | "dias_desde" | "senas" | "estado"
> & { telefono_publico?: string | null };

export type DatosSolicitud = Pick<
  Solicitud,
  "id" | "titulo" | "urgencia" | "barrio_vereda" | "municipio" | "necesita" | "personas" | "estado"
> & { telefono_publico?: string | null };

export function urlPublica(tipo: "centro" | "mascota" | "solicitud", id: string) {
  return `${origen()}/${tipo}/${id}`;
}

const CIERRE = "Verifica antes de salir:";

export function textosCentro(c: DatosCentro): TextosCompartir {
  const url = urlPublica("centro", c.id);
  const estado =
    c.estado === "abierto" ? "ABIERTO" : c.estado === "lleno" ? "LLENO, no llevar más" : "CERRADO";
  const si = primeros(c.necesita, 4, nombreInsumo);
  const no = primeros(c.no_necesita, 3, nombreInsumo);

  const lineas = [
    `*${c.nombre}* · Centro de acopio ${estado}`,
    `${c.direccion} · ${c.ciudad}, ${c.departamento}`,
  ];
  // La jornada arriba del todo: es lo que hace que el mensaje valga la pena.
  const jornada = jornadaVigente({
    jornada_inicio: c.jornada_inicio ?? null,
    jornada_fin: c.jornada_fin ?? null,
  });
  if (jornada) {
    lineas.push(`*${jornada.enCurso ? "Jornada en curso" : "Jornada especial"}:* ${textoJornada(jornada.inicio, jornada.fin)}`);
  }

  if (si.visibles.length) lineas.push("", `*Están recibiendo:* ${listaLegible(si.visibles, si.resto)}`);
  if (no.visibles.length) lineas.push(`*NO llevar:* ${listaLegible(no.visibles, no.resto)}`);
  if (c.horario) lineas.push("", `Horario: ${c.horario}`);
  lineas.push("", CIERRE, url);

  const xBase = `Centro de acopio ${estado} en ${c.ciudad}: ${c.nombre}.`;
  const xSi = si.visibles.length ? ` Reciben ${listaLegible(si.visibles.slice(0, 3)).toLowerCase()}.` : "";
  const xNo = no.visibles.length ? ` NO llevar ${listaLegible(no.visibles.slice(0, 2)).toLowerCase()}.` : "";

  return {
    titulo: `${c.nombre} · ${c.ciudad}`,
    whatsapp: lineas.join("\n"),
    x: `${recortar(xBase + xSi + xNo, 250)} ${url}`,
    plano: lineas.join("\n").replace(/\*/g, ""),
  };
}

export function textosMascota(m: DatosMascota): TextosCompartir {
  const url = urlPublica("mascota", m.id);
  const titulo = tituloMascota(m);
  const que = m.caso === "perdida" ? "SE PERDIÓ" : "LA ENCONTRARON";

  const lineas = [
    `*${que}* · ${titulo}`,
    `${nombreEspecie(m.especie)} · ${m.color}`,
    `${m.municipio}, ${m.departamento} · ${haceDias(m.dias_desde)}`,
  ];
  if (m.senas) lineas.push("", `Señas: ${recortar(m.senas, 160)}`);
  if (m.telefono_publico) lineas.push("", `Contacto: ${m.telefono_publico}`);
  lineas.push(
    "",
    m.estado === "reunida" ? "Ya volvió a casa." : "Si lo ves, avisa:",
    url
  );

  return {
    titulo: `${que.toLowerCase()} ${titulo}`,
    whatsapp: lineas.join("\n"),
    x: `${recortar(
      `${que} en ${m.municipio}: ${titulo}, ${nombreEspecie(m.especie).toLowerCase()} ${m.color.toLowerCase()}. ${haceDias(m.dias_desde)}.`,
      250
    )} ${url}`,
    plano: lineas.join("\n").replace(/\*/g, ""),
  };
}

export function textosSolicitud(s: DatosSolicitud): TextosCompartir {
  const url = urlPublica("solicitud", s.id);
  const nec = primeros(s.necesita, 4, nombreNecesidad);

  const lineas = [
    `*${s.titulo}*`,
    `Urgencia ${URGENCIAS[s.urgencia].nombre.toLowerCase()} · ${s.barrio_vereda}, ${s.municipio}`,
  ];
  if (nec.visibles.length) lineas.push("", `*Necesitan:* ${listaLegible(nec.visibles, nec.resto)}`);
  if (s.personas) lineas.push(`${s.personas} personas beneficiadas`);
  if (s.telefono_publico) lineas.push("", `Contacto: ${s.telefono_publico}`);
  lineas.push("", s.estado === "cubierta" ? "Ya está cubierta." : "Si puedes ayudar:", url);

  return {
    titulo: recortar(s.titulo, 70),
    whatsapp: lineas.join("\n"),
    x: `${recortar(
      `${s.titulo} — ${s.barrio_vereda}, ${s.municipio}. Necesitan ${listaLegible(
        nec.visibles.slice(0, 3)
      ).toLowerCase()}.`,
      250
    )} ${url}`,
    plano: lineas.join("\n").replace(/\*/g, ""),
  };
}
