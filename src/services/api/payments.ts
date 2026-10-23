import client from "@/lib/api-client";

export interface PaymentIntent {
  id: string;
  amount_etb: number;
  currency: string;
  purpose: "listing_fee" | "kulf_purchase" | "featured_badge" | "subscription";
  entity_type: "job" | "parent_request";
  status: "pending" | "verified" | "rejected" | "expired";
  provider: string;
  payment_method?: string | null;
  txn_ref?: string | null;
  receipt_file?: string | null;
  rejection_reason?: string | null;
  verified_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
  entity_id?: number | null;
  entity_uuid?: string | null;
}

export interface SubmitProofInput {
  payment_method?: string;
  txn_ref?: string;
  receipt_file?: string;
}

export const paymentService = {
  // Parent-facing
  getIntent: (id: string) => client.get(`/payments/${id}`),
  mine: () => client.get("/payments/mine"),
  submitProof: (id: string, data: SubmitProofInput) =>
    client.post(`/payments/${id}/proof`, data),

  // Admin-facing
  list: (status?: string) =>
    client.get("/admin/payments", { params: status ? { status } : {} }),
  verify: (id: string) => client.post(`/admin/payments/${id}/verify`),
  reject: (id: string, reason?: string) =>
    client.post(`/admin/payments/${id}/reject`, { reason }),
};
