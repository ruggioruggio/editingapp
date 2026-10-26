-- SqueakEdit: installazione completa del database in UN solo file.
-- Contiene 0001_init + 0002_social + 0003_admin e si può eseguire anche più
-- volte (o dopo un tentativo andato a metà): salta ciò che esiste già.
-- Supabase → SQL Editor → New query → incolla tutto → Run.

-- =========================================================================
-- 1. Profili
-- =========================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_.]{3,20}$'),
  display_name text check (char_length(display_name) <= 40),
  plan text not null default 'free' check (plan in ('free', 'pro')),
  xp integer not null default 0 check (xp >= 0),
  streak_count integer not null default 0 check (streak_count >= 0),
  streak_last_day date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists pro_until timestamptz;
alter table public.profiles add column if not exists banned_until timestamptz;
alter table public.profiles add column if not exists ban_reason text check (char_length(ban_reason) <= 200);

alter table public.profiles enable row level security;
drop policy if exists "Gli utenti loggati vedono i profili" on public.profiles;
create policy "Gli utenti loggati vedono i profili"
  on public.profiles for select to authenticated using (true);
drop policy if exists "Ognuno aggiorna solo il proprio profilo" on public.profiles;
create policy "Ognuno aggiorna solo il proprio profilo"
  on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- il client non può toccare piano, Pro regalato né sospensioni
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (username, display_name, xp, streak_count, streak_last_day, updated_at) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text;
  candidate text;
  n integer := 0;
begin
  base := regexp_replace(
    lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1), '')),
    '[^a-z0-9_.]', '', 'g'
  );
  if char_length(base) < 3 then
    base := 'squeaker';
  end if;
  base := left(base, 16);
  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    n := n + 1;
    candidate := base || n::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (new.id, candidate, left(new.raw_user_meta_data ->> 'full_name', 40))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- profili per chi si era registrato prima che esistesse la tabella
do $$
declare
  u record;
  base text;
  candidate text;
  n integer;
begin
  for u in select * from auth.users au where not exists (select 1 from public.profiles p where p.id = au.id) loop
    base := regexp_replace(lower(coalesce(u.raw_user_meta_data ->> 'username', split_part(u.email, '@', 1), '')), '[^a-z0-9_.]', '', 'g');
    if char_length(base) < 3 then base := 'squeaker'; end if;
    base := left(base, 16);
    candidate := base;
    n := 0;
    while exists (select 1 from public.profiles where username = candidate) loop
      n := n + 1;
      candidate := base || n::text;
    end loop;
    insert into public.profiles (id, username) values (u.id, candidate);
  end loop;
end;
$$;

create or replace function public.username_available(name text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select not exists (select 1 from public.profiles where username = lower(name));
$$;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- =========================================================================
-- 2. Progressi
-- =========================================================================
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;
drop policy if exists "Leggo i miei progressi" on public.progress;
create policy "Leggo i miei progressi"
  on public.progress for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Creo i miei progressi" on public.progress;
create policy "Creo i miei progressi"
  on public.progress for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Aggiorno i miei progressi" on public.progress;
create policy "Aggiorno i miei progressi"
  on public.progress for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.progress from anon, authenticated;
grant select, insert, update on public.progress to authenticated;

-- =========================================================================
-- 3. Amicizie
-- =========================================================================
create table if not exists public.friendships (
  id bigint generated always as identity primary key,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  check (requester_id <> addressee_id)
);
create unique index if not exists friendships_pair_idx
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists friendships_addressee_idx on public.friendships (addressee_id);

alter table public.friendships enable row level security;
drop policy if exists "Vedo le amicizie in cui sono coinvolto" on public.friendships;
create policy "Vedo le amicizie in cui sono coinvolto"
  on public.friendships for select to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));
drop policy if exists "Invio richieste solo a mio nome" on public.friendships;
create policy "Invio richieste solo a mio nome"
  on public.friendships for insert to authenticated
  with check (requester_id = (select auth.uid()) and status = 'pending');
drop policy if exists "Solo chi riceve la richiesta può accettarla" on public.friendships;
create policy "Solo chi riceve la richiesta può accettarla"
  on public.friendships for update to authenticated
  using (addressee_id = (select auth.uid()))
  with check (addressee_id = (select auth.uid()) and status = 'accepted');
drop policy if exists "Ognuno dei due può annullare o rimuovere" on public.friendships;
create policy "Ognuno dei due può annullare o rimuovere"
  on public.friendships for delete to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));
revoke all on public.friendships from anon, authenticated;
grant select, insert, delete on public.friendships to authenticated;
grant update (status) on public.friendships to authenticated;

create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester_id = a and f.addressee_id = b) or (f.requester_id = b and f.addressee_id = a))
  );
$$;
revoke all on function public.are_friends(uuid, uuid) from public;
grant execute on function public.are_friends(uuid, uuid) to authenticated;

-- =========================================================================
-- 4. Chat
-- =========================================================================
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  sender_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);
create index if not exists messages_pair_idx on public.messages (sender_id, recipient_id, created_at desc);
create index if not exists messages_unread_idx on public.messages (recipient_id) where read_at is null;

alter table public.messages enable row level security;
drop policy if exists "Vedo i messaggi che ho inviato o ricevuto" on public.messages;
create policy "Vedo i messaggi che ho inviato o ricevuto"
  on public.messages for select to authenticated
  using ((select auth.uid()) in (sender_id, recipient_id));
drop policy if exists "Scrivo solo ai miei amici" on public.messages;
create policy "Scrivo solo ai miei amici"
  on public.messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.are_friends(sender_id, recipient_id));
drop policy if exists "Chi riceve segna come letto" on public.messages;
create policy "Chi riceve segna come letto"
  on public.messages for update to authenticated
  using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));
