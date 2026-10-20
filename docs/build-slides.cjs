/* Génère la présentation PPTX de soutenance — Gestion de Stock. */
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const UML = path.join(__dirname, 'uml', 'png');
const OUT = path.join(__dirname, 'Presentation-Gestion-de-Stock.pptx');

// Palette (Ocean / Teal — professionnel & tech)
const NAVY = '0F2D4A';   // fond foncé
const NAVY2 = '163C61';
const TEAL = '1C7293';
const MINT = '02C39A';   // accent
const LIGHT = 'F5F7FA';  // fond clair
const INK = '1E293B';    // texte foncé
const MUTED = '64748B';  // texte atténué
const WHITE = 'FFFFFF';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.3 x 7.5
const W = 13.3, H = 7.5;
pres.author = 'Gestion de Stock';
pres.title = 'Soutenance — Gestion de Stock';

const shadow = () => ({ type: 'outer', color: '000000', blur: 8, offset: 3, angle: 135, opacity: 0.18 });

function pngSize(file) { const b = fs.readFileSync(path.join(UML, file)); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; }
function fit(file, maxW, maxH) {
  const { w, h } = pngSize(file); let W2 = maxW, H2 = (h / w) * maxW;
  if (H2 > maxH) { H2 = maxH; W2 = (w / h) * maxH; } return { w: W2, h: H2 };
}

// Bandeau de titre réutilisable (slides claires)
function header(slide, kicker, title) {
  slide.background = { color: LIGHT };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: MINT } });
  if (kicker) slide.addText(kicker.toUpperCase(), { x: 0.7, y: 0.45, w: 11, h: 0.35, fontSize: 13, bold: true, color: TEAL, charSpacing: 2, fontFace: 'Trebuchet MS' });
  slide.addText(title, { x: 0.7, y: 0.72, w: 12, h: 0.8, fontSize: 32, bold: true, color: INK, fontFace: 'Trebuchet MS' });
  slide.addText('Gestion de Stock — Spring Boot + React', { x: 0.7, y: H - 0.45, w: 9, h: 0.3, fontSize: 10, color: MUTED });
}

// Carte
function card(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill || WHITE }, line: { color: 'E2E8F0', width: 1 }, shadow: shadow() });
}

// Pastille emoji
function bubble(slide, x, y, emoji, color) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: 0.62, h: 0.62, fill: { color: color || MINT } });
  slide.addText(emoji, { x, y, w: 0.62, h: 0.62, align: 'center', valign: 'middle', fontSize: 22 });
}

// ── Slide 1 — Titre ────────────────────────────────────────────────
let s = pres.addSlide();
s.background = { color: NAVY };
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.18, fill: { color: MINT } });
s.addShape(pres.shapes.OVAL, { x: W - 3.2, y: -1.6, w: 4.5, h: 4.5, fill: { color: NAVY2 } });
s.addShape(pres.shapes.OVAL, { x: W - 1.7, y: H - 1.7, w: 3.2, h: 3.2, fill: { color: TEAL, transparency: 40 } });
s.addText('📦', { x: 0.9, y: 1.0, w: 1.5, h: 1.2, fontSize: 60 });
s.addText('Application Web de Gestion de Stock', { x: 0.9, y: 2.2, w: 10.5, h: 1.6, fontSize: 44, bold: true, color: WHITE, fontFace: 'Trebuchet MS' });
s.addText([
  { text: 'Spring Boot ', options: { color: MINT, bold: true } },
  { text: '(API REST)   +   ', options: { color: 'CADCFC' } },
  { text: 'React', options: { color: MINT, bold: true } },
], { x: 0.95, y: 3.7, w: 10, h: 0.6, fontSize: 22 });
s.addText('Soutenance de projet — Frameworks', { x: 0.95, y: 4.5, w: 10, h: 0.4, fontSize: 16, italic: true, color: 'CADCFC' });
s.addText([
  { text: 'Réalisé par : ____________________', options: { breakLine: true, color: WHITE } },
  { text: 'Encadré par : ____________________', options: { breakLine: true, color: WHITE } },
  { text: 'Année universitaire 2025 / 2026', options: { color: 'CADCFC' } },
], { x: 0.95, y: 5.4, w: 10, h: 1.3, fontSize: 14, paraSpaceAfter: 6 });

