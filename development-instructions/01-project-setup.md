# 01 — Project Setup

## Step 1: Clone the Saasfly Template

```bash
cd C:\Users\netfl\Desktop
git clone https://github.com/nextify-limited/saasfly.git solaris-cowork-website
cd solaris-cowork-website
```

## Step 2: Install Dependencies

Saasfly uses **Bun** as its package manager. Install Bun if not already installed:

```bash
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# Then install dependencies
bun install
```

## Step 3: Environment Configuration

Create `.env.local` in the monorepo root:

```env
# ========================
# Clerk Authentication
# ========================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# ========================
# Clerk Billing (Stripe-backed)
# ========================
CLERK_BILLING_WEBHOOK_SECRET=whsec_...

# ========================
# Database (PostgreSQL)
# ========================
# Use Vercel Postgres, Neon, Supabase, or any PostgreSQL provider
DATABASE_URL=postgresql://user:password@host:5432/solaris_cowork

# ========================
# Application
# ========================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Solaris Cowork

# ========================
# Desktop App Auth (custom secret for JWT verification)
# ========================
DESKTOP_AUTH_SECRET=generate-a-random-64-char-secret-here

# ========================
# Email (Resend — optional, for transactional emails)
# ========================
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@solaris-cowork.com
```

## Step 4: Clerk Dashboard Setup

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Name it "Solaris Cowork"
3. In the Clerk Dashboard:
   - Enable **Email** and **Google** sign-in methods (or your preferred methods)
   - Go to **Billing** → Enable Clerk Billing
   - Connect your Stripe account when prompted
   - Create a subscription plan:
     - **Name**: Solaris Pro
     - **Monthly price**: $10.00 USD
     - **Plan features**: Full access to Solaris AI platform, Monthly credit allocation
   - Note the Plan ID for later use
4. Copy the **Publishable Key** and **Secret Key** to your `.env.local`
5. Set up a **Billing webhook** endpoint: `https://your-domain.com/api/webhooks/clerk`
6. Copy the webhook signing secret to `CLERK_BILLING_WEBHOOK_SECRET`

## Step 5: Database Setup

Set up a PostgreSQL database. Recommended options:
- **Vercel Postgres** (easiest if deploying to Vercel)
- **Neon** (free tier available)
- **Supabase** (free tier available)

After getting your connection string:

```bash
# Push the database schema
bun run db:push
```

## Step 6: Replace Stripe with Clerk Billing

Saasfly ships with direct Stripe integration. We need to replace it with Clerk Billing.

### 6a: Remove Stripe Package References

In `apps/nextjs/package.json`, remove the `@saasfly/stripe` dependency if present. We won't use the Stripe package directly since Clerk Billing handles payment processing.

### 6b: Update Subscription Plans

Edit `packages/common/src/subscriptions.ts`:

```typescript
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Try Solaris with limited features',
    price: { monthly: 0, yearly: 0 },
    credits: 50,
    features: [
      '50 credits per month',
      'Basic AI chat',
      'Community support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Solaris Pro',
    description: 'Full access to the Solaris AI platform',
    price: { monthly: 10, yearly: 96 },
    credits: 1000,
    clerkPlanId: 'plan_xxx', // Replace with actual Clerk Plan ID
    features: [
      '1,000 credits per month',
      'All AI features & hubs',
      'All 170+ skills',
      'MCP connectors',
      'Sandbox code execution',
      'Browser automation',
      'Priority support',
    ],
  },
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;
```

### 6c: Update Auth Package

Edit `packages/auth/` to use Clerk instead of NextAuth:

```typescript
// packages/auth/index.ts
export { 
  ClerkProvider,
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
  useAuth,
  useClerk,
} from '@clerk/nextjs';
```

## Step 7: Copy Assets

Copy the website assets to the public directory:

```bash
# From the monorepo root
mkdir -p apps/nextjs/public/assets
copy "C:\Users\netfl\Desktop\solaris-cowork\phase4\solaris-cowork-website\assets\*" apps\nextjs\public\assets\
```

Assets available:
- `solaris.jpg` — Logo
- `1.dashboard1.png` — Dashboard screenshot
- `1.dashboard2.png` — Dashboard alternate
- `2.learning-hub.png` — Learning Hub
- `3.creative-hub.png` — Creative Hub
- `4.settings.png` — Settings page

## Step 8: Copy Documentation Content

Copy the documentation Markdown files for rendering on the docs pages:

```bash
mkdir -p apps/nextjs/content/docs
mkdir -p apps/nextjs/content/blog
copy "C:\Users\netfl\Desktop\solaris-cowork\phase4\solaris-cowork-website\documentations\getting-started-guide.md" apps\nextjs\content\docs\
copy "C:\Users\netfl\Desktop\solaris-cowork\phase4\solaris-cowork-website\documentations\chat-tasks-guide.md" apps\nextjs\content\docs\
copy "C:\Users\netfl\Desktop\solaris-cowork\phase4\solaris-cowork-website\documentations\skills-guide.md" apps\nextjs\content\docs\
copy "C:\Users\netfl\Desktop\solaris-cowork\phase4\solaris-cowork-website\documentations\custom-skills-guide.md" apps\nextjs\content\docs\
copy "C:\Users\netfl\Desktop\solaris-cowork\phase4\solaris-cowork-website\documentations\mcp-connectors-guide.md" apps\nextjs\content\docs\
copy "C:\Users\netfl\Desktop\solaris-cowork\phase4\solaris-cowork-website\documentations\settings-guide.md" apps\nextjs\content\docs\
copy "C:\Users\netfl\Desktop\solaris-cowork\phase4\solaris-cowork-website\documentations\user-guide.md" apps\nextjs\content\docs\
copy "C:\Users\netfl\Desktop\solaris-cowork\phase4\solaris-cowork-website\documentations\learning-creative-hubs-guide.md" apps\nextjs\content\docs\
copy "C:\Users\netfl\Desktop\solaris-cowork\phase4\solaris-cowork-website\documentations\unified-platform-guide.md" apps\nextjs\content\docs\
copy "C:\Users\netfl\Desktop\solaris-cowork\phase4\solaris-cowork-website\documentations\blog-agent-3.0.md" apps\nextjs\content\blog\
copy "C:\Users\netfl\Desktop\solaris-cowork\phase4\solaris-cowork-website\documentations\blog-introduction-to-solaris.md" apps\nextjs\content\blog\
```

## Step 9: Install Clerk Dependencies

```bash
cd apps/nextjs
bun add @clerk/nextjs @clerk/themes
cd ../..
```

## Step 10: Configure Clerk Middleware

Create or update `apps/nextjs/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/subscription(.*)',
  '/credits(.*)',
  '/api/desktop-auth(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/about(.*)',
  '/blog(.*)',
  '/docs(.*)',
  '/download(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

## Step 11: Update Root Layout with ClerkProvider

Edit `apps/nextjs/app/layout.tsx`:

```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## Step 12: Verify Setup

```bash
bun run dev
```

Visit `http://localhost:3000` — you should see the saasfly default landing page with Clerk authentication working.

---

## Next Steps
→ [02-landing-page.md](./02-landing-page.md) — Customize the landing page for Solaris
