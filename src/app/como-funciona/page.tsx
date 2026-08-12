import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock, MapPinOff, ShieldOff, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description:
    "Cómo AcopioYa mantiene la información fresca, cómo se verifica cada punto y por qué nunca vas a ver una cuenta bancaria aquí.",
};

export default function ComoFunciona() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Cómo funciona</h1>
        <p className="mt-2 text-[var(--texto-suave)] text-pretty">
          Un directorio de emergencia sirve mientras sea cierto. Estas son las
          reglas que lo mantienen así, sin que nadie tenga que estar de guardia.
        </p>
      </header>

      <Bloque Icono={Clock} titulo="La información se caduca sola">
        <p>
          Cada punto guarda cuándo se actualizó por última vez y la interfaz lo
          muestra siempre.
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li><strong>Menos de 8 horas:</strong> se muestra normal.</li>
          <li><strong>Entre 8 y 24 horas:</strong> se marca como posiblemente desactualizado.</li>
          <li><strong>Más de 24 horas:</strong> sale del mapa por defecto.</li>
        </ul>
        <p>
          Nadie tiene que acordarse de borrar nada: un punto que dejó de
          actualizarse desaparece solo. Es preferible mostrar menos puntos que
          mandar gente a una dirección muerta.
        </p>
      </Bloque>

      <Bloque Icono={BadgeCheck} titulo="De dónde salió cada dato">
        <p>Cada punto dice su procedencia, sin disfrazarla:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Fuente oficial:</strong> tomado de alcaldías, Cruz Roja,
            Ábaco, SCARE o prensa que los citó.
          </li>
          <li>
            <strong>Verificado:</strong> su encargado lo actualizó desde su
            enlace privado, o tres personas distintas lo confirmaron.
          </li>
          <li>
            <strong>Sin verificar:</strong> alguien lo reportó y nadie lo ha
            confirmado todavía.
          </li>
        </ul>
        <p>
          Los puntos sin verificar <em>sí</em> se muestran. Esconderlos sería
          perder información útil en una emergencia; marcarlos con claridad deja
          que cada quien decida.
        </p>
      </Bloque>

      <Bloque Icono={Users} titulo="La comunidad modera">
        <p>
          En la ficha de cada punto hay dos botones: <em>sigue abierto</em> y{" "}
          <em>ya cerró o no existe</em>.
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Tres confirmaciones suben un punto a verificado.</li>
          <li>Tres reportes negativos retiran del mapa un punto sin verificar.</li>
          <li>
            Un punto de fuente oficial nunca se oculta solo: se marca, pero se
            revisa a mano.
          </li>
        </ul>
        <p>
          Se acepta un voto por conexión cada seis horas, para que nadie pueda
          tumbar un punto real votando muchas veces.
        </p>
      </Bloque>

      <Bloque Icono={MapPinOff} titulo="Por qué algunos pines dicen «aproximada»">
        <p>
          Al cargar los puntos publicados por la prensa comprobamos sus
          coordenadas contra OpenStreetMap. Solo 4 de 25 coincidieron dentro de
          150 metros; once diferían más de 800, y la peor por más de 7 kilómetros.
        </p>
        <p>
          Cuando dos fuentes independientes discrepan así, no hay forma de saber
          cuál tiene razón sin ir al lugar. En vez de fingir precisión, esos
          puntos quedan marcados como <strong>ubicación aproximada</strong>: la
          dirección escrita es la referencia confiable y el pin solo orienta.
        </p>
        <p>
          Cuando el encargado del punto lo actualiza desde su celular, la
          ubicación pasa a ser exacta y el aviso desaparece.
        </p>
      </Bloque>

      <Bloque Icono={ShieldOff} titulo="Aquí nunca vas a ver una cuenta bancaria">
        <p>
          El sistema no tiene ningún campo para dinero: ni cuenta, ni Nequi, ni
          QR, ni enlaces de pago. No es un olvido, es una decisión de diseño.
        </p>
        <p>
          La estafa más común tras un desastre es alguien recaudando plata a
          nombre de una causa real. Al no existir el campo, no hay forma de usar
          este sitio para eso. Para donaciones en efectivo, solo los canales
          oficiales de la Cruz Roja Colombiana y la UNGRD.
        </p>
      </Bloque>

      <div className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-5">
        <h2 className="font-semibold">Los datos son abiertos</h2>
        <p className="mt-1.5 text-sm text-[var(--texto-suave)] text-pretty">
          Todo el directorio está disponible en un archivo JSON bajo licencia
          CC BY 4.0, para que cualquier medio, alcaldía u organización lo use en
          su propio sitio en vez de mantener otra lista aparte. Que la
          información esté en un solo lugar vale más que el crédito.
        </p>
        <Link
          href="/api/centros.json"
          className="presionable mt-3 inline-flex items-center gap-1.5 rounded-xl border border-[var(--borde-fuerte)] px-3.5 py-2.5 text-sm font-semibold"
        >
          Ver los datos abiertos
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>

      <div className="rounded-2xl bg-[var(--primario-fondo)] p-5 text-center">
        <p className="font-semibold">¿Conoces un punto que no está en el mapa?</p>
        <Link
          href="/reportar"
          className="presionable mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[var(--primario)] px-4 py-3 text-sm font-semibold text-[var(--sobre-primario)]"
        >
          Publicarlo toma un minuto
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function Bloque({
  Icono, titulo, children,
}: {
  Icono: React.ComponentType<{ size?: number; className?: string }>;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2 text-sm leading-relaxed">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Icono size={18} className="shrink-0 text-[var(--primario)]" />
        {titulo}
      </h2>
      {children}
    </section>
  );
}
