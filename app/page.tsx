"use client"
import { useState, useEffect } from "react"

const EMPRESAS = [
  { id: "sol", nome: "Sol Nascente Construtora", funcionarios: 66 },
  { id: "xyz", nome: "Obra XYZ Ltda", funcionarios: 8 },
  { id: "horizonte", nome: "Construtora Horizonte", funcionarios: 22 },
]

const DOCUMENTOS_INICIAL = [
  { id: 1, nome: "PGR - Programa de Gerenciamento de Riscos", empresa: "sol", vencimento: "12/12/2026", status: "Em dia" },
  { id: 2, nome: "PCMSO - Programa de Controle Médico", empresa: "sol", vencimento: "20/01/2027", status: "Em dia" },
  { id: 3, nome: "LTCAT - Laudo Técnico", empresa: "sol", vencimento: "05/11/2026", status: "Vencendo" },
  { id: 4, nome: "PPRA - Obra XYZ", empresa: "xyz", vencimento: "01/12/2026", status: "Em dia" },
  { id: 5, nome: "CIPA - Ata de Eleição", empresa: "horizonte", vencimento: "15/02/2027", status: "Em dia" },
]

const EXAMES_INICIAL = [
  { id: 1, funcionario: "João Silva", tipo: "Admissional", empresa: "sol", data: "10/10/2026", status: "Apto" },
  { id: 2, funcionario: "Maria Santos", tipo: "Periódico", empresa: "sol", data: "28/11/2026", status: "Agendado" },
  { id: 3, funcionario: "Carlos Lima", tipo: "Demissional", empresa: "xyz", data: "02/11/2026", status: "Apto" },
  { id: 4, funcionario: "Ana Souza", tipo: "Retorno ao Trabalho", empresa: "horizonte", data: "15/11/2026", status: "Pendente" },
]

const FUNCIONARIOS_INICIAL = [
  { id: 1, nome: "João Silva", funcao: "Pedreiro", empresa: "sol", status: "Ativo" },
  { id: 2, nome: "Maria Santos", funcao: "Servente", empresa: "sol", status: "Ativo" },
  { id: 3, nome: "Pedro Alves", funcao: "Mestre de Obras", empresa: "sol", status: "Ativo" },
  { id: 4, nome: "Carlos Lima", funcao: "Eletricista", empresa: "xyz", status: "Ativo" },
  { id: 5, nome: "Ana Souza", funcao: "Engenheira", empresa: "horizonte", status: "Afastado" },
]

const EPIS_INICIAL = [
  { id: 1, funcionario: "João Silva", epi: "Capacete", empresa: "sol", data: "10/10/2026", status: "Entregue" },
  { id: 2, funcionario: "Maria Santos", epi: "Luva de Segurança", empresa: "sol", data: "10/10/2026", status: "Entregue" },
  { id: 3, funcionario: "Carlos Lima", epi: "Óculos de Proteção", empresa: "xyz", data: "02/11/2026", status: "Entregue" },
]

const EXTINTORES_INICIAL = [
  { id: 1, tipo: "PQS - 4kg", local: "Almoxarifado", empresa: "sol", vencimento: "10/12/2026", status: "Em dia" },
  { id: 2, tipo: "CO2 - 6kg", local: "Escritório da Obra", empresa: "sol", vencimento: "15/11/2026", status: "Vencendo" },
  { id: 3, tipo: "Água - 10L", local: "Entrada Principal", empresa: "xyz", vencimento: "20/01/2027", status: "Em dia" },
]

const INSPECOES_INICIAL = [
  { id: 1, titulo: "Uso de EPI no canteiro", local: "Canteiro - Bloco A", empresa: "sol", data: "05/11/2026", status: "Conforme" },
  { id: 2, titulo: "Andaimes e plataformas", local: "Bloco B", empresa: "sol", data: "04/11/2026", status: "Não Conforme" },
  { id: 3, titulo: "Instalações elétricas provisórias", local: "Obra XYZ", empresa: "xyz", data: "03/11/2026", status: "Conforme" },
]