// ── Slide 2 — Plan ─────────────────────────────────────────────────
s = pres.addSlide();
header(s, 'Sommaire', 'Plan de la présentation');
const plan = ['Contexte & objectifs', 'Périmètre fonctionnel', 'Architecture technique', 'Conception UML',
  'Réalisation back-end & front-end', 'Tests automatisés (valeur ajoutée)', 'DevSecOps & CI/CD (SAST/DAST/SCA)',
  'Démonstration', 'Bilan & conclusion'];
plan.forEach((t, i) => {
  const col = i < 5 ? 0 : 1; const row = i % 5;
  const x = 0.9 + col * 6.1, y = 1.9 + row * 1.05;
  s.addShape(pres.shapes.OVAL, { x, y, w: 0.7, h: 0.7, fill: { color: i < 4 ? TEAL : MINT } });
  s.addText(String(i + 1), { x, y, w: 0.7, h: 0.7, align: 'center', valign: 'middle', fontSize: 20, bold: true, color: WHITE });
  s.addText(t, { x: x + 0.95, y, w: 5, h: 0.7, valign: 'middle', fontSize: 17, bold: true, color: INK });
});

// ── Slide 3 — Contexte & objectifs ─────────────────────────────────
s = pres.addSlide();
header(s, 'Introduction', 'Contexte & objectifs');
s.addText([
  { text: 'Application web de gestion de stock', options: { bold: true, breakLine: true } },
  { text: 'Centralise l’inventaire et suit les entrées, sorties et transferts.', options: { breakLine: true } },
  { text: 'Vision du stock en temps réel + alertes de seuil.', options: { breakLine: true } },
  { text: '', options: { breakLine: true } },
  { text: 'Architecture imposée : front React + back Spring Boot (REST).', options: { bold: true, breakLine: true } },
  { text: 'React ne touche jamais la base : uniquement HTTP/JSON via l’API.', options: { breakLine: true } },
  { text: 'Toute la logique métier critique reste côté serveur.', options: {} },
].map(o => ({ text: o.text, options: { ...o.options, bullet: o.text ? { code: '2022' } : false, fontSize: 16, color: INK, paraSpaceAfter: 8 } })),
{ x: 0.9, y: 1.9, w: 6.6, h: 4.5 });
card(s, 8.0, 1.9, 4.5, 4.2);
s.addText('🎯', { x: 8.0, y: 2.2, w: 4.5, h: 0.9, align: 'center', fontSize: 44 });
s.addText('Livrable', { x: 8.0, y: 3.1, w: 4.5, h: 0.4, align: 'center', fontSize: 16, bold: true, color: TEAL });
s.addText([
  { text: 'Une application full-stack', options: { breakLine: true, bold: true } },
  { text: 'sécurisée, testée et documentée', options: {} },
], { x: 8.2, y: 3.5, w: 4.1, h: 1.4, align: 'center', fontSize: 15, color: INK, paraSpaceAfter: 4 });

