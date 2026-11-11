-- Audit log delle azioni critiche (GDPR art. 5.2 accountability, art. 32 sicurezza).
-- Principi: solo identificativi pseudonimi (UUID, hash dell'IP), mai nomi, email o testi liberi;
-- tabella in sola aggiunta (nessuno può modificare o cancellare righe dall'app); conservazione 12 mesi.

alter table public.admin_log add column if not exists actor text;       -- admin_panel | moderator | user | server
alter table public.admin_log add column if not exists actor_id uuid;    -- chi ha agito, se è un utente
alter table public.admin_log add column if not exists target_id uuid;   -- su chi, solo UUID
alter table public.admin_log add column if not exists ip_hash text;     -- HMAC troncato dell'IP, non reversibile
create index if not exists admin_log_created_idx on public.admin_log (created_at desc);

revoke all on public.admin_log from anon, authenticated;

-- Conservazione: le righe più vecchie di 12 mesi vengono rimosse a ogni nuovo inserimento.
create or replace function public.admin_log_retention()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.admin_log where created_at < now() - interval '12 months';
  return null;
end;
$$;
drop trigger if exists admin_log_retention on public.admin_log;
create trigger admin_log_retention after insert on public.admin_log
  for each statement execute function public.admin_log_retention();

-- Modifiche critiche fatte direttamente dall'app (moderatori con policy dedicate o l'utente stesso).
-- Le azioni del pannello admin passano dal server, che scrive il proprio log con l'hash dell'IP.
create or replace function public.audit_profile_changes()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  who uuid := auth.uid();
  kind text := case when who is null then 'server' when who = coalesce(new.id, old.id) then 'user' else 'moderator' end;
begin
  if tg_op = 'DELETE' then
    insert into public.admin_log (action, actor, actor_id, target_id, details)
      values ('account_deleted', kind, who, old.id, '{}'::jsonb);
    return old;
  end if;
  if who is null then return new; end if;
  if new.role is distinct from old.role then
    insert into public.admin_log (action, actor, actor_id, target_id, details)
      values ('role_changed', kind, who, new.id, jsonb_build_object('from', old.role, 'to', new.role));
  end if;
  if new.banned_until is distinct from old.banned_until then
    insert into public.admin_log (action, actor, actor_id, target_id, details)
      values ('ban_changed', kind, who, new.id, jsonb_build_object('until', new.banned_until));
  end if;
  if new.pro_until is distinct from old.pro_until then
    insert into public.admin_log (action, actor, actor_id, target_id, details)
      values ('pro_changed', kind, who, new.id, jsonb_build_object('until', new.pro_until));
  end if;
  return new;
end;
$$;
drop trigger if exists audit_profiles on public.profiles;
create trigger audit_profiles after update or delete on public.profiles
  for each row execute function public.audit_profile_changes();

create or replace function public.audit_settings_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return coalesce(new, old); end if;
  insert into public.admin_log (action, actor, actor_id, details)
    values ('settings_' || lower(tg_op), 'moderator', auth.uid(), jsonb_build_object('key', coalesce(new.key, old.key)));
  return coalesce(new, old);
end;
$$;
drop trigger if exists audit_app_settings on public.app_settings;
create trigger audit_app_settings after insert or update or delete on public.app_settings
  for each row execute function public.audit_settings_changes();

revoke all on function public.audit_profile_changes() from public;
revoke all on function public.audit_settings_changes() from public;
revoke all on function public.admin_log_retention() from public;

-- Le revisioni degli avatar erano leggibili da chiunque ("using (true)"): ora ognuno vede solo la propria.
-- Il pannello admin legge con la chiave di servizio, che non è soggetta a RLS.
drop policy if exists "Solo admin legge le review" on public.avatar_reviews;
drop policy if exists "Ognuno vede la propria review" on public.avatar_reviews;
create policy "Ognuno vede la propria review" on public.avatar_reviews
  for select to authenticated using (auth.uid() = user_id);

notify pgrst, 'reload schema';
