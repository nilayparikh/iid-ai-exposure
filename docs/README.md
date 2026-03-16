# AI Exposure App

Interactive dashboard exploring how AI affects India's job market across industries and occupations.

## Overview

- **7 views**: Treemap, Trends, Demographics, States, Employment, Wages, AI Exposure Assessment
- **Data**: PLFS 2017-18 through 2023-24 (564.6M workers, 20 NIC 2008 industries, 9 NCO 2004 occupations)
- **Scoring**: Single-axis 0-10 AI exposure rubric adapted from Karpathy methodology

## Architecture

```
src/
├── App.jsx                 ← Root app with HashRouter
├── main.jsx                ← Entry point
├── index.css               ← Global styles + CSS variables
├── components/
│   ├── Layout.jsx          ← Branded header/footer shell
│   ├── Sidebar.jsx         ← Left nav with stats, histogram, legend
│   ├── TreemapCanvas.jsx   ← Canvas-based treemap visualization
│   ├── TrendPanel.jsx      ← LFPR/WPR/UR trends
│   ├── DemographicsPanel.jsx
│   ├── StatePanel.jsx
│   ├── EmploymentPanel.jsx
│   ├── WagesPanel.jsx
│   ├── AssessmentPanel.jsx
│   ├── IndustryBar.jsx     ← Industry sidebar (treemap view)
│   └── OccupationRing.jsx  ← Occupation sidebar (treemap view)
└── utils/
    ├── colors.js           ← Exposure color scale + formatting
    ├── pbLoader.js         ← Protocol Buffer data loader
    └── treemap.js          ← Squarified treemap algorithm
```

## Data Pipeline

Data processing scripts live in the **main repo** at `data/ai-exposure/`:

1. `ingest_data.py` → Fetches from eSankhyiki MCP API → `raw/*.json`
2. `build_data.py` → Processes raw data + scores → `data.json`
3. `build_pb.py` → Compiles to per-page `.pb` files → `public/pb/`

The app only contains exported PB files (53KB total vs 153KB JSON).

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Static export to dist/
npm run preview  # Preview build
```

## Deployment

Deployed as GitHub Pages via GitHub Actions. See `.github/workflows/deploy.yml`.

## Methodology

See `docs/ai-exposure-methodology.md` in the main repo for the complete scoring methodology.
