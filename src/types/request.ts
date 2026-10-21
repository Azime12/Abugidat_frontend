export type RequestStatus =
  | "awaiting"
  | "contact_shared"
  | "closed"
  | "expired";

export interface ParentRequest {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorPhotoUrl?: string;
  gradeLevel: string;
  areaName?: string;
  distanceBand?: string;
  parentName: string;
  parentPhone: string;
  note?: string;
  preferredTime?: string;
  status: RequestStatus;
  createdAt: string;
}

export interface CreateRequestData {
  tutorId: string;
  parentName: string;
  parentPhone: string;
  gradeLevel: string;
  note?: string;
  preferredTime?: string;
  consent: boolean;
}