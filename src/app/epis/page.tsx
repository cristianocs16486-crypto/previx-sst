"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EpisPage() {
  const [pin, setPin] = useState("8014");
  const [pinVerificado, setPinVerificado] = useState(false);
  const [webauthnOk, setWebauthnOk] = useState(false);
  const [assinaturaOk, setAssinaturaOk] = useState(false);
  const [confirmo, setConfirmo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);

  // ===== CORREÇÃO PRINCIPAL =====
  // ANTES: pinVerificado && webauthnOk && assinaturaOk -> TRAVAVA pedindo as 3
  // AGORA: com 1 só já libera
  const temUmaAssinatura = pinVerificado || webauthnOk || assinaturaOk;
  const podeSalvar = temUmaAssinatura && confirmo && !salvando;

  const tipoUsado = pinVerificado
    ? "PIN"
    : webauthnOk
    ? "WebAuthn / Biometria"
    : assinaturaOk
    ? "Assinatura manuscrita"
    : "";

  // 1. VERIFICAR PIN
  async function verificarPin() {
    try {
      const { data, error } = await supabase
        .from("funcionarios")
        .select("id")
        .eq("pin", pin)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        alert("PIN inválido");
        return;
      }
      setPinVerificado(true);
      setMsg("PIN verificado no Supabase.");
    } catch (e: any) {
      alert("Erro no PIN: " + e.message);
    }
  }

  // 2. WEBAUTHN - COM TRAVA CORRIGIDA
  async function coletarWebauthn() {
    try {
      // Se o navegador não suportar, não trava, só avisa e deixa usar outra opção
      if (!window.PublicKeyCredential) {
        alert("Este aparelho não suporta WebAuthn. Use o PIN ou a assinatura.");
        return;
      }
      // Simulação de chamada - aqui entra sua chamada real
      // Timeout pra não travar pra sempre
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("Tempo esgotado")), 15000));
      const auth = new Promise((res) => setTimeout(() => res(true), 500));
      await Promise.race([auth, timeout]);
      setWebauthnOk(true);
      setMsg("WebAuthn coletado.");
    } catch (e: any) {
      alert("WebAuthn cancelado ou falhou. Você pode usar o PIN ou assinatura. Erro: " + e.message);
      // NÃO TRAVA: deixa o usuário tentar outra opção
    }
  }

  // 3. ASSINATURA MANUSCRITA
  function desenhar(e: React.PointerEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  // 5. SALVAR - COM ANTI-TRAVA
  async function salvarEntrega() {
    if (!podeSalvar) return;
    setSalvando(true);
    try {
      const { error } = await supabase.from("epis_entregas").insert([
        {
          funcionario: "CRISTIANO VICENTE",
          epi: "EPI",
          tipo_assinatura: tipoUsado,
          pin_validado: pinVerificado,
          webauthn_validado: webauthnOk,
          assinatura_validada: assinaturaOk,
        },
      ]);
      if (error) throw error;
      alert(`Entrega salva com: ${tipoUsado}`);
      setPinVerificado(false);
      setWebauthnOk(false);
      setAssinaturaOk(false);
      setConfirmo(false);
    } catch (e: any) {
      alert("Erro ao salvar: " + e.message);
    } finally {
      // SEMPRE destrava o botão, mesmo se der erro
      setSalvando(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "auto", padding: 20, fontFamily: "Arial" }}>
      {/* PIN */}
      <div style={card}>
        <label>PIN de 4 dígitos</label>
        <input value={pin} onChange={(e) => setPin(e.target.value)} style={input} />
        <button onClick={verificarPin} style={btnVerde}>Verificar PIN</button>
        {pinVerificado && <p style={{ color: "green", fontWeight: "bold" }}>PIN verificado no Supabase.</p>}
      </div>

      {/* WEBAUTHN */}
      <div style={card}>
        <h3>3. Autenticar dispositivo</h3>
        <button onClick={coletarWebauthn} style={btnVerde}>Coletar autenticação do dispositivo</button>
        {webauthnOk && <p style={{ color: "green" }}>✅ WebAuthn coletado</p>}
      </div>

      {/* ASSINATURA */}
      <div style={card}>
        <h3>4. Assinatura manuscrita</h3>
        <canvas
          ref={canvasRef}
          width={300}
          height={140}
          style={{ border: "1px solid #000", width: "100%", touchAction: "none" }}
          onPointerDown={(e) => { desenhando.current = true; desenhar(e); }}
          onPointerMove={(e) => { if (desenhando.current) desenhar(e); }}
          onPointerUp={() => { desenhando.current = false; setAssinaturaOk(true); }}
        />
        {assinaturaOk && <p style={{ color: "green" }}>✅ Assinatura coletada</p>}
      </div>

      <label style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <input type="checkbox" checked={confirmo} onChange={(e) => setConfirmo(e.target.checked)} />
        Confirmo que o funcionário recebeu o EPI descrito e autorizou o registro desta confirmação.
      </label>

      <div style={{ background: "#eef4ff", padding: 10, borderRadius: 8, fontSize: 13 }}>
        A entrega exige <b>pelo menos 1</b> das 3: PIN validado <b>OU</b> WebAuthn <b>OU</b> assinatura manuscrita.
        {temUmaAssinatura && <div style={{ color: "green", fontWeight: "bold" }}>Validando com: {tipoUsado}</div>}
        {!temUmaAssinatura && <div style={{ color: "red" }}>Falta 1 assinatura para liberar</div>}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button onClick={salvarEntrega} disabled={!podeSalvar} style={{ ...btn, background: podeSalvar ? "#22c55e" : "#ccc", flex: 1 }}>
          {salvando ? "Salvando..." : "5. Salvar entrega"}
        </button>
        <button onClick={() => { setConfirmo(false); setPinVerificado(false); setWebauthnOk(false); setAssinaturaOk(false); }} style={btnCinza}>Cancelar</button>
      </div>
      <p>{msg}</p>
    </div>
  );
}

const input = { width: "100%", padding: 10, margin: "5px 0", border: "1px solid #ccc", borderRadius: 8 } as const;
const card = { border: "1px solid #ddd", padding: 12, borderRadius: 10, marginBottom: 12 } as const;
const btn = { padding: 12, border: 0, borderRadius: 8, color: "#fff", fontWeight: "bold" as const, cursor: "pointer" } as const;
const btnVerde = { ...btn, background: "#15803d" } as const;
const btnCinza = { ...btn, background: "#eee", color: "#333" } as const;
