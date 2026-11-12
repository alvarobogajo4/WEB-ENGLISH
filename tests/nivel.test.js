/* Tests de scripts/nivel.js (skill /chequeo-nivel).
 * Se ejecuta en una carpeta temporal (FLUIDEZ_DIR): nunca toca progreso/ real. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { State, Nivel } = require("../js/core.js");

const SCRIPT = path.join(__dirname, "..", "scripts", "nivel.js");

function sandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nivel-"));
  const run = (...args) => execFileSync(process.execPath, [SCRIPT, ...args], { env: { ...process.env, FLUIDEZ_DIR: dir }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const write = (name, obj) => { const p = path.join(dir, name); fs.writeFileSync(p, JSON.stringify(obj)); return p; };
  return { dir, run, write };
}

const chequeo = (fecha, nivel, extra = {}) => ({
  fecha, modo: "hablado",
  variantes: ["T1-colega", "T4-discrepar-mark"],
  respuestas: [
    { tarea: 1, situacion: "small-talk", texto: "Pretty good, thanks! To be fair, the weekend was a bit hectic, but we had a great time." },
    { tarea: 4, situacion: "reuniones", texto: "I don't agree. The data is not correct." }
  ],
  criterios: Object.fromEntries(Object.keys(Nivel.CRITERIA).map((k) => [k, { nivel: k === "interaccion" ? "B1+" : nivel, evidencia: `cita ${k}` }])),
  situaciones: { "small-talk": "B2+", "reuniones": "B1+" },
  fuertes: [{ texto: "Small talk natural", evidencia: "Pretty good, thanks!" }],
  debiles: [{ texto: "Discrepar con tacto", evidencia: "I don't agree.", accion: "Practicar 'I see your point, but…'" }],
  ...extra
});

test("nivel.js: sin chequeos, estado invita a hacer el punto de partida", () => {
  assert.match(sandbox().run("estado"), /punto de partida/);
});

test("nivel.js: registrar guarda el chequeo con métricas y crea el archivo para la app", () => {
  const sb = sandbox();
  fs.writeFileSync(path.join(sb.dir, "fluidez-activa.json"), JSON.stringify({ chunks: { "to be fair": { en: "to be fair", srs: { correct: 2 } }, "fair enough": { en: "fair enough", srs: null } } }));
  const out = sb.run("registrar", sb.write("c.json", chequeo("2026-11-12", "B2")));
  assert.match(out, /Nivel global: B2 \(165\) · punto de partida/);
  assert.match(out, /Foco: Interacción · Reuniones/);
  const saved = JSON.parse(fs.readFileSync(path.join(sb.dir, "nivel.json"), "utf8"));
  assert.equal(saved.chequeos.length, 1);
  assert.equal(saved.chequeos[0].respuestas.length, 2); // las respuestas se quedan en local
  assert.equal(saved.chequeos[0].metricas.chunksActivos, 1); // "to be fair" sí; "fair enough" aún no producido
  const app = State.parseFile(fs.readFileSync(path.join(sb.dir, "nivel-para-app-2026-11-12.json"), "utf8"));
  assert.equal(app.kind, "nivel");
  assert.equal(app.entries[0].respuestas, undefined); // a la app no van las respuestas
});

test("nivel.js: un segundo chequeo muestra la evolución y el mismo día se reemplaza", () => {
  const sb = sandbox();
  sb.run("registrar", sb.write("a.json", chequeo("2026-11-12", "B2")));
  sb.run("registrar", sb.write("b.json", chequeo("2026-12-12", "B2")));
  const out = sb.run("registrar", sb.write("b2.json", chequeo("2026-12-12", "B2+")));
  assert.match(out, /B2\+ \(175\) · ↑ \+10 desde el anterior/);
  const est = sb.run("estado");
  assert.match(est, /Fluidez: B2\+ \(↑ \+10\)/);
  assert.match(est, /Variantes usadas/);
  const saved = JSON.parse(fs.readFileSync(path.join(sb.dir, "nivel.json"), "utf8"));
  assert.deepEqual(saved.chequeos.map((c) => c.fecha), ["2026-11-12", "2026-12-12"]);
});

test("nivel.js: una evaluación incompleta no guarda nada y explica por qué", () => {
  const sb = sandbox();
  const bad = chequeo("2026-11-12", "B2");
  delete bad.criterios.coherencia;
  assert.throws(() => sb.run("registrar", sb.write("bad.json", bad)), (e) => /coherencia/.test(e.stderr));
  assert.equal(fs.existsSync(path.join(sb.dir, "nivel.json")), false);
});
