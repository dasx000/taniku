-- Fitur "Tanaman Saya": lapisan tambahan di atas taniku.lahan yang menampilkan
-- status budidaya + tahapan (Persiapan Lahan -> Semai -> Pindah Tanam ->
-- Pemeliharaan -> Panen) per lahan. Untuk sekarang cakupan komoditas hanya
-- Padi dan Jagung (lihat filter di taniku.lahan_tahapan / query getMyTanaman).

alter table taniku.lahan add column if not exists tanggal_tanam date;
alter table taniku.lahan add column if not exists status text
  check (status in ('akan_tanam', 'persiapan', 'dalam_proses', 'panen'));

create table if not exists taniku.lahan_tahapan (
  id uuid primary key default gen_random_uuid(),
  lahan_id uuid not null references taniku.lahan(id) on delete cascade,
  urutan smallint not null check (urutan between 1 and 5),
  nama_tahap text not null,
  tanggal_mulai date,
  tanggal_selesai date,
  status text not null check (status in ('selesai', 'berjalan', 'belum_mulai')),
  unique (lahan_id, urutan)
);

create index if not exists idx_lahan_tahapan_lahan on taniku.lahan_tahapan(lahan_id);

alter table taniku.lahan_tahapan enable row level security;

create policy "lahan_tahapan_select_own" on taniku.lahan_tahapan
  for select
  using (exists (
    select 1 from taniku.lahan l
    where l.id = lahan_tahapan.lahan_id and l.user_id = auth.uid()
  ));

create policy "lahan_tahapan_insert_own" on taniku.lahan_tahapan
  for insert
  with check (exists (
    select 1 from taniku.lahan l
    where l.id = lahan_tahapan.lahan_id and l.user_id = auth.uid()
  ));

create policy "lahan_tahapan_update_own" on taniku.lahan_tahapan
  for update
  using (exists (
    select 1 from taniku.lahan l
    where l.id = lahan_tahapan.lahan_id and l.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from taniku.lahan l
    where l.id = lahan_tahapan.lahan_id and l.user_id = auth.uid()
  ));

create policy "lahan_tahapan_delete_own" on taniku.lahan_tahapan
  for delete
  using (exists (
    select 1 from taniku.lahan l
    where l.id = lahan_tahapan.lahan_id and l.user_id = auth.uid()
  ));

grant select, insert, update, delete on taniku.lahan_tahapan to authenticated;
