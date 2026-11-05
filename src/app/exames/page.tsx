"use client";
import { useEffect, useState } from "react";

type Exame = {
  id: string;
  funcionario: string;
  tipo: string;
  resultado: string;
  data: string;
};

export default function Exames() {
  const [exames, setExames] = useState<Exame[]>([]);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("Admissional");

  async function carregar() {
    const res = await fetch("/api/exames");
    const data = await res.json();
    setExames(data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar() {
    if (!nome.trim()) {
      alert("Digite o nome do funcionário");
      return;
    }
    await fetch("/api/exames", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        funcionario: nome,
        tipo: tipo,
        resultado: "Apto",
        data: new Date().toISOString(),
      }),
    });
    setNome("");
    carregar();
  }

  async function excluir(id: string) {
    if (!confirm("Tem certeza que deseja excluir este exame?")) return;
    await fetch(`/api/exames/${id}`, { method: "DELETE" });
    carregar();
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 28 }}>🩺</span>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>Exames</h1>
      </div>
      <p style={{ color: "#64748b", marginTop: 4 }}>{exames.length} registros</p>

      {/* Formulário */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9", padding: 16, marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do funcionário *"
          style={{ flex: 1, minWidth: 200, border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 16px", outline: "none", fontSize: 14 }}
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 12px", fontSize: 14, background: "#fff" }}
        >
          <option>Admissional</option>
          <option>Periódico</option>
          <option>Demissional</option>
          <option>Retorno ao Trabalho</option>
          <option>Mudança de Função</option>
        </select>
        <button
          onClick={salvar}
          style={{ background: "#0ea5e9", color: "#fff", fontWeight: 700, padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14 }}
        >
          + Novo Exame
        </button>
      </div>

      {/* Lista */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9", marginTop: 16, overflow: "hidden" }}>
        {exames.length === 0 && (
          <p style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Nenhum exame cadastrado ainda.</p>
        )}
        {exames.map((ex, i) => (
          <div key={ex.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderTop: i === 0 ? "none" : "1px solid #f1f5f9" }}>
            <div>
              <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, margin: 0 }}>{ex.funcionario}</p>
              <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>{ex.tipo} • {new Date(ex.data).toLocaleDateString("pt-BR")}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ background: "#f0fdf4", color: "#15803d", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 999 }}>✅ {ex.resultado}</span>
              <button
                onClick={() => excluir(ex.id)}
                style={{ background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 700, padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer" }}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}