#!/usr/bin/env node
/*
* Rew * Rewrites:
*   ![](IMG_4669.jpg)      -> ![](/assets/images/IMG_4669.jpg)
*   ![[IMG_4669.jpg]]      -> ![](/assets/images/IMG_4669.jpg)
*
* Skips:
*   - absolute URLs (http/https)
*   - absolute paths (/assets/...)
*   - liquid/template targets ({{ ... }})
*   - non-image extensions
*
* Usage:
*   node scripts/obsidian-images.js
*   node scripts/obsidian-images.js --base=/assets/images --dry-run
*/

const fs = require("fs");
const path = require("path");

const args = new Set(process.argv.slice(2));
const baseArg = [...args].find(a => a.startsWith("--base="));
const BASE = (baseArg ? baseArg.split("=").slice(1).join("=") : "/assets/images").replace(/\/+$/, "");
const DRY_RUN = args.has("--dry-run");
const USE_STDIN = args.has("--stdin");


const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "_posts");

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|svg|avif)$/i;

const fileArg = [...args].find(a => a.startsWith("--file="));
const ONE_FILE = fileArg ? fileArg.split("=").slice(1).join("=") : null;


function isRewriteCandidate(target) {
  if (!target) return false;
  const t = target.trim();
  
  // Skip URLs, absolute paths, anchors, mailto, liquid/templates
  if (/^(https?:)?\/\//i.test(t)) return false;
  if (t.startsWith("/")) return false;
  if (t.startsWith("#")) return false;
  if (/^mailto:/i.test(t)) return false;
  if (t.includes("{{") || t.includes("}}")) return false;
  
  // Strip any query/hash for extension check
  const clean = t.split("#")[0].split("?")[0];
  
  // Only rewrite likely image files
  if (!IMAGE_EXT_RE.test(clean)) return false;
  
  return true;
}

function rewriteMarkdown(content) {
  let changed = false;
  let out = content;
  
  // 1) Obsidian embeds: ![[file.png]] (may include subpaths)
  out = out.replace(/!\[\[([^\]]+?)\]\]/g, (m, inner) => {
    const target = inner.trim();
    
    // Obsidian can do ![[file.png|alt]] - keep alt if present
    const [filePart, altPartRaw] = target.split("|").map(s => s.trim());
    const altPart = altPartRaw || "";
    
    if (!isRewriteCandidate(filePart)) return m;
    
    changed = true;
    const newUrl = `${BASE}/${filePart.replace(/^\.\/+/, "")}`;
    // Standard markdown image: ![alt](url)
    return `![${altPart}](${newUrl})`;
  });
  
  // 2) Standard markdown: ![alt](target)
  // Keep alt text as-is, rewrite target if candidate and not already prefixed.
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, targetRaw) => {
    const target = targetRaw.trim();
    
    // remove surrounding quotes <...> not common, but handle lightly
    const unwrapped = target.replace(/^<(.+)>$/, "$1").trim();
    
    if (!isRewriteCandidate(unwrapped)) return m;
    
    // If it's already under BASE, leave it alone
    if (unwrapped.startsWith(`${BASE}/`)) return m;
    
    changed = true;
    const newUrl = `${BASE}/${unwrapped.replace(/^\.\/+/, "")}`;
    return `![${alt}](${newUrl})`;
  });
  
  return { out, changed };
}

function walkMdFiles(dir) {
  const results = [];
  const entries = fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) results.push(...walkMdFiles(p));
    else if (e.isFile() && p.toLowerCase().endsWith(".md")) results.push(p);
  }
  return results;
}

function main() {
  if (USE_STDIN) {
    const input = fs.readFileSync(0, "utf8"); // stdin
    const { out } = rewriteMarkdown(input);
    process.stdout.write(out);
    process.exit(0);
  }
  
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`No _posts directory found at: ${POSTS_DIR}`);
    process.exit(1);
  }
  
  const files = ONE_FILE ? [path.resolve(ROOT, ONE_FILE)] : walkMdFiles(POSTS_DIR);
  let touched = 0;
  
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const original = fs.readFileSync(file, "utf8");
    const { out, changed } = rewriteMarkdown(original);
    if (!changed) continue;
    
    touched++;
    if (DRY_RUN) {
      console.log(`[dry-run] would rewrite: ${path.relative(ROOT, file)}`);
      continue;
    }
    
    const tmp = `${file}.tmp.${process.pid}`;
    fs.writeFileSync(tmp, out, "utf8");
    fs.renameSync(tmp, file);
    
    console.log(`rewrote: ${path.relative(ROOT, file)}`);
  }
  
  console.log(`${DRY_RUN ? "Scanned" : "Updated"} ${files.length} file(s); ${touched} changed.`);
}

main();

