"use client";
import { useState } from "react";

export default function Inspecoes() {
  const [lista, setLista] = useState([
    { id: 1, local: "Obra Sol Nascente - Bloco A", tipo: "Extintores", data: "05/11/2026", status: "OK" },
    { id: 2, local: "Almoxarifado", tipo: "EPI's", data: "04/11/2026", status: "OK" },
  ]);
  const [local, setLocal] = useState(""); const [tipo, setTipo] = useState("Extintores");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div><h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>📋 Inspeções</h1><p style={{ color: "#64748b" }}>{lista.length} realizadas</p></div>
      <form onSubmit={(e) => { e.preventDefault(); if (!local) return; setLista([{ id: Date.now(), local, tipo, data: new Date().toLocaleDateString("pt-BR"), status: "OK" }, ...lista]); setLocal(""); }} style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Local da inspeção *" required style={input} />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={input}><option>Extintores</option><option>EPI's</option><option>Andaime</option><option>Elétrica</option><option>Limpeza</option></select>
        <button style={btn}>+ Nova Inspeção</button>
      </form>
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {lista.map((i) => (
          <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap", gap: 8 }}>
            <div><b>{i.local}</b><div style={{ fontSize: 13, color: "#64748b" }}>{i.tipo} • {i.data}</div></div>
            <span style={{ background: "#ecfdf5", color: "#047857", padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800, height: "fit-content" }}>✅ {i.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
const input = { padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, flex: 1, minWidth: 180 } as const;
const btn = { background: "#10b981", color: "white", border: 0, borderRadius: 10, padding: "12px 18px", fontWeight: 800, cursor: "pointer" } as const;