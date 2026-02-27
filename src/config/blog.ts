export const BLOG_POSTS = [
  {
    slug: "agent-3-0",
    title: 'The Rise of Agent 3.0: How "Coworker" Agents Are Redefining AI',
    date: "2026-02-26",
    author: "Solaris Team",
    excerpt:
      "The AI agent landscape has evolved rapidly. Agent 3.0 represents something fundamentally different — it's not just smarter, it's a coworker.",
    file: "blog-agent-3.0.md",
    tags: ["AI Agents", "Agent 3.0", "Technology"],
    featured: true,
  },
  {
    slug: "introducing-solaris",
    title: "Introducing Solaris: One AI to Replace All Your Software",
    date: "2026-02-26",
    author: "Solaris Team",
    excerpt:
      "What if you could replace your project management tool, your wiki, your design software, your learning platform, and your creative suite — all with a single application?",
    file: "blog-introduction-to-solaris.md",
    tags: ["Product", "Launch", "Features"],
    featured: true,
  },
] as const;

export type BlogPost = (typeof BLOG_POSTS)[number];
