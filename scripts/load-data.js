/* Carga el contenido igual que el navegador: data_c1.js y los lotes, en el
 * orden de los <script> de index.html. Lo usan runway.js y los tests. */
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const SCRIPT_RE = /<script src="\.\/(js\/(?:data_c1|content\/[^"]+)\.js)"><\/script>/g;

function dataScripts() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  return [...html.matchAll(SCRIPT_RE)].map((m) => m[1]);
}

function loadData() {
  const sandbox = { window: {} };
  for (const f of dataScripts()) vm.runInNewContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
  return sandbox.window.E20_DATA;
}

module.exports = { loadData, dataScripts, SCRIPT_RE };
