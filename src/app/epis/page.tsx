'use client'
import { useEffect, useState } from 'react'
export default function Epis() {
  const [lista, setLista] = useState<any[]>([])
  const [funcs, setFuncs] = useState<any[]>([])
  const [funcionarioId, setFuncionarioId] = useState('')
  const [nomeEpi, setNomeEpi] = useState('')
  const [ca, setCa] = useState('')
  const [data, setData] = useState('')
  const [msg, setMsg] = useState('')
  async function carregar() {
    const r = await fetch('/api/epis', { cache: 'no-store' })
    const d = await r.json().catch(() => [])
    setLista(Array.isArray(d) ? d : [])
    const rf = await fetch('/api/funcionarios', { cache: 'no-store' })
    const df = await rf.json().catch(() => [])
    setFuncs(Array.isArray(df) ? df : [])
  }
  useEffect(() => { carregar() }, [])
  async function salvar(e: any) {
    e.preventDefault()
    setMsg('Salvando...')
    const func = funcs.find((f: any) => f.id === funcionarioId)
    const r = await fetch('/api/epis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ funcionarioId, funcionarioNome: func?.nome || '', nomeEpi, ca, data }) })
    const d = await r.json().catch(() => ({}))
    if (r.ok) { setMsg('Salvo!'); setNomeEpi(''); setCa(''); setData(''); carregar() }
    else setMsg('Erro: ' + (d.error || 'não salvou'))
  }
  async function excluir(id: string) {
    if (!confirm('Excluir?')) return
    await fetch('/api/epis?id=' + id, { method: 'DELETE' })
    carregar()
  }
  const input = { padding: 10, borderRadius: 8, border: '1px solid #ddd', width: '100%' } as any
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>EPI&apos;s</h1>
      <form onSubmit={salvar} style={{ background: '#f9fafb', padding: 16, borderRadius: 12, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <select style={input} value={funcionarioId} onChange={e => setFuncionarioId(e.target.value)}>
          <option value="">Selecione o funcionário</option>
          {funcs.map((f: any) => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
        <input style={input} value={nomeEpi} onChange={e => setNomeEpi(e.target.value)} placeholder="Nome do EPI - ex: Capacete" />
        <input style={input} value={ca} onChange={e => setCa(e.target.value)} placeholder="CA" />
        <input style={input} type="date" value={data} onChange={e => setData(e.target.value)} />
        <button style={{ background: '#16a34a', color: '#fff', padding: 12, borderRadius: 8, border: 'none', fontWeight: 700 }}>Salvar EPI</button>
        {msg && <p style={{ fontSize: 13 }}>{msg}</p>}
      </form>
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lista.map((x: any) => (
          <div key={x.id} style={{ border: '1px solid #eee', padding: 14, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><p style={{ fontWeight: 600, margin: 0 }}>{x.nomeEpi} - CA: {x.ca}</p><p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{x.funcionarioNome || x.funcionario?.nome || ''} - {x.data}</p></div>
            <button onClick={() => excluir(x.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 12px', borderRadius: 8 }}>Excluir</button>
          </div>
        ))}
      </div>
    </div>
  )
}