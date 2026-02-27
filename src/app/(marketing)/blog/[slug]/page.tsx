import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/config/blog";
import { getMarkdownContent, estimateReadingTime } from "@/lib/markdown";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Calendar, User, Clock, ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} — Solaris Blog`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const content = getMarkdownContent("blog", post.file);
  const readingTime = estimateReadingTime(content);

  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to Blog
        </Link>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <User size={14} />
              {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {readingTime} min read
            </span>
          </div>
        </div>

        <MarkdownRenderer content={content} />

        {/* CTA Banner */}
        <div className="mt-16 p-8 rounded-xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 border border-primary/30 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Try Solaris Today
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Experience the AI coworker that replaces your entire toolbox.
          </p>
          <Link
            href="/download"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors text-sm"
          >
            Download Solaris
          </Link>
        </div>
      </div>
    </div>
  );
}
