import type { Metadata } from "next";
import Link from "next/link";
import { obtenerCentros } from "@/lib/datos";
import { ExploradorCentros } from "@/components/ExploradorCentros";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Mapa de centros de acopio",
  description:
    "Busca centros de acopio abiertos cerca de ti. Mira qué reciben, qué NO reciben y cuándo se actualizó cada punto.",
};

export default async function Mapa() {
  const centros = await obtenerCentros();

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Centros de acopio
        </h1>
        <p className="mt-1 text-[var(--texto-suave)] text-pretty">
          Antes de salir, revisa si el punto sigue abierto y{" "}
          <strong className="text-[var(--texto)]">qué NO están recibiendo</strong>.
        </p>
      </header>

      {centros.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-8 text-center">
          <p className="font-semibold">Todavía no hay puntos cargados.</p>
          <p className="text-sm text-[var(--texto-suave)]">
            Si conoces un centro de acopio activo, publícalo y quedará visible
            de inmediato.
          </p>
          <Link
            href="/reportar"
            className="presionable inline-block rounded-xl bg-[var(--primario)] px-4 py-2.5 text-sm font-semibold text-[var(--sobre-primario)]"
          >
            Reportar un punto
          </Link>
        </div>
      ) : (
        <ExploradorCentros centros={centros} mapaVisibleAlInicio />
      )}
    </div>
  );
}
