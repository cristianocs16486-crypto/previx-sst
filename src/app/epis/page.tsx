
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
  const desenhouAlgo = useRef(false);

  // QUALQUER UM DOS 3 MÉTODOS LIBERA
  const temUmaAssinatura =
    pinVerificado || webauthnOk || assinaturaOk;

  const podeSalvar = temUmaAssinatura && confirmo && !salvando;

  const tipoUsado = pinVerificado
    ? "PIN"
    : webauthnOk
    ? "WebAuthn / Biometria"
    : assinaturaOk
    ? "Assinatura manuscrita"
    : "";

  // 1. VALIDAR PIN
  async function verificarPin() {
    setMsg("");

    try {
      const { data, error } = await supabase
        .from("funcionarios")
        .select("id")
        .eq("pin", pin.trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setPinVerificado(false);
        alert("PIN inválido.");
        return;
      }

      setPinVerificado(true);
      setMsg("PIN verificado com sucesso.");
    } catch (e: any) {
      setPinVerificado(false);
      alert("Erro ao verificar PIN: " + e.message);
    }
  }

  // 2. WEBAUTHN - SIMULAÇÃO
  // Esta função NÃO realiza leitura real de digital.
  async function coletarWebauthn() {
    setMsg("");

    try {
      if (!window.PublicKeyCredential) {
        alert(
          "Este aparelho não suporta WebAuthn. " +
          "Utilize PIN ou assinatura manuscrita."
        );
        return;
      }

      // Simulação de validação
      await new Promise((resolve) => setTimeout(resolve, 500));

      setWebauthnOk(true);
      setMsg("Autenticação simulada com sucesso.");
    } catch (e: any) {
      setWebauthnOk(false);
      alert("Autenticação falhou: " + e.message);
    }
  }

  // 3. INICIAR ASSINATURA
  function iniciarDesenho(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    desenhando.current = true;
    desenhouAlgo.current = false;

    canvas.setPointerCapture(e.pointerId);

    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  // 4. DESENHAR ASSINATURA
  function desenhar(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!desenhando.current) return;

    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000";

    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y);

    desenhouAlgo.current = true;
    setAssinaturaOk(true);
  }

  // 5. FINALIZAR DESENHO
  function finalizarDesenho() {
    desenhando.current = false;

    if (desenhouAlgo.current) {
      setAssinaturaOk(true);
      setMsg("Assinatura manuscrita coletada.");
    }
  }

  // 6. LIMPAR ASSINATURA
  function limparAssinatura() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    desenhando.current = false;
    desenhouAlgo.current = false;
    setAssinaturaOk(false);
    setMsg("");
  }

  // 7. REINICIAR VALIDAÇÕES
  function cancelar() {
    setPinVerificado(false);
    setWebauthnOk(false);
    setAssinaturaOk(false);
    setConfirmo(false);
    setMsg("");
    limparAssinatura();
  }

  // 8. SALVAR ENTREGA
  async function salvarEntrega() {
    if (!podeSalvar) return;

    setSalvando(true);
    setMsg("");

    try {
      const { error } = await supabase
        .from("epis_entregas")
        .insert([
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

      alert("Entrega salva com: " + tipoUsado);

      cancelar();
    } catch (e: any) {
      alert("Erro ao salvar entrega: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "auto",
        padding: 20,
        fontFamily: "Arial",
      }}
    >
      {/* PIN */}
      <div style={card}>
        <label>PIN de 4 dígitos</label>

        <input
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setPinVerificado(false);
          }}
          style={input}
        />

        <button
          type="button"
          onClick={verificarPin}
          style={btnVerde}
        >
          Verificar PIN
        </button>

        {pinVerificado && (
          <p style={{ color: "green", fontWeight: "bold" }}>
            ✅ PIN verificado
          </p>
        )}
      </div>

      {/* BIOMETRIA */}
      <div style={card}>
        <h3>3. Autenticar dispositivo</h3>

        <button
          type="button"
          onClick={coletarWebauthn}
          style={btnVerde}
        >
          Coletar autenticação do dispositivo
        </button>

        {webauthnOk && (
          <p style={{ color: "green" }}>
            ✅ Autenticação simulada
          </p>
        )}
      </div>

      {/* ASSINATURA */}
      <div style={card}>
        <h3>4. Assinatura manuscrita</h3>

        <canvas
          ref={canvasRef}
          width={600}
          height={280}
          style={{
            border: "1px solid #000",
            borderRadius: 8,
            width: "100%",
            height: 140,
            touchAction: "none",
            background: "#fff",
          }}
          onPointerDown={iniciarDesenho}
          onPointerMove={desenhar}
          onPointerUp={finalizarDesenho}
          onPointerCancel={finalizarDesenho}
          onLostPointerCapture={finalizarDesenho}
        />

        {assinaturaOk && (
          <p style={{ color: "green" }}>
            ✅ Assinatura coletada
          </p>
        )}

        <button
          type="button"
          onClick={limparAssinatura}
          style={btnCinza}
        >
          Limpar assinatura
        </button>
      </div>

      {/* CONFIRMAÇÃO */}
      <label
        style={{
          display: "flex",
          gap: 8,
          margin: "12px 0",
        }}
      >
        <input
          type="checkbox"
          checked={confirmo}
          onChange={(e) => setConfirmo(e.target.checked)}
        />

        Confirmo que o funcionário recebeu o EPI descrito e autorizou
        o registro desta confirmação.
      </label>

      {/* STATUS */}
      <div
        style={{
          background: "#eef4ff",
          padding: 10,
          borderRadius: 8,
          fontSize: 13,
        }}
      >
        A entrega exige pelo menos 1 método:

        <b> PIN OU digital OU assinatura.</b>

        {temUmaAssinatura && (
          <div style={{ color: "green", fontWeight: "bold" }}>
            Método validado: {tipoUsado}
          </div>
        )}

        {!temUmaAssinatura && (
          <div style={{ color: "red" }}>
            Nenhum método validado ainda.
          </div>
        )}
      </div>

      {/* BOTÕES */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 12,
        }}
      >
        <button
          type="button"
          onClick={salvarEntrega}
          disabled={!podeSalvar}
          style={{
            ...btn,
            background: podeSalvar ? "#22c55e" : "#ccc",
            flex: 1,
          }}
        >
          {salvando ? "Salvando..." : "5. Salvar entrega"}
        </button>

        <button
          type="button"
          onClick={cancelar}
          style={btnCinza}
        >
          Cancelar
        </button>
      </div>

      <p>{msg}</p>
    </div>
  );
}

const input = {
  width: "100%",
  padding: 10,
  margin: "5px 0",
  border: "1px solid #ccc",
  borderRadius: 8,
} as const;

const card = {
  border: "1px solid #ddd",
  padding: 12,
  borderRadius: 10,
  marginBottom: 12,
} as const;

const btn = {
  padding: 12,
  border: 0,
  borderRadius: 8,
  color: "#fff",
  fontWeight: "bold" as const,
  cursor: "pointer",
} as const;

const btnVerde = {
  ...btn,
  background: "#15803d",
} as const;

const btnCinza = {
  ...btn,
  background: "#eee",
  color: "#333",
} as const;
