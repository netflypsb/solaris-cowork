import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solaris - Cowork",
  description:
    "Solaris is the AI-powered workspace that combines project management, documentation, design, learning, and creative tools with one unified AI.",
  openGraph: {
    title: "Solaris - Cowork",
    description: "The AI coworker that replaces your entire toolbox.",
    images: ["/assets/1.dashboard1.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#6366f1",
          colorBackground: "#0a0a0f",
          colorInputBackground: "#1a1a2e",
          colorInputText: "#ffffff",
        },
        elements: {
          card: "bg-[#1a1a2e] border border-[#2a2a3e]",
          headerTitle: "text-white",
          headerSubtitle: "text-gray-400",
          formFieldLabel: "text-gray-300",
          formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700",
          footerActionLink: "text-indigo-400 hover:text-indigo-300",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="bg-background text-foreground antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
