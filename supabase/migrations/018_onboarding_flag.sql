-- Flag "onboarded": distingue i NUOVI utenti (a cui mostrare il questionario)
-- dagli account che esistono GIÀ (che non devono rivederlo).
--
-- Da eseguire una volta nel SQL Editor di Supabase.

-- 1. La colonna: i profili nuovi partono da false (questionario da fare).
alter table public.profiles
  add column if not exists onboarded boolean not null default false;

-- 2. Backfill: ogni account che esiste già adesso è un utente esistente,
--    quindi lo segniamo come "onboarded" così non rivede il questionario.
--    (Una volta eseguita, i nuovi iscritti nascono con onboarded = false.)
update public.profiles set onboarded = true where onboarded = false;

-- 3. Il client può solo segnare il PROPRIO onboarding come completato
--    (la RLS "Ognuno aggiorna solo il proprio profilo" vale già).
grant update (onboarded) on public.profiles to authenticated;
