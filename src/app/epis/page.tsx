"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

export default function Epis() {
  const [lista, setLista] = useState<any[]>([]);
  const [nome, setNome] = useState("");
  const [funcionario, setFuncionario] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");

  // --- AUTORIZAÇÃO INDEPENDENTE: qualquer UMA libera ---
  const [metodo, setMetodo] = useState<"assinatura" | "pin" | "biometria">("assinatura");
  const [pin, setPin] = useState("");
  const [assinaturaFeita, setAssinaturaFeita] = useState(false);
  const [biometriaOk, setBiometriaOk] = useState(false);
  const [biometriaMsg, setBiometriaMsg] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);

  async function carregar() {
    const { data } = await supabase.from("epis").select("*").order("created_at", { ascending: false });
    setLista(data || []);
  }
  useEffect(() => { carregar(); }, []);

  // --- ASSINATURA ---
  function iniciarAssinatura(e: any) {
    desenhando.current = true;
    desenhar(e);
  }
  function desenhar(e: any) {
    if (!desenhando.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    setAssinaturaFeita(true);
  }
  function pararAssinatura() {
    desenhando.current = false;
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.beginPath();
  }
  function limparAssinatura() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setAssinaturaFeita(false);
  }
  function pegarAssinatura() {
    if (!assinaturaFeita) return null;
    return canvasRef.current?.toDataURL("image/png") || null;
  }

  // --- BIOMETRIA FACIAL / DIGITAL (WebAuthn) ---
  async function autenticarBiometria() {
    setBiometriaMsg("");
    try {
      // @ts-ignore - WebAuthn pode não existir em todos os navegadores
      if (!window.PublicKeyCredential) {
        setBiometriaMsg("Biometria não disponível neste aparelho, use Assinatura ou PIN.");
        return;
      }
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      // @ts-ignore
      await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "required",
        },
      });
      setBiometriaOk(true);
      setBiometriaMsg("✅ Biometria confirmada!");
    } catch (err: any) {
      // Se o aparelho não tem biometria cadastrada, cai aqui.
      // Não trava a entrega: o usuário pode escolher outro método.
      setBiometriaOk(false);
      setBiometriaMsg("Biometria cancelada ou não cadastrada. Tente de novo ou use Assinatura / PIN.");
    }
  }

  async function salvar() {
    if (!nome || !funcionario) return alert("Preenche nome do EPI e funcionário");

    // --- REGRA NOVA: INDEPENDENTE, NÃO OBRIGATÓRIA ---
    // Basta UMA das 3 estar válida
    const temAssinatura = metodo === "assinatura" && assinaturaFeita;
    const temPin = metodo === "pin" && pin.length >= 4;
    const temBiometria = metodo === "biometria" && biometriaOk;

    // Se o método escolhido não foi concluído, bloqueia só ele
    if (metodo === "assinatura" && !assinaturaFeita) return alert("Assine no campo para liberar a entrega ou troque para PIN ou Biometria.");
    if (metodo === "pin" && pin.length < 4) return alert("Digite o PIN de 4 dígitos ou troque para Assinatura ou Biometria.");
    if (metodo === "biometria" && !biometriaOk) return alert("Confirme a biometria ou troque para Assinatura ou PIN.");

    const autorizadoPor = metodo; // assinatura | pin | biometria
    const assinaturaImg = metodo === "assinatura" ? pegarAssinatura() : null;

    await supabase.from("epis").insert({
      nome,
      funcionario,
      data_entrega: dataEntrega || null,
      // Salva qual método autorizou - não exige os outros
      autorizado_por: autorizadoPor,
      assinatura: assinaturaImg,
      pin_confirmado: metodo === "pin" ? true : false,
      biometria_confirmada: metodo === "biometria" ? true : false,
    });

    setNome(""); setFuncionario(""); setDataEntrega("");
    setPin(""); setBiometriaOk(false); setBiometriaMsg(""); limparAssinatura();
    carregar();
  }

  return (
    <div className="p-4 max-w-3xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-black">🦺 EPIs</h1>
      <div className="bg-white p-4 rounded-2xl shadow mt-4 flex flex-col gap-2">
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="EPI ex: Capacete" className="border rounded-xl px-3 py-3" />
        <input value={funcionario} onChange={e => setFuncionario(e.target.value)} placeholder="Funcionário que recebeu" className="border rounded-xl px-3 py-3" />
        <input type="date" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} className="border rounded-xl px-3 py-3" />

        {/* --- ESCOLHA DA AUTORIZAÇÃO - QUALQUER UMA LIBERA --- */}
        <p className="font-bold mt-2">Autorização de entrega - escolha 1:</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setMetodo("assinatura")} className={`flex-1 py-2 rounded-xl font-bold border ${metodo === "assinatura" ? "bg-black text-white" : "bg-gray-100"}`}>✍️ Assinatura</button>
          <button type="button" onClick={() => setMetodo("pin")} className={`flex-1 py-2 rounded-xl font-bold border ${metodo === "pin" ? "bg-black text-white" : "bg-gray-100"}`}>🔢 PIN</button>
          <button type="button" onClick={() => setMetodo("biometria")} className={`flex-1 py-2 rounded-xl font-bold border ${metodo === "biometria" ? "bg-black text-white" : "bg-gray-100"}`}>👆 Biometria</button>
        </div>

        {metodo === "assinatura" && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Assine abaixo para autorizar:</p>
            <canvas
              ref={canvasRef}
              width={500}
              height={180}
              onMouseDown={iniciarAssinatura}
              onMouseMove={desenhar}
              onMouseUp={pararAssinatura}
              onMouseLeave={pararAssinatura}
              onTouchStart={iniciarAssinatura}
              onTouchMove={desenhar}
              onTouchEnd={pararAssinatura}
              className="border rounded-xl w-full bg-white touch-none"
            />
            <button type="button" onClick={limparAssinatura} className="text-sm underline mt-1">Limpar assinatura</button>
          </div>
        )}

        {metodo === "pin" && (
          <div>
            <input
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Digite o PIN"
              inputMode="numeric"
              className="border rounded-xl px-3 py-3 w-full"
            />
            <p className="text-sm text-gray-500 mt-1">Só o PIN já libera, não precisa assinar nem biometria.</p>
          </div>
        )}

        {metodo === "biometria" && (
          <div className="flex flex-col gap-2">
            <button type="button" onClick={autenticarBiometria} className="bg-blue-500 text-white py-3 rounded-xl font-bold">
              {biometriaOk ? "✅ Biometria Confirmada" : "Usar Digital / Facial"}
            </button>
            {biometriaMsg && <p className="text-sm">{biometriaMsg}</p>}
            <p className="text-sm text-gray-500">Usa a digital / facial do próprio celular. Só ela já libera.</p>
          </div>
        )}

        <button onClick={salvar} className="bg-green-500 text-white py-3 rounded-xl font-bold">Registrar Entrega</button>
      </div>
      {lista.map((e: any) => <div key={e.id} className="bg-white p-3 rounded-xl mt-2 shadow">{e.nome} - {e.funcionario} - {e.data_entrega || ""} {e.autorizado_por ? ` - via ${e.autorizado_por}` : ""}</div>)}
    </div>
  );
}
