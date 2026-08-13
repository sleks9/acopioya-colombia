import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Calendar, MapPin, PartyPopper, Phone, Sparkles, Tag,
} from "lucide-react";
import { obtenerCoincidencias, obtenerMascota } from "@/lib/datos";
import { urlFoto } from "@/lib/tipos";
import {
  haceDias, iconoEspecie, nombreEspecie, tituloMascota,
} from "@/lib/mascotas";
import { AvisoMascota } from "@/components/AvisoMascota";

export const revalidate = 60;

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const m = await obtenerMascota(id);
  if (!m) return { title: "Reporte no encontrado" };

  const titulo = m.caso === "perdida"
    ? `Se perdió ${tituloMascota(m)} en ${m.municipio}`
    : `${nombreEspecie(m.especie)} encontrado en ${m.municipio}`;

  return {
    title: titulo,
    description: `${m.color}. ${m.senas ?? ""} ${haceDias(m.dias_desde)} en ${m.municipio}, ${m.departamento}.`.trim(),
    openGraph: { title: titulo, images: [urlFoto(m.foto_url) ?? m.foto_url] },
  };
}

export default async function DetalleMascota(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [m, coincidencias] = await Promise.all([
    obtenerMascota(id),
    obtenerCoincidencias(id),
  ]);
  if (!m) notFound();

  const Icono = iconoEspecie(m.especie);
  const perdida = m.caso === "perdida";
  const color = perdida ? "var(--acento)" : "var(--primario-fuerte)";
  const mapa = `https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lng}`;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <Link
        href="/mascotas"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--texto-suave)] hover:underline"
      >
        <ArrowLeft size={15} aria-hidden />
        Volver a mascotas
      </Link>

      {m.estado === "reunida" && (
        <p className="flex items-center gap-2 rounded-2xl bg-[var(--primario-fondo)] px-4 py-3 font-semibold text-[var(--primario-fuerte)]">
          <PartyPopper size={20} aria-hidden />
          ¡Esta mascota ya volvió a casa!
        </p>
      )}

      <header className="space-y-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold"
          style={{
            background: perdida ? "var(--acento-fondo)" : "var(--primario-fondo)",
            color,
          }}
        >
          <Icono size={14} strokeWidth={3} aria-hidden />
          {perdida ? "Se perdió" : "La encontraron"}
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          {tituloMascota(m)}
        </h1>
      </header>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urlFoto(m.foto_url) ?? m.foto_url}
        alt={tituloMascota(m)}
        className="max-h-[28rem] w-full rounded-2xl border border-[var(--borde)] object-cover"
      />

      <dl className="divide-y divide-[var(--borde)] rounded-2xl border border-[var(--borde)] bg-[var(--superficie)]">
        <Fila Icono={Icono} termino="Especie" valor={`${nombreEspecie(m.especie)} · ${m.color}`} />
        <Fila
          Icono={Calendar}
          termino={perdida ? "Se perdió" : "La encontraron"}
          valor={`${haceDias(m.dias_desde)} (${m.fecha_suceso})`}
        />
        <Fila Icono={MapPin} termino="Zona" valor={`${m.municipio}, ${m.departamento}`} />
        {m.senas && <Fila Icono={Sparkles} termino="Señas" valor={m.senas} />}
        {m.chip_placa && <Fila Icono={Tag} termino="Chip o placa" valor={m.chip_placa} />}
        {m.telefono_publico && (
          <Fila
            Icono={Phone}
            termino="Contacto"
            valor={
              <a href={`tel:${m.telefono_publico}`} className="font-semibold text-[var(--info)]">
                {m.telefono_publico}
              </a>
            }
          />
        )}
      </dl>

      <a
        href={mapa}
        target="_blank"
        rel="noopener noreferrer"
        className="presionable inline-flex items-center gap-1.5 rounded-xl border border-[var(--borde-fuerte)] px-4 py-3 text-sm font-semibold"
      >
        <MapPin size={16} aria-hidden />
        Ver la zona en el mapa
      </a>

      {/*
        El corazón de la sección: reportes del lado contrario a menos de 3 km.
        Una mascota casi siempre aparece cerca de donde se perdió.
      */}
      <section>
        <h2 className="font-semibold">
          {perdida ? "Mascotas encontradas cerca" : "Alguien podría estar buscándola"}
        </h2>
        {coincidencias.length === 0 ? (
          <p className="mt-1.5 text-sm text-[var(--texto-suave)] text-pretty">
            Todavía no hay reportes que coincidan a menos de 3 km. Vuelve a
            revisar: aparecen reportes nuevos todos los días.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-[var(--texto-suave)]">
              A menos de 3 km, de la misma especie y en fechas compatibles.
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {coincidencias.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/mascota/${c.id}`}
                    className="presionable flex items-center gap-3 rounded-xl border border-[var(--borde)] bg-[var(--superficie)] p-2.5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={urlFoto(c.foto_url) ?? c.foto_url}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {c.nombre ?? `${nombreEspecie(c.especie)} ${c.color.toLowerCase()}`}
                      </span>
                      <span className="tabular block text-xs text-[var(--texto-suave)]">
                        a {c.km < 1 ? `${Math.round(c.km * 1000)} m` : `${c.km} km`} · {c.municipio}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {m.estado === "activa" && (
        <div className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-4">
          <AvisoMascota id={m.id} caso={m.caso} />
        </div>
      )}

      <p className="text-xs text-[var(--texto-suave)] text-pretty">
        Desconfía de quien pida dinero a cambio de devolver una mascota. AcopioYa
        nunca intermedia pagos.
      </p>
    </div>
  );
}

function Fila({
  Icono, termino, valor,
}: {
  Icono: React.ComponentType<{ size?: number; className?: string }>;
  termino: string;
  valor: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 px-4 py-3 text-sm">
      <dt className="flex items-center gap-1.5 text-[var(--texto-suave)]">
        <Icono size={14} className="shrink-0" />
        {termino}
      </dt>
      <dd className="col-span-2">{valor}</dd>
    </div>
  );
}
