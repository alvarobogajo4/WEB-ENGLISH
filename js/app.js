/* =============================================================================
 * English 20 Minutes · C1 Executive — Lógica de la aplicación
 * -----------------------------------------------------------------------------
 * Módulos (IIFE, sin dependencias):
 *   Util      → helpers de fechas, DOM, aleatoriedad
 *   Store     → persistencia en localStorage (versionada, tolerante a fallos)
 *   SRS       → repetición espaciada tipo Leitner (5 cajas) por id de ítem
 *   Stats     → agregados para el dashboard (precisión por bloque / dominio)
 *   Speech    → pronunciación con speechSynthesis
 *   Session   → motor de la sesión de 20 min (4 bloques × 5 min)
 *   Views     → render de pantallas (home, sesión, resumen)
 *   App       → arranque, delegación de eventos, atajos de teclado
 * ========================================================================== */
(function () {
  "use strict";

  const D = window.E20_DATA;
  if (!D) { document.getElementById("app").textContent = "Error: no se pudo cargar data_c1.js"; return; }

  const BLOCK_ORDER = ["registerUpgrade", "collocations", "traps", "challenges"];
  const SESSION_SIZE = { registerUpgrade: 6, collocations: 8, traps: 6, challenges: 1 };
  const BLOCK_SECONDS = 300;

  /* Clases Tailwind completas (el CDN las detecta en el DOM en tiempo de ejecución). */
  const ACCENT = {
    amber:   { text: "text-amber-400",   bg: "bg-amber-400",   soft: "bg-amber-400/10",   border: "border-amber-400/40",   ring: "ring-amber-400/40" },
    sky:     { text: "text-sky-400",     bg: "bg-sky-400",     soft: "bg-sky-400/10",     border: "border-sky-400/40",     ring: "ring-sky-400/40" },
    rose:    { text: "text-rose-400",    bg: "bg-rose-400",    soft: "bg-rose-400/10",    border: "border-rose-400/40",    ring: "ring-rose-400/40" },
    emerald: { text: "text-emerald-400", bg: "bg-emerald-400", soft: "bg-emerald-400/10", border: "border-emerald-400/40", ring: "ring-emerald-400/40" }
  };
  const accentOf = (key) => ACCENT[D.BLOCK_META[key].accent];

  /* ------------------------------------------------------------------ Util */
  const Util = {
    today() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    daysBetween(a, b) {
      const pa = a.split("-").map(Number), pb = b.split("-").map(Number);
      return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
    },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
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
    escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  };

  /* ----------------------------------------------------------------- Store */
  const Store = (() => {
    const KEY = "e20_c1_v1";
    const fresh = () => ({
      version: 1,
      streak: { current: 0, best: 0, lastDate: null },
      items: {},       // id → { box, seen, correct, lastSeen }
      sessions: [],    // { date, ts, score: { blockKey: { ok, total } } }
      settings: { tts: true, voice: "en-GB" }
    });
    let state = fresh();
    let persistent = true;

    function load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const base = fresh();
          state = {
            ...base, ...parsed,
            streak: { ...base.streak, ...(parsed.streak || {}) },
            settings: { ...base.settings, ...(parsed.settings || {}) },
            items: parsed.items || {},
            sessions: Array.isArray(parsed.sessions) ? parsed.sessions : []
          };
        }
      } catch (e) { persistent = false; state = fresh(); }
    }
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(state)); persistent = true; }
      catch (e) { persistent = false; }
    }
    function reset() { state = fresh(); save(); }

    return { load, save, reset, get state() { return state; }, get persistent() { return persistent; } };
  })();

  /* ------------------------------------------------------------------- SRS */
  const SRS = {
    // Días hasta la siguiente revisión según la caja (1..5).
    INTERVAL: { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 },

    isDue(rec, today) {
      return !rec.lastSeen || Util.daysBetween(rec.lastSeen, today) >= this.INTERVAL[rec.box];
    },

    pick(blockKey, n) {
      const pool = D.BLOCKS[blockKey];
      const items = Store.state.items, today = Util.today();
      const due = [], fresh = [], rest = [];
      for (const it of pool) {
        const rec = items[it.id];
        if (!rec) fresh.push(it);
        else if (this.isDue(rec, today)) due.push(it);
        else rest.push(it);
      }
      due.sort((a, b) => items[a.id].box - items[b.id].box || (items[a.id].lastSeen < items[b.id].lastSeen ? -1 : 1));
      // Mezcla: hasta 60 % de repaso pendiente, el resto nuevo; se rellena con lo que quede.
      const maxDue = Math.max(1, Math.ceil(n * 0.6));
      const picked = due.slice(0, maxDue);
      for (const it of Util.shuffle(fresh)) { if (picked.length >= n) break; picked.push(it); }
      for (const it of due.slice(maxDue)) { if (picked.length >= n) break; picked.push(it); }
      rest.sort((a, b) => items[a.id].box - items[b.id].box);
      for (const it of rest) { if (picked.length >= n) break; picked.push(it); }
      return Util.shuffle(picked.slice(0, n));
    },

    record(id, correct) {
      const s = Store.state;
      const rec = s.items[id] || { box: 1, seen: 0, correct: 0, lastSeen: null };
      rec.seen += 1;
      if (correct) { rec.correct += 1; rec.box = Math.min(5, rec.box + 1); }
      else rec.box = 1;
      rec.lastSeen = Util.today();
      s.items[id] = rec;
      Store.save();
    }
  };

  /* ----------------------------------------------------------------- Stats */
  const Stats = {
    index: (() => {
      const map = {};
      for (const key of BLOCK_ORDER) for (const it of D.BLOCKS[key]) map[it.id] = { block: key, domain: it.domain };
      return map;
    })(),

    streak() {
      const st = Store.state.streak, today = Util.today();
      if (!st.lastDate) return { current: 0, best: st.best, doneToday: false };
      const gap = Util.daysBetween(st.lastDate, today);
      return { current: gap <= 1 ? st.current : 0, best: st.best, doneToday: gap === 0 };
    },

    registerSessionDay() {
      const st = Store.state.streak, today = Util.today();
      if (st.lastDate === today) return;
      const gap = st.lastDate ? Util.daysBetween(st.lastDate, today) : null;
      st.current = gap === 1 ? st.current + 1 : 1;
      st.best = Math.max(st.best, st.current);
      st.lastDate = today;
    },

    aggregate() {
      const byBlock = {}, byDomain = {};
      BLOCK_ORDER.forEach((k) => (byBlock[k] = { ok: 0, total: 0, mastered: 0, size: D.BLOCKS[k].length }));
      Object.keys(D.DOMAINS).forEach((k) => (byDomain[k] = { ok: 0, total: 0 }));
      let mastered = 0, seenItems = 0;
      for (const [id, rec] of Object.entries(Store.state.items)) {
        const meta = this.index[id];
        if (!meta) continue; // ítem eliminado del dataset
        seenItems++;
        byBlock[meta.block].ok += rec.correct; byBlock[meta.block].total += rec.seen;
        if (byDomain[meta.domain]) { byDomain[meta.domain].ok += rec.correct; byDomain[meta.domain].total += rec.seen; }
        if (rec.box >= 4) { mastered++; byBlock[meta.block].mastered++; }
      }
      const totalItems = Object.keys(this.index).length;
      return { byBlock, byDomain, mastered, seenItems, totalItems };
    },

    weakestDomain(byDomain) {
      let worst = null;
      for (const [k, v] of Object.entries(byDomain)) {
        if (v.total < 3) continue;
        const p = v.ok / v.total;
        if (!worst || p < worst.p) worst = { key: k, p };
      }
      return worst;
    }
  };

  /* ---------------------------------------------------------------- Speech */
  const Speech = {
    supported: "speechSynthesis" in window,
    voice: null,
    init() {
      if (!this.supported) return;
      const choose = () => {
        const voices = speechSynthesis.getVoices();
        const pref = Store.state.settings.voice;
        this.voice = voices.find((v) => v.lang === pref) || voices.find((v) => v.lang && v.lang.startsWith("en")) || null;
      };
      choose();
      speechSynthesis.onvoiceschanged = choose;
    },
    say(text) {
      if (!this.supported || !Store.state.settings.tts) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = this.voice ? this.voice.lang : Store.state.settings.voice;
      if (this.voice) u.voice = this.voice;
      u.rate = 0.95;
      speechSynthesis.speak(u);
    }
  };

  /* --------------------------------------------------------------- Session */
  const Session = {
    s: null, // estado de la sesión en curso
    timerId: null,

    start(mode, onlyBlock) {
      const blocks = mode === "full" ? BLOCK_ORDER.slice() : [onlyBlock];
      const queue = {};
      for (const k of blocks) {
        const n = mode === "full" ? SESSION_SIZE[k] : (k === "challenges" ? 2 : SESSION_SIZE[k] + 2);
        queue[k] = SRS.pick(k, n);
      }
      this.s = {
        mode, blocks, queue,
        blockIdx: 0, itemIdx: 0,
        results: Object.fromEntries(blocks.map((k) => [k, { ok: 0, total: 0 }])),
        misses: [],
        phase: "intro",        // intro | item | blockDone
        answered: false,
        current: null,         // datos derivados del ítem actual (opciones barajadas, etc.)
        blockStartedAt: null,
        startedAt: Date.now()
      };
      this.prepareItem();
      App.view = "session";
      Views.render();
    },

    get blockKey() { return this.s.blocks[this.s.blockIdx]; },
    get item() { return this.s.queue[this.blockKey][this.s.itemIdx]; },
    get blockLength() { return this.s.queue[this.blockKey].length; },

    prepareItem() {
      const k = this.blockKey, it = this.item;
      const c = { selected: null };
      if (k === "registerUpgrade") c.options = Util.shuffle([it.c1, ...it.distractors]);
      if (k === "collocations")    c.options = Util.shuffle(it.options);
      if (k === "traps")           c.options = Util.shuffle([it.right, it.wrong, it.alt]);
      if (k === "challenges")      Object.assign(c, { text: "", evaluated: false, checks: it.selfCheck.map(() => false) });
      this.s.current = c;
      this.s.answered = false;
    },

    correctOption() {
      const it = this.item;
      return { registerUpgrade: it.c1, collocations: it.answer, traps: it.right }[this.blockKey];
    },

    beginBlock() {
      this.s.phase = "item";
      this.s.blockStartedAt = Date.now();
      this.startTimer();
      Views.render();
    },

    startTimer() {
      this.stopTimer();
      this.timerId = setInterval(() => Views.updateTimer(), 1000);
    },
    stopTimer() { if (this.timerId) clearInterval(this.timerId); this.timerId = null; },
    remaining() {
      if (!this.s || !this.s.blockStartedAt) return BLOCK_SECONDS;
      return BLOCK_SECONDS - Math.floor((Date.now() - this.s.blockStartedAt) / 1000);
    },

    choose(optIdx) {
      const s = this.s;
      if (s.phase !== "item" || s.answered || !s.current.options) return;
      const choice = s.current.options[optIdx];
      if (choice === undefined) return;
      const ok = choice === this.correctOption();
      s.current.selected = optIdx;
      s.answered = true;
      this.score(ok);
      if (ok) Speech.say(this.blockKey === "collocations" ? this.item.sentence.replace("___", this.item.answer) : choice);
      Views.render();
    },

    score(ok) {
      const s = this.s, k = this.blockKey, it = this.item;
      s.results[k].total += 1;
      if (ok) s.results[k].ok += 1;
      else s.misses.push({ block: k, item: it });
      SRS.record(it.id, ok);
    },

    challengeHits(text) {
      return this.item.mustUse.map((u) => new RegExp(u.m, "i").test(text));
    },

    evaluateChallenge() {
      const c = this.s.current;
      if (c.evaluated) return;
      c.evaluated = true;
      Views.render();
    },

    finishChallenge() {
      const c = this.s.current, it = this.item;
      if (this.s.answered) return;
      const hits = this.challengeHits(c.text).filter(Boolean).length / it.mustUse.length;
      const checks = c.checks.filter(Boolean).length / it.selfCheck.length;
      const score = hits * 0.5 + checks * 0.5;
      c.finalScore = Math.round(score * 100);
      this.s.answered = true;
      this.score(score >= 0.6);
      Views.render();
    },

    next() {
      const s = this.s;
      if (s.phase === "intro") return this.beginBlock();
      if (s.phase === "blockDone") return this.nextBlock();
      if (!s.answered) return;
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
      if (s.mode === "full") {
        Stats.registerSessionDay();
        Store.state.sessions.push({ date: Util.today(), ts: Date.now(), score: s.results });
        if (Store.state.sessions.length > 120) Store.state.sessions = Store.state.sessions.slice(-120);
        Store.save();
      }
      App.go("summary");
    },

    abort() {
      this.stopTimer();
      this.s = null;
      App.go("home");
    }
  };

  /* ----------------------------------------------------------------- Views */
  const Views = {
    root: document.getElementById("app"),

    render() {
      const v = App.view;
      this.root.innerHTML = v === "home" ? this.home() : v === "session" ? this.session() : this.summary();
      if (v === "session") this.afterSessionRender();
      window.scrollTo({ top: 0 });
    },

    /* ---- piezas reutilizables ---- */
    speakBtn(text, label = "Escuchar") {
      if (!Speech.supported || !Store.state.settings.tts) return "";
      return `<button type="button" data-action="speak" data-text="${Util.esc(text)}" class="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition" aria-label="${label}">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>${label}</button>`;
    },
    badge(text, cls = "bg-zinc-800 text-zinc-300") {
      return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${cls}">${Util.esc(text)}</span>`;
    },
    bar(p, colorCls) {
      const w = p === null ? 0 : p;
      return `<div class="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden"><div class="h-full rounded-full ${colorCls}" style="width:${w}%"></div></div>`;
    },
    highlight(text, chunks) {
      let html = Util.esc(text);
      for (const ch of chunks) {
        const re = new RegExp(`(${Util.escRe(Util.esc(ch))})`, "i");
        html = html.replace(re, '<mark class="bg-transparent text-amber-300 font-semibold underline decoration-amber-400/50 underline-offset-4">$1</mark>');
      }
      return html;
    },

    /* ---- HOME ---- */
    home() {
      const st = Stats.streak();
      const ag = Stats.aggregate();
      const weak = Stats.weakestDomain(ag.byDomain);
      const recent = Store.state.sessions.slice(-14);
      const sessionsTotal = Store.state.sessions.length;

      const blockRows = BLOCK_ORDER.map((k) => {
        const m = D.BLOCK_META[k], a = accentOf(k), b = ag.byBlock[k];
        const p = Util.pct(b.ok, b.total);
        return `<div class="space-y-2">
          <div class="flex items-baseline justify-between gap-3">
            <div class="min-w-0"><span class="font-mono text-xs ${a.text}">B${m.n}</span> <span class="text-sm text-zinc-200">${m.title}</span></div>
            <div class="text-right shrink-0"><span class="text-sm font-semibold tabular-nums text-zinc-100">${p === null ? "—" : p + "%"}</span>
            <span class="text-xs text-zinc-500 ml-2 tabular-nums">${b.mastered}/${b.size}</span></div>
          </div>${this.bar(p, a.bg)}</div>`;
      }).join("");

      const domainCells = Object.entries(D.DOMAINS).map(([k, d]) => {
        const v = ag.byDomain[k], p = Util.pct(v.ok, v.total);
        const tone = p === null ? "text-zinc-500" : p >= 80 ? "text-emerald-400" : p >= 60 ? "text-amber-400" : "text-rose-400";
        return `<div class="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5">
          <div class="text-[11px] uppercase tracking-wider text-zinc-500">${d.es}</div>
          <div class="mt-0.5 text-lg font-semibold tabular-nums ${tone}">${p === null ? "—" : p + "%"}</div></div>`;
      }).join("");

      const spark = recent.length ? recent.map((ses) => {
        let ok = 0, tot = 0; Object.values(ses.score).forEach((r) => { ok += r.ok; tot += r.total; });
        const p = Util.pct(ok, tot) || 0;
        return `<div class="flex-1 max-w-[28px] flex flex-col justify-end h-16" title="${ses.date}: ${p}%"><div class="rounded-sm bg-zinc-600 hover:bg-zinc-400 transition" style="height:${Math.max(6, p)}%"></div></div>`;
      }).join("") : "";

      const drillBtns = BLOCK_ORDER.map((k) => {
        const m = D.BLOCK_META[k], a = accentOf(k);
        return `<button data-action="drill" data-block="${k}" class="group text-left rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-900 p-4 transition">
          <div class="flex items-center justify-between"><span class="font-mono text-xs ${a.text}">BLOQUE ${m.n}</span><span class="text-zinc-600 group-hover:text-zinc-300 transition">→</span></div>
          <div class="mt-1.5 text-sm font-medium text-zinc-100">${m.title}</div>
          <div class="mt-0.5 text-xs text-zinc-500 leading-snug">${m.subtitle}</div></button>`;
      }).join("");

      return `
      <section class="space-y-6 fade-in">
        <div class="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:p-8">
          <div class="flex flex-wrap items-start justify-between gap-6">
            <div class="max-w-md">
              <p class="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Sesión diaria · 4 bloques × 5 min</p>
              <h1 class="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-50">${st.doneToday ? "Sesión de hoy completada." : "Tus 20 minutos de hoy."}</h1>
              <p class="mt-2 text-sm text-zinc-400 leading-relaxed">${st.doneToday
                ? "Puedes repetir otra sesión o reforzar un bloque concreto. El repaso espaciado prioriza lo que fallas."
                : "De B2 a C1 ejecutivo: registro, colocaciones, trampas del español corporativo y producción real."}</p>
            </div>
            <div class="flex gap-6">
              <div><div class="text-[11px] uppercase tracking-wider text-zinc-500">Racha</div>
                <div class="mt-1 flex items-baseline gap-1"><span class="text-4xl font-semibold tabular-nums ${st.current ? "text-amber-400" : "text-zinc-600"}">${st.current}</span><span class="text-sm text-zinc-500">${st.current === 1 ? "día" : "días"}</span></div></div>
              <div><div class="text-[11px] uppercase tracking-wider text-zinc-500">Mejor</div>
                <div class="mt-1 text-4xl font-semibold tabular-nums text-zinc-300">${st.best}</div></div>
            </div>
          </div>
          <button data-action="start" class="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-50 px-6 py-3.5 text-sm font-semibold text-zinc-950 hover:bg-white active:scale-[.99] transition shadow-lg shadow-black/30">
            ${st.doneToday ? "Nueva sesión de 20 min" : "Empezar sesión de 20 min"} <kbd class="hidden sm:inline font-mono text-[10px] text-zinc-500 border border-zinc-300 rounded px-1">Enter</kbd>
          </button>
        </div>

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
              <h2 class="text-sm font-semibold text-zinc-200">Vocabulario dominado</h2>
              <span class="text-xs text-zinc-500 tabular-nums">${sessionsTotal} ${sessionsTotal === 1 ? "sesión" : "sesiones"}</span>
            </div>
            <div class="flex items-baseline gap-2"><span class="text-4xl font-semibold tabular-nums text-zinc-50">${ag.mastered}</span><span class="text-sm text-zinc-500">/ ${ag.totalItems} ítems</span></div>
            ${this.bar(Util.pct(ag.mastered, ag.totalItems), "bg-zinc-300")}
            <p class="text-xs text-zinc-500 leading-relaxed">Un ítem está dominado cuando lo aciertas en 3 repasos espaciados seguidos (caja 4 o más).</p>
            ${recent.length ? `<div><div class="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">Últimas sesiones</div><div class="flex items-end gap-1">${spark}</div></div>` : ""}
          </div>
        </div>

        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div class="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <h2 class="text-sm font-semibold text-zinc-200">Precisión por ámbito</h2>
            ${weak ? `<span class="text-xs text-rose-300/90">Punto débil: <strong>${D.DOMAINS[weak.key].es}</strong></span>` : `<span class="text-xs text-zinc-500">Se activa con algo de práctica</span>`}
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">${domainCells}</div>
        </div>

        <div>
          <h2 class="text-sm font-semibold text-zinc-200 mb-3">Refuerzo por bloque <span class="font-normal text-zinc-500">· no cuenta para la racha</span></h2>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">${drillBtns}</div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-900 pt-5 text-xs text-zinc-500">
          <label class="inline-flex items-center gap-2 cursor-pointer select-none ${Speech.supported ? "" : "opacity-40 pointer-events-none"}">
            <input type="checkbox" data-action="toggle-tts" class="accent-zinc-300" ${Store.state.settings.tts ? "checked" : ""}> Pronunciación (voz)
          </label>
          ${Speech.supported ? `<label class="inline-flex items-center gap-2">Acento
            <select data-action="voice" class="bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1 text-zinc-300">
              <option value="en-GB" ${Store.state.settings.voice === "en-GB" ? "selected" : ""}>British</option>
              <option value="en-US" ${Store.state.settings.voice === "en-US" ? "selected" : ""}>American</option>
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
            <button data-action="abort" class="text-xs text-zinc-500 hover:text-zinc-200 transition">✕ Salir</button>
            <div class="text-center min-w-0">
              <span class="font-mono text-[11px] ${a.text}">BLOQUE ${m.n} · MIN ${m.minutes}</span>
            </div>
            <div id="timer" class="font-mono text-sm tabular-nums text-zinc-300 w-14 text-right">${s.phase === "item" ? Util.mmss(S.remaining()) : "05:00"}</div>
          </div>
          <div class="mt-3 flex gap-1.5">${segments}</div>
        </div>`;

      let body = "";
      if (s.phase === "intro") body = this.blockIntro(k);
      else if (s.phase === "blockDone") body = this.blockDone(k);
      else body = this[`item_${k}`]();

      return `<section class="max-w-2xl mx-auto">${header}<div class="pt-4 pb-28 fade-in">${body}</div></section>`;
    },

    blockIntro(k) {
      const m = D.BLOCK_META[k], a = accentOf(k), n = Session.blockLength;
      const how = {
        registerUpgrade: "Verás una frase correcta pero plana. Elige la versión que diría un directivo C1.",
        collocations: "Completa el hueco con el phrasal verb o la colocación que usaría un nativo en ese contexto.",
        traps: "Te damos la idea en español. Elige la única versión en inglés que no cae en la trampa.",
        challenges: "Lee el escenario y escribe tu respuesta (60–90 s hablados ≈ 60–100 palabras). Usa los chunks obligatorios."
      }[k];
      return `
        <div class="rounded-2xl border ${a.border} ${a.soft} p-6 sm:p-8">
          <div class="font-mono text-xs ${a.text}">BLOQUE ${m.n} DE 4 · ${n} ${k === "challenges" ? (n > 1 ? "retos" : "reto") : "ítems"}</div>
          <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">${m.title}</h2>
          <p class="mt-1 text-sm text-zinc-400">${m.subtitle}</p>
          <p class="mt-5 text-sm leading-relaxed text-zinc-300">${how}</p>
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

    optionList(options, correct, selectedIdx, answered, renderText = (t) => Util.esc(t)) {
      return `<div class="space-y-2.5" role="list">${options.map((o, i) => {
        let cls = "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-900";
        let mark = `<span class="font-mono text-[11px] text-zinc-500 border border-zinc-700 rounded w-5 h-5 inline-flex items-center justify-center shrink-0">${i + 1}</span>`;
        if (answered) {
          if (o === correct) { cls = "border-emerald-500/60 bg-emerald-500/10"; mark = `<span class="text-emerald-400 w-5 shrink-0 text-center">✓</span>`; }
          else if (i === selectedIdx) { cls = "border-rose-500/60 bg-rose-500/10"; mark = `<span class="text-rose-400 w-5 shrink-0 text-center">✕</span>`; }
          else cls = "border-zinc-900 bg-zinc-900/30 opacity-50";
        }
        return `<button data-action="choose" data-idx="${i}" ${answered ? "disabled" : ""} class="w-full flex items-start gap-3 text-left rounded-xl border ${cls} px-4 py-3.5 text-[15px] leading-snug text-zinc-100 transition">${mark}<span>${renderText(o)}</span></button>`;
      }).join("")}</div>`;
    },

    feedbackBox(ok, inner) {
      return `<div class="mt-5 rounded-xl border ${ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"} p-5 space-y-3 fade-in">
        <div class="text-xs font-semibold uppercase tracking-wider ${ok ? "text-emerald-400" : "text-rose-400"}">${ok ? "Correcto" : "No exactamente"}</div>${inner}</div>`;
    },

    itemHead() {
      const S = Session, it = S.item;
      return `<div class="flex items-center justify-between mb-4">
        <div class="flex gap-2">${this.badge(D.DOMAINS[it.domain].es)}${it.type ? this.badge(it.type) : ""}${it.category ? this.badge(D.TRAP_CATEGORIES[it.category], "bg-rose-500/10 text-rose-300") : ""}${it.scenario ? this.badge(D.SCENARIOS[it.scenario], "bg-emerald-500/10 text-emerald-300") : ""}</div>
        <span class="font-mono text-xs text-zinc-500 tabular-nums">${S.s.itemIdx + 1}/${S.blockLength}</span></div>`;
    },

    item_registerUpgrade() {
      const S = Session, it = S.item, c = S.s.current, ok = c.options[c.selected] === it.c1;
      return `${this.itemHead()}
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 mb-5">
          <div class="text-[11px] uppercase tracking-wider text-zinc-500">Frase plana (B1–B2)</div>
          <p class="mt-1.5 text-lg text-zinc-400 line-through decoration-zinc-700">${Util.esc(it.plain)}</p>
        </div>
        <p class="text-sm text-zinc-300 mb-3">¿Cuál es el upgrade ejecutivo C1?</p>
        ${this.optionList(c.options, it.c1, c.selected, S.s.answered)}
        ${S.s.answered ? this.feedbackBox(ok, `
          <p class="text-[17px] leading-relaxed text-zinc-50">${this.highlight(it.c1, it.chunks)}</p>
          <div class="flex flex-wrap gap-1.5">${it.chunks.map((ch) => `<span class="rounded-md bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 text-xs text-amber-200">${Util.esc(ch)}</span>`).join("")}</div>
          <p class="text-sm text-zinc-400 leading-relaxed">${Util.esc(it.whyItWorks)}</p>
          ${this.speakBtn(it.c1)}`) : ""}
        ${this.footer("Siguiente", S.s.answered)}`;
    },

    item_collocations() {
      const S = Session, it = S.item, c = S.s.current, ok = c.options[c.selected] === it.answer;
      const [pre, post] = it.sentence.split("___");
      const filled = S.s.answered
        ? `<span class="${ok ? "text-emerald-300" : "text-sky-300"} font-semibold underline decoration-2 underline-offset-4">${Util.esc(it.answer)}</span>`
        : `<span class="inline-block min-w-[5rem] border-b-2 border-dashed border-sky-400/60 mx-1">&nbsp;</span>`;
      return `${this.itemHead()}
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 mb-5">
          <p class="text-xl leading-relaxed text-zinc-100">${Util.esc(pre)}${filled}${Util.esc(post)}</p>
        </div>
        ${this.optionList(c.options, it.answer, c.selected, S.s.answered)}
        ${S.s.answered ? this.feedbackBox(ok, `
          <div class="flex items-baseline gap-2 flex-wrap"><span class="text-lg font-semibold text-sky-300">${Util.esc(it.answer)}</span><span class="text-sm text-zinc-400">— ${Util.esc(it.meaningEs)}</span></div>
          <p class="text-sm text-zinc-300 italic">“${Util.esc(it.example)}”</p>
          <div class="flex gap-4">${this.speakBtn(it.sentence.replace("___", it.answer), "Frase")}${this.speakBtn(it.example, "Ejemplo")}</div>`) : ""}
        ${this.footer("Siguiente", S.s.answered)}`;
    },

    item_traps() {
      const S = Session, it = S.item, c = S.s.current, ok = c.options[c.selected] === it.right;
      return `${this.itemHead()}
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 mb-5">
          <div class="text-[11px] uppercase tracking-wider text-zinc-500">Lo que quieres decir</div>
          <p class="mt-1.5 text-lg text-zinc-200"><span class="font-mono text-[11px] align-middle text-zinc-500 border border-zinc-700 rounded px-1 mr-1.5">ES</span>${Util.esc(it.spanishSource)}</p>
        </div>
        <p class="text-sm text-zinc-300 mb-3">Solo una versión es correcta y natural. ¿Cuál?</p>
        ${this.optionList(c.options, it.right, c.selected, S.s.answered)}
        ${S.s.answered ? this.feedbackBox(ok, `
          <p class="text-sm leading-relaxed text-zinc-200"><span class="font-semibold text-rose-300">La trampa:</span> ${Util.esc(it.trap)}</p>
          <div class="text-sm space-y-1">
            <div class="text-zinc-500 line-through">${Util.esc(it.wrong)}</div>
            <div class="text-emerald-300">${Util.esc(it.right)}</div>
          </div>${this.speakBtn(it.right)}`) : ""}
        ${this.footer("Siguiente", S.s.answered)}`;
    },

    item_challenges() {
      const S = Session, it = S.item, c = S.s.current;
      const hits = S.challengeHits(c.text);
      const words = c.text.trim() ? c.text.trim().split(/\s+/).length : 0;

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
            <div class="flex items-center justify-between"><div class="text-[11px] uppercase tracking-wider text-emerald-400">Respuesta modelo C1</div>${this.speakBtn(it.modelAnswer)}</div>
            <p class="text-[15px] leading-relaxed text-zinc-100">${this.highlight(it.modelAnswer, it.mustUse.map((u) => u.t))}</p>
          </div>
          ${S.s.answered ? `<div class="text-center text-sm text-zinc-300">Puntuación del reto: <span class="font-semibold tabular-nums ${c.finalScore >= 60 ? "text-emerald-400" : "text-amber-400"}">${c.finalScore}%</span> <span class="text-zinc-500">(50% chunks · 50% rúbrica)</span></div>` : ""}
        </div>` : "";

      let footerBtn;
      if (!c.evaluated) footerBtn = this.footer("Evaluar respuesta", words >= 15, "evaluate", words >= 15 ? "" : `${words}/15 palabras mínimo`);
      else if (!S.s.answered) footerBtn = this.footer("Registrar y continuar", true, "finish-challenge");
      else footerBtn = this.footer("Siguiente", true);

      return `${this.itemHead()}
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
        <textarea id="challenge-text" ${c.evaluated ? "readonly" : ""} rows="7" spellcheck="true" lang="en" placeholder="Write your answer in English… (también puedes decirla en voz alta y luego escribirla)"
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

    afterSessionRender() {
      this.updateTimer();
      const ta = document.getElementById("challenge-text");
      if (ta && !Session.s.current.evaluated) {
        ta.focus();
        ta.setSelectionRange(ta.value.length, ta.value.length);
      }
    },

    updateTimer() {
      const el = document.getElementById("timer");
      if (!el || !Session.s || Session.s.phase !== "item") return;
      const r = Session.remaining();
      el.textContent = Util.mmss(r);
      el.className = `font-mono text-sm tabular-nums w-14 text-right ${r < 0 ? "text-amber-400" : r <= 30 ? "text-amber-300 animate-pulse" : "text-zinc-300"}`;
    },

    /* Actualiza el contador y los chips del reto sin re-renderizar (mantiene el foco). */
    updateChallengeLive() {
      const c = Session.s.current, it = Session.item;
      const hits = Session.challengeHits(c.text);
      const words = c.text.trim() ? c.text.trim().split(/\s+/).length : 0;
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

    /* ---- SUMMARY ---- */
    summary() {
      const s = Session.s;
      if (!s) return this.home();
      let ok = 0, tot = 0;
      Object.values(s.results).forEach((r) => { ok += r.ok; tot += r.total; });
      const p = Util.pct(ok, tot) ?? 0;
      const st = Stats.streak();
      const minutes = Math.max(1, Math.round((Date.now() - s.startedAt) / 60000));
      const verdict = p >= 85 ? "Nivel ejecutivo. Sube la exigencia mañana." : p >= 65 ? "Buen trabajo. Los fallos volverán en tu próximo repaso." : "Sesión útil: ahora sabes exactamente qué reforzar.";

      const rows = s.blocks.map((k) => {
        const m = D.BLOCK_META[k], a = accentOf(k), r = s.results[k], bp = Util.pct(r.ok, r.total);
        return `<div class="space-y-2"><div class="flex justify-between text-sm"><span><span class="font-mono text-xs ${a.text}">B${m.n}</span> <span class="text-zinc-200">${m.title}</span></span>
          <span class="tabular-nums text-zinc-300">${r.ok}/${r.total}</span></div>${this.bar(bp, a.bg)}</div>`;
      }).join("");

      const misses = s.misses.length ? s.misses.map(({ block, item }) => {
        const a = accentOf(block);
        let line = "";
        if (block === "registerUpgrade") line = `<span class="text-zinc-500">${Util.esc(item.plain)}</span> → <span class="text-zinc-100">${Util.esc(item.c1)}</span>`;
        if (block === "collocations") line = `<span class="text-zinc-100">${Util.esc(item.sentence.replace("___", item.answer))}</span> <span class="text-zinc-500">· ${Util.esc(item.meaningEs)}</span>`;
        if (block === "traps") line = `<span class="text-zinc-500 line-through">${Util.esc(item.wrong)}</span> → <span class="text-zinc-100">${Util.esc(item.right)}</span>`;
        if (block === "challenges") line = `<span class="text-zinc-100">Reto: ${Util.esc(D.SCENARIOS[item.scenario])}</span> <span class="text-zinc-500">· repásalo con la respuesta modelo</span>`;
        return `<li class="flex gap-3 py-3 border-b border-zinc-900 last:border-0 text-sm leading-relaxed"><span class="mt-1.5 w-1.5 h-1.5 rounded-full ${a.bg} shrink-0"></span><div>${line}</div></li>`;
      }).join("") : `<li class="py-3 text-sm text-zinc-400">Sin fallos. Impecable.</li>`;

      return `
      <section class="max-w-2xl mx-auto space-y-6 fade-in pt-4">
        <div class="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 text-center">
          <p class="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">${s.mode === "full" ? "Sesión completada" : "Refuerzo completado"} · ${minutes} min</p>
          <div class="mt-4 text-6xl font-semibold tabular-nums text-zinc-50">${p}%</div>
          <p class="mt-2 text-sm text-zinc-400">${verdict}</p>
          ${s.mode === "full" ? `<div class="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm text-amber-200">Racha: <strong class="tabular-nums">${st.current}</strong> ${st.current === 1 ? "día" : "días"}</div>` : ""}
        </div>
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">${rows}</div>
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
      Speech.init();
      this.bind();
      this.render();
      this.registerSW();
    },

    render() { Views.render(); },

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
          case "next": Session.next(); break;
          case "evaluate": Session.evaluateChallenge(); break;
          case "finish-challenge": Session.finishChallenge(); break;
          case "abort": Session.abort(); break;
          case "home": Session.s = null; this.go("home"); break;
          case "speak": Speech.say(el.dataset.text); break;
          case "reset-ask":
            document.getElementById("reset-zone").innerHTML =
              `<span class="text-rose-300">¿Seguro? Se borra todo.</span> <button data-action="reset-yes" class="ml-2 text-rose-400 font-semibold hover:underline">Sí, borrar</button> <button data-action="reset-no" class="ml-2 hover:text-zinc-200">Cancelar</button>`;
            break;
          case "reset-yes": Store.reset(); this.go("home"); break;
          case "reset-no": this.go("home"); break;
        }
      });

      root.addEventListener("change", (e) => {
        const el = e.target;
        if (el.dataset.action === "toggle-tts") { Store.state.settings.tts = el.checked; Store.save(); this.go("home"); }
        if (el.dataset.action === "voice") { Store.state.settings.voice = el.value; Store.save(); Speech.init(); }
        if (el.dataset.action === "check" && Session.s) { Session.s.current.checks[Number(el.dataset.idx)] = el.checked; }
      });

      root.addEventListener("input", (e) => {
        if (e.target.id === "challenge-text" && Session.s) {
          Session.s.current.text = e.target.value;
          Views.updateChallengeLive();
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const tag = e.target.tagName;
        const typing = tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT";
        if (this.view === "home" && e.key === "Enter" && !typing && tag !== "BUTTON") { e.preventDefault(); Session.start("full"); return; }
        if (this.view !== "session" || !Session.s) return;
        if (typing) return;
        if (/^[1-4]$/.test(e.key)) { Session.choose(Number(e.key) - 1); return; }
        if (e.key === "Enter") {
          const btn = document.getElementById("primary-btn");
          if (btn && !btn.disabled) { e.preventDefault(); btn.click(); }
        }
        if (e.key === "Escape") Session.abort();
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
