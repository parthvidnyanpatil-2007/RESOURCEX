# ResourceX — AI-Powered Smart Campus Resource Sharing & Management Platform

> **Tagline:** Unlock Resources. Empower Innovation.  
> **Event:** CODE HACK INDIA 2026 — 48-Hour National Hackathon  
> **Official Problem Statement:** *"Unlock Underused Equipment and Spaces"*  
> **Target Campus:** Apex Institute of Technology (AIT)

---

## 🚀 Overview

**ResourceX** is a production-grade smart campus resource-sharing platform designed to bridge the gap between underutilized laboratory infrastructure and student innovators. In modern universities, millions of dollars worth of advanced equipment—such as 6-axis industrial robotic arms, high-performance GPU clusters, resin 3D printers, and RF anechoic chambers—sit idle after lecture hours or remain siloed within single departments.

ResourceX breaks down departmental silos by providing:
1. **Universal Campus Asset Discovery:** Real-time visibility into high-demand equipment, lab spaces, and maker kits across all academic departments.
2. **Automated Safety & Prerequisite Clearance (Step 2):** Instant eligibility verification checking training certifications, active quota limits, and FairShare standing before reservation requests are accepted.
3. **Transparent 10-Step Operational Lifecycle:** End-to-end chain of custody from initial slot discovery to owner review, digital check-in, photographic condition verification, return inspection, and immutable PostgreSQL audit sealing.
4. **FairShare Anti-Monopoly Engine:** Dynamic credit scaling that penalizes equipment hoarding, rewards off-peak scheduling with 20% discounts, and grants automatic +2 reputation bonuses for on-time returns in pristine condition.
5. **Gemini AI Lab Coordinator:** Natural language project-to-resource matching and automated pre/post condition anomaly inspection.

---

## 🎨 Design System & Visual Identity

Engineered with a futuristic, high-contrast obsidian enterprise UI integrated directly from Google AI Studio design standards.

- **Obsidian Dark Palette:** `#000000` base with radial light flare (`.hero-photo`) and subtle 3.5% fractal SVG grain (`.grain`).
- **Liquid Metal Accents:** Dual-tone specular metallic borders (`.metal-border`), glowing pill capsules (`.nav-pill`), and liquid-glass controls (`.btn-solid`, `.btn-ghost-hero`).
- **Typography:** Variable `Inter` paired with italic `Instrument Serif` editorial headlines (`.headline-serif-em`) and `JetBrains Mono` for cryptographic hashes and time codes.
- **Accents:** Electric Blue (`#2563EB`), Neon Cyan Glow (`#00D9FF`), Emerald Success (`#10B981`), Amber Warning (`#F59E0B`), and Rose Danger (`#EF4444`).
- **Visuals:** Glassmorphism panels, glowing borders (`shadow-glow`), subtle micro-interactions, responsive mobile drawer, and animated live statistics ticker.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 14 (App Router), React 18/19, TypeScript, Tailwind CSS, Lucide React icons, Framer Motion, canvas-confetti
- **Backend & APIs:** Next.js Server-Side Route Handlers (`/api/resources`, `/api/bookings`, `/api/ai/...`)
- **Database & Persistence:** Native Supabase PostgreSQL client + Resilient Hybrid Dual-Engine for instant zero-config hackathon judging
- **Authentication:** Supabase Authentication + Built-in 1-Click Role Switcher for seamless evaluation
- **AI Integration:** Google Gemini 1.5 Flash API with intelligent heuristic fallback engine

---

## 🔄 The 10-Step Complete Booking Lifecycle

Every reservation in ResourceX executes a strictly governed, human-in-the-loop 10-step state machine:

