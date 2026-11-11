# English 20 Minutes

PWA de **20 minutos diarios** para pasar de **B1+/B2 a un inglés fluido (B2+ → C1)**: conversación con soltura y vocabulario amplio, dentro y fuera del trabajo. El contexto profesional es un perfil de **HR Data Analytics** en una multinacional con **jefe australiano** y proyectos con EE. UU. y Reino Unido.

Objetivo práctico: **conversar con naturalidad** (small talk, contar historias, opinar), **intervenir en reuniones sin bloquearse**, entender a los demás (acentos incluidos), hablar de datos con precisión y presentar ante 30–40 personas.

## La sesión diaria

| Bloque | Min | Qué entrenas | Contenido |
|---|---|---|---|
| **1 · Vocabulario & Conversación** | 01–05 | Small talk, reaccionar, contar historias y cambiar de tema. Frases para intervenir, aclarar o discrepar en reuniones. Vocabulario amplio y de HR Analytics | 30 frases de conversación, 24 de reunión, 40 de vocabulario amplio (phrasal verbs, expresiones, colocaciones), 24 términos de HR, 60 expresiones C1 y **tu banco personal** |
| **2 · Gramática en contexto** | 06–10 | Para hablar de datos (present perfect, condicionales, pasiva…) y para conversar y contar historias (used to, tiempos narrativos, wish, question tags…) | 41 frases con la regla en una línea, más 40 trampas del español (trabajo y vida diaria) |
| **3 · Comprensión auditiva** | 11–15 | Entender a Mark (jefe, 🇦🇺), Sarah (🇬🇧) y Jake (🇺🇸) en reuniones, llamadas y charlas informales | 18 audios con 3 preguntas, transcripción y glosario (*arvo, reckon, yeah nah, snowed under…*) |
| **4 · Producción hablada** | 16–20 | Responder en voz alta como en la situación real | 23 retos: 1:1 con tu jefe, defender un dato, pedir entrar en un proyecto, presentar… y también contar tu fin de semana, una anécdota, explicar tu cultura u opinar en una cena |

Cada bloque tiene un reloj de referencia de 5 minutos. Si se acaba el tiempo, el bloque no se corta: el reloj pasa a ámbar y sigue contando.

## Nivel B2 / C1

En el panel eliges el nivel.
- **B2 (por defecto):** prioriza el contenido B2, es decir, frases directas y gramática base. El C1 solo entra si no queda B2 pendiente.
- **C1:** mezcla todo y añade el registro ejecutivo (*greenlight an initiative, move the needle…*).

La app te propone subir de nivel cuando superas el 85 % en 5 sesiones seguidas.

## Funcionalidades

