export type GradeLevel =
  | "KG"
  | "1-4"
  | "5-6"
  | "7-8"
  | "9-10"
  | "11-12-NS"
  | "11-12-SS"
  | "Exam"
  | "Uni"
  | (string & {});

export interface Tutor {
  id: string;
  fullName: string;
  firstName?: string;
  photoUrl?: string;
  subjects: string[];
  gradeLevels: GradeLevel[];
  areaName: string;
  distanceBand?: string;
  price: number;
  ratingAvg?: number;
  ratingCount?: number;
  verified: boolean;
  onlineOk?: boolean;
  bio?: string;
  lat?: number;
  lng?: number;
  isFeatured?: boolean;
}

export interface TutorDetail extends Tutor {
  languages?: string[];
  modes?: ("In-person" | "Online")[];
  verification?: {
    idVerified: boolean;
    qualificationsChecked: boolean;
    referencesCalled: boolean;
    interviewCompleted: boolean;
  };
  reviews?: TutorReview[];
}

export interface TutorReview {
  id: string;
  parentName: string;
  parentInitial: string;
  stars: number;
  comment: string;
  date: string;
  context?: string;
}

export interface TutorSearchFilters {
  query?: string;
  gradeLevels?: GradeLevel[];
  areaName?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  distanceBands?: string[];
  onlineOnly?: boolean;
  sortBy?: "nearest" | "rating" | "price_low" | "price_high";
}

export interface TutorSearchResponse {
  tutors: Tutor[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Registration types ───
export interface TutorRegisterBasicInfo {
  fullName: string;
  phone: string;
  email?: string;
  gender?: "Male" | "Female";
  studentGenderPreference?: "Both" | "Male" | "Female";
  photo?: string; // base64 or URL
  education?: string; // e.g. "BSc in Mathematics, AAU"
}

export interface TutorRegisterTeachingDetails {
  subjects: string[];
  gradeLevels: GradeLevel[];
  areaName: string;
  latitude?: number;
  longitude?: number;
  travelKm: number;
  price: number; // Lesson price per hour in ETB
  bio: string;
  teachingMode?: "In-person" | "Online" | "Both";
  onlineOk: boolean;
  cvFile?: string; // Base64 data URL or file URL
  educationFile?: string; // Base64 or certificate URL
}

export interface TutorRegistration extends TutorRegisterBasicInfo, TutorRegisterTeachingDetails {}

export interface TutorRegistrationResult {
  id: string;
  status: "pending";
  message: string;
}