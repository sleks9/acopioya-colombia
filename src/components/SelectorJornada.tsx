"use client";

import { useState } from "react";
import { CalendarClock, X } from "lucide-react";

/**
 * Jornada puntual: "el sábado 16 de 3 a 6 estamos en el parque".
 *
 * Distinto del horario, que describe la rutina de todas las semanas y no sabe
 * decir "este sábado". Aquí se elige un día concreto y un rango de horas.
 *
 * Mientras la jornada no haya terminado, el punto no caduca —si no,
 * desaparecería del mapa antes de llegar el día que anuncia—. Por eso el
 * servidor no acepta fechas a más de 30 días: sin ese tope bastaría con
 * anunciar algo lejano para dejar un punto muerto fijo en el mapa.
 */

/** Fecha de hoy en Colombia, en el formato AAAA-MM-DD que espera `input[date]`. */
function hoyEnColombia(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
}

function maximo(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(d);
}

/**
 * Une fecha y hora locales de Colombia en un instante absoluto.
 *
 * Colombia no tiene horario de verano, así que el desfase es siempre -05:00 y
 * se puede escribir directamente. Construirlo con `new Date("2026-08-16T15:00")`
 * usaría la zona del teléfono, y un voluntario con el móvil en otra zona
 * publicaría una hora equivocada.
 */
export function aInstante(fecha: string, hora: string): string {
  return new Date(`${fecha}T${hora}:00-05:00`).toISOString();
}

export type ValorJornada = { inicio: string; fin: string } | null;

export function SelectorJornada({
  valorInicial,
  onCambio,
}: {
  valorInicial?: { inicio: string; fin: string } | null;
  onCambio: (v: ValorJornada) => void;
}) {
  const partes = (iso: string | undefined) => {
    if (!iso) return { fecha: "", hora: "" };
    const f = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Bogota",
      year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date(iso));
    const h = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date(iso));
    return { fecha: f, hora: h };
  };

  const ini = partes(valorInicial?.inicio);
  const fin = partes(valorInicial?.fin);

  const [activa, setActiva] = useState(Boolean(valorInicial));
  const [fecha, setFecha] = useState(ini.fecha || hoyEnColombia());
  const [desde, setDesde] = useState(ini.hora || "09:00");
  const [hasta, setHasta] = useState(fin.hora || "13:00");

  const invalido = desde >= hasta;

  function emitir(next: { activa?: boolean; fecha?: string; desde?: string; hasta?: string }) {
    const a = next.activa ?? activa;
    const f = next.fecha ?? fecha;
    const d = next.desde ?? desde;
    const h = next.hasta ?? hasta;
    onCambio(a && f && d < h ? { inicio: aInstante(f, d), fin: aInstante(f, h) } : null);
  }

  if (!activa) {
    return (
      <button
        type="button"
        onClick={() => {
          setActiva(true);
          emitir({ activa: true });
        }}
        className="presionable flex min-h-11 items-center gap-2 rounded-xl border-2 border-dashed border-[var(--borde-fuerte)] px-3.5 text-sm font-semibold text-[var(--texto-suave)]"
      >
        <CalendarClock size={16} aria-hidden />
        Anunciar una jornada puntual
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-[var(--borde)] bg-[var(--superficie-2)] p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold">Jornada puntual</p>
        <button
          type="button"
          onClick={() => {
            setActiva(false);
            onCambio(null);
          }}
          className="presionable -mr-1 -mt-1 flex size-9 items-center justify-center rounded-lg text-[var(--texto-suave)]"
          aria-label="Quitar la jornada"
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="jornada-fecha" className="mb-1 block text-xs text-[var(--texto-suave)]">
            Día
          </label>
          <input
            id="jornada-fecha"
            type="date"
            value={fecha}
            min={hoyEnColombia()}
            max={maximo()}
            onChange={(e) => {
              setFecha(e.target.value);
              emitir({ fecha: e.target.value });
            }}
            className="min-h-11 rounded-xl border border-[var(--borde)] bg-[var(--superficie)] px-3 text-base"
          />
        </div>
        <div>
          <label htmlFor="jornada-desde" className="mb-1 block text-xs text-[var(--texto-suave)]">
            Desde
          </label>
          <input
            id="jornada-desde"
            type="time"
            value={desde}
            onChange={(e) => {
              setDesde(e.target.value);
              emitir({ desde: e.target.value });
            }}
            className="min-h-11 rounded-xl border border-[var(--borde)] bg-[var(--superficie)] px-3 text-base"
          />
        </div>
        <div>
          <label htmlFor="jornada-hasta" className="mb-1 block text-xs text-[var(--texto-suave)]">
            Hasta
          </label>
          <input
            id="jornada-hasta"
            type="time"
            value={hasta}
            onChange={(e) => {
              setHasta(e.target.value);
              emitir({ hasta: e.target.value });
            }}
            style={{ borderColor: invalido ? "var(--peligro)" : undefined }}
            className="min-h-11 rounded-xl border border-[var(--borde)] bg-[var(--superficie)] px-3 text-base"
          />
        </div>
      </div>

      {invalido && (
        <p role="alert" className="text-sm text-[var(--peligro)]">
          La hora de cierre debe ser posterior a la de apertura.
        </p>
      )}

      <p className="text-xs text-[var(--texto-suave)]">
        Se mostrará en grande en tu ficha y en la imagen para compartir. Tu punto
        no se marcará como desactualizado hasta que pase la jornada.
      </p>
    </div>
  );
}
