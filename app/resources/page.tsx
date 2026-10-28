"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getResources } from "@/lib/db";
import { Resource } from "@/types";
import { useAuth } from "@/lib/auth-context";
import ResourceCard from "@/components/resources/ResourceCard";
import ResourceFilterBar from "@/components/resources/ResourceFilterBar";
import BookingRequestModal from "@/components/booking/BookingRequestModal";
import ResourceListingModal from "@/components/owner/ResourceListingModal";
import { Plus, Layers } from "lucide-react";

export default function ResourcesPage() {
  const { isOwnerOrManager } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  // Modals
  const [bookingResource, setBookingResource] = useState<Resource | null>(null);
  const [isListingOpen, setIsListingOpen] = useState(false);

  const loadResources = async () => {
    setLoading(true);
    const data = await getResources();
    setResources(data);
    setLoading(false);
  };

  useEffect(() => {
    loadResources();
  }, []);

  const locations = useMemo(() => {
    const set = new Set(resources.map((r) => r.location));
    return Array.from(set);
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchSearch =
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === "all" || res.category === selectedCategory;

      const matchStatus =
        selectedStatus === "all" || res.status === selectedStatus;

      const matchLocation =
        selectedLocation === "all" || res.location === selectedLocation;

      return matchSearch && matchCategory && matchStatus && matchLocation;
    });
  }, [resources, searchQuery, selectedCategory, selectedStatus, selectedLocation]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Apex Institute of Technology
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mt-1">
            Campus Equipment & Laboratories
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Browse and reserve verified academic equipment, testing suites, and collaborative innovation spaces.
          </p>
        </div>

        {isOwnerOrManager && (
          <button
            onClick={() => setIsListingOpen(true)}
            className="btn btn-solid text-xs h-10 px-4"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>List New Resource</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <ResourceFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        locations={locations}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/10">
        <span>
          Showing <strong className="text-white">{filteredResources.length}</strong> resources
        </span>
        <span className="text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Realtime PostgreSQL Sync Active
        </span>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-panel h-80 rounded-2xl animate-pulse bg-neutral-900/40" />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl max-w-md mx-auto space-y-3 border border-white/10">
          <Layers className="w-10 h-10 text-neutral-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Matching Resources</h3>
          <p className="text-xs text-neutral-400">
            Try adjusting your search query, selecting &ldquo;All Categories&rdquo;, or resetting your status filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedStatus("all");
              setSelectedLocation("all");
            }}
            className="text-xs text-white font-medium hover:underline"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onQuickBook={(res) => setBookingResource(res)}
            />
          ))}
        </div>
      )}

      {/* Quick Booking Modal */}
      {bookingResource && (
        <BookingRequestModal
          resource={bookingResource}
          isOpen={true}
          onClose={() => setBookingResource(null)}
        />
      )}

      {/* Add New Resource Modal */}
      <ResourceListingModal
        isOpen={isListingOpen}
        onClose={() => setIsListingOpen(false)}
        onSuccess={() => loadResources()}
      />
    </div>
  );
}
