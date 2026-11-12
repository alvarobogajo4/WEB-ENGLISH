#!/usr/bin/env node
/* =============================================================================
 * Fluidez activa — progreso de la skill /fluidez-activa (Claude Code)
 * -----------------------------------------------------------------------------
 * Lleva el registro de tus chunks (expresiones) ACTIVOS: los que produces tú,
 * no los que reconoces. Usa el mismo SM-2 que la app (js/core.js), así que los
 * repasos se programan igual en los dos sitios.
 *
 *   node scripts/fluidez.js estado [--export ruta.json]
 *       Resumen para empezar una lección: chunks que tocan hoy, tema sugerido,
 *       foco de la última sesión y, si encuentra una copia exportada de la app,
 *       tus patrones de error recurrentes y palabras flojas del banco.
 *
 *   node scripts/fluidez.js registrar progreso/ultima-sesion.json
 *       Aplica los resultados de una lección (ver formato en la skill).
 *
 *   node scripts/fluidez.js banco [--todo]
 *       Crea progreso/banco-para-app-AAAA-MM-DD.json con los chunks nuevos para
 *       importarlos en la app (se AÑADEN a tu banco; tu progreso no cambia).
 *
 * Datos: progreso/fluidez-activa.json (personal: está en .gitignore).
 * Sin dependencias: solo Node ≥ 20.
 * ========================================================================== */
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { Util, SRS, Errors, State, Bank } = require("../js/core.js");

const ROOT = path.join(__dirname, "..");
const DIR = process.env.FLUIDEZ_DIR ? path.resolve(process.env.FLUIDEZ_DIR) : path.join(ROOT, "progreso");
const FILE = path.join(DIR, "fluidez-activa.json");
const EXPORT_RE = /^english20-progreso-\d{4}-\d{2}-\d{2}.*\.json$/i;

/* Rotación de temas: conversación amplia primero, trabajo después (objetivo: hablar de todo). */
const TEMAS = {
  "small-talk": "Small talk y vida diaria (fin de semana, planes, tiempo libre)",
  "opiniones": "Dar y matizar opiniones (actualidad, tecnología, sociedad)",
  "historias": "Contar historias y anécdotas (qué pasó, cómo te sentiste)",
  "mark-1a1": "1:1 con Mark (tu jefe australiano): updates, pedir ayuda, proponer",
  "reuniones": "Reuniones: intervenir, aclarar, discrepar con tacto, cerrar",
  "emociones": "Emociones, relaciones y empatía (reaccionar, apoyar, quejarse con gracia)",
  "viajes-ocio": "Viajes, comida, deporte y cultura",
  "datos": "Explicar datos y tendencias (HR analytics) a no expertos"
};

const STATUS = { nueva: "nueva", uso: "en uso", activa: "activa" };

/* ------------------------------------------------------------------ datos */
function fresh() { return { version: 1, creado: Util.today(), chunks: {}, sesiones: [] }; }

function load() {
  if (!fs.existsSync(FILE)) return fresh();
  try {
    const d = JSON.parse(fs.readFileSync(FILE, "utf8"));
    if (!d || typeof d !== "object" || typeof d.chunks !== "object" || !Array.isArray(d.sesiones)) throw new Error("forma incorrecta");
    return d;
  } catch (e) {
    fail(`No se pudo leer ${rel(FILE)} (${e.message}). No lo toco: revísalo o restaura ${rel(FILE)}.bak`);
  }
}

/* Escritura segura: copia .bak de la versión anterior y escritura atómica. */
function save(d) {
  fs.mkdirSync(DIR, { recursive: true });
  if (fs.existsSync(FILE)) fs.copyFileSync(FILE, FILE + ".bak");
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(d, null, 2) + "\n", "utf8");
  fs.renameSync(tmp, FILE);
}

const key = (en) => String(en).trim().toLowerCase().replace(/\s+/g, " ").replace(/[.!?]+$/, "");
const rel = (p) => path.relative(ROOT, p) || p;
function fail(msg) { console.error(`✖ ${msg}`); process.exit(1); }
function arg(name) { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : null; }

function statusOf(c) {
  if (!c.srs || !c.srs.correct) return STATUS.nueva;
  return SRS.isMastered(c.srs) ? STATUS.activa : STATUS.uso;
}

/* ------------------------------------------------- copia exportada de la app */
function findExport() {
  const explicit = arg("--export") || process.env.FLUIDEZ_EXPORT;
  if (explicit) return fs.existsSync(explicit) ? explicit : fail(`No existe ${explicit}`);
  if (process.env.FLUIDEZ_DIR) return null; // modo prueba: no buscar en las carpetas reales
  const home = os.homedir();
  const dirs = [ROOT, DIR, path.join(home, "Downloads"), path.join(home, "Descargas"), path.join(home, "OneDrive", "Escritorio"), path.join(home, "OneDrive", "Documentos"), path.join(home, "Desktop")];
  let best = null;
  for (const d of dirs) {
    let names = [];
    try { names = fs.readdirSync(d); } catch (_) { continue; }
    for (const n of names) {
      if (!EXPORT_RE.test(n)) continue;
      const p = path.join(d, n), t = fs.statSync(p).mtimeMs;
      if (!best || t > best.t) best = { p, t };
    }
  }
  return best && best.p;
}

