import {
  AlertTriangle, BadgeCheck, Check, CircleAlert, Clock, MapPinOff, Moon, X,
} from "lucide-react";
import {
  abiertoAhora,
  ETIQUETA_ESTADO,
  ETIQUETA_FRESCURA,
  ETIQUETA_PRECISION,
  type Estado,
  type Frescura,
  type Precision,
  type Verificacion,
} from "@/lib/tipos";

const base =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap";

export function InsigniaEstado({ estado }: { estado: Estado }) {
  const mapa = {
    abierto: { c: "bg-[var(--primario-fondo)] text-[var(--primario-fuerte)]", I: Check },
    lleno: { c: "bg-[var(--acento-fondo)] text-[var(--acento)]", I: CircleAlert },
    cerrado: { c: "bg-[var(--peligro-fondo)] text-[var(--peligro)]", I: X },
  }[estado];

  return (
    <span className={`${base} ${mapa.c}`}>
      <mapa.I size={12} strokeWidth={3} aria-hidden />
      {ETIQUETA_ESTADO[estado]}
    </span>
  );
}

export function InsigniaVerificacion({ verificacion }: { verificacion: Verificacion }) {
  if (verificacion === "oficial") {
    return (
      <span className={`${base} bg-[var(--info-fondo)] text-[var(--info)]`}>
        <BadgeCheck size={12} strokeWidth={3} aria-hidden />
        Fuente oficial
      </span>
    );
  }
  if (verificacion === "verificado") {
    return (
      <span className={`${base} bg-[var(--primario-fondo)] text-[var(--primario-fuerte)]`}>
        <BadgeCheck size={12} strokeWidth={3} aria-hidden />
        Verificado
      </span>
    );
  }
  // Los reportes sin verificar se muestran, pero nunca disfrazados de oficiales.
  return (
    <span className={`${base} border border-[var(--borde-fuerte)] text-[var(--texto-suave)]`}>
      Sin verificar
    </span>
  );
}

export function InsigniaFrescura({ frescura }: { frescura: Frescura }) {
  if (frescura === "fresco") return null;
  return (
    <span className={`${base} bg-[var(--acento-fondo)] text-[var(--acento)]`}>
      <Clock size={12} strokeWidth={3} aria-hidden />
      {ETIQUETA_FRESCURA[frescura]}
    </span>
  );
}

/**
 * Abierto o cerrado según el reloj, no según el estado declarado.
 * Si el horario no se puede interpretar no se afirma nada: callar es mejor que
 * mandar a alguien a una puerta cerrada.
 */
export function InsigniaHorarioAhora({ horario }: { horario: string | null }) {
  const abierto = abiertoAhora(horario);
  if (abierto === null) return null;

  return abierto ? (
    <span className={`${base} bg-[var(--primario-fondo)] text-[var(--primario-fuerte)]`}>
      <Clock size={12} strokeWidth={3} aria-hidden />
      Abierto ahora
    </span>
  ) : (
    <span className={`${base} bg-[var(--superficie-2)] text-[var(--texto-suave)]`}>
      <Moon size={12} strokeWidth={3} aria-hidden />
      Cerrado a esta hora
    </span>
  );
}

/** Solo aparece cuando la coordenada NO es de fiar: el silencio es la señal buena. */
export function InsigniaPrecision({ precision }: { precision: Precision }) {
  if (ETIQUETA_PRECISION[precision].fiable) return null;
  return (
    <span className={`${base} bg-[var(--acento-fondo)] text-[var(--acento)]`}>
      <MapPinOff size={12} strokeWidth={3} aria-hidden />
      Ubicación aproximada
    </span>
  );
}

/** Aviso desplegado, para la ficha de detalle. */
export function AvisoPrecision({ precision }: { precision: Precision }) {
  if (ETIQUETA_PRECISION[precision].fiable) return null;
  return (
    <div
      role="note"
      className="flex gap-2.5 rounded-xl border border-[var(--acento)]/30 bg-[var(--acento-fondo)] px-4 py-3 text-sm text-[var(--acento)]"
    >
      <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden />
      <p>
        <strong>El pin de este punto es aproximado</strong> y puede estar a
        varias cuadras. La dirección escrita es la fuente confiable: confírmala
        antes de salir.
      </p>
    </div>
  );
}
