"use client";

import {
  useCallback, useEffect, useMemo, useRef, useState, type ComponentType,
} from "react";
import {
  AlertCircle, Crosshair, Loader2, MapIcon, MapPin, Search, X,
} from "lucide-react";
import {
  autocompletar, buscarDirecciones, type Contexto, type Sugerencia,
} from "@/lib/geocodificar";
import type { Precision } from "@/lib/tipos";

export type UbicacionElegida = {
  lat: number;
  lng: number;
  precision: Precision;
  precisionMetros: number | null;
};

type PropsMapa = {
  inicial: { lat: number; lng: number; zoom: number };
  onMover: (lat: number, lng: number) => void;
};

/**
 * Tres caminos hacia la misma coordenada, porque en una emergencia cualquiera
 * puede fallar: el GPS del telefono, buscar la direccion, o ajustar el pin.
 *
 * El mapa NO se carga de entrada. MapLibre pesa 1 MB y la mayoria resuelve con
 * "Estoy aqui" en dos toques; obligar a todos a descargarlo hace que el
 * formulario parezca colgado en una red lenta, que es la condicion normal en
 * zona de desastre.
 */
export default function SelectorUbicacion({
  centroSugerido,
  municipio,
  departamento,
  onCambio,
}: {
  /** Cabecera del municipio elegido: da un punto de partida al mapa. */
  centroSugerido: { lat: number; lng: number } | null;
  /** Sin esto, buscar "Carrera 21 # 33-58" devuelve Bogotá siempre. */
  municipio?: string;
  departamento?: string;
  onCambio: (u: UbicacionElegida) => void;
}) {
  const abortar = useRef<AbortController | null>(null);

  const [coords, setCoords] = useState<UbicacionElegida | null>(null);
  const [consulta, setConsulta] = useState("");
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [autoDisponible, setAutoDisponible] = useState(true);
  const [sinResultados, setSinResultados] = useState(false);
  const [ubicando, setUbicando] = useState(false);
  const [errorGeo, setErrorGeo] = useState("");

  // Carga bajo demanda, con estado de error propio: un `dynamic` con solo
  // `loading` se queda mostrando "Cargando…" para siempre si el chunk falla.
  const [Mapa, setMapa] = useState<ComponentType<PropsMapa> | null>(null);
  const [cargandoMapa, setCargandoMapa] = useState(false);
  const [errorMapa, setErrorMapa] = useState(false);

  const fijar = useCallback(
    (u: UbicacionElegida) => {
      setCoords(u);
      onCambio(u);
    },
    [onCambio]
  );

  const contexto: Contexto = useMemo(
    () => ({
      municipio,
      departamento,
      lat: centroSugerido?.lat,
      lng: centroSugerido?.lng,
    }),
    [municipio, departamento, centroSugerido]
  );

  async function abrirMapa() {
    if (Mapa || cargandoMapa) return;
    setCargandoMapa(true);
    setErrorMapa(false);
    try {
      const mod = await import("./MapaPin");
      setMapa(() => mod.default);
    } catch {
      setErrorMapa(true);
    } finally {
      setCargandoMapa(false);
    }
  }

  // Autocompletado con freno: 550 ms y minimo 3 caracteres, para no castigar
  // una conexion lenta con una peticion por tecla.
  useEffect(() => {
    if (consulta.trim().length < 3) {
      setSugerencias([]);
      setSinResultados(false);
      return;
    }
    if (!autoDisponible) return;

    const t = setTimeout(async () => {
      abortar.current?.abort();
      abortar.current = new AbortController();
      setBuscando(true);
      const { resultados, disponible } = await autocompletar(
        consulta, contexto, abortar.current.signal
      );
      setBuscando(false);
      setAutoDisponible(disponible);
      if (disponible) {
        setSugerencias(resultados);
        setSinResultados(resultados.length === 0);
        setAbierto(resultados.length > 0);
      }
    }, 550);
    return () => clearTimeout(t);
  }, [consulta, autoDisponible, contexto]);

  async function buscarAhora() {
    if (consulta.trim().length < 3) return;
    // Sin señal de cancelación: la búsqueda explícita la pidió la persona y no
    // debe morir porque el autocompletado dispare justo después.
    abortar.current?.abort();
    abortar.current = null;
    setBuscando(true);
    const r = await buscarDirecciones(consulta, contexto);
    setBuscando(false);
    setSugerencias(r);
    setSinResultados(r.length === 0);
    setAbierto(r.length > 0);
  }

  function irA(s: Sugerencia) {
    setConsulta(s.etiqueta);
    setAbierto(false);
    setSugerencias([]);
    fijar({ lat: s.lat, lng: s.lng, precision: "geocodificada", precisionMetros: null });
  }

  function usarGps() {
    setErrorGeo("");
    if (!navigator.geolocation) {
      setErrorGeo("Tu navegador no permite compartir la ubicación.");
      return;
    }
    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setUbicando(false);
        const { latitude, longitude, accuracy } = p.coords;
        fijar({
          lat: latitude,
          lng: longitude,
          precision: "gps",
          precisionMetros: Math.round(accuracy),
        });
      },
      (e) => {
        setUbicando(false);
        setErrorGeo(
          e.code === e.PERMISSION_DENIED
            ? "Permiso denegado. Busca la dirección o ajusta el punto en el mapa."
            : "No pudimos obtener tu ubicación. Busca la dirección o usa el mapa."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // Punto de partida del mapa: lo ya elegido, si no la cabecera municipal,
  // si no el centro del pais.
  const inicial = coords
    ? { lat: coords.lat, lng: coords.lng, zoom: 16 }
    : centroSugerido
      ? { ...centroSugerido, zoom: 13 }
      : { lat: 4.6, lng: -74.1, zoom: 4.6 };

  return (
    <div className="space-y-2.5">
      {/* 1. GPS: el camino mas rapido y el mas exacto, sin descargar nada. */}
      <button
        type="button"
        onClick={usarGps}
        disabled={ubicando}
        className="presionable flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primario)] px-4 font-semibold text-[var(--sobre-primario)] disabled:opacity-60"
      >
        {ubicando ? (
          <Loader2 size={18} className="animate-spin" aria-hidden />
        ) : (
          <Crosshair size={18} aria-hidden />
        )}
        {ubicando ? "Ubicando…" : "Estoy en el lugar ahora"}
      </button>

      <p className="text-center text-xs text-[var(--texto-suave)]">
        o busca la dirección
      </p>

      {/* Sin municipio, la busqueda devuelve Bogota casi siempre. */}
      {!municipio && (
        <p className="flex items-start gap-2 rounded-xl bg-[var(--acento-fondo)] px-3 py-2.5 text-sm text-[var(--acento)]">
          <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden />
          Elige primero el departamento y el municipio arriba: sin eso la
          búsqueda devuelve resultados de otras ciudades.
        </p>
      )}

      {/* 2. Buscador de direcciones, tampoco necesita el mapa. */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--texto-suave)]"
              size={18}
              aria-hidden
            />
            <input
              type="text"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  buscarAhora();
                }
              }}
              onFocus={() => sugerencias.length && setAbierto(true)}
              placeholder="Dirección, barrio o lugar…"
              aria-label="Buscar dirección"
              autoComplete="off"
              className="min-h-12 w-full rounded-xl border border-[var(--borde)] bg-[var(--superficie)] py-3 pl-10 pr-10 text-base"
            />
            {buscando && (
              <Loader2
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--texto-suave)]"
                size={18}
                aria-hidden
              />
            )}
            {!buscando && consulta && (
              <button
                type="button"
                onClick={() => {
                  setConsulta("");
                  setSugerencias([]);
                  setSinResultados(false);
                }}
                aria-label="Borrar búsqueda"
                className="presionable absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[var(--texto-suave)]"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={buscarAhora}
            disabled={buscando || consulta.trim().length < 3}
            className="presionable min-h-12 shrink-0 rounded-xl border border-[var(--borde-fuerte)] bg-[var(--superficie)] px-4 text-sm font-semibold disabled:opacity-50"
          >
            Buscar
          </button>
        </div>

        {abierto && sugerencias.length > 0 && (
          <ul
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-[var(--borde)] bg-[var(--superficie)] shadow-[var(--sombra-3)]"
            role="listbox"
            aria-label="Resultados de búsqueda"
          >
            {sugerencias.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => irA(s)}
                  className="flex w-full items-start gap-2.5 px-3 py-3 text-left hover:bg-[var(--superficie-2)]"
                >
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--texto-suave)]" aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{s.etiqueta}</span>
                    {s.detalle && (
                      <span className="block truncate text-xs text-[var(--texto-suave)]">
                        {s.detalle}
                      </span>
                    )}
                    {/* El numero de placa casi nunca esta en OSM: si solo se
                        resolvio la via, hay que decirlo y no fingir precision. */}
                    {s.soloVia && (
                      <span className="mt-0.5 block text-xs text-[var(--acento)]">
                        Solo la vía, sin el número — ajusta el pin después
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {sinResultados && (
        <p className="text-xs text-[var(--texto-suave)]">
          No encontramos esa dirección. Ajusta el punto en el mapa: es igual de
          válido y no depende de que el buscador la conozca.
        </p>
      )}

      {errorGeo && (
        <p role="alert" className="flex items-start gap-2 text-sm text-[var(--peligro)]">
          <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden />
          {errorGeo}
        </p>
      )}

      {/* 3. Mapa: solo si hace falta afinar. Aqui se descarga MapLibre. */}
      {!Mapa && (
        <button
          type="button"
          onClick={abrirMapa}
          disabled={cargandoMapa}
          className="presionable flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--borde-fuerte)] bg-[var(--superficie)] px-4 text-sm font-semibold disabled:opacity-60"
        >
          {cargandoMapa ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <MapIcon size={16} aria-hidden />
          )}
          {cargandoMapa
            ? "Cargando el mapa…"
            : coords
              ? "Ajustar el punto en el mapa"
              : "Marcar el punto en el mapa"}
        </button>
      )}

      {cargandoMapa && (
        <p className="text-center text-xs text-[var(--texto-suave)]">
          El mapa pesa cerca de 1 MB. Con red lenta puede tardar; el resto del
          formulario ya funciona.
        </p>
      )}

      {errorMapa && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-[var(--acento-fondo)] px-3 py-2.5 text-sm text-[var(--acento)]">
          <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden />
          No se pudo cargar el mapa. Usa <strong>Estoy en el lugar ahora</strong>{" "}
          o el buscador de direcciones: funcionan igual y el reporte queda válido.
        </p>
      )}

      {Mapa && (
        <>
          <Mapa
            inicial={inicial}
            onMover={(lat, lng) =>
              fijar({ lat, lng, precision: "manual", precisionMetros: null })
            }
          />
          <p className="text-xs text-[var(--texto-suave)]">
            Mueve el mapa hasta que el pin quede sobre la entrada del lugar.
          </p>
        </>
      )}

      {/* Estado actual, siempre visible. */}
      <div className="rounded-xl bg-[var(--superficie-2)] px-3 py-2.5 text-sm">
        {coords ? (
          <>
            <p className="font-medium">
              {coords.precision === "gps"
                ? "Ubicación tomada del GPS"
                : coords.precision === "geocodificada"
                  ? "Ubicación del buscador"
                  : "Ubicación marcada en el mapa"}
              {coords.precisionMetros != null && (
                <span className="tabular text-[var(--texto-suave)]">
                  {" "}(±{coords.precisionMetros} m)
                </span>
              )}
            </p>
            <p className="tabular mt-0.5 text-xs text-[var(--texto-suave)]">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          </>
        ) : (
          <p className="text-[var(--texto-suave)]">
            Todavía sin ubicación. Con una de las tres opciones de arriba basta.
          </p>
        )}
      </div>
    </div>
  );
}
