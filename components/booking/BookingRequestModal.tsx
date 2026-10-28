"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Resource, Booking } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { checkEligibility } from "@/lib/booking-lifecycle";
import { calculateFairShareCost } from "@/lib/fairshare";
import { createBooking, createAuditEvent } from "@/lib/db";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import confetti from "canvas-confetti";

interface Props {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (booking: Booking) => void;
}

export default function BookingRequestModal({
  resource,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const router = useRouter();
  const { currentUser } = useAuth();

  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState("10:00");
  const [durationHours, setDurationHours] = useState(2.0);
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittingStep, setSubmittingStep] = useState<string | null>(null);

  const endTime = useMemo(() => {
    const [h, m] = startTime.split(":").map(Number);
    const endH = Math.floor(h + durationHours);
    const endM = Math.floor(m + (durationHours % 1) * 60);
    return `${String(endH % 24).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  }, [startTime, durationHours]);

  const eligibility = useMemo(() => {
    if (!resource) return null;
    return checkEligibility(currentUser, resource, durationHours);
  }, [currentUser, resource, durationHours]);

  const fairShareSim = useMemo(() => {
    if (!resource) return null;
    return calculateFairShareCost(
      resource,
      currentUser,
      date,
      startTime,
      durationHours,
      []
    );
  }, [resource, currentUser, date, startTime, durationHours]);

  if (!isOpen || !resource) return null;

  const handleDraftAIPurpose = () => {
    const drafts = [
      `Capstone Research: Implementation and hardware validation of autonomous control loops with fail-safe telemetry protocols for capstone project demonstration.`,
      `Academic Thesis: Precision bench testing, signal integrity verification, and empirical data acquisition following university laboratory standard operating procedures.`,
      `Hackathon Prototyping: Rapid manufacturing of functional mechanical enclosures and edge sensors under CODE HACK INDIA 2026 guidelines.`,
    ];
    setPurpose(drafts[Math.floor(Math.random() * drafts.length)]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibility?.eligible) return;

    setLoading(true);
    setSubmittingStep("Executing Step 2: Automated Eligibility Verification...");
    await new Promise((r) => setTimeout(r, 400));

    setSubmittingStep("Executing Step 3: Generating PostgreSQL Booking Entry...");
    const newBooking = await createBooking({
      resourceId: resource.id,
      resourceTitle: resource.title,
      resourceCategory: resource.category,
      resourceLocation: resource.location,
      resourceImage: resource.imageUrl,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userEmail: currentUser.email,
      userDepartment: currentUser.department,
      userFairShareScore: currentUser.fairShareScore,
      date,
      startTime,
      endTime,
      durationHours,
      purpose,
      status: resource.approvalRequired ? "pending" : "confirmed",
      hasIncident: false,
      creditsDeducted: fairShareSim?.finalCost || resource.fairShareCost * durationHours,
    });

    await createAuditEvent({
      bookingId: newBooking.id,
      resourceId: resource.id,
      stepNumber: 1,
      stepName: "Resource Discovery",
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: "Selected resource slot for reservation",
      details: `Student inspected availability for ${date} ${startTime}-${endTime}.`,
      status: "info",
    });

    await createAuditEvent({
      bookingId: newBooking.id,
      resourceId: resource.id,
      stepNumber: 2,
      stepName: "Eligibility Verification",
      actorId: "system",
      actorName: "FairShare Eligibility Engine",
      actorRole: "system",
      action: "Pre-booking safety clearance verified",
      details: `All prerequisites met. Cost: ${fairShareSim?.finalCost} credits. FairShare score: ${currentUser.fairShareScore}/100.`,
      status: "success",
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ffffff", "#9a9a9a", "#10B981"],
    });

    setLoading(false);
    onClose();

    if (onSuccess) {
      onSuccess(newBooking);
    } else {
      router.push(`/bookings/${newBooking.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-neutral-950 border border-white/20 rounded-3xl shadow-2xl overflow-hidden relative my-8">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between bg-black">
          <div className="flex items-center gap-3">
            <img
              src={resource.imageUrl}
              alt={resource.title}
              className="w-14 h-14 rounded-xl object-cover border border-white/20"
            />
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                {resource.category} • {resource.location}
              </span>
              <h2 className="text-lg font-bold text-white line-clamp-1">
                {resource.title}
              </h2>
              <p className="text-xs text-neutral-400">
                Step 1 to 3: Discovery, Eligibility Clearance, & Slot Request
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* STEP 2: ELIGIBILITY MATRIX */}
          <div className="p-4 rounded-xl bg-black border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {eligibility?.eligible ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                )}
                <span className="text-xs font-semibold uppercase tracking-wider text-white">
                  Step 2: Automated Eligibility Clearance
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  eligibility?.eligible
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                }`}
              >
                {eligibility?.eligible ? "ELIGIBLE TO BOOK" : "CLEARANCE REQUIRED"}
              </span>
            </div>

            {eligibility?.eligible ? (
              <p className="text-xs text-emerald-400">
                ✓ Student safety credentials verified ({currentUser.certifications.length} active certificates). FairShare score ({currentUser.fairShareScore}/100) satisfies resource tier requirements.
              </p>
            ) : (
              <div className="space-y-1 pt-1">
                {eligibility?.reasons.map((r, i) => (
                  <p key={i} className="text-xs text-rose-300 flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{r}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* DATE & TIME CONFIGURATION */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Reservation Date
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Duration (Hours)
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
              >
                <option value={1}>1.0 Hour</option>
                <option value={1.5}>1.5 Hours</option>
                <option value={2}>2.0 Hours</option>
                <option value={3}>3.0 Hours (Standard)</option>
                <option value={4}>4.0 Hours (Max Allowed)</option>
              </select>
            </div>
          </div>

          {/* FAIRSHARE SMART ADVISOR CALLOUT */}
          {fairShareSim && (
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10 flex items-start gap-3 text-xs">
              <Zap className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">
                    FairShare Allocation Cost:
                  </span>
                  <span className="font-mono font-bold text-white">
                    {fairShareSim.finalCost} credits
                  </span>
                  {fairShareSim.isPeakHour ? (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Peak 1.5x
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Off-Peak 0.8x Discount
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400">
                  {fairShareSim.recommendation}
                </p>
              </div>
            </div>
          )}

          {/* PURPOSE OF USAGE */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-300">
                Academic / Research Purpose
              </label>
              <button
                type="button"
                onClick={handleDraftAIPurpose}
                className="text-[11px] text-white hover:underline flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Draft Purpose</span>
              </button>
            </div>
            <textarea
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Explain what experiment, capstone, or research project this resource will be used for..."
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
            />
          </div>

          {/* SUBMISSION FOOTER */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-neutral-400">
              Scheduled End Time:{" "}
              <span className="font-bold text-white font-mono">{endTime}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!eligibility?.eligible || loading}
                className={`btn btn-solid text-xs h-10 px-5 font-semibold ${
                  eligibility?.eligible && !loading ? "" : "opacity-40 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <span>{submittingStep}</span>
                ) : (
                  <>
                    <span>Submit Reservation</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
