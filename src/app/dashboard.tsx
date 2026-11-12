"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
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
  login?: string | null;
  status?: "Ativa" | "Inativa";
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

const CATEGORIAS_POR_RELATORIO: Record<string, Categoria[]> = {
  PGR: ["riscos", "funcionarios", "epis", "extintores", "documentos", "tecnico"],
  LTCAT: ["tecnico", "funcionarios", "riscos", "documentos"],
  LIP: ["tecnico", "funcionarios", "riscos"],
  PCMSO: ["exames", "clinicas", "funcionarios", "tecnico"],
};

const SETORES = ["Vendas", "Caixa", "Estoque", "Limpeza", "Gerência", "Entrega", "Administrativo", "Produção", "Manutenção", "Segurança", "Almoxarifado", "RH", "Outro"];

const TIPOS_EXAME = [
  { tipo: "Admissional", descricao: "Exame de admissão", obrigatorio: true },
  { tipo: "Periódico", descricao: "Acompanhamento anual", obrigatorio: true },
  { tipo: "Demissional", descricao: "Exame de desligamento", obrigatorio: false },
  { tipo: "Audiometria", descricao: "Avaliação auditiva", obrigatorio: false },
  { tipo: "Espirometria", descricao: "Capacidade pulmonar", obrigatorio: false },
  { tipo: "Raio-X", descricao: "Tórax PA", obrigatorio: false },
  { tipo: "Exame de Sangue", descricao: "Hemograma completo", obrigatorio: false },
  { tipo: "Eletrocardiograma", descricao: "Avaliação cardíaca", obrigatorio: false },
  { tipo: "Retorno ao Trabalho", descricao: "Após afastamento", obrigatorio: true },
  { tipo: "Mudança de Função", descricao: "Nova função", obrigatorio: true },
  { tipo: "Acuidade Visual", descricao: "Visão", obrigatorio: false },
  { tipo: "Exame Clínico", descricao: "Avaliação geral", obrigatorio: true },
];

const TIPOS_INSPECAO = [
  "NR-01 - Gerenciamento de Riscos Ocupacionais",
  "NR-05 - CIPA",
  "NR-06 - EPI / EPC",
  "NR-07 - PCMSO / Exames",
  "NR-09 - Avaliação de Exposições",
  "NR-10 - Eletricidade",
  "NR-11 - Transporte / Movimentação",
  "NR-12 - Máquinas e Equipamentos",
  "NR-17 - Ergonomia",
  "NR-23 - Proteção Contra Incêndio / Extintores",
  "NR-26 - Sinalização de Segurança",
  "NR-33 - Espaço Confinado",
  "NR-35 - Trabalho em Altura",
  "Inspeção Geral",
];

const CATALOGO_RISCOS = [
  { nome: "Ruído", tipo: "Físico", agente: "Ruído contínuo", limite: "85 dB" },
  { nome: "Calor", tipo: "Físico", agente: "Calor", limite: "IBUTG" },
  { nome: "Vibração", tipo: "Físico", agente: "Vibração de mãos e braços", limite: "" },
  { nome: "Frio", tipo: "Físico", agente: "Baixas temperaturas", limite: "" },
  { nome: "Poeira", tipo: "Químico", agente: "Poeira total", limite: "8 mg/m3" },
  { nome: "Fumos de Solda", tipo: "Químico", agente: "Fumos metálicos", limite: "" },
  { nome: "Solventes / Tintas", tipo: "Químico", agente: "Tolueno / Xileno", limite: "" },
  { nome: "Produtos de Limpeza", tipo: "Químico", agente: "Cloro / Detergentes", limite: "" },
  { nome: "Bactérias / Vírus", tipo: "Biológico", agente: "Agentes biológicos", limite: "" },
  { nome: "Queda de altura", tipo: "Acidente", agente: "Trabalho em altura", limite: "" },
  { nome: "Eletricidade", tipo: "Acidente", agente: "Eletricidade", limite: "" },
  { nome: "Máquinas sem proteção", tipo: "Acidente", agente: "Partes móveis", limite: "" },
  { nome: "Postura inadequada", tipo: "Ergonômico", agente: "Postura", limite: "" },
  { nome: "Levantamento de peso", tipo: "Ergonômico", agente: "Esforço físico", limite: "" },
  { nome: "Trabalho repetitivo", tipo: "Ergonômico", agente: "LER/DORT", limite: "" },
  { nome: "Stress / Pressão", tipo: "Ergonômico", agente: "Psicossocial", limite: "" },
];

