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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">🧯 Extintores</h1>

      <form onSubmit={salvar} className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3 mb-6">
        <input className="flex-1 min-w-[160px] border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500" placeholder="Local - ex: Almoxarifado" value={local} onChange={e => setLocal(e.target.value)} required />
        <input className="flex-1 min-w-[160px] border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500" placeholder="Tipo - ex: PQS 6kg" value={tipo} onChange={e => setTipo(e.target.value)} required />
        <input type="date" className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500" value={validade} onChange={e => setValidade(e.target.value)} required />
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg">Salvar</button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {lista.length === 0 && <p className="p-4 text-gray-500">Nenhum extintor cadastrado ainda.</p>}
        {lista.map((x: any) => (
          <div key={x.id} className="flex items-center justify-between px-4 py-3 border-b last:border-0">
            <div>
              <p className="font-semibold">{x.local} <span className="text-gray-500 font-normal">- {x.tipo}</span></p>
              <p className="text-sm text-gray-500">Validade: {x.validade}</p>
            </div>
            <button onClick={() => excluir(x.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}