"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getResourceById } from "@/lib/db";
import { Resource } from "@/types";
import BookingRequestModal from "@/components/booking/BookingRequestModal";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calendar,
  User as UserIcon,
  Lock,
} from "lucide-react";

export default function ResourceDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const r = await getResourceById(id);
      setResource(r);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-neutral-400">
        <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto mb-2" />
        <p className="text-xs">Loading resource specifications from database...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-md mx-auto py-16 text-center glass-panel rounded-2xl p-8 space-y-3 border border-white/10">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Resource Not Found</h2>
        <p className="text-xs text-neutral-400">
          The requested asset could not be located in the campus database.
        </p>
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-xs text-white font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/resources"
          className="nav-pill text-xs h-9 px-3.5 inline-flex items-center gap-1.5 text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Campus Equipment Catalog</span>
        </Link>
      </div>

      {/* Main Grid: Left Media & Content, Right Booking Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Hero Card */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/15">
            <div className="relative h-72 sm:h-96 w-full bg-neutral-950">
              <img
                src={resource.imageUrl}
                alt={resource.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-black/80 text-white border border-white/20 backdrop-blur-md">
                  {resource.category}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 backdrop-blur-md capitalize">
                  {resource.condition} Condition
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {resource.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                  {resource.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                  Owner: {resource.ownerName} ({resource.ownerRole})
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/10 pt-4">
                {resource.description}
              </p>
            </div>
          </div>

          {/* Safety Protocols & Operating Guidelines */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-white" />
              <h2 className="text-base font-semibold text-white">
                Mandatory Safety Protocols & Lab Directives
              </h2>
            </div>

            <div className="space-y-2">
              {resource.safetyInstructions.map((instruction, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-black/50 border border-white/5 flex items-start gap-2.5 text-xs text-neutral-300"
                >
                  <span className="w-4 h-4 rounded bg-neutral-800 text-neutral-200 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-white/10 font-mono">
                    {idx + 1}
                  </span>
                  <span>{instruction}</span>
                </div>
              ))}
            </div>

            {resource.usageRestrictions && (
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200">
                <strong>Usage Restrictions:</strong> {resource.usageRestrictions}
              </div>
            )}
          </div>

          {/* Prerequisite Training & Qualifications */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-neutral-300" />
              <span>Prerequisites & Clearance Requirements</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Required Training Modules
                </span>
                <ul className="space-y-1.5">
                  {resource.requiredTraining.map((t, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-neutral-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Academic Eligibility
                </span>
                <ul className="space-y-1.5">
                  {resource.requiredQualifications.map((q, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-neutral-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/20 sticky top-24 space-y-5">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Allocation Parameters
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-white font-mono">
                  {resource.fairShareCost}
                </span>
                <span className="text-xs text-neutral-400">FairShare credits / hr</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2.5 text-xs text-neutral-300">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" /> Operating Window
                </span>
                <span className="font-semibold text-white font-mono">
                  {resource.availableTimeStart} - {resource.availableTimeEnd}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" /> Available Days
                </span>
                <span className="font-semibold text-white">
                  {resource.availableDays.join(", ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Max Session Length</span>
                <span className="font-semibold text-white font-mono">
                  {resource.maxBookingHours} Hours
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Review Policy</span>
                <span className="font-semibold text-white">
                  {resource.approvalRequired ? "Owner Review Required" : "Instant Auto-Approval"}
                </span>
              </div>
            </div>

            {/* FairShare Off-peak Tip */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10 text-[11px] text-neutral-300 flex items-start gap-2">
              <Zap className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>
                Schedule after 16:00 to receive a 20% off-peak discount and preserve weekly quota!
              </span>
            </div>

            {/* Book Now Button */}
            <button
              onClick={() => setIsBookingOpen(true)}
              className="btn btn-solid w-full text-xs h-11 font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Request Reservation (Step 1-3)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Booking Request Modal */}
      {resource && (
        <BookingRequestModal
          resource={resource}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </div>
  );
}