// ── Slide 4 — Périmètre fonctionnel ────────────────────────────────
s = pres.addSlide();
header(s, 'Fonctionnalités', 'Périmètre fonctionnel');
const feats = [
  ['🔐', 'Authentification', 'Connexion sécurisée par JWT'],
  ['📦', 'Produits', 'Ajouter, modifier, supprimer, consulter'],
  ['🔄', 'Mouvements', 'Entrée, sortie, transfert'],
  ['⚠️', 'Alertes', 'Stock sous le seuil minimum'],
  ['📊', 'Tableau de bord', 'Statistiques & graphiques'],
  ['📄', 'Rapports', 'Mouvements par période'],
];
feats.forEach((f, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const x = 0.9 + col * 4.05, y = 1.95 + row * 2.15;
  card(s, x, y, 3.8, 1.9);
  bubble(s, x + 0.3, y + 0.32, f[0], i % 2 ? TEAL : MINT);
  s.addText(f[1], { x: x + 1.1, y: y + 0.32, w: 2.5, h: 0.6, valign: 'middle', fontSize: 16, bold: true, color: INK });
  s.addText(f[2], { x: x + 0.3, y: y + 1.05, w: 3.2, h: 0.7, fontSize: 13, color: MUTED });
});

// ── Slide 5 — Architecture technique ───────────────────────────────
s = pres.addSlide();
header(s, 'Conception', 'Architecture technique');
const arch = fit('05-architecture.png', 4.6, 5.0);
s.addImage({ path: path.join(UML, '05-architecture.png'), x: 8.1, y: 1.7, w: arch.w, h: arch.h });
s.addText([
  { text: 'Architecture client-serveur en couches', options: { bold: true, breakLine: true } },
  { text: 'Front React (Vite, Axios, React Router)', options: { breakLine: true } },
  { text: 'API REST sécurisée par JWT (Spring Security)', options: { breakLine: true } },
  { text: 'Couches Controller → Service → Repository', options: { breakLine: true } },
  { text: 'Base de données MySQL', options: { breakLine: true } },
  { text: 'Communication 100 % HTTP / JSON', options: {} },
].map(o => ({ text: o.text, options: { ...o.options, bullet: { code: '2022' }, fontSize: 16, color: INK, paraSpaceAfter: 10 } })),
{ x: 0.9, y: 2.0, w: 6.8, h: 4.5 });

// ── Slide 6 — Section UML ──────────────────────────────────────────
function divider(kicker, title, sub) {
  const d = pres.addSlide();
  d.background = { color: NAVY };
  d.addShape(pres.shapes.RECTANGLE, { x: 0, y: H / 2 - 0.02, w: W, h: 0.06, fill: { color: MINT } });
  d.addText(kicker.toUpperCase(), { x: 1, y: 2.5, w: 11, h: 0.5, fontSize: 16, bold: true, color: MINT, charSpacing: 3 });
  d.addText(title, { x: 1, y: 3.0, w: 11.3, h: 1.1, fontSize: 40, bold: true, color: WHITE, fontFace: 'Trebuchet MS' });
  if (sub) d.addText(sub, { x: 1, y: 4.2, w: 11, h: 0.6, fontSize: 17, italic: true, color: 'CADCFC' });
  return d;
}
divider('Étape 2 du cahier des charges', 'Conception UML', 'Cas d’utilisation • Classes • Séquences');

// ── Slide 7 — Cas d'utilisation ────────────────────────────────────
s = pres.addSlide();
header(s, 'UML', 'Diagramme de cas d’utilisation');
const uc = fit('01-cas-utilisation.png', 7.2, 5.1);
s.addImage({ path: path.join(UML, '01-cas-utilisation.png'), x: 0.8, y: 1.7, w: uc.w, h: uc.h });
card(s, 8.6, 1.9, 4.0, 3.6);
s.addText([
  { text: 'Acteur unique : le Responsable', options: { breakLine: true, bold: true } },
  { text: '', options: { breakLine: true } },
  { text: 'Authentification obligatoire pour tous les cas (« include »).', options: { breakLine: true } },
  { text: '', options: { breakLine: true } },
  { text: 'Gestion produits, mouvements, alertes et rapports.', options: {} },
], { x: 8.8, y: 2.1, w: 3.6, h: 3.2, fontSize: 14.5, color: INK, paraSpaceAfter: 6 });

