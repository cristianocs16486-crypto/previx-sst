import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

async function criarFuncionario(formData: FormData) {
  "use server";
  await prisma.funcionario.create({
    data: {
      nome: String(formData.get("nome")),
      cpf: String(formData.get("cpf")),
      funcao: String(formData.get("funcao")),
      telefone: String(formData.get("telefone") || ""),
    },
  });
  revalidatePath("/funcionarios");
}

export default async function Funcionarios() {
  const lista = await prisma.funcionario.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>👷 Funcionários</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0" }}>{lista.length} cadastrados • Sol Nascente Construtora</p>
        </div>
        <a href="/" style={{ background: "#0f172a", color: "white", padding: "10px 16px", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>← Voltar</a>
      </div>

      <form action={criarFuncionario} style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        <input name="nome" placeholder="Nome completo *" required style={input} />
        <input name="cpf" placeholder="CPF *" required style={input} />
        <input name="funcao" placeholder="Função / Cargo *" required style={input} />
        <input name="telefone" placeholder="Telefone / WhatsApp" style={input} />
        <button style={{ background: "#f97316", color: "white", border: 0, borderRadius: 10, padding: "12px", fontWeight: 800, cursor: "pointer" }}>+ Cadastrar Funcionário</button>
      </form>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {lista.map((f) => (
          <div key={f.id} style={{ background: "white", borderRadius: 16, padding: 18, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 48, height: 48, background: "#dbeafe", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#1d4ed8" }}>{f.nome.charAt(0)}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{f.nome}</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>{f.funcao}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: "#475569", display: "flex", flexDirection: "column", gap: 4 }}>
              <span>🪪 CPF: <b>{f.cpf}</b></span>
              <span>📞 {f.telefone || "Sem telefone"}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <a href="/epis" style={{ flex: 1, textAlign: "center", background: "#fff7ed", color: "#ea580c", padding: "9px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>🦺 Ver EPI's</a>
              <a href="/exames" style={{ flex: 1, textAlign: "center", background: "#ecfdf5", color: "#047857", padding: "9px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>🩺 Exames</a>
            </div>
          </div>
        ))}
      </div>

      {lista.length === 0 && <p style={{ background: "white", padding: 20, borderRadius: 12, textAlign: "center", color: "#64748b" }}>Nenhum funcionário ainda. Cadastre o primeiro acima 👆</p>}
    </div>
  );
}

const input = { padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" } as const;