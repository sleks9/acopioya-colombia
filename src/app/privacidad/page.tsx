import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidad y retiro de un punto",
  description:
    "Qué datos guarda AcopioYa, por cuánto tiempo y cómo pedir que se retire un punto del mapa.",
};

export default function Privacidad() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6 text-sm leading-relaxed">
      <h1 className="text-2xl font-bold tracking-tight">Privacidad y retiro de un punto</h1>

      <Seccion titulo="Qué datos guardamos">
        <p>
          De cada centro de acopio guardamos su nombre, dirección, ubicación,
          horario, qué recibe y qué no recibe. Nada de esto es información
          personal: describe un lugar público que recibe donaciones.
        </p>
        <p>
          El teléfono del encargado{" "}
          <strong>solo se publica si marcaste la casilla de autorización</strong>{" "}
          al reportar el punto. Sin esa casilla el número no se envía al sitio.
        </p>
        <p>
          No recogemos datos de personas damnificadas, ni reportes de
          desaparecidos, ni información de salud.
        </p>
      </Seccion>

      <Seccion titulo="Dirección IP">
        <p>
          Para evitar reportes falsos masivos guardamos un{" "}
          <strong>código derivado</strong> de la dirección IP, no la dirección
          en sí. Ese código no permite reconstruir la IP ni identificar a nadie:
          solo sirve para detectar que muchos reportes vienen de la misma
          conexión.
        </p>
      </Seccion>

      <Seccion titulo="Dinero">
        <p>
          AcopioYa <strong>nunca pide ni recibe dinero</strong>, no publica
          cuentas bancarias, ni Nequi, ni códigos QR de pago. Es una decisión
          deliberada: es el principal mecanismo de estafa tras un desastre.
        </p>
        <p>
          Si alguien te pide dinero diciendo que representa a este sitio, es un
          fraude. Para donaciones en efectivo usa únicamente los canales
          oficiales de la Cruz Roja Colombiana y la UNGRD.
        </p>
      </Seccion>

      <Seccion titulo="Cómo retirar un punto">
  <p>
    Si eres responsable de un lugar publicado aquí y quieres que se retire, o si
    un punto tiene información equivocada:
  </p>
  <ul className="list-disc pl-5 space-y-1">
    <li>
      Si tienes el enlace privado que se generó al publicarlo, entra y marca el
      punto como <strong>Cerrado</strong>.
    </li>
    <li>
      Si no lo tienes, usa el botón{" "}
      <strong>&ldquo;Ya cerró o no existe&rdquo;</strong> en la ficha del punto.
      Con tres reportes se oculta temporalmente para revisión.
    </li>
    <li>
      Para cualquier otro caso o atención manual, escribe a{" "}
      <a
        href="mailto:acopioyaco@gmail.com"
        className="text-blue-600 underline font-semibold hover:text-blue-800"
      >
        acopioyaco@gmail.com
      </a>
      .
    </li>
  </ul>
</Seccion>

      <Seccion titulo="Tus derechos">
        <p>
          Conforme a la Ley 1581 de 2012 puedes conocer, actualizar, rectificar
          y suprimir tus datos personales, y revocar la autorización que hayas
          dado. Para ejercer cualquiera de estos derechos, escríbenos.
        </p>
      </Seccion>

      <Seccion titulo="Exactitud de la información">
        <p>
          Los datos provienen de fuentes oficiales de prensa y de reportes de la
          comunidad. Pueden quedar desactualizados en cuestión de horas: por eso
          cada punto muestra cuándo se actualizó por última vez y los puntos sin
          novedades por más de un día salen del mapa. Aun así,{" "}
          <strong>confirma por teléfono antes de desplazarte</strong>.
        </p>
      </Seccion>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-base">{titulo}</h2>
      {children}
    </section>
  );
}
