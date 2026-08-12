/**
 * Búsqueda de direcciones sobre datos de OpenStreetMap, sin API key: una llave
 * que se agote o quede mal configurada dejaria el formulario inservible justo
 * cuando mas se usa.
 *
 * Dos proveedores con roles distintos:
 *  - Photon (Komoot) esta hecho para autocompletar y se usa mientras se
 *    escribe. Puede estar caido o bloqueado por la red del usuario.
 *  - Nominatim solo se consulta cuando la persona pide buscar explicitamente
 *    (Enter o el boton). Su politica de uso desaconseja el autocompletado, asi
 *    que nunca se dispara por tecla.
 *
 * Advertencia deliberada de diseño: el resultado NUNCA se guarda directo. Sirve
 * para volar el mapa a la zona; la coordenada final siempre la confirma la
 * persona moviendo el pin. La verificacion de los puntos sembrados mostro que
 * la geocodificacion en Colombia se equivoca por kilometros.
 */

export type Sugerencia = {
  etiqueta: string;
  detalle: string;
  lat: number;
  lng: number;
  fuente: "photon" | "nominatim";
};

// Centro aproximado de Colombia: sesga los resultados hacia el pais.
const SESGO = { lat: 4.6, lon: -74.1 };

const cache = new Map<string, Sugerencia[]>();

/**
 * Un servicio caido rara vez responde con error: se queda colgado. Sin un
 * limite propio, el respaldo nunca llega a ejecutarse y el buscador parece
 * roto. Cuatro segundos es tolerable incluso en una conexion mala.
 */
const LIMITE_MS = 4000;

function conLimite(senal?: AbortSignal): AbortSignal {
  const porTiempo = AbortSignal.timeout(LIMITE_MS);
  if (!senal) return porTiempo;
  // AbortSignal.any no existe en navegadores viejos: se degrada al del tiempo.
  return typeof AbortSignal.any === "function"
    ? AbortSignal.any([senal, porTiempo])
    : porTiempo;
}

type PhotonFeature = {
  properties: Record<string, string | undefined>;
  geometry: { coordinates: [number, number] };
};

/** Autocompletado mientras se escribe. Solo Photon. */
export async function autocompletar(
  consulta: string,
  senal?: AbortSignal
): Promise<{ resultados: Sugerencia[]; disponible: boolean }> {
  const q = consulta.trim();
  if (q.length < 3) return { resultados: [], disponible: true };

  const clave = `p:${q.toLowerCase()}`;
  const guardado = cache.get(clave);
  if (guardado) return { resultados: guardado, disponible: true };

  try {
    const r = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}` +
        `&limit=6&lang=es&lat=${SESGO.lat}&lon=${SESGO.lon}`,
      { signal: conLimite(senal) }
    );
    if (!r.ok) return { resultados: [], disponible: false };

    const j = await r.json();
    const salida: Sugerencia[] = (j.features ?? [])
      .filter((f: PhotonFeature) => f.properties?.countrycode === "CO")
      .map((f: PhotonFeature) => {
        const p = f.properties;
        return {
          etiqueta: nombreDe(p),
          detalle: [p.district, p.city, p.state].filter(Boolean).join(", "),
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          fuente: "photon" as const,
        };
      })
      .slice(0, 5);

    cache.set(clave, salida);
    return { resultados: salida, disponible: true };
  } catch (e) {
    // Cancelar por tecleo nuevo no dice nada del servicio; agotar el tiempo sí.
    if (e instanceof DOMException && e.name === "AbortError") {
      return { resultados: [], disponible: true };
    }
    return { resultados: [], disponible: false };
  }
}

/** Búsqueda explícita (Enter o botón). Photon y, si falla, Nominatim. */
export async function buscarDirecciones(
  consulta: string,
  senal?: AbortSignal
): Promise<Sugerencia[]> {
  const q = consulta.trim();
  if (q.length < 3) return [];

  const porPhoton = await autocompletar(q, senal);
  if (porPhoton.resultados.length > 0) return porPhoton.resultados;

  const clave = `n:${q.toLowerCase()}`;
  const guardado = cache.get(clave);
  if (guardado) return guardado;

  try {
    const r = await fetch(
      "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5" +
        `&countrycodes=co&accept-language=es&q=${encodeURIComponent(q)}`,
      { signal: conLimite(senal) }
    );
    if (!r.ok) return [];

    const j = await r.json();
    const salida: Sugerencia[] = (j ?? []).map(
      (x: { display_name: string; lat: string; lon: string }) => {
        const partes = x.display_name.split(",").map((s) => s.trim());
        return {
          etiqueta: partes[0] ?? x.display_name,
          detalle: partes.slice(1, 4).join(", "),
          lat: parseFloat(x.lat),
          lng: parseFloat(x.lon),
          fuente: "nominatim" as const,
        };
      }
    );

    cache.set(clave, salida);
    return salida;
  } catch {
    // Sin red o servicio caido: la persona siempre puede mover el pin a mano.
    return [];
  }
}

function nombreDe(p: Record<string, string | undefined>) {
  if (p.name) return p.name;
  if (p.street) return p.housenumber ? `${p.street} ${p.housenumber}` : p.street;
  return "Sin nombre";
}
