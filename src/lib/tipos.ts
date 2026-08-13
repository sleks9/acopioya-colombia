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
  /**
   * Jornada puntual: "el sábado 16 de 3 a 6 estamos en el parque".
   *
   * El `horario` describe la rutina semanal y no sabe decir "este sábado".
   * Mientras haya una jornada por delante el punto no caduca, porque si no
   * desaparecería del mapa antes de llegar el día que anuncia.
   */
  jornada_inicio: string | null;
  jornada_fin: string | null;
};

/** ¿Tiene una jornada anunciada que todavía no ha terminado? */
export function jornadaVigente(c: Pick<Centro, "jornada_inicio" | "jornada_fin">) {
  if (!c.jornada_inicio || !c.jornada_fin) return null;
  const fin = new Date(c.jornada_fin);
  if (fin.getTime() < Date.now()) return null;
  return { inicio: new Date(c.jornada_inicio), fin, enCurso: new Date(c.jornada_inicio) <= new Date() };
}

/**
 * "Sábado 16 de agosto, 3:00 p.m. a 6:00 p.m." en hora de Colombia.
 *
 * Se fuerza la zona porque una jornada de Quibdó empieza a las 3 de Colombia
 * aunque la consulten desde Madrid.
 */
export function textoJornada(inicio: Date, fin: Date): string {
  const dia = new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(inicio);
  const hora = (d: Date) =>
    new Intl.DateTimeFormat("es-CO", {
      timeZone: "America/Bogota",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  const capitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);
  return `${capitalizado}, ${hora(inicio)} a ${hora(fin)}`;
}

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
  viejo: "Sin actualizar hace días",
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

/**
 * ¿Está abierto AHORA, según su horario publicado?
 *
 * Devuelve null cuando no se puede saber: sin horario, o escrito en un formato
 * que no se reconoce. Es deliberado —"no sé" y "está cerrado" son cosas
 * distintas, y afirmar cualquiera de las dos sin fundamento es justo lo que
 * esta plataforma existe para evitar.
 *
 * Se calcula en hora de Colombia, no en la del servidor ni la del visitante:
 * un punto de Quibdó abre a las 8 de Colombia aunque lo consulten desde Madrid.
 */
export function abiertoAhora(horario: string | null): boolean | null {
  if (!horario) return null;
  const h = horario.toLowerCase();

  const ahora = new Date();
  // en-CA da AAAA-MM-DD y hora de 24 h, fáciles de partir.
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const partes = Object.fromEntries(
    fmt.formatToParts(ahora).map((p) => [p.type, p.value])
  );
  const diaCorto = String(partes.weekday ?? "").toLowerCase().slice(0, 3);
  const minutosAhora = Number(partes.hour) * 60 + Number(partes.minute);

  const DIAS: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  const hoy = DIAS[diaCorto];
  if (hoy === undefined) return null;

  // ── Qué días atiende ──
  // "Abierto 24 horas" a secas no nombra dias: se entiende como todos, y se
  // resuelve antes de exigirlos. Varios puntos sembrados vienen escritos asi.
  const veinticuatro = h.includes("24 horas");

  let dias: number[] | null = null;
  if (h.includes("todos los días") || h.includes("todos los dias")) dias = [0, 1, 2, 3, 4, 5, 6];
  else if (h.includes("lunes a domingo")) dias = [0, 1, 2, 3, 4, 5, 6];
  else if (h.includes("lunes a sábado") || h.includes("lunes a sabado")) dias = [1, 2, 3, 4, 5, 6];
  else if (h.includes("lunes a viernes")) dias = [1, 2, 3, 4, 5];
  else {
    const sueltos: [string, number][] = [
      ["domingo", 0], ["lunes", 1], ["martes", 2], ["miércoles", 3],
      ["miercoles", 3], ["jueves", 4], ["viernes", 5], ["sábado", 6], ["sabado", 6],
    ];
    const hallados = sueltos.filter(([n]) => h.includes(n)).map(([, d]) => d);
    if (hallados.length) dias = [...new Set(hallados)];
  }
  if (!dias) return veinticuatro ? true : null;
  if (!dias.includes(hoy)) return false;

  // ── En qué franja ──
  if (veinticuatro) return true;

  // "8:00 a.m. a 6:00 p.m." y variantes con o sin minutos.
  const rango = h.match(
    /(\d{1,2})(?::(\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?)\s*(?:a|-|hasta)\s*(\d{1,2})(?::(\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?)/
  );
  if (!rango) return null;

  const aMinutos = (hh: string, mm: string | undefined, sufijo: string) => {
    let n = parseInt(hh, 10) % 12;
    if (sufijo.replace(/[.\s]/g, "").startsWith("pm")) n += 12;
    return n * 60 + (mm ? parseInt(mm, 10) : 0);
  };

  const desde = aMinutos(rango[1], rango[2], rango[3]);
  const hasta = aMinutos(rango[4], rango[5], rango[6]);

  // Franja que cruza la medianoche (por ejemplo 8 p.m. a 2 a.m.).
  if (hasta <= desde) return minutosAhora >= desde || minutosAhora < hasta;
  return minutosAhora >= desde && minutosAhora < hasta;
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
