import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Condiciones de uso de AcopioYa: qué es, qué no es, cómo se usa la información y los límites de responsabilidad.",
};

const ACTUALIZADO = "12 de agosto de 2026";

export default function Terminos() {
  return (
    <div className="mx-auto max-w-2xl space-y-7 px-4 py-8 text-sm leading-relaxed">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Términos y condiciones</h1>
        <p className="mt-1 text-[var(--texto-suave)]">
          Última actualización: {ACTUALIZADO}
        </p>
      </header>

      <p className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-4 text-pretty">
        En corto: AcopioYa es un tablero comunitario para orientar donaciones
        tras el terremoto. <strong>No pide dinero</strong>, no coordina la ayuda
        ni reemplaza a las autoridades, y la información la publica la gente, no
        nosotros. Confirma siempre antes de desplazarte.
      </p>

      <Seccion n="1" titulo="Quién opera este sitio">
        <p>
          AcopioYa es un proyecto ciudadano sin ánimo de lucro creado y operado
          por <strong>Santiago Rios Morales</strong> (Sleks), desarrollador
          independiente. No es un sitio del Gobierno de Colombia, ni de la Cruz
          Roja, ni de ninguna entidad oficial, y no representa a ninguna de las
          organizaciones cuyos puntos aparecen listados.
        </p>
      </Seccion>

      <Seccion n="2" titulo="Qué es y qué no es">
        <p>Este sitio es un directorio informativo. Sirve para:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Consultar dónde hay centros de acopio y qué están recibiendo.</li>
          <li>Publicar un punto de acopio y mantenerlo actualizado.</li>
          <li>Confirmar o desmentir que un punto sigue operando.</li>
        </ul>
        <p className="mt-2">Este sitio <strong>no</strong>:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Recibe, transporta ni administra donaciones de ningún tipo.</li>
          <li>Recauda dinero, ni publica cuentas bancarias o enlaces de pago.</li>
          <li>Coordina operaciones de rescate ni atención de emergencias.</li>
          <li>Gestiona reportes de personas desaparecidas.</li>
        </ul>
        <p className="mt-2">
          Para emergencias marca <strong>123</strong>. Para información oficial
          consulta a la UNGRD y a tu alcaldía.
        </p>
      </Seccion>

      <Seccion n="3" titulo="La información no está garantizada">
        <p>
          El contenido proviene de dos fuentes: publicaciones de prensa y
          entidades oficiales, y reportes de personas de la comunidad. Ninguna
          de las dos se verifica en terreno.
        </p>
        <p>
          Un centro de acopio puede cerrar, llenarse o cambiar de horario en
          cuestión de horas. Por eso cada punto muestra cuándo se actualizó por
          última vez, si su ubicación es aproximada, y de dónde salió el dato.{" "}
          <strong>
            Esa información se ofrece tal cual está, sin garantía de exactitud,
            vigencia ni disponibilidad.
          </strong>
        </p>
        <p>
          Las coordenadas del mapa pueden ser imprecisas. Cuando un punto está
          marcado como <em>ubicación aproximada</em>, la dirección escrita es la
          referencia confiable, no el pin.{" "}
          <strong>Confirma por teléfono antes de desplazarte.</strong>
        </p>
      </Seccion>

      <Seccion n="4" titulo="Si publicas un punto">
        <p>Al publicar un centro de acopio declaras que:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>La información es veraz y de tu conocimiento directo.</li>
          <li>
            Tienes autorización de quien opera el lugar, o el lugar es de acceso
            público y la convocatoria ya es pública.
          </li>
          <li>
            Si incluyes un teléfono y marcas la casilla de autorización, cuentas
            con el consentimiento de su titular para publicarlo.
          </li>
        </ul>
        <p className="mt-2">
          Recibirás un enlace privado para administrar el punto.{" "}
          <strong>Eres responsable de mantenerlo en secreto</strong>: cualquiera
          que lo tenga puede editar ese punto. Si lo pierdes o se filtra,
          escríbenos para desactivarlo.
        </p>
      </Seccion>

      <Seccion n="5" titulo="Uso indebido">
        <p>Está prohibido usar este sitio para:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Publicar puntos falsos, inexistentes o duplicados.</li>
          <li>
            Solicitar dinero, publicar cuentas bancarias, billeteras digitales o
            códigos de pago bajo cualquier pretexto.
          </li>
          <li>Publicar datos personales de terceros sin su autorización.</li>
          <li>Hacer publicidad, proselitismo político o spam.</li>
          <li>
            Automatizar reportes masivos o intentar manipular el sistema de
            confirmaciones.
          </li>
        </ul>
        <p className="mt-2">
          Los puntos que reciban varios reportes negativos se retiran
          automáticamente del mapa. También podemos retirar contenido y bloquear
          conexiones sin aviso previo.
        </p>
      </Seccion>

      <Seccion n="6" titulo="Límite de responsabilidad">
        <p>
          El sitio se ofrece <em>tal cual</em> y <em>según disponibilidad</em>.
          En la máxima medida permitida por la ley colombiana, quien opera
          AcopioYa no responde por daños, pérdidas, gastos ni perjuicios
          derivados de:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Información desactualizada, incompleta o incorrecta.</li>
          <li>Desplazamientos hechos con base en lo publicado aquí.</li>
          <li>Actos u omisiones de los operadores de los puntos listados.</li>
          <li>Interrupciones, fallas o indisponibilidad del servicio.</li>
        </ul>
        <p className="mt-2">
          La decisión de desplazarse, donar o entregar bienes es tuya y bajo tu
          propia responsabilidad.
        </p>
      </Seccion>

      <Seccion n="7" titulo="Contenido que publicas">
        <p>
          Conservas los derechos sobre lo que publicas. Al publicarlo concedes
          una licencia gratuita y no exclusiva para mostrarlo en el sitio y
          distribuirlo mediante el archivo de datos abiertos, que se publica bajo{" "}
          <strong>CC BY 4.0</strong> para que medios y entidades puedan
          reutilizarlo con atribución.
        </p>
        <p>
          No subas fotografías donde aparezcan personas identificables sin su
          consentimiento, ni imágenes de víctimas o de personas en situación de
          vulnerabilidad.
        </p>
      </Seccion>

      <Seccion n="8" titulo="Datos personales">
        <p>
          El tratamiento de datos personales se rige por la{" "}
          <Link href="/privacidad" className="font-medium text-[var(--info)] underline">
            política de privacidad
          </Link>
          , conforme a la Ley 1581 de 2012 y sus decretos reglamentarios.
        </p>
      </Seccion>

      <Seccion n="9" titulo="Cambios y vigencia">
        <p>
          Estos términos pueden actualizarse mientras dure la emergencia; la
          fecha de la última actualización aparece al inicio. El sitio es una
          respuesta temporal al terremoto del 10 de agosto de 2026 y puede
          suspenderse cuando deje de ser útil.
        </p>
      </Seccion>

      <Seccion n="10" titulo="Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República de Colombia.
          Cualquier controversia se someterá a los jueces competentes del
          territorio colombiano.
        </p>
      </Seccion>

      <footer className="border-t border-[var(--borde)] pt-5 text-[var(--texto-suave)]">
        <p>
          Para reclamos, retiro de un punto o ejercicio de tus derechos sobre
          datos personales, escribe al correo de contacto publicado en el sitio.
        </p>
      </footer>
    </div>
  );
}

function Seccion({
  n, titulo, children,
}: { n: string; titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold">
        <span className="tabular text-[var(--texto-suave)]">{n}.</span> {titulo}
      </h2>
      {children}
    </section>
  );
}
