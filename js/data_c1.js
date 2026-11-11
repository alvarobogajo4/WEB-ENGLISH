/* =============================================================================
 * English 20 Minutes — Base de datos de contenido (B2 → C1, HR Data Analytics)
 * -----------------------------------------------------------------------------
 * Solo datos, sin lógica. Se expone en window.E20_DATA para que funcione tanto
 * abriendo index.html con doble clic (file://) como servido por HTTP.
 *
 * SESIÓN DIARIA (20 min) — cada bloque se alimenta de varios "pools":
 *   1 Vocabulario  ← meetingMoves, hrVocab, registerUpgrade, collocations, + tu banco personal
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
 *    y la `modelAnswer` debe cumplir todas.
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
    operations:   { label: "Operations",   es: "Operaciones" }
  },

  BLOCK_META: {
    vocab:      { n: 1, minutes: "01–05", title: "Vocabulario & Reuniones", subtitle: "Frases para intervenir, vocabulario de HR Analytics y tu banco personal", accent: "amber" },
    grammar:    { n: 2, minutes: "06–10", title: "Gramática en contexto",   subtitle: "Las estructuras que necesitas para hablar de datos y opinar", accent: "sky" },
    listening:  { n: 3, minutes: "11–15", title: "Comprensión auditiva",    subtitle: "Tu jefe australiano, el equipo de EE. UU. y Reino Unido", accent: "violet" },
    challenges: { n: 4, minutes: "16–20", title: "Producción hablada",      subtitle: "Habla como en la reunión real", accent: "emerald" }
  },

  /* Pool → bloque de la sesión y nivel por defecto si el ítem no lo indica. */
  POOL_BLOCK: {
    meetingMoves: "vocab", hrVocab: "vocab", registerUpgrade: "vocab", collocations: "vocab", custom: "vocab",
    grammar: "grammar", traps: "grammar",
    listening: "listening",
    challenges: "challenges"
  },
  POOL_DEFAULT_LEVEL: {
    meetingMoves: "b2", hrVocab: "b2", registerUpgrade: "c1", collocations: "c1", custom: "b2",
    grammar: "b2", traps: "b2", listening: "b2", challenges: "c1"
  },

  /* Cuántos ítems de cada pool entran en una sesión, según el nivel elegido. */
  SESSION_MIX: {
    b2: { vocab: { meetingMoves: 4, hrVocab: 3, collocations: 1 }, grammar: { grammar: 5, traps: 2 }, listening: { listening: 2 }, challenges: { challenges: 1 } },
    c1: { vocab: { meetingMoves: 2, hrVocab: 2, registerUpgrade: 2, collocations: 2 }, grammar: { grammar: 4, traps: 2 }, listening: { listening: 2 }, challenges: { challenges: 1 } }
  },

  POOL_LABEL: {
    meetingMoves: "Frase de reunión", hrVocab: "HR Analytics", registerUpgrade: "Registro C1",
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
    present:   "Presentar en público"
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
    call:            "Llamada internacional"
  },

  BLOCKS: {
    /* ------------------------------------------------------------------------
     * BLOQUE 1 · Upgrade de Registro
     * plain → c1. distractors: versiones planas, incorrectas o poco naturales.
     * --------------------------------------------------------------------- */
    registerUpgrade: [
      { id: "B1-001", domain: "stakeholders",
        plain: "I think we should do this project.",
        c1: "I'd make a strong case for greenlighting this initiative.",
        chunks: ["make a strong case for", "greenlight an initiative"],
        distractors: ["I believe we must to do this project.", "In my opinion, this project is a good idea to do."],
        whyItWorks: "Convierte una opinión tibia en una recomendación con autoridad. 'Greenlight' es el verbo estándar para aprobar un proyecto." },

      { id: "B1-002", domain: "finance",
        plain: "We spent too much money this quarter.",
        c1: "We overran our budget this quarter, so we'll need to tighten our belts in Q4.",
        chunks: ["overrun the budget", "tighten our belts"],
        distractors: ["We spent a lot of money more than planned this quarter.", "Our expenses were very big this quarter."],
        whyItWorks: "Nombra el problema con precisión (budget overrun) y lo une a la acción correctiva en la misma frase." },

      { id: "B1-003", domain: "leadership",
        plain: "I don't agree with you.",
        c1: "I see where you're coming from, but I'd push back on that assumption.",
        chunks: ["see where you're coming from", "push back on"],
        distractors: ["I am not agree with your idea.", "Sorry, but you are wrong about this."],
        whyItWorks: "Primero validas a la persona y después cuestionas la idea, no a la persona. Es la forma de discrepar en un comité de dirección." },

      { id: "B1-004", domain: "operations",
        plain: "There is a problem with the delivery.",
        c1: "We've hit a snag with the rollout, but we're already working on a fix.",
        chunks: ["hit a snag", "rollout", "work on a fix"],
        distractors: ["There is a big problem in the delivery.", "The delivery has got a problem, we don't know why."],
        whyItWorks: "'Hit a snag' quita dramatismo al problema, y la segunda parte de la frase transmite control." },

      { id: "B1-005", domain: "data",
        plain: "The numbers are going up.",
        c1: "The figures are trending upwards, driven largely by repeat customers.",
        chunks: ["trend upwards", "driven largely by"],
        distractors: ["The numbers are going more up every time.", "The numbers are increasing a lot."],
        whyItWorks: "Un ejecutivo no se queda en el qué, explica también el porqué ('driven by'). Así da la tendencia y su causa a la vez." },

      { id: "B1-006", domain: "strategy",
        plain: "We need to think about the future.",
        c1: "We need to future-proof the business against shifts in demand.",
        chunks: ["future-proof", "shifts in demand"],
        distractors: ["We need to think more in the future.", "We must to think about what will happen."],
        whyItWorks: "'Future-proof' es un verbo de acción, no de reflexión. Además, concreta el riesgo del que te proteges." },

      { id: "B1-007", domain: "stakeholders",
        plain: "Can you help me with this?",
        c1: "Could I lean on your expertise here?",
        chunks: ["lean on someone's expertise"],
        distractors: ["Can you give me a help with this?", "I need that you help me with this."],
        whyItWorks: "Pides ayuda reconociendo el valor del otro. Así es mucho más fácil conseguir colaboración de un perfil senior." },

      { id: "B1-008", domain: "leadership",
        plain: "This is very important.",
        c1: "This is mission-critical, so it needs to sit at the top of our agenda.",
        chunks: ["mission-critical", "top of the agenda"],
        distractors: ["This is very very important for all.", "This is a really important thing."],
        whyItWorks: "Sustituye un intensificador vacío ('very') por un término con peso y una consecuencia operativa." },

      { id: "B1-009", domain: "operations",
        plain: "We will finish late.",
        c1: "We're tracking behind schedule; I'd now forecast delivery for mid-March.",
        chunks: ["track behind schedule", "forecast delivery for"],
        distractors: ["We are going to finish late, sorry.", "We will finish more late than planned."],
        whyItWorks: "Comunicas el retraso y das ya una nueva fecha. A la dirección le preocupa más la falta de visibilidad que el retraso." },

      { id: "B1-010", domain: "finance",
        plain: "We made more money than expected.",
        c1: "We outperformed forecasts, with revenue coming in 8% ahead of target.",
        chunks: ["outperform forecasts", "come in ahead of target"],
        distractors: ["We won more money than we expected.", "We gained a lot of money more than the forecast."],
        whyItWorks: "Un dato concreto (8%) y el vocabulario estándar de reporting financiero." },

      { id: "B1-011", domain: "strategy",
        plain: "Let's talk about this later.",
        c1: "Let's park this for now and revisit it once we have more data.",
        chunks: ["park something", "revisit"],
        distractors: ["Let's speak about this after.", "We can talk this later."],
        whyItWorks: "'Park' aplaza el tema sin descartarlo. Además pones una condición para volver a él." },

      { id: "B1-012", domain: "stakeholders",
        plain: "I'm sorry for the mistake.",
        c1: "I take full ownership of the error, and here's how we'll prevent a recurrence.",
        chunks: ["take full ownership of", "prevent a recurrence"],
        distractors: ["I'm very sorry, it was my fault, sorry.", "Sorry for the error, it will not repeat."],
        whyItWorks: "Asumir la responsabilidad y pasar a la solución proyecta liderazgo. Pedir perdón varias veces lo resta." },

      { id: "B1-013", domain: "data",
        plain: "The data is not good.",
        c1: "The data quality is patchy, so I'd treat these conclusions as directional.",
        chunks: ["patchy", "directional"],
        distractors: ["The data is bad, we can't trust in it.", "The datas are not good."],
        whyItWorks: "No desacredita el análisis, lo matiza. 'Directional' significa que indica una tendencia pero no es concluyente." },

      { id: "B1-014", domain: "leadership",
        plain: "Good job, team.",
        c1: "Great work, everyone — this really moved the needle for us.",
        chunks: ["move the needle"],
        distractors: ["Good work, team, very good.", "Congratulations for the job, team."],
        whyItWorks: "Reconoce el impacto en el negocio, no solo el esfuerzo. Ese reconocimiento motiva más." },

      { id: "B1-015", domain: "strategy",
        plain: "We have to choose what is most important.",
        c1: "We need to prioritise ruthlessly and focus on the highest-impact levers.",
        chunks: ["prioritise ruthlessly", "high-impact levers"],
        distractors: ["We have to choose the most important things.", "We must to decide what is more important."],
        whyItWorks: "'Levers' (palancas) es vocabulario de estrategia. 'Ruthlessly' transmite que asumes renunciar a cosas." },

      { id: "B1-016", domain: "operations",
        plain: "Let's start.",
        c1: "Let's kick things off with a quick status update.",
        chunks: ["kick things off", "status update"],
        distractors: ["Let's begin with the meeting now.", "Ok, we start."],
        whyItWorks: "Abre la reunión con energía y marca ya la agenda." },

      { id: "B1-017", domain: "stakeholders",
        plain: "Please answer me soon.",
        c1: "I'd appreciate your input by close of business Thursday so we can keep things moving.",
        chunks: ["by close of business", "keep things moving"],
        distractors: ["Please answer me as soon as possible.", "I wait your answer soon."],
        whyItWorks: "Pone un plazo concreto y explica por qué importa. Suena firme sin ser brusco." },

      { id: "B1-018", domain: "finance",
        plain: "This is too expensive.",
        c1: "The cost is hard to justify unless we can demonstrate a clear return on investment.",
        chunks: ["hard to justify", "demonstrate a clear ROI"],
        distractors: ["This is very expensive for us.", "This costs too much money."],
        whyItWorks: "Pasa del precio al valor y deja la puerta abierta si se demuestra el ROI." },

      { id: "B1-019", domain: "data",
        plain: "I don't know yet.",
        c1: "I don't have visibility on that yet, but I'll circle back by Friday.",
        chunks: ["have visibility on", "circle back"],
        distractors: ["I don't know it yet.", "I have no idea about that."],
        whyItWorks: "Admite que no tienes la información sin parecer desinformado y te compromete a una fecha." },

      { id: "B1-020", domain: "leadership",
        plain: "I want to be promoted.",
        c1: "I'd like to discuss a path to the next level and what success would look like in that role.",
        chunks: ["path to the next level", "what success looks like"],
        distractors: ["I want a promotion, please.", "I would like to be promotioned."],
        whyItWorks: "Plantea el ascenso como una conversación sobre criterios y no como una exigencia." },

      { id: "B1-021", domain: "strategy",
        plain: "Our competitors are better.",
        c1: "Our competitors have gained ground, so we need to sharpen our value proposition.",
        chunks: ["gain ground", "sharpen our value proposition"],
        distractors: ["Our competence is better than us.", "The competitors are more good."],
        whyItWorks: "Reconoce la amenaza y propone una respuesta. Ojo: en inglés 'competence' no significa 'la competencia'." },

      { id: "B1-022", domain: "operations",
        plain: "We don't have enough people.",
        c1: "We're stretched thin; without additional headcount, something will have to give.",
        chunks: ["stretched thin", "headcount", "something has to give"],
        distractors: ["We have not enough people.", "We need more persons."],
        whyItWorks: "'Headcount' es la palabra de presupuestos de personal. 'Something has to give' plantea el dilema sin quejarse." },

      { id: "B1-023", domain: "stakeholders",
        plain: "Do you understand?",
        c1: "Does that land, or would it help if I unpacked it a bit further?",
        chunks: ["does that land", "unpack"],
        distractors: ["Do you understand me?", "Is it clear for you or not?"],
        whyItWorks: "Asumes tú la responsabilidad de explicarte bien. 'Do you understand?' puede sonar condescendiente." },

      { id: "B1-024", domain: "finance",
        plain: "Sales are going down.",
        c1: "Sales have softened, largely on the back of weaker demand in Southern Europe.",
        chunks: ["soften", "on the back of"],
        distractors: ["Sales are going more down.", "The sales are falling a lot."],
        whyItWorks: "'Soften' es un verbo neutro y profesional. 'On the back of' introduce la causa." },

      { id: "B1-025", domain: "data",
        plain: "This graph shows that customers leave.",
        c1: "What this chart tells us is that churn is concentrated in the first 90 days.",
        chunks: ["what this tells us is", "churn", "concentrated in"],
        distractors: ["In this graphic we can see that clients go away.", "This graph shows the clients that leave."],
        whyItWorks: "La estructura 'What X tells us is…' pone el foco en el insight. 'Churn' es el término técnico." },

      { id: "B1-026", domain: "leadership",
        plain: "That's a bad idea.",
        c1: "I have some reservations about this approach, mainly around scalability.",
        chunks: ["have reservations about", "mainly around"],
        distractors: ["That idea is not good.", "I don't like this idea at all."],
        whyItWorks: "Expresa el desacuerdo de forma diplomática y lo concreta en un punto que se puede debatir." },

      { id: "B1-027", domain: "strategy",
        plain: "Let's try it small and cheap first.",
        c1: "Let's pilot it with a lean MVP before committing significant resources.",
        chunks: ["pilot", "lean MVP", "commit resources"],
        distractors: ["Let's do a little test cheap first.", "First we try it in small."],
        whyItWorks: "Reduce el riesgo con vocabulario de producto que entiende cualquier comité de inversión." },

      { id: "B1-028", domain: "operations",
        plain: "Everyone must do their part.",
        c1: "This will only work if every team pulls its weight and stays aligned on the timeline.",
        chunks: ["pull one's weight", "stay aligned on"],
        distractors: ["Everybody must to do their part.", "All the people have to work."],
        whyItWorks: "Responsabiliza a todos sin señalar a nadie y lo vincula a un objetivo común." },

      { id: "B1-029", domain: "stakeholders",
        plain: "I will tell you the news.",
        c1: "I'll keep you posted as things develop.",
        chunks: ["keep someone posted", "as things develop"],
        distractors: ["I will tell you the news when there are.", "I'll inform you of the novelties."],
        whyItWorks: "Es un compromiso natural de comunicación continua. Ojo: 'novelties' no significa 'novedades'." },

      { id: "B1-030", domain: "finance",
        plain: "We need more money for this.",
        c1: "We'll need to secure additional funding to see this through.",
        chunks: ["secure funding", "see something through"],
        distractors: ["We need more money for to do this.", "We must to have more budget."],
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
        trap: "'Fabric' significa tela. Fábrica es plant, factory o manufacturing facility." }
    ],

    /* ------------------------------------------------------------------------
     * BLOQUE 4 · Micro-Reto de Producción
     * --------------------------------------------------------------------- */
    challenges: [
      { id: "B4-001", domain: "data", scenario: "metrics_defense",
        brief: "En el weekly, tu VP cuestiona una caída del 12% en la conversión del checkout. Tienes 90 segundos para responder.",
        mustUse: [ { t: "attributable to", m: "attributable to" }, { t: "on track to", m: "on track to" }, { t: "mitigate", m: "mitigat" } ],
        framework: ["Reconoce el dato sin rodeos", "Da la causa principal", "Plan de acción concreto", "Compromiso medible con fecha"],
        modelAnswer: "You're right to flag it — conversion is down 12% week on week. The drop is largely attributable to the payment provider outage on Tuesday, which affected roughly 30% of sessions. We've already rolled back to the previous integration to mitigate further impact, and early data shows recovery. We're on track to be back at baseline by Friday, and I'll share a post-mortem on Monday.",
        selfCheck: ["¿Abriste con el dato, sin rodeos ni excusas?", "¿Diste una causa concreta y cuantificada?", "¿Terminaste con un compromiso con fecha?"] },

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

      { id: "B4-006", domain: "stakeholders", scenario: "bad_news",
        brief: "Tienes que comunicar a un cliente clave una subida de precio del 7% a partir de enero.",
        mustUse: [ { t: "I wanted you to hear it from me", m: "hear it from me" }, { t: "reflects", m: "reflect" }, { t: "lock in", m: "lock(ed)? in" } ],
        framework: ["Transparencia y cercanía", "Contexto honesto", "Valor que mantiene", "Gesto o alternativa"],
        modelAnswer: "I wanted you to hear it from me directly: from January our prices will go up by 7%. The increase reflects higher energy and logistics costs we've absorbed for the past 18 months. Your service level and dedicated team won't change. And as a long-standing partner, we can offer you the option to lock in current pricing for six months if you renew before December.",
        selfCheck: ["¿Diste la noticia en las dos primeras frases?", "¿Justificaste el porqué sin disculparte en exceso?", "¿Ofreciste algo a cambio?"] },

      { id: "B4-007", domain: "finance", scenario: "negotiation",
        brief: "Tu proveedor principal pide un 10% más. Tú puedes aceptar como máximo un 4%. Contraoferta.",
        mustUse: [ { t: "meet you halfway", m: "halfway" }, { t: "in return", m: "in return" }, { t: "long-term partnership", m: "long.?term" } ],
        framework: ["Reconoce su posición", "Ancla tu límite con datos", "Ofrece algo que no sea precio", "Propón el cierre"],
        modelAnswer: "I appreciate the transparency on your cost pressures. That said, 10% simply isn't viable for us — it would put the whole category over budget. We're willing to meet you halfway on the principle, with a 4% increase. In return, we could commit to a two-year contract and faster payment terms, which gives you stability. I think that's a solid basis for a long-term partnership. Can we agree on that?",
        selfCheck: ["¿Reconociste su posición antes de rechazarla?", "¿Ofreciste algo de valor que no fuera precio?", "¿Cerraste con una pregunta de compromiso?"] },

      { id: "B4-008", domain: "data", scenario: "metrics_defense",
        brief: "El CFO dice que el coste de adquisición (CAC) ha subido un 25% y pregunta si marketing está malgastando dinero.",
        mustUse: [ { t: "on the face of it", m: "face of it" }, { t: "lifetime value", m: "lifetime value|ltv" }, { t: "payback period", m: "payback" } ],
        framework: ["Concede el dato", "Reencuadra con la métrica completa", "Datos que lo respaldan", "Ofrece control/seguimiento"],
        modelAnswer: "On the face of it, a 25% rise in CAC looks concerning, and it's a fair question. But we've deliberately shifted spend towards enterprise accounts, whose lifetime value is almost three times higher. As a result, our payback period has actually improved from 14 to 11 months. I'm happy to set up a monthly review with your team so we can track LTV to CAC together.",
        selfCheck: ["¿Concediste el dato sin ponerte a la defensiva?", "¿Reencuadraste con una métrica más completa?", "¿Ofreciste transparencia o seguimiento?"] },

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
        modelAnswer: "I heard about the working group with the UK and US teams on attrition definitions, and I'd love to be part of it. I've already mapped how Spain and France calculate turnover, so I think I could bring a useful perspective. It would only be about two hours a week, and I'd make sure it doesn't affect the monthly reporting. Would it be possible for you to put my name forward?",
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
        modelAnswer: "Before this goes to the exec team, can I flag something? I might be wrong, but I think the France figure includes internal transfers as leavers, which would inflate it quite a bit. If someone on the committee spots it, it could undermine the whole dashboard. I'd rather we double-check it today than correct it afterwards — I can rerun the numbers in about an hour, rather than delay the pack.",
        selfCheck: ["¿Abriste sin acusar ni sonar arrogante?", "¿Explicaste el riesgo para él/el equipo?", "¿Ofreciste una solución rápida?"] },

      { id: "B4-020", domain: "people", scenario: "exec_update", level: "b2",
        brief: "Es lunes. Dale a Mark un update de 60 segundos sobre en qué estás trabajando esta semana.",
        mustUse: [ { t: "I'm currently", m: "currently" }, { t: "on track", m: "on track" }, { t: "blocker / stuck", m: "blocker|blocked|stuck" } ],
        framework: ["Prioridad principal", "Estado (on track / retrasado)", "Bloqueos", "Qué necesitas de él"],
        modelAnswer: "This week I'm currently focused on the workforce plan for 2027. The headcount model is on track, and I should have the first scenarios ready by Wednesday. The only blocker is that I'm still waiting for the budget assumptions from Finance. If you could give them a nudge, that would really help. Apart from that, the engagement dashboard is live and managers are already using it.",
        selfCheck: ["¿Empezaste por la prioridad principal?", "¿Dijiste claramente si vas en plazo?", "¿Pediste ayuda concreta con el bloqueo?"] }
    ],

    /* ------------------------------------------------------------------------
     * VOCABULARIO · Frases para intervenir en reuniones (meetingMoves)
     * situation (ES) → elige lo que dirías. answer + 2 distractores.
     * --------------------------------------------------------------------- */
    meetingMoves: [
      { id: "MM-001", domain: "meetings", fn: "interrupt", level: "b2",
        situation: "Alguien está hablando y quieres intervenir con educación.",
        answer: "Sorry to jump in, but could I add something here?",
        distractors: ["Wait, I want to say a thing.", "Sorry, can I interrupt you a moment for speak?"],
        note: "'Jump in' = intervenir, meter baza. Pedir permiso con 'could I' suaviza la interrupción y nadie lo percibe como brusco." },

      { id: "MM-002", domain: "meetings", fn: "interrupt", level: "c1",
        situation: "Tu jefe acaba de mencionar un tema y quieres entrar en ese punto concreto.",
        answer: "If I could just come in on that point for a second…",
        distractors: ["I want to enter in this point.", "Let me to say something about that."],
        note: "'Come in on a point' es la forma natural de entrar en un tema que está saliendo. 'Just' y 'for a second' restan peso a la interrupción." },

      { id: "MM-003", domain: "meetings", fn: "clarify", level: "b2",
        situation: "Han dicho una cifra muy rápido y no la has entendido.",
        answer: "Sorry, could you run that number by me again?",
        distractors: ["Repeat, please?", "Sorry, I didn't understand nothing."],
        note: "'Run something by someone (again)' = volver a explicarte algo. Suena natural y profesional." },

      { id: "MM-004", domain: "meetings", fn: "clarify", level: "b2",
        situation: "Usan un término que no conoces y quieres saber qué significa.",
        answer: "When you say 'regretted attrition', what exactly do you mean?",
        distractors: ["What means 'regretted attrition'?", "What is the meaning that you say?"],
        note: "Nunca 'what means…?'. Usa 'What does X mean?' o, más natural en una reunión, 'When you say X, what do you mean?'." },

      { id: "MM-005", domain: "meetings", fn: "check", level: "b2",
        situation: "Quieres confirmar que has entendido bien lo que te han pedido.",
        answer: "Just to make sure I've got this right — you'd like the report by Friday?",
        distractors: ["So, I understand that you want the report Friday, no?", "Is correct that the report is for Friday?"],
        note: "Parafrasear para confirmar es lo que hacen los nativos. Evita la coletilla española ', no?' al final." },

      { id: "MM-006", domain: "meetings", fn: "add", level: "b2",
        situation: "Quieres apoyar lo que ha dicho una compañera y añadir un dato.",
        answer: "Just to build on what Sarah said, we're seeing the same trend in France.",
        distractors: ["Like Sarah said, also in France is the same.", "I'm agree with Sarah and also France."],
        note: "'Build on what X said' = partir de lo que ha dicho alguien y ampliarlo. Además, reconoce públicamente a tu compañera." },

      { id: "MM-007", domain: "meetings", fn: "agree", level: "b2",
        situation: "Estás totalmente de acuerdo con lo que acaban de decir.",
        answer: "I couldn't agree more.",
        distractors: ["I am totally agree.", "I agree with you a lot of."],
        note: "'I couldn't agree more' = estoy completamente de acuerdo. Recuerda: 'agree' es verbo, nunca 'I am agree'." },

      { id: "MM-008", domain: "meetings", fn: "disagree", level: "c1",
        situation: "Tu jefe hace una afirmación y no estás de acuerdo. Quieres discrepar sin sonar confrontacional.",
        answer: "I see your point, but I'm not sure the data fully supports that.",
        distractors: ["No, this is not correct.", "You are wrong, the data says other thing."],
        note: "Validas primero ('I see your point') y apoyas tu desacuerdo en los datos, no en la persona. Es tu terreno como analista." },

      { id: "MM-009", domain: "meetings", fn: "time", level: "b2",
        situation: "Te hacen una pregunta difícil y necesitas unos segundos para pensar.",
        answer: "That's a good question — let me think about that for a second.",
        distractors: ["Ehh… ehh… I don't know.", "Wait, wait, I am thinking."],
        note: "Ganar tiempo con una frase hecha te da 3–4 segundos para ordenar la respuesta y transmite calma." },

      { id: "MM-010", domain: "meetings", fn: "time", level: "c1",
        situation: "Te piden un dato que no tienes a mano en ese momento.",
        answer: "I don't have that figure to hand, but I can get back to you by end of day.",
        distractors: ["I don't have the number now, sorry, sorry.", "I will search it and say you."],
        note: "'To hand' = a mano. 'Get back to you' = volver a ti con la respuesta. Comprometerte con un plazo convierte el 'no lo sé' en profesionalidad." },

      { id: "MM-011", domain: "data", fn: "correct", level: "c1",
        situation: "Alguien presenta un dato erróneo y quieres corregirlo con tacto.",
        answer: "Sorry, just a quick correction — the turnover figure is actually 12%, not 21%.",
        distractors: ["No, no, the figure is wrong.", "This number is a mistake of you."],
        note: "'Just a quick correction' minimiza el error. 'Actually' aquí significa 'en realidad', y corrige sin señalar a nadie." },

      { id: "MM-012", domain: "meetings", fn: "opinion", level: "b2",
        situation: "Te piden tu opinión sobre el principal problema.",
        answer: "From my perspective, the main issue is data quality.",
        distractors: ["In my opinion, I think that the main problem is the quality of the data.", "For me, the principal problem is the data's quality."],
        note: "'In my opinion, I think' es redundante. Usa una sola fórmula: 'From my perspective…', 'The way I see it…'." },

      { id: "MM-013", domain: "meetings", fn: "redirect", level: "c1",
        situation: "La reunión se está desviando del tema y quieres volver al dashboard.",
        answer: "Shall we park that for now and come back to the dashboard?",
        distractors: ["We are going out of the topic.", "Please, return to the theme."],
        note: "'Park something' = aparcar un tema. 'Theme' no es el tema de una reunión: usa 'topic' o 'agenda item'." },

      { id: "MM-014", domain: "meetings", fn: "check", level: "b2",
        situation: "Estás explicando algo complejo y quieres saber si te siguen.",
        answer: "Does that make sense so far?",
        distractors: ["Do you understand me or not?", "Is it clear for everybody what I say?"],
        note: "Asumes tú la responsabilidad de explicarte bien. 'Do you understand?' puede sonar condescendiente." },

      { id: "MM-015", domain: "meetings", fn: "close", level: "b2",
        situation: "Quieres cerrar tu intervención con los siguientes pasos.",
        answer: "So, to wrap up: I'll update the model and share it by Thursday.",
        distractors: ["So, for finish, I update the model Thursday.", "Ok, that's all, bye."],
        note: "'To wrap up' = para cerrar. Terminar con una acción y una fecha deja una imagen de fiabilidad." },

      { id: "MM-016", domain: "meetings", fn: "clarify", level: "b2",
        situation: "En una llamada hablan muy rápido y no has captado lo último.",
        answer: "Sorry, the line's a bit unclear — could you say that again a bit more slowly?",
        distractors: ["Speak slower, please.", "Sorry, I don't speak English very well."],
        note: "Atribuirlo a la línea quita presión. Nunca te disculpes por tu inglés: resta autoridad y no hace falta." },

      { id: "MM-017", domain: "data", fn: "add", level: "c1",
        situation: "Quieres aportar un dato que refuerza tu argumento.",
        answer: "It's also worth pointing out that engagement scores dropped in the same period.",
        distractors: ["Also is important to say that engagement go down.", "Other thing: engagement was falling."],
        note: "'It's worth pointing out that…' = cabe destacar que… Ideal para introducir un dato sin sonar agresivo." },

      { id: "MM-018", domain: "meetings", fn: "disagree", level: "b2",
        situation: "Estás de acuerdo solo en parte.",
        answer: "I agree up to a point, but we should also look at the exit interviews.",
        distractors: ["Yes, but no.", "I agree but not agree."],
        note: "'Up to a point' = hasta cierto punto. Te permite discrepar sin romper el acuerdo." },

      { id: "MM-019", domain: "meetings", fn: "interrupt", level: "b2",
        situation: "Alguien te interrumpe y quieres terminar tu idea.",
        answer: "Sorry, if I could just finish my point…",
        distractors: ["Let me finish, please, I am speaking!", "Wait, I didn't finish to talk."],
        note: "Recuperar el turno con educación es clave para que tus ideas lleguen. 'Just' lo suaviza." },

      { id: "MM-020", domain: "people", fn: "opinion", level: "c1",
        situation: "En tu 1:1 quieres proponer una idea a tu jefe.",
        answer: "I've been thinking — what if we automated the monthly headcount report?",
        distractors: ["I have an idea: we must to automate the report.", "Maybe could be good automate the report?"],
        note: "'What if we…?' propone sin imponer. 'I've been thinking' muestra iniciativa." },

      { id: "MM-021", domain: "meetings", fn: "check", level: "b2",
        situation: "No sabes si una tarea que han mencionado te toca a ti.",
        answer: "Just to clarify — is that something you'd like me to take on?",
        distractors: ["This is for me or not?", "Who must to do this?"],
        note: "'Take on' = asumir (una tarea). Preguntarlo evita malentendidos y demuestra disposición." },

      { id: "MM-022", domain: "data", fn: "agree", level: "c1",
        situation: "Quieres darle la razón a alguien, pero con un matiz.",
        answer: "That's a fair point, although the sample size is quite small.",
        distractors: ["Yes, it's true, but the sample is small, no?", "You have reason, but the sample is little."],
        note: "'Tener razón' es 'be right', nunca 'have reason'. 'A fair point' reconoce el argumento antes del matiz." },

      { id: "MM-023", domain: "people", fn: "present", level: "c1",
        situation: "Vas a abrir una presentación delante de 40 personas.",
        answer: "Thanks for having me. Over the next ten minutes, I'll walk you through three key findings from our engagement survey.",
        distractors: ["Hello, I am going to speak about the survey.", "Good morning, today I will explain you the survey."],
        note: "Anunciar duración y estructura ('three key findings') tranquiliza al público, y a ti también. 'Walk you through' = guiaros por." },

      { id: "MM-024", domain: "people", fn: "present", level: "b2",
        situation: "En tu presentación, quieres pasar al siguiente punto.",
        answer: "That brings me to my next point: attrition by tenure.",
        distractors: ["Now, the next thing is attrition.", "Ok, and now we go to attrition."],
        note: "Las transiciones claras ('That brings me to…', 'Moving on to…') hacen que una presentación suene preparada." }
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
        rule: "Tras 'Not only' al inicio se invierte sujeto y auxiliar (Not only has attrition fallen…). Registro formal y persuasivo." }
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
        glossary: [ { t: "put together", es: "organizar / montar" }, { t: "harmonise", es: "armonizar, unificar criterios" }, { t: "meaningless", es: "sin sentido / que no sirve" } ] }
    ]
  }
};
