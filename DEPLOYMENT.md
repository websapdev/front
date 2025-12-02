# Frontend Deployment Guide (Vercel)

## Quick Deploy

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New...** → **Project**
3. Import the `websapdev/front` repository
4. Vercel will auto-detect Next.js settings
5. **Before deploying**, add these environment variables:

### Environment Variables

Click **Environment Variables** and add:

```
NEXT_PUBLIC_API_URL=https://vysalytica-api.onrender.com
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=<generate-a-random-secret>
DATABASE_URL=file:./prisma/visibility.db
```

**Important**: 
- Replace `https://vysalytica-api.onrender.com` with your actual Render backend URL
- Replace `https://your-app-name.vercel.app` with your Vercel app URL (you'll see this after first deployment)
- Generate a random secret for `NEXTAUTH_SECRET` (you can use: `openssl rand -base64 32`)

6. Click **Deploy**

## Post-Deployment Steps

1. After first deployment, copy your Vercel URL (e.g., `https://vysalytica.vercel.app`)
2. Update the `NEXTAUTH_URL` environment variable with this URL
3. Go back to Render and update the backend's `CORS_ORIGINS` to include your Vercel URL
4. Redeploy both services

## Database Setup

The frontend uses Prisma with SQLite. For production, you may want to:

1. Use a hosted database (PostgreSQL recommended)
2. Update `DATABASE_URL` to point to your hosted database
3. Run migrations: `npx prisma migrate deploy`

## Testing

1. Visit your Vercel URL
2. Try signing up for an account
3. Test the audit functionality
4. Check the Answer Hub features

## Troubleshooting

- **CORS errors**: Make sure backend `CORS_ORIGINS` includes your Vercel URL
- **API connection fails**: Verify `NEXT_PUBLIC_API_URL` is correct
- **Auth issues**: Check `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set
- **Build fails**: Check build logs in Vercel dashboard

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click **Domains**
3. Add your custom domain
4. Update `NEXTAUTH_URL` and backend `CORS_ORIGINS` accordingly
