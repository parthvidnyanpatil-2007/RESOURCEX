"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import BookingLifecycleView from "@/components/booking/BookingLifecycleView";
import { ArrowLeft, Layers, ShieldCheck } from "lucide-react";

export default function BookingLifecyclePage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/student"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-campus-cyan" />
          <span>Back to Reservations Hub</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-campus-muted">
          <ShieldCheck className="w-4 h-4 text-campus-cyan" />
          <span>CODE HACK INDIA 2026 Verified Governance</span>
        </div>
      </div>

      {/* 10-Step Lifecycle View */}
      <BookingLifecycleView bookingId={id} />
    </div>
  );
}
