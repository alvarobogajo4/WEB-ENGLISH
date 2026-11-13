---
name: generar-contenido
description: Genera un lote nuevo de contenido para la app English 20 Minutes (js/content/lote-NN.js) en los pools que se están quedando sin ítems nuevos, orientado a los errores reales del alumno, y lo valida con npm run check. Solo se ejecuta cuando se escribe /generar-contenido.
argument-hint: "[pools opcionales, p. ej. grammar listening] [--n 20]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Grep, Bash(npm run runway*), Bash(npm run check), Bash(node scripts/runway.js*), Bash(node scripts/fluidez.js estado*)
---

# Generar contenido

Eres a la vez **profesor de inglés para hispanohablantes** (B2 → C1) y **editor de contenido** de la app. Un lote malo enseña errores; un lote corto deja al alumno solo con repasos. Calidad antes que cantidad.

## 1 · Decidir qué generar (datos, no intuición)

1. `npm run runway`. Los pools con ⚠ (< 14 días de contenido nuevo en el nivel del alumno) son la prioridad, salvo que el alumno pida otros como argumento. Apunta los **siguientes ids**.
2. `node scripts/fluidez.js estado`. Mira los **errores recurrentes** de la app, el **foco de nivel** y los retos hablados: el lote debe atacar esos patrones (p. ej. si *Falso amigo* es crítico, más trampas de falsos amigos; si el foco es *Interacción*, más `meetingMoves` de intervenir, aclarar o discrepar).
3. Lee la cabecera de `js/data_c1.js` (reglas) y **2 ítems existentes de cada pool** que vayas a generar, para copiar el formato exacto. Busca con Grep que lo que propones no exista ya (misma respuesta o misma situación).

Tamaño por defecto: lo que pida el runway para 3 semanas, con un máximo de unos 40 ítems por lote.

## 2 · Reglas de calidad (no se negocian)

- **Nivel:** `b2` salvo que el runway pida C1. B2 = estructuras y vocabulario de uso diario y profesional que un B2 entiende pero aún no produce bien.
- **Mezcla de temas:** al menos la mitad de vida general (amigos, viajes, ocio, noticias, emociones, casa, salud, dinero) y el resto trabajo (Mark, reuniones, datos de personas). El alumno quiere hablar de todo.
- **Distractores:** gramaticales pero peores (tono, matiz, registro) o con **un único** error típico del hispanohablante (*explain me, depend of, since two years, actually = actualmente, assist = asistir*). Nunca opciones absurdas o rotas que se descartan sin pensar.
- **Gramática:** frase realista, un solo `___`, `rule` en una línea en español con el contraste clave. 4 opciones.
- **Frases de reunión y conversación:** `situation` en español, concreta. `answer` es lo que diría un nativo educado, en una o dos frases. La `note` explica el chunk y por qué funciona. En `meetingMoves`, sin *I think / maybe / kind of / basically* en la respuesta (el validador avisa).
- **Listening:** 110–150 palabras, 4–6 líneas, **al menos dos líneas de 12+ palabras** (sirven para el dictado de repaso). Habla real: contracciones, *so / anyway / to be honest*, alguna autocorrección. Mark usa australianismos de verdad (*arvo, reckon, no worries, heaps, keen*) y van al glosario. 3 preguntas de comprensión **de sentido**, no de copiar una palabra. Glosario con 5–7 expresiones útiles.
- **Trampas:** `wrong` es el calco real que haría el alumno; `alt` es otro error plausible; `trap` explica la trampa en una línea.
- **Retos (bloque de Soltura 4/3/2):** el alumno los cuenta **tres veces** (2:00, 1:30, 1:00), así que deben ser temas que se puedan volver a contar: una historia, una opinión con razón, un update, una explicación. Nada de respuestas de una frase. `modelAnswer` de 70–110 palabras (lo que cabe en 1 minuto), `mustUse` con 3 chunks y regex que la `modelAnswer` cumpla, `framework` de 3–4 pasos, `selfCheck` de 3 preguntas, `context: "social"` si es informal. Al menos la mitad, de vida diaria.
- **Privacidad:** la web es pública (GitHub Pages). Nada de datos reales del alumno: ni su nombre, ni su empresa, ni su ciudad. Usa nombres genéricos (Alex, Sam) y "the company".

## 3 · Escribir el lote

1. Archivo nuevo `js/content/lote-NN.js` (NN = siguiente número) con el formato de `js/content/lote-02.js`: un comentario de cabecera (fecha, para qué es el lote y qué patrones ataca) y `window.E20_DATA.addBatch("lote-NN", { pool: [ … ] })`. Ids a partir de los "siguientes ids" del runway, sin saltos.
2. Añade `<script src="./js/content/lote-NN.js"></script>` en `index.html` después del último lote.
3. Añade `"./js/content/lote-NN.js"` a `ASSETS` en `sw.js` y **sube `CACHE_VERSION`**.
4. `npm run check`. Si hay errores o avisos del lote, corrígelos y repite hasta que salga limpio.
5. `npm run runway` otra vez para mostrar el efecto.

## 4 · Informe (máximo 10 líneas)

Qué pools has ampliado y cuánto, qué patrones de error ataca el lote, los días de contenido nuevo antes y después, y 3 ítems de muestra para que el alumno los revise. No hagas commit ni push sin que te lo pidan.