| Step | Phase Name | Execution Details & Rules |
|---|---|---|
| **Step 1** | **Resource Discovery** | Student searches by category, location, and real-time availability window. |
| **Step 2** | **Eligibility Verification** | Automated check of safety certifications, FairShare score, and active booking limit. |
| **Step 3** | **Booking Request** | Student configures date, duration, and inputs academic/capstone purpose statement. |
| **Step 4** | **Owner Review** | Lab Director reviews applicant credibility and approves, waitlists, or rejects with reason. |
| **Step 5** | **Booking Confirmation** | Schedule locked in PostgreSQL with collision protection and digital access token. |
| **Step 6** | **Equipment Check-In** | Student logs initial baseline condition, timestamp, and photo before powering hardware. |
| **Step 7** | **Return Check-Out** | Student returns equipment clean, inputs return notes, and logs exit timestamp. |
| **Step 8** | **Owner Verification** | Lab owner conducts physical inspection; AI inspects pre/post condition diffs for damage. |
| **Step 9** | **Booking Completion** | Quota restored to student; on-time return bonus (+2 reputation) credited. |
| **Step 10** | **Audit Trail Sealed** | Cryptographic audit record permanently signed and archived in PostgreSQL. |

---

## ⚖️ FairShare Allocation & Anti-Monopoly Rules

- **Quota Ceiling:** 12.0 maximum booking hours per week per student.
- **Anti-Monopoly Cooldown:** Mandatory 24-hour gap after 2 consecutive bookings on tier-1 resources.
- **Off-Peak Incentives:** Sessions scheduled before 11:00 or after 16:00 receive a 20% credit rebate.
- **Priority Queue Formulation:**
  $$\text{Priority} = (\text{FairShareScore} \times 0.4) + (\text{DeptBalance} \times 0.3) + (\text{RemainingQuota} \times 0.3)$$
- **Condition Protection:** Verified pristine return awards +2 reputation points; damage triggers immediate tribunal review.

---

## 👥 Demonstration Accounts & Quick Persona Switcher

A dedicated **Judge Quick Bar** sits at the top of the interface allowing 1-click persona switching:

1. 🎓 **Arjun Sharma (Student)**
   - *Role:* B.Tech Robotics & AI, 3rd Year
   - *FairShare Score:* 94/100 • Credits: 85
   - *Active Certifications:* Robotics Lab Tier-1, 3D Printing Safety, Microcontroller Prototyping
2. 🔬 **Dr. Sunita Rao (Resource Owner)**
   - *Role:* Lab Director, Advanced Robotics & Fabrication Wing
   - *Capabilities:* Approves bookings, lists new equipment, inspects returns, logs incidents
3. 👨‍🏫 **Prof. Rajesh Mehta (Faculty / Lab Manager)**
   - *Role:* HPC Facility & Cloud Cluster Manager
   - *Capabilities:* Oversees NVIDIA DGX nodes and XR Spatial Computing studio
4. 🛡️ **Vikramaditya Verma (Institutional Administrator)**
   - *Role:* Dean of Infrastructure & Research Governance
   - *Capabilities:* Underutilized equipment triage, campus-wide utilization telemetry, audit stream

---

## ⚡ Quick Start & Development

### 1. Run Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Connect Live Supabase Project (Optional)
Add your credentials to `.env.local`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
\`\`\`
Copy and run `supabase/schema.sql` inside your Supabase SQL Editor.

---

## 🏆 CODE HACK INDIA 2026 Deliverable Checklist

- [x] Genuine functional full-stack web application (not a prototype or mock screen)
- [x] Real database persistence layer with Supabase PostgreSQL and local storage sync
- [x] Complete 10-step operational booking lifecycle state machine
- [x] Role-based access control (Student, Resource Owner, Lab Manager, Administrator)
- [x] Self-registration strictly restricted to student accounts
- [x] FairShare Anti-Monopoly Allocation Engine with peak/off-peak scoring
- [x] Gemini AI Smart Campus Coordinator with natural language project matching
- [x] AI Pre/Post condition anomaly diff inspection
- [x] Incident reporting and disciplinary penalty workflow
- [x] 1-Click Judge evaluation toolbar with instant persona switching & demo reset

---
*Built with ❤️ for CODE HACK INDIA 2026. Empowering the next generation of campus builders.*
