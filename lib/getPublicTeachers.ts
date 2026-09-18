import { createAdminClient } from "./supabase/admin";

const TEACHER_AVATAR_BUCKET =
  "teacher-avatars";

export type PublicTeacher = {
  id: string;
  slug: string;
  name: string;
  avatar_url: string | null;
  card_label: string | null;
  learner_groups: string[];
};

export async function getPublicTeachers(): Promise<
  PublicTeacher[]
> {
  try {
    const admin = createAdminClient();

    const {
      data: publicProfiles,
      error,
    } = await admin
      .from("teacher_public_profiles")
      .select(`
        teacher_id,
        slug,
        card_label,
        learner_groups,
        display_order,
        profiles!teacher_public_profiles_teacher_id_fkey!inner (
          full_name,
          avatar_path,
          role,
          status
        )
      `)
      .eq("is_published", true)
      .eq("profiles.role", "teacher")
      .eq("profiles.status", "active")
      .order("display_order", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Public teachers fetch error:",
        error
      );

      return [];
    }

    return (publicProfiles || []).map(
      (item) => {
        const profile = Array.isArray(
          item.profiles
        )
          ? item.profiles[0]
          : item.profiles;

        const avatarUrl =
          profile?.avatar_path
            ? admin.storage
                .from(
                  TEACHER_AVATAR_BUCKET
                )
                .getPublicUrl(
                  profile.avatar_path
                ).data.publicUrl
            : null;

        return {
          id: item.teacher_id,
          slug: item.slug,
          name: profile?.full_name || "",
          avatar_url: avatarUrl,
          card_label:
            item.card_label || null,
          learner_groups:
            item.learner_groups || [],
        };
      }
    );
  } catch (error) {
    console.error(
      "Public teachers fetch error:",
      error
    );

    return [];
  }
}