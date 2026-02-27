# 03 — Public Pages

## Overview

These pages are accessible without authentication. They serve marketing, education, and distribution purposes.

---

## 1. Documentation Pages

**Route**: `/docs` and `/docs/[slug]`

### Documentation Index Page (`/docs`)

**File**: `apps/nextjs/app/(marketing)/docs/page.tsx`

A grid/list of all documentation pages with:
- Search bar at the top
- Sidebar navigation with categories
- Card grid showing each guide with title, description, and icon

### Categories & Pages

| Category | Pages |
|----------|-------|
| **Getting Started** | Getting Started Guide |
| **Core Features** | AI Chat & Tasks, Project Board / Wiki / Visual Editor |
| **Skills** | Skills Guide, Creating Custom Skills |
| **Integrations** | MCP Connectors Guide |
| **Configuration** | Settings & Configuration |
| **Hubs** | Learning Hub & Creative Hub |
| **Advanced** | Unified AI Platform Guide |

### Documentation Page Layout (`/docs/[slug]`)

**File**: `apps/nextjs/app/(marketing)/docs/[slug]/page.tsx`

Each doc page renders a Markdown file from `apps/nextjs/content/docs/` with:
- Left sidebar navigation (all doc pages with active highlighting)
- Main content area with rendered Markdown
- Right sidebar with table of contents (auto-generated from headings)
- Previous/Next navigation at the bottom
- "Edit on GitHub" link (optional)

### Markdown Rendering

Use `react-markdown` with plugins:
```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// In the component:
<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {markdownContent}
</ReactMarkdown>
```

Style the rendered Markdown with Tailwind's `prose` class:
```tsx
<article className="prose prose-invert prose-lg max-w-none">
  <ReactMarkdown ...>{content}</ReactMarkdown>
</article>
```

### Slug Mapping

Create a mapping file `apps/nextjs/config/docs.ts`:

```typescript
export const DOCS_PAGES = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Installation, setup, and your first session',
    category: 'Getting Started',
    file: 'getting-started-guide.md',
    icon: 'Rocket',
  },
  {
    slug: 'chat-tasks',
    title: 'AI Chat & Tasks',
    description: 'Master the conversation system',
    category: 'Core Features',
    file: 'chat-tasks-guide.md',
    icon: 'MessageSquare',
  },
  {
    slug: 'project-management',
    title: 'Project Board, Wiki & Visual Editor',
    description: 'Task management, documentation, and design tools',
    category: 'Core Features',
    file: 'user-guide.md',
    icon: 'ClipboardList',
  },
  {
    slug: 'skills',
    title: 'Skills',
    description: 'AI skill modules for specialized tasks',
    category: 'Skills',
    file: 'skills-guide.md',
    icon: 'Sparkles',
  },
  {
    slug: 'custom-skills',
    title: 'Creating Custom Skills',
    description: 'Build your own domain-specific AI skills',
    category: 'Skills',
    file: 'custom-skills-guide.md',
    icon: 'Wrench',
  },
  {
    slug: 'mcp-connectors',
    title: 'MCP Connectors',
    description: 'Connect to external tools and services',
    category: 'Integrations',
    file: 'mcp-connectors-guide.md',
    icon: 'Plug',
  },
  {
    slug: 'settings',
    title: 'Settings & Configuration',
    description: 'API providers, sandbox, credentials, and more',
    category: 'Configuration',
    file: 'settings-guide.md',
    icon: 'Settings',
  },
  {
    slug: 'learning-creative-hubs',
    title: 'Learning Hub & Creative Hub',
    description: 'AI-powered learning and creative content generation',
    category: 'Hubs',
    file: 'learning-creative-hubs-guide.md',
    icon: 'GraduationCap',
  },
  {
    slug: 'unified-platform',
    title: 'Unified AI Platform',
    description: 'How all features work together with shared context',
    category: 'Advanced',
    file: 'unified-platform-guide.md',
    icon: 'Layers',
  },
] as const;
```

---

## 2. Download Page

**Route**: `/download`
**File**: `apps/nextjs/app/(marketing)/download/page.tsx`

### Layout

- **Headline**: "Download Solaris"
- **Subheadline**: "Available for Windows and macOS"

### Platform Cards

Two large cards side by side:

**Windows Card**:
- Windows logo icon
- "Solaris for Windows"
- "Windows 10/11 (64-bit)"
- Version number (e.g., "v0.1.2")
- File size
- **Download button** → Links to the installer `.exe` file
- System requirements listed below

**macOS Card**:
- Apple logo icon
- "Solaris for macOS"
- "macOS 12+ (Apple Silicon & Intel)"
- Version number
- File size
- **Download button** → Links to the `.dmg` file
- System requirements listed below

### Installer Hosting

Options for hosting the installer files:
1. **GitHub Releases** — Host installers on the solaris-cowork GitHub repo releases page. Link download buttons to the GitHub release assets.
2. **Vercel Blob Storage** — Upload installers to Vercel Blob and link to them.
3. **S3/R2** — Use AWS S3 or Cloudflare R2 for CDN-backed hosting.

