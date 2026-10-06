/**
 * Builds dist/galactacians.html: the whole game in ONE file that opens with a
 * double-click (no server, no internet). No dependencies: it wraps each ES module
 * in a function, in dependency order, and inlines the CSS and the font.
 *
 *   npm run build
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entry = resolve(root, "src/ui/app.js");
const fragmentOnly = process.argv.includes("--fragment");

const modules = new Map(); // path -> { code, deps, exports }
const IMPORT = /^import\s*\{([^}]*)\}\s*from\s*["'](\.[^"']+)["'];?\s*$/gm;
const EXPORT_DECL = /^export\s+(?:async\s+)?(?:function\*?|const|let|class)\s+([A-Za-z_$][\w$]*)/gm;

function load(file) {
  if (modules.has(file)) return;
  const src = readFileSync(file, "utf8");
  const deps = [];
  const imports = [];
  for (const [, names, spec] of src.matchAll(IMPORT)) {
    const dep = resolve(dirname(file), spec);
    deps.push(dep);
    imports.push({ dep, names: names.split(",").map((n) => n.trim()).filter(Boolean) });
  }
  const exports = [...src.matchAll(EXPORT_DECL)].map((m) => m[1]);
  if (/^export\s+(default|\{|\*)/m.test(src)) throw new Error(`Unsupported export form in ${file}`);
  if (/^import\s/m.test(src.replace(IMPORT, ""))) throw new Error(`Unsupported import form in ${file}`);
  const body = src.replace(IMPORT, "").replace(/^export\s+/gm, "");
  modules.set(file, { deps, imports, exports, body });
  deps.forEach(load);
}
load(entry);

const order = [];
const seen = new Set();
(function visit(file) {
  if (seen.has(file)) return;
  seen.add(file);
  modules.get(file).deps.forEach(visit);
  order.push(file);
})(entry);

const id = (file) => "__" + relative(root, file).replace(/[^\w]/g, "_");
let js = "";
for (const file of order) {
  const m = modules.get(file);
  const head = m.imports
    .map(({ dep, names }) => `const { ${names.map((n) => n.replace(/\s+as\s+/, ": ")).join(", ")} } = ${id(dep)};`)
    .join("\n");
  js += `// ${relative(root, file)}\nconst ${id(file)} = (() => {\n${head}\n${m.body}\nreturn { ${m.exports.join(", ")} };\n})();\n\n`;
}
js = js.replaceAll("</script", "<\\/script");

const font = readFileSync(resolve(root, "assets/fonts/Nunito-Variable.ttf")).toString("base64");
const css = readFileSync(resolve(root, "src/ui/style.css"), "utf8").replace(
  /url\(["']?\.\.\/\.\.\/assets\/fonts\/Nunito-Variable\.ttf["']?\)/,
  `url(data:font/ttf;base64,${font})`,
);

const body = `<style>\n${css}\n</style>\n<div id="app"></div>\n<script type="module">\n${js}</script>\n`;
const html = fragmentOnly
  ? body
  : `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<title>Galactacians</title>\n</head>\n<body>\n${body}</body>\n</html>\n`;

mkdirSync(resolve(root, "dist"), { recursive: true });
const out = resolve(root, fragmentOnly ? "dist/galactacians-fragment.html" : "dist/galactacians.html");
writeFileSync(out, html);
console.log(`Built ${relative(root, out)} (${Math.round(html.length / 1024)} KB, ${order.length} modules)`);
