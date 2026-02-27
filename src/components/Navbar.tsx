"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/download", label: "Download" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <span className="font-semibold text-lg text-white">Solaris</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <SignedOut>
            <Link
              href="/sign-in"
              className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-surface border-t border-border">
          <div className="px-6 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border" />
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-sm text-gray-400 hover:text-white py-2"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-sm bg-primary text-white px-4 py-2 rounded-lg text-center"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="text-sm text-gray-400 hover:text-white py-2"
              >
                Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  );
}
