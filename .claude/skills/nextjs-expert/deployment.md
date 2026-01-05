---
name: nextjs-deployment-skill
description: Deploy Next.js 16 applications to production on Vercel, DigitalOcean, or other platforms. Use when ready to deploy your app, configure environment variables, set up custom domains, and optimize for production.
---

# Next.js 16 Deployment

## Instructions

Deploy your Next.js 16 application to production with proper configuration, optimization, and monitoring.

### 1. Prepare for Production

**Build and Test Locally:**
```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Check for build errors
npm run lint
```

**Verify Build Output:**
```bash
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (10/10)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                   142 B          87.3 kB
├ ○ /about                              142 B          87.3 kB
└ ○ /posts                              1.2 kB         88.5 kB

○  (Static)  automatically rendered as static HTML
```

### 2. Environment Variables

**Create Environment Files:**

`.env.local` (Development - not committed):
```bash
# Database
DATABASE_URL=postgresql://localhost:5432/mydb

# API Keys (Development)
NEXT_PUBLIC_API_URL=http://localhost:8000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Auth
JWT_SECRET=dev-secret-key
NEXTAUTH_SECRET=dev-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

`.env.production` (Production - not committed):
```bash
# Database
DATABASE_URL=postgresql://production-db/mydb

# API Keys (Production)
NEXT_PUBLIC_API_URL=https://api.myapp.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# Auth
JWT_SECRET=production-secret-key-change-me
NEXTAUTH_SECRET=production-nextauth-secret
NEXTAUTH_URL=https://myapp.com
```

**Environment Variable Types:**
```typescript
// next.config.ts
const nextConfig = {
  // Public variables (accessible on client)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
}

export default nextConfig
```

**Access in Code:**
```typescript
// Server-side (any variable)
const apiKey = process.env.API_SECRET_KEY

// Client-side (only NEXT_PUBLIC_ variables)
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

### 3. Deploy to Vercel (Recommended)

**Method 1: Deploy via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Method 2: Deploy via GitHub Integration**

1. **Push to GitHub:**
```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/repo.git
   git push -u origin main
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings
   - Click "Deploy"

3. **Set Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all production variables
   - Separate variables for Production, Preview, Development

**Vercel Configuration:**
```javascript
// vercel.json (optional)
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.myapp.com"
  }
}
```

### 4. Deploy to DigitalOcean

**Method 1: DigitalOcean App Platform**

1. **Create Dockerfile:**
```dockerfile
   # Dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   COPY package.json package-lock.json* ./
   RUN npm ci
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   RUN npm run build
   
   # Production image
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   ENV HOSTNAME "0.0.0.0"
   
   CMD ["node", "server.js"]
```

2. **Update next.config.ts:**
```typescript
   const nextConfig = {
     output: 'standalone',
   }
   
   export default nextConfig
```

3. **Deploy to DigitalOcean:**
   - Go to DigitalOcean App Platform
   - Create New App
   - Connect GitHub repository
   - Select Dockerfile
   - Set environment variables
   - Deploy

**Method 2: DigitalOcean Droplet with PM2**

1. **Setup Droplet:**
```bash
   # SSH into droplet
   ssh root@your-droplet-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx
```

2. **Clone and Build:**
```bash
   # Clone repository
   git clone https://github.com/username/repo.git
   cd repo
   
   # Install dependencies
   npm install
   
   # Build
   npm run build
```

3. **Configure PM2:**
```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'nextjs-app',
       script: 'npm',
       args: 'start',
       cwd: '/path/to/your/app',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
```
```bash
   # Start with PM2
   pm2 start ecosystem.config.js
   
   # Save PM2 configuration
   pm2 save
   
   # Setup PM2 to start on boot
   pm2 startup
