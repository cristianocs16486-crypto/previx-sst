export default function Home() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-sm text-slate-500">SUPER ADMIN • Você está vendo:</p>
          <h1 className="text-2xl md:text-3xl font-black">Olá, Cristiano! 👋</h1>
          <p className="text-slate-600">Bem-vindo de volta ao seu painel SST • <b>Sol Nascente Construtora</b></p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">Sol Nascente Construtora</span>
            <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">Obra XYZ Ltda</span>
            <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">Construtora Horizonte</span>
          </div>
        </div>
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-bold">✅ PREVIX Completo!</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { titulo: "Funcionários", valor: "3", sub: "Cadastrados", emoji: "👷", cor: "bg-blue-500" },
          { titulo: "EPI's", valor: "2", sub: "Entregues", emoji: "🦺", cor: "bg-orange-500" },
          { titulo: "Extintores", valor: "2", sub: "Cadastrados", emoji: "🧯", cor: "bg-red-500" },
          { titulo: "Inspeções", valor: "2", sub: "Realizadas", emoji: "📋", cor: "bg-emerald-500" },
          { titulo: "Documentos", valor: "3", sub: "Cadastrados", emoji: "📄", cor: "bg-violet-500" },
        ].map((c) => (
          <div key={c.titulo} className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition">
            <div className={`w-11 h-11 ${c.cor} rounded-xl flex items-center justify-center text-2xl text-white mb-3`}>{c.emoji}</div>
            <p className="text-sm text-slate-500">{c.titulo}</p>
            <p className="text-3xl font-black">{c.valor}</p>
            <p className="text-xs text-slate-400">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border">
        <h2 className="font-bold mb-2">🎉 Todas as abas funcionando</h2>
        <p className="text-slate-600 text-sm">Funcionários, EPI's, Extintores, Inspeções, Documentos e Exames salvando no banco de dados.</p>
      </div>
    </div>
  );
}