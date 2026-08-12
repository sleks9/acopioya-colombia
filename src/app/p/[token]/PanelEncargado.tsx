"use client";

import Link from "next/link";
import { useState } from "react";
import { actualizarCentro, type CentroPropio } from "@/app/acciones";
import { SubirFoto } from "@/components/SubirFoto";
import { haceCuanto, INSUMOS } from "@/lib/tipos";

const ESTADOS = [
  { id: "abierto", etiqueta: "Abierto", detalle: "Estamos recibiendo donaciones", color: "var(--abierto)" },
  { id: "lleno", etiqueta: "Lleno", detalle: "No traigan más por ahora", color: "var(--lleno)" },
  { id: "cerrado", etiqueta: "Cerrado", detalle: "El punto ya no opera", color: "var(--cerrado)" },
];

export function PanelEncargado({
  token,
  centro,
}: {
  token: string;
  centro: CentroPropio;
}) {
  const [estado, setEstado] = useState(centro.estado);
  const [necesita, setNecesita] = useState<string[]>(centro.necesita ?? []);
  const [noNecesita, setNoNecesita] = useState<string[]>(centro.no_necesita ?? []);
  const [horario, setHorario] = useState(centro.horario ?? "");
  const [notas, setNotas] = useState(centro.notas ?? "");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // La foto al marcar "lleno" documenta por qué se cierra la necesidad y da
  // al encargado algo que compartir en sus propias redes.
  const pideFoto = estado === "lleno" && centro.estado !== "lleno";

  function alternar(lista: string[], set: (v: string[]) => void, id: string) {
    set(lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]);
  }

  async function guardar() {
    setGuardando(true);
    setError("");
    setMensaje("");

    const r = await actualizarCentro(token, {
      estado,
      necesita,
      no_necesita: noNecesita,
      horario: horario.trim() || null,
      notas: notas.trim() || null,
      foto_url: fotoUrl,
    });

    setGuardando(false);
    if (r.ok) setMensaje("Guardado. El punto ya aparece actualizado en el mapa.");
    else setError(r.error ?? "No se pudo guardar.");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">
      <header>
        <p className="text-xs uppercase tracking-wide text-[var(--texto-suave)]">
          Panel del encargado
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-balance">{centro.nombre}</h1>
        <p className="text-sm text-[var(--texto-suave)]">
          {centro.direccion} · {centro.ciudad} · actualizado {haceCuanto(centro.actualizado)}
        </p>
      </header>

      <p className="rounded-xl bg-[var(--oficial-fondo)] text-[var(--oficial)] px-4 py-3 text-sm">
        Guarda esta página en favoritos: es tu acceso, no necesitas contraseña.
        Cada vez que actualices, el punto vuelve a aparecer como reciente para
        quienes buscan dónde donar.
      </p>

      <section className="space-y-2">
        <h2 className="font-semibold">Estado del punto</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {ESTADOS.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEstado(e.id)}
              className={`rounded-xl border-2 p-3 text-left ${
                estado === e.id
                  ? "border-current bg-[var(--superficie)]"
                  : "border-[var(--borde)] bg-[var(--superficie)]"
              }`}
              style={{ color: estado === e.id ? e.color : undefined }}
            >
              <span className="block font-semibold">{e.etiqueta}</span>
              <span className="block text-xs text-[var(--texto-suave)]">{e.detalle}</span>
            </button>
          ))}
        </div>
      </section>

      <Grupo
        titulo="¿Qué están recibiendo?"
        color="var(--abierto)"
        seleccion={necesita}
        alternar={(id) => alternar(necesita, setNecesita, id)}
      />

      <Grupo
        titulo="¿Qué NO deben traer?"
        color="var(--cerrado)"
        ayuda="Marcar lo que ya sobra es lo que más ayuda: evita que la bodega se tape con donaciones que no se necesitan."
        seleccion={noNecesita}
        alternar={(id) => alternar(noNecesita, setNoNecesita, id)}
      />

      <div>
        <label className="block text-sm font-medium mb-1.5">Horario</label>
        <input
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          maxLength={160}
          placeholder="Ej: Lunes a sábado, 8am a 6pm"
          className="w-full rounded-lg border border-[var(--borde)] bg-[var(--superficie)] px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Notas para quien viene</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Ej: entrada por la puerta 3, hay parqueadero"
          className="w-full rounded-lg border border-[var(--borde)] bg-[var(--superficie)] px-3 py-2.5 text-sm"
        />
      </div>

      {pideFoto && (
        <div className="rounded-xl border border-[var(--lleno)] bg-[var(--lleno-fondo)] p-4">
          <SubirFoto
            onSubida={setFotoUrl}
            etiqueta="Foto de cómo quedó (opcional pero muy útil)"
            ayuda="Sirve de evidencia de por qué cierras la necesidad y puedes compartirla en tus redes."
          />
        </div>
      )}

      {!pideFoto && (
        <SubirFoto onSubida={setFotoUrl} etiqueta="Actualizar foto (opcional)" />
      )}

      {mensaje && (
        <p className="rounded-lg bg-[var(--abierto-fondo)] text-[var(--abierto)] px-3 py-2 text-sm">
          {mensaje}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-[var(--cerrado-fondo)] text-[var(--cerrado)] px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <button
        onClick={guardar}
        disabled={guardando}
        className="w-full rounded-lg bg-[var(--abierto)] px-4 py-3 font-semibold text-white disabled:opacity-60"
      >
        {guardando ? "Guardando…" : "Guardar cambios"}
      </button>

      <Link
        href={`/centro/${centro.id}`}
        className="block text-center text-sm text-[var(--oficial)] underline"
      >
        Ver cómo lo ve el público
      </Link>
    </div>
  );
}

function Grupo({
  titulo, color, ayuda, seleccion, alternar,
}: {
  titulo: string;
  color: string;
  ayuda?: string;
  seleccion: string[];
  alternar: (id: string) => void;
}) {
  return (
    <section>
      <h2 className="font-semibold mb-1" style={{ color }}>{titulo}</h2>
      {ayuda && <p className="text-xs text-[var(--texto-suave)] mb-2 text-pretty">{ayuda}</p>}
      <div className="flex flex-wrap gap-1.5">
        {INSUMOS.map(({ id, nombre, Icono }) => {
          const activo = seleccion.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => alternar(id)}
              aria-pressed={activo}
              className="presionable flex min-h-11 items-center gap-1.5 rounded-xl border-2 px-3 text-sm"
              style={{
                borderColor: activo ? color : "var(--borde)",
                color: activo ? color : "var(--texto)",
                fontWeight: activo ? 600 : 400,
              }}
            >
              <Icono size={15} aria-hidden />
              {nombre}
            </button>
          );
        })}
      </div>
    </section>
  );
}
