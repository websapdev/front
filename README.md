# Vysalytica Frontend

Production-ready Next.js frontend for the Vysalytica platform. The app connects to the live backend at `https://vs-6lye.onrender.com` to run AI visibility quick scans and full audits.

## Prerequisites

- Node.js >= 18 and < 21
- npm

## Environment

Create a `.env.local` file with the backend base URL:

```
NEXT_PUBLIC_API_URL=https://vs-6lye.onrender.com
```

## Running locally

```
npm install
npm run dev
```

The app will be available at http://localhost:3000.

## Production build & start

```
npm install
npm run build
PORT=3000 npm start
```

`npm start` uses `next start -p $PORT`, so set `PORT` as needed in your hosting environment.

## Tests and linting

- Run unit tests: `npm test`
- Run linting: `npm run lint`

## Features

- AI Visibility Quick Scan powered by the `/api/quickscan` endpoint.
- Full audit submission with job polling and history.
- Downloadable audit reports.
- Friendly 404 page and production-safe defaults.
