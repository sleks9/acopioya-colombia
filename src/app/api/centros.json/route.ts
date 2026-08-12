import { obtenerCentros } from "@/lib/datos";

export const revalidate = 60;

/**
 * Datos abiertos con CORS. Es deliberado y estrategico: que El Tiempo, Infobae
 * o una alcaldia puedan consumir este feed en vez de mantener su propia lista
 * estatica es la via mas barata para que la informacion deje de fragmentarse.
 */
export async function GET() {
  const centros = await obtenerCentros(true);

  return Response.json(
    {
      licencia: "CC BY 4.0 — atribución a AcopioYa",
      generado: new Date().toISOString(),
      nota: "El campo 'frescura' indica si el dato sigue siendo confiable: fresco (<8h), dudoso (8-24h), viejo (>24h).",
      total: centros.length,
      centros,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