// ── Slide 8 — Diagramme de classes ─────────────────────────────────
s = pres.addSlide();
header(s, 'UML', 'Diagramme de classes');
const cl = fit('02-diagramme-classes.png', 7.6, 5.1);
s.addImage({ path: path.join(UML, '02-diagramme-classes.png'), x: 0.8, y: 1.7, w: cl.w, h: cl.h });
card(s, 8.9, 1.9, 3.7, 3.8);
s.addText([
  { text: '3 entités', options: { breakLine: true, bold: true, color: TEAL } },
  { text: 'Produit • Mouvement • Utilisateur', options: { breakLine: true } },
  { text: '', options: { breakLine: true } },
  { text: '1 produit → N mouvements', options: { breakLine: true } },
  { text: '1 utilisateur → N mouvements', options: { breakLine: true } },
  { text: 'Alerte si quantité ≤ seuil', options: {} },
], { x: 9.1, y: 2.1, w: 3.3, h: 3.4, fontSize: 14, color: INK, paraSpaceAfter: 7 });

// ── Slide 9 — Séquences ────────────────────────────────────────────
s = pres.addSlide();
header(s, 'UML', 'Diagrammes de séquence');
const q1 = fit('03-sequence-ajouter-produit.png', 5.6, 4.1);
const q2 = fit('04-sequence-sortie-stock.png', 5.6, 4.1);
s.addImage({ path: path.join(UML, '03-sequence-ajouter-produit.png'), x: 0.8, y: 1.9, w: q1.w, h: q1.h });
s.addImage({ path: path.join(UML, '04-sequence-sortie-stock.png'), x: 7.0, y: 1.9, w: q2.w, h: q2.h });
s.addText('Ajouter un produit', { x: 0.8, y: 6.2, w: 5.6, h: 0.4, align: 'center', fontSize: 13, bold: true, color: TEAL });
s.addText('Sortie de stock (contrôle métier → 400 si insuffisant)', { x: 7.0, y: 6.2, w: 5.6, h: 0.4, align: 'center', fontSize: 13, bold: true, color: TEAL });

// ── Slide 10 — Back-end ────────────────────────────────────────────
s = pres.addSlide();
header(s, 'Réalisation', 'Back-end — Spring Boot');
s.addText([
  { text: 'Architecture en couches', options: { bold: true, breakLine: true } },
  { text: 'entity / repository / service / controller / dto', options: { breakLine: true } },
  { text: 'Sécurité Spring Security + JWT (BCrypt)', options: { bold: true, breakLine: true } },
  { text: 'Compte par défaut : admin / admin123', options: { breakLine: true } },
  { text: 'Gestion centralisée des erreurs', options: { bold: true, breakLine: true } },
  { text: '404 produit introuvable, 400 stock insuffisant', options: { breakLine: true } },
  { text: 'Documentation Swagger / OpenAPI', options: { bold: true } },
].map(o => ({ text: o.text, options: { ...o.options, bullet: { code: '2022' }, fontSize: 15.5, color: INK, paraSpaceAfter: 7 } })),
{ x: 0.9, y: 1.9, w: 7.2, h: 4.6 });
const stats = [['Java', '17'], ['Spring Boot', '3.2'], ['Couches', '4'], ['MySQL', 'DB']];
stats.forEach((st, i) => {
  const y = 1.95 + i * 1.12;
  card(s, 9.0, y, 3.5, 0.95);
  s.addText(st[1], { x: 9.1, y: y + 0.05, w: 1.4, h: 0.85, align: 'center', valign: 'middle', fontSize: 26, bold: true, color: MINT });
  s.addText(st[0], { x: 10.4, y: y + 0.05, w: 2.0, h: 0.85, valign: 'middle', fontSize: 15, color: INK });
});

