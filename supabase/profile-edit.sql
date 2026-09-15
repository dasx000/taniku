-- Izinkan user mengubah profilnya sendiri (khusus nama & no HP -- kolom
-- role/id sengaja TIDAK di-grant supaya user tidak bisa naikkan diri
-- sendiri jadi admin lewat request update biasa).

create policy "profiles_update_own" on taniku.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

grant update (full_name, phone) on taniku.profiles to authenticated;