const CAMPOS: Record<Categoria, { chave: string; rotulo: string; tipo?: string; opcoes?: string[] }[]> = {
  funcionarios: [
    { chave: "nome", rotulo: "Nome", tipo: "text" },
    { chave: "cpf", rotulo: "CPF", tipo: "text" },
    { chave: "cargo", rotulo: "Cargo", tipo: "text" },
    { chave: "setor", rotulo: "Setor", tipo: "select", opcoes: SETORES },
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
    { chave: "proxima_recarga", rotulo: "Data da próxima recarga", tipo: "date" },
  ],
  inspecoes: [
    { chave: "titulo", rotulo: "Título", tipo: "text" },
    { chave: "local", rotulo: "Local", tipo: "text" },
    { chave: "responsavel", rotulo: "Responsável", tipo: "text" },
    { chave: "data", rotulo: "Data", tipo: "date" },
    { chave: "status", rotulo: "Status", tipo: "select", opcoes: ["Pendente", "Em Andamento", "Concluída"] },
    { chave: "tipo_nr", rotulo: "Tipo NR", tipo: "select", opcoes: TIPOS_INSPECAO },
    { chave: "observacao", rotulo: "Observações", tipo: "textarea" },
  ],
  documentos: [
    { chave: "titulo", rotulo: "Título", tipo: "text" },
    { chave: "pasta", rotulo: "Pasta", tipo: "select", opcoes: ["PGR", "PCMSO", "ASO / Exames", "Laudos", "Treinamentos", "Outros"] },
    { chave: "vencimento", rotulo: "Vencimento", tipo: "date" },
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

const CATALOGO_EPIS = [
  { codigo: "C", nome: "Capacete de segurança", icone: "⛑️" },
  { codigo: "B", nome: "Botina de segurança", icone: "🥾" },
  { codigo: "L", nome: "Luva de proteção", icone: "🧤" },
  { codigo: "O", nome: "Óculos de proteção", icone: "🥽" },
  { codigo: "P", nome: "Protetor auricular", icone: "🎧" },
  { codigo: "M", nome: "Máscara descartável", icone: "😷" },
  { codigo: "R", nome: "Respirador semifacial", icone: "😷" },
  { codigo: "V", nome: "Protetor facial / viseira", icone: "🛡️" },
  { codigo: "A", nome: "Avental de proteção", icone: "🥼" },
  { codigo: "C", nome: "Cinturão de segurança", icone: "🦺" },
  { codigo: "C", nome: "Colete refletivo", icone: "🦺" },
  { codigo: "P", nome: "Perneira de proteção", icone: "🦵" },
  { codigo: "M", nome: "Mangote de proteção", icone: "🦾" },
  { codigo: "C", nome: "Capuz de proteção", icone: "🥷" },
  { codigo: "P", nome: "Protetor solar", icone: "🧴" },
  { codigo: "P", nome: "Protetor facial para solda", icone: "🥽" },
  { codigo: "L", nome: "Luva para alta temperatura", icone: "🧤" },
  { codigo: "L", nome: "Luva química", icone: "🧤" },
  { codigo: "L", nome: "Luva anticorte", icone: "🧤" },
  { codigo: "B", nome: "Bota impermeável", icone: "🥾" },
  { codigo: "T", nome: "Talabarte de segurança", icone: "🪢" },
  { codigo: "T", nome: "Trava-quedas", icone: "🪢" },
  { codigo: "A", nome: "Abafador tipo concha", icone: "🎧" },
  { codigo: "M", nome: "Macacão de proteção", icone: "🥼" },
  { codigo: "C", nome: "Calçado ocupacional", icone: "🥾" },
  { codigo: "J", nome: "Jaqueta térmica", icone: "🧥" },
  { codigo: "P", nome: "Capacete com protetor facial", icone: "⛑️" },
];

function dataHoje() {
  return new Date().toISOString().slice(0, 10);
}

function dataLocalISO(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function formatarData(data: string) {
  if (!data) return "—";
  const valor = new Date(`${data}T12:00:00`);
  return Number.isNaN(valor.getTime()) ? data : valor.toLocaleDateString("pt-BR");
}

function formatarCpf(cpf: unknown) {
  const digitos = String(cpf || "").replace(/\D/g, "");
  if (digitos.length !== 11) return String(cpf || "CPF não informado");
  return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function convenioVigente(clinica: Registro) {
  const estado = `${clinica.status || ""} ${clinica.convenio || ""}`.toLocaleLowerCase("pt-BR");
  return !/(inativ|vencid|cancel|n[aã]o)/i.test(estado) && /(ativ[oa]|vigente|valid|sim|true)/i.test(estado);
}

function escaparHtml(valor: unknown) {
  return String(valor ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function gerarPin() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(1000 + (bytes[0] % 9000));
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
  const [empresaForm, setEmpresaForm] = useState({ nome: "", cnpj: "", responsavel: "", telefone: "", email: "", login: "", senha: "", status: "Ativa" });
  const [empresaEdicaoId, setEmpresaEdicaoId] = useState("");
  const [empresaLoginManual, setEmpresaLoginManual] = useState(false);
  const [empresaSenhaVisivel, setEmpresaSenhaVisivel] = useState(false);
  const [acessoInicialEmpresa, setAcessoInicialEmpresa] = useState<{ login: string; email: string; senha: string } | null>(null);
  const [buscaEmpresas, setBuscaEmpresas] = useState("");
  const [salvandoEmpresa, setSalvandoEmpresa] = useState(false);
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
  const [filtroSetor, setFiltroSetor] = useState("Todos");
  const [filtroTipoInspecao, setFiltroTipoInspecao] = useState("Todos");
  const [diaExameSelecionado, setDiaExameSelecionado] = useState(() => dataLocalISO(new Date()));
  const [mesCalendario, setMesCalendario] = useState(() => dataLocalISO(new Date()).slice(0, 7));
  const [buscaFuncionarioExame, setBuscaFuncionarioExame] = useState("");
  const [funcionarioExameId, setFuncionarioExameId] = useState("");
  const [tiposExameSelecionados, setTiposExameSelecionados] = useState<string[]>([]);
  const [clinicaExameId, setClinicaExameId] = useState("");
  const [buscaExames, setBuscaExames] = useState("");
  const [buscaFuncionarioEpi, setBuscaFuncionarioEpi] = useState("");
  const [listaFuncionariosEpiAberta, setListaFuncionariosEpiAberta] = useState(false);
  const requestId = useRef(0);
  const assinaturaCanvas = useRef<HTMLCanvasElement>(null);
  const desenhandoAssinatura = useRef(false);
  const [pinAutomatico, setPinAutomatico] = useState(true);
  const [pinManual, setPinManual] = useState("");
  const [pinGerado, setPinGerado] = useState<{ nome: string; pin: string } | null>(null);
  const [entregaEpi, setEntregaEpi] = useState({
    employeeId: "",
    nome: "",
    ca: "",
    tipo: "",
    quantidade: "1",
    data_entrega: dataHoje(),
  });
  const [pinConfirmacao, setPinConfirmacao] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [assinaturaFeita, setAssinaturaFeita] = useState(false);
  const [pinVerificado, setPinVerificado] = useState(false);
  const [verificandoPin, setVerificandoPin] = useState(false);
  const [coletandoBiometria, setColetandoBiometria] = useState(false);
  const [webAuthnToken, setWebAuthnToken] = useState("");
  const [webAuthnVerificadoEm, setWebAuthnVerificadoEm] = useState("");
  const [arquivoDocumento, setArquivoDocumento] = useState<File | null>(null);
  const [catalogoEpiAberto, setCatalogoEpiAberto] = useState(false);

  const carregarEmpresas = useCallback(async () => {
    setCarregandoEmpresas(true);
    setErro("");
    let query = supabase.from("empresas").select("id, nome, cnpj, responsavel, telefone, email, login, status").order("nome");
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
  useEffect(() => {
    if (categoria !== "empresas") setAcessoInicialEmpresa(null);
  }, [categoria]);

  const carregarRegistros = useCallback(async (): Promise<Record<Categoria, Registro[]> | null> => {
    const request = ++requestId.current;
    if (!empresaAtual) {
      const vazio: Record<Categoria, Registro[]> = {
        funcionarios: [], epis: [], extintores: [], inspecoes: [], documentos: [],
        exames: [], clinicas: [], riscos: [], financeiro: [], tecnico: [],
      };
      setRegistros(vazio);
      setCarregandoRegistros(false);
      return vazio;
    }
    const categoriaSolicitada = categoria === "inicio" || categoria === "empresas" ? null : categoria;
    setCarregandoRegistros(true);
    const categoriasNecessarias: (Categoria | null)[] = categoriaSolicitada === "exames"
      ? ["exames", "funcionarios", "clinicas"]
      : [categoriaSolicitada];
    const respostas = await Promise.all(categoriasNecessarias.map(p_category => supabase.rpc("previx_list_records", {
      p_company_id: empresaAtual.id,
      p_category,
    })));
    if (request !== requestId.current) return null;
    const erroResposta = respostas.find(resposta => resposta.error)?.error;
    if (erroResposta) {
      setErro(`Não foi possível carregar os dados. Aplique a migration de segurança do Supabase: ${erroResposta.message}`);
      setCarregandoRegistros(false);
      return null;
    }
    const novo: Record<Categoria, Registro[]> = {
      funcionarios: [], epis: [], extintores: [], inspecoes: [], documentos: [],
      exames: [], clinicas: [], riscos: [], financeiro: [], tecnico: [],
    };
    for (const linha of respostas.flatMap(resposta => resposta.data || [])) {
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
    setRegistros(atual => {
      if (!categoriaSolicitada) return novo;
      if (categoriaSolicitada === "exames") {
        return { ...atual, exames: novo.exames, funcionarios: novo.funcionarios, clinicas: novo.clinicas };
      }
      return { ...atual, [categoriaSolicitada]: novo[categoriaSolicitada] };
    });
    setCarregandoRegistros(false);
    return novo;
  }, [categoria, empresaAtual]);

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
    if (categoria === "funcionarios" && filtroSetor !== "Todos") {
      lista = lista.filter(item => (item.setor || "Outro") === filtroSetor);
    }
    if (categoria === "inspecoes" && filtroTipoInspecao !== "Todos") {
      lista = lista.filter(item => item.tipo_nr === filtroTipoInspecao);
    }
    if ((categoria === "extintores" || categoria === "documentos") && filtroStatus !== "Todos") {
      lista = lista.filter(item => {
        const vencimento = categoria === "extintores" ? item.proxima_recarga || item.vencimento : item.vencimento;
        if (!vencimento) return filtroStatus === "Sem data";
        const dias = Math.ceil((new Date(`${vencimento}T00:00:00`).getTime() - new Date(`${dataHoje()}T00:00:00`).getTime()) / 86400000);
        if (filtroStatus === "Vencido") return dias < 0;
        if (filtroStatus === "A vencer") return dias >= 0 && dias <= 30;
        if (filtroStatus === "Em dia") return dias > 30;
        return true;
      });
    }
    return lista;
  }, [busca, categoria, filtroSetor, filtroTipoInspecao, filtroStatus, pastaAtual, registros]);

  function abrirNovo() {
    if (categoria === "inicio" || categoria === "empresas") return;
    setArquivoDocumento(null);
    if (categoria === "epis") {
      setEntregaEpi({ employeeId: "", nome: "", ca: "", tipo: "", quantidade: "1", data_entrega: dataHoje() });
      setBuscaFuncionarioEpi("");
      setListaFuncionariosEpiAberta(false);
      setPinConfirmacao("");
      setConsentimento(false);
      setAssinaturaFeita(false);
      setPinVerificado(false);
      setWebAuthnToken("");
      setWebAuthnVerificadoEm("");
      setEditando(null);
      setModal(true);
      return;
    }
    if (categoria === "tecnico" && registros.tecnico[0]) {
      abrirEditar(registros.tecnico[0]);
      return;
    }
    setEditando(null);
    const valores: Record<string, any> = {};
    for (const campo of CAMPOS[categoria]) {
      if (campo.tipo === "date") valores[campo.chave] = dataHoje();
    }
    if (categoria === "financeiro") valores.status = "Pendente";
    if (categoria === "inspecoes") valores.status = "Pendente";
    if (categoria === "documentos") valores.pasta = "PGR";
    setForm(valores);
    if (categoria === "funcionarios") {
      setPinAutomatico(true);
      setPinManual("");
      setPinGerado(null);
    }
    setModal(true);
  }

  function abrirEditar(registro: Registro) {
    setEditando(registro);
    setArquivoDocumento(null);
    setForm(Object.fromEntries(CAMPOS[categoria as Categoria].map(campo => [campo.chave, registro[campo.chave] ?? ""])));
    setModal(true);
  }

  async function salvarRegistro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!empresaAtual || categoria === "inicio" || categoria === "empresas") return;
    setSalvando(true);
    setErro("");
    setMensagem("");
    const camposForm = Object.fromEntries(
      Object.entries(form).filter(([, valor]) => valor !== "" && valor !== undefined && valor !== null),
    );
    const payload: Record<string, any> = categoria === "exames" && editando
      ? {
          ...editando,
          id: undefined,
          company_id: undefined,
          created_at: undefined,
          ...camposForm,
          funcionario: editando.funcionario || editando.nome,
          cpf: editando.cpf,
          status: camposForm.status || editando.status || "Agendado",
          empresa: empresaAtual.nome,
        }
      : { ...camposForm, empresa: empresaAtual.nome };
    if (categoria === "funcionarios" && !editando) {
      const pin = pinAutomatico ? gerarPin() : pinManual.trim();
      if (!/^\d{4}$/.test(pin)) {
        setErro("O PIN precisa ter exatamente quatro dígitos.");
        setSalvando(false);
        return;
      }
      const { data: employeeId, error } = await supabase.rpc("previx_create_record", {
        p_company_id: empresaAtual.id,
        p_category: "funcionarios",
        p_payload: { ...payload, pin },
      });
      if (error || typeof employeeId !== "string" || !employeeId) {
        setErro(`Não foi possível cadastrar o funcionário${error
          ? `: ${error.message}`
          : ": o Supabase não retornou o ID. Aplique a migration previx_create_record_returns_id no projeto Supabase."}`);
        setSalvando(false);
        return;
      }
      setPinGerado({ nome: String(payload.nome || "Funcionário"), pin });
      setModal(false);
      setForm({});
      const registrosAtualizados = await carregarRegistros();
      if (!registrosAtualizados?.funcionarios.some(registro => registro.id === employeeId)) {
        setErro("O Supabase confirmou o cadastro, mas o funcionário não apareceu na lista atualizada. Não tente cadastrar novamente antes de atualizar a lista.");
      } else {
        setMensagem("Funcionário cadastrado. Guarde o PIN: ele será exibido somente agora.");
      }
      setSalvando(false);
      return;
    }
    let novoArquivoPath: string | null = null;
    if (categoria === "documentos" && arquivoDocumento) {
      const extensao = arquivoDocumento.name.split(".").pop()?.toLowerCase() || "";
      const extensoesPermitidas = ["pdf", "png", "jpg", "jpeg", "webp", "doc", "docx", "xls", "xlsx"];
      if (!extensoesPermitidas.includes(extensao) || arquivoDocumento.size > 20 * 1024 * 1024) {
        setErro("Selecione PDF, imagem, Word ou Excel de até 20 MB.");
        setSalvando(false);
        return;
      }
      novoArquivoPath = `${empresaAtual.id}/${crypto.randomUUID()}.${extensao}`;
      const tiposPorExtensao: Record<string, string> = {
        pdf: "application/pdf",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        webp: "image/webp",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
      const { error: uploadError } = await supabase.storage
        .from("previx-documents")
        .upload(novoArquivoPath, arquivoDocumento, { contentType: arquivoDocumento.type || tiposPorExtensao[extensao], upsert: false });
      if (uploadError) {
        setErro(`Não foi possível enviar o documento: ${uploadError.message}. Verifique se a migration de documentos foi aplicada.`);
        setSalvando(false);
        return;
      }
      payload.arquivo = arquivoDocumento.name;
      payload.arquivo_path = novoArquivoPath;
      payload.arquivo_tipo = arquivoDocumento.type;
      payload.arquivo_tamanho = arquivoDocumento.size;
    } else if (categoria === "documentos" && editando?.arquivo_path) {
      payload.arquivo = editando.arquivo;
      payload.arquivo_path = editando.arquivo_path;
      payload.arquivo_tipo = editando.arquivo_tipo;
      payload.arquivo_tamanho = editando.arquivo_tamanho;
    }
    let resultado: { data: any; error: any };
    if (editando) {
      resultado = await supabase.rpc("previx_update_record", {
        p_company_id: empresaAtual.id,
        p_record_id: editando.id,
        p_payload: payload,
      });
    } else {
      resultado = await supabase.rpc("previx_create_record", {
        p_company_id: empresaAtual.id,
        p_category: categoria,
        p_payload: payload,
      });
    }
    const recordId = editando
      ? resultado.data === true ? editando.id : ""
      : typeof resultado.data === "string" ? resultado.data : "";
    if (resultado.error || !recordId) {
      let falhaLimpeza = "";
      if (novoArquivoPath) {
        const { error: cleanupError } = await supabase.storage.from("previx-documents").remove([novoArquivoPath]);
        if (cleanupError) falhaLimpeza = ` O arquivo enviado também não pôde ser removido: ${cleanupError.message}`;
      }
      const detalheFalha = resultado.error
        ? `: ${resultado.error.message}`
        : editando
          ? ": registro não encontrado ou não autorizado."
          : ": o Supabase não retornou o ID. Aplique a migration previx_create_record_returns_id no projeto Supabase.";
      setErro(`Não foi possível salvar${detalheFalha}${falhaLimpeza}`);
    } else {
      if (novoArquivoPath && editando?.arquivo_path) {
        const { error: cleanupError } = await supabase.storage.from("previx-documents").remove([editando.arquivo_path]);
        if (cleanupError) setErro(`Documento salvo, mas o arquivo anterior não pôde ser removido: ${cleanupError.message}`);
      }
      setModal(false);
      setForm({});
      setEditando(null);
      setArquivoDocumento(null);
      const registrosAtualizados = await carregarRegistros();
      if (!registrosAtualizados?.[categoria as Categoria].some(registro => registro.id === recordId)) {
        setErro("O Supabase confirmou a gravação, mas o registro não apareceu na lista atualizada. Não repita o cadastro antes de atualizar a lista.");
      } else {
        setMensagem("Salvo com sucesso.");
      }
    }
    setSalvando(false);
  }

  async function confirmarAgendamentoExame() {
    const funcionario = registros.funcionarios.find(item => item.id === funcionarioExameId);
    const clinica = registros.clinicas.find(item => item.id === clinicaExameId) || registros.clinicas[0];
    if (!empresaAtual || !funcionario || !clinica || tiposExameSelecionados.length === 0) {
      setErro("Selecione um funcionário, uma clínica parceira e pelo menos um tipo de exame.");
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");
    const resultados = await Promise.all(tiposExameSelecionados.map(tipo => supabase.rpc("previx_create_record", {
      p_company_id: empresaAtual.id,
      p_category: "exames",
      p_payload: {
        nome: funcionario.nome,
        funcionario: funcionario.nome,
        cpf: funcionario.cpf || "",
        tipo,
        data: diaExameSelecionado,
        resultado: "Aguardando",
        clinica: clinica.nome,
        clinica_id: clinica.id,
        empresa: empresaAtual.nome,
        status: "Agendado",
      },
    })));

    const falha = resultados.find(resultado => resultado.error || typeof resultado.data !== "string" || !resultado.data);
    if (falha) {
      await carregarRegistros();
      setErro(`Não foi possível concluir todos os agendamentos: ${falha.error?.message || "o Supabase não retornou o identificador do registro."} Verifique a lista antes de tentar novamente.`);
      setSalvando(false);
      return;
    }

    const idsCriados = resultados.map(resultado => resultado.data as string);
    setFuncionarioExameId("");
    setBuscaFuncionarioExame("");
    setTiposExameSelecionados([]);
    const registrosAtualizados = await carregarRegistros();
    if (!registrosAtualizados || !idsCriados.every(id => registrosAtualizados.exames.some(registro => registro.id === id))) {
      setErro("O Supabase confirmou o agendamento, mas os exames não apareceram na lista atualizada. Atualize a lista antes de tentar novamente.");
    } else {
      setMensagem(`✅ Agendado! ${funcionario.nome} • ${clinica.nome} • ${formatarData(diaExameSelecionado)}`);
    }
    setSalvando(false);
  }

  function limparAssinatura() {
    const canvas = assinaturaCanvas.current;
    if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setAssinaturaFeita(false);
  }

  async function verificarPinEntrega() {
    const funcionario = registros.funcionarios.find(item => item.id === entregaEpi.employeeId);
    if (!empresaAtual || !funcionario || !/^\d{4}$/.test(pinConfirmacao)) {
      setErro("Selecione o funcionário e informe o PIN de quatro dígitos.");
      return;
    }
    setVerificandoPin(true);
    setErro("");
    setPinVerificado(false);
    setWebAuthnToken("");
    setWebAuthnVerificadoEm("");
    const { data, error } = await supabase.rpc("previx_verify_employee_pin", {
      p_company_id: empresaAtual.id,
      p_employee_id: funcionario.id,
      p_pin: pinConfirmacao,
    });
    if (error) setErro(`Não foi possível verificar o PIN: ${error.message}`);
    else if (data !== true) setErro("PIN incorreto ou temporariamente bloqueado.");
    else setPinVerificado(true);
    setVerificandoPin(false);
  }

  async function coletarAutenticador() {
    const funcionario = registros.funcionarios.find(item => item.id === entregaEpi.employeeId);
    if (!empresaAtual || !funcionario || !pinVerificado) {
      setErro("Verifique primeiro o PIN do funcionário.");
      return;
    }
    if (!window.isSecureContext || !navigator.credentials) {
      setErro("Este navegador não oferece WebAuthn seguro. Use o domínio HTTPS do painel em um dispositivo compatível.");
      return;
    }

    setColetandoBiometria(true);
    setErro("");
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("Sessão expirada. Entre novamente no PREVIX.");

      const optionsResponse = await fetch("/api/webauthn/options", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ companyId: empresaAtual.id, employeeId: funcionario.id, pin: pinConfirmacao }),
      });
      const optionsResult = await optionsResponse.json();
      if (!optionsResponse.ok) throw new Error(optionsResult.error || "Não foi possível iniciar o autenticador.");

      const credential = optionsResult.purpose === "registration"
        ? await startRegistration({ optionsJSON: optionsResult.options })
        : await startAuthentication({ optionsJSON: optionsResult.options });
      const verificationResponse = await fetch("/api/webauthn/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          companyId: empresaAtual.id,
          employeeId: funcionario.id,
          pin: pinConfirmacao,
          challengeId: optionsResult.challengeId,
          response: credential,
        }),
      });
      const verification = await verificationResponse.json();
      if (!verificationResponse.ok || verification.verified !== true || typeof verification.token !== "string") {
        throw new Error(verification.error || "O servidor não confirmou o autenticador.");
      }
      setWebAuthnToken(verification.token);
      setWebAuthnVerificadoEm(verification.verifiedAt);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível verificar o autenticador.");
    } finally {
      setColetandoBiometria(false);
    }
  }

  function iniciarAssinatura(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = assinaturaCanvas.current;
    if (!canvas) return;
    desenhandoAssinatura.current = true;
    canvas.setPointerCapture(event.pointerId);
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo((event.clientX - rect.left) * canvas.width / rect.width, (event.clientY - rect.top) * canvas.height / rect.height);
  }

  function desenharAssinatura(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = assinaturaCanvas.current;
    if (!canvas || !desenhandoAssinatura.current) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.lineTo((event.clientX - rect.left) * canvas.width / rect.width, (event.clientY - rect.top) * canvas.height / rect.height);
    ctx.stroke();
    setAssinaturaFeita(true);
  }

  async function salvarEntregaEpi(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!empresaAtual) return;
    const funcionario = registros.funcionarios.find(item => item.id === entregaEpi.employeeId);
    if (!funcionario) {
      setErro("Selecione um funcionário cadastrado nesta empresa.");
      return;
    }
    if (!entregaEpi.nome.trim()) {
      setErro("Informe o EPI entregue.");
      return;
    }
    if (!pinVerificado) {
      setErro("Verifique o PIN do funcionário antes de continuar.");
      return;
    }
    if (!webAuthnToken) {
      setErro("Conclua a autenticação local do dispositivo antes de continuar.");
      return;
    }
    if (!assinaturaFeita) {
      setErro("Solicite a assinatura do funcionário no campo de assinatura.");
      return;
    }
    if (!consentimento) {
      setErro("O funcionário precisa confirmar o recebimento do EPI.");
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    const payload = {
      nome: entregaEpi.nome.trim(),
      ca: entregaEpi.ca.trim(),
      tipo: entregaEpi.tipo.trim(),
      quantidade: Math.max(1, Number(entregaEpi.quantidade) || 1),
      data_entrega: entregaEpi.data_entrega || dataHoje(),
      funcionario: funcionario.nome,
      empresa_id: empresaAtual.id,
      empresa: empresaAtual.nome,
      pinVerificado: true,
      biometria: { metodo: "WebAuthn", verificado_em: webAuthnVerificadoEm },
      assinaturaImg: assinaturaCanvas.current?.toDataURL("image/png"),
    };
    const { data: recordId, error } = await supabase.rpc("previx_create_epi_delivery", {
      p_company_id: empresaAtual.id,
      p_employee_id: funcionario.id,
      p_employee_pin: pinConfirmacao.trim(),
      p_payload: payload,
      p_hand_signature: assinaturaCanvas.current?.toDataURL("image/png"),
      p_consent: consentimento,
      p_biometric_token: webAuthnToken,
    });
    if (error) {
      setErro(`Não foi possível registrar a entrega: ${error.message}`);
      setSalvando(false);
      return;
    }
    if (!recordId) {
      setErro("PIN incorreto. A entrega não foi registrada.");
      setSalvando(false);
      return;
    }
    setModal(false);
    setPinConfirmacao("");
    setPinVerificado(false);
    setWebAuthnToken("");
    setWebAuthnVerificadoEm("");
    const registrosAtualizados = await carregarRegistros();
    if (!registrosAtualizados?.epis.some(registro => registro.id === recordId)) {
      setErro("O Supabase confirmou a entrega, mas ela não apareceu na lista atualizada. Não repita o registro antes de atualizar a lista.");
    } else {
      setMensagem(`Entrega registrada para ${funcionario.nome} com PIN, autenticador WebAuthn e assinatura.`);
    }
    setSalvando(false);
  }

  async function excluirRegistro(registro: Registro) {
    if (!empresaAtual || categoria === "inicio" || categoria === "empresas") return;
    if (!window.confirm(`Excluir "${registro.nome || registro.titulo || registro.descricao || "este registro"}"?`)) return;
    const { data, error } = await supabase.rpc("previx_delete_record", {
      p_company_id: empresaAtual.id,
      p_record_id: registro.id,
    });
    if (error || data !== true) {
      setErro(`Não foi possível excluir${error ? `: ${error.message}` : ": registro não encontrado ou não autorizado."}`);
      return;
    }
    if (typeof registro.arquivo_path === "string") {
      const { error: storageError } = await supabase.storage.from("previx-documents").remove([registro.arquivo_path]);
      if (storageError) {
        setErro(`Registro excluído, mas o documento ${registro.arquivo || "anexado"} não pôde ser removido: ${storageError.message}`);
      }
    }
    setMensagem("Registro excluído.");
    await carregarRegistros();
  }

  async function abrirDocumento(registro: Registro) {
    if (!empresaAtual || typeof registro.arquivo_path !== "string" || !registro.arquivo_path.startsWith(`${empresaAtual.id}/`)) {
      setErro("O documento não possui um caminho válido para esta empresa.");
      return;
    }
    const { data, error } = await supabase.storage.from("previx-documents").createSignedUrl(registro.arquivo_path, 60);
    if (error || !data?.signedUrl) {
      setErro(`Não foi possível abrir o documento: ${error?.message || "link protegido indisponível."}`);
      return;
    }
    const link = document.createElement("a");
    link.href = data.signedUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  }

  function gerarSenhaEmpresa() {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    setEmpresaForm(atual => ({ ...atual, senha: `Previx${String(bytes[0] % 10000).padStart(4, "0")}@` }));
  }

  function editarEmpresa(empresa: Empresa) {
    setEmpresaEdicaoId(empresa.id);
    setEmpresaLoginManual(true);
    setEmpresaSenhaVisivel(false);
    setEmpresaForm({
      nome: empresa.nome,
      cnpj: empresa.cnpj || "",
      responsavel: empresa.responsavel || "",
      telefone: empresa.telefone || "",
      email: empresa.email || "",
      login: empresa.login || "",
      senha: "",
      status: empresa.status || "Ativa",
    });
  }

  function cancelarEdicaoEmpresa() {
    setEmpresaEdicaoId("");
    setEmpresaLoginManual(false);
    setEmpresaSenhaVisivel(false);
    setEmpresaForm({ nome: "", cnpj: "", responsavel: "", telefone: "", email: "", login: "", senha: "", status: "Ativa" });
  }

  async function salvarEmpresa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSalvandoEmpresa(true);
    const login = (empresaForm.login || empresaForm.nome)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "")
      .slice(0, 40);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) throw new Error(`Não foi possível validar a sessão administrativa: ${sessionError?.message || "sessão ausente."}`);
      const response = await fetch("/api/admin/companies", {
        method: empresaEdicaoId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ ...empresaForm, login, id: empresaEdicaoId || undefined }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "erro desconhecido.");
      const savedCompany = result.company as Empresa;
      const isCreation = !empresaEdicaoId;
      if (isCreation) setAcessoInicialEmpresa({ login, email: empresaForm.email, senha: empresaForm.senha });
      setEmpresas(atual => isCreation
        ? [...atual, savedCompany].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
        : atual.map(item => item.id === savedCompany.id ? savedCompany : item));
      if (isCreation) setEmpresaAtual(savedCompany);
      setMensagem(isCreation
        ? `Empresa "${savedCompany.nome}" cadastrada. Copie os dados de acesso antes de fechar este aviso.`
        : `Empresa "${savedCompany.nome}" atualizada. A senha não é armazenada nem exibida; use o campo de senha para redefini-la.`);
      cancelarEdicaoEmpresa();
    } catch (error) {
      setErro(`Não foi possível ${empresaEdicaoId ? "atualizar" : "cadastrar"} a empresa: ${error instanceof Error ? error.message : "falha inesperada."}`);
    } finally {
      setSalvandoEmpresa(false);
    }
  }

  async function excluirEmpresa(empresa: Empresa) {
    if (!window.confirm(`Excluir a empresa "${empresa.nome}", o acesso de login e todos os registros associados? Esta ação não pode ser desfeita.`)) return;
    setErro("");
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      setErro(`Não foi possível validar a sessão administrativa: ${sessionError?.message || "sessão ausente."}`);
      return;
    }
    try {
      const response = await fetch("/api/admin/companies", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ id: empresa.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "erro desconhecido.");
      setEmpresas(atual => atual.filter(item => item.id !== empresa.id));
      if (empresaAtual?.id === empresa.id) setEmpresaAtual(empresas.find(item => item.id !== empresa.id) || null);
      if (empresaEdicaoId === empresa.id) cancelarEdicaoEmpresa();
      setMensagem(`Empresa "${empresa.nome}" e os registros associados foram excluídos.`);
    } catch (error) {
      setErro(`Não foi possível excluir a empresa: ${error instanceof Error ? error.message : "falha inesperada."}`);
    }
  }

  async function copiarLoginEmpresa(empresa: Empresa) {
    try {
      await navigator.clipboard.writeText(`Login: ${empresa.login || "—"}\nE-mail: ${empresa.email || "—"}`);
      setMensagem(`Login e e-mail de ${empresa.nome} copiados. A senha não é recuperável; redefina-a editando o acesso.`);
    } catch (error) {
      setErro(`Não foi possível copiar o acesso: ${error instanceof Error ? error.message : "permissão da área de transferência indisponível."}`);
    }
  }

  async function copiarAcessoInicialEmpresa() {
    if (!acessoInicialEmpresa) return;
    try {
      await navigator.clipboard.writeText(`Login: ${acessoInicialEmpresa.login}\nE-mail: ${acessoInicialEmpresa.email}\nSenha inicial: ${acessoInicialEmpresa.senha}`);
      setMensagem("Acesso inicial copiado. Guarde-o com segurança; a senha não será exibida novamente.");
    } catch (error) {
      setErro(`Não foi possível copiar o acesso inicial: ${error instanceof Error ? error.message : "permissão da área de transferência indisponível."}`);
    }
  }

  function imprimirRelatorio(tipo: string) {
    if (!empresaAtual) return;
    const categorias = tipo === "Painel completo"
      ? CATEGORIAS.map(item => item.id)
      : CATEGORIAS_POR_RELATORIO[tipo] || CATEGORIAS.filter(item => item.label === tipo).map(item => item.id);
    const secoes = categorias.map(categoriaRelatorio => {
      const definicao = CATEGORIAS.find(item => item.id === categoriaRelatorio);
      const campos = categoriaRelatorio === "documentos"
        ? [...CAMPOS.documentos, { chave: "arquivo", rotulo: "Arquivo anexado", tipo: "text" }]
        : CAMPOS[categoriaRelatorio];
      const itens = registros[categoriaRelatorio];
      const linhas = itens.map(item => {
        const confirmacao = item.assinatura?.metodo === "pin_biometria_assinatura"
          ? `PIN + verificação WebAuthn + assinatura${typeof item.assinaturaImg === "string" && /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(item.assinaturaImg) ? `<br><img alt="Assinatura" src="${item.assinaturaImg}" style="max-width:140px;max-height:45px">` : ""}`
          : escaparHtml(item.assinatura?.metodo);
        return `<tr>${campos.map(campo => `<td>${escaparHtml(item[campo.chave])}</td>`).join("")}${categoriaRelatorio === "epis" ? `<td>${confirmacao}</td>` : ""}</tr>`;
      }).join("");
      return `<section><h2>${escaparHtml(definicao?.label || categoriaRelatorio)}</h2>${itens.length ? `<table><thead><tr>${campos.map(campo => `<th>${escaparHtml(campo.rotulo)}</th>`).join("")}${categoriaRelatorio === "epis" ? "<th>Confirmação</th>" : ""}</tr></thead><tbody>${linhas}</tbody></table>` : "<p>Nenhum registro cadastrado.</p>"}</section>`;
    }).join("");
    const profissional = registros.tecnico[0];
    const nomeProfissional = profissional?.nome || "Cristiano Vicente";
    const nomeSeguro = escaparHtml(nomeProfissional);
    const nomeEmpresa = escaparHtml(empresaAtual.nome);
    const dataEmissao = new Date().toLocaleString("pt-BR");
    const incluiPlano = ["PGR", "LTCAT", "PCMSO"].includes(tipo);
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escaparHtml(tipo)} - ${nomeEmpresa}</title><style>
      *{box-sizing:border-box}body{margin:0;padding:24px;font:14px Arial,sans-serif;color:#172033}.actions{display:flex;justify-content:flex-end;gap:8px;margin:0 auto 16px;max-width:980px}.actions button{border:0;border-radius:8px;background:#0f766e;color:#fff;padding:10px 16px;font-weight:bold;cursor:pointer}.page{max-width:980px;margin:auto}.header{display:grid;grid-template-columns:135px 1fr 135px;align-items:center;gap:14px;border-bottom:4px solid #0f766e;padding-bottom:14px;text-align:center}.logo{height:82px;border:1px dashed #94a3b8;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:11px;font-weight:bold}.brand{color:#0f766e;letter-spacing:3px;font-weight:bold}.header h1{font-size:22px;margin:5px 0}.header p,.muted{color:#64748b;font-size:12px}.company{margin:16px 0;padding:10px;background:#f1f5f9}.tech{padding:10px;border:1px solid #cbd5e1;margin:12px 0}section{margin:18px 0}h2{font-size:16px;color:#0f766e;border-bottom:1px solid #cbd5e1;padding-bottom:6px}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #cbd5e1;padding:6px;text-align:left;overflow-wrap:anywhere;vertical-align:top}th{background:#f1f5f9}.plan{min-height:80px;border:1px solid #cbd5e1;padding:10px}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-top:55px}.line{border-top:1px solid #334155;text-align:center;padding-top:7px}.foot{margin-top:22px;border-top:1px solid #cbd5e1;padding-top:10px;font-size:10px;color:#64748b}@media print{@page{size:A4;margin:14mm}.actions{display:none}body{padding:0}section,tr{break-inside:avoid}.header{-webkit-print-color-adjust:exact;print-color-adjust:exact}}@media(max-width:600px){body{padding:12px}.header{grid-template-columns:1fr}.logo{height:55px}.signatures{grid-template-columns:1fr}}
      </style></head><body><div class="actions"><button onclick="window.print()">Imprimir / Salvar PDF</button></div><main class="page"><header class="header"><div class="logo">LOGO PRESTADORA</div><div><div class="brand">PREVIX SST</div><h1>RELATÓRIO ${escaparHtml(tipo)}</h1><p>Emitido em ${escaparHtml(dataEmissao)}</p></div><div class="logo">LOGO CLIENTE<br>${nomeEmpresa}</div></header><div class="company"><b>Empresa:</b> ${nomeEmpresa}</div><div class="tech"><b>Responsável técnico informado:</b> ${nomeSeguro}<br><b>Função:</b> ${escaparHtml(profissional?.funcao)} · <b>CREA:</b> ${escaparHtml(profissional?.crea)} · <b>MTE:</b> ${escaparHtml(profissional?.mte)}</div>${secoes}${incluiPlano ? `<section><h2>Plano de ação e medidas de controle</h2><div class="plan">Implementar e acompanhar as medidas de controle cadastradas para cada risco. Validar prioridades, responsáveis, prazos e eficácia por profissional habilitado, conforme avaliação específica do ambiente.</div><h2>Conclusão</h2><div class="plan">Este documento reflete os registros disponíveis no PREVIX na data de emissão. A conclusão técnica depende de revisão e validação por profissional habilitado.</div></section>` : ""}<footer class="signatures"><div class="line">${nomeSeguro}<br>Responsável técnico</div><div class="line">${nomeEmpresa}<br>Representante da empresa</div></footer><p class="foot">Relatório gerado pelo PREVIX SST. Revisar os dados e a aplicabilidade técnica antes de usar como documento oficial.</p></main></body></html>`;
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      setErro("O navegador bloqueou a nova aba. Permita pop-ups para gerar o relatório.");
      return;
    }
    reportWindow.opener = null;
    reportWindow.document.open();
    reportWindow.document.write(html);
    reportWindow.document.close();
  }

  function imprimirTermoEpi(registro: Registro) {
    if (!empresaAtual) return;
    const assinatura = typeof registro.assinaturaImg === "string"
      && /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(registro.assinaturaImg)
      ? `<img class="signature-image" src="${registro.assinaturaImg}" alt="Assinatura do funcionário">`
      : "<p>Assinatura não disponível.</p>";
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      setErro("O navegador bloqueou a nova aba. Permita pop-ups para gerar o termo.");
      return;
    }
    reportWindow.opener = null;
    reportWindow.document.open();
    reportWindow.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Termo de Entrega de EPI - ${escaparHtml(empresaAtual.nome)}</title><style>
      *{box-sizing:border-box}body{max-width:850px;margin:32px auto;padding:24px;color:#172033;font:14px Arial,sans-serif}.header{display:grid;grid-template-columns:120px 1fr 120px;gap:12px;align-items:center;text-align:center;border-bottom:3px solid #0f766e;padding-bottom:14px}.logo{height:70px;border:1px dashed #94a3b8;display:grid;place-items:center;color:#64748b;font-size:10px;font-weight:bold}.header h1{font-size:20px}.brand{color:#0f766e;font-weight:bold;letter-spacing:2px}.section{margin:18px 0;padding:14px;border:1px solid #cbd5e1;border-radius:8px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.signature-image{display:block;max-width:250px;max-height:100px;margin:12px 0;border-bottom:1px solid #334155}.sign{margin-top:42px;border-top:1px solid #334155;text-align:center;padding-top:8px}.actions{text-align:right;margin-bottom:16px}.actions button{background:#0f766e;color:#fff;border:0;border-radius:8px;padding:10px 16px;font-weight:bold}@media print{@page{size:A4;margin:16mm}.actions{display:none}body{margin:0;padding:0}}@media(max-width:600px){.header{grid-template-columns:1fr}.logo{height:50px}.grid{grid-template-columns:1fr}}
      </style></head><body><div class="actions"><button onclick="window.print()">Imprimir / Salvar PDF</button></div><header class="header"><div class="logo">LOGO PRESTADORA</div><div><div class="brand">PREVIX SST</div><h1>TERMO DE ENTREGA DE EPI — NR-06</h1><p>${escaparHtml(empresaAtual.nome)}</p></div><div class="logo">LOGO CLIENTE</div></header><section class="section"><h2>Identificação da entrega</h2><div class="grid"><p><b>Funcionário:</b> ${escaparHtml(registro.funcionario)}</p><p><b>EPI:</b> ${escaparHtml(registro.nome)}</p><p><b>CA:</b> ${escaparHtml(registro.ca)}</p><p><b>Tipo / modelo:</b> ${escaparHtml(registro.tipo)}</p><p><b>Quantidade:</b> ${escaparHtml(registro.quantidade)}</p><p><b>Data da entrega:</b> ${escaparHtml(registro.data_entrega)}</p></div></section><section class="section"><h2>Confirmação</h2><p>PIN validado: ${registro.pinVerificado === true ? "Sim" : "Não"}</p><p>Verificação do dispositivo: WebAuthn · ${escaparHtml(registro.biometria?.verificado_em)}</p><p>Recebimento confirmado: ${registro.assinatura?.consentimento === true ? "Sim" : "Não"}</p>${assinatura}<div class="sign">${escaparHtml(registro.funcionario)}<br>Assinatura do funcionário</div></section><p>Termo de registro da entrega de EPI. Confirme se os dados e procedimentos correspondem ao evento real antes de arquivar.</p></body></html>`);
    reportWindow.document.close();
  }

  const titulo = categoria === "inicio"
    ? "Início"
    : categoria === "empresas"
      ? "Empresas"
      : CATEGORIAS.find(item => item.id === categoria)?.label || "";
  const termoEpi = entregaEpi.nome.trim().toLocaleLowerCase("pt-BR");
  const episSugeridos = CATALOGO_EPIS.filter(item => {
    if (!termoEpi) return true;
    if (termoEpi.length === 1) return item.codigo.toLocaleLowerCase("pt-BR") === termoEpi;
    return item.nome.toLocaleLowerCase("pt-BR").includes(termoEpi) || item.codigo.toLocaleLowerCase("pt-BR").startsWith(termoEpi);
  });
  const funcionariosSugeridos = registros.funcionarios.filter(item => {
    const termo = buscaFuncionarioEpi.trim().toLocaleLowerCase("pt-BR");
    return !termo || `${item.nome || ""} ${item.cpf || ""}`.toLocaleLowerCase("pt-BR").includes(termo);
  });
  const funcionarioSelecionadoExame = registros.funcionarios.find(item => item.id === funcionarioExameId) || null;
  const termoFuncionarioExame = buscaFuncionarioExame.trim().toLocaleLowerCase("pt-BR");
  const digitosFuncionarioExame = buscaFuncionarioExame.replace(/\D/g, "");
  const funcionariosSugeridosExame = registros.funcionarios.filter(item => {
    if (!termoFuncionarioExame) return false;
    const nome = String(item.nome || "").toLocaleLowerCase("pt-BR");
    const cpf = String(item.cpf || "");
    return nome.includes(termoFuncionarioExame)
      || (digitosFuncionarioExame.length > 0 && cpf.replace(/\D/g, "").includes(digitosFuncionarioExame));
  }).slice(0, 5);
  const clinicaSelecionadaExame = registros.clinicas.find(item => item.id === clinicaExameId) || registros.clinicas[0] || null;
  const registrosExameEmDia = registros.exames
    .filter(item => String(item.data || "").slice(0, 10) === diaExameSelecionado)
    .sort((a, b) => String(a.funcionario || a.nome || "").localeCompare(String(b.funcionario || b.nome || ""), "pt-BR"));
  const termoBuscaExames = buscaExames.trim().toLocaleLowerCase("pt-BR");
  const examesOrdenados = [...registros.exames]
    .filter(item => !termoBuscaExames || [
      item.nome, item.funcionario, item.cpf, item.tipo, item.clinica, item.resultado, item.status,
    ].some(valor => String(valor || "").toLocaleLowerCase("pt-BR").includes(termoBuscaExames))
      || (buscaExames.replace(/\D/g, "").length > 0 && String(item.cpf || "").replace(/\D/g, "").includes(buscaExames.replace(/\D/g, ""))))
    .sort((a, b) => String(a.data || "").localeCompare(String(b.data || "")) || String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
  const dataMesCalendario = new Date(`${mesCalendario}-01T12:00:00`);
  const diasNoMesCalendario = new Date(dataMesCalendario.getFullYear(), dataMesCalendario.getMonth() + 1, 0).getDate();
  const deslocamentoCalendario = (new Date(dataMesCalendario.getFullYear(), dataMesCalendario.getMonth(), 1).getDay() + 6) % 7;
  const diasCalendario: (string | null)[] = [
    ...Array.from({ length: deslocamentoCalendario }, () => null),
    ...Array.from({ length: diasNoMesCalendario }, (_, index) => dataLocalISO(new Date(dataMesCalendario.getFullYear(), dataMesCalendario.getMonth(), index + 1))),
  ];
  const mesCalendarioTitulo = dataMesCalendario.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
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
              <span className={`rounded-full px-3 py-1 text-[10px] font-black tracking-wide ${ehAdm ? "bg-blue-100 text-blue-800" : "bg-teal-100 text-teal-800"}`}>{ehAdm ? "ADMIN" : "EMPRESA"}</span>
            </div>
            <div className="flex items-center gap-3">
              {ehAdm && (
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  Empresa
                  <select
                    value={empresaAtual?.id || ""}
                    onChange={event => {
                      setEmpresaAtual(empresas.find(empresa => empresa.id === event.target.value) || null);
                      setFuncionarioExameId("");
                      setBuscaFuncionarioExame("");
                      setTiposExameSelecionados([]);
                      setClinicaExameId("");
                      setBuscaExames("");
                    }}
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
          {pinGerado && (
            <section role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
              <p><b>PIN de {pinGerado.nome}:</b> <span className="font-mono text-lg font-black tracking-widest">{pinGerado.pin}</span> — anote agora; ele não será exibido novamente.</p>
              <button onClick={() => setPinGerado(null)} className="rounded-lg bg-amber-200 px-3 py-2 text-sm font-bold">Entendi</button>
            </section>
          )}
          {acessoInicialEmpresa && categoria === "empresas" && (
            <section role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
              <div>
                <p className="font-black">Acesso inicial da empresa — copie agora</p>
                <p className="mt-1 text-sm">Login: <b>{acessoInicialEmpresa.login}</b> · E-mail: <b>{acessoInicialEmpresa.email}</b> · Senha: <b className="font-mono">{acessoInicialEmpresa.senha}</b></p>
                <p className="mt-1 text-xs">A senha aparece somente nesta sessão e não é salva como texto no banco.</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => void copiarAcessoInicialEmpresa()} className="rounded-lg bg-amber-200 px-3 py-2 text-sm font-bold">Copiar acesso</button>
                <button type="button" onClick={() => setAcessoInicialEmpresa(null)} className="rounded-lg bg-white px-3 py-2 text-sm font-bold">Fechar</button>
              </div>
            </section>
          )}

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
                      <button onClick={() => imprimirRelatorio("Painel completo")} className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white">Gerar relatório completo em PDF</button>
                      {["PGR", "LTCAT", "LIP", "PCMSO"].map(tipo => <button key={tipo} onClick={() => imprimirRelatorio(tipo)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-white" style={{ background: tipo === "PGR" ? "#0d9488" : tipo === "LTCAT" ? "#2563eb" : tipo === "LIP" ? "#d97706" : "#16a34a" }}>Gerar {tipo}</button>)}
                    </div>
                  </section>
                </>
              )}
            </div>
          ) : categoria === "empresas" ? (
            ehAdm ? (
              <section>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-black">Empresas</h1>
                    <p className="mt-1 text-sm text-slate-500">Cadastre empresas e gerencie seus acessos ao PREVIX.</p>
                  </div>
                  <button type="button" onClick={cancelarEdicaoEmpresa} className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white hover:bg-teal-800">
                    + Cadastrar Empresa
                  </button>
                </div>
                <form onSubmit={salvarEmpresa} className="mb-5 grid gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-2">
                  <label className="text-xs font-bold text-slate-600 sm:col-span-2">Nome da empresa *
                    <input required value={empresaForm.nome} onChange={event => {
                      const nome = event.target.value;
                      setEmpresaForm(atual => ({
                        ...atual,
                        nome,
                        ...(!empresaLoginManual ? { login: nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9._-]+/g, "").slice(0, 40) } : {}),
                      }));
                    }} placeholder="Ex.: NORTE VIDROS" className={`${INPUT_CLASS} mt-1`} />
                  </label>
                  <label className="text-xs font-bold text-slate-600">CNPJ
                    <input value={empresaForm.cnpj} onChange={event => {
                      const digits = event.target.value.replace(/\D/g, "").slice(0, 14);
                      const cnpj = digits
                        .replace(/^(\d{2})(\d)/, "$1.$2")
                        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
                        .replace(/\.(\d{3})(\d)/, ".$1/$2")
                        .replace(/(\d{4})(\d)/, "$1-$2");
                      setEmpresaForm(atual => ({ ...atual, cnpj }));
                    }} placeholder="00.000.000/0001-00" inputMode="numeric" className={`${INPUT_CLASS} mt-1`} />
                  </label>
                  <label className="text-xs font-bold text-slate-600">Responsável
                    <input value={empresaForm.responsavel} onChange={event => setEmpresaForm(atual => ({ ...atual, responsavel: event.target.value }))} className={`${INPUT_CLASS} mt-1`} />
                  </label>
                  <label className="text-xs font-bold text-slate-600">Telefone
                    <input type="tel" value={empresaForm.telefone} onChange={event => setEmpresaForm(atual => ({ ...atual, telefone: event.target.value }))} className={`${INPUT_CLASS} mt-1`} />
                  </label>
                  <label className="text-xs font-bold text-slate-600">E-mail de acesso Supabase Auth *
                    <input required type="email" autoComplete="email" value={empresaForm.email} onChange={event => setEmpresaForm(atual => ({ ...atual, email: event.target.value }))} className={`${INPUT_CLASS} mt-1`} />
                  </label>
                  <label className="text-xs font-bold text-slate-600">Login identificador *
                    <input required minLength={2} maxLength={40} pattern="[a-z0-9][a-z0-9._-]{1,39}" value={empresaForm.login} onChange={event => {
                      setEmpresaLoginManual(true);
                      setEmpresaForm(atual => ({ ...atual, login: event.target.value.toLowerCase().replace(/\s/g, "") }));
                    }} placeholder="nortevidros" className={`${INPUT_CLASS} mt-1`} />
                    <span className="mt-1 block font-normal text-slate-500">Use o e-mail e a senha no login; este identificador é exibido para referência.</span>
                  </label>
                  <label className="text-xs font-bold text-slate-600">Senha {empresaEdicaoId ? "(opcional para redefinir)" : "inicial *"}
                    <span className="mt-1 flex gap-2">
                      <input required={!empresaEdicaoId} minLength={6} type={empresaSenhaVisivel ? "text" : "password"} autoComplete="new-password" value={empresaForm.senha} onChange={event => setEmpresaForm(atual => ({ ...atual, senha: event.target.value }))} className={INPUT_CLASS} />
                      <button type="button" onClick={() => setEmpresaSenhaVisivel(visivel => !visivel)} className="shrink-0 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700" aria-label={empresaSenhaVisivel ? "Ocultar senha" : "Mostrar senha"}>{empresaSenhaVisivel ? "Ocultar" : "Mostrar"}</button>
                    </span>
                  </label>
                  <div className="flex items-end gap-2">
                    <button type="button" onClick={gerarSenhaEmpresa} className="rounded-xl bg-sky-50 px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-sky-100">Gerar senha</button>
                    <label className="flex-1 text-xs font-bold text-slate-600">Status
                      <select value={empresaForm.status} onChange={event => setEmpresaForm(atual => ({ ...atual, status: event.target.value }))} className={`${INPUT_CLASS} mt-1`}>
                        <option>Ativa</option><option>Inativa</option>
                      </select>
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 sm:col-span-2">A senha é gerenciada pelo Supabase Auth e nunca é gravada nem exibida na lista. Deixe vazia ao editar para mantê-la.</p>
                  <div className="flex gap-2 sm:col-span-2">
                    <button type="submit" disabled={salvandoEmpresa} className="rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 py-3 font-bold text-white disabled:opacity-60">{salvandoEmpresa ? "Salvando..." : empresaEdicaoId ? "Salvar alterações" : "Cadastrar Empresa"}</button>
                    {empresaEdicaoId && <button type="button" onClick={cancelarEdicaoEmpresa} className="rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700">Cancelar</button>}
                  </div>
                </form>
                <input value={buscaEmpresas} onChange={event => setBuscaEmpresas(event.target.value)} placeholder="Buscar por nome ou CNPJ..." className={`${INPUT_CLASS} mb-4`} />
                <div className="space-y-3">
                  {empresas.filter(empresa => {
                    const termo = buscaEmpresas.trim().toLocaleLowerCase("pt-BR");
                    return `${empresa.nome} ${empresa.cnpj || ""}`.toLocaleLowerCase("pt-BR").includes(termo)
                      || (buscaEmpresas.replace(/\D/g, "").length > 0 && String(empresa.cnpj || "").replace(/\D/g, "").includes(buscaEmpresas.replace(/\D/g, "")));
                  }).map(empresa => (
                    <article key={empresa.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${empresaAtual?.id === empresa.id ? "border-teal-600 ring-2 ring-teal-100" : "border-slate-200"}`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <button type="button" onClick={() => { setEmpresaAtual(empresa); setCategoria("inicio"); }} className="min-w-0 flex-1 text-left">
                          <span className="text-2xl">🏢</span>
                          <span className="mt-2 block font-black">{empresa.nome}</span>
                          <span className="mt-1 block text-sm text-slate-500">CNPJ: {empresa.cnpj || "—"} · Responsável: {empresa.responsavel || "—"}</span>
                        </button>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${empresa.status === "Inativa" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{empresa.status || "Ativa"}</span>
                      </div>
                      <div className="mt-3 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                        <p><b>Login:</b> {empresa.login || "—"}</p><p><b>E-mail:</b> {empresa.email || "—"}</p><p><b>Telefone:</b> {empresa.telefone || "—"}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button type="button" onClick={() => editarEmpresa(empresa)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Editar</button>
                        <button type="button" onClick={() => void excluirEmpresa(empresa)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">Excluir</button>
                        <button type="button" onClick={() => void copiarLoginEmpresa(empresa)} className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800">Copiar login e e-mail</button>
                      </div>
                    </article>
                  ))}
                  {empresas.length === 0 && <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-500">Nenhuma empresa cadastrada.</p>}
                </div>
              </section>
            ) : (
              <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-600">Esta área é exclusiva para administradores.</p>
            )
          ) : categoria === "exames" ? (
              <section>
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-700">{empresaAtual.nome}</p>
                  <h1 className="mt-1 text-2xl font-black">Exames ocupacionais</h1>
                  <p className="mt-1 text-sm text-slate-500">Agende exames e acompanhe os resultados da empresa.</p>
                </div>
                {carregandoRegistros ? (
                  <p className="rounded-2xl bg-white p-8 text-center font-bold text-slate-500">Carregando exames, funcionários e clínicas...</p>
                ) : (
                  <>
                    <div className="grid items-start gap-4 lg:grid-cols-5">
                      <section className="rounded-2xl bg-white p-4 shadow-sm lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                          <h2 className="text-lg font-black">🗓️ Calendário</h2>
                          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-teal-800">{registrosExameEmDia.length} no dia</span>
                        </div>
                        <label className="block text-xs font-bold text-slate-600">Clínica parceira
                          <select value={clinicaSelecionadaExame?.id || ""} onChange={event => setClinicaExameId(event.target.value)} className={`${INPUT_CLASS} mt-1`} disabled={!registros.clinicas.length}>
                            {!registros.clinicas.length && <option value="">Nenhuma clínica cadastrada</option>}
                            {registros.clinicas.map(clinica => <option key={clinica.id} value={clinica.id}>{clinica.nome}</option>)}
                          </select>
                        </label>
                        {clinicaSelecionadaExame ? (
                          <div className="mt-3 rounded-xl bg-cyan-50 p-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <p className="font-black text-slate-800">{clinicaSelecionadaExame.nome}</p>
                              {convenioVigente(clinicaSelecionadaExame)
                                ? <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-black text-green-800">Convênio Vigente</span>
                                : <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-800">Convênio a confirmar</span>}
                            </div>
                            <p className="mt-1 text-xs text-slate-600">{clinicaSelecionadaExame.telefone || "Telefone não informado"}</p>
                            <p className="mt-1 text-xs text-slate-600">{clinicaSelecionadaExame.endereco || "Endereço não informado"}</p>
                          </div>
                        ) : (
                          <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                            Cadastre uma clínica na aba Clínicas para agendar.
                            <button type="button" onClick={() => setCategoria("clinicas")} className="ml-1 font-black underline">Abrir Clínicas</button>
                          </div>
                        )}

                        <div className="mt-5 flex items-center justify-between gap-2">
                          <button type="button" aria-label="Mês anterior" onClick={() => {
                            const anterior = new Date(dataMesCalendario.getFullYear(), dataMesCalendario.getMonth() - 1, 1, 12);
                            const novaData = dataLocalISO(anterior);
                            setMesCalendario(novaData.slice(0, 7));
                            setDiaExameSelecionado(novaData);
                          }} className="rounded-lg border border-slate-200 px-3 py-2 font-black text-slate-700 hover:bg-slate-50">‹</button>
                          <h3 className="text-center font-black capitalize text-slate-800">{mesCalendarioTitulo}</h3>
                          <button type="button" aria-label="Próximo mês" onClick={() => {
                            const proximo = new Date(dataMesCalendario.getFullYear(), dataMesCalendario.getMonth() + 1, 1, 12);
                            const novaData = dataLocalISO(proximo);
                            setMesCalendario(novaData.slice(0, 7));
                            setDiaExameSelecionado(novaData);
                          }} className="rounded-lg border border-slate-200 px-3 py-2 font-black text-slate-700 hover:bg-slate-50">›</button>
                        </div>
                        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-slate-500">
                          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(dia => <span key={dia} className="py-2">{dia}</span>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {diasCalendario.map((dia, index) => {
                            if (!dia) return <span key={`vazio-${index}`} />;
                            const quantidade = registros.exames.filter(item => String(item.data || "").slice(0, 10) === dia).length;
                            const selecionado = dia === diaExameSelecionado;
                            const hoje = dia === dataLocalISO(new Date());
                            return (
                              <button key={dia} type="button" onClick={() => { setDiaExameSelecionado(dia); setMesCalendario(dia.slice(0, 7)); }} className={`min-h-[64px] rounded-lg border p-1 text-left transition ${selecionado ? "border-teal-700 bg-teal-700 text-white" : quantidade ? "border-teal-100 bg-teal-50 text-teal-900 hover:bg-teal-100" : "border-transparent text-slate-700 hover:bg-slate-50"} ${hoje && !selecionado ? "border-2 border-teal-600" : ""}`}>
                                <span className="block text-xs font-black">{Number(dia.slice(-2))}</span>
                                {quantidade > 0 && <span className={`mt-1 block text-[9px] leading-tight ${selecionado ? "text-teal-50" : "text-teal-800"}`}>{quantidade} exame(s)</span>}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-5 border-t border-slate-100 pt-4">
                          <h3 className="font-black">Exames em {formatarData(diaExameSelecionado)} - {registrosExameEmDia.length}</h3>
                          {registrosExameEmDia.length ? (
                            <ul className="mt-3 space-y-2">
                              {registrosExameEmDia.map(exame => (
                                <li key={exame.id} className="flex items-start justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                                  <span className="min-w-0">🩺 <b>{exame.funcionario || exame.nome}</b><span className="block pl-6 text-xs text-slate-500">{exame.tipo} · {exame.clinica || "Clínica não informada"}</span></span>
                                  <button type="button" onClick={() => void excluirRegistro(exame)} className="shrink-0 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700">Excluir</button>
                                </li>
                              ))}
                            </ul>
                          ) : <p className="mt-2 text-sm text-slate-500">Nenhum exame nesse dia.</p>}
                        </div>
                      </section>

                      <section className="rounded-2xl bg-white p-4 shadow-sm lg:col-span-3 md:p-5">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                          <h2 className="text-lg font-black">📋 Marcar Exame - {formatarData(diaExameSelecionado)}</h2>
                          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-800">{tiposExameSelecionados.length} selecionado(s)</span>
                        </div>
                        <label className="block text-sm font-bold text-slate-700">Passo 1 - Pesquisar funcionário / CPF
                          <div className="mt-1 flex gap-2">
                            <input disabled={!!funcionarioSelecionadoExame} value={buscaFuncionarioExame} onChange={event => setBuscaFuncionarioExame(event.target.value)} placeholder="🔍 Digite nome ou CPF do funcionário..." className={`${INPUT_CLASS} text-base`} />
                            {funcionarioSelecionadoExame && <button type="button" onClick={() => { setFuncionarioExameId(""); setBuscaFuncionarioExame(""); }} className="rounded-xl border border-slate-200 px-4 font-black text-slate-600" aria-label="Trocar funcionário">×</button>}
                          </div>
                        </label>
                        {funcionarioSelecionadoExame ? (
                          <div className="mt-2 rounded-xl border border-teal-200 bg-cyan-50 p-3 text-sm">
                            <p className="font-black text-slate-800">👷 {funcionarioSelecionadoExame.nome}</p>
                            <p className="mt-1 text-xs text-slate-600">CPF: {formatarCpf(funcionarioSelecionadoExame.cpf)} · Setor: {funcionarioSelecionadoExame.setor || "—"}</p>
                            <p className="mt-1 text-[11px] text-slate-500">O PIN não é exibido por segurança.</p>
                          </div>
                        ) : termoFuncionarioExame ? (
                          <div className="mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                            {funcionariosSugeridosExame.length ? funcionariosSugeridosExame.map(funcionario => (
                              <button key={funcionario.id} type="button" onClick={() => { setFuncionarioExameId(funcionario.id); setBuscaFuncionarioExame(`${funcionario.nome}${funcionario.cpf ? ` · CPF ${formatarCpf(funcionario.cpf)}` : ""}`); }} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-cyan-50">
                                <span className="block text-sm font-bold text-slate-800">👷 {funcionario.nome}</span>
                                <span className="mt-0.5 block text-xs text-slate-500">CPF: {formatarCpf(funcionario.cpf)} · Setor: {funcionario.setor || "—"}</span>
                              </button>
                            )) : <p className="p-3 text-sm text-slate-500">Nenhum funcionário encontrado pelo nome ou CPF.</p>}
                          </div>
                        ) : <p className="mt-1 text-xs text-slate-500">A seleção do funcionário é obrigatória para confirmar.</p>}

                        <div className="mt-5">
                          <div className="mb-3">
                            <h3 className="font-black text-slate-800">Passo 2 - Tipos de exame</h3>
                            <p className="mt-1 text-xs text-slate-500">Selecione os exames necessários</p>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {TIPOS_EXAME.map(exame => {
                              const marcado = tiposExameSelecionados.includes(exame.tipo);
                              return (
                                <label key={exame.tipo} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${marcado ? "border-teal-500 bg-cyan-50" : "border-slate-200 bg-white hover:border-teal-200"}`}>
                                  <input type="checkbox" checked={marcado} onChange={() => setTiposExameSelecionados(atual => marcado ? atual.filter(tipo => tipo !== exame.tipo) : [...atual, exame.tipo])} className="mt-1 h-4 w-4 accent-teal-700" />
                                  <span className="min-w-0 flex-1">
                                    <span className="flex flex-wrap items-center justify-between gap-1">
                                      <b className="text-sm text-slate-800">{exame.tipo}</b>
                                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${exame.obrigatorio ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"}`}>{exame.obrigatorio ? "Obrigatório" : "Opcional"}</span>
                                    </span>
                                    <span className="mt-1 block text-xs text-slate-500">{exame.descricao}</span>
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        <button type="button" onClick={() => void confirmarAgendamentoExame()} disabled={salvando || !funcionarioSelecionadoExame || !clinicaSelecionadaExame || tiposExameSelecionados.length === 0} className="mt-5 w-full rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-4 py-4 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
                          {salvando ? "Agendando..." : `✅ Confirmar agendamento - ${formatarData(diaExameSelecionado)}`}
                        </button>
                      </section>
                    </div>

                    <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm md:p-5">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-black">Exames Agendados - Total: {registros.exames.length}</h2>
                        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">{examesOrdenados.length} exibido(s)</span>
                      </div>
                      <input value={buscaExames} onChange={event => setBuscaExames(event.target.value)} placeholder="Buscar exame por nome, tipo ou CPF..." className={`${INPUT_CLASS} mb-4`} />
                      {examesOrdenados.length ? (
                        <div className="space-y-3">
                          {examesOrdenados.map(exame => {
                            const resultado = String(exame.resultado || "Aguardando");
                            const corResultado = /inapto/i.test(resultado) ? "bg-red-100 text-red-800" : /apto/i.test(resultado) ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900";
                            return (
                              <article key={exame.id} className="rounded-xl border border-slate-200 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <h3 className="font-black text-slate-800">🩺 {exame.funcionario || exame.nome} <span className="font-semibold text-slate-600">- {exame.tipo}</span></h3>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                                      <span>{formatarData(String(exame.data || ""))}</span>
                                      <span>{exame.clinica || "Clínica não informada"}</span>
                                      {exame.cpf && <span>CPF: {formatarCpf(exame.cpf)}</span>}
                                      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${corResultado}`}>{resultado}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button type="button" onClick={() => abrirEditar(exame)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Editar</button>
                                    <button type="button" onClick={() => void excluirRegistro(exame)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">Excluir</button>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">Nenhum exame agendado encontrado.</p>}
                    </section>
                  </>
                )}
              </section>
          ) : (
            <section>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-700">{empresaAtual.nome}</p>
                  <h1 className="mt-1 text-2xl font-black">{titulo}</h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => imprimirRelatorio(titulo)} className="rounded-xl border border-teal-700 px-4 py-2.5 text-sm font-bold text-teal-800 hover:bg-teal-50">📄 Gerar PDF</button>
                  <button onClick={abrirNovo} className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800">
                    {categoria === "epis" ? "＋ Registrar entrega de EPI" : categoria === "tecnico" ? "Editar dados técnicos" : `+ Cadastrar ${CATEGORIAS.find(item => item.id === categoria)?.singular}`}
                  </button>
                </div>
              </div>

              {categoria === "funcionarios" && (
                <div className="mb-4">
                  <label className="mb-1 block text-xs font-bold text-slate-500">Filtrar por setor</label>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setFiltroSetor("Todos")} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filtroSetor === "Todos" ? "bg-teal-700 text-white" : "bg-white text-slate-700"}`}>
                      Todos ({registros.funcionarios.length})
                    </button>
                    {SETORES.map(setor => {
                      const total = registros.funcionarios.filter(item => (item.setor || "Outro") === setor).length;
                      return <button key={setor} onClick={() => setFiltroSetor(setor)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filtroSetor === setor ? "bg-teal-700 text-white" : "bg-white text-slate-700"}`}>{setor} ({total})</button>;
                    })}
                  </div>
                </div>
              )}

              {categoria === "inspecoes" && (
                <label className="mb-3 block max-w-xl text-xs font-bold text-slate-500">Filtrar por Tipo NR
                  <select value={filtroTipoInspecao} onChange={event => setFiltroTipoInspecao(event.target.value)} className={`${INPUT_CLASS} mt-1`}>
                    <option>Todos</option>
                    {TIPOS_INSPECAO.map(tipo => <option key={tipo}>{tipo}</option>)}
                  </select>
                </label>
              )}

              {categoria === "riscos" && (
                <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {["PGR", "LTCAT", "PCMSO"].map(tipo => (
                      <button key={tipo} onClick={() => imprimirRelatorio(tipo)} className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800">Gerar {tipo}</button>
                    ))}
                  </div>
                  <h2 className="font-black">Catálogo de riscos ocupacionais</h2>
                  <p className="mt-1 text-xs text-slate-500">Selecione um risco para preencher o cadastro. Revise e complete o GHE/setor e as medidas de controle conforme avaliação profissional.</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {CATALOGO_RISCOS.map(risco => (
                      <article key={risco.nome} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{risco.nome}</p>
                          <p className="truncate text-xs text-slate-500">{risco.tipo} · {risco.agente}</p>
                        </div>
                        <button
                          onClick={() => {
                            setEditando(null);
                            setForm({ nome: risco.nome, tipo: risco.tipo, agente: risco.agente, limite: risco.limite, ghe: "", epi: "" });
                            setModal(true);
                          }}
                          className="shrink-0 rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800"
                        >+ Adicionar</button>
                      </article>
                    ))}
                  </div>
                </section>
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

              {categoria === "extintores" && (
                <p className="mb-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Cadastre a data programada para a próxima recarga para acompanhar vencimentos e incluir a informação nos relatórios.</p>
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
                          <h2 className="font-extrabold">
                            {categoria === "epis" && <span className="mr-2" aria-hidden="true">{CATALOGO_EPIS.find(item => item.nome === registro.nome)?.icone || "🦺"}</span>}
                            {registro.nome || registro.titulo || registro.descricao || registro.localizacao || registro.ghe || "Registro"}
                          </h2>
                          <div className="mt-2 grid gap-x-6 gap-y-1 text-sm text-slate-600 sm:grid-cols-2">
                            {CAMPOS[categoria].filter(campo => campo.chave !== "nome" || !registro.titulo).map(campo => {
                              const valor = registro[campo.chave];
                              if (valor === undefined || valor === null || valor === "") return null;
                              return <p key={campo.chave}><span className="font-semibold text-slate-500">{campo.rotulo}:</span> {String(valor)}</p>;
                            })}
                            {categoria === "documentos" && registro.arquivo && (
                              <button type="button" onClick={() => void abrirDocumento(registro)} className="text-left font-bold text-teal-700 underline">
                                📎 Abrir arquivo: {registro.arquivo}
                              </button>
                            )}
                            {categoria === "epis" && registro.assinatura && (
                              <>
                                <p className="font-semibold text-teal-800">
                                  Confirmação: {registro.assinatura.metodo === "pin_biometria_assinatura" ? "PIN + verificação WebAuthn + Assinatura" : registro.assinatura.metodo === "pin" ? "PIN" : registro.assinatura.metodo === "digitada" ? "Assinatura digitada + PIN" : registro.assinatura.metodo === "punho" ? "Assinatura manuscrita" : "Sem confirmação verificável"}
                                  {registro.assinatura.confirmado_em ? ` · ${new Date(registro.assinatura.confirmado_em).toLocaleString("pt-BR")}` : ""}
                                </p>
                                {typeof (registro.assinaturaImg || registro.assinatura.imagem) === "string" && /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(registro.assinaturaImg || registro.assinatura.imagem) && (
                                  <img src={registro.assinaturaImg || registro.assinatura.imagem} alt={`Assinatura de ${registro.assinatura.nome || "funcionário"}`} className="mt-2 max-h-24 max-w-xs rounded border border-slate-200 bg-white p-2" />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        {categoria === "epis" ? <button onClick={() => imprimirTermoEpi(registro)} className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800">📄 Termo PDF</button> : <div className="flex gap-2">
                          <button onClick={() => abrirEditar(registro)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">Editar</button>
                          <button onClick={() => void excluirRegistro(registro)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100">Excluir</button>
                        </div>}
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
          {categoria === "epis" ? (
            <form onSubmit={salvarEntregaEpi} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black">Registrar entrega de EPI</h2>
                <button type="button" onClick={() => setModal(false)} aria-label="Fechar" className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100">×</button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="relative text-xs font-bold text-slate-600 sm:col-span-2">Buscar funcionário por nome ou CPF
                  <input
                    required
                    value={buscaFuncionarioEpi}
                    onFocus={() => setListaFuncionariosEpiAberta(true)}
                    onChange={event => { setBuscaFuncionarioEpi(event.target.value); setEntregaEpi(atual => ({ ...atual, employeeId: "" })); setPinVerificado(false); setWebAuthnToken(""); setWebAuthnVerificadoEm(""); limparAssinatura(); setListaFuncionariosEpiAberta(true); }}
                    placeholder="Digite nome ou CPF"
                    className={`${INPUT_CLASS} mt-1`}
                  />
                  {listaFuncionariosEpiAberta && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                      {funcionariosSugeridos.length ? funcionariosSugeridos.map(funcionario => (
                        <button key={funcionario.id} type="button" onMouseDown={event => event.preventDefault()} onClick={() => { setEntregaEpi(atual => ({ ...atual, employeeId: funcionario.id })); setBuscaFuncionarioEpi(`${funcionario.nome}${funcionario.cpf ? ` · ${funcionario.cpf}` : ""}`); setPinConfirmacao(""); setPinVerificado(false); setWebAuthnToken(""); setWebAuthnVerificadoEm(""); limparAssinatura(); setListaFuncionariosEpiAberta(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-teal-50">
                          <span className="font-bold">{funcionario.nome}</span>{funcionario.cpf && <span className="ml-2 text-slate-500">{funcionario.cpf}</span>}
                        </button>
                      )) : <p className="p-3 text-xs text-slate-500">Nenhum funcionário encontrado.</p>}
                    </div>
                  )}
                  {entregaEpi.employeeId && <span className="mt-1 block text-xs text-teal-700">Funcionário selecionado</span>}
                </label>
                <label className="relative text-xs font-bold text-slate-600">EPI entregue
                  <input
                    required
                    value={entregaEpi.nome}
                    onFocus={() => setCatalogoEpiAberto(true)}
                    onChange={event => { setEntregaEpi(atual => ({ ...atual, nome: event.target.value })); setCatalogoEpiAberto(true); }}
                    placeholder="Digite o EPI ou uma sigla (C, B, L...)"
                    disabled={pinVerificado}
                    className={`${INPUT_CLASS} mt-1`}
                  />
                  {catalogoEpiAberto && (
                    <div role="listbox" aria-label="Catálogo de EPIs" className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                      {episSugeridos.length ? episSugeridos.map((item, index) => (
                        <button
                          key={`${item.nome}-${index}`}
                          type="button"
                          role="option"
                          aria-selected={entregaEpi.nome === item.nome}
                          onMouseDown={event => event.preventDefault()}
                          onClick={() => { setEntregaEpi(atual => ({ ...atual, nome: item.nome })); setCatalogoEpiAberto(false); }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-teal-50"
                        >
                          <span className="text-xl" aria-hidden="true">{item.icone}</span>
                          <span className="flex-1 font-semibold text-slate-800">{item.nome}</span>
                          <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{item.codigo}</span>
                        </button>
                      )) : <p className="p-3 text-xs text-slate-500">Nenhum item encontrado. Você pode informar outro EPI no campo.</p>}
                    </div>
                  )}
                </label>
                <label className="text-xs font-bold text-slate-600">Certificado de Aprovação (CA)
                  <input disabled={pinVerificado} value={entregaEpi.ca} onChange={event => setEntregaEpi(atual => ({ ...atual, ca: event.target.value }))} className={`${INPUT_CLASS} mt-1`} />
                </label>
                <label className="text-xs font-bold text-slate-600">Tipo / modelo
                  <input disabled={pinVerificado} value={entregaEpi.tipo} onChange={event => setEntregaEpi(atual => ({ ...atual, tipo: event.target.value }))} className={`${INPUT_CLASS} mt-1`} />
                </label>
                <label className="text-xs font-bold text-slate-600">Quantidade
                  <input disabled={pinVerificado} required min="1" type="number" value={entregaEpi.quantidade} onChange={event => setEntregaEpi(atual => ({ ...atual, quantidade: event.target.value }))} className={`${INPUT_CLASS} mt-1`} />
                </label>
                <label className="text-xs font-bold text-slate-600">Data de entrega
                  <input disabled={pinVerificado} required type="date" value={entregaEpi.data_entrega} onChange={event => setEntregaEpi(atual => ({ ...atual, data_entrega: event.target.value }))} className={`${INPUT_CLASS} mt-1`} />
                </label>
              </div>
              <fieldset className="mt-4 rounded-xl border border-slate-200 p-4">
                <legend className="px-1 text-sm font-bold text-slate-700">2. Verificar PIN</legend>
                <label className="block text-xs font-bold text-slate-600">PIN de 4 dígitos
                  <input required inputMode="numeric" autoComplete="off" maxLength={4} pattern="[0-9]{4}" value={pinConfirmacao} onChange={event => { setPinConfirmacao(event.target.value.replace(/\D/g, "").slice(0, 4)); setPinVerificado(false); setWebAuthnToken(""); setWebAuthnVerificadoEm(""); }} className={`${INPUT_CLASS} mt-1`} />
                </label>
                <button type="button" onClick={() => void verificarPinEntrega()} disabled={verificandoPin || !entregaEpi.employeeId || pinConfirmacao.length !== 4} className="mt-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                  {verificandoPin ? "Verificando..." : "Verificar PIN"}
                </button>
                {pinVerificado && <p role="status" className="mt-2 text-sm font-bold text-green-700">PIN verificado no Supabase.</p>}
              </fieldset>
              <fieldset className="mt-3 rounded-xl border border-slate-200 p-4">
                <legend className="px-1 text-sm font-bold text-slate-700">3. Autenticar dispositivo</legend>
                <button type="button" onClick={() => void coletarAutenticador()} disabled={!pinVerificado || coletandoBiometria || !!webAuthnToken} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                  {coletandoBiometria ? "Aguardando dispositivo..." : webAuthnToken ? "Autenticador verificado" : "Coletar autenticação do dispositivo"}
                </button>
                {webAuthnVerificadoEm && <p role="status" className="mt-2 text-sm font-bold text-green-700">Verificação local WebAuthn confirmada · {new Date(webAuthnVerificadoEm).toLocaleString("pt-BR")}</p>}
                <p className="mt-2 text-xs text-slate-500">A autenticação é verificada criptograficamente no servidor. O dispositivo pode confirmar com biometria ou PIN/bloqueio de tela; o navegador não informa qual método local foi usado.</p>
              </fieldset>
              {webAuthnToken && (
                <fieldset className="mt-3 rounded-xl border border-slate-200 p-4">
                  <legend className="px-1 text-sm font-bold text-slate-700">4. Assinatura do funcionário</legend>
                  <p className="text-xs text-slate-500">Assine usando o dedo, caneta ou mouse.</p>
                  <canvas
                    ref={assinaturaCanvas}
                    width={500}
                    height={140}
                    onPointerDown={iniciarAssinatura}
                    onPointerMove={desenharAssinatura}
                    onPointerUp={() => { desenhandoAssinatura.current = false; }}
                    onPointerCancel={() => { desenhandoAssinatura.current = false; }}
                    className="mt-2 h-36 w-full touch-none rounded-lg border border-slate-300 bg-white"
                    aria-label="Campo de assinatura manuscrita"
                  />
                  <button type="button" onClick={limparAssinatura} className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Limpar assinatura</button>
                </fieldset>
              )}
              <label className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                <input required type="checkbox" checked={consentimento} onChange={event => setConsentimento(event.target.checked)} className="mt-0.5" />
                Confirmo que o funcionário recebeu o EPI descrito e autorizou o registro desta confirmação.
              </label>
              <p className="mt-3 rounded-lg bg-sky-50 p-3 text-xs text-sky-900">A entrega exige PIN validado, WebAuthn real e assinatura manuscrita. Não há fallback biométrico simulado.</p>
              <div className="mt-5 flex gap-2">
                <button type="submit" disabled={salvando || !pinVerificado || !webAuthnToken || !assinaturaFeita || !consentimento} className="flex-1 rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:opacity-60">{salvando ? "Registrando..." : "5. Salvar entrega"}</button>
                <button type="button" onClick={() => setModal(false)} className="rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-700">Cancelar</button>
              </div>
            </form>
          ) : (
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
                    <select required={categoria === "funcionarios" && campo.chave === "setor"} value={form[campo.chave] || ""} onChange={event => setForm(atual => ({ ...atual, [campo.chave]: event.target.value }))} className={`${INPUT_CLASS} mt-1`}>
                      <option value="">Selecione</option>
                      {campo.opcoes?.map(opcao => <option key={opcao}>{opcao}</option>)}
                    </select>
                  ) : (
                    <input
                      type={campo.tipo || "text"}
                      required={campo.chave === "nome" || campo.chave === "titulo" || campo.chave === "descricao" || (categoria === "funcionarios" && campo.chave === "setor")}
                      value={form[campo.chave] || ""}
                      onChange={event => setForm(atual => ({ ...atual, [campo.chave]: event.target.value }))}
                      className={`${INPUT_CLASS} mt-1`}
                    />
                  )}
                </label>
              ))}
            </div>
            {categoria === "funcionarios" && !editando && (
              <fieldset className="mt-4 rounded-xl border border-slate-200 p-4">
                <legend className="px-1 text-sm font-bold text-slate-700">PIN para confirmação de EPI</legend>
                <label className="mr-5 inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="radio" checked={pinAutomatico} onChange={() => setPinAutomatico(true)} />
                  Gerar PIN automaticamente
                </label>
                <label className="mt-2 inline-flex items-center gap-2 text-sm text-slate-700 sm:mt-0">
                  <input type="radio" checked={!pinAutomatico} onChange={() => setPinAutomatico(false)} />
                  Definir PIN
                </label>
                {!pinAutomatico && <input required inputMode="numeric" autoComplete="off" maxLength={4} pattern="[0-9]{4}" aria-label="PIN de quatro dígitos" placeholder="4 dígitos" value={pinManual} onChange={event => setPinManual(event.target.value.replace(/\D/g, "").slice(0, 4))} className={`${INPUT_CLASS} mt-3`} />}
                <p className="mt-2 text-xs text-slate-500">O PIN será armazenado como hash e mostrado apenas uma vez após o cadastro.</p>
              </fieldset>
            )}
            {categoria === "documentos" && (
              <label className="mt-3 block text-xs font-bold text-slate-600">
                Arquivo da máquina (PDF, imagem, Word ou Excel; até 20 MB)
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
                  onChange={event => setArquivoDocumento(event.target.files?.[0] || null)}
                  className={`${INPUT_CLASS} mt-1`}
                />
                <span className="mt-1 block font-normal text-slate-500">
                  {arquivoDocumento?.name || (editando?.arquivo ? `Arquivo atual: ${editando.arquivo}. Selecione outro para substituir.` : "O documento será armazenado em área privada da empresa.")}
                </span>
              </label>
            )}
            <div className="mt-5 flex gap-2">
              <button type="submit" disabled={salvando} className="flex-1 rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:opacity-60">{salvando ? "Salvando..." : "Salvar"}</button>
              <button type="button" onClick={() => setModal(false)} className="rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-700">Cancelar</button>
            </div>
          </form>
          )}
        </div>
      )}

    </div>
  );
}
