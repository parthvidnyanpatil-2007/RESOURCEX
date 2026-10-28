"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getBookings } from "@/lib/db";
import { Booking } from "@/types";
import FairShareWidget from "@/components/fairshare/FairShareWidget";
import {
  CalendarCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
} from "lucide-react";

export default function StudentDashboardPage() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "pending" | "completed">("all");

  useEffect(() => {
    async function load() {
      const bks = await getBookings();
      setBookings(bks.filter((b) => b.userId === currentUser.id));
    }
    load();
  }, [currentUser]);

  const activeBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "checked_in"
  );
  const pendingRequests = bookings.filter((b) => b.status === "pending" || b.status === "waitlisted");
  const completedBookings = bookings.filter((b) => b.status === "completed");

  const displayedBookings = bookings.filter((b) => {
    if (filterTab === "active") return b.status === "confirmed" || b.status === "checked_in";
    if (filterTab === "pending") return b.status === "pending" || b.status === "waitlisted";
    if (filterTab === "completed") return b.status === "completed";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="w-16 h-16 rounded-2xl object-cover border border-white/20 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-neutral-300 tracking-wider px-2 py-0.5 rounded bg-neutral-900 border border-white/15">
                STUDENT PORTAL
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                {currentUser.studentId || "AIT-2024-STU"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Welcome back, {currentUser.fullName}
            </h1>
            <p className="text-xs text-neutral-400">
              {currentUser.department} • Apex Institute of Technology
            </p>
          </div>
        </div>

        <Link
          href="/resources"
          className="btn btn-solid text-xs h-10 px-5 shrink-0"
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          <span>Discover New Resources</span>
        </Link>
      </div>

      {/* FairShare Reputation & Quota Widget */}
      <FairShareWidget user={currentUser} bookings={bookings} />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-neutral-400">Active Bookings</span>
          <div className="text-2xl font-bold text-white font-mono">
            {activeBookings.length}
          </div>
          <p className="text-[10px] text-emerald-400">Ready for check-in</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-neutral-400">Pending Review</span>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {pendingRequests.length}
          </div>
          <p className="text-[10px] text-neutral-400">Awaiting lab owner</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-neutral-400">Completed Sessions</span>
          <div className="text-2xl font-bold text-white font-mono">
            {completedBookings.length}
          </div>
          <p className="text-[10px] text-emerald-400">100% On-time return rate</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-neutral-400">Active Certifications</span>
          <div className="text-2xl font-bold text-neutral-300 font-mono">
            {currentUser.certifications.length}
          </div>
          <p className="text-[10px] text-neutral-400">Safety clearance valid</p>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">My Campus Reservations</h2>
            <p className="text-xs text-neutral-400">
              Track lifecycle stages, execute check-in/out, and view audit history.
            </p>
          </div>

          {/* Filter Tabs using nav-pill */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterTab("all")}
              className={`nav-pill text-xs h-8 px-3 ${filterTab === "all" ? "nav-pill-active" : ""}`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilterTab("active")}
              className={`nav-pill text-xs h-8 px-3 ${filterTab === "active" ? "nav-pill-active" : ""}`}
            >
              Active ({activeBookings.length})
            </button>
            <button
              onClick={() => setFilterTab("pending")}
              className={`nav-pill text-xs h-8 px-3 ${filterTab === "pending" ? "nav-pill-active" : ""}`}
            >
              Pending ({pendingRequests.length})
            </button>
            <button
              onClick={() => setFilterTab("completed")}
              className={`nav-pill text-xs h-8 px-3 ${filterTab === "completed" ? "nav-pill-active" : ""}`}
            >
              Completed ({completedBookings.length})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {displayedBookings.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl max-w-md mx-auto space-y-3 border border-white/10">
            <CalendarCheck className="w-10 h-10 text-neutral-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No Reservations Found</h3>
            <p className="text-xs text-neutral-400">
              You do not have any reservations under the selected filter tab.
            </p>
            <Link
              href="/resources"
              className="inline-flex items-center gap-1 text-xs text-white font-medium hover:underline"
            >
              <span>Explore Available Resources</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedBookings.map((b) => (
              <div
                key={b.id}
                className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-white/25 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={b.resourceImage}
                    alt={b.resourceTitle}
                    className="w-16 h-16 rounded-xl object-cover border border-white/15 shrink-0 mt-0.5"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-300 px-2 py-0.5 rounded bg-neutral-900 border border-white/15">
                        {b.resourceCategory}
                      </span>
                      <span className="text-xs text-neutral-500 font-mono">{b.id}</span>
                    </div>
                    <h3 className="text-base font-semibold text-white">{b.resourceTitle}</h3>
                    <p className="text-xs text-neutral-300 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        {b.resourceLocation}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        {b.date} ({b.startTime} - {b.endTime})
                      </span>
                    </p>
                    <p className="text-[11px] text-neutral-400 line-clamp-1">
                      <strong>Purpose:</strong> {b.purpose}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border font-mono ${
                        b.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : b.status === "confirmed"
                          ? "bg-neutral-800 text-neutral-200 border-neutral-700"
                          : b.status === "checked_in"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : b.status === "pending"
                          ? "bg-neutral-900 text-neutral-400 border-neutral-800"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {b.status}
                    </span>
                    <div className="text-[10px] text-neutral-500 mt-1 font-mono">
                      {b.creditsDeducted} credits reserved
                    </div>
                  </div>

                  <Link
                    href={`/bookings/${b.id}`}
                    className="btn btn-ghost-hero text-xs h-9 px-4 shrink-0"
                  >
                    <span>Manage Lifecycle</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
