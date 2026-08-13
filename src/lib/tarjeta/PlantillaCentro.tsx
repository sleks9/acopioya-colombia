/**
 * Tarjeta de un centro de acopio.
 *
 * Jerarquía deliberada: primero el estado (¿tiene sentido ir?), después dónde,
 * y enseguida los dos bloques de insumos. El «NO llevar» va con el mismo peso
 * visual que el «sí reciben» porque es el dato que nadie más publica y el que
 * evita que una bodega se llene de ropa que nadie pidió.
 *
 * En el formato apaisado hay sitio para un solo bloque: gana el «NO llevar»
 * cuando existe, por lo mismo.
 */

import type { Centro } from "@/lib/tipos";
import {
  ETIQUETA_PRECISION, jornadaVigente, nombreInsumo, textoJornada,
} from "@/lib/tipos";
import type { Medidas } from "./formatos";
import { COLOR_ESTADO } from "./marca";
import { Marco } from "./Marco";
import { Aviso, Bloque, Dato, FotoElastica, Jornada, Resumen, Sub, Titular } from "./piezas";
import { primeros, recortar } from "./texto";

export function PlantillaCentro({
  c,
  m,
  qr,
  foto,
}: {
  c: Centro;
  m: Medidas;
  qr: string;
  foto: string | null;
}) {
  const compacto = !m.vertical;
  const si = primeros(c.necesita, compacto ? 3 : 5, nombreInsumo);
  const no = primeros(c.no_necesita, compacto ? 3 : 4, nombreInsumo);

  const mostrarNo = no.visibles.length > 0;
  const mostrarSi = si.visibles.length > 0;

  // Solo la historia tiene alto de sobra para una foto; en las otras dos el
  // sitio lo necesitan los datos.
  const conFoto = m.formato === "historia" && Boolean(foto);

  // 40 en apaisado: es lo que entra en una línea a ese tamaño de titular.
  const nombre = recortar(c.nombre, compacto ? 40 : 48);

  /**
   * El lienzo tiene un alto fijo y el contenido no: un nombre de tres líneas
   * empuja lo de abajo fuera del recorte. Lo que se caiga tiene que ser lo
   * menos importante, así que el operador —dato de contexto, no de acción— se
   * sacrifica cuando el título ya ocupa mucho.
   */
  const cabeOperador = !compacto && Boolean(c.operador) && nombre.length < 34;
  const jornada = jornadaVigente(c);

  return (
    <Marco m={m} banda={COLOR_ESTADO[c.estado]} qr={qr}>
      <Titular m={m}>{nombre}</Titular>
      <Sub m={m}>
        {recortar(`${c.direccion} · ${c.ciudad}, ${c.departamento}`, compacto ? 62 : 84)}
      </Sub>
      {cabeOperador && <Sub m={m}>{recortar(`Operado por ${c.operador}`, 52)}</Sub>}

      {/* Va aquí arriba, no al final: es una advertencia de seguridad —el pin
          puede estar a varias cuadras— y tiene que sobrevivir al recorte. La
          honestidad sobre la coordenada viaja con la imagen; sería peor que se
          cayera justo al salir de la plataforma. */}
      {!ETIQUETA_PRECISION[c.precision].fiable && (
        <Aviso m={m}>
          {compacto
            ? "Ubicación aproximada"
            : "Ubicación aproximada: guíate por la dirección escrita"}
        </Aviso>
      )}

      {/* Justo debajo de la dirección: es el dato que hace que valga la pena
          compartir la tarjeta, y el que caduca solo. */}
      {jornada && (
        <Jornada
          m={m}
          texto={textoJornada(jornada.inicio, jornada.fin)}
          enCurso={jornada.enCurso}
        />
      )}

      {/* En el apaisado el teléfono va ANTES de las listas.
          El alto disponible ahí son 390 px y no hay garantía de que quepa
          todo: un nombre de dos líneas más el aviso de ubicación ya se comen
          el margen. Lo que sobre tiene que caerse por abajo, así que abajo va
          lo prescindible. Un centro sin la lista de insumos sigue sirviendo
          —llamas y preguntas—; sin el teléfono, no. */}
      {compacto && c.telefono_publico && (
        <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <Dato m={m} ic="telefono" fuerte>
            {c.telefono_publico}
          </Dato>
        </div>
      )}

      {/* Contenedor con `flexDirection` explícito y no un fragmento: satori no
          propaga el layout del padre a través de `<>…</>` y los hijos acaban
          uno al lado del otro. */}
      <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {compacto ? (
          <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <Resumen m={m} tono="si" titulo="Reciben:" items={si.visibles} resto={si.resto} />
            <Resumen m={m} tono="no" titulo="NO llevar:" items={no.visibles} resto={no.resto} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
            {mostrarSi && (
              <Bloque m={m} tono="si" titulo="ESTÁN RECIBIENDO" items={si.visibles} resto={si.resto} />
            )}
            {mostrarNo && (
              <Bloque m={m} tono="no" titulo="NO LLEVAR" items={no.visibles} resto={no.resto} />
            )}
          </div>
        )}
      </div>

      {!compacto && (
        <div style={{ display: "flex", flexDirection: "column", marginTop: m.hueco }}>
          {/* El teléfono antes que el horario: es el dato más accionable de
              todos, el que evita el viaje en balde. */}
          {c.telefono_publico && (
            <Dato m={m} ic="telefono" fuerte>
              {c.telefono_publico}
            </Dato>
          )}
          {c.horario && <Dato m={m} ic="reloj">{recortar(c.horario, 60)}</Dato>}
        </div>
      )}

      {/* Mínimo bajo a propósito: si el punto trae mucho texto, la foto se
          encoge hasta desaparecer en vez de desbordar el lienzo y salir
          cortada por la mitad. Es lo prescindible de esta tarjeta. */}
      {conFoto && <FotoElastica m={m} src={foto!} minimo={Math.round(m.alto * 0.1)} />}
    </Marco>
  );
}
