import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isValidLocale } from "@/lib/i18n";
import { feedbackMessages } from "@/lib/feedback/messages";
import { FeedbackError, staffIdentity } from "@/lib/feedback/server";
import TeacherStoryGrid from "@/components/feedback/TeacherStoryGrid";
import FeedbackLink from "@/components/feedback/FeedbackLink";
import PortalSignOut from "@/components/admin/PortalSignOut";
export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function TeacherStories({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> }) {
  const { locale } = await params; if (!isValidLocale(locale)) notFound();
  const identity = await staffIdentity("teacher").catch(e => { if (e instanceof FeedbackError) redirect(`/${locale}/portal/login`); throw e; });
  const { admin, user } = identity; const t = feedbackMessages[locale];
  const page = Math.max(0, Math.min(100000, Math.floor(Number((await searchParams).page) || 0)));
  const result = await admin.from("learner_feedback").select("id, name, role, country, rating, reflection, learning_context, created_at", { count: "exact" })
    .eq("teacher_id", user.id).eq("share_with_teacher", true).eq("review_status", "reviewed").order("created_at", { ascending: false }).order("id").range(page * 20, page * 20 + 19);
  // Explicit historical records reviewed by the owner. New feedback keeps its separate consent flow.
  const earlier = await admin.from("reflections")
    .select("id, name, role, country, rating, reflection, created_at, photo_url")
    .eq("teacher_id", user.id).eq("approved", true)
    .in("id", ["6aabf30f-4b49-4f96-b1fd-4f3320791891", "5541110c-2442-4e8d-8e4d-f51752bbd042", "e58cb5e6-577f-46d9-a87e-914a7c8c0fac", "8608f15d-6213-4383-aa93-7c2867260e56", "3c9c8a30-4ed8-4c12-80bb-8f054d5b41a0", "caaee9af-78f8-474d-ad10-3fc0008b56b7", "bdace701-6743-45b8-98a1-87fb15815f5d", "016e0fb3-a2c4-4fa9-bcc3-8137b6019693", "e0a5483e-a7bd-44bb-ba1e-9813d6ea37d2", "5bf00a4a-8f05-422d-8171-85f2fdd5861f", "cb7ed611-0837-46d2-a19e-dea4a2bc388d", "1bd5acf8-4024-40c4-82f5-7e22ac5c7648", "69b759f8-eb8c-48e9-b745-1a67150eb98d", "3ad1ae98-dbfb-45cb-b01c-70600074bcf4", "e7312dfc-5673-4ae0-8081-6fee1ef741a3", "0191fc07-4243-4e0b-a784-298772cce159", "9647a798-e3ca-4baf-ba8a-7c649f9613b8", "27c1ff70-8329-4a77-87be-28f6b7570a17", "90b1aa16-ad59-46b1-8da0-b5d0561e37f9", "81a9076a-f803-461f-9bb5-7f9fa939b241", "c24a8dab-d595-42db-a887-bfe64f1ab43d", "3bfc8c04-ff7f-45a3-8f00-d592e76afd06"])
    .order("created_at", { ascending: false }).order("id");
  const earlierTitle = { en: "Earlier learner stories", ko: "이전에 나눈 학습 이야기", zh: "以往的学员故事", ja: "これまでの学習者の声" }[locale];
  const profile = await admin.from("teacher_public_profiles").select("slug").eq("teacher_id", user.id).eq("is_published", true).maybeSingle();
  const nav = [["Home", ""], ["My Lessons", "/lessons"], ["My Students", "/students"], ["Progress Reports", "/progress-reports"], [t.stories, "/stories"], ["Availability", "/availability"], ["My Profile", "/profile"], ["Teacher Agreement", "/agreement"], ["Payroll", "/payroll"]];
  return <main className="min-h-screen bg-[#FAF8F5] text-[#292929]"><div className="mx-auto flex min-h-screen max-w-[1500px]">
    <aside className="lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto hidden w-[250px] shrink-0 flex-col border-r border-[#E4DDD4] bg-[#F4F1EC] px-5 py-7 lg:flex"><p className="text-sm font-semibold tracking-widest text-[#5F7F63]">HAMKKE │ 함께</p><p className="mt-1 font-serif text-sm text-[#6F8F72]">Teacher Portal</p><nav className="mt-9 space-y-1.5">{nav.map(([label, path]) => <Link key={path} href={`/${locale}/admin/teachers${path}`} aria-current={path === "/stories" ? "page" : undefined} className={`block rounded-xl px-3 py-2.5 text-sm ${path === "/stories" ? "bg-[#E2EBDD] text-[#49614D]" : "hover:bg-[#ECE8E2]"}`}>{label}</Link>)}</nav><div className="mt-auto pt-8"><PortalSignOut locale={locale} /></div></aside>
    <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><div className="mb-7 flex justify-between lg:hidden"><Link href={`/${locale}/admin/teachers`} className="text-sm underline">Teacher Portal</Link><PortalSignOut locale={locale} /></div><p className="text-xs uppercase tracking-widest text-[#6F8F72]">Teacher Portal</p><h1 className="mt-3 font-serif text-4xl sm:text-5xl">{t.stories}</h1>
      {!profile.error && profile.data?.slug && <FeedbackLink locale={locale} slug={profile.data.slug} />}
      {result.error ? <p role="alert" className="mt-8">{t.error}</p> : <div className="mt-8 space-y-5">{!(result.data ?? []).length && !(earlier.data ?? []).length && <p className="rounded-2xl border border-[#E7DDD1] bg-white p-8 text-[#607568]">{t.empty}</p>}<TeacherStoryGrid stories={result.data ?? []} locale={locale} /></div>}
      <nav aria-label="Pages" className="mt-6 flex gap-6">{page > 0 && <Link href={`?page=${page-1}`} aria-label="Previous page">←</Link>}{(result.count ?? 0) > (page+1)*20 && <Link href={`?page=${page+1}`} aria-label="Next page">→</Link>}</nav>
      {earlier.error ? <p role="alert" className="mt-8">{t.error}</p> : !!earlier.data?.length && <section className="mt-10 border-t border-[#E4DDD4] pt-8" aria-labelledby="earlier-stories">
        <h2 id="earlier-stories" className="font-serif text-3xl">{earlierTitle} <span className="font-sans text-sm text-[#607568]">({earlier.data.length})</span></h2>
        <div className="mt-5"><TeacherStoryGrid stories={earlier.data} locale={locale} /></div>
      </section>}
    </section></div></main>;
}
