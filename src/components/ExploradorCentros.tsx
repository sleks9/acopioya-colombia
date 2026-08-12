"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  Crosshair, Loader2, Map as MapaIcono, Search, Signal, SlidersHorizontal, X,
} from "lucide-react";
import { distanciaKm, INSUMOS, type Centro } from "@/lib/tipos";
import { TarjetaCentro } from "./TarjetaCentro";

// El mapa pesa: se carga aparte para que la lista sea util de inmediato en
// conexiones malas, que es la condicion normal en zona de desastre.
const MapaCentros = dynamic(() => import("./MapaCentros"), {
  ssr: false,
  loading: () => (
    <div className="mapa-caja grid h-[60vh] w-full place-items-center rounded-2xl border border-[var(--borde)]">
      <span className="flex items-center gap-2 text-sm text-[var(--texto-suave)]">
        <Loader2 size={16} className="animate-spin" aria-hidden />
        Cargando mapa…
      </span>
    </div>
  ),
});

/**
 * En zona de desastre la red es mala y a veces se paga por megabyte. MapLibre
 * mas las teselas son cientos de KB; la lista pesa una fraccion. Si el
 * navegador reporta conexion lenta o ahorro de datos, el mapa no se carga solo:
 * queda a un toque de distancia y la persona decide si le sale a cuenta.
 */
function conexionLenta(): boolean {
  if (typeof navigator === "undefined") return false;
  const c = (navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean };
  }).connection;
  if (!c) return false;
  return c.saveData === true || c.effectiveType === "slow-2g" || c.effectiveType === "2g";
}

