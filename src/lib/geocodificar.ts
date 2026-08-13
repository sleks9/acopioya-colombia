/**
 * Búsqueda de direcciones sobre datos de OpenStreetMap, sin API key.
 *
 * Dos proveedores con roles distintos:
 *  - Photon (Komoot) esta hecho para autocompletar y se usa mientras se
 *    escribe. Puede estar caido o bloqueado por la red del usuario.
 *  - Nominatim solo se consulta cuando la persona pide buscar explicitamente
 *    (Enter o el boton). Su politica de uso desaconseja el autocompletado, asi
 *    que nunca se dispara por tecla.
 *
 * Lo que hace que esto funcione en Colombia no es el proveedor, es el CONTEXTO.
 * Buscar "Carrera 21 # 33-58" a secas devuelve Bogota siempre, porque Bogota
 * domina los datos de OSM. La misma consulta con ", Tuluá, Valle del Cauca"
 * devuelve la calle correcta. Por eso el municipio que la persona ya eligio en
 * el formulario viaja en cada busqueda.
 *
 * Segundo hallazgo: el numero de placa ("# 33-58") casi nunca existe en OSM
 * para ciudades colombianas, pero la via SI. Si la busqueda completa falla, se
 * reintenta sin el numero y se ofrecen los tramos de la via.
 *
 * Advertencia de diseño que se mantiene: el resultado NUNCA se guarda como
 * definitivo. Sirve para dejar el mapa sobre la cuadra; la coordenada final
 * siempre la confirma la persona.
 */

export type Sugerencia = {
  etiqueta: string;
  detalle: string;
  lat: number;
  lng: number;
  fuente: "photon" | "nominatim";
  /** true cuando se resolvio la via pero no la placa exacta. */
  soloVia?: boolean;
};

/** Municipio elegido en el formulario: lo que vuelve util a la búsqueda. */
export type Contexto = {
  municipio?: string;
  departamento?: string;
  lat?: number;
  lng?: number;
};

const CENTRO_COLOMBIA = { lat: 4.6, lng: -74.1 };
const LIMITE_MS = 4000;
const cache = new Map<string, Sugerencia[]>();

function conLimite(senal?: AbortSignal): AbortSignal {
  const porTiempo = AbortSignal.timeout(LIMITE_MS);
  if (!senal) return porTiempo;
  return typeof AbortSignal.any === "function"
    ? AbortSignal.any([senal, porTiempo])
    : porTiempo;
}

/** Añade el municipio a la consulta si la persona no lo escribió ya. */
function consultaConContexto(q: string, ctx?: Contexto): string {
  if (!ctx?.municipio) return q;
  const norm = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (norm(q).includes(norm(ctx.municipio))) return q;
  return `${q}, ${ctx.municipio}${ctx.departamento ? `, ${ctx.departamento}` : ""}`;
}

/**
 * Quita el numero de placa colombiano: "# 33-58", "#33-58", "No. 33-58".
 * Devuelve null si no habia nada que quitar, para no repetir la misma busqueda.
 */
