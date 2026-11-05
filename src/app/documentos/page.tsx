"use client";
import { useState } from "react";
export default function Documentos() {
  const [lista, setLista] = useState([
    { id: 1, nome: "PGR - Programa de Gerenciamento de Riscos", empresa: "Sol Nascente", venc: "12/12/2026" },
    { id: 2, nome: "PCMSO", empresa: "Sol Nascente", venc: "10/01/2027" },
    { id: 3, nome: "LTCAT", empresa: "Obra XYZ", venc: "20/02/2027" },
  ]);
  const [nome, setNome] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div><h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>📄 Documentos</h1><p style={{ color: "#64748b" }}>{lista.length} cadastrados</p></div>
      <form onSubmit={(e) => { e.preventDefault(); if (!nome) return; setLista([{ id: Date.now(), nome, empresa: "Sol Nascente", venc: "—" }, ...lista]); setNome(""); }} style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: PGR, PCMSO, LTCAT, ASO..." required style={input} />
        <button style={btn}>+ Novo Documento</button>
      </form>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {lista.map((d) => (
          <div key={d.id} style={{ background: "white", borderRadius: 16, padding: 18, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 30 }}>📄</div><b>{d.nome}</b><div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{d.empresa} • Vence: {d.venc}</div>
            <div style={{ marginTop: 10, background: "#f1f5f9", padding: "8px", borderRadius: 8, fontSize: 12, textAlign: "center", fontWeight: 700 }}>📥 Baixar / Visualizar</div>
          </div>
        ))}
      </div>
    </div>
  );
}
const input = { padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, flex: 1, minWidth: 180 } as const;
const btn = { background: "#8b5cf6", color: "white", border: 0, borderRadius: 10, padding: "12px 18px", fontWeight: 800, cursor: "pointer" } as const;