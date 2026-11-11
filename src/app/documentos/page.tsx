"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
export default function Documentos() {
  const [lista, setLista] = useState<any[]>([]);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("PGR");
  async function carregar() {
    const { data } = await supabase.from("documentos").select("*").order("created_at", { ascending: false });
    setLista(data || []);
  }
  useEffect(() => { carregar(); }, []);
  async function salvar() {
    if (!titulo) return alert("Digite o título");
    await supabase.from("documentos").insert({ titulo, categoria });
    setTitulo(""); carregar();
  }
  return (
    <div className="p-4 max-w-3xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-black">📄 Documentos</h1>
      <div className="bg-white p-4 rounded-2xl shadow mt-4 flex flex-col gap-2">
        <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título ex: PGR 2026" className="border rounded-xl px-3 py-3" />
        <select value={categoria} onChange={e => setCategoria(e.target.value)} className="border rounded-xl px-3 py-3"><option>PGR</option><option>PCMSO</option><option>LTCAT</option><option>PPP</option><option>Outros</option></select>
        <button onClick={salvar} className="bg-black text-white py-3 rounded-xl font-bold">Salvar Documento</button>
      </div>
      {lista.map((d: any) => <div key={d.id} className="bg-white p-3 rounded-xl mt-2 shadow">{d.titulo} - {d.categoria}</div>)}
    </div>
  );
}