---
name: chequeo-nivel
description: Chequeo mensual (unos 25 minutos) del nivel de EXPRESIÓN en inglés del alumno. Plantea 6 tareas de conversación y escritura en situaciones de empresa y de la vida diaria, evalúa 6 criterios (rango, corrección, fluidez, interacción, coherencia y adaptación) con una rúbrica basada en el MCER, con niveles plus situados en la escala de Cambridge, y registra el resultado con scripts/nivel.js para verlo en la app. Solo se ejecuta cuando el alumno escribe /chequeo-nivel.
disable-model-invocation: true
allowed-tools: Read, Write, Bash(node scripts/nivel.js *)
---

# Chequeo de nivel de expresión

Mides **cómo se expresa** el alumno: no cuánto inglés reconoce y no para aprobar un examen. El objetivo del alumno es desenvolverse con cualquier persona y en cualquier situación, sobre todo en la empresa (su jefe australiano **Mark**, reuniones, compañeros como **Sarah** en Reino Unido y **Jake** en EE. UU.), pero también en la vida diaria.

Este chequeo es una **medición, no una clase**. Su valor está en que sea comparable de un mes a otro.

## Condiciones (no se cambian)

1. **No corriges ni ayudas durante las tareas.** Nada de feedback, pistas ni "muy bien" entre tareas. Si se bloquea, dile solo: *"Take your time — say it however you can."* Todo el feedback llega al final.
2. **Una tarea cada vez.** Espera su respuesta antes de seguir.
3. **Respuestas habladas siempre que pueda** (Win + H). Pídele que **no edite** el dictado: los errores de reconocimiento no cuentan, pero editar esconde la fluidez real. Pregunta al principio si va a dictar o a escribir, y anótalo en `modo`.
4. **Tus turnos, en inglés natural** y al nivel de un nativo que habla con un compañero: ni simplificado ni rebuscado. Las instrucciones de cada tarea, en español y en una línea.
5. **Duración:** unos 25 minutos. Si el alumno tiene prisa, no recortes tareas: aplaza el chequeo.

## Desarrollo

### 0 · Preparación

1. Ejecuta `node scripts/nivel.js estado`. Mira cuándo fue el último chequeo, qué **variantes** se han usado y qué **situaciones** están "sin evaluar" o más antiguas.
2. Lee [tareas.md](tareas.md) y elige **una variante de cada tarea (T1–T6)**, sin repetir las variantes recientes. Si puedes, prioriza las variantes que cubren situaciones sin evaluar.
3. Lee [rubrica.md](rubrica.md) entera **antes de empezar**, para tener los niveles en la cabeza mientras escuchas.
4. Explica en 4 líneas, en español:
   - qué es el chequeo (6 tareas, unos 25 minutos);
   - que no habrá correcciones hasta el final;
   - que conviene dictar con Win + H y no editar;
   - que el resultado es una estimación con un margen de ± medio nivel, no un certificado.

### 1 · Las 6 tareas

Sigue la variante elegida de [tareas.md](tareas.md). Reglas por tipo:

- **T3 (opinión con réplica) y T4 (discrepar o interrumpir):** son conversaciones. Haz **3 o 4 intercambios** en los que lleves la contraria o interrumpas como lo haría el personaje. Lo que se evalúa es cómo reacciona.
- **T5 (explicar un dato):** da los datos en 2 líneas y pide que se lo explique a alguien no experto.
- **T6 (cambio de registro):** dos mensajes escritos con el mismo contenido, uno para Mark o un cliente y otro para un amigo.

Guarda el texto literal de cada respuesta del alumno: lo necesitas para las citas y las métricas.

### 2 · Evaluación

Sigue el procedimiento de [rubrica.md](rubrica.md):

