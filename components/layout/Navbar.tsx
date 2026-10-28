"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Search,
  Sparkles,
  Shield,
  Layers,
  Database,
  CalendarCheck,
  PlusCircle,
  Zap,
} from "lucide-react";
import StudentRegistrationModal from "@/components/auth/StudentRegistrationModal";

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, isOwnerOrManager, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [regModalOpen, setRegModalOpen] = useState(false);

  const navLinks = [
    { href: "/resources", label: "Catalog & Spaces", icon: Search },
    { href: "/student", label: "Student Hub", icon: CalendarCheck },
    ...(isOwnerOrManager ? [{ href: "/owner", label: "Owner Console", icon: Layers }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Campus Admin", icon: Shield }] : []),
    { href: "/ai-assistant", label: "AI Coordinator", icon: Sparkles },
    { href: "/docs/supabase", label: "Supabase Docs", icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Google AI Studio Logo Mark */}
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <svg
            className="w-5 h-5 text-white transition-transform group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="4.5" r="1.8" />
            <path d="M12 8.5L19 19.5H15.2L12 14.5L8.8 19.5H5L12 8.5Z" />
            <rect x="8.5" y="20.8" width="7" height="1.6" rx="0.8" opacity="0.7" />
          </svg>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-semibold tracking-tight text-white font-sans">
              ResourceX<span className="font-normal text-neutral-400">.ai</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/10 text-neutral-300 border border-white/15">
              AIT
            </span>
          </div>
        </Link>

        {/* Center: Liquid Metal Navigation Pills */}
        <nav className="hidden lg:flex items-center gap-2" aria-label="Primary">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-pill text-xs ${isActive ? "nav-pill-active" : ""}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-neutral-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: User Status & Solid Specular Button */}
        <div className="hidden sm:flex items-center gap-3">
          {/* FairShare Reputation Pill */}
          <div className="flex items-center gap-2 bg-neutral-900/90 px-3 py-1.5 rounded-lg border border-white/10 text-xs">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-neutral-400" />
              <span className="text-[11px] text-neutral-400">FairShare:</span>
              <span className="font-bold text-white font-mono">
                {currentUser.fairShareScore}
              </span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-neutral-400">Credits:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {currentUser.credits}
              </span>
            </div>
          </div>

          {/* User Persona Chip */}
          <div className="flex items-center gap-2 bg-neutral-900/80 px-2.5 py-1.5 rounded-lg border border-white/10">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="w-6 h-6 rounded-full object-cover border border-white/20"
            />
            <div className="text-left text-xs leading-none">
              <span className="font-medium text-white block truncate max-w-[110px]">
                {currentUser.fullName}
              </span>
              <span className="text-[10px] text-neutral-500 capitalize">
                {currentUser.role}
              </span>
            </div>
          </div>

          {/* Solid Specular Action Button */}
          <button
            onClick={() => setRegModalOpen(true)}
            className="btn btn-solid text-xs h-9 px-3.5"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1" />
            <span>Join Campus</span>
          </button>
        </div>

        {/* Mobile Burger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-lg border border-white/15 bg-neutral-900/80 flex items-center justify-center p-2 text-white"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1 w-4">
              <span
                className={`block h-0.5 w-4 bg-white transition-all ${
                  mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-4 bg-white transition-all ${
                  mobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-4 bg-white transition-all ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/15 bg-black/95 px-4 py-5 space-y-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-9 h-9 rounded-full border border-white/20"
              />
              <div>
                <p className="text-sm font-semibold text-white">{currentUser.fullName}</p>
                <p className="text-xs text-neutral-400 capitalize">
                  {currentUser.role} • FairShare {currentUser.fairShareScore}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setRegModalOpen(true);
              }}
              className="btn btn-solid text-xs h-8 px-3"
            >
              Register
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="nav-pill text-xs w-full justify-start py-3 h-auto"
              >
                <link.icon className="w-4 h-4 text-neutral-400" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Student Self-Registration Modal */}
      <StudentRegistrationModal
        isOpen={regModalOpen}
        onClose={() => setRegModalOpen(false)}
      />
    </header>
  );
}
