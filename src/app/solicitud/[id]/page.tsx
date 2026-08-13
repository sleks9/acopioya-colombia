import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Clock, MapPin, Phone, ShieldAlert,
  TriangleAlert, Users,
} from "lucide-react";
import { obtenerSolicitud } from "@/lib/datos";
import { haceCuanto, urlFoto } from "@/lib/tipos";
import {
  ESTADOS, iconoNecesidad, nombreNecesidad, TIPOS, URGENCIAS,
} from "@/lib/solicitudes";
import { BotonesVotoSolicitud } from "@/components/BotonesVotoSolicitud";
import { BotonCompartir } from "@/components/BotonCompartir";
import { textosSolicitud, urlPublica } from "@/lib/tarjeta/texto";

export const revalidate = 60;

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const s = await obtenerSolicitud(id);
  if (!s) return { title: "Solicitud no encontrada" };
  const imagen = {
    url: `/api/tarjeta/solicitud/${s.id}?formato=enlace`,
    width: 1200,
    height: 630,
    alt: `${s.titulo}. ${s.barrio_vereda}, ${s.municipio}.`,
  };

  return {
    title: s.titulo,
    description: `${s.barrio_vereda}, ${s.municipio}. Necesitan: ${s.necesita.map(nombreNecesidad).join(", ")}.`,
    openGraph: {
      title: s.titulo,
      description: `${s.barrio_vereda}, ${s.municipio}`,
      images: [imagen],
    },
    twitter: { card: "summary_large_image", images: [imagen] },
  };
}

export default async function DetalleSolicitud(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const s = await obtenerSolicitud(id);
  if (!s) notFound();

  const u = URGENCIAS[s.urgencia];
  const tipo = TIPOS.find((t) => t.id === s.tipo);
  const mapa = `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <Link
        href="/solicitudes"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--texto-suave)] hover:underline"
      >
        <ArrowLeft size={15} aria-hidden />
        Volver a solicitudes
      </Link>

      <header className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{ background: u.fondo, color: u.color }}
          >
            <TriangleAlert size={12} strokeWidth={3} aria-hidden />
            Urgencia {u.nombre.toLowerCase()}
          </span>
          {tipo && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--borde)] px-2.5 py-1 text-xs font-semibold text-[var(--texto-suave)]">
              <tipo.Icono size={12} strokeWidth={3} aria-hidden />
              {tipo.nombre}
            </span>
          )}
          {s.estado !== "abierta" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primario-fondo)] px-2.5 py-1 text-xs font-bold text-[var(--primario-fuerte)]">
              <CheckCircle2 size={12} strokeWidth={3} aria-hidden />
              {ESTADOS[s.estado].nombre}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          {s.titulo}
        </h1>
        <p className="flex items-start gap-1.5 text-[var(--texto-suave)]">
          <MapPin size={16} className="mt-1 shrink-0" aria-hidden />
          {s.barrio_vereda} · {s.municipio}, {s.departamento}
        </p>
      </header>

      {s.estado === "cubierta" && (
        <p className="rounded-2xl bg-[var(--primario-fondo)] px-4 py-3 text-sm font-medium text-[var(--primario-fuerte)]">
          Esta solicitud ya está cubierta. Busca otra en el listado antes de
          organizar una entrega.
        </p>
      )}

      {s.frescura !== "fresco" && s.estado === "abierta" && (
        <p className="rounded-2xl bg-[var(--acento-fondo)] px-4 py-3 text-sm text-[var(--acento)]">
          La última actualización fue {haceCuanto(s.actualizado)}. Confirma que
          siguen necesitando lo mismo antes de organizar la entrega.
        </p>
      )}

      {s.foto_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={urlFoto(s.foto_url) ?? s.foto_url}
          alt={`Foto de ${s.titulo}`}
          loading="lazy"
          className="max-h-96 w-full rounded-2xl border border-[var(--borde)] object-cover"
        />
      )}

      <section className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-4">
        <h2 className="font-semibold">Qué pasó</h2>
        <p className="mt-1.5 whitespace-pre-line text-sm text-pretty">{s.descripcion}</p>
      </section>

      <section className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-4">
        <h2 className="mb-2 font-semibold text-[var(--primario-fuerte)]">Qué necesitan</h2>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {s.necesita.map((n) => {
            const Icono = iconoNecesidad(n);
            return (
              <li key={n} className="flex items-center gap-2 text-sm">
                {Icono && <Icono size={15} className="shrink-0 text-[var(--texto-suave)]" aria-hidden />}
                {nombreNecesidad(n)}
              </li>
            );
          })}
        </ul>
      </section>

      <dl className="divide-y divide-[var(--borde)] rounded-2xl border border-[var(--borde)] bg-[var(--superficie)]">
        {s.personas && (
          <Fila Icono={Users} termino="Personas" valor={`${s.personas} beneficiadas`} />
        )}
        {s.telefono_publico ? (
          <Fila
            Icono={Phone}
            termino="Contacto"
            valor={
              <a href={`tel:${s.telefono_publico}`} className="font-semibold text-[var(--info)]">
                {s.telefono_publico}
              </a>
            }
          />
        ) : (
          <Fila
            Icono={Phone}
            termino="Contacto"
            valor={
              <span className="text-[var(--texto-suave)]">
                No publicado. Coordina a través de la alcaldía o la junta de
                acción comunal del sector.
              </span>
            }
          />
        )}
        <Fila Icono={Clock} termino="Actualizada" valor={haceCuanto(s.actualizado)} />
      </dl>

      <a
        href={mapa}
        target="_blank"
        rel="noopener noreferrer"
        className="presionable inline-flex items-center gap-1.5 rounded-xl bg-[var(--info)] px-4 py-3 text-sm font-semibold text-white"
      >
        <MapPin size={16} aria-hidden />
        Ver la zona en el mapa
      </a>

      <div className="flex">
        <BotonCompartir
          tipo="solicitud"
          id={s.id}
          textos={textosSolicitud(s)}
          url={urlPublica("solicitud", s.id)}
        />
      </div>

      <div className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-4">
        <BotonesVotoSolicitud id={s.id} />
      </div>

      <p className="flex items-start gap-2 rounded-2xl bg-[var(--peligro-fondo)] px-4 py-3 text-xs text-[var(--peligro)]">
        <ShieldAlert size={15} className="mt-0.5 shrink-0" aria-hidden />
        <span>
          <strong>Nadie debe pedirte dinero por esta solicitud.</strong> AcopioYa
          no publica cuentas ni intermedia pagos. Si alguien te pide una
          transferencia a nombre de esta ayuda, es un fraude.
        </span>
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
