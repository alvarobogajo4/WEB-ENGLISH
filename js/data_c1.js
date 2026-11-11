/* =============================================================================
 * English 20 Minutes — Base de datos de contenido (B2 → C1, HR Data Analytics)
 * -----------------------------------------------------------------------------
 * Solo datos, sin lógica. Se expone en window.E20_DATA para que funcione tanto
 * abriendo index.html con doble clic (file://) como servido por HTTP.
 *
 * SESIÓN DIARIA (20 min) — cada bloque se alimenta de varios "pools":
 *   1 Vocabulario  ← meetingMoves, conversation, everydayVocab, hrVocab, registerUpgrade,
 *                  collocations, + tu banco personal
 *   2 Gramática    ← grammar, traps
 *   3 Comprensión  ← listening
 *   4 Producción   ← challenges
 *
 * REGLAS PARA AÑADIR CONTENIDO
 *  - Cada ítem necesita un `id` único y ESTABLE (el progreso se guarda por id).
 *    No reutilices ni renumeres ids existentes: añade siempre al final.
 *  - `domain` debe ser una clave de DOMAINS. `level`: "b2" | "c1"
 *    (si falta, se usa el nivel por defecto del pool: POOL_DEFAULT_LEVEL).
 *  - Formato hueco (collocations, hrVocab, grammar): `sentence` con un único "___"
 *    y `answer` incluido en `options`.
 *  - challenges: `mustUse[].m` es una expresión regular (sin barras, case-insensitive)
 *    y la `modelAnswer` debe cumplir todas. `context: "social"` para conversación
 *    informal (el panel de Delivery no penaliza "I think" / "maybe" ahí).
 *  - registerUpgrade: `tone` = "natural" | "formal" | "buzzword" (jerga corporativa).
 *  - Distractores: gramaticales pero peores (tono, matiz) o con UN error típico
 *    del hispanohablante. Nada que se descarte solo por estar mal construido.
 *  - Comprueba todo con: npm run validate
 *  - listening: cada línea tiene `who` (clave de SPEAKERS); `answer` es el índice
 *    de la opción correcta.
 * ========================================================================== */
