# System Specification (SDD Plan): Early Child Development (ECD) Ethiopian Community Project

This document serves as the **Specification-Driven Development (SDD)** roadmap. It defines the architecture, data models, and workflows specifically tailored for the **Addis Ababa Health Bureau** system and the granular service coverage logic, now updated based on the **v2.0 Backend API**.

---

## 1. Administrative Hierarchy & Multi-Tier Monitoring
The system follows a strict 7-tier hierarchy. Structure below the Health Center exists only for **administrative and service coverage purposes**.

| Level | Name (Amharic) | Specification |
| :--- | :--- | :--- |
| **L0** | **Super Admin** | **Ethiopia Level**: Full CRUD on Cities. Assigns City Admins and Ethiopia-level Analysts/Officers. |
| **L1** | **City Admin** | **City Leadership Level**: Full CRUD on Subcities. Assigns Subcity Admins and City-level personnel. |
| **L2** | **Subcity Leader** | **Sub-city Monitoring Level**: Supervise Health Centers/Workers. Managed by City Admin. |
| **L3** | **Health Center Admin** | **Facility Manager**: Full CRUD on Woredas/Ketenas/Blocks. Assigns PC Workers/HEWs. |
| **L4** | **Woreda** | ወረዳ (Division of the Health Center service area). |
| **L5** | **Ketena** | ቀጠና (Division of a Woreda). |
| **L6** | **Block** | ብሎክ (Division of a Ketena). |
| **L7** | **Family** | ቤተሰብ (The target beneficiary in a Block). |

---

## 2. Administrative Control & Personnel Spec

### A. Super Admin (National Level)
- **Unit Management**:
    - `POST /cities`: Initialize new city units in the system.
    - `GET /cities`: Monitor all city performance and structures.
- **System Governance**:
    - `GET /cities/roles` & `GET /cities/permissions`: Review global security definitions.
    - `PUT /cities/users/permissions`: Override permissions for any high-level personnel.
- **Leadership Appointment**:
    - `POST /cities/assign/city-admin`: Directly appoint City-level leadership to specific city units.

### B. City Admin (Provincial Level)
- **Regional Setup**:
    - `POST /subcities`: Establish Subcity units within their assigned city.
    - `GET /subcities`: Monitor regional sub-unit personnel and performance.
- **Regional Personnel Mapping**:
    - `POST /subcities/assign/subcity-admin`: Appoint leadership for Subcity units.
    - `PUT /subcities/assign/users`: Manage roles and specific permissions for Subcity-level officers and analysts.

### C. Subcity Admin (District Level)
- **Health Infrastructure Setup**:
    - `POST /health-centers`: Establish new Health Center units within their subcity.
    - `GET /health-centers`: Monitor all assigned health centers and their current leadership.
- **District Personnel Mapping**:
    - `POST /health-centers/assign/healthCenter-admin`: Appoint leadership (Managers) for Health Centers.
    - `PUT /health-centers/assign/users`: Manage roles for health center officers and monitoring staff.
- **Performance Monitoring**: Access to subcity-wide aggregate reports on growth monitoring and family registration.

### D. Health Center Admin (Facility Level)
- **Community Hierarchy Management**:
    - `POST /community-units/woredas`: Establish Woreda divisions for their center.
    - `POST /community-units/ketenas`: Establish Ketena sub-divisions within Woredas.
    - `POST /community-units/blocks`: Define granular Block units for field coverage.
- **Workforce Deployment**:
    - `POST /health-centers/assign/pc-worker`: Deploy PC Workers (HEWs) to specific Blocks. Supports **multi-block assignment** for shared roles.
    - `POST /health-centers/assign/own-users`: Manage internal facility staff (Officers, Analysts, Supervisors).
- **Service Verification**: Monitor the visit completion status for assigned Blocks and HEWs.

### E. Personnel Audits (Shared Admin Tools)
- **Unit Visibility**: `GET /cities/personnel/unit-details` provides a complete recursive view of all users in an admin's unit, including their current roles and explicit permissions.
- **Filtering**: Ability to filter personnel lists by Role (e.g., fetching all "GROUP_LEADER" personnel in a unit).

### A. Health Worker Assignment Schema
```typescript
interface HealthWorkerAssignment {
  workerId: string;
  scope: {
    woredaIds: string[];      // Multiple Woredas assigned
    ketenaIds?: string[];     // Optional: Specific Ketenas (if empty = All in Woreda)
    blockIds?: string[];      // Optional: Specific Blocks (if empty = All in Ketena)
  };
  assignedBy: string;         // Health Center Manager ID
}
```

