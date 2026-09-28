import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const DAILY_THOUGHTS = [
  "You made the system to save time. Try not to spend all day improving the system.",
  "Some days you build the business. Some days the business builds your patience.",
  "Progress is great. So is closing the laptop on time.",
  "Building something takes time. Mostly because everything has edge cases.",
  "A productive day can also mean deciding what isn't worth doing.",
  "Small improvements are suspiciously good at becoming big ones.",
  "Not every problem needs a new feature.",
  "Consistency is less exciting than motivation. It also shows up more often.",
  "If everything feels urgent, something probably needs a better system.",
  "A quiet day with fewer problems is still a successful day.",
  "You can care about the details without letting the details eat the whole day.",
  "The goal is a business that works, not a to-do list that never ends.",
  "Good systems should eventually give you fewer things to think about.",
  "Some problems need fixing. Others just need tomorrow.",
  "There will always be one more thing to improve. That's not a deadline.",
  "Being busy and moving forward occasionally have very different schedules.",
  "You don't have to optimize a thing that already works.",
  "The boring little improvements are usually doing more than they get credit for.",
  "A business grows one sensible decision at a time. Usually between several questionable ones.",
  "Today's win may simply be making tomorrow less complicated.",
  "Teaching requires patience. Running the teaching business apparently requires extra.",
  "If the plan changed, congratulations: the plan met reality.",
  "You are allowed to finish the day before the ideas do.",
  "A clear no can save more time than an enthusiastic maybe.",
  "The best workflow is sometimes the one you stop changing.",
  "Slow progress still counts. It just has terrible marketing.",
  "A good decision today is enough. You don't need twelve.",
  "The tiny task you've been avoiding would like to formally remain tiny.",
  "Rest is not a bug in the productivity system.",
  "There is no prize for making a simple thing complicated.",
  "Some days the most professional thing you can do is call it a day.",
];

function getPhilippineDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getDailyThought() {
  const dateKey = getPhilippineDateKey();
  let hash = 0;

  for (const character of dateKey) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return DAILY_THOUGHTS[hash % DAILY_THOUGHTS.length];
}

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner" || profile?.status !== "active") {
    redirect(`/${locale}/admin/teachers`);
  }

  const firstName =
    profile.full_name?.trim().split(/\s+/)[0] ||
    user.user_metadata?.full_name?.trim().split(/\s+/)[0] ||
    "Jesica";

  const thought = getDailyThought();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAF8F5]">
      {/* Soft Hamkke-inspired background forms */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full border border-[#DDE5D9]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 top-10 h-[260px] w-[260px] rounded-full bg-[#EEF2EA]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-150px] left-[10%] h-[310px] w-[310px] rounded-full border border-[#E4DDD4]"
      />

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1320px] flex-col justify-center px-10 py-20 sm:px-14 lg:px-20">
        <div className="max-w-[940px] -translate-y-5">
          <div className="mb-8 flex items-center gap-4">
            <span className="h-px w-12 bg-[#6F8F72]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#6F8F72]">
              A thought for today
            </span>
          </div>

          <h1 className="font-serif text-[clamp(2.3rem,4vw,4rem)] font-normal leading-[1.05] tracking-[-0.03em] text-[#292929]">
            Greetings, {firstName}.
          </h1>

          <div className="relative mt-12 max-w-[900px] pl-7 sm:pl-10">
            <span
              aria-hidden="true"
              className="absolute -left-1 -top-8 font-serif text-[88px] font-normal leading-none text-[#C8D5C4]"
            >
              “
            </span>

            <p className="relative font-serif text-[clamp(1.8rem,3.2vw,3.15rem)] font-normal leading-[1.3] tracking-[-0.025em] text-[#3B3A37]">
              {thought}
            </p>

            <div className="mt-10 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#6F8F72]" />
              <span className="h-px w-20 bg-[#D5CEC4]" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
