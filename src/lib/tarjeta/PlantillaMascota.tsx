/**
 * Tarjeta de una mascota perdida o encontrada.
 *
 * Aquí manda la foto: es lo único que permite reconocer al animal, y por eso el
 * formulario la exige. Ocupa la mayor parte del lienzo y el texto queda como
 * apoyo, al revés que en el centro de acopio.
 *
 * Si ya volvió a casa, la tarjeta lo dice en grande en vez de negarse a
 * generarse: alguien puede tener la versión vieja circulando y esta la corrige.
 */

import type { Mascota } from "@/lib/mascotas";
import { haceDias, nombreEspecie, tituloMascota } from "@/lib/mascotas";
import type { Medidas } from "./formatos";
import { C } from "./marca";
import { Marco } from "./Marco";
import { Dato, Sello, Sub, Titular } from "./piezas";
import { recortar } from "./texto";

export function PlantillaMascota({
  mascota,
  m,
  qr,
  foto,
}: {
  mascota: Mascota;
  m: Medidas;
  qr: string;
  foto: string | null;
}) {
  const compacto = !m.vertical;
  const reunida = mascota.estado === "reunida";
  const perdida = mascota.caso === "perdida";

  const banda = reunida
    ? { fondo: C.primario, texto: C.sobrePrimario, rotulo: "YA VOLVIÓ A CASA" }
    : perdida
      ? { fondo: C.peligro, texto: "#ffffff", rotulo: "SE PERDIÓ" }
      : { fondo: C.info, texto: "#ffffff", rotulo: "LA ENCONTRARON" };

  // Sin nombre, `tituloMascota` ya titula con la especie y el color: repetirlos
  // debajo gasta una línea en decir dos veces lo mismo.
  const rasgos = mascota.nombre
    ? [nombreEspecie(mascota.especie), mascota.color].join(" · ")
    : nombreEspecie(mascota.especie);

  return (
    <Marco m={m} banda={banda} qr={qr}>
      {compacto ? (
        // Apaisado: foto a un lado, datos al otro. En vertical no compensa.
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {foto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={foto}
              width={Math.round(m.ancho * 0.3)}
              height={Math.round(m.alto * 0.36)}
              alt=""
              style={{ objectFit: "cover", borderRadius: m.radio, marginRight: m.hueco }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            {/* Recorte corto para que el título quepa en una línea: con dos, el
                teléfono se sale del lienzo, y el teléfono es el motivo de la
                tarjeta. */}
            <Titular m={m}>{recortar(tituloMascota(mascota), 26)}</Titular>
            {/* Sin nombre, `rasgos` es solo la especie, que el título ya dice. */}
            {mascota.nombre && <Sub m={m}>{recortar(rasgos, 38)}</Sub>}
            <Dato m={m} ic="pin">
              {recortar(`${mascota.municipio}, ${mascota.departamento}`, 40)}
            </Dato>
            <Dato m={m} ic="calendario">{haceDias(mascota.dias_desde)}</Dato>
            {mascota.telefono_publico && !reunida && (
              <Dato m={m} ic="telefono" fuerte>
                {mascota.telefono_publico}
              </Dato>
            )}
          </div>
        </div>
      ) : (
        // Un div con `flexDirection` explícito, no un fragmento: satori no
        // propaga el layout del padre a través de `<>...</>` y los hijos
        // acaban en fila, con el texto saliéndose del lienzo.
        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          {/* La foto va primero —es lo que permite reconocerlo— pero cede
              espacio al texto en vez de al revés: un animal sin nombre se
              titula con su color y eso puede ocupar dos líneas. Antes empujaba
              el teléfono fuera del lienzo, que es justo el dato que hace falta
              para avisar. */}
          {foto && (
            <div
              style={{
                display: "flex",
                flex: 1,
                minHeight: Math.round(m.alto * 0.22),
                borderRadius: m.radio,
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto}
                width={m.ancho - m.margen * 2}
                height="100%"
                alt=""
                style={{ objectFit: "cover" }}
              />
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              marginTop: m.hueco,
            }}
          >
            <Titular m={m}>{recortar(tituloMascota(mascota), 32)}</Titular>
            <Sub m={m}>
              {recortar(`${rasgos} · ${mascota.tamano === "pequeno" ? "pequeño" : mascota.tamano}`, 52)}
            </Sub>
            <Dato m={m} ic="pin">
              {recortar(`${mascota.municipio}, ${mascota.departamento}`, 44)}
            </Dato>
            <Dato m={m} ic="calendario">
              {`${perdida ? "Se perdió" : "La encontraron"} ${haceDias(mascota.dias_desde)}`}
            </Dato>
            {mascota.senas && (
              <Sub m={m}>{recortar(`Señas: ${mascota.senas}`, m.formato === "historia" ? 92 : 74)}</Sub>
            )}
            {mascota.telefono_publico && !reunida && (
              <Dato m={m} ic="telefono" fuerte>
                {`Avisa al ${mascota.telefono_publico}`}
              </Dato>
            )}
            {reunida && <Sello m={m}>Este reporte ya se cerró</Sello>}
          </div>
        </div>
      )}
    </Marco>
  );
}
