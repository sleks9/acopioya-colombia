"use client";

import { useState } from "react";
import { Ban, Check } from "lucide-react";
import { INSUMOS } from "@/lib/tipos";

/**
 * Las dos listas se manejan juntas y no por separado a proposito: un mismo
 * insumo no puede estar en "lo que recibimos" y en "lo que no traigan" al mismo
 * tiempo. Publicado asi, el punto se contradice y quien lee no sabe que hacer.
 *
 * En vez de dejar marcarlo y rechazarlo despues, la opcion contraria se
 * deshabilita en el momento y se explica por que. Ademas se ofrece cambiarla de
 * lado con un toque, que suele ser lo que la persona queria.
 */
export function SelectorInsumos({
  onCambio,
}: {
  onCambio: (necesita: string[], noNecesita: string[]) => void;
}) {
  const [necesita, setNecesita] = useState<string[]>([]);
  const [noNecesita, setNoNecesita] = useState<string[]>([]);

  function aplicar(n: string[], nn: string[]) {
    setNecesita(n);
    setNoNecesita(nn);
    onCambio(n, nn);
  }

  function alternar(id: string, lista: "necesita" | "no") {
    if (lista === "necesita") {
      const n = necesita.includes(id)
        ? necesita.filter((x) => x !== id)
        : [...necesita, id];
      // Al pedir algo, deja de estar en la lista de lo que no se debe traer.
      aplicar(n, noNecesita.filter((x) => x !== id));
    } else {
      const nn = noNecesita.includes(id)
        ? noNecesita.filter((x) => x !== id)
        : [...noNecesita, id];
      aplicar(necesita.filter((x) => x !== id), nn);
    }
  }

  return (
    <div className="space-y-6">
      <Grupo
        titulo="¿Qué están recibiendo?"
        Icono={Check}
        color="var(--primario-fuerte)"
        fondo="var(--primario-fondo)"
        seleccion={necesita}
        bloqueados={noNecesita}
        motivoBloqueo="Ya está marcado como algo que NO deben llevar"
        onAlternar={(id) => alternar(id, "necesita")}
        nombreCampo="necesita"
      />

      <Grupo
        titulo="¿Qué NO deben llevar?"
        Icono={Ban}
        color="var(--peligro)"
        fondo="var(--peligro-fondo)"
        ayuda="Este es el dato más útil de todos: evita que lleguen donaciones que ya sobran y tapan la bodega."
        seleccion={noNecesita}
        bloqueados={necesita}
        motivoBloqueo="Ya está marcado como algo que SÍ están recibiendo"
        onAlternar={(id) => alternar(id, "no")}
        nombreCampo="no_necesita"
      />
    </div>
  );
}

function Grupo({
  titulo, Icono, color, fondo, ayuda,
  seleccion, bloqueados, motivoBloqueo, onAlternar, nombreCampo,
}: {
  titulo: string;
  Icono: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  color: string;
  fondo: string;
  ayuda?: string;
  seleccion: string[];
  bloqueados: string[];
  motivoBloqueo: string;
  onAlternar: (id: string) => void;
  nombreCampo: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1 flex items-center gap-1.5 text-sm font-medium" style={{ color }}>
        <Icono size={15} strokeWidth={3} />
        {titulo}
      </legend>
      {ayuda && (
        <p className="mb-2 text-xs text-[var(--texto-suave)] text-pretty">{ayuda}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {INSUMOS.map(({ id, nombre, Icono: IconoInsumo }) => {
          const activo = seleccion.includes(id);
          const bloqueado = bloqueados.includes(id);

          return (
            <button
              key={id}
              type="button"
              onClick={() => onAlternar(id)}
              disabled={bloqueado}
              aria-pressed={activo}
              title={bloqueado ? motivoBloqueo : undefined}
              className="presionable flex min-h-11 items-center gap-1.5 rounded-xl border-2 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                borderColor: activo ? color : "var(--borde)",
                background: activo ? fondo : "var(--superficie)",
                color: activo ? color : "var(--texto)",
                fontWeight: activo ? 600 : 400,
                textDecoration: bloqueado ? "line-through" : undefined,
              }}
            >
              <IconoInsumo size={15} aria-hidden />
              {nombre}
            </button>
          );
        })}
      </div>

      {/* El formulario se envía con FormData: los valores viajan aquí. */}
      {seleccion.map((id) => (
        <input key={id} type="hidden" name={nombreCampo} value={id} />
      ))}
    </fieldset>
  );
}
