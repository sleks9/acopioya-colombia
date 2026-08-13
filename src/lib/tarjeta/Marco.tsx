/**
 * El marco común a las tres tarjetas: banda de estado arriba, pie con QR abajo.
 *
 * Truco de composición para las zonas seguras: en `historia` los Estados de
 * WhatsApp y las Historias de Instagram dibujan encima de la imagen, arriba y
 * abajo. En vez de dejar ahí dos franjas blancas muertas, **la banda de color
 * sangra hasta el borde y solo su contenido respeta la línea segura**. El
 * relleno se ve deliberado en lugar de parecer un margen mal calculado, y nada
 * legible queda debajo del chrome de la app.
 */

import type { ReactNode } from "react";
import type { Medidas } from "./formatos";
import { C, dominio, selloDeTiempo } from "./marca";

export type Banda = { fondo: string; texto: string; rotulo: string };

export function Marco({
  m,
  banda,
  qr,
  children,
}: {
  m: Medidas;
  banda: Banda;
  qr: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: m.ancho,
        height: m.alto,
        backgroundColor: C.superficie,
        fontFamily: "Inter",
        color: C.texto,
      }}
    >
      {/* ── Banda de estado ── sangra al borde, el texto respeta la zona segura */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          backgroundColor: banda.fondo,
          paddingTop: m.aire_arriba + Math.round(m.margen * 0.55),
          paddingBottom: Math.round(m.margen * 0.55),
          paddingLeft: m.margen,
          paddingRight: m.margen,
        }}
      >
        <span
          style={{
            fontSize: m.sello,
            fontWeight: 700,
            letterSpacing: m.sello * 0.06,
            color: banda.texto,
          }}
        >
          {banda.rotulo}
        </span>
      </div>

      {/* ── Contenido ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
          paddingTop: m.margen,
          paddingLeft: m.margen,
          paddingRight: m.margen,
          paddingBottom: Math.round(m.margen * 0.5),
        }}
      >
        {children}
      </div>

      {/* ── Pie ── el puente de vuelta a los datos vivos */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          backgroundColor: C.superficie2,
          borderTop: `${Math.max(1, Math.round(m.ancho / 540))}px solid ${C.borde}`,
          paddingTop: Math.round(m.margen * 0.6),
          paddingBottom: m.aire_abajo + Math.round(m.margen * 0.6),
          paddingLeft: m.margen,
          paddingRight: m.margen,
        }}
      >
        {m.qr > 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qr}
            width={m.qr}
            height={m.qr}
            alt=""
            style={{
              flexShrink: 0,
              backgroundColor: "#ffffff",
              padding: Math.round(m.qr * 0.06),
              borderRadius: Math.round(m.radio * 0.4),
              marginRight: Math.round(m.margen * 0.55),
            }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <span style={{ fontSize: m.pie * 1.3, fontWeight: 700, color: C.texto }}>
            AcopioYa · {dominio()}
          </span>
          <span style={{ fontSize: m.pie, color: C.textoSuave, marginTop: m.pie * 0.28 }}>
            Datos del {selloDeTiempo()}
          </span>
          <span
            style={{
              fontSize: m.pie,
              fontWeight: 700,
              color: C.primarioFuerte,
              marginTop: m.pie * 0.28,
            }}
          >
            {m.qr > 0
              ? "Los datos cambian. Escanea antes de salir."
              : "Los datos cambian. Confirma antes de salir."}
          </span>
        </div>
      </div>
    </div>
  );
}
