-- SqueakEdit: strumenti di amministrazione (Pro regalato, sospensioni,
-- annunci, registro delle azioni). Da eseguire dopo 0001 e 0002.
-- Tutte le scritture admin passano dal server con la chiave service_role:
-- il client non può toccare queste colonne né queste tabelle.

alter table public.profiles
  add column if not exists pro_until timestamptz,
  add column if not exists banned_until timestamptz,
  add column if not exists ban_reason text check (char_length(ban_reason) <= 200);

-- (i permessi per colonna di 0001 non includono le nuove colonne: il client
-- può leggerle ma non modificarle)

create or replace function public.is_banned(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.banned_until is not null and p.banned_until > now());
$$;

-- Chi è sospeso non può scrivere messaggi né mandare richieste di amicizia.
create policy "Gli utenti sospesi non scrivono"
  on public.messages as restrictive for insert to authenticated
  with check (not public.is_banned((select auth.uid())));

create policy "Gli utenti sospesi non chiedono amicizie"
  on public.friendships as restrictive for insert to authenticated
  with check (not public.is_banned((select auth.uid())));

create policy "Gli utenti sospesi non pubblicano attività"
  on public.activity_events as restrictive for insert to authenticated
  with check (not public.is_banned((select auth.uid())));

-- Impostazioni pubbliche del sito (es. annuncio per tutti)
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
create policy "Tutti leggono le impostazioni" on public.app_settings for select to anon, authenticated using (true);
revoke all on public.app_settings from anon, authenticated;
grant select on public.app_settings to anon, authenticated;

-- Registro delle azioni admin (solo il server lo legge e lo scrive)
create table if not exists public.admin_log (
  id bigint generated always as identity primary key,
  action text not null,
  target text,
  details jsonb,
  created_at timestamptz not null default now()
);
alter table public.admin_log enable row level security;
revoke all on public.admin_log from anon, authenticated;
