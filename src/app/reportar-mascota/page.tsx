"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  AlertCircle, ArrowRight, CheckCircle2, Copy, Loader2, MessageCircle,
} from "lucide-react";
import { reportarMascota } from "../acciones";
import { SubirFoto } from "@/components/SubirFoto";
import SelectorUbicacion, { type UbicacionElegida } from "@/components/SelectorUbicacion";
import { DEPARTAMENTOS, municipiosDe } from "@/lib/divipola";
import { ESPECIES, SEXOS, TAMANOS } from "@/lib/mascotas";
import { guardarMiPunto } from "@/lib/misPuntos";

const ENTRADA =
  "w-full min-h-11 rounded-xl border border-[var(--borde)] bg-[var(--superficie)] px-3 py-2.5 text-base";

export default function ReportarMascota() {
  const [caso, setCaso] = useState<"perdida" | "encontrada">("perdida");
  const [especie, setEspecie] = useState("perro");
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [ubicacion, setUbicacion] = useState<UbicacionElegida | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [contactoPublico, setContactoPublico] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState<{ id: string; token: string } | null>(null);

  const municipios = useMemo(() => municipiosDe(departamento), [departamento]);
  const centroSugerido = useMemo(() => {
    const m = municipios.find((x) => x.n === municipio);
    return m ? { lat: m.lat, lng: m.lng } : null;
  }, [municipios, municipio]);

  const alCambiarUbicacion = useCallback((u: UbicacionElegida) => setUbicacion(u), []);
  const hoy = new Date().toISOString().slice(0, 10);

  async function enviar(formData: FormData) {
    setError("");
    if (!fotoUrl) {
      setError("La foto es obligatoria: sin ella nadie puede reconocerlo.");
      document.getElementById("bloque-foto")?.scrollIntoView({ block: "center" });
      return;
    }
    if (!ubicacion) {
      setError("Marca dónde fue: es lo que permite cruzarlo con otros reportes.");
      document.getElementById("bloque-ubicacion")?.scrollIntoView({ block: "center" });
      return;
    }

    setEnviando(true);
    formData.set("caso", caso);
    formData.set("especie", especie);
    formData.set("foto_url", fotoUrl);
    formData.set("lat", String(ubicacion.lat));
    formData.set("lng", String(ubicacion.lng));

    const r = await reportarMascota(formData);
    setEnviando(false);
    if (r.ok) {
      guardarMiPunto({
        id: r.id,
        token: r.token,
        nombre: String(formData.get("nombre") || "Mi reporte de mascota"),
      });
      setExito({ id: r.id, token: r.token });
    } else {
      setError(r.error);
    }
  }

  if (exito) return <Exito id={exito.id} token={exito.token} />;

  const perdida = caso === "perdida";

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Reportar una mascota</h1>
        <p className="mt-1 text-sm text-[var(--texto-suave)] text-pretty">
          Si te encontraste un animal, publícalo también: el sistema cruza los
          dos lados por cercanía.
        </p>
      </header>

      <form action={enviar} className="space-y-6">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">¿Qué estás reportando?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {([
              { id: "perdida", t: "Se me perdió", d: "Busco a mi mascota", c: "var(--acento)", f: "var(--acento-fondo)" },
              { id: "encontrada", t: "Me encontré una", d: "Busco a su familia", c: "var(--primario-fuerte)", f: "var(--primario-fondo)" },
            ] as const).map((o) => {
              const activo = caso === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setCaso(o.id)}
                  aria-pressed={activo}
                  className="presionable rounded-2xl border-2 p-3 text-left"
                  style={{
                    borderColor: activo ? o.c : "var(--borde)",
                    background: activo ? o.f : "var(--superficie)",
                    color: activo ? o.c : "var(--texto)",
                  }}
                >
                  <span className="block font-semibold">{o.t}</span>
                  <span className="block text-xs text-[var(--texto-suave)]">{o.d}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div id="bloque-foto">
          <SubirFoto
            onSubida={setFotoUrl}
            etiqueta="Foto (obligatoria)"
            ayuda="Es el dato más importante: sin foto nadie puede reconocerlo."
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Especie</legend>
          <div className="flex flex-wrap gap-1.5">
            {ESPECIES.map(({ id, nombre, Icono }) => {
              const activo = especie === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setEspecie(id)}
                  aria-pressed={activo}
                  className="presionable flex min-h-11 items-center gap-1.5 rounded-xl border-2 px-3.5 text-sm"
                  style={{
                    borderColor: activo ? "var(--primario)" : "var(--borde)",
                    background: activo ? "var(--primario-fondo)" : "var(--superficie)",
                    color: activo ? "var(--primario-fuerte)" : "var(--texto)",
                    fontWeight: activo ? 600 : 400,
                  }}
                >
                  <Icono size={16} aria-hidden />
                  {nombre}
                </button>
              );
            })}
          </div>
        </fieldset>

        {perdida && (
          <Campo etiqueta="Nombre de la mascota">
            <input name="nombre" maxLength={60} placeholder="Ej: Rocky" className={ENTRADA} />
          </Campo>
        )}

        <Campo etiqueta="Color" requerido ayuda="Como lo describirías a alguien que no lo ha visto.">
          <input name="color" required minLength={2} maxLength={80}
            placeholder="Ej: café con manchas blancas" className={ENTRADA} />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Tamaño">
            <select name="tamano" defaultValue="mediano" className={ENTRADA}>
              {TAMANOS.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Sexo">
            <select name="sexo" defaultValue="desconocido" className={ENTRADA}>
              {SEXOS.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </Campo>
        </div>

        <Campo etiqueta="Señas particulares"
          ayuda="Collar, cicatriz, una oreja caída, cojera. Lo que lo distingue de otro parecido.">
          <input name="senas" maxLength={300}
            placeholder="Ej: collar rojo, mancha en la pata izquierda" className={ENTRADA} />
        </Campo>

        <Campo etiqueta="Chip o placa">
          <input name="chip_placa" maxLength={60} placeholder="Número si lo tiene" className={ENTRADA} />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Departamento" requerido>
            <select
              name="departamento" required value={departamento}
              onChange={(e) => { setDepartamento(e.target.value); setMunicipio(""); }}
              className={ENTRADA}
            >
              <option value="">Elige un departamento</option>
              {DEPARTAMENTOS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Municipio" requerido>
            <select
              name="ciudad" required value={municipio} disabled={!departamento}
              onChange={(e) => setMunicipio(e.target.value)}
              className={`${ENTRADA} disabled:opacity-50`}
            >
              <option value="">
                {departamento ? "Elige un municipio" : "Elige primero el departamento"}
              </option>
              {municipios.map((m) => <option key={m.n} value={m.n}>{m.n}</option>)}
            </select>
          </Campo>
        </div>

        <Campo etiqueta={perdida ? "¿Cuándo se perdió?" : "¿Cuándo la encontraste?"} requerido>
          <input name="fecha_suceso" type="date" required max={hoy}
            defaultValue={hoy} className={ENTRADA} />
        </Campo>

        <div id="bloque-ubicacion">
          <label className="mb-1.5 block text-sm font-medium">
            ¿Dónde fue? <span className="text-[var(--peligro)]" aria-hidden>*</span>
          </label>
          <p className="mb-2 text-xs text-[var(--texto-suave)] text-pretty">
            Esto es lo que permite cruzarlo con otros reportes cercanos. Marca el
            sitio lo más exacto que puedas.
          </p>
          <SelectorUbicacion
            centroSugerido={centroSugerido}
            municipio={municipio || undefined}
            departamento={departamento || undefined}
            onCambio={alCambiarUbicacion}
          />
        </div>

        <fieldset className="space-y-2 rounded-xl border border-[var(--borde)] p-4">
          <legend className="px-1 text-sm font-medium">Contacto</legend>
          <input name="telefono" type="tel" inputMode="tel" maxLength={40}
            autoComplete="tel" placeholder="Tu teléfono" className={ENTRADA} />
          <label className="flex items-start gap-2 text-xs text-[var(--texto-suave)]">
            <input
              type="checkbox" name="contacto_publico" className="mt-0.5 h-4 w-4 accent-[var(--primario)]"
              checked={contactoPublico}
              onChange={(e) => setContactoPublico(e.target.checked)}
            />
            <span>
              Publicar mi teléfono para que puedan avisarme. Sin esta casilla no
              se publica ni se envía (Ley 1581 de 2012), pero nadie podrá
              contactarte directamente.
            </span>
          </label>
        </fieldset>

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-xl bg-[var(--peligro-fondo)] px-3 py-2.5 text-sm text-[var(--peligro)]">
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        <button
          type="submit" disabled={enviando}
          className="presionable flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primario)] px-4 py-3.5 font-semibold text-[var(--sobre-primario)] shadow-[var(--sombra-2)] disabled:opacity-60"
        >
          {enviando && <Loader2 size={18} className="animate-spin" aria-hidden />}
          {enviando ? "Publicando…" : "Publicar reporte"}
        </button>
      </form>
    </div>
  );
}

function Campo({
  etiqueta, ayuda, requerido, children,
}: {
  etiqueta: string; ayuda?: string; requerido?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {etiqueta} {requerido && <span className="text-[var(--peligro)]" aria-hidden>*</span>}
      </label>
      {ayuda && <p className="mb-2 text-xs text-[var(--texto-suave)] text-pretty">{ayuda}</p>}
      {children}
    </div>
  );
}

function Exito({ id, token }: { id: string; token: string }) {
  const enlace =
    typeof window !== "undefined" ? `${window.location.origin}/m/${token}` : `/m/${token}`;
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
      <div className="rounded-2xl border border-[var(--primario)]/30 bg-[var(--primario-fondo)] p-5">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--primario-fuerte)]">
          <CheckCircle2 size={22} aria-hidden />
          Reporte publicado
        </h1>
        <p className="mt-1.5 text-sm">
          Ya aparece en el listado. Revisa la ficha: si hay reportes del otro
          lado cerca, se muestran ahí mismo.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-[var(--borde)] bg-[var(--superficie)] p-4">
        <h2 className="font-semibold">Guarda este enlace privado</h2>
        <p className="text-sm text-[var(--texto-suave)] text-pretty">
          Con él marcas el reporte como resuelto cuando aparezca. Se muestra una
          sola vez.
        </p>
        <code className="block break-all rounded-xl border border-[var(--borde)] bg-[var(--fondo)] p-3 text-xs">
          {enlace}
        </code>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(enlace); setCopiado(true); }}
            className="presionable flex items-center gap-1.5 rounded-xl bg-[var(--info)] px-3.5 py-2.5 text-sm font-semibold text-white"
          >
            {copiado ? <CheckCircle2 size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
            {copiado ? "Copiado" : "Copiar enlace"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Enlace para administrar mi reporte en AcopioYa: ${enlace}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="presionable flex items-center gap-1.5 rounded-xl border border-[var(--borde-fuerte)] px-3.5 py-2.5 text-sm font-semibold"
          >
            <MessageCircle size={16} aria-hidden />
            Enviar por WhatsApp
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={`/mascota/${id}`}
          className="presionable flex items-center gap-1.5 rounded-xl border border-[var(--borde-fuerte)] px-4 py-2.5 text-sm font-semibold">
          Ver el reporte <ArrowRight size={16} aria-hidden />
        </Link>
        <Link href="/mascotas"
          className="presionable rounded-xl border border-[var(--borde-fuerte)] px-4 py-2.5 text-sm font-semibold">
          Volver al listado
        </Link>
      </div>
    </div>
  );
}
