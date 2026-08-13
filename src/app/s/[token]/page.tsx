import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { obtenerSolicitudPorToken } from "@/app/acciones";
import { PanelSolicitud } from "./PanelSolicitud";

// El token viaja en la URL: se evita que se filtre por Referer y que lo
// indexen los buscadores.
export const metadata: Metadata = {
  title: "Mi solicitud",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function PaginaPanelSolicitud(
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const solicitud = await obtenerSolicitudPorToken(token);
  if (!solicitud) notFound();

  return <PanelSolicitud token={token} solicitud={solicitud} />;
}