1. **Cada criterio por separado**, después de leer todas las respuestas. Elige el **nivel que mejor encaja**: el más alto cuyo descriptor se cumple **de forma consistente**. Usa el nivel *plus* cuando cumple el nivel y muestra a menudo rasgos del siguiente.
2. **Una cita literal por criterio** como evidencia: un fragmento corto de sus respuestas que justifique el nivel.
3. **Situaciones:** un nivel global por cada situación evaluada hoy (claves en tareas.md).
4. **Puntos fuertes (2)** y **puntos débiles (2)**, concretos y con una cita. Cada punto débil lleva **una acción** que se pueda entrenar en `/fluidez-activa` o en la app. Por ejemplo: *"Practicar 3 formas de discrepar con tacto: 'I see your point, but…', 'I'm not sure I agree…', 'Could we look at it another way?'"*.
5. **Contra la inflación:** si dudas entre dos niveles, elige el inferior. Un chequeo que sube sin motivo no sirve para mejorar.

### 3 · Registro

1. Escribe con Write el archivo `progreso/chequeo.json`:

```json
{
  "fecha": "AAAA-MM-DD",
  "modo": "hablado",
  "variantes": ["T1-b", "T2-a", "T3-c", "T4-a", "T5-b", "T6-a"],
  "respuestas": [
    { "tarea": 1, "situacion": "social", "texto": "…texto literal del alumno…" },
    { "tarea": 3, "situacion": "opiniones", "texto": "…un objeto por cada turno del alumno…" }
  ],
  "criterios": {
    "rango":       { "nivel": "B2",  "evidencia": "\"It was a bit of a nightmare, to be honest\"" },
    "correccion":  { "nivel": "B1+", "evidencia": "\"I am working here since 2025\"" },
    "fluidez":     { "nivel": "B2",  "evidencia": "…" },
    "interaccion": { "nivel": "B1+", "evidencia": "…" },
    "coherencia":  { "nivel": "B2",  "evidencia": "…" },
    "adaptacion":  { "nivel": "B2",  "evidencia": "…" }
  },
  "situaciones": { "social": "B2", "historias": "B2", "opiniones": "B1+", "reuniones": "B1+", "datos": "B2+", "escrito": "B2" },
  "fuertes": [ { "texto": "…", "evidencia": "…" } ],
  "debiles": [ { "texto": "…", "evidencia": "…", "accion": "…" } ]
}
```

   - Niveles válidos: A2, A2+, B1, B1+, B2, B2+, C1, C1+, C2.
   - Situaciones válidas: las claves de tareas.md.
   - `respuestas`: un objeto por cada turno del alumno, con su texto literal. Las métricas objetivas (palabras por turno, variedad léxica, conectores, chunks propios, muletillas) las calcula el script, no tú.
2. Ejecuta `node scripts/nivel.js registrar progreso/chequeo.json`. Si devuelve errores, corrige el JSON y repite: el script no guarda nada mientras falte algo.

### 4 · Informe para el alumno

En español, un máximo de 20 líneas:

1. **Nivel global** (por ejemplo, *B2 · 165 en la escala Cambridge*) con su margen, la distancia al objetivo (B2+) y la evolución si hay un chequeo anterior.
2. **Los 6 criterios**, en una línea cada uno, con su nivel.
3. **Puntos fuertes**: 2, con su cita.
4. **Puntos débiles**: 2, con su cita y su acción.
5. **Ahora sí, feedback de lengua:** 3 correcciones útiles de sus respuestas, en el formato *dijo → mejor*.
6. **Foco hasta el próximo chequeo** (criterio y situación). `/fluidez-activa` lo usará automáticamente.
7. Si abre la app con `npm start`, la tarjeta «Tu nivel de expresión» se actualiza sola. Si no, que importe `progreso/nivel-para-app-AAAA-MM-DD.json` (Panel → Copia de seguridad → Importar copia).
8. Recuérdale que el próximo chequeo será dentro de unas 4 semanas. Antes, el cambio sería ruido.

## Límites que debes decir si sale el tema

- Es una estimación con rúbrica, no un certificado oficial. Puede desviarse medio nivel.
- **La pronunciación no se evalúa**: el dictado la convierte en texto.
- Para contrastar, una vez cada pocos meses viene bien una conversación con un profesor nativo evaluada con la misma rúbrica.
