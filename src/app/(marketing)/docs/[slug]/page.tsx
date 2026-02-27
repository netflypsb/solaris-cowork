import Link from "next/link";
import { notFound } from "next/navigation";
import { DOCS_PAGES } from "@/config/docs";
import { getMarkdownContent, extractHeadings } from "@/lib/markdown";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export async function generateStaticParams() {
  return DOCS_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = DOCS_PAGES.find((p) => p.slug === params.slug);
  if (!page) return { title: "Not Found" };
  return {
    title: `${page.title} — Solaris Docs`,
    description: page.description,
  };
}

export default function DocPage({ params }: { params: { slug: string } }) {
  const page = DOCS_PAGES.find((p) => p.slug === params.slug);
  if (!page) notFound();

  const content = getMarkdownContent("docs", page.file);
  const headings = extractHeadings(content);
  const currentIndex = DOCS_PAGES.findIndex((p) => p.slug === params.slug);
  const prevPage = currentIndex > 0 ? DOCS_PAGES[currentIndex - 1] : null;
  const nextPage =
    currentIndex < DOCS_PAGES.length - 1 ? DOCS_PAGES[currentIndex + 1] : null;

  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto flex gap-8">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-28">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Documentation
            </h3>
            <nav className="space-y-1">
              {DOCS_PAGES.map((p) => (
                <Link
                  key={p.slug}
                  href={`/docs/${p.slug}`}
                  className={`block text-sm py-1.5 px-3 rounded-lg transition-colors ${
                    p.slug === params.slug
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-400 hover:text-white hover:bg-surface"
                  }`}
                >
                  {p.title}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <Link
              href="/docs"
              className="text-sm text-primary hover:text-primary-hover transition-colors"
            >
              &larr; All Documentation
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{page.title}</h1>
          <p className="text-gray-400 mb-8">{page.description}</p>

          <MarkdownRenderer content={content} />

          {/* Prev/Next Navigation */}
          <div className="mt-16 pt-8 border-t border-border flex justify-between">
            {prevPage ? (
              <Link
                href={`/docs/${prevPage.slug}`}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                &larr; {prevPage.title}
              </Link>
            ) : (
              <div />
            )}
            {nextPage ? (
              <Link
                href={`/docs/${nextPage.slug}`}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {nextPage.title} &rarr;
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Right Sidebar - Table of Contents */}
        <aside className="hidden xl:block w-56 flex-shrink-0">
          <div className="sticky top-28">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              On this page
            </h3>
            <nav className="space-y-1">
              {headings
                .filter((h) => h.level <= 3)
                .map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={`block text-sm text-gray-400 hover:text-white transition-colors py-0.5 ${
                      heading.level === 3 ? "pl-4" : ""
                    }`}
                  >
                    {heading.text}
                  </a>
                ))}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
