/* Génère le rapport DOCX (25-30 pages) du projet Gestion de Stock. */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, TableOfContents, PageBreak, Header, Footer, PageNumber,
  VerticalAlign, HeightRule,
} = require('docx');

const UML = path.join(__dirname, 'uml', 'png');
const OUT = path.join(__dirname, 'Rapport-Gestion-de-Stock.docx');
const CONTENT_W = 9026; // A4, marges 1"

// --- Helpers ----------------------------------------------------------------
let FIG = 0;
function pngSize(file) { const b = fs.readFileSync(path.join(UML, file)); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; }

function image(file, maxW = 540, maxH = 600) {
  const { w, h } = pngSize(file);
  let width = maxW, height = Math.round((h / w) * maxW);
  if (height > maxH) { height = maxH; width = Math.round((w / h) * maxH); }
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 },
    children: [new ImageRun({ type: 'png', data: fs.readFileSync(path.join(UML, file)),
      transformation: { width, height }, altText: { title: file, description: file, name: file } })] });
}
function caption(text) {
  FIG += 1;
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
    children: [new TextRun({ text: `Figure ${FIG} — ${text}`, italics: true, size: 18, color: '555555' })] });
}
function h1(text) { return new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun(text)] }); }
function h1n(text) { return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] }); }
function h2(text) { return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] }); }
function h3(text) { return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] }); }
function p(text) { return new Paragraph({ spacing: { after: 120, line: 276 }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text, size: 22 })] }); }
function bullet(text) { return new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text, size: 22 })] }); }
function code(text) { return new Paragraph({ spacing: { before: 60, after: 160 }, shading: { fill: '111827', type: ShadingType.CLEAR },
  children: [new TextRun({ text: '  ' + text + '  ', font: 'Courier New', color: 'FFFFFF', size: 18 })] }); }

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, left: border, bottom: border, right: border };
const dashed = { style: BorderStyle.DASHED, size: 6, color: '9CA3AF' };
const dashedBorders = { top: dashed, left: dashed, bottom: dashed, right: dashed };

function cell(text, width, { bold = false, fill = null } = {}) {
  return new TableCell({ borders, width: { size: width, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 110, right: 110 },
    children: [new Paragraph({ children: [new TextRun({ text, bold, size: 20 })] })] });
}
function headerCell(text, width) {
  return new TableCell({ borders, width: { size: width, type: WidthType.DXA },
    shading: { fill: '1E40AF', type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 110, right: 110 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 20 })] })] });
}
function tbl(widths, header, dataRows) {
  const rows = [new TableRow({ tableHeader: true, children: header.map((t, i) => headerCell(t, widths[i])) })];
  dataRows.forEach((r, ri) => rows.push(new TableRow({ children: r.map((t, i) => cell(t, widths[i], { fill: ri % 2 ? 'EEF2FF' : 'FFFFFF' })) })));
  return new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, rows });
}

// Bloc d'emplacement de capture d'écran (zone réservée)
function shot(label) {
  FIG += 1;
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    rows: [new TableRow({ height: { value: 2300, rule: HeightRule.ATLEAST },
      children: [new TableCell({ borders: dashedBorders, width: { size: CONTENT_W, type: WidthType.DXA },
        shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
        margins: { top: 120, bottom: 120, left: 120, right: 120 },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '📷', size: 40 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80 },
            children: [new TextRun({ text: `Emplacement réservé — Figure ${FIG}`, bold: true, color: '6B7280', size: 20 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: label, italics: true, color: '9CA3AF', size: 18 })] }),
        ] })] })],
  });
}

// --- Contenu ----------------------------------------------------------------
const c = [];

