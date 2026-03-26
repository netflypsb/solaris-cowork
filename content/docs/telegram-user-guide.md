# Solaris Telegram Integration — Complete User Guide

> **Version**: 2.0.0  
> **Date**: March 2026  
> **Target Audience**: All Solaris users — from personal use to SaaS operators

---

## Table of Contents

1. [What Is Solaris Telegram Integration?](#what-is-solaris-telegram-integration)
2. [Quick Start (5 Minutes)](#quick-start-5-minutes)
3. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
4. [Use Case Guides](#use-case-guides)
   - [Personal Use](#personal-use)
   - [Team Use](#team-use)
   - [Group Manager](#group-manager)
   - [SaaS / Income Generation](#saas--income-generation)
5. [Custom Knowledge & Capabilities](#custom-knowledge--capabilities)
6. [Agent-Assisted Setup](#agent-assisted-setup)
7. [Access Control Modes](#access-control-modes)
8. [Monetization & Payments](#monetization--payments)
9. [Deep Links & Onboarding](#deep-links--onboarding)
10. [Processing Indicators & Queue](#processing-indicators--queue)
11. [Subscription Plans](#subscription-plans)
12. [User Management](#user-management)
13. [Bot Commands Reference](#bot-commands-reference)
14. [Analytics & Revenue](#analytics--revenue)
15. [Troubleshooting](#troubleshooting)
16. [Security Best Practices](#security-best-practices)
17. [Bot Owner Setup Checklist](#bot-owner-setup-checklist)
18. [Advanced Tips](#advanced-tips)

---

## What Is Solaris Telegram Integration?

Solaris Telegram Integration lets you connect your Solaris AI agent to a Telegram bot. Once connected, you (and optionally others) can chat with your AI agent directly from Telegram — send messages, receive responses, share files, and manage coding sessions, all from your phone or desktop Telegram app.

**Key capabilities:**
- **Chat with your AI agent** from anywhere via Telegram
- **Share files and images** — the agent can send files back too
- **Manage sessions** — create, switch, and stop coding sessions remotely
- **Multi-user support** — let teams or customers access your bot
- **Group management** — deploy as a group chat assistant
- **Monetization** — charge users via Stripe or Telegram Stars
- **Custom knowledge** — make your bot an expert in any domain
- **Processing indicators** — users see typing and emoji reactions while the AI works
- **Deep link onboarding** — shareable links for instant access or plan subscriptions
- **Agent-assisted setup** — let the Solaris agent configure everything for you

---

## Quick Start (5 Minutes)

### Option A: Let the Agent Do It

If you're new to Telegram bots, the easiest path is to ask the Solaris agent:

> **You:** "Set up a Telegram bot for me for personal use"

The agent will walk you through each step, ask for your bot token, and configure everything. See [Agent-Assisted Setup](#agent-assisted-setup) for details.

### Option B: Manual Setup

1. **Create a bot** — Open Telegram, message [@BotFather](https://t.me/BotFather), send `/newbot`, follow the prompts
2. **Copy the bot token** — BotFather gives you a token like `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`
3. **Open Solaris Settings** → Telegram tab
4. **Paste the token**, toggle **Enable Integration** on, click **Save**
5. **Generate a pairing code** → Send `/pair CODE` to your bot in Telegram
6. **Done!** — You're now the bot owner. Send any message to start chatting with your AI agent.

---

## Step-by-Step Setup Guide

### Step 1: Create a Telegram Bot

1. Open Telegram (mobile or desktop)
2. Search for **@BotFather** and start a chat
3. Send `/newbot`
4. Choose a display name (e.g., "My Solaris Assistant")
5. Choose a username (must end in `bot`, e.g., `my_solaris_bot`)
6. **Copy the API token** — you'll need this in Solaris

**Required BotFather Settings (Bot Owner Must Configure):**

| Command | Purpose | Recommendation |
|---------|---------|----------------|
| `/setdescription` | Sets what users see before starting the bot | Set a clear description of what the bot does |
| `/setabouttext` | Sets the bot's "About" section | Include contact info for support |
| `/setuserpic` | Upload a profile picture for your bot | Professional logo or avatar |
| `/setcommands` | Set the command menu | Solaris auto-registers commands, but verify they appear |
| `/setprivacy` | Controls message access in groups | Set to **DISABLED** for Group Manager mode |

**Security Note for Bot Owners:**
- Keep your bot token secret — anyone with the token can control your bot
- If you suspect token compromise, use `/revoke` in BotFather to generate a new one
- Consider enabling Telegram's 2FA on your account for additional protection

### Step 2: Configure in Solaris

1. Open **Solaris** → **Settings** (gear icon) → **Telegram** tab
2. **Bot Token**: Paste the token from BotFather
3. **Enable Integration**: Toggle ON
4. Click **Save Settings**

The bot will start automatically. You'll see a status indicator showing it's running.

### Step 3: Pair Your Account

1. In Solaris Settings → Telegram, click **Generate Pairing Code**
2. A 6-digit code appears (e.g., `482915`)
3. Open your bot in Telegram and send: `/pair 482915`
4. You'll receive a confirmation: "✅ Pairing successful! You are now the bot owner."

You are now the **bot owner** (👑) with unlimited access and admin commands.

**Important:** The pairing code expires in 5 minutes for security. If expired, generate a new one.

### Step 4: Test It

Send any message to your bot:

> **You:** "What files are in my project?"

The bot will show a typing indicator, process your request, and respond with the AI agent's answer.

### Step 5: Configure Additional Settings (Optional)

Back in Solaris Settings → Telegram:

- **Notification Level**: Choose what gets relayed to Telegram
  - `All` — Messages, tool steps, errors, completions
  - `Errors` — Only errors and completions
  - `Questions` — Only when the agent asks you a question
  - `None` — Silent mode (you still send messages)
- **Auto-Deliver Files**: Toggle on to automatically receive files the agent creates
- **File Types**: Comma-separated extensions to auto-deliver (e.g., `.pdf,.docx,.png`)
- **Max File Size**: Maximum file size for delivery (default: 50 MB)

---

## Use Case Guides

### Personal Use

**Scenario**: You want to chat with your Solaris agent from your phone while away from your desk.

**Recommended setup:**

| Setting | Value |
|---------|-------|
| Access Mode | Whitelist (default) |
| Monetization | Off |
| Notification Level | All or Questions |
| Auto-Deliver Files | On |
| Processing Indicators | On |
| Reaction Lifecycle | On |

**Step-by-step:**

1. Complete the [Quick Start](#quick-start-5-minutes)
2. That's it! No additional configuration needed.

**What you can do:**
- Send coding questions from your phone
- Continue sessions you started on desktop
- Receive files the agent creates (PDFs, documents, images)
- Answer agent questions remotely (e.g., "Which approach should I use?")
- Monitor long-running tasks via session status notifications

**Tips for personal use:**
- Use `/status` to check what the agent is doing
- Use `/sessions` to see all available sessions
- Use `/new "Fix the login bug"` to start a new session from Telegram
- Send images or files to include them as context for the agent
- Use `/sendfile .` to get the last file the agent created

---

### Team Use

**Scenario**: You have a team of 2-50 people who need access to the AI agent via Telegram.

**Recommended setup:**

| Setting | Value |
|---------|-------|
| Access Mode | Whitelist |
| Monetization | Off (or On for usage tracking) |
| Notification Level | Questions |
| Max Concurrent AI | 3-5 |
| Processing Indicators | On |
| Reaction Lifecycle | On |
| Auto-Approve on Payment | Off |
| Per-User Message Limit | 50-100 |
| Limit Period | daily |

**Step-by-step:**

1. Complete the [Quick Start](#quick-start-5-minutes)
2. Set **Access Mode** to **Whitelist**
3. Set **Max Concurrent AI Requests** to your team size (e.g., 5)
4. Set **Per-User Message Limit** based on your team's expected usage
5. For each team member:
   - **Option A (Pairing)**: Generate a pairing code, share it securely, team member sends `/pair CODE`
   - **Option B (Invite Link)**: Use `/invite 10 free` in Telegram to generate a link, share it securely with the team. Clicking the link auto-registers them.
6. Optionally enable **Monetization** just for usage tracking (set all plans to free)

**Security Considerations for Team Use:**

⚠️ **Invite Link Sharing Risk**: By default, invite links can be forwarded. Anyone with the link can join until the usage limit is reached.

**Mitigation Strategies:**
1. **Use pairing codes** for sensitive teams (more secure, one-time use)
2. **Set low invite link usage limits** (e.g., `/invite 3 basic` for 3 uses only)
3. **Monitor the user list** regularly with `/users` command
4. **Block unwanted users immediately** if they gain access

**Team management:**
- View all users in **Settings → Telegram → Enterprise Features → Bot Users**
- Block/unblock users as needed
- Use `/users` in Telegram for a quick user summary
- Use `/broadcast Important update: ...` to message all team members

**Custom knowledge for teams:**
- Add domain-specific files to your project directory (see [Custom Knowledge](#custom-knowledge--capabilities))
- Each team member's questions will be answered using your team's knowledge base
- The agent's responses are grounded in your project context

**Tips for team use:**
- Set higher concurrent AI limits for larger teams
- Use pairing codes instead of individual invite links for maximum security
- Consider creating a dedicated project directory with team knowledge files
- Use the `/admin` panel to monitor team usage

---

### Group Manager

**Scenario**: You want the bot to live in a Telegram group chat and respond to multiple members.

**Recommended setup:**

| Setting | Value |
|---------|-------|
| Use Case | Group Manager |
| Access Mode | Open |
| Group Mode | On |
| Group Activation | mention (recommended) or command |
| Per-User Message Limit | 20-50 |
| Limit Period | daily |
| Monetization | Off |

**Step-by-step:**

1. Complete the [Quick Start](#quick-start-5-minutes)
2. In Settings → Telegram, select **Use Case: Group Manager**
3. Set **Group Activation** to your preferred mode:
   - `mention` — Bot only responds when @mentioned (@your_bot)
   - `command` — Bot only responds to /ask command
   - `all` — Bot processes all messages (not recommended for large groups)
4. Add your bot to a Telegram group:
   - Open the group in Telegram
   - Tap the group name → Add Member → Search for your bot
   - Make the bot an admin (required for some features)
5. Test by mentioning the bot: `@your_bot what is the weather?`

**Required BotFather Setting for Groups:**

⚠️ **Critical**: You MUST run `/setprivacy` in BotFather and set it to **DISABLED** for the bot to see group messages.

**Group Security Considerations:**

1. **All group members** can use the bot (no individual pairing needed)
2. **Per-user limits** still apply — each member has their own message quota
3. **Group admins** cannot be blocked by the bot owner through the bot interface
4. **Bot removal** — If the bot is removed from the group, access is immediately revoked for all members

**Group management commands:**
- `/ask <question>` — Ask the bot a question (when activation is set to 'command')
- `/limit` — Check remaining message quota
- Bot automatically tracks usage per group member

---

### SaaS / Income Generation

**Scenario**: You want to offer AI-powered services to paying customers via a Telegram bot.

**Recommended setup:**

| Setting | Value |
|---------|-------|
| Access Mode | Open or Approval |
| Monetization | On |
| Notification Level | Questions |
| Max Concurrent AI | 3-10 (scale with revenue) |
| Processing Indicators | On |
| Reaction Lifecycle | On |
| Auto-Approve on Payment | On |
| Custom Welcome Message | Branded message with value proposition |

**Step-by-step:**

1. Complete the [Quick Start](#quick-start-5-minutes)
2. **Enable Enterprise Features:**
   - Set **Access Mode** to **Open** (anyone can try) or **Approval** (you vet users)
   - Toggle **Monetization** ON
3. **Set up payments:**
   - **Stripe**: Get a [Stripe Provider Token](https://stripe.com) from BotFather → Payments → Stripe
   - **Telegram Stars**: Works automatically — no setup needed (for digital goods)
   - Paste your Stripe Provider Token in Settings
4. **Configure plans:**
   - Default plans are auto-created (Free, Basic $5, Pro $20, Enterprise $50)
   - Customize plans in Telegram via the admin panel, or ask the Solaris agent to help
   - Set Stars prices for each plan for in-app purchase support
5. **Set up onboarding:**
   - Toggle **Auto-Approve on Payment** ON — users get access immediately after paying
   - Write a **Custom Welcome Message** with your branding and value proposition
   - Generate **invite links** and **plan links** to share on social media, websites, etc.
6. **Add custom knowledge** (see [Custom Knowledge](#custom-knowledge--capabilities)):
   - Create a project directory with your domain expertise files
   - This makes your bot a specialized expert that users pay for

**Revenue models:**

#### Freemium Model (Recommended for Growth)
- **Free**: 20 messages/day (enough to try, not enough to stay)
- **Basic**: $5/month or 50 Stars — 500 messages
- **Pro**: $20/month or 200 Stars — 2,000 messages
- **Enterprise**: $50/month or 500 Stars — Unlimited

#### Pay-Per-Use Model
- **Free**: 5 messages/day
- **Credits**: $2 for 100 messages (via `/buy`)
- Good for irregular users who don't want subscriptions

#### Premium-Only Model
- **No free tier** — use Approval mode
- **Basic**: $29/month — 200 messages
- **Pro**: $99/month — 1,000 messages
- Best for high-value niche services

**Promotion:**
- Share your bot link: `https://t.me/YOUR_BOT`
- Share plan deep links: `https://t.me/YOUR_BOT?start=plan_pro`
- Generate invite links: `/invite 100 basic` (100-use invite to Basic plan)
- Add bot link to your website, social media, email signature

**Scaling tips:**
- Start with Open + Freemium to build user base
- Monitor analytics daily with `/admin` and `/revenue`
- Use `/broadcast` to announce new features and retain users
- Increase Max Concurrent AI as user count grows
- Consider multiple bots for different niches (each Solaris instance = one bot)

---

## Custom Knowledge & Capabilities

One of Solaris's most powerful features is that your AI agent uses the **project directory as context**. This means you can make your Telegram bot an expert in any domain by adding knowledge files to your project.

### How It Works

When a user sends a message to your Telegram bot, the Solaris agent processes it within the context of the **active project directory**. The agent can read any file in the project — so files you add become the agent's knowledge base.

### Setting Up Custom Knowledge

#### Step 1: Create a Knowledge Directory

In your project, create a directory for your domain knowledge:

```
my-project/
├── knowledge/
│   ├── product-manual.md
│   ├── faq.md
│   ├── pricing-guide.md
│   ├── troubleshooting.md
│   └── company-policies.md
├── data/
│   ├── product-catalog.csv
│   └── specifications.json
└── ...
```

#### Step 2: Add Knowledge Files

Add files that contain the expertise you want your bot to have:

- **Markdown files** (`.md`) — Best for structured knowledge, guides, FAQs
- **Text files** (`.txt`) — Plain text documentation
- **CSV/JSON files** — Structured data the agent can query
- **Code files** — If your bot helps with specific codebases or APIs
- **PDF/DOCX** — The agent can read these with its built-in tools

#### Step 3: Create a System Context File (Optional but Recommended)

Create a file called `AGENT_CONTEXT.md` (or similar) in your project root:

```markdown
# Bot Context

## Who Am I
You are a customer support assistant for Acme Corp.
You help users with product questions, troubleshooting, and account issues.

## Knowledge Base
- Product documentation: knowledge/product-manual.md
- FAQ: knowledge/faq.md
- Pricing: knowledge/pricing-guide.md
- Troubleshooting: knowledge/troubleshooting.md

## Rules
- Always be helpful and professional
- If you don't know the answer, say so and suggest contacting support@acme.com
- Never share internal pricing formulas
- Always reference the product manual when answering technical questions

## Product Catalog
The full product catalog is in data/product-catalog.csv
```

The agent will discover and use this file as guidance for answering questions.

### Examples

#### Customer Support Bot
```
support-bot-project/
├── AGENT_CONTEXT.md          # "You are Acme Support Bot"
├── knowledge/
│   ├── product-docs.md       # Full product documentation
│   ├── faq.md                # Common questions & answers
│   ├── troubleshooting.md    # Step-by-step troubleshooting guides
│   └── return-policy.md      # Return and refund policies
└── data/
    └── known-issues.csv      # Known bugs and workarounds
```

#### Educational Tutor Bot
```
tutor-bot-project/
├── AGENT_CONTEXT.md          # "You are a math tutor for grades 9-12"
├── curriculum/
│   ├── algebra.md            # Algebra concepts and examples
│   ├── geometry.md           # Geometry theorems and proofs
│   ├── calculus-intro.md     # Introduction to calculus
│   └── practice-problems.md  # Practice problems with solutions
└── resources/
    ├── formula-sheet.md      # Quick reference formulas
    └── study-tips.md         # Study strategies
```

#### Code Review Bot
```
code-review-project/
├── AGENT_CONTEXT.md          # "You review code for best practices"
├── standards/
│   ├── style-guide.md        # Company coding style guide
│   ├── security-checklist.md # Security review checklist
│   ├── performance-tips.md   # Performance optimization patterns
│   └── api-conventions.md    # API design conventions
└── examples/
    ├── good-patterns.md      # Examples of good code
    └── anti-patterns.md      # Common mistakes to flag
```

#### Legal Advisor Bot
```
legal-bot-project/
├── AGENT_CONTEXT.md          # "You help with contract questions"
├── templates/
│   ├── nda-template.md       # NDA template and guidance
│   ├── service-agreement.md  # Service agreement template
│   └── terms-of-service.md   # ToS template
└── knowledge/
    ├── contract-basics.md    # Contract law fundamentals
    ├── common-clauses.md     # Explanation of common clauses
    └── red-flags.md          # Things to watch out for
```

### Tips for Effective Knowledge Bases

1. **Use Markdown** — It's the most agent-friendly format
2. **Be structured** — Use headings, lists, and clear sections
3. **Be comprehensive** — Include everything the agent needs to answer questions
4. **Update regularly** — Keep knowledge files current
5. **Test with real questions** — Send test questions to your bot and refine the knowledge based on gaps
6. **Use the AGENT_CONTEXT.md pattern** — Give the agent clear instructions on its role and behavior
7. **Organize by topic** — Use directories to group related knowledge
8. **Include examples** — Concrete examples help the agent give better answers

---

## Agent-Assisted Setup

The Solaris agent can help you set up and configure your Telegram bot. This is the easiest way for less technical users to get started.

### How It Works

When the `telegram-setup` skill is enabled, you can ask the Solaris agent to configure your Telegram bot. The agent will:

1. Ask you questions to understand your goals
2. Configure settings using built-in tools
3. Create and modify subscription plans
4. Set up access control
5. Guide you through external steps (like creating a bot with BotFather)

### Example Conversations

#### Personal Setup
> **You:** "Set up a Telegram bot for personal use"  
> **Agent:** "I'll help you set up a personal Telegram bot. First, do you already have a bot token from @BotFather?"  
> **You:** "No"  
> **Agent:** "Here's how to create one: [step-by-step guide]. Once you have the token, paste it here."  
> **You:** "Here it is: 123456:ABC..."  
> **Agent:** "I've configured your bot with these settings: [summary]. Generating a pairing code now..."

#### Team Setup
> **You:** "I need a bot for my team of 8 developers"  
> **Agent:** "I'll set up a team bot. A few questions: (1) Should all team members have equal access? (2) Do you want usage tracking? (3) Should I create invite links for easy onboarding?"

#### SaaS Setup
> **You:** "I want to build a paid customer support bot using my product docs"  
> **Agent:** "Great! I'll set up a monetized bot. Let me ask a few things: (1) What's your product/service? (2) What pricing model do you prefer — freemium, pay-per-use, or premium? (3) Do you have a Stripe account? (4) Where are your product documentation files?"

### What the Agent Can Configure

- Enable/disable the Telegram integration
- Set access mode (open, whitelist, approval)
- Enable/disable monetization
- Create, modify, and delete subscription plans
- Set pricing (fiat via Stripe and/or Telegram Stars)
- Configure processing indicators and reaction lifecycle
- Set concurrent AI limits
- Write custom welcome messages
- Guide you through BotFather setup
- Help you create a custom knowledge base

### What Requires Manual Action

- Creating the bot with @BotFather (external to Solaris)
- Setting up a Stripe account (external)
- Pairing your Telegram account (must be done in Telegram)
- Sharing invite/plan links (you choose where to share)

---

## Access Control Modes

### 🔒 Whitelist Mode (Default)

Only users you explicitly authorize can use the bot.

**Best for**: Personal use, small teams, consulting clients

**How users join:**
- Pairing code: You generate a code, user sends `/pair CODE`
- Invite link: You generate a link via `/invite`, user clicks it
- Direct add: Agent can programmatically authorize users

### 🌐 Open Mode

Anyone can start using the bot immediately.

**Best for**: Public services, freemium SaaS, viral growth

**How it works:**
- New users get auto-registered on the Free plan
- No approval needed — they start chatting immediately
- Usage limits on the Free plan encourage upgrades

### ✋ Approval Mode

Users can try the bot, but you must approve them for continued access.

**Best for**: Premium services, gated communities, quality control

**How it works:**
- New users get 5 trial messages
- After the trial, they're prompted to wait for approval or subscribe
- You approve/deny in Settings or via `/admin`
- If **Auto-Approve on Payment** is enabled, paying users are auto-approved

---

## Monetization & Payments

### Payment Methods

Solaris supports two payment methods:

#### Stripe (Fiat Currency)
- Supports USD, EUR, GBP, CAD, AUD
- Requires a Stripe account and Provider Token from BotFather
- Best for: Subscriptions, B2B services

**Setup:**
1. Create a [Stripe account](https://stripe.com)
2. In Telegram, message @BotFather → `/mybots` → Your bot → Payments → Stripe
3. Follow the Stripe connection flow
4. Copy the Provider Token (format: `284685063:TEST:xxxx`)
5. Paste in Solaris Settings → Telegram → Stripe Provider Token

#### Telegram Stars (Digital Currency)
- Built into Telegram — no external account needed
- Users purchase Stars via in-app purchase (Apple Pay, Google Pay)
- Best for: Consumer apps, mobile-first audiences
- Currency code: XTR

**Setup:** No setup needed — Stars payments work automatically.

### Dual Payment Support

Plans can accept both Stripe and Stars payments. Each plan has:
- `price_cents` — Price in fiat currency (e.g., 500 = $5.00)
- `price_stars` — Price in Telegram Stars (e.g., 50 Stars)
- `payment_method` — `"stripe"`, `"stars"`, or `"both"`

Users choose their preferred payment method when subscribing.

---

## Deep Links & Onboarding

### What Are Deep Links?

Deep links are special URLs that take users directly to your bot with a specific action. They make onboarding frictionless.

### Types of Deep Links

#### Bot Link (Basic)
```
https://t.me/YOUR_BOT
```
Opens your bot. User must manually /start.

#### Plan Link
```
https://t.me/YOUR_BOT?start=plan_pro
```
Opens your bot and immediately shows the Pro plan invoice. User can pay and get instant access.

#### Invite Link
```
https://t.me/YOUR_BOT?start=inv_ABC123
```
Opens your bot and auto-registers the user using the invite code. Has a configurable usage limit.

### Generating Links

**In Telegram (as bot owner):**
```
/invite 50 basic
```
Generates an invite link that allows 50 users to join on the Basic plan.

**In Settings:**
The bot username and shareable link templates are shown in Settings → Telegram → Onboarding & Links.

### Auto-Approve on Payment

When enabled, users who arrive via a plan deep link and complete payment are automatically granted bot access — even in Whitelist or Approval mode. This enables fully automated paid onboarding.

**Flow:**
1. User clicks `https://t.me/YOUR_BOT?start=plan_pro`
2. Bot sends a payment invoice
3. User pays
4. User is auto-approved and registered
5. Bot sends welcome message

---

## Processing Indicators & Queue

### Typing Indicator

When enabled, the bot shows "typing..." continuously while the AI processes a message. This reassures users that their message is being handled.

- Automatically refreshes every 4 seconds (Telegram typing status lasts ~5 seconds)
- Stops when the response is sent or an error occurs

### Reaction Lifecycle

When enabled, the bot sets emoji reactions on the user's message to show processing stages:

| Stage | Emoji | Meaning |
|-------|-------|---------|
| Received | 👀 | Message acknowledged |
| Thinking | 🤔 | AI is processing |
| Working | 👨‍💻 | Agent is using tools |
| Done | ✅ | Response complete |
| Error | ❌ | Something went wrong |

### AI Request Queue

Controls how many users can have active AI sessions simultaneously.

- **Max Concurrent AI Requests**: 1-10 (default: 3)
- When the limit is reached, additional users are queued
- Queued users see their position: "⏳ You're #2 in the queue"
- Requests are processed FIFO (first in, first out)

**Tuning tips:**
- Personal use: 1-2
- Small team: 3-5
- SaaS with many users: 5-10

---

## Subscription Plans

### Default Plans

| Plan | Fiat Price | Stars Price | Messages | Billing |
|------|-----------|-------------|----------|---------|
| Free | $0 | 0 | 20/day | Daily |
| Basic | $5/mo | 50 Stars | 500/month | Monthly |
| Pro | $20/mo | 200 Stars | 2,000/month | Monthly |
| Enterprise | $50/mo | 500 Stars | Unlimited | Monthly |

### Plan Properties

Each plan has:
- **ID**: Unique identifier (e.g., `free`, `basic`, `pro`)
- **Name**: Display name shown to users
- **Description**: What the plan includes
- **Price (cents)**: Fiat price in cents (500 = $5.00)
- **Price (Stars)**: Telegram Stars price
- **Currency**: USD, EUR, GBP, etc.
- **Message Limit**: Messages per period (-1 = unlimited)
- **Billing Period**: `daily` or `monthly`
- **Payment Method**: `stripe`, `stars`, or `both`
- **Active**: Whether the plan is available for purchase
- **Sort Order**: Display order in plan listings

### Customizing Plans

Plans can be customized via:
1. **The Solaris agent** — Ask "Create a plan called Premium at $29/month with 1000 messages"
2. **Telegram admin commands** — Use `/admin` → Plans
3. **Direct database** — Advanced users can edit the SQLite database

---

## User Management

### User Roles

- **Owner** (👑): The first user who pairs. Unlimited access, all admin commands.
- **Subscribed Users**: Paying users with plan-based limits.
- **Free Users**: Users on the Free plan with daily limits.
- **Blocked Users**: Denied access, see "Your access has been restricted."

### Managing Users

**In Settings:**
Settings → Telegram → Enterprise Features → Bot Users
- See all users with username, tier, messages used
- Block/Unblock individual users

**In Telegram (Owner commands):**
- `/users` — Quick user summary (total, active, paying)
- `/admin` → Users — Detailed user analytics
- `/broadcast <message>` — Send a message to all users

---

## Bot Commands Reference

### All Users

| Command | Description |
|---------|-------------|
| `/start` | Start the bot / Trigger deep link onboarding |
| `/help` | Show all available commands |
| `/status` | Current session status |
| `/sessions` | List available sessions |
| `/switch <name>` | Switch to a different session |
| `/new <title>` | Create a new session |
| `/stop` | Stop the current session |
| `/project` | Show current project info |
| `/sendfile <name>` | Send a file from the project |
| `/files` | List recent files |
| `/pair <code>` | Pair your account using a 6-digit code |

### Account & Billing (when monetization is enabled)

| Command | Description |
|---------|-------------|
| `/account` | View subscription, usage, and limits |
| `/usage` | Detailed usage statistics |
| `/subscribe` | View and purchase subscription plans |
| `/buy` | Purchase message credits |
| `/limit` | Check remaining message quota (group mode) |

### Group Mode Only

| Command | Description |
|---------|-------------|
| `/ask <question>` | Ask the AI a question |

| Command | Description |
|---------|-------------|
| `/admin` | Admin panel with analytics and controls |
| `/users` | Quick user summary |
| `/revenue` | Revenue report |
| `/broadcast <msg>` | Send message to all users |
| `/invite [max] [plan]` | Generate an invite link |

---

## Analytics & Revenue

### Settings Dashboard

In Settings → Telegram → Enterprise Features:

**Metrics:**
- Total Users
- Active Today
- Paying Users
- Revenue This Month

### Telegram Commands

**User summary:**
```
/users
👥 User Summary
Total users: 142
Active today: 28
Paying users: 19
Messages today: 347
Messages this month: 2,891
```

**Revenue report:**
```
/revenue
💰 Revenue Report
This month: $1,250.00 USD (25 transactions)
All time: $3,750.00 USD (87 transactions)
```

**Admin panel:**
```
/admin
📊 Analytics | 👥 Users | 💰 Revenue | 📋 Plans
```

---

## Troubleshooting

### "You've reached your message limit"

**Cause**: User hit their plan's message cap.
**Fix**: Upgrade via `/subscribe` or buy credits via `/buy`. Owner can also adjust plan limits.

### "Your access has been restricted"

**Cause**: User was blocked by the owner.
**Fix**: Contact the bot owner. Owner can unblock in Settings → Bot Users.

### "Payments not working"

**Cause**: Stripe credentials incorrect or missing.
**Fix**:
1. Verify Provider Token format: `284685063:TEST:xxxx`
2. Make sure Telegram Payments is enabled in your Stripe dashboard
3. Check that currency matches your Stripe account

### "Bot not responding"

**Cause**: Bot not running, token invalid, or polling error.
**Fix**:
1. Check Settings → Telegram — is the bot running?
2. Verify token is correct
3. Click Save to restart the bot
4. If problems persist, use `/revoke` in BotFather and reconfigure with new token

### "AI request queued" for long periods

**Cause**: Max concurrent AI limit reached.
**Fix**: Increase Max Concurrent AI Requests in Settings → Telegram → Processing & Queue.

### Typing indicator doesn't stop

**Cause**: Agent process may have crashed.
**Fix**: Send `/stop` then `/status` to reset. Restart the bot if needed.

### Deep links not working

**Cause**: Bot username not detected or bot not running.
**Fix**: 
1. Verify bot is running in Settings
2. Check bot username is set correctly
3. Test with a simple message first

---

## Security Best Practices

### For Bot Owners

1. **Protect Your Token**
   - Never share your bot token publicly
   - Use environment variables in production
   - Rotate tokens if compromised

2. **Secure Pairing Codes**
   - Codes expire in 5 minutes for security
   - Don't share codes in public channels
   - Use invite links for public onboarding instead

3. **Monitor User Activity**
   - Check `/users` regularly
   - Block suspicious accounts
   - Set appropriate message limits

4. **Payment Security**
   - Use test mode for development
   - Verify webhook signatures in production
   - Keep Stripe account secure with 2FA

### For Users

1. **Verify Bot Authenticity**
   - Check the blue verification checkmark
   - Verify username matches expectations
   - Be wary of bots asking for sensitive info

2. **Protect Your Data**
   - Don't share passwords or private keys
   - Be aware the bot owner can see messages
   - Use ephemeral messages for sensitive content

---

## Bot Owner Setup Checklist

### Pre-Setup

- [ ] Decide on use case (Personal, Team, Group, SaaS)
- [ ] Prepare project knowledge files (if applicable)
- [ ] Set up Stripe account (if monetizing)

### Bot Creation (BotFather)

- [ ] Create bot with `/newbot`
- [ ] Set description with `/setdescription`
- [ ] Set about text with `/setabouttext`
- [ ] Upload profile picture with `/setuserpic`
- [ ] Set privacy mode with `/setprivacy` (DISABLED for groups)
- [ ] Copy the bot token

### Solaris Configuration

- [ ] Paste token in Settings → Telegram
- [ ] Enable integration
- [ ] Choose use case template
- [ ] Configure access mode
- [ ] Set concurrent AI limits
- [ ] Configure notification level

### Post-Setup

- [ ] Generate pairing code
- [ ] Pair your account (become owner)
- [ ] Test basic functionality
- [ ] Configure monetization (if needed)
- [ ] Create custom plans (if needed)
- [ ] Set up custom knowledge (if needed)
- [ ] Generate invite links for users

### Ongoing

- [ ] Monitor user analytics
- [ ] Review revenue reports (if monetized)
- [ ] Update knowledge files regularly
- [ ] Rotate security tokens periodically

---

## Advanced Tips

### Power User Features

1. **Webhook Mode**
   - More reliable than polling for production
   - Requires public HTTPS endpoint
   - Set in Settings → Telegram → Connection Mode

2. **Draft Streaming**
   - Shows real-time message generation
   - Users see responses as they're written
   - Enable in Settings → Telegram → Advanced

3. **Execution Approvals**
   - Require user approval before tool execution
   - Adds security for sensitive operations
   - Configure per-user or globally

4. **Forum/Topic Support**
   - Organize conversations by topic
   - Better for support bots
   - Enable in group settings

### Optimization Tips

1. **Reduce Latency**
   - Use webhook mode for faster responses
   - Optimize agent prompts for quicker execution
   - Set appropriate timeouts

2. **Scale Efficiently**
   - Monitor concurrent AI usage
   - Adjust limits based on user patterns
   - Use queue management for high traffic

3. **Improve UX**
   - Enable processing indicators
   - Set clear welcome messages
   - Use reaction lifecycle for feedback

### Integration Ideas

1. **Connect to External Services**
   - Use webhooks to trigger from GitHub, Stripe, etc.
   - Forward notifications to other channels
   - Sync with CRM systems

2. **Build Workflows**
   - Auto-respond to common questions
   - Escalate to human when needed
   - Collect user feedback automatically

3. **Analytics Automation**
   - Track user engagement
   - Generate daily/weekly reports
   - Identify popular features

---

*End of Guide — Happy Bot Building! 🤖*
