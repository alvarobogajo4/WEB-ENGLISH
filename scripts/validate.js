#!/usr/bin/env node
/* Valida el contenido (js/data_c1.js + lotes de js/content/) contra las reglas.
 * Uso: npm run validate   → sale con código 1 si hay errores (los avisos no fallan).
 * Los lotes se cargan en el orden de index.html, igual que en el navegador, y se
 * comprueba que cada archivo de js/content/ esté enlazado en index.html y en sw.js.
 */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { countHedges } = require("../js/core.js");

const ROOT = path.join(__dirname, "..");
const errors = [], warnings = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);
const warn = (id, msg) => warnings.push(`${id}: ${msg}`);

const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
const scripts = [...html.matchAll(/<script src="\.\/(js\/(?:data_c1|content\/[^"]+)\.js)"><\/script>/g)].map((m) => m[1]);
const lotes = fs.existsSync(path.join(ROOT, "js", "content")) ? fs.readdirSync(path.join(ROOT, "js", "content")).filter((n) => n.endsWith(".js")).map((n) => `js/content/${n}`) : [];
for (const l of lotes) {
  if (!scripts.includes(l)) err(l, "lote sin <script> en index.html (la app no lo cargaría)");
  if (!sw.includes(`"./${l}"`)) err(l, "lote sin precachear en sw.js (no funcionaría offline): añádelo a ASSETS y sube CACHE_VERSION");
}
const sandbox = { window: {} };
for (const f of scripts) {
  try { vm.runInNewContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f }); }
  catch (e) { err(f, `no se pudo cargar: ${e.message}`); }
}
const D = sandbox.window.E20_DATA;
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const LEVELS = ["b2", "c1"];

/* ---- Configuración ---- */
for (const pool of Object.keys(D.BLOCKS)) {
  if (!D.POOL_BLOCK[pool]) err(pool, "pool sin entrada en POOL_BLOCK");
  if (!LEVELS.includes(D.POOL_DEFAULT_LEVEL[pool])) err(pool, "pool sin nivel válido en POOL_DEFAULT_LEVEL");
  if (!D.POOL_LABEL[pool]) err(pool, "pool sin etiqueta en POOL_LABEL");
}
for (const [lv, mix] of Object.entries(D.SESSION_MIX)) {
  for (const [block, pools] of Object.entries(mix)) {
    if (!D.BLOCK_META[block]) err(`SESSION_MIX.${lv}`, `bloque desconocido "${block}"`);
    for (const [pool, n] of Object.entries(pools)) {
      if (!D.BLOCKS[pool]) err(`SESSION_MIX.${lv}.${block}`, `pool desconocido "${pool}"`);
      else if (D.POOL_BLOCK[pool] !== block) err(`SESSION_MIX.${lv}.${block}`, `"${pool}" pertenece al bloque ${D.POOL_BLOCK[pool]}`);
      if (!Number.isInteger(n) || n < 1) err(`SESSION_MIX.${lv}.${block}.${pool}`, "cantidad no válida");
    }
  }
}

for (const [k, m] of Object.entries(D.BLOCK_META)) if (!Number.isInteger(m.seconds) || m.seconds < 60) err(`BLOCK_META.${k}`, "falta seconds (duración de referencia del bloque)");
for (const [pool, b] of Object.entries(D.POOL_BLOCK)) if (!D.BLOCK_META[b]) err(`POOL_BLOCK.${pool}`, `bloque desconocido "${b}"`);
for (const [lv, pools] of Object.entries(D.SESSION_ROTATION || {})) {
  if (!D.SESSION_MIX[lv]) err(`SESSION_ROTATION.${lv}`, "nivel desconocido");
  for (const pool of pools) if (!D.BLOCKS[pool] || D.POOL_BLOCK[pool] !== "review") err(`SESSION_ROTATION.${lv}`, `"${pool}" no es un pool del repaso`);
}

/* ---- Comunes ---- */
const seen = new Map();
const ID_RE = /^[A-Z0-9]+-\d{3,}$/;
for (const [pool, list] of Object.entries(D.BLOCKS)) {
  for (const it of list) {
    const id = it.id || `(sin id en ${pool})`;
    if (!ID_RE.test(it.id || "")) err(id, "id con formato no válido (p. ej. MM-001)");
    if (seen.has(it.id)) err(id, `id duplicado (también en ${seen.get(it.id)})`);
    seen.set(it.id, pool);
    if (!D.DOMAINS[it.domain]) err(id, `domain desconocido "${it.domain}"`);
    if (it.level !== undefined && !LEVELS.includes(it.level)) err(id, `level no válido "${it.level}"`);
  }
}

const options = (id, opts, answer) => {
  if (!Array.isArray(opts) || opts.length < 2) return err(id, "necesita al menos 2 opciones");
  if (opts.some((o) => !isStr(o))) err(id, "opción vacía");
  if (new Set(opts.map((o) => o.trim().toLowerCase())).size !== opts.length) err(id, "opciones repetidas");
  if (answer !== undefined && !opts.includes(answer)) err(id, `answer "${answer}" no está en options`);
  if (opts.length > 4) warn(id, "más de 4 opciones: los atajos 1–4 no llegan");
};

/* ---- Por pool ---- */
const TONES = ["natural", "formal", "buzzword"];
const VOCAB_TYPES = ["phrasal", "idiom", "collocation", "word"];

