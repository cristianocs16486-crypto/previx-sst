import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

type EmployeeContext = {
  admin: SupabaseClient;
  actorId: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
};

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY.");
  }
  return { url, anonKey, serviceRoleKey };
}

export async function getEmployeeContext(
  request: NextRequest,
  companyId: string,
  employeeId: string,
  pin: string,
): Promise<EmployeeContext> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Sessão não autenticada.");

  const { url, anonKey, serviceRoleKey } = getSupabaseEnv();
  const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) throw new Error("Sessão inválida ou expirada.");

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("tipo, empresa_id")
    .eq("id", user.id)
    .single();
  if (profileError || !profile) throw new Error("Perfil do usuário não encontrado.");
  if (profile.tipo !== "adm" && (profile.tipo !== "empresa" || profile.empresa_id !== companyId)) {
    throw new Error("Acesso não autorizado para esta empresa.");
  }

  const { data: employee, error: employeeError } = await admin
    .from("previx_records")
    .select("id, payload")
    .eq("id", employeeId)
    .eq("company_id", companyId)
    .eq("category", "funcionarios")
    .single();
  if (employeeError || !employee) throw new Error("Funcionário não encontrado nesta empresa.");

  const userClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: pinValido, error: pinError } = await userClient.rpc("previx_verify_employee_pin", {
    p_company_id: companyId,
    p_employee_id: employeeId,
    p_pin: pin,
  });
  if (pinError) throw new Error(`Não foi possível validar o PIN: ${pinError.message}`);
  if (pinValido !== true) throw new Error("PIN incorreto ou temporariamente bloqueado.");

  const name = (employee.payload as Record<string, unknown>)?.nome;
  if (typeof name !== "string" || !name.trim()) throw new Error("Funcionário sem nome válido no cadastro.");
  return { admin, actorId: user.id, companyId, employeeId, employeeName: name.trim() };
}

export function getWebAuthnConfig(request: NextRequest) {
  const incomingOrigin = request.headers.get("origin");
  if (!incomingOrigin) throw new Error("Origem do navegador ausente.");
  const originUrl = new URL(incomingOrigin);
  const requestUrl = new URL(request.url);
  const configuredOrigin = process.env.WEBAUTHN_ORIGIN?.trim();
  const expectedOrigin = configuredOrigin || incomingOrigin;
  const expectedOriginUrl = new URL(expectedOrigin);
  if (expectedOrigin !== incomingOrigin || expectedOriginUrl.hostname !== requestUrl.hostname) {
    throw new Error("Origem WebAuthn não autorizada. Configure WEBAUTHN_ORIGIN com a URL oficial do painel.");
  }
  const rpID = process.env.WEBAUTHN_RP_ID?.trim() || originUrl.hostname;
  if (originUrl.protocol !== "https:" && originUrl.hostname !== "localhost") {
    throw new Error("WebAuthn exige HTTPS, exceto em localhost.");
  }
  return { expectedOrigin, rpID };
}

export function respondWithError(error: unknown) {
  const message = error instanceof Error ? error.message : "Falha inesperada na verificação WebAuthn.";
  return Response.json({ error: message }, { status: 400 });
}
