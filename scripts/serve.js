#!/usr/bin/env node
/* =============================================================================
 * Servidor local de English 20 Minutes (npm start)
 * -----------------------------------------------------------------------------
 * Sirve la app y la conecta con la carpeta progreso/ para que la app y las
 * skills de Claude Code (/fluidez-activa, /chequeo-nivel) compartan datos sin
 * exportar ni importar archivos a mano:
 *
 *   GET  /api/ping        → { ok: true }  (la app detecta que puede sincronizar)
 *   POST /api/app-estado  → guarda la copia de la app en progreso/app-estado.json
 *                           (la lee scripts/fluidez.js para traer tus errores y retos)
 *   GET  /api/inbox       → archivos para la app que han generado las skills:
 *                           progreso/banco-para-app-*.json y nivel-para-app-*.json
 *                           (la app los AÑADE una sola vez; no reemplazan nada)
 *
 * Seguridad: solo escucha en 127.0.0.1, rechaza Host/Origin que no sean locales
 * (evita DNS rebinding), solo sirve los ficheros de la app y solo escribe un
 * archivo fijo, validado con el mismo núcleo que la app.
 * Sin dependencias: solo Node ≥ 20. Puerto: PORT (por defecto 8080).
 * ========================================================================== */
"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { State } = require("../js/core.js");

const ROOT = path.join(__dirname, "..");
const DIR = process.env.FLUIDEZ_DIR ? path.resolve(process.env.FLUIDEZ_DIR) : path.join(ROOT, "progreso");
const PORT = Number(process.env.PORT) || 8080;
const HOST = "127.0.0.1";
const MAX_BODY = 5 * 1024 * 1024;
const INBOX_RE = /^(banco|nivel)-para-app-\d{4}-\d{2}-\d{2}\.json$/;

/* Solo los ficheros de la app (nunca progreso/, .git, scripts…). */
const PUBLIC = new Set(["index.html", "manifest.json", "sw.js"]);
const PUBLIC_DIRS = ["js/", "icons/"];
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".webmanifest": "application/manifest+json" };

function send(res, code, body, type = "application/json; charset=utf-8") {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

const localHost = (h) => /^(127\.0\.0\.1|localhost)(:\d+)?$/i.test(h || "");
function trusted(req) {
  if (!localHost(req.headers.host)) return false;
  const origin = req.headers.origin;
  if (origin && !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(origin)) return false;
  return true;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => { size += c.length; if (size > MAX_BODY) { reject(new Error("too large")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function writeAtomic(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, text, "utf8");
  fs.renameSync(tmp, file);
}

async function api(req, res, url) {
  if (url.pathname === "/api/ping" && req.method === "GET") return send(res, 200, { ok: true, app: "english-20-minutes" });
  if (url.pathname === "/api/inbox" && req.method === "GET") {
    let names = [];
    try { names = fs.readdirSync(DIR).filter((n) => INBOX_RE.test(n)).sort(); } catch (_) { /* sin carpeta aún */ }
    const files = [];
    for (const name of names) {
      try { files.push({ name, data: JSON.parse(fs.readFileSync(path.join(DIR, name), "utf8")) }); } catch (_) { /* archivo dañado: se ignora */ }
    }
    return send(res, 200, { files });
  }
  if (url.pathname === "/api/app-estado" && req.method === "POST") {
    let text;
    try { text = await readBody(req); } catch (_) { return send(res, 413, { error: "Demasiado grande" }); }
    try { State.fromImport(text); } catch (e) { return send(res, 400, { error: e.message }); }
    writeAtomic(path.join(DIR, "app-estado.json"), text);
    return send(res, 200, { ok: true });
  }
  return send(res, 404, { error: "No existe" });
}

function serveStatic(req, res, url) {
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method not allowed", "text/plain");
  let rel = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  if (rel === "") rel = "index.html";
  const ok = PUBLIC.has(rel) || PUBLIC_DIRS.some((d) => rel.startsWith(d));
  const file = path.join(ROOT, rel);
  if (!ok || rel.includes("..") || !file.startsWith(ROOT + path.sep)) return send(res, 404, "Not found", "text/plain");
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, "Not found", "text/plain");
    send(res, 200, req.method === "HEAD" ? "" : buf, TYPES[path.extname(file)] || "application/octet-stream");
  });
}

function createServer() {
  return http.createServer((req, res) => {
    if (!trusted(req)) return send(res, 403, { error: "Solo acceso local" });
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) return api(req, res, url).catch(() => send(res, 500, { error: "Error interno" }));
    return serveStatic(req, res, url);
  });
}

if (require.main === module) {
  createServer().listen(PORT, HOST, () => {
    console.log(`English 20 Minutes → http://${HOST}:${PORT}`);
    console.log(`Sincronización con ${path.relative(ROOT, DIR) || DIR}/ activa (Ctrl + C para parar).`);
  }).on("error", (e) => {
    console.error(e.code === "EADDRINUSE" ? `✖ El puerto ${PORT} está ocupado. Prueba: PORT=8091 npm start` : `✖ ${e.message}`);
    process.exit(1);
  });
}

module.exports = { createServer };
