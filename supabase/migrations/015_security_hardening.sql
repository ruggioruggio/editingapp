-- Hardening: limiti sui campi scritti dagli utenti, regole del bucket avatar e anti-spam.
-- "not valid" applica i vincoli alle nuove scritture senza bloccare la migrazione per dati vecchi.

-- 1. Profilo: bio con lunghezza massima (come nell'app) e foto solo dal nostro storage.
--    Senza questo, avatar_url poteva puntare a un server esterno che registra l'IP di chi guarda il profilo.
alter table public.profiles drop constraint if exists profiles_bio_length;
alter table public.profiles add constraint profiles_bio_length
  check (bio is null or char_length(bio) <= 150) not valid;

alter table public.profiles drop constraint if exists profiles_avatar_url_own_storage;
alter table public.profiles add constraint profiles_avatar_url_own_storage
  check (avatar_url is null or avatar_url ~ '^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/avatars/[A-Za-z0-9._-]+(\?t=[0-9]+)?$') not valid;

-- 2. Bucket avatar: solo immagini, massimo 2 MB (niente HTML/SVG/eseguibili ospitati sul nostro dominio).
update storage.buckets
  set file_size_limit = 2097152,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  where id = 'avatars';

-- 3. Anti-spam: al massimo 30 messaggi al minuto e 30 richieste di amicizia all'ora per utente.
create index if not exists messages_sender_created_idx on public.messages (sender_id, created_at desc);
create index if not exists friendships_requester_created_idx on public.friendships (requester_id, created_at desc);

create or replace function public.limit_message_rate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.messages
      where sender_id = new.sender_id and created_at > now() - interval '1 minute') >= 30 then
    raise exception 'Troppi messaggi: aspetta un minuto' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists messages_rate_limit on public.messages;
create trigger messages_rate_limit before insert on public.messages
  for each row execute function public.limit_message_rate();

create or replace function public.limit_friend_request_rate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.friendships
      where requester_id = new.requester_id and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'Troppe richieste di amicizia: riprova più tardi' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists friendships_rate_limit on public.friendships;
create trigger friendships_rate_limit before insert on public.friendships
  for each row execute function public.limit_friend_request_rate();

revoke all on function public.limit_message_rate() from public;
revoke all on function public.limit_friend_request_rate() from public;

notify pgrst, 'reload schema';
