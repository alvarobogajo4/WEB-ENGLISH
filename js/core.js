/* =============================================================================
 * English 20 Minutes — Núcleo puro (sin DOM)
 * -----------------------------------------------------------------------------
 * Lógica testeable que no toca el DOM ni localStorage:
 *   Util       → fechas, escapado, formato
 *   SRS        → repetición espaciada SM-2 (calidad 0–5 por respuesta)
 *   Errors     → patrones de error recurrentes (aislado / emergente / crítico / superado)
 *   Mastery    → dominio en estrellas (0–5) por destreza o ámbito
 *   Level      → dificultad adaptativa (subir a C1 / consolidar en B2)
 *   Bank       → archivos de vocabulario para añadir al banco (puente con /fluidez-activa)
 *   Nivel      → nivel de expresión (MCER con niveles plus, escala Cambridge) y sus métricas
 *   Streak     → racha diaria
 *   State      → estado inicial, normalización y validación de importaciones
 *   Hedges     → detección de muletillas que restan autoridad
 * Se expone en window.E20_CORE (navegador) y en module.exports (tests con Node).
 * ========================================================================== */
(function (root) {
  "use strict";

  const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const isDate = (v) => typeof v === "string" && DATE_RE.test(v);

  /* ------------------------------------------------------------------ Util */
  const Util = {
    today(d = new Date()) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    addDays(date, n) {
      const [y, m, d] = date.split("-").map(Number);
      const t = new Date(Date.UTC(y, m - 1, d + n));
      return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
    },
    daysBetween(a, b) {
      const pa = a.split("-").map(Number), pb = b.split("-").map(Number);
      return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
    },
    shuffle(arr, rnd = Math.random) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    },
    esc(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    },
    mmss(sec) {
      const s = Math.max(0, Math.abs(sec));
      return `${sec < 0 ? "+" : ""}${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    },
    pct(ok, total) { return total ? Math.round((ok / total) * 100) : null; },
    escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); },
    words(t) { return t.trim() ? t.trim().split(/\s+/).length : 0; },
    plural(n, one, many) { return `${n} ${n === 1 ? one : many}`; }
  };

  /* ------------------------------------------------------------------- SRS */
  /* SM-2 (SuperMemo 2), adaptado de github.com/m98/fluent (MIT).
   * Cada respuesta se puntúa con una calidad de 0 a 5:
   *   5 perfecto · 4 correcto · 3 correcto con dudas · 2 fallo pero lo reconoces · 1 fallo · 0 en blanco
   * Registro por ítem: { ef, reps, interval, due, seen, correct, lapses, lastSeen }.
   *   ef        factor de facilidad (≥ 1,3): cuánto crece el intervalo tras cada acierto
   *   reps      aciertos seguidos en su fecha de repaso
   *   interval  días hasta el siguiente repaso (0 = hoy mismo)
   *   due       fecha del siguiente repaso (YYYY-MM-DD)
   * Secuencia típica de aciertos: 1 → 6 → 15 → 38 días… (con tope de MAX_INTERVAL). */
  const SRS = {
    EF0: 2.5,
    EF_MIN: 1.3,
    MAX_INTERVAL: 180,
    MASTERED_REPS: 3, // dominado = 3 repasos espaciados acertados seguidos (intervalo ≥ 15 días)
    LEGACY_INTERVAL: { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 }, // cajas Leitner de la versión 2

    blank() { return { ef: SRS.EF0, reps: 0, interval: 0, due: null, seen: 0, correct: 0, lapses: 0, lastSeen: null }; },

    /* Convierte un registro Leitner { box, seen, correct, lastSeen } a SM-2 sin perder el calendario. */
    fromLegacy(r) {
      const box = Math.min(5, Math.max(1, Math.round(Number(r.box)) || 1));
      const interval = SRS.LEGACY_INTERVAL[box];
      const lastSeen = typeof r.lastSeen === "string" && DATE_RE.test(r.lastSeen) ? r.lastSeen : null;
      return {
        ...SRS.blank(),
        reps: box - 1,
        interval,
        due: lastSeen ? Util.addDays(lastSeen, interval) : null,
        seen: Math.max(0, Number(r.seen) || 0),
        correct: Math.max(0, Number(r.correct) || 0),
        lastSeen
      };
    },

    /* true/false se aceptan por comodidad: acierto = 4, fallo = 1. */
    quality(q) {
      if (q === true) return 4;
      if (q === false) return 1;
      const n = Math.round(Number(q));
      return Number.isFinite(n) ? Math.min(5, Math.max(0, n)) : 1;
    },
    isCorrect(q) { return SRS.quality(q) >= 3; },

    isDue(rec, today) { return !rec || !rec.due || rec.due <= today; },
    isMastered(rec) { return !!rec && rec.reps >= SRS.MASTERED_REPS; },

    nextEf(ef, q) { return Math.max(SRS.EF_MIN, Math.round((ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))) * 100) / 100); },

    /* Nuevo registro tras una respuesta. Solo avanza el calendario si el repaso tocaba:
     * acertar un ítem antes de tiempo (2.ª sesión del día, refuerzos) suma al historial
     * pero no adelanta el calendario ni infla "dominados". Un fallo siempre reinicia. */
    nextRecord(rec, q, today) {
      q = SRS.quality(q);
      const r = { ...SRS.blank(), ...(rec || {}) };
      const due = SRS.isDue(r, today);
      r.seen += 1;
      if (q >= 3) {
        r.correct += 1;
        if (due) {
          r.interval = r.reps === 0 ? 1 : r.reps === 1 ? 6 : Math.min(SRS.MAX_INTERVAL, Math.round(Math.max(1, r.interval) * r.ef));
          r.reps += 1;
          r.ef = SRS.nextEf(r.ef, q);
          r.lastSeen = today;
          r.due = Util.addDays(today, r.interval);
        }
      } else {
        r.reps = 0;
        r.interval = 0;
        r.lapses += 1;
        r.ef = SRS.nextEf(r.ef, q);
        r.lastSeen = today;
        r.due = today;
      }
      return r;
    },

    /* Elige n ítems, por este orden:
     *   1. repasos pendientes de días anteriores (máx. 60 %), los más atrasados y difíciles primero,
     *   2. nuevos,
     *   3. el resto de pendientes, incluidos los fallados HOY (intervalo 0):
     *      vuelven en la siguiente sesión del día solo si no hay nada nuevo, para que
     *      un ítem fallado no acapare un bloque de 1–2 huecos (retos, audios),
     *   4. si !onlyDue, relleno con los no pendientes cuyo repaso está más cerca.
     * prefer(it) → true marca ítems prioritarios (p. ej. de un patrón de error activo):
     * dentro de cada grupo van primero. */
    pickFrom(list, n, items, today, onlyDue = false, rnd = Math.random, prefer = null) {
      if (n <= 0 || !list.length) return [];
      const pf = (it) => (prefer && prefer(it) ? 0 : 1);
      const due = [], dueToday = [], fresh = [], rest = [];
      for (const it of list) {
        const rec = items[it.id];
        if (!rec) fresh.push(it);
        else if (!SRS.isDue(rec, today)) rest.push(it);
        else if (rec.lastSeen === today) dueToday.push(it);
        else due.push(it);
      }
      const dueOf = (it) => items[it.id].due || "";
      const byDue = (a, b) => (dueOf(a) < dueOf(b) ? -1 : dueOf(a) > dueOf(b) ? 1 : 0);
      due.sort((a, b) => pf(a) - pf(b) || byDue(a, b) || items[a.id].ef - items[b.id].ef);
      const freshSorted = Util.shuffle(fresh, rnd).sort((a, b) => pf(a) - pf(b));
      const maxDue = Math.max(1, Math.ceil(n * 0.6));
      const picked = due.slice(0, maxDue);
      for (const it of freshSorted) { if (picked.length >= n) break; picked.push(it); }
      for (const it of [...due.slice(maxDue), ...dueToday]) { if (picked.length >= n) break; picked.push(it); }
      if (!onlyDue) {
        rest.sort((a, b) => pf(a) - pf(b) || byDue(a, b));
        for (const it of rest) { if (picked.length >= n) break; picked.push(it); }
      }
      return picked.slice(0, n);
    }
  };

  /* ---------------------------------------------------------------- Errors */
  /* Patrones de error (idea de mistakes-db de m98/fluent). Cada ítem pertenece a un
   * patrón (regla gramatical, tipo de trampa, función conversacional…). Por patrón:
   *   { label, n: fallos totales, ok: aciertos, run: aciertos seguidos desde el último fallo,
   *     last: último fallo, dates: fechas de los últimos fallos, examples: [{ id, given, expected, date }] }
   * Estado (con los fallos de los últimos WINDOW días):
   *   1 fallo → aislado (puede ser un despiste) · 2–3 → emergente · 4+ → crítico
   *   ≥ 2 fallos en total y RESOLVED_RUN aciertos seguidos, el último en un día posterior
   *   al último fallo → superado. */
  const Errors = {
    WINDOW: 30,
    MAX_DATES: 10,
    MAX_EXAMPLES: 3,
    RESOLVED_RUN: 3,
    ACTIVE: ["critical", "emerging"],

    /* Devuelve un objeto de errores nuevo (no muta el recibido). */
    record(errors, key, label, ok, today, example = null) {
      const prev = errors[key];
      if (ok && !prev) return errors; // acertar en un patrón sin fallos no aporta nada: no se guarda
      const p = prev
        ? { ...prev, dates: prev.dates.slice(), examples: prev.examples.slice() }
        : { label, n: 0, ok: 0, run: 0, last: null, lastOk: null, dates: [], examples: [] };
      if (label) p.label = label;
      if (ok) { p.ok += 1; p.run += 1; p.lastOk = today; }
      else {
        p.n += 1; p.run = 0; p.last = today;
        p.dates = [...p.dates, today].slice(-Errors.MAX_DATES);
        if (example) {
          const ex = { id: String(example.id || ""), given: String(example.given || ""), expected: String(example.expected || ""), date: today };
          p.examples = [ex, ...p.examples.filter((e) => e.id !== ex.id)].slice(0, Errors.MAX_EXAMPLES);
        }
      }
      return { ...errors, [key]: p };
    },

    active(p, today) { return p.dates.filter((d) => Util.daysBetween(d, today) <= Errors.WINDOW).length; },

    status(p, today) {
      if (!p || !p.n) return null;
      // Superado: racha de aciertos que termina otro día distinto al del último fallo
      // (acertar justo después de fallar, en la misma sentada, no demuestra retención).
      if (p.n >= 2 && p.run >= Errors.RESOLVED_RUN && p.lastOk && (!p.last || p.lastOk > p.last)) return "resolved";
      const a = Errors.active(p, today);
      if (a >= 4) return "critical";
      if (a >= 2) return "emerging";
      if (a === 1) return "isolated";
      return null;
    },

    statuses(errors, today) {
      const out = {};
      for (const [k, p] of Object.entries(errors)) out[k] = Errors.status(p, today);
      return out;
    },

    /* Patrones activos (críticos y emergentes), los peores primero. */
    ranked(errors, today) {
      const rank = { critical: 0, emerging: 1 };
      return Object.entries(errors)
        .map(([key, p]) => ({ key, p, status: Errors.status(p, today), active: Errors.active(p, today) }))
        .filter((x) => Errors.ACTIVE.includes(x.status))
        .sort((a, b) => rank[a.status] - rank[b.status] || b.active - a.active || ((b.p.last || "") > (a.p.last || "") ? 1 : (b.p.last || "") < (a.p.last || "") ? -1 : 0));
    },

    /* Cambios entre dos fotos de estados: lo superado y lo que empeora. */
    diff(before, after) {
      const sev = { critical: 2, emerging: 1 };
      const resolved = [], worse = [];
      for (const [k, st] of Object.entries(after)) {
        const b = before[k] || null;
        if (st === "resolved" && Errors.ACTIVE.includes(b)) resolved.push(k);
        else if (sev[st] && sev[st] > (sev[b] || 0)) worse.push(k);
      }
      return { resolved, worse };
    }
  };

  /* --------------------------------------------------------------- Mastery */
  /* Dominio de 0 a 5 estrellas (escala de m98/fluent) a partir de la precisión,
   * con un tope por cobertura para que acertar pocas preguntas fáciles no dé 5★:
   *   precisión ≥ 90 % → 5 · ≥ 80 → 4 · ≥ 65 → 3 · ≥ 50 → 2 · ≥ 30 → 1 · resto 0
   *   5★ exige ≥ 50 % del contenido dominado y 4★ exige ≥ 25 %.
   * Con menos de MIN_ANSWERS respuestas devuelve null (aún sin datos). */
  const Mastery = {
    MIN_ANSWERS: 5,
    stars({ ok, total, mastered = 0, size = 0 }) {
      if (!total || total < Mastery.MIN_ANSWERS) return null;
      const acc = ok / total;
      let s = acc >= 0.9 ? 5 : acc >= 0.8 ? 4 : acc >= 0.65 ? 3 : acc >= 0.5 ? 2 : acc >= 0.3 ? 1 : 0;
      const cov = size ? mastered / size : 0;
      if (s === 5 && cov < 0.5) s = 4;
      if (s >= 4 && cov < 0.25) s = 3;
      return s;
    }
  };

  /* ----------------------------------------------------------------- Level */
  /* Dificultad adaptativa. Con preguntas de opción múltiple la zona útil es 70–85 %:
   * por encima, sube de nivel; muy por debajo, consolida antes de seguir. */
  const Level = {
    UP_PCT: 85, UP_SESSIONS: 5,
    DOWN_PCT: 60, DOWN_SESSIONS: 3,
    sessionPct(ses) {
      let ok = 0, tot = 0;
      Object.values(ses.score || {}).forEach((r) => { ok += r.ok; tot += r.total; });
      return Util.pct(ok, tot);
    },
    /* "up" (B2 → C1), "down" (C1 → B2) o null. */
    advice(sessions, level) {
      const mine = sessions.filter((s) => s.level === level);
      if (level === "b2") {
        const last = mine.slice(-Level.UP_SESSIONS);
        return last.length >= Level.UP_SESSIONS && last.every((s) => (Level.sessionPct(s) || 0) >= Level.UP_PCT) ? "up" : null;
      }
      if (level === "c1") {
        const last = mine.slice(-Level.DOWN_SESSIONS);
        return last.length >= Level.DOWN_SESSIONS && last.every((s) => (Level.sessionPct(s) ?? 100) < Level.DOWN_PCT) ? "down" : null;
      }
      return null;
    }
  };

  /* ---------------------------------------------------------------- Streak */
  const Streak = {
    view(st, today) {
      if (!st.lastDate) return { current: 0, best: st.best || 0, doneToday: false };
      const gap = Util.daysBetween(st.lastDate, today);
      return { current: gap <= 1 ? st.current : 0, best: st.best || 0, doneToday: gap === 0 };
    },
    /* Devuelve la racha tras completar una sesión hoy. */
    register(st, today) {
      if (st.lastDate === today) return { ...st };
      const gap = st.lastDate ? Util.daysBetween(st.lastDate, today) : null;
      const current = gap === 1 ? st.current + 1 : 1;
      return { current, best: Math.max(st.best || 0, current), lastDate: today };
    }
  };

  /* ----------------------------------------------------------------- State */
  const nonNeg = (v) => Math.max(0, Math.round(Number(v)) || 0);
  const str = (v, max = 300) => (typeof v === "string" ? v.slice(0, max) : "");

  const State = {
    VERSION: 5,
    VOICES: ["en-GB", "en-US", "en-AU"],
    fresh() {
      return {
        version: 5,
        streak: { current: 0, best: 0, lastDate: null },
        items: {},       // id → registro SM-2 (ver SRS)
        errors: {},      // patrón → registro de errores (ver Errors)
        sessions: [],    // { date, ts, level, score: { block: { ok, total } } }
        custom: [],      // banco personal: { id, en, es, example, created }
        nivel: [],       // chequeos de expresión (ver Nivel), del más antiguo al más reciente
        fluidez: null,   // último resumen de /fluidez-activa (ver Bank.summary)
        delivery: [],    // métricas de los retos hablados: { date, secs, words, wpm, fillers, authority, social }
        productions: [], // texto de los últimos retos (para el feedback del tutor): ver normalizeProduction
        settings: { tts: true, voice: "en-GB", level: "b2", lastExport: null, produceFirst: true, synced: [] }
      };
    },

    /* Registro SM-2 válido a partir de lo leído; migra los registros Leitner (v2). */
    normalizeItem(r) {
      if (!("reps" in r) && "box" in r) return SRS.fromLegacy(r);
      const ef = Number(r.ef);
      return {
        ef: Number.isFinite(ef) ? Math.min(5, Math.max(SRS.EF_MIN, ef)) : SRS.EF0,
        reps: nonNeg(r.reps),
        interval: Math.min(SRS.MAX_INTERVAL, nonNeg(r.interval)),
        due: isDate(r.due) ? r.due : null,
        seen: nonNeg(r.seen),
        correct: nonNeg(r.correct),
        lapses: nonNeg(r.lapses),
        lastSeen: isDate(r.lastSeen) ? r.lastSeen : null
      };
    },

    MAX_DELIVERY: 60,
    normalizeDelivery(d) {
      if (!isDate(d.date)) return null;
      return { date: d.date, secs: nonNeg(d.secs), words: nonNeg(d.words), wpm: nonNeg(d.wpm), fillers: nonNeg(d.fillers), authority: nonNeg(d.authority), social: !!d.social };
    },

    MAX_PRODUCTIONS: 30,
    /* Respuesta a un reto: { date, id, scenario, brief, text, spoken, secs, wpm, score, social, reviewed } */
    normalizeProduction(p) {
      if (!isObj(p) || !isDate(p.date) || typeof p.text !== "string" || !p.text.trim()) return null;
      return {
        date: p.date, id: str(p.id, 40), scenario: str(p.scenario, 60), brief: str(p.brief, 400),
        text: str(p.text, 2000), spoken: !!p.spoken, secs: nonNeg(p.secs), wpm: nonNeg(p.wpm),
        score: Math.min(100, nonNeg(p.score)), social: !!p.social, reviewed: !!p.reviewed
      };
    },

    /* Ajustes válidos: un valor desconocido (p. ej. de una copia manipulada) vuelve al valor por defecto. */
    normalizeSettings(s) {
      const base = State.fresh().settings;
      if (!isObj(s)) return base;
      return {
        tts: typeof s.tts === "boolean" ? s.tts : base.tts,
        voice: State.VOICES.includes(s.voice) ? s.voice : base.voice,
        level: s.level === "b2" || s.level === "c1" ? s.level : base.level,
        lastExport: isDate(s.lastExport) ? s.lastExport : null,
        produceFirst: typeof s.produceFirst === "boolean" ? s.produceFirst : base.produceFirst,
        synced: Array.isArray(s.synced) ? s.synced.filter((x) => typeof x === "string").slice(-100) : []
      };
    },

    normalizeError(p) {
      return {
        label: str(p.label, 120),
        n: nonNeg(p.n),
        ok: nonNeg(p.ok),
        run: nonNeg(p.run),
        last: isDate(p.last) ? p.last : null,
        lastOk: isDate(p.lastOk) ? p.lastOk : null,
        dates: Array.isArray(p.dates) ? p.dates.filter(isDate).slice(-Errors.MAX_DATES) : [],
        examples: Array.isArray(p.examples)
          ? p.examples.filter(isObj).slice(0, Errors.MAX_EXAMPLES).map((e) => ({ id: str(e.id, 40), given: str(e.given), expected: str(e.expected), date: isDate(e.date) ? e.date : null }))
          : []
      };
    },

    /* Mezcla un estado leído (de localStorage o de un archivo) con el estado
     * inicial, descartando piezas con forma incorrecta en vez de fallar. */
    normalize(parsed) {
      if (!isObj(parsed)) throw new Error("El progreso no tiene el formato esperado.");
      const base = State.fresh();
      const items = {};
      if (isObj(parsed.items)) {
        for (const [id, r] of Object.entries(parsed.items)) if (isObj(r)) items[id] = State.normalizeItem(r);
      }
      const errors = {};
      if (isObj(parsed.errors)) {
        for (const [k, p] of Object.entries(parsed.errors)) if (isObj(p)) errors[k] = State.normalizeError(p);
      }
      const st = isObj(parsed.streak) ? parsed.streak : {};
      return {
        ...base,
        version: 5,
        errors,
        nivel: Array.isArray(parsed.nivel) ? Nivel.merge([], parsed.nivel.map(Nivel.tryNormalize).filter(Boolean)) : [],
        fluidez: Bank.summary(parsed.fluidez),
        delivery: Array.isArray(parsed.delivery) ? parsed.delivery.filter(isObj).map(State.normalizeDelivery).filter(Boolean).slice(-State.MAX_DELIVERY) : [],
        productions: Array.isArray(parsed.productions) ? parsed.productions.map(State.normalizeProduction).filter(Boolean).slice(-State.MAX_PRODUCTIONS) : [],
        streak: {
          current: Math.max(0, Number(st.current) || 0),
          best: Math.max(0, Number(st.best) || 0),
          lastDate: typeof st.lastDate === "string" && DATE_RE.test(st.lastDate) ? st.lastDate : null
        },
        settings: State.normalizeSettings(parsed.settings),
        items,
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions.filter((s) => isObj(s) && isObj(s.score)) : [],
        custom: Array.isArray(parsed.custom)
          ? parsed.custom.filter((w) => isObj(w) && typeof w.id === "string" && typeof w.en === "string" && typeof w.es === "string")
          : []
      };
    },

    /* Archivo de copia de seguridad: { app, exportedAt, state }. */
    toExport(state, now = new Date()) {
      return { app: "english-20-minutes", format: 1, exportedAt: now.toISOString(), state };
    },

    /* Acepta el archivo exportado (o un estado "pelado") y devuelve un estado normalizado. */
    fromImport(text) {
      let data;
      try { data = JSON.parse(text); } catch (_) { throw new Error("El archivo no es un JSON válido."); }
      const raw = isObj(data) && data.app === "english-20-minutes" ? data.state : data;
      if (!isObj(raw) || !(isObj(raw.items) || Array.isArray(raw.sessions) || Array.isArray(raw.custom))) {
        throw new Error("El archivo no parece una copia de English 20 Minutes.");
      }
      return State.normalize(raw);
    },

    /* Lee cualquier archivo de la app y dice qué es:
     *   { kind: "bank", words }  → palabras para AÑADIR al banco (p. ej. desde /fluidez-activa)
     *   { kind: "nivel", entries } → chequeos de nivel para AÑADIR al historial (/chequeo-nivel)
     *   { kind: "state", state } → copia de seguridad completa (REEMPLAZA el progreso) */
    parseFile(text) {
      let data;
      try { data = JSON.parse(text); } catch (_) { throw new Error("El archivo no es un JSON válido."); }
      if (isObj(data) && data.app === "english-20-minutes" && data.kind === Bank.KIND) return { kind: "bank", words: Bank.parse(data), fluidez: Bank.summary(data.fluidez) };
      if (isObj(data) && data.app === "english-20-minutes" && data.kind === Nivel.KIND) return { kind: "nivel", entries: Nivel.parse(data) };
      return { kind: "state", state: State.fromImport(text) };
    },

    summary(state) {
      return {
        streak: state.streak.best || 0,
        sessions: state.sessions.length,
        words: state.custom.length,
        items: Object.keys(state.items).length
      };
    }
  };

  /* ------------------------------------------------------------------ Bank */
  /* Archivo de palabras para añadir al banco personal sin tocar el resto del progreso.
   * Lo genera scripts/fluidez.js (skill /fluidez-activa) y lo importa la app:
   *   { app: "english-20-minutes", format: 1, kind: "bank", exportedAt, words: [{ en, es, example }] } */
  const Bank = {
    KIND: "bank",
    MAX_WORDS: 500,
    clean(w) {
      if (!isObj(w)) return null;
      const en = str(w.en, 80).trim(), es = str(w.es, 80).trim();
      return en && es ? { en, es, example: str(w.example, 160).trim() } : null;
    },
    /* fluidez (opcional): resumen de /fluidez-activa para los indicadores de «Tu nivel». */
    toFile(words, now = new Date(), fluidez = null) {
      const out = { app: "english-20-minutes", format: 1, kind: Bank.KIND, exportedAt: now.toISOString(), words: words.map(Bank.clean).filter(Boolean) };
      if (fluidez) out.fluidez = fluidez;
      return out;
    },
    parse(data) {
      if (!isObj(data) || !Array.isArray(data.words)) throw new Error("El archivo de vocabulario no tiene palabras.");
      const words = data.words.slice(0, Bank.MAX_WORDS).map(Bank.clean).filter(Boolean);
      if (!words.length && !Bank.summary(data.fluidez)) throw new Error("El archivo de vocabulario no tiene palabras válidas.");
      return words;
    },
    /* Resumen de fluidez: { fecha, activos, enUso, sesiones, espontaneoPct, criterios: { interaccion, adaptacion, fluidez } (1–5) }. */
    summary(f) {
      if (!isObj(f) || !isDate(f.fecha)) return null;
      const crit = {};
      if (isObj(f.criterios)) for (const k of ["interaccion", "adaptacion", "fluidez"]) {
        const v = Number(f.criterios[k]);
        if (Number.isFinite(v) && v >= 1 && v <= 5) crit[k] = Math.round(v * 10) / 10;
      }
      return { fecha: f.fecha, activos: nonNeg(f.activos), enUso: nonNeg(f.enUso), sesiones: nonNeg(f.sesiones), espontaneoPct: Math.min(100, nonNeg(f.espontaneoPct)), criterios: crit };
    },
    /* Añade al banco las palabras que no estén ya (sin distinguir mayúsculas). */
    merge(custom, words, today, idBase = Date.now().toString(36)) {
      const have = new Set(custom.map((w) => w.en.toLowerCase()));
      const out = custom.slice();
      let added = 0;
      for (const w of words) {
        const k = w.en.toLowerCase();
        if (have.has(k)) continue;
        have.add(k);
        out.push({ id: `U-${idBase}${added.toString(36)}`, en: w.en, es: w.es, example: w.example || "", created: today });
        added++;
      }
      return { custom: out, added, skipped: words.length - added };
    }
  };

  /* ----------------------------------------------------------------- Nivel */
  /* Nivel de EXPRESIÓN (no de examen). Escala MCER con niveles plus (volumen
   * complementario 2020), situada en la Cambridge English Scale para tener una
   * referencia conocida. Se evalúan 6 criterios (aspectos cualitativos del MCER
   * + adaptación de registro) y un mapa de situaciones. Lo usan:
   *   - /chequeo-nivel (Claude Code) → scripts/nivel.js → archivo kind "nivel"
   *   - la app (tarjeta «Tu nivel de expresión»), que importa ese archivo.
   * Chequeo normalizado:
   *   { fecha, modo, global: { nivel, puntos }, criterios: { rango: { nivel, evidencia }, … },
   *     situaciones: { clave: nivel }, fuertes: [{ texto, evidencia }],
   *     debiles: [{ texto, evidencia, accion }], foco: { criterio, situacion },
   *     metricas: { … }, variantes: [ … ] } */
  const Nivel = {
    KIND: "nivel",
    MAX_HISTORY: 36,
    LEVELS: ["A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C1+", "C2"],
    SCORE: { "A2": 125, "A2+": 135, "B1": 145, "B1+": 155, "B2": 165, "B2+": 175, "C1": 185, "C1+": 195, "C2": 205 },
    GOAL: "B2+",
    CRITERIA: {
      rango:       "Rango",
      correccion:  "Corrección",
      fluidez:     "Fluidez",
      interaccion: "Interacción",
      coherencia:  "Coherencia",
      adaptacion:  "Adaptación"
    },
    /* Si hay empate entre los más débiles, manda lo más ligado a expresarse. */
    FOCUS_ORDER: ["interaccion", "fluidez", "adaptacion", "rango", "coherencia", "correccion"],
    SITUATIONS: {
      "mark-1a1":   "1:1 con Mark",
      "reuniones":  "Reuniones: intervenir y discrepar",
      "presentar":  "Presentar",
      "datos":      "Explicar datos a no expertos",
      "small-talk": "Small talk con compañeros",
      "social":     "Conversación social",
      "historias":  "Contar historias",
      "opiniones":  "Opinar de actualidad",
      "problemas":  "Resolver problemas (quejas, servicios)",
      "escrito":    "Mensajes de Teams y correos"
    },
    CONNECTORS: ["however", "although", "even though", "on the other hand", "whereas", "because", "since", "that's why", "as a result",
      "which means", "in the end", "first of all", "to begin with", "after that", "meanwhile", "anyway", "besides", "what's more",
      "on top of that", "for example", "for instance", "in other words", "to be fair", "having said that", "that said", "by the way",
      "as far as i'm concerned", "unless", "otherwise", "instead", "overall", "to sum up", "so that", "in fact", "it turned out"],

    toScore(level) { return Nivel.SCORE[level] ?? null; },
    /* Nivel más cercano a una puntuación (los empates suben: 170 → B2+). */
    fromScore(n) {
      let best = Nivel.LEVELS[0];
      for (const l of Nivel.LEVELS) if (Math.abs(Nivel.SCORE[l] - n) <= Math.abs(Nivel.SCORE[best] - n)) best = l;
      return best;
    },
    median(nums) {
      const a = nums.slice().sort((x, y) => x - y), m = a.length >> 1;
      return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
    },
    global(criterios) {
      const pts = Object.keys(Nivel.CRITERIA).map((k) => Nivel.toScore(criterios[k].nivel));
      const puntos = Math.round(Nivel.median(pts));
      return { nivel: Nivel.fromScore(puntos), puntos };
    },
    /* Criterio y situación más débiles del chequeo: lo que se entrena hasta el siguiente. */
    focus(entry) {
      const crit = Nivel.FOCUS_ORDER.slice().sort((a, b) => Nivel.toScore(entry.criterios[a].nivel) - Nivel.toScore(entry.criterios[b].nivel) || Nivel.FOCUS_ORDER.indexOf(a) - Nivel.FOCUS_ORDER.indexOf(b))[0];
      const sits = Object.entries(entry.situaciones).sort((a, b) => Nivel.toScore(a[1]) - Nivel.toScore(b[1]));
      return { criterio: crit, situacion: sits.length ? sits[0][0] : null };
    },

    /* Normaliza un chequeo. Devuelve { entry, errors }; entry es null si hay errores. */
    normalize(raw) {
      const errors = [];
      if (!isObj(raw)) return { entry: null, errors: ["el chequeo no es un objeto"] };
      const lvl = (v) => (typeof v === "string" && Nivel.SCORE[v.trim().toUpperCase()] ? v.trim().toUpperCase() : null);
      if (!isDate(raw.fecha)) errors.push("fecha no válida (AAAA-MM-DD)");
      const criterios = {};
      for (const k of Object.keys(Nivel.CRITERIA)) {
        const c = isObj(raw.criterios) ? raw.criterios[k] : null;
        const nivel = c && lvl(c.nivel);
        const evidencia = c ? str(c.evidencia, 400).trim() : "";
        if (!nivel) errors.push(`criterio "${k}": falta un nivel válido (${Nivel.LEVELS.join(", ")})`);
        if (!evidencia) errors.push(`criterio "${k}": falta la evidencia (una cita de tus respuestas)`);
        criterios[k] = { nivel, evidencia };
      }
      const situaciones = {};
      if (isObj(raw.situaciones)) {
        for (const [k, v] of Object.entries(raw.situaciones)) {
          if (!Nivel.SITUATIONS[k]) errors.push(`situación desconocida "${k}"`);
          else if (!lvl(v)) errors.push(`situación "${k}": nivel no válido`);
          else situaciones[k] = lvl(v);
        }
      }
      if (!Object.keys(situaciones).length) errors.push("faltan situaciones evaluadas");
      const list = (v, withAction) => (Array.isArray(v) ? v : []).filter(isObj).slice(0, 3)
        .map((x) => ({ texto: str(x.texto, 300).trim(), evidencia: str(x.evidencia, 400).trim(), ...(withAction ? { accion: str(x.accion, 300).trim() } : {}) }))
        .filter((x) => x.texto);
      const fuertes = list(raw.fuertes, false), debiles = list(raw.debiles, true);
      if (!fuertes.length) errors.push("falta al menos un punto fuerte");
      if (!debiles.length) errors.push("falta al menos un punto débil");
      if (debiles.some((d) => !d.accion)) errors.push("cada punto débil necesita una acción concreta");
      if (errors.length) return { entry: null, errors };
      const metricas = {};
      if (isObj(raw.metricas)) for (const [k, v] of Object.entries(raw.metricas)) if (Number.isFinite(Number(v))) metricas[k] = Math.round(Number(v) * 100) / 100;
      const entry = {
        fecha: raw.fecha,
        modo: ["hablado", "escrito", "mixto"].includes(raw.modo) ? raw.modo : "mixto",
        global: Nivel.global(criterios),
        criterios, situaciones, fuertes, debiles,
        metricas,
        variantes: Array.isArray(raw.variantes) ? raw.variantes.map((v) => str(v, 60)).filter(Boolean).slice(0, 12) : []
      };
      entry.foco = Nivel.focus(entry);
      return { entry, errors: [] };
    },
    tryNormalize(raw) { return Nivel.normalize(raw).entry; },

    /* Añade chequeos al historial (el de la misma fecha se reemplaza), ordenado por fecha. */
    merge(history, entries) {
      const byDate = new Map(history.map((e) => [e.fecha, e]));
      for (const e of entries) byDate.set(e.fecha, e);
      return [...byDate.values()].sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(-Nivel.MAX_HISTORY);
    },

    toFile(entries, now = new Date()) { return { app: "english-20-minutes", format: 1, kind: Nivel.KIND, exportedAt: now.toISOString(), entries }; },
    parse(data) {
      if (!isObj(data) || !Array.isArray(data.entries)) throw new Error("El archivo de nivel no tiene chequeos.");
      const entries = data.entries.map(Nivel.tryNormalize).filter(Boolean);
      if (!entries.length) throw new Error("El archivo de nivel no tiene chequeos válidos.");
      return entries;
    },

    /* Cambio respecto al chequeo anterior, en puntos de la escala (por criterio y global). */
    trend(history) {
      if (history.length < 2) return null;
      const [prev, last] = history.slice(-2);
      const out = { global: last.global.puntos - prev.global.puntos, criterios: {} };
      for (const k of Object.keys(Nivel.CRITERIA)) out.criterios[k] = Nivel.toScore(last.criterios[k].nivel) - Nivel.toScore(prev.criterios[k].nivel);
      return out;
    },

    /* Último nivel conocido de cada situación (no todas se evalúan cada mes). */
    situationMap(history) {
      const out = {};
      for (const e of history) for (const [k, v] of Object.entries(e.situaciones)) out[k] = { nivel: v, fecha: e.fecha };
      return out;
    },

    /* Métricas objetivas de unas respuestas (texto de cada turno):
     *   palabrasPorTurno · variedadLexica (MATTR, ventana de 50 palabras: 0–1, más es más variado)
     *   conectores (distintos) · chunksActivos (de tu progreso de fluidez que aparecen)
     *   muletillas (relleno) · atenuadores (restan autoridad en el trabajo) — por cada 100 palabras */
    metrics(texts, chunks = []) {
      const all = texts.map(String).join(" \n ");
      const tokens = (all.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || []);
      const n = tokens.length;
      const W = 50;
      let ttr = 0;
      if (n && n < W) ttr = new Set(tokens).size / n;
      else if (n) {
        let sum = 0;
        for (let i = 0; i + W <= n; i++) sum += new Set(tokens.slice(i, i + W)).size / W;
        ttr = sum / (n - W + 1);
      }
      const low = ` ${all.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ")} `;
      const has = (p) => new RegExp(`(^|[^a-z'])${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z']|$)`).test(low);
      const turns = texts.filter((t) => String(t).trim()).length;
      const hedges = countHedges(all);
      const per100 = (x) => (n ? Math.round((x / n) * 1000) / 10 : 0);
      const authority = HEDGES.filter((h) => h.authority).map((h) => h.t);
      const sum = (pred) => hedges.filter(pred).reduce((a, h) => a + h.n, 0);
      return {
        palabras: n,
        palabrasPorTurno: turns ? Math.round(n / turns) : 0,
        variedadLexica: Math.round(ttr * 100) / 100,
        conectores: Nivel.CONNECTORS.filter(has).length,
        chunksActivos: [...new Set(chunks.map((c) => String(c).toLowerCase().trim()).filter(Boolean))].filter(has).length,
        muletillas: per100(sum((h) => !authority.includes(h.t))),
        atenuadores: per100(sum((h) => authority.includes(h.t)))
      };
    }
  };

  /* --------------------------------------------------------------- Produce */
  /* «Dilo antes de verlo»: el alumno produce la frase (hablando o escribiendo)
   * ANTES de ver las opciones. Pasar de reconocer a producir es el salto que
   * convierte el vocabulario pasivo en activo (efecto de recuperación activa).
   * similarity: qué parte de las palabras de la frase modelo aparece en el intento
   * (0–1), sin mayúsculas, puntuación ni contracciones; las palabras vacías
   * cuentan la mitad, porque lo que importa es dar con el chunk. */
  const STOP = new Set("a an the to of in on at for and or but is are was were be it i you we they he she that this so do does did have has had my your our with as just".split(" "));
  const normTokens = (s) => String(s).toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/n't\b/g, " not").replace(/'re\b/g, " are").replace(/'m\b/g, " am").replace(/'ll\b/g, " will").replace(/'ve\b/g, " have").replace(/'d\b/g, " would").replace(/'s\b/g, "")
    .replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
  const Produce = {
    tokens: normTokens,
    similarity(attempt, target) {
      const tgt = normTokens(target), have = new Set(normTokens(attempt));
      if (!tgt.length || !have.size) return 0;
      let got = 0, tot = 0;
      for (const w of tgt) { const wt = STOP.has(w) ? 0.5 : 1; tot += wt; if (have.has(w)) got += wt; }
      return Math.round((got / tot) * 100) / 100;
    },
    /* Calidad SM-2 combinando producción y reconocimiento:
     *   elige mal → 1 · no intenta producir → 4 (solo reconocimiento)
     *   produce ≥ 75 % → 5 · ≥ 45 % → 4 · menos → 3 (lo reconoce pero aún no le sale: vuelve antes) */
    quality(choiceOk, attempt, target) {
      if (!choiceOk) return 1;
      if (!String(attempt || "").trim()) return 4;
      const s = Produce.similarity(attempt, target);
      return s >= 0.75 ? 5 : s >= 0.45 ? 4 : 3;
    }
  };

  /* ------------------------------------------------------------- Dictation */
  /* Repaso de un audio ya escuchado: en lugar de repetir las mismas preguntas
   * (que acaban memorizándose), se escucha una frase y se escriben las palabras
   * que faltan. Entrena la decodificación de abajo arriba: separar palabras en
   * el habla encadenada, que es donde falla la comprensión de un B2. */
  const Dictation = {
    GAPS: 3,
    pick(lines, rnd = Math.random) {
      const cands = lines.map((l, i) => ({ i, words: l.text.split(/\s+/) })).filter((x) => x.words.length >= 8);
      const pool = cands.length ? cands : lines.map((l, i) => ({ i, words: l.text.split(/\s+/) }));
      const line = pool[Math.floor(rnd() * pool.length)];
      const clean = (w) => w.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, "");
      const content = line.words.map((w, i) => ({ i, w: clean(w) }))
        .filter((x) => x.w.length >= 4 && !STOP.has(x.w.toLowerCase()));
      const chosen = Util.shuffle(content, rnd).slice(0, Dictation.GAPS).sort((a, b) => a.i - b.i);
      return { line: line.i, gaps: chosen.map((x) => ({ pos: x.i, word: x.w })) };
    },
    /* Acepta mayúsculas/puntuación distintas y una errata en palabras de 6+ letras. */
    check(given, expected) {
      const n = (s) => String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9']/g, "");
      const a = n(given), b = n(expected);
      if (!a) return false;
      if (a === b) return true;
      return b.length >= 6 && Dictation.distance(a, b) <= 1;
    },
    distance(a, b) {
      const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
      for (let j = 1; j <= b.length; j++) dp[0][j] = j;
      for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      return dp[a.length][b.length];
    }
  };

  /* ---------------------------------------------------------------- Hedges */
  /* Muletillas y atenuadores que restan autoridad en un registro profesional.
   * "Sorry" funcional ("Sorry to jump in", "Sorry, could you…") NO cuenta:
   * es la forma correcta de interrumpir o pedir aclaración. Solo se marca la
   * disculpa innecesaria ("I'm sorry", "sorry for/about").
   * authority: atenuadores que restan autoridad en un contexto profesional pero
   * son naturales en una conversación informal ("I think", "maybe"…). En modo
   * social solo se cuentan las muletillas de relleno. */
  const HEDGES = [
    { t: "I think", re: /\bI think\b/gi, authority: true },
    { t: "maybe", re: /\bmaybe\b/gi, authority: true },
    { t: "I'm sorry / sorry for", re: /\b(?:I'm|I am|so|really) sorry\b|\bsorry (?:for|about)\b/gi, authority: true },
    { t: "I guess", re: /\bI guess\b/gi, authority: true },
    { t: "kind of / sort of", re: /\b(?:kind|sort) of\b/gi, authority: true },
    { t: "basically", re: /\bbasically\b/gi },
    { t: "like", re: /\blike,/gi },
    { t: "you know", re: /\byou know\b/gi },
    { t: "um / uh", re: /\b(?:um+|uh+|erm)\b/gi }
  ];
  function countHedges(text, { social = false } = {}) {
    return HEDGES.filter((h) => !(social && h.authority))
      .map((h) => ({ t: h.t, n: (String(text).match(h.re) || []).length }))
      .filter((h) => h.n);
  }

  const Core = { Util, SRS, Errors, Mastery, Level, Streak, State, Bank, Nivel, Produce, Dictation, HEDGES, countHedges };
  root.E20_CORE = Core;
  if (typeof module !== "undefined" && module.exports) module.exports = Core;
})(typeof window !== "undefined" ? window : globalThis);
