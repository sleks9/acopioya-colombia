import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import { obtenerSolicitudes } from "@/lib/datos";
import { ExploradorSolicitudes } from "@/components/ExploradorSolicitudes";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Dónde hace falta ayuda",
  description:
    "Familias, comunidades e instituciones que necesitan ayuda tras el terremoto. Qué necesitan y en qué zona, para que las donaciones lleguen a donde hacen falta.",
};

export default async function Solicitudes() {
  const solicitudes = await obtenerSolicitudes();
  const criticas = solicitudes.filter((s) => s.urgencia === "critica").length;

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Dónde hace falta ayuda
        </h1>
        <p className="mt-1 max-w-2xl text-[var(--texto-suave)] text-pretty">
          El mapa de acopios dice <strong className="text-[var(--texto)]">dónde entregar</strong>.
          Esto dice <strong className="text-[var(--texto)]">dónde hace falta</strong>: familias,
          veredas e instituciones que publicaron qué necesitan.
        </p>
      </header>

      {criticas > 0 && (
        <p className="tabular rounded-2xl bg-[var(--peligro-fondo)] px-4 py-3 text-sm font-semibold text-[var(--peligro)]">
          {criticas} {criticas === 1 ? "solicitud crítica" : "solicitudes críticas"} sin cubrir
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href="/solicitar"
          className="presionable flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--primario)] px-4 font-semibold text-[var(--sobre-primario)] shadow-[var(--sombra-1)]"
        >
          <Plus size={18} strokeWidth={3} aria-hidden />
          Pedir ayuda
        </Link>
        <Link
          href="/mapa"
          className="presionable flex min-h-12 items-center justify-center rounded-xl border border-[var(--borde-fuerte)] px-4 font-semibold"
        >
          Ver centros de acopio
        </Link>
      </div>

      {/*
        La regla que ordena toda la seccion, dicha en voz alta: una solicitud
        describe una necesidad, no señala la casa de una familia vulnerable.
      */}
      <p className="flex items-start gap-2.5 rounded-2xl bg-[var(--info-fondo)] px-4 py-3 text-sm text-[var(--info)]">
        <ShieldCheck size={17} className="mt-0.5 shrink-0" aria-hidden />
        <span>
          Las solicitudes indican el <strong>barrio o vereda</strong>, nunca una
          dirección exacta, y el teléfono solo aparece si quien publicó lo
          autorizó. Coordina antes de salir: llevar sin avisar puede estorbar
          más que ayudar.
        </span>
      </p>

      <ExploradorSolicitudes solicitudes={solicitudes} />
    </div>
  );
}
