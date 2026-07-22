// ─────────────────────────────────────────────────────────────────────────
//  Petit serveur local qui lance les tests Playwright sur demande.
//  Sert UNIQUEMENT à la démo : permet de déclencher les tests depuis un
//  bouton dans le Dashboard (le navigateur ne peut pas lancer Playwright
//  lui-même, il faut un processus Node côté serveur).
//
//  Lancer :  npm run test:server   (dans un terminal séparé)
// ─────────────────────────────────────────────────────────────────────────
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

const PORT = 4000;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

// Lance "playwright test --reporter=json" et renvoie les statistiques parsées.
function runPlaywright() {
  return new Promise((resolve) => {
    const child = spawn('npx', ['playwright', 'test', '--reporter=json'], {
      cwd: process.cwd(),
      env: { ...process.env, PW_TEST_HTML_REPORT_OPEN: 'never' },
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));

    child.on('close', () => {
      try {
        const report = JSON.parse(stdout);
        const tests = [];
        const walk = (suite) => {
          (suite.specs || []).forEach((spec) =>
            tests.push({ titre: spec.title, ok: spec.ok })
          );
          (suite.suites || []).forEach(walk);
        };
        (report.suites || []).forEach(walk);

        resolve({
          ok: report.stats.unexpected === 0,
          passed: report.stats.expected,
          failed: report.stats.unexpected,
          durationMs: Math.round(report.stats.duration),
          tests,
        });
      } catch {
        resolve({
          ok: false,
          erreur: 'Impossible de parser le résultat des tests.',
          brut: (stdout + stderr).slice(0, 2000),
        });
      }
    });
  });
}

let enCours = false;

createServer(async (req, res) => {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/run') {
    if (enCours) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ erreur: 'Des tests sont déjà en cours.' }));
    }
    enCours = true;
    console.log('▶️  Lancement des tests Playwright...');
    const result = await runPlaywright();
    enCours = false;
    console.log(`✅ Terminé : ${result.passed ?? '?'} réussis, ${result.failed ?? '?'} échoués`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(result));
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ erreur: 'Route inconnue' }));
}).listen(PORT, () => {
  console.log(`🧪 Serveur de tests prêt sur http://localhost:${PORT}`);
  console.log('   Clique sur le bouton "Lancer les tests E2E" dans le Dashboard.');
});
