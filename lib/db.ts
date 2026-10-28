import { Resource, Booking, AuditEvent, Incident, User } from "@/types";
import {
  INITIAL_RESOURCES,
  INITIAL_BOOKINGS,
  INITIAL_AUDIT_EVENTS,
  INITIAL_INCIDENTS,
  DEMO_USERS,
} from "./mock-data";
import { supabase, isSupabaseConfigured } from "./supabase";

// Local storage keys
const STORAGE_KEYS = {
  RESOURCES: "resourcex_resources_v1",
  BOOKINGS: "resourcex_bookings_v1",
  AUDIT: "resourcex_audit_v1",
  INCIDENTS: "resourcex_incidents_v1",
  USERS: "resourcex_users_v1",
};

// In-memory fallback if window is undefined (SSR)
let memoryResources = [...INITIAL_RESOURCES];
let memoryBookings = [...INITIAL_BOOKINGS];
let memoryAudit = [...INITIAL_AUDIT_EVENTS];
let memoryIncidents = [...INITIAL_INCIDENTS];
let memoryUsers = [...DEMO_USERS];

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("Storage error:", err);
  }
}

// ----------------- RESOURCES -----------------
export async function getResources(): Promise<Resource[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from("resources").select("*");
      if (!error && data && data.length > 0) return data as Resource[];
    } catch (e) {
      console.warn("Supabase fetch failed, falling back to local store", e);
    }
  }
  const items = getFromStorage<Resource[]>(STORAGE_KEYS.RESOURCES, memoryResources);
  memoryResources = items;
  return items;
}

export async function getResourceById(id: string): Promise<Resource | null> {
  const all = await getResources();
  return all.find((r) => r.id === id) || null;
}

export async function createResource(
  data: Omit<Resource, "id" | "createdAt" | "totalBookings" | "utilizationRate">
): Promise<Resource> {
  const newResource: Resource = {
    ...data,
    id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    totalBookings: 0,
    utilizationRate: 0,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from("resources")
        .insert([newResource])
        .select()
        .single();
      if (!error && inserted) return inserted as Resource;
    } catch (e) {
      console.warn("Supabase insert failed, saving locally", e);
    }
  }

  const all = await getResources();
  const updated = [newResource, ...all];
  saveToStorage(STORAGE_KEYS.RESOURCES, updated);
  memoryResources = updated;
  return newResource;
}

export async function updateResource(id: string, updates: Partial<Resource>): Promise<Resource> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("resources")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return data as Resource;
    } catch (e) {
      console.warn("Supabase update failed, updating locally", e);
    }
  }

  const all = await getResources();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) throw new Error("Resource not found");

  const updatedItem = { ...all[index], ...updates };
  all[index] = updatedItem;
  saveToStorage(STORAGE_KEYS.RESOURCES, all);
  memoryResources = all;
  return updatedItem;
}

export async function deleteResource(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("resources").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase delete failed", e);
    }
  }
  const all = await getResources();
  const filtered = all.filter((r) => r.id !== id);
  saveToStorage(STORAGE_KEYS.RESOURCES, filtered);
  memoryResources = filtered;
  return true;
}

// ----------------- BOOKINGS -----------------
export async function getBookings(): Promise<Booking[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from("bookings").select("*").order("date", { ascending: false });
      if (!error && data && data.length > 0) return data as Booking[];
    } catch (e) {
      console.warn("Supabase fetch failed, falling back to local store", e);
    }
  }
  const items = getFromStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, memoryBookings);
  memoryBookings = items;
  return items;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const all = await getBookings();
  return all.find((b) => b.id === id) || null;
}

export async function getBookingsByUserId(userId: string): Promise<Booking[]> {
  const all = await getBookings();
  return all.filter((b) => b.userId === userId);
}

export async function getBookingsByOwnerId(ownerId: string): Promise<Booking[]> {
  const all = await getBookings();
  const resources = await getResources();
  const ownedResourceIds = new Set(resources.filter((r) => r.ownerId === ownerId).map((r) => r.id));
  return all.filter((b) => ownedResourceIds.has(b.resourceId));
}

