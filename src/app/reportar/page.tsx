"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  AlertCircle, ArrowRight, CheckCircle2, Copy, Loader2, MessageCircle, ShieldOff,
} from "lucide-react";
import { reportarCentro } from "../acciones";
import { SubirFoto } from "@/components/SubirFoto";
import SelectorUbicacion, { type UbicacionElegida } from "@/components/SelectorUbicacion";
import { SelectorHorario } from "@/components/SelectorHorario";
import { SelectorInsumos } from "@/components/SelectorInsumos";
import { MisPuntos } from "@/components/MisPuntos";
import { guardarMiPunto } from "@/lib/misPuntos";
import { DEPARTAMENTOS, municipiosDe } from "@/lib/divipola";

const ENTRADA =
  "w-full min-h-11 rounded-xl border border-[var(--borde)] bg-[var(--superficie)] px-3 py-2.5 text-base";

export default function Reportar() {
  const [ubicacion, setUbicacion] = useState<UbicacionElegida | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState<{ id: string; token: string } | null>(null);
  const [contactoPublico, setContactoPublico] = useState(false);

  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [horario, setHorario] = useState("");
  const [insumos, setInsumos] = useState<{ necesita: string[]; noNecesita: string[] }>({
    necesita: [],
    noNecesita: [],
  });

  const alCambiarInsumos = useCallback(
    (necesita: string[], noNecesita: string[]) => setInsumos({ necesita, noNecesita }),
    []
  );

  const municipios = useMemo(() => municipiosDe(departamento), [departamento]);

  // La cabecera del municipio le da al mapa un punto de partida util, en vez
  // de arrancar mirando todo el pais.
  const centroSugerido = useMemo(() => {
    const m = municipios.find((x) => x.n === municipio);
    return m ? { lat: m.lat, lng: m.lng } : null;
  }, [municipios, municipio]);

  const alCambiarUbicacion = useCallback((u: UbicacionElegida) => setUbicacion(u), []);

  async function enviar(formData: FormData) {
    setError("");

    // Validaciones que el navegador no cubre, cada una apuntando al bloque
    // que hay que corregir: un error al principio del formulario, con el campo
    // culpable fuera de pantalla, no ayuda a nadie.
    if (!ubicacion) {
      setError("Falta la ubicación. Usa el GPS, busca la dirección o marca el punto en el mapa.");
      document.getElementById("bloque-ubicacion")?.scrollIntoView({ block: "center" });
      return;
    }
    if (!horario) {
      setError("Completa los días y el horario de atención.");
      document.getElementById("bloque-horario")?.scrollIntoView({ block: "center" });
      return;
    }
    if (insumos.necesita.length === 0) {
      setError("Marca al menos un insumo que estén recibiendo.");
      document.getElementById("bloque-insumos")?.scrollIntoView({ block: "center" });
      return;
    }

    setEnviando(true);
    formData.set("lat", String(ubicacion.lat));
    formData.set("lng", String(ubicacion.lng));
    formData.set("precision", ubicacion.precision);
    if (ubicacion.precisionMetros != null) {
      formData.set("precision_metros", String(ubicacion.precisionMetros));
    }
    if (fotoUrl) formData.set("foto_url", fotoUrl);

    const r = await reportarCentro(formData);
    setEnviando(false);
    if (r.ok) {
      // Red de seguridad por si se pierde el enlace mágico.
      guardarMiPunto({
        id: r.id,
        token: r.token,
        nombre: String(formData.get("nombre") ?? "Mi punto"),
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
        <h1 className="text-2xl font-bold tracking-tight">Reportar un centro de acopio</h1>
        <p className="mt-1 text-sm text-[var(--texto-suave)] text-pretty">
          Toma menos de un minuto. Al terminar recibes un enlace privado para
          mantener el punto actualizado, sin crear ninguna cuenta.
        </p>
      </header>

      <MisPuntos />

      <form action={enviar} className="space-y-6">
        <Campo etiqueta="Nombre del punto" requerido>
          <input
            name="nombre" required minLength={3} maxLength={120}
            placeholder="Ej: Coliseo El Salitre" className={ENTRADA}
          />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Departamento" requerido>
            <select
              name="departamento"
              required
              value={departamento}
              onChange={(e) => {
                setDepartamento(e.target.value);
                setMunicipio("");
              }}
              className={ENTRADA}
            >
              <option value="">Elige un departamento</option>
              {DEPARTAMENTOS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Municipio" requerido>
            <select
              name="ciudad"
              required
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              disabled={!departamento}
              className={`${ENTRADA} disabled:opacity-50`}
            >
              <option value="">
                {departamento ? "Elige un municipio" : "Elige primero el departamento"}
              </option>
              {municipios.map((m) => (
                <option key={m.n} value={m.n}>{m.n}</option>
              ))}
            </select>
          </Campo>
        </div>

        <Campo etiqueta="Dirección escrita" requerido
          ayuda="Es lo que la gente lee para confirmar por teléfono. Escríbela completa aunque ya hayas marcado la ubicación.">
          <input
            name="direccion" required minLength={3} maxLength={240}
            placeholder="Ej: Calle 63 # 60-80" className={ENTRADA}
          />
        </Campo>

        <div id="bloque-ubicacion">
          <label className="mb-1.5 block text-sm font-medium">
            Ubicación exacta <Requerido />
          </label>
          <p className="mb-2 text-xs text-[var(--texto-suave)] text-pretty">
            Con cualquiera de las tres opciones basta. Si estás en el lugar
            ahora, el GPS es lo más preciso y no necesita cargar el mapa.
          </p>
          <SelectorUbicacion
            centroSugerido={centroSugerido}
            onCambio={alCambiarUbicacion}
          />
        </div>

        <div id="bloque-horario">
          <span className="mb-2 block text-sm font-medium">
            Horario de atención <Requerido />
          </span>
          <SelectorHorario onCambio={setHorario} />
        </div>

        <div id="bloque-insumos">
          <SelectorInsumos onCambio={alCambiarInsumos} />
        </div>

        <SubirFoto
          onSubida={setFotoUrl}
          etiqueta="Foto del punto"
          ayuda="Una foto del lugar o su señalización ayuda a que otros confíen en el reporte."
        />

        <Campo etiqueta="Notas">
          <textarea name="notas" maxLength={500} rows={3}
            placeholder="Ej: entrada por la puerta 3, hay parqueadero" className={ENTRADA} />
        </Campo>

        <fieldset className="space-y-2 rounded-xl border border-[var(--borde)] p-4">
          <legend className="px-1 text-sm font-medium">Contacto (opcional)</legend>
          <input name="telefono" type="tel" inputMode="tel" maxLength={40}
            autoComplete="tel" placeholder="Teléfono del encargado" className={ENTRADA} />
          <label className="flex items-start gap-2 text-xs text-[var(--texto-suave)]">
            <input
              type="checkbox" name="contacto_publico" className="mt-0.5 h-4 w-4 accent-[var(--primario)]"
              checked={contactoPublico}
              onChange={(e) => setContactoPublico(e.target.checked)}
            />
            <span>
              Autorizo publicar este teléfono en el sitio para que la gente pueda
              confirmar antes de ir. Sin esta casilla el número no se publica ni
              se envía (Ley 1581 de 2012).
            </span>
          </label>
        </fieldset>

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-xl bg-[var(--peligro-fondo)] px-3 py-2.5 text-sm text-[var(--peligro)]">
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        <button
          type="submit" disabled={enviando}
          className="presionable flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primario)] px-4 py-3.5 font-semibold text-[var(--sobre-primario)] shadow-[var(--sombra-2)] disabled:opacity-60"
        >
          {enviando && <Loader2 size={18} className="animate-spin" aria-hidden />}
          {enviando ? "Publicando…" : "Publicar punto"}
        </button>

        <p className="flex items-start gap-2 text-xs text-[var(--texto-suave)]">
          <ShieldOff size={14} className="mt-0.5 shrink-0" aria-hidden />
          No pedimos cuentas bancarias ni datos de pago. Si alguien te pide
          dinero a nombre de este sitio, es un fraude.
        </p>
      </form>
    </div>
  );
}

function Requerido() {
  return <span className="text-[var(--peligro)]" aria-hidden>*</span>;
}

function Campo({
  etiqueta, ayuda, requerido, children,
}: {
  etiqueta: string;
  ayuda?: string;
  requerido?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {etiqueta} {requerido && <Requerido />}
      </label>
      {ayuda && (
        <p className="mb-2 text-xs text-[var(--texto-suave)] text-pretty">{ayuda}</p>
      )}
      {children}
    </div>
  );
}

function Exito({ id, token }: { id: string; token: string }) {
  const enlace =
    typeof window !== "undefined" ? `${window.location.origin}/p/${token}` : `/p/${token}`;
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
      <div className="rounded-2xl border border-[var(--primario)]/30 bg-[var(--primario-fondo)] p-5">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--primario-fuerte)]">
          <CheckCircle2 size={22} aria-hidden />
          Punto publicado
        </h1>
        <p className="mt-1.5 text-sm">
          Ya aparece en el mapa marcado como <strong>sin verificar</strong>. Pasa
          a verificado cuando lo actualices desde tu enlace o cuando otras
          personas lo confirmen.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-4">
        <h2 className="font-semibold">Guarda este enlace privado</h2>
        <p className="text-sm text-[var(--texto-suave)] text-pretty">
          Es la única forma de actualizar el punto y no pide contraseña.{" "}
          <strong className="text-[var(--texto)]">
            No lo publiques: quien lo tenga puede editar el punto.
          </strong>{" "}
          Se muestra una sola vez.
        </p>

        <code className="block break-all rounded-xl border border-[var(--borde)] bg-[var(--fondo)] p-3 text-xs">
          {enlace}
        </code>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(enlace);
              setCopiado(true);
            }}
            className="presionable flex items-center gap-1.5 rounded-xl bg-[var(--info)] px-3.5 py-2.5 text-sm font-semibold text-white"
          >
            {copiado ? <CheckCircle2 size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
            {copiado ? "Copiado" : "Copiar enlace"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Enlace para administrar nuestro centro de acopio en AcopioYa: ${enlace}`
            )}`}
            target="_blank" rel="noopener noreferrer"
            className="presionable flex items-center gap-1.5 rounded-xl border border-[var(--borde-fuerte)] px-3.5 py-2.5 text-sm font-semibold"
          >
            <MessageCircle size={16} aria-hidden />
            Enviar por WhatsApp
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/centro/${id}`}
          className="presionable flex items-center gap-1.5 rounded-xl border border-[var(--borde-fuerte)] px-4 py-2.5 text-sm font-semibold"
        >
          Ver el punto <ArrowRight size={16} aria-hidden />
        </Link>
        <Link
          href="/mapa"
          className="presionable rounded-xl border border-[var(--borde-fuerte)] px-4 py-2.5 text-sm font-semibold"
        >
          Volver al mapa
        </Link>
      </div>
    </div>
  );
}
