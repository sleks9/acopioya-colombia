/**
 * Piezas compartidas por las tres plantillas.
 *
 * Reglas de satori que condicionan todo lo de aquí: solo flexbox, nada de
 * `grid`; `gap` es poco fiable, así que la separación va con márgenes; y todo
 * contenedor con más de un hijo necesita `display: flex` explícito.
 *
 * `flexShrink: 0` en todas las piezas, sin excepción. Sin eso, cuando el
 * contenido no cabe —una dirección larga en el formato apaisado— flexbox
 * encoge los hijos hasta que las líneas se montan unas encima de otras y la
 * tarjeta sale ilegible, sin lanzar ningún error. Es preferible que algo se
 * recorte por abajo a que el título se solape con el subtítulo.
 */

import type { Medidas } from "./formatos";
import { C } from "./marca";
import { icono, type Icono } from "./iconos";

export function Titular({ m, children }: { m: Medidas; children: string }) {
  return (
    <span
      style={{
        fontSize: m.titular,
        fontWeight: 700,
        lineHeight: 1.08,
        letterSpacing: -m.titular * 0.02,
        color: C.texto,
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

export function Sub({ m, children }: { m: Medidas; children: string }) {
  return (
    <span
      style={{
        fontSize: m.subtitulo,
        color: C.textoSuave,
        lineHeight: 1.3,
        marginTop: Math.round(m.hueco * 0.5),
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

/** Fila de dato con icono. El icono nunca va solo: siempre acompaña al texto. */
export function Dato({
  m,
  ic,
  children,
  fuerte = false,
}: {
  m: Medidas;
  ic: Icono;
  children: string;
  fuerte?: boolean;
}) {
  const tam = Math.round(m.cuerpo * 1.15);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        marginTop: Math.round(m.hueco * 0.6),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icono(ic, C.textoSuave, 2.4)} width={tam} height={tam} alt="" style={{ flexShrink: 0 }} />
      <span
        style={{
          fontSize: m.cuerpo,
          marginLeft: Math.round(m.cuerpo * 0.5),
          color: fuerte ? C.texto : C.textoSuave,
          fontWeight: fuerte ? 700 : 400,
        }}
      >
        {children}
      </span>
    </div>
  );
}

/**
 * «Están recibiendo» y «NO llevar».
 *
 * El segundo es el dato de mayor valor humanitario del producto y el que nadie
 * más publica —evita la avalancha de ropa usada que tapa bodegas—, así que en
 * la tarjeta pesa visualmente igual que el primero, no como una nota al pie.
 */
export function Bloque({
  m,
  tono,
  titulo,
  items,
  resto,
}: {
  m: Medidas;
  tono: "si" | "no";
  titulo: string;
  items: string[];
  resto: number;
}) {
  if (!items.length) return null;
  const color = tono === "si" ? C.primarioFuerte : C.peligro;
  const fondo = tono === "si" ? C.primarioFondo : C.peligroFondo;
  const ic: Icono = tono === "si" ? "check" : "equis";
  const tam = Math.round(m.cuerpo * 0.95);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        backgroundColor: fondo,
        borderRadius: m.radio,
        padding: Math.round(m.margen * 0.5),
        marginTop: m.hueco,
      }}
    >
      <span
        style={{
          fontSize: Math.round(m.cuerpo * 0.86),
          fontWeight: 700,
          letterSpacing: m.cuerpo * 0.05,
          color,
        }}
      >
        {titulo}
      </span>
      <div style={{ display: "flex", flexWrap: "wrap", marginTop: Math.round(m.hueco * 0.45) }}>
        {items.map((t) => (
          <div
            key={t}
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: Math.round(m.cuerpo * 0.8),
              marginTop: Math.round(m.cuerpo * 0.28),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={icono(ic, color, 3.2)} width={tam} height={tam} alt="" />
            <span
              style={{
                fontSize: m.cuerpo,
                fontWeight: 700,
                color: C.texto,
                marginLeft: Math.round(m.cuerpo * 0.3),
              }}
            >
              {t}
            </span>
          </div>
        ))}
        {resto > 0 && (
          <span
            style={{
              fontSize: m.cuerpo,
              color,
              marginTop: Math.round(m.cuerpo * 0.28),
              fontWeight: 700,
            }}
          >
            y {resto} más
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * La misma información que `Bloque`, en una línea.
 *
 * En el lienzo apaisado solo hay 363 px de alto para todo el contenido, y una
 * caja con fondo, título y relleno se come 128 de ellos —un tercio— dejando el
 * teléfono fuera del recorte. Aquí el icono y el color siguen distinguiendo lo
 * que se recibe de lo que no, que es lo que importa, sin gastar el alto de una
 * caja.
 */
export function Resumen({
  m,
  tono,
  titulo,
  items,
  resto,
}: {
  m: Medidas;
  tono: "si" | "no";
  titulo: string;
  items: string[];
  resto: number;
}) {
  if (!items.length) return null;
  const color = tono === "si" ? C.primarioFuerte : C.peligro;
  const ic: Icono = tono === "si" ? "check" : "equis";
  const tam = Math.round(m.cuerpo * 0.95);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        marginTop: Math.round(m.hueco * 0.7),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icono(ic, color, 3.2)} width={tam} height={tam} alt="" style={{ flexShrink: 0 }} />
      <span
        style={{
          fontSize: m.cuerpo,
          fontWeight: 700,
          color,
          marginLeft: Math.round(m.cuerpo * 0.3),
          flexShrink: 0,
        }}
      >
        {titulo}
      </span>
      <span
        style={{
          fontSize: m.cuerpo,
          color: C.texto,
          marginLeft: Math.round(m.cuerpo * 0.3),
          overflow: "hidden",
        }}
      >
        {resto > 0 ? `${items.join(", ")} y ${resto} más` : items.join(", ")}
      </span>
    </div>
  );
}

/** Aviso en ámbar: la insignia de ubicación aproximada, la frescura dudosa. */
export function Aviso({ m, children }: { m: Medidas; children: string }) {
  const tam = Math.round(m.cuerpo * 1.05);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        backgroundColor: C.acentoFondo,
        borderRadius: Math.round(m.radio * 0.7),
        padding: Math.round(m.cuerpo * 0.5),
        marginTop: m.hueco,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icono("alerta", C.acento, 2.6)} width={tam} height={tam} alt="" />
      <span
        style={{
          fontSize: Math.round(m.cuerpo * 0.92),
          color: C.acento,
          fontWeight: 700,
          marginLeft: Math.round(m.cuerpo * 0.4),
        }}
      >
        {children}
      </span>
    </div>
  );
}

/**
 * Foto que se come el espacio que sobre.
 *
 * En vertical el texto nunca llena el lienzo, y la altura que sobra depende de
 * cuántos insumos tenga el punto: no se puede fijar de antemano. Si se deja un
 * alto fijo queda un vacío entre la foto y el pie que se lee como un error de
 * maquetación. Con `flex: 1` la foto ocupa lo que quede, sea cual sea.
 *
 * `minHeight: 0` es imprescindible: sin él un hijo flexible se niega a
 * encogerse por debajo de su contenido y desborda el lienzo.
 */
export function FotoElastica({ m, src, minimo }: { m: Medidas; src: string; minimo: number }) {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        minHeight: minimo,
        marginTop: m.hueco,
        borderRadius: m.radio,
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        width={m.ancho - m.margen * 2}
        height="100%"
        alt=""
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}

export function Foto({ m, src, alto }: { m: Medidas; src: string; alto: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      width={m.ancho - m.margen * 2}
      height={alto}
      alt=""
      style={{ objectFit: "cover", borderRadius: m.radio, marginTop: m.hueco, flexShrink: 0 }}
    />
  );
}

/**
 * Sello para lo que ya no aplica: mascota reunida, solicitud cubierta.
 *
 * No se bloquea la generación de esas tarjetas. Al contrario: si una versión
 * vieja anda circulando, esta es la que la corrige.
 */
export function Sello({ m, children }: { m: Medidas; children: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        backgroundColor: C.primario,
        borderRadius: Math.round(m.radio * 0.6),
        paddingTop: Math.round(m.cuerpo * 0.55),
        paddingBottom: Math.round(m.cuerpo * 0.55),
        paddingLeft: Math.round(m.cuerpo),
        paddingRight: Math.round(m.cuerpo),
        marginTop: m.hueco,
      }}
    >
      <span
        style={{
          fontSize: m.subtitulo,
          fontWeight: 700,
          color: C.sobrePrimario,
          letterSpacing: m.subtitulo * 0.04,
        }}
      >
        {children}
      </span>
    </div>
  );
}
