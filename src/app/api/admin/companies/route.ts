import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CompanyInput = {
  id?: string;
  nome?: string;
  cnpj?: string;
  responsavel?: string;
  telefone?: string;
  email?: string;
  login?: string;
  senha?: string;
  status?: string;
};

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY) no ambiente do servidor.");
  }
  return { url, anonKey, serviceRoleKey };
}

async function getAdminClient(request: NextRequest): Promise<SupabaseClient> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Sessão não autenticada.");

  const { url, anonKey, serviceRoleKey } = getSupabaseConfig();
  const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) throw new Error("Sessão inválida ou expirada.");

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .single();
  if (profileError) {
    console.error("Não foi possível consultar o perfil para validar o acesso administrativo.", {
      code: profileError.code,
      message: profileError.message,
    });
    throw new Error(`Não foi possível consultar o perfil do usuário no Supabase (${profileError.code || "erro desconhecido"}).`);
  }
  if (profile?.tipo !== "adm") throw new Error("Apenas administradores podem gerenciar empresas.");
  return admin;
}

function validInput(body: CompanyInput, creating: boolean) {
  const nome = body.nome?.trim();
  const email = body.email?.trim().toLowerCase();
  const login = body.login?.trim().toLowerCase();
  const status = body.status || "Ativa";
  if (!nome || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Informe o nome da empresa e um e-mail válido para a conta Supabase Auth." };
  }
  if (!login || !/^[a-z0-9][a-z0-9._-]{1,39}$/.test(login)) {
    return { error: "O login deve ter 2 a 40 caracteres minúsculos, sem espaços." };
  }
  if (status !== "Ativa" && status !== "Inativa") return { error: "Status de empresa inválido." };
  if (creating && (typeof body.senha !== "string" || body.senha.length < 6)) {
    return { error: "A senha inicial deve conter pelo menos seis caracteres." };
  }
  return {
    value: {
      nome,
      cnpj: body.cnpj?.trim() || null,
      responsavel: body.responsavel?.trim() || null,
      telefone: body.telefone?.trim() || null,
      email,
      login,
      status,
    },
  };
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Falha inesperada ao gerenciar a empresa.";
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminClient(request);
    const body = await request.json() as CompanyInput;
    const validated = validInput(body, true);
    if (validated.error || !validated.value) return NextResponse.json({ error: validated.error }, { status: 400 });

    const { data: company, error: companyError } = await admin
      .from("empresas")
      .insert(validated.value)
      .select("id, nome, cnpj, responsavel, telefone, email, login, status")
      .single();
    if (companyError || !company) throw new Error(`Não foi possível cadastrar a empresa: ${companyError?.message || "registro ausente."}`);

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: validated.value.email,
      password: body.senha!,
      email_confirm: true,
      user_metadata: { nome: validated.value.responsavel || validated.value.nome, empresa_id: company.id },
    });
    if (authError || !authData.user) {
      const { error: rollbackError } = await admin.from("empresas").delete().eq("id", company.id);
      throw new Error(`A empresa foi cadastrada, mas a conta Auth não pôde ser criada: ${authError?.message || "usuário ausente."}${rollbackError ? ` A limpeza também falhou: ${rollbackError.message}` : ""}`);
    }

    const { error: profileError } = await admin.from("profiles").upsert({
      id: authData.user.id,
      email: validated.value.email,
      nome: validated.value.responsavel || validated.value.nome,
      tipo: "empresa",
      empresa_id: company.id,
    }, { onConflict: "id" });
    if (profileError) {
      const { error: userRollbackError } = await admin.auth.admin.deleteUser(authData.user.id);
      const { error: companyRollbackError } = await admin.from("empresas").delete().eq("id", company.id);
      throw new Error(`A conta Auth foi criada, mas o perfil não pôde ser vinculado: ${profileError.message}${userRollbackError ? ` A limpeza do usuário falhou: ${userRollbackError.message}` : ""}${companyRollbackError ? ` A limpeza da empresa falhou: ${companyRollbackError.message}` : ""}`);
    }
    const { error: authLinkError } = await admin
      .from("empresas")
      .update({ auth_user_id: authData.user.id })
      .eq("id", company.id);
    if (authLinkError) {
      const { error: userRollbackError } = await admin.auth.admin.deleteUser(authData.user.id);
      const { error: companyRollbackError } = await admin.from("empresas").delete().eq("id", company.id);
      throw new Error(`A empresa foi cadastrada, mas não foi possível vincular sua conta: ${authLinkError.message}${userRollbackError ? ` A limpeza do usuário falhou: ${userRollbackError.message}` : ""}${companyRollbackError ? ` A limpeza da empresa falhou: ${companyRollbackError.message}` : ""}`);
    }

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminClient(request);
    const body = await request.json() as CompanyInput;
    if (!body.id) return NextResponse.json({ error: "Informe a empresa a editar." }, { status: 400 });
    const validated = validInput(body, false);
    if (validated.error || !validated.value) return NextResponse.json({ error: validated.error }, { status: 400 });

    const { data: company, error: companyError } = await admin
      .from("empresas")
      .select("id, auth_user_id, status")
      .eq("id", body.id)
      .single();
    if (companyError || !company) throw new Error(`Empresa não encontrada: ${companyError?.message || ""}`);

    if (!company.auth_user_id) throw new Error("A empresa não possui uma conta de acesso vinculada.");
    const { data: linkedUser, error: profileError } = await admin
      .from("profiles")
      .select("id, email")
      .eq("id", company.auth_user_id)
      .single();
    if (profileError || !linkedUser) throw new Error(`Não foi possível consultar a conta vinculada: ${profileError?.message || "perfil ausente."}`);

    const authUpdate: { email?: string; password?: string; email_confirm?: boolean } = {};
    if (body.email?.trim().toLowerCase() !== linkedUser.email.toLowerCase()) {
      authUpdate.email = validated.value.email;
      authUpdate.email_confirm = true;
    }
    if (body.senha) {
      if (body.senha.length < 6) return NextResponse.json({ error: "A nova senha deve conter pelo menos seis caracteres." }, { status: 400 });
      authUpdate.password = body.senha;
    }
    if (Object.keys(authUpdate).length) {
      const { error: authError } = await admin.auth.admin.updateUserById(linkedUser.id, authUpdate);
      if (authError) throw new Error(`Não foi possível atualizar as credenciais Auth: ${authError.message}`);
    }
    if (authUpdate.email) {
      const { error: profileUpdateError } = await admin
        .from("profiles")
        .update({ email: validated.value.email })
        .eq("id", linkedUser.id);
      if (profileUpdateError) throw new Error(`E-mail Auth atualizado, mas o perfil não pôde ser atualizado: ${profileUpdateError.message}`);
    }

    if (validated.value.status === "Inativa") {
      const { error: disableError } = await admin
        .from("profiles")
        .update({ empresa_id: null })
        .eq("id", linkedUser.id);
      if (disableError) throw new Error(`Não foi possível bloquear o acesso da empresa: ${disableError.message}`);
    }
    const { data: updatedCompany, error: updateError } = await admin
      .from("empresas")
      .update(validated.value)
      .eq("id", company.id)
      .select("id, nome, cnpj, responsavel, telefone, email, login, status")
      .single();
    if (updateError || !updatedCompany) throw new Error(`Não foi possível atualizar a empresa: ${updateError?.message || "registro ausente."}`);
    if (validated.value.status === "Ativa" && company.status === "Inativa") {
      const { error: enableError } = await admin
        .from("profiles")
        .update({ empresa_id: company.id })
        .eq("id", linkedUser.id);
      if (enableError) throw new Error(`A empresa foi ativada, mas não foi possível restaurar o vínculo do perfil: ${enableError.message}`);
    }
    return NextResponse.json({ company: updatedCompany });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminClient(request);
    const body = await request.json() as { id?: string };
    if (!body.id) return NextResponse.json({ error: "Informe a empresa a excluir." }, { status: 400 });

    const { data: company, error: companyLookupError } = await admin
      .from("empresas")
      .select("id, auth_user_id")
      .eq("id", body.id)
      .single();
    if (companyLookupError || !company) throw new Error(`Empresa não encontrada: ${companyLookupError?.message || ""}`);
    const { data: linkedProfiles, error: linkedProfilesError } = await admin
      .from("profiles")
      .select("id")
      .eq("empresa_id", body.id)
      .eq("tipo", "empresa");
    if (linkedProfilesError) throw new Error(`Não foi possível consultar os acessos vinculados: ${linkedProfilesError.message}`);
    const userIds = new Set((linkedProfiles || []).map(profile => profile.id));
    if (company.auth_user_id) userIds.add(company.auth_user_id);
    for (const userId of Array.from(userIds)) {
      const { error: userError } = await admin.auth.admin.deleteUser(userId);
      if (userError) throw new Error(`Não foi possível excluir a conta Auth vinculada: ${userError.message}`);
    }

    const { error: recordsError } = await admin
      .from("previx_records")
      .delete()
      .eq("company_id", body.id);
    if (recordsError) throw new Error(`As contas foram excluídas, mas os registros da empresa não puderam ser removidos: ${recordsError.message}`);

    const { error: companyError } = await admin.from("empresas").delete().eq("id", body.id);
    if (companyError) throw new Error(`Os dados relacionados foram removidos, mas a empresa não pôde ser excluída: ${companyError.message}`);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
