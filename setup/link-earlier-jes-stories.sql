begin;
do $$
begin
  if not exists (select 1 from public.teacher_public_profiles where teacher_id = '8e03f361-ba0d-4c4a-8f19-8807c3c73fff' and slug = 'jesica') then
    raise exception 'Teacher Jes profile does not match. Nothing changed.';
  end if;
  perform 1 from public.reflections where id = '3bfc8c04-ff7f-45a3-8f00-d592e76afd06' and name = 'Ethan' and approved is true and (teacher_id is null or teacher_id = '8e03f361-ba0d-4c4a-8f19-8807c3c73fff') for update;
  if not found then raise exception 'Ethan record has changed or is missing. Nothing changed.'; end if;
  update public.reflections set teacher_id = '8e03f361-ba0d-4c4a-8f19-8807c3c73fff'
  where id = '3bfc8c04-ff7f-45a3-8f00-d592e76afd06' and teacher_id is null;
end $$;
commit;
