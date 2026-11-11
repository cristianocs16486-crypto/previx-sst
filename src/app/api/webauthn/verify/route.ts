import { createHash, randomBytes } from "node:crypto";
import {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { NextRequest, NextResponse } from "next/server";
import { getEmployeeContext, getWebAuthnConfig, respondWithError } from "@/lib/webauthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isWebAuthnResponse(value: unknown): value is RegistrationResponseJSON | AuthenticationResponseJSON {
  if (!value || typeof value !== "object") return false;
  const response = value as Record<string, unknown>;
  return typeof response.id === "string"
    && typeof response.rawId === "string"
    && typeof response.type === "string"
    && !!response.response
    && typeof response.response === "object";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!isUuid(body.companyId) || !isUuid(body.employeeId) || !isUuid(body.challengeId)
      || typeof body.pin !== "string" || !/^\d{4}$/.test(body.pin)
      || !isWebAuthnResponse(body.response)) {
      return NextResponse.json({ error: "Dados de autenticação inválidos." }, { status: 400 });
    }

    const context = await getEmployeeContext(request, body.companyId, body.employeeId, body.pin);
    const { expectedOrigin, rpID } = getWebAuthnConfig(request);
    const { data: challenge, error: challengeError } = await context.admin
      .from("previx_webauthn_challenges")
      .select("id, challenge, purpose, created_at")
      .eq("id", body.challengeId)
      .eq("company_id", context.companyId)
      .eq("employee_id", context.employeeId)
      .eq("actor_id", context.actorId)
      .is("consumed_at", null)
      .single();
    if (challengeError || !challenge) throw new Error("Desafio WebAuthn expirado ou já utilizado.");
    if (Date.now() - new Date(challenge.created_at).getTime() > 5 * 60 * 1000) {
      throw new Error("Desafio WebAuthn expirado. Verifique o PIN e tente novamente.");
    }

    const response = body.response as RegistrationResponseJSON | AuthenticationResponseJSON;
    let verified = false;
    let verifiedAt = new Date().toISOString();

    if (challenge.purpose === "registration") {
      const verification = await verifyRegistrationResponse({
        response: response as RegistrationResponseJSON,
        expectedChallenge: challenge.challenge,
        expectedOrigin,
        expectedRPID: rpID,
        requireUserVerification: true,
      });
      if (!verification.verified || !verification.registrationInfo.userVerified) {
        throw new Error("O autenticador não confirmou a verificação local do usuário.");
      }

      const { credential } = verification.registrationInfo;
      const { error: saveCredentialError } = await context.admin
        .from("previx_webauthn_credentials")
        .insert({
          credential_id: credential.id,
          employee_id: context.employeeId,
          company_id: context.companyId,
          public_key: Buffer.from(credential.publicKey).toString("base64url"),
          counter: credential.counter,
          transports: credential.transports || [],
        });
      if (saveCredentialError) throw new Error(`Não foi possível registrar o autenticador: ${saveCredentialError.message}`);
      verified = true;
    } else {
      if (response.type !== "public-key") throw new Error("Tipo de credencial WebAuthn inválido.");
      const { data: credential, error: credentialError } = await context.admin
        .from("previx_webauthn_credentials")
        .select("credential_id, public_key, counter, transports")
        .eq("credential_id", response.id)
        .eq("employee_id", context.employeeId)
        .eq("company_id", context.companyId)
        .single();
      if (credentialError || !credential) throw new Error("Autenticador não cadastrado para este funcionário.");

      const verification = await verifyAuthenticationResponse({
        response: response as AuthenticationResponseJSON,
        expectedChallenge: challenge.challenge,
        expectedOrigin,
        expectedRPID: rpID,
        requireUserVerification: true,
        credential: {
          id: credential.credential_id,
          publicKey: Buffer.from(credential.public_key, "base64url"),
          counter: Number(credential.counter),
          transports: credential.transports,
        },
      });
      if (!verification.verified || !verification.authenticationInfo.userVerified) {
        throw new Error("O autenticador não confirmou a verificação local do usuário.");
      }

      const { data: updatedCredential, error: counterError } = await context.admin
        .from("previx_webauthn_credentials")
        .update({ counter: verification.authenticationInfo.newCounter })
        .eq("credential_id", credential.credential_id)
        .eq("counter", credential.counter)
        .select("credential_id")
        .maybeSingle();
      if (counterError || !updatedCredential) throw new Error("Não foi possível atualizar o contador de segurança do autenticador.");
      verified = true;
    }

    if (!verified) throw new Error("Não foi possível validar o autenticador.");

    const { data: consumedChallenge, error: consumeError } = await context.admin
      .from("previx_webauthn_challenges")
      .update({ consumed_at: verifiedAt })
      .eq("id", challenge.id)
      .is("consumed_at", null)
      .select("id")
      .maybeSingle();
    if (consumeError || !consumedChallenge) throw new Error("O desafio WebAuthn já foi utilizado.");

    const token = randomBytes(32).toString("base64url");
    const proofHash = createHash("sha256").update(token).digest("hex");
    const { error: proofError } = await context.admin
      .from("previx_webauthn_proofs")
      .insert({
        proof_hash: proofHash,
        company_id: context.companyId,
        employee_id: context.employeeId,
        actor_id: context.actorId,
        verified_at: verifiedAt,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });
    if (proofError) throw new Error(`Não foi possível criar a autorização temporária: ${proofError.message}`);

    return NextResponse.json({ verified: true, token, verifiedAt, method: "WebAuthn" });
  } catch (error) {
    return respondWithError(error);
  }
}
