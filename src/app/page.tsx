"use client";
import { useState, useEffect } from "react";

// ESTILOS FIXOS - NÃO DEPENDE DE TAILWIND, POR ISSO NÃO QUEBRA
const S = {
  page: { minHeight: "100vh", background: "#EAFcff", fontFamily: "Arial, sans-serif" } as any,
  center: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#EAFcff", fontFamily: "Arial, sans-serif" } as any,
  loginCard: { background: "white", width: "100%", maxWidth: 420, borderRadius: 24, padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" } as any,
  logoBox: { width: 72, height: 72, margin: "0 auto", background: "#DC2626", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(220,38,38,0.3)" } as any,
  input: { width: "100%", border: "1px solid #D1D5DB", borderRadius: 12, padding: "12px", marginTop: 6, fontSize: 14, boxSizing: "border-box" as any } as any,
  btnRed: { width: "100%", background: "#DC2626", color: "white", padding: "14px", borderRadius: 12, fontWeight: 800, border: "none", cursor: "pointer", marginTop: 16 } as any,
  header: { position: "sticky" as any, top: 0, zIndex: 40, background: "linear-gradient(90deg,#0D9488,#2563EB)", padding: 8 } as any,
  tabBar: { display: "flex", gap: 8, overflowX: "auto" as any, padding: "2px 4px" } as any,
  card: { background: "white", borderRadius: 20, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" } as any,
  btnAdd: { background: "linear-gradient(135deg,#0D9488,#2563EB)", color: "white", padding: "12px 16px", borderRadius: 14, fontWeight: 700, border: "none", cursor: "pointer", fontSize: 14 } as any,
  item: { border: "1px solid #E5E7EB", borderRadius: 16, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" } as any,
  modalBg: { position: "fixed" as any, inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 } as any,
  modal: { background: "white", width: "100%", maxWidth: 420, borderRadius: 20, padding: 24 } as any,
};

export default function Page() {
  const [logged, setLogged] = useState(false);
  const [tab, setTab] = useState("extintores");
  const [showModal, setShowModal] = useState("");

  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [extintores, setExtintores] = useState<any[]>([]);
  const [epis, setEpis] = useState<any[]>([]);
  const [exames, setExames] = useState<any[]>([]);
  const [searchExt, setSearchExt] = useState("");

  const [fNome, setFNome] = useState("");
  const [fCargo, setFCargo] = useState("");
  const [eLocal, setELocal] = useState("");
  const [eTipo, setETipo] = useState("PQS 6kg");
  const [eValidade, setEValidade] = useState("");
  const [eCodigo, setECodigo] = useState("");
  const [epiFunc, setEpiFunc] = useState("");
  const [epiItem, setEpiItem] = useState("");
  const [exFunc, setExFunc] = useState("");

  useEffect(() => {
    try {
      const f = localStorage.getItem("previx_func"); if (f) setFuncionarios(JSON.parse(f));
      const e = localStorage.getItem("previx_extintores"); if (e) setExtintores(JSON.parse(e));
      const ep = localStorage.getItem("previx_epis"); if (ep) setEpis(JSON.parse(ep));
      const ex = localStorage.getItem("previx_exames"); if (ex) setExames(JSON.parse(ex));
    } catch {}
  }, []);

  const save = (key: string, arr: any[], setter: any) => { setter(arr); localStorage.setItem(key, JSON.stringify(arr)); };

  // ===== CORREÇÃO 1: EXTINTOR AGORA SALVA DE VERDADE =====
  const saveExtintor = () => {
    if (!eLocal.trim()) { alert("Preencha o local"); return; }
    const novoArr = [...extintores, { local: eLocal, tipo: eTipo, validade: eValidade, codigo: eCodigo }];
    save("previx_extintores", novoArr, setExtintores);
    setELocal(""); setECodigo(""); setEValidade("");
    setShowModal(""); alert("Extintor salvo com sucesso!");
  };

  const saveFunc = () => {
    if (!fNome.trim()) { alert("Preencha o nome"); return; }
    save("previx_func", [...funcionarios, { nome: fNome, cargo: fCargo }], setFuncionarios);
    setFNome(""); setFCargo(""); setShowModal(""); alert("Funcionário salvo!");
  };

  const saveEpi = () => {
    if (!epiFunc.trim()) { alert("Preencha o funcionário"); return; }
    save("previx_epis", [...epis, { func: epiFunc, item: epiItem }], setEpis);
    setEpiFunc(""); setEpiItem(""); setShowModal(""); alert("EPI salvo!");
  };

  const saveExame = () => {
    if (!exFunc.trim()) { alert("Preencha o funcionário"); return; }
    save("previx_exames", [...exames, { func: exFunc, tipo: "Periódico" }], setExames);
    setExFunc(""); setShowModal(""); alert("Exame salvo!");
  };

  const del = (key: string, arr: any[], setter: any, idx: number) => {
    const novo = arr.filter((_, i) => i !== idx);
    save(key, novo, setter);
  };

  // ===== CORREÇÃO 2: LOGIN COM LOGO VERMELHA - SEM IMAGEM EXTERNA =====
  if (!logged) {
    return (
      <div style={S.center}>
        <div style={S.loginCard}>
          <div style={{ textAlign: "center" }}>
            <div style={S.logoBox}><span style={{ color: "white", fontSize: 32, fontWeight: 900 }}>P</span></div>
            <h1 style={{ fontSize: 44, margin: "16px 0 0", fontWeight: 900, letterSpacing: -1 }}>
              <span style={{ color: "#DC2626" }}>PRE</span><span style={{ color: "#0F172A" }}>VIX</span>
            </h1>
            <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>Gestão Completa de SST • PGR • PCMSO • eSocial</p>
            <div style={{ display: "inline-block", background: "#FEF2F2", color: "#B91C1C", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 999, marginTop: 12 }}>
              Empresa Ativa: Norte Vidros • Parceiro: Bio Proteção
            </div>
          </div>
          <label style={{ fontSize: 14, fontWeight: 700, marginTop: 20, display: "block" }}>E-mail</label>
          <input defaultValue="admin@nortevidros.com.br" style={S.input} />
          <label style={{ fontSize: 14, fontWeight: 700, marginTop: 12, display: "block" }}>Senha</label>
          <input type="password" defaultValue="123456" style={S.input} />
          <button onClick={() => setLogged(true)} style={S.btnRed}>Entrar no Painel →</button>
          <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", marginTop: 12 }}>Demo: admin@nortevidros.com.br / 123456</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "inicio", label: "🏠 Início" },
    { id: "funcionarios", label: "👷 Funcionários" },
    { id: "epis", label: "🎒 EPI's" },
    { id: "extintores", label: "🧯 Extintores" },
    { id: "exames", label: "🩺 Exames" },
    { id: "documentos", label: "📄 Documentos" },
    { id: "clinicas", label: "🏥 Clínicas" },
  ];

  const filteredExt = extintores.filter((e) => (e.local + " " + e.tipo).toLowerCase().includes(searchExt.toLowerCase()));

  const tabStyle = (active: boolean) => ({
    whiteSpace: "nowrap" as any, padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
    background: active ? "white" : "rgba(255,255,255,0.15)", color: active ? "#0F766E" : "white"
  });

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={S.tabBar}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={tabStyle(tab === t.id)}>{t.label}</button>
          ))}
        </div>
      </header>

      <main style={{ padding: 12, maxWidth: 1100, margin: "0 auto" }}>
        {tab === "inicio" && (
          <div style={S.card}>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Olá, Norte Vidros 👋</h1>
            <p style={{ color: "#64748B", fontSize: 14 }}>Painel geral • Parceiro: Bio Proteção</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
              <div style={{ border: "1px solid #E5E7EB", borderRadius: 16, padding: 16 }}><p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Funcionários</p><p style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>{funcionarios.length}</p></div>
              <div style={{ border: "1px solid #E5E7EB", borderRadius: 16, padding: 16 }}><p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Extintores</p><p style={{ fontSize: 24, fontWeight: 900, margin: 0, color: "#DC2626" }}>{extintores.length}</p></div>
              <div style={{ border: "1px solid #E5E7EB", borderRadius: 16, padding: 16 }}><p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>EPI&apos;s</p><p style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>{epis.length}</p></div>
              <div style={{ border: "1px solid #E5E7EB", borderRadius: 16, padding: 16 }}><p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Exames</p><p style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>{exames.length}</p></div>
            </div>
          </div>
        )}

        {tab === "extintores" && (
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div><h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Extintores</h2><p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Total: {extintores.length}</p></div>
              <button onClick={() => setShowModal("ext")} style={S.btnAdd}>+ Adicionar</button>
            </div>
            <input value={searchExt} onChange={(e) => setSearchExt(e.target.value)} placeholder="Buscar em extintores..." style={{ ...S.input, marginTop: 16 }} />
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredExt.length === 0 ? (
                <div style={{ border: "2px dashed #CBD5E1", borderRadius: 16, padding: 24, textAlign: "center", fontSize: 14 }}>Nenhum registro aqui ainda. Clica em + Adicionar.</div>
              ) : filteredExt.map((e, i) => (
                <div key={i} style={S.item}>
                  <div><p style={{ fontWeight: 800, margin: 0 }}>🧯 {e.tipo} - {e.local}</p><p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Código: {e.codigo || "-"} • Venc: {e.validade || "-"}</p></div>
                  <button onClick={() => del("previx_extintores", extintores, setExtintores, extintores.indexOf(e))} style={{ color: "#EF4444", fontWeight: 700, border: "none", background: "none", cursor: "pointer" }}>Excluir</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "funcionarios" && (
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Funcionários - Total: {funcionarios.length}</h2><button onClick={() => setShowModal("func")} style={S.btnAdd}>+ Adicionar</button></div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {funcionarios.length === 0 ? <div style={{ border: "2px dashed #CBD5E1", borderRadius: 16, padding: 24, textAlign: "center" }}>Nenhum registro ainda.</div> : funcionarios.map((f, i) => (
                <div key={i} style={S.item}><p style={{ fontWeight: 700, margin: 0 }}>{f.nome} <span style={{ fontSize: 12, color: "#64748B", fontWeight: 400 }}>• {f.cargo}</span></p><button onClick={() => del("previx_func", funcionarios, setFuncionarios, i)} style={{ color: "#EF4444", fontWeight: 700, border: "none", background: "none", cursor: "pointer" }}>Excluir</button></div>
              ))}
            </div>
          </div>
        )}

        {tab === "epis" && (
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>EPI&apos;s - Total: {epis.length}</h2><button onClick={() => setShowModal("epi")} style={S.btnAdd}>+ Adicionar</button></div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {epis.length === 0 ? <div style={{ border: "2px dashed #CBD5E1", borderRadius: 16, padding: 24, textAlign: "center" }}>Nenhum registro ainda.</div> : epis.map((e, i) => (
                <div key={i} style={S.item}><p style={{ fontWeight: 700, margin: 0 }}>{e.item} - {e.func}</p><button onClick={() => del("previx_epis", epis, setEpis, i)} style={{ color: "#EF4444", fontWeight: 700, border: "none", background: "none", cursor: "pointer" }}>Excluir</button></div>
              ))}
            </div>
          </div>
        )}

        {tab === "exames" && (
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Exames - Total: {exames.length}</h2><button onClick={() => setShowModal("exame")} style={S.btnAdd}>+ Adicionar</button></div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {exames.length === 0 ? <div style={{ border: "2px dashed #CBD5E1", borderRadius: 16, padding: 24, textAlign: "center" }}>Nenhum registro ainda.</div> : exames.map((e, i) => (
                <div key={i} style={S.item}><p style={{ fontWeight: 700, margin: 0 }}>Periódico - {e.func}</p><button onClick={() => del("previx_exames", exames, setExames, i)} style={{ color: "#EF4444", fontWeight: 700, border: "none", background: "none", cursor: "pointer" }}>Excluir</button></div>
              ))}
            </div>
          </div>
        )}

        {tab === "documentos" && (
          <div style={S.card}><h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Documentos - Norte Vidros</h2><div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}><div style={S.item}><div><p style={{ fontWeight: 800, margin: 0 }}>📄 PGR</p><p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Válido até 10/11/2027 • Bio Proteção</p></div></div><div style={S.item}><div><p style={{ fontWeight: 800, margin: 0 }}>🩺 PCMSO</p><p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Parceiro: Bio Proteção</p></div></div></div></div>
        )}

        {tab === "clinicas" && (
          <div style={S.card}><h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Clínicas</h2><div style={{ marginTop: 16 }}><div style={S.item}><div><p style={{ fontWeight: 800, margin: 0 }}>🏥 Bio Proteção - Maceió</p><p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Clínica parceira oficial</p></div></div></div></div>
        )}
      </main>

      {showModal === "ext" && (
        <div style={S.modalBg}><div style={S.modal}>
          <h3 style={{ fontWeight: 900, fontSize: 18, margin: 0 }}>Novo Extintor</h3>
          <input value={eLocal} onChange={(e) => setELocal(e.target.value)} placeholder="Local - ex: Oficina" style={{ ...S.input, marginTop: 16 }} />
          <select value={eTipo} onChange={(e) => setETipo(e.target.value)} style={{ ...S.input, marginTop: 8 }}><option>PQS 6kg</option><option>CO2 6kg</option><option>Água 10L</option><option>PQS 4kg</option></select>
          <input type="date" value={eValidade} onChange={(e) => setEValidade(e.target.value)} style={{ ...S.input, marginTop: 8 }} />
          <input value={eCodigo} onChange={(e) => setECodigo(e.target.value)} placeholder="Código / Nº" style={{ ...S.input, marginTop: 8 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}><button onClick={saveExtintor} style={{ flex: 1, background: "#DC2626", color: "white", padding: 12, borderRadius: 12, fontWeight: 800, border: "none", cursor: "pointer" }}>Salvar Extintor</button><button onClick={() => setShowModal("")} style={{ flex: 1, background: "#F1F5F9", padding: 12, borderRadius: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>Cancelar</button></div>
        </div></div>
      )}

      {showModal === "func" && (
        <div style={S.modalBg}><div style={S.modal}>
          <h3 style={{ fontWeight: 900, fontSize: 18, margin: 0 }}>Novo Funcionário</h3>
          <input value={fNome} onChange={(e) => setFNome(e.target.value)} placeholder="Nome completo" style={{ ...S.input, marginTop: 16 }} />
          <input value={fCargo} onChange={(e) => setFCargo(e.target.value)} placeholder="Cargo - ex: Vidraceiro" style={{ ...S.input, marginTop: 8 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}><button onClick={saveFunc} style={{ flex: 1, background: "#DC2626", color: "white", padding: 12, borderRadius: 12, fontWeight: 800, border: "none", cursor: "pointer" }}>Salvar</button><button onClick={() => setShowModal("")} style={{ flex: 1, background: "#F1F5F9", padding: 12, borderRadius: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>Cancelar</button></div>
        </div></div>
      )}

      {showModal === "epi" && (
        <div style={S.modalBg}><div style={S.modal}>
          <h3 style={{ fontWeight: 900, fontSize: 18, margin: 0 }}>Novo EPI</h3>
          <input value={epiFunc} onChange={(e) => setEpiFunc(e.target.value)} placeholder="Funcionário" style={{ ...S.input, marginTop: 16 }} />
          <input value={epiItem} onChange={(e) => setEpiItem(e.target.value)} placeholder="EPI - ex: Óculos" style={{ ...S.input, marginTop: 8 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}><button onClick={saveEpi} style={{ flex: 1, background: "#DC2626", color: "white", padding: 12, borderRadius: 12, fontWeight: 800, border: "none", cursor: "pointer" }}>Salvar</button><button onClick={() => setShowModal("")} style={{ flex: 1, background: "#F1F5F9", padding: 12, borderRadius: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>Cancelar</button></div>
        </div></div>
      )}

      {showModal === "exame" && (
        <div style={S.modalBg}><div style={S.modal}>
          <h3 style={{ fontWeight: 900, fontSize: 18, margin: 0 }}>Novo Exame</h3>
          <input value={exFunc} onChange={(e) => setExFunc(e.target.value)} placeholder="Funcionário" style={{ ...S.input, marginTop: 16 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}><button onClick={saveExame} style={{ flex: 1, background: "#DC2626", color: "white", padding: 12, borderRadius: 12, fontWeight: 800, border: "none", cursor: "pointer" }}>Salvar</button><button onClick={() => setShowModal("")} style={{ flex: 1, background: "#F1F5F9", padding: 12, borderRadius: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>Cancelar</button></div>
        </div></div>
      )}
    </div>
  );
}