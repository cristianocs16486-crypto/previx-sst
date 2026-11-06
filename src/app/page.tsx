'use client'
import { useEffect, useState } from 'react'

const CAMPOS: any = {
  funcionarios: [{k:'nome',l:'Nome'},{k:'cargo',l:'Cargo'},{k:'empresa',l:'Empresa'},{k:'cpf',l:'CPF'},{k:'telefone',l:'Telefone'}],
  epis: [{k:'nome',l:'Nome do EPI'},{k:'tipo',l:'Tipo'},{k:'quantidade',l:'Quantidade'},{k:'funcionario',l:'Funcionário'},{k:'data_entrega',l:'Data Entrega'}],
  extintores: [{k:'localizacao',l:'Localização'},{k:'tipo',l:'Tipo'},{k:'capacidade',l:'Capacidade'},{k:'vencimento',l:'Vencimento'},{k:'status',l:'Status'}],
  inspecoes: [{k:'titulo',l:'Título'},{k:'local',l:'Local'},{k:'responsavel',l:'Responsável'},{k:'data',l:'Data'},{k:'status',l:'Status'}],
  documentos: [{k:'titulo',l:'Título'},{k:'tipo',l:'Tipo'},{k:'empresa',l:'Empresa'},{k:'vencimento',l:'Vencimento'}],
  exames: [{k:'nome',l:'Funcionário'},{k:'tipo',l:'Tipo Exame'},{k:'data',l:'Data'},{k:'resultado',l:'Resultado'},{k:'clinica',l:'Clínica'}],
  empresas: [{k:'nome',l:'Nome da Empresa'},{k:'cnpj',l:'CNPJ'},{k:'responsavel',l:'Responsável'},{k:'telefone',l:'Telefone'},{k:'email',l:'E-mail da Empresa'},{k:'login',l:'Login de Acesso'},{k:'senha',l:'Senha Única'}],
}

function gerarSenhaForte() {
  const letras = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
  const nums = '23456789'
  const simb = '@!#'
  let s = ''
  for(let i=0;i<4;i++) s += letras[Math.floor(Math.random()*letras.length)]
  for(let i=0;i<3;i++) s += nums[Math.floor(Math.random()*nums.length)]
  s += simb[Math.floor(Math.random()*simb.length)]
  return 'Previx' + s
}

