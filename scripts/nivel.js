#!/usr/bin/env node
/* =============================================================================
 * Nivel de expresión — progreso de la skill /chequeo-nivel (Claude Code)
 * -----------------------------------------------------------------------------
 *   node scripts/nivel.js estado
 *       Historial de chequeos, evolución, mapa de situaciones, foco actual y las
 *       variantes de tarea ya usadas (para no repetirlas).
 *
 *   node scripts/nivel.js metricas progreso/chequeo.json
 *       Solo calcula las métricas objetivas de las respuestas del archivo.
 *
 *   node scripts/nivel.js registrar progreso/chequeo.json
 *       Valida la evaluación, añade las métricas, la guarda en progreso/nivel.json
 *       y crea progreso/nivel-para-app-AAAA-MM-DD.json para importarlo en la app.
 *
 * La escala, los criterios y la validación viven en js/core.js (Nivel), los mismos
 * que usa la app. Datos personales en progreso/ (fuera de git).
 * ========================================================================== */
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { Util, Nivel } = require("../js/core.js");

const ROOT = path.join(__dirname, "..");
const DIR = process.env.FLUIDEZ_DIR ? path.resolve(process.env.FLUIDEZ_DIR) : path.join(ROOT, "progreso");
const FILE = path.join(DIR, "nivel.json");
const FLUIDEZ = path.join(DIR, "fluidez-activa.json");
const REPEAT_DAYS = 30;

const rel = (p) => path.relative(ROOT, p) || p;
function fail(msg) { console.error(`✖ ${msg}`); process.exit(1); }

function load() {
  if (!fs.existsSync(FILE)) return { version: 1, chequeos: [] };
  try {
    const d = JSON.parse(fs.readFileSync(FILE, "utf8"));
    if (!d || !Array.isArray(d.chequeos)) throw new Error("forma incorrecta");
    return d;
  } catch (e) { fail(`No se pudo leer ${rel(FILE)} (${e.message}). No lo toco: revísalo o restaura ${rel(FILE)}.bak`); }
}

function save(d) {
  fs.mkdirSync(DIR, { recursive: true });
  if (fs.existsSync(FILE)) fs.copyFileSync(FILE, FILE + ".bak");
  fs.writeFileSync(FILE + ".tmp", JSON.stringify(d, null, 2) + "\n", "utf8");
  fs.renameSync(FILE + ".tmp", FILE);
}

/* Chunks que ya produces (de /fluidez-activa), para medir cuántos usas al hablar. */
function producedChunks() {
  try {
    const f = JSON.parse(fs.readFileSync(FLUIDEZ, "utf8"));
    return Object.values(f.chunks || {}).filter((c) => c.srs && c.srs.correct > 0).map((c) => c.en);
  } catch (_) { return []; }
}

function readInput() {
  const file = process.argv[3];
  if (!file) fail(`Uso: node scripts/nivel.js ${process.argv[2]} progreso/chequeo.json`);
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { fail(`No pude leer ${file}: ${e.message}`); }
}

function metricsOf(raw) {
  const resp = Array.isArray(raw.respuestas) ? raw.respuestas : [];
  return Nivel.metrics(resp.map((r) => (r && typeof r.texto === "string" ? r.texto : "")), producedChunks());
}

const entries = (d) => d.chequeos.map(Nivel.tryNormalize).filter(Boolean);
const fmtDelta = (n) => (n > 0 ? `↑ +${n}` : n < 0 ? `↓ ${n}` : "=");

