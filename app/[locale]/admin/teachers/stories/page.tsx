import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isValidLocale } from "@/lib/i18n";
import { feedbackMessages } from "@/lib/feedback/messages";
import { FeedbackError, staffIdentity } from "@/lib/feedback/server";
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
  const profile = await admin.from("teacher_public_profiles").select("slug").eq("teacher_id", user.id).eq("is_published", true).maybeSingle();
  const nav = [["Home", ""], ["My Lessons", "/lessons"], ["My Students", "/students"], ["Progress Reports", "/progress-reports"], [t.stories, "/stories"], ["Availability", "/availability"], ["My Profile", "/profile"], ["Teacher Agreement", "/agreement"], ["Payroll", "/payroll"]];
  return <main className="min-h-screen bg-[#FAF8F5] text-[#292929]"><div className="mx-auto flex min-h-screen max-w-[1500px]">
    <aside className="hidden w-[250px] shrink-0 flex-col border-r border-[#E4DDD4] bg-[#F4F1EC] px-5 py-7 lg:flex"><p className="text-sm font-semibold tracking-widest text-[#5F7F63]">HAMKKE │ 함께</p><p className="mt-1 font-serif text-sm text-[#6F8F72]">Teacher Portal</p><nav className="mt-9 space-y-1.5">{nav.map(([label, path]) => <Link key={path} href={`/${locale}/admin/teachers${path}`} aria-current={path === "/stories" ? "page" : undefined} className={`block rounded-xl px-3 py-2.5 text-sm ${path === "/stories" ? "bg-[#E2EBDD] text-[#49614D]" : "hover:bg-[#ECE8E2]"}`}>{label}</Link>)}</nav><div className="mt-auto pt-8"><PortalSignOut locale={locale} /></div></aside>
    <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><div className="mb-7 flex justify-between lg:hidden"><Link href={`/${locale}/admin/teachers`} className="text-sm underline">Teacher Portal</Link><PortalSignOut locale={locale} /></div><p className="text-xs uppercase tracking-widest text-[#6F8F72]">Teacher Portal</p><h1 className="mt-3 font-serif text-4xl sm:text-5xl">{t.stories}</h1>
      {!profile.error && profile.data?.slug && <FeedbackLink locale={locale} slug={profile.data.slug} />}
      {result.error ? <p role="alert" className="mt-8">{t.error}</p> : <div className="mt-8 space-y-5">{!(result.data ?? []).length && <p className="rounded-2xl border border-[#E7DDD1] bg-white p-8 text-[#607568]">{t.empty}</p>}{(result.data ?? []).map(f => <article key={f.id} className="rounded-2xl border border-[#E7DDD1] bg-white p-6"><div className="flex flex-wrap justify-between gap-3"><h2 className="font-serif text-2xl">{f.name}</h2><span className="text-sm text-[#607568]">{f.rating} / 5</span></div><p className="mt-1 text-xs text-[#777]">{f.role === "Student" ? t.student : t.parent}{f.country ? ` · ${f.country}` : ""} · {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "Asia/Manila" }).format(new Date(f.created_at))}</p>{f.learning_context === "elsewhere" && <p className="mt-3 text-xs font-medium text-[#607568]">{t.externalLabel}</p>}<p className="mt-5 whitespace-pre-wrap break-words text-base leading-8">{f.reflection}</p></article>)}</div>}
      <nav aria-label="Pages" className="mt-6 flex gap-6">{page > 0 && <Link href={`?page=${page-1}`} aria-label="Previous page">←</Link>}{(result.count ?? 0) > (page+1)*20 && <Link href={`?page=${page+1}`} aria-label="Next page">→</Link>}</nav>
    </section></div></main>;
}
