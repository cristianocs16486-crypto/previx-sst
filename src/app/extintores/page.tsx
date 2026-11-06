'use client'
import { useEffect, useState } from 'react'

export default function Extintores() {
  const [lista, setLista] = useState<any[]>([])
  const [local, setLocal] = useState('')
  const [tipo, setTipo] = useState('PQS')
  const [validade, setValidade] = useState('')
  const [msg, setMsg] = useState('')

  async function carregar() {
    const r = await fetch('/api/extintores', { cache: 'no-store' })
    const d = await r.json()
    setLista(Array.isArray(d) ? d : [])
  }

  useEffect(() => { carregar() }, [])

  async function salvar(e: any) {
    e.preventDefault()
    setMsg('Salvando...')
    const r = await fetch('/api/extintores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ local, tipo, validade })
    })
    if (r.ok) {
      setMsg('Salvo!')
      setLocal('')
      setValidade('')
      carregar()
    } else {
      const err = await r.json().catch(() => ({}))
      setMsg('Erro: ' + (err.error || 'não salvou'))
    }
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este extintor?')) return
    await fetch('/api/extintores?id=' + id, { method: 'DELETE' })
    carregar()
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Extintores</h1>

      <form onSubmit={salvar} style={{ background: '#f9fafb', padding: 16, borderRadius: 12, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Local - ex: Almoxarifado" style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
          <option value="PQS">PQS</option>
          <option value="CO2">CO2</option>
          <option value="AP">AP - Agua Pressurizada</option>
        </select>
        <input type="date" value={validade} onChange={(e) => setValidade(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
        <button type="submit" style={{ background: '#16a34a', color: '#fff', padding: 12, borderRadius: 8, border: 'none', fontWeight: 700 }}>Salvar Extintor</button>
        {msg && <p style={{ fontSize: 13 }}>{msg}</p>}
      </form>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lista.length === 0 && <p style={{ color: '#6b7280' }}>Nenhum extintor cadastrado.</p>}
        {lista.map((x: any) => (
          <div key={x.id} style={{ background: '#fff', border: '1px solid #eee', padding: 14, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 600, margin: 0 }}>{x.localizacao || x.local} <span style={{ color: '#6b7280', fontWeight: 400 }}>- {x.tipo} {x.capacidade ? `(${x.capacidade})` : ''}</span></p>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Validade: {x.vencimento ? new Date(x.vencimento).toLocaleDateString('pt-BR') : x.validade}</p>
            </div>
            <button onClick={() => excluir(x.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 12px', borderRadius: 8 }}>Excluir</button>
          </div>
        ))}
      </div>
    </div>
  )
}