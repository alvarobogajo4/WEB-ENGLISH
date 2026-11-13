/* Guardado automático en la nube — lado del ordenador.
 * La app del iPhone guarda su estado en un gist secreto de la cuenta de GitHub
 * del alumno (descripción C.Cloud.DESCRIPTION). Aquí se usa la sesión de GitHub
 * que ya tiene el ordenador (gh), sin configurar nada:
 *   pullState(dir) → baja estado.json a <dir>/nube-estado.json (con la fecha del
 *                    estado como fecha del archivo, para elegir la copia más nueva)
 *   upload(file)   → sube un archivo para la app (banco-/nivel-para-app-…) al gist;
 *                    la app lo añade sola la próxima vez que se abra.
 * Sin gh, sin conexión o sin gist: no hace nada (se sigue con OneDrive/English20).
 * En modo prueba (FLUIDEZ_DIR) está apagado salvo que E20_NUBE=1. */
"use strict";
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { Cloud } = require("../js/core.js");

const enabled = () => !process.env.FLUIDEZ_DIR || process.env.E20_NUBE === "1";
function gh(args, input) {
  return execFileSync("gh", args, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"], timeout: 20000, ...(input ? { input } : {}) });
}

let cached;
function findGist() {
  if (cached !== undefined) return cached;
  cached = null;
  if (!enabled()) return null;
  try {
    const list = JSON.parse(gh(["api", "gists?per_page=100"]));
    const g = list.find((x) => x.description === Cloud.DESCRIPTION);
    cached = g ? g.id : null;
  } catch (_) { cached = null; }
  return cached;
}

/* Devuelve la ruta del archivo bajado o null. */
function pullState(dir) {
  const id = findGist();
  if (!id) return null;
  try {
    const g = JSON.parse(gh(["api", `gists/${id}`]));
    const f = g.files && g.files[Cloud.STATE_FILE];
    if (!f) return null;
    const text = f.truncated ? gh(["api", f.raw_url]) : f.content;
    const data = JSON.parse(text);
    const out = path.join(dir, "nube-estado.json");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(out, text, "utf8");
    const t = new Date(data.exportedAt || Date.now());
    fs.utimesSync(out, t, t);
    return out;
  } catch (_) { return null; }
}

/* Sube un archivo al gist. Devuelve true si se subió. */
function upload(file) {
  const id = findGist();
  if (!id) return false;
  const tmp = path.join(os.tmpdir(), `e20-nube-${process.pid}-${Date.now()}.json`);
  try {
    fs.writeFileSync(tmp, JSON.stringify({ files: { [path.basename(file)]: { content: fs.readFileSync(file, "utf8") } } }), "utf8");
    gh(["api", "-X", "PATCH", `gists/${id}`, "--input", tmp]);
    return true;
  } catch (_) { return false; }
  finally { try { fs.unlinkSync(tmp); } catch (_) { /* ya no está */ } }
}

module.exports = { findGist, pullState, upload, enabled };