export default function Page() {
  const [user, setUser] = useState<null | { tipo: "admin" | "cliente", empresaId?: string }>(null)
  const [email, setEmail] = useState("admin@previx.com.br")
  const [senha, setSenha] = useState("1234")
  const [erro, setErro] = useState("")
  const [empresaAtiva, setEmpresaAtiva] = useState(EMPRESAS[0])
  const [aba, setAba] = useState("inicio")
  const [documentos, setDocumentos] = useState(DOCUMENTOS_INICIAL)
  const [exames, setExames] = useState(EXAMES_INICIAL)
  const [funcionarios, setFuncionarios] = useState(FUNCIONARIOS_INICIAL)
  const [epis, setEpis] = useState(EPIS_INICIAL)
  const [extintores, setExtintores] = useState(EXTINTORES_INICIAL)
  const [inspecoes, setInspecoes] = useState(INSPECOES_INICIAL)
  const [novoDoc, setNovoDoc] = useState("")
  const [novoExameNome, setNovoExameNome] = useState("")
  const [novoExameTipo, setNovoExameTipo] = useState("Periódico")
  const [novoFuncNome, setNovoFuncNome] = useState("")
  const [novoFuncFuncao, setNovoFuncFuncao] = useState("Pedreiro")
  const [novoEpiFunc, setNovoEpiFunc] = useState("")
  const [novoEpiTipo, setNovoEpiTipo] = useState("Capacete")
  const [novoExtTipo, setNovoExtTipo] = useState("PQS - 4kg")
  const [novoExtLocal, setNovoExtLocal] = useState("")
  const [novoExtVenc, setNovoExtVenc] = useState("")
  const [novaInspTitulo, setNovaInspTitulo] = useState("")
  const [novaInspLocal, setNovaInspLocal] = useState("")
  const [buscaFunc, setBuscaFunc] = useState("")
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
    try {
      const docsSalvos = localStorage.getItem("previx_documentos")
      const examesSalvos = localStorage.getItem("previx_exames")
      const funcSalvos = localStorage.getItem("previx_funcionarios")
      const episSalvos = localStorage.getItem("previx_epis")
      const extSalvos = localStorage.getItem("previx_extintores")
      const inspSalvos = localStorage.getItem("previx_inspecoes")
      if (docsSalvos) setDocumentos(JSON.parse(docsSalvos))
      if (examesSalvos) setExames(JSON.parse(examesSalvos))
      if (funcSalvos) setFuncionarios(JSON.parse(funcSalvos))
      if (episSalvos) setEpis(JSON.parse(episSalvos))
      if (extSalvos) setExtintores(JSON.parse(extSalvos))
      if (inspSalvos) setInspecoes(JSON.parse(inspSalvos))
    } catch {}
    setCarregado(true)
  }, [])

  useEffect(() => { if (!carregado) return; localStorage.setItem("previx_documentos", JSON.stringify(documentos)) }, [documentos, carregado])
  useEffect(() => { if (!carregado) return; localStorage.setItem("previx_exames", JSON.stringify(exames)) }, [exames, carregado])
  useEffect(() => { if (!carregado) return; localStorage.setItem("previx_funcionarios", JSON.stringify(funcionarios)) }, [funcionarios, carregado])
  useEffect(() => { if (!carregado) return; localStorage.setItem("previx_epis", JSON.stringify(epis)) }, [epis, carregado])
  useEffect(() => { if (!carregado) return; localStorage.setItem("previx_extintores", JSON.stringify(extintores)) }, [extintores, carregado])
  useEffect(() => { if (!carregado) return; localStorage.setItem("previx_inspecoes", JSON.stringify(inspecoes)) }, [inspecoes, carregado])

  if (!user) {
    return (
      <div className="flex min-h-screen bg-[#f1f5f9] items-center justify-center p-4">
        <div className="bg-white w-full max-w-[420px] rounded-2xl p-6 shadow-sm border">
          <div className="text-center mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-900 to-emerald-500 rounded-xl flex items-center justify-center mx-auto"><span className="font-black text-black text-xl">P</span></div>
            <h1 className="font-black text-2xl mt-2">PREVIX</h1>
            <p className="text-emerald-400 text-[10px] tracking-widest">PREVENÇÃO QUE PROTEGE</p>
          </div>
          <h2 className="font-bold text-slate-800 mb-4">Acesso Restrito</h2>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail / Usuário" className="w-full p-3 rounded-xl border mb-3 outline-none" />
          <input value={senha} onChange={e=>setSenha(e.target.value)} type="password" placeholder="Senha" className="w-full p-3 rounded-xl border mb-3 outline-none" />
          <button onClick={()=>{
            if(senha!=="1234"){setErro("Senha incorreta");return}
            if(email.includes("admin")) setUser({tipo:"admin"})
            else if(email.includes("sol")) setUser({tipo:"cliente", empresaId:"sol"})
            else if(email.includes("xyz")) setUser({tipo:"cliente", empresaId:"xyz"})
            else setErro("Usuário não encontrado")
          }} className="w-full bg-emerald-500 text-white p-3 rounded-xl font-bold">ENTRAR</button>
          {erro && <p className="text-red-500 text-sm text-center mt-3">{erro}</p>}
          <p className="text-xs text-slate-400 text-center mt-4">Acesso apenas para clientes autorizados.<br/>Sem cadastro público.</p>
          <p className="text-[11px] text-slate-400 text-center mt-2">Teste: admin@previx.com.br / sol@previx.com.br / xyz@previx.com.br<br/>Senha: 1234</p>
        </div>
      </div>
    )
  }

  const empresaExibir = user.tipo === "cliente" ? EMPRESAS.find(e=>e.id===user.empresaId) || EMPRESAS[0] : empresaAtiva
  const docsFiltrados = documentos.filter(d => d.empresa === empresaExibir.id)
  const examesFiltrados = exames.filter(e => e.empresa === empresaExibir.id)
  const funcFiltrados = funcionarios.filter(f => f.empresa === empresaExibir.id && f.nome.toLowerCase().includes(buscaFunc.toLowerCase()))
  const episFiltrados = epis.filter(e => e.empresa === empresaExibir.id)
  const extFiltrados = extintores.filter(e => e.empresa === empresaExibir.id)
  const inspFiltrados = inspecoes.filter(e => e.empresa === empresaExibir.id)
  const funcsEmpresa = funcionarios.filter(f=>f.empresa===empresaExibir.id)

  const menu = [
    { id: "inicio", label: "🏠 Início" },
    { id: "funcionarios", label: "👷 Funcionários" },
    { id: "epis", label: "🦺 EPI's" },
    { id: "extintores", label: "🧯 Extintores" },
    { id: "inspecoes", label: "📋 Inspeções" },
    { id: "documentos", label: "📄 Documentos" },
    { id: "exames", label: "🩺 Exames" },
  ]

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <aside className="w-[260px] bg-[#0f172a] p-6 hidden lg:flex flex-col fixed h-screen">
        <div className="flex items-center gap-3 mb-2"><div className="w-11 h-11 bg-gradient-to-br from-emerald-900 to-emerald-500 rounded-xl flex items-center justify-center"><span className="font-black text-black text-xl leading-none">P</span></div><div><div className="font-black text-white leading-none">PREVIX</div></div></div>
        <p className="text-emerald-400 text-[10px] mb-8 tracking-widest">PREVENÇÃO QUE PROTEGE</p>
        <nav className="space-y-1 text-sm text-slate-300">
          {menu.map(m => (
            <button key={m.id} onClick={()=>setAba(m.id)} className={`w-full text-left p-3 rounded-xl ${aba===m.id ? "bg-emerald-600 text-white font-bold" : ""}`}>{m.label}</button>
          ))}
        </nav>
        <button onClick={()=>setUser(null)} className="mt-auto text-left text-xs text-slate-400">Sair</button>
      </aside>

      <main className="flex-1 p-8 lg:ml-[260px]">
        {user.tipo === "admin" && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-1 rounded-full">SUPER ADMIN</span>
            <span className="text-sm text-slate-500">Você está vendo:</span>
            {EMPRESAS.map(e=>(
              <button key={e.id} onClick={()=>setEmpresaAtiva(e)} className={`px-3 py-2 rounded-xl text-sm font-bold ${empresaAtiva.id===e.id ? "bg-emerald-500 text-white" : "bg-slate-100"}`}>{e.nome}</button>
            ))}
          </div>
        )}
        {user.tipo === "cliente" && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border mb-6"><span className="text-xs font-bold bg-slate-800 text-white px-2 py-1 rounded-full">CLIENTE</span> <span className="text-sm ml-2">{empresaExibir.nome}</span></div>
        )}

        {aba === "inicio" && (
          <>
            <h1 className="text-2xl font-bold text-slate-800">Olá, Cristiano! 👋</h1>
            <p className="text-slate-500 text-sm">Bem-vindo de volta ao seu painel SST • <b>{empresaExibir.nome}</b></p>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
              <div className="bg-emerald-500 text-white p-4 rounded-xl"><p className="text-xs opacity-80">Funcionários</p><p className="text-2xl font-black">{funcsEmpresa.length}</p><p className="text-xs">Cadastrados</p></div>
              <div className="bg-blue-500 text-white p-4 rounded-xl"><p className="text-xs opacity-80">EPI's</p><p className="text-2xl font-black">{episFiltrados.length}</p><p className="text-xs">Entregues</p></div>
              <div className="bg-red-500 text-white p-4 rounded-xl"><p className="text-xs opacity-80">Extintores</p><p className="text-2xl font-black">{extFiltrados.length}</p><p className="text-xs">Cadastrados</p></div>
              <div className="bg-orange-400 text-white p-4 rounded-xl"><p className="text-xs opacity-80">Inspeções</p><p className="text-2xl font-black">{inspFiltrados.length}</p><p className="text-xs">Realizadas</p></div>
              <div className="bg-slate-800 text-white p-4 rounded-xl"><p className="text-xs opacity-80">Documentos</p><p className="text-2xl font-black">{docsFiltrados.length}</p><p className="text-xs">Cadastrados</p></div>
            </div>
            <div className="bg-white rounded-2xl p-6 mt-6 shadow-sm border">
              <h2 className="font-bold text-lg text-slate-800">🎉 PREVIX Completo!</h2>
              <p className="text-sm text-slate-500 mt-2">Todas as abas funcionando e salvando no navegador ✅ Funcionários, EPI's, Extintores, Inspeções, Documentos e Exames.</p>
            </div>
          </>
        )}

        {aba === "funcionarios" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="font-bold text-xl">👷 Funcionários - {empresaExibir.nome}</h2>
            <p className="text-sm text-slate-500 mt-1">{funcFiltrados.length} funcionários desta empresa • Salvo automaticamente ✅</p>
            <input value={buscaFunc} onChange={e=>setBuscaFunc(e.target.value)} placeholder="🔍 Buscar por nome..." className="w-full p-3 border rounded-xl outline-none mt-4" />
            <div className="flex flex-wrap gap-2 mt-3">
              <input value={novoFuncNome} onChange={e=>setNovoFuncNome(e.target.value)} placeholder="Nome completo" className="flex-1 min-w-[180px] p-3 border rounded-xl outline-none" />
              <select value={novoFuncFuncao} onChange={e=>setNovoFuncFuncao(e.target.value)} className="p-3 border rounded-xl">
                <option>Pedreiro</option><option>Servente</option><option>Mestre de Obras</option><option>Eletricista</option><option>Engenheiro</option><option>Carpinteiro</option><option>Armador</option><option>Encarregado</option>
              </select>
              <button onClick={()=>{
                if(!novoFuncNome) return
                setFuncionarios([...funcionarios, { id: Date.now(), nome: novoFuncNome, funcao: novoFuncFuncao, empresa: empresaExibir.id, status: "Ativo" }])
                setNovoFuncNome("")
              }} className="bg-emerald-500 text-white px-4 rounded-xl font-bold">+ Adicionar</button>
            </div>
            <div className="mt-4 space-y-2">
              {funcFiltrados.map(f => (
                <div key={f.id} className="flex justify-between items-center border p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center font-black">{f.nome.charAt(0)}</div>
                    <div><p className="font-bold text-sm">{f.nome}</p><p className="text-xs text-slate-500">{f.funcao}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>{
                      const novoStatus = f.status === "Ativo" ? "Afastado" : "Ativo"
                      setFuncionarios(funcionarios.map(x=>x.id===f.id ? {...x, status: novoStatus} : x))
                    }} className={`text-xs font-bold px-2 py-1 rounded-full ${f.status==="Ativo" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>{f.status} • Trocar</button>
                    <button onClick={()=>setFuncionarios(funcionarios.filter(x=>x.id!==f.id))} className="text-red-500 text-xs font-bold px-2">Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {aba === "epis" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="font-bold text-xl">🦺 EPI's - {empresaExibir.nome}</h2>
            <p className="text-sm text-slate-500 mt-1">{episFiltrados.length} entregas desta empresa • Salvo automaticamente ✅</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <select value={novoEpiFunc} onChange={e=>setNovoEpiFunc(e.target.value)} className="flex-1 min-w-[180px] p-3 border rounded-xl">
                <option value="">Selecione o funcionário...</option>
                {funcsEmpresa.map(f=><option key={f.id} value={f.nome}>{f.nome} - {f.funcao}</option>)}
              </select>
              <select value={novoEpiTipo} onChange={e=>setNovoEpiTipo(e.target.value)} className="p-3 border rounded-xl">
                <option>Capacete</option><option>Luva de Segurança</option><option>Óculos de Proteção</option><option>Protetor Auricular</option><option>Máscara PFF2</option><option>Bota de Segurança</option><option>Cinto de Segurança</option><option>Colete Refletivo</option>
              </select>
              <button onClick={()=>{
                if(!novoEpiFunc) { alert("Selecione o funcionário"); return }
                setEpis([...epis, { id: Date.now(), funcionario: novoEpiFunc, epi: novoEpiTipo, empresa: empresaExibir.id, data: new Date().toLocaleDateString("pt-BR"), status: "Entregue" }])
                setNovoEpiFunc("")
              }} className="bg-emerald-500 text-white px-4 rounded-xl font-bold">+ Entregar</button>
            </div>
            <div className="mt-4 space-y-2">
              {episFiltrados.map(ep => (
                <div key={ep.id} className="flex justify-between items-center border p-3 rounded-xl">
                  <div><p className="font-bold text-sm">{ep.funcionario} - {ep.epi}</p><p className="text-xs text-slate-500">Data: {ep.data}</p></div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{ep.status}</span>
                    <button onClick={()=>setEpis(epis.filter(x=>x.id!==ep.id))} className="text-red-500 text-xs font-bold px-2">Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {aba === "extintores" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="font-bold text-xl">🧯 Extintores - {empresaExibir.nome}</h2>
            <p className="text-sm text-slate-500 mt-1">{extFiltrados.length} extintores desta empresa • Salvo automaticamente ✅</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <select value={novoExtTipo} onChange={e=>setNovoExtTipo(e.target.value)} className="p-3 border rounded-xl">
                <option>PQS - 4kg</option><option>PQS - 6kg</option><option>CO2 - 6kg</option><option>Água - 10L</option><option>Espuma - 10L</option>
              </select>
              <input value={novoExtLocal} onChange={e=>setNovoExtLocal(e.target.value)} placeholder="Local: ex: Almoxarifado" className="flex-1 min-w-[180px] p-3 border rounded-xl outline-none" />
              <input value={novoExtVenc} onChange={e=>setNovoExtVenc(e.target.value)} placeholder="Venc: 10/12/2026" className="p-3 border rounded-xl outline-none w-[140px]" />
              <button onClick={()=>{
                if(!novoExtLocal) { alert("Digite o local"); return }
                setExtintores([...extintores, { id: Date.now(), tipo: novoExtTipo, local: novoExtLocal, empresa: empresaExibir.id, vencimento: novoExtVenc || "A definir", status: "Em dia" }])
                setNovoExtLocal(""); setNovoExtVenc("")
              }} className="bg-red-500 text-white px-4 rounded-xl font-bold">+ Adicionar</button>
            </div>
            <div className="mt-4 space-y-2">
              {extFiltrados.map(ex => (
                <div key={ex.id} className="flex justify-between items-center border p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 text-2xl rounded-full flex items-center justify-center">🧯</div>
                    <div><p className="font-bold text-sm">{ex.tipo} - {ex.local}</p><p className="text-xs text-slate-500">Vencimento: {ex.vencimento}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>{
                      const novoStatus = ex.status === "Em dia" ? "Vencendo" : ex.status === "Vencendo" ? "Vencido" : "Em dia"
                      setExtintores(extintores.map(x=>x.id===ex.id ? {...x, status: novoStatus} : x))
                    }} className={`text-xs font-bold px-2 py-1 rounded-full ${ex.status==="Em dia" ? "bg-emerald-100 text-emerald-700" : ex.status==="Vencendo" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>{ex.status} • Trocar</button>
                    <button onClick={()=>setExtintores(extintores.filter(x=>x.id!==ex.id))} className="text-red-500 text-xs font-bold px-2">Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {aba === "inspecoes" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="font-bold text-xl">📋 Inspeções - {empresaExibir.nome}</h2>
            <p className="text-sm text-slate-500 mt-1">{inspFiltrados.length} inspeções desta empresa • Salvo automaticamente ✅</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <input value={novaInspTitulo} onChange={e=>setNovaInspTitulo(e.target.value)} placeholder="O que foi inspecionado? ex: Uso de EPI" className="flex-1 min-w-[200px] p-3 border rounded-xl outline-none" />
              <input value={novaInspLocal} onChange={e=>setNovaInspLocal(e.target.value)} placeholder="Local: ex: Bloco A" className="flex-1 min-w-[160px] p-3 border rounded-xl outline-none" />
              <button onClick={()=>{
                if(!novaInspTitulo) { alert("Digite o que foi inspecionado"); return }
                setInspecoes([...inspecoes, { id: Date.now(), titulo: novaInspTitulo, local: novaInspLocal || "Obra", empresa: empresaExibir.id, data: new Date().toLocaleDateString("pt-BR"), status: "Conforme" }])
                setNovaInspTitulo(""); setNovaInspLocal("")
              }} className="bg-emerald-500 text-white px-4 rounded-xl font-bold">+ Registrar</button>
            </div>
            <div className="mt-4 space-y-2">
              {inspFiltrados.map(insp => (
                <div key={insp.id} className="flex justify-between items-center border p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${insp.status==="Conforme" ? "bg-emerald-100" : insp.status==="Não Conforme" ? "bg-red-100" : "bg-orange-100"}`}>{insp.status==="Conforme" ? "✅" : insp.status==="Não Conforme" ? "❌" : "⚠️"}</div>
                    <div><p className="font-bold text-sm">{insp.titulo}</p><p className="text-xs text-slate-500">{insp.local} • {insp.data}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>{
                      const novoStatus = insp.status === "Conforme" ? "Não Conforme" : insp.status === "Não Conforme" ? "Pendente" : "Conforme"
                      setInspecoes(inspecoes.map(x=>x.id===insp.id ? {...x, status: novoStatus} : x))
                    }} className={`text-xs font-bold px-2 py-1 rounded-full ${insp.status==="Conforme" ? "bg-emerald-100 text-emerald-700" : insp.status==="Não Conforme" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>{insp.status} • Trocar</button>
                    <button onClick={()=>setInspecoes(inspecoes.filter(x=>x.id!==insp.id))} className="text-red-500 text-xs font-bold px-2">Excluir</button>
                  </div>
                </div>
              ))}
              {inspFiltrados.length===0 && <p className="text-sm text-slate-400">Nenhuma inspeção ainda. Registre a primeira acima.</p>}
            </div>
          </div>
        )}

        {aba === "documentos" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="font-bold text-xl">📄 Documentos - {empresaExibir.nome}</h2>
            <p className="text-sm text-slate-500 mt-1">{docsFiltrados.length} documentos desta empresa • Salvo automaticamente ✅</p>
            <div className="flex gap-2 mt-4">
              <input value={novoDoc} onChange={e=>setNovoDoc(e.target.value)} placeholder="Nome do documento ex: PGR 2027" className="flex-1 p-3 border rounded-xl outline-none" />
              <button onClick={()=>{
                if(!novoDoc) return
                setDocumentos([...documentos, { id: Date.now(), nome: novoDoc, empresa: empresaExibir.id, vencimento: "A definir", status: "Em dia" }])
                setNovoDoc("")
              }} className="bg-emerald-500 text-white px-4 rounded-xl font-bold">+ Adicionar</button>
            </div>
            <div className="mt-4 space-y-2">
              {docsFiltrados.map(d => (
                <div key={d.id} className="flex justify-between items-center border p-3 rounded-xl">
                  <div><p className="font-bold text-sm">{d.nome}</p><p className="text-xs text-slate-500">Vencimento: {d.vencimento}</p></div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${d.status==="Em dia" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>{d.status}</span>
                    <button onClick={()=>setDocumentos(documentos.filter(x=>x.id!==d.id))} className="text-red-500 text-xs font-bold px-2">Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {aba === "exames" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="font-bold text-xl">🩺 Exames - {empresaExibir.nome}</h2>
            <p className="text-sm text-slate-500 mt-1">{examesFiltrados.length} exames desta empresa • Salvo automaticamente ✅</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <input list="lista-func" value={novoExameNome} onChange={e=>setNovoExameNome(e.target.value)} placeholder="Nome do funcionário" className="flex-1 min-w-[180px] p-3 border rounded-xl outline-none" />
              <datalist id="lista-func">{funcsEmpresa.map(f=><option key={f.id} value={f.nome} />)}</datalist>
              <select value={novoExameTipo} onChange={e=>setNovoExameTipo(e.target.value)} className="p-3 border rounded-xl">
                <option>Periódico</option><option>Admissional</option><option>Demissional</option><option>Retorno ao Trabalho</option>
              </select>
              <button onClick={()=>{
                if(!novoExameNome) return
                setExames([...exames, { id: Date.now(), funcionario: novoExameNome, tipo: novoExameTipo, empresa: empresaExibir.id, data: "A agendar", status: "Pendente" }])
                setNovoExameNome("")
              }} className="bg-emerald-500 text-white px-4 rounded-xl font-bold">+ Agendar</button>
            </div>
            <div className="mt-4 space-y-2">
              {examesFiltrados.map(ex => (
                <div key={ex.id} className="flex justify-between items-center border p-3 rounded-xl">
                  <div><p className="font-bold text-sm">{ex.funcionario} - {ex.tipo}</p><p className="text-xs text-slate-500">Data: {ex.data}</p></div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${ex.status==="Apto" ? "bg-emerald-100 text-emerald-700" : ex.status==="Agendado" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>{ex.status}</span>
                    <button onClick={()=>setExames(exames.filter(x=>x.id!==ex.id))} className="text-red-500 text-xs font-bold px-2">Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}