# English 20 Minutes

PWA de **20 minutos diarios** para pasar de **B1+/B2 a un inglés profesional fluido (B2+ → C1)**, enfocada a un perfil de **HR Data Analytics** en una multinacional con **jefe australiano** y proyectos con EE. UU. y Reino Unido.

Objetivo práctico: **intervenir en reuniones sin bloquearse**, entender a los demás (acentos incluidos), hablar de datos con precisión y presentar ante 30–40 personas.

## La sesión diaria

| Bloque | Min | Qué entrenas | Contenido |
|---|---|---|---|
| **1 · Vocabulario & Reuniones** | 01–05 | Frases para intervenir, aclarar, discrepar, ganar tiempo o presentar. Vocabulario de HR Analytics | 24 frases de reunión, 24 términos de HR, 60 expresiones C1 y **tu banco personal** |
| **2 · Gramática en contexto** | 06–10 | Present perfect para reportar, futuros, condicionales, modales diplomáticos, preguntas indirectas, pasiva, comparativos con datos… | 31 frases de tu trabajo con la regla en una línea, más 30 trampas del español |
| **3 · Comprensión auditiva** | 11–15 | Entender a Mark (jefe, 🇦🇺), Sarah (🇬🇧) y Jake (🇺🇸) en mensajes de voz, reuniones y llamadas | 12 audios con 3 preguntas, transcripción y glosario (*arvo, reckon, heaps, she'll be right…*) |
| **4 · Producción hablada** | 16–20 | Responder en voz alta como en la reunión real | 20 retos: 1:1 con tu jefe, intervenir para matizar un dato, proponer ideas, pedir entrar en un proyecto, abrir una presentación… |

Cada bloque tiene un reloj de referencia de 5 minutos. Si se acaba el tiempo, el bloque no se corta: el reloj pasa a ámbar y sigue contando.

## Nivel B2 / C1

En el panel eliges el nivel.
- **B2 (por defecto):** prioriza el contenido B2, es decir, frases directas y gramática base. El C1 solo entra si no queda B2 pendiente.
- **C1:** mezcla todo y añade el registro ejecutivo (*greenlight an initiative, move the needle…*).

La app te propone subir de nivel cuando superas el 85 % en 5 sesiones seguidas.

## Funcionalidades

- **Repetición espaciada (Leitner, 5 cajas):** un fallo devuelve el ítem a la caja 1 y cada acierto lo sube una (revisión a 0, 1, 3, 7 y 16 días).
- **Banco personal de vocabulario:** apuntas las palabras que oyes en reuniones (también desde el móvil) y se repasan como tarjetas: ves el significado en español, intentas decirlo en inglés y te autoevalúas. Las expresiones de los audios se pueden añadir con un clic.
- **Listening con voz por hablante:** Mark habla con voz australiana (`en-AU`) si el dispositivo la tiene. Puedes repetir el audio y ponerlo más lento, y la transcripción aparece al responder.
- **Responder hablando:** dictado con la Web Speech API en inglés británico, americano o australiano. El texto aparece en directo y luego se puede corregir.
- **Panel de Delivery:** tiempo hablado, ritmo (palabras por minuto) y muletillas que restan autoridad (*I think, maybe, sorry…*).
- **Racha diaria y panel de progreso** por bloque y por ámbito (People Analytics, Reuniones, Datos…).
- **Atajos:** `1`–`4` para elegir opción, `Enter` para continuar y `Esc` para salir.
- **PWA instalable y offline.**

## Estructura

```
index.html        Shell de la app (Tailwind CDN, tema oscuro)
js/data_c1.js     Contenido: 201 ítems en 8 pools, más configuración de sesión y niveles
js/app.js         Lógica: Store, Content, SRS, Stats, Speech, Voice, Session, Views, App
manifest.json     Manifest PWA
sw.js             Service worker (network-first para ficheros propios)
icons/icon.svg    Icono
```

Cómo se forma la sesión (`SESSION_MIX` en `data_c1.js`):

| Bloque | Nivel B2 | Nivel C1 |
|---|---|---|
| Vocabulario | 4 frases de reunión + 3 HR + 1 colocación + hasta 2 de tu banco | 2 + 2 + 2 registro + 2 colocaciones + hasta 2 de tu banco |
| Gramática | 5 gramática + 2 trampas | 4 + 2 |
| Comprensión | 2 audios | 2 audios |
| Producción | 1 reto | 1 reto |

## Ejecutar

- **Rápido:** doble clic en `index.html`. Funciona todo salvo el modo offline; el dictado depende del navegador.
- **Como PWA (instalable y offline):** sírvela por HTTP.
  ```bash
  python -m http.server 8080
  # abre http://localhost:8080
  ```
- **Publicar:** GitHub Pages, en Settings → Pages → Branch `main` / root.

## Voz: compatibilidad

| Navegador | Audios (síntesis) | Voz australiana para Mark | Dictado (responder hablando) |
|---|---|---|---|
| **Microsoft Edge** | Sí | **Sí, voces "Natural" online** | Sí (necesita internet) |
| Chrome | Sí | Depende de las voces del sistema | Sí (necesita internet) |
| Safari (macOS / iOS) | Sí | Sí, si está instalada en Ajustes → Accesibilidad → Contenido leído | Sí |
| Firefox | Sí | Depende del sistema | No. Se responde por escrito |

Si no hay voz australiana, Mark suena con otra voz inglesa y la app lo avisa. **Para practicar con el acento de tu jefe, usa Microsoft Edge.**

## Persistencia (`localStorage`)

Clave `e20_c1_v1`. Se mantiene desde la v1, así que el progreso antiguo se conserva:

```js
{
  version: 2,
  streak:   { current, best, lastDate },
  items:    { "MM-007": { box, seen, correct, lastSeen } },
  sessions: [{ date, ts, level, score: { vocab: { ok, total }, grammar, listening, challenges } }],
  custom:   [{ id: "U-…", en, es, example, created }],      // banco personal
  settings: { tts, voice: "en-GB" | "en-US" | "en-AU", level: "b2" | "c1" }
}
```

## Añadir contenido

Edita `js/data_c1.js`. Los comentarios de cabecera recogen todas las reglas. Las más importantes:

1. Cada ítem necesita un `id` **único y estable**. Añade siempre al final y no renumeres.
2. Indica `level: "b2"` o `"c1"`. Si falta, se usa `POOL_DEFAULT_LEVEL`.
3. **Formato hueco** (`collocations`, `hrVocab`, `grammar`): un solo `___` y `answer` incluido en `options`.
4. **`listening`:** cada línea tiene `who` (`mark`, `sarah` o `jake`) y `answer` es el índice de la opción correcta.
5. **`challenges`:** `mustUse[].m` es una expresión regular y la `modelAnswer` debe cumplirlas todas.

## Ideas para siguientes iteraciones

- Feedback de IA sobre la respuesta hablada del bloque 4 (gramática y naturalidad).
- Modo "shadowing": repetir en voz alta cada línea del audio y comparar con el dictado.
- Más audios con situaciones reales que tú aportes (reuniones recurrentes, proyectos).
- Exportar e importar el progreso (JSON) para usarlo en varios dispositivos.
- Compilar Tailwind (CLI) en lugar del CDN de desarrollo.
