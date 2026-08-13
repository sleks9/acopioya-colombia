"use client";

import { useCallback, useEffect, useRef, useState } from "react";
// lucide v1 retiró los logos de marca, así que WhatsApp y Facebook van con
// iconos genéricos. Da igual: el texto del botón es lo que se lee.
import {
  Check, Copy, Download, ExternalLink, Image as ImagenIcono, Loader2,
  MessageCircle, Share2, X,
} from "lucide-react";
import { CATALOGO, FORMATOS, type Formato } from "@/lib/tarjeta/formatos";
import type { TextosCompartir } from "@/lib/tarjeta/texto";

/**
 * Compartir el punto como imagen.
 *
 * En Colombia la difusión de emergencia no ocurre por enlaces: ocurre por
 * imágenes reenviadas en grupos y estados de WhatsApp. Un enlace se pierde en
 * la conversación; una imagen se reenvía sola. Esto convierte cualquier ficha
 * en esa imagen.
 *
 * La imagen se arma en el servidor (`/api/tarjeta/...`) y no en el navegador:
 * una librería de captura en el cliente serían ~200 KB de JavaScript extra en
 * un dispositivo con mala red, para hacer peor lo que el servidor hace bien.
 */

type Props = {
  tipo: "centro" | "mascota" | "solicitud";
  id: string;
  textos: TextosCompartir;
  url: string;
};

/** Ancho de la previsualización: suficiente para juzgarla, una fracción del peso. */
const ANCHO_PREVIO = 520;

/**
 * ¿Conviene descargar la previsualización sin que la pidan?
 *
 * En zona de desastre la red mala es lo normal, no la excepción. Con ahorro de
 * datos o 2G la imagen queda tras un toque, el mismo criterio que usan las
 * miniaturas del mapa.
 */
function redLenta(): boolean {
  if (typeof navigator === "undefined") return false;
  const con = (navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean };
  }).connection;
  return Boolean(
    con?.saveData || con?.effectiveType === "2g" || con?.effectiveType === "slow-2g"
  );
}

export function BotonCompartir(props: Props) {
  const [abierta, setAbierta] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        className="presionable flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--primario)] px-3.5 text-sm font-semibold text-[var(--sobre-primario)]"
      >
        <Share2 size={16} aria-hidden />
        Compartir como imagen
      </button>
      {abierta && <Hoja {...props} alCerrar={() => setAbierta(false)} />}
    </>
  );
}

