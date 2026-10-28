"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { DEMO_USERS } from "@/lib/mock-data";
import { resetDemoData } from "@/lib/db";
import { RotateCcw, ShieldCheck, Sparkles, Database, Check } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function JudgeQuickBar() {
  const { switchUser, activeRole } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const supabaseActive = isSupabaseConfigured();

  const handleReset = async () => {
    if (!confirm("Reset demo database to fresh initial state? This restores all original resources and bookings.")) {
      return;
    }
    setResetting(true);
    await resetDemoData();
    setResetting(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      window.location.reload();
    }, 1200);
  };

  return (
    <aside
      aria-label="Hackathon Evaluation Controls"
      className="w-full bg-[#050505] border-b border-white/10 px-4 py-2 text-xs text-neutral-400 flex flex-wrap items-center justify-between gap-2 z-50 backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-200 font-semibold border border-white/15 text-[11px]">
          <Sparkles className="w-3 h-3 text-white" />
          CODE HACK INDIA 2026
        </span>
        <span className="hidden sm:inline text-neutral-400 font-medium">
          Judge Persona Switcher:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {DEMO_USERS.map((u) => {
          const isActive = activeRole === u.role;
          return (
            <button
              key={u.role}
              onClick={() => switchUser(u.role)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-white text-black font-bold shadow-sm"
                  : "bg-neutral-900/90 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-white/10"
              }`}
              title={`Switch to ${u.fullName} (${u.role})`}
            >
              <span>
                {u.role === "student" && "🎓"}
                {u.role === "owner" && "🔬"}
                {u.role === "manager" && "👨‍🏫"}
                {u.role === "admin" && "🛡️"}
              </span>
              <span>{u.fullName.split(" ")[0]}</span>
              <span className="opacity-60 text-[10px]">({u.role})</span>
              {isActive && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-neutral-900/80 border border-white/10 text-[11px]">
          <Database className="w-3 h-3 text-neutral-400" />
          <span className="text-neutral-300">
            {supabaseActive ? "Supabase Live" : "PostgreSQL Engine"}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        <button
          onClick={handleReset}
          disabled={resetting}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/15 transition-all text-[11px]"
          title="Reset sample bookings and resources to clean state"
        >
          <RotateCcw className={`w-3 h-3 ${resetting ? "animate-spin" : ""}`} />
          <span>Reset Demo</span>
        </button>
      </div>

      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 border border-white/20 px-4 py-3 rounded-xl shadow-2xl text-white text-sm flex items-center gap-2 animate-bounce">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Demo database restored to fresh seed state!</span>
        </div>
      )}
    </aside>
  );
}
