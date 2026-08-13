import type { Metadata } from "next";
import Link from "next/link";
import { PartyPopper, Plus } from "lucide-react";
import { contarReunidas, obtenerMascotas } from "@/lib/datos";
import { ExploradorMascotas } from "@/components/ExploradorMascotas";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Mascotas perdidas y encontradas",
  description:
    "Reporta tu mascota perdida o la que te encontraste. El mapa cruza ambos lados por cercanía, porque las mascotas aparecen cerca de donde se perdieron.",
};

export default async function Mascotas() {
  const [mascotas, reunidas] = await Promise.all([
    obtenerMascotas(),
    contarReunidas(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Mascotas perdidas y encontradas
        </h1>
        <p className="mt-1 max-w-2xl text-[var(--texto-suave)] text-pretty">
          Si te encontraste un animal, <strong className="text-[var(--texto)]">publícalo también</strong>.
          Las mascotas aparecen cerca de donde se perdieron, así que cruzamos
          ambos lados por cercanía.
        </p>
      </header>

      {/* Los reencuentros son lo que hace que la gente comparta el enlace. */}
      {reunidas > 0 && (
        <p className="flex items-center gap-2 rounded-2xl bg-[var(--primario-fondo)] px-4 py-3 text-sm font-semibold text-[var(--primario-fuerte)]">
          <PartyPopper size={18} aria-hidden />
          <span className="tabular">{reunidas}</span>
          {reunidas === 1 ? "mascota ya volvió a casa" : "mascotas ya volvieron a casa"}
        </p>
      )}

      <Link
        href="/reportar-mascota"
        className="presionable flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primario)] px-4 font-semibold text-[var(--sobre-primario)] shadow-[var(--sombra-1)] sm:w-auto"
      >
        <Plus size={18} strokeWidth={3} aria-hidden />
        Publicar un reporte
      </Link>

      <ExploradorMascotas mascotas={mascotas} />
    </div>
  );
}