// ===== PAGE DE GARDE =====
c.push(
  new Paragraph({ spacing: { before: 1400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Projet de Frameworks', size: 28, color: '1E40AF', bold: true })] }),
  new Paragraph({ spacing: { before: 120 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Filière : Génie Informatique', size: 22, color: '374151' })] }),
  new Paragraph({ spacing: { before: 700 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Application Web de Gestion de Stock', bold: true, size: 52, color: '111827' })] }),
  new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Architecture Spring Boot (API REST) + React', size: 28, color: '374151' })] }),
  new Paragraph({ spacing: { before: 900 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Rapport de projet', italics: true, size: 26, color: '6B7280' })] }),
  new Paragraph({ spacing: { before: 1200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Réalisé par : ____________________', size: 24 })] }),
  new Paragraph({ spacing: { before: 160 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Encadré par : ____________________', size: 24 })] }),
  new Paragraph({ spacing: { before: 160 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Année universitaire : 2025 / 2026', size: 24 })] }),
  new Paragraph({ children: [new PageBreak()] }),
);

// ===== REMERCIEMENTS =====
c.push(h1n('Remerciements'));
c.push(p("Au terme de ce projet, je tiens à exprimer ma gratitude à toutes les personnes qui ont contribué, de près ou de loin, à sa réalisation."));
c.push(p("Je remercie particulièrement mon encadrant pour ses conseils, sa disponibilité et son accompagnement tout au long de ce travail, ainsi que le corps professoral pour la qualité de la formation dispensée. Mes remerciements vont également à mes camarades pour leurs échanges constructifs."));
c.push(new Paragraph({ children: [new PageBreak()] }));

// ===== RÉSUMÉ =====
c.push(h1n('Résumé'));
c.push(p("Ce projet consiste à concevoir et développer une application web de gestion de stock permettant de centraliser l'inventaire, de suivre les mouvements (entrées, sorties et transferts) et de disposer d'une vision claire et en temps réel de l'état du stock. L'application repose sur une architecture client-serveur clairement séparée : une interface utilisateur développée avec React et une API REST développée avec Spring Boot, communiquant exclusivement via des échanges HTTP au format JSON."));
c.push(p("Au-delà des fonctionnalités demandées, le projet a été enrichi par une stratégie complète de tests automatisés couvrant à la fois le back-end (tests unitaires et tests d'intégration) et le front-end (tests bout-en-bout dans un navigateur réel), garantissant la fiabilité et la non-régression de l'application."));
c.push(new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'Mots-clés : ', bold: true }), new TextRun('Gestion de stock, Spring Boot, React, API REST, JWT, JPA, MySQL, tests automatisés, JUnit, Playwright.')] }));
c.push(new Paragraph({ children: [new PageBreak()] }));

// ===== TABLE DES MATIÈRES =====
c.push(h1n('Table des matières'));
c.push(new TableOfContents('Sommaire', { hyperlink: true, headingStyleRange: '1-3' }));

// ===== INTRODUCTION GÉNÉRALE =====
c.push(h1('Introduction générale'));
c.push(p("La gestion du stock est une activité essentielle pour toute organisation manipulant des produits. Une mauvaise maîtrise des quantités disponibles entraîne des ruptures, des sur-stocks coûteux et des erreurs de suivi. L'informatisation de cette gestion permet de fiabiliser les données, d'automatiser les contrôles et de prendre des décisions éclairées grâce à des indicateurs en temps réel."));
c.push(h2('Problématique'));
c.push(p("Comment concevoir une application web fiable qui centralise l'inventaire, contrôle automatiquement la cohérence des mouvements de stock (notamment en interdisant une sortie supérieure à la quantité disponible) et alerte l'utilisateur lorsqu'un produit atteint un seuil critique, tout en respectant une séparation stricte entre l'interface et la logique métier ?"));
c.push(h2('Objectifs du projet'));
['Développer une API REST sécurisée exposant les opérations de gestion de stock ;',
 'Concevoir une interface web moderne consommant uniquement cette API ;',
 'Garantir la cohérence du stock par une logique métier côté serveur ;',
 'Fournir un tableau de bord, des alertes et des rapports ;',
 'Assurer la qualité du code par des tests automatisés.'].forEach(t => c.push(bullet(t)));
c.push(h2('Méthodologie'));
c.push(p("La démarche suivie reprend les étapes classiques du génie logiciel : analyse des besoins, conception (UML), choix technologiques, implémentation du back-end puis du front-end, intégration, et enfin tests et validation. Chaque étape s'appuie sur les livrables de la précédente."));
c.push(h2('Organisation du rapport'));
c.push(p("Ce rapport est organisé en plusieurs chapitres : l'analyse et la spécification des besoins, la conception (architecture et diagrammes UML), les choix technologiques, la réalisation du back-end, la réalisation du front-end avec la présentation des interfaces, l'intégration, puis les tests et la validation. Il se termine par les apports supplémentaires, une conclusion et des perspectives d'évolution."));

// ===== CHAP 1 — ANALYSE =====
c.push(h1('Chapitre 1 — Analyse et spécification des besoins'));
c.push(h2('1.1 Étude du besoin'));
c.push(p("L'application s'adresse à un Responsable de stock qui doit gérer un catalogue de produits et enregistrer chaque mouvement affectant les quantités. Le système doit empêcher les incohérences (par exemple une sortie impossible) et signaler automatiquement les produits dont la quantité passe sous un seuil défini."));
c.push(h2('1.2 Acteurs du système'));
c.push(p("Le système comporte un acteur principal : le Responsable. Authentifié, il dispose des droits de gestion sur l'ensemble des modules. Un compte administrateur par défaut est fourni pour l'initialisation du système."));
c.push(h2('1.3 Besoins fonctionnels'));
c.push(p("Les besoins fonctionnels décrivent les services attendus de l'application :"));
c.push(tbl([3000, 6026],
  ['Fonctionnalité', 'Description'],
  [
    ['Se connecter', 'Authentification par login et mot de passe (JWT)'],
    ['Gérer les produits', 'Ajouter, modifier, supprimer et consulter les produits'],
    ['Enregistrer une entrée', 'Augmenter la quantité en stock d\'un produit'],
    ['Enregistrer une sortie', 'Diminuer la quantité (refusée si stock insuffisant)'],
    ['Enregistrer un transfert', 'Déplacer une quantité (contrôle de disponibilité)'],
    ['Consulter les alertes', 'Lister les produits sous le seuil minimum'],
    ['Consulter le tableau de bord', 'Visualiser les statistiques et graphiques'],
    ['Générer un rapport', 'Lister les mouvements entre deux dates'],
    ['Gérer les utilisateurs', 'Administration des comptes (CRUD)'],
  ]));
c.push(h2('1.4 Besoins non fonctionnels'));
c.push(p("Au-delà des fonctionnalités, l'application doit respecter des exigences de qualité :"));
c.push(tbl([2600, 6426],
  ['Exigence', 'Description'],
  [
    ['Sécurité', 'Authentification JWT, mots de passe chiffrés (BCrypt)'],
    ['Fiabilité', 'Contrôles métier côté serveur, tests automatisés'],
    ['Maintenabilité', 'Architecture en couches, code structuré et documenté'],
    ['Utilisabilité', 'Interface claire, retours visuels (succès/erreur)'],
    ['Portabilité', 'Application web accessible depuis un navigateur'],
    ['Performance', 'Réponses rapides de l\'API, requêtes optimisées'],
  ]));
c.push(h2('1.5 Hypothèses retenues'));
['Un seul rôle métier : RESPONSABLE ;',
 'Une sortie est refusée si la quantité demandée dépasse le stock disponible ;',
 'Une alerte est déclenchée automatiquement lorsque la quantité est inférieure ou égale au seuil minimum ;',
 'La référence d\'un produit est unique.'].forEach(t => c.push(bullet(t)));

// ===== CHAP 2 — CONCEPTION =====
c.push(h1('Chapitre 2 — Conception'));
c.push(p("Ce chapitre présente la conception du système : l'architecture technique globale, puis les diagrammes UML (cas d'utilisation, classes et séquences)."));
c.push(h2('2.1 Architecture technique'));
c.push(p("L'application adopte une architecture client-serveur en couches. Le navigateur exécute le front-end React, qui communique avec l'API REST. Côté serveur, chaque requête traverse le filtre de sécurité (vérification du jeton JWT), puis les couches Controller, Service et Repository, jusqu'à la base de données MySQL. La réponse, au format JSON, remonte ensuite jusqu'à l'interface."));
c.push(image('05-architecture.png', 400, 560));
c.push(caption("Architecture technique de l'application"));
c.push(p("Cette séparation en couches favorise la maintenabilité : chaque couche a une responsabilité unique. Le front-end n'a aucune connaissance de la base de données ; il ne manipule que des ressources exposées par l'API."));

c.push(h2('2.2 Diagramme de cas d\'utilisation'));
c.push(p("Le diagramme de cas d'utilisation modélise les interactions entre le Responsable et le système. L'authentification est incluse (relation « include ») par l'ensemble des cas d'utilisation, car aucune fonctionnalité n'est accessible sans connexion préalable."));
c.push(image('01-cas-utilisation.png', 540, 600));
c.push(caption("Diagramme de cas d'utilisation"));
c.push(p("Les principaux cas sont : s'authentifier, gérer les produits (ajouter, modifier, supprimer), enregistrer un mouvement (entrée, sortie, transfert), consulter le stock et les alertes, générer un rapport et gérer les utilisateurs."));

c.push(h2('2.3 Diagramme de classes'));
c.push(p("Le modèle métier repose sur trois classes principales : Produit, Mouvement et Utilisateur. Un produit possède plusieurs mouvements ; un utilisateur enregistre plusieurs mouvements ; chaque mouvement concerne un seul produit et un seul utilisateur."));
c.push(image('02-diagramme-classes.png', 540, 560));
c.push(caption("Diagramme de classes (modèle métier)"));

c.push(h3('2.3.1 Dictionnaire de données'));
c.push(p("Les tableaux suivants détaillent les attributs de chaque entité."));
c.push(new Paragraph({ spacing: { before: 80, after: 40 }, children: [new TextRun({ text: 'Entité Produit', bold: true, size: 22 })] }));
c.push(tbl([2400, 2200, 4426],
  ['Attribut', 'Type', 'Description'],
  [
    ['id', 'Long', 'Identifiant unique (clé primaire)'],
    ['nom', 'String', 'Nom du produit'],
    ['reference', 'String', 'Référence unique du produit'],
    ['quantite', 'int', 'Quantité actuellement en stock'],
    ['seuilMinimum', 'int', 'Seuil déclenchant une alerte'],
    ['categorie', 'String', 'Catégorie du produit'],
  ]));
c.push(new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: 'Entité Mouvement', bold: true, size: 22 })] }));
c.push(tbl([2400, 2200, 4426],
  ['Attribut', 'Type', 'Description'],
  [
    ['id', 'Long', 'Identifiant unique'],
    ['type', 'String', 'ENTREE, SORTIE ou TRANSFERT'],
    ['quantite', 'int', 'Quantité concernée par le mouvement'],
    ['date', 'LocalDate', 'Date du mouvement'],
    ['motif', 'String', 'Motif / commentaire'],
    ['produit', 'Produit', 'Produit concerné (clé étrangère)'],
    ['utilisateur', 'Utilisateur', 'Auteur du mouvement'],
  ]));
c.push(new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: 'Entité Utilisateur', bold: true, size: 22 })] }));
c.push(tbl([2400, 2200, 4426],
  ['Attribut', 'Type', 'Description'],
  [
    ['id', 'Long', 'Identifiant unique'],
    ['login', 'String', 'Identifiant de connexion (unique)'],
    ['motDePasse', 'String', 'Mot de passe chiffré (BCrypt)'],
    ['role', 'String', 'Rôle de l\'utilisateur (RESPONSABLE)'],
    ['nom / prenom', 'String', 'Identité de l\'utilisateur'],
    ['email / telephone', 'String', 'Coordonnées'],
  ]));

c.push(h2('2.4 Diagrammes de séquence'));
c.push(p("Les diagrammes de séquence décrivent les échanges entre les composants pour deux scénarios représentatifs."));
c.push(h3('2.4.1 Ajouter un produit'));
c.push(p("Lors de l'ajout d'un produit, la requête envoyée par le formulaire React traverse le Controller, le Service puis le Repository, qui persiste le produit en base. La réponse (statut 201 Created) remonte ensuite jusqu'à l'interface."));
c.push(image('03-sequence-ajouter-produit.png', 540, 520));
c.push(caption("Séquence : ajouter un produit"));
c.push(h3('2.4.2 Enregistrer une sortie de stock'));
c.push(p("Pour une sortie, le service récupère d'abord le produit, puis vérifie la disponibilité. Si le stock est suffisant, la quantité est décrémentée et le mouvement enregistré ; sinon, une exception StockInsuffisantException est levée et l'API renvoie une erreur 400. Cette logique critique reste entièrement côté serveur."));
c.push(image('04-sequence-sortie-stock.png', 540, 540));
c.push(caption("Séquence : enregistrer une sortie de stock"));

// ===== CHAP 3 — CHOIX TECHNOLOGIQUES =====
c.push(h1('Chapitre 3 — Choix technologiques'));
c.push(p("Cette section justifie les technologies retenues pour le back-end et le front-end."));
c.push(h2('3.1 Technologies back-end'));
c.push(tbl([2600, 6426],
  ['Technologie', 'Rôle'],
  [
    ['Java 17', 'Langage de programmation (LTS)'],
    ['Spring Boot 3.2', 'Framework applicatif et serveur embarqué'],
    ['Spring Web', 'Exposition des contrôleurs REST'],
    ['Spring Data JPA', 'Accès aux données et mapping objet-relationnel'],
    ['Spring Security + JWT', 'Authentification et autorisation'],
    ['MySQL', 'Système de gestion de base de données'],
    ['Swagger / OpenAPI', 'Documentation interactive de l\'API'],
    ['Maven', 'Gestion des dépendances et build'],
  ]));
c.push(p("Spring Boot a été choisi pour sa productivité (auto-configuration, serveur embarqué) et son écosystème mature pour la sécurité et la persistance. JPA simplifie l'accès aux données en évitant l'écriture manuelle des requêtes SQL courantes."));
c.push(h2('3.2 Technologies front-end'));
c.push(tbl([2600, 6426],
  ['Technologie', 'Rôle'],
  [
    ['React 19', 'Bibliothèque de construction de l\'interface'],
    ['Vite', 'Outil de build et serveur de développement rapide'],
    ['Axios', 'Client HTTP pour consommer l\'API REST'],
    ['React Router', 'Gestion de la navigation entre les pages'],
    ['Recharts', 'Affichage des graphiques du tableau de bord'],
  ]));
c.push(p("React, associé à Vite, offre une expérience de développement rapide et une interface réactive. Axios centralise les appels HTTP et permet d'injecter automatiquement le jeton JWT dans chaque requête."));

// ===== CHAP 4 — BACK-END =====
c.push(h1('Chapitre 4 — Réalisation du back-end'));
c.push(h2('4.1 Organisation en couches'));
c.push(p("Le back-end est structuré en couches afin de séparer les responsabilités :"));
['entity : les entités JPA (Produit, Mouvement, Utilisateur) ;',
 'repository : l\'accès aux données via Spring Data JPA ;',
 'service : la logique métier (contrôle du stock, calcul des alertes) ;',
 'controller : les points d\'entrée REST ;',
 'dto : les objets de transfert exposés à la place des entités ;',
 'exception : la gestion centralisée des erreurs ;',
 'security / config : la configuration de la sécurité JWT.'].forEach(t => c.push(bullet(t)));
c.push(h2('4.2 Couche d\'accès aux données'));
c.push(p("Les repositories étendent JpaRepository et fournissent les opérations CRUD de base ainsi que des requêtes dérivées (par exemple la recherche des mouvements entre deux dates, ou la liste des produits dont la quantité est inférieure ou égale au seuil)."));
c.push(h2('4.3 Couche service et logique métier'));
c.push(p("La logique métier critique est centralisée dans les services. Lors de l'enregistrement d'un mouvement, le service applique les règles suivantes : pour une entrée, la quantité augmente ; pour une sortie ou un transfert, la disponibilité est vérifiée avant de décrémenter le stock. En cas de stock insuffisant, une exception dédiée est levée."));
c.push(p("Exemple de la règle de sortie (pseudo-code) :"));
c.push(code('si quantiteDemandee > stock -> lever StockInsuffisantException'));
c.push(code('sinon -> stock = stock - quantiteDemandee ; enregistrer(mouvement)'));
c.push(h2('4.4 Couche contrôleur — API REST'));
c.push(p("Les contrôleurs exposent les ressources sous forme d'API REST. Le tableau ci-dessous récapitule les principaux points d'entrée."));
c.push(tbl([1400, 4100, 3526],
  ['Méthode', 'Endpoint', 'Rôle'],
  [
    ['POST', '/api/auth/login', 'Connexion (retourne un token JWT)'],
    ['GET', '/api/produits', 'Liste des produits'],
    ['POST', '/api/produits', 'Ajouter un produit'],
    ['PUT', '/api/produits/{id}', 'Modifier un produit'],
    ['DELETE', '/api/produits/{id}', 'Supprimer un produit'],
    ['GET', '/api/mouvements', 'Liste des mouvements'],
    ['POST', '/api/mouvements', 'Enregistrer un mouvement'],
    ['GET', '/api/alertes', 'Produits sous le seuil critique'],
    ['GET', '/api/dashboard', 'Statistiques du tableau de bord'],
    ['GET', '/api/rapports?debut=&fin=', 'Rapport par période'],
  ]));
c.push(h2('4.5 Sécurité (Spring Security + JWT)'));
c.push(p("L'authentification repose sur des jetons JWT. Lors de la connexion, l'API vérifie les identifiants puis renvoie un jeton signé. Ce jeton est ensuite transmis dans l'en-tête Authorization de chaque requête. Un filtre (JwtAuthFilter) valide le jeton et place l'utilisateur dans le contexte de sécurité. Les mots de passe sont chiffrés avec BCrypt, et un compte par défaut (admin / admin123) est créé au démarrage."));
c.push(h2('4.6 Gestion des erreurs et documentation'));
c.push(p("Un gestionnaire global (GlobalExceptionHandler) traduit les exceptions métier en réponses HTTP claires : 404 pour un produit introuvable, 400 pour un stock insuffisant ou une donnée invalide. La documentation interactive de l'API est générée avec Swagger / OpenAPI, ce qui facilite les tests manuels avant l'intégration du front-end."));
c.push(p("L'interface Swagger permet de visualiser et d'exécuter chaque endpoint :"));
c.push(shot("Interface Swagger UI — http://localhost:8080/swagger-ui.html"));

// ===== CHAP 5 — FRONT-END & INTERFACES =====
c.push(h1('Chapitre 5 — Réalisation du front-end et présentation des interfaces'));
c.push(h2('5.1 Architecture du front-end'));
c.push(p("Le front-end React consomme exclusivement l'API REST. Axios est configuré de manière centralisée (URL de base et injection automatique du jeton JWT). La navigation est gérée par React Router, et un contexte d'authentification (AuthContext) protège les routes privées : un utilisateur non connecté est automatiquement redirigé."));
c.push(h2('5.2 Liste des pages'));
c.push(tbl([3000, 6026],
  ['Page', 'Rôle'],
  [
    ['Accueil (Landing)', 'Page publique de présentation'],
    ['Connexion', 'Authentification de l\'utilisateur'],
    ['Tableau de bord', 'Statistiques et graphiques'],
    ['Produits', 'Liste et gestion des produits'],
    ['Formulaire produit', 'Ajout et modification d\'un produit'],
    ['Mouvements', 'Saisie des entrées, sorties et transferts'],
    ['Alertes', 'Produits en stock critique'],
    ['Rapports', 'Mouvements par période'],
    ['Administration', 'Gestion des utilisateurs'],
    ['Profil', 'Profil et changement de mot de passe'],
  ]));
c.push(h2('5.3 Présentation des interfaces'));
c.push(p("Cette section présente les principales interfaces de l'application. Chaque écran est accompagné de l'emplacement réservé à sa capture, à insérer dans la version finale du rapport."));

const screens = [
  ['5.3.1 Page d\'accueil', "La page d'accueil (Landing Page) présente l'application au visiteur et propose un bouton de connexion. Elle constitue le point d'entrée public de l'application.", "Capture : page d'accueil (Landing Page)"],
  ['5.3.2 Page de connexion', "La page de connexion permet à l'utilisateur de saisir son login et son mot de passe. En cas d'erreur, un message explicite est affiché ; un lien « Retour à l'accueil » est également proposé.", "Capture : page de connexion (formulaire login)"],
  ['5.3.3 Tableau de bord', "Le tableau de bord affiche les indicateurs clés (nombre de produits, de mouvements, d'alertes) et des graphiques (mouvements par jour, répartition par type) réalisés avec Recharts.", "Capture : tableau de bord avec statistiques et graphiques"],
  ['5.3.4 Liste des produits', "La page Produits affiche la liste des produits avec leur référence, quantité, seuil et catégorie, et permet d'ajouter, modifier ou supprimer un produit.", "Capture : liste des produits"],
  ['5.3.5 Formulaire produit', "Le formulaire permet de saisir ou modifier les informations d'un produit. Les champs obligatoires sont contrôlés avant l'envoi à l'API.", "Capture : formulaire d'ajout / modification de produit"],
  ['5.3.6 Gestion des mouvements', "La page Mouvements permet d'enregistrer une entrée, une sortie ou un transfert. Une sortie supérieure au stock disponible est refusée et un message d'erreur s'affiche.", "Capture : saisie d'un mouvement (et message « stock insuffisant »)"],
  ['5.3.7 Alertes de stock', "La page Alertes liste les produits dont la quantité est passée sous le seuil minimum, afin d'attirer l'attention du responsable.", "Capture : page des alertes de stock"],
  ['5.3.8 Rapports', "La page Rapports permet de sélectionner une période et d'afficher les mouvements correspondants.", "Capture : page des rapports par période"],
  ['5.3.9 Administration des utilisateurs', "La page d'administration permet de gérer les comptes utilisateurs (création, modification, suppression).", "Capture : page d'administration des utilisateurs"],
  ['5.3.10 Profil utilisateur', "La page Profil affiche les informations de l'utilisateur connecté et permet de changer son mot de passe.", "Capture : page profil / changement de mot de passe"],
];
screens.forEach(([title, desc, label]) => { c.push(h3(title)); c.push(p(desc)); c.push(shot(label)); });

// ===== CHAP 6 — INTÉGRATION =====
c.push(h1('Chapitre 6 — Intégration front-end / back-end'));
c.push(p("L'intégration relie l'interface React au back-end Spring Boot. Le back-end s'exécute sur le port 8080 et le front-end sur le port 5173. Pour autoriser les échanges entre ces deux origines, une configuration CORS est définie côté serveur (origines localhost:5173 et localhost:3000 autorisées)."));
c.push(p("Le flux typique d'un mouvement de stock est le suivant : le formulaire React envoie une requête POST vers l'API ; le back-end applique la logique métier et met à jour la base de données ; le front-end recharge ensuite la liste des produits afin d'afficher les quantités à jour. L'ensemble des échanges est sécurisé par le jeton JWT transmis automatiquement par Axios."));
c.push(code('React (POST /api/mouvements) -> Spring Boot (logique) -> MySQL -> rechargement React'));

// ===== CHAP 7 — TESTS =====
c.push(h1('Chapitre 7 — Tests et validation'));
c.push(p("La qualité de l'application a été assurée par une stratégie de tests à deux niveaux : des tests automatisés côté back-end (unitaires et d'intégration) et des tests bout-en-bout côté front-end. Ces tests constituent un apport majeur du projet."));
c.push(h2('7.1 Stratégie de test'));
c.push(p("La stratégie combine : des tests unitaires sur la logique métier (services), des tests d'intégration sur la couche REST (contrôleurs), et des tests bout-en-bout (E2E) reproduisant le parcours utilisateur dans un navigateur. L'objectif est de vérifier le bon fonctionnement et de prévenir les régressions à chaque modification."));
c.push(h2('7.2 Tests automatisés du back-end (JUnit 5 + Mockito)'));
c.push(p("27 tests automatisés vérifient la logique métier et les contrats de l'API. Ils s'exécutent sans base de données, les dépendances étant simulées avec Mockito et MockMvc."));
c.push(tbl([4200, 1400, 3426],
  ['Classe de test', 'Nombre', 'Couverture'],
  [
    ['MouvementServiceTest', '9', 'Entrée/sortie/transfert, stock insuffisant'],
    ['ProduitServiceTest', '8', 'CRUD produit et détection des alertes'],
    ['ProduitControllerTest', '7', 'API /api/produits (200/201/204/404/400)'],
    ['AuthControllerTest', '3', 'Connexion : succès, échec, validation'],
    ['Total', '27', 'Logique métier + contrats REST'],
  ]));
c.push(p("Une règle essentielle vérifiée est l'interdiction d'une sortie supérieure au stock : le test s'assure que l'exception est levée et que le stock n'est pas modifié. Commande d'exécution (avec le JDK 17) :"));
c.push(code('cd demo && JAVA_HOME=$(/usr/libexec/java_home -v 17) ./mvnw test'));
c.push(p("Le résultat attendu est l'exécution des 27 tests sans aucun échec :"));
c.push(shot("Résultat des tests back-end : « Tests run: 27, Failures: 0 — BUILD SUCCESS »"));
c.push(h2('7.3 Tests automatisés du front-end (Playwright — E2E)'));
c.push(p("Cinq tests bout-en-bout rejouent un véritable parcours utilisateur dans un navigateur Chromium : navigation publique, connexion réussie, connexion échouée et déconnexion. Pour rester fiables en démonstration, les réponses du back-end sont simulées (route mocking), ce qui permet d'exécuter ces tests sans MySQL ni Spring Boot."));
c.push(tbl([6026, 3000],
  ['Scénario testé', 'Résultat attendu'],
  [
    ['La page d\'accueil mène à la connexion', 'Navigation vers /login'],
    ['Le lien « Retour à l\'accueil »', 'Retour à la page d\'accueil'],
    ['Connexion réussie', 'Redirection vers le tableau de bord'],
    ['Connexion échouée', 'Message d\'erreur, reste sur /login'],
    ['Déconnexion', 'Retour à la page d\'accueil'],
  ]));
c.push(p("Ces tests ont permis de détecter un véritable bug : après la déconnexion, l'application revenait vers la page de connexion au lieu de la page d'accueil. La correction a été apportée dans le composant de protection des routes (PrivateRoute). C'est une illustration concrète de l'utilité des tests automatisés."));
c.push(p("Un bouton « Lancer les tests E2E » a en outre été intégré au tableau de bord pour exécuter et afficher les résultats directement depuis l'interface (outil de démonstration)."));
c.push(shot("Panneau « Tests automatisés (E2E) » du tableau de bord : 5 tests réussis"));

// ===== CHAP 8 — APPORTS =====
c.push(h1('Chapitre 8 — Apports supplémentaires'));
c.push(p("Au-delà du périmètre demandé, le projet a été enrichi des éléments suivants :"));
['Tests automatisés back-end : 27 tests (JUnit 5, Mockito, MockMvc) ;',
 'Tests automatisés front-end : 5 tests bout-en-bout (Playwright) ;',
 'Correction d\'un bug de redirection à la déconnexion, détecté par les tests ;',
 'Bouton intégré au tableau de bord pour lancer les tests depuis l\'interface ;',
 'Diagrammes UML complets (cas d\'utilisation, classes, séquences, architecture) ;',
 'Lien « Retour à l\'accueil » ajouté sur la page de connexion.'].forEach(t => c.push(bullet(t)));

// ===== CONCLUSION =====
c.push(h1('Conclusion générale et perspectives'));
c.push(p("Ce projet a permis de concevoir et de développer une application web complète de gestion de stock respectant l'architecture imposée : une interface React communiquant avec une API REST Spring Boot, sans accès direct à la base de données. L'ensemble des fonctionnalités demandées a été réalisé : authentification sécurisée, gestion des produits et des mouvements, contrôle du stock, alertes, tableau de bord, rapports et documentation Swagger."));
c.push(p("La principale valeur ajoutée réside dans la mise en place d'une stratégie de tests automatisés couvrant le back-end et le front-end. Cette démarche fiabilise l'application, facilite sa maintenance et a déjà permis de détecter et de corriger un bug réel."));
c.push(p("Plusieurs perspectives d'évolution peuvent être envisagées :"));
['Export des rapports en formats PDF et Excel ;',
 'Gestion plus fine des rôles et des permissions côté interface ;',
 'Pagination et recherche avancée sur la liste des produits ;',
 'Déploiement conteneurisé (Docker) et intégration continue (CI).'].forEach(t => c.push(bullet(t)));

// ===== WEBOGRAPHIE =====
c.push(h1('Webographie'));
['Documentation Spring Boot — https://spring.io/projects/spring-boot',
 'Documentation Spring Security — https://spring.io/projects/spring-security',
 'Documentation React — https://react.dev',
 'Documentation Vite — https://vite.dev',
 'Documentation Playwright — https://playwright.dev',
 'Spécification JSON Web Token (JWT) — https://jwt.io'].forEach(t => c.push(bullet(t)));

// ===== ANNEXE =====
c.push(h1('Annexe — Installation et lancement du projet'));
c.push(h3('Base de données'));
c.push(p("Démarrer MySQL (base gestion_stock). Le schéma est créé automatiquement au premier lancement de l'application."));
c.push(h3('Back-end'));
c.push(code('cd demo && ./mvnw spring-boot:run'));
c.push(h3('Front-end'));
c.push(code('cd frontend && npm install && npm run dev'));
c.push(h3('Comptes et accès'));
c.push(p("Compte par défaut : login « admin », mot de passe « admin123 ». Application : http://localhost:5173 — Documentation API : http://localhost:8080/swagger-ui.html."));

// --- Document ---------------------------------------------------------------
const doc = new Document({
  creator: 'Gestion de Stock', title: 'Rapport - Gestion de Stock',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'Arial', color: '1E40AF' },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: '1F2937' },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 23, bold: true, font: 'Arial', color: '374151' },
        paragraph: { spacing: { before: 160, after: 100 }, outlineLevel: 2 } },
    ],
  },
  numbering: { config: [
    { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'Gestion de Stock — Rapport     |     Page ', size: 16, color: '9CA3AF' }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '9CA3AF' })] })] }) },
    children: c,
  }],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(OUT, buf); console.log('OK ->', OUT); });