function readExport() {
  const p = findExport();
  if (!p) return null;
  try { return { path: p, state: State.fromImport(fs.readFileSync(p, "utf8")) }; }
  catch (e) { return { path: p, error: e.message }; }
}

/* ------------------------------------------------------------------ estado */
function cmdEstado() {
  const d = load(), today = Util.today();
  const chunks = Object.values(d.chunks);
  const by = { [STATUS.nueva]: [], [STATUS.uso]: [], [STATUS.activa]: [] };
  for (const c of chunks) by[statusOf(c)].push(c);

  // Lo que toca hoy: producidos con repaso vencido (los más atrasados primero) y
  // nuevos que aún no has conseguido producir.
  const due = chunks
    .filter((c) => c.srs && SRS.isDue(c.srs, today))
    .sort((a, b) => (a.srs.due || "").localeCompare(b.srs.due || "") || a.srs.ef - b.srs.ef);
  const pending = by[STATUS.nueva].sort((a, b) => a.alta.localeCompare(b.alta));

  // Tema: el que hace más tiempo que no sale (o nunca).
  const lastByTema = {};
  for (const s of d.sesiones) lastByTema[s.tema] = s.fecha;
  const tema = Object.keys(TEMAS).sort((a, b) => (lastByTema[a] || "").localeCompare(lastByTema[b] || ""))[0];

  // Racha: días seguidos con sesión, contando desde hoy (o desde ayer si hoy aún no hay).
  const dates = new Set(d.sesiones.map((s) => s.fecha));
  let racha = 0;
  for (let day = dates.has(today) ? today : Util.addDays(today, -1); dates.has(day); day = Util.addDays(day, -1)) racha++;
  const last = d.sesiones[d.sesiones.length - 1];

  const out = [];
  out.push(`# Fluidez activa · ${today}`);
  out.push(`Sesiones: ${d.sesiones.length}${last ? ` · última: ${last.fecha} (${TEMAS[last.tema] ? last.tema : last.tema || "—"})` : ""} · racha: ${racha} ${racha === 1 ? "día" : "días"}`);
  out.push(`Chunks: ${chunks.length} · activos ${by[STATUS.activa].length} · en uso ${by[STATUS.uso].length} · nuevos sin producir ${by[STATUS.nueva].length}`);
  out.push("");
  out.push(`## Tema sugerido hoy: ${tema} — ${TEMAS[tema]}`);
  out.push("");
  out.push(`## Repaso de producción (toca hoy: ${due.length})`);
  if (!due.length) out.push("- (nada vencido)");
  for (const c of due.slice(0, 8)) out.push(`- ${c.en} — ${c.es}${c.srs.lapses ? ` · fallos: ${c.srs.lapses}` : ""} · vence ${c.srs.due}`);
  out.push("");
  out.push(`## Nuevos aún sin producir (${pending.length})`);
  if (!pending.length) out.push("- (ninguno)");
  for (const c of pending.slice(0, 6)) out.push(`- ${c.en} — ${c.es} (desde ${c.alta})`);
  if (last && (last.foco || []).length) {
    out.push("");
    out.push("## Foco que dejaste la última vez");
    for (const f of last.foco) out.push(`- ${f}`);
  }

  const exp = readExport();
  out.push("");
  if (!exp) out.push("## App: no encuentro ninguna copia exportada (english20-progreso-*.json). Exporta una desde el panel para traer tus errores.");
  else if (exp.error) out.push(`## App: no pude leer ${exp.path} (${exp.error})`);
  else {
    const st = exp.state;
    const age = Util.daysBetween(st.settings.lastExport || today, today);
    out.push(`## App (copia: ${exp.path}${st.settings.lastExport ? `, del ${st.settings.lastExport}` : ""}${age > 7 ? " — ¡antigua! exporta una nueva" : ""})`);
    out.push(`Nivel: ${String(st.settings.level).toUpperCase()} · sesiones en la app: ${st.sessions.length}`);
    const ranked = Errors.ranked(st.errors || {}, today).slice(0, 4);
    out.push("Errores recurrentes:");
    if (!ranked.length) out.push("- (ninguno activo)");
    for (const r of ranked) {
      const ex = r.p.examples[0];
      out.push(`- [${r.status === "critical" ? "CRÍTICO" : "emergente"}] ${r.p.label} · ${r.active} fallos${ex && ex.expected ? ` · p. ej. "${ex.given}" → "${ex.expected}"` : ""}`);
    }
    const weakBank = st.custom
      .filter((w) => !d.chunks[key(w.en)])
      .map((w) => ({ w, r: st.items[w.id] }))
      .filter(({ r }) => !SRS.isMastered(r))
      .sort((a, b) => ((b.r && b.r.lapses) || 0) - ((a.r && a.r.lapses) || 0))
      .slice(0, 5);
    out.push("Palabras del banco aún no activas:");
    if (!weakBank.length) out.push("- (ninguna)");
    for (const { w, r } of weakBank) out.push(`- ${w.en} — ${w.es}${r && r.lapses ? ` · fallos en la app: ${r.lapses}` : ""}`);
  }
  console.log(out.join("\n"));
}

