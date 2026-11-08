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