### B. Authentication & Security Archetype
- **Login Flow**:
    - Response includes `token`, `role`, and `mustChangePassword`.
    - **Post-Login Guard**: If `mustChangePassword` is true, the UI MUST force a redirect to the password update form before any other action.
- **Account Recovery**:
    - Support for self-service email-based reset.
    - Support for administrative reset (Manager-initiated for field workers via Phone/ID).
- **Communication Header**: Every API request must include the `Accept-Language` header (values: `eng`, `am`, `orm`, `som`, `tir`, `sid`).

---

## 3. Communication & User Management Spec

### A. Administrative User Control
- **Pending Users**: Admins can fetch all unassigned/pending users via `/users/pendingStatus`.
- **Administrative Resets**:
    - Sub-city leaders can reset passwords by Phone Number (`Password@123`).
    - Admins can reset passwords by User ID (`Password123`).
- **User Search**: Ability to fetch a user by ID for detailed profile audits.

### B. Bulk Notifications
- **Service**: `/users/sendBulkEmail`.
- **Constraint**: Must support batch success tracking (reporting which emails in the set were successfully sent).

### C. Multi-Language Support
The system MUST support the following Ethiopian languages across all levels:
- **English (eng)**
- **Amharic (am)**
- **Oromo (orm)**
- **Somali (som)**
- **Tigrinya (tir)**
- **Sidama (sid)**

**Technical Requirement**:
- `language_preference` is stored in the user profile and synced via the `/users/language` endpoint.

---

## 4. Workforce Assignment & Service Coverage
The core logic revolves around **Flexible Assignment** of Health Extension Workers (HEWs).

### A. Assignment Modes:
1.  **Multi-Woreda Access**: A worker can be assigned to one or multiple Woredas.
2.  **Selection Granularity**:
    - **Full Woreda**: Access to all Ketenas and all Blocks within that Woreda.
    - **Selected Ketenas**: Access only to specific Ketenas within a Woreda (and all their Blocks).
    - **Specific Blocks**: Access only to targeted Blocks within a specific Ketena.

### B. Functional Requirements:
- **R1.1: Assigned Task List**: HEW dashboard MUST filter families via the `/families/assigned/me` endpoint.
- **R1.2: Hierarchy Breadcrumb**: Ensure the worker always knows the context of the family they are visiting (e.g., "Woreda 05 / Ketena 4 / Block 1").

---

## 5. User Workflow & Experience Mechanics

### A. Authentication & Security
- **Role-Based Login**: Support for Super Admin, City Admin, Sub-city Leader, HC Manager, and PC Worker roles.
- **Password Reset**: Multiple paths available (Self-service via email reset, Manager-initiated reset by Phone Number or User ID).
- **Mandatory Password Change**: Users flagged with `mustChangePassword: true` on login MUST be redirected to the update password form.

### B. Fieldwork Visit Verification
- **GPS Verification**: The system MUST capture the device's GPS coordinates at the moment a survey is started.
- **Location Correlation**: Compare visit GPS with family registration GPS to verify home-visit authenticity.

---

## 6. Technical Architecture (Next.js 16+)

- **Directory**: `src/features/` (Organized by domain: `auth`, `hierarchy`, `families`, `surveys`).
- **State Management**: `@tanstack/react-query` for API synchronization.
- **Mapping Engine**: **Google Maps JavaScript API v3**.
- **Location API**: Use browser `navigator.geolocation` for real-time tracking during visits.
- **Offline Persistence**: Using IndexDB to queue surveys for background sync when connectivity returns.

---

## 7. Data Models & Validation (v2.0 Schema)

### A. Family Registration Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `registration_number` | `string` | Human-readable ID (e.g., `Aq/A11/B20/001`). Required. |
| `block_id` | `uuid` | The granular service unit. Required. |
| `head_of_household_name` | `string` | Primary contact person. Required. |
| `house_number` | `string` | Physical house identifier. |
| `phone_number` | `string` | Household primary contact. |
| `health_insurance_type` | `enum` | `FREE_OR_SPONSORED`, `PAYING`, `NOT_BENEFICIARY`. |
| `is_vulnerable` | `boolean` | Flag for high-risk nutritional/economic status. |
| `is_safetynet_beneficiary` | `boolean` | PSNP status. |
| `latitude` / `longitude` | `number` | Home coordinate anchor. Captured silently on registration. |

