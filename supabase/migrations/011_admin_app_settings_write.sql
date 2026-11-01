-- Allow owner/moderatore roles to write app_settings directly (for desktop/local admin mode)
grant insert, update, delete on public.app_settings to authenticated;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='app_settings' and policyname='Admin scrive le impostazioni') then
    create policy "Admin scrive le impostazioni"
      on public.app_settings for all to authenticated
      using (
        exists (
          select 1 from public.profiles
          where id = (select auth.uid())
            and role in ('owner', 'moderatore')
        )
      )
      with check (
        exists (
          select 1 from public.profiles
          where id = (select auth.uid())
            and role in ('owner', 'moderatore')
        )
      );
  end if;
end $$;
