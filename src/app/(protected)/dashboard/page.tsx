import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import {
  BookOpen,
  Download,
  Newspaper,
  MessageSquare,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.firstName || "there"}!
        </h1>
        <p className="text-gray-400">
          Download Solaris, explore the docs, and share your feedback with us.
        </p>
      </div>

      {/* Desktop App Download */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border border-primary/30">
        <div className="flex items-start gap-4">
          <Download className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">
              Get Started with Solaris
            </h2>
            <p className="text-gray-400 mb-4">
              Download the desktop app to start working with your AI coworker.
              Use it with your own API keys for unlimited usage.
            </p>
            <Link
              href="/download"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download size={16} />
              Download Solaris v0.1.3
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: BookOpen,
            title: "Documentation",
            description: "Learn how to use Solaris",
            href: "/docs",
          },
          {
            icon: Download,
            title: "Download",
            description: "Get the latest version",
            href: "/download",
          },
          {
            icon: Newspaper,
            title: "Blog",
            description: "Read the latest updates",
            href: "/blog",
          },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group p-5 rounded-xl bg-surface border border-border hover:border-primary/50 transition-all"
          >
            <item.icon className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-gray-400">{item.description}</p>
          </Link>
        ))}
      </div>

      {/* Contact Form */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-white">
            Contact the Developers
          </h2>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Have a feature request, suggestion, or feedback? Send us a message and
          we&apos;ll get back to you as soon as possible.
        </p>
        <ContactForm userEmail={user?.emailAddresses[0]?.emailAddress || ""} />
      </div>
    </div>
  );
}
