"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
export default function Inspecoes() {
  const [lista, setLista] = useState<any[]>([]);
  const [local, setLocal] = useState("");
  const [obs, setObs] = useState("");
  async function carregar() {
    const { data } = await supabase.from("inspecoes").select("*").order("created_at", { ascending: false });
    setLista(data || []);
  }
  useEffect(() => { carregar(); }, []);
  async function salvar() {
    if (!local) return alert("Digite o local");
    await supabase.from("inspecoes").insert({ local, observacao: obs });
    setLocal(""); setObs(""); carregar();
  }
  return (
    <div className="p-4 max-w-3xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-black">🔍 Inspeções</h1>
      <div className="bg-white p-4 rounded-2xl shadow mt-4 flex flex-col gap-2">
        <input value={local} onChange={e => setLocal(e.target.value)} placeholder="Local inspecionado" className="border rounded-xl px-3 py-3" />
        <textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="O que foi encontrado?" className="border rounded-xl px-3 py-3" />
        <button onClick={salvar} className="bg-orange-500 text-white py-3 rounded-xl font-bold">Salvar Inspeção</button>
      </div>
      {lista.map((i: any) => <div key={i.id} className="bg-white p-3 rounded-xl mt-2 shadow"><b>{i.local}</b><p>{i.observacao}</p></div>)}
    </div>
  );
}