import client from "@/lib/api-client";
import { normalizeEthiopianPhone } from "@/lib/validation";
import type {
  TutorRegistration,
  TutorRegistrationResult,
} from "@/types/tutor";

// Option B — web signup creates a real Tutor row.
// Flow:
//   1. POST /tutor/auth with phone + name (creates Tutor row, returns token)
//   2. PUT /tutor/profile with full form data (Bearer token)
//   3. Backend notifies admins → pending review

export const tutorRegisterService = {
  async register(data: TutorRegistration): Promise<TutorRegistrationResult> {
    // Validate
    if (!data.fullName || data.fullName.trim().length < 2) {
      throw new Error("Full name is required");
    }
    const normalizedPhone = normalizeEthiopianPhone(data.phone);
    if (!normalizedPhone) {
      throw new Error("Enter a valid Ethiopian phone number");
    }
    if (!data.subjects || data.subjects.length === 0) {
      throw new Error("Please select at least one subject");
    }
    if (!data.gradeLevels || data.gradeLevels.length === 0) {
      throw new Error("Please select at least one grade level");
    }

    const parts = data.fullName.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

    // Step 1: auth (creates Tutor if not exists)
    const authRes = await client.post("/tutor/auth", {
      phone_number: normalizedPhone,
      first_name: firstName,
      last_name: lastName,
    });
    const authData = authRes.data;
    if (!authData?.token) {
      throw new Error(authData?.message || "Tutor auth failed");
    }
    const token: string = authData.token;
    const tutorId: number = authData.tutor?.id;

    // Step 2: complete profile
    const profileBody = {
      first_name: firstName,
      last_name: lastName,
      phone_number: normalizedPhone,
      email: data.email || null,
      gender: data.gender || null,
      student_gender_preference: data.studentGenderPreference || "Both",
      education: data.education || null,
      subjects: data.subjects.join(", "),
      grade_levels: data.gradeLevels.join(", "),
      city: data.areaName || "Addis Ababa",
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      hourly_rate: data.price || 300,
      experience: data.bio || "",
      teaching_mode: data.teachingMode || (data.onlineOk ? "Both" : "In-person"),
      cv_file: data.cvFile || null,
      education_file: data.educationFile || null,
    };

    await client.put("/tutor/profile", profileBody, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      id: String(tutorId),
      status: "pending",
      message: "Profile submitted for review",
    };
  },
};
