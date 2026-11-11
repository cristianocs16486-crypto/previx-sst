"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
export default function Funcionarios() {
  const [lista, setLista] = useState<any[]>([]);
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  async function carregar() {
    const { data } = await supabase.from("funcionarios").select("*").order("created_at", { ascending: false });
    setLista(data || []);
  }
  useEffect(() => { carregar(); }, []);
  async function salvar() {
    if (!nome) return alert("Digite o nome");
    await supabase.from("funcionarios").insert({ nome, cargo });
    setNome(""); setCargo(""); carregar();
  }
  async function excluir(id: string) {
    if (!confirm("Excluir?")) return;
    await supabase.from("funcionarios").delete().eq("id", id); carregar();
  }
  return (
    <div className="p-4 max-w-3xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-black">👷 Funcionários</h1>
      <div className="bg-white p-4 rounded-2xl shadow mt-4 flex flex-col gap-2">
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome" className="border rounded-xl px-3 py-3" />
        <input value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Cargo ex: Pedreiro" className="border rounded-xl px-3 py-3" />
        <button onClick={salvar} className="bg-blue-600 text-white py-3 rounded-xl font-bold">Salvar Funcionário</button>
      </div>
      {lista.map((f: any) => (
        <div key={f.id} className="bg-white p-3 rounded-xl mt-2 shadow flex justify-between"><span>{f.nome} - {f.cargo}</span><button onClick={() => excluir(f.id)} className="text-red-500 font-bold">Excluir</button></div>
      ))}
    </div>
  );
}