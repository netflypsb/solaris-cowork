import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Product: [
    { href: "/#features", label: "Features" },
    { href: "/autogram", label: "Autogram" },
    { href: "/download", label: "Download" },
    { href: "/docs", label: "Documentation" },
  ],
  Resources: [
    { href: "/docs/getting-started", label: "Getting Started" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
  ],
  Community: [
    { href: "https://github.com/netflypsb", label: "GitHub" },
    { href: "https://www.youtube.com/@netflyp", label: "YouTube" },
    { href: "mailto:solaris-app@outlook.com", label: "Contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/assets/solaris.jpg"
                alt="Solaris Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="font-semibold text-lg text-white">Solaris</span>
            </div>
            <p className="text-sm text-gray-400">
              One AI to Replace All Software
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="https://github.com/netflypsb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors text-sm"
              >
                GitHub
              </a>
              <a
                href="https://www.youtube.com/@netflyp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors text-sm"
              >
                YouTube
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-white text-sm mb-4">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Solaris Cowork. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
