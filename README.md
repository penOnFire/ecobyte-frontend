# EcoByte Frontend

Web client for **EcoByte**, built with [React](https://react.dev/) 19 and [Vite](https://vite.dev/).

## Tech Stack

| Layer | Choice |
|---|---|
| UI | React 19 |
| Build tool | Vite 8 |
| Language | TypeScript 7 |
| Lint | oxlint |

## Requirements

- Node.js >= 24
- npm >= 11

## Getting Started

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev
```

Production build and local preview:

```bash
npm run build     # type-check + bundle into dist/
npm run preview   # serve the production build
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint with oxlint |

## Project Structure

```
src/
├── main.tsx        # React entry point
├── App.tsx         # root component
├── App.css         # root component styles
├── index.css       # global styles
└── assets/         # images and static assets
public/             # served as-is at the site root
index.html          # HTML shell
vite.config.ts      # Vite configuration
```

## Environment Variables

Vite exposes variables prefixed with `VITE_` to client code. Define them in `.env`
at the project root (git-ignored) and read them via `import.meta.env`.

```bash
VITE_API_URL=http://localhost:3000
```

```ts
const apiUrl = import.meta.env.VITE_API_URL;
```

## Related Repositories

- Backend: `ecobyte-backend`
- E2E suite: `ecobyte-e2e`