// ── Slide 11 — Front-end ───────────────────────────────────────────
s = pres.addSlide();
header(s, 'Réalisation', 'Front-end — React');
s.addText([
  { text: 'React 19 + Vite', options: { bold: true, breakLine: true } },
  { text: 'Axios centralisé + injection auto du token JWT', options: { breakLine: true } },
  { text: 'React Router + AuthContext (routes protégées)', options: { breakLine: true } },
  { text: 'Graphiques avec Recharts', options: { breakLine: true } },
  { text: 'Retours visuels : messages d’erreur et de succès', options: {} },
].map(o => ({ text: o.text, options: { ...o.options, bullet: { code: '2022' }, fontSize: 15.5, color: INK, paraSpaceAfter: 9 } })),
{ x: 0.9, y: 1.9, w: 6.6, h: 4.4 });
card(s, 8.0, 1.9, 4.5, 4.3);
s.addText('9', { x: 8.0, y: 2.2, w: 4.5, h: 1.2, align: 'center', fontSize: 64, bold: true, color: MINT });
s.addText('pages connectées à l’API', { x: 8.0, y: 3.45, w: 4.5, h: 0.4, align: 'center', fontSize: 15, bold: true, color: INK });
s.addText('Accueil • Connexion • Dashboard • Produits • Mouvements • Alertes • Rapports • Admin • Profil',
  { x: 8.3, y: 3.95, w: 3.9, h: 2.0, align: 'center', fontSize: 13, color: MUTED });

// ── Slide 12 — Section Tests ───────────────────────────────────────
divider('La valeur ajoutée', 'Tests automatisés', 'Fiabilité prouvée : back-end + front-end');

// ── Slide 13 — Tests back-end ──────────────────────────────────────
s = pres.addSlide();
header(s, 'Qualité', 'Tests back-end (JUnit + Mockito)');
card(s, 0.9, 1.9, 3.3, 2.2, NAVY);
s.addText('27', { x: 0.9, y: 2.1, w: 3.3, h: 1.1, align: 'center', fontSize: 60, bold: true, color: MINT });
s.addText('tests · 0 échec', { x: 0.9, y: 3.25, w: 3.3, h: 0.5, align: 'center', fontSize: 16, bold: true, color: WHITE });
s.addTable([
  [{ text: 'Classe', options: { bold: true, color: WHITE, fill: { color: TEAL } } }, { text: 'Tests', options: { bold: true, color: WHITE, fill: { color: TEAL } } }],
  ['MouvementServiceTest', '9'],
  ['ProduitServiceTest', '8'],
  ['ProduitControllerTest', '7'],
  ['AuthControllerTest', '3'],
], { x: 4.5, y: 1.9, w: 5.0, colW: [3.8, 1.2], fontSize: 13, color: INK, border: { pt: 0.5, color: 'D6DEE8' }, rowH: 0.42, valign: 'middle' });
card(s, 9.9, 1.9, 2.7, 4.4);
s.addText('⚙️', { x: 9.9, y: 2.2, w: 2.7, h: 0.8, align: 'center', fontSize: 34 });
s.addText('Règle clé testée', { x: 9.9, y: 3.0, w: 2.7, h: 0.4, align: 'center', fontSize: 14, bold: true, color: TEAL });
s.addText('Une sortie supérieure au stock est refusée et ne modifie pas l’inventaire.',
  { x: 10.05, y: 3.45, w: 2.4, h: 2.5, align: 'center', fontSize: 13.5, color: INK });
s.addText('Exécution en < 5 s, sans base de données (Mockito / MockMvc).', { x: 0.9, y: 5.9, w: 8.5, h: 0.5, fontSize: 13, italic: true, color: MUTED });

