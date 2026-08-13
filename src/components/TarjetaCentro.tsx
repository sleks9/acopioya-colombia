import Link from "next/link";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { haceCuanto, nombreInsumo, type Centro } from "@/lib/tipos";
import {
  InsigniaEstado,
  InsigniaFrescura,
  InsigniaPrecision,
  InsigniaVerificacion,
} from "./Insignias";
import { MiniaturaPunto } from "./MiniaturaPunto";

export function TarjetaCentro({
  centro,
  distanciaKm,
  indice = 0,
}: {
  centro: Centro;
  distanciaKm?: number;
  indice?: number;
}) {
  return (
    <li
      className="aparece"
      // Escalonado corto y con techo: decorativo, nunca retrasa la lectura.
      style={{ animationDelay: `${Math.min(indice, 8) * 40}ms` }}
    >
      <Link
        href={`/centro/${centro.id}`}
        className="presionable group block h-full rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-3 shadow-[var(--sombra-1)]"
      >
        <MiniaturaPunto
          lat={centro.lat}
          lng={centro.lng}
          estado={centro.estado}
          fotoUrl={centro.foto_url}
          nombre={centro.nombre}
        />

        <div className="mb-2 mt-3 flex flex-wrap items-center gap-1.5">
          <InsigniaEstado estado={centro.estado} />
          <InsigniaVerificacion verificacion={centro.verificacion} />
          <InsigniaFrescura frescura={centro.frescura} />
          <InsigniaPrecision precision={centro.precision} />
        </div>

        <div className="flex items-start gap-2">
          <h3 className="flex-1 font-semibold leading-snug text-balance">{centro.nombre}</h3>
          <ChevronRight
            size={18}
            className="mt-0.5 shrink-0 text-[var(--texto-suave)] transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </div>

        <p className="mt-1 flex items-start gap-1.5 text-sm text-[var(--texto-suave)]">
          <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            {centro.direccion} · {centro.ciudad}
            {typeof distanciaKm === "number" && (
              <span className="tabular font-medium text-[var(--texto)]">
                {" "}· a{" "}
                {distanciaKm < 1
                  ? `${Math.round(distanciaKm * 1000)} m`
                  : `${distanciaKm.toFixed(1)} km`}
              </span>
            )}
          </span>
        </p>

        {centro.horario && (
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[var(--texto-suave)]">
            <Clock size={14} className="shrink-0" aria-hidden />
            {centro.horario}
          </p>
        )}

        {centro.necesita.length > 0 && (
          <p className="mt-2.5 text-sm">
            <span className="font-semibold text-[var(--primario-fuerte)]">Necesita: </span>
            {centro.necesita.map(nombreInsumo).join(", ")}
          </p>
        )}

        {/* El dato de mayor valor: evita la avalancha de donaciones inservibles. */}
        {centro.no_necesita.length > 0 && (
          <p className="mt-0.5 text-sm">
            <span className="font-semibold text-[var(--peligro)]">NO llevar: </span>
            {centro.no_necesita.map(nombreInsumo).join(", ")}
          </p>
        )}

        <p className="mt-2.5 text-xs text-[var(--texto-suave)]">
          Actualizado {haceCuanto(centro.actualizado)}
          {centro.operador && <> · {centro.operador}</>}
        </p>
      </Link>
    </li>
  );
}
