import client from "@/lib/api-client";

export const tutorDashboardService = {
  // Profile
  me: () => client.get("/tutor/me"),
  updateProfile: (data: any) => client.put("/tutor/profile", data),

  // Jobs
  listJobs: () => client.get("/tutor/jobs"),
  getJob: (id: number | string) => client.get(`/tutor/jobs/${id}`),
  apply: (job_id: number | string) => client.post("/tutor/apply", { job_id }),

  // Applications
  listApplications: () => client.get("/tutor/applications"),

  // Kulf
  kulfBalance: () => client.get("/kulf/balance"),
  kulfLedger: (limit = 50, offset = 0) =>
    client.get("/kulf/ledger", { params: { limit, offset } }),
  buyRequest: (data: { pack_size: number; amount_birr: number; txn_ref: string; payment_method: string }) =>
    client.post("/kulf/buy-request", data),
  purchases: () => client.get("/kulf/purchases"),
  refundRequest: (data: { request_id: string; unlock_id?: string; reason: string; note?: string }) =>
    client.post("/kulf/refund-request", data),
  refunds: () => client.get("/kulf/refunds"),
  // Parent requests (open + unlock)
  openRequests: () => client.get("/requests/open"),
  // Tutor: requests they have unlocked (refund-eligible)
  myUnlockedRequests: () => client.get("/requests/my-unlocks"),
  unlockRequest: (requestId: string) => client.post(`/requests/${requestId}/unlock`),
};

