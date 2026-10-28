import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import JudgeQuickBar from "@/components/layout/JudgeQuickBar";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "ResourceX — Autonomous Campus Resource Sharing & Lab Infrastructure",
  description: "Unlock Underused Equipment and Spaces for Universities, Research Laboratories, and Student Innovators. CODE HACK INDIA 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Instrument+Serif:ital@1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-white min-h-screen flex flex-col font-sans selection:bg-white selection:text-black antialiased relative">
        {/* Layer stack from Google AI Studio design reference */}
        <div className="grain" aria-hidden="true" />
        <div className="hero-photo" aria-hidden="true" />

        <AuthProvider>
          {/* Hackathon Judge Evaluation Switcher */}
          <JudgeQuickBar />

          {/* Liquid Metal Top Navigation */}
          <Navbar />

          {/* Main Application Content */}
          <main className="flex-1 relative z-10">{children}</main>

          {/* Liquid Glass Footer */}
          <footer className="border-t border-white/10 bg-black/90 py-8 text-xs text-neutral-400 mt-16 relative z-10 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-bold text-white flex items-center gap-2">
                  <span>ResourceX<span className="text-neutral-500 font-normal">.ai</span></span>
                  <span className="text-[10px] text-neutral-300 font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700">
                    CODE HACK INDIA 2026
                  </span>
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Unlock Resources. Empower Innovation. • Official Problem Statement: &ldquo;Unlock Underused Equipment and Spaces&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-neutral-400">
                <span>Apex Institute of Technology</span>
                <span>•</span>
                <span>Supabase PostgreSQL Engine</span>
                <span>•</span>
                <span className="text-white">Gemini 1.5 Flash AI</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
