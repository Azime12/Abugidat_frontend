import client from "@/lib/api-client";

// All routes match backend: /api/users, /api/tutors, /api/jobs,
// /api/applications, /api/matches, /api/dashboard/stats
export const adminService = {
  // Dashboard
  getStats: () => client.get("/dashboard/stats"),

  // Users
  getUsers: () => client.get("/users"),
  getUserById: (id: number | string) => client.get(`/users/${id}`),
  updateUserStatus: (id: number | string, status: string) =>
    client.patch(`/users/${id}/status`, { status }),
  assignRole: (id: number | string, roleId: number) =>
    client.post(`/users/${id}/roles`, { roleId }),
  removeRole: (id: number | string, roleId: number) =>
    client.delete(`/users/${id}/roles/${roleId}`),

  // Tutors
  getTutors: () => client.get("/tutors"),
  getTutorById: (id: number | string) => client.get(`/tutors/${id}`),

  // Jobs
  getJobs: (status?: string) =>
    client.get("/jobs", { params: status ? { status } : {} }),
  getJobById: (id: number | string) => client.get(`/jobs/${id}`),
  updateJobStatus: (id: number | string, status: string, rejection_reason?: string) =>
    client.patch(`/jobs/${id}/status`, { status, rejection_reason }),

  // Applications
  getApplications: (status?: string) =>
    client.get("/applications", { params: status ? { status } : {} }),
  updateApplicationStatus: (id: number | string, status: string) =>
    client.patch(`/applications/${id}/status`, { status }),

  // Matches
  getMatches: () => client.get("/matches"),
  createMatch: (data: { job_id: number; tutor_id: number; hours_per_session?: number; sessions_per_week?: number }) =>
    client.post("/matches", data),

  // Agents
  getAgents: () => client.get("/agents"),
  getAgentById: (id: number | string) => client.get(`/agents/${id}`),
  createAgent: (data: { name: string; agency_name?: string; phone?: string; telegram_id?: string; area_id?: number }) =>
    client.post("/agents", data),
  updateAgent: (id: number | string, data: Record<string, unknown>) =>
    client.patch(`/agents/${id}`, data),
  assignTutorToAgent: (tutor_id: number, agent_id: number | null) =>
    client.post("/agents/assign-tutor", { tutor_id, agent_id }),

  // Waitlist
  getWaitlist: () => client.get("/requests/waitlist"),

  // Configuration
  getConfig: () => client.get("/config"),
  updateConfig: (data: Record<string, unknown>) => client.patch("/config", data),
};
