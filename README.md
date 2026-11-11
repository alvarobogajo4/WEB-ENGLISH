# English 20 Minutes · C1 Executive

PWA de 20 minutos diarios para pasar de **inglés intermedio (B2) a C1 ejecutivo**. Está pensada para profesionales hispanohablantes en multinacionales que buscan un ascenso: estrategia, finanzas, operaciones, datos y gestión de stakeholders.

No incluye teoría. Cada minuto es práctica con **bloques léxicos** (Lexical Approach) y **repetición espaciada**.

## La sesión diaria

| Bloque | Min | Qué entrenas | Formato |
|---|---|---|---|
| **1 · Upgrade de Registro** | 01–05 | Sustituir frases planas por chunks ejecutivos | Elegir la versión C1 entre 3 opciones |
| **2 · Phrasal Verbs & Colocaciones** | 06–10 | *rein in, phase out, iron out, meet a deadline…* | Rellenar el hueco en contexto real |
| **3 · Advanced Trap** | 11–15 | Falsos amigos, calcos y registro (*realize ≠ realizar*) | Elegir la única versión correcta a partir del español |
| **4 · Micro-Reto de Producción** | 16–20 | Defensa de métricas, conflictos, updates a la dirección, negociación | Escritura libre con chunks obligatorios + rúbrica + respuesta modelo |

Cada bloque tiene un reloj de referencia de 5 minutos. Si se acaba el tiempo, el bloque no se corta: el reloj pasa a ámbar y sigue contando.

## Funcionalidades

- **Repetición espaciada (Leitner, 5 cajas):** un fallo devuelve el ítem a la caja 1 y cada acierto lo sube una caja (revisión a 0, 1, 3, 7 y 16 días). Cada sesión mezcla repasos pendientes (hasta un 60 %) con contenido nuevo.
- **Racha diaria:** sube con cada sesión completa de 4 bloques y se pierde si saltas un día.
- **Panel de progreso:** precisión por bloque y por ámbito, punto débil detectado, ítems dominados (caja 4 o más) e historial de sesiones.
- **Refuerzo por bloque:** practicar un solo bloque sin que cuente para la racha.
- **Pronunciación:** voz británica o americana mediante `speechSynthesis`, sin coste ni API.
- **Atajos:** `1`–`4` para elegir opción, `Enter` para continuar y `Esc` para salir.
- **PWA instalable y offline** mediante `manifest.json` y `sw.js`.

## Estructura

```
index.html        Shell de la app (Tailwind CDN, tema oscuro)
js/data_c1.js     Base de datos C1: 102 ítems (30 + 30 + 30 + 12 retos)
js/app.js         Lógica: Store, SRS, Stats, Speech, Session, Views, App
manifest.json     Manifest PWA
sw.js             Service worker (network-first para ficheros propios)
icons/icon.svg    Icono
```

## Ejecutar

- **Rápido:** doble clic en `index.html`. Funciona todo salvo el modo offline.
- **Como PWA (instalable y offline):** sírvela por HTTP:
  ```bash
  python -m http.server 8080
  # abre http://localhost:8080
  ```
- **Publicar:** GitHub Pages, en Settings → Pages → Branch `main` / root.

## Persistencia (`localStorage`)

Clave única versionada `e20_c1_v1`:

```js
{
  version: 1,
  streak:   { current, best, lastDate },          // "YYYY-MM-DD" local
  items:    { "B2-007": { box, seen, correct, lastSeen } },
  sessions: [{ date, ts, score: { registerUpgrade: { ok, total }, ... } }],
  settings: { tts, voice }
}
```

Si el navegador bloquea el almacenamiento (por ejemplo, en modo privado), la app sigue funcionando y muestra un aviso.

## Añadir contenido

Edita `js/data_c1.js`. Los comentarios de cabecera recogen las reglas. Las más importantes:

1. Cada ítem necesita un `id` **único y estable**. Añade siempre al final y no renumeres, porque el progreso se guarda por `id`.
2. **Bloque 2:** `sentence` lleva un solo `___` y `answer` tiene que estar en `options`.
3. **Bloque 4:** `mustUse[].m` es una expresión regular que admite variantes (`"mitigat"` detecta *mitigate* y *mitigating*). La `modelAnswer` debe contener todos los chunks.

Script de validación rápida:

```bash
node -e 'global.window={};require("./js/data_c1.js");const B=window.E20_DATA.BLOCKS;const ids=Object.values(B).flat().map(i=>i.id);console.log(ids.length,"ítems",new Set(ids).size===ids.length?"OK ids únicos":"IDS DUPLICADOS")'
```

## Ideas para siguientes iteraciones

- Reconocimiento de voz (`SpeechRecognition`) en el Bloque 4 para responder hablando.
- Feedback de IA sobre la respuesta libre del micro-reto.
- Packs temáticos (HR, ventas, legal) y selector de sector.
- Compilar Tailwind (CLI) en lugar del CDN de desarrollo.
- Exportar e importar el progreso (JSON) para usarlo en varios dispositivos.
