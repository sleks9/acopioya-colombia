"use client";

import { useEffect, useState } from "react";
import { ImageOff, MapPin } from "lucide-react";
import { miniaturaDe } from "@/lib/estiloMapa";
import { urlFoto, type Estado } from "@/lib/tipos";

const COLOR: Record<Estado, string> = {
  abierto: "var(--primario)",
  lleno: "var(--acento)",
  cerrado: "var(--peligro)",
};

/**
 * Imagen de una tarjeta. Con foto se usa la foto; sin foto, una miniatura del
 * mapa con el punto marcado.
 *
 * Solo 4 de 35 puntos tienen foto, asi que sin este respaldo la cuadricula
 * quedaria casi vacia. Y una miniatura de mapa no es relleno decorativo:
 * responde "donde queda", que es justo lo que se pregunta al escoger a donde ir.
 *
 * En conexion lenta no se descarga NADA: se dibuja un marcador de posicion con
 * CSS. En zona de desastre la red se paga por megabyte y una cuadricula de
 * miniaturas puede pesar mas que toda la informacion util de la pagina.
 */
export function MiniaturaPunto({
  lat,
  lng,
  estado,
  fotoUrl,
  nombre,
  alto = "h-28",
}: {
  lat: number;
  lng: number;
  estado: Estado;
  fotoUrl: string | null;
  nombre: string;
  alto?: string;
}) {
  const [ahorroDatos, setAhorroDatos] = useState<boolean | null>(null);
  const [fallo, setFallo] = useState(false);

  // Se decide en el cliente: el servidor no conoce la conexión.
  useEffect(() => {
    const c = (navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    }).connection;
    setAhorroDatos(
      Boolean(c?.saveData || c?.effectiveType === "2g" || c?.effectiveType === "slow-2g")
    );
  }, []);

  const marco = `relative ${alto} w-full overflow-hidden rounded-xl bg-[var(--superficie-2)]`;

  // Hasta saber la conexión, y en conexión lenta, no se pide ninguna imagen.
  if (ahorroDatos !== false) {
    return (
      <div className={marco} aria-hidden>
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(135deg, var(--superficie-2) 25%, var(--borde) 25%, var(--borde) 50%, var(--superficie-2) 50%, var(--superficie-2) 75%, var(--borde) 75%)",
            backgroundSize: "12px 12px",
          }}
        />
        <MapPin
          size={20}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ color: COLOR[estado] }}
        />
      </div>
    );
  }

  const foto = urlFoto(fotoUrl);

  if (foto && !fallo) {
    return (
      <div className={marco}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={foto}
          alt={`Foto de ${nombre}`}
          loading="lazy"
          decoding="async"
          onError={() => setFallo(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const mini = miniaturaDe(lat, lng);
  // `object-position` alinea ese punto de la imagen con el mismo punto del
  // marco, asi que el marcador va exactamente en esas coordenadas relativas.
  const x = (mini.px / mini.tamano) * 100;
  const y = (mini.py / mini.tamano) * 100;

  return (
    <div className={marco}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mini.url}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        onError={() => setFallo(true)}
        className="h-full w-full object-cover"
        style={{ objectPosition: `${x}% ${y}%` }}
      />
      {fallo ? (
        <ImageOff
          size={18}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--texto-suave)]"
          aria-hidden
        />
      ) : (
        <span
          aria-hidden
          className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
          style={{ left: `${x}%`, top: `${y}%`, background: COLOR[estado] }}
        />
      )}
    </div>
  );
}
