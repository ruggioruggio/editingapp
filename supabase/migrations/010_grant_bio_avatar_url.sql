grant update (bio, avatar_url) on public.profiles to authenticated;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

create policy "Avatar upload" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] is not null);

create policy "Avatar update" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '.', 1));

create policy "Avatar read" on storage.objects for select to public
using (bucket_id = 'avatars');
