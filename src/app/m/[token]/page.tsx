import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { obtenerMascotaPorToken } from "@/app/acciones";
import { PanelMascota } from "./PanelMascota";

// El token viaja en la URL: se evita que se filtre por Referer al salir del
// sitio y que los buscadores lo indexen.
export const metadata: Metadata = {
  title: "Mi reporte de mascota",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function PaginaPanelMascota(
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const mascota = await obtenerMascotaPorToken(token);
  if (!mascota) notFound();

  return <PanelMascota token={token} mascota={mascota} />;
}