window.E20_DATA = {
  version: 2,

  DOMAINS: {
    people:       { label: "People Analytics", es: "People Analytics" },
    meetings:     { label: "Meetings",     es: "Reuniones" },
    data:         { label: "Data",         es: "Datos" },
    leadership:   { label: "Leadership",   es: "Liderazgo" },
    stakeholders: { label: "Stakeholders", es: "Stakeholders" },
    strategy:     { label: "Strategy",     es: "Estrategia" },
    finance:      { label: "Finance",      es: "Finanzas" },
    operations:   { label: "Operations",   es: "Operaciones" },
    social:       { label: "Social",       es: "Conversación" },
    everyday:     { label: "Everyday life", es: "Vida diaria" },
    ideas:        { label: "Ideas & news", es: "Opiniones y actualidad" }
  },

  BLOCK_META: {
    vocab:      { n: 1, minutes: "01–05", title: "Vocabulario & Conversación", subtitle: "Frases para conversar y para reuniones, vocabulario amplio y tu banco personal", accent: "amber" },
    grammar:    { n: 2, minutes: "06–10", title: "Gramática en contexto",   subtitle: "Las estructuras para hablar de datos, opinar y contar historias", accent: "sky" },
    listening:  { n: 3, minutes: "11–15", title: "Comprensión auditiva",    subtitle: "Tu jefe australiano y compañeros de EE. UU. y Reino Unido, dentro y fuera de las reuniones", accent: "violet" },
    challenges: { n: 4, minutes: "16–20", title: "Producción hablada",      subtitle: "Habla como en la reunión o la conversación real", accent: "emerald" }
  },

  /* Pool → bloque de la sesión y nivel por defecto si el ítem no lo indica. */
  POOL_BLOCK: {
    meetingMoves: "vocab", conversation: "vocab", everydayVocab: "vocab", hrVocab: "vocab", registerUpgrade: "vocab", collocations: "vocab", custom: "vocab",
    grammar: "grammar", traps: "grammar",
    listening: "listening",
    challenges: "challenges"
  },
  POOL_DEFAULT_LEVEL: {
    meetingMoves: "b2", conversation: "b2", everydayVocab: "b2", hrVocab: "b2", registerUpgrade: "c1", collocations: "c1", custom: "b2",
    grammar: "b2", traps: "b2", listening: "b2", challenges: "c1"
  },

  /* Cuántos ítems de cada pool entran en una sesión, según el nivel elegido. */
  SESSION_MIX: {
    b2: { vocab: { meetingMoves: 2, conversation: 2, everydayVocab: 2, hrVocab: 1, collocations: 1 }, grammar: { grammar: 5, traps: 2 }, listening: { listening: 2 }, challenges: { challenges: 1 } },
    c1: { vocab: { meetingMoves: 2, conversation: 2, everydayVocab: 1, hrVocab: 1, registerUpgrade: 1, collocations: 1 }, grammar: { grammar: 4, traps: 2 }, listening: { listening: 2 }, challenges: { challenges: 1 } }
  },

  POOL_LABEL: {
    meetingMoves: "Frase de reunión", conversation: "Conversación", everydayVocab: "Vocabulario amplio", hrVocab: "HR Analytics", registerUpgrade: "Registro C1",
    collocations: "Phrasal / colocación", custom: "Mi vocabulario", grammar: "Gramática", traps: "Trampa del español",
    listening: "Listening", challenges: "Reto"
  },

  SPEAKERS: {
    mark:  { name: "Mark",  role: "Tu jefe · Australia",    lang: "en-AU", color: "text-violet-300" },
    sarah: { name: "Sarah", role: "HRBP · Reino Unido",      lang: "en-GB", color: "text-sky-300" },
    jake:  { name: "Jake",  role: "People Ops · EE. UU.",    lang: "en-US", color: "text-amber-300" }
  },

  MOVE_FUNCTIONS: {
    interrupt: "Intervenir",
    clarify:   "Pedir aclaración",
    check:     "Confirmar que entiendes",
    add:       "Añadir un punto",
    agree:     "Mostrar acuerdo",
    disagree:  "Discrepar con tacto",
    time:      "Ganar tiempo",
    correct:   "Corregir un dato",
    opinion:   "Dar tu opinión",
    redirect:  "Reconducir",
    close:     "Cerrar y siguientes pasos",
    present:   "Presentar en público",
    smalltalk: "Small talk",
    follow:    "Mantener la conversación",
    react:     "Reaccionar con interés",
    empathy:   "Mostrar empatía",
    story:     "Contar una historia",
    topic:     "Cambiar de tema",
    recommend: "Recomendar",
    leave:     "Despedirte con naturalidad"
  },

  TRAP_CATEGORIES: {
    false_friend: "Falso amigo",
    calque:       "Calco del español",
    nuance:       "Matiz",
    register:     "Registro"
  },

  SCENARIOS: {
    metrics_defense: "Defensa de métricas",
    conflict:        "Resolución de conflictos",
    exec_update:     "Update ejecutivo",
    pushback:        "Decir que no",
    promotion:       "Ascenso",
    bad_news:        "Malas noticias",
    negotiation:     "Negociación",
    feedback:        "Feedback",
    pitch:           "Pitch de inversión",
    one_to_one:      "1:1 con tu jefe",
    meeting:         "Reunión de equipo",
    presentation:    "Presentación en público",
    call:            "Llamada internacional",
    small_talk:      "Small talk",
    storytelling:    "Contar una historia",
    explain_culture: "Explicar tu cultura",
    social_opinion:  "Opinar en una conversación",
    networking:      "Networking"
  },

  BLOCKS: {
    /* ------------------------------------------------------------------------
     * BLOQUE 1 · Upgrade de Registro
     * plain → c1. distractors: versiones planas, incorrectas o poco naturales.
     * --------------------------------------------------------------------- */
    registerUpgrade: [
      { id: "B1-001", tone: "buzzword", domain: "stakeholders",
        plain: "I think we should do this project.",
        c1: "I'd make a strong case for greenlighting this initiative.",
        chunks: ["make a strong case for", "greenlight an initiative"],
        distractors: ["Honestly, I just really like this project and think we should go for it.", "I'd do a strong case for approving this initiative."],
        whyItWorks: "Convierte una opinión tibia en una recomendación con autoridad. 'Greenlight' es el verbo estándar para aprobar un proyecto." },

      { id: "B1-002", tone: "natural", domain: "finance",
        plain: "We spent too much money this quarter.",
        c1: "We overran our budget this quarter, so we'll need to tighten our belts in Q4.",
        chunks: ["overrun the budget", "tighten our belts"],
        distractors: ["We spent way too much this quarter, which is a total disaster.", "We've overspent this quarter, so we'll have to tight our belts in Q4."],
        whyItWorks: "Nombra el problema con precisión (budget overrun) y lo une a la acción correctiva en la misma frase." },

      { id: "B1-003", tone: "natural", domain: "leadership",
        plain: "I don't agree with you.",
        c1: "I see where you're coming from, but I'd push back on that assumption.",
        chunks: ["see where you're coming from", "push back on"],
        distractors: ["That's just not true, and I think you know it.", "I see your point, but I'd discuss that assumption."],
        whyItWorks: "Primero validas a la persona y después cuestionas la idea, no a la persona. Es la forma de discrepar en un comité de dirección." },

      { id: "B1-004", tone: "natural", domain: "operations",
        plain: "There is a problem with the delivery.",
        c1: "We've hit a snag with the rollout, but we're already working on a fix.",
        chunks: ["hit a snag", "rollout", "work on a fix"],
        distractors: ["There's been a massive issue with the rollout, unfortunately.", "We've found a snag in the rollout and we don't really know what to do yet."],
        whyItWorks: "'Hit a snag' quita dramatismo al problema, y la segunda parte de la frase transmite control." },

      { id: "B1-005", tone: "formal", domain: "data",
        plain: "The numbers are going up.",
        c1: "The figures are trending upwards, driven largely by repeat customers.",
        chunks: ["trend upwards", "driven largely by"],
        distractors: ["The numbers keep going up, which is great news.", "The figures are trending upwards, driven mostly for repeat customers."],
        whyItWorks: "Un ejecutivo no se queda en el qué, explica también el porqué ('driven by'). Así da la tendencia y su causa a la vez." },

      { id: "B1-006", tone: "buzzword", domain: "strategy",
        plain: "We need to think about the future.",
        c1: "We need to future-proof the business against shifts in demand.",
        chunks: ["future-proof", "shifts in demand"],
        distractors: ["We need to think about the future of the business more seriously.", "We need to future-proof the business in front of shifts in demand."],
        whyItWorks: "'Future-proof' es un verbo de acción, no de reflexión. Además, concreta el riesgo del que te proteges." },

      { id: "B1-007", tone: "natural", domain: "stakeholders",
        plain: "Can you help me with this?",
        c1: "Could I lean on your expertise here?",
        chunks: ["lean on someone's expertise"],
        distractors: ["You're the expert, so you should probably do this one.", "Could I support on your expertise here?"],
        whyItWorks: "Pides ayuda reconociendo el valor del otro. Así es mucho más fácil conseguir colaboración de un perfil senior." },

      { id: "B1-008", tone: "buzzword", domain: "leadership",
        plain: "This is very important.",
        c1: "This is mission-critical, so it needs to sit at the top of our agenda.",
        chunks: ["mission-critical", "top of the agenda"],
        distractors: ["This is super important, guys.", "This is critical, so it needs to be at the head of our agenda."],
        whyItWorks: "Sustituye un intensificador vacío ('very') por un término con peso y una consecuencia operativa." },

      { id: "B1-009", tone: "formal", domain: "operations",
        plain: "We will finish late.",
        c1: "We're tracking behind schedule; I'd now forecast delivery for mid-March.",
        chunks: ["track behind schedule", "forecast delivery for"],
        distractors: ["We're going to be late again, I'm afraid.", "We're running behind plan; I'd now prevent delivery for mid-March."],
        whyItWorks: "Comunicas el retraso y das ya una nueva fecha. A la dirección le preocupa más la falta de visibilidad que el retraso." },

      { id: "B1-010", tone: "formal", domain: "finance",
        plain: "We made more money than expected.",
        c1: "We outperformed forecasts, with revenue coming in 8% ahead of target.",
        chunks: ["outperform forecasts", "come in ahead of target"],
        distractors: ["We made way more money than anyone expected!", "We overcame forecasts, with revenue coming in 8% above target."],
        whyItWorks: "Un dato concreto (8%) y el vocabulario estándar de reporting financiero." },

      { id: "B1-011", tone: "natural", domain: "strategy",
        plain: "Let's talk about this later.",
        c1: "Let's park this for now and revisit it once we have more data.",
        chunks: ["park something", "revisit"],
        distractors: ["Let's leave this for another day.", "Let's park this for now and revise it once we have more data."],
        whyItWorks: "'Park' aplaza el tema sin descartarlo. Además pones una condición para volver a él." },

      { id: "B1-012", tone: "formal", domain: "stakeholders",
        plain: "I'm sorry for the mistake.",
        c1: "I take full ownership of the error, and here's how we'll prevent a recurrence.",
        chunks: ["take full ownership of", "prevent a recurrence"],
        distractors: ["It wasn't really my fault, but I'll fix it.", "I assume the error completely, and here's how we'll prevent a recurrence."],
        whyItWorks: "Asumir la responsabilidad y pasar a la solución proyecta liderazgo. Pedir perdón varias veces lo resta." },

      { id: "B1-013", tone: "formal", domain: "data",
        plain: "The data is not good.",
        c1: "The data quality is patchy, so I'd treat these conclusions as directional.",
        chunks: ["patchy", "directional"],
        distractors: ["The data is rubbish, so don't trust any of this.", "The data quality is patchy, so I'd treat these conclusions as orientative."],
        whyItWorks: "No desacredita el análisis, lo matiza. 'Directional' significa que indica una tendencia pero no es concluyente." },

      { id: "B1-014", tone: "buzzword", domain: "leadership",
        plain: "Good job, team.",
        c1: "Great work, everyone — this really moved the needle for us.",
        chunks: ["move the needle"],
        distractors: ["Not bad, everyone.", "Congratulations for the great work, team."],
        whyItWorks: "Reconoce el impacto en el negocio, no solo el esfuerzo. Ese reconocimiento motiva más." },

      { id: "B1-015", tone: "buzzword", domain: "strategy",
        plain: "We have to choose what is most important.",
        c1: "We need to prioritise ruthlessly and focus on the highest-impact levers.",
        chunks: ["prioritise ruthlessly", "high-impact levers"],
        distractors: ["We'll just have to do everything at once and hope for the best.", "We need to prioritise and focus on the actions of more impact."],
        whyItWorks: "'Levers' (palancas) es vocabulario de estrategia. 'Ruthlessly' transmite que asumes renunciar a cosas." },

      { id: "B1-016", tone: "natural", domain: "operations",
        plain: "Let's start.",
        c1: "Let's kick things off with a quick status update.",
        chunks: ["kick things off", "status update"],
        distractors: ["Right, let's get this over with.", "Let's start with a quick actualisation of the status."],
        whyItWorks: "Abre la reunión con energía y marca ya la agenda." },

      { id: "B1-017", tone: "formal", domain: "stakeholders",
        plain: "Please answer me soon.",
        c1: "I'd appreciate your input by close of business Thursday so we can keep things moving.",
        chunks: ["by close of business", "keep things moving"],
        distractors: ["I need your answer ASAP.", "I'd appreciate your input until Thursday so we can keep things moving."],
        whyItWorks: "Pone un plazo concreto y explica por qué importa. Suena firme sin ser brusco." },

      { id: "B1-018", tone: "formal", domain: "finance",
        plain: "This is too expensive.",
        c1: "The cost is hard to justify unless we can demonstrate a clear return on investment.",
        chunks: ["hard to justify", "demonstrate a clear ROI"],
        distractors: ["It's way too expensive, so forget it.", "The cost is hard to justify unless we can demonstrate a clear rentability."],
        whyItWorks: "Pasa del precio al valor y deja la puerta abierta si se demuestra el ROI." },

      { id: "B1-019", tone: "buzzword", domain: "data",
        plain: "I don't know yet.",
        c1: "I don't have visibility on that yet, but I'll circle back by Friday.",
        chunks: ["have visibility on", "circle back"],
        distractors: ["No idea, to be honest.", "I don't have visibility on that yet, but I'll come back to you in Friday."],
        whyItWorks: "Admite que no tienes la información sin parecer desinformado y te compromete a una fecha." },

      { id: "B1-020", tone: "formal", domain: "leadership",
        plain: "I want to be promoted.",
        c1: "I'd like to discuss a path to the next level and what success would look like in that role.",
        chunks: ["path to the next level", "what success looks like"],
        distractors: ["I deserve a promotion and I want it this year.", "I'd like to discuss my promotion and what would be my objectives in that role."],
        whyItWorks: "Plantea el ascenso como una conversación sobre criterios y no como una exigencia." },

      { id: "B1-021", tone: "buzzword", domain: "strategy",
        plain: "Our competitors are better.",
        c1: "Our competitors have gained ground, so we need to sharpen our value proposition.",
        chunks: ["gain ground", "sharpen our value proposition"],
        distractors: ["Our competitors are just better than us right now.", "Our competence has gained ground, so we need to sharpen our value proposition."],
        whyItWorks: "Reconoce la amenaza y propone una respuesta. Ojo: en inglés 'competence' no significa 'la competencia'." },

      { id: "B1-022", tone: "natural", domain: "operations",
        plain: "We don't have enough people.",
        c1: "We're stretched thin; without additional headcount, something will have to give.",
        chunks: ["stretched thin", "headcount", "something has to give"],
        distractors: ["We're completely overwhelmed and it's not fair.", "We're short of hands; without more personal, something will have to give."],
        whyItWorks: "'Headcount' es la palabra de presupuestos de personal. 'Something has to give' plantea el dilema sin quejarse." },

      { id: "B1-023", tone: "buzzword", domain: "stakeholders",
        plain: "Do you understand?",
        c1: "Does that land, or would it help if I unpacked it a bit further?",
        chunks: ["does that land", "unpack"],
        distractors: ["Is that understood, or do I need to repeat it?", "Is it clear, or do you want that I explain it better?"],
        whyItWorks: "Asumes tú la responsabilidad de explicarte bien. 'Do you understand?' puede sonar condescendiente." },

      { id: "B1-024", tone: "formal", domain: "finance",
        plain: "Sales are going down.",
        c1: "Sales have softened, largely on the back of weaker demand in Southern Europe.",
        chunks: ["soften", "on the back of"],
        distractors: ["Sales are down, and it's Southern Europe's fault.", "Sales have softened, largely due to a weaker demand in Southern Europe."],
        whyItWorks: "'Soften' es un verbo neutro y profesional. 'On the back of' introduce la causa." },

      { id: "B1-025", tone: "natural", domain: "data",
        plain: "This graph shows that customers leave.",
        c1: "What this chart tells us is that churn is concentrated in the first 90 days.",
        chunks: ["what this tells us is", "churn", "concentrated in"],
        distractors: ["This chart is about churn.", "This graphic shows us that churn concentrates in the first 90 days."],
        whyItWorks: "La estructura 'What X tells us is…' pone el foco en el insight. 'Churn' es el término técnico." },

      { id: "B1-026", tone: "formal", domain: "leadership",
        plain: "That's a bad idea.",
        c1: "I have some reservations about this approach, mainly around scalability.",
        chunks: ["have reservations about", "mainly around"],
        distractors: ["This approach won't work. Full stop.", "I have some doubts about this approach, mainly in the scalability topic."],
        whyItWorks: "Expresa el desacuerdo de forma diplomática y lo concreta en un punto que se puede debatir." },

      { id: "B1-027", tone: "buzzword", domain: "strategy",
        plain: "Let's try it small and cheap first.",
        c1: "Let's pilot it with a lean MVP before committing significant resources.",
        chunks: ["pilot", "lean MVP", "commit resources"],
        distractors: ["Let's just try it and see what happens.", "Let's do a pilot test small and cheap before investing a lot."],
        whyItWorks: "Reduce el riesgo con vocabulario de producto que entiende cualquier comité de inversión." },

      { id: "B1-028", tone: "natural", domain: "operations",
        plain: "Everyone must do their part.",
        c1: "This will only work if every team pulls its weight and stays aligned on the timeline.",
        chunks: ["pull one's weight", "stay aligned on"],
        distractors: ["If people don't do their jobs, this will fail.", "This will only work if every team puts its grain of sand and respects the timeline."],
        whyItWorks: "Responsabiliza a todos sin señalar a nadie y lo vincula a un objetivo común." },

      { id: "B1-029", tone: "natural", domain: "stakeholders",
        plain: "I will tell you the news.",
        c1: "I'll keep you posted as things develop.",
        chunks: ["keep someone posted", "as things develop"],
        distractors: ["I'll let you know if I remember.", "I'll keep you informed of the novelties."],
        whyItWorks: "Es un compromiso natural de comunicación continua. Ojo: 'novelties' no significa 'novedades'." },

      { id: "B1-030", tone: "formal", domain: "finance",
        plain: "We need more money for this.",
        c1: "We'll need to secure additional funding to see this through.",
        chunks: ["secure funding", "see something through"],
        distractors: ["We need more money, otherwise forget it.", "We'll need to get additional financing to carry this to term."],
        whyItWorks: "'Secure' implica gestión activa. 'See it through' transmite compromiso hasta el final." }
    ],

    /* ------------------------------------------------------------------------
     * BLOQUE 2 · Phrasal Verbs & Colocaciones
     * --------------------------------------------------------------------- */
    collocations: [
      { id: "B2-001", domain: "finance", type: "phrasal",
        sentence: "We need to ___ discretionary spending before Q4.",
        answer: "rein in", options: ["rein in", "cut out", "hold up", "pull off"],
        meaningEs: "Contener, frenar (gastos, costes)",
        example: "The CFO moved quickly to rein in costs across all business units." },

      { id: "B2-002", domain: "strategy", type: "phrasal",
        sentence: "We've decided to ___ our low-margin product lines over the next 18 months.",
        answer: "phase out", options: ["phase out", "play down", "back up", "set off"],
        meaningEs: "Eliminar progresivamente",
        example: "Legacy systems will be phased out by the end of the year." },

      { id: "B2-003", domain: "operations", type: "phrasal",
        sentence: "Can you ___ the remaining details with the vendor before we sign?",
        answer: "iron out", options: ["iron out", "hand out", "rule out", "wear out"],
        meaningEs: "Limar, resolver (detalles, problemas)",
        example: "We still need to iron out a few issues in the contract." },

      { id: "B2-004", domain: "stakeholders", type: "phrasal",
        sentence: "I'll ___ with the client after the call to confirm next steps.",
        answer: "follow up", options: ["follow up", "catch on", "look up", "take after"],
        meaningEs: "Hacer seguimiento",
        example: "Thanks for today — I'll follow up with a summary by email." },

      { id: "B2-005", domain: "leadership", type: "phrasal",
        sentence: "The new CEO is expected to ___ a major restructuring despite union opposition.",
        answer: "push through", options: ["push through", "go off", "run into", "take over"],
        meaningEs: "Sacar adelante (a pesar de la resistencia)",
        example: "She managed to push through the reforms in under a year." },

      { id: "B2-006", domain: "data", type: "phrasal",
        sentence: "Let's ___ the figures by region to see where the drop is coming from.",
        answer: "break down", options: ["break down", "break up", "break in", "break off"],
        meaningEs: "Desglosar",
        example: "Could you break down the costs by department?" },

      { id: "B2-007", domain: "finance", type: "phrasal",
        sentence: "Rising logistics costs are ___ our margins.",
        answer: "eating into", options: ["eating into", "giving in", "falling for", "getting over"],
        meaningEs: "Comerse, reducir (márgenes, beneficios)",
        example: "Inflation is eating into consumers' disposable income." },

      { id: "B2-008", domain: "strategy", type: "phrasal",
        sentence: "We had to ___ the acquisition due to regulatory risk.",
        answer: "pull out of", options: ["pull out of", "put up with", "run out of", "pull through"],
        meaningEs: "Retirarse de (un acuerdo, una operación)",
        example: "The investor pulled out of the deal at the last minute." },

      { id: "B2-009", domain: "operations", type: "phrasal",
        sentence: "We plan to ___ the new process across all sites by June.",
        answer: "roll out", options: ["roll out", "turn out", "carry on", "drop off"],
        meaningEs: "Implantar, desplegar",
        example: "The update will be rolled out in three phases." },

      { id: "B2-010", domain: "stakeholders", type: "phrasal",
        sentence: "I'd like to ___ a point Maria made earlier about pricing.",
        answer: "pick up on", options: ["pick up on", "come up with", "put off", "get away with"],
        meaningEs: "Retomar (un punto mencionado antes)",
        example: "Just to pick up on what Tom said — the timeline is tight." },

      { id: "B2-011", domain: "leadership", type: "phrasal",
        sentence: "We can't ___ this decision any longer; the board meets on Monday.",
        answer: "put off", options: ["put off", "put on", "take off", "set up"],
        meaningEs: "Posponer, aplazar",
        example: "Don't put off difficult conversations — they only get harder." },

      { id: "B2-012", domain: "data", type: "phrasal",
        sentence: "The results of the pilot ___ our initial hypothesis.",
        answer: "bore out", options: ["bore out", "gave away", "called off", "turned down"],
        meaningEs: "Confirmar, corroborar",
        example: "The data bears out what customers have been telling us." },

      { id: "B2-013", domain: "finance", type: "phrasal",
        sentence: "We'll draw on reserves to ___ the €200k shortfall.",
        answer: "make up", options: ["make up", "take up", "keep up", "show up"],
        meaningEs: "Cubrir, compensar (un déficit)",
        example: "Strong Q4 sales should make up for the slow start." },

      { id: "B2-014", domain: "strategy", type: "phrasal",
        sentence: "We need to ___ the growing demand for sustainable products.",
        answer: "tap into", options: ["tap into", "back into", "run into", "bump into"],
        meaningEs: "Aprovechar, explotar (una demanda, un mercado)",
        example: "The campaign taps into a strong sense of nostalgia." },

      { id: "B2-015", domain: "operations", type: "collocation",
        sentence: "Despite the delays, we still managed to ___ the deadline.",
        answer: "meet", options: ["meet", "reach", "arrive", "achieve"],
        meaningEs: "Cumplir (un plazo): meet a deadline",
        example: "We're confident we can meet the revised deadline." },

      { id: "B2-016", domain: "strategy", type: "collocation",
        sentence: "Digital channels will ___ growth over the next three years.",
        answer: "drive", options: ["drive", "conduct", "carry", "provoke"],
        meaningEs: "Impulsar (crecimiento, ventas, adopción)",
        example: "Product innovation continues to drive revenue growth." },

      { id: "B2-017", domain: "strategy", type: "collocation",
        sentence: "Proprietary data could help us ___ a competitive edge.",
        answer: "gain", options: ["gain", "catch", "take", "win out"],
        meaningEs: "Obtener una ventaja competitiva",
        example: "Early adopters gained a significant competitive edge." },

      { id: "B2-018", domain: "stakeholders", type: "collocation",
        sentence: "We need to ___ the client's expectations from day one.",
        answer: "manage", options: ["manage", "control", "conduct", "direct"],
        meaningEs: "Gestionar expectativas",
        example: "Managing stakeholder expectations is half the job." },

      { id: "B2-019", domain: "leadership", type: "collocation",
        sentence: "Before launching, we need to ___ buy-in from senior leadership.",
        answer: "secure", options: ["secure", "catch", "reach", "take"],
        meaningEs: "Conseguir el apoyo (buy-in) de alguien",
        example: "Securing buy-in early saved us months of debate." },

      { id: "B2-020", domain: "data", type: "collocation",
        sentence: "We should ___ an A/B test before scaling the new checkout.",
        answer: "run", options: ["run", "realise", "carry", "pass"],
        meaningEs: "Hacer (ejecutar) un test o análisis",
        example: "Let's run the numbers before we commit." },

      { id: "B2-021", domain: "finance", type: "collocation",
        sentence: "Consolidating suppliers will ___ significant cost savings.",
        answer: "deliver", options: ["deliver", "give out", "bring off", "provoke"],
        meaningEs: "Generar, aportar (ahorros, resultados)",
        example: "The programme delivered €3M in savings in its first year." },

      { id: "B2-022", domain: "operations", type: "collocation",
        sentence: "Our first priority is to ___ the bottleneck in fulfilment.",
        answer: "address", options: ["address", "attend", "assist", "direct"],
        meaningEs: "Abordar (un problema)",
        example: "The new policy addresses the main concerns raised by staff." },

      { id: "B2-023", domain: "strategy", type: "collocation",
        sentence: "We need to ___ a hard look at our pricing model.",
        answer: "take", options: ["take", "make", "do", "give"],
        meaningEs: "Analizar algo a fondo y con honestidad",
        example: "It's time to take a hard look at our cost base." },

      { id: "B2-024", domain: "stakeholders", type: "idiom",
        sentence: "Let me ___ the record straight on the budget figures.",
        answer: "set", options: ["set", "put", "make", "leave"],
        meaningEs: "Aclarar las cosas, deshacer un malentendido",
        example: "I want to set the record straight: no jobs are at risk." },

      { id: "B2-025", domain: "leadership", type: "idiom",
        sentence: "Let's ___ the ball rolling on the hiring plan this week.",
        answer: "get", options: ["get", "put", "make", "take"],
        meaningEs: "Poner algo en marcha",
        example: "To get the ball rolling, I'll share a first draft." },

      { id: "B2-026", domain: "data", type: "collocation",
        sentence: "The uplift is small but statistically ___.",
        answer: "significant", options: ["significant", "relevant", "notable", "considerable"],
        meaningEs: "Estadísticamente significativo",
        example: "We found no statistically significant difference between groups." },

      { id: "B2-027", domain: "finance", type: "phrasal",
        sentence: "The board ___ the proposal due to cost concerns.",
        answer: "turned down", options: ["turned down", "turned up", "turned over", "turned in"],
        meaningEs: "Rechazar",
        example: "She turned down the offer to join the competitor." },

      { id: "B2-028", domain: "operations", type: "phrasal",
        sentence: "We've ___ capacity issues at the Madrid plant.",
        answer: "run into", options: ["run into", "run over", "run through", "run by"],
        meaningEs: "Toparse con (problemas)",
        example: "If you run into any issues, let me know." },

      { id: "B2-029", domain: "strategy", type: "idiom",
        sentence: "We need to stop ___ and make a decision on the market entry.",
        answer: "sitting on the fence", options: ["sitting on the fence", "cutting corners", "breaking the ice", "raising the bar"],
        meaningEs: "No posicionarse, no decidirse",
        example: "You can't sit on the fence forever on this one." },

      { id: "B2-030", domain: "leadership", type: "phrasal",
        sentence: "Could you ___ for me at tomorrow's steering committee?",
        answer: "stand in", options: ["stand in", "stand by", "stand out", "stand up"],
        meaningEs: "Sustituir a alguien (stand in for someone)",
        example: "Our COO will stand in for the CEO at the conference." }
    ],

    /* ------------------------------------------------------------------------
     * BLOQUE 3 · Advanced Trap
     * spanishSource: lo que quieres decir. right: correcta. wrong + alt: trampas.
     * --------------------------------------------------------------------- */
    traps: [
      { id: "B3-001", domain: "operations", category: "false_friend",
        spanishSource: "Realizaremos la auditoría el mes que viene.",
        right: "We will carry out the audit next month.",
        wrong: "We will realize the audit next month.",
        alt: "We will make the audit next month.",
        trap: "'Realize' significa darse cuenta. 'Realizar' se traduce como carry out o conduct." },

      { id: "B3-002", domain: "stakeholders", category: "false_friend",
        spanishSource: "Actualmente tenemos 50 clientes.",
        right: "We currently have 50 clients.",
        wrong: "Actually, we have 50 clients.",
        alt: "Actually, we are having 50 clients.",
        trap: "'Actually' significa en realidad. 'Actualmente' es currently o at present." },

      { id: "B3-003", domain: "finance", category: "false_friend",
        spanishSource: "Eventualmente podríamos necesitar más presupuesto.",
        right: "We might need additional budget at some point.",
        wrong: "We could eventually need more budget.",
        alt: "We could casually need more budget.",
        trap: "'Eventually' significa finalmente o al final. Para 'eventualmente/posiblemente' usa might, possibly o if needed." },

      { id: "B3-004", domain: "leadership", category: "false_friend",
        spanishSource: "Diez directivos asistieron a la reunión.",
        right: "Ten managers attended the meeting.",
        wrong: "Ten managers assisted the meeting.",
        alt: "Ten managers assisted to the meeting.",
        trap: "'Assist' significa ayudar. 'Asistir a' es attend, sin preposición." },

      { id: "B3-005", domain: "data", category: "calque",
        spanishSource: "¿Me puedes explicar las cifras?",
        right: "Could you walk me through the figures?",
        wrong: "Can you explain me the figures?",
        alt: "Can you explain to me about the figures?",
        trap: "'Explain' no admite el objeto de persona directo: se dice explain something to someone. Más natural en un entorno corporativo: walk me through." },

      { id: "B3-006", domain: "finance", category: "calque",
        spanishSource: "Depende del presupuesto.",
        right: "It depends on the budget.",
        wrong: "It depends of the budget.",
        alt: "It depends from the budget.",
        trap: "'Depend' siempre va con on (o upon), nunca con 'of'." },

      { id: "B3-007", domain: "stakeholders", category: "calque",
        spanishSource: "¿Puedo hacer una pregunta?",
        right: "Can I ask a question?",
        wrong: "Can I make a question?",
        alt: "Can I do a question?",
        trap: "Las preguntas se 'ask', no se 'make'. Es una colocación fija." },

      { id: "B3-008", domain: "data", category: "false_friend",
        spanishSource: "Son datos sensibles, trátalos con cuidado.",
        right: "This is sensitive data, so please handle it with care.",
        wrong: "This is sensible data, so please handle it with care.",
        alt: "This is sensibly data, so please handle it with care.",
        trap: "'Sensible' significa sensato. 'Sensible' en el sentido de delicado o confidencial es sensitive." },

      { id: "B3-009", domain: "stakeholders", category: "false_friend",
        spanishSource: "Tenemos el compromiso de entregar a tiempo.",
        right: "We are committed to delivering on time.",
        wrong: "We have a compromise to deliver on time.",
        alt: "We are compromised to deliver on time.",
        trap: "'Compromise' es una concesión mutua, y 'compromised' significa comprometido en el sentido de puesto en peligro. 'Compromiso' (obligación) es commitment." },

      { id: "B3-010", domain: "strategy", category: "calque",
        spanishSource: "Tenemos que hablar de la estrategia.",
        right: "We need to discuss the strategy.",
        wrong: "We need to discuss about the strategy.",
        alt: "We need to discuss of the strategy.",
        trap: "'Discuss' es transitivo y no lleva preposición. Con 'about' tienes talk about." },

      { id: "B3-011", domain: "data", category: "nuance",
        spanishSource: "Te envío la información.",
        right: "I'll send you the information.",
        wrong: "I'll send you the informations.",
        alt: "I'll send you an information.",
        trap: "'Information' es incontable: no tiene plural ni admite 'an'. Para una sola, di a piece of information. Pasa lo mismo con advice, feedback y equipment." },

      { id: "B3-012", domain: "leadership", category: "calque",
        spanishSource: "La gente está muy motivada.",
        right: "Our people are highly motivated.",
        wrong: "The people is very motivated.",
        alt: "The people are much motivated.",
        trap: "'People' es plural (are). Y en sentido general no lleva 'the'. 'Highly motivated' es la colocación C1." },

      { id: "B3-013", domain: "strategy", category: "false_friend",
        spanishSource: "La situación actual es crítica.",
        right: "The current situation is critical.",
        wrong: "The actual situation is critical.",
        alt: "The actually situation is critical.",
        trap: "'Actual' significa real o efectivo. 'Actual' en el sentido de presente es current." },

      { id: "B3-014", domain: "stakeholders", category: "false_friend",
        spanishSource: "Te aviso cuando esté listo el informe.",
        right: "I'll let you know when the report is ready.",
        wrong: "I'll advise you when the report is ready.",
        alt: "I'll notice you when the report is ready.",
        trap: "'Advise' significa aconsejar y 'notice', darse cuenta. 'Avisar' es let someone know." },

      { id: "B3-015", domain: "leadership", category: "calque",
        spanishSource: "Trabajo aquí desde hace dos años.",
        right: "I've been working here for two years.",
        wrong: "I work here since two years.",
        alt: "I'm working here for two years.",
        trap: "Una acción que empezó en el pasado y continúa va en present perfect continuous + for (duración) o since (punto de inicio)." },

      { id: "B3-016", domain: "data", category: "nuance",
        spanishSource: "Tenemos que controlar los KPIs cada semana.",
        right: "We need to monitor the KPIs every week.",
        wrong: "We need to control the KPIs every week.",
        alt: "We need to dominate the KPIs every week.",
        trap: "'Control' significa dominar o mandar sobre algo. 'Controlar' en el sentido de supervisar es monitor, track o keep an eye on." },

      { id: "B3-017", domain: "leadership", category: "false_friend",
        spanishSource: "Estudié la carrera de Economía.",
        right: "I did a degree in Economics.",
        wrong: "I studied the career of Economics.",
        alt: "I studied a race of Economics.",
        trap: "'Career' es la trayectoria profesional. La carrera universitaria es degree." },

      { id: "B3-018", domain: "finance", category: "calque",
        spanishSource: "La empresa ganó mucho dinero el año pasado.",
        right: "The company made a lot of money last year.",
        wrong: "The company won a lot of money last year.",
        alt: "The company gained a lot of money last year.",
        trap: "'Win' se usa para premios y concursos. El dinero se make, se earn, o se generate (revenue)." },

      { id: "B3-019", domain: "operations", category: "false_friend",
        spanishSource: "Déjame mirar mi agenda.",
        right: "Let me check my calendar.",
        wrong: "Let me check my agenda.",
        alt: "Let me check my notebook of dates.",
        trap: "'Agenda' es el orden del día de una reunión. Tu agenda personal es calendar o diary (BrE)." },

      { id: "B3-020", domain: "stakeholders", category: "register",
        spanishSource: "(Email a un VP) Quiero el informe para mañana.",
        right: "Could I ask you to share the report by tomorrow?",
        wrong: "I want the report tomorrow.",
        alt: "Give me the report tomorrow, please.",
        trap: "'I want' suena exigente o infantil en inglés profesional. Ni siquiera 'please' arregla un imperativo dirigido hacia arriba en la jerarquía." },

      { id: "B3-021", domain: "data", category: "calque",
        spanishSource: "El 30% de nuestros clientes está en España.",
        right: "30% of our clients are in Spain.",
        wrong: "The 30% of our clients are in Spain.",
        alt: "A 30% of our clients is in Spain.",
        trap: "Los porcentajes no llevan artículo en inglés. El verbo concuerda con el sustantivo: clients are." },

      { id: "B3-022", domain: "stakeholders", category: "false_friend",
        spanishSource: "Tengo que atender a un cliente.",
        right: "I need to deal with a client.",
        wrong: "I need to attend a client.",
        alt: "I need to attend to a meeting.",
        trap: "'Attend' significa asistir a un evento. 'Atender a alguien' es deal with, see to o look after." },

      { id: "B3-023", domain: "leadership", category: "false_friend",
        spanishSource: "La empresa ofrece mucha formación.",
        right: "The company offers a lot of training.",
        wrong: "The company offers a lot of formation.",
        alt: "The company offers a lot of formations.",
        trap: "'Formation' es una formación en el sentido de estructura o alineación. Formación profesional es training (o learning & development)." },

      { id: "B3-024", domain: "strategy", category: "false_friend",
        spanishSource: "El lanzamiento fue un gran éxito.",
        right: "The launch was a huge success.",
        wrong: "The launch was a great exit.",
        alt: "The launch was a great succeed.",
        trap: "'Exit' es salida (y en M&A, la venta de una participación). Éxito es success." },

      { id: "B3-025", domain: "leadership", category: "calque",
        spanishSource: "Estoy de acuerdo con tu propuesta.",
        right: "I agree with your proposal.",
        wrong: "I am agree with your proposal.",
        alt: "I'm according with your proposal.",
        trap: "'Agree' es un verbo, no un adjetivo, así que no lleva 'am'. Es uno de los errores que más delata a un hispanohablante." },

      { id: "B3-026", domain: "stakeholders", category: "nuance",
        spanishSource: "Me dijo que el acuerdo estaba cerrado.",
        right: "She told me the deal had been closed.",
        wrong: "She said me that the deal was closed.",
        alt: "She told to me that the deal was closed.",
        trap: "Say something (to someone), pero tell someone something. Nunca se dice 'say me'." },

      { id: "B3-027", domain: "strategy", category: "calque",
        spanishSource: "Te propongo que revises el contrato.",
        right: "I'd suggest you review the contract.",
        wrong: "I propose you to review the contract.",
        alt: "I suggest you to review the contract.",
        trap: "'Suggest' nunca va con objeto + infinitivo. Correcto: suggest (that) you review o suggest reviewing." },

      { id: "B3-028", domain: "operations", category: "register",
        spanishSource: "Le escribo para informarle del retraso.",
        right: "I'm writing to let you know about the delay.",
        wrong: "I write you to inform about the delay.",
        alt: "I'm writing you for inform the delay.",
        trap: "Se usa present continuous (I'm writing), el infinitivo de finalidad es 'to' + verbo e 'inform' necesita objeto: inform you of." },

      { id: "B3-029", domain: "finance", category: "nuance",
        spanishSource: "Los ingresos alcanzaron 3.000 millones de euros.",
        right: "Revenue reached €3 billion.",
        wrong: "Revenue reached 3 thousand millions of euros.",
        alt: "Revenue reached 3 billions euros.",
        trap: "1.000 millones = one billion. 'Billion' no lleva -s detrás de un número. Cuidado: un billón español = one trillion." },

      { id: "B3-030", domain: "operations", category: "false_friend",
        spanishSource: "Estamos construyendo una nueva fábrica en Polonia.",
        right: "We're building a new plant in Poland.",
        wrong: "We're building a new fabric in Poland.",
        alt: "We're building a new manufacture in Poland.",
        trap: "'Fabric' significa tela. Fábrica es plant, factory o manufacturing facility." },

      { id: "B3-031", domain: "everyday", category: "false_friend",
        spanishSource: "Estoy constipado.",
        right: "I've got a cold.",
        wrong: "I'm constipated.",
        alt: "I'm cold.",
        trap: "'Constipated' significa estreñido. Resfriado = have (got) a cold. 'I'm cold' = tengo frío." },

      { id: "B3-032", domain: "social", category: "calque",
        spanishSource: "Tengo 30 años.",
        right: "I'm 30.",
        wrong: "I have 30 years.",
        alt: "I've got 30 years old.",
        trap: "La edad va con 'be': I'm 30 (years old)." },

      { id: "B3-033", domain: "everyday", category: "nuance",
        spanishSource: "Estoy aburrido.",
        right: "I'm bored.",
        wrong: "I'm boring.",
        alt: "I'm in boredom.",
        trap: "-ed = cómo te sientes (bored); -ing = cómo eres o cómo es algo. 'I'm boring' = soy aburrido." },

      { id: "B3-034", domain: "social", category: "false_friend",
        spanishSource: "Discutí con mi hermano.",
        right: "I had an argument with my brother.",
        wrong: "I discussed with my brother.",
        alt: "I argued my brother.",
        trap: "'Discuss' = hablar de un tema, sin pelea (y sin 'with' ni 'about'). Discutir, pelearse = argue with / have an argument with." },

      { id: "B3-035", domain: "social", category: "calque",
        spanishSource: "Éramos diez en la cena.",
        right: "There were ten of us at dinner.",
        wrong: "We were ten people at the dinner.",
        alt: "We were ten at the dinner.",
        trap: "Para contar personas: 'There were ten of us'." },

      { id: "B3-036", domain: "social", category: "false_friend",
        spanishSource: "Mis vecinos son muy simpáticos.",
        right: "My neighbours are really nice.",
        wrong: "My neighbours are very sympathetic.",
        alt: "My neighbours are very simpatic.",
        trap: "'Sympathetic' = comprensivo (que muestra compasión). Simpático = nice, friendly." },

      { id: "B3-037", domain: "social", category: "calque",
        spanishSource: "¿Lo pasaste bien?",
        right: "Did you have a good time?",
        wrong: "Did you pass it well?",
        alt: "Did you enjoy?",
        trap: "'Enjoy' necesita objeto ('Did you enjoy it?'). Lo más natural: 'Did you have a good time?'." },

      { id: "B3-038", domain: "everyday", category: "false_friend",
        spanishSource: "Fui a la librería a comprar un libro.",
        right: "I went to the bookshop to buy a book.",
        wrong: "I went to the library to buy a book.",
        alt: "I went to the bookshop for buy a book.",
        trap: "'Library' = biblioteca (se presta, no se compra). Librería = bookshop (UK) / bookstore (US). Finalidad: 'to buy', no 'for buy'." },

      { id: "B3-039", domain: "everyday", category: "calque",
        spanishSource: "El fin de semana pasado fui a la playa.",
        right: "Last weekend I went to the beach.",
        wrong: "The last weekend I went to the beach.",
        alt: "The weekend past I went to the beach.",
        trap: "Con last/next + tiempo no hay artículo: last weekend, next Monday. 'The last weekend' = el último fin de semana de una serie." },

      { id: "B3-040", domain: "everyday", category: "false_friend",
        spanishSource: "Me hace mucha ilusión el viaje.",
        right: "I'm really looking forward to the trip.",
        wrong: "The trip makes me a lot of illusion.",
        alt: "I have a big illusion for the trip.",
        trap: "'Illusion' = espejismo, engaño. Hacer ilusión = look forward to / be excited about." }
    ],

    /* ------------------------------------------------------------------------
     * BLOQUE 4 · Micro-Reto de Producción
     * --------------------------------------------------------------------- */
    challenges: [
      { id: "B4-002", domain: "leadership", scenario: "conflict",
        brief: "Dos team leads se enfrentan en una reunión por el mismo recurso: un data engineer senior. Intervén y desbloquea la situación.",
        mustUse: [ { t: "take a step back", m: "take a step back" }, { t: "common ground", m: "common ground" }, { t: "trade-off", m: "trade.?offs?" } ],
        framework: ["Baja la tensión", "Reformula el objetivo común", "Explicita el trade-off", "Propón un mecanismo de decisión"],
        modelAnswer: "Let's take a step back for a moment. You both want the same thing — to hit the Q1 launch — so there's more common ground here than it seems. The real trade-off is speed on the pricing model versus stability on the data pipeline. My proposal: we split his time 60/40 for the next two sprints, review the impact at the retro, and escalate only if one of the milestones slips.",
        selfCheck: ["¿Rebajaste la tensión antes de entrar en el fondo?", "¿Nombraste el trade-off de forma neutral?", "¿Propusiste un criterio de decisión claro?"] },

      { id: "B4-003", domain: "operations", scenario: "exec_update",
        brief: "Te cruzas con la CEO en el ascensor. Pregunta por el proyecto ERP, que lleva tres semanas de retraso. Update de 60 segundos.",
        mustUse: [ { t: "bottom line", m: "bottom line" }, { t: "behind schedule", m: "behind schedule" }, { t: "on your radar", m: "on your radar" } ],
        framework: ["Conclusión primero (BLUF)", "Causa en una frase", "Qué estás haciendo", "Qué necesitas (si algo)"],
        modelAnswer: "The bottom line is we're three weeks behind schedule, but the go-live in April is still achievable. The delay comes from data migration, which turned out messier than scoped. We've brought in two extra consultants and re-sequenced testing. The one thing I'd like to put on your radar is that we may need a decision on the legacy reports by the end of the month.",
        selfCheck: ["¿Empezaste por la conclusión (BLUF)?", "¿Cabe la causa en una sola frase?", "¿Dejaste claro si necesitas algo de ella?"] },

      { id: "B4-004", domain: "stakeholders", scenario: "pushback",
        brief: "Un VP te pide añadir tres funcionalidades nuevas sin mover la fecha de lanzamiento. Dile que no sin cerrar la puerta.",
        mustUse: [ { t: "I'd be doing you a disservice", m: "disservice" }, { t: "scope", m: "scope" }, { t: "what I can offer", m: "what i can offer|what we can offer" } ],
        framework: ["Valida la petición", "Explica el impacto real", "Ofrece alternativas", "Deja que el otro elija"],
        modelAnswer: "I completely understand why these features matter. But I'd be doing you a disservice if I said yes without flagging the impact: adding them to the current scope would put the launch date at real risk. What I can offer is two options — we ship on time with feature A only and add the rest in a fast follow, or we move the launch by three weeks and include all three. Which trade-off works better for you?",
        selfCheck: ["¿Validaste la petición antes de decir que no?", "¿Explicaste el impacto, no solo la negativa?", "¿Diste al menos dos alternativas?"] },

      { id: "B4-005", domain: "leadership", scenario: "promotion",
        brief: "En tu revisión anual, defiende tu ascenso a Manager con dos logros concretos.",
        mustUse: [ { t: "track record", m: "track record" }, { t: "stepped up", m: "step(ped)? up" }, { t: "operating at the next level", m: "next level" } ],
        framework: ["Enmarca el objetivo", "Evidencia 1 con métrica", "Evidencia 2 con impacto en el equipo", "Pide criterios y siguiente paso"],
        modelAnswer: "I'd like to make the case for moving into the Manager role this cycle. Over the past year I've built a solid track record: I led the pricing project that added 4% to gross margin, and when our lead left in March, I stepped up to run the team of five without any drop in delivery. I believe I'm already operating at the next level, and I'd value your view on what, if anything, is still missing to make it official.",
        selfCheck: ["¿Diste al menos una métrica concreta?", "¿Mostraste impacto en personas, no solo en tareas?", "¿Cerraste pidiendo criterios o un siguiente paso?"] },

      { id: "B4-009", domain: "leadership", scenario: "feedback",
        brief: "Un analista senior entrega tarde de forma recurrente. Dale feedback constructivo en una 1:1.",
        mustUse: [ { t: "I've noticed", m: "i've noticed|i have noticed" }, { t: "the impact is", m: "impact" }, { t: "what support do you need", m: "support" } ],
        framework: ["Hecho observable (no juicio)", "Impacto", "Escucha / pregunta", "Acuerdo concreto"],
        modelAnswer: "I'd like to talk about something I've noticed over the last month: three of the weekly reports came in a day or two late. The impact is that the regional team has had to make decisions without the latest numbers. I know you're carrying a lot right now, so I'd really like to understand what's going on — and what support do you need from me to get back on track?",
        selfCheck: ["¿Describiste hechos y no la personalidad?", "¿Explicaste el impacto en el negocio?", "¿Terminaste con una pregunta abierta?"] },

      { id: "B4-010", domain: "strategy", scenario: "pitch",
        brief: "Pide al comité de dirección 150.000 € para un dashboard de datos en tiempo real. Pitch de 60 segundos.",
        mustUse: [ { t: "the ask", m: "the ask" }, { t: "pay for itself", m: "pay(s)? for itself" }, { t: "de-risk", m: "de-?risk" } ],
        framework: ["El problema en cifras", "La propuesta (the ask)", "Retorno esperado", "Cómo se reduce el riesgo"],
        modelAnswer: "Today, our regional managers make pricing decisions on data that's up to a week old, and that costs us an estimated €600k a year in missed margin. The ask is €150k to build a real-time dashboard. Based on the pilot in Valencia, we expect it to pay for itself within nine months. To de-risk the investment, we'd release funding in two tranches, tied to adoption targets.",
        selfCheck: ["¿Cuantificaste el problema antes de pedir?", "¿Fue la petición clara y explícita?", "¿Explicaste cómo reducir el riesgo?"] },

      { id: "B4-011", domain: "stakeholders", scenario: "conflict",
        brief: "Un stakeholder furioso te escribe porque tu equipo no cumplió un plazo crítico. Desescala la situación.",
        mustUse: [ { t: "I hear you", m: "i hear you|i understand" }, { t: "fell short", m: "fell short" }, { t: "going forward", m: "going forward" } ],
        framework: ["Empatía real", "Asume la responsabilidad", "Solución inmediata", "Cambio de proceso"],
        modelAnswer: "I hear you, and your frustration is completely justified. We fell short on this one, and that's on us. Here's what we're doing right now: the revised file will be with you by 3 pm today, double-checked by me personally. Going forward, we're adding a 48-hour buffer and a mid-point check-in on every critical deliverable, so this doesn't happen again.",
        selfCheck: ["¿Validaste la emoción antes de explicar nada?", "¿Asumiste la responsabilidad sin excusas?", "¿Diste una solución inmediata y un cambio de proceso?"] },

      { id: "B4-012", domain: "operations", scenario: "pushback",
        brief: "Otro departamento te pide 'para ya' un análisis que no es prioritario para tu equipo. Di que no protegiendo la relación.",
        mustUse: [ { t: "bandwidth", m: "bandwidth" }, { t: "realistically", m: "realistically" }, { t: "in the meantime", m: "meantime" } ],
        framework: ["Agradece / reconoce urgencia", "Explica la restricción", "Fecha realista", "Alternativa inmediata"],
        modelAnswer: "Thanks for thinking of us on this — I can see why it's urgent. The challenge is that we don't have the bandwidth this week; we're fully committed to the board pack until Thursday. Realistically, we could pick it up early next week and have it to you by Wednesday. In the meantime, I can share last quarter's model, which should get you 80% of the way there.",
        selfCheck: ["¿Reconociste la urgencia del otro?", "¿Explicaste la restricción con hechos?", "¿Diste una fecha realista y una alternativa inmediata?"] },

      /* ---- Retos de tu día a día (HR Data Analytics · jefe australiano) ---- */
      { id: "B4-013", domain: "people", scenario: "one_to_one", level: "b2",
        brief: "En vuestro 1:1, Mark (tu jefe australiano) te pregunta por qué ha subido la rotación en España este trimestre. Explícaselo en 60 segundos.",
        mustUse: [ { t: "has gone up", m: "(has|have) (gone up|increased|risen)" }, { t: "mainly due to", m: "(mainly|largely) due to" }, { t: "I'd suggest", m: "i'd suggest|i would suggest" } ],
        framework: ["El dato", "La causa principal", "Tu propuesta", "Siguiente paso"],
        modelAnswer: "Voluntary attrition in Spain has gone up from 9% to 12% this quarter. It's mainly due to the warehouse teams, where several people left for better-paid roles nearby. I'd suggest we run a quick pay benchmark for those roles and add stay interviews for the people we can't afford to lose. I can have a first draft of the benchmark ready by next Friday.",
        selfCheck: ["¿Diste el dato en la primera frase?", "¿Explicaste una causa concreta?", "¿Propusiste algo y diste una fecha?"] },

      { id: "B4-014", domain: "meetings", scenario: "meeting", level: "b2",
        brief: "En la reunión de equipo, alguien dice que el engagement ha subido mucho. Tú sabes que solo respondió el 20% de la plantilla. Intervén con educación y matiza el dato.",
        mustUse: [ { t: "sorry to jump in", m: "jump in" }, { t: "it's worth pointing out", m: "worth (pointing out|noting|mentioning)" }, { t: "sample", m: "sample" } ],
        framework: ["Pide la palabra", "Reconoce lo positivo", "Matiza con el dato", "Propón algo"],
        modelAnswer: "Sorry to jump in — it's great news, and I agree the trend looks positive. But it's worth pointing out that only 20% of employees responded, so the sample is quite small. Before we share it more widely, I'd suggest we wait for the reminder campaign to finish and see if the result holds.",
        selfCheck: ["¿Pediste la palabra con una fórmula educada?", "¿Reconociste lo positivo antes de matizar?", "¿Terminaste con una propuesta?"] },

      { id: "B4-015", domain: "people", scenario: "one_to_one", level: "b2",
        brief: "Propón a Mark automatizar el informe mensual de plantilla, que ahora os lleva dos días de trabajo manual.",
        mustUse: [ { t: "what if", m: "what if" }, { t: "save", m: "sav(e|es|ing)" }, { t: "I'd be happy to", m: "happy to" } ],
        framework: ["La idea", "El problema actual", "El beneficio", "Ofrécete a liderarlo"],
        modelAnswer: "I've been thinking about the monthly headcount report. What if we automated it in Power BI? At the moment it takes us about two days of manual work every month, and there's always a risk of copy-paste errors. Automating it would save us roughly twenty days a year and give managers the data on day one. I'd be happy to build a first version if you think it's worth exploring.",
        selfCheck: ["¿Planteaste la idea de forma clara al principio?", "¿Cuantificaste el beneficio?", "¿Te ofreciste a hacerlo?"] },

      { id: "B4-016", domain: "people", scenario: "presentation", level: "c1",
        brief: "Abre una presentación de 10 minutos ante 40 personas sobre los resultados de la encuesta de engagement. Solo la apertura: 45–60 segundos.",
        mustUse: [ { t: "walk you through", m: "walk you through" }, { t: "key findings", m: "key (findings|takeaways)" }, { t: "by the end", m: "by the end" } ],
        framework: ["Saludo y gancho", "De qué vas a hablar", "Estructura (3 puntos)", "Qué se llevará el público"],
        modelAnswer: "Good morning, everyone, and thanks for having me. Almost 3,000 of you took the time to answer this year's engagement survey — so first of all, thank you. Over the next ten minutes, I'll walk you through three key findings: what's working, where we're losing people, and what we're going to do about it. By the end, I hope you'll have a clear picture of what the data is telling us, and where you can help.",
        selfCheck: ["¿Empezaste con algo que capte la atención (un dato, un agradecimiento)?", "¿Anunciaste la estructura?", "¿Dijiste qué ganará el público?"] },

      { id: "B4-017", domain: "leadership", scenario: "one_to_one", level: "b2",
        brief: "Hay un nuevo grupo de trabajo con Reino Unido y EE. UU. para unificar cómo se calcula la rotación. Pide a Mark participar.",
        mustUse: [ { t: "I'd love to", m: "i'd love to|i would love to" }, { t: "bring / contribute", m: "bring|contribut" }, { t: "would it be possible", m: "would it be possible" } ],
        framework: ["Muestra interés", "Qué puedes aportar", "Cómo lo compaginarás", "Pide su apoyo"],
        modelAnswer: "I heard about the working group with the UK and US teams on attrition definitions, and I'd love to be part of it. I've already mapped how Spain and France calculate turnover, so I could bring a useful perspective. It would only be about two hours a week, and I'd make sure it doesn't affect the monthly reporting. Would it be possible for you to put my name forward?",
        selfCheck: ["¿Mostraste interés de forma directa?", "¿Explicaste qué puedes aportar en concreto?", "¿Cerraste con una petición clara?"] },

      { id: "B4-018", domain: "meetings", scenario: "call", level: "b2",
        brief: "En una llamada con Jake (EE. UU.) no has entendido bien una petición importante. Pide que te lo aclare y confirma qué tienes que hacer y para cuándo.",
        mustUse: [ { t: "could you", m: "could you" }, { t: "just to make sure", m: "just to make sure|just to confirm" }, { t: "by when", m: "by when|deadline" } ],
        framework: ["Pide que lo repita (sin disculparte por tu inglés)", "Parafrasea lo que entiendes", "Confirma el plazo", "Cierra con el siguiente paso"],
        modelAnswer: "Sorry, Jake, the line broke up a bit there. Could you go over the last part again? … Okay, just to make sure I've got this right: you need time-to-hire by location for the last twelve months, split by job family. By when would you need it — is end of next week okay? Great, I'll send you a first version on Thursday so you can check it's what you need.",
        selfCheck: ["¿Pediste la repetición sin disculparte por tu nivel de inglés?", "¿Parafraseaste la petición para confirmarla?", "¿Acordaste un plazo concreto?"] },

      { id: "B4-019", domain: "data", scenario: "pushback", level: "c1",
        brief: "Mark quiere llevar al comité de dirección un dato de rotación que tú crees que está mal calculado (incluye traslados internos). Díselo con tacto.",
        mustUse: [ { t: "I might be wrong", m: "might be wrong" }, { t: "double-check", m: "double.?check" }, { t: "rather than", m: "rather than" } ],
        framework: ["Abre con humildad", "Explica la posible causa", "Riesgo si no se corrige", "Ofrece la solución"],
        modelAnswer: "Before this goes to the exec team, can I flag something? I might be wrong, but it looks like the France figure includes internal transfers as leavers, which would inflate it quite a bit. If someone on the committee spots it, it could undermine the whole dashboard. I'd rather we double-check it today than correct it afterwards — I can rerun the numbers in about an hour, rather than delay the pack.",
        selfCheck: ["¿Abriste sin acusar ni sonar arrogante?", "¿Explicaste el riesgo para él/el equipo?", "¿Ofreciste una solución rápida?"] },

      { id: "B4-020", domain: "people", scenario: "exec_update", level: "b2",
        brief: "Es lunes. Dale a Mark un update de 60 segundos sobre en qué estás trabajando esta semana.",
        mustUse: [ { t: "I'm currently", m: "currently" }, { t: "on track", m: "on track" }, { t: "blocker / stuck", m: "blocker|blocked|stuck" } ],
        framework: ["Prioridad principal", "Estado (on track / retrasado)", "Bloqueos", "Qué necesitas de él"],
        modelAnswer: "This week I'm currently focused on the workforce plan for 2027. The headcount model is on track, and I should have the first scenarios ready by Wednesday. The only blocker is that I'm still waiting for the budget assumptions from Finance. If you could give them a nudge, that would really help. Apart from that, the engagement dashboard is live and managers are already using it.",
        selfCheck: ["¿Empezaste por la prioridad principal?", "¿Dijiste claramente si vas en plazo?", "¿Pediste ayuda concreta con el bloqueo?"] },

      { id: "B4-021", domain: "people", scenario: "metrics_defense", level: "c1",
        brief: "El director de RR. HH. pregunta por qué tu cifra de absentismo (4,8 %) no coincide con la de Finanzas (3,9 %). Explícalo en 60–90 segundos.",
        mustUse: [
          { t: "the discrepancy", m: "discrepanc" },
          { t: "comes down to", m: "comes? down to" },
          { t: "going forward", m: "going forward" }
        ],
        framework: ["Reconoce la diferencia", "Explica la causa en una frase", "Propón una definición común", "Siguiente paso"],
        modelAnswer: "Good question — the discrepancy comes down to definitions rather than data quality. Our 4.8% includes all sick leave and unpaid absence, while Finance only counts paid sick days, which gives them 3.9%. Both numbers are correct for their purpose, but they shouldn't be shown side by side without a note. Going forward, I'd suggest we agree one definition with Finance and add it to the dashboard glossary. I can set up a short call with them this week.",
        selfCheck: ["¿Reconociste la diferencia sin ponerte a la defensiva?", "¿Explicaste la causa en una frase clara?", "¿Propusiste una solución y un siguiente paso?"] },

      { id: "B4-022", domain: "social", scenario: "small_talk", level: "b2",
        context: "social",
        brief: "Lunes por la mañana. Mark te pregunta qué hiciste el fin de semana. Cuéntaselo en unos 60 segundos y devuélvele la pregunta.",
        mustUse: [
          { t: "pretty", m: "pretty" },
          { t: "ended up", m: "ended? up" },
          { t: "How about you?", m: "how about you|what about you" }
        ],
        framework: ["Respuesta general", "Un detalle o anécdota", "Cómo te sentiste", "Devuelve la pregunta"],
        modelAnswer: "Pretty good, thanks! On Saturday I was meant to go hiking with some friends, but the weather was awful, so we ended up at a little tapas bar in the old town instead. It turned out to be a great plan — we stayed there for hours. Sunday was much quieter, just a long walk and an early night. How about you? Did you get up to anything fun?",
        selfCheck: ["¿Contaste al menos un detalle concreto?", "¿Usaste bien el pasado (went, stayed, ended up)?", "¿Devolviste la pregunta para seguir la conversación?"] },

      { id: "B4-023", domain: "everyday", scenario: "storytelling", level: "b2",
        context: "social",
        brief: "Cuenta una anécdota divertida o un pequeño desastre de un viaje (60–90 s), como si estuvieras tomando algo con compañeros.",
        mustUse: [
          { t: "You won't believe", m: "won't believe" },
          { t: "long story short", m: "long story short" },
          { t: "in the end", m: "in the end" }
        ],
        framework: ["Gancho", "Contexto: dónde y con quién", "Qué salió mal", "Desenlace"],
        modelAnswer: "You won't believe what happened to me in Rome last summer. My partner and I had booked a table at a restaurant everyone had recommended, so we got dressed up and took a taxi across the city. When we arrived, the place was closed — the owner had gone on holiday and nobody had updated the website. We were starving, so we walked into the first pizzeria we found. Long story short, it was the best pizza I've ever had, and in the end we went back three times that week.",
        selfCheck: ["¿Empezaste con un gancho?", "¿Usaste bien los tiempos narrativos (had booked, was closed)?", "¿Terminaste con un desenlace claro?"] },

      { id: "B4-024", domain: "everyday", scenario: "explain_culture", level: "b2",
        context: "social",
        brief: "Jake (EE. UU.) te pregunta cómo se celebra la Navidad en España. Explícaselo de forma interesante en 60–90 segundos.",
        mustUse: [
          { t: "unlike", m: "unlike" },
          { t: "the main", m: "the main" },
          { t: "tends to", m: "tends? to" }
        ],
        framework: ["Lo esencial", "Fechas clave", "Una costumbre curiosa", "Tu experiencia personal"],
        modelAnswer: "Unlike in the US, Christmas in Spain is spread over a couple of weeks. The main family dinner tends to be on Christmas Eve, and then on New Year's Eve we eat twelve grapes at midnight, one for each chime of the clock — it's harder than it sounds! But for kids, the big day is actually the sixth of January, when the Three Kings bring the presents. Personally, my favourite part is the long lunches with the whole family.",
        selfCheck: ["¿Diste algún dato curioso?", "¿Comparaste con su cultura?", "¿Añadiste algo personal?"] },

      { id: "B4-025", domain: "ideas", scenario: "social_opinion", level: "c1",
        context: "social",
        brief: "En una cena con compañeros de Reino Unido sale el tema: ¿es buena idea la semana laboral de cuatro días? Da tu opinión con matices (60–90 s).",
        mustUse: [
          { t: "on the one hand", m: "on the one hand" },
          { t: "that said", m: "that said" },
          { t: "depends on", m: "depends on" }
        ],
        framework: ["Posición inicial", "Argumento a favor", "Matiz o contraargumento", "Conclusión"],
        modelAnswer: "On the one hand, I can see the appeal — the trials in the UK showed people were happier and just as productive. That said, it really depends on the type of job. It's easy for an analytics team, but much harder for a factory or a customer service team that has to cover every day. So my view is that it's a great idea where it fits, but companies shouldn't apply it across the board just because it's trendy.",
        selfCheck: ["¿Diste una opinión clara?", "¿Incluiste un matiz o contraargumento?", "¿Cerraste con una conclusión?"] },

      { id: "B4-026", domain: "social", scenario: "networking", level: "b2",
        context: "social",
        brief: "En un evento de la empresa te presentan a una directora de EE. UU. Preséntate, explica a qué te dedicas y haz que la conversación fluya (60 s).",
        mustUse: [
          { t: "I'm part of", m: "i'm part of|i am part of" },
          { t: "mainly", m: "mainly" },
          { t: "What brings you", m: "what brings you" }
        ],
        framework: ["Saludo y nombre", "Qué haces, en una frase", "Algo interesante de tu trabajo", "Pregunta abierta"],
        modelAnswer: "Hi, nice to meet you — I'm part of the People Analytics team in Barcelona. I mainly work on attrition and engagement data, so I help managers understand why people stay or leave. At the moment I'm building a dashboard that flags which teams might need extra support. What brings you to Barcelona? Is it your first time here?",
        selfCheck: ["¿Explicaste tu trabajo en una frase sencilla?", "¿Mencionaste algo concreto e interesante?", "¿Terminaste con una pregunta para el otro?"] },

      { id: "B4-027", domain: "people", scenario: "exec_update", level: "c1",
        brief: "El CFO pregunta por qué el coste por contratación (cost-per-hire) ha subido un 20 % este año. Responde en 60–90 segundos.",
        mustUse: [
          { t: "driven by", m: "driven by" },
          { t: "offset", m: "offset" },
          { t: "by the end of", m: "by the end of" }
        ],
        framework: ["El dato, sin rodeos", "La causa principal", "Qué ya habéis hecho", "Plan y fecha"],
        modelAnswer: "Cost-per-hire is up about 20% this year, and it's mostly driven by two hard-to-fill data roles where we had to use an external agency. If we take those two out, the cost is roughly flat. We've partly offset it by moving more junior hiring to referrals, which are much cheaper. Our plan is to build an in-house pipeline for technical profiles, and we expect to bring the figure back down by the end of next quarter.",
        selfCheck: ["¿Diste el dato en la primera frase?", "¿Separaste la causa puntual de la tendencia?", "¿Terminaste con un plan y una fecha?"] }
    ],

    /* ------------------------------------------------------------------------
     * VOCABULARIO · Frases para intervenir en reuniones (meetingMoves)
     * situation (ES) → elige lo que dirías. answer + 2 distractores.
     * --------------------------------------------------------------------- */
    meetingMoves: [
      { id: "MM-001", domain: "meetings", fn: "interrupt", level: "b2",
        situation: "Alguien está hablando y quieres intervenir con educación.",
        answer: "Sorry to jump in, but could I add something here?",
        distractors: ["Stop — I need to say something.", "Excuse me, can I make an intervention?"],
        note: "'Jump in' = intervenir, meter baza. Pedir permiso con 'could I' suaviza la interrupción y nadie lo percibe como brusco." },

      { id: "MM-002", domain: "meetings", fn: "interrupt", level: "c1",
        situation: "Tu jefe acaba de mencionar un tema y quieres entrar en ese punto concreto.",
        answer: "If I could just come in on that point for a second…",
        distractors: ["Hold on, that's not how I see it at all.", "If I could just enter on that point for a second…"],
        note: "'Come in on a point' es la forma natural de entrar en un tema que está saliendo. 'Just' y 'for a second' restan peso a la interrupción." },

      { id: "MM-003", domain: "meetings", fn: "clarify", level: "b2",
        situation: "Han dicho una cifra muy rápido y no la has entendido.",
        answer: "Sorry, could you run that number by me again?",
        distractors: ["What? Say that again.", "Sorry, could you repeat me that number?"],
        note: "'Run something by someone (again)' = volver a explicarte algo. Suena natural y profesional." },

      { id: "MM-004", domain: "meetings", fn: "clarify", level: "b2",
        situation: "Usan un término que no conoces y quieres saber qué significa.",
        answer: "When you say 'regretted attrition', what exactly do you mean?",
        distractors: ["Regretted attrition? I've never heard of that.", "When you say 'regretted attrition', what do you want to say exactly?"],
        note: "Nunca 'what means…?'. Usa 'What does X mean?' o, más natural en una reunión, 'When you say X, what do you mean?'." },

      { id: "MM-005", domain: "meetings", fn: "check", level: "b2",
        situation: "Quieres confirmar que has entendido bien lo que te han pedido.",
        answer: "Just to make sure I've got this right — you'd like the report by Friday?",
        distractors: ["Fine, Friday then.", "Just to make sure I've understood well — you'd like the report for Friday?"],
        note: "Parafrasear para confirmar es lo que hacen los nativos. Evita la coletilla española ', no?' al final." },

      { id: "MM-006", domain: "meetings", fn: "add", level: "b2",
        situation: "Quieres apoyar lo que ha dicho una compañera y añadir un dato.",
        answer: "Just to build on what Sarah said, we're seeing the same trend in France.",
        distractors: ["Sarah's right.", "Just to add on what Sarah said, in France we're seeing the same tendency."],
        note: "'Build on what X said' = partir de lo que ha dicho alguien y ampliarlo. Además, reconoce públicamente a tu compañera." },

      { id: "MM-007", domain: "meetings", fn: "agree", level: "b2",
        situation: "Estás totalmente de acuerdo con lo que acaban de decir.",
        answer: "I couldn't agree more.",
        distractors: ["Yeah, maybe.", "I'm completely agree with that."],
        note: "'I couldn't agree more' = estoy completamente de acuerdo. Recuerda: 'agree' es verbo, nunca 'I am agree'." },

      { id: "MM-008", domain: "meetings", fn: "disagree", level: "c1",
        situation: "Tu jefe hace una afirmación y no estás de acuerdo. Quieres discrepar sin sonar confrontacional.",
        answer: "I see your point, but I'm not sure the data fully supports that.",
        distractors: ["That's wrong — the data says the opposite.", "I understand your point, but the data doesn't give you the reason."],
        note: "Validas primero ('I see your point') y apoyas tu desacuerdo en los datos, no en la persona. Es tu terreno como analista." },

      { id: "MM-009", domain: "meetings", fn: "time", level: "b2",
        situation: "Te hacen una pregunta difícil y necesitas unos segundos para pensar.",
        answer: "That's a good question — let me think about that for a second.",
        distractors: ["Um… I don't know.", "Good question — give me a second to think it."],
        note: "Ganar tiempo con una frase hecha te da 3–4 segundos para ordenar la respuesta y transmite calma." },

      { id: "MM-010", domain: "meetings", fn: "time", level: "c1",
        situation: "Te piden un dato que no tienes a mano en ese momento.",
        answer: "I don't have that figure to hand, but I can get back to you by end of day.",
        distractors: ["I don't know, sorry — I really should know that.", "I don't have that figure in hand, but I'll send it to you along the day."],
        note: "'To hand' = a mano. 'Get back to you' = volver a ti con la respuesta. Comprometerte con un plazo convierte el 'no lo sé' en profesionalidad." },

      { id: "MM-011", domain: "data", fn: "correct", level: "c1",
        situation: "Alguien presenta un dato erróneo y quieres corregirlo con tacto.",
        answer: "Sorry, just a quick correction — the turnover figure is actually 12%, not 21%.",
        distractors: ["No, you've got it wrong — it's 12%.", "Sorry, a small correction — the rotation figure is actually 12%, not 21%."],
        note: "'Just a quick correction' minimiza el error. 'Actually' aquí significa 'en realidad', y corrige sin señalar a nadie." },

      { id: "MM-012", domain: "meetings", fn: "opinion", level: "b2",
        situation: "Te piden tu opinión sobre el principal problema.",
        answer: "From my perspective, the main issue is data quality.",
        distractors: ["In my opinion, I think that the main issue is data quality.", "Under my point of view, the main issue is data quality."],
        note: "'In my opinion, I think' es redundante. Usa una sola fórmula: 'From my perspective…', 'The way I see it…'." },

      { id: "MM-013", domain: "meetings", fn: "redirect", level: "c1",
        situation: "La reunión se está desviando del tema y quieres volver al dashboard.",
        answer: "Shall we park that for now and come back to the dashboard?",
        distractors: ["This is off-topic. Can we stop?", "Shall we leave that apart for now and return to the dashboard?"],
        note: "'Park something' = aparcar un tema. 'Theme' no es el tema de una reunión: usa 'topic' o 'agenda item'." },

      { id: "MM-014", domain: "meetings", fn: "check", level: "b2",
        situation: "Estás explicando algo complejo y quieres saber si te siguen.",
        answer: "Does that make sense so far?",
        distractors: ["Do you understand?", "Is everything clear until now?"],
        note: "Asumes tú la responsabilidad de explicarte bien. 'Do you understand?' puede sonar condescendiente." },

      { id: "MM-015", domain: "meetings", fn: "close", level: "b2",
        situation: "Quieres cerrar tu intervención con los siguientes pasos.",
        answer: "So, to wrap up: I'll update the model and share it by Thursday.",
        distractors: ["OK, that's it. Bye, everyone.", "So, to resume: I'll update the model and share it by Thursday."],
        note: "'To wrap up' = para cerrar. Terminar con una acción y una fecha deja una imagen de fiabilidad." },

      { id: "MM-016", domain: "meetings", fn: "clarify", level: "b2",
        situation: "En una llamada hablan muy rápido y no has captado lo último.",
        answer: "Sorry, the line's a bit unclear — could you say that again a bit more slowly?",
        distractors: ["Sorry, my English isn't very good.", "Sorry, you're cutting — could you say that again more slowly?"],
        note: "Atribuirlo a la línea quita presión. Nunca te disculpes por tu inglés: resta autoridad y no hace falta." },

      { id: "MM-017", domain: "data", fn: "add", level: "c1",
        situation: "Quieres aportar un dato que refuerza tu argumento.",
        answer: "It's also worth pointing out that engagement scores dropped in the same period.",
        distractors: ["Engagement went down too, by the way.", "It's also worth to point out that engagement scores dropped in the same period."],
        note: "'It's worth pointing out that…' = cabe destacar que… Ideal para introducir un dato sin sonar agresivo." },

      { id: "MM-018", domain: "meetings", fn: "disagree", level: "b2",
        situation: "Estás de acuerdo solo en parte.",
        answer: "I agree up to a point, but we should also look at the exit interviews.",
        distractors: ["Yes, but the exit interviews say something different, so no.", "I agree until a certain point, but we should also look at the exit interviews."],
        note: "'Up to a point' = hasta cierto punto. Te permite discrepar sin romper el acuerdo." },

      { id: "MM-019", domain: "meetings", fn: "interrupt", level: "b2",
        situation: "Alguien te interrumpe y quieres terminar tu idea.",
        answer: "Sorry, if I could just finish my point…",
        distractors: ["Excuse me, I'm still talking!", "Sorry, if I could just end my point…"],
        note: "Recuperar el turno con educación es clave para que tus ideas lleguen. 'Just' lo suaviza." },

      { id: "MM-020", domain: "people", fn: "opinion", level: "c1",
        situation: "En tu 1:1 quieres proponer una idea a tu jefe.",
        answer: "I've been thinking — what if we automated the monthly headcount report?",
        distractors: ["We must automate the monthly headcount report.", "I've been thinking — what if we automatised the monthly headcount report?"],
        note: "'What if we…?' propone sin imponer. 'I've been thinking' muestra iniciativa." },

      { id: "MM-021", domain: "meetings", fn: "check", level: "b2",
        situation: "No sabes si una tarea que han mencionado te toca a ti.",
        answer: "Just to clarify — is that something you'd like me to take on?",
        distractors: ["So this is my job now?", "Just to clarify — do you want that I take this on?"],
        note: "'Take on' = asumir (una tarea). Preguntarlo evita malentendidos y demuestra disposición." },

      { id: "MM-022", domain: "data", fn: "agree", level: "c1",
        situation: "Quieres darle la razón a alguien, pero con un matiz.",
        answer: "That's a fair point, although the sample size is quite small.",
        distractors: ["True, but the sample is tiny, so it's meaningless.", "That's a fair point, although the sample is quite little."],
        note: "'Tener razón' es 'be right', nunca 'have reason'. 'A fair point' reconoce el argumento antes del matiz." },

      { id: "MM-023", domain: "people", fn: "present", level: "c1",
        situation: "Vas a abrir una presentación delante de 40 personas.",
        answer: "Thanks for having me. Over the next ten minutes, I'll walk you through three key findings from our engagement survey.",
        distractors: ["Hi everyone, so, um, this is about the engagement survey, I guess.", "Thanks for having me. In the next ten minutes, I'll explain you three key findings from our engagement survey."],
        note: "Anunciar duración y estructura ('three key findings') tranquiliza al público, y a ti también. 'Walk you through' = guiaros por." },

      { id: "MM-024", domain: "people", fn: "present", level: "b2",
        situation: "En tu presentación, quieres pasar al siguiente punto.",
        answer: "That brings me to my next point: attrition by tenure.",
        distractors: ["OK, and now attrition.", "That takes me to my next point: attrition by antiquity."],
        note: "Las transiciones claras ('That brings me to…', 'Moving on to…') hacen que una presentación suene preparada." }
    ],

    /* ------------------------------------------------------------------------
     * CONVERSACIÓN (formato "move", como meetingMoves)
     * Small talk, mantener y reconducir la conversación, reaccionar, contar historias.
     * --------------------------------------------------------------------- */
    conversation: [
      { id: "CV-001", domain: "social", fn: "smalltalk", level: "b2",
        situation: "Lunes por la mañana. Mark te pregunta qué tal el finde y quieres devolverle la pregunta con naturalidad.",
        answer: "Pretty good, thanks — quite relaxed, actually. How about yours? Did you get up to anything?",
        distractors: ["Good.", "Very well, thank you. And you, what did you do in the weekend?"],
        note: "'Get up to something' = hacer algo (planes, travesuras). Responder con un detalle y devolver la pregunta mantiene viva la charla; 'Good.' a secas la mata. Fin de semana: 'at/over the weekend', no 'in'." },

      { id: "CV-002", domain: "social", fn: "follow", level: "b2",
        situation: "Un compañero te cuenta que ha empezado a correr. Quieres que siga hablando.",
        answer: "Oh, nice! What got you into it?",
        distractors: ["OK. I don't really like running.", "Ah, nice. And why you started?"],
        note: "'What got you into X?' = ¿cómo empezaste con X? Las preguntas abiertas (what, how) invitan a contar más que las de sí/no. Ojo: 'why did you start?', con auxiliar." },

      { id: "CV-003", domain: "social", fn: "react", level: "b2",
        situation: "Sarah te cuenta que la han ascendido.",
        answer: "That's brilliant news — congratulations! You must be thrilled.",
        distractors: ["Oh. OK, good for you.", "Congratulations! You must be very emotional."],
        note: "'You must be thrilled' = estarás encantada (deducción con must). 'Emotional' significa sensible o a punto de llorar, no 'emocionado' (excited, thrilled)." },

      { id: "CV-004", domain: "social", fn: "empathy", level: "b2",
        situation: "Jake te dice que lleva una semana horrible: su hijo ha estado enfermo y apenas duerme.",
        answer: "Oh no, that sounds exhausting. I hope he's feeling better soon.",
        distractors: ["Yeah, kids are like that.", "Oh no, what a pity. I hope he gets better soon."],
        note: "'That sounds + adjetivo' (exhausting, tough, stressful) demuestra que has escuchado. 'What a pity' se usa para pequeñas decepciones, no para problemas de salud." },

      { id: "CV-005", domain: "social", fn: "story", level: "b2",
        situation: "Vas a contar una anécdota de tus vacaciones y quieres captar la atención desde la primera frase.",
        answer: "You won't believe what happened to us in Lisbon.",
        distractors: ["I will tell you a story about my holidays. It's quite long.", "You won't believe what passed us in Lisbon."],
        note: "Una frase gancho crea expectación. 'Happen to someone' = pasarle algo a alguien; 'pass' es pasar físicamente o aprobar." },

      { id: "CV-006", domain: "social", fn: "story", level: "c1",
        situation: "Estás en mitad de una anécdota y quieres ir directo al desenlace.",
        answer: "Anyway, long story short, we ended up missing the last train.",
        distractors: ["And then, after many things, the train was gone.", "Anyway, resuming, we ended up losing the last train."],
        note: "'Long story short' acelera hasta el final. 'End up + -ing' = acabar haciendo algo sin planearlo. Un tren se pierde con 'miss', no con 'lose'; y 'resume' significa reanudar." },

      { id: "CV-007", domain: "social", fn: "topic", level: "b2",
        situation: "En la comida se ha hecho un silencio incómodo y quieres sacar otro tema.",
        answer: "By the way, has anyone seen the new series everyone's talking about?",
        distractors: ["So… nobody's talking. OK.", "By the way, has anyone seen the new serie that everybody speaks about?"],
        note: "'By the way' introduce un tema nuevo con suavidad. 'Series' es igual en singular y plural (a series, two series), y la gente 'talks about' algo." },

      { id: "CV-008", domain: "social", fn: "leave", level: "b2",
        situation: "Llevas un rato charlando en la máquina de café y tienes que volver a trabajar.",
        answer: "Anyway, I'd better get back to it — good catching up with you!",
        distractors: ["I go now. Bye.", "Well, I leave you, I have a lot of work. Nice to talk with you!"],
        note: "'I'd better get back to it' cierra con naturalidad y sin dar explicaciones largas. 'Good catching up' = me ha gustado ponernos al día. 'Te dejo' no se traduce como 'I leave you'." },

      { id: "CV-009", domain: "social", fn: "smalltalk", level: "b2",
        situation: "Una persona de Reino Unido llega a la oficina de Barcelona y comenta el buen tiempo.",
        answer: "I know, we've been really lucky with the weather lately. Is it your first time in Barcelona?",
        distractors: ["Yes. It's always like this here.", "Yes, we have very good weather. Is the first time that you come to Barcelona?"],
        note: "Comentario + pregunta personal abre la conversación. 'Is it your first time in…?' — con sujeto 'it' y sin 'that you come'." },

      { id: "CV-010", domain: "ideas", fn: "opinion", level: "b2",
        situation: "En una cena, alguien te pregunta qué opinas del teletrabajo.",
        answer: "Honestly, I'm a big fan — as long as there's still some time in the office to connect with people.",
        distractors: ["It's good and bad. It depends.", "Sincerely, I'm very fan of it, if there is still some time in the office."],
        note: "'I'm a big fan (of)' + matiz con 'as long as' (siempre que). 'Sincerely' solo cierra cartas; para 'sinceramente' di 'honestly' o 'to be honest'. Y 'a big fan', nunca 'very fan'." },

      { id: "CV-011", domain: "ideas", fn: "disagree", level: "c1",
        situation: "Un amigo dice que la IA va a eliminar la mayoría de los empleos. No estás de acuerdo, pero sin crear tensión.",
        answer: "I'm not so sure, to be honest. I reckon it'll change most jobs rather than replace them.",
        distractors: ["That's ridiculous.", "I'm not so sure, to be honest. I believe it will change most of jobs more than replace them."],
        note: "'I'm not so sure' discrepa con suavidad. 'I reckon' = creo (muy común en Australia y Reino Unido). 'Most jobs' sin 'of'; solo 'most of the jobs' con determinante." },

      { id: "CV-012", domain: "social", fn: "react", level: "c1",
        situation: "Jake te cuenta algo sorprendente: su equipo ya trabaja cuatro días a la semana.",
        answer: "No way — really? How's that working out for you?",
        distractors: ["Ah, OK. Lucky you.", "No way! And how is it going this?"],
        note: "'No way!' expresa sorpresa. 'How's that working out?' = ¿qué tal os está funcionando? Es una pregunta de seguimiento muy natural." },

      { id: "CV-013", domain: "everyday", fn: "recommend", level: "b2",
        situation: "Sarah viene a Madrid el mes que viene y te pide recomendaciones.",
        answer: "You should definitely check out the Retiro park — and if you're into food, try the Mercado de San Miguel.",
        distractors: ["Madrid has lots of things. Just google it.", "You must visit the Retiro park, and if you like eat, try the Mercado de San Miguel."],
        note: "'Check out' = ir a ver, descubrir. 'If you're into X' = si te va X. Detrás de 'like': 'like eating' o 'like to eat', nunca 'like eat'." },

      { id: "CV-014", domain: "social", fn: "follow", level: "c1",
        situation: "Mark menciona de pasada que este fin de semana organiza un 'barbie' en su casa.",
        answer: "Oh, a barbie — sounds fun! Who's coming along?",
        distractors: ["OK. I don't really like barbecues.", "Oh, a barbecue — sounds funny! Who is going?"],
        note: "En Australia, 'barbie' = barbacoa. 'Fun' = divertido (un plan agradable); 'funny' = gracioso, que hace reír. 'Come along' = apuntarse, venir." },

      { id: "CV-015", domain: "social", fn: "smalltalk", level: "b2",
        situation: "Empieza una videollamada y estáis esperando a que se conecte el resto.",
        answer: "How's your week going so far?",
        distractors: ["We wait, I suppose.", "How is going your week?"],
        note: "Pregunta de relleno perfecta mientras esperáis. 'So far' = hasta ahora. El orden es 'How is your week going?'." },

      { id: "CV-016", domain: "social", fn: "empathy", level: "c1",
        situation: "Un compañero está frustrado porque han rechazado un proyecto que preparó durante semanas.",
        answer: "That's really frustrating, especially after all the work you put in.",
        distractors: ["Well, that's life.", "That's very frustrant, especially after all the work you put in."],
        note: "Validar la emoción y reconocer su esfuerzo ('the work you put in') es lo que hace sentir escuchado. Es 'frustrating', nunca 'frustrant'." },

      { id: "CV-017", domain: "everyday", fn: "story", level: "b2",
        situation: "Cuentas qué hacías de pequeño en verano en el pueblo.",
        answer: "When I was a kid, we used to spend every summer at my grandparents' place in the village.",
        distractors: ["In my childhood I go to my grandparents every summer.", "When I was a kid, I was used to spend every summer at my grandparents' house in the village."],
        note: "'Used to + infinitivo' = hábito del pasado (solía). 'Be used to + -ing' significa estar acostumbrado: es otra cosa." },

      { id: "CV-018", domain: "social", fn: "clarify", level: "b2",
        situation: "Tomando algo, Mark dice 'I'm stuffed' y no lo entiendes.",
        answer: "Sorry, what do you mean by 'stuffed'?",
        distractors: ["Yes, yes, totally.", "Sorry, what means 'stuffed'?"],
        note: "Preguntar es mejor que fingir que entiendes. ('Stuffed' = lleno de comer; en Australia también 'hecho polvo' o 'roto'.) Estructura: 'What do you mean by…?' / 'What does X mean?'." },

      { id: "CV-019", domain: "ideas", fn: "topic", level: "c1",
        situation: "Alguien saca un tema de política que se está calentando y quieres reconducir la charla.",
        answer: "Fair enough — maybe that's one for another day! So, anyone got plans for the long weekend?",
        distractors: ["Please, can we stop talking about politics?", "OK, OK, better we change the topic. Somebody has plans for the long weekend?"],
        note: "'Fair enough' reconoce lo dicho sin entrar a debatir y 'that's one for another day' cierra el tema con humor. Después, una pregunta abierta y ligera." },

      { id: "CV-020", domain: "social", fn: "leave", level: "c1",
        situation: "En un evento de networking quieres terminar una conversación sin parecer brusco.",
        answer: "It's been great chatting with you — I'll let you get back to the event. Let's stay in touch.",
        distractors: ["OK, I'm going to talk to other people now.", "It was a pleasure to know you. I let you continue with the event."],
        note: "'I'll let you get back to…' cierra la conversación poniendo el foco en el otro. 'Meet' = conocer a alguien por primera vez; 'know' = conocer ya." },

      { id: "CV-021", domain: "social", fn: "react", level: "b2",
        situation: "Sarah te cuenta que han cancelado el concierto al que iba a ir.",
        answer: "Oh, what a shame! Were you really looking forward to it?",
        distractors: ["Oh well. There'll be other concerts.", "Oh, what a shame! Were you really looking forward to go?"],
        note: "'What a shame' sirve para pequeñas decepciones. 'Look forward to' + sustantivo o -ing: 'looking forward to going'." },

      { id: "CV-022", domain: "social", fn: "react", level: "b2",
        situation: "Sarah acaba de hacer una buena presentación y quieres felicitarla al salir.",
        answer: "Great presentation, by the way — the way you explained the survey results was really clear.",
        distractors: ["Your presentation was OK.", "Great presentation — you explained very well the results of the survey."],
        note: "Un elogio concreto (qué te gustó) suena sincero. En inglés el adverbio no va entre el verbo y su objeto: 'explained the results very well'." },

      { id: "CV-023", domain: "everyday", fn: "story", level: "c1",
        situation: "Quieres contar que algo empezó mal pero acabó bien.",
        answer: "It was a bit of a disaster at first, but it all worked out in the end.",
        distractors: ["First it was bad, and after it was good.", "At first it was a bit of a disaster, but at the end everything went well."],
        note: "'Work out' = salir bien, resolverse. 'In the end' = finalmente; 'at the end of' = al final de algo (una calle, una reunión)." },

      { id: "CV-024", domain: "everyday", fn: "follow", level: "b2",
        situation: "Jake menciona que ha estado en Japón. Quieres saber más.",
        answer: "Oh, how was it? I've always wanted to go.",
        distractors: ["Japan is very far.", "Oh, and how was it? I always wanted to go there since years."],
        note: "'How was it?' invita a contar. Usa 'I've always wanted to' (present perfect) para un deseo que sigue vivo; 'since years' no existe ('for years')." },

      { id: "CV-025", domain: "everyday", fn: "smalltalk", level: "c1",
        situation: "Mark te pregunta por qué en España se cena tan tarde.",
        answer: "Ha, good question! It's partly down to our working hours — lunch is the big meal, so dinner tends to be around nine or ten.",
        distractors: ["Because we're Spanish!", "Good question! It's due to our horary — lunch is the big meal, so dinner tends to be around nine or ten."],
        note: "'It's down to…' = se debe a… (muy británico y australiano). 'Tend to' generaliza sin sonar categórico. Horario laboral = working hours o schedule." },

      { id: "CV-026", domain: "ideas", fn: "recommend", level: "b2",
        situation: "Te preguntan si has leído o visto algo interesante últimamente.",
        answer: "Actually, yes — I've just finished a really good book on behavioural economics. I'd highly recommend it.",
        distractors: ["No, not really. I don't have time.", "Actually, yes — I've just finished a very good book of behavioural economics. I recommend it you."],
        note: "'I'd highly recommend it' es la fórmula natural. 'A book on / about a topic'; y 'recommend it to you', nunca 'recommend it you'." },

      { id: "CV-027", domain: "social", fn: "agree", level: "b2",
        situation: "Un compañero suspira: '¡Los lunes son durísimos!'.",
        answer: "Tell me about it! I need at least two coffees before I feel human.",
        distractors: ["Yes.", "You have reason! I need at least two coffees before I feel human."],
        note: "'Tell me about it!' = ¡dímelo a mí! (acuerdo con humor). 'Tener razón' es 'be right': 'you're right', nunca 'you have reason'." },

      { id: "CV-028", domain: "social", fn: "smalltalk", level: "c1",
        situation: "Coincides en el ascensor con alguien de otro departamento a quien apenas conoces.",
        answer: "Busy day? It feels like everyone's flat out this week.",
        distractors: ["Do you like your job?", "Much work today? It seems that everyone is very occupied this week."],
        note: "'Flat out' = a tope, sin parar (muy australiano y británico). Un comentario ligero sobre la semana o el tiempo es el small talk más seguro con desconocidos. 'Occupied' se usa para lugares (el baño está ocupado), no para personas." },

      { id: "CV-029", domain: "everyday", fn: "recommend", level: "c1",
        situation: "Un compañero de EE. UU. te pregunta qué plato español no se puede perder.",
        answer: "If you only try one thing, make it a proper paella in Valencia — the real thing is nothing like the tourist version.",
        distractors: ["Paella. Everyone knows that.", "If you only try one thing, try a paella in Valencia — the real one has nothing to see with the tourist version."],
        note: "'Make it X' = que sea X. 'Nothing like' = no tiene nada que ver; 'nothing to see with' es un calco del español." },

      { id: "CV-030", domain: "social", fn: "react", level: "c1",
        situation: "Te cuentan un viaje desastroso y quieres reaccionar con humor.",
        answer: "Oh no! Well, at least you'll be dining out on that story for years.",
        distractors: ["That's very bad.", "Oh no! Well, at least now you have a good history to tell."],
        note: "'Dine out on a story' = contar una anécdota una y otra vez (y triunfar con ella). 'Story' = relato; 'history' = la Historia." }
    ],

    /* ------------------------------------------------------------------------
     * VOCABULARIO AMPLIO (formato hueco). type: phrasal | idiom | collocation | word
     * --------------------------------------------------------------------- */
    everydayVocab: [
      { id: "EV-001", domain: "everyday", type: "phrasal", level: "b2",
        sentence: "I need to cut ___ on sugar — I've been eating way too many biscuits.",
        answer: "down",
        options: ["down", "off", "up", "away"],
        meaningEs: "Reducir el consumo de algo (cut down on)",
        example: "My doctor told me to cut down on coffee." },

      { id: "EV-002", domain: "everyday", type: "phrasal", level: "b2",
        sentence: "We were going to go hiking, but we ___ staying in because of the rain.",
        answer: "ended up",
        options: ["ended up", "turned out", "came up", "brought up"],
        meaningEs: "Acabar (haciendo algo) sin haberlo planeado",
        example: "We ended up talking until 2 a.m." },

      { id: "EV-003", domain: "social", type: "phrasal", level: "b2",
        sentence: "I ___ an old friend from university at the airport yesterday.",
        answer: "ran into",
        options: ["ran into", "ran over", "ran out", "ran off"],
        meaningEs: "Encontrarse por casualidad con alguien",
        example: "You'll never guess who I ran into at the supermarket." },

      { id: "EV-004", domain: "everyday", type: "phrasal", level: "b2",
        sentence: "Could you ___ my plants while I'm on holiday?",
        answer: "look after",
        options: ["look after", "look for", "look up", "look into"],
        meaningEs: "Cuidar de alguien o algo",
        example: "My mum looks after the kids on Fridays." },

      { id: "EV-005", domain: "everyday", type: "phrasal", level: "b2",
        sentence: "We've ___ of milk — could you grab some on your way home?",
        answer: "run out",
        options: ["run out", "run down", "run away", "run off"],
        meaningEs: "Quedarse sin algo",
        example: "The printer has run out of paper again." },

      { id: "EV-006", domain: "everyday", type: "phrasal", level: "b2",
        sentence: "I'm trying to ___ a new routine: gym three times a week.",
        answer: "stick to",
        options: ["stick to", "stick up", "stick out", "stick around"],
        meaningEs: "Ceñirse a algo, mantenerlo",
        example: "It's hard to stick to a diet when you travel." },

      { id: "EV-007", domain: "social", type: "phrasal", level: "b2",
        sentence: "I really ___ my sister — we have the same sense of humour.",
        answer: "get on with",
        options: ["get on with", "get over", "get by", "get away with"],
        meaningEs: "Llevarse bien con alguien",
        example: "Do you get on with your new flatmates?" },

      { id: "EV-008", domain: "social", type: "phrasal", level: "b2",
        sentence: "It took her months to ___ the break-up.",
        answer: "get over",
        options: ["get over", "get through to", "get on", "get off"],
        meaningEs: "Superar (una ruptura, una enfermedad, un disgusto)",
        example: "I still haven't got over the jet lag." },

      { id: "EV-009", domain: "social", type: "phrasal", level: "b2",
        sentence: "Why don't you ___ for dinner on Saturday? I'm making paella.",
        answer: "come over",
        options: ["come over", "come across", "come up", "come off"],
        meaningEs: "Venir a casa de alguien",
        example: "My parents are coming over this weekend." },

      { id: "EV-010", domain: "ideas", type: "phrasal", level: "b2",
        sentence: "I ___ a really interesting article about sleep the other day.",
        answer: "came across",
        options: ["came across", "came over", "came round", "came up"],
        meaningEs: "Encontrar algo por casualidad",
        example: "I came across some old photos while I was tidying up." },

      { id: "EV-011", domain: "everyday", type: "idiom", level: "b2",
        sentence: "Don't worry about the exam — it'll be a piece of ___.",
        answer: "cake",
        options: ["cake", "bread", "pie", "biscuit"],
        meaningEs: "Pan comido, muy fácil",
        example: "The interview was a piece of cake." },

      { id: "EV-012", domain: "everyday", type: "idiom", level: "b2",
        sentence: "I'm feeling a bit under the ___ today, so I'm working from home.",
        answer: "weather",
        options: ["weather", "rain", "sky", "cloud"],
        meaningEs: "Estar pachucho, un poco enfermo",
        example: "She's been under the weather all week." },

      { id: "EV-013", domain: "social", type: "idiom", level: "b2",
        sentence: "We're all in the same ___, so let's help each other out.",
        answer: "boat",
        options: ["boat", "ship", "car", "bus"],
        meaningEs: "Estar en el mismo barco",
        example: "Everyone's stressed before the deadline — we're all in the same boat." },

      { id: "EV-014", domain: "social", type: "idiom", level: "c1",
        sentence: "I was going to ask for a pay rise, but I got cold ___ at the last minute.",
        answer: "feet",
        options: ["feet", "hands", "legs", "toes"],
        meaningEs: "Rajarse, echarse atrás por miedo",
        example: "He got cold feet the night before the wedding." },

      { id: "EV-015", domain: "everyday", type: "idiom", level: "b2",
        sentence: "Let's call it a ___ — we've done enough for today.",
        answer: "day",
        options: ["day", "night", "time", "break"],
        meaningEs: "Dejarlo por hoy",
        example: "It's six o'clock. Shall we call it a day?" },

      { id: "EV-016", domain: "everyday", type: "phrasal", level: "c1",
        sentence: "He's been working non-stop for months; if he doesn't take a break, he'll burn ___.",
        answer: "out",
        options: ["out", "off", "down", "up"],
        meaningEs: "Quemarse, agotarse (burn out / burnout)",
        example: "A lot of nurses burned out during the pandemic." },

      { id: "EV-017", domain: "social", type: "idiom", level: "b2",
        sentence: "I'll take your word ___ it — you know the area better than I do.",
        answer: "for",
        options: ["for", "on", "at", "with"],
        meaningEs: "Creerte sin comprobarlo",
        example: "Is the restaurant really that good? I'll take your word for it." },

      { id: "EV-018", domain: "ideas", type: "idiom", level: "c1",
        sentence: "There's no point rushing — learning a language is a marathon, not a ___.",
        answer: "sprint",
        options: ["sprint", "race", "run", "dash"],
        meaningEs: "Es una carrera de fondo",
        example: "Building a business is a marathon, not a sprint." },

      { id: "EV-019", domain: "everyday", type: "collocation", level: "b2",
        sentence: "I'm trying to get into the ___ of reading before bed.",
        answer: "habit",
        options: ["habit", "custom", "costume", "use"],
        meaningEs: "Coger la costumbre de (get into the habit of)",
        example: "I've got into the habit of checking my phone first thing — bad idea." },

      { id: "EV-020", domain: "social", type: "collocation", level: "b2",
        sentence: "Could you ___ me a favour and hold the door?",
        answer: "do",
        options: ["do", "make", "give", "take"],
        meaningEs: "Hacer un favor (do someone a favour)",
        example: "Can you do me a favour and water the plants?" },

      { id: "EV-021", domain: "everyday", type: "collocation", level: "b2",
        sentence: "I ___ a mistake with the booking, so we have to change the dates.",
        answer: "made",
        options: ["made", "did", "had", "took"],
        meaningEs: "Cometer un error (make a mistake)",
        example: "Everyone makes mistakes when they're learning." },

      { id: "EV-022", domain: "everyday", type: "collocation", level: "b2",
        sentence: "Let's ___ a break and grab a coffee.",
        answer: "take",
        options: ["take", "make", "do", "give"],
        meaningEs: "Hacer una pausa (take a break)",
        example: "You look tired — take a break." },

      { id: "EV-023", domain: "everyday", type: "collocation", level: "b2",
        sentence: "Traffic was really ___ this morning; it took me an hour to get to work.",
        answer: "heavy",
        options: ["heavy", "strong", "big", "fat"],
        meaningEs: "Tráfico denso (heavy traffic)",
        example: "There's heavy traffic on the ring road." },

      { id: "EV-024", domain: "everyday", type: "collocation", level: "b2",
        sentence: "I'm a very ___ sleeper — the slightest noise wakes me up.",
        answer: "light",
        options: ["light", "soft", "thin", "weak"],
        meaningEs: "Tener el sueño ligero (light sleeper ↔ heavy sleeper)",
        example: "My brother is a heavy sleeper; nothing wakes him up." },

      { id: "EV-025", domain: "everyday", type: "collocation", level: "b2",
        sentence: "Could you ___ attention to this next part? It's important.",
        answer: "pay",
        options: ["pay", "put", "make", "lend"],
        meaningEs: "Prestar atención (pay attention)",
        example: "Sorry, I wasn't paying attention." },

      { id: "EV-026", domain: "social", type: "collocation", level: "b2",
        sentence: "We ___ a great time at the wedding.",
        answer: "had",
        options: ["had", "passed", "spent", "did"],
        meaningEs: "Pasarlo bien (have a great time)",
        example: "Did you have a good time in Paris?" },

      { id: "EV-027", domain: "everyday", type: "word", level: "b2",
        sentence: "I can't come tonight — I've got a ___ and I'm staying in bed.",
        answer: "cold",
        options: ["cold", "constipation", "fresh", "cool"],
        meaningEs: "Resfriado (have a cold)",
        example: "I always catch a cold in October." },

      { id: "EV-028", domain: "everyday", type: "word", level: "b2",
        sentence: "I'm really ___ about the trip — I can't wait!",
        answer: "excited",
        options: ["excited", "exciting", "emotional", "emotioned"],
        meaningEs: "Ilusionado, con muchas ganas",
        example: "The kids are so excited about Christmas." },

      { id: "EV-029", domain: "everyday", type: "word", level: "b2",
        sentence: "The film was so ___ that I fell asleep halfway through.",
        answer: "boring",
        options: ["boring", "bored", "tiring", "bothering"],
        meaningEs: "Aburrido (-ing describe la cosa; -ed, cómo te sientes)",
        example: "I was bored, because the talk was really boring." },

      { id: "EV-030", domain: "social", type: "word", level: "c1",
        sentence: "He's very ___ — he always remembers everyone's birthday.",
        answer: "thoughtful",
        options: ["thoughtful", "sympathetic", "sensible", "careful"],
        meaningEs: "Atento, detallista",
        example: "What a thoughtful present — thank you!" },

      { id: "EV-031", domain: "everyday", type: "word", level: "b2",
        sentence: "Could you ___ me your charger? Mine's dead.",
        answer: "lend",
        options: ["lend", "borrow", "leave", "let"],
        meaningEs: "Prestar (lend = dar prestado; borrow = pedir prestado)",
        example: "Can I borrow your pen? — Sure, I'll lend it to you." },

      { id: "EV-032", domain: "everyday", type: "word", level: "b2",
        sentence: "When I got to the door, I ___ that I'd left my keys at home.",
        answer: "realised",
        options: ["realised", "noticed of", "gave count", "reminded"],
        meaningEs: "Darse cuenta (realise)",
        example: "I didn't realise it was so late." },

      { id: "EV-033", domain: "everyday", type: "phrasal", level: "c1",
        sentence: "I go running, but I can't ___ with my friends who do marathons.",
        answer: "keep up",
        options: ["keep up", "keep on", "keep off", "keep out"],
        meaningEs: "Seguir el ritmo (keep up with)",
        example: "Prices are rising faster than salaries can keep up." },

      { id: "EV-034", domain: "everyday", type: "phrasal", level: "b2",
        sentence: "We had to ___ the barbecue because of the storm.",
        answer: "call off",
        options: ["call off", "call up", "call out", "call in"],
        meaningEs: "Cancelar",
        example: "The match was called off because of the snow." },

      { id: "EV-035", domain: "everyday", type: "phrasal", level: "c1",
        sentence: "I'm going to ___ early tonight — I'm shattered.",
        answer: "turn in",
        options: ["turn in", "turn up", "turn off", "turn over"],
        meaningEs: "Irse a dormir (informal). 'Shattered' = hecho polvo",
        example: "It's late — I think I'll turn in." },

      { id: "EV-036", domain: "everyday", type: "idiom", level: "c1",
        sentence: "I'm not sure what time I'll finish, so let's ___ it by ear.",
        answer: "play",
        options: ["play", "hear", "take", "sing"],
        meaningEs: "Improvisar sobre la marcha, ya veremos",
        example: "We haven't booked anything — we'll play it by ear." },

      { id: "EV-037", domain: "social", type: "collocation", level: "b2",
        sentence: "Shall we split the ___? Dinner was 80 euros.",
        answer: "bill",
        options: ["bill", "account", "count", "note"],
        meaningEs: "Pagar la cuenta a medias (split the bill)",
        example: "Could we have the bill, please?" },

      { id: "EV-038", domain: "everyday", type: "collocation", level: "c1",
        sentence: "Take an umbrella — it's ___ down out there.",
        answer: "pouring",
        options: ["pouring", "falling", "throwing", "crying"],
        meaningEs: "Llover a cántaros (pour down)",
        example: "It poured down all weekend." },

      { id: "EV-039", domain: "everyday", type: "word", level: "b2",
        sentence: "How long does it ___ to get to the airport from here?",
        answer: "take",
        options: ["take", "last", "need", "spend"],
        meaningEs: "Tardar (it takes + tiempo)",
        example: "It takes me 20 minutes to walk to work." },

      { id: "EV-040", domain: "everyday", type: "idiom", level: "c1",
        sentence: "I've got a lot on my ___ this week, so I might be slow to reply.",
        answer: "plate",
        options: ["plate", "table", "dish", "head"],
        meaningEs: "Tener mucho entre manos",
        example: "Sorry I forgot — I've had a lot on my plate." }
    ],

    /* ------------------------------------------------------------------------
     * VOCABULARIO · HR Data Analytics (hrVocab) — formato hueco
     * --------------------------------------------------------------------- */
    hrVocab: [
      { id: "HR-001", domain: "people", type: "HR term", level: "b2",
        sentence: "Our ___ rate rose to 14% this year, mainly among junior engineers.",
        answer: "attrition", options: ["attrition", "retention", "assistance", "rotation"],
        meaningEs: "Rotación / bajas de empleados (pérdida de plantilla). 'Rotation' no se usa en este sentido.",
        example: "Voluntary attrition is our main KPI for 2027." },

      { id: "HR-002", domain: "people", type: "HR term", level: "b2",
        sentence: "Finance has frozen ___, so we can't open any new roles this quarter.",
        answer: "headcount", options: ["headcount", "staff list", "personnel", "head number"],
        meaningEs: "Plantilla / número de puestos aprobados",
        example: "Headcount closed the year at 4,120." },

      { id: "HR-003", domain: "people", type: "HR term", level: "b2",
        sentence: "Average ___ for data roles is now 52 days, from job posting to offer acceptance.",
        answer: "time-to-hire", options: ["time-to-hire", "onboarding", "notice period", "probation"],
        meaningEs: "Tiempo de contratación",
        example: "We've cut time-to-hire by a week since the new ATS went live." },

      { id: "HR-004", domain: "people", type: "HR term", level: "b2",
        sentence: "New starters complete a two-week ___ programme before joining their teams.",
        answer: "onboarding", options: ["onboarding", "offboarding", "outplacement", "headhunting"],
        meaningEs: "Incorporación / acogida de nuevos empleados",
        example: "Poor onboarding is a major driver of first-year attrition." },

      { id: "HR-005", domain: "people", type: "HR term", level: "b2",
        sentence: "The ___ survey shows that only 58% of employees would recommend us as a place to work.",
        answer: "engagement", options: ["engagement", "commitment", "compromise", "implication"],
        meaningEs: "Encuesta de compromiso / clima laboral. 'Implication' no significa implicación.",
        example: "Engagement scores are highest in teams with regular one-to-ones." },

      { id: "HR-006", domain: "people", type: "HR term", level: "c1",
        sentence: "We report headcount on a full-time ___ basis, so two half-time employees count as one.",
        answer: "equivalent", options: ["equivalent", "employee", "effort", "equal"],
        meaningEs: "FTE = full-time equivalent (equivalente a jornada completa)",
        example: "We're 12 FTEs below plan in operations." },

      { id: "HR-007", domain: "data", type: "HR term", level: "b2",
        sentence: "Before building the dashboard, we spent two weeks on data ___ — removing duplicates and fixing job codes.",
        answer: "cleansing", options: ["cleansing", "washing", "clearing", "ordering"],
        meaningEs: "Limpieza de datos (también 'data cleaning')",
        example: "Data cleansing took longer than the analysis itself." },

      { id: "HR-008", domain: "data", type: "HR term", level: "b2",
        sentence: "A few ___ in the salary data are skewing the average, so let's use the median.",
        answer: "outliers", options: ["outliers", "outsiders", "outcomes", "outputs"],
        meaningEs: "Valores atípicos",
        example: "Once we removed the outliers, the gap almost disappeared." },

      { id: "HR-009", domain: "data", type: "HR term", level: "b2",
        sentence: "Year-on-year, absenteeism is ___ by 1.2 percentage points.",
        answer: "down", options: ["down", "minus", "less", "lower of"],
        meaningEs: "Ha bajado (up/down + by + cantidad). Ojo: 'percentage points' ≠ 'per cent'.",
        example: "Engagement is up 4 points on last year." },

      { id: "HR-010", domain: "people", type: "HR term", level: "b2",
        sentence: "Strategic ___ planning helps us anticipate which skills we'll need in three years.",
        answer: "workforce", options: ["workforce", "personnel", "manpower force", "human"],
        meaningEs: "Planificación estratégica de plantilla",
        example: "The workforce plan is due to the CFO by the 15th." },

      { id: "HR-011", domain: "people", type: "HR term", level: "b2",
        sentence: "Our ___ pay gap has narrowed to 6%, but we still have work to do.",
        answer: "gender", options: ["gender", "genre", "sex", "gendered"],
        meaningEs: "Brecha salarial de género. 'Genre' = género artístico (música, cine).",
        example: "We publish the gender pay gap report every April." },

      { id: "HR-012", domain: "people", type: "HR term", level: "b2",
        sentence: "The new hire is still in her six-month ___ period.",
        answer: "probation", options: ["probation", "testing", "proof", "essay"],
        meaningEs: "Periodo de prueba",
        example: "She passed her probation with excellent feedback." },

      { id: "HR-013", domain: "people", type: "HR term", level: "b2",
        sentence: "He handed in his ___ last week, so we need to start recruiting.",
        answer: "notice", options: ["notice", "dimission", "renounce", "retirement"],
        meaningEs: "Hand in your notice = presentar la dimisión (dar el preaviso). Dimisión = resignation.",
        example: "She's working her notice until the end of the month." },

      { id: "HR-014", domain: "people", type: "HR term", level: "c1",
        sentence: "He's leaving in May, so we need to ___ his role as soon as possible.",
        answer: "backfill", options: ["backfill", "refill", "fill out", "fill back"],
        meaningEs: "Cubrir el puesto de alguien que se va (contratar a un sustituto)",
        example: "We've approved a backfill for the data engineer role." },

      { id: "HR-015", domain: "data", type: "HR term", level: "b2",
        sentence: "Let's ___ the data by tenure band to see if new joiners leave faster.",
        answer: "segment", options: ["segment", "divide out", "separate in", "part"],
        meaningEs: "Segmentar",
        example: "When we segment by tenure, the picture changes completely." },

      { id: "HR-016", domain: "data", type: "HR term", level: "b2",
        sentence: "There's a clear ___ in leavers every March, right after bonuses are paid.",
        answer: "spike", options: ["spike", "pick", "peak up", "top"],
        meaningEs: "Pico (subida brusca y puntual)",
        example: "We saw a spike in sick leave during the flu season." },

      { id: "HR-017", domain: "data", type: "HR term", level: "c1",
        sentence: "Engagement is a ___ indicator: it warns us about problems before they show up in attrition.",
        answer: "leading", options: ["leading", "lagging", "leader", "advanced"],
        meaningEs: "Indicador adelantado (leading) vs. indicador retrasado (lagging)",
        example: "Attrition is a lagging indicator — by the time it moves, people have already left." },

      { id: "HR-018", domain: "data", type: "HR term", level: "c1",
        sentence: "With the new dashboard, managers can ___ the data by team and location themselves.",
        answer: "drill down into", options: ["drill down into", "dig up", "deep in", "go under"],
        meaningEs: "Profundizar en los datos (bajar al detalle)",
        example: "If you drill down into the numbers, the issue is in one site." },

      { id: "HR-019", domain: "data", type: "HR term", level: "b2",
        sentence: "The results aren't ___ yet — we only have 40 responses out of 600.",
        answer: "representative", options: ["representative", "representing", "presentable", "relevant"],
        meaningEs: "Representativos (de la población)",
        example: "We need at least a 50% response rate for the results to be representative." },

      { id: "HR-020", domain: "people", type: "HR term", level: "b2",
        sentence: "Our employer ___ is weaker in the US, which slows down hiring there.",
        answer: "brand", options: ["brand", "mark", "marque", "label"],
        meaningEs: "Marca empleadora (employer brand / employer branding)",
        example: "Glassdoor reviews have a big impact on our employer brand." },

      { id: "HR-021", domain: "people", type: "HR term", level: "c1",
        sentence: "Internal ___ — the share of roles filled by existing employees — rose to 35%.",
        answer: "mobility", options: ["mobility", "movement", "mobilisation", "motion"],
        meaningEs: "Movilidad interna",
        example: "Internal mobility is one of our best retention levers." },

      { id: "HR-022", domain: "data", type: "HR term", level: "b2",
        sentence: "Please make sure the file is ___ before you share it — no names or employee IDs.",
        answer: "anonymised", options: ["anonymised", "unnamed", "nameless", "secret"],
        meaningEs: "Anonimizado (GDPR). En EE. UU. se escribe 'anonymized'.",
        example: "All survey results are anonymised and aggregated." },

      { id: "HR-023", domain: "people", type: "HR term", level: "b2",
        sentence: "Exit ___ tell us that lack of career progression is the main reason people leave.",
        answer: "interviews", options: ["interviews", "meetings", "reunions", "encounters"],
        meaningEs: "Entrevistas de salida. 'Reunion' = reencuentro, nunca reunión de trabajo.",
        example: "We run exit interviews with every voluntary leaver." },

      { id: "HR-024", domain: "data", type: "HR term", level: "b2",
        sentence: "I'm trying to ___ the headcount in Workday with the payroll file, but they don't match.",
        answer: "reconcile", options: ["reconcile", "conciliate", "square up", "match out"],
        meaningEs: "Cuadrar / conciliar dos fuentes de datos",
        example: "The two reports are out by about thirty people — we need to reconcile them." }
    ],

    /* ------------------------------------------------------------------------
     * GRAMÁTICA en contexto (grammar) — formato hueco con regla de una línea
     * --------------------------------------------------------------------- */
    grammar: [
      { id: "G-001", domain: "people", topic: "Present perfect", level: "b2",
        sentence: "Attrition ___ by 3% since January.",
        answer: "has increased", options: ["has increased", "increased", "is increasing", "was increased"],
        rule: "'Since' + un periodo que llega hasta hoy → present perfect (has/have + participio)." },

      { id: "G-002", domain: "people", topic: "Past simple", level: "b2",
        sentence: "Attrition ___ by 3% last year.",
        answer: "increased", options: ["increased", "has increased", "have increased", "was increase"],
        rule: "Periodo terminado (last year, in 2024, in Q1) → past simple." },

      { id: "G-003", domain: "data", topic: "Present perfect continuous", level: "b2",
        sentence: "I ___ on the new dashboard all week, so it's almost ready.",
        answer: "have been working", options: ["have been working", "am working", "worked", "work"],
        rule: "Acción que empezó en el pasado y sigue hasta ahora, poniendo el foco en la duración → have been + -ing." },

      { id: "G-004", domain: "people", topic: "Future: planes", level: "b2",
        sentence: "I ___ the results to the leadership team on Monday — it's already in the calendar.",
        answer: "am presenting", options: ["am presenting", "will present", "present", "would present"],
        rule: "Plan cerrado con fecha y hora → present continuous (I'm presenting on Monday)." },

      { id: "G-005", domain: "meetings", topic: "Future: decisiones", level: "b2",
        sentence: "'The file is too big to email.' — 'No problem, I ___ it on Teams.'",
        answer: "'ll share", options: ["'ll share", "am sharing", "share", "shared"],
        rule: "Decisión tomada en el momento de hablar → will ('ll)." },

      { id: "G-006", domain: "people", topic: "1st conditional", level: "b2",
        sentence: "If we ___ the survey in March, we'll have the results before the budget review.",
        answer: "launch", options: ["launch", "will launch", "would launch", "launched"],
        rule: "1er condicional: if + presente, will + verbo. Nunca 'will' después de 'if'." },

      { id: "G-007", domain: "data", topic: "2nd conditional", level: "b2",
        sentence: "If we ___ more data on leavers, we could predict attrition more accurately.",
        answer: "had", options: ["had", "have", "would have", "will have"],
        rule: "Hipótesis sobre el presente → if + pasado, would/could + verbo." },

      { id: "G-008", domain: "people", topic: "3rd conditional", level: "c1",
        sentence: "If we ___ the issue earlier, we wouldn't have lost three engineers.",
        answer: "had spotted", options: ["had spotted", "spotted", "would spot", "have spotted"],
        rule: "Pasado irreal → if + had + participio, would have + participio." },

      { id: "G-009", domain: "meetings", topic: "Diplomacia", level: "b2",
        sentence: "___ it be worth looking at the data by country first?",
        answer: "Would", options: ["Would", "Does", "Must", "Is"],
        rule: "'Would it be worth…?' propone una idea con tacto. Es mucho más diplomático que 'We must…'." },

      { id: "G-010", domain: "data", topic: "Modales", level: "b2",
        sentence: "We ___ want to double-check those figures before sending them to the board.",
        answer: "might", options: ["might", "must to", "should to", "would to"],
        rule: "Los modales nunca llevan 'to' detrás. 'Might want to' = recomendación suave." },

      { id: "G-011", domain: "data", topic: "Preguntas indirectas", level: "b2",
        sentence: "Could you tell me where ___?",
        answer: "the raw data is stored", options: ["the raw data is stored", "is stored the raw data", "is the raw data stored", "the raw data is it stored"],
        rule: "En las preguntas indirectas (Could you tell me…, Do you know…) se usa el orden de afirmación: sujeto + verbo." },

      { id: "G-012", domain: "meetings", topic: "Preguntas indirectas", level: "b2",
        sentence: "Do you know when ___ the final figures?",
        answer: "we'll get", options: ["we'll get", "will we get", "we get will", "get we"],
        rule: "Pregunta indirecta → orden de afirmación: 'when we'll get', no 'when will we get'." },

      { id: "G-013", domain: "people", topic: "Pasiva", level: "b2",
        sentence: "The survey ___ by 2,300 employees last month.",
        answer: "was completed", options: ["was completed", "completed", "has completed", "is completing"],
        rule: "Pasiva = be + participio. En informes es muy útil cuando importa el resultado, no quién lo hace." },

      { id: "G-014", domain: "people", topic: "Pasiva", level: "c1",
        sentence: "The new policy ___ across all regions by the end of Q2.",
        answer: "will have been rolled out", options: ["will have been rolled out", "will roll out", "is rolling", "has rolled out"],
        rule: "'By + fecha futura' → futuro perfecto. En pasiva: will have been + participio." },

      { id: "G-015", domain: "data", topic: "Comparativos", level: "b2",
        sentence: "Turnover in the US is ___ than in Europe.",
        answer: "significantly higher", options: ["significantly higher", "more higher", "much more high", "highest"],
        rule: "Adjetivos cortos: -er (higher), nunca 'more higher'. Matiza con significantly / much / slightly." },

      { id: "G-016", domain: "people", topic: "Superlativos", level: "b2",
        sentence: "Engagement is ___ in teams with regular one-to-ones.",
        answer: "highest", options: ["highest", "most high", "the more high", "higher of"],
        rule: "Superlativo de adjetivo corto: -est (highest). 'Most' solo con adjetivos largos (most engaged)." },

      { id: "G-017", domain: "meetings", topic: "Estilo indirecto", level: "b2",
        sentence: "My manager asked me ___ finish the report by Friday.",
        answer: "if I could", options: ["if I could", "that I could", "could I", "to could"],
        rule: "Preguntas en estilo indirecto: asked + if/whether + sujeto + verbo." },

      { id: "G-018", domain: "meetings", topic: "Be used to", level: "c1",
        sentence: "I'm still not ___ the Australian accent on calls.",
        answer: "used to", options: ["used to", "use to", "using to", "usual to"],
        rule: "'Be used to + sustantivo / -ing' = estar acostumbrado a. Ojo: 'used to + verbo' = solía." },

      { id: "G-019", domain: "meetings", topic: "Gerundio tras preposición", level: "b2",
        sentence: "I'm looking forward ___ the team in Sydney.",
        answer: "to meeting", options: ["to meeting", "to meet", "meeting", "for meeting"],
        rule: "'Look forward to' + -ing. Aquí 'to' es preposición, no parte del infinitivo." },

      { id: "G-020", domain: "data", topic: "Gerundio", level: "b2",
        sentence: "We should avoid ___ conclusions from such a small sample.",
        answer: "drawing", options: ["drawing", "to draw", "draw", "to drawing"],
        rule: "Avoid / suggest / consider / recommend + -ing." },

      { id: "G-021", domain: "data", topic: "Infinitivo", level: "b2",
        sentence: "We decided ___ the analysis to include contractors.",
        answer: "to extend", options: ["to extend", "extending", "extend", "for extend"],
        rule: "Decide / plan / agree / need + to + verbo. Nunca 'for + verbo'." },

      { id: "G-022", domain: "people", topic: "Relativos", level: "b2",
        sentence: "The employees ___ left in their first year cited poor onboarding.",
        answer: "who", options: ["who", "which", "what", "whose"],
        rule: "Who / that para personas, which / that para cosas. 'What' nunca es pronombre relativo." },

      { id: "G-023", domain: "data", topic: "Cuantificadores", level: "b2",
        sentence: "We received ___ responses than we expected.",
        answer: "fewer", options: ["fewer", "less", "little", "lesser"],
        rule: "Fewer + contables (responses, people). Less + incontables (data, time, money)." },

      { id: "G-024", domain: "data", topic: "Cuantificadores", level: "b2",
        sentence: "There isn't ___ data on contractors yet.",
        answer: "much", options: ["much", "many", "a lot", "few"],
        rule: "'Data' es incontable: much en negativas y preguntas, nunca 'many'." },

      { id: "G-025", domain: "data", topic: "Preposiciones con datos", level: "b2",
        sentence: "Absenteeism fell from 4.5% ___ 3.8%.",
        answer: "to", options: ["to", "until", "at", "in"],
        rule: "Desde un valor hasta otro: from X to Y." },

      { id: "G-026", domain: "data", topic: "Preposiciones con datos", level: "b2",
        sentence: "Absenteeism fell ___ 0.7 percentage points.",
        answer: "by", options: ["by", "in", "of", "with"],
        rule: "'By' indica la magnitud del cambio: rose by 2%, fell by 0.7 points." },

      { id: "G-027", domain: "people", topic: "Present perfect continuous", level: "b2",
        sentence: "I ___ in HR analytics for about seven months now.",
        answer: "have been working", options: ["have been working", "work", "am working", "worked"],
        rule: "Duración hasta hoy con 'for' / 'since' → present perfect continuous. Nunca presente simple ('I work here for…')." },

      { id: "G-028", domain: "data", topic: "Deducción en pasado", level: "c1",
        sentence: "The data ___ been exported incorrectly — the totals don't match.",
        answer: "must have", options: ["must have", "must", "should", "can have"],
        rule: "Deducción lógica sobre el pasado → must have + participio." },

      { id: "G-029", domain: "people", topic: "Should have", level: "c1",
        sentence: "Looking back, we ___ involved the managers earlier.",
        answer: "should have", options: ["should have", "should", "must", "would"],
        rule: "'Should have + participio' = lo que habría sido mejor hacer (reflexión o crítica sobre el pasado)." },

      { id: "G-030", domain: "people", topic: "Énfasis (cleft)", level: "c1",
        sentence: "What we really need ___ better data on why people leave.",
        answer: "is", options: ["is", "are", "it's", "be"],
        rule: "'What we need is…' pone el foco en lo importante. Es muy útil para hacer recomendaciones." },

      { id: "G-031", domain: "people", topic: "Inversión", level: "c1",
        sentence: "Not only ___ attrition fallen, but engagement has also improved.",
        answer: "has", options: ["has", "have", "did", "is"],
        rule: "Tras 'Not only' al inicio se invierte sujeto y auxiliar (Not only has attrition fallen…). Registro formal y persuasivo." },

      { id: "G-032", domain: "everyday", topic: "Used to", level: "b2",
        sentence: "When I was a kid, I ___ play football every weekend.",
        answer: "used to",
        options: ["used to", "was used to", "use to", "am used to"],
        rule: "Hábito del pasado que ya no ocurre → used to + infinitivo. 'Be used to + -ing' = estar acostumbrado." },

      { id: "G-033", domain: "everyday", topic: "Tiempos narrativos", level: "b2",
        sentence: "We ___ dinner when all the lights suddenly went out.",
        answer: "were having",
        options: ["were having", "had", "have had", "are having"],
        rule: "Acción en curso interrumpida por otra → past continuous (was/were + -ing) + past simple." },

      { id: "G-034", domain: "everyday", topic: "Past perfect", level: "c1",
        sentence: "By the time we got to the station, the train ___.",
        answer: "had already left",
        options: ["had already left", "already left", "has already left", "was already leaving"],
        rule: "Algo que ocurrió antes de otro momento del pasado → had + participio." },

      { id: "G-035", domain: "social", topic: "Present perfect: experiencias", level: "b2",
        sentence: "___ you ever been to Australia?",
        answer: "Have",
        options: ["Have", "Did", "Were", "Are"],
        rule: "Experiencias vitales sin momento concreto → Have you ever + participio?" },

      { id: "G-036", domain: "social", topic: "Question tags", level: "b2",
        sentence: "It's a lovely day, ___ it?",
        answer: "isn't",
        options: ["isn't", "is", "doesn't", "no"],
        rule: "Frase afirmativa → coletilla negativa con el mismo auxiliar (It's…, isn't it?). Invita al otro a responder." },

      { id: "G-037", domain: "everyday", topic: "Wish", level: "c1",
        sentence: "I wish I ___ more time to travel.",
        answer: "had",
        options: ["had", "have", "would have", "will have"],
        rule: "Deseo sobre el presente → wish + past simple (I wish I had…). Sobre el pasado → wish + past perfect." },

      { id: "G-038", domain: "everyday", topic: "So / such", level: "b2",
        sentence: "It was ___ a good film that I watched it twice.",
        answer: "such",
        options: ["such", "so", "very", "too"],
        rule: "Such (a) + adjetivo + sustantivo; so + adjetivo solo (so good). Ambos + that para la consecuencia." },

      { id: "G-039", domain: "everyday", topic: "Stop + -ing / to", level: "c1",
        sentence: "On the way home, we stopped ___ some bread.",
        answer: "to buy",
        options: ["to buy", "buying", "buy", "for buying"],
        rule: "Stop to + infinitivo = parar para hacer algo. Stop + -ing = dejar de hacerlo (I stopped smoking)." },

      { id: "G-040", domain: "everyday", topic: "Condicional mixto", level: "c1",
        sentence: "If I hadn't taken that job, I ___ in Madrid now.",
        answer: "would still be living",
        options: ["would still be living", "will still live", "would still have lived", "am still living"],
        rule: "Condición en el pasado con resultado en el presente → If + past perfect, would + infinitivo (+ now)." },

      { id: "G-041", domain: "social", topic: "Get used to", level: "b2",
        sentence: "I'm slowly ___ to Mark's Australian accent.",
        answer: "getting used",
        options: ["getting used", "using", "used", "get use"],
        rule: "Get used to + sustantivo o -ing = irse acostumbrando. Be used to = estar ya acostumbrado." }
    ],

    /* ------------------------------------------------------------------------
     * COMPRENSIÓN AUDITIVA (listening)
     * Mark habla con voz australiana (en-AU) si el dispositivo la tiene.
     * --------------------------------------------------------------------- */
    listening: [
      { id: "L-001", domain: "people", level: "b2", title: "Mensaje de voz de Mark",
        context: "Mark te deja un mensaje de voz antes de vuestro 1:1.",
        lines: [
          { who: "mark", text: "Hey, it's Mark. Quick one — I'm in back-to-back meetings this arvo, so I won't make our one-on-one at three." },
          { who: "mark", text: "Could we push it to tomorrow morning, say nine?" },
          { who: "mark", text: "Also, can you bring the latest attrition numbers for Spain? The leadership team want to see them on Thursday." },
          { who: "mark", text: "No worries if they're not perfect, just a first cut. Cheers." }
        ],
        questions: [
          { q: "Why can't Mark make the one-on-one?", options: ["He has meetings all afternoon", "He's travelling to Sydney", "He's not feeling well"], answer: 0 },
          { q: "When does he suggest meeting instead?", options: ["Today at three", "Tomorrow at nine", "On Thursday"], answer: 1 },
          { q: "What does he say about the attrition numbers?", options: ["They must be final", "A first version is fine", "He'll prepare them himself"], answer: 1 }
        ],
        glossary: [ { t: "arvo", es: "afternoon (tarde) — muy australiano" }, { t: "push it to", es: "moverlo a / aplazarlo a" }, { t: "a first cut", es: "una primera versión" }, { t: "no worries", es: "no pasa nada / tranquilo" } ] },

      { id: "L-002", domain: "meetings", level: "b2", title: "Reunión de equipo: encuesta",
        context: "Reunión semanal. Mark pregunta a Sarah por la encuesta de engagement.",
        lines: [
          { who: "mark", text: "Okay, let's kick off. Sarah, where are we with the engagement survey?" },
          { who: "sarah", text: "The response rate is at sixty-two percent, which is up on last year. But the US is lagging — only forty percent so far." },
          { who: "mark", text: "Right. I reckon we extend the deadline by a week for the US, then. Can you flag that with Jake's team?" },
          { who: "sarah", text: "Will do." }
        ],
        questions: [
          { q: "What is the overall response rate?", options: ["Forty percent", "Sixty-two percent", "Twenty-six percent"], answer: 1 },
          { q: "What is the problem?", options: ["The US response rate is low", "The survey closed early", "Spain hasn't started"], answer: 0 },
          { q: "What does Mark decide?", options: ["To close the survey", "To extend the US deadline by a week", "To send it to managers"], answer: 1 }
        ],
        glossary: [ { t: "kick off", es: "empezar" }, { t: "lagging", es: "quedándose atrás" }, { t: "I reckon", es: "creo / me parece (muy común en Australia)" }, { t: "flag something with someone", es: "avisar a alguien de algo" } ] },

      { id: "L-003", domain: "data", level: "c1", title: "Mark revisa tu dashboard",
        context: "Mark ha visto tu dashboard y te comenta algo por Teams (llamada).",
        lines: [
          { who: "mark", text: "I had a look at the dashboard — nice work, mate." },
          { who: "mark", text: "One thing that's bugging me, though: the turnover figure for France looks way too high. Twenty-two percent?" },
          { who: "mark", text: "Are we counting internal transfers as leavers? Because if we are, that'd explain heaps." },
          { who: "mark", text: "Can you double-check before it goes to the exec team?" }
        ],
        questions: [
          { q: "What does Mark think of the dashboard overall?", options: ["He likes it", "He hasn't seen it yet", "He thinks it's too complex"], answer: 0 },
          { q: "What is he worried about?", options: ["Spain is missing", "The France turnover figure seems too high", "The dashboard is slow"], answer: 1 },
          { q: "What could explain the problem?", options: ["Internal transfers counted as leavers", "A currency error", "Duplicated survey answers"], answer: 0 }
        ],
        glossary: [ { t: "mate", es: "colega (trato cercano, muy australiano)" }, { t: "it's bugging me", es: "me inquieta / me chirría" }, { t: "heaps", es: "mucho (australiano)" }, { t: "exec team", es: "comité de dirección" } ] },

      { id: "L-004", domain: "people", level: "b2", title: "Llamada con el equipo de EE. UU.",
        context: "Jake, de People Ops en EE. UU., te llama con una petición.",
        lines: [
          { who: "jake", text: "Hey, thanks for jumping on. So, we're looking to roll out the new people dashboard in the US by Q1." },
          { who: "jake", text: "The main ask from our side is a view of time-to-hire by location." },
          { who: "jake", text: "Right now we're tracking it in spreadsheets, and honestly, it's a mess." },
          { who: "jake", text: "Could your team help us scope it out?" }
        ],
        questions: [
          { q: "What do they want to roll out by Q1?", options: ["A new engagement survey", "The new people dashboard", "A hiring policy"], answer: 1 },
          { q: "What is their main request?", options: ["Time-to-hire by location", "Attrition by gender", "Salary benchmarks"], answer: 0 },
          { q: "How are they tracking it now?", options: ["In Power BI", "They aren't tracking it", "In spreadsheets"], answer: 2 }
        ],
        glossary: [ { t: "jump on (a call)", es: "conectarse a una llamada" }, { t: "the ask", es: "la petición" }, { t: "scope something out", es: "definir el alcance de algo" } ] },

      { id: "L-005", domain: "leadership", level: "b2", title: "Feedback de Mark",
        context: "Final de tu 1:1. Mark te da feedback.",
        lines: [
          { who: "mark", text: "So, overall, you're doing a great job. Your analysis is really solid." },
          { who: "mark", text: "The one thing I'd love to see more of is you speaking up in team meetings." },
          { who: "mark", text: "You often have the best insights in the room, but you keep them to yourself." },
          { who: "mark", text: "And don't stress about your English — it's absolutely fine. Just jump in. Sound good?" }
        ],
        questions: [
          { q: "What does Mark praise?", options: ["Your punctuality", "Your analysis", "Your slide design"], answer: 1 },
          { q: "What would he like to see more of?", options: ["You speaking up in meetings", "Longer reports", "More English classes"], answer: 0 },
          { q: "What does he say about your English?", options: ["You need to improve it first", "It's fine — don't worry", "You should take a course"], answer: 1 }
        ],
        glossary: [ { t: "speak up", es: "hablar / intervenir (dar tu opinión)" }, { t: "keep something to yourself", es: "guardártelo para ti" }, { t: "don't stress", es: "no te agobies" }, { t: "Sound good?", es: "¿Te parece bien?" } ] },

      { id: "L-006", domain: "people", level: "c1", title: "Comité: cifras del trimestre",
        context: "Sarah presenta las cifras de personas al comité de dirección.",
        lines: [
          { who: "sarah", text: "Headcount closed the quarter at four thousand one hundred and twenty, slightly below plan." },
          { who: "sarah", text: "Voluntary attrition is running at eleven point four percent annualised, down from thirteen." },
          { who: "sarah", text: "The biggest improvement was in operations, where we introduced stay interviews in the spring." }
        ],
        questions: [
          { q: "How did headcount compare with the plan?", options: ["Slightly below", "Slightly above", "Exactly on plan"], answer: 0 },
          { q: "How has voluntary attrition changed?", options: ["From 11.4% to 13%", "From 13% to 11.4%", "From 14% to 11%"], answer: 1 },
          { q: "Why did operations improve the most?", options: ["A pay rise", "A new manager", "Stay interviews"], answer: 2 }
        ],
        glossary: [ { t: "running at", es: "situarse en (dato en curso)" }, { t: "annualised", es: "anualizado" }, { t: "stay interviews", es: "entrevistas de permanencia" } ] },

      { id: "L-007", domain: "meetings", level: "b2", title: "Lunes por la mañana",
        context: "Mark te saluda al llegar a la oficina (small talk).",
        lines: [
          { who: "mark", text: "Morning! How was your weekend?" },
          { who: "mark", text: "I went down the coast with the kids — absolutely stunning weather." },
          { who: "mark", text: "Anyway, are you keen to grab a coffee before the all-hands? I wanted to pick your brain about the headcount model." }
        ],
        questions: [
          { q: "Where did Mark go at the weekend?", options: ["To the mountains", "To the coast", "He stayed at home"], answer: 1 },
          { q: "What does he suggest?", options: ["A coffee before the all-hands", "Lunch after work", "A call later"], answer: 0 },
          { q: "Why does he want to talk?", options: ["To discuss your holidays", "To get your ideas on the headcount model", "To introduce a new colleague"], answer: 1 }
        ],
        glossary: [ { t: "keen", es: "con ganas / ¿te apetece? (muy común en Australia)" }, { t: "grab a coffee", es: "tomar un café" }, { t: "pick someone's brain", es: "pedirle ideas / consejo a alguien" }, { t: "all-hands", es: "reunión general de toda la plantilla" } ] },

      { id: "L-008", domain: "people", level: "c1", title: "Preguntas tras tu presentación",
        context: "Has presentado ante 40 personas. Jake te hace una pregunta.",
        lines: [
          { who: "jake", text: "Thanks, that was really insightful. Quick question on slide six." },
          { who: "jake", text: "You mentioned that attrition is highest in the first year. Do you have any sense of what's driving that?" },
          { who: "jake", text: "Is it onboarding, pay, or something else?" }
        ],
        questions: [
          { q: "Which slide is Jake asking about?", options: ["Slide two", "Slide six", "Slide sixteen"], answer: 1 },
          { q: "What finding is he referring to?", options: ["Attrition is highest in the first year", "Pay is lowest in the US", "Onboarding scores are high"], answer: 0 },
          { q: "What does he want to know?", options: ["The causes behind it", "Where to download the slides", "Who collected the data"], answer: 0 }
        ],
        glossary: [ { t: "insightful", es: "revelador, que aporta mucho" }, { t: "Do you have any sense of…?", es: "¿Tienes alguna idea de…?" }, { t: "what's driving that", es: "qué lo está provocando" } ] },

      { id: "L-009", domain: "people", level: "c1", title: "Prioridades del trimestre",
        context: "Mark fija las prioridades del equipo.",
        lines: [
          { who: "mark", text: "Look, we've got a lot on our plate this quarter, so let's be ruthless." },
          { who: "mark", text: "Number one is the workforce plan for 2027. That's non-negotiable — it's due to the CFO by the fifteenth." },
          { who: "mark", text: "The attrition deep dive can wait until January." },
          { who: "mark", text: "And the survey dashboard — let's just do a quick and dirty version for now. Fair enough?" }
        ],
        questions: [
          { q: "What is the top priority?", options: ["The attrition deep dive", "The survey dashboard", "The 2027 workforce plan"], answer: 2 },
          { q: "When is it due?", options: ["By the fifteenth, to the CFO", "In January", "At the end of the quarter"], answer: 0 },
          { q: "What about the survey dashboard?", options: ["Cancel it", "Do a simple version for now", "Postpone it to January"], answer: 1 }
        ],
        glossary: [ { t: "a lot on our plate", es: "mucho trabajo encima" }, { t: "ruthless", es: "implacable (priorizar sin piedad)" }, { t: "quick and dirty", es: "rápido y sin pulir" }, { t: "Fair enough?", es: "¿Os parece razonable?" } ] },

      { id: "L-010", domain: "data", level: "b2", title: "Sarah tiene un problema con los datos",
        context: "Sarah te escribe por Teams y luego te llama.",
        lines: [
          { who: "sarah", text: "Hi, sorry to bother you. I'm trying to reconcile the headcount numbers from Workday with the payroll file." },
          { who: "sarah", text: "They're out by about thirty people, and I can't work out why." },
          { who: "sarah", text: "I think it might be contractors. Have you come across this before?" }
        ],
        questions: [
          { q: "What is Sarah comparing?", options: ["Workday headcount and the payroll file", "Survey results and exit interviews", "The budget and actual costs"], answer: 0 },
          { q: "How big is the difference?", options: ["About thirteen people", "About thirty people", "About three hundred people"], answer: 1 },
          { q: "What does she think is causing it?", options: ["Interns", "Duplicated records", "Contractors"], answer: 2 }
        ],
        glossary: [ { t: "reconcile", es: "cuadrar (dos fuentes de datos)" }, { t: "out by", es: "desviado en / no cuadra por" }, { t: "work out", es: "averiguar, entender" }, { t: "come across", es: "encontrarse con" } ] },

      { id: "L-011", domain: "leadership", level: "b2", title: "Mark y el retraso",
        context: "Le dices a Mark que el informe va con un día de retraso.",
        lines: [
          { who: "mark", text: "Mate, don't worry about the delay — she'll be right. The exec meeting got pushed to next week anyway." },
          { who: "mark", text: "Just give it a once-over before you send it, and maybe add a slide on the gender split." },
          { who: "mark", text: "Good on you for flagging it early, by the way." }
        ],
        questions: [
          { q: "How does Mark react to the delay?", options: ["He's relaxed about it", "He's annoyed", "He's surprised"], answer: 0 },
          { q: "Why isn't it a problem?", options: ["Someone else will finish it", "The exec meeting was moved to next week", "The report isn't needed"], answer: 1 },
          { q: "What does he ask you to add?", options: ["A slide on salaries", "An executive summary", "A slide on the gender split"], answer: 2 }
        ],
        glossary: [ { t: "she'll be right", es: "todo saldrá bien (expresión australiana)" }, { t: "give it a once-over", es: "darle un repaso rápido" }, { t: "good on you", es: "¡bien hecho! (australiano)" }, { t: "flag something early", es: "avisar de algo con tiempo" } ] },

      { id: "L-012", domain: "people", level: "c1", title: "Proyecto con Reino Unido",
        context: "Sarah te propone entrar en un proyecto internacional.",
        lines: [
          { who: "sarah", text: "We're putting together a small working group with the UK team to harmonise how we define attrition across countries." },
          { who: "sarah", text: "At the moment, every region calculates it slightly differently, which makes comparisons pretty meaningless." },
          { who: "sarah", text: "We'd need someone from analytics for about two hours a week. Would you be interested?" }
        ],
        questions: [
          { q: "What is the aim of the working group?", options: ["To hire more analysts", "To agree one definition of attrition", "To launch a new survey"], answer: 1 },
          { q: "Why is it needed?", options: ["Each region calculates attrition differently", "The UK has no data", "Attrition is too high"], answer: 0 },
          { q: "How much time would it take?", options: ["Two days a week", "Full-time for a month", "About two hours a week"], answer: 2 }
        ],
        glossary: [ { t: "put together", es: "organizar / montar" }, { t: "harmonise", es: "armonizar, unificar criterios" }, { t: "meaningless", es: "sin sentido / que no sirve" } ] },

      { id: "L-013", domain: "social", level: "b2", title: "Lunes en la cocina",
        context: "Mark te encuentra en la cocina de la oficina el lunes por la mañana.",
        lines: [
          { who: "mark", text: "Morning! How was your weekend? Get up to much?" },
          { who: "mark", text: "We had a few mates over on Saturday arvo for a barbie. Way too much food, as usual — I was stuffed by six." },
          { who: "mark", text: "Then on Sunday we took the kids down to the beach, but it absolutely bucketed down, so we ended up at the cinema instead." },
          { who: "mark", text: "Anyway — the kettle's boiled. Fancy a cuppa?" }
        ],
        questions: [
          { q: "What did Mark do on Saturday?", options: ["Had a barbecue with friends", "Went to the beach", "Worked from home"], answer: 0 },
          { q: "Why did they go to the cinema on Sunday?", options: ["The kids asked to go", "It rained heavily", "The beach was closed"], answer: 1 },
          { q: "What does Mark offer you?", options: ["A lift home", "A cup of tea", "Some leftover food"], answer: 1 }
        ],
        glossary: [
          { t: "get up to much", es: "hacer algo especial" },
          { t: "mates", es: "amigos (AU/UK)" },
          { t: "barbie", es: "barbacoa (AU)" },
          { t: "stuffed", es: "lleno de comer" },
          { t: "bucket down", es: "llover a cántaros" },
          { t: "fancy a cuppa?", es: "¿te apetece un té? (cuppa = cup of tea)" }
        ] },

      { id: "L-014", domain: "social", level: "b2", title: "Cervezas después del trabajo",
        context: "Jake y Sarah charlan tomando algo después de un taller en Madrid.",
        lines: [
          { who: "jake", text: "So Sarah, how long have you been living in Madrid now?" },
          { who: "sarah", text: "Nearly three years. Honestly, I was a bit nervous at first because my Spanish was dreadful, but I've settled in really well." },
          { who: "jake", text: "That's awesome. Do you think you'll stay long-term?" },
          { who: "sarah", text: "I reckon so. The only thing I really miss is a proper Sunday roast — nobody does it like my mum." }
        ],
        questions: [
          { q: "How long has Sarah lived in Madrid?", options: ["Almost three years", "Three months", "More than five years"], answer: 0 },
          { q: "How did she feel at the beginning?", options: ["Excited", "Nervous", "Bored"], answer: 1 },
          { q: "What does she miss from home?", options: ["The weather", "Her mum's Sunday roast", "Her old job"], answer: 1 }
        ],
        glossary: [
          { t: "dreadful", es: "fatal, malísimo" },
          { t: "settle in", es: "adaptarse, instalarse" },
          { t: "long-term", es: "a largo plazo" },
          { t: "proper", es: "de verdad, como Dios manda (UK)" },
          { t: "Sunday roast", es: "asado tradicional británico del domingo" }
        ] },

      { id: "L-015", domain: "ideas", level: "c1", title: "Debate en la comida: IA y trabajo",
        context: "Mark, Sarah y Jake comentan una noticia durante la comida.",
        lines: [
          { who: "jake", text: "Did you guys see that article saying AI's going to wipe out half of all office jobs?" },
          { who: "mark", text: "Yeah, nah, I reckon that's a bit over the top. It'll take over the boring stuff, sure, but someone still has to make sense of the numbers." },
          { who: "sarah", text: "I'm with Mark on this one. Although I do think people who refuse to learn the tools will struggle." },
          { who: "jake", text: "Fair enough. I guess the real question is whether companies will actually invest in training." }
        ],
        questions: [
          { q: "What is Mark's opinion?", options: ["AI will replace most jobs", "The article exaggerates", "AI is useless"], answer: 1 },
          { q: "What does Sarah add?", options: ["People who don't learn the tools will have problems", "Training is a waste of money", "She disagrees with Mark"], answer: 0 },
          { q: "What does Jake think the key question is?", options: ["Whether AI is legal", "Whether companies will invest in training", "Whether salaries will fall"], answer: 1 }
        ],
        glossary: [
          { t: "wipe out", es: "eliminar por completo" },
          { t: "yeah, nah", es: "no (muletilla australiana: 'sí, pero no')" },
          { t: "over the top", es: "exagerado" },
          { t: "make sense of", es: "entender, encontrar sentido a" },
          { t: "I'm with X on this one", es: "en esto estoy con X" },
          { t: "fair enough", es: "vale, es razonable" }
        ] },

      { id: "L-016", domain: "everyday", level: "b2", title: "La anécdota de Jake en Lisboa",
        context: "Jake os cuenta un viaje durante un café.",
        lines: [
          { who: "jake", text: "So, you won't believe what happened on my trip to Lisbon." },
          { who: "jake", text: "We'd booked this tiny apartment in the old town, but when we turned up, the owner had double-booked it." },
          { who: "jake", text: "We were stuck on the street at midnight with our suitcases. Luckily, he felt so bad that he upgraded us to a place with a terrace overlooking the river." },
          { who: "jake", text: "So it all worked out in the end — honestly, best view I've ever had." }
        ],
        questions: [
          { q: "What was the problem?", options: ["The flight was cancelled", "The apartment was double-booked", "They lost their suitcases"], answer: 1 },
          { q: "When did it happen?", options: ["At midnight", "Early in the morning", "At lunchtime"], answer: 0 },
          { q: "How did the story end?", options: ["They flew home early", "They got a better place", "They slept at the airport"], answer: 1 }
        ],
        glossary: [
          { t: "turn up", es: "presentarse, llegar" },
          { t: "double-book", es: "reservar dos veces lo mismo (overbooking)" },
          { t: "stuck", es: "atrapado, tirado" },
          { t: "upgrade", es: "mejorar la categoría" },
          { t: "overlook", es: "tener vistas a" },
          { t: "work out", es: "salir bien" }
        ] },

      { id: "L-017", domain: "social", level: "c1", title: "Plan para el puente",
        context: "Mark te llama para proponerte un plan.",
        lines: [
          { who: "mark", text: "G'day! Listen, a few of us are heading up to the mountains for the long weekend — bit of a road trip." },
          { who: "mark", text: "Nothing fancy, we'll just chuck the gear in the ute and camp near the lake." },
          { who: "mark", text: "You're more than welcome to tag along if you're keen. Just let me know by Thursday so I can sort out the tents." },
          { who: "mark", text: "No pressure, mate — have a think about it." }
        ],
        questions: [
          { q: "What's the plan?", options: ["A road trip to the mountains", "A beach holiday", "A work conference"], answer: 0 },
          { q: "Where will they sleep?", options: ["In a hotel", "In tents near a lake", "At Mark's house"], answer: 1 },
          { q: "What does Mark need by Thursday?", options: ["Money for petrol", "Your answer", "A map of the area"], answer: 1 }
        ],
        glossary: [
          { t: "g'day", es: "hola (AU)" },
          { t: "long weekend", es: "puente" },
          { t: "chuck", es: "echar, meter (informal)" },
          { t: "ute", es: "camioneta pick-up (AU)" },
          { t: "tag along", es: "apuntarse, acompañar" },
          { t: "keen", es: "con ganas, interesado" },
          { t: "sort out", es: "organizar, encargarse de" },
          { t: "have a think", es: "pensártelo" }
        ] },

      { id: "L-018", domain: "social", level: "b2", title: "Sarah en la máquina de café",
        context: "Te cruzas con Sarah, a quien no ves desde hace semanas.",
        lines: [
          { who: "sarah", text: "Oh hi! I haven't seen you in ages — how've you been?" },
          { who: "sarah", text: "I've been snowed under with the reorganisation, to be honest. I'm counting down the days to my holiday." },
          { who: "sarah", text: "Two weeks in Greece, island-hopping. I can't wait. Anyway, I'd better dash — I've got a call in five. Let's grab lunch next week!" }
        ],
        questions: [
          { q: "Why has Sarah been so busy?", options: ["Because of the reorganisation", "She's been on holiday", "She's been ill"], answer: 0 },
          { q: "What will she do on holiday?", options: ["Visit family in the UK", "Travel around Greek islands", "Stay at home"], answer: 1 },
          { q: "What does she suggest?", options: ["Having lunch next week", "Calling you tonight", "Going on holiday together"], answer: 0 }
        ],
        glossary: [
          { t: "in ages", es: "en mucho tiempo" },
          { t: "snowed under", es: "desbordado de trabajo" },
          { t: "count down the days", es: "contar los días" },
          { t: "island-hopping", es: "ir de isla en isla" },
          { t: "I'd better dash", es: "tengo que salir corriendo" },
          { t: "grab lunch", es: "comer algo juntos" }
        ] }
    ]
  }
};
