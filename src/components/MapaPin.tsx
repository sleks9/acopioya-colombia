"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";
import { estiloMapa } from "@/lib/estiloMapa";

/**
 * Solo el mapa arrastrable con el pin fijo al centro (patron de Uber/inDrive):
 * mueves el mapa debajo del pin en vez de tocar con el dedo, que tapa justo lo
 * que estas apuntando.
 *
 * Vive en su propio archivo para que MapLibre (1 MB) se descargue unicamente
 * cuando alguien pide ajustar la ubicacion. La mayoria resuelve con el GPS y
 * nunca llega a bajar esto.
 */
export default function MapaPin({
  inicial,
  onMover,
}: {
  inicial: { lat: number; lng: number; zoom: number };
  onMover: (lat: number, lng: number) => void;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const mapa = useRef<maplibregl.Map | null>(null);
  const [moviendo, setMoviendo] = useState(false);

  useEffect(() => {
    if (!caja.current || mapa.current) return;

    const m = new maplibregl.Map({
      container: caja.current,
      style: estiloMapa(),
      center: [inicial.lng, inicial.lat],
      zoom: inicial.zoom,
      attributionControl: { compact: true },
    });
    mapa.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    m.on("movestart", () => setMoviendo(true));
    m.on("moveend", () => {
      setMoviendo(false);
      const c = m.getCenter();
      onMover(c.lat, c.lng);
    });

    return () => {
      m.remove();
      mapa.current = null;
    };
    // Solo al montar: mover el mapa despues no debe recrearlo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      <div
        ref={caja}
        className="mapa-caja h-72 w-full overflow-hidden rounded-xl border border-[var(--borde)]"
      />
      <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
        <div
          className="-mt-6 transition-transform duration-200"
          style={{ transform: moviendo ? "translateY(-8px)" : "translateY(0)" }}
        >
          <MapPin
            size={38}
            strokeWidth={2.5}
            className="drop-shadow-md"
            style={{ color: "var(--primario)", fill: "var(--primario-fondo)" }}
          />
        </div>
        {/* Sombra que delata la altura del pin al arrastrar. */}
        <div
          className="absolute h-1.5 rounded-full bg-black/25 transition-all duration-200"
          style={{ width: moviendo ? 14 : 8, opacity: moviendo ? 0.35 : 0.2 }}
        />
      </div>
    </div>
  );
}
