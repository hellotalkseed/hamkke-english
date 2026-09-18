import { createAdminClient } from "@/lib/supabase/admin";

export type PublicReflection = {
  id: string;
  rating: number;
  name: string;
  role: string;
  country: string | null;
  reflection: string;
  photo_url: string | null;
  created_at: string | null;
  teacher_id: string;
  teacher_name: string;
};

type ReflectionRow = {
  id: string;
  rating: number;
  name: string;
  role: string;
  country: string | null;
  reflection: string;
  photo_url: string | null;
  created_at: string | null;
  teacher_id: string;
};

type TeacherRow = {
  id: string;
  full_name: string | null;
};

export async function getPublicReflections(): Promise<{
  reflections: PublicReflection[];
  total: number;
}> {
  const admin = createAdminClient();

  /*
   * -------------------------------------------------------
   * GET TOTAL NUMBER OF APPROVED REFLECTIONS
   * -------------------------------------------------------
   */

  const {
    count,
    error: countError,
  } = await admin
    .from("reflections")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("approved", true);

  if (countError) {
    console.error(
      "Failed to count public reflections:",
      countError
    );
  }

  /*
   * -------------------------------------------------------
   * GET NEWEST 20 APPROVED REFLECTIONS
   * -------------------------------------------------------
   */

  const {
    data: reflectionData,
    error: reflectionsError,
  } = await admin
    .from("reflections")
    .select(`
      id,
      rating,
      name,
      role,
      country,
      reflection,
      photo_url,
      created_at,
      teacher_id
    `)
    .eq("approved", true)
    .order("created_at", {
      ascending: false,
    })
    .limit(20);

  if (reflectionsError) {
    console.error(
      "Failed to load public reflections:",
      reflectionsError
    );

    return {
      reflections: [],
      total: count ?? 0,
    };
  }

  const reflectionRows =
    (reflectionData ?? []) as ReflectionRow[];

  if (reflectionRows.length === 0) {
    return {
      reflections: [],
      total: count ?? 0,
    };
  }

  /*
   * -------------------------------------------------------
   * GET TEACHERS USED BY THESE REFLECTIONS
   * -------------------------------------------------------
   */

  const teacherIds = Array.from(
    new Set(
      reflectionRows
        .map((reflection) => reflection.teacher_id)
        .filter(Boolean)
    )
  );

  const {
    data: teacherData,
    error: teachersError,
  } = await admin
    .from("profiles")
    .select(`
      id,
      full_name
    `)
    .in("id", teacherIds);

  if (teachersError) {
    console.error(
      "Failed to load reflection teachers:",
      teachersError
    );
  }

  const teachers =
    (teacherData ?? []) as TeacherRow[];

  const teacherMap = new Map(
    teachers.map((teacher) => [
      teacher.id,
      teacher.full_name?.trim() || "Hamkke Teacher",
    ])
  );

  /*
   * -------------------------------------------------------
   * BUILD PUBLIC REFLECTIONS
   * -------------------------------------------------------
   */

  const reflections: PublicReflection[] =
    reflectionRows.map((reflection) => ({
      id: reflection.id,
      rating: reflection.rating,
      name: reflection.name,
      role: reflection.role,
      country: reflection.country,
      reflection: reflection.reflection,
      photo_url: reflection.photo_url,
      created_at: reflection.created_at,
      teacher_id: reflection.teacher_id,
      teacher_name:
        teacherMap.get(reflection.teacher_id) ??
        "Hamkke Teacher",
    }));

  return {
    reflections,
    total: count ?? reflections.length,
  };
}