# UIDAI OpsCommand Dashboard

A professional, responsive government operations dashboard for monitoring Aadhaar operations across Fraud Detection, MBU Compliance, Field Operations, and Migration Trends.

## Features

- **Satark (Security)** - Fraud & Anomaly Detection with confidence scoring
- **Saksham (Compliance)** - MBU (Mandatory Biometric Update) Saturation tracking
- **Kartavya (Operations)** - Field Operations & Task Allocation with Kanban-style cards
- **Pravas (Migration)** - Migration Trends & Urban Planning insights

## Tech Stack

- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS with custom UIDAI theme (Navy Blue + Saffron)
- Recharts for data visualization
- Framer Motion for animations
- shadcn/ui component library
- jsPDF for report generation

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```
src/
├── components/
│   ├── dashboard/     # Dashboard views and components
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── pages/             # Page components
```

## Design System

- **Primary Color**: Deep Navy (#000080) - Authority & Trust
- **Accent Color**: Saffron (#FF9933) - Highlights & Alerts
- **Background**: Clean Gray (#F3F4F6)
- **Typography**: Inter font family

---

© 2024 UIDAI - Government of India
