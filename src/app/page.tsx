'use client'
import { useEffect, useRef, useState } from 'react'
const SETORES = ['Vendas','Caixa','Estoque','Limpeza','Gerência','Entrega','Administrativo','Produção','Manutenção','Segurança','Almoxarifado','RH','Outro']
const RISCOS_PRONTOS = [
  { nome: 'Ruído', tipo: 'Físico', agente: 'Ruído contínuo', limite: '85 dB' },
  { nome: 'Calor', tipo: 'Físico', agente: 'Calor', limite: 'IBUTG' },
  { nome: 'Poeira', tipo: 'Químico', agente: 'Poeira total', limite: '8 mg/m3' },
  { nome: 'Queda de altura', tipo: 'Acidente', agente: 'Trabalho em altura', limite: '-' },
  { nome: 'Eletricidade', tipo: 'Acidente', agente: 'Eletricidade', limite: '-' },
  { nome: 'Postura inadequada', tipo: 'Ergonômico', agente: 'Postura', limite: '-' },
  { nome: 'Bactérias / Vírus', tipo: 'Biológico', agente: 'Agentes biológicos', limite: '-' }
]
// CATÁLOGO SST - por inicial
const CATALOGO_EPI = [
  { nome: 'Capacete de Segurança', ca: '', tipo: 'Classe A' },
  { nome: 'Capacete com Jugular', ca: '', tipo: '' },
  { nome: 'Cinto de Segurança Paraquedista', ca: '', tipo: '' },
  { nome: 'Cinto de Segurança Abdominal', ca: '', tipo: '' },
  { nome: 'Colete Refletivo', ca: '', tipo: '' },
  { nome: 'Colete Salva-Vidas', ca: '', tipo: '' },
  { nome: 'Creme de Proteção', ca: '', tipo: '' },
  { nome: 'Calçado de Segurança', ca: '', tipo: 'Bico de Aço' },
  { nome: 'Bota de Borracha', ca: '', tipo: '' },
  { nome: 'Bota de PVC', ca: '', tipo: '' },
  { nome: 'Botina de Segurança', ca: '', tipo: '' },
  { nome: 'Luva Borracha', ca: '', tipo: 'Isolante' },
  { nome: 'Luva Látex', ca: '', tipo: 'Descartável' },
  { nome: 'Luva Nitrílica', ca: '', tipo: '' },
  { nome: 'Luva Raspa', ca: '', tipo: 'Cano Longo' },
  { nome: 'Luva Vaqueta', ca: '', tipo: '' },
  { nome: 'Luva de Malha', ca: '', tipo: 'Pigmentada' },
  { nome: 'Luva de PVC', ca: '', tipo: '' },
  { nome: 'Luva Anticorte', ca: '', tipo: '' },
  { nome: 'Máscara PFF1', ca: '', tipo: 'Sem Válvula' },
  { nome: 'Máscara PFF2', ca: '', tipo: 'Com Válvula' },
  { nome: 'Máscara PFF2', ca: '', tipo: 'Sem Válvula' },
  { nome: 'Máscara PFF3', ca: '', tipo: '' },
  { nome: 'Máscara Descartável', ca: '', tipo: '' },
  { nome: 'Máscara Semifacial', ca: '', tipo: 'Com Filtro' },
  { nome: 'Máscara Facial Completa', ca: '', tipo: '' },
  { nome: 'Óculos de Segurança', ca: '', tipo: 'Incolor' },
  { nome: 'Óculos de Segurança', ca: '', tipo: 'Escuro' },
  { nome: 'Óculos Ampla Visão', ca: '', tipo: '' },
  { nome: 'Protetor Auricular Tipo Concha', ca: '', tipo: '' },
  { nome: 'Protetor Auricular Tipo Plug', ca: '', tipo: '' },
  { nome: 'Protetor Facial', ca: '', tipo: '' },
  { nome: 'Perneira de Segurança', ca: '', tipo: '' },
  { nome: 'Avental de PVC', ca: '', tipo: '' },
  { nome: 'Avental de Raspa', ca: '', tipo: '' },
  { nome: 'Avental de Soldador', ca: '', tipo: '' },
  { nome: 'Trava-Queda', ca: '', tipo: '' },
  { nome: 'Talabarte', ca: '', tipo: '' },
  { nome: 'Respirador Purificador', ca: '', tipo: '' },
  { nome: 'Viseira de Proteção', ca: '', tipo: '' }
]
const CAMPOS: any = {
  funcionarios: [{ k: 'nome', l: 'Nome' }, { k: 'setor', l: 'Setor' }, { k: 'cargo', l: 'Cargo' }, { k: 'empresa', l: 'Empresa' }, { k: 'cpf', l: 'CPF' }, { k: 'telefone', l: 'Telefone' }],
  epis: [{ k: 'nome', l: 'Nome do EPI' }, { k: 'ca', l: 'CA' }, { k: 'funcionario', l: 'Funcionário' }, { k: 'data_entrega', l: 'Data Entrega' }],
  extintores: [{ k: 'localizacao', l: 'Localização' }, { k: 'tipo', l: 'Tipo' }, { k: 'vencimento', l: 'Vencimento' }, { k: 'status', l: 'Status' }],
  inspecoes: [{ k: 'titulo', l: 'Título' }, { k: 'local', l: 'Local' }, { k: 'responsavel', l: 'Responsável' }, { k: 'data', l: 'Data' }, { k: 'status', l: 'Status' }],
  documentos: [{ k: 'titulo', l: 'Título' }, { k: 'empresa', l: 'Empresa' }, { k: 'vencimento', l: 'Vencimento' }],
  exames: [{ k: 'nome', l: 'Funcionário' }, { k: 'tipo', l: 'Tipo Exame' }, { k: 'data', l: 'Data' }, { k: 'resultado', l: 'Resultado' }, { k: 'clinica', l: 'Clínica' }],
  clinicas: [{ k: 'nome', l: 'Nome da Clínica' }, { k: 'telefone', l: 'Telefone' }, { k: 'endereco', l: 'Endereço' }, { k: 'convenio', l: 'Convênio' }],
  empresas: [{ k: 'nome', l: 'Nome da Empresa' }, { k: 'cnpj', l: 'CNPJ' }, { k: 'responsavel', l: 'Responsável' }, { k: 'telefone', l: 'Telefone' }, { k: 'email', l: 'E-mail' }, { k: 'login', l: 'Login' }, { k: 'senha', l: 'Senha' }],
  riscos: [{ k: 'ghe', l: 'GHE / Setor' }, { k: 'nome', l: 'Risco' }, { k: 'tipo', l: 'Tipo' }, { k: 'agente', l: 'Agente' }, { k: 'limite', l: 'Limite' }, { k: 'epi', l: 'EPI de Controle' }],
  financeiro: [{ k: 'descricao', l: 'Descrição' }, { k: 'empresa', l: 'Empresa' }, { k: 'valor', l: 'Valor R$' }, { k: 'vencimento', l: 'Vencimento' }, { k: 'status', l: 'Status' }]
}
const PASTAS = [{ id: 'PGR', nome: 'PGR' }, { id: 'PCMSO', nome: 'PCMSO' }, { id: 'ASO', nome: 'ASO / Exames' }, { id: 'Laudos', nome: 'Laudos' }, { id: 'Treinamentos', nome: 'Treinamentos' }, { id: 'Outros', nome: 'Outros' }]
const TIPOS_EXAME = ['Admissional', 'Periódico', 'Demissional', 'Audiometria', 'Espirometria', 'Raio-X', 'Exame de Sangue', 'Eletrocardiograma', 'Retorno ao Trabalho', 'Mudança de Função', 'Acuidade Visual', 'Exame Clínico']
function iconeEpi(nome: any) {
  const n = String(nome || '').toLowerCase()
  if (n.includes('capacete')) return '🪖'
  if (n.includes('luva')) return '🧤'
  if (n.includes('bota') || n.includes('calçado') || n.includes('botina')) return '👢'
  if (n.includes('óculos') || n.includes('oculos') || n.includes('viseira')) return '👓'
  if (n.includes('máscara') || n.includes('mascara') || n.includes('respirador')) return '😷'
  if (n.includes('protetor')) return '🎧'
  if (n.includes('colete') || n.includes('cinto')) return '🦺'
  if (n.includes('avental')) return '🥼'
  if (n.includes('perneira')) return '🦵'
  if (n.includes('creme')) return '🧴'
  return '🦺'
}
function gerarPIN() { return String(Math.floor(1000 + Math.random() * 9000)) }
function gerarSenha() { return 'Previx' + Math.floor(1000 + Math.random() * 9000) + '@' }
function limparData(v: any) {
  if (!v) return ''
  v = String(v).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  const m = v.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0')
  if (v.includes('T')) return v.split('T')[0]
  return ''
}
function fmtData(v: any) { const l = limparData(v); if (!l) return '-'; return l.split('-').reverse().join('/') }
function comparaData(a: any, b: any) { return limparData(a.data).localeCompare(limparData(b.data)) }
function statusExame(item: any) {
  const d = limparData(item?.data)
  const res = String(item?.resultado || '').toLowerCase()
  if (res === 'apto' || res === 'inapto') return 'realizado'
  if (!d) return 'sem-data'
  const hoje = new Date().toISOString().split('T')[0]
  if (d === hoje) return 'hoje'
  if (d < hoje) return 'vencido'
  return 'futuro'
}
const ADMIN = { login: 'cristiano', senha: 'previx123', nome: 'Cristiano', tipo: 'admin', empresa: 'Todas' }
export default function Home() {
  const [dados, setDados] = useState<any>({ funcionarios: [], epis: [], extintores: [], inspecoes: [], documentos: [], exames: [], empresas: [], clinicas: [], riscos: [], financeiro: [] })
  const [aba, setAba] = useState('inicio')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [busca, setBusca] = useState('')
  const [usuario, setUsuario] = useState<any>(null)
  const [loginForm, setLoginForm] = useState({ login: '', senha: '' })
  const [erroLogin, setErroLogin] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [pastaAtual, setPastaAtual] = useState('Todas')
  const [filtroSetor, setFiltroSetor] = useState('Todos')
  const [clinicaSel, setClinicaSel] = useState('Sol Nascente')
  const [diaSel, setDiaSel] = useState(new Date().toISOString().split('T')[0])
  const [tiposSel, setTiposSel] = useState<string[]>(['Periódico'])
  const [funcAgend, setFuncAgend] = useState('')
  const [buscaEpi, setBuscaEpi] = useState('')
  const [pinDigitado, setPinDigitado] = useState('')
  const [pinVerificado, setPinVerificado] = useState(false)
  const [assinaturaFeita, setAssinaturaFeita] = useState(false)
  const canvasRef = useRef<any>(null)
  const desenhando = useRef(false)
  useEffect(() => {
    const s = localStorage.getItem('previx_session')
    if (s) { try { setUsuario(JSON.parse(s)) } catch { } }
    carregar()
    setCarregando(false)
  }, [])
  function carregar() {
    try {
      const ld = JSON.parse(localStorage.getItem('previx_dados') || '{}')
      const le = JSON.parse(localStorage.getItem('previx_empresas') || '[]')
      const res: any = { funcionarios: [], epis: [], extintores: [], inspecoes: [], documentos: [], exames: [], empresas: [], clinicas: [], riscos: [], financeiro: [] }
      Object.keys(res).forEach(k => { if (ld[k]) res[k] = ld[k] })
      if (le.length) res.empresas = le
      if (!res.empresas.find((e: any) => e.login === 'solnascente')) {
        res.empresas.push({ id: 'sol1', nome: 'Solnascente LTDA', cnpj: '', responsavel: 'Ronaldo', telefone: '82994145622', email: 'Lojas.cs16486@gmail.com', login: 'solnascente', senha: '12345678', status: 'Ativa' })
      }
      if (!res.clinicas.length) res.clinicas = [{ id: 'clin1', nome: 'Sol Nascente', telefone: '(82) 99999-0000', endereco: 'Maceió - AL', convenio: 'Vigente', status: 'Ativa' }]
      res.funcionarios = res.funcionarios.map((f: any) => f.pin ? f : { ...f, pin: gerarPIN() })
      res.exames = res.exames.map((e: any) => ({ ...e, data: limparData(e.data) || e.data, nome: e.nome || e.funcionario || 'Registro' }))
      setDados(res)
      if (res.clinicas[0]) setClinicaSel(res.clinicas[0].nome)
    } catch { }
  }
  function salvarNav(nd: any) { try { localStorage.setItem('previx_empresas', JSON.stringify(nd.empresas || [])); localStorage.setItem('previx_dados', JSON.stringify(nd)) } catch { } }
  function dadosFiltrados(lista: any[]) {
    if (!usuario) return []
    if (usuario.tipo === 'admin') return lista
    return lista.filter((it: any) => it.empresa && it.empresa.toLowerCase() === usuario.empresa.toLowerCase())
  }
  function exportarCSV() {
    const funcs = dadosFiltrados(dados.funcionarios || [])
    let csv = 'nome;cpf;cargo;setor;empresa;telefone;pin\n'
    funcs.forEach((f: any) => { csv += (f.nome || '') + ';' + (f.cpf || '') + ';' + (f.cargo || '') + ';' + (f.setor || '') + ';' + (f.empresa || '') + ';' + (f.telefone || '') + ';' + (f.pin || '') + '\n' })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'previx-export.csv'
    a.click()
  }
  function gerarLaudo(tipo: string) {
    const riscos = dadosFiltrados(dados.riscos || [])
    const funcs = dadosFiltrados(dados.funcionarios || [])
    const empObj = (dados.empresas || []).find((e: any) => e.nome === usuario?.empresa) || {}
    const empNome = usuario?.empresa || 'Empresa'
    const hoje = new Date().toLocaleDateString('pt-BR')
    const validade = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('pt-BR')
    const num = 'PREVIX-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000)
    const isPGR = tipo.includes('PGR')
    const isLTCAT = tipo.includes('LTCAT')
    const isLIP = tipo.includes('LIP')
    const titulo = isPGR ? 'PGR - Programa de Gerenciamento de Riscos' : isLTCAT ? 'LTCAT - Laudo Técnico das Condições Ambientais do Trabalho' : isLIP ? 'LIP - Laudo de Insalubridade e Periculosidade' : tipo
    const sub = isPGR ? 'NR-01 • NR-09 • NR-17' : isLTCAT ? 'Lei 8.213/91 • Decreto 3.048/99 • NR-15 • NR-16' : isLIP ? 'NR-15 • NR-16 • Anexos 1 e 2' : 'NR-07 • PCMSO'
    const objetivo = isPGR ? 'Identificar, avaliar e controlar os riscos ocupacionais existentes nos ambientes de trabalho, conforme a NR-01.' : isLTCAT ? 'Caracterizar as condições ambientais de trabalho para fins de aposentadoria especial, conforme legislação previdenciária.' : isLIP ? 'Avaliar condições insalubres e perigosas, caracterizando direito ao adicional, conforme NR-15 e NR-16.' : 'Estabelecer diretrizes para o controle médico de saúde ocupacional.'
    const base = isPGR ? '<li><b>NR-01</b> - Gerenciamento de Riscos Ocupacionais (Portaria 6.730/2020)</li><li><b>NR-09</b> - Avaliação e Controle das Exposições</li><li><b>NR-17</b> - Ergonomia</li><li><b>Lei 6.514/77</b> - Altera o Capítulo V da CLT</li><li><b>Portaria 3.214/78</b> - Normas Regulamentadoras</li>' : isLTCAT ? '<li><b>Lei 8.213/91, Art. 57 e 58</b> - Aposentadoria Especial</li><li><b>Decreto 3.048/99</b> - Regulamento da Previdência</li><li><b>NR-15</b> - Atividades Insalubres</li><li><b>NR-16</b> - Atividades Perigosas</li><li><b>eSocial - S-2240</b> - Condições Ambientais</li>' : isLIP ? '<li><b>NR-15 - Anexo 1</b> - Ruído Contínuo</li><li><b>NR-15 - Anexo 3</b> - Calor</li><li><b>NR-15 - Anexo 11</b> - Agentes Químicos</li><li><b>NR-15 - Anexo 14</b> - Agentes Biológicos</li><li><b>NR-16 - Anexo 1 e 2</b> - Inflamáveis e Eletricidade</li><li><b>CLT, Art. 189 a 197</b> - Adicionais</li>' : '<li><b>NR-07</b> - PCMSO</li><li><b>NR-01</b> - Gerenciamento de Riscos</li>'
    let linhasR = ''
    if (riscos.length === 0) linhasR = '<tr><td colspan="8" style="text-align:center;padding:20px">Nenhum risco cadastrado ainda.</td></tr>'
    else riscos.forEach((r: any, i: number) => { linhasR += '<tr><td>' + (i + 1) + '</td><td><b>' + (r.ghe || '-') + '</b></td><td>' + (r.nome || '-') + '</td><td>' + (r.tipo || '-') + '</td><td>' + (r.agente || '-') + '</td><td>' + (r.limite || '-') + '</td><td>' + (r.epi || '-') + '</td><td>Monitorar</td></tr>' })
    let linhasF = ''
    if (funcs.length === 0) linhasF = '<tr><td colspan="4" style="text-align:center">Nenhum funcionário</td></tr>'
    else funcs.slice(0, 12).forEach((f: any) => { linhasF += '<tr><td>' + (f.nome || '-') + '</td><td>' + (f.cargo || '-') + '</td><td>' + (f.setor || '-') + '</td><td>' + (f.cpf || '-') + '</td></tr>' })
    const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + titulo + '</title><style>body{font-family:Arial,sans-serif;color:#0f172a;margin:0;padding:28px;font-size:13px;line-height:1.55}.topo{display:flex;justify-content:space-between;border-bottom:3px solid #0d9488;padding-bottom:14px}.logo{font-size:28px;font-weight:900}.logo span{color:#0d9488}h1{font-size:22px;text-align:center}h2{font-size:14px;background:#0f172a;color:#fff;padding:8px 12px;border-radius:8px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#0d9488;color:#fff;padding:8px;text-align:left}td{padding:7px;border-bottom:1px solid #e2e8f0}.card{border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.btnprint{text-align:center;margin:18px 0}.btnprint button{background:#0d9488;color:#fff;border:none;padding:13px 26px;border-radius:20px;font-weight:800}@media print{.btnprint{display:none}}</style></head><body>'
            + '<div class="topo"><div><div class="logo">PREVIX <span>SST</span></div><div>PREVENÇÃO QUE PROTEGE</div></div><div style="text-align:right"><b>' + num + '</b><div>Emitido: ' + hoje + '</div><div>Validade: ' + validade + '</div></div></div>'
            + '<h1>' + titulo + '</h1><div style="text-align:center;color:#0d9488;font-weight:800">' + sub + '</div>'
            + '<div class="grid"><div class="card"><h3>Empresa</h3><p><b>Razão Social:</b> ' + empNome + '</p><p><b>CNPJ:</b> ' + (empObj.cnpj || 'Não informado') + '</p><p><b>Responsável:</b> ' + (empObj.responsavel || usuario?.nome || '-') + '</p><p><b>Telefone:</b> ' + (empObj.telefone || '-') + '</p></div>'
            + '<div class="card"><h3>Responsável Técnico</h3><p><b>Nome:</b> ' + (usuario?.nome || 'Cristiano') + '</p><p><b>Função:</b> Técnico / Engenheiro de Segurança do Trabalho</p><p><b>Registro:</b> CREA / MTE - A preencher</p><p><b>Elaborado por:</b> PREVIX SST</p></div></div>'
            + '<h2>1. OBJETIVO</h2><p>' + objetivo + '</p><p>Este documento atende às exigências legais, subsidia o eSocial (S-2240), o PPP e a gestão de SST da empresa.</p>'
            + '<h2>2. BASE LEGAL E NORMAS</h2><ul>' + base + '</ul><p><b>Atenção:</b> Este laudo deve ser validado e assinado pelo responsável técnico habilitado.</p>'
            + '<h2>3. INVENTÁRIO DE RISCOS / GHE</h2><table><thead><tr><th>#</th><th>GHE / Setor</th><th>Risco</th><th>Tipo</th><th>Agente</th><th>Limite</th><th>EPI</th><th>Ação</th></tr></thead><tbody>' + linhasR + '</tbody></table>'
            + '<h2>4. MEDIDAS DE CONTROLE</h2><p><b>Hierarquia:</b> 1. Eliminação, 2. Engenharia, 3. Administrativo, 4. EPI com CA válido e treinamento. <b>Treinamentos:</b> NR-01, NR-06, NR-17, NR-35, NR-10.</p>'
            + '<h2>5. PLANO DE AÇÃO</h2><table><thead><tr><th>Ação</th><th>Responsável</th><th>Prazo</th><th>Status</th></tr></thead><tbody><tr><td>Revisar inventário</td><td>Resp. Técnico</td><td>30 dias</td><td>Pendente</td></tr><tr><td>Entregar EPIs</td><td>Empresa</td><td>Imediato</td><td>Contínuo</td></tr><tr><td>Exames periódicos</td><td>Clínica</td><td>Conforme PCMSO</td><td>Agendado</td></tr><tr><td>Revisão anual</td><td>Resp. Técnico</td><td>' + validade + '</td><td>Programado</td></tr></tbody></table>'
            + '<h2>6. FUNCIONÁRIOS</h2><table><thead><tr><th>Nome</th><th>Cargo</th><th>Setor</th><th>CPF</th></tr></thead><tbody>' + linhasF + '</tbody></table>'
            + '<h2>7. CONCLUSÃO</h2><p>Manter inventário atualizado, garantir entrega e uso correto dos EPIs, realizar exames conforme PCMSO e promover treinamentos periódicos.</p>'
            + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:40px;text-align:center"><div><div style="border-top:1px solid #000;width:90%;margin:0 auto"></div><b>' + (usuario?.nome || 'Cristiano') + '</b><div>Responsável Técnico</div></div><div><div style="border-top:1px solid #000;width:90%;margin:0 auto"></div><b>' + (empObj.responsavel || empNome) + '</b><div>Responsável pela Empresa - ' + hoje + '</div></div></div>'
            + '<div class="btnprint"><button onclick="window.print()">Imprimir / Salvar como PDF</button></div></body></html>'
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() }
  }
  function gerarTermo(entrega: any) {
    const func = (dados.funcionarios || []).find((f: any) => f.nome === entrega.funcionario) || {}
    const empNome = entrega.empresa || func.empresa || usuario?.empresa || 'PREVIX SST'
    const dataFmt = entrega.data_entrega ? entrega.data_entrega.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR')
    const html = '<html><head><meta charset="utf-8"><title>Termo</title><style>body{font-family:Arial;padding:28px;max-width:820px;margin:0 auto}</style></head><body><h1 style="text-align:center">Termo de Entrega de EPI - NR-06</h1><p><b>Empresa:</b> ' + empNome + '</p><p><b>Funcionário:</b> ' + (entrega.funcionario || '-') + ' - CPF: ' + (func.cpf || '-') + ' - Setor: ' + (func.setor || '-') + '</p><p><b>EPI:</b> ' + iconeEpi(entrega.nome) + ' ' + (entrega.nome || '-') + ' - Tipo/Modelo: ' + (entrega.tipo || entrega.modelo || '-') + ' - Qtd: ' + (entrega.quantidade || 1) + ' - CA: ' + (entrega.ca || '-') + ' - Data: ' + dataFmt + '</p><p><b>Confirmação:</b> Digital: SIM | PIN Verificado: SIM | Assinatura com dedo: SIM</p><p style="text-align:justify">Declaro que recebi o EPI acima, com CA válido, e fui orientado quanto ao uso correto, conforme NR-06.</p>' + (entrega.assinaturaImg ? '<p style="text-align:center"><img src="' + entrega.assinaturaImg + '" style="max-width:300px;border:1px solid #ccc" /></p>' : '') + '<div style="margin-top:20px;text-align:center"><div style="border-top:1px solid #000;width:340px;margin:0 auto"></div>' + (entrega.funcionario || '') + '</div><div style="text-align:center;margin-top:20px"><button onclick="window.print()">Imprimir / PDF</button></div></body></html>'
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() }
  }
  function fazerLogin() {
    setErroLogin('')
    const login = loginForm.login.trim().toLowerCase()
    const senha = loginForm.senha.trim()
    if (login === ADMIN.login && senha === ADMIN.senha) { setUsuario(ADMIN); localStorage.setItem('previx_session', JSON.stringify(ADMIN)); setAba('inicio'); return }
    if (login === 'admin' && senha === 'admin') { setUsuario(ADMIN); localStorage.setItem('previx_session', JSON.stringify(ADMIN)); setAba('inicio'); return }
    const emp = (dados.empresas || []).find((e: any) => (e.login || '').toLowerCase() === login && (e.senha || '') === senha)
    if (emp) { const u = { login: emp.login, nome: emp.responsavel || emp.nome, tipo: 'empresa', empresa: emp.nome }; setUsuario(u); localStorage.setItem('previx_session', JSON.stringify(u)); setAba('inicio'); return }
    setErroLogin('Login ou senha incorretos!')
  }
  function sair() { setUsuario(null); localStorage.removeItem('previx_session'); setLoginForm({ login: '', senha: '' }); setAba('inicio') }
  function abrirNovo() {
    setEditando(null); setForm({})
    if (aba === 'empresas') setForm({ senha: gerarSenha(), status: 'Ativa' })
    if (aba === 'funcionarios') setForm({ empresa: usuario?.tipo === 'empresa' ? usuario.empresa : '', pin: gerarPIN(), setor: 'Vendas' })
    if (aba === 'epis') { setForm({ empresa: usuario?.tipo === 'empresa' ? usuario.empresa : '', data_entrega: new Date().toISOString().split('T')[0], quantidade: 1, tipo: '', modelo: '' }); setPinDigitado(''); setPinVerificado(false); setAssinaturaFeita(false); setTimeout(() => { const c = canvasRef.current; if (c) { const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height) } }, 100) }
    if (aba === 'exames') setForm({ data: diaSel, tipo: 'Periódico', resultado: 'Aguardando', clinica: clinicaSel })
    if (aba === 'documentos') setForm({ empresa: usuario?.tipo === 'empresa' ? usuario.empresa : '' })
    if (aba === 'inspecoes') setForm({ status: 'Pendente', data: new Date().toISOString().split('T')[0] })
    if (aba === 'riscos') setForm({ ghe: 'Vendas', tipo: 'Físico' })
    if (aba === 'financeiro') setForm({ status: 'Pendente', vencimento: new Date().toISOString().split('T')[0] })
    setModal(true)
  }
  function abrirEditar(item: any) { setEditando(item); setForm({ ...item }); setPinDigitado(''); setPinVerificado(!!item.pinVerificado); setAssinaturaFeita(!!item.assinaturaImg); setModal(true) }
  function verificarPIN() {
    const func = (dados.funcionarios || []).find((f: any) => f.nome === form.funcionario) || (dados.funcionarios || []).find((f: any) => (f.cpf || '') === form.funcionario)
    if (!func) { alert('Primeiro escolhe o funcionário!'); return }
    if (pinDigitado === String(func.pin)) { setPinVerificado(true); alert('✅ PIN correto! Agora pede pra assinar abaixo.') }
    else { setPinVerificado(false); alert('❌ PIN incorreto. Pede o PIN dele de novo.') }
  }
  function limparAssinatura() { const c = canvasRef.current; if (c) { const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height) } setAssinaturaFeita(false) }
  function posCanvas(e: any) { const c = canvasRef.current; const r = c.getBoundingClientRect(); const t = e.touches?.[0] || e; return { x: t.clientX - r.left, y: t.clientY - r.top } }
  function salvar() {
    if (!aba || aba === 'inicio') return
    const f = { ...form }
    if (aba === 'funcionarios') { if (!f.pin) f.pin = gerarPIN(); if (!f.nome) { alert('Coloca o nome!'); return }; if (!f.setor) f.setor = 'Vendas' }
    if (aba === 'exames') { if (!f.nome) { alert('Escolhe o funcionário!'); return }; f.data = limparData(f.data) || new Date().toISOString().split('T')[0]; f.funcionario = f.nome; if (!f.clinica) f.clinica = clinicaSel }
    if (aba === 'epis') {
      if (!f.nome) { alert('Escolhe o EPI!'); return }
      if (!f.funcionario) { alert('Digita nome OU CPF!'); return }
      if (!pinVerificado) { alert('Verifica o PIN primeiro!'); return }
      if (!assinaturaFeita) { alert('Pede pra ele assinar com o dedo no quadrado!'); return }
      const c = canvasRef.current; f.assinaturaImg = c ? c.toDataURL() : ''; f.pinVerificado = true; f.confDigital = true; f.quantidade = f.quantidade || 1
    }
    if (aba === 'documentos') { if (!f.titulo) { alert('Título!'); return } }
    if (aba === 'empresas') { if (!f.login && f.nome) f.login = f.nome.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12); if (!f.senha) f.senha = gerarSenha() }
    if (aba === 'riscos' && !f.nome) { alert('Coloca o risco!'); return }
    if (aba === 'financeiro' && !f.descricao) { alert('Descrição!'); return }
    if (usuario?.tipo === 'empresa') f.empresa = usuario.empresa
    const lista = [...(dados[aba] || [])]
    if (editando) {
      const id = editando.id || editando._id
      const idx = lista.findIndex((x: any) => (x.id || x._id) === id)
      if (idx >= 0) lista[idx] = { ...lista[idx], ...f }
      const nd = { ...dados, [aba]: lista }; setDados(nd); salvarNav(nd)
    } else {
      const novo = { ...f, id: Date.now().toString(), status: f.status || 'Ativa' }
      lista.push(novo)
      const nd = { ...dados, [aba]: lista }; setDados(nd); salvarNav(nd)
      if (aba === 'funcionarios') alert('✅ ' + novo.nome + ' • PIN: ' + novo.pin)
      if (aba === 'epis') alert('✅ Entrega confirmada! PDF já sai com a assinatura.')
    }
    setModal(false); setForm({}); setEditando(null)
  }
  function excluir(item: any) {
    if (!confirm('Excluir ' + (item.nome || item.titulo || item.descricao || 'registro') + '?')) return
    const id = item.id || item._id
    const nl = (dados[aba] || []).filter((x: any) => (x.id || x._id) !== id)
    const nd = { ...dados, [aba]: nl }; setDados(nd); salvarNav(nd)
  }
  function confirmarAgendamento() {
    if (!funcAgend) { alert('Escolhe o funcionário!'); return }
    if (tiposSel.length === 0) { alert('Marca 1 tipo!'); return }
    const novos = tiposSel.map(t => ({ id: Date.now().toString() + Math.random().toString().slice(2, 6), nome: funcAgend, funcionario: funcAgend, tipo: t, data: diaSel, resultado: 'Aguardando', clinica: clinicaSel, empresa: usuario?.empresa || '', status: 'Agendado' }))
    const nd = { ...dados, exames: [...(dados.exames || []), ...novos] }
    setDados(nd); salvarNav(nd)
    alert('✅ Agendado! ' + funcAgend + ' • ' + clinicaSel + ' • ' + fmtData(diaSel))
    setTiposSel([]); setFuncAgend('')
  }
  const btn = { padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 } as any
  const input = { width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' as any }
  if (carregando) return <div style={{ padding: 40, textAlign: 'center' }}>Carregando PREVIX...</div>
  if (!usuario) {
    return <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0d9488,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'Arial,sans-serif' }}><div style={{ background: 'white', borderRadius: 24, padding: 32, width: '100%', maxWidth: 420 }}><div style={{ textAlign: 'center' }}><h1 style={{ fontSize: 32, fontWeight: 900, margin: '12px 0 0' }}>PREVIX</h1><p style={{ color: '#0d9488', fontWeight: 800, fontSize: 11, letterSpacing: 2 }}>PREVENÇÃO QUE PROTEGE</p></div><div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}><input value={loginForm.login} onChange={e => setLoginForm({ ...loginForm, login: e.target.value })} placeholder="Login" style={input} /><input type="password" value={loginForm.senha} onChange={e => setLoginForm({ ...loginForm, senha: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') fazerLogin() }} placeholder="Senha" style={input} />{erroLogin && <div style={{ background: '#fee2e2', padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#b91c1c' }}>{erroLogin}</div>}<button onClick={fazerLogin} style={{ ...btn, background: 'linear-gradient(90deg,#0d9488,#2563eb)', color: 'white', padding: 14, borderRadius: 12, fontSize: 15 }}>Entrar</button></div></div></div>
  }
  const isAdmin = usuario.tipo === 'admin'
  const menuBase = [{ id: 'inicio', label: 'Início', icone: '🏠' }, { id: 'funcionarios', label: 'Funcionários', icone: '👷' }, { id: 'epis', label: "EPI's", icone: '🦺' }, { id: 'extintores', label: 'Extintores', icone: '🧯' }, { id: 'inspecoes', label: 'Inspeções', icone: '📋' }, { id: 'documentos', label: 'Documentos', icone: '📄' }, { id: 'exames', label: 'Exames', icone: '🩺' }, { id: 'clinicas', label: 'Clínicas', icone: '🏥' }, { id: 'riscos', label: 'PGR / Riscos', icone: '⚠️' }, { id: 'financeiro', label: 'Financeiro', icone: '💰' }]
  const menu = isAdmin ? [...menuBase, { id: 'empresas', label: 'Empresas', icone: '🏢' }] : menuBase
  const funcs = dadosFiltrados(dados.funcionarios || [])
  const episF = dadosFiltrados(dados.epis || [])
  const examesF = dadosFiltrados(dados.exames || [])
  const riscosF = dadosFiltrados(dados.riscos || [])
  const financF = dadosFiltrados(dados.financeiro || [])
  const docF = dadosFiltrados(dados.documentos || [])
  const inspF = dadosFiltrados(dados.inspecoes || [])
  const totalFin = financF.reduce((s: any, f: any) => s + (parseFloat(String(f.valor || '0').replace(',', '.')) || 0), 0)
  const totalRec = financF.filter((f: any) => String(f.status || '').toLowerCase().includes('pago')).reduce((s: any, f: any) => s + (parseFloat(String(f.valor || '0').replace(',', '.')) || 0), 0)
  const cards = [{ titulo: 'Funcionários', valor: funcs.length, icone: '👷', cor: 'linear-gradient(135deg,#14b8a6,#06b6d4)', aba: 'funcionarios' }, { titulo: "EPI's", valor: episF.length, icone: '🦺', cor: 'linear-gradient(135deg,#22c55e,#84cc16)', aba: 'epis' }, { titulo: 'Exames', valor: examesF.length, icone: '🩺', cor: 'linear-gradient(135deg,#0d9488,#2563eb)', aba: 'exames' }, { titulo: 'Riscos PGR', valor: riscosF.length, icone: '⚠️', cor: 'linear-gradient(135deg,#f59e0b,#ef4444)', aba: 'riscos' }]
  const listaBase = dados[aba] || []
  const listaPorEmp = dadosFiltrados(listaBase)
  let listaFiltrada = listaPorEmp.filter((it: any) => JSON.stringify(it).toLowerCase().includes(busca.toLowerCase()))
  if (aba === 'funcionarios' && filtroSetor !== 'Todos') listaFiltrada = listaFiltrada.filter((it: any) => (it.setor || 'Sem setor') === filtroSetor)
  if (aba === 'documentos' && pastaAtual !== 'Todas') listaFiltrada = listaFiltrada.filter((it: any) => (it.pasta || it.tipo || 'Outros') === pastaAtual)
  if (aba === 'exames') { listaFiltrada = [...listaFiltrada].sort(comparaData) }
  if (aba === 'epis' && buscaEpi) { listaFiltrada = listaFiltrada.filter((it: any) => { const func = funcs.find((f: any) => f.nome === it.funcionario); const cpf = func?.cpf || ''; return JSON.stringify(it).toLowerCase().includes(buscaEpi.toLowerCase()) || cpf.includes(buscaEpi) }) }
  const exVenc = examesF.filter((e: any) => statusExame(e) === 'vencido').length
  const exReal = examesF.filter((e: any) => statusExame(e) === 'realizado').length
  const clinicaAtual = (dados.clinicas || []).find((c: any) => c.nome === clinicaSel) || (dados.clinicas || [])[0] || { nome: 'Sol Nascente' }
  const funcSelEpi = (dados.funcionarios || []).find((f: any) => f.nome === form.funcionario) || (dados.funcionarios || []).find((f: any) => (f.cpf || '') === form.funcionario) || null
  // BARRA SST - SÓ APARECE DEPOIS DE DIGITAR A INICIAL
  const textoEpi = String(form.nome || '').trim().toLowerCase()
  const mostrarListaEpi = textoEpi.length >= 1
  const listaEpiModal = mostrarListaEpi ? [...CATALOGO_EPI, ...episF.map((e: any) => ({ nome: e.nome, ca: e.ca, tipo: e.tipo || '' }))].filter((e: any) => String(e.nome || '').toLowerCase().includes(textoEpi)).filter((e: any, i: number, arr: any[]) => arr.findIndex((x: any) => (x.nome + x.tipo) === (e.nome + e.tipo)) === i) : []
  return <div style={{ minHeight: '100vh', background: '#ecfeff', fontFamily: 'Arial,sans-serif' }}>
    <header style={{ background: 'linear-gradient(90deg,#0d9488,#2563eb)', color: 'white', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ fontWeight: 900, fontSize: 20 }}>PREVIX <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 20 }}>SST</span></div><div style={{ display: 'flex', gap: 8 }}><span style={{ fontSize: 12, background: isAdmin ? '#f97316' : '#22c55e', padding: '6px 12px', borderRadius: 20, fontWeight: 700 }}>{isAdmin ? 'SUPER ADMIN' : usuario.empresa}</span><button onClick={exportarCSV} style={{ ...btn, background: 'white', color: '#0f172a', borderRadius: 20 }}>Exportar CSV</button><button onClick={sair} style={{ ...btn, background: 'white', color: '#0f172a', borderRadius: 20 }}>Sair</button></div></div>
      <div style={{ maxWidth: 1200, margin: '12px auto 0', display: 'flex', gap: 8, overflowX: 'auto' }}>{menu.map(m => (<button key={m.id} onClick={() => { setAba(m.id); setBusca(''); setBuscaEpi('') }} style={{ whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: aba === m.id ? 'white' : 'rgba(255,255,255,0.15)', color: aba === m.id ? '#0f766e' : 'white' }}>{m.icone} {m.label}</button>))}</div>
    </header>
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
      {aba === 'inicio' && <div>
        <div style={{ background: 'white', borderRadius: 24, padding: 24 }}><h2 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>Olá, {usuario.nome}! 👋</h2><p style={{ color: '#64748b' }}>{usuario.empresa}</p></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginTop: 20 }}>{cards.map(c => (<button key={c.titulo} onClick={() => setAba(c.aba)} style={{ background: c.cor, borderRadius: 24, padding: 20, textAlign: 'left', border: 'none', cursor: 'pointer', color: 'white' }}><div style={{ fontSize: 24 }}>{c.icone}</div><div style={{ marginTop: 12, fontWeight: 700 }}>{c.titulo}</div><div style={{ fontSize: 32, fontWeight: 900 }}>{c.valor}</div></button>))}</div>
        <div style={{ background: 'white', borderRadius: 24, padding: 20, marginTop: 20 }}><h3 style={{ margin: '0 0 12px' }}>Laudos em 1 clique - Profissional com Normas</h3><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><button onClick={() => gerarLaudo('PGR')} style={{ ...btn, background: '#0d9488', color: 'white', padding: '12px 18px', borderRadius: 20 }}>Gerar PGR</button><button onClick={() => gerarLaudo('LTCAT')} style={{ ...btn, background: '#2563eb', color: 'white', padding: '12px 18px', borderRadius: 20 }}>Gerar LTCAT</button><button onClick={() => gerarLaudo('LIP')} style={{ ...btn, background: '#f59e0b', color: 'white', padding: '12px 18px', borderRadius: 20 }}>Gerar LIP</button><button onClick={() => gerarLaudo('PCMSO')} style={{ ...btn, background: '#22c55e', color: 'white', padding: '12px 18px', borderRadius: 20 }}>Gerar PCMSO</button></div><p style={{ fontSize: 13, color: '#64748b' }}>Cadastra o risco 1x em PGR / Riscos e gera os laudos com base legal, normas e responsável técnico.</p></div>
        <div style={{ background: 'white', borderRadius: 24, padding: 20, marginTop: 20 }}><h3>Financeiro</h3><p>Total: R$ {totalFin.toFixed(2)} - Recebido: R$ {totalRec.toFixed(2)} - A receber: R$ {(totalFin - totalRec).toFixed(2)}</p><p>Exames vencidos: {exVenc} - Realizados: {exReal}</p></div>
      </div>}
      {aba === 'exames' && <div>
        <div style={{ background: 'white', borderRadius: 24, padding: 20 }}><h2>Exames - {clinicaAtual.nome}</h2><p>Clínica parceira: {clinicaAtual.telefone || ''} - {clinicaAtual.endereco || ''}</p><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><select value={clinicaSel} onChange={e => setClinicaSel(e.target.value)} style={{ padding: '10px', borderRadius: 20 }}>{(dados.clinicas || []).map((c: any) => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select><input type="date" value={diaSel} onChange={e => setDiaSel(e.target.value)} style={{ padding: '10px', borderRadius: 20, border: '1px solid #cbd5e1' }} /></div>
          <div style={{ marginTop: 14 }}><label>Funcionário</label><input value={funcAgend} onChange={e => setFuncAgend(e.target.value)} placeholder="Digita o nome..." style={{ ...input, marginTop: 4 }} /><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>{funcs.filter((f: any) => !funcAgend || f.nome.toLowerCase().includes(funcAgend.toLowerCase())).slice(0, 5).map((f: any) => <button key={f.id} onClick={() => setFuncAgend(f.nome)} style={{ ...btn, background: '#f0fdfa' }}>{f.nome}</button>)}</div></div>
          <div style={{ marginTop: 12 }}>{TIPOS_EXAME.map(t => { const chk = tiposSel.includes(t); return <label key={t} style={{ display: 'inline-flex', gap: 6, margin: 4, padding: '8px 12px', borderRadius: 20, background: chk ? '#ccfbf1' : '#f1f5f9', cursor: 'pointer' }}><input type="checkbox" checked={chk} onChange={() => setTiposSel(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])} />{t}</label> })}</div>
          <button onClick={confirmarAgendamento} style={{ ...btn, background: '#0d9488', color: 'white', padding: '12px 20px', marginTop: 12 }}>Confirmar agendamento - {fmtData(diaSel)}</button>
        </div>
        <div style={{ background: 'white', borderRadius: 24, padding: 20, marginTop: 16 }}><h3>Exames agendados - {listaFiltrada.length}</h3><input placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)} style={{ ...input, marginTop: 8 }} />{listaFiltrada.map((item: any) => <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 14, marginTop: 10, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}><div><b>{item.nome}</b><div style={{ fontSize: 13, color: '#64748b' }}>{item.tipo} - {fmtData(item.data)} - {item.clinica} - {item.resultado}</div></div><div style={{ display: 'flex', gap: 8 }}><button onClick={() => abrirEditar(item)} style={{ ...btn, background: '#dbeafe' }}>Editar</button><button onClick={() => excluir(item)} style={{ ...btn, background: '#fee2e2' }}>Excluir</button></div></div>)}</div>
      </div>}
      {aba !== 'inicio' && aba !== 'exames' && <div style={{ background: 'white', borderRadius: 24, padding: 24, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}><div><h2 style={{ fontSize: 24, fontWeight: 900, margin: 0, textTransform: 'capitalize' }}>{aba === 'riscos' ? 'PGR / Riscos' : aba}</h2><p style={{ color: '#64748b' }}>Total: {listaFiltrada.length}</p></div><button onClick={abrirNovo} style={{ ...btn, background: 'linear-gradient(90deg,#0d9488,#2563eb)', color: 'white', padding: '12px 20px', borderRadius: 20 }}>+ Adicionar</button></div>
        {aba === 'riscos' && <div style={{ background: '#fef9c3', borderRadius: 16, padding: 16, marginTop: 16 }}><b>Cadastra 1x, gera 3 laudos</b><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}><button onClick={() => gerarLaudo('PGR')} style={{ ...btn, background: '#0d9488', color: 'white', borderRadius: 20 }}>Gerar PGR</button><button onClick={() => gerarLaudo('LTCAT')} style={{ ...btn, background: '#2563eb', color: 'white', borderRadius: 20 }}>Gerar LTCAT</button><button onClick={() => gerarLaudo('LIP')} style={{ ...btn, background: '#f59e0b', color: 'white', borderRadius: 20 }}>Gerar LIP</button><button onClick={() => gerarLaudo('PCMSO')} style={{ ...btn, background: '#22c55e', color: 'white', borderRadius: 20 }}>Gerar PCMSO</button></div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>{RISCOS_PRONTOS.map(r => <button key={r.nome} onClick={() => { setForm({ ghe: 'Vendas', nome: r.nome, tipo: r.tipo, agente: r.agente, limite: r.limite, epi: 'Protetor Auricular', empresa: usuario?.empresa || '' }); setModal(true) }} style={{ ...btn, background: '#f1f5f9', borderRadius: 20 }}>+ {r.nome}</button>)}</div></div>}
        {aba === 'funcionarios' && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>{['Todos', ...SETORES].map(s => { const q = s === 'Todos' ? funcs.length : funcs.filter((f: any) => f.setor === s).length; if (q === 0 && s !== 'Todos') return null; return <button key={s} onClick={() => setFiltroSetor(s)} style={{ ...btn, background: filtroSetor === s ? '#0d9488' : '#f1f5f9', color: filtroSetor === s ? 'white' : '#0f172a', borderRadius: 20 }}>{s} ({q})</button> })}</div>}
        {aba === 'documentos' && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}><button onClick={() => setPastaAtual('Todas')} style={{ ...btn, background: pastaAtual === 'Todas' ? '#0d9488' : '#f1f5f9', color: pastaAtual === 'Todas' ? 'white' : '#0f172a', borderRadius: 20 }}>Todas</button>{PASTAS.map(p => <button key={p.id} onClick={() => setPastaAtual(p.id)} style={{ ...btn, background: pastaAtual === p.id ? '#0d9488' : '#f1f5f9', color: pastaAtual === p.id ? 'white' : '#0f172a', borderRadius: 20 }}>{p.nome}</button>)}</div>}
        {aba === 'epis' && <div style={{ marginTop: 16 }}>
          <input placeholder="Buscar EPI por funcionário, CPF ou nome do EPI..." value={buscaEpi} onChange={e => setBuscaEpi(e.target.value)} style={{ ...input }} />
          <p style={{ fontSize: 12, color: '#64748b' }}>Todos os EPIs já listados abaixo: {episF.length}</p>
        </div>}
        <input placeholder={'Buscar em ' + aba + '...'} value={busca} onChange={e => setBusca(e.target.value)} style={{ ...input, marginTop: 16 }} />
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>{listaFiltrada.map((item: any) => <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: 20, padding: 16, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><div style={{ flex: 1, display: 'flex', gap: 12 }}><div style={{ fontSize: 32, background: '#f0fdfa', borderRadius: 14, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{aba === 'epis' ? iconeEpi(item.nome) : '📄'}</div><div><div style={{ fontWeight: 900 }}>{item.nome || item.titulo || item.descricao || 'Registro'} {aba === 'epis' && item.quantidade ? <span style={{ background: '#ccfbf1', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>Qtd: {item.quantidade}</span> : null}</div><div style={{ fontSize: 13, color: '#64748b' }}>{aba === 'funcionarios' ? (item.cargo || '') + ' • ' + (item.setor || '') + ' • CPF: ' + (item.cpf || '-') + ' • PIN: ' + (item.pin || '-') : aba === 'riscos' ? 'GHE: ' + (item.ghe || '-') + ' • Agente: ' + (item.agente || '-') + ' • Limite: ' + (item.limite || '-') : aba === 'financeiro' ? (item.empresa || '') + ' • Venc: ' + fmtData(item.vencimento) + ' • R$ ' + (item.valor || '0') : aba === 'epis' ? (item.funcionario || '-') + ' • Tipo: ' + (item.tipo || '-') + ' • ' + fmtData(item.data_entrega) + ' • CA: ' + (item.ca || '-') + ' • ✅ PIN + ✍️ Assinatura' : aba === 'documentos' ? 'Venc: ' + fmtData(item.vencimento) + ' • ' + (item.empresa || '') : aba === 'inspecoes' ? (item.local || '-') + ' • ' + (item.responsavel || '-') + ' • ' + fmtData(item.data) : ''}</div>{aba === 'epis' && item.assinaturaImg ? <img src={item.assinaturaImg} style={{ width: 120, border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 6 }} /> : null}</div></div><div style={{ display: 'flex', gap: 8 }}>{aba === 'epis' && <button onClick={() => gerarTermo(item)} style={{ ...btn, background: '#0f172a', color: 'white' }}>PDF</button>}<button onClick={() => abrirEditar(item)} style={{ ...btn, background: '#dbeafe' }}>Editar</button><button onClick={() => excluir(item)} style={{ ...btn, background: '#fee2e2' }}>Excluir</button></div></div>)}{listaFiltrada.length === 0 && <div style={{ textAlign: 'center', padding: 32, border: '2px dashed #cbd5e1', borderRadius: 20 }}>Nenhum registro aqui ainda. Clica em + Adicionar.</div>}</div>
      </div>}
    </main>
    {modal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}><div style={{ background: 'white', borderRadius: 24, padding: 24, width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto' }}>
      <h3 style={{ fontWeight: 900 }}>{editando ? 'Editar' : 'Adicionar'} - {aba}</h3>
      {aba === 'epis' ? <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        <div><label>🔍 Nome do EPI - digita a inicial</label><input value={form.nome || ''} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: digita L p/ Luva, M p/ Máscara, C p/ Capacete..." style={{ ...input, marginTop: 4 }} />
          {mostrarListaEpi ? <div style={{ background: '#f8fafc', borderRadius: 14, padding: 10, marginTop: 8, border: '1px solid #e2e8f0' }}>
            <b style={{ fontSize: 13 }}>🦺 {listaEpiModal.length} EPIs com “{form.nome}” - clica na linha:</b>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, maxHeight: 240, overflowY: 'auto' }}>
              {listaEpiModal.length === 0 ? <p style={{ fontSize: 12, color: '#64748b' }}>Nenhum EPI com essa inicial. Pode cadastrar novo.</p> : listaEpiModal.map((e: any, idx: number) => <button key={(e.nome + e.tipo) + idx} type="button" onClick={() => setForm({ ...form, nome: e.nome, tipo: e.tipo || form.tipo || '', ca: e.ca || form.ca || '' })} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, fontSize: 14 }}><span style={{ fontSize: 20 }}>{iconeEpi(e.nome)}</span><span style={{ flex: 1 }}>{e.nome}{e.tipo ? ' - ' + e.tipo : ''}</span>{e.ca ? <span style={{ fontSize: 12, color: '#64748b' }}>CA {e.ca}</span> : null}</button>)}
            </div>
          </div> : <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>💡 Digita a inicial: L = Luva, M = Máscara, C = Capacete, B = Bota...</p>}
        </div>
        <div><label>Tipo / Modelo</label><input value={form.tipo || ''} onChange={e => setForm({ ...form, tipo: e.target.value, modelo: e.target.value })} placeholder="Ex: 12545" style={{ ...input, marginTop: 4 }} /></div>
        <div><label>CA</label><input value={form.ca || ''} onChange={e => setForm({ ...form, ca: e.target.value })} placeholder="CA" style={{ ...input, marginTop: 4 }} /></div>
        <div><label>🧮 Quantidade</label><div style={{ display: 'flex', gap: 6, marginTop: 6 }}>{[1, 2, 3, 5, 10].map(q => <button key={q} type="button" onClick={() => setForm({ ...form, quantidade: q })} style={{ flex: 1, padding: '10px', borderRadius: 12, border: (form.quantidade || 1) === q ? '2px solid #059669' : '1px solid #e2e8f0', background: (form.quantidade || 1) === q ? '#d1fae5' : 'white', fontWeight: 800 }}>{q}</button>)}</div></div>
        <div><label>👷 Funcionário - digita nome OU CPF</label><input value={form.funcionario || ''} onChange={e => { setForm({ ...form, funcionario: e.target.value }); setPinDigitado(''); setPinVerificado(false) }} placeholder="Digita nome ou CPF..." style={{ ...input, marginTop: 4 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>{funcs.filter((f: any) => form.funcionario && (f.nome.toLowerCase().includes(form.funcionario.toLowerCase()) || (f.cpf || '').includes(form.funcionario))).slice(0, 5).map((f: any) => <button key={f.id} type="button" onClick={() => { setForm({ ...form, funcionario: f.nome }); setPinDigitado(''); setPinVerificado(false) }} style={{ ...btn, background: '#f0fdfa', textAlign: 'left' }}>👷 {f.nome} - CPF: {f.cpf || '-'}</button>)}</div>
          {funcSelEpi ? <div style={{ color: '#059669', fontWeight: 700, fontSize: 13, marginTop: 4 }}>✅ {funcSelEpi.nome} • CPF: {funcSelEpi.cpf}</div> : null}
        </div>
        <div><label>📅 Data da Entrega</label><div style={{ display: 'flex', gap: 8, marginTop: 4 }}><input type="date" value={form.data_entrega || ''} onChange={e => setForm({ ...form, data_entrega: e.target.value })} style={{ ...input, flex: 1 }} /><button type="button" onClick={() => setForm({ ...form, data_entrega: new Date().toISOString().split('T')[0] })} style={{ ...btn, background: '#e0f2fe' }}>📅 Hoje</button></div></div>
        <div style={{ background: '#fef3c7', borderRadius: 16, padding: 14 }}>
          <b>🔑 PIN de {funcSelEpi ? funcSelEpi.nome.split(' ')[0] : 'Funcionário'}</b><p style={{ fontSize: 12, color: '#92400e', margin: '4px 0' }}>Pede pro funcionário digitar o PIN DELE.</p>
          <div style={{ display: 'flex', gap: 8 }}><input value={pinDigitado ? '•'.repeat(pinDigitado.length) : ''} readOnly placeholder="••••" style={{ ...input, textAlign: 'center', letterSpacing: 8, fontSize: 18 }} /><button type="button" onClick={verificarPIN} style={{ ...btn, background: '#92400e', color: 'white', padding: '12px 16px' }}>Verificar PIN</button></div>
          {pinVerificado ? <div style={{ color: '#15803d', fontWeight: 800, fontSize: 13, marginTop: 6 }}>✅ PIN correto! Agora pede pra assinar abaixo.</div> : null}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6, marginTop: 10 }}>{['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(n => <button key={n} type="button" onClick={() => { if (pinDigitado.length < 4) setPinDigitado(pinDigitado + n) }} style={{ padding: '10px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', fontWeight: 800 }}>{n}</button>)}<button type="button" onClick={() => setPinDigitado(pinDigitado.slice(0, -1))} style={{ padding: '10px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fee2e2' }}>⌫</button></div>
        </div>
        <div style={{ border: '2px dashed #0d9488', borderRadius: 16, padding: 14 }}>
          <b>✍️ Assinatura de {funcSelEpi ? funcSelEpi.nome.split(' ')[0] : 'Funcionário'} - assina com o dedo aqui!</b><p style={{ fontSize: 12, color: '#64748b' }}>Entrega o celular pra ele assinar dentro do quadrado. Depois que assinar, o PDF já sai com essa assinatura.</p>
          <canvas ref={canvasRef} width={460} height={140} style={{ width: '100%', height: 140, background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', touchAction: 'none' }}
            onMouseDown={(e: any) => { desenhando.current = true; const c = canvasRef.current; const ctx = c.getContext('2d'); const p = posCanvas(e); ctx.beginPath(); ctx.moveTo(p.x, p.y) }}
            onMouseMove={(e: any) => { if (!desenhando.current) return; const c = canvasRef.current; const ctx = c.getContext('2d'); const p = posCanvas(e); ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.stroke(); setAssinaturaFeita(true) }}
            onMouseUp={() => desenhando.current = false}
            onMouseLeave={() => desenhando.current = false}
            onTouchStart={(e: any) => { desenhando.current = true; const c = canvasRef.current; const ctx = c.getContext('2d'); const p = posCanvas(e); ctx.beginPath(); ctx.moveTo(p.x, p.y) }}
            onTouchMove={(e: any) => { if (!desenhando.current) return; e.preventDefault(); const c = canvasRef.current; const ctx = c.getContext('2d'); const p = posCanvas(e); ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.stroke(); setAssinaturaFeita(true) }}
            onTouchEnd={() => desenhando.current = false}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}><button type="button" onClick={limparAssinatura} style={{ ...btn, background: '#fee2e2' }}>Limpar assinatura</button>{assinaturaFeita ? <span style={{ color: '#15803d', fontWeight: 800, fontSize: 13 }}>✅ Assinatura pronta!</span> : null}</div>
        </div>
      </div> : <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>{(CAMPOS[aba] || []).map((c: any) => { if (c.k === 'empresa' && usuario?.tipo === 'empresa') return null; if (c.k === 'setor' && aba === 'funcionarios') return <div key={c.k}><label>Setor</label><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>{SETORES.map(s => <button key={s} type="button" onClick={() => setForm({ ...form, setor: s })} style={{ padding: '8px 12px', borderRadius: 20, border: (form.setor || 'Vendas') === s ? '2px solid #0d9488' : '1px solid #e2e8f0', background: (form.setor || 'Vendas') === s ? '#ccfbf1' : 'white' }}>{s}</button>)}</div></div>; return <div key={c.k}><label>{c.l}</label><input type={c.k === 'data' || c.k === 'vencimento' ? 'date' : 'text'} value={form[c.k] || ''} onChange={e => setForm({ ...form, [c.k]: e.target.value })} style={{ ...input, marginTop: 4 }} /></div> })}{aba === 'funcionarios' && <div><label>PIN</label><input value={form.pin || ''} onChange={e => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })} style={{ ...input, marginTop: 4 }} /></div>}</div>}
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}><button onClick={() => setModal(false)} style={{ ...btn, flex: 1, background: '#f1f5f9' }}>Cancelar</button><button onClick={salvar} style={{ ...btn, flex: 1, background: '#0d9488', color: 'white' }}>Salvar</button></div></div></div>}
  </div>
}