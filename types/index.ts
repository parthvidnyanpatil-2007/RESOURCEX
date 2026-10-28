export type UserRole = "student" | "owner" | "manager" | "admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  institution: string;
  department: string;
  studentId?: string;
  avatarUrl: string;
  fairShareScore: number; // 0 - 100
  credits: number;
  certifications: string[];
  activeBookingsCount: number;
  completedBookingsCount: number;
  createdAt: string;
}

export type ResourceCategory =
  | "robotics"
  | "computing"
  | "fabrication"
  | "iot"
  | "media"
  | "spaces"
  | "testing";

export type ResourceStatus = "available" | "in_use" | "maintenance" | "reserved";
export type EquipmentCondition = "excellent" | "good" | "fair";

export interface Resource {
  id: string;
  title: string;
  category: ResourceCategory;
  description: string;
  location: string;
  ownerId: string;
  ownerName: string;
  ownerRole: string;
  imageUrl: string;
  status: ResourceStatus;
  condition: EquipmentCondition;
  availableDays: string[];
  availableTimeStart: string; // "09:00"
  availableTimeEnd: string; // "20:00"
  maxBookingHours: number;
  requiredTraining: string[];
  requiredQualifications: string[];
  safetyInstructions: string[];
  usageRestrictions: string;
  approvalRequired: boolean;
  fairShareCost: number; // credits per hour
  totalBookings: number;
  utilizationRate: number; // percentage (0 - 100)
  createdAt: string;
}

export type BookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "waitlisted"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  resourceId: string;
  resourceTitle: string;
  resourceCategory: ResourceCategory;
  resourceLocation: string;
  resourceImage: string;
  userId: string;
  userName: string;
  userEmail: string;
  userDepartment: string;
  userFairShareScore: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationHours: number;
  purpose: string;
  status: BookingStatus;
  rejectionReason?: string;
  waitlistPosition?: number;
  // Step 6: Check-In data
  checkInTimestamp?: string;
  checkInCondition?: string;
  checkInNotes?: string;
  checkInPhotoUrl?: string;
  // Step 7: Check-Out data
  checkOutTimestamp?: string;
  checkOutCondition?: string;
  checkOutNotes?: string;
  checkOutPhotoUrl?: string;
  // Step 8: Owner return verification
  ownerVerifiedTimestamp?: string;
  ownerVerificationNotes?: string;
  hasIncident: boolean;
  incidentId?: string;
  creditsDeducted: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  bookingId: string;
  resourceId: string;
  stepNumber: number; // 1 to 10
  stepName: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  timestamp: string;
  status: "success" | "warning" | "info" | "danger";
}

export interface Incident {
  id: string;
  bookingId: string;
  resourceId: string;
  resourceTitle: string;
  reportedById: string;
  reportedByName: string;
  reportedRole: string;
  severity: "minor" | "moderate" | "critical";
  description: string;
  resolutionNotes?: string;
  status: "open" | "investigating" | "resolved";
  damagePenaltyCredits: number;
  createdAt: string;
}

export interface FairShareProfile {
  score: number; // 0-100
  weeklyHoursUsed: number;
  weeklyHoursLimit: number;
  currentStreak: number;
  onTimeReturnRate: number; // percentage
  statusTier: "Gold Standard" | "Priority Access" | "Standard" | "Under Review";
  cooldownActiveUntil?: string;
}
