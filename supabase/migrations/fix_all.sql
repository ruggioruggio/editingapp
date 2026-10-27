-- SqueakEdit: script idempotente che applica tutto ciò che manca.
-- Sicuro da rieseguire più volte: non dà errore se le cose esistono già.

-- ===================== 0002_social (funzioni + tabelle) =====================

-- are_friends: CREATE OR REPLACE per evitare "already exists"
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

-- messages
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

do $$ begin
  if not exists (select 1 from pg_policies where tablename='messages' and policyname='Vedo i messaggi che ho inviato o ricevuto') then
    create policy "Vedo i messaggi che ho inviato o ricevuto" on public.messages for select to authenticated using ((select auth.uid()) in (sender_id, recipient_id));
  end if;
  if not exists (select 1 from pg_policies where tablename='messages' and policyname='Scrivo solo ai miei amici') then
    create policy "Scrivo solo ai miei amici" on public.messages for insert to authenticated with check (sender_id = (select auth.uid()) and public.are_friends(sender_id, recipient_id));
  end if;
  if not exists (select 1 from pg_policies where tablename='messages' and policyname='Chi riceve segna come letto') then
    create policy "Chi riceve segna come letto" on public.messages for update to authenticated using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename='messages' and policyname='Cancello i miei messaggi') then
    create policy "Cancello i miei messaggi" on public.messages for delete to authenticated using (sender_id = (select auth.uid()));
  end if;
end $$;

revoke all on public.messages from anon, authenticated;
grant select, insert, delete on public.messages to authenticated;
grant update (read_at) on public.messages to authenticated;

-- realtime (ignora se già aggiunta)
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;

-- daily_activity
create table if not exists public.daily_activity (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  day date not null,
  lessons integer not null default 0 check (lessons >= 0),
  primary key (user_id, day)
);

alter table public.daily_activity enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='daily_activity' and policyname='Vedo la mia attività e quella degli amici') then
    create policy "Vedo la mia attività e quella degli amici" on public.daily_activity for select to authenticated using (user_id = (select auth.uid()) or public.are_friends((select auth.uid()), user_id));
  end if;
  if not exists (select 1 from pg_policies where tablename='daily_activity' and policyname='Registro la mia attività') then
    create policy "Registro la mia attività" on public.daily_activity for insert to authenticated with check (user_id = (select auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename='daily_activity' and policyname='Aggiorno la mia attività') then
    create policy "Aggiorno la mia attività" on public.daily_activity for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
  end if;
end $$;

revoke all on public.daily_activity from anon, authenticated;
grant select, insert, update on public.daily_activity to authenticated;

-- activity_events
create table if not exists public.activity_events (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('lesson_completed', 'achievement_unlocked', 'streak_milestone')),
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 2000),
  created_at timestamptz not null default now()
);

create index if not exists activity_events_user_idx on public.activity_events (user_id, created_at desc);

alter table public.activity_events enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='activity_events' and policyname='Vedo le mie attività e quelle degli amici') then
    create policy "Vedo le mie attività e quelle degli amici" on public.activity_events for select to authenticated using (user_id = (select auth.uid()) or public.are_friends((select auth.uid()), user_id));
  end if;
  if not exists (select 1 from pg_policies where tablename='activity_events' and policyname='Pubblico solo a mio nome') then
    create policy "Pubblico solo a mio nome" on public.activity_events for insert to authenticated with check (user_id = (select auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename='activity_events' and policyname='Cancello le mie attività') then
    create policy "Cancello le mie attività" on public.activity_events for delete to authenticated using (user_id = (select auth.uid()));
  end if;
end $$;

revoke all on public.activity_events from anon, authenticated;
grant select, insert, delete on public.activity_events to authenticated;

-- shared_streak_between
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

-- shared_streaks
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

-- ===================== 0003_admin =====================

alter table public.profiles
  add column if not exists pro_until timestamptz,
  add column if not exists banned_until timestamptz;

-- ban_reason: aggiungi solo se manca (il check constraint non supporta IF NOT EXISTS)
do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='ban_reason') then
    alter table public.profiles add column ban_reason text check (char_length(ban_reason) <= 200);
  end if;
end $$;

create or replace function public.is_banned(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.banned_until is not null and p.banned_until > now());
$$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='messages' and policyname='Gli utenti sospesi non scrivono') then
    create policy "Gli utenti sospesi non scrivono" on public.messages as restrictive for insert to authenticated with check (not public.is_banned((select auth.uid())));
  end if;
  if not exists (select 1 from pg_policies where tablename='friendships' and policyname='Gli utenti sospesi non chiedono amicizie') then
    create policy "Gli utenti sospesi non chiedono amicizie" on public.friendships as restrictive for insert to authenticated with check (not public.is_banned((select auth.uid())));
  end if;
  if not exists (select 1 from pg_policies where tablename='activity_events' and policyname='Gli utenti sospesi non pubblicano attività') then
    create policy "Gli utenti sospesi non pubblicano attività" on public.activity_events as restrictive for insert to authenticated with check (not public.is_banned((select auth.uid())));
  end if;
end $$;

-- app_settings
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='app_settings' and policyname='Tutti leggono le impostazioni') then
    create policy "Tutti leggono le impostazioni" on public.app_settings for select to anon, authenticated using (true);
  end if;
end $$;

revoke all on public.app_settings from anon, authenticated;
grant select on public.app_settings to anon, authenticated;

-- admin_log
create table if not exists public.admin_log (
  id bigint generated always as identity primary key,
  action text not null,
  target text,
  details jsonb,
  created_at timestamptz not null default now()
);
alter table public.admin_log enable row level security;
revoke all on public.admin_log from anon, authenticated;

-- ===================== 0005_roles =====================

alter table public.profiles
  add column if not exists role text check (role in ('owner', 'moderatore', 'amico', 'founder'));
