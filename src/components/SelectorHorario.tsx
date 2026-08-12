"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * El horario se escribia a mano y salia de todo: "8-6", "L a V", "todo el dia".
 * Con texto libre no se puede saber si un punto esta abierto ahora, y quien
 * llega a las 7 p.m. se encuentra la puerta cerrada.
 *
 * Aqui se arma con dias y rango horario, y se guarda una frase normalizada en
 * la misma columna de texto de siempre. Mas adelante, si hace falta responder
 * "esta abierto ahora", los datos ya estan estructurados aqui y solo habria que
 * persistirlos aparte.
 */

const DIAS = [
  { id: 1, corta: "L", larga: "Lunes" },
  { id: 2, corta: "M", larga: "Martes" },
  { id: 3, corta: "M", larga: "Miércoles" },
  { id: 4, corta: "J", larga: "Jueves" },
  { id: 5, corta: "V", larga: "Viernes" },
  { id: 6, corta: "S", larga: "Sábado" },
  { id: 0, corta: "D", larga: "Domingo" },
];

const LUN_VIE = [1, 2, 3, 4, 5];
const LUN_SAB = [1, 2, 3, 4, 5, 6];
const TODOS = [1, 2, 3, 4, 5, 6, 0];

/** Opciones cada 30 minutos, etiquetadas como se leen en Colombia. */
const HORAS = Array.from({ length: 48 }, (_, i) => {
  const h24 = Math.floor(i / 2);
  const min = i % 2 ? "30" : "00";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const sufijo = h24 < 12 ? "a.m." : "p.m.";
  return { valor: `${String(h24).padStart(2, "0")}:${min}`, texto: `${h12}:${min} ${sufijo}` };
});

function textoDias(sel: number[]): string {
  if (sel.length === 0) return "";
  const set = new Set(sel);
  const igual = (a: number[]) => a.length === set.size && a.every((d) => set.has(d));

  if (igual(TODOS)) return "Todos los días";
  if (igual(LUN_VIE)) return "Lunes a viernes";
  if (igual(LUN_SAB)) return "Lunes a sábado";

  // Orden de lectura natural, con domingo al final.
  const orden = [1, 2, 3, 4, 5, 6, 0];
  const nombres = orden
    .filter((d) => set.has(d))
    .map((d) => DIAS.find((x) => x.id === d)!.larga);

  if (nombres.length === 1) return nombres[0];
  return nombres.slice(0, -1).join(", ") + " y " + nombres[nombres.length - 1];
}

function etiquetaHora(valor: string) {
  return HORAS.find((h) => h.valor === valor)?.texto ?? valor;
}

export function SelectorHorario({ onCambio }: { onCambio: (texto: string) => void }) {
  const [dias, setDias] = useState<number[]>(LUN_VIE);
  const [desde, setDesde] = useState("08:00");
  const [hasta, setHasta] = useState("18:00");
  const [todoElDia, setTodoElDia] = useState(false);

  // Cruzar la medianoche casi siempre es un error de captura, no un turno real.
  const rangoInvalido = !todoElDia && desde >= hasta;

  const texto = useMemo(() => {
    const d = textoDias(dias);
    if (!d) return "";
    if (todoElDia) return `${d}, 24 horas`;
    if (rangoInvalido) return "";
    return `${d}, ${etiquetaHora(desde)} a ${etiquetaHora(hasta)}`;
  }, [dias, desde, hasta, todoElDia, rangoInvalido]);

  useEffect(() => onCambio(texto), [texto, onCambio]);

  function alternarDia(id: number) {
    setDias((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const atajoActivo = (a: number[]) =>
    a.length === dias.length && a.every((d) => dias.includes(d));

  return (
    <div className="space-y-3">
      <div>
        <span className="mb-1.5 block text-sm font-medium">Días de atención</span>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Días de atención">
          {DIAS.map((d) => {
            const activo = dias.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => alternarDia(d.id)}
                aria-pressed={activo}
                aria-label={d.larga}
                title={d.larga}
                className="presionable grid h-11 w-11 place-items-center rounded-xl border-2 text-sm font-bold"
                style={{
                  borderColor: activo ? "var(--primario)" : "var(--borde)",
                  background: activo ? "var(--primario)" : "var(--superficie)",
                  color: activo ? "var(--sobre-primario)" : "var(--texto-suave)",
                }}
              >
                {d.corta}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            { txt: "Lunes a viernes", val: LUN_VIE },
            { txt: "Lunes a sábado", val: LUN_SAB },
            { txt: "Todos los días", val: TODOS },
          ].map((a) => (
            <button
              key={a.txt}
              type="button"
              onClick={() => setDias(a.val)}
              className="presionable rounded-lg border border-[var(--borde)] px-2.5 py-1.5 text-xs font-medium"
              style={{
                color: atajoActivo(a.val) ? "var(--primario-fuerte)" : "var(--texto-suave)",
                borderColor: atajoActivo(a.val) ? "var(--primario)" : "var(--borde)",
              }}
            >
              {a.txt}
            </button>
          ))}
        </div>
      </div>

      <label className="presionable flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-xl border border-[var(--borde)] bg-[var(--superficie)] px-3.5 text-sm font-medium">
        <input
          type="checkbox"
          checked={todoElDia}
          onChange={(e) => setTodoElDia(e.target.checked)}
          className="h-4 w-4 accent-[var(--primario)]"
        />
        Abierto 24 horas
      </label>

      {!todoElDia && (
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="hora-desde" className="mb-1 block text-xs text-[var(--texto-suave)]">
              Desde
            </label>
            <select
              id="hora-desde"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="min-h-11 rounded-xl border border-[var(--borde)] bg-[var(--superficie)] px-3 text-base"
            >
              {HORAS.map((h) => (
                <option key={h.valor} value={h.valor}>{h.texto}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="hora-hasta" className="mb-1 block text-xs text-[var(--texto-suave)]">
              Hasta
            </label>
            <select
              id="hora-hasta"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="min-h-11 rounded-xl border border-[var(--borde)] bg-[var(--superficie)] px-3 text-base"
              style={{ borderColor: rangoInvalido ? "var(--peligro)" : undefined }}
            >
              {HORAS.map((h) => (
                <option key={h.valor} value={h.valor}>{h.texto}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {rangoInvalido && (
        <p role="alert" className="text-sm text-[var(--peligro)]">
          La hora de cierre debe ser posterior a la de apertura.
        </p>
      )}

      {dias.length === 0 && (
        <p role="alert" className="text-sm text-[var(--peligro)]">
          Marca al menos un día de atención.
        </p>
      )}

      {/* Lo que va a leer la gente. Se muestra para que quien reporta lo revise. */}
      <div className="rounded-xl bg-[var(--superficie-2)] px-3 py-2.5 text-sm">
        {texto ? (
          <>
            <span className="text-[var(--texto-suave)]">Se publicará como: </span>
            <strong>{texto}</strong>
          </>
        ) : (
          <span className="text-[var(--texto-suave)]">
            Completa los días y el horario.
          </span>
        )}
      </div>

      <input type="hidden" name="horario" value={texto} />
    </div>
  );
}