export async function createBooking(
  data: Omit<Booking, "id" | "createdAt" | "updatedAt">
): Promise<Booking> {
  const newBooking: Booking = {
    ...data,
    id: `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from("bookings")
        .insert([newBooking])
        .select()
        .single();
      if (!error && inserted) return inserted as Booking;
    } catch (e) {
      console.warn("Supabase insert failed, saving locally", e);
    }
  }

  const all = await getBookings();
  const updated = [newBooking, ...all];
  saveToStorage(STORAGE_KEYS.BOOKINGS, updated);
  memoryBookings = updated;

  // Automatically log Step 3 audit event
  await createAuditEvent({
    bookingId: newBooking.id,
    resourceId: newBooking.resourceId,
    stepNumber: 3,
    stepName: "Booking Requested",
    actorId: newBooking.userId,
    actorName: newBooking.userName,
    actorRole: "student",
    action: "Submitted reservation request",
    details: `Slot requested for ${newBooking.date} (${newBooking.startTime} - ${newBooking.endTime}). Purpose: ${newBooking.purpose}`,
    status: "info",
  });

  return newBooking;
}

export async function updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
  const timestamp = new Date().toISOString();
  const mergedUpdates = { ...updates, updatedAt: timestamp };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update(mergedUpdates)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return data as Booking;
    } catch (e) {
      console.warn("Supabase update failed, updating locally", e);
    }
  }

  const all = await getBookings();
  const index = all.findIndex((b) => b.id === id);
  if (index === -1) throw new Error("Booking not found");

  const updatedItem = { ...all[index], ...mergedUpdates };
  all[index] = updatedItem;
  saveToStorage(STORAGE_KEYS.BOOKINGS, all);
  memoryBookings = all;
  return updatedItem;
}

// ----------------- AUDIT EVENTS -----------------
export async function getAuditEvents(bookingId?: string): Promise<AuditEvent[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from("audit_events").select("*").order("timestamp", { ascending: true });
      if (bookingId) query = query.eq("booking_id", bookingId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as AuditEvent[];
    } catch (e) {
      console.warn("Supabase audit fetch failed, using local store", e);
    }
  }

  const items = getFromStorage<AuditEvent[]>(STORAGE_KEYS.AUDIT, memoryAudit);
  memoryAudit = items;
  if (bookingId) {
    return items.filter((a) => a.bookingId === bookingId).sort((a, b) => a.stepNumber - b.stepNumber);
  }
  return items;
}

export async function createAuditEvent(
  data: Omit<AuditEvent, "id" | "timestamp">
): Promise<AuditEvent> {
  const newEvent: AuditEvent = {
    ...data,
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from("audit_events")
        .insert([newEvent])
        .select()
        .single();
      if (!error && inserted) return inserted as AuditEvent;
    } catch (e) {
      console.warn("Supabase insert audit failed, saving locally", e);
    }
  }

  const all = await getAuditEvents();
  const updated = [...all, newEvent];
  saveToStorage(STORAGE_KEYS.AUDIT, updated);
  memoryAudit = updated;
  return newEvent;
}

// ----------------- INCIDENTS -----------------
export async function getIncidents(): Promise<Incident[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from("incidents").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) return data as Incident[];
    } catch (e) {
      console.warn("Supabase incidents fetch failed, using local store", e);
    }
  }
  const items = getFromStorage<Incident[]>(STORAGE_KEYS.INCIDENTS, memoryIncidents);
  memoryIncidents = items;
  return items;
}

export async function createIncident(data: Omit<Incident, "id" | "createdAt">): Promise<Incident> {
  const newIncident: Incident = {
    ...data,
    id: `inc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from("incidents")
        .insert([newIncident])
        .select()
        .single();
      if (!error && inserted) return inserted as Incident;
    } catch (e) {
      console.warn("Supabase incident insert failed, saving locally", e);
    }
  }

  const all = await getIncidents();
  const updated = [newIncident, ...all];
  saveToStorage(STORAGE_KEYS.INCIDENTS, updated);
  memoryIncidents = updated;
  return newIncident;
}

export async function resolveIncident(incidentId: string, notes: string): Promise<Incident> {
  const all = await getIncidents();
  const index = all.findIndex((i) => i.id === incidentId);
  if (index === -1) throw new Error("Incident not found");

  const updated: Incident = {
    ...all[index],
    status: "resolved",
    resolutionNotes: notes,
  };

  all[index] = updated;
  saveToStorage(STORAGE_KEYS.INCIDENTS, all);
  memoryIncidents = all;
  return updated;
}

// ----------------- USERS -----------------
export async function getUsers(): Promise<User[]> {
  const items = getFromStorage<User[]>(STORAGE_KEYS.USERS, memoryUsers);
  memoryUsers = items;
  return items;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) || null;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new Error("User not found");

  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  saveToStorage(STORAGE_KEYS.USERS, users);
  memoryUsers = users;
  return updatedUser;
}

// ----------------- RESET DEMO DATA -----------------
export async function resetDemoData(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.RESOURCES);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
  }
  memoryResources = [...INITIAL_RESOURCES];
  memoryBookings = [...INITIAL_BOOKINGS];
  memoryAudit = [...INITIAL_AUDIT_EVENTS];
  memoryIncidents = [...INITIAL_INCIDENTS];
  memoryUsers = [...DEMO_USERS];

  saveToStorage(STORAGE_KEYS.RESOURCES, memoryResources);
  saveToStorage(STORAGE_KEYS.BOOKINGS, memoryBookings);
  saveToStorage(STORAGE_KEYS.AUDIT, memoryAudit);
  saveToStorage(STORAGE_KEYS.INCIDENTS, memoryIncidents);
  saveToStorage(STORAGE_KEYS.USERS, memoryUsers);
}
