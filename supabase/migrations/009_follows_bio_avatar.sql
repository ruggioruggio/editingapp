-- Follow system (one-directional, Instagram-style)
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(follower_id, following_id)
);

alter table public.follows enable row level security;

create policy "Chiunque vede i follow" on public.follows for select using (true);
create policy "Un utente segue" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Un utente smette di seguire" on public.follows for delete using (auth.uid() = follower_id);

-- Bio e avatar_url nel profilo
alter table public.profiles add column if not exists bio text default '';
alter table public.profiles add column if not exists avatar_url text default null;
alter table public.profiles add column if not exists created_at timestamptz default now();

-- Tabella per review admin degli avatar caricati
create table if not exists public.avatar_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  avatar_url text not null,
  status text not null default 'pending',
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id)
);

alter table public.avatar_reviews enable row level security;
create policy "Solo admin legge le review" on public.avatar_reviews for select using (true);
create policy "Utente crea review" on public.avatar_reviews for insert with check (auth.uid() = user_id);
create policy "Utente aggiorna review" on public.avatar_reviews for update using (auth.uid() = user_id);

-- Storage bucket per avatar (eseguire manualmente se non esiste)
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
-- on conflict do nothing;
