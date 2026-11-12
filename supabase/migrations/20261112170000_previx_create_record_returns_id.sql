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

drop function if exists public.previx_create_record(uuid, text, jsonb);

create function public.previx_create_record(
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
  v_payload jsonb;
  v_pin text;
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
    or p_category not in (
      'funcionarios', 'extintores', 'inspecoes', 'documentos', 'exames',
      'clinicas', 'riscos', 'financeiro', 'tecnico'
    )
    or coalesce(jsonb_typeof(p_payload), '') <> 'object' then
    raise exception 'Categoria ou dados inválidos';
  end if;

  v_payload := p_payload;
  if p_category = 'funcionarios' then
    if nullif(btrim(p_payload ->> 'nome'), '') is null
      or nullif(btrim(p_payload ->> 'setor'), '') is null then
      raise exception 'Nome e setor do funcionário são obrigatórios';
    end if;

    if p_payload ->> 'setor' not in (
      'Vendas', 'Caixa', 'Estoque', 'Limpeza', 'Gerência', 'Entrega',
      'Administrativo', 'Produção', 'Manutenção', 'Segurança',
      'Almoxarifado', 'RH', 'Outro'
    ) then
      raise exception 'Setor inválido';
    end if;

    v_pin := p_payload ->> 'pin';
    if v_pin is null or v_pin !~ '^[0-9]{4}$' then
      raise exception 'O PIN deve conter exatamente quatro dígitos';
    end if;
    v_payload := p_payload - 'pin';
  end if;

  if p_category = 'inspecoes' and (
    nullif(btrim(p_payload ->> 'tipo_nr'), '') is null
    or p_payload ->> 'tipo_nr' not in (
      'NR-01 - Gerenciamento de Riscos Ocupacionais',
      'NR-05 - CIPA',
      'NR-06 - EPI / EPC',
      'NR-07 - PCMSO / Exames',
      'NR-09 - Avaliação de Exposições',
      'NR-10 - Eletricidade',
      'NR-11 - Transporte / Movimentação',
      'NR-12 - Máquinas e Equipamentos',
      'NR-17 - Ergonomia',
      'NR-23 - Proteção Contra Incêndio / Extintores',
      'NR-26 - Sinalização de Segurança',
      'NR-33 - Espaço Confinado',
      'NR-35 - Trabalho em Altura',
      'Inspeção Geral'
    )
  ) then
    raise exception 'Tipo NR de inspeção inválido';
  end if;

  if p_category = 'riscos' and (
    nullif(btrim(p_payload ->> 'tipo'), '') is null
    or p_payload ->> 'tipo' not in ('Físico', 'Químico', 'Biológico', 'Ergonômico', 'Acidente')
  ) then
    raise exception 'Tipo de risco inválido';
  end if;

  insert into public.previx_records (company_id, category, payload, created_by)
  values (p_company_id::text, p_category, v_payload, (select auth.uid()))
  returning id into v_record_id;

  if p_category = 'funcionarios' then
    insert into public.previx_employee_credentials (employee_id, pin_hash)
    values (v_record_id, extensions.crypt(v_pin, extensions.gen_salt('bf', 10)));

    insert into public.previx_employee_pin_attempts (employee_id)
    values (v_record_id);
  end if;

  return v_record_id;
end;
$$;

revoke all on function public.previx_create_record(uuid, text, jsonb) from public, anon;
grant execute on function public.previx_create_record(uuid, text, jsonb) to authenticated;

revoke all on function public.previx_list_records(uuid, text) from public, anon;
revoke all on function public.previx_update_record(uuid, uuid, jsonb) from public, anon;
revoke all on function public.previx_delete_record(uuid, uuid) from public, anon;
revoke all on function public.previx_verify_employee_pin(uuid, uuid, text) from public, anon;
revoke all on function public.previx_create_epi_delivery(uuid, uuid, text, jsonb, text, boolean, text) from public, anon;

grant execute on function public.previx_list_records(uuid, text) to authenticated;
grant execute on function public.previx_update_record(uuid, uuid, jsonb) to authenticated;
grant execute on function public.previx_delete_record(uuid, uuid) to authenticated;
grant execute on function public.previx_verify_employee_pin(uuid, uuid, text) to authenticated;
grant execute on function public.previx_create_epi_delivery(uuid, uuid, text, jsonb, text, boolean, text) to authenticated;

notify pgrst, 'reload schema';
