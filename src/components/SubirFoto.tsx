"use client";

import { useState } from "react";
import { Camera, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { comprimirImagen } from "@/lib/comprimirImagen";

/**
 * La imagen se comprime en el dispositivo y va directo al Storage de Supabase,
 * sin pasar por el servidor de Next: menos latencia con mala red y nada que
 * escalar en un pico de trafico.
 * `capture="environment"` abre la camara trasera directamente en movil.
 */
export function SubirFoto({
  onSubida,
  etiqueta = "Tomar o subir foto",
  ayuda,
}: {
  onSubida: (url: string | null) => void;
  etiqueta?: string;
  ayuda?: string;
}) {
  const [estado, setEstado] = useState<"vacio" | "trabajando" | "listo" | "error">("vacio");
  const [paso, setPaso] = useState("");
  const [previa, setPrevia] = useState<string | null>(null);
  const [ahorro, setAhorro] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function manejar(archivo: File | undefined) {
    if (!archivo) return;

    setEstado("trabajando");
    setError("");
    setPaso("Optimizando la foto…");

    const { archivo: listo, bytesOriginal, bytesFinal } = await comprimirImagen(archivo);

    if (listo.size > 5 * 1024 * 1024) {
      setEstado("error");
      setError("La foto sigue pesando más de 5 MB. Intenta con menor resolución.");
      onSubida(null);
      return;
    }

    setPaso("Subiendo…");
    const ext = listo.type === "image/webp" ? "webp" : listo.type === "image/jpeg" ? "jpg" : "bin";
    const ruta = `${crypto.randomUUID()}.${ext}`;

    const { error: err } = await supabase.storage
      .from("fotos")
      .upload(ruta, listo, { cacheControl: "31536000", upsert: false, contentType: listo.type });

    if (err) {
      setEstado("error");
      setError("No se pudo subir la foto. Puedes continuar sin ella.");
      onSubida(null);
      return;
    }

    const { data } = supabase.storage.from("fotos").getPublicUrl(ruta);
    setPrevia(URL.createObjectURL(listo));
    if (bytesFinal < bytesOriginal) {
      setAhorro(
        `${(bytesOriginal / 1048576).toFixed(1)} MB → ${(bytesFinal / 1024).toFixed(0)} KB`
      );
    }
    setEstado("listo");
    onSubida(data.publicUrl);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{etiqueta}</label>
      {ayuda && <p className="text-xs text-[var(--texto-suave)] text-pretty">{ayuda}</p>}

      <label className="presionable flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-xl border border-[var(--borde-fuerte)] bg-[var(--superficie)] px-3.5 text-sm font-semibold">
        <Camera size={16} aria-hidden />
        {estado === "listo" ? "Cambiar foto" : "Tomar o elegir foto"}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => manejar(e.target.files?.[0])}
          className="sr-only"
        />
      </label>

      {estado === "trabajando" && (
        <p className="flex items-center gap-2 text-sm text-[var(--texto-suave)]">
          <Loader2 size={15} className="animate-spin" aria-hidden />
          {paso}
        </p>
      )}

      {estado === "listo" && previa && (
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previa} alt="Vista previa" className="h-16 w-16 rounded-xl object-cover" />
          <span className="text-sm">
            <span className="flex items-center gap-1.5 font-medium text-[var(--primario-fuerte)]">
              <CheckCircle2 size={15} aria-hidden />
              Foto lista
            </span>
            {ahorro && (
              <span className="tabular text-xs text-[var(--texto-suave)]">
                Comprimida: {ahorro}
              </span>
            )}
          </span>
        </div>
      )}

      {estado === "error" && (
        <p role="alert" className="text-sm text-[var(--peligro)]">{error}</p>
      )}
    </div>
  );
}
