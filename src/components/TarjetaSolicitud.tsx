import Link from "next/link";
import { CheckCircle2, ChevronRight, MapPin, TriangleAlert, Users } from "lucide-react";
import { haceCuanto, urlFoto } from "@/lib/tipos";
import {
  nombreNecesidad, TIPOS, URGENCIAS, type Solicitud,
} from "@/lib/solicitudes";
import { MiniaturaPunto } from "./MiniaturaPunto";

export function TarjetaSolicitud({
  solicitud: s,
  indice = 0,
}: {
  solicitud: Solicitud;
  indice?: number;
}) {
  const u = URGENCIAS[s.urgencia];
  const tipo = TIPOS.find((t) => t.id === s.tipo);
  const cubierta = s.estado === "cubierta";

  return (
    <li className="aparece" style={{ animationDelay: `${Math.min(indice, 8) * 40}ms` }}>
      <Link
        href={`/solicitud/${s.id}`}
        className="presionable group block h-full rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-3 shadow-[var(--sombra-1)]"
      >
        {s.foto_url ? (
          <div className="relative h-28 w-full overflow-hidden rounded-xl bg-[var(--superficie-2)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlFoto(s.foto_url) ?? s.foto_url}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <MiniaturaPunto
            lat={s.lat}
            lng={s.lng}
            estado={cubierta ? "cerrado" : "abierto"}
            fotoUrl={null}
            nombre={s.titulo}
          />
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {/* La urgencia lleva icono y texto, nunca solo color. */}
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
            style={{ background: u.fondo, color: u.color }}
          >
            <TriangleAlert size={11} strokeWidth={3} aria-hidden />
            {u.nombre}
          </span>

          {cubierta && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primario-fondo)] px-2 py-0.5 text-xs font-bold text-[var(--primario-fuerte)]">
              <CheckCircle2 size={11} strokeWidth={3} aria-hidden />
              Ya cubierta
            </span>
          )}
          {s.estado === "parcial" && (
            <span className="rounded-full bg-[var(--superficie-2)] px-2 py-0.5 text-xs font-semibold text-[var(--texto-suave)]">
              Parcialmente cubierta
            </span>
          )}
          {tipo && (
            <span className="rounded-full border border-[var(--borde)] px-2 py-0.5 text-xs font-medium text-[var(--texto-suave)]">
              {tipo.nombre}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-start gap-2">
          <h3 className="flex-1 font-semibold leading-snug text-balance">{s.titulo}</h3>
          <ChevronRight
            size={18}
            className="mt-0.5 shrink-0 text-[var(--texto-suave)] transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </div>

        {/* Barrio o vereda, nunca una dirección exacta. */}
        <p className="mt-1 flex items-start gap-1.5 text-sm text-[var(--texto-suave)]">
          <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden />
          {s.barrio_vereda} · {s.municipio}, {s.departamento}
        </p>

        {s.personas && (
          <p className="tabular mt-0.5 flex items-center gap-1.5 text-sm text-[var(--texto-suave)]">
            <Users size={14} className="shrink-0" aria-hidden />
            {s.personas} {s.personas === 1 ? "persona" : "personas"}
          </p>
        )}

        <p className="mt-2 text-sm">
          <span className="font-semibold text-[var(--primario-fuerte)]">Necesitan: </span>
          {s.necesita.slice(0, 4).map(nombreNecesidad).join(", ")}
          {s.necesita.length > 4 && ` y ${s.necesita.length - 4} más`}
        </p>

        <p className="mt-2 text-xs text-[var(--texto-suave)]">
          Actualizada {haceCuanto(s.actualizado)}
        </p>
      </Link>
    </li>
  );
}
