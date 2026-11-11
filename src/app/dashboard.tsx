"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabaseClient";

type Profile = {
  id: string;
  email: string;
  nome?: string | null;
  tipo: string;
  empresa_id?: string | null;
};

type Empresa = {
  id: string;
  nome: string;
  cnpj?: string | null;
  responsavel?: string | null;
  telefone?: string | null;
  email?: string | null;
};

type Registro = Record<string, any> & {
  id: string;
  company_id: string;
};

type Categoria =
  | "funcionarios"
  | "epis"
  | "extintores"
  | "inspecoes"
  | "documentos"
  | "exames"
  | "clinicas"
  | "riscos"
  | "financeiro"
  | "tecnico";

const CATEGORIAS: { id: Categoria; label: string; icone: string; singular: string }[] = [
  { id: "funcionarios", label: "Funcionários", icone: "👷", singular: "Funcionário" },
  { id: "epis", label: "EPIs", icone: "🦺", singular: "EPI" },
  { id: "extintores", label: "Extintores", icone: "🧯", singular: "Extintor" },
  { id: "inspecoes", label: "Inspeções", icone: "📋", singular: "Inspeção" },
  { id: "documentos", label: "Documentos", icone: "📄", singular: "Documento" },
  { id: "exames", label: "Exames", icone: "🩺", singular: "Exame" },
  { id: "clinicas", label: "Clínicas", icone: "🏥", singular: "Clínica" },
  { id: "riscos", label: "PGR / Riscos", icone: "⚠️", singular: "Risco" },
  { id: "financeiro", label: "Financeiro", icone: "💰", singular: "Lançamento" },
  { id: "tecnico", label: "Responsável técnico", icone: "🧑‍🔧", singular: "Responsável técnico" },
];

