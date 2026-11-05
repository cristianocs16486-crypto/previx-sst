import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: "#f1f5f9", fontFamily: "Arial, sans-serif", color: "#0f172a", minHeight: "100vh" }}>
        <header style={{ background: "#0f172a", color: "white", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 16px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 44, height: 44, background: "#f97316", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900 }}>P</div>
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontWeight: 900, letterSpacing: 3, fontSize: 20 }}>PREVIX</div>
                <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1 }}>PREVENÇÃO QUE PROTEGE</div>
              </div>
            </div>
            <nav style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: 14, fontWeight: 600 }}>
              <a href="/" style={{ color: "white", textDecoration: "none", background: "rgba(255,255,255,0.15)", padding: "8px 12px", borderRadius: 8 }}>🏠 Início</a>
              <a href="/funcionarios" style={{ color: "white", textDecoration: "none", padding: "8px 12px" }}>👷 Funcionários</a>
              <a href="/epis" style={{ color: "white", textDecoration: "none", padding: "8px 12px" }}>🦺 EPI's</a>
              <a href="/extintores" style={{ color: "white", textDecoration: "none", padding: "8px 12px" }}>🧯 Extintores</a>
              <a href="/inspecoes" style={{ color: "white", textDecoration: "none", padding: "8px 12px" }}>📋 Inspeções</a>
              <a href="/documentos" style={{ color: "white", textDecoration: "none", padding: "8px 12px" }}>📄 Documentos</a>
              <a href="/exames" style={{ color: "white", textDecoration: "none", padding: "8px 12px" }}>🩺 Exames</a>
            </nav>
            <button style={{ background: "#ef4444", color: "white", border: 0, padding: "9px 16px", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>Sair</button>
          </div>
        </header>
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}