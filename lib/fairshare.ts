import { User, Resource, Booking, FairShareProfile } from "@/types";

export interface FairShareSimulationResult {
  baseCost: number;
  multiplier: number;
  finalCost: number;
  isPeakHour: boolean;
  cooldownActive: boolean;
  priorityScore: number;
  recommendation: string;
}

/**
 * Checks whether a given slot falls within peak hours (e.g., 11:00 to 16:00 on weekdays)
 */
export function isPeakTime(startTime: string, dateStr: string): boolean {
  const [hours] = startTime.split(":").map(Number);
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekday = day >= 1 && day <= 5;
  return isWeekday && hours >= 11 && hours < 16;
}

/**
 * Calculates dynamic fairshare point cost and returns recommendations
 */
export function calculateFairShareCost(
  resource: Resource,
  user: User,
  dateStr: string,
  startTime: string,
  durationHours: number,
  recentBookings: Booking[]
): FairShareSimulationResult {
  const isPeak = isPeakTime(startTime, dateStr);
  const baseCost = resource.fairShareCost * durationHours;
  const multiplier = isPeak ? 1.5 : 0.8;
  const finalCost = Math.round(baseCost * multiplier);

  // Check cooldown: Did user book this same resource within the last 24 hours?
  const sameResourceRecent = recentBookings.filter(
    (b) =>
      b.userId === user.id &&
      b.resourceId === resource.id &&
      (b.status === "confirmed" || b.status === "completed" || b.status === "checked_in")
  );

  const cooldownActive = sameResourceRecent.length >= 2;

  // Calculate priority score (higher gets preference in competitive requests)
  // PriorityScore = (FairShareScore * 0.4) + (Department Balance Bonus * 0.3) + (Remaining Quota * 0.3)
  const quotaWeight = Math.max(0, 100 - user.activeBookingsCount * 25);
  const priorityScore = Math.round(user.fairShareScore * 0.4 + 25 * 0.3 + quotaWeight * 0.3);

  let recommendation = "";
  if (isPeak) {
    recommendation = `Peak hour detected (11:00-16:00). Slots after 16:00 cost 45% fewer credits (${Math.round(
      baseCost * 0.8
    )} vs ${finalCost} credits) and preserve your weekly quota!`;
  } else {
    recommendation = `Off-peak discount applied! You are saving ${Math.round(
      baseCost * 1.5 - finalCost
    )} credits and earning +1 FairShare community efficiency point.`;
  }

  return {
    baseCost,
    multiplier,
    finalCost,
    isPeakHour: isPeak,
    cooldownActive,
    priorityScore,
    recommendation,
  };
}

/**
 * Generates user FairShare profile summary
 */
export function getUserFairShareProfile(user: User, userBookings: Booking[]): FairShareProfile {
  const completed = userBookings.filter((b) => b.status === "completed");
  const onTimeCount = completed.filter((b) => !b.hasIncident).length;
  const onTimeRate = completed.length > 0 ? Math.round((onTimeCount / completed.length) * 100) : 98;

  let statusTier: FairShareProfile["statusTier"] = "Standard";
  if (user.fairShareScore >= 90) statusTier = "Gold Standard";
  else if (user.fairShareScore >= 75) statusTier = "Priority Access";
  else if (user.fairShareScore < 60) statusTier = "Under Review";

  const weeklyHoursUsed = userBookings
    .filter((b) => b.status !== "rejected" && b.status !== "cancelled")
    .reduce((sum, b) => sum + b.durationHours, 0);

  return {
    score: user.fairShareScore,
    weeklyHoursUsed: Math.round(weeklyHoursUsed * 10) / 10,
    weeklyHoursLimit: 12.0,
    currentStreak: 6,
    onTimeReturnRate: onTimeRate,
    statusTier,
  };
}
