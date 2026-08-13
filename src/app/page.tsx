import Link from "next/link";
import {
  ArrowRight, BadgeCheck, Clock, HandHeart, MapPin, PackageX, PawPrint,
  RadioTower, ShieldAlert, Smartphone, Users,
} from "lucide-react";
import { obtenerCentros } from "@/lib/datos";
import { abiertoAhora } from "@/lib/tipos";

export const revalidate = 60;

export default async function Inicio() {
  const centros = await obtenerCentros();
  const ciudades = new Set(centros.map((c) => c.ciudad)).size;

  // "Abiertos ahora" tiene que significar eso de verdad. Antes contaba el estado
  // declarado (abierto / lleno / cerrado), que no dice nada de la hora: a las
  // 11 de la noche mostraba "35 abiertos ahora". Ahora se cruza con el horario
  // publicado, en hora de Colombia, y solo cuenta lo que se puede afirmar.
  const recibiendo = centros.filter((c) => c.estado === "abierto");
  const abiertosAhora = recibiendo.filter((c) => abiertoAhora(c.horario) === true).length;
  const sinHorario = recibiendo.filter((c) => abiertoAhora(c.horario) === null).length;

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="border-b border-[var(--borde)] bg-[var(--superficie)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[var(--peligro-fondo)] px-3 py-1 text-xs font-semibold text-[var(--peligro)]">
            <RadioTower size={13} aria-hidden />
            Terremoto M7.4 · 10 de agosto de 2026 · Chocó
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-balance sm:text-5xl">
            Dónde llevar donaciones,{" "}
            <span className="text-[var(--primario)]">actualizado hoy</span>.
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-[var(--texto-suave)] text-pretty">
            Las listas de centros de acopio que publicó la prensa el primer día
            siguen circulando una semana después. AcopioYa muestra si el punto
            sigue abierto, qué está recibiendo y —sobre todo—{" "}
            <strong className="text-[var(--texto)]">qué ya no debes llevar</strong>.
          </p>

          {/*
            Cuatro caminos, porque quien llega puede venir de cuatro
            situaciones muy distintas. Se nombran por lo que la persona QUIERE,
            no por como se llama la seccion.
          */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Camino
              href="/mapa"
              Icono={MapPin}
              titulo="Quiero donar"
              detalle="Dónde entregar y qué NO llevar"
              destacado
            />
            <Camino
              href="/solicitudes"
              Icono={HandHeart}
              titulo="Necesito ayuda"
              detalle="Publica qué necesita tu familia o vereda"
            />
            <Camino
              href="/mascotas"
              Icono={PawPrint}
              titulo="Perdí mi mascota"
              detalle="O me encontré una"
            />
            <Camino
              href="/buscar-personas"
              Icono={Users}
              titulo="Busco a alguien"
              detalle="Canales oficiales de búsqueda"
            />
          </div>

          {centros.length > 0 && (
            <>
              <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4">
                <Cifra valor={centros.length} etiqueta="puntos activos" />
                <Cifra valor={abiertosAhora} etiqueta="abiertos a esta hora" />
                <Cifra valor={ciudades} etiqueta="ciudades" />
              </dl>
              {sinHorario > 0 && (
                <p className="tabular mt-2 text-xs text-[var(--texto-suave)]">
                  {sinHorario} {sinHorario === 1 ? "punto no tiene" : "puntos no tienen"} horario
                  publicado: confirma antes de ir.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── El problema que resuelve ───────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold tracking-tight text-balance">
          El problema no es que falte ayuda. Es que llega a donde ya no hace falta.
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--texto-suave)] text-pretty">
          Tras cada desastre se repite lo mismo: bodegas tapadas de ropa usada
          mientras a dos cuadras falta agua, y filas de carros en un punto que
          cerró ayer. No sobra solidaridad, falta información fresca.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Tarjeta
            Icono={PackageX}
            color="var(--peligro)"
            titulo="Qué NO llevar"
            texto="Cada punto marca lo que ya le sobra. Es el dato que nadie publica y el que evita que tu esfuerzo termine estorbando."
          />
          <Tarjeta
            Icono={Clock}
            color="var(--acento)"
            titulo="Se caduca solo"
            texto="Un punto sin novedades en 8 horas se marca como dudoso, y a las 24 sale del mapa. Nadie tiene que acordarse de borrarlo."
          />
          <Tarjeta
            Icono={BadgeCheck}
            color="var(--info)"
            titulo="Dice de dónde salió"
            texto="Cada punto muestra si viene de fuente oficial, si lo confirmó la comunidad o si nadie lo ha verificado todavía. Sin disfraces."
          />
        </div>
      </section>

      {/* ── Cómo funciona ─────────────────────────────────────── */}
      <section className="border-y border-[var(--borde)] bg-[var(--superficie)]">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold tracking-tight">Cómo funciona</h2>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 font-semibold">
                <HandHeart size={18} className="text-[var(--primario)]" aria-hidden />
                Si vas a donar
              </h3>
              <ol className="mt-3 space-y-3">
                <Paso n={1} titulo="Busca el punto más cercano">
                  Filtra por ciudad o por lo que quieres donar. El mapa ordena
                  por cercanía si compartes tu ubicación.
                </Paso>
                <Paso n={2} titulo="Revisa qué necesita y qué no">
                  Antes de empacar. Si dice “lleno”, busca otro: llevarle más
                  solo le quita tiempo a los voluntarios.
                </Paso>
                <Paso n={3} titulo="Confirma y ayuda al siguiente">
                  Al volver, marca si seguía abierto. Con tres confirmaciones el
                  punto queda verificado para los demás.
                </Paso>
              </ol>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-semibold">
                <Smartphone size={18} className="text-[var(--primario)]" aria-hidden />
                Si administras un punto
              </h3>
              <ol className="mt-3 space-y-3">
                <Paso n={1} titulo="Publícalo en menos de un minuto">
                  Buscas la dirección o marcas el punto con el GPS del celular.
                  Sin crear cuenta ni contraseña.
                </Paso>
                <Paso n={2} titulo="Recibes un enlace privado">
                  Guárdalo en favoritos o mándalo por WhatsApp a tu equipo. Ese
                  enlace es la llave para actualizar el punto.
                </Paso>
                <Paso n={3} titulo="Actualiza cuando cambie algo">
                  Marca “lleno” cuando ya no den abasto o cambia lo que
                  necesitan. Toma dos toques y evita viajes en vano.
                </Paso>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── Advertencia de fraude ─────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--peligro)]/25 bg-[var(--peligro-fondo)] p-6 sm:flex-row sm:items-start">
          <ShieldAlert size={28} className="shrink-0 text-[var(--peligro)]" aria-hidden />
          <div>
            <h2 className="text-lg font-bold text-[var(--peligro)]">
              Aquí nunca se pide dinero
            </h2>
            <p className="mt-1.5 text-sm text-pretty">
              AcopioYa no publica cuentas bancarias, ni Nequi, ni códigos QR de
              pago, y jamás lo hará. Es una decisión de diseño: la estafa más
              común tras un desastre es alguien recaudando plata a nombre de una
              causa real. Si ves a alguien pedir dinero diciendo que representa a
              este sitio, es un fraude.
            </p>
            <p className="mt-2 text-sm">
              Para donar en efectivo, usa solo los canales oficiales de la{" "}
              <strong>Cruz Roja Colombiana</strong> y la <strong>UNGRD</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Cierre ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-balance">
            ¿Conoces un punto que no está en el mapa?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-[var(--texto-suave)] text-pretty">
            Publicarlo toma menos de un minuto y queda visible al instante para
            quien esté buscando dónde llevar sus donaciones.
          </p>
          <Link
            href="/reportar"
            className="presionable mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primario)] px-5 py-3.5 font-semibold text-[var(--sobre-primario)] shadow-[var(--sombra-2)]"
          >
            Publicar un punto
            <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}

function Camino({
  href, Icono, titulo, detalle, destacado = false,
}: {
  href: string;
  Icono: React.ComponentType<{ size?: number; className?: string }>;
  titulo: string;
  detalle: string;
  destacado?: boolean;
}) {
  return (
    <Link
      href={href}
      className="presionable group flex flex-col rounded-2xl border-2 p-4 shadow-[var(--sombra-1)]"
      style={{
        borderColor: destacado ? "var(--primario)" : "var(--borde)",
        background: destacado ? "var(--primario-fondo)" : "var(--superficie)",
      }}
    >
      <Icono
        size={22}
        className={destacado ? "text-[var(--primario-fuerte)]" : "text-[var(--texto-suave)]"}
      />
      <span className="mt-2.5 font-semibold">{titulo}</span>
      <span className="mt-0.5 text-sm text-[var(--texto-suave)] text-pretty">{detalle}</span>
      <ArrowRight
        size={16}
        className="mt-2 text-[var(--texto-suave)] transition-transform duration-200 group-hover:translate-x-1"
        aria-hidden
      />
    </Link>
  );
}

function Cifra({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  // flex-col-reverse: el DOM mantiene el orden dt→dd que exige <dl>, pero
  // visualmente la cifra queda arriba. Sin esto el lector de pantalla
  // repetiria la etiqueta dos veces.
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-sm text-[var(--texto-suave)]">{etiqueta}</dt>
      <dd className="tabular text-3xl font-bold text-[var(--primario)]">{valor}</dd>
    </div>
  );
}

function Tarjeta({
  Icono, color, titulo, texto,
}: {
  Icono: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  color: string;
  titulo: string;
  texto: string;
}) {
  return (
    <article className="rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-5 shadow-[var(--sombra-1)]">
      <Icono size={22} style={{ color }} aria-hidden />
      <h3 className="mt-3 font-semibold">{titulo}</h3>
      <p className="mt-1.5 text-sm text-[var(--texto-suave)] text-pretty">{texto}</p>
    </article>
  );
}

function Paso({
  n, titulo, children,
}: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="tabular grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--primario-fondo)] text-sm font-bold text-[var(--primario-fuerte)]">
        {n}
      </span>
      <span>
        <strong className="block text-sm">{titulo}</strong>
        <span className="text-sm text-[var(--texto-suave)] text-pretty">{children}</span>
      </span>
    </li>
  );
}
