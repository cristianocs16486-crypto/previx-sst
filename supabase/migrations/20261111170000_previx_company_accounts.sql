alter table public.empresas
  add column if not exists login text,
  add column if not exists status text not null default 'Ativa',
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

alter table public.empresas
  drop constraint if exists empresas_status_check;

update public.empresas
  set status = case
    when lower(coalesce(status, '')) in ('inativa', 'inativo', 'inactive') then 'Inativa'
    else 'Ativa'
  end;

alter table public.empresas
  add constraint empresas_status_check
  check (status in ('Ativa', 'Inativa'));

create unique index if not exists empresas_login_lower_unique_idx
  on public.empresas (lower(login))
  where login is not null;

create unique index if not exists empresas_auth_user_id_unique_idx
  on public.empresas (auth_user_id)
  where auth_user_id is not null;

update public.empresas e
  set auth_user_id = (
    select p.id
    from public.profiles p
    where p.empresa_id = e.id and p.tipo = 'empresa'
    limit 1
  )
  where e.auth_user_id is null;

update public.profiles p
  set empresa_id = null
  from public.empresas e
  where p.empresa_id = e.id
    and p.tipo = 'empresa'
    and e.status = 'Inativa';
