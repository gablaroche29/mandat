# Mandat — Leviat Legal

Application de facturation pour travailleurs autonomes (Québec).

## Fonctionnalités

- Création de factures conformes aux exigences québécoises
- Persistance des données dans le navigateur (localStorage)
- Export PDF par facture
- Historique avec statut payé/en attente
- Sommaire annuel avec indicateur du seuil TPS/TVQ (30 000 $)

## Développement local

```bash
npm install
npm run dev
```

## Déploiement sur GitHub Pages

1. Crée un nouveau repo GitHub (ex: `mandat`)
2. Push ce code sur la branche `main`
3. Dans les Settings du repo → Pages → Source : **GitHub Actions**
4. Le workflow `.github/workflows/deploy.yml` s'exécute automatiquement à chaque push

L'app sera disponible à `https://TON-USERNAME.github.io/mandat/`

## Stack

- Next.js 15 (export statique)
- Tailwind CSS + shadcn/ui
- jsPDF + jspdf-autotable pour l'export PDF
- localStorage pour la persistance
