const cards = [
  { titulo: "Funcionários", valor: "3", sub: "Cadastrados", emoji: "👷", cor: "#3b82f6" },
  { titulo: "EPI's", valor: "2", sub: "Entregues", emoji: "🦺", cor: "#f97316" },
  { titulo: "Extintores", valor: "2", sub: "Cadastrados", emoji: "🧯", cor: "#ef4444" },
  { titulo: "Inspeções", valor: "2", sub: "Realizadas", emoji: "📋", cor: "#10b981" },
  { titulo: "Documentos", valor: "3", sub: "Cadastrados", emoji: "📄", cor: "#8b5cf6" },
];

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "white", borderRadius: 16, padding: 24, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
        <div>
          <div style={{ fontSize: 13, color: "#64748b" }}>SUPER ADMIN • Você está vendo:</div>
          <h1 style={{ fontSize: 30, margin: "6px 0", fontWeight: 900 }}>Olá, Cristiano! 👋</h1>
          <p style={{ color: "#475569", margin: 0 }}>Bem-vindo de volta ao seu painel SST • <b>Sol Nascente Construtora</b></p>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {["Sol Nascente Construtora", "Obra XYZ Ltda", "Construtora Horizonte"].map((e) => (
              <span key={e} style={{ fontSize: 12, background: "#f1f5f9", padding: "6px 12px", borderRadius: 999 }}>{e}</span>
            ))}
          </div>
        </div>
        <div style={{ background: "#ecfdf5", color: "#047857", padding: "10px 16px", borderRadius: 12, fontWeight: 800, height: "fit-content" }}>✅ PREVIX Completo!</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {cards.map((c) => (
          <div key={c.titulo} style={{ background: "white", borderRadius: 16, padding: 18, border: "1px solid #e2e8f0" }}>
            <div style={{ width: 44, height: 44, background: c.cor, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 10 }}>{c.emoji}</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>{c.titulo}</div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>{c.valor}</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0" }}>
        <b>🎉 Todas as abas funcionando</b>
        <p style={{ color: "#475569", fontSize: 14, margin: "6px 0 0" }}>Funcionários, EPI's, Extintores, Inspeções, Documentos e Exames salvando no banco de dados.</p>
      </div>
    </div>
  );
}