const CAMPOS: Record<Categoria, { chave: string; rotulo: string; tipo?: string; opcoes?: string[] }[]> = {
  funcionarios: [
    { chave: "nome", rotulo: "Nome", tipo: "text" },
    { chave: "cpf", rotulo: "CPF", tipo: "text" },
    { chave: "cargo", rotulo: "Cargo", tipo: "text" },
    { chave: "setor", rotulo: "Setor", tipo: "text" },
    { chave: "telefone", rotulo: "Telefone", tipo: "tel" },
    { chave: "admissao", rotulo: "Data de admissão", tipo: "date" },
  ],
  epis: [
    { chave: "nome", rotulo: "Nome do EPI", tipo: "text" },
    { chave: "ca", rotulo: "Certificado de Aprovação (CA)", tipo: "text" },
    { chave: "tipo", rotulo: "Tipo / modelo", tipo: "text" },
    { chave: "funcionario", rotulo: "Funcionário", tipo: "text" },
    { chave: "quantidade", rotulo: "Quantidade", tipo: "number" },
    { chave: "data_entrega", rotulo: "Data de entrega", tipo: "date" },
  ],
  extintores: [
    { chave: "localizacao", rotulo: "Localização", tipo: "text" },
    { chave: "tipo", rotulo: "Tipo (PQS, CO2, água...)", tipo: "text" },
    { chave: "vencimento", rotulo: "Vencimento", tipo: "date" },
    { chave: "ultima_recarga", rotulo: "Última recarga", tipo: "date" },
  ],
  inspecoes: [
    { chave: "titulo", rotulo: "Título", tipo: "text" },
    { chave: "local", rotulo: "Local", tipo: "text" },
    { chave: "responsavel", rotulo: "Responsável", tipo: "text" },
    { chave: "data", rotulo: "Data", tipo: "date" },
    { chave: "status", rotulo: "Status", tipo: "text" },
    { chave: "observacao", rotulo: "Observações", tipo: "textarea" },
  ],
  documentos: [
    { chave: "titulo", rotulo: "Título", tipo: "text" },
    { chave: "pasta", rotulo: "Pasta", tipo: "select", opcoes: ["PGR", "PCMSO", "ASO / Exames", "Laudos", "Treinamentos", "Outros"] },
    { chave: "vencimento", rotulo: "Vencimento", tipo: "date" },
    { chave: "arquivo", rotulo: "Nome / link do arquivo", tipo: "text" },
  ],
  exames: [
    { chave: "nome", rotulo: "Funcionário", tipo: "text" },
    { chave: "tipo", rotulo: "Tipo de exame", tipo: "select", opcoes: ["Admissional", "Periódico", "Demissional", "Audiometria", "Espirometria", "Raio-X", "Exame de Sangue", "Eletrocardiograma", "Retorno ao Trabalho", "Mudança de Função", "Acuidade Visual", "Exame Clínico"] },
    { chave: "data", rotulo: "Data", tipo: "date" },
    { chave: "resultado", rotulo: "Resultado / status", tipo: "text" },
    { chave: "clinica", rotulo: "Clínica", tipo: "text" },
  ],
  clinicas: [
    { chave: "nome", rotulo: "Nome da clínica", tipo: "text" },
    { chave: "telefone", rotulo: "Telefone", tipo: "tel" },
    { chave: "endereco", rotulo: "Endereço", tipo: "text" },
    { chave: "convenio", rotulo: "Convênio", tipo: "text" },
    { chave: "status", rotulo: "Status", tipo: "text" },
  ],
  riscos: [
    { chave: "ghe", rotulo: "GHE / Setor", tipo: "text" },
    { chave: "nome", rotulo: "Risco", tipo: "text" },
    { chave: "tipo", rotulo: "Tipo de risco", tipo: "select", opcoes: ["Físico", "Químico", "Biológico", "Ergonômico", "Acidente"] },
    { chave: "agente", rotulo: "Agente", tipo: "text" },
    { chave: "limite", rotulo: "Limite", tipo: "text" },
    { chave: "epi", rotulo: "EPI de controle", tipo: "text" },
  ],
  financeiro: [
    { chave: "descricao", rotulo: "Descrição", tipo: "text" },
    { chave: "valor", rotulo: "Valor (R$)", tipo: "number" },
    { chave: "vencimento", rotulo: "Vencimento", tipo: "date" },
    { chave: "status", rotulo: "Status", tipo: "select", opcoes: ["Pendente", "Pago", "Atrasado"] },
  ],
  tecnico: [
    { chave: "nome", rotulo: "Nome", tipo: "text" },
    { chave: "funcao", rotulo: "Função", tipo: "text" },
    { chave: "crea", rotulo: "CREA", tipo: "text" },
    { chave: "mte", rotulo: "MTE", tipo: "text" },
    { chave: "cnpj", rotulo: "CNPJ", tipo: "text" },
    { chave: "empresaLaudo", rotulo: "Empresa do laudo", tipo: "text" },
    { chave: "telefone", rotulo: "Telefone", tipo: "tel" },
    { chave: "email", rotulo: "E-mail", tipo: "email" },
  ],
};

const INPUT_CLASS = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

function dataHoje() {
  return new Date().toISOString().slice(0, 10);
}

function CardIndicador({ titulo, valor, icone, cor, onClick }: { titulo: string; valor: number | string; icone: string; cor: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="rounded-2xl p-5 text-left text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg" style={{ background: cor }}>
      <span className="text-2xl">{icone}</span>
      <span className="mt-3 block text-sm font-bold opacity-90">{titulo}</span>
      <span className="mt-1 block text-3xl font-black">{valor}</span>
    </button>
  );
}

