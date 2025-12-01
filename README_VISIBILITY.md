# 👁️ AI Visibility & Competitor Share-of-Voice Dashboard

This module tracks how often a brand and its competitors are mentioned in answers from AI engines (ChatGPT, Perplexity, etc.).

## 🛠️ Architecture

- **Frontend**: Next.js App Router (`app/brands/[id]/visibility/page.tsx`)
- **Backend**: Next.js Route Handlers (`app/api/brands/...`, `app/api/internal/...`)
- **Database**: SQLite (via Prisma) - *Local dev only, swap for Postgres in prod*
- **Worker**: `lib/aiVisibility.ts` (Polling & Parsing logic)

## 🚀 Quick Start

1. **Install Dependencies** (if not already done)
   ```bash
   npm install
   ```

2. **Initialize Database**
   ```bash
   npx prisma db push
   ```

3. **Seed Data**
   Populates the DB with a demo brand (Acme Corp), competitors, and prompts.
   ```bash
   node scripts/seed-visibility.js
   ```

4. **Run the App**
   ```bash
   npm run dev
   ```

5. **View Dashboard**
   Navigate to: `http://localhost:3000/brands/cmiln6g0c0002tflkhocm6gqv/visibility`
   *(Note: The ID `cmiln6g0c0002tflkhocm6gqv` is from the seed script. Check console output if different)*

## 🧪 Manual Testing

You can manually trigger the AI polling engine via the dashboard "Run Analysis Now" button, or via curl:

```bash
curl -X POST http://localhost:3000/api/internal/visibility/run \
  -H "Content-Type: application/json" \
  -d '{"brandId": "YOUR_BRAND_ID"}'
```

## 📝 Key Files

- `prisma/schema.prisma`: Data models
- `lib/aiVisibility.ts`: Core business logic (Polling, Sentiment, Metrics)
- `app/brands/[id]/visibility/page.tsx`: Dashboard UI
