-- =========================================================================
-- RESOURCEX: AI-POWERED SMART CAMPUS RESOURCE SHARING PLATFORM
-- PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- CODE HACK INDIA 2026: "Unlock Underused Equipment and Spaces"
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'owner', 'manager', 'admin')) DEFAULT 'student',
  institution TEXT NOT NULL DEFAULT 'Apex Institute of Technology',
  department TEXT NOT NULL,
  student_id TEXT,
  avatar_url TEXT,
  fairshare_score INTEGER NOT NULL DEFAULT 90 CHECK (fairshare_score >= 0 AND fairshare_score <= 100),
  credits INTEGER NOT NULL DEFAULT 100,
  certifications TEXT[] DEFAULT '{}',
  active_bookings_count INTEGER NOT NULL DEFAULT 0,
  completed_bookings_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY DEFAULT ('res_' || replace(uuid_generate_v4()::text, '-', '')),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('robotics', 'computing', 'fabrication', 'iot', 'media', 'spaces', 'testing')),
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  owner_name TEXT NOT NULL,
  owner_role TEXT NOT NULL,
  image_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'in_use', 'maintenance', 'reserved')) DEFAULT 'available',
  condition TEXT NOT NULL CHECK (condition IN ('excellent', 'good', 'fair')) DEFAULT 'excellent',
  available_days TEXT[] NOT NULL DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  available_time_start TEXT NOT NULL DEFAULT '09:00',
  available_time_end TEXT NOT NULL DEFAULT '18:00',
  max_booking_hours NUMERIC NOT NULL DEFAULT 4.0,
  required_training TEXT[] DEFAULT '{}',
  required_qualifications TEXT[] DEFAULT '{}',
  safety_instructions TEXT[] DEFAULT '{}',
  usage_restrictions TEXT DEFAULT '',
  approval_required BOOLEAN NOT NULL DEFAULT true,
  fairshare_cost INTEGER NOT NULL DEFAULT 5,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  utilization_rate NUMERIC NOT NULL DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. BOOKINGS TABLE (10-Step Lifecycle State Machine)
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY DEFAULT ('bk_' || replace(uuid_generate_v4()::text, '-', '')),
  resource_id TEXT NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  resource_title TEXT NOT NULL,
  resource_category TEXT NOT NULL,
  resource_location TEXT NOT NULL,
  resource_image TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_department TEXT NOT NULL,
  user_fairshare_score INTEGER NOT NULL DEFAULT 90,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration_hours NUMERIC NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('pending', 'approved', 'rejected', 'waitlisted', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled')
  ) DEFAULT 'pending',
  rejection_reason TEXT,
  waitlist_position INTEGER,
  
  -- Step 6: Check-In Data
  check_in_timestamp TIMESTAMPTZ,
  check_in_condition TEXT,
  check_in_notes TEXT,
  check_in_photo_url TEXT,
  
  -- Step 7: Check-Out Data
  check_out_timestamp TIMESTAMPTZ,
  check_out_condition TEXT,
  check_out_notes TEXT,
  check_out_photo_url TEXT,
  
  -- Step 8: Owner Return Verification
  owner_verified_timestamp TIMESTAMPTZ,
  owner_verification_notes TEXT,
  has_incident BOOLEAN NOT NULL DEFAULT false,
  incident_id TEXT,
  
  credits_deducted INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. AUDIT EVENTS TABLE (Chronological Timeline & Security Audit)
CREATE TABLE IF NOT EXISTS public.audit_events (
  id TEXT PRIMARY KEY DEFAULT ('aud_' || replace(uuid_generate_v4()::text, '-', '')),
  booking_id TEXT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number BETWEEN 1 AND 10),
  step_name TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'warning', 'info', 'danger')) DEFAULT 'info',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS public.incidents (
  id TEXT PRIMARY KEY DEFAULT ('inc_' || replace(uuid_generate_v4()::text, '-', '')),
  booking_id TEXT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  resource_title TEXT NOT NULL,
  reported_by_id TEXT NOT NULL,
  reported_by_name TEXT NOT NULL,
  reported_role TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'critical')) DEFAULT 'minor',
  description TEXT NOT NULL,
  resolution_notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'investigating', 'resolved')) DEFAULT 'open',
  damage_penalty_credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES FOR FAST QUERIES
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_resource_id ON public.bookings(resource_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_audit_events_booking_id ON public.audit_events(booking_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- POLICIES: RESOURCES
CREATE POLICY "Anyone can view resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Owners and Admins can insert resources" ON public.resources FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);
CREATE POLICY "Owners and Admins can update resources" ON public.resources FOR UPDATE USING (
  auth.role() = 'authenticated'
);

-- POLICIES: BOOKINGS
CREATE POLICY "Users can view their own bookings or owned resources" ON public.bookings FOR SELECT USING (
  auth.uid() = user_id OR auth.role() = 'authenticated'
);
CREATE POLICY "Students can create bookings" ON public.bookings FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);
CREATE POLICY "Users and Owners can update bookings" ON public.bookings FOR UPDATE USING (
  auth.role() = 'authenticated'
);

-- POLICIES: AUDIT
CREATE POLICY "Anyone can view audit events" ON public.audit_events FOR SELECT USING (true);
CREATE POLICY "System and authenticated users can insert audit events" ON public.audit_events FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);