for (const it of D.BLOCKS.registerUpgrade || []) {
  for (const k of ["plain", "c1", "whyItWorks"]) if (!isStr(it[k])) err(it.id, `falta ${k}`);
  if (it.tone === undefined) warn(it.id, "sin tone (natural | formal | buzzword)");
  else if (!TONES.includes(it.tone)) err(it.id, `tone no válido "${it.tone}"`);
  options(it.id, [it.c1, ...(it.distractors || [])]);
}

for (const pool of ["collocations", "hrVocab", "everydayVocab", "grammar"]) {
  for (const it of D.BLOCKS[pool] || []) {
    const gaps = (it.sentence || "").split("___").length - 1;
    if (gaps !== 1) err(it.id, `sentence debe tener exactamente un "___" (tiene ${gaps})`);
    options(it.id, it.options, it.answer);
    if (pool === "grammar") { if (!isStr(it.rule)) err(it.id, "falta rule"); if (!isStr(it.topic)) err(it.id, "falta topic"); }
    else if (!isStr(it.meaningEs)) err(it.id, "falta meaningEs");
    if ((pool === "collocations" || pool === "everydayVocab") && it.type !== undefined && !VOCAB_TYPES.includes(it.type)) err(it.id, `type no válido "${it.type}"`);
  }
}

for (const [pool, it] of [...(D.BLOCKS.meetingMoves || []).map((x) => ["meetingMoves", x]), ...(D.BLOCKS.conversation || []).map((x) => ["conversation", x])]) {
  if (!D.MOVE_FUNCTIONS[it.fn]) err(it.id, `fn desconocida "${it.fn}"`);
  for (const k of ["situation", "answer", "note"]) if (!isStr(it[k])) err(it.id, `falta ${k}`);
  options(it.id, [it.answer, ...(it.distractors || [])]);
  const h = countHedges(it.answer || "", { social: pool === "conversation" });
  if (h.length) warn(it.id, `la respuesta modelo contiene muletillas que el panel de Delivery penaliza: ${h.map((x) => x.t).join(", ")}`);
}

for (const it of D.BLOCKS.traps || []) {
  if (!D.TRAP_CATEGORIES[it.category]) err(it.id, `category desconocida "${it.category}"`);
  for (const k of ["spanishSource", "right", "wrong", "alt", "trap"]) if (!isStr(it[k])) err(it.id, `falta ${k}`);
  options(it.id, [it.right, it.wrong, it.alt]);
}

for (const it of D.BLOCKS.listening || []) {
  if (!Array.isArray(it.lines) || !it.lines.length) err(it.id, "sin lines");
  for (const l of it.lines || []) {
    if (!D.SPEAKERS[l.who]) err(it.id, `hablante desconocido "${l.who}"`);
    if (!isStr(l.text)) err(it.id, "línea vacía");
  }
  if (!Array.isArray(it.questions) || !it.questions.length) err(it.id, "sin preguntas");
  (it.questions || []).forEach((q, i) => {
    options(`${it.id} P${i + 1}`, q.options);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options || []).length) err(it.id, `P${i + 1}: answer fuera de rango`);
  });
  for (const g of it.glossary || []) if (!isStr(g.t) || !isStr(g.es)) err(it.id, "entrada de glosario incompleta");
  // El repaso de un audio es un dictado: necesita al menos una frase de 8+ palabras.
  if ((it.lines || []).every((l) => String(l.text).split(/\s+/).length < 8)) warn(it.id, "ninguna línea tiene 8+ palabras: el dictado de repaso será pobre");
}

for (const it of D.BLOCKS.challenges || []) {
  if (!D.SCENARIOS[it.scenario]) err(it.id, `scenario desconocido "${it.scenario}"`);
  for (const k of ["brief", "modelAnswer"]) if (!isStr(it[k])) err(it.id, `falta ${k}`);
  if (!Array.isArray(it.selfCheck) || !it.selfCheck.length) err(it.id, "sin selfCheck");
  if (!Array.isArray(it.framework) || !it.framework.length) err(it.id, "sin framework");
  for (const u of it.mustUse || []) {
    let re;
    try { re = new RegExp(u.m, "i"); } catch (e) { err(it.id, `regex no válida en "${u.t}": ${e.message}`); continue; }
    if (!re.test(it.modelAnswer)) err(it.id, `la modelAnswer no cumple el chunk obligatorio "${u.t}"`);
  }
  if (it.context !== undefined && it.context !== "social") err(it.id, `context no válido "${it.context}" (solo "social")`);
  const h = countHedges(it.modelAnswer || "", { social: it.context === "social" });
  if (h.length) warn(it.id, `la modelAnswer contiene muletillas: ${h.map((x) => x.t).join(", ")}`);
}

/* ---- Informe ---- */
const total = Object.values(D.BLOCKS).reduce((n, l) => n + l.length, 0);
const byPool = Object.entries(D.BLOCKS).map(([p, l]) => `${p} ${l.length}`).join(" · ");
console.log(`Contenido: ${total} ítems (${byPool})${D.batches && D.batches.length ? ` · lotes: ${D.batches.join(", ")}` : ""}`);
for (const w of warnings) console.log(`  aviso  ${w}`);
for (const e of errors) console.log(`  ERROR  ${e}`);
console.log(errors.length ? `\n✗ ${errors.length} errores, ${warnings.length} avisos` : `\n✓ Sin errores (${warnings.length} avisos)`);
process.exit(errors.length ? 1 : 0);
