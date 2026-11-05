'use client'
import { useEffect, useState } from 'react'

export default function EPIsPage() {
  const [funcionarios, setFuncionarios] = useState<any[]>([])
  const [epis, setEpis] = useState<any[]>([])
  const [formFunc, setFormFunc] = useState({nome:'', funcao:''})
  const [formEPI, setFormEPI] = useState({funcionarioId:'', epiNome:'', ca:''})

  async function carregar() {
    const f = await fetch('/api/funcionarios').then(r=>r.json())
    const e = await fetch('/api/epis').then(r=>r.json())
    setFuncionarios(f); setEpis(e)
    if(f[0] && !formEPI.funcionarioId) setFormEPI(prev=>({...prev, funcionarioId:f[0].id}))
  }
  useEffect(()=>{carregar()},[])

  async function addFunc() {
    await fetch('/api/funcionarios', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(formFunc)})
    setFormFunc({nome:'', funcao:''}); carregar()
  }
  async function addEPI() {
    await fetch('/api/epis', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(formEPI)})
    setFormEPI({...formEPI, epiNome:'', ca:''}); carregar()
  }

  return (
    <div style={{padding:24, maxWidth:1100, margin:'0 auto', fontFamily:'sans-serif'}}>
      <h1 style={{fontSize:24, fontWeight:900}}>NR-06 - Controle de EPI - Previx SST</h1>
      <p style={{color:'#6b7280'}}>Entrega de EPI com CA - Obrigatorio MTE</p>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:20}}>
        <div style={{border:'1px solid #e5e7eb', padding:16, borderRadius:12}}>
          <h3 style={{fontWeight:800}}>1. Cadastrar Funcionário Norte Vidros</h3>
          <input placeholder="Nome" value={formFunc.nome} onChange={e=>setFormFunc({...formFunc, nome:e.target.value})} style={{width:'100%', padding:10, marginTop:8, borderRadius:8, border:'1px solid #ccc'}} />
          <input placeholder="Função - ex: Vidraceiro" value={formFunc.funcao} onChange={e=>setFormFunc({...formFunc, funcao:e.target.value})} style={{width:'100%', padding:10, marginTop:8, borderRadius:8, border:'1px solid #ccc'}} />
          <button onClick={addFunc} style={{marginTop:10, padding:'10px', background:'#16a34a', color:'white', border:'none', borderRadius:8, width:'100%', fontWeight:700}}>Adicionar Funcionário</button>
          <div style={{marginTop:12}}>{funcionarios.map((f:any)=><div key={f.id} style={{padding:6, borderBottom:'1px solid #eee'}}>{f.nome} - {f.funcao} - {f.epis.length} EPIs</div>)}</div>
        </div>

        <div style={{border:'1px solid #e5e7eb', padding:16, borderRadius:12}}>
          <h3 style={{fontWeight:800}}>2. Registrar Entrega de EPI</h3>
          <select value={formEPI.funcionarioId} onChange={e=>setFormEPI({...formEPI, funcionarioId:e.target.value})} style={{width:'100%', padding:10, marginTop:8, borderRadius:8, border:'1px solid #ccc'}}>
            {funcionarios.map((f:any)=><option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          <input placeholder="EPI - ex: Óculos de Segurança" value={formEPI.epiNome} onChange={e=>setFormEPI({...formEPI, epiNome:e.target.value})} style={{width:'100%', padding:10, marginTop:8, borderRadius:8, border:'1px solid #ccc'}} />
          <input placeholder="CA - ex: 12345" value={formEPI.ca} onChange={e=>setFormEPI({...formEPI, ca:e.target.value})} style={{width:'100%', padding:10, marginTop:8, borderRadius:8, border:'1px solid #ccc'}} />
          <button onClick={addEPI} style={{marginTop:10, padding:'10px', background:'#dc2626', color:'white', border:'none', borderRadius:8, width:'100%', fontWeight:700}}>Registrar Entrega</button>
        </div>
      </div>

      <div style={{marginTop:24}}>
        <h3 style={{fontWeight:800}}>Histórico de Entregas - Para Auditoria MTE</h3>
        <table style={{width:'100%', marginTop:10, borderCollapse:'collapse'}}>
          <thead><tr style={{background:'#f3f4f6', textAlign:'left'}}><th style={{padding:8}}>Data</th><th style={{padding:8}}>Funcionário</th><th style={{padding:8}}>EPI</th><th style={{padding:8}}>CA</th></tr></thead>
          <tbody>{epis.map((e:any)=><tr key={e.id} style={{borderBottom:'1px solid #eee'}}><td style={{padding:8}}>{new Date(e.dataEntrega).toLocaleDateString('pt-BR')}</td><td style={{padding:8}}>{e.funcionario?.nome}</td><td style={{padding:8}}>{e.epiNome}</td><td style={{padding:8}}>{e.ca}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}