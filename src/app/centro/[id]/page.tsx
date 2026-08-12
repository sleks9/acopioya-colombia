import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Check, Clock, Navigation, Phone, StickyNote, Users, X,
} from "lucide-react";
import { obtenerCentro, obtenerHistorial } from "@/lib/datos";
import { haceCuanto, nombreInsumo, urlFoto, INSUMOS_POR_ID } from "@/lib/tipos";
import {
  AvisoPrecision, InsigniaEstado, InsigniaFrescura, InsigniaPrecision, InsigniaVerificacion,
} from "@/components/Insignias";
import { BotonesVoto } from "@/components/BotonesVoto";

export const revalidate = 60;

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const c = await obtenerCentro(id);
  if (!c) return { title: "Punto no encontrado" };

  const estado =
    c.estado === "abierto" ? "Abierto"
    : c.estado === "lleno" ? "Lleno — no llevar más" : "Cerrado";
  const necesita = c.necesita.length
    ? ` Necesita: ${c.necesita.map(nombreInsumo).join(", ")}.`
    : "";

  // Estas etiquetas son lo que se ve al pegar el enlace en WhatsApp, que es
  // el canal real por donde circula esta informacion.
  return {
    title: `${c.nombre} — ${c.ciudad}`,
    description: `${estado}. ${c.direccion}, ${c.ciudad}.${necesita}`,
    openGraph: {
      title: `${c.nombre} · ${estado}`,
      description: `${c.direccion}, ${c.ciudad}.${necesita}`,
      // Tambien via proxy: cada vez que alguien pega el enlace en WhatsApp,
      // su servidor descarga esta imagen para la vista previa.
      images: c.foto_url ? [urlFoto(c.foto_url)!] : undefined,
    },
  };
}

export default async function DetalleCentro(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [centro, historial] = await Promise.all([
    obtenerCentro(id),
    obtenerHistorial(id),
  ]);
  if (!centro) notFound();

  const mapas = `https://www.google.com/maps/dir/?api=1&destination=${centro.lat},${centro.lng}`;
  const waze = `https://waze.com/ul?ll=${centro.lat},${centro.lng}&navigate=yes`;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <Link
        href="/mapa"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--texto-suave)] hover:underline"
      >
        <ArrowLeft size={15} aria-hidden />
        Volver al mapa
      </Link>

      <header className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <InsigniaEstado estado={centro.estado} />
          <InsigniaVerificacion verificacion={centro.verificacion} />
          <InsigniaFrescura frescura={centro.frescura} />
          <InsigniaPrecision precision={centro.precision} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          {centro.nombre}
        </h1>
        <p className="text-[var(--texto-suave)]">
          {centro.direccion} · {centro.ciudad}, {centro.departamento}
        </p>
        {centro.operador && (
          <p className="text-sm text-[var(--texto-suave)]">Operado por {centro.operador}</p>
        )}
      </header>

      {centro.estado === "lleno" && (
        <p className="rounded-2xl bg-[var(--acento-fondo)] px-4 py-3 text-sm font-medium text-[var(--acento)]">
          Este punto está lleno. Llevar más donaciones aquí genera trabajo extra
          a los voluntarios; busca otro punto en el mapa.
        </p>
      )}

      <AvisoPrecision precision={centro.precision} />

      {centro.frescura !== "fresco" && (
        <p className="rounded-2xl bg-[var(--acento-fondo)] px-4 py-3 text-sm text-[var(--acento)]">
          La última actualización fue {haceCuanto(centro.actualizado)}. Confirma
          por teléfono antes de desplazarte.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {centro.necesita.length > 0 && (
          <ListaInsumos
            titulo="Están recibiendo" items={centro.necesita}
            color="var(--primario-fuerte)" Marca={Check}
          />
        )}
        {centro.no_necesita.length > 0 && (
          <ListaInsumos
            titulo="NO llevar" items={centro.no_necesita}
            color="var(--peligro)" Marca={X}
          />
        )}
      </div>

      <dl className="divide-y divide-[var(--borde)] rounded-2xl border border-[var(--borde)] bg-[var(--superficie)]">
        {centro.horario && <Fila Icono={Clock} termino="Horario" valor={centro.horario} />}
        {centro.telefono_publico && (
          <Fila
            Icono={Phone} termino="Teléfono"
            valor={
              <a href={`tel:${centro.telefono_publico}`} className="font-semibold text-[var(--info)]">
                {centro.telefono_publico}
              </a>
            }
          />
        )}
        {centro.notas && <Fila Icono={StickyNote} termino="Notas" valor={centro.notas} />}
        <Fila Icono={Clock} termino="Actualizado" valor={haceCuanto(centro.actualizado)} />
        <Fila
          Icono={Users} termino="Confirmaciones"
          valor={
            centro.confirmaciones === 0
              ? "Nadie lo ha confirmado todavía"
              : `${centro.confirmaciones} ${centro.confirmaciones === 1 ? "persona confirmó" : "personas confirmaron"} este punto`
          }
        />
      </dl>

      {centro.foto_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={urlFoto(centro.foto_url) ?? centro.foto_url}
          alt={`Foto de ${centro.nombre}`}
          loading="lazy"
          decoding="async"
          className="max-h-96 w-full rounded-2xl border border-[var(--borde)] object-cover"
        />
      )}

      <div className="flex flex-wrap gap-2">
        <a
          href={mapas} target="_blank" rel="noopener noreferrer"
          className="presionable flex items-center gap-1.5 rounded-xl bg-[var(--info)] px-4 py-3 text-sm font-semibold text-white"
        >
          <Navigation size={16} aria-hidden />
          Cómo llegar
        </a>
        <a
          href={waze} target="_blank" rel="noopener noreferrer"
          className="presionable rounded-xl border border-[var(--borde-fuerte)] px-4 py-3 text-sm font-semibold"
        >
          Abrir en Waze
        </a>
      </div>

      <div className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-4">
        <BotonesVoto centroId={centro.id} />
      </div>

      {historial.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">Historial</h2>
          <ol className="space-y-1.5 text-sm text-[var(--texto-suave)]">
            {historial.map((h, i) => (
              <li key={i}>
                {DESCRIPCION_EVENTO[h.tipo] ?? h.tipo} · {haceCuanto(h.creado)}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

const DESCRIPCION_EVENTO: Record<string, string> = {
  creacion: "Punto publicado",
  estado: "El encargado actualizó la información",
  confirmacion: "Alguien confirmó que sigue abierto",
  reporte: "Alguien reportó que cerró o no existe",
  foto: "Se agregó una foto",
  ubicacion: "Se corrigió la ubicación",
  moderacion: "Revisión de moderación",
};

function ListaInsumos({
  titulo, items, color, Marca,
}: {
  titulo: string;
  items: string[];
  color: string;
  Marca: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
}) {
  return (
    <section className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-4">
      <h2 className="mb-2 font-semibold" style={{ color }}>{titulo}</h2>
      <ul className="space-y-1.5 text-sm">
        {items.map((i) => {
          const Icono = INSUMOS_POR_ID[i]?.Icono;
          return (
            <li key={i} className="flex items-center gap-2">
              <Marca size={14} strokeWidth={3} style={{ color }} />
              {Icono && <Icono size={15} className="text-[var(--texto-suave)]" aria-hidden />}
              {nombreInsumo(i)}
            </li>
          );
        })}
      </ul>
    </section>
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