function Hoja({ tipo, id, textos, url, alCerrar }: Props & { alCerrar: () => void }) {
  const [visible, setVisible] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [formato, setFormato] = useState<Formato>("historia");
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState("");
  const [verPrevio, setVerPrevio] = useState(() => !redLenta());
  const [cargando, setCargando] = useState(() => !redLenta());
  const cierre = useRef<HTMLButtonElement>(null);

  /**
   * Los blobs a tamaño completo, ya descargados, por formato.
   *
   * No es una optimización: `navigator.share` exige que la llamada nazca de un
   * gesto del usuario, y en iOS esperar a un `fetch` dentro del manejador
   * rompe esa condición y el diálogo no abre. Con el archivo listo de
   * antemano, compartir es inmediato.
   */
  const cache = useRef(new Map<Formato, Blob>());

  useEffect(() => {
    // Un fotograma de margen para que el navegador pinte el estado cerrado
    // antes de la transición; sin esto la hoja aparece de golpe.
    const t = requestAnimationFrame(() => setVisible(true));
    cierre.current?.focus();
    return () => cancelAnimationFrame(t);
  }, []);

  const cerrar = useCallback(() => {
    setCerrando(true);
    setVisible(false);
    setTimeout(alCerrar, 150);
  }, [alCerrar]);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [cerrar]);

  const enlaceTarjeta = (f: Formato, ancho?: number) =>
    `/api/tarjeta/${tipo}/${id}?formato=${f}${ancho ? `&ancho=${ancho}` : ""}`;

  /** Trae la imagen a tamaño completo, o la devuelve de la caché. */
  async function archivo(f: Formato): Promise<{ blob: Blob; nombre: string } | null> {
    const guardado = cache.current.get(f);
    const blob = guardado ?? (await fetch(enlaceTarjeta(f)).then((r) => (r.ok ? r.blob() : null)));
    if (!blob) return null;
    cache.current.set(f, blob);
    const ext = blob.type.includes("png") ? "png" : "jpg";
    return { blob, nombre: `acopioya-${tipo}-${f}.${ext}` };
  }

  async function compartir() {
    setOcupado(true);
    setAviso("");
    try {
      const a = await archivo(formato);
      if (!a) throw new Error("no se pudo generar");

      const file = new File([a.blob], a.nombre, { type: a.blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: textos.plano });
      } else {
        descargar(a.blob, a.nombre);
        setAviso("Imagen descargada. Ya puedes subirla donde quieras.");
      }
    } catch (e) {
      // Cancelar el diálogo del sistema lanza AbortError: no es un fallo.
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        setAviso("No se pudo compartir. Intenta descargarla.");
      }
    } finally {
      setOcupado(false);
    }
  }

  async function soloDescargar() {
    setOcupado(true);
    const a = await archivo(formato);
    if (a) {
      descargar(a.blob, a.nombre);
      setAviso("Imagen descargada.");
    } else {
      setAviso("No se pudo generar la imagen.");
    }
    setOcupado(false);
  }

  const lienzo = CATALOGO[formato];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Compartir como imagen"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={cerrar}
        className="hoja-fondo absolute inset-0 bg-black/50"
        style={{ opacity: visible ? 1 : 0 }}
        tabIndex={-1}
      />

      <div
        className="hoja relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-y-auto rounded-t-2xl bg-[var(--superficie)] p-4 shadow-[var(--sombra-3)] sm:rounded-2xl"
        data-visible={visible}
        data-cerrando={cerrando}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">Compartir como imagen</h2>
          <button
            ref={cierre}
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="presionable -mr-1 flex size-11 items-center justify-center rounded-xl text-[var(--texto-suave)]"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        {/* ── Formato ── */}
        <div className="flex gap-1.5" role="group" aria-label="Formato de la imagen">
          {FORMATOS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                if (f === formato) return;
                setFormato(f);
                if (verPrevio) setCargando(true);
              }}
              aria-pressed={f === formato}
              className={`presionable min-h-11 flex-1 rounded-xl border-2 px-2 text-xs font-semibold ${
                f === formato
                  ? "border-[var(--primario)] bg-[var(--primario-fondo)] text-[var(--primario-fuerte)]"
                  : "border-[var(--borde)] text-[var(--texto-suave)]"
              }`}
            >
              {CATALOGO[f].etiqueta}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-[var(--texto-suave)]">{lienzo.detalle}</p>

        {/*
          Altura fija, no elástica. Dos razones: el contenedor es un hijo flex
          de una hoja con `max-h`, así que sin `shrink-0` se encogía y la
          imagen —que no encoge— se desbordaba por arriba y por abajo, tapando
          el texto de ayuda. Y con altura fija la hoja deja de dar saltos al
          cambiar entre formatos de proporciones muy distintas.
        */}
        <div className="relative mt-3 flex h-[42dvh] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--superficie-2)] p-3">
          {verPrevio ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={formato}
                src={enlaceTarjeta(formato, ANCHO_PREVIO)}
                alt={`Previsualización de la tarjeta en formato ${lienzo.etiqueta.toLowerCase()}`}
                className="lienzo-previo max-h-full max-w-full rounded-lg object-contain shadow-[var(--sombra-2)]"
                data-cambiando={cargando}
                onLoad={() => setCargando(false)}
                onError={() => setCargando(false)}
              />
              {cargando && (
                <Loader2
                  size={20}
                  className="absolute animate-spin text-[var(--texto-suave)]"
                  aria-hidden
                />
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setVerPrevio(true);
                setCargando(true);
              }}
              className="presionable flex min-h-11 items-center gap-2 rounded-xl border-2 border-[var(--borde)] px-3.5 text-sm font-semibold"
            >
              <ImagenIcono size={16} aria-hidden />
              Ver la imagen (usa datos)
            </button>
          )}
        </div>

        {/* ── Acción principal ── */}
        <button
          type="button"
          onClick={compartir}
          disabled={ocupado}
          className="presionable mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--primario)] text-sm font-bold text-[var(--sobre-primario)] disabled:opacity-60"
        >
          {ocupado ? (
            <Loader2 size={17} className="animate-spin" aria-hidden />
          ) : (
            <Share2 size={17} aria-hidden />
          )}
          Compartir imagen
        </button>

        <p aria-live="polite" className="mt-1.5 min-h-4 text-xs text-[var(--primario-fuerte)]">
          {aviso}
        </p>

        {/* ── Otras salidas ── */}
        <div className="mt-1 grid grid-cols-2 gap-1.5">
          <Secundario onClick={soloDescargar} icono={<Download size={15} aria-hidden />}>
            Descargar
          </Secundario>
          <Copiar texto={textos.plano} />
          <Externo
            href={`https://wa.me/?text=${encodeURIComponent(textos.whatsapp)}`}
            icono={<MessageCircle size={15} aria-hidden />}
          >
            WhatsApp
          </Externo>
          <Externo
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            icono={<ExternalLink size={15} aria-hidden />}
          >
            Facebook
          </Externo>
        </div>

        {/* Instagram no tiene forma de publicar desde el navegador. Nadie la
            tiene. Vale más decirlo que fingir un botón que no funciona. */}
        <p className="mt-3 rounded-xl bg-[var(--superficie-2)] p-2.5 text-xs leading-relaxed text-[var(--texto-suave)]">
          Para <strong className="font-semibold">Instagram</strong>, usa
          «Compartir imagen» y elígelo en el menú del teléfono, o descárgala y
          súbela como historia.
        </p>
      </div>
    </div>
  );
}

function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  // Sin esto el blob se queda en memoria hasta que se cierre la pestaña.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const CLASE_SECUNDARIO =
  "presionable flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-[var(--borde)] px-2 text-xs font-semibold text-[var(--texto)] disabled:opacity-60";

function Secundario({
  onClick,
  icono,
  children,
}: {
  onClick: () => void;
  icono: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={CLASE_SECUNDARIO}>
      {icono}
      {children}
    </button>
  );
}

function Externo({
  href,
  icono,
  children,
}: {
  href: string;
  icono: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={CLASE_SECUNDARIO}>
      {icono}
      {children}
    </a>
  );
}

function Copiar({ texto }: { texto: string }) {
  const [hecho, setHecho] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(texto);
        setHecho(true);
        setTimeout(() => setHecho(false), 2000);
      }}
      className={CLASE_SECUNDARIO}
    >
      {hecho ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
      {hecho ? "Copiado" : "Copiar texto"}
    </button>
  );
}
