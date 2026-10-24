import client from "@/lib/api-client";
import type {
  Tutor,
  TutorDetail,
  TutorReview,
  GradeLevel,
  TutorSearchFilters,
  TutorSearchResponse,
} from "@/types/tutor";

// ─── Shape mapping: backend → frontend ────────────────────────────
function parseGradeLevels(raw: any): GradeLevel[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((g) => String(g).trim()).filter(Boolean);
  }
  return String(raw)
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
}

function parseSubjects(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Match a specific grade against a tutor's grade entry (exact or range).
function parseGradeRange(g: string) {
  const m = String(g).match(/grade\s*(\d+)(?:\s*-\s*(\d+))?/i);
  if (!m) return null;
  const lo = parseInt(m[1], 10);
  const hi = m[2] ? parseInt(m[2], 10) : lo;
  return { lo, hi };
}

function gradeMatches(tutorGrade: string, reqGrade: string): boolean {
  const tg = String(tutorGrade || "").toLowerCase().trim();
  const rg = String(reqGrade || "").toLowerCase().trim();
  if (!tg || !rg) return false;
  if (tg === rg) return true;
  if (tg === "all levels" || rg === "all levels") return true;
  const tRange = parseGradeRange(tg);
  const rRange = parseGradeRange(rg);
  if (tRange && rRange) {
    return tRange.lo <= rRange.hi && tRange.hi >= rRange.lo;
  }
  return false;
}

const CURRICULUM_LABELS: Record<string, string> = {
  "et-national": "Ethiopian National",
  igcse: "IGCSE / Cambridge",
  ib: "IB",
  american: "American / SAT",
  skill: "Skill / Extracurricular",
};

function parseCurriculums(raw: any): string[] {
  const out: string[] = [];
  const push = (id: any) => {
    if (!id) return;
    const label = CURRICULUM_LABELS[String(id)] || String(id);
    if (!out.includes(label)) out.push(label);
  };

  if (Array.isArray(raw.curriculums)) {
    for (const c of raw.curriculums) {
      if (typeof c === "string") push(c);
      else push(c?.curriculum);
    }
  } else if (raw.curriculum) {
    push(raw.curriculum);
  }
  return out;
}

function parseSkillCategories(raw: any): string[] {
  const hasSkill = Array.isArray(raw.curriculums)
    ? raw.curriculums.some((c: any) =>
        typeof c === "string" ? c === "skill" : c?.curriculum === "skill"
      )
    : raw.curriculum === "skill";
  if (!hasSkill) return [];
  return parseSubjects(raw.subjects);
}

function backendTutorToTutor(raw: any): Tutor {
  return {
    id: String(raw.id),
    fullName: raw.name || `Tutor #${raw.id}`,
    firstName: raw.firstName || (raw.name ? raw.name.split(" ")[0] : undefined),
    photoUrl: undefined, // backend doesn't expose photo in public listing
    subjects: parseSubjects(raw.subjects).length
      ? parseSubjects(raw.subjects)
      : ["General"],
    gradeLevels: parseGradeLevels(raw.gradeLevels),
    areaName: raw.city || "Addis Ababa",
    distanceBand: undefined,
    price: Number(raw.rate) || 300,
    ratingAvg: Number(raw.rating) || undefined,
    ratingCount: raw.ratingCount != null ? Number(raw.ratingCount) : undefined,
    verified: raw.badgeType === "verified" || raw.badgeType === "top",
    onlineOk: raw.teachingMode === "Both" || raw.teachingMode === "Online",
    bio: raw.bio || "",
    lat: raw.lat ? Number(raw.lat) : undefined,
    lng: raw.lng ? Number(raw.lng) : undefined,
    isFeatured: !!raw.featured || !!raw.is_featured,
  };
}

// ─── Client-side filter (for grade, price, sort, and nearby search) ──────────
export function applyFilters(
  tutors: Tutor[],
  filters: TutorSearchFilters
): Tutor[] {
  let result = [...tutors];

  if (filters.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (t) =>
        t.fullName.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q)) ||
        t.areaName.toLowerCase().includes(q)
    );
  }

  if (filters.gradeLevels && filters.gradeLevels.length > 0) {
    result = result.filter((t) =>
      filters.gradeLevels!.some((g) =>
        t.gradeLevels.some((tg) => gradeMatches(tg, g))
      )
    );
  }

  if (filters.minPrice !== undefined) {
    result = result.filter((t) => t.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    result = result.filter((t) => t.price <= filters.maxPrice!);
  }

  if (filters.minRating !== undefined) {
    result = result.filter(
      (t) => (t.ratingAvg ?? 0) >= filters.minRating!
    );
  }

  if (filters.onlineOnly) {
    result = result.filter((t) => t.onlineOk);
  }

  if (filters.distanceBands && filters.distanceBands.length > 0) {
    // Backend doesn't return distance bands — skip this filter for now
    // (would need geolocation on the client)
  }

  // Sort
  switch (filters.sortBy) {
    case "rating":
      result.sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0));
      break;
    case "price_low":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price_high":
      result.sort((a, b) => b.price - a.price);
      break;
    case "nearest":
    default:
      // Fall back to alphabetical (no distances from backend)
      result.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  return result;
}

