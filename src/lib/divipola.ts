import datos from "./divipola.json";

/**
 * División político-administrativa de Colombia (DIVIPOLA, DANE): 33
 * departamentos y 1.122 municipios, cada uno con su cabecera georreferenciada.
 * Fuente: datos.gov.co, recurso gdxc-w37w.
 *
 * Va como archivo estático y no como tabla en la base: es una lista que no
 * cambia y que se consultaria en cada carga del formulario. Ademas se importa
 * de forma diferida, asi que solo pesa en /reportar y no en el resto del sitio.
 *
 * Las coordenadas sirven para centrar el mapa en el municipio elegido en vez de
 * arrancar mirando todo el pais.
 */

export type Municipio = { n: string; lat: number; lng: number };

const DIVIPOLA = datos as Record<string, Municipio[]>;

export const DEPARTAMENTOS = Object.keys(DIVIPOLA);

export function municipiosDe(departamento: string): Municipio[] {
  return DIVIPOLA[departamento] ?? [];
}

export function buscarMunicipio(
  departamento: string,
  municipio: string
): Municipio | null {
  const norm = (s: string) =>
    s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const objetivo = norm(municipio);
  return municipiosDe(departamento).find((m) => norm(m.n) === objetivo) ?? null;
}
