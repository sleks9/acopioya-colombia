# AcopioYa

Directorio vivo de centros de acopio tras el terremoto M7.4 del 10 de agosto de
2026 (epicentro: San José del Palmar, Chocó).

Lo que existe hoy son listas estáticas de prensa: direcciones publicadas el día 1
que siguen mandando gente el día 6 a puntos que ya cerraron o que están
desbordados. Esto es lo mismo, pero vivo.

Creado por **Santiago Ríos Morales (Sleks)** — Tulua, Colombia.
[@sleks_92](https://www.instagram.com/sleks_92/) · sleks.dev@gmail.com

> El código es MIT y los datos CC BY 4.0: reutilízalos para responder a otro
> desastre sin pedir permiso. Lo único que piden ambas licencias es la
> atribución.

## Qué lo hace distinto

- **Estado por punto**: abierto / lleno / cerrado.
- **"Qué NO llevar"** — el dato de mayor valor humanitario y el que nadie
  publica. Evita la avalancha de ropa usada que tapa bodegas y quema voluntarios.
- **Frescura automática**: a las 8 h un punto se marca dudoso, a las 24 h sale
  del mapa. Sin que nadie intervenga.
- **Honestidad sobre la ubicación**: cada punto dice si su coordenada es exacta,
  marcada a mano o solo aproximada.
- **Reportar toma <60 s** desde el celular, sin cuenta ni contraseña.

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Landing: qué es, qué problema resuelve, cómo funciona |
| `/mapa` | El directorio: buscador, filtros, mapa y lista |
| `/centro/[id]` | Ficha de un punto + botones de confirmación |
| `/reportar` | Publicar un punto nuevo |
| `/p/[token]` | Panel del encargado (enlace mágico, sin login) |
| `/como-funciona` | Las reglas del sistema, explicadas |
| `/terminos`, `/privacidad` | Legal |
| `/api/centros.json` | Datos abiertos con CORS, CC BY 4.0 |
| `/api/tarjeta/[tipo]/[id]` | La ficha como imagen compartible, en tres formatos |

## Arquitectura

Next.js 16 (App Router) · Supabase (Postgres) · MapLibre + OpenFreeMap ·
Tailwind v4 · Vercel.

**Toda la seguridad vive en Postgres**, no en el cliente. La llave publicable es
pública por diseño; el rol anónimo solo puede leer la vista `centros_publicos` y
llamar cinco funciones `security definer`. No tiene INSERT, UPDATE ni DELETE
directo sobre ninguna tabla.

## El problema de las coordenadas (importante)

Las direcciones de los puntos sembrados vienen de fuentes oficiales, pero las
coordenadas iniciales eran estimaciones. Se verificaron contra Nominatim
(OpenStreetMap) y el resultado fue contundente:

| Desviación entre las dos fuentes | Puntos |
|---|---|
| ≤ 150 m (concuerdan) | 4 |
| 150–800 m | 8 |
| > 800 m | 11 |
| Sin resultado en OSM | 2 |

La peor discrepancia fue de **7,4 km**. Cuando dos fuentes independientes
difieren así, no hay forma de saber cuál acierta sin ir al lugar — y eso incluye
a Google: ningún geocodificador resuelve solo la nomenclatura colombiana.

**Cómo se resolvió:** la concordancia entre fuentes es la señal de confianza.
Los 4 puntos que coinciden quedaron como `geocodificada`; los otros 21 siguen
marcados `aproximada`, con insignia visible, aviso en la ficha y un marcador
punteado en el mapa. El texto es explícito: *la dirección escrita es la fuente
confiable, el pin solo orienta*.

Cuando el encargado actualiza su punto desde el celular, la ubicación pasa a
`gps` y el aviso desaparece solo.

### Procedencias

| Valor | Significa |
|---|---|
| `gps` | Tomada del dispositivo en el sitio (guarda la exactitud en metros) |
| `manual` | Alguien movió el mapa hasta el punto |
| `geocodificada` | Salió del buscador de direcciones |
| `aproximada` | Estimada en la siembra; requiere verificación. **Solo la puede asignar el servidor** |

## Elegir ubicación al reportar

Tres caminos hacia la misma coordenada, porque en emergencia cualquiera falla:

1. **"Estoy en el lugar ahora"** — GPS del dispositivo, guardando la exactitud
   en metros. Es lo más preciso y **no descarga el mapa**.
2. **Buscar la dirección** — autocompletado con Photon; si no responde en 4 s,
   cae a Nominatim en la búsqueda explícita (Enter o botón). Nominatim nunca se
   usa para autocompletar: su política de uso lo desaconseja. Tampoco necesita
   el mapa.
3. **Ajustar el pin en el mapa** — el pin queda fijo al centro y se mueve el
   mapa debajo (patrón de Uber/inDrive). Más preciso que tocar con el dedo, que
   tapa justo lo que apuntas.

**El mapa solo se descarga si se pide.** MapLibre pesa 1 MB; con la carga
diferida, `/reportar` arranca en ~874 KB en vez de ~1,9 MB. La mayoría resuelve
con el GPS en dos toques y nunca lo baja. Si el chunk falla, se muestra un aviso
que empuja a las otras dos opciones, en vez de quedarse en «Cargando…» para
siempre.

## Departamentos y municipios

División político-administrativa oficial del DANE (DIVIPOLA): **33
departamentos y 1.122 municipios** georreferenciados, en `src/lib/divipola.json`
(51 KB, importado solo por `/reportar`).

- El formulario usa selectores en cascada: al elegir departamento se filtran sus
  municipios, y la cabecera municipal centra el mapa si se abre.
- La validación se repite **en la base de datos**, no solo en el formulario: la
  RPC `crear_centro` está expuesta por PostgREST y cualquiera puede llamarla con
  la llave pública. `municipio_valido()` rechaza municipios inventados y pares
  departamento/municipio incorrectos.
- La comparación ignora tildes y mayúsculas, y **guarda la grafía oficial**: si
  llega `"san jose del palmar" / "choco"`, se almacena
  `"San José del Palmar" / "Chocó"`. Así el filtro por ciudad no se parte entre
  variantes del mismo lugar.
- Se usan los nombres de uso corriente donde el registro oficial se aparta de
  ellos: `Santiago de Cali` → **Cali**, `Cartagena de Indias` → **Cartagena**,
  `Bogotá, D.C.` → **Bogotá**.

## Auto-moderación

La restricción de diseño es que **modera una sola persona**. Nada puede depender
de que alguien reaccione a tiempo.

| Regla | Efecto |
|---|---|
| 3 confirmaciones | `sin_verificar` → `verificado` |
| 3 reportes negativos | `sin_verificar` → `oculto` (los `oficial` nunca se ocultan) |
| El encargado edita su ficha | `sin_verificar` → `verificado` |
| 1 voto por IP, por punto, cada 6 h | corta el voto masivo |
| Máx. 5 reportes por IP por hora | corta el spam de creación |

Las IP nunca se guardan en claro, solo un hash con sal (`IP_SALT`).

## Diseño

Sistema **Trust & Authority** sobre patrón de directorio: la procedencia y el
estado de cada dato son el elemento visual principal, no la decoración.

- Iconos vectoriales (Lucide), **cero emojis** como iconos estructurales.
- Tokens semánticos en CSS, claro y oscuro definidos por separado.
- Objetivos táctiles ≥ 44 px, foco visible, `aria-live` en resultados y errores.
- Animaciones ≤ 320 ms con curvas fuertes (`cubic-bezier(0.23,1,0.32,1)`),
  `scale(0.97)` al presionar, y `prefers-reduced-motion` respetado.

## Tarjetas compartibles

En Colombia la difusión de emergencia no ocurre por enlaces: ocurre por
**imágenes reenviadas** en grupos y estados de WhatsApp. Un enlace se pierde en
la conversación; una imagen se reenvía sola. Cualquier ficha se exporta como
imagen desde `/api/tarjeta/{tipo}/{id}?formato=…`, en tres lienzos:

| Formato | Tamaño | Para qué |
|---|---|---|
| `historia` | 1080×1920 | Estado de WhatsApp, historias de Instagram y Facebook |
| `feed` | 1080×1350 | Feed de Instagram y reenvío en grupos |
| `enlace` | 1200×630 | Se genera sola al pegar el enlace en un chat |

El mismo endpoint alimenta `openGraph.images`, así que **los puntos sin foto
pasaron a tener vista previa**: antes se usaba la foto cruda del usuario y, sin
ella, no había imagen ninguna.

### Una imagen reenviada es un dato muerto

Es el problema que trae la idea: el PNG va a seguir circulando cuando el punto
ya cerró — justo la patología que esta plataforma existe para corregir. Por eso
cada tarjeta lleva la **fecha y hora en que se generó** y un **QR de vuelta a la
ficha viva**, con la frase «Los datos cambian. Escanea antes de salir.» Quien
recibe el reenvío tiene cómo comprobar si sigue vigente.

Se verificó que el QR sobrevive a la recompresión de WhatsApp: sigue siendo
legible tras reescalar a 800 px y bajar la calidad JPEG a 35.

El formato `enlace` es el único sin QR, a propósito: esa imagen solo aparece
pegada *junto* al enlace, donde tocarlo es más fácil que escanear nada.

### El apaisado tiene 390 px y no perdona

`enlace` deja **390 px de alto** para todo el contenido, y ahí no hay margen
para adornos: la caja con fondo y título de «están recibiendo» se comía 128 de
ellos y empujaba el teléfono fuera del recorte, partido por la mitad. En ese
lienzo las listas van en una línea de texto con su icono y su color, no en
caja, y el titular baja de 54 a 50 px porque ocho píxeles compran una línea
entera.

Como aun así no hay garantía de que todo quepa, **el orden importa**: lo que se
recorta es lo de abajo, así que abajo va lo prescindible. En el apaisado el
teléfono se coloca *antes* de las listas — un punto sin la lista de insumos
sigue sirviendo, porque llamas y preguntas; sin el teléfono, no. La misma
lógica pone el aviso de «ubicación aproximada» arriba del todo: es una
advertencia de seguridad y no puede ser lo primero que se caiga.

### Por qué se genera en el servidor

Con `ImageResponse` de `next/og`, no con una librería de captura en el
navegador. Serían ~200 KB de JavaScript extra en un dispositivo con mala red,
para hacer peor lo que el servidor hace bien — y la vista previa del enlace
seguiría rota, porque necesita una URL.

Dos trampas que costaron sangre y quedan documentadas:

- **Satori no decodifica WebP.** No falla: devuelve la tarjeta sin la foto, con
  código 200. Como las fotos se suben en WebP siempre que el navegador pueda,
  casi todas caían en ese hueco. Se transcodifican a JPEG con `sharp` antes de
  componer (`src/lib/tarjeta/foto.ts`).
- **Satori no propaga el layout a través de fragmentos** (`<>…</>`) y encoge los
  hijos flex hasta solaparlos si no caben. De ahí el `flexShrink: 0` en todas
  las piezas y los `div` con `flexDirection` explícito.

### Peso

`ImageResponse` solo emite PNG, y una historia con foto pesa **885 KB**. La
misma tarjeta en JPEG de calidad 86 pesa **102 KB**: ocho veces y media menos,
que es la diferencia entre una imagen que carga con mala red y otra que no. Por
eso la salida es JPEG cuando hay foto y PNG cuando no —sin foto la tarjeta es
texto sobre planos de color, y ahí PNG comprime mejor y no ensucia los bordes
de las letras—. La previsualización de la hoja se pide con `?ancho=520`, y con
ahorro de datos o 2G no se descarga hasta que se pide.

## Costos y transferencia (egress)

La preocupación razonable es que un pico de tráfico agote el plan gratuito de
Supabase (5 GB de transferencia al mes). Se midió, y el resultado es que **el
tráfico normal no escala el consumo**:

| Prueba | Resultado |
|---|---|
| 120 visitas simultáneas a `/mapa` | **1 sola consulta** a Supabase |
| 30 descargas de la misma foto | **0 descargas** desde Supabase |

Por qué:

- **Las páginas se sirven desde caché.** `/`, `/mapa` y `/api/centros.json` se
  generan estáticamente y se revalidan una vez por minuto. Da igual si entran
  10 personas o 100.000: la base recibe como mucho una consulta por minuto y
  por página. El techo son unas ~90.000 consultas al mes, con respuestas de
  unos 15 KB.
- **Las fotos van por `/api/foto/[ruta]`**, no directo a Supabase, con
  `Cache-Control: immutable` a un año. El CDN la descarga una vez por región y
  responde él solo el resto. Es seguro marcarlas inmutables porque el nombre es
  un UUID que nunca se reutiliza.
- **Las fotos se comprimen en el celular** antes de subirse: 1280 px de lado
  mayor y WebP al 78%. Una foto de 4 MB queda en ~80 KB. Reduce transferencia,
  almacenamiento, y el tiempo de subida con mala red.
- **Las consultas piden columnas explícitas**, no `select *`.

Lo único que sí crece con el tráfico son las escrituras (reportes, votos), y son
diminutas: unos cientos de bytes cada una.

Si algún día hiciera falta más margen: subir la revalidación de 60 s a 120 s
duplica el techo, y mover el bucket de fotos a un CDN externo (Cloudflare R2 no
cobra egress) quitaría esa variable del todo.

## Poca señal

Condición normal en zona de desastre, tratada como requisito:

- La lista se sirve en HTML desde el servidor: **funciona sin JavaScript**.
- **Base de mapa ráster, no vectorial.** Una tesela vectorial de OpenFreeMap
  sobre Bogotá a z14 pesa 381 KB; la ráster equivalente, 31 KB. Doce veces
  menos. Además elimina tres puntos de fallo (descarga → parseo en Web Worker →
  shaders de WebGL) que dejaban el mapa en blanco sin emitir ningún error.
- Las teselas `@2x` solo se piden en pantallas retina **con buena conexión**.
- El mapa va en `dynamic(..., { ssr: false })`, aparte del paquete principal.
- Si el navegador reporta `2g`, `slow-2g` o `saveData`, **el mapa no se carga
  solo**: se avisa por qué y queda a un toque.
- Inter autoalojada con `display: swap`; sin peticiones a fuentes externas.
- Teselas de OpenFreeMap sin API key: nada que se agote en un pico de tráfico.

## Correr en local

```bash
npm run dev
```

Luego abre `http://localhost:3000`.

> **Live Server de VS Code no sirve para este proyecto.** Solo sirve archivos
> estáticos; Next.js necesita un servidor de Node que compile React y ejecute
> los Server Actions. Con Live Server solo verás el listado de carpetas.

Requiere `.env.local` con `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `IP_SALT` y `NEXT_PUBLIC_SITE_URL`.

## Pendiente antes de lanzar

1. **Verificar en terreno los 21 puntos con ubicación aproximada**, o dejar que
   sus encargados los corrijan con el enlace mágico. El sistema ya advierte, pero
   la advertencia no reemplaza el dato correcto.
2. **Cambiar `IP_SALT`** por un valor propio.
3. **Cloudflare Turnstile** en `/reportar` (el rate limit por IP ya está).
4. **Ampliar la siembra**: faltan Pereira, Manizales, Armenia, Quibdó,
   Cundinamarca, Santa Marta e Itagüí.
5. **Correo de contacto real** en `/privacidad` y `/terminos`.
6. `pg_cron` para archivar lo no actualizado en 72 h.

## Licencia

El **código** está bajo [MIT](LICENSE): puedes tomarlo, adaptarlo y desplegarlo
para responder a otro desastre sin pedir permiso. Esto es deliberado. Al buscar
el precedente venezolano de junio para reutilizarlo, su repositorio estaba
borrado y hubo que empezar de cero; si mañana tiembla en otro país, que nadie
pierda ese tiempo.

Los **datos** que expone `/api/centros.json` van bajo
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es): reutilizables
por medios, alcaldías y organizaciones citando la fuente.

## Distribución (el cuello de botella real)

El sismo de Venezuela de junio generó ~12 plataformas parecidas y ninguna
dominó. Construir el mapa es un fin de semana; que sea *el* mapa es el trabajo.

1. Ofrecer `/api/centros.json` a los periodistas de datos de El Tiempo e Infobae
   — su lista es estática y ellos saben que envejece.
2. Cruz Roja seccional, Ábaco y las oficinas de gestión del riesgo de Cali,
   Pereira, Manizales, Armenia y Quibdó.
3. **Llevarle a cada punto sembrado su enlace mágico.** Es la conversión que
   importa: convierte datos copiados de prensa en datos vivos — y de paso
   arregla las coordenadas aproximadas.
4. **Que cada encargado difunda su propio punto.** Para eso están las tarjetas
   compartibles: el alcance no depende de que la plataforma tenga audiencia,
   sino de que cada punto tenga la suya y pueda usarla en dos toques.
