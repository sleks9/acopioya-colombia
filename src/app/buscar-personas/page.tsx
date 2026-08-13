import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle, ArrowRight, ExternalLink, Heart, MessageCircle,
  Phone, ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Buscar a una persona",
  description:
    "Qué hacer, paso a paso, si perdiste contacto con un familiar tras el terremoto. Canales oficiales de Cruz Roja y las líneas de emergencia.",
};

// Verificados el 12 de agosto de 2026. Revisar antes de cada publicación:
// las líneas de emergencia cambian de una semana a otra.
const REVISADO = "12 de agosto de 2026";

export default function BuscarPersonas() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-balance">
          ¿Perdiste contacto con un familiar?
        </h1>
        <p className="mt-2 text-[var(--texto-suave)] text-pretty">
          Esto es lo que hay que hacer, en orden. Los canales de abajo son los
          que tienen autoridad y bases de datos reales.
        </p>
      </header>

      {/*
        La explicacion de por que AcopioYa no tiene su propio registro. Va
        primero y sin rodeos: quien llega aqui esta buscando a alguien y merece
        saber de entrada que este no es el lugar donde reportar.
      */}
      <div className="flex gap-3 rounded-2xl border border-[var(--info)]/25 bg-[var(--info-fondo)] p-4">
        <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[var(--info)]" aria-hidden />
        <div className="space-y-1.5 text-sm">
          <p className="font-semibold text-[var(--info)]">
            AcopioYa no lleva un registro de personas desaparecidas, a propósito.
          </p>
          <p className="text-pretty">
            Un registro paralelo divide la búsqueda: si tu reporte queda en un
            sitio que las autoridades no consultan, puede{" "}
            <strong>retrasar</strong> el reencuentro en vez de acelerarlo.
            Reporta donde sí van a buscarte.
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Paso a paso</h2>

        <Paso n={1} titulo="Llama al 123 y reporta">
          Es la línea nacional de emergencias. Ahí queda el reporte formal y te
          orientan según el municipio.
        </Paso>

        <Paso n={2} titulo="Contacta a la Cruz Roja">
          Su servicio de <strong>Restablecimiento del Contacto Familiar</strong>{" "}
          existe justo para esto: reconectar familias separadas por un desastre.
          Funciona en toda la red internacional de Cruz Roja.
        </Paso>

        <Paso n={3} titulo="Registra el caso en Colombia te busca">
          Es la plataforma ciudadana habilitada tras el sismo para centralizar
          reportes de personas.
        </Paso>

        <Paso n={4} titulo="Ten lista la información">
          Nombre completo y documento, edad, foto reciente, dónde y cuándo se le
          vio por última vez, qué ropa llevaba, y señas particulares. Cuanto más
          concreto, mejor.
        </Paso>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Canales oficiales</h2>

        <Canal
          Icono={MessageCircle}
          titulo="Cruz Roja Colombiana — Contacto Familiar"
          descripcion="Servicio para reconectar familias separadas por la emergencia."
          acciones={[
            { texto: "WhatsApp +57 321 213 9525", href: "https://wa.me/573212139525" },
            { texto: "rcf@cruzrojacolombiana.org", href: "mailto:rcf@cruzrojacolombiana.org" },
          ]}
        />

        <Canal
          Icono={ExternalLink}
          titulo="Colombia te busca"
          descripcion="Plataforma ciudadana para reportar y buscar personas tras el sismo."
          acciones={[{ texto: "Abrir colombiatebusca.com", href: "https://colombiatebusca.com/" }]}
        />

        <Canal
          Icono={Phone}
          titulo="Líneas de emergencia"
          descripcion="Atención inmediata y orientación en todo el país."
          acciones={[
            { texto: "123 · Emergencias", href: "tel:123" },
            { texto: "132 · Cruz Roja", href: "tel:132" },
            { texto: "144 · Defensa Civil", href: "tel:144" },
          ]}
        />

        <Canal
          Icono={ExternalLink}
          titulo="Instituto Nacional de Medicina Legal"
          descripcion="Consulta institucional sobre personas no identificadas."
          acciones={[
            { texto: "medicinalegal.gov.co", href: "https://www.medicinalegal.gov.co/" },
          ]}
        />

        <p className="flex items-start gap-2 pt-1 text-xs text-[var(--texto-suave)]">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden />
          Datos verificados el {REVISADO}. Los canales de emergencia cambian:
          si alguno no responde, llama al 123 y pide orientación.
        </p>
      </section>

      <section className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Heart size={17} className="text-[var(--peligro)]" aria-hidden />
          Cuídate mientras buscas
        </h2>
        <ul className="mt-2 space-y-1.5 text-sm text-[var(--texto-suave)]">
          <li>
            <strong className="text-[var(--texto)]">Desconfía de quien pida dinero</strong>{" "}
            a cambio de información. Es la estafa más común tras un desastre y
            ninguna entidad oficial cobra por buscar a una persona.
          </li>
          <li>
            Comparte la foto y los datos solo en los canales de arriba y con
            gente que conoces.
          </li>
          <li>Come, duerme y pide relevo. Una búsqueda puede tomar días.</li>
        </ul>
      </section>

      <div className="rounded-2xl bg-[var(--primario-fondo)] p-5 text-center">
        <p className="text-sm text-pretty">
          Si lo que buscas es una <strong>mascota</strong>, eso sí lo puedes
          publicar aquí.
        </p>
        <Link
          href="/mascotas"
          className="presionable mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[var(--primario)] px-4 py-3 text-sm font-semibold text-[var(--sobre-primario)]"
        >
          Buscar o reportar una mascota
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function Paso({
  n, titulo, children,
}: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="tabular grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--primario-fondo)] font-bold text-[var(--primario-fuerte)]">
        {n}
      </span>
      <div>
        <strong className="block">{titulo}</strong>
        <span className="text-sm text-[var(--texto-suave)] text-pretty">{children}</span>
      </div>
    </div>
  );
}

function Canal({
  Icono, titulo, descripcion, acciones,
}: {
  Icono: React.ComponentType<{ size?: number; className?: string }>;
  titulo: string;
  descripcion: string;
  acciones: { texto: string; href: string }[];
}) {
  return (
    <article className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-4">
      <h3 className="flex items-center gap-2 font-semibold">
        <Icono size={17} className="shrink-0 text-[var(--info)]" />
        {titulo}
      </h3>
      <p className="mt-1 text-sm text-[var(--texto-suave)] text-pretty">{descripcion}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {acciones.map((a) => (
          <a
            key={a.href}
            href={a.href}
            target={a.href.startsWith("http") ? "_blank" : undefined}
            rel={a.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="presionable inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[var(--borde-fuerte)] px-3.5 text-sm font-semibold"
          >
            {a.texto}
            {a.href.startsWith("http") && <ExternalLink size={13} aria-hidden />}
          </a>
        ))}
      </div>
    </article>
  );
}
