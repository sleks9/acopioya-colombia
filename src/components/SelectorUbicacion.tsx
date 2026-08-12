"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Crosshair, Loader2, MapPin, Search, X } from "lucide-react";
import { autocompletar, buscarDirecciones, type Sugerencia } from "@/lib/geocodificar";
import { estiloMapa } from "@/lib/estiloMapa";
import type { Precision } from "@/lib/tipos";

export type UbicacionElegida = {
  lat: number;
  lng: number;
  precision: Precision;
  precisionMetros: number | null;
};

/**
 * Patron de Uber/inDrive: el pin vive fijo en el centro de la pantalla y la
 * persona mueve el mapa debajo. Es mas preciso que tocar con el dedo (el dedo
 * tapa justo lo que apuntas) y funciona con una sola mano.
 *
 * Tres caminos hacia la misma coordenada, porque en una emergencia cualquiera
 * puede fallar: buscar la direccion, arrastrar el mapa, o usar el GPS.
 */
export default function SelectorUbicacion({
  onCambio,
}: {
  onCambio: (u: UbicacionElegida) => void;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const mapa = useRef<maplibregl.Map | null>(null);
  const abortar = useRef<AbortController | null>(null);
  // Un vuelo programado no debe degradar la procedencia a 'manual'.
  const volando = useRef(false);

  const [listo, setListo] = useState(false);
  const [moviendo, setMoviendo] = useState(false);
  const [coords, setCoords] = useState<UbicacionElegida | null>(null);

  const [consulta, setConsulta] = useState("");
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [autoDisponible, setAutoDisponible] = useState(true);
  const [sinResultados, setSinResultados] = useState(false);

  const [ubicando, setUbicando] = useState(false);
  const [errorGeo, setErrorGeo] = useState("");

  const fijar = useCallback(
    (u: UbicacionElegida) => {
      setCoords(u);
      onCambio(u);
    },
    [onCambio]
  );

  useEffect(() => {
    if (!caja.current || mapa.current) return;

    const m = new maplibregl.Map({
      container: caja.current,
      style: estiloMapa(),
      center: [-74.1, 4.6],
      zoom: 4.6,
      attributionControl: { compact: true },
    });
    mapa.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    m.on("load", () => setListo(true));
    m.on("movestart", () => setMoviendo(true));
    m.on("moveend", () => {
      setMoviendo(false);
      if (volando.current) return;
      const c = m.getCenter();
      // Mover el mapa a mano degrada la procedencia: ya no es lectura de GPS.
      fijar({ lat: c.lat, lng: c.lng, precision: "manual", precisionMetros: null });
    });

    return () => {
      m.remove();
      mapa.current = null;
    };
  }, [fijar]);

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
      const { resultados, disponible } = await autocompletar(consulta, abortar.current.signal);
      setBuscando(false);
      setAutoDisponible(disponible);
      if (disponible) {
        setSugerencias(resultados);
        setSinResultados(resultados.length === 0);
        setAbierto(resultados.length > 0);
      }
    }, 550);
    return () => clearTimeout(t);
  }, [consulta, autoDisponible]);

  /** Búsqueda explícita: Enter o botón. Puede usar el proveedor de respaldo. */
  async function buscarAhora() {
    if (consulta.trim().length < 3) return;
    abortar.current?.abort();
    abortar.current = new AbortController();
    setBuscando(true);
    const r = await buscarDirecciones(consulta, abortar.current.signal);
    setBuscando(false);
    setSugerencias(r);
    setSinResultados(r.length === 0);
    setAbierto(r.length > 0);
  }

  function irA(s: Sugerencia) {
    setConsulta(s.etiqueta);
    setAbierto(false);
    setSugerencias([]);
    volando.current = true;
    mapa.current?.flyTo({ center: [s.lng, s.lat], zoom: 17, duration: 900 });
    setTimeout(() => {
      volando.current = false;
      // El buscador solo acerca el mapa: la coordenada sigue siendo una
      // aproximacion que la persona debe confirmar moviendo el pin.
      fijar({ lat: s.lat, lng: s.lng, precision: "geocodificada", precisionMetros: null });
    }, 950);
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
        volando.current = true;
        mapa.current?.flyTo({ center: [longitude, latitude], zoom: 18, duration: 900 });
        setTimeout(() => {
          volando.current = false;
          fijar({
            lat: latitude,
            lng: longitude,
            precision: "gps",
            precisionMetros: Math.round(accuracy),
          });
        }, 950);
      },
      (e) => {
        setUbicando(false);
        setErrorGeo(
          e.code === e.PERMISSION_DENIED
            ? "Permiso denegado. Busca la dirección o mueve el mapa hasta el punto."
            : "No pudimos obtener tu ubicación. Mueve el mapa hasta el punto."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  return (
    <div className="space-y-2">
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
                  // Dentro de un <form>: no enviar el formulario al buscar.
                  e.preventDefault();
                  buscarAhora();
                }
              }}
              onFocus={() => sugerencias.length && setAbierto(true)}
              placeholder="Buscar dirección, barrio o lugar…"
              aria-label="Buscar dirección"
              autoComplete="off"
              className="min-h-12 w-full rounded-xl border border-[var(--borde)] bg-[var(--superficie)] py-3 pl-10 pr-10 text-base shadow-[var(--sombra-1)]"
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
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {sinResultados && (
        <p className="text-xs text-[var(--texto-suave)]">
          No encontramos esa dirección. Mueve el mapa hasta el punto: es igual de
          válido y no depende de que el buscador conozca la dirección.
        </p>
      )}

      {/* Mapa con pin fijo al centro */}
      <div className="relative">
        <div
          ref={caja}
          className="mapa-caja h-72 w-full overflow-hidden rounded-xl border border-[var(--borde)]"
        />

        {/* El pin no se mueve: se mueve el mapa debajo. */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
          <div
            className="-mt-6 transition-transform duration-200"
            style={{ transform: moviendo ? "translateY(-8px)" : "translateY(0)" }}
          >
            <MapPin
              size={38}
              strokeWidth={2.5}
              className="drop-shadow-md"
              style={{ color: "var(--primario)", fill: "var(--primario-fondo)" }}
            />
          </div>
          {/* Sombra que delata la altura del pin al arrastrar. */}
          <div
            className="absolute h-1.5 rounded-full bg-black/25 transition-all duration-200"
            style={{ width: moviendo ? 14 : 8, opacity: moviendo ? 0.35 : 0.2 }}
          />
        </div>

        <button
          type="button"
          onClick={usarGps}
          disabled={!listo || ubicando}
          className="presionable absolute bottom-3 left-3 flex min-h-11 items-center gap-2 rounded-xl border border-[var(--borde)] bg-[var(--superficie)] px-3.5 text-sm font-semibold shadow-[var(--sombra-2)] disabled:opacity-60"
        >
          {ubicando ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <Crosshair size={16} aria-hidden />
          )}
          {ubicando ? "Ubicando…" : "Estoy aquí"}
        </button>
      </div>

      {errorGeo && (
        <p role="alert" className="text-sm text-[var(--peligro)]">{errorGeo}</p>
      )}

      <div className="rounded-xl bg-[var(--superficie-2)] px-3 py-2.5 text-sm">
        {coords ? (
          <>
            <p className="font-medium">
              {coords.precision === "gps"
                ? "Ubicación tomada del GPS"
                : coords.precision === "geocodificada"
                  ? "Ubicación del buscador — confírmala moviendo el mapa"
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
            Busca la dirección, mueve el mapa hasta que el pin quede sobre la
            entrada del lugar, o toca <strong>Estoy aquí</strong> si estás ahí
            ahora.
          </p>
        )}
      </div>
    </div>
  );
}
