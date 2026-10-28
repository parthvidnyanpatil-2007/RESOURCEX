"use client";

import React, { useState, useEffect } from "react";
import { Booking, AuditEvent } from "@/types";
import { useAuth } from "@/lib/auth-context";
import {
  executeOwnerReview,
  executeCheckIn,
  executeCheckOut,
  executeReturnVerification,
} from "@/lib/booking-lifecycle";
import { getAuditEvents, getBookingById } from "@/lib/db";
import { inspectConditionReport } from "@/lib/gemini";
import {
  CheckCircle2,
  AlertTriangle,
  Camera,
  UserCheck,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ThumbsUp,
  XCircle,
  History,
  Lock,
  Layers,
  MapPin,
  Calendar,
} from "lucide-react";
import confetti from "canvas-confetti";

interface Props {
  bookingId: string;
}

const LIFECYCLE_STEPS = [
  { step: 1, name: "Discovery", desc: "Resource search & slot selection" },
  { step: 2, name: "Eligibility", desc: "Safety & quota pre-check" },
  { step: 3, name: "Request", desc: "Purpose statement submitted" },
  { step: 4, name: "Review", desc: "Owner decision & rationale" },
  { step: 5, name: "Confirmed", desc: "Conflict-free schedule lock" },
  { step: 6, name: "Check-In", desc: "Initial condition & timestamp" },
  { step: 7, name: "Check-Out", desc: "Usage concluded & return filed" },
  { step: 8, name: "Verification", desc: "Physical inspection by owner" },
  { step: 9, name: "Completed", desc: "Quota settled & bonus awarded" },
  { step: 10, name: "Audit Sealed", desc: "Permanent record archived" },
];

