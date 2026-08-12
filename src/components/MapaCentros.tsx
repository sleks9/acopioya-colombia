"use client";

import { useEffect, useRef, useState } from "react";
import { TriangleAlert } from "lucide-react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Centro } from "@/lib/tipos";
import { estiloMapa } from "@/lib/estiloMapa";

const COLOR: Record<string, string> = {
  abierto: "#059669",
  lleno: "#b45309",
  cerrado: "#c0271f",
};

/**
 * El globo de MapLibre recibe HTML plano, no JSX: el icono va como SVG en
 * linea. Un emoji cambiaria de forma segun el sistema y no se puede teñir.
 */
const AVISO_APROXIMADO = `
  <br><span style="display:inline-flex;align-items:flex-start;gap:4px;color:#b45309;font-size:12px;margin-top:2px">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
         style="flex-shrink:0;margin-top:1px" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
    Ubicación aproximada: confirma la dirección
  </span>`;

export default function MapaCentros({
  centros,
  miUbicacion,
  centro,
  zoom = 5,
  alto = "60vh",
}: {
  centros: Centro[];
  miUbicacion?: [number, number] | null;
  centro?: [number, number];
  zoom?: number;
  alto?: string;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const mapa = useRef<maplibregl.Map | null>(null);
  const marcadores = useRef<maplibregl.Marker[]>([]);
  const marcadorYo = useRef<maplibregl.Marker | null>(null);
  const [falloTeselas, setFalloTeselas] = useState(false);

  useEffect(() => {
    if (!caja.current || mapa.current) return;

    const m = new maplibregl.Map({
      container: caja.current,
      style: estiloMapa(),
      center: centro ?? [-74.3, 4.6],
      zoom,
      attributionControl: { compact: true },
    });
    mapa.current = m;
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __mapa?: maplibregl.Map }).__mapa = m;
    }
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    // Un mapa en blanco sin explicacion es peor que no tener mapa: la persona
    // se queda esperando. Si las teselas no cargan hay que decirlo y empujar
    // hacia la lista, que tiene la misma informacion.
    m.on("error", (e) => {
      const msg = (e?.error?.message ?? "").toLowerCase();
      if (msg.includes("tile") || msg.includes("source") || msg.includes("fetch") ||
          msg.includes("network") || msg.includes("worker")) {
        setFalloTeselas(true);
      }
      console.warn("[mapa]", e?.error?.message ?? e);
    });

    return () => {
      m.remove();
      mapa.current = null;
    };
  }, [centro, zoom]);

  useEffect(() => {
    const m = mapa.current;
    if (!m) return;

    marcadores.current.forEach((x) => x.remove());
    marcadores.current = [];

    for (const c of centros) {
      const color = COLOR[c.estado] ?? "#55635c";
      const aproximado = c.precision === "aproximada";

      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", `${c.nombre}, ${c.direccion}`);
      // Un punto de ubicación dudosa se dibuja hueco y con borde punteado:
      // se ve distinto antes de que nadie lea la insignia.
      el.style.cssText = `
        width:${aproximado ? 20 : 18}px;height:${aproximado ? 20 : 18}px;
        border-radius:50%;cursor:pointer;padding:0;
        background:${aproximado ? "transparent" : color};
        border:${aproximado ? `2.5px dashed ${color}` : "2.5px solid #fff"};
        box-shadow:${aproximado ? "none" : "0 1px 4px rgba(0,0,0,.4)"};
        transition:transform 160ms cubic-bezier(0.23,1,0.32,1);`;
      el.onmouseenter = () => (el.style.transform = "scale(1.25)");
      el.onmouseleave = () => (el.style.transform = "scale(1)");

      const etiquetaEstado =
        c.estado === "abierto" ? "Abierto"
        : c.estado === "lleno" ? "Lleno — no llevar más"
        : "Cerrado";

      const popup = new maplibregl.Popup({ offset: 14, closeButton: false }).setHTML(
        `<div style="font:14px/1.45 system-ui,sans-serif;max-width:230px">
           <strong>${esc(c.nombre)}</strong><br>
           <span style="color:#666">${esc(c.direccion)}</span><br>
           <span style="color:${color};font-weight:600">${etiquetaEstado}</span>
           ${aproximado ? AVISO_APROXIMADO : ""}
           <br><a href="/centro/${c.id}" style="color:#14508c;font-weight:600">Ver detalle →</a>
         </div>`
      );

      marcadores.current.push(
        new maplibregl.Marker({ element: el })
          .setLngLat([c.lng, c.lat])
          .setPopup(popup)
          .addTo(m)
      );
    }
  }, [centros]);

  // Punto azul del usuario, con la convención que todo el mundo ya conoce.
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;

    marcadorYo.current?.remove();
    marcadorYo.current = null;
    if (!miUbicacion) return;

    const el = document.createElement("div");
    el.setAttribute("aria-label", "Tu ubicación");
    el.style.cssText =
      "width:16px;height:16px;border-radius:50%;background:#1a73e8;" +
      "border:3px solid #fff;box-shadow:0 0 0 4px rgba(26,115,232,.25)";

    marcadorYo.current = new maplibregl.Marker({ element: el })
      .setLngLat([miUbicacion[1], miUbicacion[0]])
      .addTo(m);

    m.flyTo({ center: [miUbicacion[1], miUbicacion[0]], zoom: 13, duration: 900 });
  }, [miUbicacion]);

  return (
    <div className="space-y-2">
      {falloTeselas && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-xl bg-[var(--acento-fondo)] px-3 py-2.5 text-sm text-[var(--acento)]"
        >
          <TriangleAlert size={15} className="mt-0.5 shrink-0" aria-hidden />
          El fondo del mapa no cargó (puede ser tu conexión o un bloqueador de
          anuncios). Los puntos siguen siendo correctos, y la lista de abajo
          tiene la misma información con la dirección completa.
        </p>
      )}
      <div
        ref={caja}
        className="mapa-caja w-full overflow-hidden rounded-2xl border border-[var(--borde)]"
        style={{ height: alto }}
      />
    </div>
  );
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}
