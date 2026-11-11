"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
export default function Epis() {
  const [lista, setLista] = useState<any[]>([]);
  const [nome, setNome] = useState("");
  const [funcionario, setFuncionario] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  async function carregar() {
    const { data } = await supabase.from("epis").select("*").order("created_at", { ascending: false });
    setLista(data || []);
  }
  useEffect(() => { carregar(); }, []);
  async function salvar() {
    if (!nome || !funcionario) return alert("Preenche nome do EPI e funcionário");
    await supabase.from("epis").insert({ nome, funcionario, data_entrega: dataEntrega || null });
    setNome(""); setFuncionario(""); setDataEntrega(""); carregar();
  }
  return (
    <div className="p-4 max-w-3xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-black">🦺 EPIs</h1>
      <div className="bg-white p-4 rounded-2xl shadow mt-4 flex flex-col gap-2">
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="EPI ex: Capacete" className="border rounded-xl px-3 py-3" />
        <input value={funcionario} onChange={e => setFuncionario(e.target.value)} placeholder="Funcionário que recebeu" className="border rounded-xl px-3 py-3" />
        <input type="date" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} className="border rounded-xl px-3 py-3" />
        <button onClick={salvar} className="bg-green-500 text-white py-3 rounded-xl font-bold">Registrar Entrega</button>
      </div>
      {lista.map((e: any) => <div key={e.id} className="bg-white p-3 rounded-xl mt-2 shadow">{e.nome} - {e.funcionario} - {e.data_entrega || ""}</div>)}
    </div>
  );
}