-- follows table for user follow system
create table if not exists public.follows (
  id bigint generated always as identity primary key,
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(follower_id, following_id),
  check(follower_id <> following_id)
);

alter table public.follows enable row level security;

create policy "Users can see follows" on public.follows for select using (true);
create policy "Users can follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

create index if not exists idx_follows_following on public.follows(following_id);
create index if not exists idx_follows_follower on public.follows(follower_id);
