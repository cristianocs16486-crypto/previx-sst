"use client";
import { useState } from "react";
export default function Exames() {
  const [lista, setLista] = useState([
    { id: 1, func: "Cristiano Silva", tipo: "Admissional", data: "05/11/2026", resultado: "Apto" },
    { id: 2, func: "João Pedro", tipo: "Periódico", data: "03/11/2026", resultado: "Apto" },
  ]);
  const [func, setFunc] = useState(""); const [tipo, setTipo] = useState("Admissional");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div><h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>🩺 Exames</h1><p style={{ color: "#64748b" }}>{lista.length} registrados</p></div>
      <form onSubmit={(e) => { e.preventDefault(); if (!func) return; setLista([{ id: Date.now(), func, tipo, data: new Date().toLocaleDateString("pt-BR"), resultado: "Apto" }, ...lista]); setFunc(""); }} style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input value={func} onChange={(e) => setFunc(e.target.value)} placeholder="Nome do funcionário *" required style={input} />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={input}><option>Admissional</option><option>Periódico</option><option>Demissional</option><option>Retorno ao trabalho</option><option>Mudança de função</option></select>
        <button style={btn}>+ Novo Exame</button>
      </form>
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {lista.map((x) => (
          <div key={x.id} style={{ display: "flex", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap" }}>
            <div><b>{x.func}</b><div style={{ fontSize: 13, color: "#64748b" }}>{x.tipo} • {x.data}</div></div>
            <span style={{ background: "#ecfdf5", color: "#047857", padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800, height: "fit-content" }}>✅ {x.resultado}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
const input = { padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, flex: 1, minWidth: 180 } as const;
const btn = { background: "#0ea5e9", color: "white", border: 0, borderRadius: 10, padding: "12px 18px", fontWeight: 800, cursor: "pointer" } as const;