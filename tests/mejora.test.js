/* Tests de la mejora de base: «dilo antes de verlo», dictado de listening,
 * estado v5 (producciones y ajustes válidos), sincronización local, lotes y runway. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { Produce, Dictation, State, Util } = require("../js/core.js");
const { createServer } = require("../scripts/serve.js");
const { loadData } = require("../scripts/load-data.js");

const ROOT = path.join(__dirname, "..");

/* --------------------------------------------------------------- Produce */
test("Produce.similarity: ignora mayúsculas, puntuación y contracciones", () => {
  const target = "Sorry to jump in, but could I add something here?";
  assert.equal(Produce.similarity("sorry to jump in but could i add something here", target), 1);
  assert.equal(Produce.similarity("I'm not sure", "I am not sure"), 1);
  assert.equal(Produce.similarity("", target), 0);
  const partial = Produce.similarity("could I add something", target);
  assert.ok(partial > 0.3 && partial < 0.75, `parcial: ${partial}`);
});

test("Produce.quality: producir bien sube la nota; reconocer sin producir vuelve antes", () => {
  const t = "Let me double-check and get back to you.";
  assert.equal(Produce.quality(false, t, t), 1, "elegir mal es fallo aunque lo dijera");
  assert.equal(Produce.quality(true, "", t), 4, "sin intento: solo reconocimiento");
  assert.equal(Produce.quality(true, "let me double check and get back to you", t), 5);
  assert.equal(Produce.quality(true, "I will look", t), 3, "lo reconoce pero aún no le sale");
});

/* ------------------------------------------------------------- Dictation */
test("Dictation.pick: elige una frase de 8+ palabras y 3 huecos de contenido, en orden", () => {
  const lines = [{ text: "Hi there." }, { text: "The engagement survey closes on Friday, and we're sitting at sixty per cent." }];
  let seed = 0.42; const rnd = () => (seed = (seed * 9301 + 49297) % 233280 / 233280);
  const d = Dictation.pick(lines, rnd);
  assert.equal(d.line, 1);
  assert.equal(d.gaps.length, 3);
  const words = lines[1].text.split(/\s+/);
  for (const g of d.gaps) {
    assert.ok(words[g.pos].includes(g.word), `${g.word} está en la posición ${g.pos}`);
    assert.ok(g.word.length >= 4);
    assert.ok(!/[,.]/.test(g.word), "sin puntuación pegada");
  }
  assert.deepEqual(d.gaps.map((g) => g.pos), d.gaps.map((g) => g.pos).slice().sort((a, b) => a - b));
});

test("Dictation.check: tolera mayúsculas y una errata en palabras largas, no en cortas", () => {
  assert.ok(Dictation.check("Engagement", "engagement"));
  assert.ok(Dictation.check("engagment", "engagement"));
  assert.ok(!Dictation.check("cloze", "close"));
  assert.ok(!Dictation.check("", "Friday"));
  assert.ok(Dictation.check("we're", "we’re"));
});

/* ----------------------------------------------------------------- State */
test("State v5: guarda producciones válidas y descarta las rotas", () => {
  const s = State.normalize({
    productions: [
      { date: "2026-11-13", id: "B4-002", scenario: "Conflicto", brief: "…", text: "Let's take a step back.", spoken: true, secs: 70, wpm: 120, score: 80 },
      { date: "mal", text: "x" }, { date: "2026-11-13", text: "  " }, null
    ]
  });
  assert.equal(s.version, 5);
  assert.equal(s.productions.length, 1);
  assert.equal(s.productions[0].reviewed, false);
});

test("State: ajustes desconocidos vuelven a su valor por defecto (la sesión no puede romperse)", () => {
  const s = State.normalize({ settings: { level: "c3", voice: "fr-FR", tts: "sí", produceFirst: false, synced: ["a.json", 3] } });
  assert.equal(s.settings.level, "b2");
  assert.equal(s.settings.voice, "en-GB");
  assert.equal(s.settings.tts, true);
  assert.equal(s.settings.produceFirst, false);
  assert.deepEqual(s.settings.synced, ["a.json"]);
});

/* ------------------------------------------------------------- Contenido */
test("lotes: el contenido del navegador incluye los lotes y los ids no se repiten", () => {
  const D = loadData();
  assert.ok(D.batches.includes("lote-02"));
  const ids = Object.values(D.BLOCKS).flat().map((it) => it.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(D.BLOCKS.listening.length >= 24);
});

test("runway: informa de los días de contenido nuevo y los siguientes ids", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "runway-"));
  const out = execFileSync(process.execPath, [path.join(ROOT, "scripts", "runway.js")], { env: { ...process.env, FLUIDEZ_DIR: dir }, encoding: "utf8" });
  assert.match(out, /Runway de contenido · nivel B2/);
  assert.match(out, /grammar\s+\d+/);
  assert.match(out, /Siguientes ids: .*grammar G-\d{3}/);
});

