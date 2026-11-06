"use client";
import { useEffect, useState } from "react";

export default function Extintores() {
  const [lista, setLista] = useState<any[]>([]);
  const [local, setLocal] = useState("");
  const [tipo, setTipo] = useState("");
  const [validade, setValidade] = useState("");

  async function carregar() {
    const r = await fetch("/api/extintores");
    const data = await r.json();
    setLista(Array.isArray(data) ? data : []);
  }
  useEffect(() => { carregar(); }, []);

  async function salvar(e: any) {
    e.preventDefault();
    await fetch("/api/extintores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ local, tipo, validade }),
    });
    setLocal(""); setTipo(""); setValidade("");
    carregar();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este extintor?")) return;
    await fetch(`/api/extintores/${id}`, { method: "DELETE" });
    carregar();
  }

  return (
    <div style={{ maxWidth: 1024, margin: "0 auto", padding: 24, fontFamily: "sans-serif", background: "#f3f4f6", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>🧯 Extintores</h1>

      <form onSubmit={salvar} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 16, display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <input style={{ flex: 1, minWidth: 160, border: "1px solid #d1d5db", borderRadius: 10, padding: "10px 12px", outline: "none" }} placeholder="Local - ex: Almoxarifado" value={local} onChange={e => setLocal(e.target.value)} required />
        <input style={{ flex: 1, minWidth: 160, border: "1px solid #d1d5db", borderRadius: 10, padding: "10px 12px", outline: "none" }} placeholder="Tipo - ex: PQS 6kg" value={tipo} onChange={e => setTipo(e.target.value)} required />
        <input type="date" style={{ border: "1px solid #d1d5db", borderRadius: 10, padding: "10px 12px", outline: "none" }} value={validade} onChange={e => setValidade(e.target.value)} required />
        <button style={{ background: "#f97316", color: "#fff", fontWeight: 600, padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer" }}>Salvar</button>
      </form>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {lista.length === 0 && <p style={{ padding: 16, color: "#6b7280" }}>Nenhum extintor cadastrado ainda.</p>}
        {lista.map((x: any) => (
          <div key={x.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
            <div>
              <p style={{ fontWeight: 600, margin: 0 }}>{x.local} <span style={{ color: "#6b7280", fontWeight: 400 }}>- {x.tipo}</span></p>
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Validade: {x.validade}</p>
            </div>
            <button onClick={() => excluir(x.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}