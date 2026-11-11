"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
export default function Exames() {
  const [lista, setLista] = useState<any[]>([]);
  const [funcionario, setFuncionario] = useState("");
  const [tipo, setTipo] = useState("Admissional");
  const [dataExame, setDataExame] = useState("");
  async function carregar() {
    const { data } = await supabase.from("exames").select("*").order("created_at", { ascending: false });
    setLista(data || []);
  }
  useEffect(() => { carregar(); }, []);
  async function salvar() {
    if (!funcionario) return alert("Digite o funcionário");
    await supabase.from("exames").insert({ funcionario, tipo, data_exame: dataExame || null });
    setFuncionario(""); setDataExame(""); carregar();
  }
  return (
    <div className="p-4 max-w-3xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-black">🩺 Exames</h1>
      <div className="bg-white p-4 rounded-2xl shadow mt-4 flex flex-col gap-2">
        <input value={funcionario} onChange={e => setFuncionario(e.target.value)} placeholder="Funcionário" className="border rounded-xl px-3 py-3" />
        <select value={tipo} onChange={e => setTipo(e.target.value)} className="border rounded-xl px-3 py-3"><option>Admissional</option><option>Periódico</option><option>Demissional</option><option>Retorno ao trabalho</option></select>
        <input type="date" value={dataExame} onChange={e => setDataExame(e.target.value)} className="border rounded-xl px-3 py-3" />
        <button onClick={salvar} className="bg-blue-600 text-white py-3 rounded-xl font-bold">Salvar Exame</button>
      </div>
      {lista.map((e: any) => <div key={e.id} className="bg-white p-3 rounded-xl mt-2 shadow">{e.funcionario} - {e.tipo} - {e.data_exame || ""}</div>)}
    </div>
  );
}