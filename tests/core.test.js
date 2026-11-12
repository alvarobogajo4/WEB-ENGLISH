/* Tests del núcleo puro. Ejecutar: npm test  (o: node --test tests/) */
const test = require("node:test");
const assert = require("node:assert/strict");
const { Util, SRS, Errors, Mastery, Level, Streak, State, Bank, countHedges } = require("../js/core.js");

/* Registro SM-2 abreviado para los tests. */
const R = (o = {}) => ({ ...SRS.blank(), seen: 1, correct: 1, ...o });

/* ------------------------------------------------------------------ Util */
test("daysBetween cruza meses, años y años bisiestos", () => {
  assert.equal(Util.daysBetween("2026-01-31", "2026-02-01"), 1);
  assert.equal(Util.daysBetween("2026-12-31", "2027-01-01"), 1);
  assert.equal(Util.daysBetween("2028-02-28", "2028-03-01"), 2);
  assert.equal(Util.daysBetween("2026-03-28", "2026-03-30"), 2); // cambio de hora en España
  assert.equal(Util.daysBetween("2026-11-11", "2026-11-11"), 0);
});

test("addDays cruza meses, años y bisiestos", () => {
  assert.equal(Util.addDays("2026-11-30", 1), "2026-12-01");
  assert.equal(Util.addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(Util.addDays("2028-02-28", 1), "2028-02-29");
  assert.equal(Util.addDays("2026-03-28", 2), "2026-03-30");
  assert.equal(Util.addDays("2026-11-12", 0), "2026-11-12");
});

test("today usa la fecha local con ceros a la izquierda", () => {
  assert.equal(Util.today(new Date(2026, 0, 5, 23, 59)), "2026-01-05");
});

test("esc escapa los caracteres peligrosos para innerHTML", () => {
  assert.equal(Util.esc(`<img src=x onerror="a('b')">&`), "&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;");
});

test("mmss marca el tiempo extra con +", () => {
  assert.equal(Util.mmss(300), "05:00");
  assert.equal(Util.mmss(-75), "+01:15");
});

/* ------------------------------------------------------------- SRS (SM-2) */
test("SM-2: aciertos seguidos dan intervalos 1 → 6 → 15 días", () => {
  let r = SRS.nextRecord(undefined, 4, "2026-11-01");
  assert.equal(r.interval, 1); assert.equal(r.due, "2026-11-02"); assert.equal(r.reps, 1);
  r = SRS.nextRecord(r, 4, "2026-11-02");
  assert.equal(r.interval, 6); assert.equal(r.due, "2026-11-08");
  r = SRS.nextRecord(r, 4, "2026-11-08");
  assert.equal(r.interval, 15); assert.equal(r.reps, 3);
  assert.equal(r.ef, 2.5); // calidad 4 no mueve el factor
  assert.ok(SRS.isMastered(r));
});

test("SM-2: calidad 5 sube el factor y 3 lo baja (intervalos más largos o más cortos)", () => {
  assert.equal(SRS.nextEf(2.5, 5), 2.6);
  assert.equal(SRS.nextEf(2.5, 3), 2.36);
  assert.equal(SRS.nextEf(1.3, 0), 1.3); // suelo en 1,3
});

test("SM-2: true/false equivalen a calidad 4 y 1", () => {
  assert.equal(SRS.quality(true), 4);
  assert.equal(SRS.quality(false), 1);
  assert.equal(SRS.quality(9), 5);
  assert.equal(SRS.quality("x"), 1);
});

test("acertar otra vez el mismo día NO avanza el calendario (no tocaba repaso)", () => {
  let r = SRS.nextRecord(undefined, true, "2026-11-11");
  r = SRS.nextRecord(r, true, "2026-11-11");
  r = SRS.nextRecord(r, 5, "2026-11-11");
  assert.equal(r.reps, 1);
  assert.equal(r.due, "2026-11-12");
  assert.equal(r.ef, 2.5);
  assert.equal(r.seen, 3);
  assert.equal(r.correct, 3);
});

test("acertar en la fecha de repaso avanza; antes de tiempo no", () => {
  const r = R({ reps: 2, interval: 6, due: "2026-11-07", lastSeen: "2026-11-01" });
  assert.equal(SRS.nextRecord(r, 4, "2026-11-06").reps, 2); // aún no toca
  assert.equal(SRS.nextRecord(r, 4, "2026-11-07").reps, 3); // toca
  assert.equal(SRS.nextRecord(r, 4, "2026-11-20").interval, 15); // atrasado: también cuenta
});

test("un fallo reinicia el ítem para hoy aunque no tocara, y baja el factor", () => {
  const r = SRS.nextRecord(R({ reps: 4, interval: 38, due: "2026-12-10", lastSeen: "2026-11-02", ef: 2.5 }), false, "2026-11-11");
  assert.equal(r.reps, 0);
  assert.equal(r.interval, 0);
  assert.equal(r.due, "2026-11-11");
  assert.equal(r.lapses, 1);
  assert.ok(r.ef < 2.5);
  assert.equal(r.correct, 1);
});

test("tras un fallo, acertar el mismo día sí avanza (intervalo 0 → 1 día)", () => {
  let r = SRS.nextRecord(R({ reps: 2, interval: 6, due: "2026-11-07" }), false, "2026-11-11");
  r = SRS.nextRecord(r, true, "2026-11-11");
  assert.equal(r.reps, 1);
  assert.equal(r.due, "2026-11-12");
});

test("el intervalo tiene tope de 180 días", () => {
  const r = SRS.nextRecord(R({ reps: 8, interval: 170, due: "2026-11-01", ef: 2.8 }), 5, "2026-11-01");
  assert.equal(r.interval, 180);
});

test("migración Leitner → SM-2 conserva el calendario", () => {
  const r = SRS.fromLegacy({ box: 3, seen: 4, correct: 3, lastSeen: "2026-11-10" });
  assert.deepEqual(r, { ef: 2.5, reps: 2, interval: 3, due: "2026-11-13", seen: 4, correct: 3, lapses: 0, lastSeen: "2026-11-10" });
  assert.equal(SRS.fromLegacy({ box: 1, lastSeen: "2026-11-10" }).due, "2026-11-10"); // fallado: tocaba ya
  assert.ok(SRS.isMastered(SRS.fromLegacy({ box: 4, lastSeen: "2026-11-10" }))); // caja 4 = dominado
  // Tras migrar, el siguiente acierto sigue la secuencia SM-2.
  assert.equal(SRS.nextRecord(r, 4, "2026-11-13").interval, 8);
});

test("pickFrom: pendientes primero (máx. 60 %), luego nuevos", () => {
  const list = Array.from({ length: 10 }, (_, i) => ({ id: `X-${i}` }));
  const items = {};
  for (let i = 0; i < 6; i++) items[`X-${i}`] = R({ due: "2026-11-02", lastSeen: "2026-11-01" }); // 6 pendientes
  const out = SRS.pickFrom(list, 5, items, "2026-11-11", false, () => 0);
  const due = out.filter((it) => items[it.id]).length;
  assert.equal(out.length, 5);
  assert.equal(due, 3); // ceil(5 * 0.6)
  assert.equal(new Set(out.map((x) => x.id)).size, 5);
});

test("pickFrom con onlyDue no rellena con ítems que no tocan", () => {
  const list = [{ id: "A" }, { id: "B" }];
  const items = { A: R({ reps: 3, due: "2026-11-25", lastSeen: "2026-11-10" }), B: R({ reps: 3, due: "2026-11-25", lastSeen: "2026-11-10" }) };
  assert.deepEqual(SRS.pickFrom(list, 2, items, "2026-11-11", true), []);
  assert.equal(SRS.pickFrom(list, 2, items, "2026-11-11", false).length, 2);
});

test("pickFrom prioriza el pendiente más atrasado", () => {
  const list = [{ id: "recent" }, { id: "old" }];
  const items = { recent: R({ due: "2026-11-10", lastSeen: "2026-11-04" }), old: R({ due: "2026-10-01", lastSeen: "2026-09-25" }) };
  assert.equal(SRS.pickFrom(list, 1, items, "2026-11-11")[0].id, "old");
});

test("pickFrom: prefer pone primero los ítems de patrones débiles", () => {
  const list = [{ id: "A" }, { id: "B" }, { id: "C" }];
  const out = SRS.pickFrom(list, 1, {}, "2026-11-11", false, () => 0, (it) => it.id === "C");
  assert.equal(out[0].id, "C");
});

test("pickFrom: un ítem fallado hoy no acapara un bloque de 1 hueco si hay nuevos", () => {
  const list = [{ id: "R1" }, { id: "R2" }, { id: "R3" }];
  const items = { R1: SRS.nextRecord(undefined, false, "2026-11-11") }; // fallado hoy
  const out = SRS.pickFrom(list, 1, items, "2026-11-11", false, () => 0);
  assert.notEqual(out[0].id, "R1");
});

test("pickFrom: el fallado hoy vuelve si ya no queda nada nuevo", () => {
  const list = [{ id: "R1" }, { id: "R2" }];
  const items = {
    R1: SRS.nextRecord(undefined, false, "2026-11-11"),
    R2: R({ reps: 2, interval: 6, due: "2026-11-16", lastSeen: "2026-11-10" }) // no toca
  };
  assert.equal(SRS.pickFrom(list, 1, items, "2026-11-11", true)[0].id, "R1");
});

test("pickFrom: un fallo de ayer sí tiene prioridad sobre lo nuevo al día siguiente", () => {
  const list = [{ id: "R1" }, { id: "R2" }];
  const items = { R1: SRS.nextRecord(undefined, false, "2026-11-10") };
  assert.equal(SRS.pickFrom(list, 1, items, "2026-11-11", false, () => 0)[0].id, "R1");
});

/* ---------------------------------------------------------------- Errors */
test("errores: 1 fallo aislado, 2–3 emergente, 4+ crítico", () => {
  let e = {};
  const miss = (d) => (e = Errors.record(e, "g:Pasiva", "Pasiva", false, d));
  miss("2026-11-01");
  assert.equal(Errors.status(e["g:Pasiva"], "2026-11-01"), "isolated");
  miss("2026-11-02");
  assert.equal(Errors.status(e["g:Pasiva"], "2026-11-02"), "emerging");
  miss("2026-11-03"); miss("2026-11-04");
  assert.equal(Errors.status(e["g:Pasiva"], "2026-11-04"), "critical");
  // Pasado el periodo de 30 días, los fallos viejos dejan de contar.
  assert.equal(Errors.status(e["g:Pasiva"], "2026-12-31"), null);
});

test("errores: 3 aciertos seguidos tras ≥ 2 fallos = superado; un fallo lo reabre", () => {
  let e = {};
  e = Errors.record(e, "k", "K", false, "2026-11-01");
  e = Errors.record(e, "k", "K", false, "2026-11-02");
  for (let i = 0; i < 3; i++) e = Errors.record(e, "k", "K", true, "2026-11-03");
  assert.equal(Errors.status(e.k, "2026-11-03"), "resolved");
  assert.equal(e.k.lastOk, "2026-11-03");
  e = Errors.record(e, "k", "K", false, "2026-11-04");
  assert.equal(e.k.run, 0);
  assert.equal(Errors.status(e.k, "2026-11-04"), "emerging");
});

test("errores: acertar el mismo día del fallo no basta para darlo por superado", () => {
  let e = {};
  e = Errors.record(e, "k", "K", false, "2026-11-01");
  e = Errors.record(e, "k", "K", false, "2026-11-02");
  for (let i = 0; i < 5; i++) e = Errors.record(e, "k", "K", true, "2026-11-02");
  assert.equal(Errors.status(e.k, "2026-11-02"), "emerging");
  e = Errors.record(e, "k", "K", true, "2026-11-03"); // la racha sigue al día siguiente
  assert.equal(Errors.status(e.k, "2026-11-03"), "resolved");
});

test("errores: acertar un patrón sin fallos no crea registro", () => {
  const e = {};
  assert.equal(Errors.record(e, "k", "K", true, "2026-11-01"), e);
});

test("errores: guarda los últimos ejemplos sin repetir ítem y no muta el original", () => {
  let e = {};
  const ex = (id, given) => ({ id, given, expected: "right" });
  e = Errors.record(e, "k", "K", false, "2026-11-01", ex("A", "a1"));
  const snapshot = JSON.stringify(e);
  e = Errors.record(e, "k", "K", false, "2026-11-02", ex("A", "a2"));
  e = Errors.record(e, "k", "K", false, "2026-11-03", ex("B", "b"));
  e = Errors.record(e, "k", "K", false, "2026-11-04", ex("C", "c"));
  e = Errors.record(e, "k", "K", false, "2026-11-05", ex("D", "d"));
  assert.deepEqual(e.k.examples.map((x) => x.id), ["D", "C", "B"]);
  assert.equal(JSON.parse(snapshot).k.examples.length, 1);
});

test("errores: ranked ordena críticos antes que emergentes e ignora aislados", () => {
  let e = {};
  for (const d of ["2026-11-01", "2026-11-02"]) e = Errors.record(e, "em", "Em", false, d);
  for (const d of ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04"]) e = Errors.record(e, "cr", "Cr", false, d);
  e = Errors.record(e, "is", "Is", false, "2026-11-04");
  assert.deepEqual(Errors.ranked(e, "2026-11-05").map((x) => x.key), ["cr", "em"]);
});

test("errores: diff detecta lo superado y lo que empeora en una sesión", () => {
  const before = { a: "critical", b: "isolated", c: "emerging" };
  const after = { a: "resolved", b: "emerging", c: "emerging", d: "isolated" };
  assert.deepEqual(Errors.diff(before, after), { resolved: ["a"], worse: ["b"] });
});

/* --------------------------------------------------------------- Mastery */
test("estrellas: sin datos suficientes → null; bandas por precisión", () => {
  assert.equal(Mastery.stars({ ok: 3, total: 4 }), null);
  assert.equal(Mastery.stars({ ok: 1, total: 10 }), 0);
  assert.equal(Mastery.stars({ ok: 3, total: 10 }), 1);
  assert.equal(Mastery.stars({ ok: 5, total: 10 }), 2);
  assert.equal(Mastery.stars({ ok: 7, total: 10 }), 3);
});

test("estrellas: 4★ y 5★ exigen haber dominado parte del contenido", () => {
  assert.equal(Mastery.stars({ ok: 10, total: 10, mastered: 1, size: 40 }), 3);
  assert.equal(Mastery.stars({ ok: 10, total: 10, mastered: 10, size: 40 }), 4);
  assert.equal(Mastery.stars({ ok: 10, total: 10, mastered: 20, size: 40 }), 5);
  assert.equal(Mastery.stars({ ok: 8, total: 10, mastered: 20, size: 40 }), 4);
});

/* ----------------------------------------------------------------- Level */
const ses = (level, ok, total = 20) => ({ level, score: { vocab: { ok, total } } });

test("nivel: 5 sesiones B2 ≥ 85 % → subir a C1", () => {
  assert.equal(Level.advice(Array(5).fill(ses("b2", 18)), "b2"), "up");
  assert.equal(Level.advice([...Array(4).fill(ses("b2", 18)), ses("b2", 15)], "b2"), null);
  assert.equal(Level.advice(Array(4).fill(ses("b2", 18)), "b2"), null);
});

test("nivel: 3 sesiones C1 < 60 % → consolidar en B2", () => {
  assert.equal(Level.advice(Array(3).fill(ses("c1", 10)), "c1"), "down");
  assert.equal(Level.advice([ses("c1", 10), ses("c1", 13), ses("c1", 10)], "c1"), null);
  assert.equal(Level.advice([ses("b2", 2), ses("c1", 10), ses("c1", 10)], "c1"), null); // solo cuentan las C1
});

/* ---------------------------------------------------------------- Streak */
test("racha: días seguidos suman, un hueco reinicia", () => {
  let st = { current: 0, best: 0, lastDate: null };
  st = Streak.register(st, "2026-11-09");
  st = Streak.register(st, "2026-11-10");
  st = Streak.register(st, "2026-11-10"); // 2.ª sesión del día: no suma
  assert.deepEqual(st, { current: 2, best: 2, lastDate: "2026-11-10" });
  st = Streak.register(st, "2026-11-13");
  assert.deepEqual(st, { current: 1, best: 2, lastDate: "2026-11-13" });
});

test("racha: la vista la da por perdida si pasan 2 días", () => {
  const st = { current: 5, best: 7, lastDate: "2026-11-09" };
  assert.deepEqual(Streak.view(st, "2026-11-10"), { current: 5, best: 7, doneToday: false });
  assert.deepEqual(Streak.view(st, "2026-11-11"), { current: 0, best: 7, doneToday: false });
  assert.equal(Streak.view(st, "2026-11-09").doneToday, true);
});

/* ----------------------------------------------------------------- State */
test("normalize descarta piezas dañadas sin perder las buenas", () => {
  const s = State.normalize({
    items: {
      "MM-001": { reps: "2", interval: 6, due: "ayer", seen: "3", correct: 2, ef: 9, lastSeen: "2026-11-10" },
      bad: null,
      "G-001": { ef: 2.36, reps: 1, interval: 1, due: "2026-11-11", seen: 1, correct: 1, lapses: 0, lastSeen: "2026-11-10" }
    },
    errors: { "g:Pasiva": { label: "Pasiva", n: "2", dates: ["2026-11-10", "x"], examples: [{ id: "G-1", given: 3 }] }, mal: "no" },
    sessions: [{ date: "2026-11-10", score: {} }, "basura"],
    custom: [{ id: "U-1", en: "pick your brain", es: "consultar" }, { en: "sin id" }],
    streak: { current: "4", best: 6, lastDate: "2026-11-10" },
    settings: { level: "c1" }
  });
  assert.deepEqual(s.items["MM-001"], { ef: 5, reps: 2, interval: 6, due: null, seen: 3, correct: 2, lapses: 0, lastSeen: "2026-11-10" });
  assert.deepEqual(s.items["G-001"], { ef: 2.36, reps: 1, interval: 1, due: "2026-11-11", seen: 1, correct: 1, lapses: 0, lastSeen: "2026-11-10" });
  assert.equal(s.items.bad, undefined);
  assert.equal(s.errors.mal, undefined);
  assert.equal(s.errors["g:Pasiva"].n, 2);
  assert.deepEqual(s.errors["g:Pasiva"].dates, ["2026-11-10"]);
  assert.deepEqual(s.errors["g:Pasiva"].examples, [{ id: "G-1", given: "", expected: "", date: null }]);
  assert.equal(s.sessions.length, 1);
  assert.equal(s.custom.length, 1);
  assert.deepEqual(s.streak, { current: 4, best: 6, lastDate: "2026-11-10" });
  assert.equal(s.settings.level, "c1");
  assert.equal(s.settings.tts, true); // valor por defecto conservado
  assert.equal(s.version, 3);
});

test("normalize migra el progreso de la versión 2 (cajas Leitner) sin perderlo", () => {
  const s = State.normalize({ version: 2, items: { A: { box: 4, seen: 5, correct: 4, lastSeen: "2026-11-05" }, B: { box: 9, seen: 1 } } });
  assert.deepEqual(s.items.A, { ef: 2.5, reps: 3, interval: 7, due: "2026-11-12", seen: 5, correct: 4, lapses: 0, lastSeen: "2026-11-05" });
  assert.equal(s.items.B.reps, 4); // caja fuera de rango → se acota a 5
  assert.deepEqual(s.errors, {});
});

test("normalize rechaza lo que no es un objeto", () => {
  assert.throws(() => State.normalize(null));
  assert.throws(() => State.normalize([1, 2]));
  assert.throws(() => State.normalize("hola"));
});

test("exportar e importar es reversible", () => {
  const st = State.fresh();
  st.items["MM-001"] = SRS.nextRecord(undefined, 4, "2026-11-10");
  st.errors = Errors.record({}, "t:false_friend", "Falso amigo", false, "2026-11-10", { id: "B3-001", given: "realize", expected: "carry out" });
  st.custom.push({ id: "U-1", en: "arvo", es: "tarde", example: "", created: "2026-11-10" });
  const file = JSON.stringify(State.toExport(st, new Date("2026-11-11T10:00:00Z")));
  assert.deepEqual(State.fromImport(file), State.normalize(st));
  assert.deepEqual(State.fromImport(file).errors, st.errors);
});

test("importar acepta también un estado sin envoltorio (copia manual de localStorage)", () => {
  const raw = JSON.stringify({ items: { A: { box: 2, seen: 1, correct: 1, lastSeen: "2026-11-10" } } });
  assert.equal(State.fromImport(raw).items.A.reps, 1);
});

test("importar rechaza archivos que no son de la app", () => {
  assert.throws(() => State.fromImport("no es json"), /JSON/);
  assert.throws(() => State.fromImport(JSON.stringify({ foo: 1 })), /no parece/);
  assert.throws(() => State.fromImport("[]"), /no parece/);
});

/* ------------------------------------------------------------------ Bank */
test("banco: el archivo de vocabulario se reconoce y no se confunde con una copia completa", () => {
  const file = JSON.stringify(Bank.toFile([{ en: "fair enough", es: "es razonable", example: "Fair enough — let's do it your way." }, { en: "", es: "x" }]));
  const r = State.parseFile(file);
  assert.equal(r.kind, "bank");
  assert.deepEqual(r.words, [{ en: "fair enough", es: "es razonable", example: "Fair enough — let's do it your way." }]);
  const full = State.parseFile(JSON.stringify(State.toExport(State.fresh())));
  assert.equal(full.kind, "state");
  assert.throws(() => State.parseFile(JSON.stringify({ app: "english-20-minutes", kind: "bank", words: [] })), /palabras/);
});

test("banco: merge añade solo lo nuevo, sin duplicar ids ni mayúsculas", () => {
  const custom = [{ id: "U-1", en: "Arvo", es: "tarde", example: "", created: "2026-11-10" }];
  const r = Bank.merge(custom, [{ en: "arvo", es: "tarde" }, { en: "fair enough", es: "vale" }, { en: "to be fair", es: "siendo justos" }, { en: "Fair Enough", es: "dup" }], "2026-11-12", "abc");
  assert.equal(r.added, 2);
  assert.equal(r.skipped, 2);
  assert.deepEqual(r.custom.map((w) => w.en), ["Arvo", "fair enough", "to be fair"]);
  assert.equal(new Set(r.custom.map((w) => w.id)).size, 3);
  assert.equal(custom.length, 1); // no muta el original
});

/* ---------------------------------------------------------------- Hedges */
test("'sorry' funcional para interrumpir o aclarar no cuenta como muletilla", () => {
  for (const t of [
    "Sorry to jump in, but could I add something here?",
    "Sorry, could you run that number by me again?",
    "Sorry, just a quick correction — the turnover figure is actually 12%.",
    "Sorry, if I could just finish my point…"
  ]) assert.deepEqual(countHedges(t), [], t);
});

test("la disculpa innecesaria y los atenuadores sí cuentan", () => {
  const h = countHedges("I'm sorry for the delay. I think maybe it's kind of late, you know. Um, I think so.");
  const by = Object.fromEntries(h.map((x) => [x.t, x.n]));
  assert.equal(by["I'm sorry / sorry for"], 1);
  assert.equal(by["I think"], 2);
  assert.equal(by.maybe, 1);
  assert.equal(by["kind of / sort of"], 1);
  assert.equal(by["you know"], 1);
  assert.equal(by["um / uh"], 1);
});

test("countHedges es repetible (las regex globales no arrastran lastIndex)", () => {
  assert.equal(countHedges("I think").length, 1);
  assert.equal(countHedges("I think").length, 1);
});

test("modo social: 'I think' y 'maybe' no cuentan, el relleno sí", () => {
  const text = "I think maybe we could go, you know, um, basically tomorrow.";
  const social = Object.fromEntries(countHedges(text, { social: true }).map((x) => [x.t, x.n]));
  assert.equal(social["I think"], undefined);
  assert.equal(social.maybe, undefined);
  assert.equal(social["you know"], 1);
  assert.equal(social["um / uh"], 1);
  assert.equal(social.basically, 1);
  const work = Object.fromEntries(countHedges(text).map((x) => [x.t, x.n]));
  assert.equal(work["I think"], 1);
  assert.equal(work.maybe, 1);
});
