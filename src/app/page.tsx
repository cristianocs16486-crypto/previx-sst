'use client'
import { useEffect, useState } from 'react'

const CAMPOS: any = {
  funcionarios: [{k:'nome',l:'Nome'},{k:'cargo',l:'Cargo'},{k:'empresa',l:'Empresa'},{k:'cpf',l:'CPF'},{k:'telefone',l:'Telefone'}],
  epis: [{k:'nome',l:'Nome do EPI'},{k:'tipo',l:'Tipo'},{k:'quantidade',l:'Quantidade'},{k:'funcionario',l:'Funcionário'},{k:'data_entrega',l:'Data Entrega'}],
  extintores: [{k:'localizacao',l:'Localização'},{k:'tipo',l:'Tipo'},{k:'capacidade',l:'Capacidade'},{k:'vencimento',l:'Vencimento'},{k:'status',l:'Status'}],
  inspecoes: [{k:'titulo',l:'Título'},{k:'local',l:'Local'},{k:'responsavel',l:'Responsável'},{k:'data',l:'Data'},{k:'status',l:'Status'}],
  documentos: [{k:'titulo',l:'Título'},{k:'tipo',l:'Tipo'},{k:'empresa',l:'Empresa'},{k:'vencimento',l:'Vencimento'}],
  exames: [{k:'nome',l:'Funcionário'},{k:'tipo',l:'Tipo Exame'},{k:'data',l:'Data'},{k:'resultado',l:'Resultado'},{k:'clinica',l:'Clínica'}],
  empresas: [{k:'nome',l:'Nome da Empresa'},{k:'cnpj',l:'CNPJ'},{k:'responsavel',l:'Responsável'},{k:'telefone',l:'Telefone'}],
}

