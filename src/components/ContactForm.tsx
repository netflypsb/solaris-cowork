"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

export default function ContactForm({ userEmail }: { userEmail: string }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          subject,
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setSubject("");
      setMessage("");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to send message");
    }
  };

  return (
    <div className="p-6 rounded-xl bg-surface border border-border">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            maxLength={200}
            placeholder="Feature request, bug report, suggestion..."
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            maxLength={2000}
            rows={6}
            placeholder="Tell us what you'd like to see in Solaris..."
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {message.length}/2000 characters
          </p>
        </div>

        {status === "success" && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/30">
            <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
            <p className="text-sm text-accent">
              Message sent successfully! We&apos;ll get back to you soon.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "sending" || !subject.trim() || !message.trim()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} />
          {status === "sending" ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
