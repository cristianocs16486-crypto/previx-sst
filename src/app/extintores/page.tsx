"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function ExtintoresPage() {
  const [extintores, setExtintores] = useState<any[]>([]);
  const [local, setLocal] = useState("");
  const [proximaRecarga, setProximaRecarga] = useState("");
  const [tipo, setTipo] = useState("PQS 6kg");
  const [loading, setLoading] = useState(true);

  async function carregar() {
    const { data } = await supabase.from("extintores").select("*").order("created_at", { ascending: false });
    setExtintores(data || []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function salvar() {
    if (!local) return alert("Digite o local");
    const { error } = await supabase.from("extintores").insert({
      local,
      proxima_recarga: proximaRecarga || null,
      tipo,
    });
    if (error) return alert(error.message);
    setLocal(""); setProximaRecarga(""); setTipo("PQS 6kg");
    carregar();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esse extintor?")) return;
    await supabase.from("extintores").delete().eq("id", id);
    carregar();
  }

  const alertas = extintores.filter((e: any) => {
    if (!e.proxima_recarga) return false;
    const dias = Math.ceil((new Date(e.proxima_recarga).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return dias <= 30;
  });

  if (loading) return <div className="p-10 text-center font-bold">Carregando...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-black">🧯 Extintores</h1>

      {alertas.length > 0 && (
        <div className="bg-red-100 border border-red-300 p-4 rounded-2xl mt-4">
          <p className="font-black text-red-700">🔔 {alertas.length} extintor(es) vencendo em 30 dias!</p>
          {alertas.map((a: any) => <p key={a.id} className="text-sm">• {a.local} - {a.proxima_recarga}</p>)}
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl shadow mt-4 flex flex-col gap-2">
        <input value={local} onChange={e => setLocal(e.target.value)} placeholder="Local ex: Cozinha" className="border rounded-xl px-3 py-3" />
        <select value={tipo} onChange={e => setTipo(e.target.value)} className="border rounded-xl px-3 py-3">
          <option>PQS 6kg</option>
          <option>CO2 6kg</option>
          <option>Água 10L</option>
          <option>Espuma</option>
        </select>
        <label className="text-sm font-bold">Próxima Recarga:</label>
        <input type="date" value={proximaRecarga} onChange={e => setProximaRecarga(e.target.value)} className="border rounded-xl px-3 py-3" />
        <button onClick={salvar} className="bg-green-500 text-white py-3 rounded-xl font-bold">Salvar Extintor</button>
      </div>

      {extintores.map((e: any) => (
        <div key={e.id} className="bg-white p-3 rounded-xl mt-2 shadow flex justify-between items-center">
          <div>
            <p className="font-bold">{e.local} - {e.tipo || ""}</p>
            <p className="text-sm text-gray-500">Próxima Recarga: {e.proxima_recarga || "—"}</p>
          </div>
          <button onClick={() => excluir(e.id)} className="bg-red-100 text-red-600 px-3 py-2 rounded-lg font-bold text-sm">Excluir</button>
        </div>
      ))}
      {extintores.length === 0 && <p className="text-gray-400 text-sm mt-4 text-center">Nenhum extintor ainda.</p>}
    </div>
  );
}