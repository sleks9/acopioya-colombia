import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Heart, MapPin, Plus } from "lucide-react";
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

            <nav className="ml-2 hidden gap-1 sm:flex" aria-label="Principal">
              <Link
                href="/mapa"
                className="presionable rounded-lg px-3 py-2 text-sm font-medium text-[var(--texto-suave)] hover:text-[var(--texto)]"
              >
                Ver el mapa
              </Link>
              <Link
                href="/como-funciona"
                className="presionable rounded-lg px-3 py-2 text-sm font-medium text-[var(--texto-suave)] hover:text-[var(--texto)]"
              >
                Cómo funciona
              </Link>
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

        <main id="contenido" className="flex-1">
          {children}
        </main>

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
                  <li><Link href="/mapa" className="hover:underline">Ver el mapa</Link></li>
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
              <p className="flex items-center gap-1.5 pt-1">
                Hecho con
                <Heart size={12} className="text-[var(--peligro)]" aria-label="cariño" />
                por{" "}
                <strong className="text-[var(--texto)]">Santiago Rios Morales (Sleks)</strong>
                {" "}· Datos bajo licencia CC BY 4.0
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
