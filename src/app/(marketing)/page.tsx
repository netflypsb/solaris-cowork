"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MessageSquare,
  ClipboardList,
  BookOpen,
  GraduationCap,
  Palette,
  Sparkles,
  Cpu,
  Brain,
  Layers,
  Download,
  Zap,
  ChevronDown,
  Check,
  ArrowRight,
  Monitor,
  Settings,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat & Tasks",
    description:
      "Have conversations that actually get work done. Your AI understands context across your entire project.",
    image: "/assets/1.dashboard1.png",
  },
  {
    icon: ClipboardList,
    title: "Project Board",
    description:
      "Kanban boards, task tracking, and project management — all powered by AI that knows your workflow.",
    image: "/assets/1.dashboard2.png",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description:
      "AI-powered wiki and documentation that automatically organizes and connects your information.",
    image: null,
  },
  {
    icon: GraduationCap,
    title: "Learning Hub",
    description:
      "Personalized AI-generated courses, tutorials, and learning paths on any topic.",
    image: "/assets/2.learning-hub.png",
  },
  {
    icon: Palette,
    title: "Creative Hub",
    description:
      "Generate images, presentations, documents, and creative content with AI assistance.",
    image: "/assets/3.creative-hub.png",
  },
  {
    icon: Sparkles,
    title: "170+ AI Skills",
    description:
      "From code generation to data analysis, browser automation to document creation.",
    image: null,
  },
];

const stats = [
  { icon: Brain, label: "Agent 3.0 Architecture", value: "Built on" },
  { icon: Sparkles, label: "AI Skills", value: "170+" },
  { icon: Layers, label: "Integrated Hubs", value: "5" },
  { icon: Cpu, label: "Projects", value: "Unlimited" },
];

const screenshotTabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    image: "/assets/1.dashboard1.png",
    description:
      "Your command center — chat with AI, manage tasks, and oversee projects from one unified interface.",
  },
  {
    id: "learning",
    label: "Learning Hub",
    image: "/assets/2.learning-hub.png",
    description:
      "AI-generated courses and learning paths customized to your skill level and goals.",
  },
  {
    id: "creative",
    label: "Creative Hub",
    image: "/assets/3.creative-hub.png",
    description:
      "Generate images, presentations, documents, and more with AI-powered creative tools.",
  },
  {
    id: "settings",
    label: "Settings",
    image: "/assets/4.settings.png",
    description:
      "Configure AI providers, sandbox environments, MCP connectors, and more.",
  },
];

