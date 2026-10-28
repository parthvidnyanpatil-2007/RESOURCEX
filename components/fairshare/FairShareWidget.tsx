"use client";

import React from "react";
import { User, Booking } from "@/types";
import { getUserFairShareProfile } from "@/lib/fairshare";
import {
  Zap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface Props {
  user: User;
  bookings: Booking[];
}

export default function FairShareWidget({ user, bookings }: Props) {
  const profile = getUserFairShareProfile(user, bookings);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/15 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/15 flex items-center justify-center text-white">
            <Zap className="w-4 h-4 fill-white text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              FairShare Allocation Engine & Reputation
            </h3>
            <p className="text-[11px] text-neutral-400">
              Anti-monopoly scheduling & community credit scoring
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          {profile.statusTier}
        </span>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* FairShare Score */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-neutral-400">
            Reputation Score
          </span>
          <div className="text-2xl font-bold text-white font-mono">
            {profile.score}
            <span className="text-xs text-neutral-500 font-normal">/100</span>
          </div>
          <p className="text-[10px] text-emerald-400">High Trust Tier</p>
        </div>

        {/* Weekly Quota */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-neutral-400">
            Weekly Hours Quota
          </span>
          <div className="text-2xl font-bold text-white font-mono">
            {profile.weeklyHoursUsed}
            <span className="text-xs text-neutral-500 font-normal">
              /{profile.weeklyHoursLimit}h
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
            <div
              className="bg-white h-full rounded-full"
              style={{ width: `${Math.min(100, (profile.weeklyHoursUsed / profile.weeklyHoursLimit) * 100)}%` }}
            />
          </div>
        </div>

        {/* On-Time Return Rate */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-neutral-400">
            On-Time Return Rate
          </span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {profile.onTimeReturnRate}%
          </div>
          <p className="text-[10px] text-neutral-400">0 Incident Penalties</p>
        </div>

        {/* Available Credits */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-neutral-400">
            Active Credits
          </span>
          <div className="text-2xl font-bold text-white font-mono">
            {user.credits}
            <span className="text-xs text-neutral-500 font-normal"> pts</span>
          </div>
          <p className="text-[10px] text-neutral-300">+2 bonus on next return</p>
        </div>
      </div>

      {/* FairShare Transparent Rules Callout */}
      <div className="p-4 rounded-2xl bg-neutral-950 border border-white/10 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-white font-semibold">
          <Sparkles className="w-4 h-4 text-white" />
          <span>How FairShare Protects Campus Resources</span>
        </div>
        <ul className="space-y-1.5 text-neutral-400 text-[11px] list-disc list-inside">
          <li>
            <strong>Anti-Monopoly Cooldown:</strong> 24-hour mandatory gap after 2 consecutive bookings on tier-1 equipment (e.g. 3D printers, DGX GPUs).
          </li>
          <li>
            <strong>Off-Peak Discount:</strong> Bookings scheduled before 11:00 or after 16:00 receive a <strong>20% discount</strong> to maximize 24/7 campus laboratory utilization.
          </li>
          <li>
            <strong>On-Time Return Bonus:</strong> Returning equipment in verified pristine condition rewards <strong>+2 reputation points</strong> automatically.
          </li>
        </ul>
      </div>
    </div>
  );
}