### B. Child Health Model (Dependent)
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Full name of the infant/child. |
| `gender` | `enum` | `MALE`, `FEMALE`. |
| `dob` | `string` | Date of birth (used for milestone and growth normalization). |
| `vulnerable_to_growth_restriction` | `boolean` | Flag for specialized follow-up priority. |

---

## 8. Role-Based Interaction Map

| Role | Core Entry Point | Primary Action |
| :--- | :--- | :--- |
| **Super Admin** | `/admin/cities` | Geographical expansion & Global Security. |
| **City Admin** | `/admin/subcities` | Regional governance & High-level staff audit. |
| **Sub-city Leader** | `/admin/health-centers` | Clinical coordination & Fieldwork oversight. |
| **HC Manager** | `/hc/workforce` | Woreda setup & HEW block assignment. |
| **HEW / PC Worker** | `/hew/checklist` | Home visits, Family enrollment, Growth monitor. |

### C. Tier-Based Redirection Logic (Post-Login)
The application MUST resolve the destination path dynamically based on the user's **Administrative Level** from the backend payload.

| Level (Backend) | Frontend Route Group | Primary Purpose |
| :--- | :--- | :--- |
| `ETHIOPIA` | `/(protected)/admin/ethiopia` | National City & Hierarchy Setup |
| `CITY` | `/(protected)/admin/city` | Regional Subcity & Personnel Audit |
| `SUBCITY` | `/(protected)/admin/subcity` | Health Center Setup & HC Manager Appointment |
| `HEALTH_CENTER` | `/(protected)/hc` | Workforce Deployment (Woreda/Block setup) |
| `BLOCK` | `/(protected)/hew` | Field Visits & Family Enrollment |

### D. Permission-Guarded Tables (Guarded UI)
All administrative tables must implement a **Action Isolation Pattern**:
1.  **Permission Discovery**: The `useAuth` hook must expose an `actions` array derived from the user's `permissions`.
2.  **Row Context**: Each table row (e.g., in a Unit Directory) should verify its `unit_id` against the current user's jurisdiction before enabling "Edit" or "Unassign" buttons.
3.  **Global Overrides**: `Super Admins` bypass jurisdictional checks for system-level units.

---

## 9. Role & Permission Matrix (Frontend RBAC)

The system enforces granular access control based on the user's assigned **Level** and **Role**. The frontend must use a permission-based guarding system (e.g., `PermissionGuard` component).

| Administrative Level | System Role | Primary Permissions | Frontend Route |
| :--- | :--- | :--- | :--- |
| **L0: Ethiopia** | `ADMIN` (Super) | `CREATE_CITY`, `MANAGE_ROLES`, `ADMIN_PERMISSIONS`, `READ_GLOBAL_REPORTS` | `/admin/ethiopia/*` |
| **L1: City** | `ADMIN` (City) | `CREATE_SUBCITY`, `ASSIGN_SUBCITY_ADMIN`, `READ_CITY_REPORTS`, `MANAGE_CITY_USERS` | `/admin/city/*` |
| **L2: Subcity** | `ADMIN` (Subcity) | `CREATE_HC`, `ASSIGN_HC_ADMIN`, `READ_SUBCITY_REPORTS`, `MANAGE_FACILITY_LIST` | `/admin/subcity/*` |
| **L3: Health Center** | `MANAGER` (HC) | `CREATE_COMMUNITY_UNIT`, `ASSIGN_PC_WORKER`, `MANAGE_FAMILIES`, `READ_HC_REPORTS` | `/hc/*` |
| **L4-L6: Community** | `PC_WORKER` (HEW) | `CREATE_FAMILY`, `UPDATE_FAMILY`, `RECORD_SURVEY`, `READ_ASSIGNED_FAMILIES` | `/hew/*` |

### Technical Guarding Pattern:
- **`useHasPermission(permission: string)`**: Hook to verify if the current user profile contains the required permission string.
- **`PermissionGate` Component**: Wraps sensitive UI elements (e.g., "Create City" button) and only renders if the user has the required permission.
- **Middleware Guard**: Verifies the user's `role` and `level` against the route group (e.g., `/hc/*` requires `level: HEALTH_CENTER`).

---

**Next Steps**: 
1. Implement the `useLanguage` context to manage `Accept-Language` headers.
2. Build the `Assign Worker` wizard allowing HC Managers to select granular Blocks/Ketenas.
3. Integrate the `Family` registration form with the new vulnerability and insurance fields.
