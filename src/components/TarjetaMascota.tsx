import Link from "next/link";
import { ChevronRight, MapPin, PartyPopper } from "lucide-react";
import { urlFoto } from "@/lib/tipos";
import {
  haceDias, iconoEspecie, tituloMascota, type Mascota,
} from "@/lib/mascotas";

export function TarjetaMascota({
  mascota: m,
  indice = 0,
}: {
  mascota: Mascota;
  indice?: number;
}) {
  const Icono = iconoEspecie(m.especie);
  const perdida = m.caso === "perdida";
  const color = perdida ? "var(--acento)" : "var(--primario-fuerte)";
  const fondo = perdida ? "var(--acento-fondo)" : "var(--primario-fondo)";

  return (
    <li className="aparece" style={{ animationDelay: `${Math.min(indice, 8) * 40}ms` }}>
      <Link
        href={`/mascota/${m.id}`}
        className="presionable group block h-full overflow-hidden rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] shadow-[var(--sombra-1)]"
      >
        <div className="relative h-40 w-full bg-[var(--superficie-2)]">
          {/* La foto es obligatoria en mascotas, así que siempre hay algo. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlFoto(m.foto_url) ?? m.foto_url}
            alt={tituloMascota(m)}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <span
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{ background: fondo, color }}
          >
            <Icono size={12} strokeWidth={3} aria-hidden />
            {perdida ? "Se perdió" : "La encontraron"}
          </span>
          {m.estado === "reunida" && (
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-[var(--primario)] px-2.5 py-1 text-xs font-bold text-[var(--sobre-primario)]">
              <PartyPopper size={12} strokeWidth={3} aria-hidden />
              ¡Ya apareció!
            </span>
          )}
        </div>

        <div className="p-3">
          <div className="flex items-start gap-2">
            <h3 className="flex-1 font-semibold leading-snug text-balance">
              {tituloMascota(m)}
            </h3>
            <ChevronRight
              size={18}
              className="mt-0.5 shrink-0 text-[var(--texto-suave)] transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </div>

          <p className="mt-1 flex items-start gap-1.5 text-sm text-[var(--texto-suave)]">
            <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden />
            {m.municipio}, {m.departamento}
          </p>

          <p className="mt-0.5 text-sm text-[var(--texto-suave)]">
            {m.color}
            {m.senas && <> · {m.senas}</>}
          </p>

          <p className="tabular mt-2 text-xs text-[var(--texto-suave)]">
            {perdida ? "Se perdió" : "La encontraron"} {haceDias(m.dias_desde)}
          </p>
        </div>
      </Link>
    </li>
  );
}
