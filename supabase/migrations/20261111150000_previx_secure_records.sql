create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nome text,
  tipo text not null check (tipo in ('adm', 'empresa')),
  empresa_id uuid references public.empresas (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists email text,
  add column if not exists nome text,
  add column if not exists tipo text,
  add column if not exists empresa_id uuid;

create table if not exists public.previx_records (
  id uuid primary key default gen_random_uuid(),
  company_id text not null,
  category text not null check (
    category in (
      'funcionarios',
      'epis',
      'extintores',
      'inspecoes',
      'documentos',
      'exames',
      'clinicas',
      'riscos',
      'financeiro',
      'tecnico'
    )
  ),
  payload jsonb not null default '{}'::jsonb,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists previx_records_company_category_created_idx
  on public.previx_records (company_id, category, created_at desc);

alter table public.empresas
  add column if not exists cnpj text,
  add column if not exists responsavel text,
  add column if not exists telefone text,
  add column if not exists email text;

create or replace function public.previx_current_tipo()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.tipo
  from public.profiles as p
  where p.id = (select auth.uid())
  limit 1
$$;

create or replace function public.previx_current_empresa_id()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.empresa_id::text
  from public.profiles as p
  where p.id = (select auth.uid())
  limit 1
$$;

revoke all on function public.previx_current_tipo() from public;
revoke all on function public.previx_current_empresa_id() from public;
grant execute on function public.previx_current_tipo() to authenticated;
grant execute on function public.previx_current_empresa_id() to authenticated;

alter table public.previx_records enable row level security;

drop policy if exists previx_records_select_company on public.previx_records;
create policy previx_records_select_company
  on public.previx_records for select to authenticated
  using (
    (select public.previx_current_tipo()) = 'adm'
    or (
      (select public.previx_current_tipo()) = 'empresa'
      and company_id = (select public.previx_current_empresa_id())
    )
  );

drop policy if exists previx_records_insert_company on public.previx_records;
create policy previx_records_insert_company
  on public.previx_records for insert to authenticated
  with check (
    (select public.previx_current_tipo()) = 'adm'
    or (
      (select public.previx_current_tipo()) = 'empresa'
      and company_id = (select public.previx_current_empresa_id())
    )
  );

drop policy if exists previx_records_update_company on public.previx_records;
create policy previx_records_update_company
  on public.previx_records for update to authenticated
  using (
    (select public.previx_current_tipo()) = 'adm'
    or (
      (select public.previx_current_tipo()) = 'empresa'
      and company_id = (select public.previx_current_empresa_id())
    )
  )
  with check (
    (select public.previx_current_tipo()) = 'adm'
    or (
      (select public.previx_current_tipo()) = 'empresa'
      and company_id = (select public.previx_current_empresa_id())
    )
  );

drop policy if exists previx_records_delete_company on public.previx_records;
create policy previx_records_delete_company
  on public.previx_records for delete to authenticated
  using (
    (select public.previx_current_tipo()) = 'adm'
    or (
      (select public.previx_current_tipo()) = 'empresa'
      and company_id = (select public.previx_current_empresa_id())
    )
  );

grant select, insert, update, delete on public.previx_records to authenticated;

alter table public.profiles enable row level security;
grant select on public.profiles to authenticated;
drop policy if exists previx_profiles_select_own on public.profiles;
create policy previx_profiles_select_own
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

alter table public.empresas enable row level security;
drop policy if exists previx_empresas_select_accessible on public.empresas;
create policy previx_empresas_select_accessible
  on public.empresas for select to authenticated
  using (
    (select public.previx_current_tipo()) = 'adm'
    or id::text = (select public.previx_current_empresa_id())
  );

drop policy if exists previx_empresas_insert_adm on public.empresas;
create policy previx_empresas_insert_adm
  on public.empresas for insert to authenticated
  with check ((select public.previx_current_tipo()) = 'adm');

drop policy if exists previx_empresas_update_adm on public.empresas;
create policy previx_empresas_update_adm
  on public.empresas for update to authenticated
  using ((select public.previx_current_tipo()) = 'adm')
  with check ((select public.previx_current_tipo()) = 'adm');

drop policy if exists previx_empresas_delete_adm on public.empresas;
create policy previx_empresas_delete_adm
  on public.empresas for delete to authenticated
  using ((select public.previx_current_tipo()) = 'adm');

grant select, insert, update, delete on public.empresas to authenticated;
