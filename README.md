# English 20 Minutes

PWA de **20 minutos diarios** para pasar de **B1+/B2 a un inglés fluido (B2+ → C1)**: conversación con soltura y vocabulario amplio, dentro y fuera del trabajo. El contexto profesional es un perfil de **HR Data Analytics** en una multinacional con **jefe australiano** y proyectos con EE. UU. y Reino Unido.

Objetivo práctico: **conversar con naturalidad** (small talk, contar historias, opinar), **intervenir en reuniones sin bloquearse**, entender a los demás (acentos incluidos), hablar de datos con precisión y presentar ante 30–40 personas.

## La sesión diaria (v2)

Diseñada con las **cuatro áreas de Paul Nation** (estudiar la lengua, entender, expresarse y soltura). La v1 dedicaba unos 15 de los 20 minutos a reconocer (opción múltiple) y menos de 2 a hablar. Para alguien con buen vocabulario pasivo que se bloquea al hablar, era el reparto equivocado.

| Bloque | Min | Qué entrenas | Cómo |
|---|---|---|---|
| **1 · Repaso exprés** | 00–04 | Lo que toca según la repetición espaciada: conversación, reuniones, vocabulario, gramática, una trampa del español y tu banco | 7–8 ítems. En las frases de conversación y reunión, **primero la dices tú** y después ves las opciones. Cada día entra además un ítem de un pool que rota (HR, colocaciones, vocabulario) |
| **2 · Oído** | 04–08 | Entender a Mark (🇦🇺), Sarah (🇬🇧) y Jake (🇺🇸) | 1 audio: preguntas si es nuevo, **dictado con huecos** si ya lo conoces y, al final, **shadowing**: repetir cada frase justo detrás, imitando el ritmo |
| **3 · Soltura 4/3/2** | 08–20 | Que las palabras salgan solas, sin traducir | Un reto (historia, opinión, 1:1, reunión…) contado **tres veces**, en 2:00, 1:30 y 1:00, con los mismos chunks. La app mide tu ritmo en cada ronda. Termina con la **revisión**: tu versión final frente a la modelo |

Cada bloque tiene un reloj de referencia. Si se acaba el tiempo, el bloque no se corta: el reloj pasa a ámbar y sigue contando.

**Fuera de la app** (donde se gana el tiempo de verdad): 20–30 minutos diarios escuchando podcasts o series en inglés australiano o británico sobre temas que te gusten, y una conversación real a la semana (un profesor nativo, o tu 1:1 con Mark preparado con `/fluidez-activa`).

## Nivel B2 / C1

En el panel eliges el nivel.
- **B2 (por defecto):** prioriza el contenido B2, es decir, frases directas y gramática base. El C1 solo entra si no queda B2 pendiente.
- **C1:** mezcla todo y añade el registro ejecutivo (*greenlight an initiative, move the needle…*).

La dificultad se adapta: la app te propone subir a C1 cuando superas el 85 % en 5 sesiones seguidas en B2. Si en C1 encadenas 3 sesiones por debajo del 60 %, te sugiere consolidar unos días en B2. Con preguntas de opción múltiple, la zona en la que más se aprende está entre el 70 y el 85 % de aciertos.

## Funcionalidades

