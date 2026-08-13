import { AtSign, Code2, Heart } from "lucide-react";

/**
 * Quién hizo esto, con enlaces que se puedan comprobar.
 *
 * No es vanidad: el código es MIT y los datos CC BY 4.0, y ambas licencias
 * piden atribución. Cuando una plataforma como esta circula por WhatsApp, la
 * autoría es lo primero que se pierde por el camino — y con ella la forma de
 * saber quién responde por los datos. Un nombre enlazado y un correo real son
 * también una señal de que detrás hay alguien, no una cuenta anónima pidiendo
 * confianza.
 */

const INSTAGRAM = "https://www.instagram.com/sleks_92/";
const CORREO = "sleks.dev@gmail.com";
const REPO = "https://github.com/sleks9/acopioya-colombia";

/** Lucide retiró los logos de marca por licencia; este es el glifo de Instagram. */
function IconoInstagram({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const CLASE =
  "presionable inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--borde)] px-2.5 text-xs font-medium text-[var(--texto-suave)] hover:text-[var(--texto)]";

export function Autoria() {
  return (
    <div className="space-y-2">
      <p className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--texto-suave)]">
        Hecho con
        <Heart size={12} className="text-[var(--peligro)]" aria-label="cariño" />
        por{" "}
        <strong className="text-[var(--texto)]">Santiago Ríos Morales (Sleks)</strong>
        <span aria-hidden>·</span> Cali, Colombia
      </p>
      <div className="flex flex-wrap gap-1.5">
        <a href={INSTAGRAM} target="_blank" rel="me noopener noreferrer" className={CLASE}>
          <IconoInstagram />
          @sleks_92
        </a>
        <a href={`mailto:${CORREO}`} className={CLASE}>
          <AtSign size={13} aria-hidden />
          {CORREO}
        </a>
        <a href={REPO} target="_blank" rel="noopener noreferrer" className={CLASE}>
          <Code2 size={13} aria-hidden />
          Código abierto
        </a>
      </div>
    </div>
  );
}
