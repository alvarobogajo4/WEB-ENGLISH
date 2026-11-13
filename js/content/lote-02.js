/* Lote 02 · noviembre 2026 — amplía lo que se agotaba antes en B2:
 * gramática (errores típicos del hispanohablante), listening más largo
 * (110–150 palabras, frases largas aptas para dictado), frases de reunión,
 * conversación y trampas. Todo B2: es el nivel de entrada del alumno. */
window.E20_DATA.addBatch("lote-02", {
  grammar: [
    { id: "G-042", domain: "people", topic: "Present perfect + for/since", level: "b2",
      sentence: "I ___ at this company since last spring, and I still learn something new every week.",
      answer: "have been working", options: ["have been working", "am working", "work", "was working"],
      rule: "Algo que empezó en el pasado y sigue → present perfect (continuous) + since/for. Nunca presente: «I am working here since…» es un calco." },
    { id: "G-043", domain: "everyday", topic: "Make vs do", level: "b2",
      sentence: "Could you ___ me a favour and send me the link again?",
      answer: "do", options: ["do", "make", "give", "have"],
      rule: "Do a favour, do your homework, do business. Make a decision, make a mistake, make progress." },
    { id: "G-044", domain: "meetings", topic: "Say vs tell", level: "b2",
      sentence: "Mark ___ us that the deadline had moved to Friday.",
      answer: "told", options: ["told", "said", "said to", "explained"],
      rule: "Tell + persona (told us). Say + lo dicho (said that…). «Explained us» es incorrecto: explain something TO someone." },
    { id: "G-045", domain: "data", topic: "Incontables", level: "b2",
      sentence: "Thanks — that's really useful ___ for the board pack.",
      answer: "information", options: ["information", "informations", "an information", "a information"],
      rule: "Information, advice, feedback, research y equipment son incontables: sin plural ni «an». Para contar: a piece of advice." },
    { id: "G-046", domain: "people", topic: "Verbo + preposición", level: "b2",
      sentence: "Whether we hire two analysts ___ the budget review next month.",
      answer: "depends on", options: ["depends on", "depends of", "depends from", "depends in"],
      rule: "Depend ON (no «of», que es calco de «depender de»). Igual: rely on, focus on, insist on." },
    { id: "G-047", domain: "everyday", topic: "Look forward to + -ing", level: "b2",
      sentence: "I'm really looking forward to ___ you all at the Christmas party.",
      answer: "seeing", options: ["seeing", "see", "seen", "have seen"],
      rule: "En look forward to, «to» es preposición: va seguido de -ing. Igual: be used to doing, object to doing." },
    { id: "G-048", domain: "meetings", topic: "Presente continuo: planes", level: "b2",
      sentence: "Sorry, I can't do Thursday — I ___ Jake's team at ten.",
      answer: "'m meeting", options: ["'m meeting", "meet", "will meet", "'m going to meeting"],
      rule: "Planes ya cerrados con hora y otra persona → presente continuo: I'm meeting, we're flying. Es lo más natural en agenda." },
    { id: "G-049", domain: "data", topic: "Too / enough", level: "b2",
      sentence: "The sample is ___ to draw any solid conclusions — only twelve responses.",
      answer: "too small", options: ["too small", "small enough", "enough small", "so small"],
      rule: "Too + adjetivo = más de lo aceptable. Adjetivo + enough (big enough), nunca «enough big»." },
    { id: "G-050", domain: "social", topic: "Had better", level: "b2",
      sentence: "It's nearly six. I'd better ___ or I'll miss my train.",
      answer: "go", options: ["go", "to go", "going", "went"],
      rule: "Had better ('d better) + infinitivo sin to = más vale que… Advertencia o consejo urgente." },
    { id: "G-051", domain: "people", topic: "What vs which", level: "b2",
      sentence: "Attrition went up in Q3, ___ nobody expected.",
      answer: "which", options: ["which", "what", "that", "who"],
      rule: "Para comentar una frase entera → «, which…». «What» = lo que, pero no puede ir tras una coma referida a lo anterior." },
    { id: "G-052", domain: "everyday", topic: "Artículos", level: "b2",
      sentence: "___ in Australia is quite different from what most people imagine.",
      answer: "Life", options: ["Life", "The life", "A life", "The lives"],
      rule: "Ideas generales sin «the»: Life is short, Data matters, People are busy. «The» solo si es algo concreto: the life of my grandmother." },
    { id: "G-053", domain: "meetings", topic: "Preguntas indirectas", level: "b2",
      sentence: "Could you tell me when ___ the final numbers?",
      answer: "we'll get", options: ["we'll get", "will we get", "do we get", "we got"],
      rule: "En una pregunta indirecta (Could you tell me / Do you know…) el orden es de afirmación: when we'll get, sin invertir." },
    { id: "G-054", domain: "social", topic: "As vs like", level: "b2",
      sentence: "She works ___ a nurse, so her shifts are all over the place.",
      answer: "as", options: ["as", "like", "such", "how"],
      rule: "As = en calidad de (trabaja de enfermera). Like = como, parecido a (habla como una enfermera)." },
    { id: "G-055", domain: "data", topic: "Futuro continuo", level: "b2",
      sentence: "This time next week we ___ the results to the leadership team.",
      answer: "'ll be presenting", options: ["'ll be presenting", "present", "'ll have presented", "were presenting"],
      rule: "Acción en curso en un momento del futuro → will be + -ing. This time tomorrow, I'll be flying to Sydney." },
    { id: "G-056", domain: "people", topic: "Posición del adverbio", level: "b2",
      sentence: "I ___ the dashboard on Monday mornings before the stand-up.",
      answer: "always check", options: ["always check", "check always", "am always checking", "always checked"],
      rule: "Los adverbios de frecuencia van antes del verbo principal (I always check) y después de «be» (I'm always late)." }
  ],

  listening: [
    { id: "L-019", domain: "meetings", level: "b2", title: "Mark abre el team meeting",
      context: "Lunes, reunión semanal del equipo. Mark repasa la agenda y reparte trabajo.",
      lines: [
        { who: "mark", text: "Right, let's get cracking — we've got a fair bit to get through and I want to finish on time for once." },
        { who: "mark", text: "First up, the engagement survey closes on Friday, and we're sitting at about sixty per cent response rate, which isn't great." },
        { who: "mark", text: "I'd like each of you to nudge your business partners, but gently — nobody likes being chased three times a day." },
        { who: "sarah", text: "Mark, can I just flag that the UK sites had a system outage last week, so their numbers are artificially low?" },
        { who: "mark", text: "Good point, Sarah. Let's not panic about the UK then. Second thing: the headcount report for the board is due a week earlier than usual." },
        { who: "mark", text: "So I'll need the draft by the twentieth at the latest. If that's going to be a stretch, tell me now rather than on the nineteenth." }
      ],
      questions: [
        { q: "What is the current survey response rate?", options: ["About sixty per cent", "About forty per cent", "Almost complete"], answer: 0 },
        { q: "Why are the UK numbers low, according to Sarah?", options: ["People didn't want to answer", "There was a system outage", "The survey was sent late"], answer: 1 },
        { q: "What does Mark ask about the headcount deadline?", options: ["To finish it on the nineteenth", "To warn him early if it's difficult", "To send it directly to the board"], answer: 1 }
      ],
      glossary: [
        { t: "get cracking", es: "ponerse manos a la obra" }, { t: "a fair bit", es: "bastante" },
        { t: "nudge someone", es: "dar un toque a alguien" }, { t: "flag something", es: "señalar / avisar de algo" },
        { t: "at the latest", es: "como muy tarde" }, { t: "a stretch", es: "un esfuerzo extra, difícil de lograr" }
      ] },

    { id: "L-020", domain: "data", level: "b2", title: "Llamada con Jake sobre el dashboard",
      context: "Jake, desde EE. UU., te llama porque los números de su dashboard no cuadran.",
      lines: [
        { who: "jake", text: "Hey, thanks for jumping on so quickly. So, I'm looking at the turnover dashboard and something feels off." },
        { who: "jake", text: "It's showing twelve per cent turnover for the Texas plant, but my HR manager there swears it's closer to eight." },
        { who: "jake", text: "My gut feeling is that we're counting the seasonal contractors, who leave every year in September anyway." },
        { who: "jake", text: "If that's the case, the number's technically right but totally misleading for the leadership team." },
        { who: "jake", text: "Could you take a look and maybe split it into permanent and seasonal? No rush — end of next week works for me." }
      ],
      questions: [
        { q: "What number does the HR manager in Texas believe?", options: ["Twelve per cent", "Around eight per cent", "Around twenty per cent"], answer: 1 },
        { q: "What does Jake think is causing the difference?", options: ["A bug in the dashboard", "Seasonal contractors are included", "People left in September by mistake"], answer: 1 },
        { q: "When does Jake need the change?", options: ["Today", "Tomorrow morning", "By the end of next week"], answer: 2 }
      ],
      glossary: [
        { t: "jump on (a call)", es: "conectarse a una llamada" }, { t: "something feels off", es: "algo no cuadra" },
        { t: "swear (that)", es: "jurar, asegurar" }, { t: "my gut feeling", es: "mi intuición" },
        { t: "misleading", es: "engañoso" }, { t: "no rush", es: "sin prisa" }
      ] },

    { id: "L-021", domain: "social", level: "b2", title: "Mark y el fin de semana",
      context: "Antes de empezar una llamada, Mark te cuenta su fin de semana.",
      lines: [
        { who: "mark", text: "G'day! How was your weekend? Mine was a bit of a write-off, to be honest." },
        { who: "mark", text: "We'd planned a barbie at the beach with some mates, but it bucketed down all Saturday, so we ended up stuck at home." },
        { who: "mark", text: "Then on Sunday the kids had footy at eight in the morning, which is a brutal start when you've had a couple of beers the night before." },
        { who: "mark", text: "They lost by a mile, but they had a ball, so that's what counts. Anyway, enough about me — did you get up to anything?" }
      ],
      questions: [
        { q: "Why did Mark's Saturday plan fail?", options: ["His friends cancelled", "It rained heavily", "The beach was closed"], answer: 1 },
        { q: "What happened on Sunday morning?", options: ["His kids played football early", "He went to the beach", "He worked from home"], answer: 0 },
        { q: "How did the kids feel about the match?", options: ["Upset because they lost", "They enjoyed it despite losing", "They didn't want to play"], answer: 1 }
      ],
      glossary: [
        { t: "a write-off", es: "un desastre, tiempo perdido" }, { t: "barbie", es: "barbacoa (australiano)" },
        { t: "mates", es: "amigos" }, { t: "bucket down", es: "llover a cántaros" },
        { t: "footy", es: "fútbol australiano / rugby (australiano)" }, { t: "lose by a mile", es: "perder de paliza" },
        { t: "have a ball", es: "pasarlo genial" }
      ] },

    { id: "L-022", domain: "people", level: "b2", title: "Sarah prepara una presentación",
      context: "Sarah te pide opinión sobre la presentación de bienestar que dará al comité.",
      lines: [
        { who: "sarah", text: "Have you got five minutes? I'd love a second pair of eyes on my wellbeing deck before Thursday." },
        { who: "sarah", text: "My worry is that it's far too wordy. I've got twenty slides and I'm only allowed fifteen minutes." },
        { who: "sarah", text: "The key message is that sickness absence has dropped since we introduced flexible Fridays, but it gets lost in all the detail." },
        { who: "sarah", text: "I was thinking of opening with the headline number and moving the methodology to the appendix. Does that sound sensible to you?" }
      ],
      questions: [
        { q: "What is Sarah worried about?", options: ["Her deck has too much text and too many slides", "She doesn't have the data yet", "The committee meeting was cancelled"], answer: 0 },
        { q: "What is the key message of the presentation?", options: ["Flexible Fridays increased absence", "Sickness absence fell after flexible Fridays", "Wellbeing budgets should be cut"], answer: 1 },
        { q: "What change is she considering?", options: ["Adding more slides on methodology", "Starting with the main number and moving the method to the end", "Asking you to present instead"], answer: 1 }
      ],
      glossary: [
        { t: "a second pair of eyes", es: "otra persona que lo revise" }, { t: "deck", es: "presentación (diapositivas)" },
        { t: "wordy", es: "con demasiado texto" }, { t: "get lost in the detail", es: "perderse entre los detalles" },
        { t: "headline number", es: "la cifra principal" }, { t: "sensible", es: "sensato (¡no «sensible»!)" }
      ] },

    { id: "L-023", domain: "everyday", level: "b2", title: "Jake y su viaje desastroso",
      context: "En la pausa de una videollamada, Jake cuenta cómo le fue el viaje a Madrid.",
      lines: [
        { who: "jake", text: "Oh man, you would not believe the trip I had getting to Madrid last month." },
        { who: "jake", text: "My connecting flight in Frankfurt got cancelled, so I spent the night on a bench at the airport with about two hundred other people." },
        { who: "jake", text: "Then when I finally landed, my suitcase had gone to Lisbon instead. I did the whole first meeting in yesterday's shirt." },
        { who: "jake", text: "The funny thing is, everyone was so nice about it that it actually broke the ice. Best meeting of the trip, honestly." }
      ],
      questions: [
        { q: "Where did Jake spend the night?", options: ["In a hotel in Frankfurt", "At the airport in Frankfurt", "On a plane to Lisbon"], answer: 1 },
        { q: "What happened to his suitcase?", options: ["It was stolen", "It went to Lisbon", "It arrived a week late in Madrid"], answer: 1 },
        { q: "How did the first meeting go?", options: ["Badly, he was embarrassed", "Well, the situation helped break the ice", "It was cancelled"], answer: 1 }
      ],
      glossary: [
        { t: "you would not believe", es: "no te lo vas a creer" }, { t: "connecting flight", es: "vuelo de conexión" },
        { t: "land", es: "aterrizar" }, { t: "break the ice", es: "romper el hielo" },
        { t: "the funny thing is", es: "lo curioso es que" }
      ] },

    { id: "L-024", domain: "leadership", level: "b2", title: "Mark da feedback en el 1:1",
      context: "En vuestro 1:1, Mark comenta tu última presentación al equipo de dirección.",
      lines: [
        { who: "mark", text: "Before we dive in, I wanted to give you some quick feedback on Tuesday's session with the leadership team." },
        { who: "mark", text: "The analysis was spot on — honestly, nobody's looked at internal mobility that carefully before." },
        { who: "mark", text: "Where I'd push you is on the delivery. You spent the first five minutes on how you cleaned the data, and you lost the room a bit." },
        { who: "mark", text: "Next time, lead with the 'so what' — the one decision you want them to make — and keep the method for questions." },
        { who: "mark", text: "And don't be shy about jumping in when they go off on a tangent. You're the expert in that room, mate." }
      ],
      questions: [
        { q: "What did Mark like?", options: ["The quality of the analysis", "The length of the presentation", "The slides' design"], answer: 0 },
        { q: "What was the problem with the delivery?", options: ["It was too short", "It started with too much detail about the method", "It had no data"], answer: 1 },
        { q: "What does Mark encourage you to do?", options: ["Avoid questions", "Interrupt when the discussion goes off topic", "Let the leaders decide the agenda"], answer: 1 }
      ],
      glossary: [
        { t: "dive in", es: "entrar en materia" }, { t: "spot on", es: "clavado, perfecto" },
        { t: "push you on", es: "exigirte más en" }, { t: "lose the room", es: "perder la atención de la sala" },
        { t: "the 'so what'", es: "la conclusión práctica, por qué importa" }, { t: "go off on a tangent", es: "irse por las ramas" }
      ] }
  ],

  meetingMoves: [
    { id: "MM-025", domain: "meetings", fn: "interrupt", level: "b2",
      situation: "La discusión se ha ido del tema y quieres volver a tu punto antes de que se acabe el tiempo.",
      answer: "Can I just bring us back to the hiring plan for a second? We've only got ten minutes left.",
      distractors: ["We are losing time. Return to the hiring plan.", "Can I just bring us back to the hiring plan? We've only got ten minutes left, so stop talking about this."],
      note: "'Bring us back to' = reconducir sin culpar a nadie. Dar el motivo (el tiempo) hace que suene a ayuda, no a crítica." },
    { id: "MM-026", domain: "meetings", fn: "clarify", level: "b2",
      situation: "Jake habla muy rápido con acento americano y te has perdido una cifra clave.",
      answer: "Sorry, I didn't quite catch that last number — could you run it by me again?",
      distractors: ["Repeat, please.", "Sorry, I didn't understand nothing — can you say it again?"],
      note: "'Didn't quite catch' es la forma natural de decir que no lo oíste bien, sin parecer que no entiendes. 'Run it by me again' = repítemelo." },
    { id: "MM-027", domain: "meetings", fn: "time", level: "b2",
      situation: "Mark te pregunta algo para lo que no tienes la cifra a mano.",
      answer: "Good question. I don't want to give you the wrong figure, so let me double-check and get back to you by this afternoon.",
      distractors: ["I don't know.", "Good question. I will investigate it and I will say you something."],
      note: "No saber algo en una reunión es normal; improvisar un número no. 'Get back to you' + un plazo concreto transmite control." },
    { id: "MM-028", domain: "meetings", fn: "disagree", level: "b2",
      situation: "Sarah propone eliminar una pregunta de la encuesta y tú crees que es importante.",
      answer: "I see where you're coming from, but that question is our only measure of manager trust. Could we shorten it instead of dropping it?",
      distractors: ["No, that's a bad idea.", "I see where you're coming from, but you are wrong because that question is important."],
      note: "'I see where you're coming from, but…' reconoce el punto del otro. Discrepar + alternativa ('Could we…instead?') es mucho más convincente que discrepar a secas." },
    { id: "MM-029", domain: "meetings", fn: "check", level: "b2",
      situation: "Al final de una explicación larga de Mark, quieres confirmar que has entendido la prioridad.",
      answer: "Just so I'm clear: the board report comes first, and the dashboard can wait until next week?",
      distractors: ["Did I understand? Report first?", "Just so I'm clear: the board report is more important, no?"],
      note: "'Just so I'm clear' (o 'Just to make sure I've got this right') resume y confirma. Termina como pregunta con entonación ascendente; el 'no?' final es un calco del español." },
    { id: "MM-030", domain: "meetings", fn: "close", level: "b2",
      situation: "Te toca cerrar la reunión que has organizado y dejar claro quién hace qué.",
      answer: "Great, let's wrap up there. To recap: Jake sends the raw data by Wednesday, I'll update the model, and we'll regroup on Friday.",
      distractors: ["OK, finish. Bye everyone.", "Great, let's wrap up there. To resume: Jake sends the data on Wednesday and I update the model."],
      note: "'Wrap up' = cerrar. 'To recap' = para resumir ('resume' en inglés significa reanudar: falso amigo). 'Regroup' = volver a reunirse." }
  ],

  conversation: [
    { id: "CV-031", domain: "social", fn: "react", level: "b2",
      situation: "Un compañero te cuenta que se va a vivir a Australia el año que viene.",
      answer: "No way! That's huge news — what made you decide to take the plunge?",
      distractors: ["Ah, OK.", "Really? Why you go to Australia?"],
      note: "'No way!' expresa sorpresa positiva. 'Take the plunge' = lanzarse, dar el paso. Reaccionar + pregunta abierta mantiene la conversación viva." },
    { id: "CV-032", domain: "social", fn: "follow", level: "b2",
      situation: "En una comida, alguien menciona que ha empezado a hacer escalada y quieres que siga contando.",
      answer: "Oh, how did you get into that? I've always wanted to give it a go.",
      distractors: ["Climbing is dangerous.", "Oh, how did you start with that? I always wanted to try it."],
      note: "'Get into something' = empezar a aficionarse. 'Give it a go' = probarlo (muy australiano y británico). Fíjate: 'I've always wanted' (present perfect), no 'I always wanted'." },
    { id: "CV-033", domain: "everyday", fn: "story", level: "b2",
      situation: "Quieres empezar a contar una anécdota graciosa de tu viaje con naturalidad.",
      answer: "So, something ridiculous happened to me on the way back from Valencia…",
      distractors: ["I will tell you a story about my travel to Valencia.", "So, it passed me a ridiculous thing coming back from Valencia…"],
      note: "'So, …' + 'something happened to me' es el arranque típico de una anécdota. 'Me pasó' es 'happened to me' (no 'it passed me'); 'travel' no es contable: 'trip'." },
    { id: "CV-034", domain: "social", fn: "empathy", level: "b2",
      situation: "Sarah te cuenta que su madre está en el hospital.",
      answer: "Oh no, I'm so sorry to hear that. How's she doing? Let me know if you need me to cover anything this week.",
      distractors: ["That's bad. Anyway, about the report…", "Oh no, what a pity. I hope she gets better soon, cheer up!"],
      note: "'I'm so sorry to hear that' es empatía real (aquí 'sorry' no es una disculpa). Ofrecer algo concreto ('cover anything') vale más que 'what a pity', que suena frío." },
    { id: "CV-035", domain: "social", fn: "topic", level: "b2",
      situation: "La conversación en la comida se ha quedado en silencio y quieres sacar otro tema.",
      answer: "By the way, has anyone seen that new series everyone's talking about?",
      distractors: ["Now we change the topic.", "By the way, has anyone seen the new series that everybody speaks?"],
      note: "'By the way' abre un tema nuevo con suavidad. 'Everyone's talking about' necesita la preposición al final: talk ABOUT something." },
    { id: "CV-036", domain: "social", fn: "leave", level: "b2",
      situation: "Llevas un rato charlando con alguien en un evento y quieres irte sin parecer brusco.",
      answer: "Anyway, I'll let you get back to it — it was really nice chatting with you.",
      distractors: ["OK, I go now. Bye.", "Anyway, I leave you because I have to go — nice to meet you talking."],
      note: "'I'll let you get back to it' es la salida elegante clásica: suena a que respetas su tiempo. 'It was nice chatting' cierra en positivo." }
  ],

  traps: [
    { id: "B3-041", domain: "everyday", category: "false_friend", level: "b2",
      spanishSource: "Ayer estuve constipado todo el día.",
      right: "I had a cold all day yesterday.", wrong: "I was constipated all day yesterday.", alt: "I was a cold all day yesterday.",
      trap: "Constipated = estreñido. Resfriado = have a cold. Un error que provoca risas en una reunión." },
    { id: "B3-042", domain: "stakeholders", category: "false_friend", level: "b2",
      spanishSource: "Fue una reunión muy sensible: hablamos de despidos.",
      right: "It was a very sensitive meeting: we talked about layoffs.", wrong: "It was a very sensible meeting: we talked about layoffs.", alt: "It was a very sensitive meeting: we talked about dismissions.",
      trap: "Sensible = sensato. Sensible (español) = sensitive. Y despidos colectivos = layoffs (no existe «dismissions»)." },
    { id: "B3-043", domain: "data", category: "calque", level: "b2",
      spanishSource: "Depende de cómo midamos la rotación.",
      right: "It depends on how we measure turnover.", wrong: "It depends of how we measure the rotation.", alt: "It depends on how we measure rotation.",
      trap: "Depend ON. Y rotación de personal = turnover (o attrition); «rotation» es girar o rotar turnos." },
    { id: "B3-044", domain: "social", category: "calque", level: "b2",
      spanishSource: "Tengo 32 años y llevo dos años aquí.",
      right: "I'm 32 and I've been here for two years.", wrong: "I have 32 years and I am here for two years.", alt: "I'm 32 and I'm here since two years.",
      trap: "La edad va con «be» (I'm 32). «Llevo X tiempo» → present perfect + for: I've been here for two years." },
    { id: "B3-045", domain: "leadership", category: "nuance", level: "b2",
      spanishSource: "¿Puedes explicarme el modelo?",
      right: "Could you explain the model to me?", wrong: "Could you explain me the model?", alt: "Could you explain to me about the model?",
      trap: "Explain something TO someone. «Explain me» es el error más reconocible del hispanohablante." },
    { id: "B3-046", domain: "operations", category: "register", level: "b2",
      spanishSource: "(Correo a Mark) Te envío el informe. Cualquier cosa, me dices.",
      right: "Please find the report attached. Let me know if you have any questions.", wrong: "I send you the report. Any thing, you tell me.", alt: "Please find attached the report. Whatever thing, tell me.",
      trap: "«Cualquier cosa, me dices» no se traduce literal: «Let me know if you have any questions» o «Happy to talk it through». Y en correo: «Please find … attached»." }
  ]
});
