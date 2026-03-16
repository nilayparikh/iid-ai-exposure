# AI Exposure of India's Job Market

**LocalM™ IiD | AI Exposure** — Interactive dashboard exploring how AI affects India's 564M-strong workforce.

[![Deploy to GitHub Pages](https://github.com/nilayparikh/iid-ai-exposure/actions/workflows/deploy.yml/badge.svg)](https://github.com/nilayparikh/iid-ai-exposure/actions/workflows/deploy.yml)

## Live Demo

[**nilayparikh.github.io/iid-ai-exposure**](https://nilayparikh.github.io/iid-ai-exposure/)

## Features

- **Treemap**: Industry workforce visualization (area = workers, color = AI exposure score)
- **Trends**: LFPR, WPR, UR national trends with gender breakdown (2017–2024)
- **Demographics**: Education, age, sector, social category, religion breakdowns
- **States**: State-level metrics with LFPR vs UR scatter plot
- **Employment**: Industry and occupation distribution, employment conditions
- **Wages**: Gender wage gap, regular/casual/self-employed trends
- **AI Exposure**: Assessment rubric, tier distribution, industry/occupation scores

## Data

- **Source**: Periodic Labour Force Survey (PLFS) 2023-24, MoSPI/NSO
- **Industries**: 20 NIC 2008 sections (A–T)
- **Occupations**: 9 NCO 2004 divisions
- **Total workforce**: 564.6M workers
- **AI scoring**: Single-axis 0–10 rubric (adapted from Karpathy methodology)

Data is delivered as Protocol Buffers (~53KB) for fast loading.

## Development

```bash
npm install
npm run dev        # http://localhost:3000 (base=/)
npm run build      # Static export to dist/ (base=/iid-ai-exposure/)
npm run preview    # Preview production build
```

## Tech Stack

- React 18 + Vite 6
- Tailwind CSS 3
- React Router (HashRouter for GitHub Pages)
- D3 (treemap layout)
- Protocol Buffers (data format)
- Canvas API (treemap rendering)

## Attribution

- **Data**: [Periodic Labour Force Survey](https://mospi.gov.in), Ministry of Statistics and Programme Implementation
- **Methodology**: Adapted from [Andrej Karpathy's AI Exposure](https://github.com/karpathy) project
- **Brand**: [LocalM™](https://github.com/nilayparikh) brand system

## License

MIT
