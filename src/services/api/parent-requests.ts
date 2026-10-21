import client from "@/lib/api-client";

export const parentRequestService = {
  // Parent creates a new request
  create: (data: {
    parent_name: string;
    parent_phone: string;
    grade_level: string;
    subjects: string;
    area_name: string;
    note?: string;
    preferred_time?: string;
  }) => client.post("/requests", data),

  // Parent sees own requests
  mine: () => client.get("/requests/mine"),

  // Parent sees detail of one request
  getById: (id: string) => client.get(`/requests/${id}`),

  // Parent closes (soft-deletes) one of their requests
  close: (id: string) => client.patch(`/requests/${id}/close`),
};
