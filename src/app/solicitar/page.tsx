"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  AlertCircle, ArrowRight, CheckCircle2, Copy, Loader2, MessageCircle,
  ShieldCheck, TriangleAlert,
} from "lucide-react";
import { crearSolicitud } from "../acciones";
import { SubirFoto } from "@/components/SubirFoto";
import SelectorUbicacion, { type UbicacionElegida } from "@/components/SelectorUbicacion";
import { MisPuntos } from "@/components/MisPuntos";
import { DEPARTAMENTOS, municipiosDe } from "@/lib/divipola";
import { NECESIDADES, TIPOS, URGENCIAS, type Urgencia } from "@/lib/solicitudes";
import { guardarMiPunto } from "@/lib/misPuntos";

const ENTRADA =
  "w-full min-h-11 rounded-xl border border-[var(--borde)] bg-[var(--superficie)] px-3 py-2.5 text-base";

export default function Solicitar() {
  const [tipo, setTipo] = useState<string>("familia");
  const [urgencia, setUrgencia] = useState<Urgencia>("normal");
  const [necesita, setNecesita] = useState<string[]>([]);
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [ubicacion, setUbicacion] = useState<UbicacionElegida | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [contactoPublico, setContactoPublico] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState<{ id: string; token: string } | null>(null);

  const municipios = useMemo(() => municipiosDe(departamento), [departamento]);
  const centroSugerido = useMemo(() => {
    const m = municipios.find((x) => x.n === municipio);
    return m ? { lat: m.lat, lng: m.lng } : null;
  }, [municipios, municipio]);

  const alCambiarUbicacion = useCallback((u: UbicacionElegida) => setUbicacion(u), []);

  function alternar(id: string) {
    setNecesita((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  async function enviar(formData: FormData) {
    setError("");
    if (necesita.length === 0) {
      setError("Marca al menos una necesidad.");
      document.getElementById("bloque-necesidades")?.scrollIntoView({ block: "center" });
      return;
    }
    if (!ubicacion) {
      setError("Marca la zona en el mapa.");
      document.getElementById("bloque-zona")?.scrollIntoView({ block: "center" });
      return;
    }

    setEnviando(true);
    formData.set("tipo", tipo);
    formData.set("urgencia", urgencia);
    necesita.forEach((n) => formData.append("necesita", n));
    formData.set("lat", String(ubicacion.lat));
    formData.set("lng", String(ubicacion.lng));
    if (fotoUrl) formData.set("foto_url", fotoUrl);

    const r = await crearSolicitud(formData);
    setEnviando(false);
    if (r.ok) {
      guardarMiPunto({
        id: r.id,
        token: r.token,
        nombre: String(formData.get("titulo") || "Mi solicitud"),
      });
      setExito({ id: r.id, token: r.token });
    } else {
      setError(r.error);
    }
  }

  if (exito) return <Exito id={exito.id} token={exito.token} />;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Pedir ayuda</h1>
        <p className="mt-1 text-sm text-[var(--texto-suave)] text-pretty">
          Publica qué necesitan tú, tu familia o tu comunidad, para que quien
          quiera ayudar sepa a dónde llevarlo.
        </p>
      </header>

      <MisPuntos />

      {/* La regla de privacidad, dicha antes de pedir un solo dato. */}
      <p className="flex items-start gap-2.5 rounded-2xl bg-[var(--info-fondo)] px-4 py-3 text-sm text-[var(--info)]">
        <ShieldCheck size={17} className="mt-0.5 shrink-0" aria-hidden />
        <span>
          Solo pedimos el <strong>barrio o vereda</strong>, nunca tu dirección
          exacta, y tu teléfono no se publica salvo que lo autorices.
        </span>
      </p>

      <form action={enviar} className="space-y-6">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">¿Para quién es la ayuda?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {TIPOS.map((t) => {
              const activo = tipo === t.id;
              return (
                <button
                  key={t.id} type="button" onClick={() => setTipo(t.id)}
                  aria-pressed={activo}
                  className="presionable rounded-2xl border-2 p-3 text-left"
                  style={{
                    borderColor: activo ? "var(--primario)" : "var(--borde)",
                    background: activo ? "var(--primario-fondo)" : "var(--superficie)",
                    color: activo ? "var(--primario-fuerte)" : "var(--texto)",
                  }}
                >
                  <span className="flex items-center gap-1.5 font-semibold">
                    <t.Icono size={15} aria-hidden />
                    {t.nombre}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--texto-suave)]">
                    {t.detalle}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <Campo etiqueta="Título" requerido
          ayuda="Una línea que resuma la situación. Es lo primero que se lee en el listado.">
          <input name="titulo" required minLength={5} maxLength={120}
            placeholder="Ej: 40 familias sin techo en la vereda" className={ENTRADA} />
        </Campo>

        <Campo etiqueta="Qué pasó y qué necesitan" requerido
          ayuda="Explica la situación con detalle. Entre más claro, más fácil es que alguien organice la ayuda.">
          <textarea name="descripcion" required minLength={20} maxLength={1200} rows={5}
            placeholder="Ej: El deslizamiento tapó la vía y las casas quedaron inhabitables…"
            className={ENTRADA} />
        </Campo>

        <fieldset id="bloque-necesidades">
          <legend className="mb-2 text-sm font-medium">
            ¿Qué necesitan? <span className="text-[var(--peligro)]" aria-hidden>*</span>
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {NECESIDADES.map(({ id, nombre, Icono }) => {
              const activo = necesita.includes(id);
              return (
                <button
                  key={id} type="button" onClick={() => alternar(id)}
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

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Urgencia</legend>
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
          <p className="mt-2 text-xs text-[var(--texto-suave)] text-pretty">
            Marca <strong>crítica</strong> solo si hay riesgo para la vida o la
            salud. Si todo es crítico, nada lo es.
          </p>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Departamento" requerido>
            <select name="departamento" required value={departamento}
              onChange={(e) => { setDepartamento(e.target.value); setMunicipio(""); }}
              className={ENTRADA}>
              <option value="">Elige un departamento</option>
              {DEPARTAMENTOS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Municipio" requerido>
            <select name="ciudad" required value={municipio} disabled={!departamento}
              onChange={(e) => setMunicipio(e.target.value)}
              className={`${ENTRADA} disabled:opacity-50`}>
              <option value="">
                {departamento ? "Elige un municipio" : "Elige primero el departamento"}
              </option>
              {municipios.map((m) => <option key={m.n} value={m.n}>{m.n}</option>)}
            </select>
          </Campo>
        </div>

        <Campo etiqueta="Barrio o vereda" requerido
          ayuda="Hasta aquí llega el detalle público. No pidas ni publiques la dirección de una casa.">
          <input name="barrio_vereda" required minLength={2} maxLength={120}
            placeholder="Ej: Vereda La Esperanza" className={ENTRADA} />
        </Campo>

        <Campo etiqueta="¿Cuántas personas se benefician?">
          <input name="personas" type="number" min={1} max={100000} inputMode="numeric"
            placeholder="Ej: 40" className={ENTRADA} />
        </Campo>

        <div id="bloque-zona">
          <label className="mb-1.5 block text-sm font-medium">
            Zona <span className="text-[var(--peligro)]" aria-hidden>*</span>
          </label>
          <p className="mb-2 text-xs text-[var(--texto-suave)] text-pretty">
            Marca el sector, no la casa. Sirve para que quien traiga ayuda sepa
            a qué parte del municipio dirigirse.
          </p>
          <SelectorUbicacion
            centroSugerido={centroSugerido}
            municipio={municipio || undefined}
            departamento={departamento || undefined}
            onCambio={alCambiarUbicacion}
          />
        </div>

        <SubirFoto
          onSubida={setFotoUrl}
          etiqueta="Foto del daño (opcional)"
          ayuda="Fotografía el daño o la necesidad, no a las personas. No subas imágenes de menores ni de personas identificables sin su permiso."
        />

        <fieldset className="space-y-2 rounded-xl border border-[var(--borde)] p-4">
          <legend className="px-1 text-sm font-medium">Contacto</legend>
          <input name="telefono" type="tel" inputMode="tel" maxLength={40}
            autoComplete="tel" placeholder="Teléfono de quien coordina" className={ENTRADA} />
          <label className="flex items-start gap-2 text-xs text-[var(--texto-suave)]">
            <input type="checkbox" name="contacto_publico"
              className="mt-0.5 h-4 w-4 accent-[var(--primario)]"
              checked={contactoPublico}
              onChange={(e) => setContactoPublico(e.target.checked)} />
            <span>
              Autorizo publicar este teléfono. Sin esta casilla no se publica ni
              se envía (Ley 1581 de 2012), y la coordinación se hará a través de
              la alcaldía o la junta de acción comunal.
            </span>
          </label>
        </fieldset>

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-xl bg-[var(--peligro-fondo)] px-3 py-2.5 text-sm text-[var(--peligro)]">
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        <button type="submit" disabled={enviando}
          className="presionable flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primario)] px-4 py-3.5 font-semibold text-[var(--sobre-primario)] shadow-[var(--sombra-2)] disabled:opacity-60">
          {enviando && <Loader2 size={18} className="animate-spin" aria-hidden />}
          {enviando ? "Publicando…" : "Publicar solicitud"}
        </button>

        <p className="text-xs text-[var(--texto-suave)] text-pretty">
          No pedimos cuentas bancarias ni datos de pago, y esta plataforma nunca
          intermedia dinero. Si alguien te pide una transferencia a nombre de
          esta ayuda, es un fraude.
        </p>
      </form>
    </div>
  );
}

function Campo({
  etiqueta, ayuda, requerido, children,
}: { etiqueta: string; ayuda?: string; requerido?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {etiqueta} {requerido && <span className="text-[var(--peligro)]" aria-hidden>*</span>}
      </label>
      {ayuda && <p className="mb-2 text-xs text-[var(--texto-suave)] text-pretty">{ayuda}</p>}
      {children}
    </div>
  );
}

function Exito({ id, token }: { id: string; token: string }) {
  const enlace =
    typeof window !== "undefined" ? `${window.location.origin}/s/${token}` : `/s/${token}`;
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
      <div className="rounded-2xl border border-[var(--primario)]/30 bg-[var(--primario-fondo)] p-5">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--primario-fuerte)]">
          <CheckCircle2 size={22} aria-hidden />
          Solicitud publicada
        </h1>
        <p className="mt-1.5 text-sm">
          Ya aparece en el listado. Cuando reciban lo que necesitaban, márcala
          como cubierta para que la ayuda se dirija a quien todavía la espera.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-4">
        <h2 className="font-semibold">Guarda este enlace privado</h2>
        <p className="text-sm text-[var(--texto-suave)] text-pretty">
          Es la única forma de actualizar o cerrar tu solicitud. Se muestra una
          sola vez.
        </p>
        <code className="block break-all rounded-xl border border-[var(--borde)] bg-[var(--fondo)] p-3 text-xs">
          {enlace}
        </code>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(enlace); setCopiado(true); }}
            className="presionable flex items-center gap-1.5 rounded-xl bg-[var(--info)] px-3.5 py-2.5 text-sm font-semibold text-white">
            {copiado ? <CheckCircle2 size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
            {copiado ? "Copiado" : "Copiar enlace"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Enlace para administrar nuestra solicitud en AcopioYa: ${enlace}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="presionable flex items-center gap-1.5 rounded-xl border border-[var(--borde-fuerte)] px-3.5 py-2.5 text-sm font-semibold">
            <MessageCircle size={16} aria-hidden />
            Enviar por WhatsApp
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={`/solicitud/${id}`}
          className="presionable flex items-center gap-1.5 rounded-xl border border-[var(--borde-fuerte)] px-4 py-2.5 text-sm font-semibold">
          Ver la solicitud <ArrowRight size={16} aria-hidden />
        </Link>
        <Link href="/solicitudes"
          className="presionable rounded-xl border border-[var(--borde-fuerte)] px-4 py-2.5 text-sm font-semibold">
          Volver al listado
        </Link>
      </div>
    </div>
  );
}
