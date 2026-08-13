"use client";

import { useMemo, useState } from "react";
import { HandHeart, Search, X } from "lucide-react";
import { NECESIDADES, TIPOS, type Solicitud } from "@/lib/solicitudes";
import { TarjetaSolicitud } from "./TarjetaSolicitud";

export function ExploradorSolicitudes({ solicitudes }: { solicitudes: Solicitud[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [necesidad, setNecesidad] = useState("");
  const [tipo, setTipo] = useState("");
  const [soloCriticas, setSoloCriticas] = useState(false);

  const municipios = useMemo(
    () => [...new Set(solicitudes.map((s) => s.municipio))].sort((a, b) => a.localeCompare(b, "es")),
    [solicitudes]
  );

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return solicitudes.filter((s) => {
      if (soloCriticas && s.urgencia !== "critica") return false;
      if (municipio && s.municipio !== municipio) return false;
      if (tipo && s.tipo !== tipo) return false;
      if (necesidad && !s.necesita.includes(necesidad)) return false;
      if (!q) return true;
      return [s.titulo, s.descripcion, s.barrio_vereda, s.municipio].some((c) =>
        c.toLowerCase().includes(q)
      );
    });
  }, [solicitudes, busqueda, municipio, necesidad, tipo, soloCriticas]);

  const hayFiltros = Boolean(busqueda || municipio || necesidad || tipo || soloCriticas);

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-3">
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
            placeholder="Buscar por lugar o necesidad…"
            aria-label="Buscar solicitudes"
            className="min-h-12 w-full rounded-xl border border-[var(--borde)] bg-[var(--fondo)] py-3 pl-10 pr-3 text-base"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="s-mpio">Municipio</label>
          <select
            id="s-mpio" value={municipio} onChange={(e) => setMunicipio(e.target.value)}
            className="min-h-11 rounded-xl border border-[var(--borde)] bg-[var(--fondo)] px-3 text-sm"
          >
            <option value="">Todos los municipios</option>
            {municipios.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          <label className="sr-only" htmlFor="s-nec">Necesidad</label>
          <select
            id="s-nec" value={necesidad} onChange={(e) => setNecesidad(e.target.value)}
            className="min-h-11 rounded-xl border border-[var(--borde)] bg-[var(--fondo)] px-3 text-sm"
          >
            <option value="">¿Qué puedes aportar?</option>
            {NECESIDADES.map((n) => <option key={n.id} value={n.id}>{n.nombre}</option>)}
          </select>

          <label className="sr-only" htmlFor="s-tipo">Tipo</label>
          <select
            id="s-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}
            className="min-h-11 rounded-xl border border-[var(--borde)] bg-[var(--fondo)] px-3 text-sm"
          >
            <option value="">Familias e instituciones</option>
            {TIPOS.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>

          <label className="presionable flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[var(--borde)] px-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={soloCriticas}
              onChange={(e) => setSoloCriticas(e.target.checked)}
              className="h-4 w-4 accent-[var(--peligro)]"
            />
            Solo críticas
          </label>

          {hayFiltros && (
            <button
              type="button"
              onClick={() => {
                setBusqueda(""); setMunicipio(""); setNecesidad("");
                setTipo(""); setSoloCriticas(false);
              }}
              className="presionable flex min-h-11 items-center gap-1 rounded-xl px-2.5 text-sm font-medium text-[var(--texto-suave)]"
            >
              <X size={15} aria-hidden />
              Limpiar
            </button>
          )}
        </div>
      </div>

      <p className="tabular text-sm text-[var(--texto-suave)]" aria-live="polite">
        {filtradas.length} {filtradas.length === 1 ? "solicitud" : "solicitudes"}
      </p>

      {filtradas.length === 0 ? (
        <div className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-8 text-center">
          <HandHeart size={28} className="mx-auto text-[var(--texto-suave)]" aria-hidden />
          <p className="mt-2 font-medium">
            {hayFiltros ? "No hay solicitudes con esos filtros." : "Todavía no hay solicitudes publicadas."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((s, i) => (
            <TarjetaSolicitud key={s.id} solicitud={s} indice={i} />
          ))}
        </ul>
      )}
    </div>
  );
}