export default function Home() {
  const [dados, setDados] = useState<any>({ funcionarios: [], epis: [], extintores: [], inspecoes: [], documentos: [], exames: [], empresas: [] })
  const [aba, setAba] = useState('inicio')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [busca, setBusca] = useState('')

  useEffect(() => { carregar() }, [])
  async function carregar() {
    const urls = ['funcionarios','epis','extintores','inspecoes','documentos','exames','empresas']
    const res: any = {}
    for (const u of urls) {
      try { const r = await fetch(`/api/${u}`); const j = await r.json(); res[u] = Array.isArray(j) ? j : j.data || [] } catch { res[u] = [] }
    }
    setDados(res)
  }

  function abrirNovo() { setEditando(null); setForm({}); setModal(true) }
  function abrirEditar(item:any) { setEditando(item); setForm(item); setModal(true) }

  async function salvar() {
    if (!aba || aba==='inicio') return
    const lista = [...(dados[aba]||[])]
    if (editando) {
      const id = editando.id || editando._id
      try { await fetch(`/api/${aba}/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) }) } catch {}
      const idx = lista.findIndex((x:any)=>(x.id||x._id)===id)
      if (idx>=0) lista[idx] = {...lista[idx], ...form}
      setDados({...dados, [aba]: lista})
    } else {
      const novo = { ...form, id: Date.now().toString(), status: form.status || 'OK' }
      try {
        const r = await fetch(`/api/${aba}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(novo) })
        const j = await r.json().catch(()=>null)
        if (j && (j.id || j._id || j.data)) lista.push(j.data || j)
        else lista.push(novo)
      } catch { lista.push(novo) }
      setDados({...dados, [aba]: lista})
    }
    setModal(false); setForm({}); setEditando(null)
  }

  async function excluir(item:any) {
    if (!confirm(`Excluir ${item.nome || item.titulo || 'esse registro'}?`)) return
    const id = item.id || item._id
    try { await fetch(`/api/${aba}/${id}`, { method:'DELETE' }) } catch {}
    setDados({...dados, [aba]: (dados[aba]||[]).filter((x:any)=>(x.id||x._id)!==id)})
  }

  const cards = [
    { titulo:'Funcionários', valor:dados.funcionarios?.length||0, sub:'Cadastrados', icone:'👷', cor:'#3b82f6', aba:'funcionarios' },
    { titulo:"EPI's", valor:dados.epis?.length||0, sub:'Entregues', icone:'🦺', cor:'#f97316', aba:'epis' },
    { titulo:'Extintores', valor:dados.extintores?.length||0, sub:'Cadastrados', icone:'🧯', cor:'#ef4444', aba:'extintores' },
    { titulo:'Inspeções', valor:dados.inspecoes?.length||0, sub:'Realizadas', icone:'📋', cor:'#10b981', aba:'inspecoes' },
    { titulo:'Documentos', valor:dados.documentos?.length||0, sub:'Cadastrados', icone:'📄', cor:'#8b5cf6', aba:'documentos' },
  ]
  const menu = [
    {id:'inicio',label:'Início',icone:'🏠'},
    {id:'funcionarios',label:'Funcionários',icone:'👷'},
    {id:'epis',label:"EPI's",icone:'🦺'},
    {id:'extintores',label:'Extintores',icone:'🧯'},
    {id:'inspecoes',label:'Inspeções',icone:'📋'},
    {id:'documentos',label:'Documentos',icone:'📄'},
    {id:'exames',label:'Exames',icone:'🩺'},
    {id:'empresas',label:'Empresas',icone:'🏢'},
  ]

  const listaFiltrada = (dados[aba]||[]).filter((it:any)=> JSON.stringify(it).toLowerCase().includes(busca.toLowerCase()))

  const btn = { padding:'8px 14px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:700, fontSize:13 } as any
  const input = { width:'100%', padding:'12px', borderRadius:12, border:'1px solid #e2e8f0', fontSize:14, boxSizing:'border-box' as any }

  return (
    <div style={{minHeight:'100vh', background:'#f1f5f9', fontFamily:'Arial, sans-serif'}}>
      <header style={{background:'#0f172a', color:'white', padding:'12px 16px', position:'sticky', top:0, zIndex:50}}>
        <div style={{maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <img src="/logo.png" alt="PREVIX" style={{width:44,height:44,objectFit:'contain',background:'white',borderRadius:12,padding:4}} />
            <div><div style={{fontWeight:900,fontSize:20,letterSpacing:1,lineHeight:1}}>PREVIX</div><div style={{fontSize:10,letterSpacing:2,color:'#fb923c',fontWeight:700}}>PREVENÇÃO QUE PROTEGE</div></div>
          </div>
          <button style={{...btn, background:'#ef4444', color:'white', borderRadius:20}}>Sair</button>
        </div>
        <div style={{maxWidth:1200, margin:'12px auto 0', display:'flex', gap:8, overflowX:'auto', paddingBottom:4}}>
          {menu.map(m=>(
            <button key={m.id} onClick={()=>{setAba(m.id); setBusca('')}} style={{whiteSpace:'nowrap', padding:'8px 16px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:600, fontSize:14, background: aba===m.id?'white':'rgba(255,255,255,0.1)', color: aba===m.id?'#0f172a':'white'}}>{m.icone} {m.label}</button>
          ))}
        </div>
      </header>

      <main style={{maxWidth:1200, margin:'0 auto', padding:16}}>
        {aba==='inicio' && (
          <>
            <div style={{background:'white', borderRadius:24, padding:24, display:'flex', justifyContent:'space-between', gap:16, flexWrap:'wrap', border:'1px solid #e2e8f0'}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:'#94a3b8'}}>SUPER ADMIN • VOCÊ ESTÁ VENDO:</div>
                <h2 style={{fontSize:32,fontWeight:900,margin:'8px 0 0'}}>Olá, Cristiano! 👋</h2>
                <p style={{color:'#64748b'}}>Bem-vindo de volta ao seu painel SST • <b style={{color:'#1e293b'}}>Sol Nascente Construtora</b></p>
                <span style={{display:'inline-block',marginTop:12,background:'#fff7ed',color:'#c2410c',border:'1px solid #ffedd5',padding:'6px 12px',borderRadius:20,fontSize:12,fontWeight:700}}>Sol Nascente Construtora</span>
              </div>
              <span style={{background:'#ecfdf5',color:'#047857',padding:'8px 16px',borderRadius:20,fontSize:14,fontWeight:700,height:'fit-content'}}>✅ PREVIX Completo!</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:16,marginTop:20}}>
              {cards.map(c=>(
                <button key={c.titulo} onClick={()=>setAba(c.aba)} style={{background:'white',borderRadius:24,padding:20,textAlign:'left',border:'1px solid #e2e8f0',cursor:'pointer'}}>
                  <div style={{width:48,height:48,background:c.cor,borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{c.icone}</div>
                  <div style={{color:'#64748b',fontSize:14,marginTop:16}}>{c.titulo}</div>
                  <div style={{fontSize:36,fontWeight:900}}>{c.valor}</div>
                  <div style={{fontSize:12,color:'#94a3b8'}}>{c.sub}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {aba!=='inicio' && (
          <div style={{background:'white',borderRadius:24,padding:24,border:'1px solid #e2e8f0'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
              <div>
                <h2 style={{fontSize:24,fontWeight:900,textTransform:'capitalize',margin:0}}>{aba}</h2>
                <p style={{color:'#64748b',fontSize:14,margin:'4px 0 0'}}>Total: {listaFiltrada.length} registros</p>
              </div>
              <button onClick={abrirNovo} style={{...btn, background:'#0f172a', color:'white', padding:'12px 20px', borderRadius:20, fontSize:14}}>＋ Adicionar</button>
            </div>

            <input placeholder={`🔍 Buscar em ${aba}...`} value={busca} onChange={e=>setBusca(e.target.value)} style={{...input, marginTop:16}} />

            <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:12}}>
              {listaFiltrada.map((item:any,i:number)=>(
                <div key={item.id||item._id||i} style={{border:'1px solid #e2e8f0',borderRadius:16,padding:16,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                  <div style={{flex:1, minWidth:200}}>
                    <div style={{fontWeight:800, fontSize:16}}>{item.nome || item.titulo || item.localizacao || 'Registro'}</div>
                    <div style={{fontSize:13,color:'#64748b', marginTop:2}}>
                      {CAMPOS[aba]?.slice(1,4).map((c:any)=> item[c.k] ? `${c.l}: ${item[c.k]} • ` : '').join('')}
                    </div>
                    <span style={{display:'inline-block',marginTop:6,fontSize:11,background:'#ecfdf5',color:'#047857',padding:'3px 10px',borderRadius:20,fontWeight:700}}>{item.status || item.resultado || 'OK'}</span>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>abrirEditar(item)} style={{...btn, background:'#dbeafe', color:'#1e40af'}}>✏️ Editar</button>
                    <button onClick={()=>excluir(item)} style={{...btn, background:'#fee2e2', color:'#b91c1c'}}>🗑️ Excluir</button>
                  </div>
                </div>
              ))}
              {listaFiltrada.length===0 && <p style={{color:'#94a3b8', textAlign:'center', padding:20}}>Nenhum registro. Clica em <b>＋ Adicionar</b> pra criar o primeiro!</p>}
            </div>
          </div>
        )}
      </main>

      {modal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16}}>
          <div style={{background:'white', borderRadius:24, padding:24, width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto'}}>
            <h3 style={{margin:'0 0 16px', fontSize:20, fontWeight:900}}>{editando ? '✏️ Editar' : '＋ Adicionar'} - {aba}</h3>
            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              {(CAMPOS[aba]||[]).map((c:any)=>(
                <div key={c.k}>
                  <label style={{fontSize:13, fontWeight:700, color:'#334155'}}>{c.l}</label>
                  <input value={form[c.k]||''} onChange={e=>setForm({...form, [c.k]: e.target.value})} placeholder={c.l} style={{...input, marginTop:4}} />
                </div>
              ))}
            </div>
            <div style={{display:'flex', gap:10, marginTop:20}}>
              <button onClick={()=>setModal(false)} style={{...btn, flex:1, background:'#f1f5f9', padding:12}}>Cancelar</button>
              <button onClick={salvar} style={{...btn, flex:1, background:'#0f172a', color:'white', padding:12}}>💾 Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}