// ── Slide 14 — Tests front-end E2E ─────────────────────────────────
s = pres.addSlide();
header(s, 'Qualité', 'Tests front-end E2E (Playwright)');
card(s, 0.9, 1.9, 3.3, 2.2, NAVY);
s.addText('5', { x: 0.9, y: 2.1, w: 3.3, h: 1.1, align: 'center', fontSize: 60, bold: true, color: MINT });
s.addText('parcours E2E', { x: 0.9, y: 3.25, w: 3.3, h: 0.5, align: 'center', fontSize: 16, bold: true, color: WHITE });
s.addText([
  { text: 'Vrai navigateur Chromium', options: { bold: true, breakLine: true } },
  { text: 'Navigation, connexion OK/KO, déconnexion', options: { breakLine: true } },
  { text: 'Back-end simulé → pas besoin de MySQL', options: {} },
].map(o => ({ text: o.text, options: { ...o.options, bullet: { code: '2022' }, fontSize: 15, color: INK, paraSpaceAfter: 8 } })),
{ x: 4.6, y: 2.0, w: 8.0, h: 1.9 });
card(s, 4.6, 4.0, 8.0, 2.2, 'FFF7ED');
s.addText('🐛', { x: 4.75, y: 4.25, w: 0.8, h: 0.8, align: 'center', fontSize: 30 });
s.addText([
  { text: 'Un vrai bug détecté par les tests !', options: { bold: true, breakLine: true, color: 'B45309' } },
  { text: 'Après déconnexion, l’app revenait vers /login au lieu de l’accueil. Bug corrigé dans PrivateRoute — preuve concrète de l’utilité des tests.', options: { color: INK } },
], { x: 5.6, y: 4.25, w: 6.8, h: 1.7, fontSize: 14, paraSpaceAfter: 5, valign: 'middle' });

// ── Section DevSecOps ──────────────────────────────────────────────
divider('Industrialisation', 'DevSecOps & CI/CD', 'Sécurité intégrée au pipeline : SAST • SCA • DAST');

// ── Pipeline CI/CD ─────────────────────────────────────────────────
s = pres.addSlide();
header(s, 'Intégration continue', 'Pipeline CI/CD — GitLab');
const pipe = fit('06-pipeline-cicd.png', 3.5, 5.3);
s.addImage({ path: path.join(UML, '06-pipeline-cicd.png'), x: 12.4 - pipe.w, y: 1.5, w: pipe.w, h: pipe.h });
s.addText([
  { text: '6 étapes automatiques à chaque « git push »', options: { bold: true, breakLine: true } },
  { text: 'validate — lint + build du front (ESLint, Vite)', options: { breakLine: true } },
  { text: 'test — 27 tests back-end (JUnit / Maven)', options: { breakLine: true } },
  { text: 'sast — analyse statique (SonarQube)', options: { breakLine: true } },
  { text: 'build — images Docker → Container Registry', options: { breakLine: true } },
  { text: 'sca — dépendances + images (Trivy)', options: { breakLine: true } },
  { text: 'dast — analyse dynamique (OWASP ZAP)', options: {} },
].map(o => ({ text: o.text, options: { ...o.options, bullet: { code: '2022' }, fontSize: 15.5, color: INK, paraSpaceAfter: 9 } })),
{ x: 0.9, y: 1.9, w: 7.6, h: 4.8 });

// ── Trois piliers SAST / SCA / DAST ────────────────────────────────
s = pres.addSlide();
header(s, 'Sécurité', 'Docker + 3 piliers : SAST · SCA · DAST');
const pillars = [
  ['🐳', 'Docker', 'Conteneurisation multi-étapes, images non-root, orchestration docker-compose (MySQL + back + front).'],
  ['🔍', 'SAST — SonarQube', 'Analyse statique du code : vulnérabilités, bugs et dette technique (Quality Gate bloquant).'],
  ['📦', 'SCA — Trivy', 'Vulnérabilités connues (CVE) des dépendances et des images Docker, détection de secrets.'],
  ['🕷️', 'DAST — OWASP ZAP', 'Analyse dynamique de l’application en cours d’exécution (scan passif « baseline »).'],
];
pillars.forEach((f, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.9 + col * 6.0, y = 1.95 + row * 2.3;
  card(s, x, y, 5.6, 2.05);
  bubble(s, x + 0.3, y + 0.35, f[0], i % 2 ? TEAL : MINT);
  s.addText(f[1], { x: x + 1.15, y: y + 0.35, w: 4.2, h: 0.6, valign: 'middle', fontSize: 17, bold: true, color: INK });
  s.addText(f[2], { x: x + 0.35, y: y + 1.1, w: 5.0, h: 0.85, fontSize: 12.5, color: MUTED });
});

