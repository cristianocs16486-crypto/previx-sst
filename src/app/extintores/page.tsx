"use client";
import { useEffect, useState } from "react";

export default function Extintores() {
  const [lista, setLista] = useState<any[]>([]);
  const [local, setLocal] = useState("");
  const [tipo, setTipo] = useState("");
  const [validade, setValidade] = useState("");

  async function carregar() {
    const r = await fetch("/api/extintores");
    setLista(await r.json());
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
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>🧯 Extintores</h1>
      <form onSubmit={salvar} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input placeholder="Local" value={local} onChange={e => setLocal(e.target.value)} required />
        <input placeholder="Tipo - ex: PQS 6kg" value={tipo} onChange={e => setTipo(e.target.value)} required />
        <input type="date" value={validade} onChange={e => setValidade(e.target.value)} required />
        <button type="submit">Salvar</button>
      </form>
      {lista.map((x: any) => (
        <div key={x.id} style={{ display: "flex", justifyContent: "space-between", border: "1px solid #ddd", padding: 10, marginBottom: 8 }}>
          <span>{x.local} - {x.tipo} - {x.validade}</span>
          <button onClick={() => excluir(x.id)} style={{ color: "red" }}>Excluir</button>
        </div>
      ))}
    </div>
  );
}