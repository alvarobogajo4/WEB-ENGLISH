/* Carpeta puente con el móvil (opción A de sincronización): OneDrive/English20.
 *   iPhone → ordenador: la app exporta su copia ahí (Compartir → Guardar en Archivos).
 *   ordenador → iPhone: las skills dejan ahí sus archivos para la app (banco, nivel).
 * E20_BRIDGE_DIR la sustituye (tests). Con FLUIDEZ_DIR (modo prueba) y sin
 * E20_BRIDGE_DIR no hay puente: nunca se toca el OneDrive real en los tests. */
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const FOLDER = "English20";

function bridgeDir() {
  if (process.env.E20_BRIDGE_DIR) return path.resolve(process.env.E20_BRIDGE_DIR);
  if (process.env.FLUIDEZ_DIR) return null;
  const root = process.env.OneDrive || path.join(os.homedir(), "OneDrive");
  return fs.existsSync(root) ? path.join(root, FOLDER) : null;
}

/* Copia un archivo a la carpeta puente. Devuelve la ruta de la copia o null. */
function toBridge(file) {
  const dir = bridgeDir();
  if (!dir) return null;
  try {
    fs.mkdirSync(dir, { recursive: true });
    const dest = path.join(dir, path.basename(file));
    fs.copyFileSync(file, dest);
    return dest;
  } catch (_) { return null; }
}

module.exports = { bridgeDir, toBridge, FOLDER };
