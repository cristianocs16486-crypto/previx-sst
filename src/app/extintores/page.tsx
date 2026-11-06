'use client'
import { useEffect, useState } from 'react'

export default function Extintores() {
  const [lista, setLista] = useState<any[]>([])
  const [local, setLocal] = useState('')
  const [tipo, setTipo] = useState('PQS')
  const [capacidade, setCapacidade] = useState('6kg')
  const [validade, setValidade] = useState('')

  async function carregar() {
    const r = await fetch('/api/extintores', { cache: 'no-store' })
    const d = await r.json()
    setLista(Array.isArray(d) ? d : [])
  }

  useEffect(() => { carregar() }, [])

  async function salvar(e: any) {
    e.preventDefault()
    if (!local || !validade) return alert('Preencha local e validade')
    const r = await fetch('/api/extintores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ local, localizacao: local, tipo, capacidade, validade, vencimento: validade, numero: '1' })
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      return alert('Erro ao salvar: ' + (err.error || r.status))
    }
    setLocal('')
    setValidade('')
    carregar()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este extintor?')) return
    await fetch(`/api/extintores?id=${id}`, { method: 'DELETE' })
    carregar()
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 22 }}>Extintores</h1>

      <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#f3f4f6', padding: 16, borderRadius: 8 }}>
        <input value={local} onChange={e => setLocal(e.target.value)} placeholder="Local - ex: Almoxarifado" style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}>
            <option value="PQS">PQS</option>
            <option value="CO2">CO2</option>
            <option value="Água">Água</option>
            <option value="Espuma">Espuma</option>
          </select>
          <select value={capacidade} onChange={e => setCapacidade(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}>
            <option value="4kg">4kg</option>
            <option value="6kg">6kg</option>
            <option value="8kg">8kg</option>
            <option value="10kg">10kg</option>
            <option value="10L">10L</option>
          </select>
        </div>
        <input type="date" value={validade} onChange={e => setValidade(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }} />
        <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 0, padding: 12, borderRadius: 6, fontWeight: 700 }}>Salvar Extintor</button>
      </form>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lista.map((x: any) => (
          <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb', padding: 12, borderRadius: 8 }}>
            <div>
              <p style={{ fontWeight: 600, margin: 0 }}>{x.localizacao || x.local} <span style={{ color: '#6b7280', fontWeight: 400 }}>- {x.tipo} {x.capacidade ? `(${x.capacidade})` : ''}</span></p>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Validade: {x.vencimento ? new Date(x.vencimento).toLocaleDateString('pt-BR') : x.validade}</p>
            </div>
            <button onClick={() => excluir(x.id)} style={{ background: '#ef4444', color: '#fff', border: 0, padding: '6px 10px', borderRadius: 6 }}>Excluir</button>
          </div>
        ))}
        {lista.length === 0 && <p style={{ color: '#6b7280' }}>Nenhum extintor cadastrado ainda.</p>}
      </div>
    </div>
  )
}