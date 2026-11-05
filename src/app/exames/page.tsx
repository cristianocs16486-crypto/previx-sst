"use client";
import { useEffect, useState } from "react";

export default function Exames() {
  const [exames, setExames] = useState<any[]>([]);
  const [funcionario, setFuncionario] = useState("");
  const [tipo, setTipo] = useState("Periódico");
  const [resultado, setResultado] = useState("Apto");

  async function carregar() {
    const r = await fetch("/api/exames");
    const dados = await r.json();
    setExames(dados);
  }

  useEffect(() => { carregar(); }, []);

  async function salvar(e: any) {
    e.preventDefault();
    await fetch("/api/exames", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ funcionario, tipo, resultado })
    });
    setFuncionario("");
    carregar();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este exame?")) return;
    await fetch(`/api/exames?id=${id}`, { method: "DELETE" });
    carregar();
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Exames Ocupacionais</h1>

      <form onSubmit={salvar} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input placeholder="Nome do funcionário" value={funcionario} onChange={e => setFuncionario(e.target.value)} required style={{ padding: 8, flex: 1 }} />
        <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ padding: 8 }}>
          <option>Admissional</option>
          <option>Periódico</option>
          <option>Demissional</option>
          <option>Retorno ao Trabalho</option>
        </select>
        <select value={resultado} onChange={e => setResultado(e.target.value)} style={{ padding: 8 }}>
          <option>Apto</option>
          <option>Inapto</option>
        </select>
        <button style={{ padding: "8px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6 }}>Salvar</button>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Funcionário</th><th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Tipo</th><th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Resultado</th><th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Data</th><th></th></tr></thead>
        <tbody>
          {exames.map((ex: any) => (
            <tr key={ex.id}>
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{ex.funcionario}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{ex.tipo}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{ex.resultado}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{new Date(ex.data).toLocaleDateString("pt-BR")}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                <button onClick={() => excluir(ex.id)} style={{ padding: "5px 12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {exames.length === 0 && <p>Nenhum exame ainda.</p>}
    </div>
  );
}