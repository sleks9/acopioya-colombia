import "server-only";
import { supabase } from "./supabase";
import type { Centro } from "./tipos";

/**
 * Columnas explicitas en vez de `*`. Con ISR la base se consulta una vez por
 * minuto sin importar cuanta gente entre, asi que el trafico hacia Supabase
 * depende solo del tamaño de esta consulta, no de las visitas.
 */
const COLUMNAS = [
  "id", "nombre", "direccion", "ciudad", "departamento",
  "lat", "lng", "precision", "precision_metros",
  "operador", "tipo_operador", "horario", "telefono_publico",
  "estado", "necesita", "no_necesita", "notas",
  "verificacion", "foto_url", "confirmaciones", "reportes_negativos",
  "creado", "actualizado", "frescura",
].join(",");

/**
 * Los puntos "viejos" (>24h sin tocar) no se piden aqui: salen del mapa por
 * defecto. Se recuperan con `incluirViejos` desde el filtro de la interfaz.
 */
export async function obtenerCentros(incluirViejos = false): Promise<Centro[]> {
  let q = supabase
    .from("centros_publicos")
    .select(COLUMNAS)
    .order("actualizado", { ascending: false });

  if (!incluirViejos) q = q.neq("frescura", "viejo");

  const { data, error } = await q;
  if (error) {
    console.error("obtenerCentros:", error.message);
    return [];
  }
  return (data ?? []) as unknown as Centro[];
}

export async function obtenerCentro(id: string): Promise<Centro | null> {
  const { data, error } = await supabase
    .from("centros_publicos")
    .select(COLUMNAS)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("obtenerCentro:", error.message);
    return null;
  }
  return (data as unknown as Centro) ?? null;
}

export type EventoHistorial = {
  tipo: string;
  detalle: Record<string, unknown> | null;
  creado: string;
};

export async function obtenerHistorial(id: string): Promise<EventoHistorial[]> {
  const { data, error } = await supabase.rpc("historial_centro", {
    p_centro_id: id,
  });
  if (error) {
    console.error("obtenerHistorial:", error.message);
    return [];
  }
  return (data ?? []) as EventoHistorial[];
}