export default function Dashboard({ usuario, onSair }: { usuario: Profile; onSair: () => void }) {
  const ehAdm = usuario.tipo === "adm";
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaAtual, setEmpresaAtual] = useState<Empresa | null>(null);
  const [categoria, setCategoria] = useState<"inicio" | "empresas" | Categoria>("inicio");
  const [registros, setRegistros] = useState<Record<Categoria, Registro[]>>({
    funcionarios: [], epis: [], extintores: [], inspecoes: [], documentos: [],
    exames: [], clinicas: [], riscos: [], financeiro: [], tecnico: [],
  });
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Registro | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(true);
  const [carregandoRegistros, setCarregandoRegistros] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [pastaAtual, setPastaAtual] = useState("Todas");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [relatorio, setRelatorio] = useState("");
  const requestId = useRef(0);

  const carregarEmpresas = useCallback(async () => {
    setCarregandoEmpresas(true);
    setErro("");
    let query = supabase.from("empresas").select("id, nome, cnpj, responsavel, telefone, email").order("nome");
    if (!ehAdm) {
      if (!usuario.empresa_id) {
        setEmpresas([]);
        setEmpresaAtual(null);
        setErro("Esta conta não possui uma empresa vinculada. Fale com o administrador.");
        setCarregandoEmpresas(false);
        return;
      }
      query = query.eq("id", usuario.empresa_id);
    }

    const { data, error } = await query;
    if (error) {
      setErro(`Não foi possível carregar as empresas: ${error.message}`);
      setCarregandoEmpresas(false);
      return;
    }
    const lista = (data || []) as Empresa[];
    setEmpresas(lista);
    setEmpresaAtual(atual => lista.find(empresa => empresa.id === atual?.id) || lista[0] || null);
    setCarregandoEmpresas(false);
  }, [ehAdm, usuario.empresa_id]);

  useEffect(() => { void carregarEmpresas(); }, [carregarEmpresas]);

  const carregarRegistros = useCallback(async () => {
    const request = ++requestId.current;
    if (!empresaAtual) {
      setRegistros({
        funcionarios: [], epis: [], extintores: [], inspecoes: [], documentos: [],
        exames: [], clinicas: [], riscos: [], financeiro: [], tecnico: [],
      });
      return;
    }
    setCarregandoRegistros(true);
    const { data, error } = await supabase
      .from("previx_records")
      .select("id, company_id, category, payload, created_at")
      .eq("company_id", empresaAtual.id)
      .order("created_at", { ascending: false });
    if (request !== requestId.current) return;
    if (error) {
      setErro(`Não foi possível carregar os dados. Aplique a migration de segurança do Supabase: ${error.message}`);
      setCarregandoRegistros(false);
      return;
    }
    const novo: Record<Categoria, Registro[]> = {
      funcionarios: [], epis: [], extintores: [], inspecoes: [], documentos: [],
      exames: [], clinicas: [], riscos: [], financeiro: [], tecnico: [],
    };
    for (const linha of data || []) {
      if (linha.category in novo) {
        const categoriaLinha = linha.category as Categoria;
        novo[categoriaLinha].push({
          ...(linha.payload as Record<string, any>),
          id: linha.id,
          company_id: linha.company_id,
          created_at: linha.created_at,
        });
      }
    }
    setRegistros(novo);
    setCarregandoRegistros(false);
  }, [empresaAtual]);

  useEffect(() => {
    void carregarRegistros();
    return () => { requestId.current += 1; };
  }, [carregarRegistros]);

  const contagens = useMemo(() => ({
    funcionarios: registros.funcionarios.length,
    epis: registros.epis.length,
    exames: registros.exames.length,
    riscos: registros.riscos.length,
    examesVencidos: registros.exames.filter(item => item.data && item.data < dataHoje() && !/realizad|apto/i.test(item.resultado || "")).length,
    examesRealizados: registros.exames.filter(item => /realizad|apto/i.test(item.resultado || "")).length,
    totalFinanceiro: registros.financeiro.reduce((soma, item) => soma + (Number(String(item.valor || "0").replace(",", ".")) || 0), 0),
    totalRecebido: registros.financeiro.filter(item => /pago/i.test(item.status || "")).reduce((soma, item) => soma + (Number(String(item.valor || "0").replace(",", ".")) || 0), 0),
  }), [registros]);

  const listaAtual = useMemo(() => {
    if (categoria === "inicio" || categoria === "empresas") return [];
    let lista = registros[categoria];
    if (busca.trim()) {
      const termo = busca.toLocaleLowerCase("pt-BR");
      lista = lista.filter(item => JSON.stringify(item).toLocaleLowerCase("pt-BR").includes(termo));
    }
    if (categoria === "documentos" && pastaAtual !== "Todas") {
      lista = lista.filter(item => (item.pasta || "Outros") === pastaAtual);
    }
    if ((categoria === "extintores" || categoria === "documentos") && filtroStatus !== "Todos") {
      lista = lista.filter(item => {
        const vencimento = item.vencimento;
        if (!vencimento) return filtroStatus === "Sem data";
        const dias = Math.ceil((new Date(`${vencimento}T00:00:00`).getTime() - new Date(`${dataHoje()}T00:00:00`).getTime()) / 86400000);
        if (filtroStatus === "Vencido") return dias < 0;
        if (filtroStatus === "A vencer") return dias >= 0 && dias <= 30;
        if (filtroStatus === "Em dia") return dias > 30;
        return true;
      });
    }
    return lista;
  }, [busca, categoria, filtroStatus, pastaAtual, registros]);

  function abrirNovo() {
    if (categoria === "inicio" || categoria === "empresas") return;
    if (categoria === "tecnico" && registros.tecnico[0]) {
      abrirEditar(registros.tecnico[0]);
      return;
    }
    setEditando(null);
    const valores: Record<string, any> = {};
    for (const campo of CAMPOS[categoria]) {
      if (campo.tipo === "date") valores[campo.chave] = dataHoje();
    }
    if (categoria === "funcionarios") valores.setor = "Administrativo";
    if (categoria === "financeiro") valores.status = "Pendente";
    if (categoria === "documentos") valores.pasta = "PGR";
    setForm(valores);
    setModal(true);
  }

  function abrirEditar(registro: Registro) {
    setEditando(registro);
    setForm(Object.fromEntries(CAMPOS[categoria as Categoria].map(campo => [campo.chave, registro[campo.chave] ?? ""])));
    setModal(true);
  }

  async function salvarRegistro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!empresaAtual || categoria === "inicio" || categoria === "empresas") return;
    setSalvando(true);
    setErro("");
    setMensagem("");
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, valor]) => valor !== "" && valor !== undefined && valor !== null),
    );
    let resultado;
    if (editando) {
      resultado = await supabase
        .from("previx_records")
        .update({ payload })
        .eq("id", editando.id)
        .eq("company_id", empresaAtual.id)
        .select("id")
        .single();
    } else {
      resultado = await supabase
        .from("previx_records")
        .insert({ company_id: empresaAtual.id, category: categoria, payload })
        .select("id")
        .single();
    }
    if (resultado.error) {
      setErro(`Não foi possível salvar: ${resultado.error.message}`);
    } else {
      setMensagem(`${CATEGORIAS.find(item => item.id === categoria)?.singular || "Registro"} salvo.`);
      setModal(false);
      setForm({});
      setEditando(null);
      await carregarRegistros();
    }
    setSalvando(false);
  }

  async function excluirRegistro(registro: Registro) {
    if (!empresaAtual || categoria === "inicio" || categoria === "empresas") return;
    if (!window.confirm(`Excluir "${registro.nome || registro.titulo || registro.descricao || "este registro"}"?`)) return;
    const { error } = await supabase
      .from("previx_records")
      .delete()
      .eq("id", registro.id)
      .eq("company_id", empresaAtual.id);
    if (error) {
      setErro(`Não foi possível excluir: ${error.message}`);
      return;
    }
    setMensagem("Registro excluído.");
    await carregarRegistros();
  }

  async function cadastrarEmpresa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    const formElement = event.currentTarget;
    const valores = Object.fromEntries(new FormData(formElement).entries());
    const nome = String(valores.nome || "").trim();
    if (!nome) return;
    const { data, error } = await supabase
      .from("empresas")
      .insert({
        nome,
        cnpj: String(valores.cnpj || "").trim() || null,
        responsavel: String(valores.responsavel || "").trim() || null,
        telefone: String(valores.telefone || "").trim() || null,
        email: String(valores.email || "").trim() || null,
      })
      .select("id, nome, cnpj, responsavel, telefone, email")
      .single();
    if (error) {
      setErro(`Não foi possível cadastrar a empresa: ${error.message}`);
      return;
    }
    setEmpresas(atuais => [...atuais, data as Empresa]);
    setEmpresaAtual(data as Empresa);
    setMensagem(`Empresa "${nome}" cadastrada.`);
    formElement.reset();
  }

  function imprimirRelatorio(tipo: string) {
    setRelatorio(tipo);
    window.setTimeout(() => window.print(), 100);
  }

  const titulo = categoria === "inicio"
    ? "Início"
    : categoria === "empresas"
      ? "Empresas"
      : CATEGORIAS.find(item => item.id === categoria)?.label || "";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-slate-900 px-4 py-5 text-white md:flex">
        <div className="mb-1 px-3 text-xl font-black">PREVIX SST</div>
        <p className="mb-6 px-3 text-[10px] font-bold tracking-[0.2em] text-teal-300">PREVENÇÃO QUE PROTEGE</p>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          <button onClick={() => setCategoria("inicio")} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold ${categoria === "inicio" ? "bg-teal-600" : "text-slate-300 hover:bg-slate-800"}`}>🏠 <span className="ml-2">Início</span></button>
          {CATEGORIAS.filter(item => item.id !== "tecnico").map(item => (
            <button key={item.id} onClick={() => setCategoria(item.id)} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold ${categoria === item.id ? "bg-teal-600" : "text-slate-300 hover:bg-slate-800"}`}>
              {item.icone}<span className="ml-2">{item.label}</span>
            </button>
          ))}
          <button onClick={() => setCategoria("tecnico")} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold ${categoria === "tecnico" ? "bg-teal-600" : "text-slate-300 hover:bg-slate-800"}`}>🧑‍🔧 <span className="ml-2">Responsável técnico</span></button>
          {ehAdm && <button onClick={() => setCategoria("empresas")} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold ${categoria === "empresas" ? "bg-teal-600" : "text-slate-300 hover:bg-slate-800"}`}>🏢 <span className="ml-2">Empresas</span></button>}
        </nav>
        <button onClick={onSair} className="mt-4 rounded-xl px-3 py-3 text-left text-sm font-bold text-red-200 hover:bg-slate-800">↪ <span className="ml-2">Sair</span></button>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-lg font-black text-slate-900 md:hidden">PREVIX SST</span>
              <span className="hidden text-sm font-bold text-slate-500 md:inline">{titulo}</span>
              {!ehAdm && empresaAtual && <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">{empresaAtual.nome}</span>}
            </div>
            <div className="flex items-center gap-3">
              {ehAdm && (
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  Empresa
                  <select
                    value={empresaAtual?.id || ""}
                    onChange={event => setEmpresaAtual(empresas.find(empresa => empresa.id === event.target.value) || null)}
                    disabled={carregandoEmpresas || empresas.length === 0}
                    className="max-w-48 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
                  >
                    {empresas.length === 0 && <option value="">Nenhuma cadastrada</option>}
                    {empresas.map(empresa => <option key={empresa.id} value={empresa.id}>{empresa.nome}</option>)}
                  </select>
                </label>
              )}
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold">{usuario.nome || usuario.email}</p>
                <p className="text-[11px] uppercase text-slate-400">{usuario.tipo}</p>
              </div>
              <button onClick={onSair} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 md:hidden">Sair</button>
            </div>
          </div>
        </header>

        <nav className="sticky top-[57px] z-[9] flex gap-1 overflow-x-auto border-b border-slate-200 bg-white p-2 md:hidden">
          <button onClick={() => setCategoria("inicio")} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${categoria === "inicio" ? "bg-teal-600 text-white" : "text-slate-600"}`}>🏠 Início</button>
          {CATEGORIAS.filter(item => item.id !== "tecnico").map(item => (
            <button key={item.id} onClick={() => setCategoria(item.id)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${categoria === item.id ? "bg-teal-600 text-white" : "text-slate-600"}`}>{item.icone} {item.label}</button>
          ))}
          <button onClick={() => setCategoria("tecnico")} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${categoria === "tecnico" ? "bg-teal-600 text-white" : "text-slate-600"}`}>🧑‍🔧 Técnico</button>
          {ehAdm && <button onClick={() => setCategoria("empresas")} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${categoria === "empresas" ? "bg-teal-600 text-white" : "text-slate-600"}`}>🏢 Empresas</button>}
        </nav>

        <main className="mx-auto max-w-7xl p-4 md:p-8">
          {erro && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{erro}</div>}
          {mensagem && <div role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{mensagem}</div>}

          {!empresaAtual && !carregandoEmpresas ? (
            <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <div className="text-4xl">🏢</div>
              <h1 className="mt-3 text-xl font-black">{ehAdm ? "Cadastre sua primeira empresa" : "Empresa não vinculada"}</h1>
              <p className="mt-2 text-sm text-slate-500">{ehAdm ? "Use a seção Empresas para começar a organizar os dados." : "Peça ao administrador para vincular sua conta a uma empresa."}</p>
              {ehAdm && <button onClick={() => setCategoria("empresas")} className="mt-5 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Abrir Empresas</button>}
            </section>
          ) : !empresaAtual ? (
            <p className="rounded-xl bg-white p-6 text-center font-bold text-slate-500">Carregando empresas...</p>
          ) : categoria === "inicio" ? (
            <div>
              <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                <p className="text-sm font-bold text-teal-700">PAINEL DE SST</p>
                <h1 className="mt-2 text-3xl font-black">Olá, {usuario.nome || "bem-vindo(a)"}! 👋</h1>
                <p className="mt-2 text-slate-500">{empresaAtual.nome}</p>
              </section>
              {carregandoRegistros ? <p className="py-8 text-center font-bold text-slate-500">Carregando dados...</p> : (
                <>
                  <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <CardIndicador titulo="Funcionários" valor={contagens.funcionarios} icone="👷" cor="linear-gradient(135deg,#14b8a6,#06b6d4)" onClick={() => setCategoria("funcionarios")} />
                    <CardIndicador titulo="EPIs registrados" valor={contagens.epis} icone="🦺" cor="linear-gradient(135deg,#22c55e,#84cc16)" onClick={() => setCategoria("epis")} />
                    <CardIndicador titulo="Exames" valor={contagens.exames} icone="🩺" cor="linear-gradient(135deg,#0d9488,#2563eb)" onClick={() => setCategoria("exames")} />
                    <CardIndicador titulo="Riscos PGR" valor={contagens.riscos} icone="⚠️" cor="linear-gradient(135deg,#f59e0b,#ef4444)" onClick={() => setCategoria("riscos")} />
                  </section>
                  <section className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                      <h2 className="font-black">👨‍🔧 Responsável técnico do laudo</h2>
                      <p className="mt-2 text-sm text-slate-500">{registros.tecnico[0]?.nome || "Cadastre os dados do responsável técnico."}</p>
                      <button onClick={() => setCategoria("tecnico")} className="mt-4 rounded-lg bg-teal-50 px-4 py-2 text-sm font-bold text-teal-800">Editar dados técnicos</button>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                      <h2 className="font-black">💰 Financeiro</h2>
                      <p className="mt-2 text-sm text-slate-600">Total: <b>{contagens.totalFinanceiro.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</b></p>
                      <p className="text-sm text-slate-600">Recebido: <b>{contagens.totalRecebido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</b></p>
                      <p className="text-sm text-slate-600">A receber: <b>{(contagens.totalFinanceiro - contagens.totalRecebido).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</b></p>
                      <p className="mt-2 text-xs text-slate-400">Exames vencidos: {contagens.examesVencidos} · Realizados: {contagens.examesRealizados}</p>
                    </div>
                  </section>
                  <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="font-black">Laudos em 1 clique</h2>
                    <p className="mt-1 text-xs text-slate-500">Gera uma versão para impressão com os registros atuais da empresa.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["PGR", "LTCAT", "LIP", "PCMSO"].map(tipo => <button key={tipo} onClick={() => imprimirRelatorio(tipo)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-white" style={{ background: tipo === "PGR" ? "#0d9488" : tipo === "LTCAT" ? "#2563eb" : tipo === "LIP" ? "#d97706" : "#16a34a" }}>Gerar {tipo}</button>)}
                    </div>
                  </section>
                </>
              )}
            </div>
          ) : categoria === "empresas" ? (
            <section>
              <div className="mb-5">
                <h1 className="text-2xl font-black">Empresas</h1>
                <p className="mt-1 text-sm text-slate-500">Empresas cadastradas no PREVIX</p>
              </div>
              {ehAdm && (
                <form onSubmit={cadastrarEmpresa} className="mb-5 grid gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-2">
                  <input name="nome" required placeholder="Nome da empresa" aria-label="Nome da empresa" className={INPUT_CLASS} />
                  <input name="cnpj" placeholder="CNPJ" aria-label="CNPJ" className={INPUT_CLASS} />
                  <input name="responsavel" placeholder="Responsável" aria-label="Responsável" className={INPUT_CLASS} />
                  <input name="telefone" placeholder="Telefone" aria-label="Telefone" className={INPUT_CLASS} />
                  <input name="email" type="email" placeholder="E-mail de contato" aria-label="E-mail de contato" className={INPUT_CLASS} />
                  <button type="submit" className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white hover:bg-teal-800 sm:col-span-2">+ Cadastrar Empresa</button>
                </form>
              )}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {empresas.map(empresa => (
                  <button key={empresa.id} onClick={() => { setEmpresaAtual(empresa); setCategoria("inicio"); }} className={`rounded-2xl border bg-white p-5 text-left shadow-sm ${empresaAtual.id === empresa.id ? "border-teal-600 ring-2 ring-teal-100" : "border-slate-200"}`}>
                    <span className="text-2xl">🏢</span>
                    <span className="mt-2 block font-black">{empresa.nome}</span>
                    {empresa.cnpj && <span className="mt-1 block text-xs text-slate-500">CNPJ: {empresa.cnpj}</span>}
                    {empresa.responsavel && <span className="mt-1 block text-xs text-slate-500">Responsável: {empresa.responsavel}</span>}
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-700">{empresaAtual.nome}</p>
                  <h1 className="mt-1 text-2xl font-black">{titulo}</h1>
                </div>
                <button onClick={abrirNovo} className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800">
                  {categoria === "tecnico" ? "Editar dados técnicos" : `+ Cadastrar ${CATEGORIAS.find(item => item.id === categoria)?.singular}`}
                </button>
              </div>

              {categoria === "exames" && (
                <div className="mb-4 rounded-2xl bg-gradient-to-r from-sky-100 to-emerald-100 p-4">
                  <h2 className="font-black">🏥 Clínica parceira</h2>
                  <p className="mt-1 text-sm text-slate-600">{registros.clinicas[0]?.nome || "Cadastre clínicas na seção Clínicas."} · {registros.clinicas[0]?.telefone || "Sem telefone cadastrado"}</p>
                  <p className="mt-2 text-xs text-slate-600">Exames vencidos: {contagens.examesVencidos} · Realizados: {contagens.examesRealizados}</p>
                </div>
              )}

              {categoria === "documentos" && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <select value={pastaAtual} onChange={event => setPastaAtual(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                    {["Todas", "PGR", "PCMSO", "ASO / Exames", "Laudos", "Treinamentos", "Outros"].map(pasta => <option key={pasta}>{pasta}</option>)}
                  </select>
                  <select value={filtroStatus} onChange={event => setFiltroStatus(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                    {["Todos", "Vencido", "A vencer", "Em dia", "Sem data"].map(status => <option key={status}>{status}</option>)}
                  </select>
                </div>
              )}
              {categoria === "extintores" && (
                <div className="mb-3">
                  <select value={filtroStatus} onChange={event => setFiltroStatus(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                    {["Todos", "Vencido", "A vencer", "Em dia", "Sem data"].map(status => <option key={status}>{status}</option>)}
                  </select>
                </div>
              )}

              <input value={busca} onChange={event => setBusca(event.target.value)} placeholder={`Buscar ${titulo.toLocaleLowerCase("pt-BR")}...`} className={`${INPUT_CLASS} mb-4`} />

              {carregandoRegistros ? (
                <p className="rounded-xl bg-white p-6 text-center font-bold text-slate-500">Carregando dados...</p>
              ) : listaAtual.length === 0 ? (
                <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-500">Nenhum registro encontrado.</p>
              ) : (
                <div className="space-y-3">
                  {listaAtual.map(registro => (
                    <article key={registro.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h2 className="font-extrabold">{registro.nome || registro.titulo || registro.descricao || registro.localizacao || registro.ghe || "Registro"}</h2>
                          <div className="mt-2 grid gap-x-6 gap-y-1 text-sm text-slate-600 sm:grid-cols-2">
                            {CAMPOS[categoria].filter(campo => campo.chave !== "nome" || !registro.titulo).map(campo => {
                              const valor = registro[campo.chave];
                              if (valor === undefined || valor === null || valor === "") return null;
                              return <p key={campo.chave}><span className="font-semibold text-slate-500">{campo.rotulo}:</span> {String(valor)}</p>;
                            })}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => abrirEditar(registro)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">Editar</button>
                          <button onClick={() => void excluirRegistro(registro)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100">Excluir</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {modal && categoria !== "inicio" && categoria !== "empresas" && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setModal(false); }}>
          <form onSubmit={salvarRegistro} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black">{editando ? "Editar" : "Cadastrar"} {CATEGORIAS.find(item => item.id === categoria)?.singular}</h2>
              <button type="button" onClick={() => setModal(false)} aria-label="Fechar" className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100">×</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {CAMPOS[categoria as Categoria].map(campo => (
                <label key={campo.chave} className={`block text-xs font-bold text-slate-600 ${campo.tipo === "textarea" ? "sm:col-span-2" : ""}`}>
                  {campo.rotulo}
                  {campo.tipo === "textarea" ? (
                    <textarea value={form[campo.chave] || ""} onChange={event => setForm(atual => ({ ...atual, [campo.chave]: event.target.value }))} className={`${INPUT_CLASS} mt-1 min-h-24`} />
                  ) : campo.tipo === "select" ? (
                    <select value={form[campo.chave] || ""} onChange={event => setForm(atual => ({ ...atual, [campo.chave]: event.target.value }))} className={`${INPUT_CLASS} mt-1`}>
                      <option value="">Selecione</option>
                      {campo.opcoes?.map(opcao => <option key={opcao}>{opcao}</option>)}
                    </select>
                  ) : (
                    <input
                      type={campo.tipo || "text"}
                      required={campo.chave === "nome" || campo.chave === "titulo" || campo.chave === "descricao"}
                      value={form[campo.chave] || ""}
                      onChange={event => setForm(atual => ({ ...atual, [campo.chave]: event.target.value }))}
                      className={`${INPUT_CLASS} mt-1`}
                    />
                  )}
                </label>
              ))}
            </div>
            {categoria === "epis" && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Este cadastro registra a entrega. PIN, assinatura e biometria precisam de um fluxo de verificação próprio; não são simulados nem armazenados como credenciais neste formulário.</p>}
            {categoria === "documentos" && <p className="mt-3 rounded-lg bg-sky-50 p-3 text-xs text-sky-900">Informe metadados ou um link de arquivo protegido. O anexo não é enviado para armazenamento público.</p>}
            <div className="mt-5 flex gap-2">
              <button type="submit" disabled={salvando} className="flex-1 rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:opacity-60">{salvando ? "Salvando..." : "Salvar"}</button>
              <button type="button" onClick={() => setModal(false)} className="rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-700">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {relatorio && empresaAtual && (
        <section className="print-report hidden">
          <h1>PREVIX SST — {relatorio}</h1>
          <h2>{empresaAtual.nome}</h2>
          {empresaAtual.cnpj && <p>CNPJ: {empresaAtual.cnpj}</p>}
          <p>Emitido em {new Date().toLocaleDateString("pt-BR")}</p>
          <hr />
          <h3>Responsável técnico</h3>
          {registros.tecnico[0] ? CAMPOS.tecnico.map(campo => <p key={campo.chave}>{campo.rotulo}: {registros.tecnico[0][campo.chave] || "—"}</p>) : <p>Dados do responsável técnico não cadastrados.</p>}
          <h3>Funcionários</h3>
          {registros.funcionarios.map(item => <p key={item.id}>{item.nome} — {item.cargo || "Cargo não informado"} — Setor: {item.setor || "—"}</p>)}
          <h3>Riscos cadastrados</h3>
          {registros.riscos.map(item => <p key={item.id}>{item.ghe || "GHE"} — {item.nome} ({item.tipo || "Tipo não informado"}): {item.agente || "Agente não informado"}</p>)}
          <h3>Documentos registrados</h3>
          {registros.documentos.map(item => <p key={item.id}>{item.titulo} — {item.pasta || "Outros"} — Vencimento: {item.vencimento || "—"}</p>)}
          <p className="report-disclaimer">Relatório gerado a partir dos dados cadastrados no PREVIX. Deve ser revisado por profissional habilitado antes de uso oficial.</p>
        </section>
      )}
    </div>
  );
}
