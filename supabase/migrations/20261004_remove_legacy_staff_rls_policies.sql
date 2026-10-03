-- Remove legacy authenticated-user policies that bypass active-staff RLS.
-- Access to these operational tables is governed by the existing
-- is_active_staff() ALL policies.

drop policy if exists "Authenticated users can create students"
on public.students;
drop policy if exists "Authenticated users can delete students"
on public.students;
drop policy if exists "Authenticated users can update students"
on public.students;
drop policy if exists "Authenticated users can view students"
on public.students;

drop policy if exists "Authenticated users can create lessons"
on public.lessons;
drop policy if exists "Authenticated users can delete lessons"
on public.lessons;
drop policy if exists "Authenticated users can update lessons"
on public.lessons;
drop policy if exists "Authenticated users can view lessons"
on public.lessons;

drop policy if exists "Authenticated users can create enrollment students"
on public.enrollment_students;
drop policy if exists "Authenticated users can delete enrollment students"
on public.enrollment_students;
drop policy if exists "Authenticated users can update enrollment students"
on public.enrollment_students;
drop policy if exists "Authenticated users can view enrollment students"
on public.enrollment_students;

drop policy if exists "Authenticated users can create enrollment schedules"
on public.enrollment_schedules;
drop policy if exists "Authenticated users can delete enrollment schedules"
on public.enrollment_schedules;
drop policy if exists "Authenticated users can update enrollment schedules"
on public.enrollment_schedules;
drop policy if exists "Authenticated users can view enrollment schedules"
on public.enrollment_schedules;