**Recommendation**: Use GitHub Releases for simplicity. The download button links to `https://github.com/your-org/solaris-cowork/releases/latest/download/solaris-cowork-setup.exe` (and `.dmg` for macOS).

### Installation Instructions

Below the download cards, show quick installation steps:

1. Download the installer for your platform
2. Run the installer
3. Launch Solaris and configure your AI provider
4. Open a project and start working

### Additional Info
- "Requires an API key from OpenRouter, Anthropic, OpenAI, or xAI"
- Link to Getting Started documentation
- Changelog link

---

## 3. Blog Pages

**Route**: `/blog` and `/blog/[slug]`

### Blog Index Page (`/blog`)

**File**: `apps/nextjs/app/(marketing)/blog/page.tsx`

- **Headline**: "Blog"
- **Subheadline**: "Insights, updates, and deep dives into AI agent technology"
- Grid of blog post cards, each showing:
  - Featured image or gradient placeholder
  - Title
  - Publication date
  - Short excerpt (first 150 characters)
  - "Read more →" link
  - Tags/categories

### Blog Post Page (`/blog/[slug]`)

**File**: `apps/nextjs/app/(marketing)/blog/[slug]/page.tsx`

Each blog post renders a Markdown file from `apps/nextjs/content/blog/` with:
- Full-width header with title, date, author, and reading time
- Rendered Markdown content with `prose` styling
- Share buttons (Twitter, LinkedIn, copy link)
- Related posts section at the bottom
- CTA banner: "Try Solaris today →"

### Initial Blog Posts

| Slug | Title | File |
|------|-------|------|
| `agent-3-0` | The Rise of Agent 3.0: How "Coworker" Agents Are Redefining AI | `blog-agent-3.0.md` |
| `introducing-solaris` | Introducing Solaris: One AI to Replace All Your Software | `blog-introduction-to-solaris.md` |

### Blog Configuration

Create `apps/nextjs/config/blog.ts`:

```typescript
export const BLOG_POSTS = [
  {
    slug: 'agent-3-0',
    title: 'The Rise of Agent 3.0: How "Coworker" Agents Are Redefining AI',
    date: '2026-02-26',
    author: 'Solaris Team',
    excerpt: 'The AI agent landscape has evolved rapidly. Agent 3.0 represents something fundamentally different — it\'s not just smarter, it\'s a coworker.',
    file: 'blog-agent-3.0.md',
    tags: ['AI Agents', 'Agent 3.0', 'Technology'],
    featured: true,
  },
  {
    slug: 'introducing-solaris',
    title: 'Introducing Solaris: One AI to Replace All Your Software',
    date: '2026-02-26',
    author: 'Solaris Team',
    excerpt: 'What if you could replace your project management tool, your wiki, your design software, your learning platform, and your creative suite — all with a single application?',
    file: 'blog-introduction-to-solaris.md',
    tags: ['Product', 'Launch', 'Features'],
    featured: true,
  },
] as const;
```

---

## 4. About Page

**Route**: `/about`
**File**: `apps/nextjs/app/(marketing)/about/page.tsx`

### Sections

**Hero**:
- "About Solaris"
- "Building the future of AI-powered work"

**Mission**:
- "We believe the future of software isn't more tools — it's smarter integration."
- Explain the vision: one AI workspace that replaces fragmented SaaS
- Reference the unified platform concept

**The Problem We're Solving**:
- Context switching between tools wastes hours daily
- AI assistants are siloed and lack project context
- Software subscriptions add up but don't work together

**Our Approach**:
- Agent 3.0 architecture for true AI coworker capability
- Local-first, privacy-respecting design
- Extensible through skills and MCP connectors
- Bring your own AI model — no vendor lock-in

**Technology**:
- Built with Electron, React, TypeScript
- Powered by Claude, GPT, Grok, and any compatible model
- Extended via Model Context Protocol (MCP)
- 170+ built-in AI skills

**Open Source & Community**:
- Solaris is MIT licensed
- GitHub repository link
- Contribution guidelines
- Community Discord/forum links

**Contact**:
- Email
- GitHub Issues for bug reports
- Community channels

---

## Implementation Notes

### Shared Layout
All public pages share the marketing layout with:
- Navigation bar (same as landing page)
- Footer (same as landing page)
- Consistent styling and spacing

**File**: `apps/nextjs/app/(marketing)/layout.tsx`

### Static Generation
Documentation and blog pages should use `generateStaticParams` for SSG:

```typescript
export async function generateStaticParams() {
  return DOCS_PAGES.map((page) => ({ slug: page.slug }));
}
```

### Markdown Processing Utility

Create a shared utility `apps/nextjs/lib/markdown.ts`:

```typescript
import fs from 'fs';
import path from 'path';

export function getMarkdownContent(dir: string, filename: string): string {
  const filePath = path.join(process.cwd(), 'content', dir, filename);
  return fs.readFileSync(filePath, 'utf-8');
}

export function extractHeadings(markdown: string): Array<{ level: number; text: string; id: string }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string; id: string }> = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2],
      id: match[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    });
  }
  return headings;
}
```

---

## Next Steps
→ [04-protected-pages.md](./04-protected-pages.md) — Build the user dashboard, subscription, and credits pages
