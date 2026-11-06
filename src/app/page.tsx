'use client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [dados, setDados] = useState<any>({ funcionarios: [], epis: [], extintores: [], inspecoes: [], documentos: [] })
  const [aba, setAba] = useState('inicio')

  useEffect(() => {
    async function carregar() {
      const urls = ['funcionarios', 'epis', 'extintores', 'inspecoes', 'documentos']
      const res: any = {}
      for (const u of urls) {
        try {
          const r = await fetch(`/api/${u}`)
          res[u] = await r.json()
        } catch { res[u] = [] }
      }
      setDados(res)
    }
    carregar()
  }, [])

  const cards = [
    { titulo: 'Funcionários', valor: dados.funcionarios?.length || 0, sub: 'Cadastrados', icone: '👷', cor: 'bg-blue-500', aba: 'funcionarios' },
    { titulo: "EPI's", valor: dados.epis?.length || 0, sub: 'Entregues', icone: '🦺', cor: 'bg-orange-500', aba: 'epis' },
    { titulo: 'Extintores', valor: dados.extintores?.length || 0, sub: 'Cadastrados', icone: '🧯', cor: 'bg-red-500', aba: 'extintores' },
    { titulo: 'Inspeções', valor: dados.inspecoes?.length || 0, sub: 'Realizadas', icone: '📋', cor: 'bg-emerald-500', aba: 'inspecoes' },
    { titulo: 'Documentos', valor: dados.documentos?.length || 0, sub: 'Cadastrados', icone: '📄', cor: 'bg-violet-500', aba: 'documentos' },
  ]

  const menu = [
    { id: 'inicio', label: 'Início', icone: '🏠' },
    { id: 'funcionarios', label: 'Funcionários', icone: '👷' },
    { id: 'epis', label: "EPI's", icone: '🦺' },
    { id: 'extintores', label: 'Extintores', icone: '🧯' },
    { id: 'inspecoes', label: 'Inspeções', icone: '📋' },
    { id: 'documentos', label: 'Documentos', icone: '📄' },
    { id: 'exames', label: 'Exames', icone: '🩺' },
    { id: 'empresas', label: 'Empresas', icone: '🏢' },
  ]

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <header className="bg-[#0f172a] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="PREVIX" style={{ width: 44, height: 44, objectFit: 'contain', background: 'white', borderRadius: 12, padding: 4 }} />
            <div>
              <h1 className="font-black text-xl leading-none tracking-wide">PREVIX</h1>
              <p className="text-[10px] tracking-[0.2em] text-orange-400 font-bold">PREVENÇÃO QUE PROTEGE</p>
            </div>
          </div>
          <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full text-sm font-bold">Sair</button>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
          {menu.map(m => (
            <button key={m.id} onClick={() => setAba(m.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold ${aba === m.id ? 'bg-white text-slate-900' : 'bg-white/10 text-white/80'}`}>
              {m.icone} {m.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {aba === 'inicio' && (
          <>
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border flex flex-col md:flex-row justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-widest text-slate-400">SUPER ADMIN • VOCÊ ESTÁ VENDO:</p>
                <h2 className="text-3xl md:text-4xl font-black mt-2">Olá, Cristiano! 👋</h2>
                <p className="text-slate-500 mt-2">Bem-vindo de volta ao seu painel SST • <b className="text-slate-800">Sol Nascente Construtora</b></p>
                <span className="inline-block mt-4 bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1.5 rounded-full text-xs font-bold">Sol Nascente Construtora</span>
              </div>
              <div className="flex items-start">
                <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold">✅ PREVIX Completo!</span>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
              {cards.map(c => (
                <button key={c.titulo} onClick={() => setAba(c.aba)} className="bg-white rounded-3xl p-5 text-left shadow-sm border hover:shadow-lg">
                  <div className={`w-12 h-12 ${c.cor} rounded-2xl flex items-center justify-center text-2xl`}>{c.icone}</div>
                  <p className="text-slate-500 text-sm mt-4">{c.titulo}</p>
                  <p className="text-4xl font-black mt-1">{c.valor}</p>
                  <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
                </button>
              ))}
            </div>
          </>
        )}
        {aba !== 'inicio' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border">
            <h2 className="text-2xl font-black capitalize">{aba}</h2>
            <p className="text-slate-500 text-sm mt-2">Total: {dados[aba]?.length || 0} registros</p>
            <div className="mt-4 space-y-3">
              {(dados[aba] || []).map((item: any, i: number) => (
                <div key={i} className="border rounded-2xl p-4 flex justify-between">
                  <div>
                    <p className="font-bold">{item.nome || item.titulo || item.localizacao || item.tipo || 'Registro'}</p>
                    <p className="text-sm text-slate-500">{item.cargo || item.empresa || item.local || item.capacidade || ''}</p>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full h-fit font-bold">{item.status || 'OK'}</span>
                </div>
              ))}
              {(!dados[aba] || dados[aba].length === 0) && <p className="text-slate-400">Nenhum registro ainda.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}