"use client";

import { motion } from "framer-motion";
import { Monitor, Apple, Download, ArrowRight, Info } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function DownloadPage() {
  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-5xl font-bold text-center mb-4"
          >
            Download Solaris
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-lg text-gray-400 text-center mb-12"
          >
            Get started with the AI-powered workspace
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          >
            {/* Windows Card */}
            <div className="p-8 rounded-xl bg-surface border border-border hover:border-primary/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <Monitor className="w-10 h-10 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Solaris for Windows
                  </h2>
                  <p className="text-sm text-gray-400">
                    Windows 10/11 (64-bit)
                  </p>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm text-gray-400">Version</span>
                <span className="text-sm text-white font-medium">v0.1.2</span>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-sm text-gray-400">Size</span>
                <span className="text-sm text-white font-medium">~188 MB</span>
              </div>

              <a
                href="/Solaris Cowork Setup 0.1.2.exe"
                download
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors text-sm"
              >
                <Download size={18} />
                Download for Windows
              </a>

              <div className="mt-4 text-xs text-gray-500">
                <p className="font-medium text-gray-400 mb-1">
                  System Requirements:
                </p>
                <ul className="space-y-0.5">
                  <li>Windows 10 or later (64-bit)</li>
                  <li>4 GB RAM minimum (8 GB recommended)</li>
                  <li>500 MB available disk space</li>
                  <li>Internet connection for AI features</li>
                </ul>
              </div>
            </div>

            {/* macOS Card */}
            <div className="p-8 rounded-xl bg-surface border border-border relative overflow-hidden">
              <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-semibold text-white mb-1">
                    Coming Soon
                  </p>
                  <p className="text-sm text-gray-400">
                    macOS support is in development
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <Apple className="w-10 h-10 text-gray-500" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-500">
                    Solaris for macOS
                  </h2>
                  <p className="text-sm text-gray-600">
                    macOS 12+ (Apple Silicon & Intel)
                  </p>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm text-gray-600">Version</span>
                <span className="text-sm text-gray-500 font-medium">—</span>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-sm text-gray-600">Size</span>
                <span className="text-sm text-gray-500 font-medium">—</span>
              </div>

              <button
                disabled
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-700 text-gray-400 rounded-lg font-medium text-sm cursor-not-allowed"
              >
                <Download size={18} />
                Download for macOS
              </button>
            </div>
          </motion.div>

          {/* Installation Steps */}
          <motion.div variants={fadeUp} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Installation Guide
            </h2>
            <div className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Download the installer",
                  description: "Click the download button for your platform above.",
                },
                {
                  step: "2",
                  title: "Run the installer",
                  description:
                    "Double-click the downloaded file and follow the installation wizard.",
                },
                {
                  step: "3",
                  title: "Configure your AI provider",
                  description:
                    "Launch Solaris and add your API key from OpenRouter, Anthropic, OpenAI, or xAI.",
                },
                {
                  step: "4",
                  title: "Start working",
                  description:
                    "Open a project and let your AI coworker handle the rest.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-border"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            variants={fadeUp}
            className="p-6 rounded-xl bg-surface border border-border"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white text-sm mb-2">
                  Important Notes
                </h3>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>
                    Solaris requires an API key from OpenRouter, Anthropic,
                    OpenAI, or xAI for AI features.
                  </li>
                  <li>
                    You bring your own API key — no vendor lock-in.
                  </li>
                </ul>
                <Link
                  href="/docs/getting-started"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover transition-colors mt-3"
                >
                  Read the Getting Started guide
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
