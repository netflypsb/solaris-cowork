# Solaris Cowork Website — Development Overview

## Project Summary

Build a marketing website, documentation hub, download portal, and subscription platform for Solaris Cowork using the **saasfly** Next.js SaaS boilerplate.

**Website Root Directory**: `C:\Users\netfl\Desktop\solaris-cowork-website`

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** (App Router) | Web framework |
| **React 18** (Server Components) | UI library |
| **TypeScript** | Type safety |
| **TailwindCSS** | Styling |
| **shadcn/ui** | Component library |
| **Framer Motion** | Animations |
| **Clerk** | Authentication & user management |
| **Clerk Billing** | Subscription & payment processing (via Stripe) |
| **tRPC** | Type-safe API routes |
| **PostgreSQL** (via Kysely/Prisma) | Database |
| **Vercel** | Deployment |
| **Bun** | Package manager |
| **Turborepo** | Monorepo management |

---

## Architecture Overview

```
solaris-cowork-website/          (monorepo root)
├── apps/
│   └── nextjs/                  (main Next.js application)
│       ├── app/
│       │   ├── (marketing)/     (public marketing pages)
│       │   │   ├── page.tsx     (landing page)
│       │   │   ├── about/
│       │   │   ├── blog/
│       │   │   ├── docs/
│       │   │   └── download/
│       │   ├── (auth)/          (Clerk auth pages)
│       │   │   ├── sign-in/
│       │   │   └── sign-up/
│       │   ├── (protected)/     (requires authentication)
│       │   │   ├── dashboard/
│       │   │   ├── subscription/
│       │   │   └── credits/
│       │   ├── api/
│       │   │   ├── trpc/
│       │   │   ├── webhooks/
│       │   │   │   └── clerk/   (Clerk billing webhooks)
│       │   │   └── desktop-auth/ (desktop app auth endpoints)
│       │   └── layout.tsx
│       └── public/
│           └── assets/          (images, icons, installers)
├── packages/
│   ├── api/                     (tRPC routers)
│   ├── auth/                    (Clerk auth config)
│   ├── db/                      (database layer)
│   ├── ui/                      (shared UI components)
│   └── common/                  (shared utilities, subscription plans)
└── tooling/                     (ESLint, Prettier, Tailwind configs)
```

---

## Development Instruction Files

| File | Content |
|------|---------|
| **[01-project-setup.md](./01-project-setup.md)** | Clone saasfly, configure environment, replace Stripe with Clerk Billing |
| **[02-landing-page.md](./02-landing-page.md)** | Hero section, features, screenshots, pricing, CTA |
| **[03-public-pages.md](./03-public-pages.md)** | Documentation, download, blog, about pages |
| **[04-protected-pages.md](./04-protected-pages.md)** | User dashboard, subscription, credits management |
| **[05-clerk-auth.md](./05-clerk-auth.md)** | Clerk authentication setup and configuration |
| **[06-subscription-credits.md](./06-subscription-credits.md)** | Clerk Billing, $10/mo plan, credit system |
| **[07-deployment.md](./07-deployment.md)** | Vercel deployment and production configuration |

---

## Key Design Decisions

1. **Clerk over NextAuth**: Saasfly supports both. We use Clerk as the default auth provider since it's simpler, more feature-rich, and includes built-in billing.

2. **Clerk Billing over Stripe**: Clerk Billing wraps Stripe for payment processing but manages subscriptions natively. This simplifies the integration — one dashboard for auth + billing.

3. **Credit System**: Users get a monthly credit allocation with their $10 subscription. Credits are tracked in the PostgreSQL database and synced to the desktop app via API.

4. **Desktop App Integration**: The Solaris desktop app authenticates users via a Clerk-issued JWT. The website exposes API endpoints for the desktop app to verify subscriptions and check/deduct credits.

5. **Content from Markdown**: Documentation pages and blog posts are rendered from Markdown files stored in the repository, making them easy to update without code changes.

---

## Assets

Located at `C:\Users\netfl\Desktop\solaris-cowork\phase4\solaris-cowork-website\assets\`:

| File | Usage |
|------|-------|
| `solaris.jpg` | Logo (header, favicon, og:image) |
| `1.dashboard1.png` | Dashboard screenshot (landing page hero, features) |
| `1.dashboard2.png` | Dashboard alternate screenshot |
| `2.learning-hub.png` | Learning Hub screenshot (features section) |
| `3.creative-hub.png` | Creative Hub screenshot (features section) |
| `4.settings.png` | Settings page screenshot (features section) |

Copy these to `apps/nextjs/public/assets/` during project setup.

---

## Documentation Source Files

Located at `C:\Users\netfl\Desktop\solaris-cowork\phase4\solaris-cowork-website\documentations\`:

These Markdown files will be rendered as documentation pages on the website:

| File | Page Title |
|------|-----------|
| `getting-started-guide.md` | Getting Started |
| `chat-tasks-guide.md` | AI Chat & Tasks |
| `skills-guide.md` | Skills |
| `custom-skills-guide.md` | Creating Custom Skills |
| `mcp-connectors-guide.md` | MCP Connectors |
| `settings-guide.md` | Settings & Configuration |
| `user-guide.md` | Project Board, Wiki & Visual Editor |
| `learning-creative-hubs-guide.md` | Learning Hub & Creative Hub |
| `unified-platform-guide.md` | Unified AI Platform |
| `blog-agent-3.0.md` | Blog: Agent 3.0 Concept |
| `blog-introduction-to-solaris.md` | Blog: Introduction to Solaris |

---

## Environment Variables Required

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Clerk Billing
CLERK_BILLING_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://...

# App
NEXT_PUBLIC_APP_URL=https://solaris-ai.xyz
NEXT_PUBLIC_APP_NAME=Solaris Cowork

# Desktop App Auth
DESKTOP_AUTH_SECRET=<random-secret-for-desktop-jwt-verification>
```

---

## Quick Start (After Setup)

```bash
cd C:\Users\netfl\Desktop\solaris-cowork-website
bun install
bun run db:push        # Set up database
bun run dev            # Start development server
```

Visit `http://localhost:3000` to see the website.
