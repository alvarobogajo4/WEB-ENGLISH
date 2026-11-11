/* Tests del núcleo puro. Ejecutar: npm test  (o: node --test tests/) */
const test = require("node:test");
const assert = require("node:assert/strict");
const { Util, SRS, Streak, State, countHedges } = require("../js/core.js");

/* ------------------------------------------------------------------ Util */
test("daysBetween cruza meses, años y años bisiestos", () => {
  assert.equal(Util.daysBetween("2026-01-31", "2026-02-01"), 1);
  assert.equal(Util.daysBetween("2026-12-31", "2027-01-01"), 1);
  assert.equal(Util.daysBetween("2028-02-28", "2028-03-01"), 2);
  assert.equal(Util.daysBetween("2026-03-28", "2026-03-30"), 2); // cambio de hora en España
  assert.equal(Util.daysBetween("2026-11-11", "2026-11-11"), 0);
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

/* ------------------------------------------------------------------- SRS */
test("un ítem nuevo acertado pasa a la caja 2", () => {
  const r = SRS.nextRecord(undefined, true, "2026-11-11");
  assert.deepEqual(r, { box: 2, seen: 1, correct: 1, lastSeen: "2026-11-11" });
});

test("acertar otra vez el mismo día NO sube de caja (no tocaba repaso)", () => {
  let r = SRS.nextRecord(undefined, true, "2026-11-11");
  r = SRS.nextRecord(r, true, "2026-11-11");
  r = SRS.nextRecord(r, true, "2026-11-11");
  assert.equal(r.box, 2);
  assert.equal(r.seen, 3);
  assert.equal(r.correct, 3);
  assert.equal(r.lastSeen, "2026-11-11");
});

test("acertar en la fecha de repaso sube de caja; antes de tiempo no", () => {
  let r = { box: 3, seen: 4, correct: 4, lastSeen: "2026-11-01" }; // caja 3 → cada 3 días
  assert.equal(SRS.nextRecord(r, true, "2026-11-03").box, 3); // 2 días: aún no toca
  assert.equal(SRS.nextRecord(r, true, "2026-11-04").box, 4); // 3 días: toca
});

test("un fallo devuelve el ítem a la caja 1 aunque no tocara", () => {
  const r = SRS.nextRecord({ box: 5, seen: 9, correct: 9, lastSeen: "2026-11-10" }, false, "2026-11-11");
  assert.equal(r.box, 1);
  assert.equal(r.lastSeen, "2026-11-11");
  assert.equal(r.correct, 9);
});

test("tras un fallo, acertar el mismo día sí sube (caja 1 = intervalo 0)", () => {
  let r = SRS.nextRecord({ box: 3, seen: 2, correct: 2, lastSeen: "2026-11-01" }, false, "2026-11-11");
  r = SRS.nextRecord(r, true, "2026-11-11");
  assert.equal(r.box, 2);
});

test("la caja máxima es 5", () => {
  const r = SRS.nextRecord({ box: 5, seen: 9, correct: 9, lastSeen: "2026-01-01" }, true, "2026-11-11");
  assert.equal(r.box, 5);
});

test("pickFrom: pendientes primero (máx. 60 %), luego nuevos", () => {
  const list = Array.from({ length: 10 }, (_, i) => ({ id: `X-${i}` }));
  const items = {};
  for (let i = 0; i < 6; i++) items[`X-${i}`] = { box: 1, seen: 1, correct: 0, lastSeen: "2026-11-01" }; // 6 pendientes
  const out = SRS.pickFrom(list, 5, items, "2026-11-11", false, () => 0);
  const due = out.filter((it) => items[it.id]).length;
  assert.equal(out.length, 5);
  assert.equal(due, 3); // ceil(5 * 0.6)
  assert.equal(new Set(out.map((x) => x.id)).size, 5);
});

test("pickFrom con onlyDue no rellena con ítems que no tocan", () => {
  const list = [{ id: "A" }, { id: "B" }];
  const items = { A: { box: 4, seen: 3, correct: 3, lastSeen: "2026-11-10" }, B: { box: 4, seen: 3, correct: 3, lastSeen: "2026-11-10" } };
  assert.deepEqual(SRS.pickFrom(list, 2, items, "2026-11-11", true), []);
  assert.equal(SRS.pickFrom(list, 2, items, "2026-11-11", false).length, 2);
});

test("pickFrom prioriza los pendientes de caja más baja", () => {
  const list = [{ id: "hi" }, { id: "lo" }];
  const items = { hi: { box: 3, seen: 1, correct: 1, lastSeen: "2026-01-01" }, lo: { box: 1, seen: 1, correct: 0, lastSeen: "2026-01-01" } };
  assert.equal(SRS.pickFrom(list, 1, items, "2026-11-11")[0].id, "lo");
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
    items: { "MM-001": { box: 9, seen: "3", correct: 2, lastSeen: "ayer" }, bad: null, "G-001": { box: 2, seen: 1, correct: 1, lastSeen: "2026-11-10" } },
    sessions: [{ date: "2026-11-10", score: {} }, "basura"],
    custom: [{ id: "U-1", en: "pick your brain", es: "consultar" }, { en: "sin id" }],
    streak: { current: "4", best: 6, lastDate: "2026-11-10" },
    settings: { level: "c1" }
  });
  assert.deepEqual(s.items["MM-001"], { box: 1, seen: 3, correct: 2, lastSeen: null });
  assert.deepEqual(s.items["G-001"], { box: 2, seen: 1, correct: 1, lastSeen: "2026-11-10" });
  assert.equal(s.items.bad, undefined);
  assert.equal(s.sessions.length, 1);
  assert.equal(s.custom.length, 1);
  assert.deepEqual(s.streak, { current: 4, best: 6, lastDate: "2026-11-10" });
  assert.equal(s.settings.level, "c1");
  assert.equal(s.settings.tts, true); // valor por defecto conservado
});

