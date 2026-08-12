"use client";

/**
 * Guarda en el navegador los enlaces magicos de los puntos que administras.
 *
 * El sistema no tiene cuentas a proposito: pedir registro en una emergencia
 * pierde a la mitad de la gente. El costo de esa decision es que el enlace
 * magico es lo unico que existe, y quien lo pierde se queda sin poder
 * actualizar su punto.
 *
 * Esto es la red de seguridad: el navegador recuerda los puntos creados o
 * abiertos desde el, para volver a ellos sin depender de haber guardado la URL.
 * No sustituye al enlace (si cambias de dispositivo o borras datos, se pierde),
 * por eso la interfaz sigue insistiendo en guardarlo aparte.
 */

const CLAVE = "acopioya:mis-puntos";

export type PuntoGuardado = {
  id: string;
  nombre: string;
  token: string;
  guardado: string;
};

export function leerMisPuntos(): PuntoGuardado[] {
  if (typeof window === "undefined") return [];
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return [];
    const datos = JSON.parse(crudo);
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

export function guardarMiPunto(p: Omit<PuntoGuardado, "guardado">) {
  if (typeof window === "undefined") return;
  try {
    const previos = leerMisPuntos().filter((x) => x.token !== p.token);
    const lista = [{ ...p, guardado: new Date().toISOString() }, ...previos].slice(0, 20);
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    // Modo incognito o almacenamiento lleno: no es critico, se sigue sin esto.
  }
}

export function olvidarMiPunto(token: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CLAVE,
      JSON.stringify(leerMisPuntos().filter((x) => x.token !== token))
    );
  } catch {
    /* sin consecuencias */
  }
}
