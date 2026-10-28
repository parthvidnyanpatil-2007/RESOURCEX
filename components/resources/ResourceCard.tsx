"use client";

import React from "react";
import Link from "next/link";
import { Resource } from "@/types";
import {
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Props {
  resource: Resource;
  onQuickBook?: (resource: Resource) => void;
}

export default function ResourceCard({ resource, onQuickBook }: Props) {
  const getStatusBadge = (status: Resource["status"]) => {
    switch (status) {
      case "available":
        return {
          label: "Available",
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          dot: "bg-emerald-400",
        };
      case "in_use":
        return {
          label: "In Active Use",
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          dot: "bg-amber-400",
        };
      case "maintenance":
        return {
          label: "Maintenance",
          bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          dot: "bg-rose-400",
        };
      default:
        return {
          label: "Reserved",
          bg: "bg-neutral-800 text-neutral-300 border-neutral-700",
          dot: "bg-neutral-400",
        };
    }
  };

  const statusBadge = getStatusBadge(resource.status);

  return (
    <div className="group glass-panel rounded-2xl overflow-hidden flex flex-col justify-between glass-panel-hover border border-white/10 hover:border-white/25">
      <div>
        {/* Image & Header Badges */}
        <div className="relative h-48 w-full overflow-hidden bg-neutral-950">
          <img
            src={resource.imageUrl}
            alt={resource.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />

          {/* Category Pill */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-black/80 text-neutral-200 border border-white/20 backdrop-blur-md">
              {resource.category}
            </span>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border backdrop-blur-md ${statusBadge.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
              {statusBadge.label}
            </span>
          </div>

          {/* Credit Cost Badge */}
          <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/15 flex items-center gap-1 text-xs">
            <Zap className="w-3.5 h-3.5 text-neutral-300 fill-neutral-300" />
            <span className="font-bold text-white font-mono">{resource.fairShareCost}</span>
            <span className="text-[10px] text-neutral-400">pts/hr</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-white group-hover:text-neutral-200 transition-colors line-clamp-1">
              {resource.title}
            </h3>
            <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
              {resource.description}
            </p>
          </div>

          {/* Metadata Row */}
          <div className="space-y-1.5 pt-1 text-xs text-neutral-300">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{resource.location}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span>
                  Max {resource.maxBookingHours}h/session ({resource.availableTimeStart} - {resource.availableTimeEnd})
                </span>
              </div>
              <span className="text-neutral-300 capitalize font-medium">
                {resource.condition} condition
              </span>
            </div>
          </div>

          {/* Required Training Badge */}
          {resource.requiredTraining.length > 0 && (
            <div className="pt-2 border-t border-white/5">
              <div className="flex items-center gap-1 text-[11px] text-neutral-300 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="font-medium text-neutral-400">Clearance:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {resource.requiredTraining.slice(0, 2).map((cert, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 text-[10px] border border-white/10 truncate max-w-[200px]"
                  >
                    {cert}
                  </span>
                ))}
                {resource.requiredTraining.length > 2 && (
                  <span className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-500 text-[10px]">
                    +{resource.requiredTraining.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-5 pt-0 flex items-center gap-2">
        <Link
          href={`/resources/${resource.id}`}
          className="flex-1 py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-white/15 text-xs font-medium text-center transition-all flex items-center justify-center gap-1.5"
        >
          <span>View Guidelines</span>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
        </Link>

        {onQuickBook && (
          <button
            onClick={() => onQuickBook(resource)}
            className="btn btn-solid text-xs h-8 px-4 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>Book</span>
          </button>
        )}
      </div>
    </div>
  );
}