```

4. **Configure Nginx:**
```nginx
   # /etc/nginx/sites-available/myapp
   server {
       listen 80;
       server_name myapp.com www.myapp.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
```
```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
   
   # Test configuration
   sudo nginx -t
   
   # Restart Nginx
   sudo systemctl restart nginx
```

5. **Setup SSL with Certbot:**
```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Get SSL certificate
   sudo certbot --nginx -d myapp.com -d www.myapp.com
   
   # Auto-renewal (already setup by certbot)
   sudo certbot renew --dry-run
```

### 5. Custom Domain Setup

**Vercel:**

1. **Add Domain:**
   - Project Settings → Domains
   - Add your domain: `myapp.com`
   - Add www subdomain: `www.myapp.com`

2. **Configure DNS:**
```
   Type    Name    Value
   A       @       76.76.21.21
   CNAME   www     cname.vercel-dns.com
```

3. **Wait for DNS propagation** (5 minutes - 48 hours)

**DigitalOcean:**

1. **Add Domain in DigitalOcean:**
   - Networking → Domains → Add Domain

2. **Configure DNS Records:**
```
   Type    Hostname    Value
   A       @           your-droplet-ip
   A       www         your-droplet-ip
```

3. **Update Nameservers** (at your domain registrar):
```
   ns1.digitalocean.com
   ns2.digitalocean.com
   ns3.digitalocean.com
```

### 6. Database Setup

**Neon Serverless Postgres:**
```bash
# Install Neon CLI
npm install -g neonctl

# Login
neonctl auth

# Create project
neonctl projects create --name myapp

# Get connection string
neonctl connection-string myapp
```

**Configure in Application:**
```typescript
// lib/db.ts
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function query(text: string, params?: any[]) {
  return await sql(text, params)
}
```

**Environment Variable:**
```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 7. Performance Optimization

**Image Optimization:**
```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.myapp.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

**Font Optimization:**
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

**Bundle Analysis:**
```bash
# Install bundle analyzer
npm install @next/bundle-analyzer

# Configure
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Analyze bundle
ANALYZE=true npm run build
```

### 8. Caching Strategy

**Static Assets:**
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

**API Routes:**
```typescript
// app/api/data/route.ts
export async function GET() {
  const data = await fetchData()
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
    },
  })
}
```

### 9. Monitoring and Analytics

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Custom Error Tracking (Sentry):**
```bash
npm install @sentry/nextjs
```
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
})
```

### 10. CI/CD Pipeline

**GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Examples

### Example 1: Complete Vercel Deployment
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Link project
vercel link

# 4. Set environment variables
vercel env add DATABASE_URL production
vercel env add STRIPE_SECRET_KEY production
vercel env add JWT_SECRET production

# 5. Deploy to production
vercel --prod

# Output:
# ✓ Production: https://myapp.vercel.app [1m]
```

### Example 2: Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    restart: unless-stopped
```
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Example 3: Environment-Specific Configuration
```typescript
// lib/config.ts
const config = {
  development: {
    apiUrl: 'http://localhost:8000',
    debug: true,
    logLevel: 'debug',
  },
  production: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL!,
    debug: false,
    logLevel: 'error',
  },
  staging: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL!,
    debug: true,
    logLevel: 'info',
  },
}

const env = (process.env.NODE_ENV || 'development') as keyof typeof config

export default config[env]
```
```typescript
// Usage in components
import config from '@/lib/config'

export default function Page() {
  console.log('API URL:', config.apiUrl)
  
  if (config.debug) {
    console.log('Debug mode enabled')
  }
  
  return <div>App</div>
}
```

### Example 4: Health Check Endpoint
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const healthcheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  }
  
  try {
    // Check database connection
    await db.query('SELECT 1')
    healthcheck.database = 'connected'
  } catch (error) {
    healthcheck.database = 'disconnected'
    healthcheck.status = 'error'
  }
  
  const statusCode = healthcheck.status === 'ok' ? 200 : 503
  
  return NextResponse.json(healthcheck, { status: statusCode })
}
```

### Example 5: Deployment Checklist Script
```javascript
// scripts/pre-deploy.js
const fs = require('fs')
const path = require('path')

console.log('🚀 Pre-deployment checks...\n')

const checks = []

// Check 1: Environment variables
console.log('✓ Checking environment variables...')
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_API_URL',
  'JWT_SECRET',
]

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    checks.push(`❌ Missing environment variable: ${varName}`)
  }
})

