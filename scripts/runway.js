#!/usr/bin/env node
/* =============================================================================
 * Runway de contenido — npm run runway [-- --level c1] [-- --export ruta.json]
 * -----------------------------------------------------------------------------
 * Cuántos días de sesiones diarias quedan antes de que cada pool se quede sin
 * ítems NUEVOS (después solo hay repasos, y el aprendizaje se estanca).
 * Si encuentra tu progreso (progreso/app-estado.json con npm start, o --export)
 * descuenta lo que ya has visto; si no, calcula desde cero.
 * Sirve para decidir qué pedirle a /generar-contenido: lo que tenga < 14 días.
 * ========================================================================== */
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { State } = require("../js/core.js");
const { loadData } = require("./load-data.js");

const ROOT = path.join(__dirname, "..");
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null; };
const WARN_DAYS = 14;

const D = loadData();
const level = arg("--level") === "c1" ? "c1" : "b2";
const exportPath = arg("--export") || path.join(process.env.FLUIDEZ_DIR || path.join(ROOT, "progreso"), "app-estado.json");
let items = {}, source = "sin progreso (desde cero)";
if (fs.existsSync(exportPath)) {
  try { items = State.fromImport(fs.readFileSync(exportPath, "utf8")).items; source = path.relative(ROOT, exportPath) || exportPath; }
  catch (e) { source = `no se pudo leer ${exportPath}: ${e.message}`; }
}

const mix = D.SESSION_MIX[level];
const rows = [];
for (const [block, pools] of Object.entries(mix)) {
  for (const [pool, perDay] of Object.entries(pools)) {
    const list = D.BLOCKS[pool];
    const lv = (it) => it.level || D.POOL_DEFAULT_LEVEL[pool];
    const unseen = list.filter((it) => !items[it.id]);
    // En B2 la app agota primero los B2; los C1 entran solo cuando no queda B2 nuevo.
    const atLevel = level === "b2" ? unseen.filter((it) => lv(it) === "b2").length : unseen.length;
    const days = Math.floor(unseen.length / perDay);
    rows.push({ pool, block, total: list.length, unseen: unseen.length, atLevel, perDay, daysLevel: Math.floor(atLevel / perDay), days });
  }
}
rows.sort((a, b) => a.daysLevel - b.daysLevel);

const pad = (s, n) => String(s).padEnd(n);
console.log(`# Runway de contenido · nivel ${level.toUpperCase()} · ${source}`);
console.log(`${pad("pool", 16)}${pad("total", 7)}${pad("nuevos", 8)}${pad(`nuevos ${level.toUpperCase()}`, 11)}${pad("/día", 6)}días ${level.toUpperCase()} · días total`);
for (const r of rows) {
  const flag = r.daysLevel < WARN_DAYS ? "  ⚠" : "";
  console.log(`${pad(r.pool, 16)}${pad(r.total, 7)}${pad(r.unseen, 8)}${pad(r.atLevel, 11)}${pad(r.perDay, 6)}${pad(r.daysLevel, 4)}  ·  ${r.days}${flag}`);
}
// Siguiente id libre por pool (los ids son estables: siempre se añade al final).
const nextIds = Object.entries(D.BLOCKS).map(([pool, list]) => {
  const byPrefix = {};
  for (const it of list) { const m = /^([A-Z0-9]+)-(\d+)$/.exec(it.id); if (m) byPrefix[m[1]] = Math.max(byPrefix[m[1]] || 0, Number(m[2])); }
  const [pre, n] = Object.entries(byPrefix).sort((a, b) => b[1] - a[1])[0] || ["?", 0];
  return `${pool} ${pre}-${String(n + 1).padStart(3, "0")}`;
});
console.log("");
console.log(`Siguientes ids: ${nextIds.join(" · ")}`);
console.log(`Lotes cargados: ${(D.batches || []).join(", ") || "—"}`);
const low = rows.filter((r) => r.daysLevel < WARN_DAYS);
console.log("");
console.log(low.length
  ? `Prioridad para /generar-contenido: ${low.map((r) => `${r.pool} (+${Math.max(r.perDay * 21 - r.atLevel, r.perDay * 7)})`).join(", ")} — objetivo: 3 semanas de contenido nuevo en ${level.toUpperCase()}.`
  : `Todo con ≥ ${WARN_DAYS} días de contenido nuevo.`);