- **Dilo antes de verlo:** en las frases de reunión y conversación (y en el registro C1) primero produces la frase, hablando o escribiendo, y luego eliges entre las opciones. Recuperar algo de memoria fija mucho más que reconocerlo, y es justo el paso de vocabulario pasivo a activo. La nota SM-2 combina las dos cosas: si eliges bien pero tu versión se parece poco a la buena, el ítem vuelve antes. Se puede desactivar en el panel.
- **Dictado de repaso en el listening:** los audios que ya conoces no repiten las mismas preguntas (se acabarían memorizando). Escuchas una frase y escribes las 3 palabras que faltan. Entrena el oído fino: separar palabras en el habla encadenada.
- **Tarjetas del banco con micro:** dices la expresión en voz alta y la app compara tu versión con la buena.
- **Tus retos llegan al tutor:** el texto de cada reto (dictado o escrito) se guarda y `/fluidez-activa` lo usa para darte feedback sobre lo que de verdad dijiste.
- **Repetición espaciada SM-2** (el algoritmo de SuperMemo, adaptado de [m98/fluent](https://github.com/m98/fluent), licencia MIT): cada respuesta recibe una nota de 0 a 5 y cada ítem tiene su propio factor de facilidad. Los aciertos alejan el repaso (1, 6, 15, 38 días… hasta 180) y un fallo lo devuelve al principio para ese mismo día. Las tarjetas de tu banco se autoevalúan con tres botones (*No lo sabía* / *Con dudas* / *Lo sabía*, también con las teclas `1`–`3`): *Con dudas* cuenta como acierto, pero el repaso vuelve antes. Acertar antes de tiempo cuenta en tu historial pero no adelanta el calendario. El progreso de la versión anterior (cajas Leitner) se migra automáticamente.
- **Errores recurrentes:** cada ítem pertenece a un patrón (una regla de gramática, un tipo de trampa del español, una función de conversación, un tipo de vocabulario o un hablante del listening). La app guarda tus fallos con *tu respuesta → la correcta*. Con 2–3 fallos en 30 días el patrón es **emergente** y con 4 o más, **crítico**. Las sesiones diarias dan prioridad a esos patrones, y el botón **Repasar mis errores** prepara un repaso solo con ellos. Un patrón queda **superado** con 3 aciertos seguidos, el último en un día posterior al último fallo.
- **Resumen con avances y foco:** al terminar ves qué patrones has superado, cuáles empeoran y los 3 en los que conviene centrarse en la próxima sesión.
- **Banco personal de vocabulario:** apuntas las palabras que oyes en reuniones (también desde el móvil) y se repasan como tarjetas: ves el significado en español, intentas decirlo en inglés y te autoevalúas. Las expresiones de los audios se pueden añadir con un clic.
- **Listening con voz por hablante:** Mark habla con voz australiana (`en-AU`) si el dispositivo la tiene. Puedes repetir el audio y ponerlo más lento, y la transcripción aparece al responder.
- **Responder hablando:** dictado con la Web Speech API en inglés británico, americano o australiano. El texto aparece en directo y luego se puede corregir.
- **Panel de Delivery:** tiempo hablado, ritmo (palabras por minuto) y muletillas. En los retos de trabajo marca lo que resta autoridad (*I think, maybe, I'm sorry…*). En los sociales solo marca el relleno (*um, you know, basically…*), porque ahí *I think* es natural. El *sorry* para interrumpir (*Sorry to jump in…*) nunca cuenta.
- **Registro marcado:** las expresiones C1 indican si son naturales, formales o **jerga corporativa** que conviene usar con moderación.
- **Distractores exigentes:** las opciones incorrectas son gramaticales pero peores (tono, matiz) o tienen un único error típico del hispanohablante (*explain you, until Thursday, rotation…*).
- **Privacidad:** el dictado lo procesa el navegador en servidores externos. La app lo avisa: no dictes datos reales de la empresa.
- **Racha diaria y panel de progreso** por bloque y por ámbito (People Analytics, Reuniones, Datos…), con **dominio de 0 a 5 ★**. Las estrellas salen de la precisión (90/80/65/50/30 %), pero 4★ exige tener dominado el 25 % del contenido y 5★, el 50 %. Así acertar unas pocas preguntas fáciles no da la máxima nota.
- **Copia de seguridad:** exporta e importa tu progreso en un archivo `.json` (para no perderlo o pasarlo a otro dispositivo). Si el progreso guardado se daña, la app no lo sobrescribe: guarda una copia y te avisa.
- **Sesión a prueba de recargas:** si recargas o cierras la pestaña a mitad de sesión, al volver continúas donde estabas (ese mismo día). El reloj se pausa mientras la pestaña está oculta.
- **Atajos:** `1`–`4` para elegir opción y `Enter` para continuar. `Esc` pide confirmación antes de salir de la sesión.
- **PWA instalable y offline.**

## Estructura

```
index.html          Shell de la app (Tailwind CDN, tema oscuro)
js/core.js          Núcleo puro y testeable: Util, SRS (SM-2), Errors, Mastery, Level, racha, estado/importación, muletillas
js/data_c1.js       Contenido base: 300 ítems en 10 pools, más configuración de sesión y niveles
js/content/         Lotes de contenido (lote-NN.js) que añaden ítems a los pools
js/app.js           App: Store, Content, Stats, Speech, Voice, Session, Views, App
manifest.json       Manifest PWA
sw.js               Service worker (network-first con timeout de 3 s)
icons/icon.svg      Icono
tests/              Tests del núcleo (node:test, sin dependencias)
scripts/validate.js Validador del contenido (base y lotes, enlazados en index.html y sw.js)
scripts/runway.js   Días de contenido nuevo que quedan en cada pool (npm run runway)
scripts/serve.js    Servidor local con sincronización automática con progreso/ (npm start)
scripts/onedrive.js Carpeta puente con el iPhone: OneDrive/English20
scripts/nube.js     Guardado en la nube (gist secreto) desde el ordenador, con gh
scripts/fluidez.js  Progreso de la skill /fluidez-activa (estado · registrar · banco)
scripts/nivel.js    Chequeos de nivel de /chequeo-nivel (estado · metricas · registrar)
.claude/skills/     Skills fluidez-activa (tutor), chequeo-nivel (nivel de expresión) y generar-contenido (lotes)
progreso/           Tus datos de fluidez activa (personales: fuera de git)
package.json        Scripts: npm start · npm test · npm run validate · npm run check · npm run runway · npm run fluidez
```

Cómo se forma la sesión (`SESSION_MIX` y `SESSION_ROTATION` en `data_c1.js`):

| Bloque | Nivel B2 | Nivel C1 |
|---|---|---|
| Repaso exprés | 2 conversación + 1 reunión + 1 vocabulario amplio + 2 gramática + 1 trampa + 1 rotatorio (HR → colocación → vocabulario) + hasta 2 de tu banco | 1 + 1 + 1 registro + 1 colocación + 2 gramática + 1 trampa + 1 rotatorio (HR → vocabulario) + banco |
| Oído | 1 audio | 1 audio |
| Soltura 4/3/2 | 1 reto × 3 rondas | 1 reto × 3 rondas |

## Tutor de fluidez en Claude Code

La app entrena sobre todo el **reconocimiento**: eliges entre opciones. Para que lo que reconoces te **salga al hablar**, el proyecto incluye la skill `/fluidez-activa` (en `.claude/skills/fluidez-activa/`). Al abrir Claude Code en esta carpeta y escribir `/fluidez-activa` (opcionalmente con un tema), recibes una lección de unos 20 minutos:

| Bloque | Min | Qué entrena |
|---|---|---|
| Calentamiento | 3 | Recuperar los chunks que tocan hoy a partir de situaciones nuevas |
| Chunks nuevos | 4 | 4–5 expresiones completas del tema y una frase personal con cada una |
| Producción forzada | 6 | 3 rondas de 2–4 frases con 3–5 chunks obligatorios, de más a menos guiada, y la última con réplica |
| Circunloquio | 3 | Explicar en inglés una palabra que no sabes, sin decirla (*It's a kind of…*) |
| Ráfaga anti-traducción | 2 | 4 preguntas para responder en menos de 10 s; solo cuenta la soltura |
| Cierre | 1 | Registro automático del progreso y archivo de chunks para la app |

**Cómo se conecta con la app:**
- **De la app al tutor:** con `npm start` es automático (`progreso/app-estado.json`). Sin él, exporta una copia desde el panel y el tutor la encuentra sola (en Descargas, el Escritorio de OneDrive o esta carpeta). De ahí saca tus **errores recurrentes**, las palabras del banco que aún no dominas y **tus últimos retos hablados**: empieza la lección mejorando lo que de verdad dijiste.
- **Del tutor a la app:** al cerrar, `node scripts/fluidez.js banco` crea `progreso/banco-para-app-AAAA-MM-DD.json`. Con `npm start` la app lo añade sola al abrirse; si no, impórtalo. Esos chunks se **añaden** a tu banco y entran en el repaso diario. Tu progreso no cambia.
- **El mismo algoritmo:** el progreso de los chunks usa el SM-2 de `js/core.js`. Un chunk es **activo** cuando lo produces bien en 3 repasos espaciados.

Para ver tu estado sin abrir una lección: `npm run fluidez`.

## Tu nivel de expresión

El objetivo no es aprobar un examen, sino **expresarte con cualquier persona y en cualquier situación**. Por eso se mide la **producción**, no el reconocimiento, con los criterios del MCER para la expresión hablada más la adaptación de registro. El resultado se sitúa en la escala de Cambridge:

| Nivel | B1 | B1+ | B2 | B2+ | C1 | C1+ |
|---|---|---|---|---|---|---|
| Escala Cambridge (aprox.) | 145 | 155 | 165 | 175 | 185 | 195 |

- **Chequeo mensual** (`/chequeo-nivel` en Claude Code, unos 25 minutos). Son 6 tareas comparables de un mes a otro: small talk, contar algo que te pasó, opinar y defenderlo, discrepar o intervenir con Mark, explicar un dato y el mismo mensaje para tu jefe y para un amigo. Se evalúan 6 criterios (**rango, corrección, fluidez, interacción, coherencia y adaptación**), cada uno con una cita tuya como prueba, y un **mapa de situaciones**. Un script añade métricas objetivas: palabras por turno, variedad léxica, conectores, chunks propios y muletillas. Durante el chequeo no hay correcciones: el feedback llega al final.
- **Indicadores continuos** entre chequeos: ritmo y muletillas de tus retos hablados, patrones de error, listening y, desde `/fluidez-activa`, chunks activos, porcentaje de uso espontáneo y la valoración del tutor sobre interacción y adaptación. Se muestran como tendencia, no como nivel.
- **El foco cierra el círculo:** el criterio y la situación más débiles del último chequeo pasan a ser el foco de `/fluidez-activa`, que les dedica una ronda y orienta la elección de tema.
- **En la app:** la tarjeta «Tu nivel de expresión» muestra tu nivel, tu posición en la escala con el objetivo (B2+), la evolución, los criterios, el mapa de situaciones, los puntos fuertes y débiles con su acción, y los indicadores. Importa `progreso/nivel-para-app-AAAA-MM-DD.json`: se añade y no reemplaza nada.
- **Límites:** es una estimación con margen de ± medio nivel, no un certificado. La pronunciación no se evalúa, porque el dictado la convierte en texto.

## Guardado automático en la nube (recomendado)

Una sola vez, en la app del iPhone: tarjeta **«Activa el guardado automático»** → abre la página de GitHub → Expiration: *No expiration* → **Generate token** → copia la llave (`ghp_…`), pégala en la app y pulsa **Conectar**.

A partir de ahí todo es automático:
- Cada respuesta se guarda en un **gist secreto** de tu cuenta de GitHub (`estado.json`). La llave solo da permiso sobre gists y se queda en el dispositivo: nunca va en las copias exportadas.
- El tutor del ordenador (`/fluidez-activa`, `/chequeo-nivel`) lee esa copia con la sesión de GitHub del ordenador (`gh`) y sube ahí lo que prepara para ti. La app lo **añade sola** al abrirse.
- Si practicas en otro dispositivo, al abrir la app se usa lo más reciente. Si has practicado en los dos sin conexión, la app te pregunta con cuál te quedas.
- Privacidad: el gist no aparece en tu perfil ni en buscadores, pero cualquiera que tenga su enlace podría leerlo. No dictes datos de la empresa.

Si no activas la nube, sigue funcionando el puente manual con OneDrive (abajo).

## En el iPhone (uso diario) y el puente con el ordenador

1. **Instalar:** en **Safari**, abre https://alvarobogajo4.github.io/WEB-ENGLISH/ → Compartir → **«Añadir a pantalla de inicio»**. Se abre a pantalla completa y funciona sin conexión.
2. **Sesión diaria:** desde el icono. El progreso se guarda en el iPhone.
3. **Antes de una lección con el tutor** (`/fluidez-activa` en el ordenador, 2–3 veces por semana): en la app, **Exportar copia** → *Guardar en Archivos* → OneDrive → **English20**. El tutor busca primero en esa carpeta y usa la copia más reciente.
4. **Después de la lección:** el tutor deja `banco-para-app-….json` (y `/chequeo-nivel`, `nivel-para-app-….json`) en **OneDrive/English20**. En el iPhone: **Importar copia** → Archivos → OneDrive → English20. Solo añade: no borra nada.

Consejos: para hablar, el micrófono del teclado del iPhone suele reconocer mejor que el de la app. Para oír a Mark con acento australiano, descarga una voz en Ajustes → Accesibilidad → Contenido leído → Voces → Inglés (Australia).

## Ejecutar

- **Recomendado en el ordenador:** `npm start` y abre http://127.0.0.1:8080 (otro puerto: `PORT=8091 npm start`). La app se **sincroniza sola** con la carpeta `progreso/`: guarda su estado en `progreso/app-estado.json`, que lee `/fluidez-activa`, y añade sin que hagas nada los archivos que generan las skills (chunks y chequeos de nivel). Sin exportar ni importar. El servidor solo escucha en tu equipo.
- **Rápido:** doble clic en `index.html`. Funciona todo salvo el modo offline y la sincronización; el dictado depende del navegador.
- **Como PWA (instalable y offline):** sírvela por HTTP.
  ```bash
  python -m http.server 8080
  # abre http://localhost:8080
  ```
- **Publicar:** GitHub Pages, en Settings → Pages → Branch `main` / root.

## Desarrollo

No hay dependencias ni paso de build; solo hace falta Node ≥ 20.

```bash
npm run check      # valida el contenido y ejecuta los tests (hazlo antes de cada commit)
npm run validate   # solo el contenido: ids, huecos, opciones, regex de los retos, muletillas…
npm test           # solo los tests del núcleo
```

El validador falla (código 1) si hay errores y muestra como avisos lo que conviene revisar, por ejemplo una respuesta modelo con muletillas que el panel de Delivery penalizaría.

## Voz: compatibilidad

| Navegador | Audios (síntesis) | Voz australiana para Mark | Dictado (responder hablando) |
|---|---|---|---|
| **Microsoft Edge** | Sí | **Sí, voces "Natural" online** | Sí (necesita internet) |
| Chrome | Sí | Depende de las voces del sistema | Sí (necesita internet) |
| Safari (macOS / iOS) | Sí | Sí, si está instalada en Ajustes → Accesibilidad → Contenido leído | Sí |
| Firefox | Sí | Depende del sistema | No. Se responde por escrito |

Si no hay voz australiana, Mark suena con otra voz inglesa y la app lo avisa. **Para practicar con el acento de tu jefe, usa Microsoft Edge.**

## Persistencia (`localStorage`)

Clave `e20_c1_v1`. Se mantiene desde la v1 y cada versión migra la anterior, así que el progreso antiguo se conserva (`State.normalize` en `js/core.js`):

```js
{
  version: 5,
  streak:      { current, best, lastDate },
  items:       { "MM-007": { ef, reps, interval, due, seen, correct, lapses, lastSeen } }, // SM-2
  errors:      { "g:Present perfect": { label, n, ok, run, last, lastOk, dates, examples } },
  sessions:    [{ date, ts, level, score: { vocab: { ok, total }, grammar, listening, challenges } }],
  custom:      [{ id: "U-…", en, es, example, created }],          // banco personal
  nivel:       [ /* chequeos de /chequeo-nivel */ ],
  fluidez:     { fecha, activos, enUso, sesiones, espontaneoPct, criterios },
  delivery:    [{ date, secs, words, wpm, fillers, authority, social }],
  productions: [{ date, id, scenario, brief, text, spoken, secs, wpm, score, social }], // últimos 30 retos
  settings:    { tts, voice: "en-GB" | "en-US" | "en-AU", level: "b2" | "c1", lastExport, produceFirst, synced }
}
```

La sesión en curso se guarda aparte, en `sessionStorage` (clave `e20_session`), y se descarta al terminar, al salir o al cambiar de día.

## Añadir contenido

El contenido crece **por lotes**: `npm run runway` dice qué pools se quedan sin ítems nuevos en menos de 14 días, y la skill `/generar-contenido` escribe el siguiente `js/content/lote-NN.js` orientado a tus errores reales, lo enlaza en `index.html` y `sw.js` y lo valida. También puedes escribir un lote a mano con el formato de `js/content/lote-02.js`. Las reglas están en la cabecera de `js/data_c1.js`. Las más importantes:

1. Cada ítem necesita un `id` **único y estable**. Añade siempre al final y no renumeres.
2. Indica `level: "b2"` o `"c1"`. Si falta, se usa `POOL_DEFAULT_LEVEL`.
3. **Formato hueco** (`collocations`, `hrVocab`, `grammar`): un solo `___` y `answer` incluido en `options`.
4. **`listening`:** cada línea tiene `who` (`mark`, `sarah` o `jake`) y `answer` es el índice de la opción correcta.
5. **`challenges`:** `mustUse[].m` es una expresión regular y la `modelAnswer` debe cumplirlas todas. Pon `context: "social"` en los retos de conversación informal.
6. **Distractores:** gramaticales pero peores, o con un único error típico del hispanohablante. Nada que se descarte solo por estar mal construido.
7. **`registerUpgrade`:** `tone` puede ser `natural`, `formal` o `buzzword`.
8. Ejecuta `npm run check` antes de hacer commit.

## Ideas para siguientes iteraciones

- Shadowing con micro: comparar lo que repites con la frase original.
- Colocaciones de nivel B2: hoy son todas C1, así que en B2 entran directamente las C1.
- Audios con voz neural pregrabada (mp3) para un acento australiano real en cualquier navegador.
- Plataforma: compilar Tailwind, fuentes locales, iconos PNG, CSP y despliegue en Pages.
