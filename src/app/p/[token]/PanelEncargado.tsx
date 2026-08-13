"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle, Ban, Bookmark, Check, CheckCircle2, CircleAlert,
  ExternalLink, Loader2, X,
} from "lucide-react";
import { actualizarCentro, type CentroPropio } from "@/app/acciones";
import { SubirFoto } from "@/components/SubirFoto";
import { SelectorHorario } from "@/components/SelectorHorario";
import { guardarMiPunto } from "@/lib/misPuntos";
import { haceCuanto, INSUMOS, type Estado } from "@/lib/tipos";
import { BotonCompartir } from "@/components/BotonCompartir";
import { textosCentro, urlPublica } from "@/lib/tarjeta/texto";

const ESTADOS = [
  {
    id: "abierto", etiqueta: "Abierto", detalle: "Estamos recibiendo donaciones",
    color: "var(--primario-fuerte)", fondo: "var(--primario-fondo)", Icono: Check,
  },
  {
    id: "lleno", etiqueta: "Lleno", detalle: "No traigan más por ahora",
    color: "var(--acento)", fondo: "var(--acento-fondo)", Icono: CircleAlert,
  },
  {
    id: "cerrado", etiqueta: "Cerrado", detalle: "El punto ya no opera",
    color: "var(--peligro)", fondo: "var(--peligro-fondo)", Icono: X,
  },
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
  const [editarHorario, setEditarHorario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // Quien abre su panel deja el enlace registrado en este navegador: si pierde
  // la URL, puede volver desde "Mis puntos" en vez de perder el punto.
  useEffect(() => {
    guardarMiPunto({ id: centro.id, nombre: centro.nombre, token });
  }, [centro.id, centro.nombre, token]);

  // La foto al marcar "lleno" documenta por qué se cierra la necesidad y da
  // al encargado algo que compartir en sus propias redes.
  const pideFoto = estado === "lleno" && centro.estado !== "lleno";

  /**
   * Un insumo no puede estar en las dos listas: publicado asi, el punto se
   * contradice. Marcarlo de un lado lo retira del otro.
   */
  const alternar = useCallback((id: string, lista: "si" | "no") => {
    if (lista === "si") {
      setNecesita((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
      setNoNecesita((p) => p.filter((x) => x !== id));
    } else {
      setNoNecesita((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
      setNecesita((p) => p.filter((x) => x !== id));
    }
  }, []);

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
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--texto-suave)]">
          Panel del encargado
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-balance">{centro.nombre}</h1>
        <p className="text-sm text-[var(--texto-suave)]">
          {centro.direccion} · {centro.ciudad} · actualizado {haceCuanto(centro.actualizado)}
        </p>
      </header>

      <p className="flex items-start gap-2.5 rounded-2xl bg-[var(--info-fondo)] px-4 py-3 text-sm text-[var(--info)]">
        <Bookmark size={16} className="mt-0.5 shrink-0" aria-hidden />
        <span>
          Guarda esta página en favoritos: es tu acceso y no necesitas
          contraseña. Cada vez que actualices, el punto vuelve a aparecer como
          reciente para quienes buscan dónde donar.
        </span>
      </p>

      <section>
        <h2 className="mb-2 font-semibold">Estado del punto</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {ESTADOS.map((e) => {
            const activo = estado === e.id;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setEstado(e.id)}
                aria-pressed={activo}
                className="presionable rounded-2xl border-2 p-3 text-left"
                style={{
                  borderColor: activo ? e.color : "var(--borde)",
                  background: activo ? e.fondo : "var(--superficie)",
                  color: activo ? e.color : "var(--texto)",
                }}
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <e.Icono size={15} strokeWidth={3} aria-hidden />
                  {e.etiqueta}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--texto-suave)]">
                  {e.detalle}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <Grupo
        titulo="¿Qué están recibiendo?"
        Marca={Check}
        color="var(--primario-fuerte)"
        fondo="var(--primario-fondo)"
        seleccion={necesita}
        bloqueados={noNecesita}
        motivo="Ya está marcado como algo que NO deben llevar"
        onAlternar={(id) => alternar(id, "si")}
      />

      <Grupo
        titulo="¿Qué NO deben traer?"
        Marca={Ban}
        color="var(--peligro)"
        fondo="var(--peligro-fondo)"
        ayuda="Marcar lo que ya sobra es lo que más ayuda: evita que la bodega se tape con donaciones que no se necesitan."
        seleccion={noNecesita}
        bloqueados={necesita}
        motivo="Ya está marcado como algo que SÍ están recibiendo"
        onAlternar={(id) => alternar(id, "no")}
      />

      <section>
        <h2 className="mb-2 font-semibold">Horario</h2>
        {editarHorario ? (
          <SelectorHorario onCambio={setHorario} />
        ) : (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] px-4 py-3">
            <span className="text-sm">
              {horario || (
                <span className="text-[var(--texto-suave)]">Sin horario publicado</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => setEditarHorario(true)}
              className="presionable ml-auto rounded-xl border border-[var(--borde-fuerte)] px-3 py-2 text-sm font-semibold"
            >
              Cambiar
            </button>
          </div>
        )}
      </section>

      <div>
        <label htmlFor="notas" className="mb-1.5 block font-semibold">
          Notas para quien viene
        </label>
        <textarea
          id="notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Ej: entrada por la puerta 3, hay parqueadero"
          className="w-full rounded-xl border border-[var(--borde)] bg-[var(--superficie)] px-3 py-2.5 text-base"
        />
      </div>

      {pideFoto ? (
        <div className="rounded-2xl border border-[var(--acento)]/30 bg-[var(--acento-fondo)] p-4">
          <SubirFoto
            onSubida={setFotoUrl}
            etiqueta="Foto de cómo quedó (opcional pero muy útil)"
            ayuda="Sirve de evidencia de por qué cierras la necesidad y puedes compartirla en tus redes."
          />
        </div>
      ) : (
        <SubirFoto onSubida={setFotoUrl} etiqueta="Actualizar foto (opcional)" />
      )}

      {mensaje && (
        <p role="status" className="flex items-start gap-2 rounded-xl bg-[var(--primario-fondo)] px-3 py-2.5 text-sm text-[var(--primario-fuerte)]">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden />
          {mensaje}
        </p>
      )}
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-[var(--peligro-fondo)] px-3 py-2.5 text-sm text-[var(--peligro)]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <button
        onClick={guardar}
        disabled={guardando}
        className="presionable flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primario)] px-4 py-3.5 font-semibold text-[var(--sobre-primario)] shadow-[var(--sombra-2)] disabled:opacity-60"
      >
        {guardando && <Loader2 size={18} className="animate-spin" aria-hidden />}
        {guardando ? "Guardando…" : "Guardar cambios"}
      </button>

      {/* La tarjeta se arma con lo ya publicado, no con lo que hay en este
          formulario sin guardar: si acabas de cambiar algo, guarda primero. */}
      <section className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-4">
        <h2 className="mb-1 font-semibold">Difunde tu punto</h2>
        <p className="mb-3 text-sm text-[var(--texto-suave)]">
          Una imagen con los datos de hoy, lista para tus estados y grupos de
          WhatsApp. Lleva un código QR para que quien la reciba pueda comprobar
          si sigue vigente.
        </p>
        <div className="flex">
          <BotonCompartir
            tipo="centro"
            id={centro.id}
            textos={textosCentro({ ...centro, estado: centro.estado as Estado })}
            url={urlPublica("centro", centro.id)}
          />
        </div>
      </section>

      {/* En otra pestaña a proposito: la ficha publica no lleva el enlace
          magico, asi que navegar hacia alla dejaba al encargado sin forma de
          volver a editar su punto. */}
      <a
        href={`/centro/${centro.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 text-sm text-[var(--info)] underline"
      >
        Ver cómo lo ve el público
        <ExternalLink size={13} aria-hidden />
      </a>
    </div>
  );
}

function Grupo({
  titulo, Marca, color, fondo, ayuda, seleccion, bloqueados, motivo, onAlternar,
}: {
  titulo: string;
  Marca: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  color: string;
  fondo: string;
  ayuda?: string;
  seleccion: string[];
  bloqueados: string[];
  motivo: string;
  onAlternar: (id: string) => void;
}) {
  return (
    <section>
      <h2 className="mb-1 flex items-center gap-1.5 font-semibold" style={{ color }}>
        <Marca size={15} strokeWidth={3} />
        {titulo}
      </h2>
      {ayuda && (
        <p className="mb-2 text-xs text-[var(--texto-suave)] text-pretty">{ayuda}</p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {INSUMOS.map(({ id, nombre, Icono }) => {
          const activo = seleccion.includes(id);
          const bloqueado = bloqueados.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onAlternar(id)}
              disabled={bloqueado}
              aria-pressed={activo}
              title={bloqueado ? motivo : undefined}
              className="presionable flex min-h-11 items-center gap-1.5 rounded-xl border-2 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                borderColor: activo ? color : "var(--borde)",
                background: activo ? fondo : "var(--superficie)",
                color: activo ? color : "var(--texto)",
                fontWeight: activo ? 600 : 400,
                textDecoration: bloqueado ? "line-through" : undefined,
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
