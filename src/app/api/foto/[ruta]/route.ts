const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Sirve las fotos a traves del CDN en vez de exponer Supabase directamente.
 *
 * Sin esto, cada visitante nuevo descarga la imagen desde Supabase y consume
 * el plan de transferencia. Con la cabecera `immutable` y un año de caché, el
 * CDN la pide una sola vez por region y despues responde el solo: mil visitas
 * dejan de ser mil descargas de Supabase.
 *
 * Funciona porque el nombre del archivo es un UUID que nunca se reutiliza: si
 * la foto cambia, cambia la URL. Por eso `immutable` es seguro aqui.
 */
export const revalidate = 31536000;

// Solo nombres generados por nosotros: bloquea el salto de directorios.
const NOMBRE_VALIDO = /^[0-9a-f-]{36}\.(webp|jpg|jpeg|png|heic)$/i;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ruta: string }> }
) {
  const { ruta } = await params;

  if (!BASE || !NOMBRE_VALIDO.test(ruta)) {
    return new Response("No encontrada", { status: 404 });
  }

  const origen = `${BASE}/storage/v1/object/public/fotos/${ruta}`;

  const r = await fetch(origen, {
    // El CDN de Next guarda la respuesta; Supabase se consulta una vez.
    next: { revalidate: 31536000 },
  });

  if (!r.ok) return new Response("No encontrada", { status: 404 });

  return new Response(r.body, {
    headers: {
      "Content-Type": r.headers.get("content-type") ?? "image/webp",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
