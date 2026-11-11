/* =============================================================================
 * English 20 Minutes · C1 Executive — Base de datos de contenido
 * -----------------------------------------------------------------------------
 * Solo datos, sin lógica. Se expone en window.E20_DATA para que funcione tanto
 * abriendo index.html con doble clic (file://) como servido por HTTP.
 *
 * REGLAS PARA AÑADIR CONTENIDO
 *  - Cada ítem necesita un `id` único y ESTABLE (el progreso se guarda por id).
 *    No reutilices ni renumeres ids existentes: añade siempre al final.
 *  - `domain` debe ser una clave de DOMAINS.
 *  - Bloque 2: `sentence` contiene exactamente un "___" y `answer` está en `options`.
 *  - Bloque 4: `mustUse[].m` es una expresión regular (sin barras, case-insensitive)
 *    que detecta el chunk en la respuesta, admitiendo variantes (mitigat → mitigate/mitigating).
 * ========================================================================== */
window.E20_DATA = {
  version: 1,

  DOMAINS: {
    strategy:     { label: "Strategy",     es: "Estrategia" },
    finance:      { label: "Finance",      es: "Finanzas" },
    operations:   { label: "Operations",   es: "Operaciones" },
    data:         { label: "Data",         es: "Datos" },
    leadership:   { label: "Leadership",   es: "Liderazgo" },
    stakeholders: { label: "Stakeholders", es: "Stakeholders" }
  },

  BLOCK_META: {
    registerUpgrade: { n: 1, minutes: "01–05", title: "Upgrade de Registro",          subtitle: "De frase plana a bloque léxico ejecutivo", accent: "amber" },
    collocations:    { n: 2, minutes: "06–10", title: "Phrasal Verbs & Colocaciones", subtitle: "Expresiones nativas de estrategia, finanzas y operaciones", accent: "sky" },
    traps:           { n: 3, minutes: "11–15", title: "Advanced Trap",                subtitle: "Falsos amigos, calcos y matices del español corporativo", accent: "rose" },
    challenges:      { n: 4, minutes: "16–20", title: "Micro-Reto de Producción",     subtitle: "Producción activa bajo presión", accent: "emerald" }
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
    pitch:           "Pitch de inversión"
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
        selfCheck: ["¿Reconociste la urgencia del otro?", "¿Explicaste la restricción con hechos?", "¿Diste una fecha realista y una alternativa inmediata?"] }
    ]
  }
};