/* ------------------------------------------------------------------ estado */
function cmdEstado() {
  const d = load(), today = Util.today(), h = entries(d);
  const out = [`# Nivel de expresión · ${today}`];
  if (!h.length) {
    out.push("Aún no hay chequeos. El primero será tu punto de partida.");
    out.push(`Situaciones posibles: ${Object.keys(Nivel.SITUATIONS).join(", ")}`);
    console.log(out.join("\n"));
    return;
  }
  const last = h[h.length - 1], age = Util.daysBetween(last.fecha, today);
  out.push(`Último chequeo: ${last.fecha} (hace ${age} días)${age >= REPEAT_DAYS ? " — TOCA CHEQUEO" : ""} · modo ${last.modo}`);
  out.push(`Nivel global: ${last.global.nivel} (${last.global.puntos} en la escala Cambridge) · objetivo ${Nivel.GOAL} (${Nivel.toScore(Nivel.GOAL)})`);
  const tr = Nivel.trend(h);
  out.push("");
  out.push("## Criterios");
  for (const [k, label] of Object.entries(Nivel.CRITERIA)) out.push(`- ${label}: ${last.criterios[k].nivel}${tr ? ` (${fmtDelta(tr.criterios[k])})` : ""}`);
  out.push("");
  out.push(`## Foco hasta el próximo chequeo: ${Nivel.CRITERIA[last.foco.criterio]}${last.foco.situacion ? ` · ${Nivel.SITUATIONS[last.foco.situacion]}` : ""}`);
  for (const w of last.debiles) out.push(`- ${w.texto} → ${w.accion}`);
  out.push("");
  out.push("## Mapa de situaciones (último nivel conocido)");
  const map = Nivel.situationMap(h);
  for (const [k, label] of Object.entries(Nivel.SITUATIONS)) out.push(`- ${label}: ${map[k] ? `${map[k].nivel} (${map[k].fecha})` : "sin evaluar"}`);
  out.push("");
  out.push("## Historial");
  for (const e of h) out.push(`- ${e.fecha}: ${e.global.nivel} (${e.global.puntos})`);
  const used = h.slice(-3).flatMap((e) => e.variantes);
  if (used.length) { out.push(""); out.push(`Variantes usadas en los últimos chequeos (no repetir): ${used.join(", ")}`); }
  console.log(out.join("\n"));
}

/* ---------------------------------------------------------------- metricas */
function cmdMetricas() { console.log(JSON.stringify(metricsOf(readInput()), null, 2)); }

/* --------------------------------------------------------------- registrar */
function cmdRegistrar() {
  const raw = readInput();
  if (!raw.fecha) raw.fecha = Util.today();
  const metricas = metricsOf(raw);
  const { entry, errors } = Nivel.normalize({ ...raw, metricas: { ...metricas, ...(raw.metricas || {}) } });
  if (!entry) fail(`El chequeo tiene errores; no he guardado nada:\n  - ${errors.join("\n  - ")}`);

  // En local se guardan también las respuestas (para comparar meses); a la app solo va la evaluación.
  // Un chequeo de la misma fecha se reemplaza.
  const d = load();
  d.chequeos = [...d.chequeos.filter((c) => c.fecha !== entry.fecha), { ...entry, respuestas: Array.isArray(raw.respuestas) ? raw.respuestas : [] }]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(-Nivel.MAX_HISTORY);
  save(d);

  const h = entries(d);
  const appFile = path.join(DIR, `nivel-para-app-${entry.fecha}.json`);
  fs.writeFileSync(appFile, JSON.stringify(Nivel.toFile(h), null, 2) + "\n", "utf8");

  const tr = Nivel.trend(h);
  const lines = [
    `✓ Chequeo del ${entry.fecha} registrado.`,
    `Nivel global: ${entry.global.nivel} (${entry.global.puntos})${tr ? ` · ${fmtDelta(tr.global)} desde el anterior` : " · punto de partida"} · objetivo ${Nivel.GOAL}`,
    `Criterios: ${Object.entries(Nivel.CRITERIA).map(([k, l]) => `${l} ${entry.criterios[k].nivel}`).join(" · ")}`,
    `Foco: ${Nivel.CRITERIA[entry.foco.criterio]}${entry.foco.situacion ? ` · ${Nivel.SITUATIONS[entry.foco.situacion]}` : ""}`,
    `Métricas: ${metricas.palabrasPorTurno} palabras/turno · variedad ${metricas.variedadLexica} · ${metricas.conectores} conectores · ${metricas.chunksActivos} chunks tuyos · muletillas ${metricas.muletillas}/100 · atenuadores ${metricas.atenuadores}/100`,
    `→ Para verlo en la app: Panel → Copia de seguridad → Importar copia → ${rel(appFile)}`
  ];
  console.log(lines.join("\n"));
}

const cmd = process.argv[2];
if (cmd === "estado") cmdEstado();
else if (cmd === "metricas") cmdMetricas();
else if (cmd === "registrar") cmdRegistrar();
else { console.log("Uso: node scripts/nivel.js <estado|metricas <archivo>|registrar <archivo>>"); process.exit(cmd ? 1 : 0); }
