-- Ripristina i permessi di scrittura sulle colonne del proprio profilo (foto, bio, avatar).
grant update (username, display_name, xp, streak_count, streak_last_day, updated_at, bio, avatar_url, avatar)
  on public.profiles to authenticated;

notify pgrst, 'reload schema';
