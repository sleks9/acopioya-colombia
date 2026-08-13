/**
 * Tarjeta de una solicitud de ayuda.
 *
 * Cuidado con la ubicación: la ficha publica barrio o vereda y municipio, nunca
 * la dirección exacta ni la coordenada, porque detrás de una solicitud hay una
 * familia en su casa. La tarjeta se va a reenviar mucho más lejos que la ficha,
 * así que aquí esa regla vale doble.
 */

import type { Solicitud } from "@/lib/solicitudes";
import { ESTADOS, nombreNecesidad } from "@/lib/solicitudes";
import type { Medidas } from "./formatos";
import { COLOR_URGENCIA } from "./marca";
import { Marco } from "./Marco";
import { Bloque, Dato, Foto, Resumen, Sello, Sub, Titular } from "./piezas";
import { primeros, recortar } from "./texto";

export function PlantillaSolicitud({
  s,
  m,
  qr,
  foto,
}: {
  s: Solicitud;
  m: Medidas;
  qr: string;
  foto: string | null;
}) {
  const compacto = !m.vertical;
  const nec = primeros(s.necesita, compacto ? 3 : 6, nombreNecesidad);
  const altoFoto = m.formato === "historia" ? Math.round(m.alto * 0.19) : 0;

  return (
    <Marco m={m} banda={COLOR_URGENCIA[s.urgencia]} qr={qr}>
      {/* 40 en apaisado: lo que entra en una línea a ese tamaño de titular.
          Con dos, la última línea de contenido queda cortada por la mitad. */}
      <Titular m={m}>{recortar(s.titulo, compacto ? 40 : 62)}</Titular>
      {/* Solo barrio o vereda y municipio. Nunca más preciso que esto. */}
      <Sub m={m}>{recortar(`${s.barrio_vereda} · ${s.municipio}, ${s.departamento}`, compacto ? 58 : 80)}</Sub>

      {compacto ? (
        <Resumen m={m} tono="si" titulo="Necesitan:" items={nec.visibles} resto={nec.resto} />
      ) : (
        <Bloque m={m} tono="si" titulo="QUÉ NECESITAN" items={nec.visibles} resto={nec.resto} />
      )}

      <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, marginTop: Math.round(m.hueco * 0.4) }}>
        {s.personas && (
          <Dato m={m} ic="usuarios">{`${s.personas} personas beneficiadas`}</Dato>
        )}
        {/* El teléfono cabe también en el apaisado: sin él la tarjeta informa
            pero no permite hacer nada. */}
        {s.telefono_publico ? (
          <Dato m={m} ic="telefono" fuerte>
            {s.telefono_publico}
          </Dato>
        ) : (
          !compacto && (
            <Dato m={m} ic="pin">Sin teléfono público: coordina desde la ficha</Dato>
          )
        )}
      </div>

      {s.estado !== "abierta" && <Sello m={m}>{ESTADOS[s.estado].nombre}</Sello>}

      {/* Va al final y sin foto de por medio: es contexto, no acción. Si no
          cabe se recorta ella, que es lo que menos falta hace para decidir si
          puedes ayudar. */}
      {m.formato === "historia" && !foto && (
        <Sub m={m}>{recortar(s.descripcion, 190)}</Sub>
      )}

      {altoFoto > 0 && foto && <Foto m={m} src={foto} alto={altoFoto} />}
    </Marco>
  );
}
