-- SqueakEdit: schema iniziale (profili, progressi, amicizie).
-- Da eseguire una volta nel SQL Editor di Supabase (o con `supabase db push`).

-- ---------------------------------------------------------------------------
-- Profili pubblici: uno per utente, creato in automatico alla registrazione
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_.]{3,20}$'),
  display_name text check (char_length(display_name) <= 40),
  -- il piano lo scrive solo il backend (webhook Stripe), mai il client
  plan text not null default 'free' check (plan in ('free', 'pro')),
  -- copiati dai progressi per classifiche e lista amici
  xp integer not null default 0 check (xp >= 0),
  streak_count integer not null default 0 check (streak_count >= 0),
  streak_last_day date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Gli utenti loggati vedono i profili"
  on public.profiles for select to authenticated using (true);

create policy "Ognuno aggiorna solo il proprio profilo"
  on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Permessi per colonna: il client non può toccare `plan` né `id`.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (username, display_name, xp, streak_count, streak_last_day, updated_at) on public.profiles to authenticated;

-- Crea il profilo quando nasce un utente. Il nome utente arriva dai metadata
-- della registrazione (o dall'email); se è occupato si aggiunge un numero.
create function public.handle_new_user()
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
  values (new.id, candidate, left(new.raw_user_meta_data ->> 'full_name', 40));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Controllo disponibilità del nome utente dalla pagina di registrazione (anche da non loggati)
create function public.username_available(name text)
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

-- ---------------------------------------------------------------------------
-- Progressi: lo stato del gioco (XP, lezioni, quest, statistiche) in JSON
-- ---------------------------------------------------------------------------
create table public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "Leggo i miei progressi"
  on public.progress for select to authenticated using (user_id = (select auth.uid()));
create policy "Creo i miei progressi"
  on public.progress for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Aggiorno i miei progressi"
  on public.progress for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

revoke all on public.progress from anon, authenticated;
grant select, insert, update on public.progress to authenticated;

-- ---------------------------------------------------------------------------
-- Amicizie: richiesta → accettata. Una sola riga per coppia di utenti.
-- ---------------------------------------------------------------------------
create table public.friendships (
  id bigint generated always as identity primary key,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  check (requester_id <> addressee_id)
);

create unique index friendships_pair_idx
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index friendships_addressee_idx on public.friendships (addressee_id);

alter table public.friendships enable row level security;

create policy "Vedo le amicizie in cui sono coinvolto"
  on public.friendships for select to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

create policy "Invio richieste solo a mio nome"
  on public.friendships for insert to authenticated
  with check (requester_id = (select auth.uid()) and status = 'pending');

create policy "Solo chi riceve la richiesta può accettarla"
  on public.friendships for update to authenticated
  using (addressee_id = (select auth.uid()))
  with check (addressee_id = (select auth.uid()) and status = 'accepted');

create policy "Ognuno dei due può annullare o rimuovere"
  on public.friendships for delete to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

revoke all on public.friendships from anon, authenticated;
grant select, insert, delete on public.friendships to authenticated;
grant update (status) on public.friendships to authenticated;
