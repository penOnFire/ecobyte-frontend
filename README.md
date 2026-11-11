# EcoByte Mobile Frontend

A mobile-first web client for **EcoByte** — an accredited circular electronics and e-waste lifecycle management platform for barangays.

Built strictly with **React 19**, **Vite 8**, **TypeScript 7**, **Material UI (`@mui/material`)**, and **Emotion**, accurately aligned to the official Figma UI design (`yXeghlyy3FMUfKe788RniD`).

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Start local development server (HMR enabled)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your mobile browser or DevTools device mode (recommended: **iPhone 14 / 390px**).

---

## 🛠️ Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server on port 5173 |
| `npm run build` | Runs strict TypeScript verification (`tsc -b`) and Vite production build (`dist/`) |
| `npm run preview` | Previews the production bundle locally |
| `npm run lint` | Fast linting check via `oxlint` (zero warnings & zero errors enforced) |

---

## 📂 Project Structure

```
ecobyte-frontend/
├── BACKEND_INTEGRATION.md      # Comprehensive backend API & database integration spec
├── docs/
│   └── figma-svgs/             # Exported Figma UI frame source SVGs (reference only)
├── public/                     # Static files served directly at root
├── src/
│   ├── assets/
│   │   └── ui/                 # Production-optimized high-res product photos & SVGs
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppShell.tsx    # Mobile frame shell (top location header + bottom nav)
│   │   └── ui/
│   │       ├── StatusBadge.tsx # Semantic status chip primitive
│   │       └── StepperTracker.tsx # 5-step circular request progress tracker
│   ├── lib/
│   │   └── api/                # Centralized typed API client & service modules
│   │       ├── client.ts       # Typed fetch wrapper with JWT interceptor & error handling
│   │       ├── auth.ts         # Authentication & resident profile services
│   │       ├── assessments.ts  # Multi-angle upload & AI telemetry services
│   │       ├── dropoffs.ts     # Accredited hub locator & intake scheduler services
│   │       ├── reuse.ts        # Reuse marketplace, reservations & proof upload services
│   │       └── index.ts        # API services barrel export
│   ├── pages/                  # 15 Route-level mobile screens
│   │   ├── DashboardPage.tsx         # Figma 1:222 (Alex overview, stats, live tracker)
│   │   ├── SignInPage.tsx            # Figma 1:2 (Auth toggle, email, password, socials)
│   │   ├── RegisterPage.tsx          # Figma 1:96 (Create resident account & barangay picker)
│   │   ├── ScanDevicePage.tsx        # Figma 1:782 (Multi-Angle camera scanner HUD)
│   │   ├── AddDetailsPage.tsx        # Figma 1:953 (Assessment questions & damage chips)
│   │   ├── AiDiagnosticPage.tsx      # Figma 1:1147 (X-ray inspection HUD & battery hazard risk)
│   │   ├── ReuseRepairGuidePage.tsx  # Figma 1:1621 (91% viability gauge & repair guides)
│   │   ├── ReuseHubPage.tsx          # Figma 1:1835 (Refurbished marketplace & category filters)
│   │   ├── ReuseItemDetailPage.tsx   # Figma 1:2104 (ThinkPad detail, warranty & slot picker)
│   │   ├── ConfirmReservationPage.tsx# Figma 62:500 (Confirmation summary & locker assignment)
│   │   ├── ReservationPassPage.tsx   # Figma 1:2448 (Pick-up code ticket 'ECO-4821')
│   │   ├── ProofOfClaimPage.tsx      # Figma 1:2342 (Photo proof upload & landfill metric)
│   │   ├── DropOffFinderPage.tsx     # Figma 1:500 (Accredited drop sites & vector route map)
│   │   ├── DropoffSchedulerPage.tsx  # Figma 1:1329 (Intake calendar picker & time slots)
│   │   └── MyRequestsPage.tsx        # Figma 1:2228 (Ongoing drop-offs & active reservations)
│   ├── theme/
│   │   └── theme.ts            # EcoByte MUI Theme (Forest Green #4F5F4B, Quicksand font)
│   ├── types/                  # Strict TypeScript domain models & DTOs
│   │   ├── api.ts              # API boundary interfaces
│   │   └── index.ts            # Types barrel export
│   ├── App.tsx                 # Full React Router tree
│   └── main.tsx                # Entry point with ThemeProvider & CssBaseline
├── .env.example                # Local environment variable template
├── index.html                  # HTML template with Quicksand Google Font preconnect
├── package.json
├── tsconfig.app.json           # TypeScript configuration with @/* path alias
└── vite.config.ts              # Vite configuration
```

---

## 🔌 Backend Integration

For backend developers implementing the server API:
- See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for full endpoint specifications, request/response JSON schemas, database models (Prisma), state machine diagrams, and error codes.
- Configure client API base URL in `.env`:
  ```env
  VITE_API_BASE_URL=http://localhost:8000/api/v1
  ```
