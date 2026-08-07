"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ReflectionActions({
  id,
}: {
  id: number;
}) {
  const router = useRouter();

  const approveReflection = async () => {
    console.log("Approving ID:", id);

    const { data, error } = await supabase
      .from("reflections")
      .update({ approved: true })
      .eq("id", id)
      .select();

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("Update finished.");

    router.refresh();
  };

  const rejectReflection = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete this reflection?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("reflections")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Could not delete reflection.");
      return;
    }

    router.refresh();
  };

  return (
    <div className="mt-8 flex gap-4">
      <button
        onClick={approveReflection}
        className="
          rounded-full
          bg-[#6F8F72]
          px-6
          py-3
          text-white
          transition
          hover:bg-[#5B7960]
        "
      >
        Approve
      </button>

      <button
        onClick={rejectReflection}
        className="
          rounded-full
          border
          border-red-300
          px-6
          py-3
          text-red-500
          transition
          hover:bg-red-50
        "
      >
        Reject
      </button>
    </div>
  );
}