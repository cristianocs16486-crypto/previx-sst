'use client'
import { useEffect, useState } from 'react'

export default function Empresas() {
  const [lista, setLista] = useState<any[]>([])
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [msg, setMsg] = useState('')

  async function carregar() {
    const r = await fetch('/api/empresas', { cache: 'no-store' })
    const d = await r.json().catch(() => [])
    setLista(Array.isArray(d) ? d : [])
  }
  useEffect(() => { carregar() }, [])

  async function salvar() {
    if (!nome || !email || !senha) { setMsg('Preencha nome, e-mail e senha'); return }
    const r = await fetch('/api/empresas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, cnpj, email, senha })
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) { setMsg(j.error || 'Erro ao salvar'); return }
    setMsg('Empresa salva!')
    setNome(''); setCnpj(''); setEmail(''); setSenha('')
    carregar()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta empresa?')) return
    await fetch('/api/empresas?id=' + id, { method: 'DELETE' })
    carregar()
  }

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Empresas Clientes</h1>
      <div className="bg-white rounded-xl p-5 shadow space-y-3">
        <h2 className="font-bold">Cadastrar empresa cliente</h2>
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome da empresa *" className="w-full border p-3 rounded" />
        <input value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="CNPJ" className="w-full border p-3 rounded" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail de login *" className="w-full border p-3 rounded" />
        <input value={senha} onChange={e => setSenha(e.target.value)} type="password" placeholder="Senha *" className="w-full border p-3 rounded" />
        <button onClick={salvar} className="bg-blue-600 text-white p-3 rounded font-bold w-full">Salvar empresa</button>
        {msg && <p className="text-sm">{msg}</p>}
      </div>
      <div className="bg-white rounded-xl p-5 shadow">
        <h2 className="font-bold mb-3">Empresas cadastradas</h2>
        <div className="space-y-2">
          {lista.map((e: any) => (
            <div key={e.id} className="flex justify-between border p-3 rounded">
              <div><b>{e.nome}</b><br /><span className="text-sm text-slate-500">{e.email} {e.cnpj ? '• ' + e.cnpj : ''}</span></div>
              <button onClick={() => excluir(e.id)} className="text-red-600 font-bold">Excluir</button>
            </div>
          ))}
          {lista.length === 0 && <p className="text-slate-500">Nenhuma empresa ainda.</p>}
        </div>
      </div>
    </main>
  )
}
