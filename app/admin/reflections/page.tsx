import { supabase } from "@/lib/supabase";
import ReflectionActions from "@/components/ReflectionActions";

export default async function ReflectionsAdminPage() {

  const { data: reflections, error } = await supabase
  .from("reflections")
  .select("*")
  .eq("approved", false)
  .order("created_at", { ascending: false });


  console.log("Server", reflections);
  console.log("Server", error);


  return (
    <main className="min-h-screen bg-[#FAF8F5] px-6 py-20">

      <div className="mx-auto max-w-4xl">

        <h1
          className="
          text-5xl
          text-[#2B2B2B]
          [font-family:var(--font-cormorant)]
          "
        >
          Pending Reflections
        </h1>


        <div className="mt-12 space-y-8">

          {reflections?.map((item) => (

            <div
              key={item.id}
              className="
              rounded-3xl
              bg-white
              p-8
              shadow-lg
              "
            >

              <div className="flex justify-between">

                <div>

                  <h2 className="text-xl font-medium">
                    {item.name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {item.country}
                  </p>

                </div>


                <div>
                  ⭐ {item.rating}/5
                </div>

              </div>


              <p className="mt-6 leading-7 text-[#5B5B5B]">
                {item.reflection}
              </p>


              {item.photo_url && (
                <img
                  src={item.photo_url}
                  alt={item.name}
                  className="
                  mt-6
                  h-48
                  rounded-2xl
                  object-cover
                  "
                />
              )}


              <div className="mt-8 flex gap-4">

                <ReflectionActions id={item.id} />

              </div>


            </div>

          ))}

        </div>

      </div>

    </main>
  );
}