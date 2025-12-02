# QUICK START: Fix Deployment Blockers

**Time to Read:** 5 minutes  
**Difficulty:** Medium  
**Estimated Total Fix Time:** 40-56 hours

---

## The 4 Critical Issues (In Order of Priority)

### Issue #1: Mixed Authentication (4-6 hours)

**The Problem:** 
Some pages use localStorage tokens, some use NextAuth sessions. Users get logged out on refresh.

**Quick Fix:**

```bash
# Step 1: Generate strong secret
openssl rand -base64 32
# Save this somewhere safe!

# Step 2: Update environment variables
# In .env.local and .env.production.example:
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000  # or production URL
```

```javascript
// Step 3: Fix /app/login/page.tsx
// REMOVE these lines (lines 37-39):
localStorage.setItem('token', data.data.token)
localStorage.setItem('user', JSON.stringify(data.data.user))

// REPLACE with NextAuth approach:
import { signIn } from 'next-auth/react'
// Then use signIn after successful API auth
```

```javascript
// Step 4: Fix /app/api/auth/[...nextauth]/route.ts
// Make sure it's properly configured to store sessions
// See docs: https://next-auth.js.org/getting-started/example

export const authOptions: NextAuthOptions = {
  providers: [
    // Your credential provider
  ],
  callbacks: {
    // Session callback to include user data
  },
  session: { strategy: 'jwt' }, // or use prisma adapter
}
```

**Test:**
1. Login at `/login`
2. Refresh page (should stay logged in)
3. Navigate to different page (should maintain session)
4. Close tab and reopen (session should persist)

---

### Issue #2: Missing Graph Visualization Library (20-32 hours)

**The Problem:**
The Answer Graph page shows mock spinning circles instead of a real graph visualization.

**Quick Fix:**

```bash
# Step 1: Install a graph visualization library
npm install react-force-graph
# (or use: cytoscape, d3, or vis.js instead)

# Step 2: Replace the mock visualization in /app/brands/[id]/answer-graph/page.tsx
```

**Before (lines 171-189 - mock visualization):**
```jsx
{/* Placeholder for actual graph viz - using CSS to make a mock graph */}
<div className="absolute inset-0 flex items-center justify-center">
  {/* Central Brand Node */}
  <div className="z-10 w-24 h-24 rounded-full bg-gradient...">
    Brand
  </div>
  {/* These are fake circles! */}
</div>
```

**After (real graph visualization):**
```jsx
import React, { useRef, useEffect } from 'react'
import ForceGraph2D from 'react-force-graph-2d'

// Inside the component render:
{graphData && (
  <div className="lg:col-span-2 premium-card min-h-[500px] bg-gray-900 rounded-lg overflow-hidden">
    <ForceGraph2D
      graphData={graphData}
      nodeLabel="label"
      nodeColor={node => {
        switch(node.type) {
          case 'brand': return '#3b82f6'
          case 'competitor': return '#ef4444'
          case 'topic': return '#06b6d4'
          case 'question': return '#8b5cf6'
          default: return '#6b7280'
        }
      }}
      nodeCanvasObject={(node, ctx) => {
        ctx.fillStyle = node.color || '#3b82f6'
        ctx.beginPath()
        ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI)
        ctx.fill()
      }}
      width={500}
      height={500}
    />
  </div>
)}
```

**Test:**
1. Go to `/brands/[id]/answer-graph`
2. Click "Build Graph" (or if graph exists, should appear)
3. Verify nodes are visible (brand, competitors, topics, questions)
4. Try dragging nodes (should move)
5. Try zooming with mouse wheel

---

### Issue #3: Replace Mock Data Pages (8-12 hours)

**The Problem:**
Three pages show hardcoded fake data instead of fetching from backend.

#### 3a. Fix Reports Page (`/app/reports/page.tsx`)

**Change these lines (13-62):**

**Before:**
```javascript
const sampleReports = [
  { id: '1', title: 'Monthly Performance...', /* all hardcoded */ }
]
```

**After:**
```javascript
'use client'
import { useEffect, useState } from 'react'

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchReports()
  }, [])
  
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/api/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setReports(data.data || [])
    } catch (err) {
      console.error('Failed to fetch reports:', err)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <div>Loading reports...</div>
  
  // Then use 'reports' instead of 'sampleReports'
}
```

#### 3b. Fix Playbooks Page (`/app/playbooks/page.tsx`)

Same pattern as Reports - fetch from `/api/playbooks` instead of using `samplePlaybooks`

#### 3c. Fix Graph Analytics Page (`/app/graph/page.tsx`)

```javascript
// Add these imports
import { useEffect, useState } from 'react'

// Replace hardcoded data arrays with:
const [analyticsData, setAnalyticsData] = useState({
  performance: [],
  issues: [],
  traffic: []
})

useEffect(() => {
  fetchAnalytics()
}, [])

const fetchAnalytics = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/data`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    const data = await response.json()
    setAnalyticsData(data.data)
  } catch (err) {
    console.error('Failed to fetch analytics:', err)
  }
}

