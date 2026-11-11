"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function Login({ onEntrar }: any) {
  const [tipo, setTipo] = useState("empresa");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState("");

  async function handleAuth() {
    setLoading(true);
    try {
      if (modoCadastro) {
        const { data, error } = await supabase.auth.signUp({ email, password: senha });
        if (error) throw error;
        if (!data.user) throw new Error("Não foi possível criar usuário. Verifique o e-mail.");
        const { error: pError } = await supabase.from("profiles").insert({
          id: data.user.id, email, nome, tipo
        });
        if (pError) throw pError;
        alert("Conta criada! Agora faz login.");
        setModoCadastro(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        if (!data.user) throw new Error("Usuário não encontrado.");
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
        if (!profile) throw new Error("Perfil não encontrado. Fala com o ADM.");
        if (profile.tipo !== tipo) {
          alert(`Essa conta é ${profile.tipo}, mas você clicou em ${tipo}. Troca a aba.`);
          await supabase.auth.signOut();
          return;
        }
        onEntrar(profile);
      }
    } catch (e: any) { alert(e.message); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md">
        <h1 className="text-3xl font-black text-center">PREVIX</h1>
        <p className="text-center text-gray-500 mb-6">Gestão de SST simples</p>
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          <button onClick={() => setTipo("empresa")} className={`flex-1 py-3 rounded-lg font-bold ${tipo === "empresa" ? "bg-blue-600 text-white" : "text-gray-500"}`}>🏢 Sou Empresa</button>
          <button onClick={() => setTipo("autonomo")} className={`flex-1 py-3 rounded-lg font-bold ${tipo === "autonomo" ? "bg-blue-600 text-white" : "text-gray-500"}`}>👷 Sou Autônomo</button>
        </div>
        {modoCadastro && <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" className="w-full border rounded-xl px-4 py-3 mb-3" />}
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="w-full border rounded-xl px-4 py-3 mb-3" />
        <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha" className="w-full border rounded-xl px-4 py-3 mb-4" />
        <button onClick={handleAuth} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black">
          {loading ? "Carregando..." : modoCadastro ? `CRIAR CONTA ${tipo.toUpperCase()}` : `ENTRAR COMO ${tipo.toUpperCase()}`}
        </button>
        <button onClick={() => setModoCadastro(!modoCadastro)} className="w-full text-blue-600 text-sm mt-3 font-bold">
          {modoCadastro ? "Já tenho conta - Fazer login" : "Não tenho conta - Criar conta pra testar"}
        </button>
      </div>
    </div>
  );
}

function PainelADM({ usuario, sair }: any) {
  const [tipoCad, setTipoCad] = useState("empresa");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [autonomos, setAutonomos] = useState<any[]>([]);

  async function carregar() {
    const { data: e } = await supabase.from("empresas").select("*").order("created_at", { ascending: false });
    const { data: a } = await supabase.from("profiles").select("*").eq("tipo", "autonomo");
    setEmpresas(e || []); setAutonomos(a || []);
  }
  useEffect(() => { carregar(); }, []);

  async function cadastrar() {
    if (!nome || !email || !senha) return alert("Preenche tudo");
    const { data, error } = await supabase.auth.signUp({ email, password: senha });
    if (error) return alert(error.message);
    if (!data.user) return alert("Não foi possível criar usuário. Verifique o e-mail.");
    const userId = data.user.id;
    if (tipoCad === "empresa") {
      const { data: emp } = await supabase.from("empresas").insert({ nome }).select().single();
      if (!emp) return alert("Erro ao criar empresa");
      await supabase.from("profiles").insert({ id: userId, email, nome, tipo: "empresa", empresa_id: emp.id });
      alert(`Empresa ${nome} cadastrada!`);
    } else {
      await supabase.from("profiles").insert({ id: userId, email, nome, tipo: "autonomo" });
      alert(`Autônomo ${nome} cadastrado!`);
    }
    setNome(""); setEmail(""); setSenha(""); carregar();
  }

  return (
    <div className="p-4 max-w-3xl mx-auto bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black">⚙️ Painel ADM</h1>
        <button onClick={sair} className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold">Sair</button>
      </div>
      <p className="text-gray-500">Logado como: {usuario.nome} - {usuario.email}</p>
      <div className="flex bg-white rounded-xl p-1 mt-4 shadow">
        <button onClick={() => setTipoCad("empresa")} className={`flex-1 py-3 rounded-lg font-bold ${tipoCad === "empresa" ? "bg-black text-white" : ""}`}>+ Cadastrar Empresa</button>
        <button onClick={() => setTipoCad("autonomo")} className={`flex-1 py-3 rounded-lg font-bold ${tipoCad === "autonomo" ? "bg-black text-white" : ""}`}>+ Cadastrar Autônomo</button>
      </div>
      <div className="bg-white rounded-2xl p-4 mt-4 shadow">
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder={tipoCad === "empresa" ? "Nome da Empresa" : "Nome do Autônomo"} className="w-full border rounded-xl px-4 py-3 mb-3" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail de acesso" className="w-full border rounded-xl px-4 py-3 mb-3" />
        <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha inicial" className="w-full border rounded-xl px-4 py-3 mb-3" />
        <button onClick={cadastrar} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold">CADASTRAR {tipoCad.toUpperCase()}</button>
      </div>
      <h2 className="font-black text-lg mt-6">🏢 Empresas Cadastradas ({empresas.length})</h2>
      {empresas.map((e: any) => <div key={e.id} className="bg-white p-3 rounded-xl mt-2 shadow flex justify-between"><span>{e.nome}</span><span className="text-xs text-gray-400">{e.cnpj || ""}</span></div>)}
      <h2 className="font-black text-lg mt-6">👷 Autônomos Cadastrados ({autonomos.length})</h2>
      {autonomos.map((a: any) => <div key={a.id} className="bg-white p-3 rounded-xl mt-2 shadow">{a.nome} - {a.email}</div>)}
    </div>
  );
}

function PainelSST({ titulo, filtro, sair, usuario }: any) {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [extintores, setExtintores] = useState<any[]>([]);
  const [novoFunc, setNovoFunc] = useState("");
  const [localExt, setLocalExt] = useState("");
  const [proxRecarga, setProxRecarga] = useState("");

  async function carregar() {
    let q1 = supabase.from("funcionarios").select("*");
    let q2 = supabase.from("extintores").select("*");
    if (filtro.empresa_id) { q1 = q1.eq("empresa_id", filtro.empresa_id); q2 = q2.eq("empresa_id", filtro.empresa_id); }
    if (filtro.cliente_id) { q1 = q1.eq("cliente_id", filtro.cliente_id); q2 = q2.eq("cliente_id", filtro.cliente_id); }
    const { data: f } = await q1; const { data: e } = await q2;
    setFuncionarios(f || []); setExtintores(e || []);
  }
  useEffect(() => { carregar(); }, [filtro.empresa_id, filtro.cliente_id]);

  async function addFuncionario() {
    if (!novoFunc) return;
    await supabase.from("funcionarios").insert({ nome: novoFunc, ...filtro });
    setNovoFunc(""); carregar();
  }
  async function addExtintor() {
    if (!localExt) return;
    await supabase.from("extintores").insert({ local: localExt, proxima_recarga: proxRecarga || null, ...filtro });
    setLocalExt(""); setProxRecarga(""); carregar();
  }

  const alertas = extintores.filter((e: any) => {
    if (!e.proxima_recarga) return false;
    const dias = Math.ceil((new Date(e.proxima_recarga).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return dias <= 30;
  });

  return (
    <div className="p-4 max-w-4xl mx-auto bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-black">PREVIX - {titulo}</h1>
        <button onClick={sair} className="bg-red-500 text-white px-3 py-2 rounded-xl font-bold text-sm">Sair</button>
      </div>
      <p className="text-sm text-gray-500">Logado: {usuario.nome} ({usuario.tipo})</p>
      {alertas.length > 0 && (
        <div className="bg-red-100 border border-red-300 p-4 rounded-2xl mt-4">
          <p className="font-black text-red-700">🔔 {alertas.length} extintor(es) vencendo em 30 dias!</p>
          {alertas.map((a: any) => <p key={a.id} className="text-sm">• {a.local} - Próxima Recarga: {a.proxima_recarga}</p>)}
        </div>
      )}
      <h2 className="font-black text-lg mt-6">👷 Funcionários</h2>
      <div className="flex gap-2 mt-2">
        <input value={novoFunc} onChange={e => setNovoFunc(e.target.value)} placeholder="Nome do funcionário" className="flex-1 border rounded-xl px-3 py-2" />
        <button onClick={addFuncionario} className="bg-blue-600 text-white px-4 rounded-xl font-bold">+</button>
      </div>
      {funcionarios.map((f: any) => <div key={f.id} className="bg-white p-3 rounded-xl mt-2 shadow">{f.nome}</div>)}
      {funcionarios.length === 0 && <p className="text-gray-400 text-sm mt-2">Nenhum funcionário ainda.</p>}
      <h2 className="font-black text-lg mt-6">🧯 Extintores</h2>
      <div className="bg-white p-3 rounded-2xl shadow mt-2 flex flex-col gap-2">
        <input value={localExt} onChange={e => setLocalExt(e.target.value)} placeholder="Local ex: Cozinha" className="border rounded-xl px-3 py-2" />
        <input type="date" value={proxRecarga} onChange={e => setProxRecarga(e.target.value)} className="border rounded-xl px-3 py-2" />
        <button onClick={addExtintor} className="bg-green-500 text-white py-2 rounded-xl font-bold">Salvar Extintor</button>
      </div>
      {extintores.map((e: any) => (
        <div key={e.id} className="bg-white p-3 rounded-xl mt-2 shadow flex justify-between">
          <span>{e.local}</span><span className="font-bold text-sm">Próxima Recarga: {e.proxima_recarga || "—"}</span>
        </div>
      ))}
    </div>
  );
}

function PainelEmpresa({ usuario, sair }: any) {
  return <PainelSST titulo={usuario.nome} filtro={{ empresa_id: usuario.empresa_id }} sair={sair} usuario={usuario} />;
}

function PainelAutonomo({ usuario, sair }: any) {
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteAtual, setClienteAtual] = useState<any>(null);
  const [novoCliente, setNovoCliente] = useState("");

  async function carregarClientes() {
    const { data } = await supabase.from("clientes").select("*").eq("autonomo_id", usuario.id).order("created_at");
    setClientes(data || []);
    if (data && data.length > 0 && !clienteAtual) setClienteAtual(data[0]);
  }
  useEffect(() => { carregarClientes(); }, []);

  async function addCliente() {
    if (!novoCliente) return;
    const { data } = await supabase.from("clientes").insert({ nome: novoCliente, autonomo_id: usuario.id }).select().single();
    setNovoCliente(""); await carregarClientes(); setClienteAtual(data);
  }

  if (!clienteAtual) {
    return (
      <div className="p-4 max-w-2xl mx-auto bg-gray-100 min-h-screen">
        <h1 className="text-xl font-black">👷 Painel Autônomo - {usuario.nome}</h1>
        <div className="bg-white p-4 rounded-2xl shadow mt-4">
          <p className="font-bold">Cadastre seu primeiro cliente:</p>
          <input value={novoCliente} onChange={e => setNovoCliente(e.target.value)} placeholder="Nome do cliente ex: Padaria do João" className="w-full border rounded-xl px-3 py-3 mt-3" />
          <button onClick={addCliente} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold mt-2">Cadastrar Cliente</button>
        </div>
        <button onClick={sair} className="mt-4 text-red-500 font-bold">Sair</button>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow p-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex gap-2">
          <span className="text-2xl">🏢</span>
          <select value={clienteAtual.id} onChange={e => setClienteAtual(clientes.find(c => c.id === e.target.value))} className="flex-1 border-2 border-blue-600 rounded-xl px-3 py-3 font-bold bg-blue-50">
            {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="max-w-4xl mx-auto flex gap-2 mt-2">
          <input value={novoCliente} onChange={e => setNovoCliente(e.target.value)} placeholder="+ Novo cliente" className="flex-1 border rounded-xl px-3 py-2 text-sm" />
          <button onClick={addCliente} className="bg-blue-600 text-white px-4 rounded-xl font-bold text-sm">Cadastrar</button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-1">Você está vendo: <b>{clienteAtual.nome}</b> - Tudo abaixo é só dele</p>
      </div>
      <PainelSST titulo={`Cliente: ${clienteAtual.nome}`} filtro={{ cliente_id: clienteAtual.id }} sair={sair} usuario={usuario} />
    </div>
  );
}

export default function Page() {
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.session.user.id).single();
        if (profile) setUsuario(profile);
      }
      setLoading(false);
    });
  }, []);

  async function sair() {
    await supabase.auth.signOut();
    setUsuario(null);
  }

  if (loading) return <div className="p-10 text-center font-bold">Carregando PREVIX...</div>;
  if (!usuario) return <Login onEntrar={setUsuario} />;
  if (usuario.tipo === "adm") return <PainelADM usuario={usuario} sair={sair} />;
  if (usuario.tipo === "empresa") return <PainelEmpresa usuario={usuario} sair={sair} />;
  if (usuario.tipo === "autonomo") return <PainelAutonomo usuario={usuario} sair={sair} />;
  return <div>Tipo desconhecido</div>;
}