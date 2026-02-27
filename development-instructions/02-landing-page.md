# 02 — Landing Page

## Overview

The landing page is the first impression. It must communicate Solaris's core value proposition — **one AI to replace all your software** — and convert visitors into subscribers.

**File location**: `apps/nextjs/app/(marketing)/page.tsx`

---

## Page Structure

The landing page consists of these sections (top to bottom):

### 1. Navigation Bar
- **Logo**: `solaris.jpg` on the left
- **Nav links**: Features, Docs, Blog, Download, Pricing
- **CTA buttons**: Sign In (ghost), Get Started (primary)
- Sticky on scroll, transparent on top, blurred background when scrolled

### 2. Hero Section
- **Headline**: "One AI to Replace All Your Software"
- **Subheadline**: "Solaris is the AI-powered workspace that combines project management, documentation, design, learning, and creative tools — all with one unified AI that understands your entire project."
- **CTA buttons**: "Get Started Free" (primary), "View Documentation" (secondary)
- **Hero image**: `1.dashboard1.png` — the Solaris dashboard screenshot, displayed in a browser mockup frame with subtle glow/shadow
- Animated entrance using Framer Motion

### 3. Social Proof / Stats Bar
- "Built on Agent 3.0 Architecture"
- "170+ AI Skills"
- "5 Integrated Hubs"
- "Unlimited Projects"
- Displayed as a row of stat cards with icons

### 4. Problem Statement Section
- **Headline**: "Your Tools Are Scattered. Your AI Is Siloed."
- **Body**: Describe the pain of context switching between 9-12 SaaS tools
- **Visual**: Grid showing logos/icons of tools Solaris replaces (Notion, Trello, Figma, Canva, ChatGPT, etc.) with arrows pointing to Solaris logo
- Animated on scroll

### 5. Features Grid Section
- **Headline**: "Everything You Need. One Workspace."
- Six feature cards, each with:
  - Icon (Lucide icon)
  - Title
  - Description
  - Screenshot thumbnail

| Feature | Icon | Screenshot |
|---------|------|-----------|
| AI Chat & Tasks | `MessageSquare` | `1.dashboard1.png` |
| Project Board | `ClipboardList` | `1.dashboard2.png` |
| Knowledge Base | `BookOpen` | — |
| Learning Hub | `GraduationCap` | `2.learning-hub.png` |
| Creative Hub | `Palette` | `3.creative-hub.png` |
| 170+ AI Skills | `Sparkles` | — |

### 6. Screenshot Showcase Section
- **Headline**: "See Solaris in Action"
- Large tabbed showcase:
  - Tab 1: "Dashboard" → `1.dashboard1.png`
  - Tab 2: "Learning Hub" → `2.learning-hub.png`
  - Tab 3: "Creative Hub" → `3.creative-hub.png`
  - Tab 4: "Settings" → `4.settings.png`
- Each tab click animates in the corresponding screenshot
- Descriptions below each screenshot

### 7. Agent 3.0 Section
- **Headline**: "Powered by Agent 3.0 Architecture"
- **Subheadline**: "Not just another chatbot. Solaris is a Coworker Agent."
- Three columns explaining the evolution:
  - Agent 1.0: Simple chatbots → Agent 2.0: Deep Agents → **Agent 3.0: Coworker Agents**
- Key capabilities: Near-infinite context, Autonomous task completion, Higher accuracy
- Link to "Read the Agent 3.0 blog post →"

### 8. How It Works Section
- **Headline**: "Get Started in 3 Steps"
- Three-step flow:
  1. **Download & Install** — "Get Solaris for Windows or macOS in seconds"
  2. **Connect Your AI** — "Add your API key from OpenRouter, Anthropic, OpenAI, or others"
  3. **Start Working** — "Open a project and let your AI coworker handle the rest"
- Animated step progression

### 9. Pricing Section
- **Headline**: "Simple, Transparent Pricing"
- Two pricing cards:

**Free Tier**:
- $0/month
- 50 credits/month
- Basic AI chat
- Community support
- CTA: "Get Started Free"

**Solaris Pro**:
- $10/month (highlighted/recommended)
- 1,000 credits/month
- All AI features & hubs
- All 170+ skills
- MCP connectors
- Sandbox code execution
- Browser automation
- Priority support
- CTA: "Subscribe Now"

- Toggle for monthly/yearly (yearly = $8/mo, $96/year)

### 10. FAQ Section
- **Headline**: "Frequently Asked Questions"
- Accordion items:
  - "What AI models does Solaris support?"
  - "Is my data private?"
  - "What are credits and how do they work?"
  - "Can I use Solaris offline?"
  - "What platforms does Solaris support?"
  - "How do I add custom skills?"
  - "Can I cancel my subscription?"

### 11. CTA Section
- **Headline**: "Ready to Work Smarter?"
- **Subheadline**: "Join thousands of professionals who've replaced their entire toolbox with Solaris."
- **CTA button**: "Get Started Now" (large, primary)
- Gradient background

### 12. Footer
- **Logo + tagline**: "Solaris — One AI to Replace All Software"
- **Link columns**:
  - Product: Features, Pricing, Download, Changelog
  - Resources: Documentation, Blog, Community, Support
  - Company: About, Contact, Privacy Policy, Terms of Service
- **Social links**: GitHub, Twitter/X, Discord
- **Copyright**: © 2026 Solaris Cowork

---

## Implementation Notes

### Saasfly Customization
Saasfly provides a marketing page structure. Modify:
- `apps/nextjs/app/(marketing)/page.tsx` — Main landing page
- `apps/nextjs/config/marketing.ts` — Navigation and marketing config
- `apps/nextjs/config/site.ts` — Site metadata (name, description, URLs)

### Brand Colors
Use a consistent color palette across the landing page:
- **Primary**: Indigo/violet gradient (`#6366f1` → `#8b5cf6`)
- **Accent**: Emerald green for CTAs (`#10b981`)
- **Background**: Dark mode default (`#0a0a0f`)
- **Surface**: Subtle gray (`#1a1a2e`)
- **Text**: White primary, gray-400 secondary

### Animations
Use Framer Motion for:
- Hero section entrance (fade up + scale)
- Stats bar count-up animation
- Feature cards stagger animation on scroll
- Screenshot tab transitions
- How-it-works step progression

### Responsive Design
- Mobile-first approach
- Hero image stacks below text on mobile
- Feature grid: 1 column mobile, 2 tablet, 3 desktop
- Pricing cards stack on mobile
- Navigation collapses to hamburger menu

### SEO
Update `apps/nextjs/app/(marketing)/layout.tsx` metadata:
```typescript
export const metadata = {
  title: 'Solaris — One AI to Replace All Your Software',
  description: 'Solaris is the AI-powered workspace that combines project management, documentation, design, learning, and creative tools with one unified AI.',
  openGraph: {
    title: 'Solaris — One AI to Replace All Your Software',
    description: 'The AI coworker that replaces your entire toolbox.',
    images: ['/assets/1.dashboard1.png'],
  },
};
```

---

## Next Steps
→ [03-public-pages.md](./03-public-pages.md) — Build the documentation, download, blog, and about pages
