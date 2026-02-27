import fs from "fs";
import path from "path";

export function getMarkdownContent(dir: string, filename: string): string {
  const filePath = path.join(process.cwd(), "content", dir, filename);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return `# Content Not Found\n\nThe requested document "${filename}" could not be found.`;
  }
}

export function extractHeadings(
  markdown: string
): Array<{ level: number; text: string; id: string }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string; id: string }> = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2],
      id: match[2]
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    });
  }
  return headings;
}

export function estimateReadingTime(markdown: string): number {
  const words = markdown.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
