import { access, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "index.html",
  "css/main.css",
  "js/app.js",
  "js/original-parallax.js",
  "js/motion-model.js",
  "js/motion.js",
  "js/pointer-depth.js",
  "img/layer-base.png",
  "img/layer-middle.png",
  "img/layer-front.png",
  "img/ground.png",
  "img/dungeon.jpg",
  "libs/gsap/gsap.min.js",
  "libs/gsap/ScrollTrigger.min.js",
  "ARCHITECTURE.md",
  "MOTION.md",
];

for (const file of requiredFiles) {
  await access(resolve(root, file));
}

const [html, css] = await Promise.all([
  readFile(resolve(root, "index.html"), "utf8"),
  readFile(resolve(root, "css/main.css"), "utf8"),
]);

const assertions = [
  [/<title>Nordic Depths/.test(html), "recruiter-facing title"],
  [/name="description"/.test(html), "meta description"],
  [/rel="canonical"/.test(html), "canonical URL"],
  [/<main id="main-content">/.test(html), "semantic main"],
  [(html.match(/<h1\b/g) || []).length === 1, "exactly one h1"],
  [/prefers-reduced-motion/.test(css), "reduced-motion CSS"],
  [/forced-colors/.test(css), "forced-colors CSS"],
  [!/^\s*(?:position|margin-top):\s*center\b/m.test(css), "no invalid legacy center declarations"],
  [!html.includes("\\n"), "no literal escaped newlines in HTML"],
  [/Rakennan toimivia/.test(html), "current Finnish hero copy present"],
  [/calc\(var\(--original-scroll\) \/ 1\.6\)/.test(css), "original far-layer ratio preserved"],
  [/calc\(var\(--original-scroll\) \/ 2\.5\)/.test(css), "original middle-layer ratio preserved"],
  [/calc\(var\(--original-scroll\) \/ 5\.7\)/.test(css), "original near-layer ratio preserved"],
  [/calc\(var\(--original-scroll\) \/ -7\.5\)/.test(css), "original dungeon copy ratio preserved"],
];

for (const [condition, label] of assertions) {
  if (!condition) {
    throw new Error("Static check failed: " + label);
  }
}

const imageFiles = [
  "img/layer-base.png",
  "img/layer-middle.png",
  "img/layer-front.png",
  "img/ground.png",
  "img/dungeon.jpg",
];

let imageBytes = 0;
for (const file of imageFiles) {
  imageBytes += (await stat(resolve(root, file))).size;
}

// High-fidelity source imagery is intentional. This cap protects against silent future growth,
// rather than forcing lossy recompression of the current artwork.
const qualityBudgetBytes = 6_500_000;
if (imageBytes > qualityBudgetBytes) {
  throw new Error(
    "Authored image payload " + imageBytes + " exceeds quality budget " + qualityBudgetBytes + " bytes",
  );
}

process.stdout.write(
  "Static checks passed. Original artwork payload: " +
    (imageBytes / 1_000_000).toFixed(2) +
    " MB.\n",
);
