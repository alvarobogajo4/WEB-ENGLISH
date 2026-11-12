/* =============================================================================
 * English 20 Minutes — Núcleo puro (sin DOM)
 * -----------------------------------------------------------------------------
 * Lógica testeable que no toca el DOM ni localStorage:
 *   Util       → fechas, escapado, formato
 *   SRS        → repetición espaciada SM-2 (calidad 0–5 por respuesta)
 *   Errors     → patrones de error recurrentes (aislado / emergente / crítico / superado)
 *   Mastery    → dominio en estrellas (0–5) por destreza o ámbito
 *   Level      → dificultad adaptativa (subir a C1 / consolidar en B2)
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
    VERSION: 3,
    fresh() {
      return {
        version: 3,
        streak: { current: 0, best: 0, lastDate: null },
        items: {},       // id → registro SM-2 (ver SRS)
        errors: {},      // patrón → registro de errores (ver Errors)
        sessions: [],    // { date, ts, level, score: { block: { ok, total } } }
        custom: [],      // banco personal: { id, en, es, example, created }
        settings: { tts: true, voice: "en-GB", level: "b2", lastExport: null }
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
        version: 3,
        errors,
        streak: {
          current: Math.max(0, Number(st.current) || 0),
          best: Math.max(0, Number(st.best) || 0),
          lastDate: typeof st.lastDate === "string" && DATE_RE.test(st.lastDate) ? st.lastDate : null
        },
        settings: { ...base.settings, ...(isObj(parsed.settings) ? parsed.settings : {}) },
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

    summary(state) {
      return {
        streak: state.streak.best || 0,
        sessions: state.sessions.length,
        words: state.custom.length,
        items: Object.keys(state.items).length
      };
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

  const Core = { Util, SRS, Errors, Mastery, Level, Streak, State, HEDGES, countHedges };
  root.E20_CORE = Core;
  if (typeof module !== "undefined" && module.exports) module.exports = Core;
})(typeof window !== "undefined" ? window : globalThis);
