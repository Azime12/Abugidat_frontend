/**
 * Frontend mirror of backend/src/config/registrationFlow.js.
 *
 * The web register wizard groups the shared steps into two phases but uses the
 * SAME stable step `key`s, so in-flight progress persisted by the bot
 * (keyed by these keys) can be resumed here without remapping.
 */

export type RegistrationStepType =
  | "text"
  | "phone"
  | "email"
  | "choice"
  | "multi_choice"
  | "number"
  | "file";

export interface RegistrationStep {
  key: string;
  label: string;
  type: RegistrationStepType;
  required: boolean;
  options?: string[];
}

export const TUTOR_REGISTRATION_STEPS: RegistrationStep[] = [
  { key: "full_name", label: "Full Name", type: "text", required: true },
  { key: "phone", label: "Mobile Phone", type: "phone", required: true },
  { key: "email", label: "Email Address", type: "email", required: true },
  { key: "city", label: "City / Area", type: "text", required: true },
  { key: "education", label: "Education / Qualification", type: "text", required: true },
  { key: "gender", label: "Your Gender", type: "choice", required: true, options: ["Male", "Female"] },
  { key: "student_gender_preference", label: "Student Gender Preference", type: "choice", required: true, options: ["Male", "Female", "Both"] },
  { key: "grade_levels", label: "Grade Levels", type: "multi_choice", required: true },
  { key: "subjects", label: "Subjects", type: "multi_choice", required: true },
  { key: "teaching_mode", label: "Teaching Mode", type: "choice", required: true, options: ["Online", "In-person", "Both"] },
  { key: "hourly_rate", label: "Hourly Rate (ETB)", type: "number", required: true },
  { key: "experience", label: "Experience & Bio", type: "text", required: false },
  { key: "cv", label: "CV / Resume", type: "file", required: false },
  { key: "education_file", label: "Education Certificate", type: "file", required: false },
];

/** Step keys that belong to phase 1 (identity) vs phase 2 (teaching details). */
export const PHASE_1_KEYS = [
  "full_name",
  "phone",
  "email",
  "city",
  "education",
  "gender",
  "student_gender_preference",
];

export const PHASE_2_KEYS = [
  "grade_levels",
  "subjects",
  "teaching_mode",
  "hourly_rate",
  "experience",
  "cv",
  "education_file",
];

export function getStepKeys(): string[] {
  return TUTOR_REGISTRATION_STEPS.map((s) => s.key);
}

export function getStepByKey(key: string): RegistrationStep | undefined {
  return TUTOR_REGISTRATION_STEPS.find((s) => s.key === key);
}