/* ---------------------------------------------------------- Servidor local */
function withServer(fn) {
  return async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "serve-"));
    process.env.FLUIDEZ_DIR = dir;
    delete require.cache[require.resolve("../scripts/serve.js")];
    const srv = require("../scripts/serve.js").createServer();
    await new Promise((r) => srv.listen(0, "127.0.0.1", r));
    const base = `http://127.0.0.1:${srv.address().port}`;
    try { await fn(base, dir); } finally { srv.close(); delete process.env.FLUIDEZ_DIR; }
  };
}

test("serve: sirve la app pero nunca progreso/ ni scripts", withServer(async (base) => {
  assert.equal((await fetch(`${base}/`)).status, 200);
  assert.equal((await fetch(`${base}/js/core.js`)).status, 200);
  assert.equal((await fetch(`${base}/js/content/lote-02.js`)).status, 200);
  for (const p of ["/progreso/app-estado.json", "/scripts/serve.js", "/package.json", "/js/../package.json", "/.git/config"]) {
    assert.equal((await fetch(`${base}${p}`)).status, 404, p);
  }
}));

test("serve: guarda el estado válido de la app y rechaza basura", withServer(async (base, dir) => {
  const state = State.toExport({ ...State.fresh(), sessions: [{ date: Util.today(), score: {} }] });
  const ok = await fetch(`${base}/api/app-estado`, { method: "POST", body: JSON.stringify(state) });
  assert.equal(ok.status, 200);
  assert.equal(State.fromImport(fs.readFileSync(path.join(dir, "app-estado.json"), "utf8")).sessions.length, 1);
  const bad = await fetch(`${base}/api/app-estado`, { method: "POST", body: "{\"hola\":1}" });
  assert.equal(bad.status, 400);
}));

test("serve: entrega en la bandeja solo los archivos de las skills para la app", withServer(async (base, dir) => {
  fs.writeFileSync(path.join(dir, "banco-para-app-2026-11-13.json"), JSON.stringify({ app: "english-20-minutes", kind: "bank", words: [{ en: "fair enough", es: "es razonable" }] }));
  fs.writeFileSync(path.join(dir, "fluidez-activa.json"), "{}");
  const { files } = await (await fetch(`${base}/api/inbox`)).json();
  assert.deepEqual(files.map((f) => f.name), ["banco-para-app-2026-11-13.json"]);
  assert.equal(State.parseFile(JSON.stringify(files[0].data)).kind, "bank");
}));

test("serve: rechaza peticiones con Host u Origin externos (DNS rebinding)", withServer(async (base) => {
  const http = require("node:http");
  const status = (headers) => new Promise((resolve) => {
    const u = new URL(`${base}/api/ping`);
    http.get({ host: "127.0.0.1", port: u.port, path: u.pathname, headers }, (res) => { res.resume(); resolve(res.statusCode); });
  });
  assert.equal(await status({ Host: "evil.example.com" }), 403);
  assert.equal(await status({ Host: `127.0.0.1:${new URL(base).port}`, Origin: "https://evil.example.com" }), 403);
  assert.equal(await status({ Host: `localhost:${new URL(base).port}` }), 200);
}));

/* ------------------------------------------- fluidez.js con la app sincronizada */
test("fluidez: usa app-estado.json, muestra los retos sin feedback y no repite los revisados", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fluidez-sync-"));
  const run = (...args) => execFileSync(process.execPath, [path.join(ROOT, "scripts", "fluidez.js"), ...args], { env: { ...process.env, FLUIDEZ_DIR: dir, FLUIDEZ_EXPORT: "" }, encoding: "utf8" });
  const st = { ...State.fresh(), productions: [{ date: "2026-11-13", id: "B4-002", scenario: "Conflicto", brief: "Desbloquea la reunión", text: "We need take a step back.", spoken: true, secs: 65, wpm: 110, score: 70 }] };
  fs.writeFileSync(path.join(dir, "app-estado.json"), JSON.stringify(State.toExport(st)));
  let out = run("estado");
  assert.match(out, /sincronizada automáticamente/);
  assert.match(out, /\[2026-11-13\|B4-002\]/);
  assert.match(out, /We need take a step back/);
  fs.writeFileSync(path.join(dir, "s.json"), JSON.stringify({ tema: "reuniones", nuevos: [{ en: "take a step back", es: "dar un paso atrás", fuente: "reto-app" }], resultados: [{ en: "take a step back", q: 4 }], revisadas: ["2026-11-13|B4-002"] }));
  run("registrar", path.join(dir, "s.json"));
  out = run("estado");
  assert.doesNotMatch(out, /B4-002\]/);
});

