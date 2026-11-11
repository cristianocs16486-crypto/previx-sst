create extension if not exists pgcrypto with schema extensions;

create table if not exists public.previx_employee_credentials (
  employee_id uuid primary key references public.previx_records(id) on delete cascade,
  pin_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.previx_employee_pin_attempts (
  employee_id uuid primary key references public.previx_records(id) on delete cascade,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.previx_employee_credentials enable row level security;
alter table public.previx_employee_pin_attempts enable row level security;

revoke all on public.previx_employee_credentials from public, anon, authenticated;
revoke all on public.previx_employee_pin_attempts from public, anon, authenticated;
revoke insert, update, delete on public.previx_records from public, anon, authenticated;

create or replace function public.previx_create_employee(
  p_company_id uuid,
  p_payload jsonb,
  p_pin text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tipo text;
  v_empresa_id uuid;
  v_employee_id uuid;
begin
  select p.tipo, p.empresa_id
    into v_tipo, v_empresa_id
    from public.profiles p
    where p.id = (select auth.uid());

  if v_tipo is null
    or (v_tipo <> 'adm' and (v_tipo <> 'empresa' or v_empresa_id is distinct from p_company_id)) then
    raise exception 'Acesso não autorizado para esta empresa';
  end if;

  if jsonb_typeof(p_payload) <> 'object'
    or nullif(btrim(p_payload ->> 'nome'), '') is null then
    raise exception 'Informe o nome do funcionário';
  end if;

  if p_pin is null or p_pin !~ '^[0-9]{4}$' then
    raise exception 'O PIN deve conter exatamente quatro dígitos';
  end if;

  insert into public.previx_records (company_id, category, payload, created_by)
  values (p_company_id::text, 'funcionarios', p_payload, (select auth.uid()))
  returning id into v_employee_id;

  insert into public.previx_employee_credentials (employee_id, pin_hash)
  values (v_employee_id, extensions.crypt(p_pin, extensions.gen_salt('bf', 10)));

  insert into public.previx_employee_pin_attempts (employee_id)
  values (v_employee_id);

  return v_employee_id;
end;
$$;

create or replace function public.previx_verify_employee_pin(
  p_company_id uuid,
  p_employee_id uuid,
  p_pin text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tipo text;
  v_empresa_id uuid;
  v_pin_hash text;
  v_attempts public.previx_employee_pin_attempts%rowtype;
begin
  select p.tipo, p.empresa_id
    into v_tipo, v_empresa_id
    from public.profiles p
    where p.id = (select auth.uid());

  if v_tipo is null
    or (v_tipo <> 'adm' and (v_tipo <> 'empresa' or v_empresa_id is distinct from p_company_id)) then
    raise exception 'Acesso não autorizado para esta empresa';
  end if;

  if not exists (
    select 1
      from public.previx_records r
      where r.id = p_employee_id
        and r.company_id = p_company_id::text
        and r.category = 'funcionarios'
  ) then
    raise exception 'Funcionário não encontrado nesta empresa';
  end if;

  select a.*
    into v_attempts
    from public.previx_employee_pin_attempts a
    where a.employee_id = p_employee_id
    for update;

  if not found then
    raise exception 'Credencial do funcionário não encontrada';
  end if;

  if v_attempts.locked_until is not null and v_attempts.locked_until > now() then
    raise exception 'PIN temporariamente bloqueado. Tente novamente mais tarde.';
  end if;

  select c.pin_hash
    into v_pin_hash
    from public.previx_employee_credentials c
    where c.employee_id = p_employee_id;

  if p_pin is null
    or p_pin !~ '^[0-9]{4}$'
    or v_pin_hash is null
    or extensions.crypt(p_pin, v_pin_hash) <> v_pin_hash then
    update public.previx_employee_pin_attempts
      set failed_attempts = failed_attempts + 1,
          locked_until = case
            when failed_attempts + 1 >= 5 then now() + interval '15 minutes'
            else null
          end,
          updated_at = now()
      where employee_id = p_employee_id;
    return false;
  end if;

  update public.previx_employee_pin_attempts
    set failed_attempts = 0,
        locked_until = null,
        updated_at = now()
    where employee_id = p_employee_id;

  return true;
end;
$$;

create or replace function public.previx_create_record(
  p_company_id uuid,
  p_category text,
  p_payload jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tipo text;
  v_empresa_id uuid;
  v_record_id uuid;
begin
  select p.tipo, p.empresa_id
    into v_tipo, v_empresa_id
    from public.profiles p
    where p.id = (select auth.uid());

  if v_tipo is null
    or (v_tipo <> 'adm' and (v_tipo <> 'empresa' or v_empresa_id is distinct from p_company_id)) then
    raise exception 'Acesso não autorizado para esta empresa';
  end if;

  if p_category is null
    or p_category not in ('extintores', 'inspecoes', 'documentos', 'exames', 'clinicas', 'riscos', 'financeiro', 'tecnico')
    or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Categoria ou dados inválidos';
  end if;

  insert into public.previx_records (company_id, category, payload, created_by)
  values (p_company_id::text, p_category, p_payload, (select auth.uid()))
  returning id into v_record_id;

  return v_record_id;
end;
$$;

create or replace function public.previx_create_epi_delivery(
  p_company_id uuid,
  p_employee_id uuid,
  p_employee_pin text,
  p_payload jsonb,
  p_method text,
  p_typed_name text,
  p_hand_signature text,
  p_consent boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tipo text;
  v_empresa_id uuid;
  v_employee_payload jsonb;
  v_employee_name text;
  v_record_id uuid;
  v_signature jsonb;
begin
  select p.tipo, p.empresa_id
    into v_tipo, v_empresa_id
    from public.profiles p
    where p.id = (select auth.uid());

  if v_tipo is null
    or (v_tipo <> 'adm' and (v_tipo <> 'empresa' or v_empresa_id is distinct from p_company_id)) then
    raise exception 'Acesso não autorizado para esta empresa';
  end if;

  if jsonb_typeof(p_payload) <> 'object'
    or nullif(btrim(p_payload ->> 'nome'), '') is null
    or coalesce((p_payload ->> 'quantidade')::integer, 0) < 1
    or p_method is null
    or p_method not in ('pin', 'digitada', 'punho')
    or p_consent is distinct from true then
    raise exception 'Dados da entrega ou confirmação inválidos';
  end if;

  select r.payload
    into v_employee_payload
    from public.previx_records r
    where r.id = p_employee_id
      and r.company_id = p_company_id::text
      and r.category = 'funcionarios';

  if not found then
    raise exception 'Funcionário não encontrado nesta empresa';
  end if;

  v_employee_name := btrim(v_employee_payload ->> 'nome');

  if p_method in ('pin', 'digitada') then
    if not public.previx_verify_employee_pin(p_company_id, p_employee_id, p_employee_pin) then
      return null;
    end if;
  end if;

  if p_method = 'digitada' and lower(btrim(coalesce(p_typed_name, ''))) <> lower(v_employee_name) then
    raise exception 'O nome digitado não corresponde ao cadastro do funcionário';
  end if;

  if p_method = 'punho' then
    if lower(btrim(coalesce(p_typed_name, ''))) <> lower(v_employee_name)
      or p_hand_signature is null
      or p_hand_signature !~ '^data:image/png;base64,[A-Za-z0-9+/]+={0,2}$'
      or length(p_hand_signature) > 200000 then
      raise exception 'Assinatura manuscrita inválida';
    end if;
  end if;

  v_signature := jsonb_build_object(
    'metodo', p_method,
    'nome', v_employee_name,
    'confirmado_em', now(),
    'confirmado_por', (select auth.uid()),
    'consentimento', true
  );

  if p_method = 'punho' then
    v_signature := v_signature || jsonb_build_object('imagem', p_hand_signature);
  end if;

  insert into public.previx_records (company_id, category, payload, created_by)
  values (
    p_company_id::text,
    'epis',
    p_payload || jsonb_build_object(
      'employee_id', p_employee_id,
      'funcionario', v_employee_name,
      'assinatura', v_signature
    ),
    (select auth.uid())
  )
  returning id into v_record_id;

  return v_record_id;
end;
$$;

create or replace function public.previx_update_record(
  p_company_id uuid,
  p_record_id uuid,
  p_payload jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tipo text;
  v_empresa_id uuid;
begin
  select p.tipo, p.empresa_id
    into v_tipo, v_empresa_id
    from public.profiles p
    where p.id = (select auth.uid());

  if v_tipo is null
    or (v_tipo <> 'adm' and (v_tipo <> 'empresa' or v_empresa_id is distinct from p_company_id)) then
    raise exception 'Acesso não autorizado para esta empresa';
  end if;

  if jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Dados inválidos';
  end if;

  update public.previx_records
    set payload = p_payload,
        updated_at = now()
    where id = p_record_id
      and company_id = p_company_id::text
      and category <> 'epis';

  return found;
end;
$$;

create or replace function public.previx_delete_record(
  p_company_id uuid,
  p_record_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tipo text;
  v_empresa_id uuid;
begin
  select p.tipo, p.empresa_id
    into v_tipo, v_empresa_id
    from public.profiles p
    where p.id = (select auth.uid());

  if v_tipo is null
    or (v_tipo <> 'adm' and (v_tipo <> 'empresa' or v_empresa_id is distinct from p_company_id)) then
    raise exception 'Acesso não autorizado para esta empresa';
  end if;

  delete from public.previx_records
    where id = p_record_id
      and company_id = p_company_id::text
      and category <> 'epis';

  return found;
end;
$$;

revoke all on function public.previx_create_employee(uuid, jsonb, text) from public, anon;
revoke all on function public.previx_verify_employee_pin(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.previx_create_record(uuid, text, jsonb) from public, anon;
revoke all on function public.previx_create_epi_delivery(uuid, uuid, text, jsonb, text, text, text, boolean) from public, anon;
revoke all on function public.previx_update_record(uuid, uuid, jsonb) from public, anon;
revoke all on function public.previx_delete_record(uuid, uuid) from public, anon;

grant execute on function public.previx_create_employee(uuid, jsonb, text) to authenticated;
grant execute on function public.previx_create_record(uuid, text, jsonb) to authenticated;
grant execute on function public.previx_create_epi_delivery(uuid, uuid, text, jsonb, text, text, text, boolean) to authenticated;
grant execute on function public.previx_update_record(uuid, uuid, jsonb) to authenticated;
grant execute on function public.previx_delete_record(uuid, uuid) to authenticated;
