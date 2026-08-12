"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

/**
 * La IP nunca se guarda en claro: solo su hash con sal. Alcanza para limitar
 * abuso por conexion sin conservar un dato personal identificable.
 */
async function hashIp(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "desconocida";
  const sal = process.env.IP_SALT ?? "sal-por-defecto";
  return createHash("sha256").update(`${sal}:${ip}`).digest("hex").slice(0, 32);
}

export type ResultadoReporte =
  | { ok: true; id: string; token: string }
  | { ok: false; error: string };

export async function reportarCentro(
  formData: FormData
): Promise<ResultadoReporte> {
  const texto = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };
  const lista = (k: string) => formData.getAll(k).map(String).filter(Boolean);

  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const nombre = texto("nombre");
  const direccion = texto("direccion");
  const ciudad = texto("ciudad");
  const departamento = texto("departamento");

  if (!nombre || !direccion || !ciudad || !departamento) {
    return { ok: false, error: "Faltan datos obligatorios." };
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, error: "Marca la ubicación en el mapa." };
  }

  const telefono = texto("telefono");
  const contactoPublico = formData.get("contacto_publico") === "on";

  // Procedencia de la coordenada. El servidor solo acepta las tres que el
  // cliente puede producir de verdad; 'aproximada' se reserva a la siembra.
  const precisionCruda = texto("precision") ?? "manual";
  const precision = ["gps", "manual", "geocodificada"].includes(precisionCruda)
    ? precisionCruda
    : "manual";
  const metros = Number(formData.get("precision_metros"));

  // Sin consentimiento explicito el telefono ni siquiera se envia.
  const { data, error } = await supabase.rpc("crear_centro", {
    p_nombre: nombre,
    p_direccion: direccion,
    p_ciudad: ciudad,
    p_departamento: departamento,
    p_lat: lat,
    p_lng: lng,
    p_horario: texto("horario"),
    p_notas: texto("notas"),
    p_necesita: lista("necesita"),
    p_no_necesita: lista("no_necesita"),
    p_telefono: contactoPublico ? telefono : null,
    p_contacto_publico: contactoPublico,
    p_foto_url: texto("foto_url"),
    p_ip_hash: await hashIp(),
    p_precision: precision,
    p_precision_metros: Number.isFinite(metros) && metros > 0 ? Math.round(metros) : null,
  });

  if (error) return { ok: false, error: error.message };

  const fila = Array.isArray(data) ? data[0] : data;
  if (!fila?.id || !fila?.token) {
    return { ok: false, error: "No se pudo crear el punto." };
  }

  revalidatePath("/");
  return { ok: true, id: fila.id as string, token: fila.token as string };
}

export type CentroPropio = {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  horario: string | null;
  estado: string;
  necesita: string[];
  no_necesita: string[];
  notas: string | null;
  foto_url: string | null;
  verificacion: string;
  actualizado: string;
};

/** Carga la ficha propia a partir del enlace mágico. */
export async function obtenerCentroPorToken(
  token: string
): Promise<CentroPropio | null> {
  const { data, error } = await supabase.rpc("centro_por_token", {
    p_token: token,
  });
  if (error) {
    console.error("obtenerCentroPorToken:", error.message);
    return null;
  }
  const fila = Array.isArray(data) ? data[0] : data;
  return (fila as CentroPropio) ?? null;
}

export async function actualizarCentro(
  token: string,
  campos: {
    estado?: string;
    necesita?: string[];
    no_necesita?: string[];
    horario?: string | null;
    notas?: string | null;
    foto_url?: string | null;
  }
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.rpc("actualizar_centro", {
    p_token: token,
    p_estado: campos.estado ?? null,
    p_necesita: campos.necesita ?? null,
    p_no_necesita: campos.no_necesita ?? null,
    p_horario: campos.horario ?? null,
    p_notas: campos.notas ?? null,
    p_foto_url: campos.foto_url ?? null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  return { ok: true };
}

/** Confirmar o desmentir un punto. Es el motor de la auto-moderacion. */
export async function votarCentro(
  centroId: string,
  voto: "confirmacion" | "reporte"
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.rpc("votar_centro", {
    p_centro_id: centroId,
    p_voto: voto,
    p_ip_hash: await hashIp(),
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath(`/centro/${centroId}`);
  return { ok: true };
}
