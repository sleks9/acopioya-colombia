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

// ── Solicitudes de ayuda ──────────────────────────────────────────────────

export type ResultadoSolicitud =
  | { ok: true; id: string; token: string }
  | { ok: false; error: string };

export async function crearSolicitud(formData: FormData): Promise<ResultadoSolicitud> {
  const texto = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };

  const titulo = texto("titulo");
  const descripcion = texto("descripcion");
  const tipo = texto("tipo");
  const departamento = texto("departamento");
  const municipio = texto("ciudad");
  const barrio = texto("barrio_vereda");
  const necesita = formData.getAll("necesita").map(String).filter(Boolean);
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const personas = Number(formData.get("personas"));

  if (!titulo || !descripcion || !tipo || !departamento || !municipio || !barrio) {
    return { ok: false, error: "Faltan datos obligatorios." };
  }
  if (necesita.length === 0) {
    return { ok: false, error: "Marca al menos una necesidad." };
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, error: "Marca la zona en el mapa." };
  }

  const contactoPublico = formData.get("contacto_publico") === "on";

  const { data, error } = await supabase.rpc("crear_solicitud", {
    p_titulo: titulo,
    p_descripcion: descripcion,
    p_tipo: tipo,
    p_departamento: departamento,
    p_municipio: municipio,
    p_barrio_vereda: barrio,
    p_lat: lat,
    p_lng: lng,
    p_necesita: necesita,
    p_urgencia: texto("urgencia") ?? "normal",
    p_personas: Number.isFinite(personas) && personas > 0 ? Math.round(personas) : null,
    p_foto_url: texto("foto_url"),
    p_telefono: contactoPublico ? texto("telefono") : null,
    p_contacto_publico: contactoPublico,
    p_ip_hash: await hashIp(),
  });

  if (error) return { ok: false, error: error.message };

  const fila = Array.isArray(data) ? data[0] : data;
  if (!fila?.id || !fila?.token) {
    return { ok: false, error: "No se pudo publicar la solicitud." };
  }

  revalidatePath("/solicitudes");
  return { ok: true, id: fila.id as string, token: fila.token as string };
}

export async function votarSolicitud(
  id: string,
  voto: "confirmacion" | "reporte"
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.rpc("votar_solicitud", {
    p_id: id,
    p_voto: voto,
    p_ip_hash: await hashIp(),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/solicitudes");
  revalidatePath(`/solicitud/${id}`);
  return { ok: true };
}

export async function obtenerSolicitudPorToken(token: string) {
  const { data, error } = await supabase.rpc("solicitud_por_token", { p_token: token });
  if (error) {
    console.error("obtenerSolicitudPorToken:", error.message);
    return null;
  }
  const fila = Array.isArray(data) ? data[0] : data;
  return fila ?? null;
}

export async function actualizarSolicitud(
  token: string,
  campos: { estado?: string; descripcion?: string | null; necesita?: string[]; urgencia?: string; foto_url?: string | null }
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.rpc("actualizar_solicitud", {
    p_token: token,
    p_estado: campos.estado ?? null,
    p_descripcion: campos.descripcion ?? null,
    p_necesita: campos.necesita ?? null,
    p_urgencia: campos.urgencia ?? null,
    p_foto_url: campos.foto_url ?? null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/solicitudes");
  return { ok: true };
}

// ── Mascotas ──────────────────────────────────────────────────────────────

export type ResultadoMascota =
  | { ok: true; id: string; token: string }
  | { ok: false; error: string };

export async function reportarMascota(
  formData: FormData
): Promise<ResultadoMascota> {
  const texto = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };

  const caso = texto("caso");
  const especie = texto("especie");
  const color = texto("color");
  const fotoUrl = texto("foto_url");
  const departamento = texto("departamento");
  const municipio = texto("ciudad");
  const fecha = texto("fecha_suceso");
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));

  if (!caso || !especie || !color || !departamento || !municipio || !fecha) {
    return { ok: false, error: "Faltan datos obligatorios." };
  }
  // Sin foto no se puede reconocer al animal: se corta aquí y no en la base.
  if (!fotoUrl) {
    return { ok: false, error: "La foto es obligatoria: sin ella nadie puede reconocerlo." };
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, error: "Marca en el mapa dónde fue." };
  }

  const contactoPublico = formData.get("contacto_publico") === "on";

  const { data, error } = await supabase.rpc("crear_mascota", {
    p_caso: caso,
    p_especie: especie,
    p_color: color,
    p_foto_url: fotoUrl,
    p_departamento: departamento,
    p_municipio: municipio,
    p_lat: lat,
    p_lng: lng,
    p_fecha_suceso: fecha,
    p_nombre: texto("nombre"),
    p_sexo: texto("sexo") ?? "desconocido",
    p_tamano: texto("tamano") ?? "mediano",
    p_senas: texto("senas"),
    p_chip_placa: texto("chip_placa"),
    p_telefono: contactoPublico ? texto("telefono") : null,
    p_contacto_publico: contactoPublico,
    p_ip_hash: await hashIp(),
  });

  if (error) return { ok: false, error: error.message };

  const fila = Array.isArray(data) ? data[0] : data;
  if (!fila?.id || !fila?.token) {
    return { ok: false, error: "No se pudo publicar el reporte." };
  }

  revalidatePath("/mascotas");
  return { ok: true, id: fila.id as string, token: fila.token as string };
}

/** "¡Apareció!" abierto a cualquiera: es lo que evita que el listado envejezca. */
export async function avisarMascota(
  id: string,
  aviso: "reunida" | "reporte"
): Promise<{ ok: boolean; estado?: string; error?: string }> {
  const { data, error } = await supabase.rpc("avisar_mascota", {
    p_id: id,
    p_aviso: aviso,
    p_ip_hash: await hashIp(),
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/mascotas");
  revalidatePath(`/mascota/${id}`);
  return { ok: true, estado: data as string };
}

export async function obtenerMascotaPorToken(token: string) {
  const { data, error } = await supabase.rpc("mascota_por_token", { p_token: token });
  if (error) {
    console.error("obtenerMascotaPorToken:", error.message);
    return null;
  }
  const fila = Array.isArray(data) ? data[0] : data;
  return fila ?? null;
}

export async function actualizarMascota(
  token: string,
  campos: { estado?: string; senas?: string | null; foto_url?: string | null }
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.rpc("actualizar_mascota", {
    p_token: token,
    p_estado: campos.estado ?? null,
    p_senas: campos.senas ?? null,
    p_foto_url: campos.foto_url ?? null,
    p_telefono: null,
    p_contacto_publico: null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/mascotas");
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
