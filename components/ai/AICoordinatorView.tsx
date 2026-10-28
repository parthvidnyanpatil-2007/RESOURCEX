"use client";

import React, { useState } from "react";
import { Resource } from "@/types";
import { askGeminiResourceAssistant, ResourceMatchRecommendation } from "@/lib/gemini";
import { Sparkles, Send, Zap, ShieldCheck, ArrowRight, Bot, Clock } from "lucide-react";
import BookingRequestModal from "@/components/booking/BookingRequestModal";

interface Props {
  resources: Resource[];
}

export default function AICoordinatorView({ resources }: Props) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<ResourceMatchRecommendation[]>([]);
  const [selectedResourceForBooking, setSelectedResourceForBooking] = useState<Resource | null>(null);

  const samplePrompts = [
    "We need to 3D print custom robotic finger flexures using tough resin for our capstone.",
    "Looking for high-performance GPUs to train a 7B parameter medical model before the hackathon ends.",
    "Need to inspect 500MHz clock jitter and SPI bus communications on our custom PCB.",
    "Need a 400+ seat auditorium with 4K projection for our tech symposium keynotes.",
  ];

  const handleAsk = async (textToAsk?: string) => {
    const q = textToAsk || prompt;
    if (!q.trim()) return;

    setLoading(true);
    setReply(null);
    setRecommendations([]);

    try {
      const summaryList = resources.map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        description: r.description,
        location: r.location,
      }));

      const res = await askGeminiResourceAssistant(q, summaryList);
      setReply(res.reply);
      setRecommendations(res.recommendations);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRecommendation = (rec: ResourceMatchRecommendation) => {
    const found = resources.find((r) => r.id === rec.resourceId) || resources[0];
    setSelectedResourceForBooking(found);
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/15 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <div className="flex justify-center">
            <div className="badge-star-pill">
              <Sparkles className="w-4 h-4 text-white" />
              <span>Gemini AI Smart Campus Lab Coordinator</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-medium text-white tracking-tight headline-serif-em">
            Describe Your Project. <br />
            <span>We Unlock The <em>Gear</em>.</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Tell the AI coordinator what you want to build or measure. It analyzes campus laboratory schedules, safety requirements, and FairShare quotas to reserve the perfect equipment.
          </p>

          {/* Prompt Bar */}
          <div className="pt-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                placeholder="e.g. We are building an autonomous drone and need to 3D print lightweight motor mounts..."
                className="w-full pl-4 pr-28 py-3.5 rounded-xl bg-black border border-white/20 text-white text-xs sm:text-sm focus:outline-none focus:border-white shadow-lg placeholder:text-neutral-500"
              />
              <button
                onClick={() => handleAsk()}
                disabled={loading || !prompt.trim()}
                className="btn btn-solid absolute right-2 text-xs h-9 px-4 disabled:opacity-40"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Match</span>
                    <Send className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Prompts (Liquid Metal Pills) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-[11px] text-neutral-500">Try asking:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(p);
                  handleAsk(p);
                }}
                className="nav-pill text-[11px] h-7 px-2.5 cursor-pointer"
              >
                &ldquo;{p.slice(0, 38)}...&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Results Section */}
      {reply && (
        <div className="space-y-4 animate-fadeIn">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-start gap-3 bg-neutral-950">
            <Bot className="w-6 h-6 text-white shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                AI Lab Coordinator Analysis
              </h3>
              <p className="text-xs text-neutral-200 leading-relaxed">{reply}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="glass-panel p-5 rounded-2xl border border-white/15 flex flex-col justify-between space-y-4 hover:border-white/30 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                      {Math.round(rec.confidenceScore * 100)}% Match Confidence
                    </span>
                    <span className="text-[11px] text-neutral-300 font-mono flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Recommended Slot
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {rec.resourceTitle}
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">{rec.reason}</p>

                  <div className="p-3 rounded-xl bg-black border border-white/5 text-[11px] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-neutral-200">
                      <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{rec.recommendedSlot}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                      <span>Clearance: {rec.requiredCertifications.join(", ") || "General Campus Lab Safety"}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBookRecommendation(rec)}
                  className="btn btn-solid w-full text-xs h-10 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  <span>Reserve Recommended Resource</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedResourceForBooking && (
        <BookingRequestModal
          resource={selectedResourceForBooking}
          isOpen={true}
          onClose={() => setSelectedResourceForBooking(null)}
        />
      )}
    </div>
  );
}