export function ExploradorCentros({
  centros,
  mapaVisibleAlInicio = false,
}: {
  centros: Centro[];
  mapaVisibleAlInicio?: boolean;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [insumo, setInsumo] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [soloAbiertos, setSoloAbiertos] = useState(false);
  // Se decide en el primer render del cliente: en el servidor no se sabe.
  const [verMapa, setVerMapa] = useState(false);
  const [ahorroDatos, setAhorroDatos] = useState(false);
  const [miUbicacion, setMiUbicacion] = useState<[number, number] | null>(null);
  const [ubicando, setUbicando] = useState(false);
  const [errorGeo, setErrorGeo] = useState("");

  useEffect(() => {
    const lenta = conexionLenta();
    setAhorroDatos(lenta);
    if (mapaVisibleAlInicio && !lenta) setVerMapa(true);
  }, [mapaVisibleAlInicio]);

  const ciudades = useMemo(
    () => [...new Set(centros.map((c) => c.ciudad))].sort((a, b) => a.localeCompare(b, "es")),
    [centros]
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const lista = centros.filter((c) => {
      if (soloAbiertos && c.estado !== "abierto") return false;
      if (ciudad && c.ciudad !== ciudad) return false;
      if (insumo && !c.necesita.includes(insumo)) return false;
      if (!q) return true;
      return (
        c.nombre.toLowerCase().includes(q) ||
        c.direccion.toLowerCase().includes(q) ||
        c.ciudad.toLowerCase().includes(q) ||
        c.departamento.toLowerCase().includes(q)
      );
    });

    if (miUbicacion) {
      const [lat, lng] = miUbicacion;
      return [...lista].sort(
        (a, b) =>
          distanciaKm(lat, lng, a.lat, a.lng) - distanciaKm(lat, lng, b.lat, b.lng)
      );
    }
    return lista;
  }, [centros, busqueda, insumo, ciudad, soloAbiertos, miUbicacion]);

  const hayFiltros = Boolean(busqueda || insumo || ciudad || soloAbiertos);

  function ubicarme() {
    setErrorGeo("");
    if (!navigator.geolocation) {
      setErrorGeo("Tu navegador no permite compartir la ubicación.");
      return;
    }
    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setUbicando(false);
        setMiUbicacion([p.coords.latitude, p.coords.longitude]);
      },
      () => {
        setUbicando(false);
        setErrorGeo("No pudimos obtener tu ubicación. Puedes filtrar por ciudad.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function limpiar() {
    setBusqueda("");
    setInsumo("");
    setCiudad("");
    setSoloAbiertos(false);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-3 shadow-[var(--sombra-1)]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--texto-suave)]"
            size={18}
            aria-hidden
          />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, dirección o ciudad…"
            aria-label="Buscar centros de acopio"
            className="w-full rounded-xl border border-[var(--borde)] bg-[var(--fondo)] py-3 pl-10 pr-3 text-base"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="filtro-ciudad">Ciudad</label>
          <select
            id="filtro-ciudad"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            className="min-h-11 rounded-xl border border-[var(--borde)] bg-[var(--fondo)] px-3 text-sm"
          >
            <option value="">Todas las ciudades</option>
            {ciudades.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label className="sr-only" htmlFor="filtro-insumo">Qué quieres donar</label>
          <select
            id="filtro-insumo"
            value={insumo}
            onChange={(e) => setInsumo(e.target.value)}
            className="min-h-11 rounded-xl border border-[var(--borde)] bg-[var(--fondo)] px-3 text-sm"
          >
            <option value="">¿Qué quieres donar?</option>
            {INSUMOS.map((i) => (
              <option key={i.id} value={i.id}>{i.nombre}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={ubicarme}
            disabled={ubicando}
            className="presionable flex min-h-11 items-center gap-1.5 rounded-xl border border-[var(--borde)] px-3 text-sm font-medium disabled:opacity-60"
            aria-pressed={Boolean(miUbicacion)}
          >
            {ubicando ? (
              <Loader2 size={15} className="animate-spin" aria-hidden />
            ) : (
              <Crosshair size={15} aria-hidden />
            )}
            {miUbicacion ? "Por cercanía" : "Cerca de mí"}
          </button>

          <label className="presionable flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[var(--borde)] px-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={soloAbiertos}
              onChange={(e) => setSoloAbiertos(e.target.checked)}
              className="h-4 w-4 accent-[var(--primario)]"
            />
            Solo abiertos
          </label>

          {hayFiltros && (
            <button
              type="button"
              onClick={limpiar}
              className="presionable flex min-h-11 items-center gap-1 rounded-xl px-2.5 text-sm font-medium text-[var(--texto-suave)]"
            >
              <X size={15} aria-hidden />
              Limpiar
            </button>
          )}

          <button
            type="button"
            onClick={() => setVerMapa((v) => !v)}
            aria-expanded={verMapa}
            className="presionable ml-auto flex min-h-11 items-center gap-1.5 rounded-xl border border-[var(--borde)] px-3 text-sm font-medium"
          >
            {verMapa ? <SlidersHorizontal size={15} aria-hidden /> : <MapaIcono size={15} aria-hidden />}
            {verMapa ? "Ocultar mapa" : "Ver mapa"}
          </button>
        </div>

        {errorGeo && (
          <p role="alert" className="text-sm text-[var(--peligro)]">{errorGeo}</p>
        )}
      </div>

      {ahorroDatos && !verMapa && (
        <p className="flex items-start gap-2 rounded-xl bg-[var(--acento-fondo)] px-3 py-2.5 text-sm text-[var(--acento)]">
          <Signal size={15} className="mt-0.5 shrink-0" aria-hidden />
          Detectamos conexión lenta, así que no cargamos el mapa
          automáticamente. La lista de abajo tiene la misma información y pesa
          mucho menos.
        </p>
      )}

      {verMapa && <MapaCentros centros={filtrados} miUbicacion={miUbicacion} />}

      <p className="tabular text-sm text-[var(--texto-suave)]" aria-live="polite">
        {filtrados.length} {filtrados.length === 1 ? "punto" : "puntos"}
        {ciudad && <> en {ciudad}</>}
      </p>

      {filtrados.length === 0 ? (
        <div className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-8 text-center">
          <p className="font-medium">No hay puntos con esos filtros.</p>
          <button
            type="button"
            onClick={limpiar}
            className="presionable mt-3 rounded-xl border border-[var(--borde-fuerte)] px-4 py-2.5 text-sm font-semibold"
          >
            Quitar filtros
          </button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtrados.map((c, i) => (
            <TarjetaCentro
              key={c.id}
              centro={c}
              indice={i}
              distanciaKm={
                miUbicacion
                  ? distanciaKm(miUbicacion[0], miUbicacion[1], c.lat, c.lng)
                  : undefined
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}
