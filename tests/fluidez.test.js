/* Tests de scripts/fluidez.js (progreso de la skill /fluidez-activa).
 * Se ejecuta en una carpeta temporal (FLUIDEZ_DIR): nunca toca progreso/ real. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { Util, State, Errors, SRS } = require("../js/core.js");

const SCRIPT = path.join(__dirname, "..", "scripts", "fluidez.js");

function sandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fluidez-"));
  const run = (...args) => execFileSync(process.execPath, [SCRIPT, ...args], { env: { ...process.env, FLUIDEZ_DIR: dir, FLUIDEZ_EXPORT: "" }, encoding: "utf8" });
  const write = (name, obj) => { const p = path.join(dir, name); fs.writeFileSync(p, JSON.stringify(obj)); return p; };
  const data = () => JSON.parse(fs.readFileSync(path.join(dir, "fluidez-activa.json"), "utf8"));
  return { dir, run, write, data };
}

test("fluidez: registrar crea chunks, aplica SM-2 y guarda la sesión", () => {
  const sb = sandbox();
  const today = Util.today();
  const p = sb.write("s1.json", {
    tema: "small-talk", minutos: 18, circunloquios: 3,
    nuevos: [
      { en: "I'm not really into it", es: "no me va mucho", ejemplo: "Football? I'm not really into it, to be honest." },
      { en: "It slipped my mind", es: "se me olvidó", fuente: "circunloquio" }
    ],
    resultados: [
      { en: "I'm not really into it", q: 4 },
      { en: "It slipped my mind.", q: 1 },
      { en: "to be honest", es: "la verdad", q: 5, espontaneo: true }
    ],
    foco: ["Present perfect con 'just'"], logros: ["Usaste 'to be honest' sin que te lo pidiera"]
  });
  const out = sb.run("registrar", p);
  assert.match(out, /2 chunks nuevos/);
  assert.match(out, /2\/3 producciones correctas/);
  const d = sb.data();
  assert.equal(Object.keys(d.chunks).length, 3); // "It slipped my mind." coincide con la clave sin punto
  const into = d.chunks["i'm not really into it"];
  assert.equal(into.srs.reps, 1);
  assert.equal(into.srs.due, Util.addDays(today, 1));
  assert.equal(d.chunks["it slipped my mind"].srs.lapses, 1);
  assert.equal(d.chunks["it slipped my mind"].fuente, "circunloquio");
  assert.equal(d.chunks["to be honest"].espontaneo, 1);
  assert.equal(d.sesiones.length, 1);
  assert.equal(d.sesiones[0].espontaneos, 1);
  assert.deepEqual(d.sesiones[0].foco, ["Present perfect con 'just'"]);
});

test("fluidez: un archivo con errores no guarda nada", () => {
  const sb = sandbox();
  const p = sb.write("bad.json", { resultados: [{ en: "desconocido", q: 4 }] });
  assert.throws(() => sb.run("registrar", p));
  assert.equal(fs.existsSync(path.join(sb.dir, "fluidez-activa.json")), false);
});

test("fluidez: estado muestra lo que toca, el tema sugerido y los errores de la app", () => {
  const sb = sandbox();
  sb.run("registrar", sb.write("s.json", { tema: "small-talk", nuevos: [{ en: "fair enough", es: "es razonable" }], resultados: [{ en: "out of the blue", es: "de repente", q: 1 }] }));
  const st = State.fresh();
  st.settings.lastExport = Util.today();
  for (const d of [Util.addDays(Util.today(), -2), Util.addDays(Util.today(), -1)]) {
    st.errors = Errors.record(st.errors, "t:false_friend", "Trampa · Falso amigo", false, d, { id: "B3-002", given: "Actually, we have 50 clients.", expected: "We currently have 50 clients." });
  }
  st.custom.push({ id: "U-1", en: "arvo", es: "tarde", example: "", created: Util.today() });
  const exp = sb.write("english20-progreso-2026-11-12.json", State.toExport(st));
  const out = sb.run("estado", "--export", exp);
  assert.match(out, /Tema sugerido hoy: opiniones/); // small-talk ya salió
  assert.match(out, /out of the blue — de repente/); // fallado hoy → toca
  assert.match(out, /fair enough — es razonable/); // nuevo sin producir
  assert.match(out, /\[emergente\] Trampa · Falso amigo/);
  assert.match(out, /arvo — tarde/);
  assert.match(out, /racha: 1 día/);
});

test("fluidez: banco genera un archivo que la app reconoce y no repite envíos", () => {
  const sb = sandbox();
  sb.run("registrar", sb.write("s.json", { nuevos: [{ en: "fair enough", es: "es razonable", ejemplo: "Fair enough." }] }));
  const out = sb.run("banco");
  assert.match(out, /1 chunks/);
  const file = fs.readdirSync(sb.dir).find((n) => n.startsWith("banco-para-app-"));
  const parsed = State.parseFile(fs.readFileSync(path.join(sb.dir, file), "utf8"));
  assert.equal(parsed.kind, "bank");
  assert.deepEqual(parsed.words, [{ en: "fair enough", es: "es razonable", example: "Fair enough." }]);
  assert.match(sb.run("banco"), /No hay chunks nuevos/);
  assert.ok(SRS); // el script usa el mismo SM-2 que la app
});
