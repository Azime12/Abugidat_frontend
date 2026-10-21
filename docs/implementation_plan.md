now for city level i want to add frontend-transport/src/app/[locale]/(protected)/route-plans/page.tsx table in frontend-transport/src/app/[locale]/(protected)/admin/city/subcities/[id]/page.tsx under plans tab 



# Implementation Plan: Early Child Development (ECD) Community-Based Project (Ethiopia)

This document outlines the implementation strategy for the ECD tracking system, now updated based on the **v2.0 Backend API**. The plan prioritizes **role-based workflows**, **multilingual accessibility**, and **vulnerability tracking**.

---

## 1. Project Overview
- **Objective**: To monitor and support early childhood development through community-based data collection.
- **Primary Users**: Community Health Extension Workers (HEW), Health Center managers, Sub-city coordinators, and Bureau analysts.
- **Core Workflow**: Health workers visit families (at the Block/Ketena level) and use a digital interface to record surveys and child health indicators.

---

## 2. Updated Administrative Hierarchy & RBAC
The system follows the Ethiopian urban health structure and supports the following roles:

| Level | Role | Responsibilities |
| :--- | :--- | :--- |
| **Super Admin** | Admin / Analyst | System-wide configuration, managing Cities, global roles and permissions. |
| **City** | City Admin | Monitoring Sub-cities, assigning City-level analysts (Addis Ababa Tena Birue). |
| **Sub-city** | Sub-city Leader | Monitoring Health Centers within the sub-city (Kifle Ketema). |
| **Health Center** | Manager | Managing Woredas, Ketenas, Blocks, and assigning HEWs to specific areas. |
| **Block** | PC Worker / HEW | Direct data collection, family visits, and vulnerability assessment. |

---

## 3. Technical Architecture (Next.js 16.1+)

### Directory Structure
```text
src/
├── app/
│   └── [locale]/
│       ├── (protected)/
│       │   ├── admin/          # City & Sub-city Management
│       │   ├── hc/             # Health Center Manager Tools
│       │   └── hew/            # Health Extension Worker Field Tools
│       └── auth/               # Login, Forgot Password, Reset Password
├── features/
│   ├── auth/                   # useLogin, useResetPassword hooks
│   ├── hierarchy/              # useCities, useWoredas, useAssignment hooks
│   ├── families/               # useFamilies, useEnrollment hooks
│   └── ecd/                    # useGrowthCalculation, useSurvey hooks
├── components/                 # Shared UI (Gradients, Glassmorphism, Premium Cards)
└── i18n/                       # Localization setup for 6 languages
```

### Key Libraries & Stack
- **Framework**: Next.js 16.1 (App Router).
- **Internationalization**: `next-intl` (Pre-configured for 6 languages: eng, am, orm, som, tir, sid).
- **Forms**: `react-hook-form` + `zod` (Strict validation for health metrics).
- **State**: `@tanstack/react-query` (Server state management).
- **Styling**: `Tailwind CSS 4.0` (Modern, fast, responsive).

---

## 4. Feature Roadmap (v2.0 API Alignment)

### Phase 1: Authentication & Account Security (Week 1)
- [ ] **Multi-language Auth**: Implement language selector on login page (`Accept-Language` integration).
- [ ] **Account Completion Guard**: Implement the mandatory `mustChangePassword` redirection logic.
- [ ] **Self-Service Reset**: Integrated email-based `forgot-password` flow.
- [ ] **Profile Sync**: Create the `language_preference` synchronization hook (`PATCH /users/language`).
- [ ] **RBAC Framework**:
    - [ ] Create `usePermissions` hook for granular UI guarding.
    - [ ] Implement `PermissionGate` component for conditional rendering.
    - [ ] Configure `middleware.ts` to enforce Level-based route access (e.g., blocking HEWs from `/admin`).

### Phase 2: Administrative Control & Unit Management (Week 2)
- [ ] **Super Admin Command Center**:
    - [ ] Interface for National City Management (Create/Update Cities).
    - [ ] Master Role/Permission Audit tool (`GET /cities/roles`).
    - [ ] City Admin Appointment module.
- [ ] **Health Center Admin Dashboard**:
    - [ ] **Community Unit Wizard**: Create Woredas, Ketenas, and Blocks hierarchically.
    - [ ] **Workforce Assignment Module**: Interface to map PC Workers to specific Block IDs.
    - [ ] **Staff Management**: Self-management of facility-level users (`/health-centers/assign/own-users`).
- [ ] **Universal Personnel Audit**:
    - [ ] "Unit Directory" component using `/cities/personnel/unit-details`.
    - [ ] Implementation of the `unassign` and `update-permission` features for managers.
- [ ] **User Status**: Implementation of "Pending Users" list for approval/assignment.

### Phase 3: Vulnerability-Centric Family Registry (Week 3)
- [ ] **Family Enrollment v2.0**:
    - [ ] Dynamic form with **Head of Household** and **Dependent (Child)** relationship mapping.
    - [ ] **Vulnerability Flags**: Integration of `is_vulnerable` and `is_safetynet_beneficiary` status.
    - [ ] **Insurance Management**: Dropdown for `health_insurance_type` mapped to the backend enum.
- [ ] **Motherhood Specifics**:
    - [ ] Sub-sections for `Pregnant Mother` and `Lactating Mother` profiles within the family unit.
- [ ] **GPS-Anchor Registration**: 
    - [ ] Verification logic to ensure GPS precision before saving family location.
    - [ ] Map-based family location verification for supervisors.

### Phase 4: Fieldwork & Verified Visits (Week 4)
- [ ] **My Assigned Families**: Dashboard for HEWs fetching data via `/families/assigned/me`.
- [ ] **Visit Verification**: Capturing real-time GPS coordinates at the start of surveys to correlate with registered home location.
- [ ] **Offline-First Resilience**: Implement local queuing for surveys for areas with 3G/E connectivity gaps.

---

## 5. Experience Principles
1. **Premium Aesthetic**: Use vibrant gradients, subtle micro-animations, and clean typography (Inter / Ethiopia-specific fonts).
2. **Localization First**: Ensure all UI elements support 6 regional languages from day one.
3. **Low-Friction Forms**: Intelligent defaults and icons to minimize typing for field workers.
4. **Data Integrity**: GPS verification and local-first persistence are non-negotiable.

---

## 6. Next Steps
1. Update `next-intl` configuration to support the full list of 6 languages.
2. Build the `UserAssignment` component for the HC Manager dashboard.
3. Develop the `FamilyRegistrationv2` form using Zod validation for new API fields.