// Use analyticsData instead of hardcoded arrays
```

**Test:**
1. Go to `/reports` - Should load real reports
2. Go to `/playbooks` - Should load real playbooks  
3. Go to `/graph` - Should load real analytics data
4. Verify data updates when refreshed

---

### Issue #4: Configure Production Environment (2-4 hours)

**The Problem:**
No production environment configuration, app will crash in production.

**Quick Fix:**

```bash
# Step 1: Create .env.production.example file
cat > .env.production.example << 'EOF'
# Production Environment Configuration
# Copy this file to .env.production and fill in actual values

# API Configuration (point to production API)
NEXT_PUBLIC_API_URL=https://api.vysalytica.com

# NextAuth Configuration  
NEXTAUTH_URL=https://vysalytica.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Database Configuration
DATABASE_URL=postgresql://username:password@host:5432/vysalytica_db
EOF

# Step 2: Generate strong secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "Generated secret: $NEXTAUTH_SECRET"
echo "Add this to your production .env.production file"
```

**Step 3: Update deployment docs**

Add to your deployment platform (Vercel/Render/etc):
```
Environment Variables:
- NEXTAUTH_SECRET = [generated value]
- NEXTAUTH_URL = https://[your-production-url]
- NEXT_PUBLIC_API_URL = https://[your-api-url]
- DATABASE_URL = postgresql://...
```

**Test:**
```bash
# Build with production env
npm run build

# Should complete without errors
```

---

## Testing Checklist

### Before Deployment:

```
Authentication:
□ Login works
□ Session persists after page refresh
□ Logout clears session everywhere
□ Protected routes redirect to login

Graph Visualization:
□ Answer Graph page loads without errors
□ Graph visualizes nodes correctly
□ Can drag/zoom/pan nodes
□ Different node types have different colors

Data Pages:
□ Reports page shows real data (not mock)
□ Playbooks page shows real data (not mock)
□ Graph analytics shows real data (not mock)
□ All pages have loading states
□ Error states handled gracefully

Environment:
□ Build succeeds with production env vars
□ App starts without console errors
□ API calls go to correct URL
□ Database connection works
```

---

## File Checklist

### To Modify:
```
/app/login/page.tsx - Remove localStorage, use NextAuth
/app/signup/page.tsx - Remove localStorage, use NextAuth
/app/dashboard/page.tsx - Use NextAuth session instead of token
/app/settings/page.tsx - Use NextAuth session
/app/api/auth/[...nextauth]/route.ts - Complete NextAuth config
/app/brands/[id]/answer-graph/page.tsx - Add real graph library
/app/reports/page.tsx - Fetch real data instead of mock
/app/playbooks/page.tsx - Fetch real data instead of mock
/app/graph/page.tsx - Fetch real data instead of mock
/lib/api.ts - Update to get token from NextAuth
```

### To Create:
```
.env.production.example - Production env template
/app/error.tsx - Global error boundary
```

---

## Command Reference

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Build production version
npm run build

# Run build (doesn't watch)
npm run start

# Check for TypeScript errors
npx tsc --noEmit

# Run linter
npm run lint

# Run tests
npm test

# Install graph library (choose one)
npm install react-force-graph
# OR
npm install cytoscape
# OR  
npm install d3
# OR
npm install vis-network
```

---

## Common Mistakes to Avoid

❌ **Don't:**
- Keep using localStorage tokens alongside NextAuth
- Leave mock data in code
- Deploy without setting NEXTAUTH_SECRET
- Forget to test session persistence
- Use HTTP endpoints in production (must be HTTPS)

✅ **Do:**
- Choose ONE authentication strategy and stick with it
- Replace ALL mock data with real API calls
- Use strong randomly generated secrets
- Test end-to-end user flows
- Use HTTPS everywhere in production

---

## Where to Get Help

**NextAuth Docs:** https://next-auth.js.org/  
**React Force Graph:** https://github.com/vasturiano/react-force-graph  
**Cytoscape.js:** https://cytoscape.org/  
**Vercel Deployment:** https://vercel.com/docs  

---

## Progress Tracking

Use this to track your fixes:

```
Week 1:
- [ ] Day 1-2: Auth strategy (4-6h)
- [ ] Day 3: Mock data (6h)
- [ ] Day 4: Environment (2h)
- [ ] Day 5: Graph lib start (8h)

Week 2:
- [ ] Days 1-4: Graph lib finish (16-24h)
- [ ] Day 5: Error boundaries (4h)

Week 3:
- [ ] Testing (24-40h)
- [ ] Accessibility (16-24h)
```

---

**Status:** Ready to start fixing!  
**Next Action:** Start with Issue #1 (Authentication)  
**Estimated Total Time:** 40-56 hours (1-2 weeks with one developer)