const faqs = [
  {
    q: "What AI models does Solaris support?",
    a: "Solaris works with OpenRouter, Anthropic (Claude), OpenAI (GPT), xAI (Grok), and any OpenAI-compatible API. Bring your own API key — no vendor lock-in.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Solaris is a local-first desktop application. Your project data stays on your machine. AI interactions go directly to your chosen provider through your own API key.",
  },
  {
    q: "Is Solaris free to use?",
    a: "Yes! Solaris is completely free and open source. Download it and use it with your own AI API keys for unlimited usage. No subscriptions or hidden costs.",
  },
  {
    q: "Can I use Solaris offline?",
    a: "Core features like project management, wiki, and the visual editor work offline. AI features require an internet connection to reach your chosen AI provider.",
  },
  {
    q: "What platforms does Solaris support?",
    a: "Solaris is available for Windows 10/11 (64-bit). macOS support is coming soon.",
  },
  {
    q: "How do I add custom skills?",
    a: "You can create custom AI skills using simple JSON/Markdown definitions. See our Custom Skills documentation for a step-by-step guide.",
  },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const activeScreenshot = screenshotTabs.find((t) => t.id === activeTab)!;

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

        <motion.div
          className="relative max-w-5xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
              <Sparkles size={14} />
              Powered by Agent 3.0 Architecture
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent"
          >
            One AI to Replace
            <br />
            All Your Software
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Solaris is the AI-powered workspace that combines project
            management, documentation, design, learning, and creative tools —
            all with one unified AI that understands your entire project.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/sign-up"
              className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors text-sm"
            >
              Get Started Free
            </Link>
            <Link
              href="/docs"
              className="px-8 py-3 bg-surface hover:bg-border text-white rounded-lg font-medium transition-colors border border-border text-sm"
            >
              View Documentation
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-16 relative rounded-xl overflow-hidden border border-border shadow-2xl shadow-primary/10"
          >
            <div className="bg-surface flex items-center gap-2 px-4 py-3 border-b border-border">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-2 text-xs text-gray-500">
                Solaris Cowork
              </span>
            </div>
            <Image
              src="/assets/1.dashboard1.png"
              alt="Solaris Dashboard"
              width={1200}
              height={700}
              className="w-full"
              priority
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-border bg-surface/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold mb-6"
            >
              Your Tools Are Scattered.
              <br />
              <span className="text-gray-500">Your AI Is Siloed.</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              The average knowledge worker switches between 9-12 apps daily.
              Each has its own AI assistant that knows nothing about the others.
              Your context is fragmented. Your productivity suffers.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-lg mx-auto mb-8"
            >
              {[
                "Notion",
                "Trello",
                "Figma",
                "ChatGPT",
                "Canva",
                "Jira",
                "Docs",
                "Slack",
                "Miro",
                "Linear",
              ].map((tool) => (
                <div
                  key={tool}
                  className="px-3 py-2 rounded-lg bg-surface border border-border text-xs text-gray-500 text-center"
                >
                  {tool}
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} className="flex justify-center">
              <ArrowRight className="text-primary w-8 h-8 rotate-90 md:rotate-0" />
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="mt-4 inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30"
            >
              <Image
                src="/assets/solaris.jpg"
                alt="Solaris Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="font-semibold text-white">
                Solaris — One App for Everything
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold mb-4"
            >
              Everything You Need. One Workspace.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-400 max-w-2xl mx-auto"
            >
              Six integrated hubs powered by one AI that shares context across
              everything you do.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="group p-6 rounded-xl bg-surface border border-border hover:border-primary/50 transition-all duration-300"
              >
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {feature.description}
                </p>
                {feature.image && (
                  <div className="rounded-lg overflow-hidden border border-border">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={400}
                      height={240}
                      className="w-full object-cover"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Screenshot Showcase */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold text-center mb-4"
            >
              See Solaris in Action
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-400 text-center mb-12 max-w-2xl mx-auto"
            >
              Explore the different hubs and features that make Solaris your
              all-in-one AI workspace.
            </motion.p>

            <motion.div variants={fadeUp}>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {screenshotTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-primary text-white"
                        : "bg-surface text-gray-400 hover:text-white border border-border"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative rounded-xl overflow-hidden border border-border shadow-2xl shadow-primary/5">
                <div className="bg-surface flex items-center gap-2 px-4 py-3 border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs text-gray-500">
                    {activeScreenshot.label}
                  </span>
                </div>
                <Image
                  src={activeScreenshot.image}
                  alt={activeScreenshot.label}
                  width={1200}
                  height={700}
                  className="w-full"
                />
              </div>
              <p className="text-center text-gray-400 text-sm mt-4">
                {activeScreenshot.description}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Agent 3.0 Section */}
      <section className="py-24 px-6 bg-surface/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold text-center mb-4"
            >
              Powered by Agent 3.0 Architecture
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-400 text-center mb-16"
            >
              Not just another chatbot. Solaris is a Coworker Agent.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  version: "Agent 1.0",
                  title: "Simple Chatbots",
                  description:
                    "Single-turn Q&A. No memory. No context. Just basic responses.",
                  active: false,
                },
                {
                  version: "Agent 2.0",
                  title: "Deep Agents",
                  description:
                    "Multi-turn conversations with tool use. Better, but still siloed.",
                  active: false,
                },
                {
                  version: "Agent 3.0",
                  title: "Coworker Agents",
                  description:
                    "Near-infinite context. Autonomous task completion. Higher accuracy. True project understanding.",
                  active: true,
                },
              ].map((agent) => (
                <div
                  key={agent.version}
                  className={`p-6 rounded-xl border ${
                    agent.active
                      ? "bg-primary/10 border-primary/50 ring-1 ring-primary/30"
                      : "bg-surface border-border"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      agent.active ? "text-primary" : "text-gray-500"
                    }`}
                  >
                    {agent.version}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2 mb-3">
                    {agent.title}
                  </h3>
                  <p className="text-sm text-gray-400">{agent.description}</p>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="text-center mt-8">
              <Link
                href="/blog/agent-3-0"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors text-sm"
              >
                Read the Agent 3.0 blog post
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold text-center mb-16"
            >
              Get Started in 3 Steps
            </motion.h2>

            <motion.div variants={fadeUp} className="space-y-8">
              {[
                {
                  icon: Download,
                  step: "1",
                  title: "Download & Install",
                  description:
                    "Get Solaris for Windows in seconds. macOS coming soon.",
                },
                {
                  icon: Settings,
                  step: "2",
                  title: "Connect Your AI",
                  description:
                    "Add your API key from OpenRouter, Anthropic, OpenAI, or others.",
                },
                {
                  icon: Zap,
                  step: "3",
                  title: "Start Working",
                  description:
                    "Open a project and let your AI coworker handle the rest.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-6 p-6 rounded-xl bg-surface border border-border"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-24 px-6 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold text-center mb-4"
            >
              Free & Open Source
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-400 text-center mb-12 max-w-2xl mx-auto"
            >
              Download Solaris and use it with your own AI API keys. No subscriptions, no limits.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="p-8 rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border border-primary/30"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Monitor className="w-16 h-16 text-primary flex-shrink-0" />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Solaris for Windows
                  </h3>
                  <p className="text-gray-400 mb-1">Version 0.1.2 • Windows 10/11 (64-bit)</p>
                  <p className="text-sm text-gray-500">~188 MB installer</p>
                </div>
                <Link
                  href="/download"
                  className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors"
                >
                  <Download size={20} />
                  Download Now
                </Link>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-sm text-gray-400 mb-3">
                  <strong className="text-white">What&apos;s included:</strong>
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
                  {[
                    "All 5 integrated hubs",
                    "170+ AI skills",
                    "Unlimited MCP connectors",
                    "Bring your own API keys",
                    "Local-first & private",
                    "No subscriptions required",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check size={14} className="text-accent flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold text-center mb-16"
            >
              Frequently Asked Questions
            </motion.h2>

            <motion.div variants={fadeUp} className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-surface overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="text-sm font-medium text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm text-gray-400">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-2xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 border border-primary/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Work Smarter?
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Join professionals who&apos;ve replaced their entire toolbox with
              Solaris.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors"
            >
              Get Started Now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
