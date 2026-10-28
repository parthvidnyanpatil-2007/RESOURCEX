"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  getResources,
  getBookings,
  deleteResource,
  getIncidents,
} from "@/lib/db";
import { Resource, Booking, Incident } from "@/types";
import ResourceListingModal from "@/components/owner/ResourceListingModal";
import { executeOwnerReview } from "@/lib/booking-lifecycle";
import {
  Plus,
  ThumbsUp,
  AlertTriangle,
  ArrowRight,
  Edit,
  Trash2,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function ResourceOwnerDashboard() {
  const { currentUser } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // Modals & Action States
  const [isListingOpen, setIsListingOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [activeTab, setActiveTab] = useState<"requests" | "inventory" | "returns" | "incidents">("requests");

  // Rejection modal state
  const [rejectBookingId, setRejectBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadData = async () => {
    const allRes = await getResources();
    setResources(allRes);
    const allBks = await getBookings();
    setBookings(allBks);
    const allInc = await getIncidents();
    setIncidents(allInc);
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingRequests = bookings.filter((b) => b.status === "pending");
  const returnAwaitingVerification = bookings.filter((b) => b.status === "checked_out");
  const activeLoans = bookings.filter((b) => b.status === "checked_in");

  const handleDecision = async (booking: Booking, decision: "approve" | "reject" | "waitlist") => {
    if (decision === "reject" && !rejectReason.trim()) {
      alert("Please enter a constructive reason for rejection.");
      return;
    }
    await executeOwnerReview(booking, decision, rejectReason, currentUser);
    setRejectBookingId(null);
    setRejectReason("");
    await loadData();
  };

  const handleDeleteResource = async (id: string) => {
    if (confirm("Are you sure you want to remove this resource from campus availability?")) {
      await deleteResource(id);
      await loadData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
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
                RESOURCE OWNER & LAB MANAGER CONSOLE
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                {currentUser.institution}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              {currentUser.fullName}
            </h1>
            <p className="text-xs text-neutral-400">
              {currentUser.department} • Governance & Equipment Oversight
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingResource(null);
            setIsListingOpen(true);
          }}
          className="btn btn-solid text-xs h-10 px-5 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>List New Campus Equipment</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-neutral-400">Pending Approvals</span>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {pendingRequests.length}
          </div>
          <p className="text-[10px] text-amber-300">Action required (Step 4)</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-neutral-400">Active Borrows (In Use)</span>
          <div className="text-2xl font-bold text-white font-mono">
            {activeLoans.length}
          </div>
          <p className="text-[10px] text-emerald-400">Currently deployed on campus</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-neutral-400">Returns to Verify</span>
          <div className="text-2xl font-bold text-neutral-300 font-mono">
            {returnAwaitingVerification.length}
          </div>
          <p className="text-[10px] text-neutral-400">Physical inspection pending</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-neutral-400">Incident Inquiries</span>
          <div className="text-2xl font-bold text-rose-400 font-mono">
            {incidents.filter((i) => i.status === "open").length}
          </div>
          <p className="text-[10px] text-rose-400">Damage/Penalty reviews</p>
        </div>
      </div>

      {/* Navigation Tabs (Liquid Metal Pills) */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("requests")}
          className={`nav-pill text-xs h-9 px-3.5 cursor-pointer ${
            activeTab === "requests" ? "nav-pill-active" : ""
          }`}
        >
          <span>Incoming Requests</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-300 border border-white/10">
            {pendingRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`nav-pill text-xs h-9 px-3.5 cursor-pointer ${
            activeTab === "inventory" ? "nav-pill-active" : ""
          }`}
        >
          <span>Inventory & Availability ({resources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("returns")}
          className={`nav-pill text-xs h-9 px-3.5 cursor-pointer ${
            activeTab === "returns" ? "nav-pill-active" : ""
          }`}
        >
          <span>Return Verifications ({returnAwaitingVerification.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("incidents")}
          className={`nav-pill text-xs h-9 px-3.5 cursor-pointer ${
            activeTab === "incidents" ? "nav-pill-active" : ""
          }`}
        >
          <span>Incident Reports ({incidents.length})</span>
        </button>
      </div>

      {/* TAB 1: INCOMING REQUESTS QUEUE */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl max-w-md mx-auto space-y-2 border border-white/10">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">All Clear!</h3>
              <p className="text-xs text-neutral-400">
                There are no pending requests awaiting review at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="glass-panel p-5 rounded-2xl border border-white/15 space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={req.resourceImage}
                        alt={req.resourceTitle}
                        className="w-16 h-16 rounded-xl object-cover border border-white/15 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                            STEP 4 REVIEW
                          </span>
                          <span className="text-xs text-neutral-500 font-mono">{req.id}</span>
                        </div>
                        <h3 className="text-base font-bold text-white">{req.resourceTitle}</h3>
                        <p className="text-xs text-neutral-300">
                          <strong>Applicant:</strong> {req.userName} ({req.userDepartment}) • FairShare Score:{" "}
                          <strong className="text-white">{req.userFairShareScore}/100</strong>
                        </p>
                        <p className="text-xs text-neutral-400 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{req.date} ({req.startTime} - {req.endTime}) • {req.durationHours} hrs</span>
                        </p>
                        <div className="p-3 rounded-xl bg-black/60 border border-white/5 text-xs text-neutral-300 mt-2">
                          <strong>Academic / Research Purpose:</strong> {req.purpose}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDecision(req, "approve")}
                        className="btn btn-solid text-xs h-9 px-4 font-semibold"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1.5" />
                        <span>Approve Slot</span>
                      </button>

                      <button
                        onClick={() => handleDecision(req, "waitlist")}
                        className="nav-pill text-xs h-9 px-3.5 cursor-pointer"
                      >
                        Waitlist
                      </button>

                      <button
                        onClick={() => setRejectBookingId(req.id)}
                        className="px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-rose-300 border border-rose-500/30 text-xs font-medium transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Rejection input dropdown */}
                  {rejectBookingId === req.id && (
                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-rose-500/30 space-y-2 animate-fadeIn">
                      <label className="block text-xs font-semibold text-rose-200">
                        Reason for Rejection (Visible to student in audit log):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="e.g. Laboratory is reserved for graduate thesis defense during this window."
                          className="flex-1 px-3 py-2 rounded-lg bg-black border border-rose-500/40 text-white text-xs focus:outline-none"
                        />
                        <button
                          onClick={() => handleDecision(req, "reject")}
                          className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setRejectBookingId(null)}
                          className="px-3 py-2 rounded-lg bg-neutral-900 text-neutral-400 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INVENTORY MANAGEMENT */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <div
                key={res.id}
                className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="relative h-40 w-full rounded-xl overflow-hidden bg-neutral-950">
                    <img
                      src={res.imageUrl}
                      alt={res.title}
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-black/80 text-white border border-white/20">
                        {res.category}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 capitalize">
                        {res.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-white line-clamp-1">{res.title}</h3>
                  <p className="text-xs text-neutral-400 line-clamp-2">{res.description}</p>

                  <div className="pt-1 text-xs text-neutral-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Location:</span>
                      <span className="font-semibold text-white truncate max-w-[180px]">{res.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Operating Window:</span>
                      <span className="font-mono">{res.availableTimeStart} - {res.availableTimeEnd}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Total Bookings:</span>
                      <span className="font-bold text-white font-mono">{res.totalBookings}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setEditingResource(res);
                      setIsListingOpen(true);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-white/15 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteResource(res.id)}
                    className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-rose-400 border border-white/10"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RETURN VERIFICATIONS */}
      {activeTab === "returns" && (
        <div className="space-y-4">
          {returnAwaitingVerification.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl max-w-md mx-auto space-y-2 border border-white/10">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Pending Returns</h3>
              <p className="text-xs text-neutral-400">
                All completed equipment returns have been verified by lab owners.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {returnAwaitingVerification.map((b) => (
                <div
                  key={b.id}
                  className="glass-panel p-5 rounded-2xl border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={b.resourceImage}
                      alt={b.resourceTitle}
                      className="w-14 h-14 rounded-xl object-cover border border-white/15 shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-300 px-2 py-0.5 rounded bg-neutral-900 border border-white/15">
                        STEP 8 RETURN INSPECTION
                      </span>
                      <h3 className="text-base font-bold text-white">{b.resourceTitle}</h3>
                      <p className="text-xs text-neutral-300">
                        Returned by: <strong>{b.userName}</strong> at {b.checkOutTimestamp}
                      </p>
                      <p className="text-xs text-neutral-400">
                        Return notes: &ldquo;{b.checkOutNotes}&rdquo;
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/bookings/${b.id}`}
                    className="btn btn-solid text-xs h-10 px-5 shrink-0"
                  >
                    <span>Conduct Inspection (Step 8)</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: INCIDENT REPORTS */}
      {activeTab === "incidents" && (
        <div className="space-y-4">
          <div className="space-y-3">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="glass-panel p-5 rounded-2xl border border-rose-500/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                      Severity: {inc.severity}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">{inc.id}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-300 border border-rose-500/30">
                    Status: {inc.status}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white">{inc.resourceTitle}</h3>
                <p className="text-xs text-neutral-300">{inc.description}</p>
                {inc.resolutionNotes && (
                  <p className="text-xs text-emerald-400 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20">
                    <strong>Resolution Action:</strong> {inc.resolutionNotes}
                  </p>
                )}
                <div className="text-[10px] text-neutral-500 pt-1">
                  Reported by: <strong>{inc.reportedByName}</strong> ({inc.reportedRole}) • Penalty: -{inc.damagePenaltyCredits} FairShare credits
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resource Listing Modal */}
      <ResourceListingModal
        isOpen={isListingOpen}
        onClose={() => setIsListingOpen(false)}
        onSuccess={() => loadData()}
        editingResource={editingResource}
      />
    </div>
  );
}
