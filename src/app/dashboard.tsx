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
    { chave: "proxima_recarga", rotulo: "Data da próxima recarga", tipo: "date" },
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

type MetodoAssinatura = "pin" | "digitada" | "punho";

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
  const [metodoAssinatura, setMetodoAssinatura] = useState<MetodoAssinatura>("pin");
  const [pinConfirmacao, setPinConfirmacao] = useState("");
  const [nomeAssinatura, setNomeAssinatura] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [assinaturaFeita, setAssinaturaFeita] = useState(false);
  const [arquivoDocumento, setArquivoDocumento] = useState<File | null>(null);
  const [catalogoEpiAberto, setCatalogoEpiAberto] = useState(false);

  const carregarEmpresas = useCallback(async () => {
    setCarregandoEmpresas(true);
    setErro("");
    let query = supabase.from("empresas").select("id, nome").order("nome");
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
  }, [busca, categoria, filtroStatus, pastaAtual, registros]);

  function abrirNovo() {
    if (categoria === "inicio" || categoria === "empresas") return;
    setArquivoDocumento(null);
    if (categoria === "epis") {
      setEntregaEpi({ employeeId: "", nome: "", ca: "", tipo: "", quantidade: "1", data_entrega: dataHoje() });
      setMetodoAssinatura("pin");
      setPinConfirmacao("");
      setNomeAssinatura("");
      setConsentimento(false);
      setAssinaturaFeita(false);
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
    if (categoria === "funcionarios") valores.setor = "Administrativo";
    if (categoria === "financeiro") valores.status = "Pendente";
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
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, valor]) => valor !== "" && valor !== undefined && valor !== null),
    );
    if (categoria === "funcionarios" && !editando) {
      const pin = pinAutomatico ? gerarPin() : pinManual.trim();
      if (!/^\d{4}$/.test(pin)) {
        setErro("O PIN precisa ter exatamente quatro dígitos.");
        setSalvando(false);
        return;
      }
      const { error } = await supabase.rpc("previx_create_employee", {
        p_company_id: empresaAtual.id,
        p_payload: payload,
        p_pin: pin,
      });
      if (error) {
        setErro(`Não foi possível cadastrar o funcionário: ${error.message}`);
        setSalvando(false);
        return;
      }
      setPinGerado({ nome: String(payload.nome || "Funcionário"), pin });
      setMensagem("Funcionário cadastrado. Guarde o PIN: ele será exibido somente agora.");
      setModal(false);
      setForm({});
      await carregarRegistros();
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
    if (resultado.error || (editando && resultado.data !== true)) {
      let falhaLimpeza = "";
      if (novoArquivoPath) {
        const { error: cleanupError } = await supabase.storage.from("previx-documents").remove([novoArquivoPath]);
        if (cleanupError) falhaLimpeza = ` O arquivo enviado também não pôde ser removido: ${cleanupError.message}`;
      }
      setErro(`Não foi possível salvar${resultado.error ? `: ${resultado.error.message}` : ": registro não encontrado ou não autorizado."}${falhaLimpeza}`);
    } else {
      if (novoArquivoPath && editando?.arquivo_path) {
        const { error: cleanupError } = await supabase.storage.from("previx-documents").remove([editando.arquivo_path]);
        if (cleanupError) setErro(`Documento salvo, mas o arquivo anterior não pôde ser removido: ${cleanupError.message}`);
      }
      setMensagem(`${CATEGORIAS.find(item => item.id === categoria)?.singular || "Registro"} salvo.`);
      setModal(false);
      setForm({});
      setEditando(null);
      setArquivoDocumento(null);
      await carregarRegistros();
    }
    setSalvando(false);
  }

  function limparAssinatura() {
    const canvas = assinaturaCanvas.current;
    if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setAssinaturaFeita(false);
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
    if (!consentimento) {
      setErro("O funcionário precisa confirmar o recebimento do EPI.");
      return;
    }
    if (metodoAssinatura !== "pin" && nomeAssinatura.trim().toLocaleLowerCase("pt-BR") !== String(funcionario.nome).trim().toLocaleLowerCase("pt-BR")) {
      setErro("Informe o nome completo exatamente como está no cadastro do funcionário.");
      return;
    }
    if (metodoAssinatura === "punho" && !assinaturaFeita) {
      setErro("Solicite a assinatura do funcionário no campo de assinatura.");
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
    };
    const { data: recordId, error } = await supabase.rpc("previx_create_epi_delivery", {
      p_company_id: empresaAtual.id,
      p_employee_id: funcionario.id,
      p_employee_pin: metodoAssinatura === "punho" ? null : pinConfirmacao.trim(),
      p_payload: payload,
      p_method: metodoAssinatura,
      p_typed_name: metodoAssinatura === "pin" ? funcionario.nome : nomeAssinatura.trim(),
      p_hand_signature: metodoAssinatura === "punho" ? assinaturaCanvas.current?.toDataURL("image/png") : null,
      p_consent: consentimento,
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
    setMensagem(`Entrega registrada para ${funcionario.nome} com confirmação ${metodoAssinatura === "punho" ? "manuscrita" : metodoAssinatura === "digitada" ? "digitada e PIN" : "por PIN"}.`);
    setModal(false);
    await carregarRegistros();
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

  async function cadastrarEmpresa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    const formElement = event.currentTarget;
    const valores = Object.fromEntries(new FormData(formElement).entries());
    const nome = String(valores.nome || "").trim();
    if (!nome) return;
    const { data, error } = await supabase
      .from("empresas")
      .insert({ nome })
      .select("id, nome")
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
  const termoEpi = entregaEpi.nome.trim().toLocaleLowerCase("pt-BR");
  const episSugeridos = CATALOGO_EPIS.filter(item => {
    if (!termoEpi) return true;
    if (termoEpi.length === 1) return item.codigo.toLocaleLowerCase("pt-BR") === termoEpi;
    return item.nome.toLocaleLowerCase("pt-BR").includes(termoEpi) || item.codigo.toLocaleLowerCase("pt-BR").startsWith(termoEpi);
  });
  const categoriasRelatorio = relatorio === "Painel completo"
    ? CATEGORIAS.map(item => item.id)
    : CATEGORIAS_POR_RELATORIO[relatorio] || CATEGORIAS.filter(item => item.label === relatorio).map(item => item.id);

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
          {pinGerado && (
            <section role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
              <p><b>PIN de {pinGerado.nome}:</b> <span className="font-mono text-lg font-black tracking-widest">{pinGerado.pin}</span> — anote agora; ele não será exibido novamente.</p>
              <button onClick={() => setPinGerado(null)} className="rounded-lg bg-amber-200 px-3 py-2 text-sm font-bold">Entendi</button>
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
            <section>
              <div className="mb-5">
                <h1 className="text-2xl font-black">Empresas</h1>
                <p className="mt-1 text-sm text-slate-500">Empresas cadastradas no PREVIX</p>
              </div>
              {ehAdm && (
                <form onSubmit={cadastrarEmpresa} className="mb-5 grid gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-2">
                  <input name="nome" required placeholder="Nome da empresa" aria-label="Nome da empresa" className={INPUT_CLASS} />
                  <button type="submit" className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white hover:bg-teal-800 sm:col-span-2">+ Cadastrar Empresa</button>
                </form>
              )}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {empresas.map(empresa => (
                  <button key={empresa.id} onClick={() => { setEmpresaAtual(empresa); setCategoria("inicio"); }} className={`rounded-2xl border bg-white p-5 text-left shadow-sm ${empresaAtual.id === empresa.id ? "border-teal-600 ring-2 ring-teal-100" : "border-slate-200"}`}>
                    <span className="text-2xl">🏢</span>
                    <span className="mt-2 block font-black">{empresa.nome}</span>
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
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => imprimirRelatorio(titulo)} className="rounded-xl border border-teal-700 px-4 py-2.5 text-sm font-bold text-teal-800 hover:bg-teal-50">📄 Gerar PDF</button>
                  <button onClick={abrirNovo} className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800">
                    {categoria === "epis" ? "＋ Registrar entrega de EPI" : categoria === "tecnico" ? "Editar dados técnicos" : `+ Cadastrar ${CATEGORIAS.find(item => item.id === categoria)?.singular}`}
                  </button>
                </div>
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
                          <h2 className="font-extrabold">{registro.nome || registro.titulo || registro.descricao || registro.localizacao || registro.ghe || "Registro"}</h2>
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
                                  Confirmação: {registro.assinatura.metodo === "pin" ? "PIN" : registro.assinatura.metodo === "digitada" ? "Assinatura digitada + PIN" : registro.assinatura.metodo === "punho" ? "Assinatura manuscrita" : "Sem confirmação verificável"}
                                  {registro.assinatura.confirmado_em ? ` · ${new Date(registro.assinatura.confirmado_em).toLocaleString("pt-BR")}` : ""}
                                </p>
                                {registro.assinatura.metodo === "punho" && typeof registro.assinatura.imagem === "string" && /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(registro.assinatura.imagem) && (
                                  <img src={registro.assinatura.imagem} alt={`Assinatura de ${registro.assinatura.nome || "funcionário"}`} className="mt-2 max-h-24 max-w-xs rounded border border-slate-200 bg-white p-2" />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        {categoria !== "epis" && <div className="flex gap-2">
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
                <label className="text-xs font-bold text-slate-600 sm:col-span-2">Funcionário
                  <select required value={entregaEpi.employeeId} onChange={event => setEntregaEpi(atual => ({ ...atual, employeeId: event.target.value }))} className={`${INPUT_CLASS} mt-1`}>
                    <option value="">Selecione</option>
                    {registros.funcionarios.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
                  </select>
                </label>
                <label className="relative text-xs font-bold text-slate-600">EPI entregue
                  <input
                    required
                    value={entregaEpi.nome}
                    onFocus={() => setCatalogoEpiAberto(true)}
                    onChange={event => { setEntregaEpi(atual => ({ ...atual, nome: event.target.value })); setCatalogoEpiAberto(true); }}
                    placeholder="Digite o EPI ou uma sigla (C, B, L...)"
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
                  <input value={entregaEpi.ca} onChange={event => setEntregaEpi(atual => ({ ...atual, ca: event.target.value }))} className={`${INPUT_CLASS} mt-1`} />
                </label>
                <label className="text-xs font-bold text-slate-600">Tipo / modelo
                  <input value={entregaEpi.tipo} onChange={event => setEntregaEpi(atual => ({ ...atual, tipo: event.target.value }))} className={`${INPUT_CLASS} mt-1`} />
                </label>
                <label className="text-xs font-bold text-slate-600">Quantidade
                  <input required min="1" type="number" value={entregaEpi.quantidade} onChange={event => setEntregaEpi(atual => ({ ...atual, quantidade: event.target.value }))} className={`${INPUT_CLASS} mt-1`} />
                </label>
                <label className="text-xs font-bold text-slate-600">Data de entrega
                  <input required type="date" value={entregaEpi.data_entrega} onChange={event => setEntregaEpi(atual => ({ ...atual, data_entrega: event.target.value }))} className={`${INPUT_CLASS} mt-1`} />
                </label>
              </div>
              <fieldset className="mt-4">
                <legend className="text-sm font-bold text-slate-700">Confirmação do recebimento</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {([
                    ["pin", "PIN"],
                    ["digitada", "Assinatura digitada + PIN"],
                    ["punho", "Assinatura manuscrita"],
                  ] as const).map(([metodo, texto]) => (
                    <label key={metodo} className={`cursor-pointer rounded-lg border p-3 text-xs font-bold ${metodoAssinatura === metodo ? "border-teal-600 bg-teal-50 text-teal-900" : "border-slate-200 text-slate-600"}`}>
                      <input type="radio" name="metodo-assinatura" value={metodo} checked={metodoAssinatura === metodo} onChange={() => { setMetodoAssinatura(metodo); setPinConfirmacao(""); setNomeAssinatura(""); limparAssinatura(); }} className="mr-2" />
                      {texto}
                    </label>
                  ))}
                </div>
              </fieldset>
              {metodoAssinatura !== "punho" ? (
                <label className="mt-3 block text-xs font-bold text-slate-600">PIN do funcionário
                  <input required inputMode="numeric" autoComplete="off" maxLength={4} pattern="[0-9]{4}" value={pinConfirmacao} onChange={event => setPinConfirmacao(event.target.value.replace(/\D/g, "").slice(0, 4))} className={`${INPUT_CLASS} mt-1`} />
                </label>
              ) : (
                <>
                  <label className="mt-3 block text-xs font-bold text-slate-600">Nome completo do funcionário
                    <input required value={nomeAssinatura} onChange={event => setNomeAssinatura(event.target.value)} className={`${INPUT_CLASS} mt-1`} />
                  </label>
                  <p className="mt-3 text-xs font-semibold text-slate-600">Assinatura manuscrita (dedo ou caneta)</p>
                  <canvas
                    ref={assinaturaCanvas}
                    width={500}
                    height={140}
                    onPointerDown={iniciarAssinatura}
                    onPointerMove={desenharAssinatura}
                    onPointerUp={() => { desenhandoAssinatura.current = false; }}
                    onPointerCancel={() => { desenhandoAssinatura.current = false; }}
                    className="mt-1 h-36 w-full touch-none rounded-lg border border-slate-300 bg-white"
                    aria-label="Campo de assinatura manuscrita"
                  />
                  <button type="button" onClick={limparAssinatura} className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Limpar assinatura</button>
                </>
              )}
              <label className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                <input required type="checkbox" checked={consentimento} onChange={event => setConsentimento(event.target.checked)} className="mt-0.5" />
                Confirmo que o funcionário recebeu o EPI descrito e autorizou o registro desta confirmação.
              </label>
              <p className="mt-3 rounded-lg bg-sky-50 p-3 text-xs text-sky-900">O PIN é validado no servidor e não é salvo junto à entrega. A assinatura manuscrita é uma imagem fornecida neste dispositivo, não uma verificação biométrica.</p>
              <div className="mt-5 flex gap-2">
                <button type="submit" disabled={salvando || registros.funcionarios.length === 0} className="flex-1 rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:opacity-60">{salvando ? "Registrando..." : "Confirmar entrega"}</button>
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

      {relatorio && empresaAtual && (
        <section className="print-report hidden">
          <div className="report-heading">
            <div className="report-logo-placeholder"><span>LOGO DA PRESTADORA</span></div>
            <div className="report-title">
              <p>PREVIX SST</p>
              <h1>{relatorio === "Painel completo" ? "Relatório geral" : `Relatório ${relatorio}`}</h1>
              <span>Emitido em {new Date().toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="report-logo-placeholder"><span>LOGO DO CLIENTE</span><strong>{empresaAtual.nome}</strong></div>
          </div>
          <div className="report-company-line"><b>Empresa / cliente:</b> {empresaAtual.nome}</div>
          {categoriasRelatorio.map(categoriaRelatorio => {
            const definicao = CATEGORIAS.find(item => item.id === categoriaRelatorio);
            const campos = categoriaRelatorio === "documentos"
              ? [...CAMPOS.documentos, { chave: "arquivo", rotulo: "Arquivo anexado", tipo: "text" }]
              : CAMPOS[categoriaRelatorio];
            const itens = registros[categoriaRelatorio];
            return (
              <section key={categoriaRelatorio} className="report-section">
                <h2>{definicao?.icone} {definicao?.label || categoriaRelatorio}</h2>
                {itens.length === 0 ? <p className="report-empty">Nenhum registro cadastrado.</p> : (
                  <table>
                    <thead><tr>{campos.map(campo => <th key={campo.chave}>{campo.rotulo}</th>)}{categoriaRelatorio === "epis" && <th>Confirmação</th>}</tr></thead>
                    <tbody>
                      {itens.map(item => (
                        <tr key={item.id}>
                          {campos.map(campo => <td key={campo.chave}>{item[campo.chave] === undefined || item[campo.chave] === null || item[campo.chave] === "" ? "—" : String(item[campo.chave])}</td>)}
                          {categoriaRelatorio === "epis" && (
                            <td>
                              {item.assinatura?.metodo === "pin" ? "PIN" : item.assinatura?.metodo === "digitada" ? "Nome + PIN" : item.assinatura?.metodo === "punho" ? "Manuscrita" : "—"}
                              {item.assinatura?.confirmado_em && <><br />{new Date(item.assinatura.confirmado_em).toLocaleString("pt-BR")}</>}
                              {item.assinatura?.metodo === "punho" && typeof item.assinatura.imagem === "string" && /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(item.assinatura.imagem) && <img className="report-signature" src={item.assinatura.imagem} alt={`Assinatura de ${item.assinatura.nome || "funcionário"}`} />}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            );
          })}
          <p className="report-disclaimer">Relatório gerado com base nos dados cadastrados no PREVIX SST. Revise as informações antes de utilizar este documento como registro oficial.</p>
        </section>
      )}
    </div>
  );
}
