"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { DEMO_USERS } from "@/lib/mock-data";
import { getUsers, updateUser } from "@/lib/db";

interface AuthContextType {
  currentUser: User;
  activeRole: UserRole;
  switchUser: (role: UserRole) => void;
  registerStudent: (formData: {
    fullName: string;
    email: string;
    department: string;
    studentId: string;
  }) => Promise<User>;
  refreshCurrentUser: () => Promise<void>;
  isOwnerOrManager: boolean;
  isAdmin: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "resourcex_active_role_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]); // Default to Student

  useEffect(() => {
    // Load persisted role
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem(AUTH_STORAGE_KEY) as UserRole | null;
      if (savedRole) {
        const found = DEMO_USERS.find((u) => u.role === savedRole);
        if (found) setCurrentUser(found);
      }
    }
  }, []);

  const switchUser = (role: UserRole) => {
    const target = DEMO_USERS.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEY, role);
      }
    }
  };

  const registerStudent = async (formData: {
    fullName: string;
    email: string;
    department: string;
    studentId: string;
  }): Promise<User> => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: formData.email,
      fullName: formData.fullName,
      role: "student",
      institution: "Apex Institute of Technology",
      department: formData.department,
      studentId: formData.studentId,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formData.fullName)}`,
      fairShareScore: 90,
      credits: 100,
      certifications: ["Campus Lab Safety 101"],
      activeBookingsCount: 0,
      completedBookingsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, "student");
    }
    return newUser;
  };

  const refreshCurrentUser = async () => {
    const allUsers = await getUsers();
    const updated = allUsers.find((u) => u.id === currentUser.id);
    if (updated) {
      setCurrentUser(updated);
    }
  };

  const isOwnerOrManager = currentUser.role === "owner" || currentUser.role === "manager" || currentUser.role === "admin";
  const isAdmin = currentUser.role === "admin";
  const isStudent = currentUser.role === "student";

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole: currentUser.role,
        switchUser,
        registerStudent,
        refreshCurrentUser,
        isOwnerOrManager,
        isAdmin,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
