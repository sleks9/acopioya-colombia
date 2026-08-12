import {
  Droplet, Package, Sparkles, SprayCan, Baby, Shirt, BedDouble,
  Pill, Cross, Wrench, PawPrint, HandHeart,
  type LucideIcon,
} from "lucide-react";

export type Estado = "abierto" | "lleno" | "cerrado";
export type Verificacion = "oficial" | "verificado" | "sin_verificar";
export type Frescura = "fresco" | "dudoso" | "viejo";
export type TipoOperador = "oficial" | "ong" | "empresa" | "ciudadano";
export type Precision = "gps" | "manual" | "geocodificada" | "aproximada";

export type Centro = {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  lat: number;
  lng: number;
  precision: Precision;
  precision_metros: number | null;
  operador: string | null;
  tipo_operador: TipoOperador;
  horario: string | null;
  telefono_publico: string | null;
  estado: Estado;
  necesita: string[];
  no_necesita: string[];
  notas: string | null;
  verificacion: Verificacion;
  foto_url: string | null;
  confirmaciones: number;
  reportes_negativos: number;
  creado: string;
  actualizado: string;
  frescura: Frescura;
};

/**
 * Catalogo cerrado, espejo de la tabla `insumos`. Lista fija a proposito: con
 * texto libre no se puede filtrar ni construir el "que NO llevar".
 * Iconos vectoriales, nunca emoji: el emoji cambia de forma segun el sistema
 * y no se puede teñir con los tokens del tema.
 */
export const INSUMOS: { id: string; nombre: string; Icono: LucideIcon }[] = [
  { id: "agua", nombre: "Agua potable", Icono: Droplet },
  { id: "alimentos_no_perecederos", nombre: "Alimentos no perecederos", Icono: Package },
  { id: "aseo_personal", nombre: "Aseo personal", Icono: Sparkles },
  { id: "aseo_hogar", nombre: "Aseo del hogar", Icono: SprayCan },
  { id: "panales", nombre: "Pañales", Icono: Baby },
  { id: "ropa", nombre: "Ropa", Icono: Shirt },
  { id: "cobijas_colchonetas", nombre: "Cobijas y colchonetas", Icono: BedDouble },
  { id: "medicamentos", nombre: "Medicamentos", Icono: Pill },
  { id: "insumos_medicos", nombre: "Insumos médicos", Icono: Cross },
  { id: "herramientas", nombre: "Herramientas", Icono: Wrench },
  { id: "alimento_mascotas", nombre: "Alimento para mascotas", Icono: PawPrint },
  { id: "voluntarios", nombre: "Voluntarios", Icono: HandHeart },
];

export const INSUMOS_POR_ID = Object.fromEntries(INSUMOS.map((i) => [i.id, i]));

export function nombreInsumo(id: string) {
  return INSUMOS_POR_ID[id]?.nombre ?? id;
}

export const ETIQUETA_ESTADO: Record<Estado, string> = {
  abierto: "Abierto",
  lleno: "Lleno — no llevar más",
  cerrado: "Cerrado",
};

export const ETIQUETA_VERIFICACION: Record<Verificacion, string> = {
  oficial: "Fuente oficial",
  verificado: "Verificado",
  sin_verificar: "Sin verificar",
};

export const ETIQUETA_FRESCURA: Record<Frescura, string> = {
  fresco: "Actualizado hace poco",
  dudoso: "Posiblemente desactualizado",
  viejo: "Sin actualizar hace más de un día",
};

/**
 * Un pin equivocado manda gente al lugar equivocado. La interfaz dice de dónde
 * salió cada coordenada en vez de fingir que todas valen lo mismo.
 */
export const ETIQUETA_PRECISION: Record<Precision, { corta: string; larga: string; fiable: boolean }> = {
  gps: {
    corta: "Ubicación exacta",
    larga: "Tomada con el GPS de un celular en el sitio.",
    fiable: true,
  },
  manual: {
    corta: "Ubicación marcada",
    larga: "Alguien marcó este punto sobre el mapa.",
    fiable: true,
  },
  geocodificada: {
    corta: "Ubicación confirmada",
    larga: "Dos fuentes independientes coinciden en este punto.",
    fiable: true,
  },
  aproximada: {
    corta: "Ubicación aproximada",
    larga:
      "El pin es una estimación y puede estar a varias cuadras. La dirección escrita es la fuente confiable: verifícala antes de salir.",
    fiable: false,
  },
};

/**
 * Reescribe la URL de Supabase Storage hacia nuestro proxy con caché de un año.
 * Evita que cada visitante nuevo consuma transferencia de Supabase.
 * Si la URL no es de Storage (o no reconoce el formato), se deja intacta.
 */
export function urlFoto(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/storage\/v1\/object\/public\/fotos\/([^/?#]+)$/);
  return m ? `/api/foto/${m[1]}` : url;
}

/** Texto relativo en español, sin dependencias externas. */
export function haceCuanto(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "hace 1 día" : `hace ${d} días`;
}

/** Distancia en km entre dos puntos (Haversine). Para ordenar "cerca de mí". */
export function distanciaKm(
  aLat: number, aLng: number, bLat: number, bLng: number
): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
