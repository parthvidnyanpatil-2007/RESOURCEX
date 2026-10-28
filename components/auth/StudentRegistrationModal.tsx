"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { X, UserCheck, ShieldAlert, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentRegistrationModal({ isOpen, onClose }: Props) {
  const { registerStudent } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Robotics & Artificial Intelligence");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    await registerStudent({
      fullName,
      email,
      department,
      studentId: studentId || `AIT-${new Date().getFullYear()}-STU-001`,
    });
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-neutral-950 border border-white/20 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 absolute top-4 right-4"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/15 flex items-center justify-center text-white">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Student Registration</h3>
        </div>
        <p className="text-xs text-neutral-400 mb-4">
          Register with Apex Institute credentials to unlock campus lab spaces and advanced equipment.
        </p>

        {/* Security Rule Notice */}
        <div className="mb-4 p-3 rounded-lg bg-black border border-white/10 flex items-start gap-2.5 text-[11px] text-neutral-300">
          <ShieldAlert className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <span>
            Self-registration is restricted to the <strong>Student</strong> role. Resource Owner and Admin privileges are strictly governed by institutional identity providers.
          </span>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-semibold text-white">Account Created Successfully!</h4>
            <p className="text-xs text-neutral-400">
              Welcome to ResourceX. Initial allocation: 100 FairShare credits granted.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Diya Patel"
                className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Campus Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@apex.edu"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Roll / Student ID</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="AIT-2024-..."
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
              >
                <option value="Robotics & Artificial Intelligence">Robotics & Artificial Intelligence</option>
                <option value="Computer Science & Data Engineering">Computer Science & Data Engineering</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical & Mechatronics">Mechanical & Mechatronics</option>
                <option value="Biotechnology & Microfluidics">Biotechnology & Microfluidics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-solid w-full text-xs h-10 font-semibold"
              >
                {loading ? "Registering on Campus Network..." : "Complete Student Registration"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
