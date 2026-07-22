// Rend les diagrammes Mermaid (.mmd) de docs/uml en images PNG, via Playwright.
// Usage : node scripts/render-diagrams.mjs
import { chromium } from '@playwright/test';
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const umlDir = path.resolve(process.cwd(), '..', 'docs', 'uml');
const outDir = path.join(umlDir, 'png');
mkdirSync(outDir, { recursive: true });

const files = readdirSync(umlDir).filter((f) => f.endsWith('.mmd'));

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });

for (const file of files) {
  const code = readFileSync(path.join(umlDir, file), 'utf8');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
    <style>body{background:#fff;margin:0;padding:24px;font-family:Arial}</style>
    </head><body><pre class="mermaid">${code}</pre>
    <script>mermaid.initialize({startOnLoad:true,theme:'default'});</script>
    </body></html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForSelector('.mermaid svg', { timeout: 15000 });
  const out = path.join(outDir, file.replace('.mmd', '.png'));
  await page.locator('.mermaid').screenshot({ path: out });
  console.log('✅', path.basename(out));
}

await browser.close();
console.log('Terminé. Images dans', outDir);