export default function BookingLifecycleView({ bookingId }: Props) {
  const { currentUser, isOwnerOrManager } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Step 4 Owner Decision State
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Step 6 Check-In State
  const [checkInCondition, setCheckInCondition] = useState("Pristine - Clean workspace, power test normal");
  const [checkInNotes, setCheckInNotes] = useState("All accessory cables, safety goggles, and power brick accounted for.");
  const [checkInPhotoUrl, setCheckInPhotoUrl] = useState("https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80");

  // Step 7 Check-Out State
  const [checkOutCondition, setCheckOutCondition] = useState("Normal Return - Cleaned work area, cables coiled");
  const [checkOutNotes, setCheckOutNotes] = useState("Completed all planned test runs. No operational faults observed.");
  const [checkOutPhotoUrl, setCheckOutPhotoUrl] = useState("https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80");

  // Step 8 Owner Verification State
  const [hasDamage, setHasDamage] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("Physical inspection conducted. All sensors, bits, and safety interlocks in perfect condition.");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [incidentSeverity, setIncidentSeverity] = useState<"minor" | "moderate" | "critical">("minor");

  // AI Condition Diff State
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const loadData = async () => {
    try {
      const b = await getBookingById(bookingId);
      if (b) {
        setBooking(b);
        const audits = await getAuditEvents(bookingId);
        setAuditEvents(audits);

        if (b.checkInNotes && b.checkOutNotes) {
          const result = await inspectConditionReport(b.checkInNotes, b.checkOutNotes);
          setAiAnalysis(result);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-neutral-400 flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
        <p className="text-xs">Loading 10-Step Booking Lifecycle from Database...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl max-w-lg mx-auto border border-white/10">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-white">Booking Not Found</h3>
        <p className="text-xs text-neutral-400 mt-1">
          The requested booking ID does not exist or has been removed.
        </p>
      </div>
    );
  }

  const getActiveStepNumber = (status: Booking["status"]): number => {
    switch (status) {
      case "pending":
        return 4;
      case "waitlisted":
        return 4;
      case "rejected":
        return 4;
      case "confirmed":
        return 6;
      case "checked_in":
        return 7;
      case "checked_out":
        return 8;
      case "completed":
        return 10;
      default:
        return 3;
    }
  };

  const currentStep = getActiveStepNumber(booking.status);

  const handleOwnerDecision = async (decision: "approve" | "reject" | "waitlist") => {
    if (decision === "reject" && !rejectionReason.trim()) {
      alert("Please provide a constructive reason for rejection.");
      return;
    }
    setActionInProgress(true);
    await executeOwnerReview(booking, decision, rejectionReason, currentUser);
    await loadData();
    setActionInProgress(false);
    setShowRejectInput(false);
  };

  const handleStudentCheckIn = async () => {
    setActionInProgress(true);
    await executeCheckIn(booking, checkInNotes, checkInPhotoUrl, currentUser);
    await loadData();
    setActionInProgress(false);
  };

  const handleStudentCheckOut = async () => {
    setActionInProgress(true);
    await executeCheckOut(booking, checkOutNotes, checkOutPhotoUrl, currentUser);
    await loadData();
    setActionInProgress(false);
  };

  const handleOwnerVerification = async () => {
    setActionInProgress(true);
    await executeReturnVerification(
      booking,
      hasDamage,
      verificationNotes,
      incidentDesc,
      incidentSeverity,
      currentUser
    );
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#ffffff", "#10B981", "#9a9a9a"],
    });
    await loadData();
    setActionInProgress(false);
  };

  return (
    <div className="space-y-8">
      {/* HEADER CARD */}
      <div className="glass-panel p-6 rounded-3xl border border-white/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={booking.resourceImage}
              alt={booking.resourceTitle}
              className="w-16 h-16 rounded-2xl object-cover border border-white/20 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-semibold text-neutral-300 tracking-wider px-2 py-0.5 rounded bg-neutral-900 border border-white/15">
                  {booking.resourceCategory}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  REF: {booking.id}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white mt-0.5">
                {booking.resourceTitle}
              </h1>
              <p className="text-xs text-neutral-300 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  {booking.resourceLocation}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  {booking.date} ({booking.startTime} - {booking.endTime})
                </span>
              </p>
            </div>
          </div>

          {/* Current Status Pill */}
          <div className="text-right">
            <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold mb-1">
              Booking Lifecycle Status
            </div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 text-white border border-white/20 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              STATUS: {booking.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* 10-STEP HORIZONTAL PROGRESS BAR */}
      <div className="glass-panel p-6 rounded-3xl border border-white/15 overflow-x-auto">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-neutral-300" />
          <span>Full 10-Step Operational Lifecycle Tracker</span>
        </h3>

        <div className="min-w-[850px] relative flex items-center justify-between">
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-neutral-800 -z-0" />

          {LIFECYCLE_STEPS.map((s) => {
            const isCompleted = s.step < currentStep || (booking.status === "completed" && s.step <= 10);
            const isCurrent = s.step === currentStep && booking.status !== "completed";
            const isRejected = booking.status === "rejected" && s.step === 4;

            return (
              <div key={s.step} className="flex flex-col items-center text-center z-10 w-20">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isRejected
                      ? "bg-rose-500 text-white"
                      : isCompleted
                      ? "bg-white text-black"
                      : isCurrent
                      ? "bg-neutral-800 text-white border-2 border-white ring-4 ring-white/10"
                      : "bg-neutral-900 text-neutral-500 border border-neutral-800"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 text-black" /> : s.step}
                </div>
                <div className="mt-2">
                  <span
                    className={`block text-[11px] font-semibold ${
                      isCurrent ? "text-white font-bold" : isCompleted ? "text-neutral-200" : "text-neutral-500"
                    }`}
                  >
                    {s.name}
                  </span>
                  <span className="text-[9px] text-neutral-500 leading-tight hidden lg:block">
                    {s.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE WORKFLOW ACTION CONSOLE */}
      <div className="glass-panel p-6 rounded-3xl border border-white/20">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h2 className="text-base font-bold text-white">
              Lifecycle Action Console (Live Step Execution)
            </h2>
          </div>
          <span className="text-xs text-neutral-400">
            Acting as: <strong className="text-white capitalize">{currentUser.fullName} ({currentUser.role})</strong>
          </span>
        </div>

        {/* STEP 4: OWNER REVIEW CONSOLE (If Pending) */}
        {booking.status === "pending" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-white/10 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Step 4: Pending Owner Review
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  Applicant: {booking.userName} ({booking.userDepartment})
                </h4>
                <p className="text-xs text-neutral-300 mt-1">
                  <strong>Stated Purpose:</strong> {booking.purpose}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  FairShare Score: <strong className="text-white">{booking.userFairShareScore}/100</strong> • Credits Reserved: {booking.creditsDeducted}
                </p>
              </div>

              {!isOwnerOrManager && (
                <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-neutral-300 text-xs text-right max-w-xs">
                  Switch to <strong>Dr. Sunita Rao (Owner)</strong> using the judge bar above to test one-click approval or rejection.
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleOwnerDecision("approve")}
                disabled={actionInProgress}
                className="btn btn-solid text-xs h-10 px-5 font-semibold"
              >
                <ThumbsUp className="w-4 h-4 mr-1.5" />
                <span>Approve & Issue Confirmation (Step 5)</span>
              </button>

              <button
                onClick={() => handleOwnerDecision("waitlist")}
                disabled={actionInProgress}
                className="nav-pill text-xs h-10 px-4 cursor-pointer"
              >
                <span>Place on Waiting List</span>
              </button>

              <button
                onClick={() => setShowRejectInput(!showRejectInput)}
                className="px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-rose-300 border border-rose-500/30 text-xs font-medium transition-all"
              >
                <XCircle className="w-4 h-4 mr-1.5 inline" />
                <span>Reject with Mandatory Reason</span>
              </button>
            </div>

            {showRejectInput && (
              <div className="p-4 rounded-xl bg-neutral-950 border border-rose-500/30 space-y-3 mt-3 animate-fadeIn">
                <label className="block text-xs font-semibold text-rose-200">
                  Mandatory Rejection Explanation (Required for FairShare transparency):
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. High-temperature extruder maintenance scheduled during requested time slot."
                  className="w-full px-3 py-2 rounded-lg bg-black border border-rose-500/40 text-white text-xs focus:outline-none"
                />
                <button
                  onClick={() => handleOwnerDecision("reject")}
                  disabled={actionInProgress || !rejectionReason.trim()}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
                >
                  Confirm Rejection & Notify Student
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: CHECK-IN CONSOLE (If Confirmed) */}
        {booking.status === "confirmed" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Step 6: Ready for Student Check-In
              </span>
              <h4 className="text-sm font-bold text-white mt-1">
                Booking Confirmed & Ready for Session Initiation
              </h4>
              <p className="text-xs text-neutral-300 mt-1">
                Verify the equipment condition before powering on. Document any existing cosmetic blemishes to protect your FairShare reputation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Initial Equipment Baseline Condition
                </label>
                <select
                  value={checkInCondition}
                  onChange={(e) => setCheckInCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
                >
                  <option value="Pristine - Clean workspace, power test normal">
                    Pristine - Clean workspace, power test normal
                  </option>
                  <option value="Good - Minor surface wear, fully calibrated">
                    Good - Minor surface wear, fully calibrated
                  </option>
                  <option value="Fair - Cosmetic scratch on chassis, operational">
                    Fair - Cosmetic scratch on chassis, operational
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Check-In Photographic Verification URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={checkInPhotoUrl}
                    onChange={(e) => setCheckInPhotoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => alert("Digital camera capture simulation successful! High-res condition frame timestamped.")}
                    className="p-2 rounded-xl bg-neutral-900 text-white border border-white/15"
                    title="Simulate Photo Capture"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Initial Condition Log & Safety Notes
              </label>
              <textarea
                rows={2}
                value={checkInNotes}
                onChange={(e) => setCheckInNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
              />
            </div>

            <button
              onClick={handleStudentCheckIn}
              disabled={actionInProgress}
              className="btn btn-solid text-xs h-11 px-6 font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>Confirm & Complete Equipment Check-In (Unlock Hardware)</span>
            </button>
          </div>
        )}

        {/* STEP 7: CHECK-OUT CONSOLE (If Checked-In) */}
        {booking.status === "checked_in" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Step 7: Session Active — Return & Check-Out Console
              </span>
              <h4 className="text-sm font-bold text-white mt-1">
                Equipment Currently In Use by {booking.userName}
              </h4>
              <p className="text-xs text-neutral-300 mt-1">
                Check-in logged at: <strong className="text-white">{booking.checkInTimestamp}</strong>. Return the resource clean and report final equipment condition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Final Return Condition
                </label>
                <select
                  value={checkOutCondition}
                  onChange={(e) => setCheckOutCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
                >
                  <option value="Normal Return - Cleaned work area, cables coiled">
                    Normal Return - Cleaned work area, cables coiled
                  </option>
                  <option value="Excellent - Power down completed, calibrated">
                    Excellent - Power down completed, calibrated
                  </option>
                  <option value="Needs Minor Maintenance - Filament replaced">
                    Needs Minor Maintenance - Consumable replaced
                  </option>
                  <option value="Damage Observed - Reported to lab manager">
                    Damage Observed - Reported to lab manager
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Return Verification Photograph URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={checkOutPhotoUrl}
                    onChange={(e) => setCheckOutPhotoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => alert("Return photograph captured and signed with digital hash.")}
                    className="p-2 rounded-xl bg-neutral-900 text-white border border-white/15"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Return Notes / Consumables Used
              </label>
              <textarea
                rows={2}
                value={checkOutNotes}
                onChange={(e) => setCheckOutNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
              />
            </div>

            <button
              onClick={handleStudentCheckOut}
              disabled={actionInProgress}
              className="btn btn-solid text-xs h-11 px-6 font-semibold"
            >
              <ArrowRight className="w-4 h-4 mr-1.5" />
              <span>Complete Check-Out & Return Resource (Proceed to Verification)</span>
            </button>
          </div>
        )}

        {/* STEP 8: OWNER RETURN VERIFICATION CONSOLE (If Checked-Out) */}
        {booking.status === "checked_out" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-white/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Step 8: Owner Return Inspection & Dispute Safeguard
              </span>
              <h4 className="text-sm font-bold text-white mt-1">
                Physical Equipment Return Verification Required
              </h4>
              <p className="text-xs text-neutral-300 mt-1">
                Student returned equipment at: <strong>{booking.checkOutTimestamp}</strong>. Inspect hardware integrity, compare pre/post condition, and finalize lifecycle.
              </p>
            </div>

            {/* AI Condition Anomaly Diff Inspector */}
            {aiAnalysis && (
              <div className="p-4 rounded-xl bg-black border border-white/10 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-white shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Gemini Pre/Post Condition AI Diff:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      aiAnalysis.status === "potential_damage" ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                    }`}>
                      {aiAnalysis.status.toUpperCase()} ({Math.round(aiAnalysis.confidence * 100)}% confidence)
                    </span>
                  </div>
                  <p className="text-neutral-300">{aiAnalysis.summary}</p>
                  <p className="text-white text-[11px] font-medium">{aiAnalysis.recommendationForOwner}</p>
                </div>
              </div>
            )}

            {/* Incident Toggle */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Identify Any Damage or Missing Items?
                </span>
                <span className="text-[11px] text-neutral-400">
                  Toggle on if equipment sustained damage requiring incident review.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHasDamage(!hasDamage)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  hasDamage
                    ? "bg-rose-600 text-white border border-rose-400"
                    : "bg-neutral-800 text-neutral-200 border border-white/15"
                }`}
              >
                {hasDamage ? "⚠️ Damage Identified" : "✓ Clean Return (No Damage)"}
              </button>
            </div>

            {hasDamage && (
              <div className="p-4 rounded-xl bg-neutral-950 border border-rose-500/30 space-y-3">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Open Institutional Incident Report</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Severity Tier
                  </label>
                  <select
                    value={incidentSeverity}
                    onChange={(e: any) => setIncidentSeverity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white text-xs"
                  >
                    <option value="minor">Minor (-5 credits penalty) - Cosmetic scuff or loose knob</option>
                    <option value="moderate">Moderate (-15 credits penalty) - Snapped drill bit or damaged cable</option>
                    <option value="critical">Critical (-30 credits penalty) - Core mechanism or optical damage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Incident Description & Evidence
                  </label>
                  <textarea
                    rows={2}
                    value={incidentDesc}
                    onChange={(e) => setIncidentDesc(e.target.value)}
                    placeholder="Describe observed damage, probable cause, and required repairs..."
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Owner Verification Sign-off Notes
              </label>
              <textarea
                rows={2}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
              />
            </div>

            <button
              onClick={handleOwnerVerification}
              disabled={actionInProgress}
              className="btn btn-solid text-xs h-11 px-6 font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>Sign Off Return, Finalize Booking & Seal Audit Trail</span>
            </button>
          </div>
        )}

        {/* STEP 9 & 10: COMPLETED CELEBRATION */}
        {booking.status === "completed" && (
          <div className="p-6 rounded-2xl bg-neutral-950 border border-white/15 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-white mx-auto" />
            <h3 className="text-lg font-bold text-white">
              Lifecycle Successfully Completed & Archived
            </h3>
            <p className="text-xs text-neutral-300 max-w-xl mx-auto leading-relaxed">
              This reservation has completed all 10 stages of the ResourceX governance cycle. Physical return verified by lab owner.
              {!booking.hasIncident && (
                <span className="block text-emerald-400 font-semibold mt-1">
                  🌟 On-time return bonus awarded: +2 FairShare reputation points added to {booking.userName}.
                </span>
              )}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-[11px] text-neutral-400 font-mono border border-white/10">
              <Lock className="w-3.5 h-3.5 text-neutral-300" />
              <span>Audit Chain Hash: RX-{booking.id.replace("bk_", "").toUpperCase()}-SECURE</span>
            </div>
          </div>
        )}

        {/* REJECTED NOTICE */}
        {booking.status === "rejected" && (
          <div className="p-4 rounded-2xl bg-neutral-950 border border-rose-500/25 space-y-1">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <XCircle className="w-5 h-5" />
              <span>Reservation Request Rejected by Resource Owner</span>
            </div>
            <p className="text-xs text-neutral-300">
              <strong>Official Rationale:</strong> {booking.rejectionReason || "Slot conflicting with routine campus maintenance."}
            </p>
            <p className="text-[11px] text-neutral-500">
              FairShare reserved credits have been fully restored to your student account.
            </p>
          </div>
        )}
      </div>

      {/* STEP 10: CHRONOLOGICAL AUDIT TIMELINE */}
      <div className="glass-panel p-6 rounded-3xl border border-white/15 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-neutral-300" />
            <h3 className="text-sm font-semibold text-white">
              Step 10: Immutable Chronological Audit Trail ({auditEvents.length} Verified Events)
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">
            POSTGRESQL AUDIT TABLE
          </span>
        </div>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-neutral-800">
          {auditEvents.map((evt) => (
            <div key={evt.id} className="relative flex items-start gap-4 pl-8 group">
              <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-white ring-4 ring-black shrink-0" />
              <div className="flex-1 p-3.5 rounded-xl bg-black/60 border border-white/5 space-y-1 group-hover:border-white/20 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-900 text-neutral-300 border border-white/10">
                      Step {evt.stepNumber}: {evt.stepName}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {evt.action}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-neutral-300">{evt.details}</p>
                <div className="text-[10px] text-neutral-500 pt-0.5 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-neutral-400" />
                  <span>Executed by: <strong className="text-neutral-300">{evt.actorName}</strong> ({evt.actorRole})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
