"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, PartyPopper, XCircle } from "lucide-react";
import { avisarMascota } from "@/app/acciones";

/**
 * "¡Apareció!" abierto a cualquiera, no solo al dueño.
 *
 * Es la defensa contra lo que mata a todo registro de perdidos: llenarse de
 * casos ya resueltos. El dueño suele estar celebrando, no actualizando una
 * pagina web; quien lo vio reunido si puede avisar. Tres avisos lo cierran.
 */
export function AvisoMascota({ id, caso }: { id: string; caso: "perdida" | "encontrada" }) {
  const [estado, setEstado] = useState<"listo" | "enviando" | "hecho">("listo");
  const [mensaje, setMensaje] = useState("");

  async function avisar(tipo: "reunida" | "reporte") {
    setEstado("enviando");
    const r = await avisarMascota(id, tipo);
    if (r.ok) {
      setEstado("hecho");
      setMensaje(
        tipo === "reunida"
          ? r.estado === "reunida"
            ? "¡Confirmado! Este caso ya está cerrado. Gracias."
            : "Gracias. Con tres avisos el caso se cierra solo."
          : "Gracias. Si varias personas lo reportan, se retira del listado."
      );
    } else {
      setEstado("listo");
      setMensaje(r.error ?? "No se pudo registrar tu aviso.");
    }
  }

  if (estado === "hecho") {
    return (
      <p
        role="status"
        className="flex items-start gap-2 rounded-xl bg-[var(--primario-fondo)] px-3 py-2.5 text-sm font-medium text-[var(--primario-fuerte)]"
      >
        <PartyPopper size={16} className="mt-0.5 shrink-0" aria-hidden />
        {mensaje}
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      <p className="text-sm font-medium">
        {caso === "perdida"
          ? "¿Sabes que ya volvió a casa?"
          : "¿Sabes que ya lo reclamaron?"}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => avisar("reunida")}
          disabled={estado === "enviando"}
          className="presionable flex min-h-11 items-center gap-1.5 rounded-xl bg-[var(--primario)] px-4 text-sm font-semibold text-[var(--sobre-primario)] disabled:opacity-60"
        >
          {estado === "enviando" ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <CheckCircle2 size={16} aria-hidden />
          )}
          ¡Ya apareció!
        </button>
        <button
          onClick={() => avisar("reporte")}
          disabled={estado === "enviando"}
          className="presionable flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-[var(--peligro)] px-3.5 text-sm font-semibold text-[var(--peligro)] disabled:opacity-60"
        >
          <XCircle size={16} aria-hidden />
          Reporte falso
        </button>
      </div>
      {mensaje && <p role="alert" className="text-sm text-[var(--peligro)]">{mensaje}</p>}
    </div>
  );
}
