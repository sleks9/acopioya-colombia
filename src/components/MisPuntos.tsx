"use client";

import { useEffect, useState } from "react";
import { ArrowRight, KeyRound, X } from "lucide-react";
import { leerMisPuntos, olvidarMiPunto, type PuntoGuardado } from "@/lib/misPuntos";

/**
 * Atajo de vuelta a los paneles creados desde este navegador. No sustituye al
 * enlace magico (se pierde al cambiar de dispositivo o borrar datos del
 * navegador), pero evita el caso mas comun: cerrar la pestaña sin guardar la URL.
 */
export function MisPuntos() {
  const [puntos, setPuntos] = useState<PuntoGuardado[]>([]);
  const [listo, setListo] = useState(false);

  // localStorage no existe en el servidor: se lee despues de montar.
  useEffect(() => {
    setPuntos(leerMisPuntos());
    setListo(true);
  }, []);

  if (!listo || puntos.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-4">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold">
        <KeyRound size={15} className="text-[var(--info)]" aria-hidden />
        Puntos que administras
      </h2>
      <p className="mt-1 text-xs text-[var(--texto-suave)] text-pretty">
        Guardados en este navegador. Si cambias de teléfono necesitarás el
        enlace privado.
      </p>

      <ul className="mt-3 space-y-1.5">
        {puntos.map((p) => (
          <li key={p.token} className="flex items-center gap-2">
            <a
              href={`/p/${p.token}`}
              className="presionable flex min-h-11 flex-1 items-center justify-between gap-2 rounded-xl border border-[var(--borde)] px-3 text-sm font-medium"
            >
              <span className="truncate">{p.nombre}</span>
              <ArrowRight size={15} className="shrink-0 text-[var(--texto-suave)]" aria-hidden />
            </a>
            <button
              type="button"
              onClick={() => {
                olvidarMiPunto(p.token);
                setPuntos(leerMisPuntos());
              }}
              aria-label={`Quitar ${p.nombre} de esta lista`}
              title="Quitar de esta lista (no borra el punto)"
              className="presionable grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--borde)] text-[var(--texto-suave)]"
            >
              <X size={15} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
