'use client'
import { useEffect, useState } from 'react'

const CAMPOS: any = {
  funcionarios: [{k:'nome',l:'Nome'},{k:'cargo',l:'Cargo'},{k:'empresa',l:'Empresa'},{k:'cpf',l:'CPF'},{k:'telefone',l:'Telefone'}],
  epis: [{k:'nome',l:'Nome do EPI'},{k:'tipo',l:'Tipo'},{k:'quantidade',l:'Quantidade'},{k:'funcionario',l:'Funcionário'},{k:'data_entrega',l:'Data Entrega'}],
  extintores: [{k:'localizacao',l:'Localização'},{k:'tipo',l:'Tipo'},{k:'capacidade',l:'Capacidade'},{k:'vencimento',l:'Vencimento'},{k:'status',l:'Status'}],
  inspecoes: [{k:'titulo',l:'Título'},{k:'local',l:'Local'},{k:'responsavel',l:'Responsável'},{k:'data',l:'Data'},{k:'status',l:'Status'}],
  documentos: [{k:'titulo',l:'Título'},{k:'empresa',l:'Empresa'},{k:'vencimento',l:'Vencimento'}],
  exames: [{k:'nome',l:'Funcionário'},{k:'tipo',l:'Tipo Exame'},{k:'data',l:'Data'},{k:'resultado',l:'Resultado'},{k:'clinica',l:'Clínica'}],
  empresas: [{k:'nome',l:'Nome da Empresa'},{k:'cnpj',l:'CNPJ'},{k:'responsavel',l:'Responsável'},{k:'telefone',l:'Telefone'},{k:'email',l:'E-mail da Empresa'},{k:'login',l:'Login de Acesso'},{k:'senha',l:'Senha Única'}],
}

const PASTAS = [
  { id:'PGR', nome:'PGR', icone:'📁', cor:'#0d9488' },
  { id:'PCMSO', nome:'PCMSO', icone:'📁', cor:'#2563eb' },
  { id:'ASO', nome:'ASO / Exames', icone:'🩺', cor:'#22c55e' },
  { id:'Laudos', nome:'Laudos', icone:'📋', cor:'#f59e0b' },
  { id:'Treinamentos', nome:'Treinamentos', icone:'🎓', cor:'#8b5cf6' },
  { id:'Outros', nome:'Outros', icone:'📦', cor:'#64748b' },
]