test("normalize rechaza lo que no es un objeto", () => {
  assert.throws(() => State.normalize(null));
  assert.throws(() => State.normalize([1, 2]));
  assert.throws(() => State.normalize("hola"));
});

test("exportar e importar es reversible", () => {
  const st = State.fresh();
  st.items["MM-001"] = { box: 3, seen: 4, correct: 3, lastSeen: "2026-11-10" };
  st.custom.push({ id: "U-1", en: "arvo", es: "tarde", example: "", created: "2026-11-10" });
  const file = JSON.stringify(State.toExport(st, new Date("2026-11-11T10:00:00Z")));
  assert.deepEqual(State.fromImport(file), State.normalize(st));
});

test("importar acepta también un estado sin envoltorio (copia manual de localStorage)", () => {
  const raw = JSON.stringify({ items: { A: { box: 2, seen: 1, correct: 1, lastSeen: "2026-11-10" } } });
  assert.equal(State.fromImport(raw).items.A.box, 2);
});

test("importar rechaza archivos que no son de la app", () => {
  assert.throws(() => State.fromImport("no es json"), /JSON/);
  assert.throws(() => State.fromImport(JSON.stringify({ foo: 1 })), /no parece/);
  assert.throws(() => State.fromImport("[]"), /no parece/);
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

test("pickFrom: un ítem fallado hoy no acapara un bloque de 1 hueco si hay nuevos", () => {
  const list = [{ id: "R1" }, { id: "R2" }, { id: "R3" }];
  const items = { R1: { box: 1, seen: 1, correct: 0, lastSeen: "2026-11-11" } }; // fallado hoy
  const out = SRS.pickFrom(list, 1, items, "2026-11-11", false, () => 0);
  assert.notEqual(out[0].id, "R1");
});

test("pickFrom: el fallado hoy vuelve si ya no queda nada nuevo", () => {
  const list = [{ id: "R1" }, { id: "R2" }];
  const items = {
    R1: { box: 1, seen: 1, correct: 0, lastSeen: "2026-11-11" },
    R2: { box: 3, seen: 2, correct: 2, lastSeen: "2026-11-10" } // no toca
  };
  assert.equal(SRS.pickFrom(list, 1, items, "2026-11-11", true)[0].id, "R1");
});

test("pickFrom: un fallo de ayer sí tiene prioridad sobre lo nuevo al día siguiente", () => {
  const list = [{ id: "R1" }, { id: "R2" }];
  const items = { R1: { box: 1, seen: 1, correct: 0, lastSeen: "2026-11-10" } };
  assert.equal(SRS.pickFrom(list, 1, items, "2026-11-11", false, () => 0)[0].id, "R1");
});
