"use client";

import { useMemo, useState } from "react";
import { PawPrint, Search, X } from "lucide-react";
import { ESPECIES, type Mascota } from "@/lib/mascotas";
import { TarjetaMascota } from "./TarjetaMascota";

/**
 * Dos pestañas, no dos páginas: quien busca a su mascota quiere revisar los
 * "encontrados" con la misma facilidad con la que publica su "perdido". Que
 * estén a un toque de distancia es lo que hace que se crucen los dos lados.
 */
export function ExploradorMascotas({ mascotas }: { mascotas: Mascota[] }) {
  const [caso, setCaso] = useState<"perdida" | "encontrada">("perdida");
  const [especie, setEspecie] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const municipios = useMemo(
    () => [...new Set(mascotas.map((m) => m.municipio))].sort((a, b) => a.localeCompare(b, "es")),
    [mascotas]
  );

  const conteo = useMemo(
    () => ({
      perdida: mascotas.filter((m) => m.caso === "perdida").length,
      encontrada: mascotas.filter((m) => m.caso === "encontrada").length,
    }),
    [mascotas]
  );

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return mascotas.filter((m) => {
      if (m.caso !== caso) return false;
      if (especie && m.especie !== especie) return false;
      if (municipio && m.municipio !== municipio) return false;
      if (!q) return true;
      return [m.nombre, m.color, m.senas, m.municipio]
        .filter(Boolean)
        .some((c) => c!.toLowerCase().includes(q));
    });
  }, [mascotas, caso, especie, municipio, busqueda]);

  const hayFiltros = Boolean(especie || municipio || busqueda);

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Tipo de reporte" className="flex gap-2">
        {(["perdida", "encontrada"] as const).map((c) => {
          const activo = caso === c;
          const color = c === "perdida" ? "var(--acento)" : "var(--primario-fuerte)";
          return (
            <button
              key={c}
              role="tab"
              aria-selected={activo}
              onClick={() => setCaso(c)}
              className="presionable flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 px-3 font-semibold"
              style={{
                borderColor: activo ? color : "var(--borde)",
                background: activo
                  ? c === "perdida" ? "var(--acento-fondo)" : "var(--primario-fondo)"
                  : "var(--superficie)",
                color: activo ? color : "var(--texto-suave)",
              }}
            >
              {c === "perdida" ? "Se perdieron" : "Las encontraron"}
              <span className="tabular text-sm opacity-70">{conteo[c]}</span>
            </button>
          );
        })}
      </div>

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
            placeholder="Nombre, color o señas…"
            aria-label="Buscar mascota"
            className="min-h-12 w-full rounded-xl border border-[var(--borde)] bg-[var(--fondo)] py-3 pl-10 pr-3 text-base"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="f-especie">Especie</label>
          <select
            id="f-especie"
            value={especie}
            onChange={(e) => setEspecie(e.target.value)}
            className="min-h-11 rounded-xl border border-[var(--borde)] bg-[var(--fondo)] px-3 text-sm"
          >
            <option value="">Todas las especies</option>
            {ESPECIES.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>

          <label className="sr-only" htmlFor="f-municipio">Municipio</label>
          <select
            id="f-municipio"
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            className="min-h-11 rounded-xl border border-[var(--borde)] bg-[var(--fondo)] px-3 text-sm"
          >
            <option value="">Todos los municipios</option>
            {municipios.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {hayFiltros && (
            <button
              type="button"
              onClick={() => {
                setEspecie("");
                setMunicipio("");
                setBusqueda("");
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
        {filtradas.length} {filtradas.length === 1 ? "reporte" : "reportes"}
      </p>

      {filtradas.length === 0 ? (
        <div className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-8 text-center">
          <PawPrint size={28} className="mx-auto text-[var(--texto-suave)]" aria-hidden />
          <p className="mt-2 font-medium">
            {hayFiltros ? "No hay reportes con esos filtros." : "Todavía no hay reportes aquí."}
          </p>
          {caso === "perdida" && !hayFiltros && (
            <p className="mt-1 text-sm text-[var(--texto-suave)]">
              Revisa también la pestaña de encontradas.
            </p>
          )}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((m, i) => (
            <TarjetaMascota key={m.id} mascota={m} indice={i} />
          ))}
        </ul>
      )}
    </div>
  );
}
