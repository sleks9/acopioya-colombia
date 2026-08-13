"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, MapPin, Pause, Play } from "lucide-react";
import { nombreInsumo } from "@/lib/tipos";

/**
 * Vitrina de puntos abiertos ahora, en el hueco del encabezado.
 *
 * Quien entra por primera vez lee un titular y se va: no ve que detrás hay
 * datos vivos de varias ciudades. Esto lo enseña sin obligar a bajar al mapa.
 *
 * Sin fotos, a propósito. Una vitrina que rota sola y descarga imágenes gasta
 * los datos de quien menos los tiene, justo en la pantalla de entrada, y aquí
 * la información que importa —si está abierto y qué recibe— es texto.
 */

export type PuntoVitrina = {
  id: string;
  nombre: string;
  ciudad: string;
  necesita: string[];
  horario: string | null;
  abierto: boolean;
};

const CADA_MS = 4500;

export function CarruselPuntos({ puntos }: { puntos: PuntoVitrina[] }) {
  const [i, setI] = useState(0);
  const [corriendo, setCorriendo] = useState(true);
  const total = puntos.length;

  /**
   * Quien pide movimiento reducido no debería recibir una tarjeta que cambia
   * sola cada cuatro segundos. Se queda quieta y se navega a mano.
   */
  const [reducido, setReducido] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const aplicar = () => {
      setReducido(mq.matches);
      if (mq.matches) setCorriendo(false);
    };
    aplicar();
    mq.addEventListener("change", aplicar);
    return () => mq.removeEventListener("change", aplicar);
  }, []);

  const ir = useCallback(
    (d: number) => setI((p) => (p + d + total) % total),
    [total]
  );

  /**
   * Navegar a mano detiene la rotación para siempre.
   *
   * Sin esto, quien pulsa la flecha para leer un punto ve cómo se le cambia la
   * tarjeta cuatro segundos después. Cuando alguien toma el control, la
   * automatización sobra.
   */
  const irManual = useCallback(
    (d: number) => {
      setCorriendo(false);
      ir(d);
    },
    [ir]
  );

  const temporizador = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!corriendo || total < 2) return;
    temporizador.current = setInterval(() => ir(1), CADA_MS);
    return () => {
      if (temporizador.current) clearInterval(temporizador.current);
    };
  }, [corriendo, ir, total]);

  if (total === 0) return null;
  const p = puntos[i];
  const insumos = p.necesita.slice(0, 3).map(nombreInsumo);
  const resto = Math.max(0, p.necesita.length - 3);

  return (
    <div
      className="flex flex-col rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-4 shadow-[var(--sombra-2)]"
      // Detener al pasar el ratón o al tabular dentro: nadie quiere leer algo
      // que se le mueve debajo. Requisito de accesibilidad, no un detalle.
      onMouseEnter={() => !reducido && setCorriendo(false)}
      onMouseLeave={() => !reducido && setCorriendo(true)}
      onFocusCapture={() => setCorriendo(false)}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--texto-suave)]">
          Puntos abiertos ahora
        </span>
        <span className="tabular text-xs text-[var(--texto-suave)]">
          {i + 1} / {total}
        </span>
      </div>

      {/*
        `aria-live="polite"` para que un lector de pantalla anuncie el cambio
        solo cuando el usuario esté quieto, nunca interrumpiendo.
      */}
      <div aria-live="polite" aria-atomic className="mt-3 min-h-[8.5rem]">
        <Link
          key={p.id}
          href={`/centro/${p.id}`}
          className="presionable aparece flex flex-col rounded-xl p-1"
        >
          <span className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
              style={{
                background: p.abierto ? "var(--primario-fondo)" : "var(--superficie-2)",
                color: p.abierto ? "var(--primario-fuerte)" : "var(--texto-suave)",
              }}
            >
              <Clock size={11} strokeWidth={3} aria-hidden />
              {p.abierto ? "Abierto ahora" : "Recibiendo"}
            </span>
          </span>

          <span className="mt-1.5 line-clamp-2 font-bold leading-tight">{p.nombre}</span>

          <span className="mt-1 flex items-center gap-1 text-sm text-[var(--texto-suave)]">
            <MapPin size={13} aria-hidden />
            {p.ciudad}
          </span>

          {insumos.length > 0 && (
            <span className="mt-2 line-clamp-2 text-sm text-[var(--texto-suave)]">
              <span className="font-semibold text-[var(--primario-fuerte)]">Reciben: </span>
              {insumos.join(", ")}
              {resto > 0 && ` y ${resto} más`}
            </span>
          )}
        </Link>
      </div>

      {total > 1 && (
        <div className="mt-3 flex items-center gap-1 border-t border-[var(--borde)] pt-2">
          <Boton onClick={() => irManual(-1)} etiqueta="Punto anterior">
            <ChevronLeft size={16} aria-hidden />
          </Boton>
          <Boton onClick={() => irManual(1)} etiqueta="Punto siguiente">
            <ChevronRight size={16} aria-hidden />
          </Boton>
          {!reducido && (
            <Boton
              onClick={() => setCorriendo((c) => !c)}
              etiqueta={corriendo ? "Pausar" : "Reanudar"}
            >
              {corriendo ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
            </Boton>
          )}
          <Link
            href="/mapa"
            className="presionable ml-auto rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--primario-fuerte)]"
          >
            Ver todos
          </Link>
        </div>
      )}
    </div>
  );
}

function Boton({
  onClick,
  etiqueta,
  children,
}: {
  onClick: () => void;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      title={etiqueta}
      className="presionable grid size-9 place-items-center rounded-lg text-[var(--texto-suave)] hover:text-[var(--texto)]"
    >
      {children}
    </button>
  );
}