drop policy if exists "Cancello i miei messaggi" on public.messages;
create policy "Cancello i miei messaggi"
  on public.messages for delete to authenticated
  using (sender_id = (select auth.uid()));
revoke all on public.messages from anon, authenticated;
grant select, insert, delete on public.messages to authenticated;
grant update (read_at) on public.messages to authenticated;

-- messaggi in tempo reale
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;

-- =========================================================================
-- 5. Attività giornaliera e bacheca
-- =========================================================================
create table if not exists public.daily_activity (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  day date not null,
  lessons integer not null default 0 check (lessons >= 0),
  primary key (user_id, day)
);
alter table public.daily_activity enable row level security;
drop policy if exists "Vedo la mia attività e quella degli amici" on public.daily_activity;
create policy "Vedo la mia attività e quella degli amici"
  on public.daily_activity for select to authenticated
  using (user_id = (select auth.uid()) or public.are_friends((select auth.uid()), user_id));
drop policy if exists "Registro la mia attività" on public.daily_activity;
create policy "Registro la mia attività"
  on public.daily_activity for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Aggiorno la mia attività" on public.daily_activity;
create policy "Aggiorno la mia attività"
  on public.daily_activity for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.daily_activity from anon, authenticated;
grant select, insert, update on public.daily_activity to authenticated;

create table if not exists public.activity_events (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('lesson_completed', 'achievement_unlocked', 'streak_milestone')),
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 2000),
  created_at timestamptz not null default now()
);
create index if not exists activity_events_user_idx on public.activity_events (user_id, created_at desc);
alter table public.activity_events enable row level security;
drop policy if exists "Vedo le mie attività e quelle degli amici" on public.activity_events;
create policy "Vedo le mie attività e quelle degli amici"
  on public.activity_events for select to authenticated
  using (user_id = (select auth.uid()) or public.are_friends((select auth.uid()), user_id));
drop policy if exists "Pubblico solo a mio nome" on public.activity_events;
create policy "Pubblico solo a mio nome"
  on public.activity_events for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Cancello le mie attività" on public.activity_events;
create policy "Cancello le mie attività"
  on public.activity_events for delete to authenticated using (user_id = (select auth.uid()));
revoke all on public.activity_events from anon, authenticated;
grant select, insert, delete on public.activity_events to authenticated;

create or replace function public.shared_streak_between(me uuid, friend uuid, today date)
returns integer
language sql
security definer
set search_path = ''
stable
as $$
  with both_days as (
    select a.day
    from public.daily_activity a
    join public.daily_activity b on b.day = a.day and b.user_id = friend and b.lessons > 0
    where a.user_id = me and a.lessons > 0 and a.day <= today
  ),
  islands as (
    select day, day + (row_number() over (order by day desc))::integer as grp from both_days
  ),
  latest as (select grp, day from islands order by day desc limit 1)
  select case
    when (select day from latest) >= today - 1
      then (select count(*)::integer from islands where grp = (select grp from latest))
    else 0
  end;
$$;
revoke all on function public.shared_streak_between(uuid, uuid, date) from public;

create or replace function public.shared_streaks(today date)
returns table (friend_id uuid, streak integer)
language sql
security definer
set search_path = ''
stable
as $$
  select other, public.shared_streak_between((select auth.uid()), other, today)
  from (
    select case when f.requester_id = (select auth.uid()) then f.addressee_id else f.requester_id end as other
    from public.friendships f
    where f.status = 'accepted' and (select auth.uid()) in (f.requester_id, f.addressee_id)
  ) friends;
$$;
revoke all on function public.shared_streaks(date) from public;
grant execute on function public.shared_streaks(date) to authenticated;

-- =========================================================================
-- 6. Amministrazione (Pro regalato, sospensioni, annunci, registro)
-- =========================================================================
create or replace function public.is_banned(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.banned_until is not null and p.banned_until > now());
$$;

drop policy if exists "Gli utenti sospesi non scrivono" on public.messages;
create policy "Gli utenti sospesi non scrivono"
  on public.messages as restrictive for insert to authenticated
  with check (not public.is_banned((select auth.uid())));
drop policy if exists "Gli utenti sospesi non chiedono amicizie" on public.friendships;
create policy "Gli utenti sospesi non chiedono amicizie"
  on public.friendships as restrictive for insert to authenticated
  with check (not public.is_banned((select auth.uid())));
drop policy if exists "Gli utenti sospesi non pubblicano attività" on public.activity_events;
create policy "Gli utenti sospesi non pubblicano attività"
  on public.activity_events as restrictive for insert to authenticated
  with check (not public.is_banned((select auth.uid())));

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
drop policy if exists "Tutti leggono le impostazioni" on public.app_settings;
create policy "Tutti leggono le impostazioni" on public.app_settings for select to anon, authenticated using (true);
revoke all on public.app_settings from anon, authenticated;
grant select on public.app_settings to anon, authenticated;

create table if not exists public.admin_log (
  id bigint generated always as identity primary key,
  action text not null,
  target text,
  details jsonb,
  created_at timestamptz not null default now()
);
alter table public.admin_log enable row level security;
revoke all on public.admin_log from anon, authenticated;

-- 0004: avatar personalizzato
-- Avatar personalizzato (pelo, maglietta, muscoli, accessori, sfondo):
-- ognuno può modificare solo il proprio, gli altri lo vedono nei profili.
alter table public.profiles add column if not exists avatar jsonb;
alter table public.profiles drop constraint if exists profiles_avatar_size;
alter table public.profiles add constraint profiles_avatar_size check (avatar is null or pg_column_size(avatar) < 1024);
grant update (avatar) on public.profiles to authenticated;
