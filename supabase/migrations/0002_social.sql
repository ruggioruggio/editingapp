-- SqueakEdit: funzioni social tra amici (chat, serie condivise, attività).
-- Da eseguire DOPO 0001_init.sql.

-- ---------------------------------------------------------------------------
-- Due utenti sono amici? (usata dalle regole di sicurezza)
-- ---------------------------------------------------------------------------
create function public.are_friends(a uuid, b uuid)
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

-- ---------------------------------------------------------------------------
-- Chat: si può scrivere solo agli amici
-- ---------------------------------------------------------------------------
create table public.messages (
  id bigint generated always as identity primary key,
  sender_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);

create index messages_pair_idx on public.messages (sender_id, recipient_id, created_at desc);
create index messages_unread_idx on public.messages (recipient_id) where read_at is null;

alter table public.messages enable row level security;

create policy "Vedo i messaggi che ho inviato o ricevuto"
  on public.messages for select to authenticated
  using ((select auth.uid()) in (sender_id, recipient_id));

create policy "Scrivo solo ai miei amici"
  on public.messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.are_friends(sender_id, recipient_id));

create policy "Chi riceve segna come letto"
  on public.messages for update to authenticated
  using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));

create policy "Cancello i miei messaggi"
  on public.messages for delete to authenticated
  using (sender_id = (select auth.uid()));

revoke all on public.messages from anon, authenticated;
grant select, insert, delete on public.messages to authenticated;
grant update (read_at) on public.messages to authenticated;

-- messaggi in tempo reale
alter publication supabase_realtime add table public.messages;

-- ---------------------------------------------------------------------------
-- Attività giornaliera: serve a calcolare le serie condivise
-- ---------------------------------------------------------------------------
create table public.daily_activity (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  day date not null,
  lessons integer not null default 0 check (lessons >= 0),
  primary key (user_id, day)
);

alter table public.daily_activity enable row level security;

create policy "Vedo la mia attività e quella degli amici"
  on public.daily_activity for select to authenticated
  using (user_id = (select auth.uid()) or public.are_friends((select auth.uid()), user_id));
create policy "Registro la mia attività"
  on public.daily_activity for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Aggiorno la mia attività"
  on public.daily_activity for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

revoke all on public.daily_activity from anon, authenticated;
grant select, insert, update on public.daily_activity to authenticated;

-- ---------------------------------------------------------------------------
-- Bacheca: lezioni completate, obiettivi sbloccati, traguardi di serie
-- ---------------------------------------------------------------------------
create table public.activity_events (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('lesson_completed', 'achievement_unlocked', 'streak_milestone')),
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 2000),
  created_at timestamptz not null default now()
);

create index activity_events_user_idx on public.activity_events (user_id, created_at desc);

alter table public.activity_events enable row level security;

create policy "Vedo le mie attività e quelle degli amici"
  on public.activity_events for select to authenticated
  using (user_id = (select auth.uid()) or public.are_friends((select auth.uid()), user_id));
create policy "Pubblico solo a mio nome"
  on public.activity_events for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Cancello le mie attività"
  on public.activity_events for delete to authenticated using (user_id = (select auth.uid()));

revoke all on public.activity_events from anon, authenticated;
grant select, insert, delete on public.activity_events to authenticated;

-- ---------------------------------------------------------------------------
-- Serie condivisa: giorni consecutivi in cui ENTRAMBI hanno fatto una lezione,
-- fino a oggi o ieri (il "today" arriva dal client, che conosce il fuso dell'utente).
-- ---------------------------------------------------------------------------
create function public.shared_streak_between(me uuid, friend uuid, today date)
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

-- Serie condivise con tutti i miei amici in una sola chiamata
create function public.shared_streaks(today date)
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
