import ReflectionForm from "@/components/ReflectionForm";

export default function SharePage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5]">

      {/* Hero */}
      <section className="mx-auto max-w-2xl px-6 pt-28 pb-16 text-center">

        <p
          className="
            text-sm
            uppercase
            tracking-[0.3em]
            text-[#6F8F72]
          "
        >
          Student Reflections
        </p>

        <h1
          className="
            mt-6
            text-5xl
            leading-tight
            text-[#2B2B2B]
            [font-family:var(--font-cormorant)]
            md:text-6xl
          "
        >
          Every Conversation Leaves a Story
        </h1>

        <p
          className="
            mt-5
            text-2xl
            italic
            text-[#6F8F72]
            [font-family:var(--font-cormorant)]
          "
        >
          We'd love to hear yours.
        </p>

      </section>

      {/* Reflection Form */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <ReflectionForm />
      </section>

    </main>
  );
}