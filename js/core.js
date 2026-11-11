/* =============================================================================
 * English 20 Minutes — Núcleo puro (sin DOM)
 * -----------------------------------------------------------------------------
 * Lógica testeable que no toca el DOM ni localStorage:
 *   Util       → fechas, escapado, formato
 *   SRS        → repetición espaciada Leitner (5 cajas)
 *   Streak     → racha diaria
 *   State      → estado inicial, normalización y validación de importaciones
 *   Hedges     → detección de muletillas que restan autoridad
 * Se expone en window.E20_CORE (navegador) y en module.exports (tests con Node).
 * ========================================================================== */
(function (root) {
  "use strict";

  /* ------------------------------------------------------------------ Util */
  const Util = {
    today(d = new Date()) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
  const SRS = {
    // Días hasta la siguiente revisión según la caja (1..5).
    INTERVAL: { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 },
    MASTERED_BOX: 4,

    blank() { return { box: 1, seen: 0, correct: 0, lastSeen: null }; },

    isDue(rec, today) {
      return !rec || !rec.lastSeen || Util.daysBetween(rec.lastSeen, today) >= SRS.INTERVAL[rec.box];
    },

    /* Nuevo registro tras una respuesta. Solo sube de caja si el repaso tocaba:
     * acertar un ítem antes de tiempo (2.ª sesión del día, refuerzos) suma al
     * historial pero no adelanta el calendario ni infla "dominados". */
    nextRecord(rec, correct, today) {
      const r = { ...SRS.blank(), ...(rec || {}) };
      const due = SRS.isDue(r, today);
      r.seen += 1;
      if (correct) {
        r.correct += 1;
        if (due) { r.box = Math.min(5, r.box + 1); r.lastSeen = today; }
      } else {
        r.box = 1;
        r.lastSeen = today;
      }
      return r;
    },

    /* Elige n ítems: repasos pendientes (máx. 60 %), nuevos, resto de pendientes
     * y, si !onlyDue, relleno con los no pendientes de caja más baja. */
    pickFrom(list, n, items, today, onlyDue = false, rnd = Math.random) {
      if (n <= 0 || !list.length) return [];
      const due = [], fresh = [], rest = [];
      for (const it of list) {
        const rec = items[it.id];
        if (!rec) fresh.push(it);
        else if (SRS.isDue(rec, today)) due.push(it);
        else rest.push(it);
      }
      due.sort((a, b) => items[a.id].box - items[b.id].box || ((items[a.id].lastSeen || "") < (items[b.id].lastSeen || "") ? -1 : 1));
      const maxDue = Math.max(1, Math.ceil(n * 0.6));
      const picked = due.slice(0, maxDue);
      for (const it of Util.shuffle(fresh, rnd)) { if (picked.length >= n) break; picked.push(it); }
      for (const it of due.slice(maxDue)) { if (picked.length >= n) break; picked.push(it); }
      if (!onlyDue) {
        rest.sort((a, b) => items[a.id].box - items[b.id].box);
        for (const it of rest) { if (picked.length >= n) break; picked.push(it); }
      }
      return picked.slice(0, n);
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
  const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  const State = {
    VERSION: 2,
    fresh() {
      return {
        version: 2,
        streak: { current: 0, best: 0, lastDate: null },
        items: {},       // id → { box, seen, correct, lastSeen }
        sessions: [],    // { date, ts, level, score: { block: { ok, total } } }
        custom: [],      // banco personal: { id, en, es, example, created }
        settings: { tts: true, voice: "en-GB", level: "b2", lastExport: null }
      };
    },

    /* Mezcla un estado leído (de localStorage o de un archivo) con el estado
     * inicial, descartando piezas con forma incorrecta en vez de fallar. */
    normalize(parsed) {
      if (!isObj(parsed)) throw new Error("El progreso no tiene el formato esperado.");
      const base = State.fresh();
      const items = {};
      if (isObj(parsed.items)) {
        for (const [id, r] of Object.entries(parsed.items)) {
          if (!isObj(r)) continue;
          const box = Number(r.box);
          items[id] = {
            box: box >= 1 && box <= 5 ? Math.round(box) : 1,
            seen: Math.max(0, Number(r.seen) || 0),
            correct: Math.max(0, Number(r.correct) || 0),
            lastSeen: typeof r.lastSeen === "string" && DATE_RE.test(r.lastSeen) ? r.lastSeen : null
          };
        }
      }
      const st = isObj(parsed.streak) ? parsed.streak : {};
      return {
        ...base,
        version: 2,
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
   * disculpa innecesaria ("I'm sorry", "sorry for/about"). */
  const HEDGES = [
    { t: "I think", re: /\bI think\b/gi },
    { t: "maybe", re: /\bmaybe\b/gi },
    { t: "I'm sorry / sorry for", re: /\b(?:I'm|I am|so|really) sorry\b|\bsorry (?:for|about)\b/gi },
    { t: "I guess", re: /\bI guess\b/gi },
    { t: "kind of / sort of", re: /\b(?:kind|sort) of\b/gi },
    { t: "basically", re: /\bbasically\b/gi },
    { t: "like", re: /\blike,/gi },
    { t: "you know", re: /\byou know\b/gi },
    { t: "um / uh", re: /\b(?:um+|uh+|erm)\b/gi }
  ];
  function countHedges(text) {
    return HEDGES.map((h) => ({ t: h.t, n: (String(text).match(h.re) || []).length })).filter((h) => h.n);
  }

  const Core = { Util, SRS, Streak, State, HEDGES, countHedges };
  root.E20_CORE = Core;
  if (typeof module !== "undefined" && module.exports) module.exports = Core;
})(typeof window !== "undefined" ? window : globalThis);
