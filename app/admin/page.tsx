"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getResources,
  getIncidents,
  getAuditEvents,
  resolveIncident,
} from "@/lib/db";
import { Resource, Incident, AuditEvent } from "@/types";
import {
  Shield,
  AlertTriangle,
  History,
  Sparkles,
  Settings,
  Database,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  // Resolution modal state
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const loadData = async () => {
    const res = await getResources();
    setResources(res);
    const inc = await getIncidents();
    setIncidents(inc);
    const aud = await getAuditEvents();
    setAuditEvents(aud);
  };

  useEffect(() => {
    loadData();
  }, []);

  const underusedResources = resources.filter((r) => r.utilizationRate < 55);

  const handleResolveIncident = async (id: string) => {
    if (!resolutionNote.trim()) {
      alert("Please enter resolution and disciplinary notes.");
      return;
    }
    await resolveIncident(id, resolutionNote);
    setResolvingId(null);
    setResolutionNote("");
    await loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-white/20 flex items-center justify-center text-white shrink-0">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-neutral-300 tracking-wider px-2 py-0.5 rounded bg-neutral-900 border border-white/15">
                INSTITUTIONAL GOVERNANCE
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                ADMIN CONSOLE
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Campus Research & Resource Administration
            </h1>
            <p className="text-xs text-neutral-400">
              {currentUser.fullName} • Dean of Research & Infrastructure • Apex Institute of Technology
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Zero Idle Lockouts
          </span>
        </div>
      </div>

      {/* CODE HACK INDIA PROBLEM STATEMENT CARD: UNLOCKING UNDERUSED EQUIPMENT */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold text-white">
              Official Hackathon Focus: &ldquo;Unlock Underused Equipment and Spaces&rdquo;
            </h2>
          </div>
          <span className="text-xs text-amber-300 font-mono font-medium">
            {underusedResources.length} Underutilized Assets Flagged
          </span>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          The ResourceX Underutilization Engine flags laboratory assets operating below 55% utilization or sitting idle during off-peak windows. Administrators can unlock these assets for multi-department borrowing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {underusedResources.map((res) => (
            <div
              key={res.id}
              className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold text-neutral-400">
                  {res.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {res.utilizationRate}% Utilized
                </span>
              </div>
              <h3 className="text-xs font-semibold text-white line-clamp-1">{res.title}</h3>
              <p className="text-[11px] text-neutral-400">{res.location}</p>
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-white/10 text-[10px] text-neutral-300">
                💡 <strong>Gemini Recommendation:</strong> Offer 40% off-peak credit rebate to mechatronics capstone teams on Thursdays.
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campus Utilization & Governance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FairShare Governance Settings */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-neutral-300" />
            <h3 className="text-sm font-semibold text-white">Global FairShare Parameters</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/5">
              <span className="text-neutral-400">Max Weekly Hours / Student:</span>
              <span className="font-bold text-white font-mono">12.0 Hours</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/5">
              <span className="text-neutral-400">Anti-Monopoly Cooldown:</span>
              <span className="font-bold text-white font-mono">24 Hours</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/5">
              <span className="text-neutral-400">Peak Window Multiplier:</span>
              <span className="font-bold text-amber-400 font-mono">1.5x (11:00-16:00)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/5">
              <span className="text-neutral-400">Off-Peak Credit Rebate:</span>
              <span className="font-bold text-emerald-400 font-mono">0.8x Discount</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/5">
              <span className="text-neutral-400">On-Time Return Reward:</span>
              <span className="font-bold text-white font-mono">+2 Reputation</span>
            </div>
          </div>
        </div>

        {/* Incident Resolution Console */}
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-white">Incident & Damage Review Tribunal</h3>
            </div>
            <span className="text-xs text-neutral-400">
              {incidents.filter((i) => i.status === "open").length} Open Inquiries
            </span>
          </div>

          {incidents.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">
              Zero equipment damage incidents reported across all campus facilities.
            </p>
          ) : (
            <div className="space-y-3">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{inc.resourceTitle}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {inc.severity}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-500">{inc.id}</span>
                  </div>
                  <p className="text-neutral-300">{inc.description}</p>
                  {inc.resolutionNotes ? (
                    <p className="text-emerald-400 text-[11px]">
                      <strong>Resolved:</strong> {inc.resolutionNotes}
                    </p>
                  ) : (
                    <div>
                      {resolvingId === inc.id ? (
                        <div className="space-y-2 pt-2">
                          <input
                            type="text"
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            placeholder="Enter administrative resolution..."
                            className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/20 text-white text-xs"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleResolveIncident(inc.id)}
                              className="btn btn-solid text-xs h-8 px-3"
                            >
                              Confirm Resolution
                            </button>
                            <button
                              onClick={() => setResolvingId(null)}
                              className="px-2 py-1 text-neutral-400 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setResolvingId(inc.id)}
                          className="text-white text-[11px] font-medium hover:underline"
                        >
                          Resolve & Close Incident
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System-Wide Real-time Audit Stream */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-neutral-300" />
            <h3 className="text-sm font-semibold text-white">
              Campus Real-Time Security Audit Stream ({auditEvents.length} Verified Entries)
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            LIVE POSTGRESQL STREAM
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-2">
          {auditEvents.slice(0, 15).map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded-xl bg-black/50 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-900 text-neutral-300 border border-white/15">
                  Step {evt.stepNumber}
                </span>
                <span className="font-semibold text-white">{evt.action}</span>
                <span className="text-neutral-400 text-[11px] hidden md:inline">• {evt.details}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-neutral-500 shrink-0">
                <span>By: <strong className="text-neutral-300">{evt.actorName}</strong></span>
                <span className="font-mono">{new Date(evt.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
