-- SqueakEdit: ruoli utente (owner, moderatore, amico, founder).
-- Il ruolo lo scrive solo il backend con la chiave service_role.
-- Da eseguire dopo 0004.

alter table public.profiles
  add column if not exists role text check (role in ('owner', 'moderatore', 'amico', 'founder'));

-- Il client può leggere il ruolo ma non modificarlo (stessa logica di `plan`):
-- il GRANT UPDATE di 0001 non include `role`.

comment on column public.profiles.role is
  'Ruolo speciale: owner (admin completo), moderatore (ban), amico (pro gratis), founder (accesso totale). NULL = utente normale.';
