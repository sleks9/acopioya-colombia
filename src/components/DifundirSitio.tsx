"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Share2 } from "lucide-react";

/**
 * Invitación a difundir la plataforma.
 *
 * El cuello de botella de este proyecto no es construirlo: es que la gente
 * correcta lo encuentre a tiempo. El sismo de Venezuela de junio dejó una
 * docena de plataformas parecidas y ninguna llegó a ser la que se consultaba.
 *
 * Por eso el mensaje no dice «síguenos» ni «apóyanos»: dice qué evita
 * compartirlo. Quien reenvía esto no está haciéndole un favor a una web, está
 * evitando que alguien cargue el carro y maneje una hora hasta un punto que
 * cerró anteayer.
 */

const MENSAJE = `*AcopioYa* — dónde llevar donaciones tras el terremoto, actualizado hoy.

Las listas que publicó la prensa el primer día siguen circulando, y muchos de esos puntos ya cerraron o están desbordados. Aquí puedes ver si el punto sigue abierto, qué está recibiendo y —sobre todo— *qué ya no debes llevar*.

También hay mascotas perdidas y familias pidiendo ayuda.

`;

/**
 * @param compacto una sola acción, para el encabezado. Ahí el objetivo es que
 *   compartir esté a la vista sin bajar; desplegar cuatro botones competiría
 *   con los cuatro caminos que son la razón de la página.
 */
export function DifundirSitio({ url, compacto = false }: { url: string; compacto?: boolean }) {
  const [copiado, setCopiado] = useState(false);
  const texto = MENSAJE + url;

  async function compartir() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "AcopioYa", text: MENSAJE, url });
      } else {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      }
    } catch {
      // Cancelar el diálogo del sistema no es un error que haya que anunciar.
    }
  }

  if (compacto) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={compartir}
          className="presionable inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-[var(--primario)] px-4 text-sm font-semibold text-[var(--primario-fuerte)]"
        >
          {copiado ? <Check size={16} aria-hidden /> : <Share2 size={16} aria-hidden />}
          {copiado ? "Mensaje copiado" : "Compartir AcopioYa"}
        </button>
        <span className="text-xs text-[var(--texto-suave)]">
          Pásalo a quien vaya a donar
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <button
        type="button"
        onClick={compartir}
        className="presionable inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--primario)] px-5 font-semibold text-[var(--sobre-primario)] shadow-[var(--sombra-2)]"
      >
        <Share2 size={18} aria-hidden />
        Compartir AcopioYa
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(texto)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="presionable inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-[var(--borde-fuerte)] px-5 font-semibold"
      >
        <MessageCircle size={18} aria-hidden />
        Enviar por WhatsApp
      </a>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(texto);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2500);
        }}
        className="presionable inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-[var(--borde-fuerte)] px-5 font-semibold"
      >
        {copiado ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
        {copiado ? "Copiado" : "Copiar mensaje"}
      </button>
      <p aria-live="polite" className="sr-only">
        {copiado ? "Mensaje copiado al portapapeles" : ""}
      </p>
    </div>
  );
}