function sinNumeroDePlaca(q: string): string | null {
  const limpio = q
    .replace(/\s*(#|n[or]?\.?\s?°?)\s*\d+\s*[-–]\s*\d+\w*/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*,\s*,/g, ",")
    .trim();
  return limpio && limpio !== q.trim() ? limpio : null;
}

type PhotonFeature = {
  properties: Record<string, string | undefined>;
  geometry: { coordinates: [number, number] };
};

async function pedirPhoton(
  q: string,
  ctx: Contexto | undefined,
  senal: AbortSignal | undefined
): Promise<{ resultados: Sugerencia[]; disponible: boolean }> {
  const sesgo = {
    lat: ctx?.lat ?? CENTRO_COLOMBIA.lat,
    lng: ctx?.lng ?? CENTRO_COLOMBIA.lng,
  };
  try {
    const r = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}` +
        `&limit=8&lang=es&lat=${sesgo.lat}&lon=${sesgo.lng}`,
      { signal: conLimite(senal) }
    );
    if (!r.ok) return { resultados: [], disponible: false };

    const j = await r.json();
    const resultados: Sugerencia[] = (j.features ?? [])
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
      });

    return { resultados: priorizar(resultados, ctx).slice(0, 6), disponible: true };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return { resultados: [], disponible: true };
    }
    return { resultados: [], disponible: false };
  }
}

async function pedirNominatim(
  q: string,
  ctx: Contexto | undefined,
  senal: AbortSignal | undefined
): Promise<Sugerencia[]> {
  // Recuadro alrededor del municipio: prefiere resultados cercanos sin excluir
  // los de afuera, por si la persona escribio una referencia vecina.
  let recuadro = "";
  if (ctx?.lat != null && ctx?.lng != null) {
    const d = 0.25;
    recuadro =
      `&viewbox=${ctx.lng - d},${ctx.lat + d},${ctx.lng + d},${ctx.lat - d}` +
      `&bounded=0`;
  }

  try {
    const r = await fetch(
      "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8" +
        `&countrycodes=co&accept-language=es${recuadro}&q=${encodeURIComponent(q)}`,
      { signal: conLimite(senal) }
    );
    if (!r.ok) return [];

    const j = await r.json();
    const resultados: Sugerencia[] = (j ?? []).map(
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
    return priorizar(resultados, ctx).slice(0, 6);
  } catch {
    return [];
  }
}

/** Lo que cae dentro del municipio elegido va primero. */
function priorizar(lista: Sugerencia[], ctx?: Contexto): Sugerencia[] {
  if (!ctx?.municipio) return lista;
  const norm = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const objetivo = norm(ctx.municipio);
  const dentro = (s: Sugerencia) => norm(`${s.etiqueta} ${s.detalle}`).includes(objetivo);
  return [...lista.filter(dentro), ...lista.filter((s) => !dentro(s))];
}

/** Autocompletado mientras se escribe. Solo Photon. */
export async function autocompletar(
  consulta: string,
  ctx?: Contexto,
  senal?: AbortSignal
): Promise<{ resultados: Sugerencia[]; disponible: boolean }> {
  const q = consulta.trim();
  if (q.length < 3) return { resultados: [], disponible: true };

  const conCtx = consultaConContexto(q, ctx);
  const clave = `p:${conCtx.toLowerCase()}`;
  const guardado = cache.get(clave);
  if (guardado) return { resultados: guardado, disponible: true };

  const primero = await pedirPhoton(conCtx, ctx, senal);
  if (!primero.disponible) return primero;

  if (primero.resultados.length > 0) {
    cache.set(clave, primero.resultados);
    return primero;
  }

  // Sin resultados con placa: reintentar con la via sola.
  const via = sinNumeroDePlaca(conCtx);
  if (!via) return primero;

  const segundo = await pedirPhoton(via, ctx, senal);
  const marcados = segundo.resultados.map((s) => ({ ...s, soloVia: true }));
  if (marcados.length > 0) cache.set(clave, marcados);
  return { resultados: marcados, disponible: segundo.disponible };
}

/** Búsqueda explícita (Enter o botón). Photon y, si falla, Nominatim. */
export async function buscarDirecciones(
  consulta: string,
  ctx?: Contexto,
  senal?: AbortSignal
): Promise<Sugerencia[]> {
  const q = consulta.trim();
  if (q.length < 3) return [];

  const porPhoton = await autocompletar(q, ctx, senal);
  if (porPhoton.resultados.length > 0) return porPhoton.resultados;

  const conCtx = consultaConContexto(q, ctx);
  const clave = `n:${conCtx.toLowerCase()}`;
  const guardado = cache.get(clave);
  if (guardado) return guardado;

  let resultados = await pedirNominatim(conCtx, ctx, senal);

  if (resultados.length === 0) {
    const via = sinNumeroDePlaca(conCtx);
    if (via) {
      resultados = (await pedirNominatim(via, ctx, senal)).map((s) => ({
        ...s,
        soloVia: true,
      }));
    }
  }

  // Solo se guardan resultados utiles: cachear un vacio por un corte de red
  // dejaba la busqueda rota para siempre, aunque el servicio ya respondiera.
  if (resultados.length > 0) cache.set(clave, resultados);
  return resultados;
}

function nombreDe(p: Record<string, string | undefined>) {
  if (p.name) return p.name;
  if (p.street) return p.housenumber ? `${p.street} ${p.housenumber}` : p.street;
  return "Sin nombre";
}
