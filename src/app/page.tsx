"use client";
import { useState, useEffect } from "react";

type AnyItem = any;

export default function Page() {
  const [logged, setLogged] = useState(false);
  const [tab, setTab] = useState("extintores");
  const [showModal, setShowModal] = useState("");
  const [searchExt, setSearchExt] = useState("");

  // DADOS - TUDO SALVO COM A MESMA CHAVE
  const [funcionarios, setFuncionarios] = useState<AnyItem[]>([]);
  const [extintores, setExtintores] = useState<AnyItem[]>([]);
  const [epis, setEpis] = useState<AnyItem[]>([]);
  const [inspecoes, setInspecoes] = useState<AnyItem[]>([]);
  const [exames, setExames] = useState<AnyItem[]>([]);
  const [clinicas, setClinicas] = useState<AnyItem[]>([{ nome: "Bio Proteção", cidade: "Maceió - AL" }]);
  const [pgr, setPgr] = useState<AnyItem[]>([]);
  const [financeiro, setFinanceiro] = useState<AnyItem[]>([]);

  // FORMULARIOS
  const [fNome, setFNome] = useState("");
  const [fCargo, setFCargo] = useState("");
  const [eLocal, setELocal] = useState("");
  const [eTipo, setETipo] = useState("PQS 6kg");
  const [eValidade, setEValidade] = useState("");
  const [eCodigo, setECodigo] = useState("");
  const [epiFunc, setEpiFunc] = useState("");
  const [epiItem, setEpiItem] = useState("");
  const [exFunc, setExFunc] = useState("");
  const [exTipo, setExTipo] = useState("Periódico");
  const [inspLocal, setInspLocal] = useState("");

  // CARREGAR DO NAVEGADOR - SÓ DEPOIS QUE ABRIR A PÁGINA
  useEffect(() => {
    const load = (key: string, setter: any) => {
      try {
        const v = localStorage.getItem(key);
        if (v) setter(JSON.parse(v));
      } catch {}
    };
    load("previx_func", setFuncionarios);
    load("previx_extintores", setExtintores);
    load("previx_epis", setEpis);
    load("previx_inspecoes", setInspecoes);
    load("previx_exames", setExames);
    load("previx_pgr", setPgr);
    load("previx_fin", setFinanceiro);
  }, []);

  const save = (key: string, arr: AnyItem[], setter: any) => {
    setter(arr);
    localStorage.setItem(key, JSON.stringify(arr));
  };

  // ===== SALVAR EXTINTOR - CORRIGIDO =====
  const saveExtintor = () => {
    if (!eLocal.trim()) { alert("Preencha o local"); return; }
    const novo = { local: eLocal, tipo: eTipo, validade: eValidade, codigo: eCodigo };
    const novoArr = [...extintores, novo];
    save("previx_extintores", novoArr, setExtintores);
    setELocal(""); setECodigo(""); setEValidade("");
    setShowModal("");
    alert("Extintor salvo com sucesso!");
  };

  const saveFunc = () => {
    if (!fNome.trim()) { alert("Preencha o nome"); return; }
    const novoArr = [...funcionarios, { nome: fNome, cargo: fCargo }];
    save("previx_func", novoArr, setFuncionarios);
    setFNome(""); setFCargo(""); setShowModal("");
    alert("Funcionário salvo!");
  };

  const saveEpi = () => {
    if (!epiFunc.trim()) { alert("Preencha o funcionário"); return; }
    const novoArr = [...epis, { func: epiFunc, item: epiItem }];
    save("previx_epis", novoArr, setEpis);
    setEpiFunc(""); setEpiItem(""); setShowModal("");
    alert("EPI salvo!");
  };

  const saveExame = () => {
    if (!exFunc.trim()) { alert("Preencha o funcionário"); return; }
    const novoArr = [...exames, { func: exFunc, tipo: exTipo }];
    save("previx_exames", novoArr, setExames);
    setExFunc(""); setShowModal("");
    alert("Exame salvo!");
  };

  const saveInsp = () => {
    if (!inspLocal.trim()) { alert("Preencha o local"); return; }
    const novoArr = [...inspecoes, { local: inspLocal }];
    save("previx_inspecoes", novoArr, setInspecoes);
    setInspLocal(""); setShowModal("");
    alert("Inspeção salva!");
  };

  const del = (key: string, arr: AnyItem[], setter: any, idx: number) => {
    const novo = arr.filter((_, i) => i !== idx);
    save(key, novo, setter);
  };

  // ===== TELA DE LOGIN - LOGO VERMELHA =====
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
          <button onClick={() => setLogged(true)} className="w-full py-3.5 rounded-xl font-bold mt-5 text-white" style={{ background: "#DC2626" }}>
            Entrar no Painel →
          </button>
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

  const filteredExt = extintores.filter((e: any) =>
    (e.local + " " + e.tipo).toLowerCase().includes(searchExt.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: "#EAFcff" }}>
      {/* BARRA SUPERIOR IGUAL DA TUA FOTO */}
      <header className="sticky top-0 z-40" style={{ background: "linear-gradient(90deg,#0D9488,#2563EB)" }}>
        <div className="flex gap-2 overflow-x-auto p-2 px-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="whitespace-nowrap px-3 py-2 rounded-full text-[13px] font-bold"
              style={tab === t.id ? { background: "white", color: "#0F766E" } : { background: "rgba(255,255,255,.15)", color: "white" }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-3 md:p-6 max-w-[1100px] mx-auto">
        {/* INICIO */}
        {tab === "inicio" && (
          <div className="bg-white rounded-[20px] p-6 shadow-sm">
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

        {/* EXTINTORES - A TELA DA FOTO */}
        {tab === "extintores" && (
          <div className="bg-white rounded-[20px] p-5 md:p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-[22px] font-black">Extintores</h2>
                <p className="text-sm text-slate-500 mt-1">Total: {extintores.length}</p>
              </div>
              <button onClick={() => setShowModal("ext")} className="text-white px-4 py-3 rounded-[14px] font-bold text-sm" style={{ background: "linear-gradient(135deg,#0D9488,#2563EB)" }}>+ Adicionar</button>
            </div>
            <input value={searchExt} onChange={(e) => setSearchExt(e.target.value)} placeholder="Buscar em extintores..." className="mt-4 w-full border rounded-xl p-3" />
            <div className="mt-4 space-y-3">
              {filteredExt.length === 0 ? (
                <div className="border-2 border-dashed rounded-2xl p-6 text-center text-sm">Nenhum registro aqui ainda. Clica em + Adicionar.</div>
              ) : (
                filteredExt.map((e: any, i: number) => (
                  <div key={i} className="border rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold">🧯 {e.tipo} - {e.local}</p>
                      <p className="text-xs text-slate-500">Código: {e.codigo || "-"} • Venc: {e.validade || "-"}</p>
                    </div>
                    <button onClick={() => del("previx_extintores", extintores, setExtintores, extintores.indexOf(e))} className="text-red-500 text-sm font-bold">Excluir</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* FUNCIONARIOS */}
        {tab === "funcionarios" && (
          <div className="bg-white rounded-[20px] p-6">
            <div className="flex justify-between"><h2 className="text-[22px] font-black">Funcionários - Total: {funcionarios.length}</h2><button onClick={() => setShowModal("func")} className="text-white px-4 py-2 rounded-xl font-bold text-sm" style={{ background: "linear-gradient(135deg,#0D9488,#2563EB)" }}>+ Adicionar</button></div>
            <div className="mt-4 space-y-3">{funcionarios.length === 0 ? <div className="border-2 border-dashed rounded-2xl p-6 text-center text-sm">Nenhum registro ainda.</div> : funcionarios.map((f: any, i: number) => (<div key={i} className="border rounded-2xl p-4 flex justify-between"><p className="font-bold">{f.nome} <span className="text-xs text-slate-500 font-normal">• {f.cargo}</span></p><button onClick={() => del("previx_func", funcionarios, setFuncionarios, i)} className="text-red-500 text-sm font-bold">Excluir</button></div>))}</div>
          </div>
        )}

        {/* EPIS */}
        {tab === "epis" && (
          <div className="bg-white rounded-[20px] p-6">
            <div className="flex justify-between"><h2 className="text-[22px] font-black">EPI&apos;s - Total: {epis.length}</h2><button onClick={() => setShowModal("epi")} className="text-white px-4 py-2 rounded-xl font-bold text-sm" style={{ background: "linear-gradient(135deg,#0D9488,#2563EB)" }}>+ Adicionar</button></div>
            <div className="mt-4 space-y-3">{epis.length === 0 ? <div className="border-2 border-dashed rounded-2xl p-6 text-center text-sm">Nenhum registro ainda.</div> : epis.map((e: any, i: number) => (<div key={i} className="border rounded-2xl p-4 flex justify-between"><p className="font-bold">{e.item} - {e.func}</p><button onClick={() => del("previx_epis", epis, setEpis, i)} className="text-red-500 text-sm font-bold">Excluir</button></div>))}</div>
          </div>
        )}

        {/* INSPECOES */}
        {tab === "inspecoes" && (
          <div className="bg-white rounded-[20px] p-6">
            <div className="flex justify-between"><h2 className="text-[22px] font-black">Inspeções - Total: {inspecoes.length}</h2><button onClick={() => setShowModal("insp")} className="text-white px-4 py-2 rounded-xl font-bold text-sm" style={{ background: "linear-gradient(135deg,#0D9488,#2563EB)" }}>+ Adicionar</button></div>
            <div className="mt-4 space-y-3">{inspecoes.length === 0 ? <div className="border-2 border-dashed rounded-2xl p-6 text-center text-sm">Nenhum registro ainda.</div> : inspecoes.map((e: any, i: number) => (<div key={i} className="border rounded-2xl p-4 flex justify-between"><p className="font-bold">{e.local}</p><button onClick={() => del("previx_inspecoes", inspecoes, setInspecoes, i)} className="text-red-500 text-sm font-bold">Excluir</button></div>))}</div>
          </div>
        )}

        {/* DOCUMENTOS */}
        {tab === "documentos" && (
          <div className="bg-white rounded-[20px] p-6">
            <h2 className="text-[22px] font-black">Documentos - Norte Vidros</h2>
            <div className="mt-4 space-y-3">
              <div className="border rounded-2xl p-4"><p className="font-bold">📄 PGR - Programa de Gerenciamento de Riscos</p><p className="text-xs text-slate-500">Válido até 10/11/2027 • Bio Proteção</p></div>
              <div className="border rounded-2xl p-4"><p className="font-bold">🩺 PCMSO</p><p className="text-xs text-slate-500">Parceiro: Bio Proteção • Maceió</p></div>
            </div>
          </div>
        )}

        {/* EXAMES */}
        {tab === "exames" && (
          <div className="bg-white rounded-[20px] p-6">
            <div className="flex justify-between"><h2 className="text-[22px] font-black">Exames - Total: {exames.length}</h2><button onClick={() => setShowModal("exame")} className="text-white px-4 py-2 rounded-xl font-bold text-sm" style={{ background: "linear-gradient(135deg,#0D9488,#2563EB)" }}>+ Adicionar</button></div>
            <div className="mt-4 space-y-3">{exames.length === 0 ? <div className="border-2 border-dashed rounded-2xl p-6 text-center text-sm">Nenhum registro ainda.</div> : exames.map((e: any, i: number) => (<div key={i} className="border rounded-2xl p-4 flex justify-between"><p className="font-bold">{e.tipo} - {e.func}</p><button onClick={() => del("previx_exames", exames, setExames, i)} className="text-red-500 text-sm font-bold">Excluir</button></div>))}</div>
          </div>
        )}

        {/* CLINICAS */}
        {tab === "clinicas" && (
          <div className="bg-white rounded-[20px] p-6">
            <h2 className="text-[22px] font-black">Clínicas</h2>
            <div className="mt-4 space-y-3">{clinicas.map((c: any, i: number) => (<div key={i} className="border rounded-2xl p-4"><p className="font-bold">🏥 {c.nome}</p><p className="text-xs text-slate-500">{c.cidade}</p></div>))}</div>
          </div>
        )}

        {/* PGR */}
        {tab === "pgr" && (
          <div className="bg-white rounded-[20px] p-6">
            <h2 className="text-[22px] font-black">PGR / Riscos</h2>
            <p className="text-sm text-slate-500 mt-2">Gestão de riscos da Norte Vidros - Corte de Vidro, Instalação, etc.</p>
          </div>
        )}

        {/* FINANCEIRO */}
        {tab === "financeiro" && (
          <div className="bg-white rounded-[20px] p-6">
            <h2 className="text-[22px] font-black">Financeiro</h2>
            <p className="text-sm text-slate-500 mt-2">Mensalidades e lançamentos da Norte Vidros.</p>
          </div>
        )}
      </main>

      {/* MODAL EXTINTOR */}
      {showModal === "ext" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6">
            <h3 className="font-black text-lg">Novo Extintor</h3>
            <input value={eLocal} onChange={(e) => setELocal(e.target.value)} placeholder="Local - ex: Oficina" className="mt-4 w-full border rounded-xl p-3" />
            <select value={eTipo} onChange={(e) => setETipo(e.target.value)} className="mt-2 w-full border rounded-xl p-3"><option>PQS 6kg</option><option>CO2 6kg</option><option>Água 10L</option><option>PQS 4kg</option></select>
            <input type="date" value={eValidade} onChange={(e) => setEValidade(e.target.value)} className="mt-2 w-full border rounded-xl p-3" />
            <input value={eCodigo} onChange={(e) => setECodigo(e.target.value)} placeholder="Código / Nº" className="mt-2 w-full border rounded-xl p-3" />
            <div className="flex gap-2 mt-4"><button onClick={saveExtintor} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "#DC2626" }}>Salvar Extintor</button><button onClick={() => setShowModal("")} className="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div>
          </div>
        </div>
      )}

      {/* MODAL FUNC */}
      {showModal === "func" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6">
            <h3 className="font-black text-lg">Novo Funcionário</h3>
            <input value={fNome} onChange={(e) => setFNome(e.target.value)} placeholder="Nome completo" className="mt-4 w-full border rounded-xl p-3" />
            <input value={fCargo} onChange={(e) => setFCargo(e.target.value)} placeholder="Cargo - ex: Vidraceiro" className="mt-2 w-full border rounded-xl p-3" />
            <div className="flex gap-2 mt-4"><button onClick={saveFunc} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "#DC2626" }}>Salvar</button><button onClick={() => setShowModal("")} className="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div>
          </div>
        </div>
      )}

      {/* MODAL EPI */}
      {showModal === "epi" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6">
            <h3 className="font-black text-lg">Novo EPI</h3>
            <input value={epiFunc} onChange={(e) => setEpiFunc(e.target.value)} placeholder="Funcionário" className="mt-4 w-full border rounded-xl p-3" />
            <input value={epiItem} onChange={(e) => setEpiItem(e.target.value)} placeholder="EPI - ex: Óculos, Luva" className="mt-2 w-full border rounded-xl p-3" />
            <div className="flex gap-2 mt-4"><button onClick={saveEpi} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "#DC2626" }}>Salvar</button><button onClick={() => setShowModal("")} className="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div>
          </div>
        </div>
      )}

      {/* MODAL EXAME */}
      {showModal === "exame" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6">
            <h3 className="font-black text-lg">Novo Exame</h3>
            <input value={exFunc} onChange={(e) => setExFunc(e.target.value)} placeholder="Funcionário" className="mt-4 w-full border rounded-xl p-3" />
            <select value={exTipo} onChange={(e) => setExTipo(e.target.value)} className="mt-2 w-full border rounded-xl p-3"><option>Admissional</option><option>Periódico</option><option>Demissional</option></select>
            <div className="flex gap-2 mt-4"><button onClick={saveExame} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "#DC2626" }}>Salvar</button><button onClick={() => setShowModal("")} className="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div>
          </div>
        </div>
      )}

      {/* MODAL INSPECAO */}
      {showModal === "insp" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6">
            <h3 className="font-black text-lg">Nova Inspeção</h3>
            <input value={inspLocal} onChange={(e) => setInspLocal(e.target.value)} placeholder="Local inspecionado" className="mt-4 w-full border rounded-xl p-3" />
            <div className="flex gap-2 mt-4"><button onClick={saveInsp} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "#DC2626" }}>Salvar</button><button onClick={() => setShowModal("")} className="bg-slate-100 flex-1 py-3 rounded-xl font-bold">Cancelar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}