// Check 2: Build success
console.log('✓ Testing build...')
const { execSync } = require('child_process')

try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✓ Build successful')
} catch (error) {
  checks.push('❌ Build failed')
}

// Check 3: Tests
console.log('✓ Running tests...')
try {
  execSync('npm test', { stdio: 'inherit' })
  console.log('✓ Tests passed')
} catch (error) {
  checks.push('❌ Tests failed')
}

// Check 4: Security audit
console.log('✓ Running security audit...')
try {
  execSync('npm audit --audit-level=high', { stdio: 'inherit' })
  console.log('✓ No high-severity vulnerabilities')
} catch (error) {
  checks.push('⚠️  Security vulnerabilities found')
}

// Summary
console.log('\n' + '='.repeat(50))
if (checks.length === 0) {
  console.log('✅ All checks passed! Ready to deploy.')
  process.exit(0)
} else {
  console.log('❌ Deployment checks failed:\n')
  checks.forEach(check => console.log(check))
  process.exit(1)
}
```
```json
// package.json
{
  "scripts": {
    "pre-deploy": "node scripts/pre-deploy.js",
    "deploy": "npm run pre-deploy && vercel --prod"
  }
}
```

### Example 6: Multi-Environment Setup
```bash
# .env.development
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENV=development
DATABASE_URL=postgresql://localhost:5432/dev_db

# .env.staging
NEXT_PUBLIC_API_URL=https://staging-api.myapp.com
NEXT_PUBLIC_ENV=staging
DATABASE_URL=postgresql://staging-db.myapp.com/staging_db

# .env.production
NEXT_PUBLIC_API_URL=https://api.myapp.com
NEXT_PUBLIC_ENV=production
DATABASE_URL=postgresql://prod-db.myapp.com/prod_db
```
```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:staging": "env-cmd -f .env.staging next build",
    "build:production": "env-cmd -f .env.production next build",
    "deploy:staging": "npm run build:staging && vercel --env staging",
    "deploy:production": "npm run build:production && vercel --prod"
  }
}
```

## Best Practices

### ✅ DO:

1. **Test production build locally**
```bash
   npm run build && npm run start
```

2. **Use environment variables for secrets**
```bash
   # Never commit .env files
   echo ".env*" >> .gitignore
```

3. **Enable caching**
```typescript
   export const revalidate = 3600 // 1 hour
```

4. **Monitor performance**
```typescript
   import { Analytics } from '@vercel/analytics/react'
```

5. **Setup health checks**
```typescript
   // app/api/health/route.ts
   export async function GET() {
     return NextResponse.json({ status: 'ok' })
   }
```

6. **Use CDN for static assets**
```typescript
   images: {
     remotePatterns: [{ hostname: 'cdn.myapp.com' }]
   }
```

### ❌ DON'T:

1. **Don't commit secrets**
```bash
   # ❌ Bad
   git add .env.production
   
   # ✅ Good
   # Set via platform UI or CLI
   vercel env add SECRET_KEY
```

2. **Don't skip testing**
```bash
   # ✅ Always test before deploying
   npm run build
   npm test
   npm run lint
```

3. **Don't use development dependencies in production**
```bash
   # ✅ Use --production flag
   npm install --production
```

4. **Don't ignore bundle size**
```bash
   # ✅ Monitor bundle size
   ANALYZE=true npm run build
```

5. **Don't deploy without backup**
```bash
   # ✅ Backup database before deploying
   pg_dump mydb > backup.sql
```

---

## Summary

Next.js deployment provides:
- 🚀 **Easy deployment** - One command to Vercel
- 🐳 **Docker support** - Containerized deployments
- 🌍 **Global CDN** - Fast worldwide access
- 🔒 **Automatic HTTPS** - SSL certificates included
- 📊 **Analytics** - Built-in performance monitoring
- ⚡ **Edge functions** - Serverless at the edge
- 🔄 **CI/CD** - Automated deployments
- 📈 **Scalable** - Auto-scaling infrastructure

Deploy your Next.js 16 applications with confidence using these production-ready patterns and best practices.