grant update (bio, avatar_url) on public.profiles to authenticated;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

drop policy if exists "Avatar upload" on storage.objects;
create policy "Avatar upload" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '.', 1));

drop policy if exists "Avatar update" on storage.objects;
create policy "Avatar update" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '.', 1));

drop policy if exists "Avatar read" on storage.objects;
create policy "Avatar read" on storage.objects for select to public
using (bucket_id = 'avatars');

create or replace function public.email_for_username(handle text)
returns text
language sql
security definer
set search_path = ''
as $$
  select u.email
  from auth.users u
  join public.profiles p on p.id = u.id
  where p.username = lower(handle)
  limit 1;
$$;
