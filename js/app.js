/* =============================================================================
 * English 20 Minutes — Lógica de la aplicación
 * -----------------------------------------------------------------------------
 * Módulos (IIFE, sin dependencias):
 *   Util      → helpers de fechas, DOM, aleatoriedad
 *   Store     → persistencia en localStorage (versionada, tolerante a fallos)
 *   Content   → acceso a pools de contenido (incluido el banco personal)
 *   SRS       → repetición espaciada SM-2 por id de ítem + registro de patrones de error
 *   Stats     → agregados para el panel (precisión, estrellas, errores recurrentes, nivel)
 *   Speech    → síntesis de voz (pronunciación y audios de listening, voz por hablante)
 *   Voice     → dictado (reconocimiento de voz) para el bloque de producción
 *   Session   → motor de la sesión de 20 min (4 bloques × 5 min)
 *   Views     → render de pantallas (home, sesión, resumen)
 *   App       → arranque, delegación de eventos, atajos de teclado
 * ========================================================================== */
(function () {
  "use strict";

  const D = window.E20_DATA;
  const C = window.E20_CORE;
  if (!D || !C) { document.getElementById("app").textContent = `Error: no se pudo cargar ${!D ? "data_c1.js" : "core.js"}`; return; }

  const BLOCK_ORDER = ["vocab", "grammar", "listening", "challenges"];
  const BLOCK_SECONDS = 300;
  const CUSTOM_PER_SESSION = 2;
  const ERRORS_PER_BLOCK = 6; // ítems por bloque en el repaso de errores
  const ERROR_BLOCKS = ["vocab", "grammar"]; // bloques rápidos donde se repasan los patrones
  const OPTION_KINDS = ["register", "gap", "move", "trap"];
  const POOL_KIND = {
    registerUpgrade: "register", collocations: "gap", hrVocab: "gap", everydayVocab: "gap", grammar: "gap",
    meetingMoves: "move", conversation: "move", traps: "trap", listening: "listen", challenges: "challenge", custom: "card"
  };
  const VOCAB_TYPE = { phrasal: "Phrasal verb", idiom: "Expresión", collocation: "Colocación", word: "Palabra" };
  const ERROR_STATUS = {
    critical: { label: "Crítico", cls: "bg-rose-500/15 text-rose-300" },
    emerging: { label: "Emergente", cls: "bg-amber-400/15 text-amber-300" },
    resolved: { label: "Superado", cls: "bg-emerald-500/15 text-emerald-300" }
  };
  /* Registro de la versión "buena" en registerUpgrade. */
  const TONE = {
    natural:  { label: "Natural", cls: "bg-emerald-500/10 text-emerald-300", note: "" },
    formal:   { label: "Formal", cls: "bg-sky-500/10 text-sky-300", note: "Registro formal: perfecto para un informe o un comité; en una charla con tu equipo puedes decirlo más sencillo." },
    buzzword: { label: "Jerga corporativa", cls: "bg-amber-400/10 text-amber-300", note: "Jerga corporativa: entiéndela y úsala con moderación. Con un jefe australiano, el inglés claro y directo suele causar mejor impresión." }
  };
  const PRIVACY_NOTE = "El dictado lo procesa tu navegador en servidores externos (Google, Microsoft o Apple): no dictes datos reales ni confidenciales de la empresa.";

  /* Clases Tailwind completas (el CDN las detecta en el DOM en tiempo de ejecución). */
  const ACCENT = {
    amber:   { text: "text-amber-400",   bg: "bg-amber-400",   soft: "bg-amber-400/10",   border: "border-amber-400/40" },
    sky:     { text: "text-sky-400",     bg: "bg-sky-400",     soft: "bg-sky-400/10",     border: "border-sky-400/40" },
    violet:  { text: "text-violet-400",  bg: "bg-violet-400",  soft: "bg-violet-400/10",  border: "border-violet-400/40" },
    emerald: { text: "text-emerald-400", bg: "bg-emerald-400", soft: "bg-emerald-400/10", border: "border-emerald-400/40" }
  };
  const accentOf = (block) => ACCENT[D.BLOCK_META[block].accent];

  /* ------------------------------------------------------------------ Util */
  const Util = C.Util;

  /* ----------------------------------------------------------------- Store */
  const Store = (() => {
    const KEY = "e20_c1_v1"; // se mantiene la clave para conservar el progreso existente
    let state = C.State.fresh();
    let persistent = true;
    let recoveredKey = null; // clave de la copia del progreso ilegible, si la hubo

    function load() {
      let raw = null;
      try { raw = localStorage.getItem(KEY); }
      catch (e) { persistent = false; return; } // almacenamiento bloqueado (modo privado…)
      if (!raw) return;
      try { state = C.State.normalize(JSON.parse(raw)); }
      catch (e) {
        // No sobrescribimos a ciegas: se guarda una copia del contenido ilegible.
        state = C.State.fresh();
        try {
          // Reutiliza la copia si ya existe (evita duplicarla en cada recarga).
          const prefix = `${KEY}_corrupt_`;
          recoveredKey = Object.keys(localStorage).find((k) => k.startsWith(prefix) && localStorage.getItem(k) === raw) || null;
          if (!recoveredKey) { recoveredKey = prefix + Date.now(); localStorage.setItem(recoveredKey, raw); }
        } catch (_) { recoveredKey = "(no se pudo guardar copia)"; }
      }
    }
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(state)); persistent = true; }
      catch (e) { persistent = false; }
    }
    function reset() { state = C.State.fresh(); save(); }
    function replace(next) { state = next; recoveredKey = null; save(); }
    function dismissRecovered() { recoveredKey = null; }

    /* Pide al navegador que no borre los datos por falta de espacio o inactividad. */
    function requestPersist() {
      try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (_) {}
    }

    return {
      load, save, reset, replace, dismissRecovered, requestPersist,
      get state() { return state; }, get persistent() { return persistent; }, get recoveredKey() { return recoveredKey; }
    };
  })();

  /* --------------------------------------------------------------- Content */
  const Content = {
    pool(name) {
      if (name === "custom") return Store.state.custom.map((w) => ({ ...w, domain: "mine", level: "b2" }));
      return D.BLOCKS[name] || [];
    },
    levelOf(it, pool) { return it.level || D.POOL_DEFAULT_LEVEL[pool]; },
    /* Patrón de error al que pertenece un ítem: { key, label }. La clave es estable
     * (se guarda en el progreso); la etiqueta es la que se muestra. */
    patternOf(pool, it) {
      switch (pool) {
        case "grammar": return { key: `g:${it.topic}`, label: `Gramática · ${it.topic}` };
        case "traps": return { key: `t:${it.category}`, label: `Trampa · ${D.TRAP_CATEGORIES[it.category] || it.category}` };
        case "meetingMoves":
        case "conversation": return { key: `f:${it.fn}`, label: `${pool === "meetingMoves" ? "Reunión" : "Conversación"} · ${D.MOVE_FUNCTIONS[it.fn] || it.fn}` };
        case "everydayVocab":
        case "collocations":
        case "hrVocab": {
          const t = it.type || pool;
          return { key: `v:${t}`, label: `Vocabulario · ${t === "HR term" ? "Términos de HR" : VOCAB_TYPE[t] || D.POOL_LABEL[pool]}` };
        }
        case "registerUpgrade": return { key: `r:${it.tone || "c1"}`, label: `Registro C1 · ${TONE[it.tone] ? TONE[it.tone].label : "General"}` };
        case "listening": {
          const counts = {};
          for (const l of it.lines) counts[l.who] = (counts[l.who] || 0) + 1;
          const who = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
          const sp = D.SPEAKERS[who];
          return { key: `l:${who}`, label: `Listening · ${sp ? `${sp.name} (${sp.lang.slice(3)})` : who}` };
        }
        case "challenges": return it.context === "social"
          ? { key: "c:social", label: "Producción · Conversación social" }
          : { key: "c:work", label: "Producción · Trabajo" };
        case "custom": return { key: "u:bank", label: "Mi banco de vocabulario" };
        default: return { key: `p:${pool}`, label: D.POOL_LABEL[pool] || pool };
      }
    },
    /* id → { pool, block, domain } de todo el contenido, incluido el banco personal. */
    index() {
      const map = {};
      for (const pool of Object.keys(D.POOL_BLOCK)) {
        for (const it of this.pool(pool)) map[it.id] = { pool, block: D.POOL_BLOCK[pool], domain: it.domain };
      }
      return map;
    },
    addWord(en, es, example) {
      en = en.trim(); es = es.trim(); example = (example || "").trim();
      if (!en || !es) return false;
      const dup = Store.state.custom.find((w) => w.en.toLowerCase() === en.toLowerCase());
      if (dup) return false;
      Store.state.custom.push({ id: `U-${Date.now().toString(36)}`, en, es, example, created: Util.today() });
      Store.save();
      return true;
    },
    removeWord(id) {
      Store.state.custom = Store.state.custom.filter((w) => w.id !== id);
      delete Store.state.items[id];
      Store.save();
    }
  };

  /* ------------------------------------------------------------------- SRS */
  const SRS = {
    isDue(rec, today) { return C.SRS.isDue(rec, today); },

    /* Elige n ítems de una lista: repasos pendientes + nuevos (+ relleno si no onlyDue).
     * prefer(it) → true adelanta los ítems de patrones de error activos. */
    pickFrom(list, n, onlyDue = false, prefer = null) {
      return C.SRS.pickFrom(list, n, Store.state.items, Util.today(), onlyDue, Math.random, prefer);
    },

    /* En nivel B2 se priorizan los ítems B2; los C1 solo entran si faltan. */
    pick(pool, n, level, onlyDue = false, weak = null) {
      const all = Content.pool(pool);
      const prefer = weak && weak.size ? (it) => weak.has(Content.patternOf(pool, it).key) : null;
      if (level === "c1") return this.pickFrom(all, n, onlyDue, prefer);
      const pref = all.filter((it) => Content.levelOf(it, pool) === "b2");
      const others = all.filter((it) => Content.levelOf(it, pool) !== "b2");
      const out = this.pickFrom(pref, n, onlyDue, prefer);
      if (out.length < n) out.push(...this.pickFrom(others, n - out.length, onlyDue, prefer));
      return out;
    },

    /* Patrones activos (críticos y emergentes) como conjunto de claves. */
    weakKeys() { return new Set(C.Errors.ranked(Store.state.errors, Util.today()).map((x) => x.key)); },

    /* Registra una respuesta con su calidad SM-2 (0–5) y actualiza su patrón de error.
     * example = { given, expected } para guardar "tu respuesta → la correcta" si falla. */
    record(entry, q, example = null) {
      const s = Store.state, today = Util.today(), { pool, it } = entry;
      s.items[it.id] = C.SRS.nextRecord(s.items[it.id], q, today);
      const pat = Content.patternOf(pool, it);
      s.errors = C.Errors.record(s.errors, pat.key, pat.label, C.SRS.isCorrect(q), today, example ? { id: it.id, ...example } : null);
      Store.save();
    },

    dueCustomCount() {
      const today = Util.today();
      return Store.state.custom.filter((w) => { const r = Store.state.items[w.id]; return !r || this.isDue(r, today); }).length;
    }
  };

  /* ----------------------------------------------------------------- Stats */
  const Stats = {
    streak() { return C.Streak.view(Store.state.streak, Util.today()); },

    registerSessionDay() { Store.state.streak = C.Streak.register(Store.state.streak, Util.today()); },

    aggregate() {
      const index = Content.index();
      const byBlock = {}, byDomain = {};
      BLOCK_ORDER.forEach((k) => (byBlock[k] = { ok: 0, total: 0, mastered: 0, size: 0 }));
      Object.keys(D.DOMAINS).forEach((k) => (byDomain[k] = { ok: 0, total: 0, mastered: 0, size: 0 }));
      for (const meta of Object.values(index)) {
        byBlock[meta.block].size++;
        if (byDomain[meta.domain]) byDomain[meta.domain].size++;
      }
      let mastered = 0;
      for (const [id, rec] of Object.entries(Store.state.items)) {
        const meta = index[id];
        if (!meta) continue; // ítem eliminado
        const dom = byDomain[meta.domain];
        byBlock[meta.block].ok += rec.correct; byBlock[meta.block].total += rec.seen;
        if (dom) { dom.ok += rec.correct; dom.total += rec.seen; }
        if (C.SRS.isMastered(rec)) { mastered++; byBlock[meta.block].mastered++; if (dom) dom.mastered++; }
      }
      for (const v of [...Object.values(byBlock), ...Object.values(byDomain)]) v.stars = C.Mastery.stars(v);
      return { byBlock, byDomain, mastered, totalItems: Object.keys(index).length };
    },

    /* Patrones de error activos, los peores primero. */
    recurringErrors() { return C.Errors.ranked(Store.state.errors, Util.today()); },

    weakestDomain(byDomain) {
      let worst = null;
      for (const [k, v] of Object.entries(byDomain)) {
        if (v.total < 3) continue;
        const p = v.ok / v.total;
        if (!worst || p < worst.p) worst = { key: k, p };
      }
      return worst;
    },

    sessionPct(ses) { return C.Level.sessionPct(ses); },

    /* "up": 5 sesiones B2 ≥ 85 % · "down": 3 sesiones C1 < 60 % · null. */
    levelAdvice() { return C.Level.advice(Store.state.sessions, Store.state.settings.level); }
  };

  /* ---------------------------------------------------------------- Speech */
  const Speech = {
    supported: "speechSynthesis" in window,
    voices: [],
    playing: false,
    token: 0,
    keep: [], // referencia a las utterances (evita que el GC corte el audio en Chrome)

    init() {
      if (!this.supported) return;
      const load = () => { this.voices = speechSynthesis.getVoices(); };
      load();
      speechSynthesis.onvoiceschanged = () => { load(); if (App.view === "session") Views.updateListenUI(); };
    },
    norm(l) { return (l || "").replace("_", "-").toLowerCase(); },
    voiceFor(lang) {
      const L = this.norm(lang);
      const matches = this.voices.filter((v) => this.norm(v.lang) === L);
      return matches.find((v) => /natural|online|neural/i.test(v.name)) || matches[0] || null;
    },
    hasVoice(lang) { return !!this.voiceFor(lang); },

    utter(text, lang, rate) {
      const u = new SpeechSynthesisUtterance(text);
      const v = this.voiceFor(lang) || this.voiceFor(Store.state.settings.voice) || this.voiceFor("en-GB") || this.voiceFor("en-US");
      u.lang = v ? v.lang : lang;
      if (v) u.voice = v;
      u.rate = rate;
      return u;
    },

    /* Lectura puntual. `auto` = disparada por la app (respeta el ajuste de pronunciación automática). */
    say(text, { lang, rate = 0.95, auto = false } = {}) {
      if (!this.supported || (auto && !Store.state.settings.tts)) return;
      this.stop();
      const u = this.utter(text, lang || Store.state.settings.voice, rate);
      this.keep = [u];
      speechSynthesis.speak(u);
    },

    /* Reproduce un diálogo: cada línea con la voz de su hablante. */
    playLines(lines, rate, onDone) {
      if (!this.supported) return;
      this.stop();
      const token = ++this.token;
      this.playing = true;
      const us = lines.map((l) => this.utter(l.text, (D.SPEAKERS[l.who] || {}).lang || "en-GB", rate));
      const done = () => { if (token !== this.token) return; this.playing = false; if (onDone) onDone(); };
      const last = us[us.length - 1];
      last.onend = done; last.onerror = done;
      this.keep = us;
      us.forEach((u) => speechSynthesis.speak(u));
    },

    stop() {
      if (!this.supported) return;
      this.token++;
      this.playing = false;
      speechSynthesis.cancel();
    }
  };

  /* ----------------------------------------------------------------- Voice */
  /* Dictado para el bloque de producción con la Web Speech API (Chrome, Edge, Safari).
   * - El texto reconocido se añade a lo ya escrito y luego se puede editar.
   * - Chrome corta tras unos segundos de silencio: si el usuario no ha pulsado
   *   "Detener", se reinicia solo para permitir respuestas de 60–90 s.
   * - Mide tiempo hablado y palabras dictadas para calcular el ritmo (wpm). */
  const Voice = {
    Rec: window.SpeechRecognition || window.webkitSpeechRecognition || null,
    get supported() { return !!this.Rec; },
    rec: null, active: false, wanted: false, target: null,
    base: "", sessionFinal: "", sessionWords: 0, startedAt: 0, error: null, onFinish: null,

    ERRORS: {
      "not-allowed": "Permiso de micrófono denegado. Actívalo en el icono del candado de la barra de direcciones.",
      "service-not-allowed": "El navegador no permite el dictado en esta página.",
      "audio-capture": "No se detecta ningún micrófono.",
      network: "El dictado necesita conexión a internet en este navegador.",
      "language-not-supported": "Tu navegador no admite dictado en este acento. Prueba a cambiarlo en el panel."
    },

    join(...parts) { return parts.map((p) => (p || "").trim()).filter(Boolean).join(" "); },

    liveMs() {
      const c = Session.s && Session.s.current;
      const base = c && c.voice ? c.voice.ms : 0;
      return base + (this.active ? Date.now() - this.startedAt : 0);
    },

    toggle() { this.active ? this.stop() : this.start(); },

    start() {
      if (!this.supported || this.active || !Session.s) return;
      const c = Session.s.current;
      if (!c || !c.voice || c.evaluated) return;
      Speech.stop(); // que la voz de la app no se transcriba
      this.error = null;
      this.target = c;
      this.base = c.text;
      this.sessionFinal = "";
      this.sessionWords = 0;

      const rec = new this.Rec();
      rec.lang = Store.state.settings.voice;
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onresult = (e) => {
        if (!this.isCurrent()) return;
        let fin = "", inter = "";
        for (let i = 0; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) fin += " " + r[0].transcript; else inter += " " + r[0].transcript;
        }
        this.sessionFinal = fin;
        this.setText(this.join(this.base, fin, inter));
      };
      rec.onerror = (e) => {
        if (e.error === "no-speech" || e.error === "aborted") return;
        this.error = this.ERRORS[e.error] || `Error de reconocimiento (${e.error}).`;
        this.wanted = false;
      };
      rec.onend = () => {
        this.sessionWords += Util.words(this.sessionFinal);
        this.base = this.join(this.base, this.sessionFinal);
        this.sessionFinal = "";
        if (this.isCurrent()) this.setText(this.base);
        if (this.wanted) { try { rec.start(); return; } catch (_) { /* cae a finish */ } }
        this.finish();
      };

      this.rec = rec;
      this.wanted = true;
      this.active = true;
      this.startedAt = Date.now();
      try { rec.start(); }
      catch (_) { this.error = "No se pudo iniciar el micrófono."; this.finish(); return; }
      Views.updateVoiceUI();
    },

    /* Detiene y espera al último resultado final (onend) antes de llamar a `cb`. */
    stop(cb) {
      if (!this.active) { if (cb) cb(); return; }
      this.wanted = false;
      this.onFinish = cb || null;
      try { this.rec.stop(); } catch (_) { this.finish(); return; }
      setTimeout(() => this.finish(), 1500); // red de seguridad si onend no llega
    },

    finish() {
      if (!this.active) return;
      this.active = false;
      if (this.target && this.target.voice) {
        this.target.voice.ms += Date.now() - this.startedAt;
        this.target.voice.words += this.sessionWords;
      }
      this.sessionWords = 0;
      const cb = this.onFinish;
      this.onFinish = null;
      Views.updateVoiceUI();
      if (cb) cb();
    },

    cancel() {
      this.wanted = false;
      this.onFinish = null;
      if (this.rec) { this.rec.onresult = this.rec.onend = this.rec.onerror = null; try { this.rec.abort(); } catch (_) {} }
      this.active = false;
      this.target = null;
    },

    isCurrent() { return !!(Session.s && Session.s.current === this.target); },

    setText(text) {
      const c = this.target;
      c.text = text;
      const ta = document.getElementById("challenge-text");
      if (ta) { ta.value = text; ta.scrollTop = ta.scrollHeight; }
      if (!c.evaluated) Views.updateChallengeLive();
    }
  };

  /* --------------------------------------------------------------- Session */
  const Session = {
    s: null,
    timerId: null,

    /* mode: "full" (sesión diaria) · "drill" (un bloque) · "errors" (repaso de patrones activos). */
    start(mode, onlyBlock) {
      Speech.stop();
      const level = Store.state.settings.level;
      const mix = D.SESSION_MIX[level];
      const weak = SRS.weakKeys();
      let queue = {};
      if (mode === "errors") queue = this.errorQueue(weak);
      else {
        const blocks = mode === "full" ? BLOCK_ORDER.slice() : [onlyBlock];
        for (const k of blocks) {
          let entries = [];
          for (const [pool, n] of Object.entries(mix[k])) {
            const count = mode === "full" ? n : Math.ceil(n * 1.5);
            entries.push(...SRS.pick(pool, count, level, false, weak).map((it) => ({ pool, kind: POOL_KIND[pool], it })));
          }
          if (k === "vocab") {
            entries.push(...SRS.pick("custom", CUSTOM_PER_SESSION, level, true).map((it) => ({ pool: "custom", kind: "card", it })));
          }
          queue[k] = k === "listening" || k === "challenges" ? entries : Util.shuffle(entries);
        }
      }
      const usable = Object.keys(queue).filter((k) => queue[k].length);
      if (!usable.length) { App.go("home"); return; }
      this.s = {
        mode, level, blocks: usable, queue,
        statusBefore: C.Errors.statuses(Store.state.errors, Util.today()),
        blockIdx: 0, itemIdx: 0,
        results: Object.fromEntries(usable.map((k) => [k, { ok: 0, total: 0 }])),
        misses: [],
        phase: "intro",        // intro | item | blockDone
        answered: false,
        current: null,
        blockStartedAt: null,
        pausedAt: null,
        startedAt: Date.now()
      };
      this.prepareItem();
      App.view = "session";
      Views.render();
    },

    /* Repaso de errores: ítems de los patrones activos en los bloques rápidos
     * (vocabulario y gramática), ordenados por el calendario SM-2. */
    errorQueue(weak = SRS.weakKeys()) {
      const queue = {};
      if (!weak.size) return queue;
      for (const k of ERROR_BLOCKS) {
        const entries = [];
        for (const pool of Object.keys(D.POOL_BLOCK)) {
          if (D.POOL_BLOCK[pool] !== k) continue;
          for (const it of Content.pool(pool)) if (weak.has(Content.patternOf(pool, it).key)) entries.push({ pool, kind: POOL_KIND[pool], it });
        }
        const byId = new Map(entries.map((e) => [e.it.id, e]));
        const picked = SRS.pickFrom(entries.map((e) => e.it), ERRORS_PER_BLOCK);
        queue[k] = Util.shuffle(picked.map((it) => byId.get(it.id)));
      }
      return queue;
    },
    errorQueueSize() { return Object.values(this.errorQueue()).reduce((n, es) => n + es.length, 0); },

    /* ---- Persistencia de la sesión en curso (sobrevive a una recarga) ----
     * Se guarda en sessionStorage referenciando los ítems por pool + id. */
    SNAP_KEY: "e20_session",
    persist() {
      const s = this.s;
      if (!s) return;
      const ref = (e) => ({ pool: e.pool, kind: e.kind, id: e.it.id });
      const snap = {
        ...s,
        queue: Object.fromEntries(Object.entries(s.queue).map(([k, es]) => [k, es.map(ref)])),
        misses: s.misses.map(ref),
        savedAt: Date.now(),
        day: Util.today()
      };
      try { sessionStorage.setItem(this.SNAP_KEY, JSON.stringify(snap)); } catch (_) { /* opcional */ }
    },
    clearSnapshot() { try { sessionStorage.removeItem(this.SNAP_KEY); } catch (_) { /* opcional */ } },
    restore() {
      let snap = null;
      try { snap = JSON.parse(sessionStorage.getItem(this.SNAP_KEY) || "null"); } catch (_) { snap = null; }
      if (!snap || snap.day !== Util.today() || !snap.queue) { this.clearSnapshot(); return false; }
      const find = (r) => {
        const it = Content.pool(r.pool).find((x) => x.id === r.id);
        return it ? { pool: r.pool, kind: r.kind, it } : null;
      };
      const queue = {};
      for (const [k, refs] of Object.entries(snap.queue)) {
        const es = refs.map(find);
        if (es.some((e) => !e)) { this.clearSnapshot(); return false; } // el contenido cambió
        queue[k] = es;
      }
      const away = Math.max(0, Date.now() - snap.savedAt); // el tiempo fuera no cuenta
      const { savedAt, day, ...rest } = snap;
      this.s = { ...rest, queue, misses: (snap.misses || []).map(find).filter(Boolean), pausedAt: null };
      if (this.s.blockStartedAt) this.s.blockStartedAt += away;
      this.s.startedAt += away;
      if (this.s.phase === "item") this.startTimer();
      return true;
    },

    /* ---- Pausa del reloj cuando la pestaña no está visible ---- */
    pause() {
      const s = this.s;
      if (!s) return;
      if (Voice.active) Voice.stop();
      if (s.phase === "item" && !s.pausedAt) s.pausedAt = Date.now();
      this.persist();
    },
    resume() {
      const s = this.s;
      if (!s || !s.pausedAt) return;
      const d = Date.now() - s.pausedAt;
      if (s.blockStartedAt) s.blockStartedAt += d;
      s.startedAt += d;
      s.pausedAt = null;
      Views.updateTimer();
    },

    /* Salir pide confirmación si ya hay algo hecho. */
    hasProgress() { const s = this.s; return !!s && (s.blockIdx > 0 || s.phase !== "intro"); },
    requestExit() { if (this.hasProgress()) Views.showExitAsk(); else this.abort(); },

    get blockKey() { return this.s.blocks[this.s.blockIdx]; },
    get entry() { return this.s.queue[this.blockKey][this.s.itemIdx]; },
    get item() { return this.entry.it; },
    get kind() { return this.entry.kind; },
    get blockLength() { return this.s.queue[this.blockKey].length; },

    prepareItem() {
      const { kind, it } = this.entry;
      const c = { selected: null };
      if (kind === "register")  c.options = Util.shuffle([it.c1, ...it.distractors]);
      if (kind === "gap")       c.options = Util.shuffle(it.options);
      if (kind === "move")      c.options = Util.shuffle([it.answer, ...it.distractors]);
      if (kind === "trap")      c.options = Util.shuffle([it.right, it.wrong, it.alt]);
      if (kind === "challenge") Object.assign(c, { text: "", evaluated: false, checks: it.selfCheck.map(() => false), voice: { ms: 0, words: 0 } });
      if (kind === "listen")    Object.assign(c, { answers: it.questions.map(() => null), plays: 0, rate: 1 });
      if (kind === "card")      Object.assign(c, { revealed: false, attempt: "" });
      this.s.current = c;
      this.s.answered = false;
    },

    correctOption() {
      const { kind, it } = this.entry;
      return { register: it.c1, gap: it.answer, move: it.answer, trap: it.right }[kind];
    },

    beginBlock() {
      this.s.phase = "item";
      this.s.blockStartedAt = Date.now();
      this.startTimer();
      Views.render();
    },

    startTimer() { this.stopTimer(); this.timerId = setInterval(() => Views.updateTimer(), 1000); },
    stopTimer() { if (this.timerId) clearInterval(this.timerId); this.timerId = null; },
    remaining() {
      if (!this.s || !this.s.blockStartedAt) return BLOCK_SECONDS;
      const now = this.s.pausedAt || Date.now();
      return BLOCK_SECONDS - Math.floor((now - this.s.blockStartedAt) / 1000);
    },

    /* Respuesta en ítems de opción múltiple. */
    choose(optIdx) {
      const s = this.s;
      if (s.phase !== "item" || s.answered || !OPTION_KINDS.includes(this.kind)) return;
      const choice = s.current.options[optIdx];
      if (choice === undefined) return;
      const correct = this.correctOption();
      const ok = choice === correct;
      s.current.selected = optIdx;
      s.answered = true;
      this.score(ok, ok ? 4 : 1, { given: choice, expected: correct });
      if (ok) {
        const it = this.item;
        Speech.say(this.kind === "gap" ? it.sentence.replace("___", it.answer) : choice, { auto: true });
      }
      Views.render();
    },

    /* ok: cuenta para la puntuación de la sesión · q: calidad SM-2 (0–5). */
    score(ok, q = ok ? 4 : 1, example = null) {
      const s = this.s, k = this.blockKey;
      s.results[k].total += 1;
      if (ok) s.results[k].ok += 1;
      else s.misses.push(this.entry);
      SRS.record(this.entry, q, example);
    },

    /* Listening: cada pregunta puntúa; el audio cuenta como acertado con ≥ 2/3. */
    answerListening(q, idx) {
      const s = this.s, c = s.current, it = this.item;
      if (s.answered || this.kind !== "listen" || c.answers[q] !== null) return;
      c.answers[q] = idx;
      s.results[this.blockKey].total += 1;
      if (idx === it.questions[q].answer) s.results[this.blockKey].ok += 1;
      if (c.answers.every((a) => a !== null)) {
        const okCount = c.answers.filter((a, i) => a === it.questions[i].answer).length;
        s.answered = true;
        Speech.stop();
        if (okCount < it.questions.length) s.misses.push(this.entry);
        // Todo bien → 4 · al menos 2/3 → 3 (con dudas) · menos → fallo.
        const q = okCount === it.questions.length ? 4 : okCount >= Math.ceil((it.questions.length * 2) / 3) ? 3 : 1;
        SRS.record(this.entry, q, q < 3 ? { given: `${okCount} de ${it.questions.length} preguntas`, expected: `Audio «${it.title}»` } : null);
      }
      Views.render();
    },

    playListening() {
      const c = this.s.current;
      if (Speech.playing) { Speech.stop(); Views.updateListenUI(); return; }
      c.plays += 1;
      Speech.playLines(this.item.lines, c.rate, () => Views.updateListenUI());
      Views.updateListenUI();
    },

    setRate(rate) {
      this.s.current.rate = rate;
      if (Speech.playing) Speech.stop();
      Views.updateListenUI();
    },

    /* Tarjetas del banco personal (autoevaluadas). */
    revealCard() {
      const c = this.s.current;
      if (this.kind !== "card" || c.revealed) return;
      const ta = document.getElementById("card-attempt");
      if (ta) c.attempt = ta.value;
      c.revealed = true;
      Speech.say(this.item.en, { auto: true });
      Views.render();
    },
    /* Autoevaluación: 1 "No lo sabía" · 3 "Con dudas" · 5 "Lo sabía". */
    gradeCard(q) {
      if (this.kind !== "card" || !this.s.current.revealed || this.s.answered) return;
      this.s.answered = true;
      this.s.current.grade = q;
      this.score(q >= 3, q, { given: this.s.current.attempt.trim() || "(en blanco)", expected: this.item.en });
      Views.render();
    },

    challengeHits(text) {
      return this.item.mustUse.map((u) => new RegExp(u.m, "i").test(text));
    },

    evaluateChallenge() {
      const c = this.s.current;
      if (c.evaluated) return;
      Voice.stop(() => {
        if (Session.s && Session.s.current === c && !c.evaluated) { c.evaluated = true; Views.render(); }
      });
    },

    finishChallenge() {
      const c = this.s.current, it = this.item;
      if (this.s.answered) return;
      const hits = this.challengeHits(c.text).filter(Boolean).length / it.mustUse.length;
      const checks = c.checks.filter(Boolean).length / it.selfCheck.length;
      const score = hits * 0.5 + checks * 0.5;
      c.finalScore = Math.round(score * 100);
      this.s.answered = true;
      const q = score >= 0.85 ? 5 : score >= 0.7 ? 4 : score >= 0.6 ? 3 : score >= 0.3 ? 2 : 1;
      this.score(score >= 0.6, q, q < 3 ? { given: `${c.finalScore} % del reto`, expected: D.SCENARIOS[it.scenario] || it.brief } : null);
      Views.render();
    },

    next() {
      const s = this.s;
      if (s.phase === "intro") return this.beginBlock();
      if (s.phase === "blockDone") return this.nextBlock();
      if (!s.answered) return;
      Speech.stop();
      if (s.itemIdx + 1 < this.blockLength) {
        s.itemIdx += 1;
        this.prepareItem();
        Views.render();
      } else {
        this.stopTimer();
        s.phase = "blockDone";
        Views.render();
      }
    },

    nextBlock() {
      const s = this.s;
      if (s.blockIdx + 1 < s.blocks.length) {
        s.blockIdx += 1; s.itemIdx = 0; s.phase = "intro";
        this.prepareItem();
        Views.render();
      } else this.finish();
    },

    finish() {
      const s = this.s;
      this.stopTimer();
      Speech.stop();
      if (s.mode === "full") {
        Stats.registerSessionDay();
        Store.state.sessions.push({ date: Util.today(), ts: Date.now(), level: s.level, score: s.results });
        if (Store.state.sessions.length > 120) Store.state.sessions = Store.state.sessions.slice(-120);
        Store.save();
      }
      this.clearSnapshot();
      App.go("summary");
    },

    abort() {
      Voice.cancel();
      Speech.stop();
      this.stopTimer();
      this.s = null;
      this.clearSnapshot();
      App.go("home");
    }
  };

  /* ----------------------------------------------------------------- Views */
  const Views = {
    root: document.getElementById("app"),
    lastKey: null,

    render() {
      const v = App.view;
      this.exitAsk = false;
      this.root.innerHTML = v === "home" ? this.home() : v === "session" ? this.session() : this.summary();
      if (v === "session") { this.afterSessionRender(); Session.persist(); }
      // Solo vuelve arriba al cambiar de pantalla / ítem, no al responder dentro del mismo ítem.
      const s = Session.s;
      const key = v === "session" && s ? `${v}|${s.blockIdx}|${s.itemIdx}|${s.phase}` : v;
      if (key !== this.lastKey) window.scrollTo({ top: 0 });
      this.lastKey = key;
    },

    /* ---- piezas reutilizables ---- */
    speakBtn(text, label = "Escuchar", lang = "") {
      if (!Speech.supported) return "";
      return `<button type="button" data-action="speak" data-text="${Util.esc(text)}" data-lang="${lang}" class="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition" aria-label="${label}">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>${label}</button>`;
    },
    badge(text, cls = "bg-zinc-800 text-zinc-300") {
      return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${cls}">${Util.esc(text)}</span>`;
    },
    bar(p, colorCls) {
      const w = p === null ? 0 : p;
      return `<div class="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden"><div class="h-full rounded-full ${colorCls}" style="width:${w}%"></div></div>`;
    },
    highlight(text, chunks, cls = "text-amber-300 decoration-amber-400/50") {
      let html = Util.esc(text);
      for (const ch of chunks) {
        const re = new RegExp(`(${Util.escRe(Util.esc(ch))})`, "i");
        html = html.replace(re, `<mark class="bg-transparent font-semibold underline underline-offset-4 ${cls}">$1</mark>`);
      }
      return html;
    },
    /* Dominio en estrellas (0–5); null = aún sin datos suficientes. */
    stars(n) {
      if (n === null || n === undefined) return `<span class="text-[11px] text-zinc-600" title="Se calcula a partir de ${C.Mastery.MIN_ANSWERS} respuestas">sin datos</span>`;
      return `<span class="tracking-tight text-amber-400" role="img" aria-label="${n} de 5 estrellas" title="${n}/5 · precisión y contenido dominado">${"★".repeat(n)}<span class="text-zinc-700">${"★".repeat(5 - n)}</span></span>`;
    },
    statusBadge(status) { const st = ERROR_STATUS[status]; return st ? this.badge(st.label, st.cls) : ""; },
    levelBadge(it, pool) {
      const lv = Content.levelOf(it, pool);
      return this.badge(lv.toUpperCase(), lv === "c1" ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-400");
    },

    /* ---- HOME ---- */
    home() {
      const st = Stats.streak();
      const ag = Stats.aggregate();
      const weak = Stats.weakestDomain(ag.byDomain);
      const recent = Store.state.sessions.slice(-14);
      const sessionsTotal = Store.state.sessions.length;
      const level = Store.state.settings.level;

      const levelSwitch = `<div class="inline-flex rounded-lg border border-zinc-700 p-0.5 text-xs" role="group" aria-label="Nivel">
        ${["b2", "c1"].map((lv) => `<button data-action="level" data-level="${lv}" class="rounded-md px-3 py-1.5 font-semibold transition ${level === lv ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-100"}">${lv.toUpperCase()}</button>`).join("")}
      </div>`;

      const blockRows = BLOCK_ORDER.map((k) => {
        const m = D.BLOCK_META[k], a = accentOf(k), b = ag.byBlock[k];
        const p = Util.pct(b.ok, b.total);
        return `<div class="space-y-2">
          <div class="flex items-baseline justify-between gap-3">
            <div class="min-w-0"><span class="font-mono text-xs ${a.text}">B${m.n}</span> <span class="text-sm text-zinc-200">${m.title}</span></div>
            <div class="text-right shrink-0 flex items-baseline gap-2">${this.stars(b.stars)}<span class="text-sm font-semibold tabular-nums text-zinc-100">${p === null ? "—" : p + "%"}</span>
            <span class="text-xs text-zinc-500 tabular-nums">${b.mastered}/${b.size}</span></div>
          </div>${this.bar(p, a.bg)}</div>`;
      }).join("");

      const domainCells = Object.entries(D.DOMAINS).map(([k, d]) => {
        const v = ag.byDomain[k], p = Util.pct(v.ok, v.total);
        const tone = p === null ? "text-zinc-500" : p >= 80 ? "text-emerald-400" : p >= 60 ? "text-amber-400" : "text-rose-400";
        return `<div class="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5">
          <div class="text-[11px] uppercase tracking-wider text-zinc-500 truncate">${d.es}</div>
          <div class="mt-0.5 flex items-baseline justify-between gap-2"><span class="text-lg font-semibold tabular-nums ${tone}">${p === null ? "—" : p + "%"}</span>
          <span class="text-xs">${v.stars === null ? "" : this.stars(v.stars)}</span></div></div>`;
      }).join("");

      const recurring = Stats.recurringErrors();
      const errorDrillSize = recurring.length ? Session.errorQueueSize() : 0;
      const errorRows = recurring.slice(0, 5).map(({ p, status, active }) => {
        const ex = p.examples[0];
        return `<li class="py-3 border-b border-zinc-800/80 last:border-0">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-sm font-medium text-zinc-100">${Util.esc(p.label)}</span>
            <span class="flex items-center gap-2">${this.statusBadge(status)}<span class="text-xs text-zinc-500 tabular-nums">${Util.plural(active, "fallo", "fallos")} en ${C.Errors.WINDOW} días</span></span>
          </div>
          ${ex && ex.expected ? `<p class="mt-1 text-xs leading-relaxed"><span class="text-rose-300/80 line-through decoration-rose-400/40">${Util.esc(ex.given)}</span> <span class="text-zinc-600">→</span> <span class="text-zinc-300">${Util.esc(ex.expected)}</span></p>` : ""}
        </li>`;
      }).join("");
      const errorsCard = `<div class="rounded-2xl border ${recurring.some((x) => x.status === "critical") ? "border-rose-400/25" : "border-zinc-800"} bg-zinc-900/40 p-6">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="text-sm font-semibold text-zinc-200">Tus errores recurrentes</h2>
            <span class="text-xs text-zinc-500">2–3 fallos = emergente · 4 o más = crítico</span>
          </div>
          ${recurring.length
            ? `<ul class="mt-2">${errorRows}</ul>
               ${errorDrillSize ? `<button data-action="drill-errors" class="mt-4 rounded-lg bg-rose-300 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-rose-200 transition">Repasar mis errores · ${Util.plural(errorDrillSize, "ítem", "ítems")}</button>
               <p class="mt-2 text-xs text-zinc-500">Tus sesiones diarias ya dan prioridad a estos patrones. Un patrón queda superado con 3 aciertos seguidos, el último en un día posterior al último fallo.</p>` : ""}`
            : `<p class="mt-3 text-sm text-zinc-500">Aún no hay patrones. Cuando falles dos veces el mismo tipo de error (un falso amigo, una regla, una función de conversación), aparecerá aquí con tu respuesta y la correcta.</p>`}
        </div>`;

      const spark = recent.map((ses) => {
        const p = Stats.sessionPct(ses) || 0;
        return `<div class="flex-1 max-w-[28px] flex flex-col justify-end h-16" title="${ses.date}: ${p}%"><div class="rounded-sm bg-zinc-600 hover:bg-zinc-400 transition" style="height:${Math.max(6, p)}%"></div></div>`;
      }).join("");

      const drillBtns = BLOCK_ORDER.map((k) => {
        const m = D.BLOCK_META[k], a = accentOf(k);
        return `<button data-action="drill" data-block="${k}" class="group text-left rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-900 p-4 transition">
          <div class="flex items-center justify-between"><span class="font-mono text-xs ${a.text}">BLOQUE ${m.n}</span><span class="text-zinc-600 group-hover:text-zinc-300 transition">→</span></div>
          <div class="mt-1.5 text-sm font-medium text-zinc-100">${m.title}</div>
          <div class="mt-0.5 text-xs text-zinc-500 leading-snug">${m.subtitle}</div></button>`;
      }).join("");

      const words = Store.state.custom.slice().reverse();
      const dueWords = SRS.dueCustomCount();
      const wordList = words.length ? `<ul class="mt-4 max-h-64 overflow-y-auto divide-y divide-zinc-800/80 pr-1">${words.map((w) => {
        const rec = Store.state.items[w.id];
        return `<li class="flex items-start justify-between gap-3 py-2.5 text-sm">
          <div class="min-w-0"><span class="font-medium text-zinc-100">${Util.esc(w.en)}</span> <span class="text-zinc-500">— ${Util.esc(w.es)}</span>
          ${w.example ? `<div class="text-xs text-zinc-500 italic truncate">${Util.esc(w.example)}</div>` : ""}</div>
          <div class="flex items-center gap-3 shrink-0">${C.SRS.isMastered(rec) ? `<span class="text-[11px] text-emerald-400">dominada</span>` : ""}
          <button data-action="del-word" data-id="${w.id}" class="text-zinc-600 hover:text-rose-400 transition" aria-label="Eliminar ${Util.esc(w.en)}">✕</button></div></li>`;
      }).join("")}</ul>` : `<p class="mt-4 text-sm text-zinc-500">Aún no has añadido palabras. Cuando oigas en una reunión algo que no conoces, apúntalo aquí (también desde el móvil) y entrará en tus repasos.</p>`;

      const advice = Stats.levelAdvice();
      const c1Hint = advice === "up"
        ? `<div class="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 flex flex-wrap items-center justify-between gap-3">
            <span>Llevas 5 sesiones seguidas por encima del 85 % en B2. Estás listo para subir el nivel.</span>
            <button data-action="level" data-level="c1" class="rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-zinc-950">Pasar a C1</button></div>`
        : advice === "down"
        ? `<div class="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100 flex flex-wrap items-center justify-between gap-3">
            <span>Tus 3 últimas sesiones en C1 están por debajo del 60 %. Consolida unos días en B2: no es un paso atrás, es la zona en la que más se aprende (alrededor del 70–85 % de aciertos).</span>
            <button data-action="level" data-level="b2" class="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-zinc-950">Volver a B2</button></div>`
        : "";

      const recoveredBanner = Store.recoveredKey
        ? `<div role="alert" class="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 space-y-2">
            <p><strong>No se pudo leer tu progreso guardado</strong> porque estaba dañado. No lo hemos borrado: hay una copia en el navegador (<code class="font-mono text-xs">${Util.esc(Store.recoveredKey)}</code>) y la app ha empezado de cero. Si tienes un archivo de copia, impórtalo ahora.</p>
            <div class="flex gap-3"><button data-action="import" class="rounded-lg bg-rose-300 px-3 py-1.5 text-xs font-semibold text-zinc-950">Importar copia</button>
            <button data-action="dismiss-recovered" class="text-xs text-rose-200 hover:underline">Entendido</button></div></div>`
        : "";

      const lastExp = Store.state.settings.lastExport;
      const expAge = lastExp ? Util.daysBetween(lastExp, Util.today()) : null;
      const expLabel = lastExp ? (expAge === 0 ? "hoy" : `hace ${Util.plural(expAge, "día", "días")}`) : "nunca";
      const expNudge = sessionsTotal >= 3 && (expAge === null || expAge > 14);
      const backupCard = `<div class="rounded-2xl border ${expNudge ? "border-amber-400/30" : "border-zinc-800"} bg-zinc-900/40 p-6">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="text-sm font-semibold text-zinc-200">Copia de seguridad</h2>
            <span class="text-xs ${expNudge ? "text-amber-300" : "text-zinc-400"}">Última copia: ${expLabel}</span>
          </div>
          <p class="mt-1.5 text-xs text-zinc-400 leading-relaxed">Tu progreso y tu banco de palabras solo se guardan en este navegador. Exporta un archivo de vez en cuando (Safari puede borrar los datos de webs que no abres en 7 días) o para pasarlos a otro dispositivo.</p>
          <div class="mt-4 flex flex-wrap gap-3">
            <button data-action="export" class="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-900 hover:bg-white transition">Exportar copia (.json)</button>
            <button data-action="import" class="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-200 hover:border-zinc-500 transition">Importar copia</button>
            <input type="file" id="import-file" data-action="import-file" accept="application/json,.json" class="hidden">
          </div>
          <div id="backup-zone" class="mt-3 text-sm empty:hidden" aria-live="polite"></div>
        </div>`;

      return `
      <section class="space-y-6 fade-in">
        ${recoveredBanner}
        <div class="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:p-8">
          <div class="flex flex-wrap items-start justify-between gap-6">
            <div class="max-w-md">
              <p class="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Sesión diaria · 4 bloques × 5 min</p>
              <h1 class="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-50">${st.doneToday ? "Sesión de hoy completada." : "Tus 20 minutos de hoy."}</h1>
              <p class="mt-2 text-sm text-zinc-400 leading-relaxed">${st.doneToday
                ? "Puedes repetir otra sesión o reforzar un bloque concreto. El repaso espaciado prioriza lo que fallas."
                : "Conversación y frases para reuniones, vocabulario amplio, gramática en contexto, comprensión con tu jefe australiano y producción hablada."}</p>
            </div>
            <div class="flex gap-6">
              <div><div class="text-[11px] uppercase tracking-wider text-zinc-500">Racha</div>
                <div class="mt-1 flex items-baseline gap-1"><span class="text-4xl font-semibold tabular-nums ${st.current ? "text-amber-400" : "text-zinc-600"}">${st.current}</span><span class="text-sm text-zinc-500">${st.current === 1 ? "día" : "días"}</span></div></div>
              <div><div class="text-[11px] uppercase tracking-wider text-zinc-500">Mejor</div>
                <div class="mt-1 text-4xl font-semibold tabular-nums text-zinc-300">${st.best}</div></div>
            </div>
          </div>
          <div class="mt-6 flex flex-wrap items-center gap-4">
            <button data-action="start" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-50 px-6 py-3.5 text-sm font-semibold text-zinc-950 hover:bg-white active:scale-[.99] transition shadow-lg shadow-black/30">
              ${st.doneToday ? "Nueva sesión de 20 min" : "Empezar sesión de 20 min"} <kbd class="hidden sm:inline font-mono text-[10px] text-zinc-500 border border-zinc-300 rounded px-1">Enter</kbd>
            </button>
            <div class="flex items-center gap-2 text-xs text-zinc-500">Nivel ${levelSwitch}</div>
          </div>
          ${dueWords ? `<p class="mt-3 text-xs text-amber-300/90">${Util.plural(dueWords, "palabra", "palabras")} de tu banco ${dueWords === 1 ? "pendiente" : "pendientes"} de repaso.</p>` : ""}
        </div>

        ${c1Hint}

        ${errorsCard}

        <div class="grid gap-6 lg:grid-cols-5">
          <div class="lg:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-5">
            <div class="flex items-baseline justify-between">
              <h2 class="text-sm font-semibold text-zinc-200">Precisión por bloque</h2>
              <span class="text-xs text-zinc-500">dominados / total</span>
            </div>
            ${blockRows}
          </div>
          <div class="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
            <div class="flex items-baseline justify-between">
              <h2 class="text-sm font-semibold text-zinc-200">Contenido dominado</h2>
              <span class="text-xs text-zinc-500 tabular-nums">${Util.plural(sessionsTotal, "sesión", "sesiones")}</span>
            </div>
            <div class="flex items-baseline gap-2"><span class="text-4xl font-semibold tabular-nums text-zinc-50">${ag.mastered}</span><span class="text-sm text-zinc-500">/ ${ag.totalItems} ítems</span></div>
            ${this.bar(Util.pct(ag.mastered, ag.totalItems), "bg-zinc-300")}
            <p class="text-xs text-zinc-500 leading-relaxed">Un ítem está dominado cuando lo aciertas en 3 repasos espaciados seguidos. Cada acierto aleja el siguiente repaso (1, 6, 15, 38 días…). Un fallo lo devuelve al principio.</p>
            ${recent.length ? `<div><div class="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">Últimas sesiones</div><div class="flex items-end gap-1">${spark}</div></div>` : ""}
          </div>
        </div>

        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="text-sm font-semibold text-zinc-200">Mi banco de vocabulario <span class="font-normal text-zinc-500">· ${Util.plural(words.length, "palabra", "palabras")}</span></h2>
            <span class="text-xs text-zinc-500">Entra en el bloque 1 cuando toca repasarla</span>
          </div>
          <form id="word-form" class="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_1.4fr_auto]" autocomplete="off">
            <input id="w-en" required maxlength="80" lang="en" placeholder="Inglés · e.g. pick your brain" class="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40">
            <input id="w-es" required maxlength="80" placeholder="Significado · consultar ideas" class="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40">
            <input id="w-ex" maxlength="160" lang="en" placeholder="Ejemplo (opcional) · Can I pick your brain about…?" class="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40">
            <button type="submit" class="rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-300 transition">Añadir</button>
          </form>
          <p id="word-msg" class="mt-2 text-xs text-zinc-500 empty:hidden"></p>
          ${wordList}
        </div>

        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div class="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <h2 class="text-sm font-semibold text-zinc-200">Precisión por ámbito</h2>
            ${weak ? `<span class="text-xs text-rose-300/90">Punto débil: <strong>${D.DOMAINS[weak.key].es}</strong></span>` : `<span class="text-xs text-zinc-500">Se activa con algo de práctica</span>`}
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">${domainCells}</div>
        </div>

        <div>
          <h2 class="text-sm font-semibold text-zinc-200 mb-3">Refuerzo por bloque <span class="font-normal text-zinc-500">· no cuenta para la racha</span></h2>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">${drillBtns}</div>
        </div>

        ${backupCard}

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-900 pt-5 text-xs text-zinc-500">
          <label class="inline-flex items-center gap-2 cursor-pointer select-none ${Speech.supported ? "" : "opacity-40 pointer-events-none"}">
            <input type="checkbox" data-action="toggle-tts" class="accent-zinc-300" ${Store.state.settings.tts ? "checked" : ""}> Leer en voz alta al acertar
          </label>
          ${Speech.supported || Voice.supported ? `<label class="inline-flex items-center gap-2">Acento (voz y dictado)
            <select data-action="voice" class="bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1 text-zinc-300">
              ${[["en-GB", "British"], ["en-US", "American"], ["en-AU", "Australian"]].map(([v, l]) => `<option value="${v}" ${Store.state.settings.voice === v ? "selected" : ""}>${l}</option>`).join("")}
            </select></label>` : ""}
          ${Store.persistent ? "" : `<span class="text-amber-400">⚠ El navegador no permite guardar el progreso (modo privado).</span>`}
          <span id="reset-zone"><button data-action="reset-ask" class="hover:text-rose-400 transition">Reiniciar progreso</button></span>
        </div>
      </section>`;
    },

    /* ---- SESSION ---- */
    session() {
      const S = Session, s = S.s, k = S.blockKey, m = D.BLOCK_META[k], a = accentOf(k);

      const segments = s.blocks.map((bk, i) => {
        const ac = accentOf(bk);
        let fill = 0;
        if (i < s.blockIdx) fill = 100;
        else if (i === s.blockIdx && s.phase !== "intro") fill = Math.round(((s.itemIdx + (s.answered || s.phase === "blockDone" ? 1 : 0)) / S.blockLength) * 100);
        return `<div class="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden"><div class="h-full ${ac.bg} transition-all duration-500" style="width:${fill}%"></div></div>`;
      }).join("");

      const header = `
        <div class="sticky top-0 z-10 -mx-4 sm:mx-0 px-4 sm:px-0 pt-4 pb-3 bg-zinc-950/90 backdrop-blur">
          <div class="flex items-center justify-between gap-3">
            <button data-action="abort" class="text-xs text-zinc-400 hover:text-zinc-100 transition">✕ Salir <kbd class="hidden sm:inline font-mono text-[10px] text-zinc-500">Esc</kbd></button>
            <span class="font-mono text-[11px] ${a.text}">BLOQUE ${m.n} · MIN ${m.minutes}</span>
            <div id="timer" class="font-mono text-sm tabular-nums text-zinc-300 w-14 text-right">${s.phase === "item" ? Util.mmss(S.remaining()) : "05:00"}</div>
          </div>
          <div id="exit-ask" role="alertdialog" aria-label="Confirmar salida" class="hidden mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            <p>¿Salir de la sesión? Lo que ya has respondido cuenta para tus repasos, pero la sesión no se guarda ni suma racha.</p>
            <div class="mt-2.5 flex gap-3">
              <button data-action="abort-no" id="exit-no" class="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900">Seguir con la sesión</button>
              <button data-action="abort-yes" class="rounded-lg border border-rose-400/50 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/20">Sí, salir</button>
            </div>
          </div>
          <div class="mt-3 flex gap-1.5">${segments}</div>
        </div>`;

      let body;
      if (s.phase === "intro") body = this.blockIntro(k);
      else if (s.phase === "blockDone") body = this.blockDone(k);
      else body = this[`item_${S.kind}`]();

      return `<section class="max-w-2xl mx-auto">${header}<div class="pt-4 pb-28 fade-in">${body}</div></section>`;
    },

    blockIntro(k) {
      const m = D.BLOCK_META[k], a = accentOf(k), n = Session.blockLength;
      const unit = { vocab: "ítems", grammar: "frases", listening: n === 1 ? "audio" : "audios", challenges: n === 1 ? "reto" : "retos" }[k];
      const errMode = Session.s.mode === "errors";
      const errLabels = errMode
        ? [...new Set(Session.s.queue[k].map((e) => Content.patternOf(e.pool, e.it).label))].join(", ")
        : "";
      const how = {
        vocab: "Frases para conversar y para intervenir en reuniones, vocabulario amplio (phrasal verbs, expresiones, colocaciones), HR Analytics y, si toca, palabras de tu banco personal. Ojo: todas las opciones pueden ser gramaticales. Elige la que diría un nativo en esa situación.",
        grammar: "Completa cada frase con la estructura correcta. Son frases de tu trabajo y la regla aparece en una línea. También salen las trampas típicas del español.",
        listening: Speech.supported
          ? "Escucha y responde. Puedes repetir el audio y ponerlo más lento. Mark habla con acento australiano. Intenta responder sin mirar la transcripción: aparece al final."
          : "Tu navegador no puede reproducir voz, así que verás la transcripción para leer. Para escuchar, usa Chrome, Edge o Safari.",
        challenges: Voice.supported
          ? `Lee el escenario y responde en voz alta, como en la situación real (60–90 s). Tu voz se transcribe y luego puedes corregir el texto. Usa los chunks obligatorios.</p><p class="mt-2 text-xs text-zinc-400">${PRIVACY_NOTE}`
          : "Lee el escenario y escribe tu respuesta (≈ 60–100 palabras). Usa los chunks obligatorios. Para responder hablando, abre la app en Chrome, Edge o Safari."
      }[k];
      return `
        <div class="rounded-2xl border ${a.border} ${a.soft} p-6 sm:p-8">
          <div class="font-mono text-xs ${a.text}">${errMode ? "REPASO DE ERRORES" : `BLOQUE ${m.n} DE 4`} · ${n} ${unit} · NIVEL ${Session.s.level.toUpperCase()}</div>
          <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">${m.title}</h2>
          <p class="mt-1 text-sm text-zinc-400">${m.subtitle}</p>
          <p class="mt-5 text-sm leading-relaxed text-zinc-300">${errMode
            ? `Solo ítems de tus patrones de error activos: ${Util.esc(errLabels)}. Fíjate en por qué fallaste antes. El patrón queda superado con 3 aciertos seguidos, el último en un día posterior al último fallo (hoy entrenas, otro día lo confirmas).`
            : how}</p>
          <p class="mt-3 text-xs text-zinc-500">Tienes 5 minutos de referencia. Si se acaba el tiempo no se corta el bloque, pero lo verás en el reloj.</p>
        </div>
        ${this.footer(`Empezar bloque ${m.n}`, true)}`;
    },

    blockDone(k) {
      const m = D.BLOCK_META[k], a = accentOf(k), r = Session.s.results[k];
      const p = Util.pct(r.ok, r.total) ?? 0;
      const last = Session.s.blockIdx + 1 >= Session.s.blocks.length;
      const used = BLOCK_SECONDS - Session.remaining();
      return `
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
          <div class="font-mono text-xs ${a.text}">BLOQUE ${m.n} COMPLETADO</div>
          <div class="mt-4 text-5xl font-semibold tabular-nums text-zinc-50">${p}%</div>
          <div class="mt-1 text-sm text-zinc-400">${r.ok} de ${r.total} correctos · ${Util.mmss(used)} min</div>
        </div>
        ${this.footer(last ? "Ver resumen" : "Siguiente bloque", true)}`;
    },

    optionList(options, correct, selectedIdx, answered) {
      return `<div class="space-y-2.5">${options.map((o, i) => {
        let cls = "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-900";
        let mark = `<span class="font-mono text-[11px] text-zinc-500 border border-zinc-700 rounded w-5 h-5 inline-flex items-center justify-center shrink-0">${i + 1}</span>`;
        if (answered) {
          if (o === correct) { cls = "border-emerald-500/60 bg-emerald-500/10"; mark = `<span class="text-emerald-400 w-5 shrink-0 text-center">✓</span>`; }
          else if (i === selectedIdx) { cls = "border-rose-500/60 bg-rose-500/10"; mark = `<span class="text-rose-400 w-5 shrink-0 text-center">✕</span>`; }
          else cls = "border-zinc-900 bg-zinc-900/30 opacity-50";
        }
        return `<button data-action="choose" data-idx="${i}" ${answered ? "disabled" : ""} class="w-full flex items-start gap-3 text-left rounded-xl border ${cls} px-4 py-3.5 text-[15px] leading-snug text-zinc-100 transition">${mark}<span>${Util.esc(o)}</span></button>`;
      }).join("")}</div>`;
    },

    feedbackBox(ok, inner) {
      return `<div class="mt-5 rounded-xl border ${ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"} p-5 space-y-3 fade-in">
        <div class="text-xs font-semibold uppercase tracking-wider ${ok ? "text-emerald-400" : "text-rose-400"}">${ok ? "Correcto" : "No exactamente"}</div>${inner}</div>`;
    },

    itemHead(extra = []) {
      const S = Session, { pool, it } = S.entry;
      const domain = it.domain === "mine" ? "" : this.badge(D.DOMAINS[it.domain].es);
      const tags = [this.badge(D.POOL_LABEL[pool], "bg-zinc-800/60 text-zinc-400"), domain, ...extra, this.levelBadge(it, pool)].join("");
      return `<div class="flex items-start justify-between gap-3 mb-4">
        <div class="flex flex-wrap gap-2">${tags}</div>
        <span class="font-mono text-xs text-zinc-500 tabular-nums shrink-0">${S.s.itemIdx + 1}/${S.blockLength}</span></div>`;
    },

    isOk() { const c = Session.s.current; return c.options[c.selected] === Session.correctOption(); },

    item_register() {
      const S = Session, it = S.item, c = S.s.current;
      return `${this.itemHead()}
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 mb-5">
          <div class="text-[11px] uppercase tracking-wider text-zinc-500">Frase plana</div>
          <p class="mt-1.5 text-lg text-zinc-400 line-through decoration-zinc-700">${Util.esc(it.plain)}</p>
        </div>
        <p class="text-sm text-zinc-300 mb-3">¿Cuál es la versión profesional?</p>
        ${this.optionList(c.options, it.c1, c.selected, S.s.answered)}
        ${S.s.answered ? this.feedbackBox(this.isOk(), `
          ${it.tone && TONE[it.tone] ? `<div>${this.badge(TONE[it.tone].label, TONE[it.tone].cls)}</div>` : ""}
          <p class="text-[17px] leading-relaxed text-zinc-50">${this.highlight(it.c1, it.chunks)}</p>
          <div class="flex flex-wrap gap-1.5">${it.chunks.map((ch) => `<span class="rounded-md bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 text-xs text-amber-200">${Util.esc(ch)}</span>`).join("")}</div>
          <p class="text-sm text-zinc-400 leading-relaxed">${Util.esc(it.whyItWorks)}</p>
          ${it.tone && TONE[it.tone] && TONE[it.tone].note ? `<p class="text-xs leading-relaxed ${it.tone === "buzzword" ? "text-amber-200/90" : "text-zinc-400"}">${TONE[it.tone].note}</p>` : ""}
          ${this.speakBtn(it.c1)}`) : ""}
        ${this.footer("Siguiente", S.s.answered)}`;
    },

    item_gap() {
      const S = Session, { pool, it } = S.entry, c = S.s.current, ok = S.s.answered && this.isOk();
      const [pre, post] = it.sentence.split("___");
      const filled = S.s.answered
        ? `<span class="${ok ? "text-emerald-300" : "text-sky-300"} font-semibold underline decoration-2 underline-offset-4">${Util.esc(it.answer)}</span>`
        : `<span class="inline-block min-w-[5rem] border-b-2 border-dashed border-sky-400/60 mx-1">&nbsp;</span>`;
      const extra = pool === "grammar" ? [this.badge(it.topic, "bg-sky-500/10 text-sky-300")] : it.type && VOCAB_TYPE[it.type] ? [this.badge(VOCAB_TYPE[it.type] || it.type)] : [];
      const info = pool === "grammar"
        ? `<p class="text-sm leading-relaxed text-zinc-200"><span class="font-semibold text-sky-300">Regla:</span> ${Util.esc(it.rule)}</p>`
        : `<div class="flex items-baseline gap-2 flex-wrap"><span class="text-lg font-semibold text-sky-300">${Util.esc(it.answer)}</span><span class="text-sm text-zinc-400">— ${Util.esc(it.meaningEs)}</span></div>
           ${it.example ? `<p class="text-sm text-zinc-300 italic">“${Util.esc(it.example)}”</p>` : ""}`;
      return `${this.itemHead(extra)}
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 mb-5">
          <p class="text-xl leading-relaxed text-zinc-100">${Util.esc(pre)}${filled}${Util.esc(post)}</p>
        </div>
        ${this.optionList(c.options, it.answer, c.selected, S.s.answered)}
        ${S.s.answered ? this.feedbackBox(ok, `${info}
          <div class="flex gap-4">${this.speakBtn(it.sentence.replace("___", it.answer), "Frase")}${it.example ? this.speakBtn(it.example, "Ejemplo") : ""}</div>`) : ""}
        ${this.footer("Siguiente", S.s.answered)}`;
    },

    item_move() {
      const S = Session, it = S.item, c = S.s.current;
      const social = S.entry.pool === "conversation";
      return `${this.itemHead([this.badge(D.MOVE_FUNCTIONS[it.fn], "bg-amber-400/10 text-amber-300")])}
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 mb-5">
          <div class="text-[11px] uppercase tracking-wider text-zinc-500">${social ? "Situación" : "Situación en la reunión"}</div>
          <p class="mt-1.5 text-lg text-zinc-200">${Util.esc(it.situation)}</p>
        </div>
        <p class="text-sm text-zinc-300 mb-3">¿Qué dirías?</p>
        ${this.optionList(c.options, it.answer, c.selected, S.s.answered)}
        ${S.s.answered ? this.feedbackBox(this.isOk(), `
          <p class="text-[17px] leading-relaxed text-zinc-50">${Util.esc(it.answer)}</p>
          <p class="text-sm text-zinc-400 leading-relaxed">${Util.esc(it.note)}</p>
          <div class="flex gap-4">${this.speakBtn(it.answer)}${this.speakBtn(it.answer, "Acento australiano", "en-AU")}</div>
          <p class="text-xs text-zinc-500">Repítela en voz alta 2 veces: ${social ? "la próxima vez te saldrá sola." : "en la próxima reunión te saldrá sola."}</p>`) : ""}
        ${this.footer("Siguiente", S.s.answered)}`;
    },

    item_trap() {
      const S = Session, it = S.item, c = S.s.current;
      return `${this.itemHead([this.badge(D.TRAP_CATEGORIES[it.category], "bg-rose-500/10 text-rose-300")])}
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 mb-5">
          <div class="text-[11px] uppercase tracking-wider text-zinc-500">Lo que quieres decir</div>
          <p class="mt-1.5 text-lg text-zinc-200"><span class="font-mono text-[11px] align-middle text-zinc-500 border border-zinc-700 rounded px-1 mr-1.5">ES</span>${Util.esc(it.spanishSource)}</p>
        </div>
        <p class="text-sm text-zinc-300 mb-3">Solo una versión es correcta y natural. ¿Cuál?</p>
        ${this.optionList(c.options, it.right, c.selected, S.s.answered)}
        ${S.s.answered ? this.feedbackBox(this.isOk(), `
          <p class="text-sm leading-relaxed text-zinc-200"><span class="font-semibold text-rose-300">La trampa:</span> ${Util.esc(it.trap)}</p>
          <div class="text-sm space-y-1">
            <div class="text-zinc-500 line-through">${Util.esc(it.wrong)}</div>
            <div class="text-emerald-300">${Util.esc(it.right)}</div>
          </div>${this.speakBtn(it.right)}`) : ""}
        ${this.footer("Siguiente", S.s.answered)}`;
    },

    item_listen() {
      const S = Session, it = S.item, c = S.s.current, done = S.s.answered;
      const speakers = [...new Set(it.lines.map((l) => l.who))].map((w) => D.SPEAKERS[w]);
      const auMissing = Speech.supported && speakers.some((sp) => sp.lang === "en-AU") && Speech.voices.length && !Speech.hasVoice("en-AU");

      const questions = it.questions.map((q, qi) => {
        const ans = c.answers[qi];
        const opts = q.options.map((o, oi) => {
          let cls = "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600";
          if (ans !== null) {
            if (oi === q.answer) cls = "border-emerald-500/60 bg-emerald-500/10 text-emerald-100";
            else if (oi === ans) cls = "border-rose-500/60 bg-rose-500/10";
            else cls = "border-zinc-900 bg-zinc-900/30 opacity-50";
          }
          return `<button data-action="lchoose" data-q="${qi}" data-idx="${oi}" ${ans !== null ? "disabled" : ""} class="w-full text-left rounded-lg border ${cls} px-3.5 py-2.5 text-sm text-zinc-100 transition">${Util.esc(o)}</button>`;
        }).join("");
        return `<div class="space-y-2"><p class="text-sm font-medium text-zinc-200"><span class="font-mono text-xs text-violet-400 mr-1.5">${qi + 1}</span>${Util.esc(q.q)}</p><div class="grid gap-2">${opts}</div></div>`;
      }).join("");

      const showTranscript = done || !Speech.supported;
      const transcript = showTranscript ? `
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3 fade-in">
          <div class="text-[11px] uppercase tracking-wider text-zinc-500">Transcripción</div>
          ${it.lines.map((l) => { const sp = D.SPEAKERS[l.who]; return `<p class="text-[15px] leading-relaxed text-zinc-100"><span class="font-semibold ${sp.color}">${sp.name}:</span> ${Util.esc(l.text)}</p>`; }).join("")}
        </div>` : "";

      const glossary = done ? `
        <div class="rounded-xl border border-violet-400/20 bg-violet-400/5 p-5 fade-in">
          <div class="text-[11px] uppercase tracking-wider text-violet-300 mb-3">Expresiones clave</div>
          <ul class="space-y-2">${it.glossary.map((g) => {
            const saved = Store.state.custom.some((w) => w.en.toLowerCase() === g.t.toLowerCase());
            return `<li class="flex items-start justify-between gap-3 text-sm"><span><span class="font-semibold text-zinc-100">${Util.esc(g.t)}</span> <span class="text-zinc-400">— ${Util.esc(g.es)}</span></span>
              <button data-action="add-gloss" data-en="${Util.esc(g.t)}" data-es="${Util.esc(g.es)}" ${saved ? "disabled" : ""} class="shrink-0 text-xs ${saved ? "text-emerald-400" : "text-violet-300 hover:text-violet-100"}">${saved ? "✓ En tu banco" : "+ Mi banco"}</button></li>`;
          }).join("")}</ul>
        </div>` : "";

      const okCount = done ? c.answers.filter((a, i) => a === it.questions[i].answer).length : 0;

      return `${this.itemHead()}
        <div class="rounded-2xl border border-violet-400/20 bg-zinc-900/40 p-6 mb-5 space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-zinc-50">${Util.esc(it.title)}</h3>
            <p class="mt-1 text-sm text-zinc-400">${Util.esc(it.context)}</p>
          </div>
          <div class="flex flex-wrap gap-2">${speakers.map((sp) => `<span class="text-xs text-zinc-400"><span class="font-semibold ${sp.color}">${sp.name}</span> · ${sp.role}</span>`).join('<span class="text-zinc-700">|</span>')}</div>
          ${Speech.supported ? `<div class="flex flex-wrap items-center gap-3">
            <button id="play-btn" data-action="play" class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition"></button>
            <div class="inline-flex rounded-lg border border-zinc-700 p-0.5 text-xs" role="group" aria-label="Velocidad">
              <button data-action="rate" data-rate="1" id="rate-1" class="rounded-md px-2.5 py-1.5 transition">Normal</button>
              <button data-action="rate" data-rate="0.8" id="rate-0.8" class="rounded-md px-2.5 py-1.5 transition">Lento</button>
            </div>
            <span id="play-count" class="text-xs text-zinc-500 tabular-nums"></span>
          </div>` : ""}
          ${auMissing ? `<p class="text-xs text-amber-300/80">Tu navegador no tiene voz australiana instalada, así que Mark sonará con otra voz inglesa. En Microsoft Edge suele estar disponible.</p>` : ""}
        </div>
        <div class="space-y-5">${questions}</div>
        ${done ? `<div class="mt-5 text-sm ${okCount === it.questions.length ? "text-emerald-300" : "text-zinc-300"}">${okCount}/${it.questions.length} correctas. ${okCount === it.questions.length ? "Perfecto." : "Escúchalo otra vez leyendo la transcripción: así es como se entrena el oído."}</div>` : ""}
        <div class="mt-5 space-y-5">${transcript}${glossary}</div>
        ${this.footer("Siguiente", done, "next", done ? "" : "Responde las 3 preguntas")}`;
    },

    item_card() {
      const S = Session, it = S.item, c = S.s.current;
      let footer;
      if (!c.revealed) footer = this.footer("Ver respuesta", true, "reveal");
      else if (!S.s.answered) footer = this.footer("Siguiente", false, "next", "¿Lo sabías?");
      else footer = this.footer("Siguiente", true);

      const attemptOk = c.revealed && c.attempt.trim() && c.attempt.trim().toLowerCase() === it.en.toLowerCase();
      return `${this.itemHead()}
        <div class="rounded-2xl border border-amber-400/20 bg-zinc-900/40 p-6 mb-5">
          <div class="text-[11px] uppercase tracking-wider text-zinc-500">¿Cómo se dice en inglés?</div>
          <p class="mt-2 text-xl text-zinc-100">${Util.esc(it.es)}</p>
        </div>
        ${!c.revealed ? `<input id="card-attempt" lang="en" autocomplete="off" placeholder="Escríbelo o dilo en voz alta y pulsa «Ver respuesta»" class="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40">` : `
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3 fade-in">
          ${c.attempt.trim() ? `<p class="text-sm ${attemptOk ? "text-emerald-300" : "text-zinc-400"}">Tu respuesta: ${Util.esc(c.attempt)}</p>` : ""}
          <p class="text-2xl font-semibold text-amber-200">${Util.esc(it.en)}</p>
          ${it.example ? `<p class="text-sm text-zinc-300 italic">“${Util.esc(it.example)}”</p>` : ""}
          <div class="flex gap-4">${this.speakBtn(it.en)}${it.example ? this.speakBtn(it.example, "Ejemplo") : ""}</div>
          ${S.s.answered ? "" : `<div class="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
            <button data-action="grade" data-q="1" class="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-3 text-sm font-medium text-rose-200 hover:bg-rose-500/20 transition"><kbd class="hidden sm:inline font-mono text-[10px] text-rose-300/60 mr-1">1</kbd>No lo sabía</button>
            <button data-action="grade" data-q="3" class="rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-3 text-sm font-medium text-amber-200 hover:bg-amber-400/20 transition"><kbd class="hidden sm:inline font-mono text-[10px] text-amber-300/60 mr-1">2</kbd>Con dudas</button>
            <button data-action="grade" data-q="5" class="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-3 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20 transition"><kbd class="hidden sm:inline font-mono text-[10px] text-emerald-300/60 mr-1">3</kbd>Lo sabía</button>
          </div>
          <p class="text-xs text-zinc-500">«Con dudas» cuenta como acierto, pero el repaso vuelve antes.</p>`}
        </div>`}
        ${footer}`;
    },

    item_challenge() {
      const S = Session, it = S.item, c = S.s.current;
      const hits = S.challengeHits(c.text);
      const words = Util.words(c.text);

      const chips = it.mustUse.map((u, i) => `<span data-chip="${i}" class="rounded-md border px-2 py-1 text-xs transition ${hits[i] ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200" : "border-zinc-700 bg-zinc-900 text-zinc-400"}">${hits[i] ? "✓ " : ""}${Util.esc(u.t)}</span>`).join("");

      const evalPanel = c.evaluated ? `
        <div class="mt-6 space-y-5 fade-in">
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div class="text-[11px] uppercase tracking-wider text-zinc-500 mb-3">Autoevaluación honesta</div>
            <div class="space-y-2.5">${it.selfCheck.map((q, i) => `
              <label class="flex items-start gap-3 cursor-pointer text-sm text-zinc-200 ${S.s.answered ? "pointer-events-none opacity-70" : ""}">
                <input type="checkbox" data-action="check" data-idx="${i}" ${c.checks[i] ? "checked" : ""} class="mt-0.5 accent-emerald-400 w-4 h-4"> ${Util.esc(q)}</label>`).join("")}
            </div>
          </div>
          <div class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3">
            <div class="flex items-center justify-between gap-3"><div class="text-[11px] uppercase tracking-wider text-emerald-400">Respuesta modelo</div>${this.speakBtn(it.modelAnswer)}</div>
            <p class="text-[15px] leading-relaxed text-zinc-100">${this.highlight(it.modelAnswer, it.mustUse.map((u) => u.t))}</p>
          </div>
          ${this.deliveryPanel(c)}
          ${S.s.answered ? `<div class="text-center text-sm text-zinc-300">Puntuación del reto: <span class="font-semibold tabular-nums ${c.finalScore >= 60 ? "text-emerald-400" : "text-amber-400"}">${c.finalScore}%</span> <span class="text-zinc-500">(50% chunks · 50% rúbrica)</span></div>` : ""}
        </div>` : "";

      let footerBtn;
      if (!c.evaluated) footerBtn = this.footer("Evaluar respuesta", words >= 15, "evaluate", words >= 15 ? "" : `${words}/15 palabras mínimo`);
      else if (!S.s.answered) footerBtn = this.footer("Registrar y continuar", true, "finish-challenge");
      else footerBtn = this.footer("Siguiente", true);

      return `${this.itemHead([this.badge(D.SCENARIOS[it.scenario], "bg-emerald-500/10 text-emerald-300")])}
        <div class="rounded-2xl border border-emerald-500/20 bg-zinc-900/40 p-6 mb-5 space-y-4">
          <p class="text-[17px] leading-relaxed text-zinc-100">${Util.esc(it.brief)}</p>
          <div>
            <div class="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">Estructura</div>
            <ol class="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-zinc-300">${it.framework.map((f, i) => `<li class="flex gap-2"><span class="font-mono text-emerald-400 text-xs mt-0.5">${i + 1}</span>${Util.esc(f)}</li>`).join("")}</ol>
          </div>
          <div>
            <div class="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">Chunks obligatorios</div>
            <div id="chips" class="flex flex-wrap gap-1.5">${chips}</div>
          </div>
        </div>
        ${c.evaluated ? "" : this.voiceControls()}
        <textarea id="challenge-text" ${c.evaluated ? "readonly" : ""} rows="7" spellcheck="true" lang="en" placeholder="${Voice.supported ? "Pulsa «Responder hablando» o escribe tu respuesta en inglés…" : "Write your answer in English…"}"
          class="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-[15px] leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 ${c.evaluated ? "opacity-80" : ""}">${Util.esc(c.text)}</textarea>
        <div class="mt-1.5 flex justify-between text-xs text-zinc-500"><span id="word-count" class="tabular-nums">${words} palabras</span><span>Objetivo: 60–100</span></div>
        ${evalPanel}
        ${footerBtn}`;
    },

    footer(label, enabled, action = "next", hint = "") {
      return `<div class="fixed bottom-0 inset-x-0 z-20 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pt-8 pb-5 px-4">
        <div class="max-w-2xl mx-auto flex items-center justify-end gap-4">
          <span id="footer-hint" class="text-xs text-zinc-500 shrink-0 empty:hidden">${hint}</span>
          <button id="primary-btn" data-action="${action}" ${enabled ? "" : "disabled"} class="w-full sm:w-auto rounded-xl px-6 py-3.5 text-sm font-semibold transition
            ${enabled ? "bg-zinc-50 text-zinc-950 hover:bg-white active:scale-[.99]" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}">${label} ${enabled ? `<span class="hidden sm:inline font-mono text-[10px] text-zinc-500 ml-1">↵</span>` : ""}</button>
        </div></div>`;
    },

    exitAsk: false,
    showExitAsk() {
      const box = document.getElementById("exit-ask");
      if (!box) return;
      this.exitAsk = true;
      box.classList.remove("hidden");
      document.getElementById("exit-no").focus();
    },
    hideExitAsk() {
      const box = document.getElementById("exit-ask");
      this.exitAsk = false;
      if (box) box.classList.add("hidden");
    },

    afterSessionRender() {
      this.updateTimer();
      this.updateVoiceUI();
      this.updateListenUI();
      if (!Session.s || Session.s.phase !== "item") return;
      const ta = document.getElementById("challenge-text");
      if (ta && !Session.s.current.evaluated && !Voice.supported) {
        ta.focus();
        ta.setSelectionRange(ta.value.length, ta.value.length);
      }
      const att = document.getElementById("card-attempt");
      if (att) att.focus();
    },

    updateTimer() {
      const el = document.getElementById("timer");
      if (!el || !Session.s || Session.s.phase !== "item") return;
      const r = Session.remaining();
      el.textContent = Util.mmss(r);
      el.className = `font-mono text-sm tabular-nums w-14 text-right ${r < 0 ? "text-amber-400" : r <= 30 ? "text-amber-300 animate-pulse" : "text-zinc-300"}`;
      if (Voice.active) this.updateVoiceUI();
    },

    /* Estado del reproductor del listening, sin re-render. */
    updateListenUI() {
      const btn = document.getElementById("play-btn");
      if (!btn || !Session.s || Session.kind !== "listen") return;
      const c = Session.s.current;
      if (Speech.playing) {
        btn.className = "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition bg-violet-500/20 border border-violet-400/50 text-violet-100";
        btn.innerHTML = `<span class="w-2.5 h-2.5 rounded-sm bg-violet-300"></span>Detener`;
      } else {
        btn.className = "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition bg-violet-400 text-zinc-950 hover:bg-violet-300";
        btn.innerHTML = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>${c.plays ? "Escuchar otra vez" : "Escuchar"}`;
      }
      for (const r of ["1", "0.8"]) {
        const el = document.getElementById(`rate-${r}`);
        if (el) el.className = `rounded-md px-2.5 py-1.5 transition ${String(c.rate) === r ? "bg-zinc-100 text-zinc-900 font-semibold" : "text-zinc-400 hover:text-zinc-100"}`;
      }
      const pc = document.getElementById("play-count");
      if (pc) pc.textContent = c.plays ? `${Util.plural(c.plays, "escucha", "escuchas")}` : "";
    },

    updateChallengeLive() {
      const c = Session.s.current, it = Session.item;
      const hits = Session.challengeHits(c.text);
      const words = Util.words(c.text);
      document.getElementById("word-count").textContent = `${words} palabras`;
      it.mustUse.forEach((u, i) => {
        const chip = document.querySelector(`[data-chip="${i}"]`);
        if (!chip) return;
        chip.className = `rounded-md border px-2 py-1 text-xs transition ${hits[i] ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200" : "border-zinc-700 bg-zinc-900 text-zinc-400"}`;
        chip.textContent = `${hits[i] ? "✓ " : ""}${u.t}`;
      });
      const btn = document.getElementById("primary-btn"), hint = document.getElementById("footer-hint");
      const ok = words >= 15;
      btn.disabled = !ok;
      btn.className = `w-full sm:w-auto rounded-xl px-6 py-3.5 text-sm font-semibold transition ${ok ? "bg-zinc-50 text-zinc-950 hover:bg-white active:scale-[.99]" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}`;
      hint.textContent = ok ? "" : `${words}/15 palabras mínimo`;
    },

    voiceControls() {
      if (!Voice.supported) {
        return `<p class="mb-3 text-xs text-zinc-500">Este navegador no permite dictado por voz. Para responder hablando, usa Chrome, Edge o Safari.</p>`;
      }
      return `<div class="mb-3 flex flex-wrap items-center gap-3">
        <button type="button" id="mic-btn" data-action="mic" aria-pressed="false"></button>
        <span id="voice-status" class="text-xs text-zinc-500 tabular-nums" aria-live="polite"></span>
        <p class="basis-full text-[11px] leading-snug text-zinc-500">🔒 ${PRIVACY_NOTE}</p>
      </div>`;
    },

    updateVoiceUI() {
      const btn = document.getElementById("mic-btn");
      const status = document.getElementById("voice-status");
      const ta = document.getElementById("challenge-text");
      if (!btn || !Session.s) return;
      const c = Session.s.current, ms = Voice.liveMs(), secs = Math.floor(ms / 1000);
      const mic = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v5"/></svg>`;
      const accent = { "en-GB": "British", "en-US": "American", "en-AU": "Australian" }[Store.state.settings.voice] || "";

      btn.setAttribute("aria-pressed", String(Voice.active));
      if (Voice.active) {
        btn.className = "inline-flex items-center gap-2 rounded-xl border border-rose-400/60 bg-rose-500/15 px-4 py-2.5 text-sm font-medium text-rose-100 hover:bg-rose-500/25 transition";
        btn.innerHTML = `<span class="relative flex w-2.5 h-2.5"><span class="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping"></span><span class="relative inline-flex w-2.5 h-2.5 rounded-full bg-rose-500"></span></span>Detener`;
        status.className = "text-xs tabular-nums text-rose-200";
        status.textContent = `Grabando ${Util.mmss(secs)} · habla en inglés (${accent})`;
      } else {
        btn.className = "inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-100 hover:bg-emerald-400/20 transition";
        btn.innerHTML = `${mic}${c.voice && c.voice.ms > 0 ? "Seguir hablando" : "Responder hablando"}`;
        if (Voice.error) { status.className = "text-xs text-rose-300"; status.textContent = Voice.error; }
        else if (ms > 0) { status.className = "text-xs tabular-nums text-zinc-400"; status.textContent = `Has hablado ${Util.mmss(secs)}. Revisa la transcripción y corrige lo que haga falta.`; }
        else { status.className = "text-xs text-zinc-500"; status.textContent = "Objetivo: 60–90 s"; }
      }
      if (ta && !c.evaluated) {
        ta.readOnly = Voice.active;
        ta.classList.toggle("ring-2", Voice.active);
        ta.classList.toggle("ring-rose-400/40", Voice.active);
      }
    },

    deliveryPanel(c) {
      const spoke = c.voice && c.voice.ms >= 5000;
      const social = Session.item.context === "social";
      const hedges = C.countHedges(c.text, { social });

      let pace = "";
      if (spoke) {
        const secs = Math.round(c.voice.ms / 1000);
        const wpm = Math.round(c.voice.words / (c.voice.ms / 60000));
        const [tone, verdict] = wpm < 100 ? ["text-amber-300", "Lento: gana fluidez encadenando chunks completos."]
          : wpm > 170 ? ["text-amber-300", "Rápido: en una reunión, las pausas transmiten control."]
          : ["text-emerald-300", "Buen ritmo profesional (110–160 wpm)."];
        const len = secs < 45 ? "Algo corto para el reto: apunta a 60–90 s."
          : secs > 120 ? (social ? "Largo: en una charla, deja hueco para que el otro participe." : "Largo: en dirección se premia la síntesis.")
          : "Duración adecuada.";
        pace = `<div class="grid grid-cols-2 gap-3">
            <div class="rounded-lg bg-zinc-950/60 px-3 py-2.5"><div class="text-[11px] uppercase tracking-wider text-zinc-500">Tiempo hablado</div><div class="mt-0.5 text-lg font-semibold tabular-nums text-zinc-100">${Util.mmss(secs)}</div></div>
            <div class="rounded-lg bg-zinc-950/60 px-3 py-2.5"><div class="text-[11px] uppercase tracking-wider text-zinc-500">Ritmo</div><div class="mt-0.5 text-lg font-semibold tabular-nums ${tone}">${wpm} <span class="text-xs font-normal text-zinc-500">wpm</span></div></div>
          </div>
          <p class="text-sm text-zinc-300">${verdict} ${len}</p>`;
      }
      if (!spoke && !hedges.length) return "";
      const hedgeHtml = (hedges.length
        ? `<p class="text-sm text-zinc-300"><span class="text-amber-300 font-medium">${social ? "Muletillas de relleno:" : "Restan autoridad:"}</span> ${hedges.map((h) => `<span class="ml-1 rounded bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 text-xs text-amber-200">${Util.esc(h.t)}${h.n > 1 ? ` ×${h.n}` : ""}</span>`).join("")}</p>`
        : `<p class="text-sm text-emerald-300">${social ? "Sin muletillas de relleno: suena fluido." : "Sin muletillas ni atenuadores: suena seguro."}</p>`)
        + (social ? `<p class="text-xs text-zinc-500">En una conversación informal, «I think» o «maybe» son naturales: aquí solo marcamos el relleno.</p>` : "");

      return `<div class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
          <div class="text-[11px] uppercase tracking-wider text-zinc-500">Delivery</div>${pace}${hedgeHtml}</div>`;
    },

    /* ---- SUMMARY ---- */
    summary() {
      const s = Session.s;
      if (!s) return this.home();
      let ok = 0, tot = 0;
      Object.values(s.results).forEach((r) => { ok += r.ok; tot += r.total; });
      const p = Util.pct(ok, tot) ?? 0;
      const st = Stats.streak();
      const minutes = Math.max(1, Math.round((Date.now() - s.startedAt) / 60000));
      const verdict = p >= 85 ? "Muy sólido. Mañana, a por más." : p >= 65 ? "Buen trabajo. Los fallos volverán en tu próximo repaso." : "Sesión útil: ahora sabes exactamente qué reforzar.";

      const rows = s.blocks.map((k) => {
        const m = D.BLOCK_META[k], a = accentOf(k), r = s.results[k], bp = Util.pct(r.ok, r.total);
        return `<div class="space-y-2"><div class="flex justify-between text-sm"><span><span class="font-mono text-xs ${a.text}">B${m.n}</span> <span class="text-zinc-200">${m.title}</span></span>
          <span class="tabular-nums text-zinc-300">${r.ok}/${r.total}</span></div>${this.bar(bp, a.bg)}</div>`;
      }).join("");

      const missLine = ({ kind, it }) => {
        switch (kind) {
          case "register": return `<span class="text-zinc-500">${Util.esc(it.plain)}</span> → <span class="text-zinc-100">${Util.esc(it.c1)}</span>`;
          case "gap": return `<span class="text-zinc-100">${Util.esc(it.sentence.replace("___", it.answer))}</span> <span class="text-zinc-500">· ${Util.esc(it.meaningEs || it.rule)}</span>`;
          case "move": return `<span class="text-zinc-500">${Util.esc(it.situation)}</span> → <span class="text-zinc-100">${Util.esc(it.answer)}</span>`;
          case "trap": return `<span class="text-zinc-500 line-through">${Util.esc(it.wrong)}</span> → <span class="text-zinc-100">${Util.esc(it.right)}</span>`;
          case "listen": return `<span class="text-zinc-100">Audio: ${Util.esc(it.title)}</span> <span class="text-zinc-500">· volverá para que lo escuches de nuevo</span>`;
          case "challenge": return `<span class="text-zinc-100">Reto: ${Util.esc(D.SCENARIOS[it.scenario])}</span> <span class="text-zinc-500">· repásalo con la respuesta modelo</span>`;
          case "card": return `<span class="text-zinc-500">${Util.esc(it.es)}</span> → <span class="text-zinc-100">${Util.esc(it.en)}</span>`;
          default: return "";
        }
      };

      const misses = s.misses.length ? s.misses.map((e) => {
        const a = accentOf(D.POOL_BLOCK[e.pool]);
        return `<li class="flex gap-3 py-3 border-b border-zinc-900 last:border-0 text-sm leading-relaxed"><span class="mt-1.5 w-1.5 h-1.5 rounded-full ${a.bg} shrink-0"></span><div>${missLine(e)}</div></li>`;
      }).join("") : `<li class="py-3 text-sm text-zinc-400">Sin fallos. Impecable.</li>`;

      // Avances y foco (patrones de error antes y después de la sesión).
      const today = Util.today(), errs = Store.state.errors;
      const change = C.Errors.diff(s.statusBefore || {}, C.Errors.statuses(errs, today));
      const focus = C.Errors.ranked(errs, today).slice(0, 3);
      const labelOf = (k) => Util.esc((errs[k] && errs[k].label) || k);
      const patternCard = change.resolved.length || change.worse.length || focus.length
        ? `<div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
            ${change.resolved.length ? `<div><h2 class="text-sm font-semibold text-emerald-300">Avances</h2>
              <ul class="mt-2 space-y-1.5 text-sm text-zinc-200">${change.resolved.map((k) => `<li>✓ Has superado <strong>${labelOf(k)}</strong>: lo has acertado en días distintos sin volver a fallar.</li>`).join("")}</ul></div>` : ""}
            ${change.worse.length ? `<div><h2 class="text-sm font-semibold text-amber-300">Patrones a vigilar</h2>
              <ul class="mt-2 space-y-1.5 text-sm text-zinc-300">${change.worse.map((k) => `<li class="flex flex-wrap items-center gap-2">${labelOf(k)} ${this.statusBadge(C.Errors.status(errs[k], today))}</li>`).join("")}</ul></div>` : ""}
            ${focus.length ? `<div><h2 class="text-sm font-semibold text-zinc-200">Foco para tu próxima sesión</h2>
              <p class="mt-1 text-xs text-zinc-500">La app los prioriza automáticamente en tu próxima sesión.</p>
              <ol class="mt-2 space-y-1.5 text-sm text-zinc-300 list-decimal list-inside">${focus.map((f) => `<li>${Util.esc(f.p.label)} <span class="text-xs text-zinc-500">· ${Util.plural(f.active, "fallo", "fallos")}</span></li>`).join("")}</ol></div>` : ""}
          </div>`
        : "";
      const modeLabel = { full: "Sesión completada", drill: "Refuerzo completado", errors: "Repaso de errores completado" }[s.mode] || "Completado";

      return `
      <section class="max-w-2xl mx-auto space-y-6 fade-in pt-4">
        <div class="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 text-center">
          <p class="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">${modeLabel} · ${minutes} min · ${s.level.toUpperCase()}</p>
          <div class="mt-4 text-6xl font-semibold tabular-nums text-zinc-50">${p}%</div>
          <p class="mt-2 text-sm text-zinc-400">${verdict}</p>
          ${s.mode === "full" ? `<div class="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm text-amber-200">Racha: <strong class="tabular-nums">${st.current}</strong> ${st.current === 1 ? "día" : "días"}</div>` : ""}
        </div>
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">${rows}</div>
        ${patternCard}
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 class="text-sm font-semibold text-zinc-200 mb-1">Para repasar</h2>
          <p class="text-xs text-zinc-500 mb-2">Volverán a aparecer en tus próximas sesiones.</p>
          <ul>${misses}</ul>
        </div>
        <button data-action="home" class="w-full rounded-xl bg-zinc-50 px-6 py-3.5 text-sm font-semibold text-zinc-950 hover:bg-white transition">Volver al panel</button>
      </section>`;
    }
  };

  /* ------------------------------------------------------------------- App */
  const App = {
    view: "home",

    go(view) { this.view = view; Views.render(); },

    init() {
      Store.load();
      Store.requestPersist();
      Speech.init();
      this.bind();
      if (Session.restore()) this.view = "session";
      Views.render();
      this.registerSW();
    },

    /* ---- Copia de seguridad ---- */
    pendingImport: null,
    backupMsg(text, tone = "text-zinc-300") {
      const z = document.getElementById("backup-zone");
      if (z) z.innerHTML = `<p class="${tone}">${Util.esc(text)}</p>`;
    },
    exportProgress() {
      Store.state.settings.lastExport = Util.today();
      Store.save();
      const data = JSON.stringify(C.State.toExport(Store.state), null, 2);
      const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `english20-progreso-${Util.today()}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.go("home");
      this.backupMsg("Copia descargada. Guárdala en OneDrive o en el móvil.", "text-emerald-300");
    },
    async readImport(file) {
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) return this.backupMsg("El archivo es demasiado grande para ser una copia de la app.", "text-rose-300");
      try {
        const next = C.State.fromImport(await file.text());
        this.pendingImport = next;
        const cur = C.State.summary(Store.state), inc = C.State.summary(next);
        const z = document.getElementById("backup-zone");
        if (!z) return;
        z.innerHTML = `<div class="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100 space-y-2">
          <p>Esto <strong>reemplaza</strong> tu progreso actual por el del archivo.</p>
          <ul class="text-xs text-amber-200/90 tabular-nums">
            <li>Ahora: ${Util.plural(cur.sessions, "sesión", "sesiones")} · ${Util.plural(cur.items, "ítem", "ítems")} · ${Util.plural(cur.words, "palabra", "palabras")}</li>
            <li>Archivo: ${Util.plural(inc.sessions, "sesión", "sesiones")} · ${Util.plural(inc.items, "ítem", "ítems")} · ${Util.plural(inc.words, "palabra", "palabras")}</li>
          </ul>
          <div class="flex gap-3 pt-1"><button data-action="import-yes" class="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-zinc-950">Reemplazar</button>
          <button data-action="import-no" class="text-xs hover:underline">Cancelar</button></div></div>`;
      } catch (err) {
        this.pendingImport = null;
        this.backupMsg(err.message || "No se pudo leer el archivo.", "text-rose-300");
      }
    },

    bind() {
      const root = Views.root;

      root.addEventListener("click", (e) => {
        const el = e.target.closest("[data-action]");
        if (!el || el.disabled) return;
        const a = el.dataset.action;
        switch (a) {
          case "start": Session.start("full"); break;
          case "drill": Session.start("drill", el.dataset.block); break;
          case "choose": Session.choose(Number(el.dataset.idx)); break;
          case "lchoose": Session.answerListening(Number(el.dataset.q), Number(el.dataset.idx)); break;
          case "play": Session.playListening(); break;
          case "rate": Session.setRate(Number(el.dataset.rate)); break;
          case "reveal": Session.revealCard(); break;
          case "grade": Session.gradeCard(Number(el.dataset.q)); break;
          case "drill-errors": Session.start("errors"); break;
          case "next": Session.next(); break;
          case "evaluate": Session.evaluateChallenge(); break;
          case "finish-challenge": Session.finishChallenge(); break;
          case "abort": Session.requestExit(); break;
          case "abort-yes": Session.abort(); break;
          case "abort-no": Views.hideExitAsk(); break;
          case "home": Session.s = null; Session.clearSnapshot(); this.go("home"); break;
          case "export": this.exportProgress(); break;
          case "import": { const f = document.getElementById("import-file"); if (f) { f.value = ""; f.click(); } break; }
          case "import-yes":
            if (this.pendingImport) {
              Store.replace(this.pendingImport); this.pendingImport = null; Session.clearSnapshot();
              this.go("home"); this.backupMsg("Progreso importado.", "text-emerald-300");
            }
            break;
          case "import-no": this.pendingImport = null; this.backupMsg(""); break;
          case "dismiss-recovered": Store.dismissRecovered(); this.go("home"); break;
          case "speak": Speech.say(el.dataset.text, { lang: el.dataset.lang || undefined }); break;
          case "mic": Voice.toggle(); break;
          case "level": Store.state.settings.level = el.dataset.level; Store.save(); this.go("home"); break;
          case "add-gloss":
            Content.addWord(el.dataset.en, el.dataset.es, "");
            el.disabled = true; el.textContent = "✓ En tu banco"; el.className = "shrink-0 text-xs text-emerald-400";
            break;
          case "del-word": Content.removeWord(el.dataset.id); this.go("home"); break;
          case "reset-ask":
            document.getElementById("reset-zone").innerHTML =
              `<span class="text-rose-300">¿Seguro? Se borra todo, también tu banco de palabras.</span> <button data-action="reset-yes" class="ml-2 text-rose-400 font-semibold hover:underline">Sí, borrar</button> <button data-action="reset-no" class="ml-2 hover:text-zinc-200">Cancelar</button>`;
            break;
          case "reset-yes": Store.reset(); this.go("home"); break;
          case "reset-no": this.go("home"); break;
        }
      });

      root.addEventListener("submit", (e) => {
        if (e.target.id !== "word-form") return;
        e.preventDefault();
        const en = document.getElementById("w-en").value, es = document.getElementById("w-es").value, ex = document.getElementById("w-ex").value;
        const added = Content.addWord(en, es, ex);
        if (added) { this.go("home"); const msg = document.getElementById("word-msg"); if (msg) msg.textContent = `«${en.trim()}» añadida a tu banco.`; document.getElementById("w-en").focus(); }
        else { const msg = document.getElementById("word-msg"); if (msg) msg.textContent = "Esa palabra ya está en tu banco (o falta el significado)."; }
      });

      root.addEventListener("change", (e) => {
        const el = e.target;
        if (el.dataset.action === "toggle-tts") { Store.state.settings.tts = el.checked; Store.save(); }
        if (el.dataset.action === "voice") { Store.state.settings.voice = el.value; Store.save(); Speech.say("Hi! This is how I sound.", { lang: el.value }); }
        if (el.dataset.action === "check" && Session.s) { Session.s.current.checks[Number(el.dataset.idx)] = el.checked; Session.persist(); }
        if (el.dataset.action === "import-file") this.readImport(el.files && el.files[0]);
      });

      root.addEventListener("input", (e) => {
        if (e.target.id === "challenge-text" && Session.s) {
          Session.s.current.text = e.target.value;
          Views.updateChallengeLive();
          Session.persist();
        }
      });

      // Reloj en pausa con la pestaña oculta; la sesión se guarda al salir o recargar.
      document.addEventListener("visibilitychange", () => {
        if (this.view !== "session" || !Session.s) return;
        if (document.hidden) Session.pause(); else Session.resume();
      });
      window.addEventListener("pagehide", () => { if (this.view === "session" && Session.s) Session.pause(); });

      document.addEventListener("keydown", (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const tag = e.target.tagName;
        const typing = tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT";
        if (this.view === "home" && e.key === "Enter" && !typing && tag !== "BUTTON") { e.preventDefault(); Session.start("full"); return; }
        if (this.view !== "session" || !Session.s) return;
        // Con la confirmación de salida abierta: Esc la cierra y Enter activa el botón enfocado.
        if (Views.exitAsk) { if (e.key === "Escape") { e.preventDefault(); Views.hideExitAsk(); } return; }
        if (e.key === "Escape") { e.preventDefault(); Session.requestExit(); return; }
        if (e.target.id === "card-attempt" && e.key === "Enter") { e.preventDefault(); Session.revealCard(); return; }
        if (typing) return;
        if (/^[1-4]$/.test(e.key) && OPTION_KINDS.includes(Session.kind)) { Session.choose(Number(e.key) - 1); return; }
        if (/^[1-3]$/.test(e.key) && Session.kind === "card" && Session.s.current.revealed && !Session.s.answered) { Session.gradeCard([1, 3, 5][Number(e.key) - 1]); return; }
        if (e.key === "Enter") {
          const btn = document.getElementById("primary-btn");
          if (btn && !btn.disabled) { e.preventDefault(); btn.click(); }
        }
      });
    },

    registerSW() {
      if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
        navigator.serviceWorker.register("./sw.js").catch(() => { /* offline opcional */ });
      }
    }
  };

  App.init();
})();
