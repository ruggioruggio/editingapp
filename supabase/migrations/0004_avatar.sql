-- Avatar personalizzato (pelo, maglietta, muscoli, accessori, sfondo):
-- ognuno può modificare solo il proprio, gli altri lo vedono nei profili.
alter table public.profiles add column if not exists avatar jsonb;
alter table public.profiles drop constraint if exists profiles_avatar_size;
alter table public.profiles add constraint profiles_avatar_size check (avatar is null or pg_column_size(avatar) < 1024);
grant update (avatar) on public.profiles to authenticated;
