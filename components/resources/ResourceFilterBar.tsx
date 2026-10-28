"use client";

import React from "react";
import { Search, Check } from "lucide-react";

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  locations: string[];
}

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "robotics", label: "Robotics" },
  { id: "computing", label: "AI & Supercomputing" },
  { id: "fabrication", label: "3D & Fabrication" },
  { id: "iot", label: "IoT & Microcontrollers" },
  { id: "media", label: "Media & Cinema" },
  { id: "spaces", label: "Halls & Studios" },
  { id: "testing", label: "Testing & RF" },
];

export default function ResourceFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedLocation,
  onLocationChange,
  locations,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Search Input & Dropdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search equipment, labs, 3D printers, GPUs, spaces..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/70 border border-white/15 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white/40 shadow-sm"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-black/70 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40 shadow-sm"
          >
            <option value="all">All Availability Statuses</option>
            <option value="available">🟢 Available Now</option>
            <option value="in_use">🟡 Currently In Use</option>
            <option value="maintenance">🔴 Maintenance Scheduled</option>
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-black/70 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40 shadow-sm"
          >
            <option value="all">All Campus Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills (Liquid Metal) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`nav-pill text-xs h-9 px-3.5 cursor-pointer ${
                isActive ? "nav-pill-active" : ""
              }`}
            >
              <span>{cat.label}</span>
              {isActive && <Check className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
