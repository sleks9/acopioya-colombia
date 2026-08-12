import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { obtenerCentroPorToken } from "@/app/acciones";
import { PanelEncargado } from "./PanelEncargado";

// El token viaja en la URL: evitamos que se filtre por Referer al salir del
// sitio (por ejemplo al abrir Google Maps) y que los buscadores lo indexen.
export const metadata: Metadata = {
  title: "Panel del encargado",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function PaginaPanel(
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const centro = await obtenerCentroPorToken(token);
  if (!centro) notFound();

  return <PanelEncargado token={token} centro={centro} />;
}
