"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { votarSolicitud } from "@/app/acciones";

/**
 * Señal comunitaria sobre una solicitud. Aquí importa más que en los centros:
 * una solicitud falsa desvía ayuda que otra familia sí necesita, así que el
 * desmentido es tan valioso como la confirmación.
 */
export function BotonesVotoSolicitud({ id }: { id: string }) {
  const [estado, setEstado] = useState<"listo" | "enviando" | "hecho">("listo");
  const [mensaje, setMensaje] = useState("");

  async function votar(voto: "confirmacion" | "reporte") {
    setEstado("enviando");
    const r = await votarSolicitud(id, voto);
    if (r.ok) {
      setEstado("hecho");
      setMensaje(
        voto === "confirmacion"
          ? "Gracias. Tu confirmación ayuda a que la ayuda llegue con confianza."
          : "Gracias. Si varias personas la reportan, se retira del listado."
      );
    } else {
      setEstado("listo");
      setMensaje(r.error ?? "No se pudo registrar tu voto.");
    }
  }

  if (estado === "hecho") {
    return (
      <p
        role="status"
        className="flex items-start gap-2 rounded-xl bg-[var(--primario-fondo)] px-3 py-2.5 text-sm text-[var(--primario-fuerte)]"
      >
        <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden />
        {mensaje}
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      <p className="text-sm font-medium">¿Conoces esta zona? Ayuda a los demás:</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => votar("confirmacion")}
          disabled={estado === "enviando"}
          className="presionable flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-[var(--primario)] px-3.5 text-sm font-semibold text-[var(--primario-fuerte)] disabled:opacity-60"
        >
          {estado === "enviando" ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <CheckCircle2 size={16} aria-hidden />
          )}
          Confirmo que es real
        </button>
        <button
          onClick={() => votar("reporte")}
          disabled={estado === "enviando"}
          className="presionable flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-[var(--peligro)] px-3.5 text-sm font-semibold text-[var(--peligro)] disabled:opacity-60"
        >
          <XCircle size={16} aria-hidden />
          Ya no aplica o es falsa
        </button>
      </div>
      {mensaje && <p role="alert" className="text-sm text-[var(--peligro)]">{mensaje}</p>}
    </div>
  );
}