/* --------------------------------------------------------------- registrar */
function cmdRegistrar() {
  const file = process.argv[3];
  if (!file) fail("Uso: node scripts/fluidez.js registrar progreso/ultima-sesion.json");
  let p;
  try { p = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { fail(`No pude leer ${file}: ${e.message}`); }
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(p.fecha || "") ? p.fecha : Util.today();
  const tema = typeof p.tema === "string" && p.tema ? p.tema : "libre";
  const d = load();
  const errs = [];
  const add = (w, fuente) => {
    const en = String(w.en || "").trim(), es = String(w.es || "").trim();
    if (!en || !es) { errs.push(`chunk sin "en" o "es": ${JSON.stringify(w)}`); return null; }
    const k = key(en);
    if (!d.chunks[k]) d.chunks[k] = { en, es, ejemplo: String(w.ejemplo || ""), tema, fuente: w.fuente || fuente, alta: fecha, srs: null, usos: 0, espontaneo: 0, enviadoApp: false };
    else if (w.ejemplo && !d.chunks[k].ejemplo) d.chunks[k].ejemplo = String(w.ejemplo);
    return d.chunks[k];
  };

  const nuevos = Array.isArray(p.nuevos) ? p.nuevos : [];
  let creados = 0;
  for (const w of nuevos) { const before = d.chunks[key(w.en || "")]; if (add(w, "nuevo") && !before) creados++; }

  const resultados = Array.isArray(p.resultados) ? p.resultados : [];
  const activados = [], fallados = [];
  let ok = 0;
  for (const r of resultados) {
    const k = key(r.en || "");
    const c = d.chunks[k] || (r.es ? add(r, "sesion") : null);
    if (!c) { errs.push(`resultado de un chunk desconocido sin "es": ${r.en}`); continue; }
    const q = SRS.quality(r.q);
    const wasActive = SRS.isMastered(c.srs);
    c.srs = SRS.nextRecord(c.srs, q, fecha);
    if (q >= 3) { ok++; c.usos++; if (r.espontaneo) c.espontaneo++; }
    else fallados.push(c.en);
    if (!wasActive && SRS.isMastered(c.srs)) activados.push(c.en);
  }

  if (errs.length) fail(`El archivo tiene errores; no he guardado nada:\n  - ${errs.join("\n  - ")}`);

  d.sesiones.push({
    fecha, tema,
    minutos: Math.max(0, Number(p.minutos) || 0),
    nuevos: creados,
    producciones: resultados.length,
    aciertos: ok,
    espontaneos: resultados.filter((r) => r.espontaneo && SRS.quality(r.q) >= 3).length,
    circunloquios: Math.max(0, Number(p.circunloquios) || 0),
    foco: Array.isArray(p.foco) ? p.foco.map(String).slice(0, 5) : [],
    logros: Array.isArray(p.logros) ? p.logros.map(String).slice(0, 5) : []
  });
  if (d.sesiones.length > 365) d.sesiones = d.sesiones.slice(-365);
  save(d);

  const pend = Object.values(d.chunks).filter((c) => !c.enviadoApp).length;
  console.log(`✓ Sesión registrada (${fecha}, ${tema}): ${creados} chunks nuevos · ${ok}/${resultados.length} producciones correctas.`);
  if (activados.length) console.log(`★ Ya son ACTIVOS (3 repasos espaciados acertados): ${activados.join(", ")}`);
  if (fallados.length) console.log(`↺ Vuelven mañana: ${fallados.join(", ")}`);
  if (pend) console.log(`→ ${pend} chunks aún no están en la app. Ejecuta: node scripts/fluidez.js banco`);
}

/* ------------------------------------------------------------------- banco */
function cmdBanco() {
  const d = load();
  const all = process.argv.includes("--todo");
  const list = Object.values(d.chunks).filter((c) => all || !c.enviadoApp);
  if (!list.length) { console.log("No hay chunks nuevos para la app."); return; }
  const out = Bank.toFile(list.map((c) => ({ en: c.en, es: c.es, example: c.ejemplo })));
  fs.mkdirSync(DIR, { recursive: true });
  const f = path.join(DIR, `banco-para-app-${Util.today()}.json`);
  fs.writeFileSync(f, JSON.stringify(out, null, 2) + "\n", "utf8");
  for (const c of list) c.enviadoApp = true;
  save(d);
  console.log(`✓ ${rel(f)} · ${list.length} chunks. En la app: panel → Copia de seguridad → Importar copia → «Añadir al banco».`);
}

/* -------------------------------------------------------------------- main */
const cmd = process.argv[2];
if (cmd === "estado") cmdEstado();
else if (cmd === "registrar") cmdRegistrar();
else if (cmd === "banco") cmdBanco();
else {
  console.log("Uso: node scripts/fluidez.js <estado|registrar <archivo>|banco [--todo]> [--export ruta.json]");
  process.exit(cmd ? 1 : 0);
}
