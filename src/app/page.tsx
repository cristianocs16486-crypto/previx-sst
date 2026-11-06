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
        try { const r = await fetch(`/api/${u}`); res[u] = await r.json() } catch { res[u] = [] }
      }
      setDados(res)
    }
    carregar()
  }, [])

  const cards = [
    { titulo: 'Funcionários', valor: dados.funcionarios?.length || 0, sub: 'Cadastrados', icone: '👷', cor: '#3b82f6', aba: 'funcionarios' },
    { titulo: "EPI's", valor: dados.epis?.length || 0, sub: 'Entregues', icone: '🦺', cor: '#f97316', aba: 'epis' },
    { titulo: 'Extintores', valor: dados.extintores?.length || 0, sub: 'Cadastrados', icone: '🧯', cor: '#ef4444', aba: 'extintores' },
    { titulo: 'Inspeções', valor: dados.inspecoes?.length || 0, sub: 'Realizadas', icone: '📋', cor: '#10b981', aba: 'inspecoes' },
    { titulo: 'Documentos', valor: dados.documentos?.length || 0, sub: 'Cadastrados', icone: '📄', cor: '#8b5cf6', aba: 'documentos' },
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
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Arial, sans-serif' }}>
      {/* HEADER */}
      <header style={{ background: '#0f172a', color: 'white', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="PREVIX" style={{ width: 44, height: 44, objectFit: 'contain', background: 'white', borderRadius: 12, padding: 4 }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: 1, lineHeight: 1 }}>PREVIX</div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: '#fb923c', fontWeight: 700 }}>PREVENÇÃO QUE PROTEGE</div>
            </div>
          </div>
          <button style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 20, fontWeight: 700, cursor: 'pointer' }}>Sair</button>
        </div>
        <div style={{ maxWidth: 1200, margin: '12px auto 0', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {menu.map(m => (
            <button key={m.id} onClick={() => setAba(m.id)} style={{ whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: aba === m.id ? 'white' : 'rgba(255,255,255,0.1)', color: aba === m.id ? '#0f172a' : 'white' }}>
              {m.icone} {m.label}
            </button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        {aba === 'inicio' && (
          <>
            <div style={{ background: 'white', borderRadius: 24, padding: 24, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#94a3b8' }}>SUPER ADMIN • VOCÊ ESTÁ VENDO:</div>
                <h2 style={{ fontSize: 32, fontWeight: 900, margin: '8px 0 0' }}>Olá, Cristiano! 👋</h2>
                <p style={{ color: '#64748b' }}>Bem-vindo de volta ao seu painel SST • <b style={{ color: '#1e293b' }}>Sol Nascente Construtora</b></p>
                <span style={{ display: 'inline-block', marginTop: 12, background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Sol Nascente Construtora</span>
              </div>
              <span style={{ background: '#ecfdf5', color: '#047857', padding: '8px 16px', borderRadius: 20, fontSize: 14, fontWeight: 700, height: 'fit-content' }}>✅ PREVIX Completo!</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 20 }}>
              {cards.map(c => (
                <button key={c.titulo} onClick={() => setAba(c.aba)} style={{ background: 'white', borderRadius: 24, padding: 20, textAlign: 'left', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  <div style={{ width: 48, height: 48, background: c.cor, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{c.icone}</div>
                  <div style={{ color: '#64748b', fontSize: 14, marginTop: 16 }}>{c.titulo}</div>
                  <div style={{ fontSize: 36, fontWeight: 900 }}>{c.valor}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.sub}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {aba !== 'inicio' && (
          <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, textTransform: 'capitalize', margin: 0 }}>{aba}</h2>
            <p style={{ color: '#64748b', fontSize: 14 }}>Total: {dados[aba]?.length || 0} registros</p>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(dados[aba] || []).map((item: any, i: number) => (
                <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{item.nome || item.titulo || item.localizacao || item.tipo || 'Registro'}</div>
                    <div style={{ fontSize: 14, color: '#64748b' }}>{item.cargo || item.empresa || item.local || item.capacidade || ''}</div>
                  </div>
                  <span style={{ fontSize: 12, background: '#ecfdf5', color: '#047857', padding: '4px 12px', borderRadius: 20, height: 'fit-content', fontWeight: 700 }}>{item.status || 'OK'}</span>
                </div>
              ))}
              {(!dados[aba] || dados[aba].length === 0) && <p style={{ color: '#94a3b8' }}>Nenhum registro ainda.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}