/* ------------------------------------------------------------ Sesión v2 */
test("sesión v2: 3 bloques (repaso 4 · oído 4 · soltura 12) y todos los pools tienen bloque", () => {
  const D = loadData();
  assert.deepEqual(Object.keys(D.BLOCK_META), ["review", "listening", "fluency"]);
  assert.equal(Object.values(D.BLOCK_META).reduce((a, m) => a + m.seconds, 0), 20 * 60);
  for (const [pool, b] of Object.entries(D.POOL_BLOCK)) assert.ok(D.BLOCK_META[b], `${pool} → ${b}`);
  for (const lv of ["b2", "c1"]) {
    const review = Object.values(D.SESSION_MIX[lv].review).reduce((a, n) => a + n, 0);
    assert.ok(review <= 8, `repaso ${lv}: ${review} ítems (máx. 8 para que quepa en 4 min)`);
    assert.equal(D.SESSION_MIX[lv].fluency.challenges, 1);
  }
});

test("sesión v2: hay retos B2 suficientes para la soltura 4/3/2 (≥ 3 semanas)", () => {
  const D = loadData();
  const b2 = D.BLOCKS.challenges.filter((c) => (c.level || D.POOL_DEFAULT_LEVEL.challenges) === "b2");
  assert.ok(b2.length >= 20, `${b2.length} retos B2`);
  assert.ok(b2.filter((c) => c.context === "social").length >= 6, "al menos 6 retos de vida diaria");
});

test("State: las rondas del 4/3/2 se guardan con la producción (máx. 3)", () => {
  const s = State.normalize({ productions: [{ date: "2026-11-13", id: "B4-030", text: "Final version.", rounds: [95, 112, "130", 999, -4] }] });
  assert.deepEqual(s.productions[0].rounds, [95, 112, 130]);
  assert.deepEqual(State.normalize({ productions: [{ date: "2026-11-13", text: "x" }] }).productions[0].rounds, []);
});

/* --------------------------------------------- Puente con el iPhone (OneDrive) */
test("puente OneDrive: el tutor lee la copia del móvil y le devuelve el banco en la misma carpeta", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fluidez-bridge-"));
  const bridge = fs.mkdtempSync(path.join(os.tmpdir(), "english20-"));
  const env = { ...process.env, FLUIDEZ_DIR: dir, E20_BRIDGE_DIR: bridge, FLUIDEZ_EXPORT: "" };
  const run = (...args) => execFileSync(process.execPath, [path.join(ROOT, "scripts", "fluidez.js"), ...args], { env, encoding: "utf8" });
  const st = { ...State.fresh(), sessions: [{ date: Util.today(), score: {} }], settings: { ...State.fresh().settings, lastExport: Util.today() } };
  fs.writeFileSync(path.join(bridge, `english20-progreso-${Util.today()}.json`), JSON.stringify(State.toExport(st)));
  assert.match(run("estado"), /copia del móvil en OneDrive\/English20/);
  fs.writeFileSync(path.join(dir, "s.json"), JSON.stringify({ tema: "small-talk", nuevos: [{ en: "fair enough", es: "es razonable" }], resultados: [{ en: "fair enough", q: 4 }] }));
  run("registrar", path.join(dir, "s.json"));
  const out = run("banco");
  assert.match(out, /En el iPhone: .*English20/);
  const copies = fs.readdirSync(bridge).filter((n) => n.startsWith("banco-para-app-"));
  assert.equal(copies.length, 1);
  assert.equal(State.parseFile(fs.readFileSync(path.join(bridge, copies[0]), "utf8")).kind, "bank");
});

test("puente OneDrive: en modo prueba (FLUIDEZ_DIR sin E20_BRIDGE_DIR) nunca toca el OneDrive real", () => {
  const prev = { F: process.env.FLUIDEZ_DIR, B: process.env.E20_BRIDGE_DIR };
  process.env.FLUIDEZ_DIR = os.tmpdir(); delete process.env.E20_BRIDGE_DIR;
  delete require.cache[require.resolve("../scripts/onedrive.js")];
  try { assert.equal(require("../scripts/onedrive.js").bridgeDir(), null); }
  finally { if (prev.F === undefined) delete process.env.FLUIDEZ_DIR; else process.env.FLUIDEZ_DIR = prev.F; if (prev.B !== undefined) process.env.E20_BRIDGE_DIR = prev.B; }
});
