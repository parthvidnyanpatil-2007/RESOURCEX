"use client";

import React, { useState } from "react";
import { Resource, ResourceCategory, EquipmentCondition } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { createResource, updateResource } from "@/lib/db";
import { X, Layers, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (resource: Resource) => void;
  editingResource?: Resource | null;
}

export default function ResourceListingModal({
  isOpen,
  onClose,
  onSuccess,
  editingResource,
}: Props) {
  const { currentUser } = useAuth();

  const [title, setTitle] = useState(editingResource?.title || "");
  const [category, setCategory] = useState<ResourceCategory>(editingResource?.category || "robotics");
  const [description, setDescription] = useState(editingResource?.description || "");
  const [location, setLocation] = useState(editingResource?.location || "Innovation Hub, Bay 01");
  const [imageUrl, setImageUrl] = useState(
    editingResource?.imageUrl || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
  );
  const [condition] = useState<EquipmentCondition>(editingResource?.condition || "excellent");
  const [availableTimeStart, setAvailableTimeStart] = useState(editingResource?.availableTimeStart || "09:00");
  const [availableTimeEnd, setAvailableTimeEnd] = useState(editingResource?.availableTimeEnd || "18:00");
  const [maxBookingHours, setMaxBookingHours] = useState(editingResource?.maxBookingHours || 3);
  const [fairShareCost, setFairShareCost] = useState(editingResource?.fairShareCost || 5);
  const [approvalRequired, setApprovalRequired] = useState(editingResource?.approvalRequired ?? true);

  const [trainingInput, setTrainingInput] = useState(editingResource?.requiredTraining?.join(", ") || "Safety Orientation 101, Lab Certification Level 1");
  const [qualificationsInput, setQualificationsInput] = useState(editingResource?.requiredQualifications?.join(", ") || "Enrolled STEM Student");
  const [safetyInstructionsInput, setSafetyInstructionsInput] = useState(
    editingResource?.safetyInstructions?.join("\n") ||
      "Wear approved PPE inside laboratory.\nReport any anomalous vibration or heat immediately.\nKeep emergency shutoff clear."
  );
  const [usageRestrictions, setUsageRestrictions] = useState(
    editingResource?.usageRestrictions || "Strictly academic research and verified capstone coursework. No unauthorized external commercial work."
  );

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const requiredTraining = trainingInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const requiredQualifications = qualificationsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const safetyInstructions = safetyInstructionsInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    let result: Resource;

    if (editingResource) {
      result = await updateResource(editingResource.id, {
        title,
        category,
        description,
        location,
        imageUrl,
        condition,
        availableTimeStart,
        availableTimeEnd,
        maxBookingHours,
        fairShareCost,
        approvalRequired,
        requiredTraining,
        requiredQualifications,
        safetyInstructions,
        usageRestrictions,
      });
    } else {
      result = await createResource({
        title,
        category,
        description,
        location,
        ownerId: currentUser.id,
        ownerName: currentUser.fullName,
        ownerRole: currentUser.role === "owner" ? "Lab Director" : "Facility Supervisor",
        imageUrl,
        status: "available",
        condition,
        availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        availableTimeStart,
        availableTimeEnd,
        maxBookingHours,
        requiredTraining,
        requiredQualifications,
        safetyInstructions,
        usageRestrictions,
        approvalRequired,
        fairShareCost,
      });
    }

    setLoading(false);
    onSuccess(result);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-neutral-950 border border-white/20 rounded-3xl shadow-2xl overflow-hidden relative my-8">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/15 flex items-center justify-center text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingResource ? "Edit Campus Resource" : "List New Campus Equipment / Space"}
              </h2>
              <p className="text-xs text-neutral-400">
                Define access parameters, safety prerequisites, and FairShare quotas.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Resource Name & Model
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. KUKA Industrial Robotic Arm"
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
              >
                <option value="robotics">Robotics</option>
                <option value="computing">High-Perf Computing</option>
                <option value="fabrication">Fabrication & 3D</option>
                <option value="iot">IoT & Embedded</option>
                <option value="media">Media & AV</option>
                <option value="spaces">Labs & Halls</option>
                <option value="testing">Testing & RF</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Technical Description & Capabilities
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State hardware specs, resolution, tool interfaces, payload capacity..."
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
            />
          </div>

          {/* Location & Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Campus Location (Building & Room)
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Tech Tower B, Room 304"
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Resource Image URL
              </label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Operating Hours & Duration & Quota */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Available From
              </label>
              <input
                type="time"
                value={availableTimeStart}
                onChange={(e) => setAvailableTimeStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Available Until
              </label>
              <input
                type="time"
                value={availableTimeEnd}
                onChange={(e) => setAvailableTimeEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Max Hours / Booking
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={maxBookingHours}
                onChange={(e) => setMaxBookingHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Credits / Hour
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={fairShareCost}
                onChange={(e) => setFairShareCost(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
              />
            </div>
          </div>

          {/* Training & Qualifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Required Training (comma-separated)
              </label>
              <input
                type="text"
                value={trainingInput}
                onChange={(e) => setTrainingInput(e.target.value)}
                placeholder="Robotics Lab Tier-1, High Voltage Safety"
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Required Qualifications
              </label>
              <input
                type="text"
                value={qualificationsInput}
                onChange={(e) => setQualificationsInput(e.target.value)}
                placeholder="Enrolled STEM Student, Faculty Sponsor"
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
              />
            </div>
          </div>

          {/* Safety Instructions & Restrictions */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Safety Protocols & Operating Directives (one per line)
            </label>
            <textarea
              rows={2}
              value={safetyInstructionsInput}
              onChange={(e) => setSafetyInstructionsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Usage Restrictions
            </label>
            <input
              type="text"
              value={usageRestrictions}
              onChange={(e) => setUsageRestrictions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-white text-xs"
            />
          </div>

          {/* Approval Requirement Checkbox */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-900 border border-white/10">
            <input
              type="checkbox"
              id="approvalRequired"
              checked={approvalRequired}
              onChange={(e) => setApprovalRequired(e.target.checked)}
              className="w-4 h-4 rounded text-white focus:ring-white bg-black border-white/20"
            />
            <label htmlFor="approvalRequired" className="text-xs text-neutral-300 font-medium cursor-pointer">
              Require explicit owner review & approval before slot confirmation (Human-in-the-loop oversight)
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-solid text-xs h-10 px-6 font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>{editingResource ? "Save Modifications" : "Publish to Campus Network"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
