"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Shield,
  Puzzle,
  Key,
  Code,
  Github,
  MessageCircle,
  Mail,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function AboutPage() {
  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          {/* Hero */}
          <motion.div variants={fadeUp} className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About Solaris
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Building the future of AI-powered work
            </p>
          </motion.div>

          {/* Mission */}
          <motion.section variants={fadeUp} className="mb-20">
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              We believe the future of software isn&apos;t more tools — it&apos;s
              smarter integration. The average knowledge worker juggles 9-12
              different applications daily, each with its own interface, learning
              curve, and AI assistant that knows nothing about the others.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Solaris was created to solve this fragmentation. One AI workspace
              that combines project management, documentation, design, learning,
              and creative tools — all powered by a single AI that understands
              your entire project context.
            </p>
          </motion.section>

          {/* The Problem */}
          <motion.section variants={fadeUp} className="mb-20">
            <h2 className="text-2xl font-bold text-white mb-4">
              The Problem We&apos;re Solving
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Context Switching",
                  description:
                    "Jumping between tools wastes hours daily and breaks focus. Your brain pays a cognitive tax every time you switch apps.",
                },
                {
                  title: "Siloed AI",
                  description:
                    "Each app has its own AI assistant that knows nothing about your other tools. You repeat context endlessly.",
                },
                {
                  title: "Subscription Fatigue",
                  description:
                    "Software subscriptions add up to hundreds per month, yet none of your tools work together seamlessly.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-5 rounded-xl bg-surface border border-border"
                >
                  <h3 className="font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Our Approach */}
          <motion.section variants={fadeUp} className="mb-20">
            <h2 className="text-2xl font-bold text-white mb-6">
              Our Approach
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: Brain,
                  title: "Agent 3.0 Architecture",
                  description:
                    "True AI coworker capability with near-infinite context and autonomous task completion.",
                },
                {
                  icon: Shield,
                  title: "Local-First & Private",
                  description:
                    "Your data stays on your machine. AI interactions go directly to your chosen provider.",
                },
                {
                  icon: Puzzle,
                  title: "Extensible",
                  description:
                    "170+ built-in skills, custom skill creation, and MCP connectors for external integrations.",
                },
                {
                  icon: Key,
                  title: "No Vendor Lock-In",
                  description:
                    "Bring your own AI model — works with Claude, GPT, Grok, and any OpenAI-compatible API.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 p-5 rounded-xl bg-surface border border-border"
                >
                  <item.icon className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Technology */}
          <motion.section variants={fadeUp} className="mb-20">
            <h2 className="text-2xl font-bold text-white mb-4">Technology</h2>
            <div className="p-6 rounded-xl bg-surface border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Code size={18} className="text-primary" />
                    Built With
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-400">
                    <li>Electron + React + TypeScript</li>
                    <li>Next.js for the web platform</li>
                    <li>TailwindCSS for styling</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Brain size={18} className="text-primary" />
                    Powered By
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-400">
                    <li>Claude, GPT, Grok, and any compatible model</li>
                    <li>Model Context Protocol (MCP)</li>
                    <li>170+ built-in AI skills</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Open Source */}
          <motion.section variants={fadeUp} className="mb-20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Open Source & Community
            </h2>
            <p className="text-gray-400 mb-6">
              Solaris is MIT licensed. We believe in open-source software and
              building in the open. Contributions are welcome.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/netflypsb"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-border hover:border-primary/50 rounded-lg text-sm text-white transition-colors"
              >
                <Github size={18} />
                GitHub Repository
              </a>
              <a
                href="https://www.youtube.com/@netflyp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-border hover:border-primary/50 rounded-lg text-sm text-white transition-colors"
              >
                <MessageCircle size={18} />
                YouTube Channel
              </a>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section variants={fadeUp} id="contact">
            <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
            <div className="p-6 rounded-xl bg-surface border border-border">
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-primary" />
                  <a
                    href="mailto:solaris-app@outlook.com"
                    className="text-primary hover:text-primary-hover transition-colors"
                  >
                    solaris-app@outlook.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Github size={16} className="text-primary" />
                  <span>
                    Bug reports via{" "}
                    <a
                      href="https://github.com/netflypsb/solaris-cowork/issues"
                      className="text-primary hover:text-primary-hover transition-colors"
                    >
                      GitHub Issues
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}
