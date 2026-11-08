-- Allinea il database: colonna avatar mancante (0004 mai applicata) e permessi di scrittura sul proprio profilo.
alter table public.profiles add column if not exists avatar jsonb;
alter table public.profiles drop constraint if exists profiles_avatar_size;
alter table public.profiles add constraint profiles_avatar_size check (avatar is null or pg_column_size(avatar) < 1024);

grant update (username, display_name, xp, streak_count, streak_last_day, updated_at, bio, avatar_url, avatar)
  on public.profiles to authenticated;

notify pgrst, 'reload schema';
