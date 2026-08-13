import { Bird, Cat, Dog, PawPrint, type LucideIcon } from "lucide-react";

export type CasoMascota = "perdida" | "encontrada";
export type Especie = "perro" | "gato" | "ave" | "otro";
export type EstadoMascota = "activa" | "reunida" | "archivada";

export type Mascota = {
  id: string;
  caso: CasoMascota;
  especie: Especie;
  nombre: string | null;
  sexo: "macho" | "hembra" | "desconocido";
  tamano: "pequeno" | "mediano" | "grande";
  color: string;
  senas: string | null;
  chip_placa: string | null;
  departamento: string;
  municipio: string;
  lat: number;
  lng: number;
  fecha_suceso: string;
  foto_url: string;
  telefono_publico: string | null;
  estado: EstadoMascota;
  verificacion: string;
  confirmaciones: number;
  avisos_reunida: number;
  creado: string;
  actualizado: string;
  dias_desde: number;
};

export type Coincidencia = {
  id: string;
  caso: CasoMascota;
  especie: Especie;
  nombre: string | null;
  color: string;
  municipio: string;
  fecha_suceso: string;
  foto_url: string;
  km: number;
};

export const ESPECIES: { id: Especie; nombre: string; Icono: LucideIcon }[] = [
  { id: "perro", nombre: "Perro", Icono: Dog },
  { id: "gato", nombre: "Gato", Icono: Cat },
  { id: "ave", nombre: "Ave", Icono: Bird },
  { id: "otro", nombre: "Otro", Icono: PawPrint },
];

export const TAMANOS = [
  { id: "pequeno", nombre: "Pequeño" },
  { id: "mediano", nombre: "Mediano" },
  { id: "grande", nombre: "Grande" },
];

export const SEXOS = [
  { id: "macho", nombre: "Macho" },
  { id: "hembra", nombre: "Hembra" },
  { id: "desconocido", nombre: "No sé" },
];

export function iconoEspecie(e: Especie): LucideIcon {
  return ESPECIES.find((x) => x.id === e)?.Icono ?? PawPrint;
}

export function nombreEspecie(e: Especie): string {
  return ESPECIES.find((x) => x.id === e)?.nombre ?? "Animal";
}

/** Título legible: "Rocky" si tiene nombre, si no una descripción útil. */
export function tituloMascota(m: Pick<Mascota, "nombre" | "especie" | "color">): string {
  if (m.nombre) return m.nombre;
  return `${nombreEspecie(m.especie)} ${m.color.toLowerCase()}`;
}

/**
 * Cuánto lleva perdida. El tiempo importa mucho aquí: una mascota perdida hace
 * dos días se busca distinto que una de hace tres semanas.
 */
export function haceDias(dias: number): string {
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;
  if (dias < 14) return "hace una semana";
  if (dias < 31) return `hace ${Math.floor(dias / 7)} semanas`;
  return `hace más de un mes`;
}