const CORES_CARDS: any = {
  funcionarios: 'linear-gradient(135deg,#14b8a6,#06b6d4)',
  epis: 'linear-gradient(135deg,#22c55e,#84cc16)',
  extintores: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
  inspecoes: 'linear-gradient(135deg,#10b981,#14b8a6)',
  documentos: 'linear-gradient(135deg,#2563eb,#22d3ee)',
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

const ADMIN = { login: 'cristiano', senha: 'previx123', nome: 'Cristiano', tipo: 'admin', empresa: 'Todas' }

export default function Home() {
  const [dados, setDados] = useState<any>({ funcionarios: [], epis: [], extintores: [], inspecoes: [], documentos: [], exames: [], empresas: [] })
  const [aba, setAba] = useState('inicio')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [busca, setBusca] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [senhaCopiada, setSenhaCopiada] = useState('')
  const [usuario, setUsuario] = useState<any>(null)
  const [loginForm, setLoginForm] = useState({ login: '', senha: '' })
  const [erroLogin, setErroLogin] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [subindoArquivo, setSubindoArquivo] = useState(false)
  const [arquivoNome, setArquivoNome] = useState('')
  const [pastaAtual, setPastaAtual] = useState('Todas')
  const [pastaSelecionadaForm, setPastaSelecionadaForm] = useState('PGR')

  useEffect(() => {
    const sess = localStorage.getItem('previx_session')
    if (sess) { try { setUsuario(JSON.parse(sess)) } catch {} }
    carregar()
    setCarregando(false)
  }, [])

  async function carregar() {
    const urls = ['funcionarios','epis','extintores','inspecoes','documentos','exames','empresas']
    const res: any = {}
    for (const u of urls) {
      try { const r = await fetch(`/api/${u}`); const j = await r.json(); res[u] = Array.isArray(j) ? j : j.data || [] } catch { res[u] = [] }
    }
    try {
      const localEmp = JSON.parse(localStorage.getItem('previx_empresas')||'[]')
      if (localEmp.length) res.empresas = localEmp
      if (!localEmp.find((e:any)=>e.login==='solnascente')) {
        const sol = { id: 'sol1', nome: 'Solnascente LTDA', cnpj: '', responsavel: 'Ronaldo', telefone: '82994145622', email: 'Lojas.cs16486@gmail.com', login: 'solnascente', senha: '12345678', status: 'Ativa' }
        if (!res.empresas.find((e:any)=>e.login==='solnascente')) res.empresas.push(sol)
        localStorage.setItem('previx_empresas', JSON.stringify(res.empresas))
      }
    } catch {}
    try {
      const localDados = JSON.parse(localStorage.getItem('previx_dados')||'{}')
      if (localDados.funcionarios) res.funcionarios = localDados.funcionarios
      if (localDados.documentos) res.documentos = localDados.documentos.map((d:any)=>({...d, pasta: d.pasta || d.tipo || 'Outros', tipo: d.pasta || d.tipo || 'Outros'}))
      if (localDados.empresas) res.empresas = localDados.empresas
    } catch {}
    setDados(res)
  }

  function salvarNoNavegador(novosDados:any) {
    try {
      localStorage.setItem('previx_empresas', JSON.stringify(novosDados.empresas||[]))
      localStorage.setItem('previx_dados', JSON.stringify(novosDados))
    } catch(e) { alert('⚠️ Arquivo muito grande! Tenta um PDF menor que 4MB.') }
  }

  function handleArquivo(e:any) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) { alert('⚠️ Arquivo muito grande! Máximo 4MB.'); return }
    setSubindoArquivo(true)
    setArquivoNome(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setForm((prev:any)=>({...prev, arquivoNome: file.name, arquivoTipo: file.type || 'application/pdf', arquivoTamanho: file.size, arquivoData: reader.result, titulo: prev.titulo || file.name.replace('.pdf','').replace(/_/g,' ') }))
      setSubindoArquivo(false)
    }
    reader.readAsDataURL(file)
  }

  function baixarArquivo(item:any) {
    if (!item.arquivoData) { alert('Esse documento não tem arquivo anexado.'); return }
    const a = document.createElement('a')
    a.href = item.arquivoData
    a.download = item.arquivoNome || `${item.titulo || 'documento'}.pdf`
    a.click()
  }

  function verArquivo(item:any) {
    if (!item.arquivoData) { alert('Esse documento não tem arquivo anexado.'); return }
    const w = window.open()
    if (w) { w.document.write(`<iframe src="${item.arquivoData}" style="width:100%;height:100vh;border:none"></iframe>`) }
    else baixarArquivo(item)
  }

  function moverPasta(item:any, novaPasta:string) {
    const lista = [...(dados.documentos||[])]
    const idx = lista.findIndex((x:any)=>(x.id||x._id)===(item.id||item._id))
    if (idx>=0) { lista[idx] = {...lista[idx], pasta: novaPasta, tipo: novaPasta}; const nd={...dados, documentos: lista}; setDados(nd); salvarNoNavegador(nd) }
  }

  function fazerLogin() {
    setErroLogin('')
    const login = loginForm.login.trim().toLowerCase()
    const senha = loginForm.senha.trim()
    if (login === ADMIN.login && senha === ADMIN.senha) { setUsuario(ADMIN); localStorage.setItem('previx_session', JSON.stringify(ADMIN)); setAba('inicio'); return }
    if (login === 'admin' && senha === 'admin') { setUsuario(ADMIN); localStorage.setItem('previx_session', JSON.stringify(ADMIN)); setAba('inicio'); return }
    const emp = (dados.empresas||[]).find((e:any)=> (e.login||'').toLowerCase() === login && (e.senha||'') === senha)
    if (emp) {
      const u = { login: emp.login, senha: emp.senha, nome: emp.responsavel || emp.nome, tipo: 'empresa', empresa: emp.nome, empresaId: emp.id }
      setUsuario(u); localStorage.setItem('previx_session', JSON.stringify(u)); setAba('inicio'); return
    }
    setErroLogin('Login ou senha incorretos! Confere e tenta de novo.')
  }

  function sair() { setUsuario(null); localStorage.removeItem('previx_session'); setLoginForm({login:'',senha:''}); setAba('inicio'); setPastaAtual('Todas') }

  function abrirNovo() {
    setEditando(null); setArquivoNome(''); setPastaSelecionadaForm(pastaAtual!=='Todas' ? pastaAtual : 'PGR')
    if (aba === 'empresas') setForm({ senha: gerarSenhaForte(), status: 'Ativa', plano: 'Mensal' })
    else if (usuario?.tipo === 'empresa') setForm({ empresa: usuario.empresa, pasta: pastaAtual!=='Todas' ? pastaAtual : 'PGR', tipo: pastaAtual!=='Todas' ? pastaAtual : 'PGR' })
    else setForm({ pasta: pastaAtual!=='Todas' ? pastaAtual : 'PGR', tipo: pastaAtual!=='Todas' ? pastaAtual : 'PGR' })
    setVerSenha(false); setModal(true)
  }
  function abrirEditar(item:any) { setEditando(item); setForm(item); setArquivoNome(item.arquivoNome||''); setPastaSelecionadaForm(item.pasta||item.tipo||'Outros'); setVerSenha(false); setModal(true) }

  function copiar(texto:string, id:string) { navigator.clipboard.writeText(texto); setSenhaCopiada(id); setTimeout(()=>setSenhaCopiada(''), 2000) }

  async function salvar() {
    if (!aba || aba==='inicio') return
    let formFinal = {...form}
    if (aba==='documentos') {
      formFinal.pasta = pastaSelecionadaForm || formFinal.pasta || 'Outros'
      formFinal.tipo = formFinal.pasta
      if (!formFinal.titulo) { alert('⚠️ Coloca o título do documento!'); return }
    }
    if (aba==='empresas') {
      if (!formFinal.login && formFinal.nome) formFinal.login = formFinal.nome.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,12)
      if (!formFinal.senha) formFinal.senha = gerarSenhaForte()
    }
    if (usuario?.tipo==='empresa') formFinal.empresa = usuario.empresa
    const lista = [...(dados[aba]||[])]
    if (editando) {
      const id = editando.id || editando._id
      const idx = lista.findIndex((x:any)=>(x.id||x._id)===id)
      if (idx>=0) lista[idx] = {...lista[idx], ...formFinal}
      const nd = {...dados, [aba]: lista}; setDados(nd); salvarNoNavegador(nd)
    } else {
      const novo = { ...formFinal, id: Date.now().toString(), status: formFinal.status || 'Ativa' }
      lista.push(novo)
      const nd = {...dados, [aba]: lista}; setDados(nd); salvarNoNavegador(nd)
      if (aba==='empresas') alert(`✅ Empresa criada!\n\nLogin: ${novo.login}\nSenha: ${novo.senha}`)
      if (aba==='documentos') alert(`✅ Salvo na pasta ${novo.pasta}!\n\n📄 ${novo.arquivoNome || novo.titulo}`)
    }
    setModal(false); setForm({}); setEditando(null); setArquivoNome('')
  }

  async function excluir(item:any) {
    if (!confirm(`Excluir ${item.nome || item.titulo || 'esse registro'}?`)) return
    const id = item.id || item._id
    try { await fetch(`/api/${aba}/${id}`, { method:'DELETE' }) } catch {}
    const novaLista = (dados[aba]||[]).filter((x:any)=>(x.id||x._id)!==id)
    const nd = {...dados, [aba]: novaLista}; setDados(nd); salvarNoNavegador(nd)
  }

  function dadosFiltradosPorEmpresa(lista:any[]) {
    if (!usuario) return []
    if (usuario.tipo === 'admin') return lista
    return lista.filter((it:any)=>{
      if (!it.empresa) return true
      return it.empresa.toLowerCase().includes(usuario.empresa.toLowerCase().split(' ')[0].toLowerCase()) || it.empresa.toLowerCase() === usuario.empresa.toLowerCase() || it.nome === usuario.empresa
    })
  }

  function iniciais(nome:string) {
    if (!nome) return '??'
    const p = nome.split(' ').filter(Boolean)
    if (p.length===1) return p[0].slice(0,2).toUpperCase()
    return (p[0][0]+p[1][0]).toUpperCase()
  }

  const btn = { padding:'8px 14px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:700, fontSize:13 } as any
  const input = { width:'100%', padding:'12px', borderRadius:12, border:'1px solid #cbd5e1', fontSize:14, boxSizing:'border-box' as any }

  if (carregando) return <div style={{padding:40, textAlign:'center'}}>Carregando PREVIX...</div>

  if (!usuario) {
    return (
      <div style={{minHeight:'100vh', background:'linear-gradient(135deg,#0d9488,#2563eb)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, fontFamily:'Arial, sans-serif'}}>
        <div style={{background:'white', borderRadius:24, padding:32, width:'100%', maxWidth:420, boxShadow:'0 20px 50px rgba(0,0,0,0.3)'}}>
          <div style={{textAlign:'center'}}>
            <img src="/logo.png" alt="PREVIX" style={{width:80,height:80,objectFit:'contain',background:'white',borderRadius:16,padding:8, border:'1px solid #e2e8f0'}} />
            <h1 style={{fontSize:32, fontWeight:900, margin:'12px 0 0', letterSpacing:1, color:'#0f172a'}}>PREVIX</h1>
            <p style={{color:'#0d9488', fontWeight:800, fontSize:11, letterSpacing:2, margin:'4px 0 0'}}>PREVENÇÃO QUE PROTEGE</p>
            <p style={{color:'#64748b', marginTop:16}}>Acesse seu painel SST</p>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:12, marginTop:20}}>
            <div><label style={{fontSize:13, fontWeight:700}}>👤 Login</label><input value={loginForm.login} onChange={e=>setLoginForm({...loginForm, login:e.target.value})} placeholder="Ex: solnascente" style={{...input, marginTop:4}} /></div>
            <div><label style={{fontSize:13, fontWeight:700}}>🔐 Senha</label><input type="password" value={loginForm.senha} onChange={e=>setLoginForm({...loginForm, senha:e.target.value})} onKeyDown={e=>{if(e.key==='Enter') fazerLogin()}} placeholder="Sua senha única" style={{...input, marginTop:4}} /></div>
            {erroLogin && <div style={{background:'#fee2e2', color:'#b91c1c', padding:10, borderRadius:10, fontSize:13, fontWeight:700}}>{erroLogin}</div>}
            <button onClick={fazerLogin} style={{...btn, background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:14, fontSize:15, borderRadius:12}}>Entrar →</button>
          </div>
        </div>
      </div>
    )
  }

  const isAdmin = usuario.tipo === 'admin'
  const menuBase = [
    {id:'inicio',label:'Início',icone:'🏠'},
    {id:'funcionarios',label:'Funcionários',icone:'👷'},
    {id:'epis',label:"EPI's",icone:'🦺'},
    {id:'extintores',label:'Extintores',icone:'🧯'},
    {id:'inspecoes',label:'Inspeções',icone:'📋'},
    {id:'documentos',label:'Documentos',icone:'📄'},
    {id:'exames',label:'Exames',icone:'🩺'},
  ]
  const menu = isAdmin ? [...menuBase, {id:'empresas',label:'Empresas',icone:'🏢'}] : menuBase

  const funcs = dadosFiltradosPorEmpresa(dados.funcionarios||[])
  const episF = dadosFiltradosPorEmpresa(dados.epis||[])
  const extF = dadosFiltradosPorEmpresa(dados.extintores||[])
  const inspF = dadosFiltradosPorEmpresa(dados.inspecoes||[])
  const docF = dadosFiltradosPorEmpresa(dados.documentos||[])
  const docsComArquivo = docF.filter((d:any)=>d.arquivoData).length
  const contarPasta = (p:string) => docF.filter((d:any)=>(d.pasta||d.tipo||'Outros')===p).length

  const cards = [
    { titulo:'Funcionários', valor:funcs.length, sub:'Cadastrados', icone:'👷', cor:'linear-gradient(135deg,#14b8a6,#06b6d4)', aba:'funcionarios' },
    { titulo:"EPI's", valor:episF.length, sub:'Entregues', icone:'🦺', cor:'linear-gradient(135deg,#22c55e,#84cc16)', aba:'epis' },
    { titulo:'Extintores', valor:extF.length, sub:'Cadastrados', icone:'🧯', cor:'linear-gradient(135deg,#3b82f6,#06b6d4)', aba:'extintores' },
    { titulo:'Inspeções', valor:inspF.length, sub:'Realizadas', icone:'📋', cor:'linear-gradient(135deg,#10b981,#14b8a6)', aba:'inspecoes' },
    { titulo:'Documentos', valor:docF.length, sub:`${docsComArquivo} com PDF`, icone:'📄', cor:'linear-gradient(135deg,#2563eb,#22d3ee)', aba:'documentos' },
  ]

  const listaBase = dados[aba]||[]
  const listaPorEmpresa = dadosFiltradosPorEmpresa(listaBase)
  let listaFiltrada = listaPorEmpresa.filter((it:any)=> JSON.stringify(it).toLowerCase().includes(busca.toLowerCase()))
  if (aba==='documentos' && pastaAtual!=='Todas') {
    listaFiltrada = listaFiltrada.filter((it:any)=>(it.pasta||it.tipo||'Outros')===pastaAtual)
  }

  return (
    <div style={{minHeight:'100vh', background:'#ecfeff', fontFamily:'Arial, sans-serif'}}>
      <header style={{background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:'12px 16px', position:'sticky', top:0, zIndex:50}}>
        <div style={{maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <img src="/logo.png" alt="PREVIX" style={{width:44,height:44,objectFit:'contain',background:'white',borderRadius:12,padding:4}} />
            <div><div style={{fontWeight:900,fontSize:20,letterSpacing:1,lineHeight:1}}>PREVIX <span style={{fontSize:12, fontWeight:700, background:'rgba(255,255,255,0.2)', padding:'2px 8px', borderRadius:20}}>SST</span></div><div style={{fontSize:10,letterSpacing:2,color:'#a7f3d0',fontWeight:700}}>PREVENÇÃO QUE PROTEGE</div></div>
          </div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <span style={{fontSize:12, background: isAdmin ? '#f97316' : '#22c55e', padding:'6px 12px', borderRadius:20, fontWeight:700}}>{isAdmin ? '👨‍💼 SUPER ADMIN' : `🏢 ${usuario.empresa}`}</span>
            <button onClick={sair} style={{...btn, background:'white', color:'#0f172a', borderRadius:20}}>Sair</button>
          </div>
        </div>
        <div style={{maxWidth:1200, margin:'12px auto 0', display:'flex', gap:8, overflowX:'auto', paddingBottom:4}}>
          {menu.map(m=>(
            <button key={m.id} onClick={()=>{setAba(m.id); setBusca(''); setPastaAtual('Todas')}} style={{whiteSpace:'nowrap', padding:'8px 16px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:14, background: aba===m.id?'white':'rgba(255,255,255,0.15)', color: aba===m.id?'#0f766e':'white'}}>{m.icone} {m.label}</button>
          ))}
        </div>
      </header>

      <main style={{maxWidth:1200, margin:'0 auto', padding:16}}>
        {aba==='inicio' && (
          <>
            <div style={{background:'linear-gradient(135deg,#ffffff,#ecfeff)', borderRadius:24, padding:24, display:'flex', justifyContent:'space-between', gap:16, flexWrap:'wrap', border:'1px solid #a7f3d0'}}>
              <div>
                <div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:'#0d9488'}}>{isAdmin ? 'SUPER ADMIN • VOCÊ ESTÁ VENDO TUDO' : `EMPRESA • VOCÊ ESTÁ VENDO SÓ: ${usuario.empresa.toUpperCase()}`}</div>
                <h2 style={{fontSize:32,fontWeight:900,margin:'8px 0 0', color:'#0f172a'}}>Olá, {usuario.nome}! 👋</h2>
                <p style={{color:'#64748b'}}>Bem-vindo ao seu painel SST • <b style={{color:'#0f766e'}}>{isAdmin ? 'Todas as empresas' : usuario.empresa}</b></p>
              </div>
              <span style={{background:'#dcfce7',color:'#15803d',padding:'8px 16px',borderRadius:20,fontSize:14,fontWeight:800,height:'fit-content'}}>✅ PREVIX Completo!</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:16,marginTop:20}}>
              {cards.map(c=>(
                <button key={c.titulo} onClick={()=>setAba(c.aba)} style={{background:c.cor,borderRadius:24,padding:20,textAlign:'left',border:'none',cursor:'pointer', color:'white'}}>
                  <div style={{width:48,height:48,background:'rgba(255,255,255,0.25)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{c.icone}</div>
                  <div style={{color:'rgba(255,255,255,0.9)',fontSize:14,marginTop:16, fontWeight:700}}>{c.titulo}</div>
                  <div style={{fontSize:38,fontWeight:900, lineHeight:1}}>{c.valor}</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.85)'}}>{c.sub} • Clique para abrir →</div>
                </button>
              ))}
            </div>
            <div style={{background:'white',borderRadius:24,padding:20,border:'1px solid #a7f3d0',marginTop:20}}>
              <h3 style={{margin:'0 0 4px',fontWeight:900, color:'#0f766e'}}>📁 Pastas de Documentos • {usuario.empresa}</h3>
              <p style={{margin:'0 0 12px', fontSize:13, color:'#64748b'}}>Nada solto! Cada arquivo dentro da sua pasta.</p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}>
                {PASTAS.map(p=>(
                  <button key={p.id} onClick={()=>{setAba('documentos'); setPastaAtual(p.id)}} style={{textAlign:'left', background:'#f0fdfa', border:'1px solid #ccfbf1', borderRadius:16, padding:14, cursor:'pointer'}}>
                    <div style={{fontSize:22}}>{p.icone}</div>
                    <div style={{fontWeight:900, color:'#0f172a', marginTop:6}}>{p.nome}</div>
                    <div style={{fontSize:12, color:'#64748b'}}>{contarPasta(p.id)} arquivo(s)</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {aba!=='inicio' && (
          <div style={{background:'white',borderRadius:24,padding:24,border:'1px solid #a7f3d0'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
              <div>
                <h2 style={{fontSize:24,fontWeight:900,textTransform:'capitalize',margin:0, color:'#0f172a'}}>{aba} {aba==='documentos' && pastaAtual!=='Todas' && <span style={{fontSize:14, color:'#0d9488'}}>• 📁 {pastaAtual}</span>}</h2>
                <p style={{color:'#64748b',fontSize:14,margin:'4px 0 0'}}>Total: {listaFiltrada.length} registros {aba==='documentos' && `• ${docsComArquivo} com PDF 📄`}</p>
              </div>
              <button onClick={abrirNovo} style={{...btn, background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:'12px 20px', borderRadius:20, fontSize:14}}>{aba==='documentos' ? `📎 Subir em ${pastaAtual==='Todas' ? 'PGR' : pastaAtual}` : '＋ Adicionar'}</button>
            </div>

            {aba==='documentos' && (
              <div style={{marginTop:16}}>
                <div style={{fontSize:13, fontWeight:800, color:'#0f766e', marginBottom:8}}>📁 PASTAS • Clique para abrir:</div>
                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  <button onClick={()=>setPastaAtual('Todas')} style={{...btn, background: pastaAtual==='Todas' ? '#0f766e' : '#f1f5f9', color: pastaAtual==='Todas' ? 'white' : '#0f172a', borderRadius:20, padding:'8px 16px'}}>📂 Todas ({docF.length})</button>
                  {PASTAS.map(p=>(
                    <button key={p.id} onClick={()=>setPastaAtual(p.id)} style={{...btn, background: pastaAtual===p.id ? p.cor : '#f1f5f9', color: pastaAtual===p.id ? 'white' : '#0f172a', borderRadius:20, padding:'8px 16px'}}>{p.icone} {p.nome} ({contarPasta(p.id)})</button>
                  ))}
                </div>
                <div style={{background:'#f0fdfa', border:'2px dashed #5eead4', borderRadius:16, padding:14, marginTop:12, textAlign:'center', fontSize:13, color:'#64748b'}}>
                  {pastaAtual==='Todas' ? '📂 Você está vendo TODAS as pastas. Clique em uma pasta acima pra filtrar.' : `📁 Você está dentro da pasta ${pastaAtual} • Tudo que subir agora vai pra essa pasta.`}
                </div>
              </div>
            )}

            <input placeholder={`🔍 Buscar em ${aba}...`} value={busca} onChange={e=>setBusca(e.target.value)} style={{...input, marginTop:16, background:'#f0fdfa'}} />
            <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:12}}>
              {listaFiltrada.map((item:any,i:number)=>{
                const corAvatar = CORES_CARDS[aba] || 'linear-gradient(135deg,#0d9488,#2563eb)'
                const pastaItem = item.pasta || item.tipo || 'Outros'
                return (
                <div key={item.id||item._id||i} style={{border:'1px solid #e0f2fe',borderRadius:20,padding:16,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap', background:'linear-gradient(135deg,#ffffff,#f0fdfa)'}}>
                  <div style={{display:'flex', gap:14, alignItems:'center', flex:1, minWidth:220}}>
                    <div style={{width:52,height:52,borderRadius:16,background:corAvatar, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:16, flexShrink:0}}>{aba==='documentos' ? '📄' : iniciais(item.nome || item.titulo || item.localizacao || '??')}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:900, fontSize:16, color:'#0f172a'}}>{item.nome || item.titulo || item.localizacao || 'Registro'}</div>
                      <div style={{fontSize:13,color:'#64748b', marginTop:2}}>
                        {aba==='empresas' ? `${item.responsavel||''} • ${item.telefone||''} • ${item.email||''}` : aba==='documentos' ? `Pasta: ${pastaItem} • Venc: ${item.vencimento||'-'}` : CAMPOS[aba]?.slice(1,4).map((c:any)=> item[c.k] ? `${c.l}: ${item[c.k]} • ` : '').join('')}
                      </div>
                      {aba==='documentos' && <span style={{display:'inline-block', marginTop:6, background:'#e0f2fe', color:'#1e40af', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:800}}>📁 {pastaItem}</span>}
                      {aba==='documentos' && item.arquivoNome && <div style={{fontSize:12, color:'#0f766e', fontWeight:700, marginTop:6}}>📎 {item.arquivoNome}</div>}
                      {aba==='documentos' && item.arquivoData && (
                        <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>
                          <button onClick={()=>verArquivo(item)} style={{...btn, background:'#dbeafe', color:'#1e40af'}}>👁️ Ver PDF</button>
                          <button onClick={()=>baixarArquivo(item)} style={{...btn, background:'#dcfce7', color:'#15803d'}}>⬇️ Baixar</button>
                          <select value={pastaItem} onChange={e=>moverPasta(item, e.target.value)} style={{padding:'6px 10px', borderRadius:10, border:'1px solid #cbd5e1', fontSize:12, fontWeight:700}}>
                            {PASTAS.map(p=><option key={p.id} value={p.id}>Mover p/ {p.nome}</option>)}
                          </select>
                        </div>
                      )}
                      {aba==='empresas' && (
                        <div style={{marginTop:8, display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
                          <span style={{background:'#e0f2fe',color:'#1d4ed8',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:700}}>Login: {item.login}</span>
                          <span style={{background:'#fef9c3',color:'#854d0e',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:700}}>Senha: {item.senha}</span>
                          <button onClick={()=>copiar(`Login: ${item.login} | Senha: ${item.senha}`, item.id)} style={{...btn, background:'#f1f5f9', fontSize:12}}>{senhaCopiada===item.id ? '✅ Copiado!' : '📋 Copiar Acesso'}</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>abrirEditar(item)} style={{...btn, background:'#dbeafe', color:'#1e40af'}}>✏️ Editar</button>
                    <button onClick={()=>excluir(item)} style={{...btn, background:'#fee2e2', color:'#b91c1c'}}>🗑️ Excluir</button>
                  </div>
                </div>
                )
              })}
              {listaFiltrada.length===0 && <p style={{color:'#94a3b8', textAlign:'center', padding:20}}>{aba==='documentos' ? `📁 Pasta ${pastaAtual} vazia! Clica em 📎 Subir em ${pastaAtual} e manda o primeiro arquivo!` : 'Nenhum registro ainda.'}</p>}
            </div>
          </div>
        )}
      </main>

      {modal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16}}>
          <div style={{background:'white', borderRadius:24, padding:24, width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto'}}>
            <h3 style={{margin:'0 0 16px', fontSize:20, fontWeight:900, color:'#0f766e'}}>{editando ? '✏️ Editar' : aba==='documentos' ? '📎 Subir Documento' : '＋ Adicionar'} - {aba}</h3>
            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              {(CAMPOS[aba]||[]).map((c:any)=>{
                if (c.k==='senha') return (
                  <div key={c.k}>
                    <label style={{fontSize:13, fontWeight:700}}>🔐 {c.l} - Única por empresa</label>
                    <div style={{display:'flex', gap:8, marginTop:4}}>
                      <input type={verSenha ? 'text' : 'password'} value={form[c.k]||''} onChange={e=>setForm({...form, [c.k]: e.target.value})} placeholder="Senha única" style={{...input, flex:1}} />
                      <button onClick={()=>setVerSenha(!verSenha)} style={{...btn, background:'#f1f5f9'}}>{verSenha ? '🙈' : '👁️'}</button>
                    </div>
                    <button onClick={()=>setForm({...form, senha: gerarSenhaForte()})} style={{...btn, background:'#fef9c3', color:'#854d0e', marginTop:8, width:'100%', padding:10}}>🎲 Gerar senha forte automática</button>
                  </div>
                )
                if (c.k==='login') return (
                  <div key={c.k}>
                    <label style={{fontSize:13, fontWeight:700}}>👤 {c.l}</label>
                    <input value={form[c.k]||''} onChange={e=>setForm({...form, [c.k]: e.target.value.toLowerCase().replace(/[^a-z0-9]/g,'')})} placeholder="ex: solnascente" style={{...input, marginTop:4}} />
                  </div>
                )
                return (
                  <div key={c.k}>
                    <label style={{fontSize:13, fontWeight:700}}>{c.l}</label>
                    <input value={form[c.k]||''} onChange={e=>setForm({...form, [c.k]: e.target.value})} placeholder={c.l} style={{...input, marginTop:4}} />
                  </div>
                )
              })}

              {aba==='documentos' && (
                <>
                  <div>
                    <label style={{fontSize:13, fontWeight:800, color:'#0f766e'}}>📁 Escolha a PASTA - pra não ficar solto!</label>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:8}}>
                      {PASTAS.map(p=>(
                        <button key={p.id} type="button" onClick={()=>setPastaSelecionadaForm(p.id)} style={{padding:'10px 6px', borderRadius:12, border: pastaSelecionadaForm===p.id ? `2px solid ${p.cor}` : '1px solid #e2e8f0', background: pastaSelecionadaForm===p.id ? '#f0fdfa' : 'white', cursor:'pointer', fontWeight:800, fontSize:12}}>{p.icone} {p.nome}<br/><span style={{fontSize:10, color:'#64748b', fontWeight:400}}>{contarPasta(p.id)} arq.</span></button>
                      ))}
                    </div>
                    <div style={{fontSize:12, color:'#0f766e', fontWeight:700, marginTop:8}}>✅ Vai salvar em: 📁 {pastaSelecionadaForm}</div>
                  </div>
                  <div style={{background:'#f0fdfa', border:'2px dashed #5eead4', borderRadius:16, padding:16, textAlign:'center'}}>
                    <div style={{fontWeight:800, color:'#0f766e', marginBottom:8}}>📁 Subir arquivo da máquina</div>
                    <label style={{display:'block', background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:'12px', borderRadius:12, fontWeight:800, cursor:'pointer'}}>
                      {subindoArquivo ? '⏳ Subindo...' : arquivoNome ? `✅ ${arquivoNome}` : '📎 Clique para escolher PDF / Imagem / Word'}
                      <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleArquivo} style={{display:'none'}} />
                    </label>
                    <div style={{fontSize:11, color:'#64748b', marginTop:6}}>Máx 4MB • Fica salvo dentro da pasta {pastaSelecionadaForm}</div>
                  </div>
                </>
              )}
            </div>
            <div style={{display:'flex', gap:10, marginTop:20}}>
              <button onClick={()=>setModal(false)} style={{...btn, flex:1, background:'#f1f5f9', padding:12}}>Cancelar</button>
              <button onClick={salvar} style={{...btn, flex:1, background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:12}}>💾 Salvar na pasta {aba==='documentos' ? pastaSelecionadaForm : ''}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}