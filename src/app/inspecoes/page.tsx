'use client'
import { useEffect, useState } from 'react'
export default function Inspecoes() {
  const [lista, setLista] = useState<any[]>([])
  const [local, setLocal] = useState('')
  const [tipo, setTipo] = useState('')
  const [data, setData] = useState('')
  const [status, setStatus] = useState('OK')
  const [msg, setMsg] = useState('')
  async function carregar() {
    const r = await fetch('/api/inspecoes', { cache: 'no-store' })
    const d = await r.json().catch(() => [])
    setLista(Array.isArray(d) ? d : [])
  }
  useEffect(() => { carregar() }, [])
  async function salvar(e: any) {
    e.preventDefault()
    setMsg('Salvando...')
    const r = await fetch('/api/inspecoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ local, tipo, data, status }) })
    const d = await r.json().catch(() => ({}))
    if (r.ok) { setMsg('Salvo!'); setLocal(''); setTipo(''); setData(''); carregar() }
    else setMsg('Erro: ' + (d.error || 'não salvou'))
  }
  async function excluir(id: string) {
    if (!confirm('Excluir?')) return
    await fetch('/api/inspecoes?id=' + id, { method: 'DELETE' })
    carregar()
  }
  const input = { padding: 10, borderRadius: 8, border: '1px solid #ddd', width: '100%' } as any
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Inspeções</h1>
      <form onSubmit={salvar} style={{ background: '#f9fafb', padding: 16, borderRadius: 12, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input style={input} value={local} onChange={e => setLocal(e.target.value)} placeholder="Local - ex: Obra Centro" />
        <input style={input} value={tipo} onChange={e => setTipo(e.target.value)} placeholder="Tipo - ex: Andaime" />
        <input style={input} type="date" value={data} onChange={e => setData(e.target.value)} />
        <select style={input} value={status} onChange={e => setStatus(e.target.value)}><option>OK</option><option>Pendente</option><option>Reprovado</option></select>
        <button style={{ background: '#16a34a', color: '#fff', padding: 12, borderRadius: 8, border: 'none', fontWeight: 700 }}>Salvar Inspeção</button>
        {msg && <p style={{ fontSize: 13 }}>{msg}</p>}
      </form>
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lista.map((x: any) => (
          <div key={x.id} style={{ border: '1px solid #eee', padding: 14, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><p style={{ fontWeight: 600, margin: 0 }}>{x.local} - {x.tipo}</p><p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{String(x.data).slice(0, 10)} - {x.status}</p></div>
            <button onClick={() => excluir(x.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 12px', borderRadius: 8 }}>Excluir</button>
          </div>
        ))}
      </div>
    </div>
  )
}