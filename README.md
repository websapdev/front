# Vysalytica Frontend

Production-ready Next.js frontend for the Vysalytica platform. The app connects to the live backend at `https://vs-6lye.onrender.com` to run AI visibility quick scans and full audits.

## Prerequisites

- Node.js >= 18 and <= 22
- npm

## Environment

Create a `.env.local` file with the backend base URL (see `.env.example` for defaults):

```
NEXT_PUBLIC_API_URL=https://vs-6lye.onrender.com
```

## Running locally

```
npm install
NEXT_PUBLIC_API_URL=https://vs-6lye.onrender.com npm run dev
```

The app will be available at http://localhost:3000 and will proxy all API calls to the live backend.

## Production build & start

```
NEXT_PUBLIC_API_URL=https://vs-6lye.onrender.com npm run build
PORT=3000 NEXT_PUBLIC_API_URL=https://vs-6lye.onrender.com npm start
```

`npm start` uses `next start -p $PORT`, so set `PORT` as needed in your hosting environment while providing the backend base URL.

Vercel deployments use the included `vercel.json` to run `npm run build` and serve the default `.next` output directory without any custom paths.

## Tests and linting

- Run unit tests: `npm test`
- Run linting: `npm run lint`

## Features

- AI Visibility Quick Scan powered by the `/api/quickscan` endpoint.
- Full audit submission with job polling and history.
- Downloadable audit reports.
- Friendly 404 page and production-safe defaults.
