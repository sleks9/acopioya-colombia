"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle, Bookmark, CheckCircle2, ExternalLink, Loader2, TriangleAlert,
} from "lucide-react";
import { actualizarSolicitud } from "@/app/acciones";
import { SubirFoto } from "@/components/SubirFoto";
import { guardarMiPunto } from "@/lib/misPuntos";
import {
  ESTADOS, NECESIDADES, URGENCIAS, type EstadoSolicitud, type Urgencia,
} from "@/lib/solicitudes";

type SolicitudPropia = {
  id: string;
  titulo: string;
  descripcion: string;
  municipio: string;
  departamento: string;
  barrio_vereda: string;
  necesita: string[];
  urgencia: Urgencia;
  estado: EstadoSolicitud;
  personas: number | null;
};

export function PanelSolicitud({
  token,
  solicitud,
}: {
  token: string;
  solicitud: SolicitudPropia;
}) {
  const [estado, setEstado] = useState<EstadoSolicitud>(solicitud.estado);
  const [urgencia, setUrgencia] = useState<Urgencia>(solicitud.urgencia);
  const [necesita, setNecesita] = useState<string[]>(solicitud.necesita ?? []);
  const [descripcion, setDescripcion] = useState(solicitud.descripcion);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    guardarMiPunto({ id: solicitud.id, nombre: solicitud.titulo, token });
  }, [solicitud.id, solicitud.titulo, token]);

  async function guardar(nuevoEstado?: EstadoSolicitud) {
    setGuardando(true);
    setError("");
    setMensaje("");

    const r = await actualizarSolicitud(token, {
      estado: nuevoEstado,
      descripcion: descripcion.trim() || null,
      necesita,
      urgencia,
      foto_url: fotoUrl,
    });

    setGuardando(false);
    if (r.ok) {
      if (nuevoEstado) setEstado(nuevoEstado);
      setMensaje(
        nuevoEstado === "cubierta"
          ? "Marcada como cubierta. Gracias: así la ayuda se dirige a quien todavía la espera."
          : "Guardado. La solicitud ya aparece actualizada."
      );
    } else {
      setError(r.error ?? "No se pudo guardar.");
    }
  }

  const cubierta = estado === "cubierta";

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--texto-suave)]">
          Mi solicitud
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-balance">{solicitud.titulo}</h1>
        <p className="text-sm text-[var(--texto-suave)]">
          {solicitud.barrio_vereda} · {solicitud.municipio}, {solicitud.departamento}
        </p>
      </header>

      {cubierta ? (
        <p className="flex items-center gap-2 rounded-2xl bg-[var(--primario-fondo)] px-4 py-3 font-semibold text-[var(--primario-fuerte)]">
          <CheckCircle2 size={20} aria-hidden />
          Esta solicitud está cerrada. Puedes reabrirla si vuelven a necesitar ayuda.
        </p>
      ) : (
        <p className="flex items-start gap-2.5 rounded-2xl bg-[var(--info-fondo)] px-4 py-3 text-sm text-[var(--info)]">
          <Bookmark size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            Guarda esta página en favoritos: es tu acceso y no necesitas
            contraseña.
          </span>
        </p>
      )}

      {/*
        La acción más importante y por eso va primero: una solicitud ya cubierta
        que sigue abierta desvía ayuda de quien todavía la espera.
      */}
      <section>
        <h2 className="mb-2 font-semibold">¿Cómo va la ayuda?</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(ESTADOS) as EstadoSolicitud[]).map((e) => {
            const activo = estado === e;
            return (
              <button
                key={e}
                type="button"
                onClick={() => guardar(e)}
                disabled={guardando}
                aria-pressed={activo}
                className="presionable rounded-2xl border-2 p-3 text-left disabled:opacity-60"
                style={{
                  borderColor: activo ? "var(--primario)" : "var(--borde)",
                  background: activo ? "var(--primario-fondo)" : "var(--superficie)",
                  color: activo ? "var(--primario-fuerte)" : "var(--texto)",
                }}
              >
                <span className="block font-semibold">{ESTADOS[e].nombre}</span>
                <span className="mt-0.5 block text-xs text-[var(--texto-suave)]">
                  {ESTADOS[e].detalle}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {!cubierta && (
        <>
          <fieldset>
            <legend className="mb-2 font-semibold">Urgencia</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(URGENCIAS) as Urgencia[]).map((u) => {
                const activo = urgencia === u;
                const cfg = URGENCIAS[u];
                return (
                  <button
                    key={u} type="button" onClick={() => setUrgencia(u)}
                    aria-pressed={activo}
                    className="presionable flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 px-3 text-sm"
                    style={{
                      borderColor: activo ? cfg.color : "var(--borde)",
                      background: activo ? cfg.fondo : "var(--superficie)",
                      color: activo ? cfg.color : "var(--texto)",
                      fontWeight: activo ? 700 : 400,
                    }}
                  >
                    <TriangleAlert size={14} strokeWidth={3} aria-hidden />
                    {cfg.nombre}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 font-semibold">Qué necesitan ahora</legend>
            <p className="mb-2 text-xs text-[var(--texto-suave)] text-pretty">
              Quita lo que ya recibieron: evita que sigan llegando cosas que ya
              no hacen falta.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {NECESIDADES.map(({ id, nombre, Icono }) => {
                const activo = necesita.includes(id);
                return (
                  <button
                    key={id} type="button"
                    onClick={() =>
                      setNecesita((p) =>
                        p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
                      )
                    }
                    aria-pressed={activo}
                    className="presionable flex min-h-11 items-center gap-1.5 rounded-xl border-2 px-3 text-sm"
                    style={{
                      borderColor: activo ? "var(--primario)" : "var(--borde)",
                      background: activo ? "var(--primario-fondo)" : "var(--superficie)",
                      color: activo ? "var(--primario-fuerte)" : "var(--texto)",
                      fontWeight: activo ? 600 : 400,
                    }}
                  >
                    <Icono size={15} aria-hidden />
                    {nombre}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="desc" className="mb-1.5 block font-semibold">
              Cómo va la situación
            </label>
            <textarea
              id="desc"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={1200}
              rows={5}
              className="w-full rounded-xl border border-[var(--borde)] bg-[var(--superficie)] px-3 py-2.5 text-base"
            />
          </div>

          <SubirFoto
            onSubida={setFotoUrl}
            etiqueta="Actualizar foto (opcional)"
            ayuda="Fotografía el daño o la necesidad, no a las personas."
          />

          <button
            onClick={() => guardar()}
            disabled={guardando}
            className="presionable flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primario)] px-4 py-3.5 font-semibold text-[var(--sobre-primario)] shadow-[var(--sombra-2)] disabled:opacity-60"
          >
            {guardando && <Loader2 size={18} className="animate-spin" aria-hidden />}
            Guardar cambios
          </button>
        </>
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

      <a
        href={`/solicitud/${solicitud.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 text-sm text-[var(--info)] underline"
      >
        Ver cómo la ve el público
        <ExternalLink size={13} aria-hidden />
      </a>
    </div>
  );
}
