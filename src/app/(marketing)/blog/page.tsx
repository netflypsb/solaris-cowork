import Link from "next/link";
import { BLOG_POSTS } from "@/config/blog";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function BlogIndexPage() {
  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
        <p className="text-lg text-gray-400 mb-12">
          Insights, updates, and deep dives into AI agent technology
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-xl bg-surface border border-border hover:border-primary/50 transition-all overflow-hidden"
            >
              <div className="h-40 bg-gradient-to-br from-primary/20 via-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                <span className="text-4xl font-bold text-primary/30">S</span>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="text-sm text-primary flex items-center gap-1">
                    Read <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
