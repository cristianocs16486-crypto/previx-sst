import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#f1f5f9] text-slate-900 min-h-screen font-sans">
        <header className="bg-[#0f172a] text-white sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-2xl font-black">P</div>
              <div className="leading-tight">
                <p className="font-black tracking-widest text-lg">PREVIX</p>
                <p className="text-[11px] text-slate-400 tracking-wider">PREVENÇÃO QUE PROTEGE</p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-1 text-sm font-medium">
              <a href="/" className="px-3 py-2 rounded-lg bg-white/10">🏠 Início</a>
              <a href="/funcionarios" className="px-3 py-2 rounded-lg hover:bg-white/10">👷 Funcionários</a>
              <a href="/epis" className="px-3 py-2 rounded-lg hover:bg-white/10">🦺 EPI's</a>
              <a href="/extintores" className="px-3 py-2 rounded-lg hover:bg-white/10">🧯 Extintores</a>
              <a href="/inspecoes" className="px-3 py-2 rounded-lg hover:bg-white/10">📋 Inspeções</a>
              <a href="/documentos" className="px-3 py-2 rounded-lg hover:bg-white/10">📄 Documentos</a>
              <a href="/exames" className="px-3 py-2 rounded-lg hover:bg-white/10">🩺 Exames</a>
            </nav>

            <button className="text-sm bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-bold">Sair</button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}