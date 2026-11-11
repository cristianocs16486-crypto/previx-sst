create table if not exists public.previx_webauthn_credentials (
  credential_id text primary key,
  employee_id uuid not null references public.previx_records(id) on delete cascade,
  company_id uuid not null references public.empresas(id) on delete cascade,
  public_key text not null,
  counter bigint not null default 0,
  transports text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (employee_id, credential_id)
);

create index if not exists previx_webauthn_credentials_employee_idx
  on public.previx_webauthn_credentials (employee_id);

create table if not exists public.previx_webauthn_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge text not null,
  company_id uuid not null references public.empresas(id) on delete cascade,
  employee_id uuid not null references public.previx_records(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null check (purpose in ('registration', 'authentication')),
  created_at timestamptz not null default now(),
  consumed_at timestamptz
);

create table if not exists public.previx_webauthn_proofs (
  proof_hash text primary key,
  company_id uuid not null references public.empresas(id) on delete cascade,
  employee_id uuid not null references public.previx_records(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  verified_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table public.previx_webauthn_credentials enable row level security;
alter table public.previx_webauthn_challenges enable row level security;
alter table public.previx_webauthn_proofs enable row level security;

revoke all on public.previx_webauthn_credentials from public, anon, authenticated;
revoke all on public.previx_webauthn_challenges from public, anon, authenticated;
revoke all on public.previx_webauthn_proofs from public, anon, authenticated;

grant execute on function public.previx_verify_employee_pin(uuid, uuid, text) to authenticated;

create or replace function public.previx_create_epi_delivery(
  p_company_id uuid,
  p_employee_id uuid,
  p_employee_pin text,
  p_payload jsonb,
  p_hand_signature text,
  p_consent boolean,
  p_biometric_token text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tipo text;
  v_empresa_id uuid;
  v_company_name text;
  v_employee_payload jsonb;
  v_employee_name text;
  v_record_id uuid;
  v_proof_hash text;
  v_verified_at timestamptz;
begin
  select p.tipo, p.empresa_id
    into v_tipo, v_empresa_id
    from public.profiles p
    where p.id = (select auth.uid());

  if v_tipo is null
    or (v_tipo <> 'adm' and (v_tipo <> 'empresa' or v_empresa_id is distinct from p_company_id)) then
    raise exception 'Acesso não autorizado para esta empresa';
  end if;

  select e.nome into v_company_name
    from public.empresas e
    where e.id = p_company_id;
  if v_company_name is null then
    raise exception 'Empresa não encontrada';
  end if;

  if jsonb_typeof(p_payload) <> 'object'
    or nullif(btrim(p_payload ->> 'nome'), '') is null
    or coalesce((p_payload ->> 'quantidade')::integer, 0) < 1
    or p_consent is distinct from true
    or p_biometric_token is null
    or p_hand_signature is null
    or p_hand_signature !~ '^data:image/png;base64,[A-Za-z0-9+/]+={0,2}$'
    or length(p_hand_signature) > 200000 then
    raise exception 'Dados da entrega, assinatura ou confirmação inválidos';
  end if;

  if not public.previx_verify_employee_pin(p_company_id, p_employee_id, p_employee_pin) then
    raise exception 'PIN incorreto ou temporariamente bloqueado';
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

  v_proof_hash := encode(extensions.digest(p_biometric_token, 'sha256'), 'hex');
  delete from public.previx_webauthn_proofs p
    where p.proof_hash = v_proof_hash
      and p.company_id = p_company_id
      and p.employee_id = p_employee_id
      and p.actor_id = (select auth.uid())
      and p.expires_at > now()
  returning p.verified_at into v_verified_at;

  if v_verified_at is null then
    raise exception 'A autenticação do dispositivo expirou ou não foi validada';
  end if;

  insert into public.previx_records (company_id, category, payload, created_by)
  values (
    p_company_id::text,
    'epis',
    (p_payload - 'pin') || jsonb_build_object(
      'empresa_id', p_company_id,
      'empresa', v_company_name,
      'employee_id', p_employee_id,
      'funcionario', v_employee_name,
      'pinVerificado', true,
      'biometria', jsonb_build_object('metodo', 'WebAuthn', 'verificado_em', v_verified_at),
      'assinaturaImg', p_hand_signature,
      'assinatura', jsonb_build_object(
        'metodo', 'pin_biometria_assinatura',
        'nome', v_employee_name,
        'confirmado_em', now(),
        'confirmado_por', (select auth.uid()),
        'consentimento', true,
        'imagem', p_hand_signature
      )
    ),
    (select auth.uid())
  )
  returning id into v_record_id;

  return v_record_id;
end;
$$;

revoke all on function public.previx_create_epi_delivery(uuid, uuid, text, jsonb, text, boolean, text) from public, anon;
revoke all on function public.previx_create_epi_delivery(uuid, uuid, text, jsonb, text, text, text, boolean) from public, anon, authenticated;
grant execute on function public.previx_create_epi_delivery(uuid, uuid, text, jsonb, text, boolean, text) to authenticated;

delete from public.previx_webauthn_challenges
where created_at < now() - interval '1 day';

delete from public.previx_webauthn_proofs
where expires_at < now();
