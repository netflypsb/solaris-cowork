"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <article className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white prose-a:text-primary hover:prose-a:text-primary-hover prose-code:text-indigo-300 prose-code:bg-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-surface prose-pre:border prose-pre:border-border prose-hr:border-border prose-th:text-white prose-td:text-gray-300 prose-blockquote:border-primary prose-blockquote:text-gray-400 prose-img:rounded-lg">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
