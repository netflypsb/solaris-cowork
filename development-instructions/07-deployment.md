# 07 — Vercel Deployment

## Overview

Deploy the Solaris Cowork website to Vercel for production hosting. Vercel is the native deployment platform for Next.js and provides excellent performance, CDN, and serverless function support.

---

## 1. Prerequisites

- Vercel account ([vercel.com](https://vercel.com))
- GitHub repository containing the website code
- Production Clerk application (separate from development)
- Production PostgreSQL database
- Production Stripe account connected to Clerk Billing

---

## 2. Vercel Project Setup

### Import from GitHub

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your `solaris-cowork-website` repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `apps/nextjs` (since this is a monorepo)
   - **Build Command**: `bun run build` (or leave default — Vercel detects Turborepo)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `bun install`

### Monorepo Configuration

Since saasfly is a Turborepo monorepo, create or verify `vercel.json` in the repository root:

```json
{
  "buildCommand": "cd ../.. && bun run build --filter=@saasfly/nextjs",
  "installCommand": "cd ../.. && bun install",
  "framework": "nextjs"
}
```

Or use Vercel's Turborepo integration by selecting the `apps/nextjs` directory as the root.

---

## 3. Environment Variables

Set the following environment variables in Vercel Dashboard → Settings → Environment Variables:

### Production Environment

```
# Clerk (PRODUCTION keys — different from dev)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Clerk Billing
CLERK_BILLING_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_PRO_PLAN_ID=plan_...

# Database
DATABASE_URL=postgresql://...

# Application
NEXT_PUBLIC_APP_URL=https://solaris-cowork.com
NEXT_PUBLIC_APP_NAME=Solaris Cowork

# Desktop App Auth
DESKTOP_AUTH_SECRET=<production-random-64-char-secret>

# Email (optional)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@solaris-cowork.com
```

### Important Notes
- **Never reuse development keys in production**
- Clerk requires separate dev and prod applications
- Stripe test mode vs live mode must match the Clerk environment
- `NEXT_PUBLIC_` prefixed variables are exposed to the browser — only use for non-sensitive values

---

## 4. Database Setup for Production

### Option A: Vercel Postgres (Recommended)

1. In Vercel Dashboard → Storage → Create Database → Postgres
2. The `DATABASE_URL` environment variable is auto-configured
3. Run migrations: `bun run db:push` (via Vercel CLI or locally with production DATABASE_URL)

### Option B: Neon

1. Create a database at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Set as `DATABASE_URL` in Vercel env vars

### Option C: Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy the connection string (use the "Direct" connection URL)
3. Set as `DATABASE_URL` in Vercel env vars

### Run Database Migrations

After deploying, run migrations:

```bash
# Option 1: Via Vercel CLI
vercel env pull .env.local
bun run db:push

# Option 2: Add to build script
# In package.json build script, prepend db:push
```

---

## 5. Domain Configuration

### Custom Domain

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain (e.g., `solaris-cowork.com`)
3. Configure DNS:
   - **A Record**: `76.76.21.21` (Vercel)
   - **CNAME**: `cname.vercel-dns.com` (for `www` subdomain)
4. Vercel auto-provisions SSL certificate

### Update Clerk Settings

1. In Clerk Dashboard → Production application
2. Update **Home URL** to `https://solaris-cowork.com`
3. Update **Allowed redirect URLs** to include production domain

### Update Environment Variable

Set `NEXT_PUBLIC_APP_URL=https://solaris-cowork.com` in Vercel env vars.

---

## 6. Clerk Production Setup

### Create Production Application

1. In Clerk Dashboard, create a new application or switch to production instance
2. Enable the same sign-in methods as development
3. Set up Billing in production mode
4. Connect a **live** Stripe account (not test mode)
5. Recreate the subscription plan with live Stripe prices

### Configure Webhooks for Production

1. In Clerk Dashboard → Webhooks → Add Endpoint
2. URL: `https://solaris-cowork.com/api/webhooks/clerk`
3. Subscribe to the same events as development
4. Copy the production webhook signing secret
5. Update `CLERK_BILLING_WEBHOOK_SECRET` in Vercel env vars

### JWT Template

Recreate the `solaris-desktop` JWT template in the production Clerk application with the same claims configuration.

---

## 7. Installer Hosting

### GitHub Releases (Recommended)

1. Create a GitHub release for each Solaris desktop app version
2. Upload the `.exe` (Windows) and `.dmg` (macOS) installer files as release assets
3. Use GitHub's direct download URLs:
   - `https://github.com/your-org/solaris-cowork/releases/latest/download/Solaris-Setup-0.1.2.exe`
   - `https://github.com/your-org/solaris-cowork/releases/latest/download/Solaris-0.1.2.dmg`
4. Link these URLs from the `/download` page

### Vercel Blob (Alternative)

1. In Vercel Dashboard → Storage → Create Blob Store
2. Upload installer files via the Vercel Blob SDK or dashboard
3. Use the generated URLs for download links

---

## 8. Performance Optimization

### Static Generation
Ensure public pages use SSG where possible:

```typescript
// For documentation and blog pages
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour
```

### Image Optimization
Use Next.js `<Image>` component for all images:

```typescript
import Image from 'next/image';

<Image
  src="/assets/1.dashboard1.png"
  alt="Solaris Dashboard"
  width={1200}
  height={800}
  priority // For above-the-fold images
/>
```

### Analytics
Enable Vercel Analytics:

```bash
bun add @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

<body>
  {children}
  <Analytics />
</body>
```

---

## 9. Deployment Checklist

### Pre-Deployment
- [ ] All environment variables set in Vercel
- [ ] Production Clerk application configured
- [ ] Production database created and migrated
- [ ] Clerk Billing enabled with live Stripe account
- [ ] Webhook endpoint registered in production Clerk
- [ ] JWT template created for desktop app
- [ ] Custom domain DNS configured
- [ ] Installer files uploaded to GitHub Releases (or Blob)

### Post-Deployment
- [ ] Website loads at production URL
- [ ] Sign up / sign in works
- [ ] Dashboard loads with correct user data
- [ ] Subscription checkout flow works (test with Stripe test card first)
- [ ] Webhook receives and processes events
- [ ] Credits system functions correctly
- [ ] Documentation pages render properly
- [ ] Download page links work
- [ ] Blog pages render properly
- [ ] Landing page loads fast (<3s LCP)
- [ ] Mobile responsiveness verified
- [ ] OG images and meta tags correct

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking enabled (Vercel Logs or Sentry)
- [ ] Clerk webhook delivery monitored
- [ ] Database connection healthy

---

## 10. CI/CD

Vercel automatically deploys on every push to the `main` branch. For a more controlled workflow:

### Branch Protection
- Protect `main` branch — require pull requests
- Preview deployments on PRs (automatic with Vercel)
- Production deploys only from `main`

### Preview Environments
- Each PR gets a unique preview URL
- Use Clerk development keys for preview environments
- Test new features before merging to production

---

## 11. Ongoing Maintenance

### Updating Documentation
1. Edit Markdown files in `apps/nextjs/content/docs/` or `apps/nextjs/content/blog/`
2. Push to `main`
3. Vercel auto-deploys with new content

### Updating Installers
1. Build new Solaris desktop app version
2. Create a new GitHub Release with updated installer files
3. Update version numbers on the `/download` page if hardcoded

### Monitoring Costs
- **Vercel**: Free tier supports most needs; Pro ($20/mo) for teams
- **Clerk**: Free tier up to 10,000 MAU; Beyond that, see Clerk pricing
- **Database**: Free tier on Neon/Supabase for initial launch
- **Stripe**: 2.9% + $0.30 per transaction (handled by Clerk Billing)

---

**Congratulations!** Your Solaris Cowork website is now live and ready to attract subscribers. The next step is integrating the desktop app with the authentication and credit system — see the [Phase 4.1 Auth & Subscription Integration](../../phase4.1-auth-sub/) instructions.