export default function Home() {
  const [dados, setDados] = useState<any>({ funcionarios: [], epis: [], extintores: [], inspecoes: [], documentos: [], exames: [], empresas: [] })
  const [aba, setAba] = useState('inicio')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [busca, setBusca] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [senhaCopiada, setSenhaCopiada] = useState('')

  useEffect(() => { carregar() }, [])
  async function carregar() {
    const urls = ['funcionarios','epis','extintores','inspecoes','documentos','exames','empresas']
    const res: any = {}
    for (const u of urls) {
      try { const r = await fetch(`/api/${u}`); const j = await r.json(); res[u] = Array.isArray(j) ? j : j.data || [] } catch { res[u] = [] }
    }
    // se não tem API de empresas, pega do navegador
    if (!res.empresas?.length) {
      try { const local = JSON.parse(localStorage.getItem('previx_empresas')||'[]'); if(local.length) res.empresas = local } catch {}
    }
    setDados(res)
  }

  function abrirNovo() {
    setEditando(null)
    if (aba === 'empresas') {
      const senha = gerarSenhaForte()
      setForm({ senha, status: 'Ativa', plano: 'Mensal' })
    } else setForm({})
    setVerSenha(false); setModal(true)
  }
  function abrirEditar(item:any) { setEditando(item); setForm(item); setVerSenha(false); setModal(true) }

  function copiar(texto:string, id:string) {
    navigator.clipboard.writeText(texto)
    setSenhaCopiada(id)
    setTimeout(()=>setSenhaCopiada(''), 2000)
  }

  async function salvar() {
    if (!aba || aba==='inicio') return
    // gera login automatico se for empresa e não tiver
    let formFinal = {...form}
    if (aba==='empresas') {
      if (!formFinal.login && formFinal.nome) {
        formFinal.login = formFinal.nome.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,12)
      }
      if (!formFinal.senha) formFinal.senha = gerarSenhaForte()
      if (!formFinal.email) formFinal.email = ''
    }
    const lista = [...(dados[aba]||[])]
    if (editando) {
      const id = editando.id || editando._id
      try { await fetch(`/api/${aba}/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(formFinal) }) } catch {}
      const idx = lista.findIndex((x:any)=>(x.id||x._id)===id)
      if (idx>=0) lista[idx] = {...lista[idx], ...formFinal}
      setDados({...dados, [aba]: lista})
      if (aba==='empresas') localStorage.setItem('previx_empresas', JSON.stringify(lista))
    } else {
      const novo = { ...formFinal, id: Date.now().toString(), status: formFinal.status || 'Ativa' }
      try {
        const r = await fetch(`/api/${aba}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(novo) })
        const j = await r.json().catch(()=>null)
        if (j && (j.id || j._id || j.data)) lista.push(j.data || j)
        else lista.push(novo)
      } catch { lista.push(novo) }
      setDados({...dados, [aba]: lista})
      if (aba==='empresas') localStorage.setItem('previx_empresas', JSON.stringify(lista))
      if (aba==='empresas') {
        alert(`✅ Empresa criada!\n\nLogin: ${novo.login}\nSenha: ${novo.senha}\n\nManda isso pra empresa!`)
      }
    }
    setModal(false); setForm({}); setEditando(null)
  }

  async function excluir(item:any) {
    if (!confirm(`Excluir ${item.nome || item.titulo || 'esse registro'}?`)) return
    const id = item.id || item._id
    try { await fetch(`/api/${aba}/${id}`, { method:'DELETE' }) } catch {}
    const novaLista = (dados[aba]||[]).filter((x:any)=>(x.id||x._id)!==id)
    setDados({...dados, [aba]: novaLista})
    if (aba==='empresas') localStorage.setItem('previx_empresas', JSON.stringify(novaLista))
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
            <div style={{background:'white',borderRadius:24,padding:20,border:'1px solid #e2e8f0',marginTop:20}}>
              <h3 style={{margin:'0 0 12px',fontWeight:900}}>🏢 Empresas com acesso</h3>
              {(dados.empresas||[]).slice(0,5).map((e:any)=>(
                <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderTop:'1px solid #f1f5f9',flexWrap:'wrap',gap:8}}>
                  <span style={{fontWeight:700}}>{e.nome} <span style={{fontWeight:400,color:'#64748b',fontSize:13}}>• {e.login}</span></span>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <code style={{background:'#f1f5f9',padding:'6px 10px',borderRadius:8,fontSize:13}}>Senha: {e.senha}</code>
                    <button onClick={()=>copiar(e.senha, e.id)} style={{...btn, background:'#0f172a',color:'white'}}>{senhaCopiada===e.id ? '✅ Copiado!' : '📋 Copiar'}</button>
                  </div>
                </div>
              ))}
              {(!dados.empresas||dados.empresas.length===0) && <p style={{color:'#94a3b8'}}>Nenhuma empresa ainda. Vai em Empresas → Adicionar.</p>}
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
                  <div style={{flex:1, minWidth:220}}>
                    <div style={{fontWeight:800, fontSize:16}}>{item.nome || item.titulo || item.localizacao || 'Registro'}</div>
                    <div style={{fontSize:13,color:'#64748b', marginTop:2}}>
                      {aba==='empresas' ? `${item.responsavel||''} • ${item.telefone||''} • ${item.email||''}` : CAMPOS[aba]?.slice(1,4).map((c:any)=> item[c.k] ? `${c.l}: ${item[c.k]} • ` : '').join('')}
                    </div>
                    {aba==='empresas' && (
                      <div style={{marginTop:8, display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
                        <span style={{background:'#e0e7ff',color:'#3730a3',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:700}}>Login: {item.login}</span>
                        <span style={{background:'#fef3c7',color:'#92400e',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:700}}>Senha: {item.senha}</span>
                        <button onClick={()=>copiar(`Login: ${item.login} | Senha: ${item.senha}`, item.id)} style={{...btn, background:'#f1f5f9', fontSize:12}}>{senhaCopiada===item.id ? '✅ Copiado!' : '📋 Copiar Acesso'}</button>
                      </div>
                    )}
                    {aba!=='empresas' && <span style={{display:'inline-block',marginTop:6,fontSize:11,background:'#ecfdf5',color:'#047857',padding:'3px 10px',borderRadius:20,fontWeight:700}}>{item.status || item.resultado || 'OK'}</span>}
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
              {(CAMPOS[aba]||[]).map((c:any)=>{
                if (c.k==='senha') return (
                  <div key={c.k}>
                    <label style={{fontSize:13, fontWeight:700, color:'#334155'}}>🔐 {c.l} - Única por empresa</label>
                    <div style={{display:'flex', gap:8, marginTop:4}}>
                      <input type={verSenha ? 'text' : 'password'} value={form[c.k]||''} onChange={e=>setForm({...form, [c.k]: e.target.value})} placeholder="Senha única" style={{...input, flex:1}} />
                      <button onClick={()=>setVerSenha(!verSenha)} style={{...btn, background:'#f1f5f9'}}>{verSenha ? '🙈' : '👁️'}</button>
                    </div>
                    <button onClick={()=>setForm({...form, senha: gerarSenhaForte()})} style={{...btn, background:'#fef3c7', color:'#92400e', marginTop:8, width:'100%', padding:10}}>🎲 Gerar senha forte automática</button>
                    <p style={{fontSize:12, color:'#64748b', margin:'6px 0 0'}}>Essa senha é só dessa empresa. Não repete com outra.</p>
                  </div>
                )
                if (c.k==='login') return (
                  <div key={c.k}>
                    <label style={{fontSize:13, fontWeight:700, color:'#334155'}}>👤 {c.l}</label>
                    <input value={form[c.k]||''} onChange={e=>setForm({...form, [c.k]: e.target.value.toLowerCase().replace(/[^a-z0-9]/g,'')})} placeholder="ex: solnascente" style={{...input, marginTop:4}} />
                    <p style={{fontSize:12, color:'#64748b', margin:'4px 0 0'}}>Se deixar em branco, a gente cria sozinho a partir do nome.</p>
                  </div>
                )
                return (
                  <div key={c.k}>
                    <label style={{fontSize:13, fontWeight:700, color:'#334155'}}>{c.l}</label>
                    <input value={form[c.k]||''} onChange={e=>setForm({...form, [c.k]: e.target.value})} placeholder={c.l} style={{...input, marginTop:4}} />
                  </div>
                )
              })}
            </div>
            {aba==='empresas' && form.login && form.senha && (
              <div style={{background:'#ecfdf5', borderRadius:12, padding:12, marginTop:16, fontSize:13}}>
                <b>✅ Prévia do acesso:</b><br/>Login: <b>{form.login}</b><br/>Senha: <b>{form.senha}</b>
              </div>
            )}
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