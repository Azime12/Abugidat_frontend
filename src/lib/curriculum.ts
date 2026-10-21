/**
 * Frontend mirror of the backend curriculum types.
 * Runtime data comes from useCurriculum() — this file holds TYPES only.
 */

export type GradeCategory = {
  id: string;
  label: string;
  description: string;
  order: number;
};

export type GradeOption = {
  id: string;
  label: string;
  order: number;
};

export type Curriculum = {
  id: string;
  category: string;
  label: string;
  description: string;
  grades: GradeOption[];
  subjectsByGrade: Record<string, string[]>;
};

export type CurriculumConfig = {
  success: true;
  source: "code" | "db";
  categories: GradeCategory[];
  curriculums: Curriculum[];
};

export function getCurriculumFrom(config: CurriculumConfig | undefined, id: string) {
  return config?.curriculums.find((c) => c.id === id);
}

export function getGradesFor(config: CurriculumConfig | undefined, curriculumId: string): GradeOption[] {
  return getCurriculumFrom(config, curriculumId)?.grades ?? [];
}

export function getSubjectsFor(
  config: CurriculumConfig | undefined,
  curriculumId: string,
  gradeLabel: string
): string[] {
  const c = getCurriculumFrom(config, curriculumId);
  return c?.subjectsByGrade[gradeLabel] ?? [];
}

export function getCurriculumsByCategory(config: CurriculumConfig | undefined, categoryId: string): Curriculum[] {
  return (config?.curriculums ?? []).filter((c) => c.category === categoryId);
}
