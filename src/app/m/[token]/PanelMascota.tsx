"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle, Bookmark, CheckCircle2, ExternalLink, Loader2, PartyPopper,
} from "lucide-react";
import { actualizarMascota } from "@/app/acciones";
import { SubirFoto } from "@/components/SubirFoto";
import { guardarMiPunto } from "@/lib/misPuntos";
import { urlFoto } from "@/lib/tipos";
import { nombreEspecie } from "@/lib/mascotas";

type MascotaPropia = {
  id: string;
  caso: "perdida" | "encontrada";
  especie: "perro" | "gato" | "ave" | "otro";
  nombre: string | null;
  color: string;
  senas: string | null;
  municipio: string;
  departamento: string;
  fecha_suceso: string;
  foto_url: string;
  estado: string;
};

export function PanelMascota({
  token,
  mascota,
}: {
  token: string;
  mascota: MascotaPropia;
}) {
  const [senas, setSenas] = useState(mascota.senas ?? "");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [estado, setEstado] = useState(mascota.estado);

  const titulo = mascota.nombre ?? `${nombreEspecie(mascota.especie)} ${mascota.color.toLowerCase()}`;

  useEffect(() => {
    guardarMiPunto({ id: mascota.id, nombre: titulo, token });
  }, [mascota.id, titulo, token]);

  async function guardar(nuevoEstado?: string) {
    setGuardando(true);
    setError("");
    setMensaje("");

    const r = await actualizarMascota(token, {
      estado: nuevoEstado,
      senas: senas.trim() || null,
      foto_url: fotoUrl,
    });

    setGuardando(false);
    if (r.ok) {
      if (nuevoEstado) setEstado(nuevoEstado);
      setMensaje(
        nuevoEstado === "reunida"
          ? "¡Qué alegría! El reporte queda cerrado."
          : "Guardado. El reporte ya aparece actualizado."
      );
    } else {
      setError(r.error ?? "No se pudo guardar.");
    }
  }

  const reunida = estado === "reunida";

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--texto-suave)]">
          Mi reporte
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-balance">{titulo}</h1>
        <p className="text-sm text-[var(--texto-suave)]">
          {mascota.caso === "perdida" ? "Se perdió" : "La encontraron"} en{" "}
          {mascota.municipio}, {mascota.departamento}
        </p>
      </header>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urlFoto(mascota.foto_url) ?? mascota.foto_url}
        alt={titulo}
        className="max-h-72 w-full rounded-2xl border border-[var(--borde)] object-cover"
      />

      {reunida ? (
        <p className="flex items-center gap-2 rounded-2xl bg-[var(--primario-fondo)] px-4 py-3 font-semibold text-[var(--primario-fuerte)]">
          <PartyPopper size={20} aria-hidden />
          Este reporte ya está cerrado. ¡Gracias por avisar!
        </p>
      ) : (
        <>
          <p className="flex items-start gap-2.5 rounded-2xl bg-[var(--info-fondo)] px-4 py-3 text-sm text-[var(--info)]">
            <Bookmark size={16} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              Guarda esta página en favoritos: es tu acceso y no necesitas
              contraseña.
            </span>
          </p>

          {/*
            La acción más importante del panel, y por eso va primero y grande:
            un registro de perdidos se vuelve inútil cuando se llena de casos ya
            resueltos que nadie cerró.
          */}
          <button
            onClick={() => guardar("reunida")}
            disabled={guardando}
            className="presionable flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primario)] px-4 py-4 text-lg font-bold text-[var(--sobre-primario)] shadow-[var(--sombra-2)] disabled:opacity-60"
          >
            {guardando ? (
              <Loader2 size={20} className="animate-spin" aria-hidden />
            ) : (
              <PartyPopper size={20} aria-hidden />
            )}
            {mascota.caso === "perdida" ? "¡Ya apareció!" : "Ya la reclamaron"}
          </button>

          <div>
            <label htmlFor="senas" className="mb-1.5 block font-semibold">
              Señas particulares
            </label>
            <textarea
              id="senas"
              value={senas}
              onChange={(e) => setSenas(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Collar, cicatriz, una oreja caída…"
              className="w-full rounded-xl border border-[var(--borde)] bg-[var(--superficie)] px-3 py-2.5 text-base"
            />
          </div>

          <SubirFoto onSubida={setFotoUrl} etiqueta="Cambiar la foto (opcional)" />

          <button
            onClick={() => guardar()}
            disabled={guardando}
            className="presionable flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--borde-fuerte)] px-4 py-3 font-semibold disabled:opacity-60"
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
        href={`/mascota/${mascota.id}`}
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
