-- Chat ricca: foto, vocali, risposte, reazioni e inviti alla serie condivisa.

-- 1. Tipi di messaggio, allegati e risposte
alter table public.messages add column if not exists kind text not null default 'text';
alter table public.messages add column if not exists media_path text;
alter table public.messages add column if not exists meta jsonb;
alter table public.messages add column if not exists reply_to bigint references public.messages (id) on delete set null;

alter table public.messages drop constraint if exists messages_kind_check;
alter table public.messages add constraint messages_kind_check check (kind in ('text', 'image', 'audio', 'streak_invite'));
-- il testo è obbligatorio solo per i messaggi di testo
alter table public.messages drop constraint if exists messages_body_check;
alter table public.messages add constraint messages_body_check check (
  (kind = 'text' and char_length(body) between 1 and 1000) or (kind <> 'text' and char_length(body) <= 1000)
);
-- un allegato può stare solo nella cartella mittente/destinatario di questo messaggio
alter table public.messages drop constraint if exists messages_media_path_check;
alter table public.messages add constraint messages_media_path_check check (
  media_path is null or (
    split_part(media_path, '/', 1) = sender_id::text and split_part(media_path, '/', 2) = recipient_id::text
  )
);
alter table public.messages drop constraint if exists messages_meta_size;
alter table public.messages add constraint messages_meta_size check (meta is null or pg_column_size(meta) < 2048);

-- 2. Reazioni (una per persona per messaggio, come su TikTok)
create table if not exists public.message_reactions (
  message_id bigint not null references public.messages (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  emoji text not null check (emoji in ('❤️', '😂', '😮', '😢', '🔥', '👍')),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);
alter table public.message_reactions enable row level security;

create or replace function public.in_conversation(msg bigint)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.messages m where m.id = msg and (select auth.uid()) in (m.sender_id, m.recipient_id));
$$;
revoke all on function public.in_conversation(bigint) from public;
grant execute on function public.in_conversation(bigint) to authenticated;

drop policy if exists "Vedo le reazioni delle mie chat" on public.message_reactions;
create policy "Vedo le reazioni delle mie chat" on public.message_reactions
  for select to authenticated using (public.in_conversation(message_id));
drop policy if exists "Reagisco solo a mio nome" on public.message_reactions;
create policy "Reagisco solo a mio nome" on public.message_reactions
  for insert to authenticated with check (user_id = (select auth.uid()) and public.in_conversation(message_id));
drop policy if exists "Cambio la mia reazione" on public.message_reactions;
create policy "Cambio la mia reazione" on public.message_reactions
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "Tolgo la mia reazione" on public.message_reactions;
create policy "Tolgo la mia reazione" on public.message_reactions
  for delete to authenticated using (user_id = (select auth.uid()));
revoke all on public.message_reactions from anon, authenticated;
grant select, insert, delete on public.message_reactions to authenticated;
grant update (emoji) on public.message_reactions to authenticated;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'message_reactions') then
    alter publication supabase_realtime add table public.message_reactions;
  end if;
end $$;

-- 3. Allegati: bucket privato, leggibile solo da mittente e destinatario
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-media', 'chat-media', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/aac'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Chat: carico nella mia cartella verso un amico" on storage.objects;
create policy "Chat: carico nella mia cartella verso un amico" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'chat-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.are_friends((select auth.uid()), ((storage.foldername(name))[2])::uuid)
  );
drop policy if exists "Chat: vedo i file delle mie conversazioni" on storage.objects;
create policy "Chat: vedo i file delle mie conversazioni" on storage.objects
  for select to authenticated using (
    bucket_id = 'chat-media'
    and (select auth.uid())::text in ((storage.foldername(name))[1], (storage.foldername(name))[2])
  );
drop policy if exists "Chat: cancello i file che ho inviato" on storage.objects;
create policy "Chat: cancello i file che ho inviato" on storage.objects
  for delete to authenticated using (
    bucket_id = 'chat-media' and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- 4. Serie condivisa su invito: conta solo dal giorno in cui entrambi hanno accettato
create table if not exists public.streak_pacts (
  id bigint generated always as identity primary key,
  user_a uuid not null references public.profiles (id) on delete cascade,
  user_b uuid not null references public.profiles (id) on delete cascade,
  invited_by uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active')),
  started_on date,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);
alter table public.streak_pacts enable row level security;
drop policy if exists "Vedo i miei patti" on public.streak_pacts;
create policy "Vedo i miei patti" on public.streak_pacts
  for select to authenticated using ((select auth.uid()) in (user_a, user_b));
drop policy if exists "Sciolgo i miei patti" on public.streak_pacts;
create policy "Sciolgo i miei patti" on public.streak_pacts
  for delete to authenticated using ((select auth.uid()) in (user_a, user_b));
revoke all on public.streak_pacts from anon, authenticated;
grant select, delete on public.streak_pacts to authenticated;

-- invito: crea il patto e il messaggio-invito in un colpo solo (solo tra amici)
create or replace function public.invite_streak(friend uuid)
returns bigint language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  pact bigint;
begin
  if me is null or not public.are_friends(me, friend) then raise exception 'Solo tra amici'; end if;
  insert into public.streak_pacts (user_a, user_b, invited_by)
    values (least(me, friend), greatest(me, friend), me)
    on conflict (user_a, user_b) do nothing
    returning id into pact;
  if pact is null then raise exception 'Avete già una serie condivisa o un invito in sospeso'; end if;
  insert into public.messages (sender_id, recipient_id, body, kind, meta)
    values (me, friend, '', 'streak_invite', jsonb_build_object('pact_id', pact));
  return pact;
end;
$$;
revoke all on function public.invite_streak(uuid) from public;
grant execute on function public.invite_streak(uuid) to authenticated;

-- accetta: solo chi è stato invitato; la serie parte da oggi
create or replace function public.accept_streak(pact bigint)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.streak_pacts set status = 'active', started_on = current_date
    where id = pact and status = 'pending' and invited_by <> auth.uid() and auth.uid() in (user_a, user_b);
  if not found then raise exception 'Invito non valido'; end if;
end;
$$;
revoke all on function public.accept_streak(bigint) from public;
grant execute on function public.accept_streak(bigint) to authenticated;

create or replace function public.shared_streak_since(me uuid, friend uuid, today date, since date)
returns integer language sql security definer set search_path = '' stable as $$
  with both_days as (
    select a.day
    from public.daily_activity a
    join public.daily_activity b on b.day = a.day and b.user_id = friend and b.lessons > 0
    where a.user_id = me and a.lessons > 0 and a.day <= today and a.day >= since
  ),
  islands as (select day, day + (row_number() over (order by day desc))::integer as grp from both_days),
  latest as (select grp, day from islands order by day desc limit 1)
  select case
    when (select day from latest) >= today - 1 then (select count(*)::integer from islands where grp = (select grp from latest))
    else 0
  end;
$$;
revoke all on function public.shared_streak_since(uuid, uuid, date, date) from public;

-- ora la serie condivisa esiste solo per i patti attivi
create or replace function public.shared_streaks(today date)
returns table (friend_id uuid, streak integer)
language sql security definer set search_path = '' stable as $$
  select other, public.shared_streak_since((select auth.uid()), other, today, p.started_on)
  from (
    select case when user_a = (select auth.uid()) then user_b else user_a end as other, started_on
    from public.streak_pacts
    where status = 'active' and (select auth.uid()) in (user_a, user_b)
  ) p;
$$;
revoke all on function public.shared_streaks(date) from public;
grant execute on function public.shared_streaks(date) to authenticated;

notify pgrst, 'reload schema';
