import {
  Ambulance, Baby, Bath, Bone, Bus, Construction, Droplet, HandHeart,
  HardHat, Home, Package, Pill, Plug, Shovel, Tent, Users,
  type LucideIcon,
} from "lucide-react";

export type TipoSolicitud = "familia" | "comunidad" | "institucion";
export type Urgencia = "critica" | "alta" | "normal";
export type EstadoSolicitud = "abierta" | "parcial" | "cubierta";

export type Solicitud = {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoSolicitud;
  departamento: string;
  municipio: string;
  barrio_vereda: string;
  lat: number;
  lng: number;
  personas: number | null;
  necesita: string[];
  urgencia: Urgencia;
  estado: EstadoSolicitud;
  telefono_publico: string | null;
  foto_url: string | null;
  verificacion: string;
  confirmaciones: number;
  creado: string;
  actualizado: string;
  frescura: "fresco" | "dudoso" | "viejo";
};

/** Espejo de la tabla `necesidades`. Cerrado, como el catálogo de insumos. */
export const NECESIDADES: { id: string; nombre: string; Icono: LucideIcon }[] = [
  { id: "agua_potable", nombre: "Agua potable", Icono: Droplet },
  { id: "alimentos", nombre: "Alimentos", Icono: Package },
  { id: "alojamiento_temporal", nombre: "Alojamiento temporal", Icono: Home },
  { id: "carpas_colchonetas", nombre: "Carpas y colchonetas", Icono: Tent },
  { id: "materiales_construccion", nombre: "Materiales de construcción", Icono: Construction },
  { id: "remocion_escombros", nombre: "Remoción de escombros", Icono: Shovel },
  { id: "maquinaria_pesada", nombre: "Maquinaria pesada", Icono: HardHat },
  { id: "transporte", nombre: "Transporte", Icono: Bus },
  { id: "atencion_medica", nombre: "Atención médica", Icono: Ambulance },
  { id: "medicamentos", nombre: "Medicamentos", Icono: Pill },
  { id: "apoyo_psicosocial", nombre: "Apoyo psicosocial", Icono: HandHeart },
  { id: "aseo_higiene", nombre: "Aseo e higiene", Icono: Bath },
  { id: "panales_bebe", nombre: "Pañales y cuidado infantil", Icono: Baby },
  { id: "alimento_animales", nombre: "Alimento para animales", Icono: Bone },
  { id: "energia_conectividad", nombre: "Energía y conectividad", Icono: Plug },
  { id: "voluntarios", nombre: "Voluntarios", Icono: Users },
];

const POR_ID = Object.fromEntries(NECESIDADES.map((n) => [n.id, n]));

export function nombreNecesidad(id: string) {
  return POR_ID[id]?.nombre ?? id;
}

export function iconoNecesidad(id: string): LucideIcon | null {
  return POR_ID[id]?.Icono ?? null;
}

export const TIPOS: { id: TipoSolicitud; nombre: string; detalle: string; Icono: LucideIcon }[] = [
  { id: "familia", nombre: "Una familia", detalle: "Un hogar afectado", Icono: Home },
  { id: "comunidad", nombre: "Una comunidad", detalle: "Barrio, vereda o resguardo", Icono: Users },
  { id: "institucion", nombre: "Una institución", detalle: "Escuela, puesto de salud, refugio", Icono: Construction },
];

/**
 * La urgencia lleva SIEMPRE icono y texto, nunca solo color: quien no
 * distingue el rojo del ámbar tiene el mismo derecho a saber qué es crítico.
 */
export const URGENCIAS: Record<Urgencia, { nombre: string; color: string; fondo: string }> = {
  critica: { nombre: "Crítica", color: "var(--peligro)", fondo: "var(--peligro-fondo)" },
  alta: { nombre: "Alta", color: "var(--acento)", fondo: "var(--acento-fondo)" },
  normal: { nombre: "Normal", color: "var(--info)", fondo: "var(--info-fondo)" },
};

export const ESTADOS: Record<EstadoSolicitud, { nombre: string; detalle: string }> = {
  abierta: { nombre: "Abierta", detalle: "Todavía necesitan ayuda" },
  parcial: { nombre: "Parcialmente cubierta", detalle: "Ya llegó parte de lo que pedían" },
  cubierta: { nombre: "Cubierta", detalle: "Ya no necesitan más por ahora" },
};
