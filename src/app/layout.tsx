import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { HandHeart, MapPin, PawPrint, Plus, Users } from "lucide-react";
import { Analytics } from "@vercel/analytics/next";
import { Autoria } from "@/components/Autoria";
import "./globals.css";

// Autoalojada por next/font: sin peticion a un dominio externo y sin FOIT.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sitio = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(sitio),
  title: {
    default: "AcopioYa — Centros de acopio en Colombia",
    template: "%s · AcopioYa",
  },
  description:
    "Mapa vivo de centros de acopio tras el terremoto del 10 de agosto. Mira qué reciben, qué NO reciben y si siguen abiertos antes de salir de casa.",
  applicationName: "AcopioYa",
  authors: [{ name: "Santiago Rios Morales (Sleks)" }],
  creator: "Santiago Rios Morales (Sleks)",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "AcopioYa",
    title: "AcopioYa — Centros de acopio en Colombia",
    description:
      "Qué reciben, qué NO reciben y si siguen abiertos. Actualizado por quienes los operan.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8faf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1310" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={inter.variable}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-[var(--primario)] focus:px-4 focus:py-2 focus:font-semibold focus:text-[var(--sobre-primario)]"
        >
          Saltar al contenido
        </a>

        <header className="sticky top-0 z-30 border-b border-[var(--borde)] bg-[var(--superficie)]/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-1.5 font-bold tracking-tight">
              <MapPin size={20} className="text-[var(--primario)]" aria-hidden />
              <span className="text-lg">
                Acopio<span className="text-[var(--primario)]">Ya</span>
              </span>
            </Link>

            <nav className="ml-2 hidden gap-1 md:flex" aria-label="Principal">
              {[
                { href: "/mapa", texto: "Centros de acopio" },
                { href: "/solicitudes", texto: "Dónde hace falta" },
                { href: "/mascotas", texto: "Mascotas" },
                { href: "/buscar-personas", texto: "Personas" },
              ].map((e) => (
                <Link
                  key={e.href}
                  href={e.href}
                  className="presionable rounded-lg px-3 py-2 text-sm font-medium text-[var(--texto-suave)] hover:text-[var(--texto)]"
                >
                  {e.texto}
                </Link>
              ))}
            </nav>

            <Link
              href="/reportar"
              className="presionable ml-auto flex items-center gap-1.5 rounded-xl bg-[var(--primario)] px-3.5 py-2.5 text-sm font-semibold text-[var(--sobre-primario)] shadow-[var(--sombra-1)]"
            >
              <Plus size={16} strokeWidth={3} aria-hidden />
              Reportar punto
            </Link>
          </div>
        </header>

        <main id="contenido" className="flex-1 pb-20 md:pb-0">
          {children}
        </main>

        {/*
          Con cuatro secciones la barra superior ya no cabe en movil. Menu
          inferior, que ademas queda al alcance del pulgar: esto se consulta
          con una mano y a veces con prisa.
        */}
        <nav
          aria-label="Secciones"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--borde)] bg-[var(--superficie)]/95 backdrop-blur-md md:hidden"
        >
          <ul className="mx-auto flex max-w-lg">
            {[
              { href: "/mapa", texto: "Acopios", Icono: MapPin },
              { href: "/solicitudes", texto: "Ayuda", Icono: HandHeart },
              { href: "/mascotas", texto: "Mascotas", Icono: PawPrint },
              { href: "/buscar-personas", texto: "Personas", Icono: Users },
            ].map(({ href, texto, Icono }) => (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className="presionable flex min-h-[3.75rem] flex-col items-center justify-center gap-0.5 text-[var(--texto-suave)]"
                >
                  <Icono size={20} aria-hidden />
                  <span className="text-[11px] font-medium">{texto}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <footer className="mt-12 border-t border-[var(--borde)] bg-[var(--superficie)]">
          <div className="mx-auto max-w-6xl space-y-5 px-4 py-8">
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <p className="flex items-center gap-1.5 font-bold">
                  <MapPin size={16} className="text-[var(--primario)]" aria-hidden />
                  AcopioYa
                </p>
                <p className="mt-1 text-sm text-[var(--texto-suave)]">
                  Directorio vivo de centros de acopio. Terremoto de Colombia,
                  10 de agosto de 2026.
                </p>
              </div>

              <nav aria-label="Secciones">
                <p className="text-sm font-semibold">Navegación</p>
                <ul className="mt-1.5 space-y-1 text-sm text-[var(--texto-suave)]">
                  <li><Link href="/mapa" className="hover:underline">Centros de acopio</Link></li>
                  <li><Link href="/solicitudes" className="hover:underline">Dónde hace falta ayuda</Link></li>
                  <li><Link href="/mascotas" className="hover:underline">Mascotas perdidas</Link></li>
                  <li><Link href="/buscar-personas" className="hover:underline">Buscar a una persona</Link></li>
                  <li><Link href="/reportar" className="hover:underline">Reportar un punto</Link></li>
                  <li><Link href="/como-funciona" className="hover:underline">Cómo funciona</Link></li>
                  <li><Link href="/api/centros.json" className="hover:underline">Datos abiertos (JSON)</Link></li>
                </ul>
              </nav>

              <nav aria-label="Legal">
                <p className="text-sm font-semibold">Legal</p>
                <ul className="mt-1.5 space-y-1 text-sm text-[var(--texto-suave)]">
                  <li><Link href="/terminos" className="hover:underline">Términos y condiciones</Link></li>
                  <li><Link href="/privacidad" className="hover:underline">Privacidad y retiro</Link></li>
                </ul>
              </nav>
            </div>

            <div className="space-y-2 border-t border-[var(--borde)] pt-5 text-xs text-[var(--texto-suave)]">
              <p>
                <strong className="text-[var(--texto)]">
                  Información de origen comunitario.
                </strong>{" "}
                Confirma por teléfono antes de desplazarte. Los puntos marcados
                como oficiales provienen de alcaldías, Cruz Roja, Ábaco y SCARE.
              </p>
              <p>
                AcopioYa <strong className="text-[var(--texto)]">nunca pide ni recibe dinero</strong>{" "}
                y no publica cuentas bancarias. Para donaciones en efectivo usa
                únicamente los canales oficiales de la Cruz Roja Colombiana y la UNGRD.
              </p>
              <div className="pt-1">
                <Autoria />
                <p className="mt-2">
                  Código bajo licencia MIT · Datos bajo licencia CC BY 4.0.
                  Puedes reutilizar ambos citando la fuente.
                </p>
              </div>
            </div>
          </div>
        </footer>

        {/*
          Medición de visitas de Vercel: sin cookies y sin identificar a nadie,
          que es la única forma aceptable aquí —esta página la abre gente en
          situación vulnerable y no tiene por qué dejar rastro—. Va al final del
          body para no competir con nada por la red durante la carga.

          Pesa ~1 KB. Sirve para saber si el trabajo de difusión funciona, que
          es el cuello de botella real del proyecto: sin números no hay forma de
          saber si llegar a un periodista sirvió de algo.
        */}
        <Analytics />
      </body>
    </html>
  );
}
