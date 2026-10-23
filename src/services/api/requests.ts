import client from "@/lib/api-client";
import type { CreateRequestData, ParentRequest } from "@/types/request";

// Parent requests flow into the Jobs table (status: "pending")
// Admin approves them via /admin/jobs. Real ParentRequest model
// will replace this when parentRequestController is built.

export const requestService = {
  async create(data: CreateRequestData): Promise<ParentRequest> {
    if (!data.consent) {
      throw new Error("You must agree to the Terms to continue");
    }

    const grades = Array.isArray(data.gradeLevels) ? data.gradeLevels : [];

    const res = await client.post("/public/jobs", {
      parent_name: data.parentName || "Anonymous Parent",
      parent_phone_contact: data.parentPhone,
      student_level: grades.join(", "),
      grade_levels: grades,
      subjects: "Tutoring", // backend will accept; parent specified subject in note
      location: "Addis Ababa",
      schedule: data.preferredTime || "To be discussed",
      hourly_salary: 400,
    });

    const job = res.data?.job;
    if (!job) {
      throw new Error(res.data?.message || "Failed to create request");
    }

    return {
      id: String(job.id),
      tutorId: data.tutorId,
      tutorName: "Tutor",
      gradeLevel: grades.join(", "),
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      note: data.note,
      preferredTime: data.preferredTime,
      status: "awaiting",
      createdAt: job.created_at || new Date().toISOString(),
    };
  },

  async getMine(): Promise<ParentRequest[]> {
    // No such endpoint yet — parent-facing list arrives in Phase 6
    return [];
  },

  async getById(_id: string): Promise<ParentRequest | null> {
    return null;
  },
};
