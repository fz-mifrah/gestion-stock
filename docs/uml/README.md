# Diagrammes UML — Gestion de Stock

Les 4 diagrammes exigés par le cahier des charges (Étape 2), en **Mermaid** (`.mmd`), basés sur le code réel du projet.

| # | Diagramme | Fichier |
|---|-----------|---------|
| 1 | Cas d'utilisation | `01-cas-utilisation.mmd` |
| 2 | Classes (modèle métier) | `02-diagramme-classes.mmd` |
| 3 | Séquence — Ajouter un produit | `03-sequence-ajouter-produit.mmd` |
| 4 | Séquence — Sortie de stock | `04-sequence-sortie-stock.mmd` |
| 5 | Architecture technique | `05-architecture.mmd` |
| 6 | Pipeline CI/CD DevSecOps (SAST/DAST/SCA) | `06-pipeline-cicd.mmd` |

## Obtenir les images (PNG/SVG) — sans rien installer

1. Aller sur **https://mermaid.live**
2. Ouvrir un fichier `.mmd`, copier **tout** son contenu, le coller dans l'éditeur de gauche.
3. Le diagramme s'affiche à droite → menu **Actions → PNG** (ou **SVG**) pour télécharger.
4. Répéter pour les 4 fichiers.

> Astuce : dans VS Code, l'extension *Markdown Preview Mermaid Support* permet aussi de prévisualiser directement les diagrammes.

## Notes

- **Cas d'utilisation** : Mermaid n'a pas de type « use case » natif ; il est représenté par un *flowchart* (acteur + cas en ellipses + relations `include`/`extend`). L'authentification est requise pour tous les cas (`include` vers « S'authentifier »).
- Les diagrammes reflètent l'implémentation réelle :
  - règle « sortie/transfert refusé si stock insuffisant » → `MouvementService` renvoie un `400` via `StockInsuffisantException` (séquence n°4) ;
  - alerte si `quantite <= seuilMinimum` (diagramme de classes).