- **Repetición espaciada (Leitner, 5 cajas):** un fallo devuelve el ítem a la caja 1 y cada acierto **en su fecha de repaso** lo sube una (revisión a 0, 1, 3, 7 y 16 días). Acertar antes de tiempo (segunda sesión del día, refuerzos) cuenta en tu historial pero no adelanta el calendario.
- **Banco personal de vocabulario:** apuntas las palabras que oyes en reuniones (también desde el móvil) y se repasan como tarjetas: ves el significado en español, intentas decirlo en inglés y te autoevalúas. Las expresiones de los audios se pueden añadir con un clic.
- **Listening con voz por hablante:** Mark habla con voz australiana (`en-AU`) si el dispositivo la tiene. Puedes repetir el audio y ponerlo más lento, y la transcripción aparece al responder.
- **Responder hablando:** dictado con la Web Speech API en inglés británico, americano o australiano. El texto aparece en directo y luego se puede corregir.
- **Panel de Delivery:** tiempo hablado, ritmo (palabras por minuto) y muletillas. En los retos de trabajo marca lo que resta autoridad (*I think, maybe, I'm sorry…*). En los sociales solo marca el relleno (*um, you know, basically…*), porque ahí *I think* es natural. El *sorry* para interrumpir (*Sorry to jump in…*) nunca cuenta.
- **Registro marcado:** las expresiones C1 indican si son naturales, formales o **jerga corporativa** que conviene usar con moderación.
- **Distractores exigentes:** las opciones incorrectas son gramaticales pero peores (tono, matiz) o tienen un único error típico del hispanohablante (*explain you, until Thursday, rotation…*).
- **Privacidad:** el dictado lo procesa el navegador en servidores externos. La app lo avisa: no dictes datos reales de la empresa.
- **Racha diaria y panel de progreso** por bloque y por ámbito (People Analytics, Reuniones, Datos…).
- **Copia de seguridad:** exporta e importa tu progreso en un archivo `.json` (para no perderlo o pasarlo a otro dispositivo). Si el progreso guardado se daña, la app no lo sobrescribe: guarda una copia y te avisa.
- **Sesión a prueba de recargas:** si recargas o cierras la pestaña a mitad de sesión, al volver continúas donde estabas (ese mismo día). El reloj se pausa mientras la pestaña está oculta.
- **Atajos:** `1`–`4` para elegir opción y `Enter` para continuar. `Esc` pide confirmación antes de salir de la sesión.
- **PWA instalable y offline.**

## Estructura

```
index.html          Shell de la app (Tailwind CDN, tema oscuro)
js/core.js          Núcleo puro y testeable: Util, SRS, racha, estado/importación, muletillas
js/data_c1.js       Contenido: 300 ítems en 10 pools, más configuración de sesión y niveles
js/app.js           App: Store, Content, Stats, Speech, Voice, Session, Views, App
manifest.json       Manifest PWA
sw.js               Service worker (network-first con timeout de 3 s)
icons/icon.svg      Icono
tests/              Tests del núcleo (node:test, sin dependencias)
scripts/validate.js Validador del contenido de data_c1.js
package.json        Scripts: npm test · npm run validate · npm run check
```

Cómo se forma la sesión (`SESSION_MIX` en `data_c1.js`):

| Bloque | Nivel B2 | Nivel C1 |
|---|---|---|
| Vocabulario | 2 conversación + 2 reunión + 2 vocabulario amplio + 1 HR + 1 colocación + hasta 2 de tu banco | 2 + 2 + 1 + 1 + 1 registro + 1 colocación + hasta 2 de tu banco |
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

Clave `e20_c1_v1`. Se mantiene desde la v1, así que el progreso antiguo se conserva:

```js
{
  version: 2,
  streak:   { current, best, lastDate },
  items:    { "MM-007": { box, seen, correct, lastSeen } },
  sessions: [{ date, ts, level, score: { vocab: { ok, total }, grammar, listening, challenges } }],
  custom:   [{ id: "U-…", en, es, example, created }],      // banco personal
  settings: { tts, voice: "en-GB" | "en-US" | "en-AU", level: "b2" | "c1", lastExport }
}
```

La sesión en curso se guarda aparte, en `sessionStorage` (clave `e20_session`), y se descarta al terminar, al salir o al cambiar de día.

## Añadir contenido

Edita `js/data_c1.js`. Los comentarios de cabecera recogen todas las reglas. Las más importantes:

1. Cada ítem necesita un `id` **único y estable**. Añade siempre al final y no renumeres.
2. Indica `level: "b2"` o `"c1"`. Si falta, se usa `POOL_DEFAULT_LEVEL`.
3. **Formato hueco** (`collocations`, `hrVocab`, `grammar`): un solo `___` y `answer` incluido en `options`.
4. **`listening`:** cada línea tiene `who` (`mark`, `sarah` o `jake`) y `answer` es el índice de la opción correcta.
5. **`challenges`:** `mustUse[].m` es una expresión regular y la `modelAnswer` debe cumplirlas todas. Pon `context: "social"` en los retos de conversación informal.
6. **Distractores:** gramaticales pero peores, o con un único error típico del hispanohablante. Nada que se descarte solo por estar mal construido.
7. **`registerUpgrade`:** `tone` puede ser `natural`, `formal` o `buzzword`.
8. Ejecuta `npm run check` antes de hacer commit.

## Ideas para siguientes iteraciones

- Feedback de IA sobre la respuesta hablada del bloque 4 (gramática y naturalidad).
- Modo "shadowing": repetir en voz alta cada línea del audio y comparar con el dictado.
- Más audios con situaciones reales que tú aportes (reuniones recurrentes, proyectos).
- Compilar Tailwind (CLI) en lugar del CDN de desarrollo.