// ─── Public API ───────────────────────────────────────────────────
export const tutorService = {
  async search(filters: TutorSearchFilters): Promise<TutorSearchResponse> {
    const params: Record<string, any> = { limit: 200 };
    // Pass text search to backend for server-side SQL filtering
    if (filters.query && filters.query.trim()) {
      params.q = filters.query.trim();
    }
    const res = await client.get("/public/tutors", { params });
    const raw = res.data?.tutors ?? [];
    const mapped = raw.map(backendTutorToTutor);
    // Client-side filters for grade, price, rating, sort (not sent to backend)
    const filtered = applyFilters(mapped, { ...filters, query: "" }); // query already handled by backend

    return {
      tutors: filtered,
      total: filtered.length,
      page: 1,
      pageSize: filtered.length || 1,
    };
  },

  async getById(id: string): Promise<TutorDetail | null> {
    // Backend now serves GET /public/tutors/:id with reviews
    const res = await client.get(`/public/tutors/${id}`);
    const raw = res.data?.tutor;
    if (!raw) return null;

    const base = backendTutorToTutor(raw);
    const reviews: TutorReview[] = (res.data?.reviews ?? []).map((r: any) => ({
      id: String(r.id),
      parentName: r.parentName || "Parent",
      parentInitial: r.parentInitial || "P",
      stars: r.stars,
      comment: r.comment || "",
      date: r.date
        ? new Date(r.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "",
    }));

    const detail: TutorDetail = {
      ...base,
      ratingCount: raw.ratingCount != null ? Number(raw.ratingCount) : base.ratingCount,
      languages: ["Amharic", "English"],
      modes: base.onlineOk ? ["In-person", "Online"] : ["In-person"],
      curriculums: parseCurriculums(raw),
      skillCategories: parseSkillCategories(raw),
      verification: {
        idVerified: base.verified,
        qualificationsChecked: base.verified,
        referencesCalled: base.verified,
        interviewCompleted: base.verified,
      },
      reviews,
    };
    return detail;
  },

  async rateTutor(tutorId: string, stars: number, comment?: string) {
    const res = await client.post("/ratings", {
      tutor_id: Number(tutorId),
      stars,
      comment,
    });
    return res.data;
  },

  async map() {
    const res = await client.get("/public/tutors/map");
    return (res.data?.tutors ?? []) as TutorMapPoint[];
  },

  async nearbyTutors(lat: number, lng: number, radiusKm = 25): Promise<Tutor[]> {
    const res = await client.post("/location/nearby-tutors", {
      latitude: lat,
      longitude: lng,
      radius: radiusKm,
      limit: 50,
    });
    const items = res.data?.tutors ?? [];
    return items.map((item: any) => {
      const t = item.tutor || item;
      return {
        id: String(t.id),
        fullName:
          [t.first_name, t.last_name].filter(Boolean).join(" ") || `Tutor #${t.id}`,
        subjects: parseSubjects(t.subjects).length ? parseSubjects(t.subjects) : ["General"],
        gradeLevels: parseGradeLevels(t.grade_levels),
        areaName: t.city || "Addis Ababa",
        price: Number(t.hourly_rate) || 300,
        ratingAvg: undefined,
        ratingCount: undefined,
        verified: true,
        onlineOk: t.teaching_mode === "Both" || t.teaching_mode === "Online",
        bio: t.experience || "",
        distanceBand:
          item.distance != null ? `${Number(item.distance).toFixed(1)} km` : undefined,
        lat: Number(t.latitude ?? t.lat ?? item.latitude ?? item.lat) || undefined,
        lng: Number(t.longitude ?? t.lng ?? item.longitude ?? item.lng) || undefined,
        isFeatured: !!t.is_featured,
      } as Tutor;
    });
  },

  nearby(lat: number, lng: number, radiusKm = 25) {
    return this.nearbyTutors(lat, lng, radiusKm);
  },

  async searchWithFallback(params: {
    grade_level?: string;
    subjects?: string;
    latitude?: number;
    longitude?: number;
    area_name?: string;
    area_id?: number;
  }) {
    const res = await client.post("/public/tutors/search", params);
    return res.data;
  },
};

export interface TutorMapPoint {
  id: string | number;
  name: string;
  firstName?: string;
  city: string;
  subjects: string;
  rate: number;
  lat: number;
  lng: number;
  is_admin?: boolean;
  is_featured?: boolean;
  rating?: number | null;
  ratingCount?: number;
}