// ── Slide — Démonstration ──────────────────────────────────────────
const d = divider('Place à la pratique', 'Démonstration', null);
d.addText([
  { text: '1.  Connexion (admin / admin123)', options: { breakLine: true } },
  { text: '2.  Ajout d’un produit + mouvement de stock', options: { breakLine: true } },
  { text: '3.  Sortie refusée si stock insuffisant', options: { breakLine: true } },
  { text: '4.  Alerte de seuil & tableau de bord', options: { breakLine: true } },
  { text: '5.  Bouton « Lancer les tests E2E » en direct', options: {} },
], { x: 1.0, y: 4.4, w: 11, h: 2.4, fontSize: 16, color: 'CADCFC', paraSpaceAfter: 8 });

// ── Slide 16 — Bilan & conclusion ──────────────────────────────────
s = pres.addSlide();
header(s, 'Bilan', 'Conformité & conclusion');
s.addText('Cahier des charges : 100 % couvert', { x: 0.9, y: 1.8, w: 7, h: 0.4, fontSize: 16, bold: true, color: TEAL });
[['✅', 'Auth JWT, CRUD produits, mouvements'], ['✅', 'Contrôle de stock & alertes de seuil'],
 ['✅', 'Tableau de bord, rapports, Swagger'], ['✅', 'Architecture en couches, front/back séparés']]
  .forEach((it, i) => {
    s.addText(it[0], { x: 0.9, y: 2.3 + i * 0.52, w: 0.5, h: 0.5, fontSize: 15 });
    s.addText(it[1], { x: 1.4, y: 2.3 + i * 0.52, w: 6.1, h: 0.5, valign: 'middle', fontSize: 14.5, color: INK });
  });
s.addText('Apports supplémentaires', { x: 8.0, y: 1.8, w: 5, h: 0.4, fontSize: 16, bold: true, color: MINT });
[['🧪', '27 tests back-end + 5 tests E2E'], ['🐛', 'Bug de déconnexion corrigé'],
 ['📐', 'Diagrammes UML complets'], ['🐳', 'Conteneurisation Docker + CI/CD'],
 ['🔐', 'DevSecOps : SAST · SCA · DAST']]
  .forEach((it, i) => {
    s.addText(it[0], { x: 8.0, y: 2.3 + i * 0.52, w: 0.5, h: 0.5, fontSize: 15 });
    s.addText(it[1], { x: 8.5, y: 2.3 + i * 0.52, w: 4.3, h: 0.5, valign: 'middle', fontSize: 14.5, color: INK });
  });
card(s, 0.9, 5.0, 11.6, 1.5, NAVY);
s.addText('Perspectives : export PDF/Excel des rapports • rôles & permissions fins • pagination • DAST authentifié (OpenAPI)',
  { x: 1.1, y: 5.0, w: 11.2, h: 1.5, valign: 'middle', fontSize: 14.5, color: WHITE, align: 'center' });

// ── Slide 17 — Merci ───────────────────────────────────────────────
s = pres.addSlide();
s.background = { color: NAVY };
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.18, fill: { color: MINT } });
s.addText('Merci de votre attention', { x: 1, y: 2.9, w: 11.3, h: 1.1, fontSize: 44, bold: true, color: WHITE, align: 'center', fontFace: 'Trebuchet MS' });
s.addText('Questions & réponses', { x: 1, y: 4.0, w: 11.3, h: 0.6, fontSize: 20, italic: true, color: MINT, align: 'center' });
s.addText('📦  Gestion de Stock — Spring Boot + React', { x: 1, y: 5.0, w: 11.3, h: 0.5, fontSize: 14, color: 'CADCFC', align: 'center' });

pres.writeFile({ fileName: OUT }).then(() => console.log('OK ->', OUT));
