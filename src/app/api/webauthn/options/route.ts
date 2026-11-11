import { randomUUID } from "node:crypto";
import { generateAuthenticationOptions, generateRegistrationOptions } from "@simplewebauthn/server";
import { NextRequest, NextResponse } from "next/server";
import { getEmployeeContext, getWebAuthnConfig, respondWithError } from "@/lib/webauthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!isUuid(body.companyId) || !isUuid(body.employeeId) || typeof body.pin !== "string" || !/^\d{4}$/.test(body.pin)) {
      return NextResponse.json({ error: "Empresa, funcionário ou PIN inválido." }, { status: 400 });
    }

    const context = await getEmployeeContext(request, body.companyId, body.employeeId, body.pin);
    const { rpID } = getWebAuthnConfig(request);
    const { data: credentials, error: credentialError } = await context.admin
      .from("previx_webauthn_credentials")
      .select("credential_id, transports")
      .eq("employee_id", context.employeeId)
      .eq("company_id", context.companyId);
    if (credentialError) throw new Error(`Não foi possível consultar os autenticadores: ${credentialError.message}`);

    const existing = credentials || [];
    const purpose = existing.length ? "authentication" : "registration";
    const options = purpose === "registration"
      ? await generateRegistrationOptions({
          rpName: "PREVIX SST",
          rpID,
          userID: new TextEncoder().encode(context.employeeId),
          userName: context.employeeName,
          userDisplayName: context.employeeName,
          timeout: 60000,
          attestationType: "none",
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            residentKey: "preferred",
            userVerification: "required",
          },
          excludeCredentials: existing.map(credential => ({
            id: credential.credential_id,
            transports: credential.transports,
          })),
        })
      : await generateAuthenticationOptions({
          rpID,
          timeout: 60000,
          userVerification: "required",
          allowCredentials: existing.map(credential => ({
            id: credential.credential_id,
            transports: credential.transports,
          })),
        });

    const challengeId = randomUUID();
    const { error: challengeError } = await context.admin
      .from("previx_webauthn_challenges")
      .insert({
        id: challengeId,
        challenge: options.challenge,
        company_id: context.companyId,
        employee_id: context.employeeId,
        actor_id: context.actorId,
        purpose,
      });
    if (challengeError) throw new Error(`Não foi possível criar o desafio WebAuthn: ${challengeError.message}`);

    return NextResponse.json({ purpose, challengeId, options });
  } catch (error) {
    return respondWithError(error);
  }
}
