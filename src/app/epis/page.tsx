"use client";

import { useRef, useState, useEffect } from "react";

export default function EpisPage() {
  const [funcionario, setFuncionario] = useState("");
  const [epi, setEpi] = useState("");
  const [codigo, setCodigo] = useState("");
  const [foto, setFoto] = useState<string | null>(null);

  // 3 ASSINATURAS INDEPENDENTES
  const [assinatura1, setAssinatura1] = useState(false); // tela
  const [assinatura2, setAssinatura2] = useState(false); // foto
  const [assinatura3, setAssinatura3] = useState(false); // código

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);

  // REGRA NOVA: 1 SÓ JÁ VALIDA - OU e não E
  const podeValidar = assinatura1 || assinatura2 || assinatura3;

  const tipoUsado = assinatura1
    ? "Assinatura na tela"
    : assinatura2
    ? "Foto da assinatura"
    : assinatura3
    ? "Código do funcionário"
    : "";

  function desenhar(e: React.PointerEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function limparCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.beginPath();
    setAssinatura1(false);
  }

  function lerFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFoto(reader.result as string);
      setAssinatura2(true);
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    setAssinatura3(codigo.trim().length >= 3);
  }, [codigo]);

  async function confirmarEntrega() {
    if (!funcionario || !epi) {
      alert("Preencha funcionário e EPI");
      return;
    }
    if (!podeValidar) {
      alert("É necessário pelo menos 1 assinatura");
      return;
    }

    // Aqui envia pro seu backend / API
    // Se ainda não tem API, salva local só pra testar
    const entrega = {
      funcionario,
      epi,
      tipoAssinatura: tipoUsado,
      data: new Date().toISOString(),
      assinatura1,
      assinatura2,
      assinatura3,
    };

    console.log("Entrega validada:", entrega);
    alert(`Entrega validada com: ${tipoUsado}`);

    // Limpa
    setFuncionario("");
    setEpi("");
    setCodigo("");
    setFoto(null);
    setAssinatura1(false);
    setAssinatura2(false);
    setAssinatura3(false);
    limparCanvas();
  }

  return (
    <div style={{ maxWidth: 480, margin: "auto", padding: 20, fontFamily: "Arial" }}>
      <h1>Previx - Entrega de EPI</h1>
      <p>Assine em <b>pelo menos 1 das 3 opções</b> para validar.</p>

      <label>Funcionário</label>
      <input value={funcionario} onChange={(e) => setFuncionario(e.target.value)} placeholder="Nome do funcionário" style={input} />

      <label>EPI Entregue</label>
      <input value={epi} onChange={(e) => setEpi(e.target.value)} placeholder="Ex: Capacete, Luva, Bota" style={input} />

      {/* OPÇÃO 1 */}
      <div style={{ ...card, borderColor: assinatura1 ? "#22c55e" : "#ddd" }}>
        <h3>Opção 1 - Assinar na tela</h3>
        <canvas
          ref={canvasRef}
          width={300}
          height={140}
          style={{ border: "1px solid #000", width: "100%", background: "#fff", touchAction: "none" }}
          onPointerDown={(e) => { desenhando.current = true; desenhar(e); }}
          onPointerMove={(e) => { if (desenhando.current) desenhar(e); }}
          onPointerUp={() => { desenhando.current = false; setAssinatura1(true); }}
        />
        <button onClick={limparCanvas} style={btnSec}>Limpar assinatura</button>
        <span>{assinatura1 ? "✅ Assinatura 1 válida" : "❌ Sem assinatura"}</span>
      </div>

      {/* OPÇÃO 2 */}
      <div style={{ ...card, borderColor: assinatura2 ? "#22c55e" : "#ddd" }}>
        <h3>Opção 2 - Enviar foto da assinatura</h3>
        <input type="file" accept="image/*" onChange={lerFoto} />
        {foto && <img src={foto} alt="assinatura" style={{ maxWidth: "100%", marginTop: 10 }} />}
        <span>{assinatura2 ? "✅ Assinatura 2 válida" : "❌ Sem assinatura"}</span>
      </div>

      {/* OPÇÃO 3 */}
      <div style={{ ...card, borderColor: assinatura3 ? "#22c55e" : "#ddd" }}>
        <h3>Opção 3 - Código do funcionário</h3>
        <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Digite o código / matrícula" style={input} />
        <span>{assinatura3 ? "✅ Assinatura 3 válida" : "❌ Sem assinatura"}</span>
      </div>

      {!podeValidar && <p style={{ color: "red", textAlign: "center" }}>Assine em pelo menos 1 das 3 opções</p>}

      <button onClick={confirmarEntrega} disabled={!podeValidar} style={{ ...btn, background: podeValidar ? "#111" : "#ccc" }}>
        Confirmar Entrega
      </button>

      {podeValidar && <p style={{ textAlign: "center", color: "green" }}>Validando com: {tipoUsado}</p>}
    </div>
  );
}

const input = { width: "100%", padding: 10, margin: "5px 0 12px", border: "1px solid #ccc", borderRadius: 8, boxSizing: "border-box" as const };
const card = { border: "1px solid #ddd", padding: 12, borderRadius: 10, marginBottom: 12 };
const btn = { width: "100%", padding: 12, border: 0, borderRadius: 8, color: "#fff", fontWeight: "bold" as const, cursor: "pointer" };
const btnSec = { width: "100%", padding: 10, marginTop: 8, borderRadius: 8, border: "1px solid #ccc", cursor: "pointer" };
