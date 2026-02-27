import Link from "next/link";
import { DOCS_PAGES } from "@/config/docs";
import {
  Rocket,
  MessageSquare,
  ClipboardList,
  Sparkles,
  Wrench,
  Plug,
  Settings,
  GraduationCap,
  Layers,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  MessageSquare,
  ClipboardList,
  Sparkles,
  Wrench,
  Plug,
  Settings,
  GraduationCap,
  Layers,
};

const categories = Array.from(new Set(DOCS_PAGES.map((p) => p.category)));

export default function DocsIndexPage() {
  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
        <p className="text-lg text-gray-400 mb-12 max-w-2xl">
          Everything you need to know about using Solaris — from getting started
          to advanced configuration.
        </p>

        {categories.map((category) => (
          <div key={category} className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-border pb-2">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DOCS_PAGES.filter((p) => p.category === category).map((page) => {
                const Icon = iconMap[page.icon] || Rocket;
                return (
                  <Link
                    key={page.slug}
                    href={`/docs/${page.slug}`}
                    className="group p-5 rounded-xl bg-surface border border-border hover:border-primary/50 transition-all"
                  >
                    <Icon className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold text-white mb-1 group-hover:text-primary transition-colors">
                      {page.title}
                    </h3>
                    <p className="text-sm text-gray-400">{page.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
