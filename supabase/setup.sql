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
grant update (username, display_name, xp, streak_count, streak_last_day, updated_at, bio, avatar_url) on public.profiles to authenticated;

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
grant insert, update, delete on public.app_settings to authenticated;
drop policy if exists "Admin scrive le impostazioni" on public.app_settings;
create policy "Admin scrive le impostazioni"
  on public.app_settings for all to authenticated
  using (exists (select 1 from public.profiles where id = (select auth.uid()) and role in ('owner', 'moderatore')))
  with check (exists (select 1 from public.profiles where id = (select auth.uid()) and role in ('owner', 'moderatore')));

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

-- =========================================================================
-- Classifica pubblica (ospiti)
-- =========================================================================
-- Classifica leggibile anche dagli ospiti: espone solo i campi pubblici, la tabella profiles resta chiusa.
create or replace function public.public_leaderboard(max_rows integer default 50)
returns table (
  id uuid,
  username text,
  display_name text,
  bio text,
  avatar_url text,
  xp integer,
  streak_count integer,
  role text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.username, p.display_name, p.bio, p.avatar_url, p.xp, p.streak_count, p.role, p.created_at
  from public.profiles p
  order by p.xp desc
  limit least(greatest(max_rows, 1), 100);
$$;

revoke all on function public.public_leaderboard(integer) from public;
grant execute on function public.public_leaderboard(integer) to anon, authenticated;

notify pgrst, 'reload schema';


-- =========================================================================
-- Hardening (015)
-- =========================================================================
-- Hardening: limiti sui campi scritti dagli utenti, regole del bucket avatar e anti-spam.
-- "not valid" applica i vincoli alle nuove scritture senza bloccare la migrazione per dati vecchi.

-- 1. Profilo: bio con lunghezza massima (come nell'app) e foto solo dal nostro storage.
--    Senza questo, avatar_url poteva puntare a un server esterno che registra l'IP di chi guarda il profilo.
alter table public.profiles drop constraint if exists profiles_bio_length;
alter table public.profiles add constraint profiles_bio_length
  check (bio is null or char_length(bio) <= 150) not valid;

alter table public.profiles drop constraint if exists profiles_avatar_url_own_storage;
alter table public.profiles add constraint profiles_avatar_url_own_storage
  check (avatar_url is null or avatar_url ~ '^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/avatars/[A-Za-z0-9._-]+(\?t=[0-9]+)?$') not valid;

-- 2. Bucket avatar: solo immagini, massimo 2 MB (niente HTML/SVG/eseguibili ospitati sul nostro dominio).
update storage.buckets
  set file_size_limit = 2097152,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  where id = 'avatars';

-- 3. Anti-spam: al massimo 30 messaggi al minuto e 30 richieste di amicizia all'ora per utente.
create index if not exists messages_sender_created_idx on public.messages (sender_id, created_at desc);
create index if not exists friendships_requester_created_idx on public.friendships (requester_id, created_at desc);

create or replace function public.limit_message_rate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.messages
      where sender_id = new.sender_id and created_at > now() - interval '1 minute') >= 30 then
    raise exception 'Troppi messaggi: aspetta un minuto' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists messages_rate_limit on public.messages;
create trigger messages_rate_limit before insert on public.messages
  for each row execute function public.limit_message_rate();

create or replace function public.limit_friend_request_rate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.friendships
      where requester_id = new.requester_id and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'Troppe richieste di amicizia: riprova più tardi' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists friendships_rate_limit on public.friendships;
create trigger friendships_rate_limit before insert on public.friendships
  for each row execute function public.limit_friend_request_rate();

revoke all on function public.limit_message_rate() from public;
revoke all on function public.limit_friend_request_rate() from public;

notify pgrst, 'reload schema';


-- =========================================================================
-- Audit log (016)
-- =========================================================================
-- Audit log delle azioni critiche (GDPR art. 5.2 accountability, art. 32 sicurezza).
-- Principi: solo identificativi pseudonimi (UUID, hash dell'IP), mai nomi, email o testi liberi;
-- tabella in sola aggiunta (nessuno può modificare o cancellare righe dall'app); conservazione 12 mesi.

alter table public.admin_log add column if not exists actor text;       -- admin_panel | moderator | user | server
alter table public.admin_log add column if not exists actor_id uuid;    -- chi ha agito, se è un utente
alter table public.admin_log add column if not exists target_id uuid;   -- su chi, solo UUID
alter table public.admin_log add column if not exists ip_hash text;     -- HMAC troncato dell'IP, non reversibile
create index if not exists admin_log_created_idx on public.admin_log (created_at desc);

revoke all on public.admin_log from anon, authenticated;

-- Conservazione: le righe più vecchie di 12 mesi vengono rimosse a ogni nuovo inserimento.
create or replace function public.admin_log_retention()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.admin_log where created_at < now() - interval '12 months';
  return null;
end;
$$;
drop trigger if exists admin_log_retention on public.admin_log;
create trigger admin_log_retention after insert on public.admin_log
  for each statement execute function public.admin_log_retention();

-- Modifiche critiche fatte direttamente dall'app (moderatori con policy dedicate o l'utente stesso).
-- Le azioni del pannello admin passano dal server, che scrive il proprio log con l'hash dell'IP.
create or replace function public.audit_profile_changes()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  who uuid := auth.uid();
  kind text := case when who is null then 'server' when who = coalesce(new.id, old.id) then 'user' else 'moderator' end;
begin
  if tg_op = 'DELETE' then
    insert into public.admin_log (action, actor, actor_id, target_id, details)
      values ('account_deleted', kind, who, old.id, '{}'::jsonb);
    return old;
  end if;
  if who is null then return new; end if;
  if new.role is distinct from old.role then
    insert into public.admin_log (action, actor, actor_id, target_id, details)
      values ('role_changed', kind, who, new.id, jsonb_build_object('from', old.role, 'to', new.role));
  end if;
  if new.banned_until is distinct from old.banned_until then
    insert into public.admin_log (action, actor, actor_id, target_id, details)
      values ('ban_changed', kind, who, new.id, jsonb_build_object('until', new.banned_until));
  end if;
  if new.pro_until is distinct from old.pro_until then
    insert into public.admin_log (action, actor, actor_id, target_id, details)
      values ('pro_changed', kind, who, new.id, jsonb_build_object('until', new.pro_until));
  end if;
  return new;
end;
$$;
drop trigger if exists audit_profiles on public.profiles;
create trigger audit_profiles after update or delete on public.profiles
  for each row execute function public.audit_profile_changes();

create or replace function public.audit_settings_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return coalesce(new, old); end if;
  insert into public.admin_log (action, actor, actor_id, details)
    values ('settings_' || lower(tg_op), 'moderator', auth.uid(), jsonb_build_object('key', coalesce(new.key, old.key)));
  return coalesce(new, old);
end;
$$;
drop trigger if exists audit_app_settings on public.app_settings;
create trigger audit_app_settings after insert or update or delete on public.app_settings
  for each row execute function public.audit_settings_changes();

revoke all on function public.audit_profile_changes() from public;
revoke all on function public.audit_settings_changes() from public;
revoke all on function public.admin_log_retention() from public;

-- Le revisioni degli avatar erano leggibili da chiunque ("using (true)"): ora ognuno vede solo la propria.
-- Il pannello admin legge con la chiave di servizio, che non è soggetta a RLS.
drop policy if exists "Solo admin legge le review" on public.avatar_reviews;
drop policy if exists "Ognuno vede la propria review" on public.avatar_reviews;
create policy "Ognuno vede la propria review" on public.avatar_reviews
  for select to authenticated using (auth.uid() = user_id);

notify pgrst, 'reload schema';


-- =========================================================================
-- Chat ricca (017)
-- =========================================================================
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

