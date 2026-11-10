"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [logged, setLogged] = useState(false);
  const [tab, setTab] = useState("inicio");
  const [modal, setModal] = useState("");

  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [epis, setEpis] = useState<any[]>([]);
  const [extintores, setExtintores] = useState<any[]>([]);
  const [inspecoes, setInspecoes] = useState<any[]>([]);
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [exames, setExames] = useState<any[]>([]);
  const [clinicas, setClinicas] = useState<any[]>([{ nome: "Bio Proteção", cidade: "Maceió - AL" }]);
  const [pgr, setPgr] = useState<any[]>([]);
  const [financeiro, setFinanceiro] = useState<any[]>([]);

  const [fNome, setFNome] = useState("");
  const [fCargo, setFCargo] = useState("");
  const [eLocal, setELocal] = useState("");
  const [eTipo, setETipo] = useState("PQS 6kg");
  const [eVal, setEVal] = useState("");
  const [epiFunc, setEpiFunc] = useState("");
  const [epiItem, setEpiItem] = useState("");
  const [inspLocal, setInspLocal] = useState("");
  const [docTipo, setDocTipo] = useState("PGR");
  const [exFunc, setExFunc] = useState("");
  const [exTipo, setExTipo] = useState("Periódico");
  const [cliNome, setCliNome] = useState("");
  const [pgrSetor, setPgrSetor] = useState("");
  const [pgrRisco, setPgrRisco] = useState("");
  const [finDesc, setFinDesc] = useState("");
  const [finValor, setFinValor] = useState("");
  const [buscaExt, setBuscaExt] = useState("");

  useEffect(() => {
    try {
      const g = (k: string) => { const v = localStorage.getItem(k); return v ? JSON.parse(v) : []; };
      setFuncionarios(g("previx_func"));
      setEpis(g("previx_epis"));
      setExtintores(g("previx_extintores"));
      setInspecoes(g("previx_inspecoes"));
      setDocumentos(g("previx_docs"));
      setExames(g("previx_exames"));
      setPgr(g("previx_pgr"));
      setFinanceiro(g("previx_fin"));
      const c = localStorage.getItem("previx_clinicas");
      if (c) setClinicas(JSON.parse(c));
    } catch {}
  }, []);

  const salvar = (key: string, arr: any[], set: any) => { set(arr); localStorage.setItem(key, JSON.stringify(arr)); };
  const excluir = (key: string, arr: any[], set: any, i: number) => { const n = arr.filter((_, x) => x !== i); salvar(key, n, set); };
  const fechar = () => setModal("");

  // ===== ADICIONAR - TODOS FUNCIONANDO =====
  const addFunc = () => { if (!fNome.trim()) return alert("Preencha o nome"); salvar("previx_func", [...funcionarios, { nome: fNome, cargo: fCargo }], setFuncionarios); setFNome(""); setFCargo(""); fechar(); alert("Funcionário salvo!"); };
  const addEpi = () => { if (!epiFunc.trim()) return alert("Preencha o funcionário"); salvar("previx_epis", [...epis, { func: epiFunc, item: epiItem }], setEpis); setEpiFunc(""); setEpiItem(""); fechar(); alert("EPI salvo!"); };
  const addExt = () => { if (!eLocal.trim()) return alert("Preencha o local"); salvar("previx_extintores", [...extintores, { local: eLocal, tipo: eTipo, validade: eVal }], setExtintores); setELocal(""); setEVal(""); fechar(); alert("Extintor salvo!"); };
  const addInsp = () => { if (!inspLocal.trim()) return alert("Preencha o local"); salvar("previx_inspecoes", [...inspecoes, { local: inspLocal }], setInspecoes); setInspLocal(""); fechar(); alert("Inspeção salva!"); };
  const addDoc = () => { salvar("previx_docs", [...documentos, { tipo: docTipo }], setDocumentos); fechar(); alert("Documento salvo!"); };
  const addExame = () => { if (!exFunc.trim()) return alert("Preencha o funcionário"); salvar("previx_exames", [...exames, { func: exFunc, tipo: exTipo }], setExames); setExFunc(""); fechar(); alert("Exame salvo!"); };
  const addClinica = () => { if (!cliNome.trim()) return alert("Preencha o nome"); salvar("previx_clinicas", [...clinicas, { nome: cliNome, cidade: "" }], setClinicas); setCliNome(""); fechar(); alert("Clínica salva!"); };
  const addPgr = () => { if (!pgrSetor.trim()) return alert("Preencha o setor"); salvar("previx_pgr", [...pgr, { setor: pgrSetor, risco: pgrRisco }], setPgr); setPgrSetor(""); setPgrRisco(""); fechar(); alert("Risco salvo!"); };
  const addFin = () => { if (!finDesc.trim()) return alert("Preencha a descrição"); salvar("previx_fin", [...financeiro, { desc: finDesc, valor: finValor }], setFinanceiro); setFinDesc(""); setFinValor(""); fechar(); alert("Lançamento salvo!"); };

  // ===== LOGIN COM LOGO - MESMO LAYOUT, SÓ TROQUEI A LOGO =====
  if (!logged) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#EAFcff" }}>
        <div className="bg-white w-full max-w-md rounded-[24px] shadow-xl p-8">
          <div className="text-center">
            <div className="w-[72px] h-[72px] mx-auto bg-red-600 rounded-[18px] flex items-center justify-center shadow-lg">
              <span className="text-white text-[32px] font-black">P</span>
            </div>
            <h1 className="text-[44px] leading-none font-black tracking-tight mt-4">
              <span className="text-red-600">PRE</span><span className="text-slate-900">VIX</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Gestão Completa de SST • PGR • PCMSO • eSocial</p>
            <div className="inline-flex bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full mt-3">
              Empresa Ativa: Norte Vidros • Parceiro: Bio Proteção
            </div>
          </div>
          <label className="text-sm font-bold mt-6 block">E-mail</label>
          <input defaultValue="admin@nortevidros.com.br" className="mt-1 w-full border rounded-xl p-3" />
          <label className="text-sm font-bold mt-3 block">Senha</label>
          <input type="password" defaultValue="123456" className="mt-1 w-full border rounded-xl p-3" />
          <button onClick={() => setLogged(true)} className="w-full py-3.5 rounded-xl font-bold mt-5 text-white" style={{ background: "#DC2626" }}>Entrar no Painel →</button>
          <p className="text-center text-xs text-slate-400 mt-3">Demo: admin@nortevidros.com.br / 123456</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "inicio", label: "🏠 Início" },
    { id: "funcionarios", label: "👷 Funcionários" },
    { id: "epis", label: "🎒 EPI's" },
    { id: "extintores", label: "🧯 Extintores" },
    { id: "inspecoes", label: "📋 Inspeções" },
    { id: "documentos", label: "📄 Documentos" },
    { id: "exames", label: "🩺 Exames" },
    { id: "clinicas", label: "🏥 Clínicas" },
    { id: "pgr", label: "⚠️ PGR / Riscos" },
    { id: "financeiro", label: "💰 Financeiro" },
  ];

  const inputCls = "w-full border rounded-xl p-3";
  const btnAddCls = "text-white px-4 py-2.5 rounded-[14px] font-bold text-sm";
  const btnAddStyle = { background: "linear-gradient(135deg,#0D9488,#2563EB)" } as any;
  const boxCls = "bg-white rounded-[20px] p-5 md:p-6 shadow-sm";
  const itemCls = "border rounded-2xl p-4 flex justify-between items-center";
  const emptyCls = "border-2 border-dashed rounded-2xl p-6 text-center text-sm";
  const delCls = "text-red-500 text-sm font-bold";

  const listaExt = extintores.filter((e: any) => (e.local + " " + e.tipo).toLowerCase().includes(buscaExt.toLowerCase()));

  return (
    <div className="min-h-screen" style={{ background: "#EAFcff" }}>
      <header className="sticky top-0 z-40" style={{ background: "linear-gradient(90deg,#0D9488,#2563EB)" }}>
        <div className="flex gap-2 overflow-x-auto p-2 px-3">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className="whitespace-nowrap px-3 py-2 rounded-full text-[13px] font-bold" style={tab === t.id ? { background: "white", color: "#0F766E" } : { background: "rgba(255,255,255,.15)", color: "white" }}>{t.label}</button>
          ))}
        </div>
      </header>

      <main className="p-3 md:p-6 max-w-[1100px] mx-auto">
        {tab === "inicio" && (
          <div className={boxCls}>
            <h1 className="text-2xl font-black">Olá, Norte Vidros 👋</h1>
            <p className="text-slate-500 text-sm">Painel geral • Parceiro: Bio Proteção</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              <div className="border rounded-2xl p-4"><p className="text-xs text-slate-500">Funcionários</p><p className="text-2xl font-black">{funcionarios.length}</p></div>
              <div className="border rounded-2xl p-4"><p className="text-xs text-slate-500">Extintores</p><p className="text-2xl font-black text-red-600">{extintores.length}</p></div>
              <div className="border rounded-2xl p-4"><p className="text-xs text-slate-500">EPI&apos;s</p><p className="text-2xl font-black">{epis.length}</p></div>
              <div className="border rounded-2xl p-4"><p className="text-xs text-slate-500">Exames</p><p className="text-2xl font-black">{exames.length}</p></div>
            </div>
          </div>
        )}

        {tab === "funcionarios" && (
          <div className={boxCls}>
            <div className="flex justify-between items-start"><div><h2 className="text-[22px] font-black">Funcionários</h2><p className="text-sm text-slate-500">Total: {funcionarios.length}</p></div><button onClick={() => setModal("func")} className={btnAddCls} style={btnAddStyle}>+ Adicionar</button></div>
            <div className="mt-4 space-y-3">{funcionarios.length === 0 ? <div className={emptyCls}>Nenhum registro ainda.</div> : funcionarios.map((f: any, i: number) => (<div key={i} className={itemCls}><p className="font-bold">{f.nome} <span className="text-xs text-slate-500 font-normal">• {f.cargo}</span></p><button onClick={() => excluir("previx_func", funcionarios, setFuncionarios, i)} className={delCls}>Excluir</button></div>))}</div>
          </div>
        )}

        {tab === "epis" && (
          <div className={boxCls}>
            <div className="flex justify-between items-start"><div><h2 className="text-[22px] font-black">EPI&apos;s</h2><p className="text-sm text-slate-500">Total: {epis.length}</p></div><button onClick={() => setModal("epi")} className={btnAddCls} style={btnAddStyle}>+ Adicionar</button></div>
            <div className="mt-4 space-y-3">{epis.length === 0 ? <div className={emptyCls}>Nenhum registro ainda.</div> : epis.map((e: any, i: number) => (<div key={i} className={itemCls}><p className="font-bold">{e.item} - {e.func}</p><button onClick={() => excluir("previx_epis", epis, setEpis, i)} className={delCls}>Excluir</button></div>))}</div>
          </div>
        )}

        {tab === "extintores" && (
          <div className={boxCls}>
            <div className="flex justify-between items-start"><div><h2 className="text-[22px] font-black">Extintores</h2><p className="text-sm text-slate-500">Total: {extintores.length}</p></div><button onClick={() => setModal("ext")} className={btnAddCls} style={btnAddStyle}>+ Adicionar</button></div>
            <input value={buscaExt} onChange={(e) => setBuscaExt(e.target.value)} placeholder="Buscar em extintores..." className={inputCls + " mt-4"} />
            <div className="mt-4 space-y-3">{listaExt.length === 0 ? <div className={emptyCls}>Nenhum registro aqui ainda. Clica em + Adicionar.</div> : listaExt.map((e: any, i: number) => (<div key={i} className={itemCls}><div><p className="font-bold">🧯 {e.tipo} - {e.local}</p><p className="text-xs text-slate-500">Venc: {e.validade || "-"}</p></div><button onClick={() => excluir("previx_extintores", extintores, setExtintores, extintores.indexOf(e))} className={delCls}>Excluir</button></div>))}</div>
          </div>
        )}

        {tab === "inspecoes" && (
          <div className={boxCls}>
            <div className="flex justify-between items-start"><div><h2 className="text-[22px] font-black">Inspeções</h2><p className="text-sm text-slate-500">Total: {inspecoes.length}</p></div><button onClick={() => setModal("insp")} className={btnAddCls} style={btnAddStyle}>+ Adicionar</button></div>
            <div className="mt-4 space-y-3">{inspecoes.length === 0 ? <div className={emptyCls}>Nenhum registro ainda.</div> : inspecoes.map((e: any, i: number) => (<div key={i} className={itemCls}><p className="font-bold">{e.local}</p><button onClick={() => excluir("previx_inspecoes", inspecoes, setInspecoes, i)} className={delCls}>Excluir</button></div>))}</div>
          </div>
        )}

        {tab === "documentos" && (
          <div className={boxCls}>
            <div className="flex justify-between items-start"><div><h2 className="text-[22px] font-black">Documentos</h2><p className="text-sm text-slate-500">PGR / PCMSO - Norte Vidros</p></div><button onClick={() => setModal("doc")} className={btnAddCls} style={btnAddStyle}>+ Adicionar</button></div>
            <div className="mt-4 space-y-3">
              <div className={itemCls}><div><p className="font-bold">📄 PGR - Norte Vidros</p><p className="text-xs text-slate-500">Válido até 10/11/2027 • Bio Proteção</p></div></div>
              {documentos.map((d: any, i: number) => (<div key={i} className={itemCls}><p className="font-bold">📄 {d.tipo}</p><button onClick={() => excluir("previx_docs", documentos, setDocumentos, i)} className={delCls}>Excluir</button></div>))}
            </div>
          </div>
        )}

        {tab === "exames" && (
          <div className={boxCls}>
            <div className="flex justify-between items-start"><div><h2 className="text-[22px] font-black">Exames</h2><p className="text-sm text-slate-500">Total: {exames.length}</p></div><button onClick={() => setModal("exame")} className={btnAddCls} style={btnAddStyle}>+ Adicionar</button></div>
            <div className="mt-4 space-y-3">{exames.length === 0 ? <div className={emptyCls}>Nenhum registro ainda.</div> : exames.map((e: any, i: number) => (<div key={i} className={itemCls}><p className="font-bold">{e.tipo} - {e.func}</p><button onClick={() => excluir("previx_exames", exames, setExames, i)} className={delCls}>Excluir</button></div>))}</div>
          </div>
        )}

        {tab === "clinicas" && (
          <div className={boxCls}>
            <div className="flex justify-between items-start"><div><h2 className="text-[22px] font-black">Clínicas</h2><p className="text-sm text-slate-500">Parceiras</p></div><button onClick={() => setModal("clinica")} className={btnAddCls} style={btnAddStyle}>+ Adicionar</button></div>
            <div className="mt-4 space-y-3">{clinicas.map((c: any, i: number) => (<div key={i} className={itemCls}><p className="font-bold">🏥 {c.nome} <span className="text-xs text-slate-500 font-normal">{c.cidade}</span></p>{i > 0 && <button onClick={() => excluir("previx_clinicas", clinicas, setClinicas, i)} className={delCls}>Excluir</button>}</div>))}</div>
          </div>
        )}

        {tab === "pgr" && (
          <div className={boxCls}>
            <div className="flex justify-between items-start"><div><h2 className="text-[22px] font-black">PGR / Riscos</h2><p className="text-sm text-slate-500">Total: {pgr.length}</p></div><button onClick={() => setModal("pgr")} className={btnAddCls} style={btnAddStyle}>+ Adicionar</button></div>
            <div className="mt-4 space-y-3">{pgr.length === 0 ? <div className={emptyCls}>Nenhum registro ainda.</div> : pgr.map((e: any, i: number) => (<div key={i} className={itemCls}><p className="font-bold">{e.setor} - {e.risco}</p><button onClick={() => excluir("previx_pgr", pgr, setPgr, i)} className={delCls}>Excluir</button></div>))}</div>
          </div>
        )}

        {tab === "financeiro" && (
          <div className={boxCls}>
            <div className="flex justify-between items-start"><div><h2 className="text-[22px] font-black">Financeiro</h2><p className="text-sm text-slate-500">Total: {financeiro.length}</p></div><button onClick={() => setModal("fin")} className={btnAddCls} style={btnAddStyle}>+ Adicionar</button></div>
            <div className="mt-4 space-y-3">{financeiro.length === 0 ? <div className={emptyCls}>Nenhum registro ainda.</div> : financeiro.map((e: any, i: number) => (<div key={i} className={itemCls}><p className="font-bold">{e.desc} - R$ {e.valor}</p><button onClick={() => excluir("previx_fin", financeiro, setFinanceiro, i)} className={delCls}>Excluir</button></div>))}</div>
          </div>
        )}
      </main>

      {modal !== "" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6">
            {modal === "func" && (<><h3 className="font-black text-lg">Novo Funcionário</h3><input value={fNome} onChange={(e) => setFNome(e.target.value)} placeholder="Nome completo" className={inputCls + " mt-4"} /><input value={fCargo} onChange={(e) => setFCargo(e.target.value)} placeholder="Cargo - ex: Vidraceiro" className={inputCls + " mt-2"} /><div className="flex gap-2 mt-4"><button onClick={addFunc} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "#DC2626" }}>Salvar</button><button onClick={fechar} className="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div></>)}
            {modal === "epi" && (<><h3 className="font-black text-lg">Novo EPI</h3><input value={epiFunc} onChange={(e) => setEpiFunc(e.target.value)} placeholder="Funcionário" className={inputCls + " mt-4"} /><input value={epiItem} onChange={(e) => setEpiItem(e.target.value)} placeholder="EPI - ex: Óculos" className={inputCls + " mt-2"} /><div className="flex gap-2 mt-4"><button onClick={addEpi} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "#DC2626" }}>Salvar</button><button onClick={fechar} className="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div></>)}
            {modal === "ext" && (<><h3 className="font-black text-lg">Novo Extintor</h3><input value={eLocal} onChange={(e) => setELocal(e.target.value)} placeholder="Local - ex: Oficina" className={inputCls + " mt-4"} /><select value={eTipo} onChange={(e) => setETipo(e.target.value)} className={inputCls + " mt-2"}><option>PQS 6kg</option><option>CO2 6kg</option><option>Água 10L</option><option>PQS 4kg</option></select><input type="date" value={eVal} onChange={(e) => setEVal(e.target.value)} className={inputCls + " mt-2"} /><div className="flex gap-2 mt-4"><button onClick={addExt} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "#DC2626" }}>Salvar Extintor</button><button onClick={fechar} className="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div></>)}
            {modal === "insp" && (<><h3 className="font-black text-lg">Nova Inspeção</h3><input value={inspLocal} onChange={(e) => setInspLocal(e.target.value)} placeholder="Local inspecionado" className={inputCls + " mt-4"} /><div className="flex gap-2 mt-4"><button onClick={addInsp} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "#DC2626" }}>Salvar</button><button onClick={fechar} className="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div></>)}
            {modal === "doc" && (<><h3 className="font-black text-lg">Novo Documento</h3><select value={docTipo} onChange={(e) => setDocTipo(e.target.value)} className={inputCls + " mt-4"}><option>PGR</option><option>PCMSO</option><option>LTCAT</option><option>PPP</option></select><div className="flex gap-2 mt-4"><button onClick={addDoc} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "#DC2626" }}>Salvar</button><button onClick={fechar} className="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div></>)}
            {modal === "exame" && (<><h3 className="font-black text-lg">Novo Exame</h3><input value={exFunc} onChange={(e) => setExFunc(e.target.value)} placeholder="Funcionário" className={inputCls + " mt-4"} /><select value={exTipo} onChange={(e) => setExTipo(e.target.value)} className={inputCls + " mt-2"}><option>Admissional</option><option>Periódico</option><option>Demissional</option></select><div className="flex gap-2 mt-4"><button onClick={addExame} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "#DC2626" }}>Salvar</button><button onClick={fechar} className="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div></>)}
            {modal === "clinica" && (<><h3 className="font-black text-lg">Nova Clínica</h3><input value={cliNome} onChange={(e) => setCliNome(e.target.value)} placeholder="Nome - ex: Bio Proteção" className={inputCls + " mt-4"} /><div className="flex gap-2 mt-4"><button onClick={addClinica} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "#DC2626" }}>Salvar</button><button onClick={fechar} className="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div></>)}
            {modal === "pgr" && (<><h3 className="font-black text-lg">Novo Risco - PGR</h3><input value={pgrSetor} onChange={(e) => setPgrSetor(e.target.value)} placeholder="Setor - ex: Corte de Vidro" className={inputCls + " mt-4"} /><input value={pgrRisco} onChange={(e) => setPgrRisco(e.target.value)} placeholder="Risco - ex: Corte" className={inputCls + " mt-2"} /><div className="flex gap-2 mt-4"><button onClick={addPgr} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "#DC2626" }}>Salvar</button><button onClick={fechar} className="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div></>)}
            {modal === "fin" && (<><h3 className="font-black text-lg">Novo Lançamento</h3><input value={finDesc} onChange={(e) => setFinDesc(e.target.value)} placeholder="Descrição" className={inputCls + " mt-4"} /><input value={finValor} onChange={(e) => setFinValor(e.target.value)} placeholder="Valor R$" type="number" className={inputCls + " mt-2"} /><div className="flex gap-2 mt-4"><button onClick={addFin} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "#DC2626" }}>Salvar</button><button onClick={fechar} className="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div></>)}
          </div>
        </div>
      )}
    </div>
  );
}