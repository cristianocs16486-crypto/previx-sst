'use client'
import { useEffect, useRef, useState } from 'react'

const CAMPOS: any = {
  funcionarios: [{k:'nome',l:'Nome'},{k:'cargo',l:'Cargo'},{k:'empresa',l:'Empresa'},{k:'cpf',l:'CPF'},{k:'telefone',l:'Telefone'}],
  epis: [{k:'nome',l:'Nome do EPI'},{k:'tipo',l:'Tipo'},{k:'quantidade',l:'Quantidade'},{k:'funcionario',l:'Funcionário'},{k:'data_entrega',l:'Data Entrega'}],
  extintores: [{k:'localizacao',l:'Localização'},{k:'tipo',l:'Tipo'},{k:'capacidade',l:'Capacidade'},{k:'vencimento',l:'Vencimento'},{k:'status',l:'Status'}],
  inspecoes: [{k:'titulo',l:'Título'},{k:'local',l:'Local'},{k:'responsavel',l:'Responsável'},{k:'data',l:'Data'},{k:'status',l:'Status'}],
  documentos: [{k:'titulo',l:'Título'},{k:'empresa',l:'Empresa'},{k:'vencimento',l:'Vencimento'}],
  exames: [{k:'nome',l:'Funcionário'},{k:'tipo',l:'Tipo Exame'},{k:'data',l:'Data'},{k:'resultado',l:'Resultado'},{k:'clinica',l:'Clínica'}],
  clinicas: [{k:'nome',l:'Nome da Clínica'},{k:'cnpj',l:'CNPJ'},{k:'telefone',l:'Telefone'},{k:'email',l:'E-mail'},{k:'endereco',l:'Endereço'},{k:'responsavel',l:'Responsável'},{k:'convenio',l:'Convênio'},{k:'status',l:'Status'}],
  empresas: [{k:'nome',l:'Nome da Empresa'},{k:'cnpj',l:'CNPJ'},{k:'responsavel',l:'Responsável'},{k:'telefone',l:'Telefone'},{k:'email',l:'E-mail da Empresa'},{k:'login',l:'Login de Acesso'},{k:'senha',l:'Senha Única'}],
}
const EPIS_PRONTOS = ['Capacete de Segurança','Capacete com Jugular','Óculos de Proteção','Óculos de Proteção Incolor','Protetor Auricular Tipo Concha','Protetor Auricular Tipo Plug','Máscara PFF2','Respirador PFF2','Luva de Vaqueta','Luva de Borracha','Luva de Raspa','Luva Nitrílica','Bota de Segurança','Botina de Segurança','Sapato de Segurança','Cinto de Segurança Paraquedista','Talabarte','Trava Quedas','Colete Refletivo','Uniforme / Fardamento','Capa de Chuva','Protetor Solar','Creme de Proteção','Avental de Raspa','Perneira de Raspa','Mangote','Abafador de Ruído']
const PASTAS = [{ id:'PGR', nome:'PGR', icone:'📁', cor:'#0d9488' },{ id:'PCMSO', nome:'PCMSO', icone:'📁', cor:'#2563eb' },{ id:'ASO', nome:'ASO / Exames', icone:'🩺', cor:'#22c55e' },{ id:'Laudos', nome:'Laudos', icone:'📋', cor:'#f59e0b' },{ id:'Treinamentos', nome:'Treinamentos', icone:'🎓', cor:'#8b5cf6' },{ id:'Outros', nome:'Outros', icone:'📦', cor:'#64748b' },]
const CORES_CARDS: any = { funcionarios: 'linear-gradient(135deg,#14b8a6,#06b6d4)', epis: 'linear-gradient(135deg,#22c55e,#84cc16)', extintores: 'linear-gradient(135deg,#3b82f6,#06b6d4)', inspecoes: 'linear-gradient(135deg,#10b981,#14b8a6)', documentos: 'linear-gradient(135deg,#2563eb,#22d3ee)', }
const TIPOS_EXAME = [
  { nome:'Admissional', desc:'Exame de admissão', tag:'Obrigatório', cor:'#0d9488' },
  { nome:'Periódico', desc:'Acompanhamento anual', tag:'Obrigatório', cor:'#0d9488' },
  { nome:'Demissional', desc:'Exame de desligamento', tag:'Opcional', cor:'#64748b' },
  { nome:'Audiometria', desc:'🦻 Avaliação auditiva', tag:'', cor:'' },
  { nome:'Espirometria', desc:'🫁 Capacidade pulmonar', tag:'', cor:'' },
  { nome:'Raio-X', desc:'🩻 Tórax PA', tag:'', cor:'' },
  { nome:'Exame de Sangue', desc:'🩸 Hemograma completo', tag:'', cor:'' },
  { nome:'Eletrocardiograma', desc:'💓 ECG de repouso', tag:'', cor:'' },
  { nome:'Retorno ao Trabalho', desc:'Após afastamento', tag:'', cor:'' },
  { nome:'Mudança de Função', desc:'Troca de cargo / risco', tag:'', cor:'' },
  { nome:'Acuidade Visual', desc:'👁️ Visão', tag:'', cor:'' },
  { nome:'Exame Clínico', desc:'Consulta médica', tag:'', cor:'' },
]
function gerarSenhaForte() { const letras='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'; const nums='23456789'; const simb='@!#'; let s=''; for(let i=0;i<4;i++) s+=letras[Math.floor(Math.random()*letras.length)]; for(let i=0;i<3;i++) s+=nums[Math.floor(Math.random()*nums.length)]; s+=simb[Math.floor(Math.random()*simb.length)]; return 'Previx'+s }
function gerarPIN() { return Math.floor(1000 + Math.random()*9000).toString() }
const ADMIN = { login: 'cristiano', senha: 'previx123', nome: 'Cristiano', tipo: 'admin', empresa: 'Todas' }
function limparDataExame(v:any) { if (!v) return ''; v=String(v).trim(); if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v; const m=v.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`; if (v.includes('T')) return v.split('T')[0]; try { const d=new Date(v); if (!isNaN(d.getTime())) return d.toISOString().split('T')[0] } catch {}; return '' }
function formatarDataExame(v:any) { const l=limparDataExame(v); if (!l) return '-'; return l.split('-').reverse().join('/') }

export default function Home() {
  const [dados, setDados] = useState<any>({ funcionarios: [], epis: [], extintores: [], inspecoes: [], documentos: [], exames: [], empresas: [], clinicas: [] })
  const [aba, setAba] = useState('inicio')
  const [modal, setModal] = useState(false)
  const [modalClinica, setModalClinica] = useState(false)
  const [editando, setEditando] = useState<any>(null)
  const [editandoClinica, setEditandoClinica] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [formClinica, setFormClinica] = useState<any>({ status:'Ativa', convenio:'Vigente' })
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
  const [buscaEPI, setBuscaEPI] = useState('')
  const [buscaFunc, setBuscaFunc] = useState('')
  const [mostrarSugestoesFunc, setMostrarSugestoesFunc] = useState(false)
  const [pinDigitado, setPinDigitado] = useState('')
  const [pinErro, setPinErro] = useState('')
  const [funcSelecionado, setFuncSelecionado] = useState<any>(null)
  const [verPIN, setVerPIN] = useState(false)
  const [pinCopiado, setPinCopiado] = useState('')
  const canvasRef = useRef<any>(null)
  const [desenhando, setDesenhando] = useState(false)
  const [assinatura, setAssinatura] = useState('')
  const [temAssinatura, setTemAssinatura] = useState(false)
  const [digitalOk, setDigitalOk] = useState(false)
  const [digitalMsg, setDigitalMsg] = useState('')
  const [digitalCarregando, setDigitalCarregando] = useState(false)
  const [mesCalendario, setMesCalendario] = useState(new Date())
  const [diaSelecionado, setDiaSelecionado] = useState(new Date().toISOString().split('T')[0])
  const [filtroExame, setFiltroExame] = useState('todos')
  // NOVO - AGENDAMENTO ESTILO FOTO
  const [clinicaSelecionada, setClinicaSelecionada] = useState('Sol Nascente')
  const [tiposSelecionados, setTiposSelecionados] = useState<string[]>(['Periódico'])
  const [funcAgendamento, setFuncAgendamento] = useState<any>(null)
  const [buscaFuncAgendamento, setBuscaFuncAgendamento] = useState('')

  useEffect(() => { const sess = localStorage.getItem('previx_session'); if (sess) { try { setUsuario(JSON.parse(sess)) } catch {} } carregar(); setCarregando(false) }, [])
  async function carregar() {
    const urls = ['funcionarios','epis','extintores','inspecoes','documentos','exames','empresas','clinicas']
    const res: any = {}
    for (const u of urls) { try { const r = await fetch(`/api/${u}`); const j = await r.json(); res[u] = Array.isArray(j) ? j : j.data || [] } catch { res[u] = [] } }
    try {
      const localEmp = JSON.parse(localStorage.getItem('previx_empresas')||'[]')
      if (localEmp.length) res.empresas = localEmp
      if (!localEmp.find((e:any)=>e.login==='solnascente')) { const sol = { id: 'sol1', nome: 'Solnascente LTDA', cnpj: '', responsavel: 'Ronaldo', telefone: '82994145622', email: 'Lojas.cs16486@gmail.com', login: 'solnascente', senha: '12345678', status: 'Ativa' }; if (!res.empresas.find((e:any)=>e.login==='solnascente')) res.empresas.push(sol); localStorage.setItem('previx_empresas', JSON.stringify(res.empresas)) }
    } catch {}
    try {
      const localDados = JSON.parse(localStorage.getItem('previx_dados')||'{}')
      if (localDados.funcionarios) res.funcionarios = localDados.funcionarios
      if (localDados.documentos) res.documentos = localDados.documentos.map((d:any)=>({...d, pasta: d.pasta || d.tipo || 'Outros', tipo: d.pasta || d.tipo || 'Outros'}))
      if (localDados.empresas) res.empresas = localDados.empresas
      if (localDados.epis) res.epis = localDados.epis
      if (localDados.exames) res.exames = localDados.exames
      if (localDados.clinicas) res.clinicas = localDados.clinicas
    } catch {}
    if (!res.clinicas || res.clinicas.length===0) {
      res.clinicas = [{ id:'clin1', nome:'Sol Nascente', cnpj:'', telefone:'(82) 99999-0000', email:'', endereco:'Maceió - AL', responsavel:'', convenio:'Vigente', status:'Ativa', empresa: usuario?.empresa || '' }]
    }
    if (res.funcionarios) { let mudou=false; res.funcionarios = res.funcionarios.map((f:any)=>{ if (!f.pin) { mudou=true; return {...f, pin: gerarPIN()} } return f }); if (mudou) { try { const ld = JSON.parse(localStorage.getItem('previx_dados')||'{}'); ld.funcionarios = res.funcionarios; localStorage.setItem('previx_dados', JSON.stringify(ld)) } catch {} } }
    if (res.exames) { res.exames = res.exames.map((e:any)=>{ const dataLimpa = limparDataExame(e.data); return { ...e, data: dataLimpa || e.data, nome: e.nome || e.funcionario || e.titulo || 'Registro' } }) }
    setDados(res)
    if (res.clinicas?.[0]) setClinicaSelecionada(res.clinicas[0].nome)
  }
  function salvarNoNavegador(novosDados:any) { try { localStorage.setItem('previx_empresas', JSON.stringify(novosDados.empresas||[])); localStorage.setItem('previx_dados', JSON.stringify(novosDados)) } catch(e) { alert('⚠️ Arquivo muito grande! Tenta um PDF menor que 4MB.') } }
  function limparExamesComErro() { const ruins = (dados.exames||[]).filter((e:any)=> (e.nome==='Registro' || !e.nome || !limparDataExame(e.data))); if (ruins.length===0) { alert('✅ Nenhum exame com erro!'); return }; if (!confirm(`Apagar ${ruins.length} exame(s) com erro?`)) return; const bons = (dados.exames||[]).filter((e:any)=> !(e.nome==='Registro' || !e.nome || !limparDataExame(e.data))); const nd = {...dados, exames: bons}; setDados(nd); salvarNoNavegador(nd); alert(`✅ Pronto! Apaguei ${ruins.length} com erro.`) }

  // ===== CLINICAS =====
  function abrirNovaClinica() { setEditandoClinica(null); setFormClinica({ status:'Ativa', convenio:'Vigente', empresa: usuario?.tipo==='empresa' ? usuario.empresa : '' }); setModalClinica(true) }
  function abrirEditarClinica(c:any) { setEditandoClinica(c); setFormClinica(c); setModalClinica(true) }
  function salvarClinica() {
    if (!formClinica.nome) { alert('⚠️ Coloca o nome da clínica!'); return }
    const lista = [...(dados.clinicas||[])]
    if (editandoClinica) { const idx = lista.findIndex((x:any)=>(x.id||x._id)===(editandoClinica.id||editandoClinica._id)); if (idx>=0) lista[idx]={...lista[idx], ...formClinica} }
    else { lista.push({...formClinica, id: Date.now().toString()}) }
    const nd={...dados, clinicas: lista}; setDados(nd); salvarNoNavegador(nd); setClinicaSelecionada(formClinica.nome); setModalClinica(false); alert(`✅ Clínica ${formClinica.nome} salva!`)
  }
  function excluirClinica(c:any) { if (!confirm(`Excluir clínica ${c.nome}?`)) return; const nd={...dados, clinicas:(dados.clinicas||[]).filter((x:any)=>(x.id||x._id)!==(c.id||c._id))}; setDados(nd); salvarNoNavegador(nd) }

  // ===== AGENDAMENTO ESTILO FOTO - Calendário + Tipos =====
  function toggleTipoExame(nome:string) { setTiposSelecionados(prev => prev.includes(nome) ? prev.filter(t=>t!==nome) : [...prev, nome]) }
  function confirmarAgendamentoFoto() {
    if (!funcAgendamento) { alert('⚠️ Primeiro escolhe o funcionário! Digita o nome dele ali em cima do painel direito.'); return }
    if (!diaSelecionado) { alert('⚠️ Clica num dia do calendário!'); return }
    if (tiposSelecionados.length===0) { alert('⚠️ Marca pelo menos 1 tipo de exame!'); return }
    const clinicaObj = (dados.clinicas||[]).find((c:any)=>c.nome===clinicaSelecionada)
    const novos = tiposSelecionados.map(t => ({ id: Date.now().toString() + Math.random().toString().slice(2,6), nome: funcAgendamento.nome, funcionario: funcAgendamento.nome, tipo: t, data: diaSelecionado, resultado: 'Aguardando', clinica: clinicaSelecionada, empresa: funcAgendamento.empresa || usuario?.empresa || '', status:'Agendado' }))
    const nd = {...dados, exames: [...(dados.exames||[]), ...novos]}; setDados(nd); salvarNoNavegador(nd)
    alert(`✅ Agendado!\n\n👷 ${funcAgendamento.nome}\n🏥 ${clinicaSelecionada}\n📅 ${formatarDataExame(diaSelecionado)}\n🩺 ${tiposSelecionados.join(', ')}`)
    setTiposSelecionados([]); setFuncAgendamento(null); setBuscaFuncAgendamento('')
  }

  function celularTemDigital() { return typeof window !== 'undefined' && !!window.PublicKeyCredential }
  function bufParaBase64(buf:any) { let s=''; const bytes=new Uint8Array(buf); for(let i=0;i<bytes.length;i++) s+=String.fromCharCode(bytes[i]); return btoa(s) }
  function base64ParaBuf(b64:string) { const s=atob(b64); const bytes=new Uint8Array(s.length); for(let i=0;i<s.length;i++) bytes[i]=s.charCodeAt(i); return bytes.buffer }
  async function confirmarComDigital() {
    if (!funcSelecionado) { setDigitalMsg('⚠️ Primeiro escolhe o funcionário!'); return }
    if (!celularTemDigital()) { setDigitalMsg('❌ Esse aparelho não tem digital / Face ID. Usa PIN ou assinatura.'); return }
    setDigitalCarregando(true); setDigitalMsg('👆 Encosta o dedo / mostra o rosto agora...')
    try {
      const chaveFunc = (funcSelecionado.cpf || funcSelecionado.nome || '').toString()
      const salvas: any = JSON.parse(localStorage.getItem('previx_digital') || '{}')
      const idSalvo = salvas[chaveFunc]
      const challenge = new Uint8Array(32); window.crypto.getRandomValues(challenge)
      if (idSalvo) { try { const cred: any = await navigator.credentials.get({ publicKey: { challenge, timeout: 60000, userVerification: 'required', allowCredentials: [{ id: base64ParaBuf(idSalvo), type: 'public-key', transports: ['internal'] }] } } as any); if (cred) { setDigitalOk(true); setDigitalMsg('✅ Digital confirmada! Pode salvar sem PIN e sem assinatura.'); setPinErro(''); setDigitalCarregando(false); return } } catch (e:any) { console.log('Falhou ler, vai criar nova', e) } }
      setDigitalMsg('👆 Primeira vez! Vai aparecer pra criar a chave. Encosta o dedo...')
      const userId = new TextEncoder().encode(chaveFunc.slice(0, 32))
      const nova: any = await navigator.credentials.create({ publicKey: { challenge, rp: { name: 'PREVIX SST', id: window.location.hostname }, user: { id: userId, name: funcSelecionado.nome || 'funcionario', displayName: funcSelecionado.nome || 'Funcionario' }, pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }], authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', requireResidentKey: true }, timeout: 60000, attestation: 'none' } } as any)
      if (nova) { salvas[chaveFunc] = bufParaBase64(nova.rawId); localStorage.setItem('previx_digital', JSON.stringify(salvas)); setDigitalOk(true); setDigitalMsg('✅ Digital cadastrada e confirmada! Da próxima vez já vai direto.'); setPinErro('') } else { setDigitalMsg('❌ Não confirmou. Tenta de novo.') }
    } catch (err: any) { if (err?.name === 'NotAllowedError') setDigitalMsg('❌ Cancelado / tempo acabou. Tenta de novo ou usa PIN / assinatura.'); else if (err?.name === 'NotSupportedError') setDigitalMsg('❌ Aparelho sem biometria. Usa PIN ou assinatura.'); else if (err?.name === 'InvalidStateError') setDigitalMsg('⚠️ Essa digital já tá cadastrada. Tenta de novo.'); else setDigitalMsg('❌ Não deu pra ler a digital. Tenta de novo ou usa PIN / assinatura.') }
    setDigitalCarregando(false)
  }
  function iniciarAssinatura(e:any) { const canvas = canvasRef.current; if (!canvas) return; const rect = canvas.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top; const ctx = canvas.getContext('2d'); ctx.beginPath(); ctx.moveTo(x,y); ctx.lineWidth = 2.5; ctx.strokeStyle = '#0f172a'; ctx.lineCap = 'round'; setDesenhando(true) }
  function desenharAssinatura(e:any) { if (!desenhando) return; const canvas = canvasRef.current; const rect = canvas.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top; const ctx = canvas.getContext('2d'); ctx.lineTo(x,y); ctx.stroke(); setTemAssinatura(true) }
  function terminarAssinatura() { if (!desenhando) return; setDesenhando(false); const canvas = canvasRef.current; if (canvas) setAssinatura(canvas.toDataURL('image/png')) }
  function limparAssinatura() { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height); setAssinatura(''); setTemAssinatura(false) }
  function gerarTermoPDF(entrega:any) {
    const func = (dados.funcionarios||[]).find((f:any)=>f.nome===entrega.funcionario) || {}
    const empresaNome = entrega.empresa || func.empresa || usuario?.empresa || 'PREVIX SST'
    const dataFmt = entrega.data_entrega ? entrega.data_entrega.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR')
    const hojeFmt = new Date().toLocaleDateString('pt-BR')
    const assinaturaImg = entrega.assinatura || assinatura || ''
    const metodo = entrega.metodo || (entrega.assinatura ? 'Assinatura' : entrega.pinConfirmado ? 'PIN / Digital' : 'PIN')
    const html = `<html><head><meta charset="utf-8"><title>Termo - ${entrega.funcionario}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#0f172a;max-width:800px;margin:0 auto}.topo{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0d9488;padding-bottom:16px}.logo{font-size:28px;font-weight:900}.logo span{color:#0d9488}.sub{font-size:11px;letter-spacing:2px;color:#0d9488;font-weight:800}h1{text-align:center;font-size:20px;margin:28px 0 8px;text-transform:uppercase}.caixa{border:1px solid #cbd5e1;border-radius:12px;padding:16px;margin:12px 0}.linha{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #e2e8f0;font-size:14px}.termo{font-size:14px;line-height:1.7;text-align:justify;margin:20px 0}.assinatura{margin-top:40px;text-align:center}.assinatura img{max-width:280px;max-height:100px}.linha-ass{border-top:1px solid #0f172a;width:320px;margin:8px auto 4px}.rodape{margin-top:30px;border-top:1px solid #e2e8f0;padding-top:12px;font-size:11px;color:#64748b;text-align:center}.selo{display:inline-block;background:#dcfce7;color:#15803d;padding:6px 14px;border-radius:20px;font-weight:800;font-size:12px}@media print{button{display:none}}</style></head><body><div class="topo"><div><div class="logo">PREVIX <span>SST</span></div><div class="sub">PREVENÇÃO QUE PROTEGE</div></div><div style="text-align:right;font-size:12px;color:#64748b">Termo de Entrega de EPI<br><b>Nº ${entrega.id?.toString().slice(-6) || '000001'}</b></div></div><h1>Termo de Entrega de Equipamento de Proteção Individual</h1><div style="text-align:center"><span class="selo">✅ ENTREGA CONFIRMADA • MÉTODO: ${metodo.toUpperCase()}</span></div><div class="caixa"><div class="linha"><b>🏢 Empresa:</b><span>${empresaNome}</span></div><div class="linha"><b>👷 Funcionário:</b><span>${entrega.funcionario || '-'}</span></div><div class="linha"><b>📄 CPF:</b><span>${func.cpf || entrega.funcionarioCpf || '-'}</span></div></div><div class="caixa"><div class="linha"><b>🦺 EPI:</b><span>${entrega.nome || '-'}</span></div><div class="linha"><b>📦 Tipo:</b><span>${entrega.tipo || '-'}</span></div><div class="linha"><b>🔢 Qtd:</b><span>${entrega.quantidade || '1'}</span></div><div class="linha"><b>📅 Data:</b><span>${dataFmt}</span></div></div><p class="termo">Declaro que recebi nesta data o EPI acima descrito, em perfeito estado, comprometendo-me a utilizá-lo apenas para a finalidade a que se destina.</p><div class="assinatura">${assinaturaImg ? `<img src="${assinaturaImg}" />` : `<div style="height:60px"></div>`}<div class="linha-ass"></div><div style="font-weight:800">${entrega.funcionario || ''}</div></div><div class="rodape">PREVIX - Prevenção que Protege • Data: ${hojeFmt}</div><div style="text-align:center;margin-top:20px"><button onclick="window.print()" style="background:#0d9488;color:white;border:none;padding:14px 28px;border-radius:20px;font-weight:800;cursor:pointer">🖨️ Imprimir / Salvar como PDF</button></div></body></html>`
    const w = window.open('', '_blank'); if (w) { w.document.write(html); w.document.close() } else { alert('Libera o pop-up!') }
  }
  function handleArquivo(e:any) { const file = e.target.files?.[0]; if (!file) return; if (file.size > 4*1024*1024) { alert('⚠️ Máximo 4MB'); return }; setSubindoArquivo(true); setArquivoNome(file.name); const reader = new FileReader(); reader.onload = () => { setForm((prev:any)=>({...prev, arquivoNome: file.name, arquivoTipo: file.type || 'application/pdf', arquivoTamanho: file.size, arquivoData: reader.result, titulo: prev.titulo || file.name.replace('.pdf','').replace(/_/g,' ') })); setSubindoArquivo(false) }; reader.readAsDataURL(file) }
  function baixarArquivo(item:any) { if (!item.arquivoData) { alert('Sem arquivo.'); return }; const a = document.createElement('a'); a.href = item.arquivoData; a.download = item.arquivoNome || `${item.titulo || 'documento'}.pdf`; a.click() }
  function verArquivo(item:any) { if (!item.arquivoData) { alert('Sem arquivo.'); return }; const w = window.open(); if (w) { w.document.write(`<iframe src="${item.arquivoData}" style="width:100%;height:100vh;border:none"></iframe>`) } else baixarArquivo(item) }
  function moverPasta(item:any, novaPasta:string) { const lista = [...(dados.documentos||[])]; const idx = lista.findIndex((x:any)=>(x.id||x._id)===(item.id||item._id)); if (idx>=0) { lista[idx] = {...lista[idx], pasta: novaPasta, tipo: novaPasta}; const nd={...dados, documentos: lista}; setDados(nd); salvarNoNavegador(nd) } }
  function fazerLogin() { setErroLogin(''); const login = loginForm.login.trim().toLowerCase(); const senha = loginForm.senha.trim(); if (login === ADMIN.login && senha === ADMIN.senha) { setUsuario(ADMIN); localStorage.setItem('previx_session', JSON.stringify(ADMIN)); setAba('inicio'); return }; if (login === 'admin' && senha === 'admin') { setUsuario(ADMIN); localStorage.setItem('previx_session', JSON.stringify(ADMIN)); setAba('inicio'); return }; const emp = (dados.empresas||[]).find((e:any)=> (e.login||'').toLowerCase() === login && (e.senha||'') === senha); if (emp) { const u = { login: emp.login, senha: emp.senha, nome: emp.responsavel || emp.nome, tipo: 'empresa', empresa: emp.nome, empresaId: emp.id }; setUsuario(u); localStorage.setItem('previx_session', JSON.stringify(u)); setAba('inicio'); return }; setErroLogin('Login ou senha incorretos!') }
  function sair() { setUsuario(null); localStorage.removeItem('previx_session'); setLoginForm({login:'',senha:''}); setAba('inicio'); setPastaAtual('Todas') }
  function abrirNovo() {
    setEditando(null); setArquivoNome(''); setPastaSelecionadaForm(pastaAtual!=='Todas' ? pastaAtual : 'PGR'); setBuscaEPI(''); setBuscaFunc(''); setMostrarSugestoesFunc(false); setPinDigitado(''); setPinErro(''); setFuncSelecionado(null); setVerPIN(false); setAssinatura(''); setTemAssinatura(false); setDigitalOk(false); setDigitalMsg(''); setDigitalCarregando(false)
    if (aba === 'empresas') setForm({ senha: gerarSenhaForte(), status: 'Ativa', plano: 'Mensal' })
    else if (aba === 'funcionarios') { const pinNovo = gerarPIN(); if (usuario?.tipo === 'empresa') setForm({ empresa: usuario.empresa, pin: pinNovo }); else setForm({ pin: pinNovo }) }
    else if (aba === 'epis') { const hoje = new Date().toISOString().split('T')[0]; if (usuario?.tipo === 'empresa') setForm({ empresa: usuario.empresa, data_entrega: hoje, quantidade: '1' }); else setForm({ data_entrega: hoje, quantidade: '1' }) }
    else if (aba === 'exames') { setForm({ data: diaSelecionado, tipo: 'Periódico', resultado: 'Aguardando', clinica: clinicaSelecionada, empresa: usuario?.tipo==='empresa' ? usuario.empresa : '' }); setBuscaFunc('') }
    else if (aba === 'clinicas') setForm({ status:'Ativa', convenio:'Vigente' })
    else if (usuario?.tipo === 'empresa') setForm({ empresa: usuario.empresa, pasta: pastaAtual!=='Todas' ? pastaAtual : 'PGR', tipo: pastaAtual!=='Todas' ? pastaAtual : 'PGR' })
    else setForm({ pasta: pastaAtual!=='Todas' ? pastaAtual : 'PGR', tipo: pastaAtual!=='Todas' ? pastaAtual : 'PGR', empresa: '' })
    setVerSenha(false); setModal(true); setTimeout(()=>{ const c = canvasRef.current; if (c) { const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height) } }, 100)
  }
  function abrirEditar(item:any) {
    setEditando(item); setForm({ ...item, data: limparDataExame(item.data) || item.data, nome: item.nome && item.nome!=='Registro' ? item.nome : '' }); setArquivoNome(item.arquivoNome||''); setPastaSelecionadaForm(item.pasta||item.tipo||'Outros'); setBuscaEPI(item.nome||''); setBuscaFunc(item.funcionario||item.nome||''); setPinDigitado(''); setPinErro('')
    const f = (dados.funcionarios||[]).find((x:any)=>x.nome===item.funcionario); setFuncSelecionado(f||null); setAssinatura(item.assinatura||''); setTemAssinatura(!!item.assinatura); setDigitalOk(item.metodo==='Digital'); setDigitalMsg(item.metodo==='Digital' ? '✅ Digital já confirmada' : ''); setVerSenha(false); setModal(true)
    setTimeout(()=>{ if (item.assinatura) { const c = canvasRef.current; if (c) { const img = new Image(); img.onload=()=>{ const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height); ctx.drawImage(img,0,0,c.width,c.height) }; img.src=item.assinatura } } }, 200)
  }
  function copiar(texto:string, id:string) { navigator.clipboard.writeText(texto); setSenhaCopiada(id); setTimeout(()=>setSenhaCopiada(''), 2000) }
  function copiarPIN(pin:string, nome:string) { navigator.clipboard.writeText(`Olá ${nome}! Seu PIN de entrega de EPI no PREVIX é: ${pin}. Não passa pra ninguém!`); setPinCopiado(nome); setTimeout(()=>setPinCopiado(''), 2000) }
  async function salvar() {
    if (!aba || aba==='inicio') return
    let formFinal = {...form}
    if (aba==='funcionarios') { if (!formFinal.pin) formFinal.pin = gerarPIN(); if (!formFinal.nome) { alert('⚠️ Coloca o nome!'); return } }
    if (aba==='clinicas') { if (!formFinal.nome) { alert('⚠️ Coloca o nome da clínica!'); return } }
    if (aba==='exames') { if (!formFinal.nome) { alert('⚠️ Escolhe o funcionário!'); return }; formFinal.data = limparDataExame(formFinal.data) || new Date().toISOString().split('T')[0]; if (!formFinal.tipo) formFinal.tipo = 'Periódico'; formFinal.funcionario = formFinal.nome; if (!formFinal.clinica) formFinal.clinica = clinicaSelecionada }
    if (aba==='epis') {
      if (!formFinal.nome) { alert('⚠️ Escolhe o EPI!'); return }; if (!formFinal.funcionario) { alert('⚠️ Escolhe o funcionário!'); return }; if (!formFinal.data_entrega) formFinal.data_entrega = new Date().toISOString().split('T')[0]
      if (!editando) { const funcReal = (dados.funcionarios||[]).find((f:any)=> f.nome === formFinal.funcionario) || funcSelecionado; const pinOk = !funcReal?.pin || (pinDigitado && pinDigitado === funcReal.pin); const assinaturaOk = temAssinatura || !!assinatura; const digitalOkFinal = digitalOk; if (funcReal?.pin && pinDigitado && pinDigitado !== funcReal.pin && !assinaturaOk && !digitalOkFinal) { setPinErro('❌ PIN incorreto!'); return }; if (!pinOk && !assinaturaOk && !digitalOkFinal) { setPinErro('⚠️ Digita o PIN OU pede pra assinar OU usa a digital!'); return }; formFinal.assinatura = assinatura || formFinal.assinatura || ''; formFinal.pinConfirmado = true; if (digitalOkFinal) formFinal.metodo = 'Digital'; else if (assinaturaOk) formFinal.metodo = 'Assinatura'; else formFinal.metodo = 'PIN'; formFinal.entregueParaCpf = funcReal?.cpf || '' } else { if (assinatura) formFinal.assinatura = assinatura; if (digitalOk) formFinal.metodo = 'Digital' }
    }
    if (aba==='documentos') { formFinal.pasta = pastaSelecionadaForm || formFinal.pasta || 'Outros'; formFinal.tipo = formFinal.pasta; if (!formFinal.titulo) { alert('⚠️ Coloca o título!'); return }; if (usuario?.tipo === 'admin' && !formFinal.empresa) { const empEscolhida = prompt('Qual empresa é dona desse arquivo? Ex: Solnascente LTDA'); if (empEscolhida) formFinal.empresa = empEscolhida; else formFinal.empresa = 'GERAL - Só Admin' }; if (usuario?.tipo === 'empresa') formFinal.empresa = usuario.empresa }
    if (aba==='empresas') { if (!formFinal.login && formFinal.nome) formFinal.login = formFinal.nome.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,12); if (!formFinal.senha) formFinal.senha = gerarSenhaForte() }
    if (usuario?.tipo==='empresa') formFinal.empresa = usuario.empresa
    const lista = [...(dados[aba]||[])]
    if (editando) { const id = editando.id || editando._id; const idx = lista.findIndex((x:any)=>(x.id||x._id)===id); if (idx>=0) lista[idx] = {...lista[idx], ...formFinal}; const nd = {...dados, [aba]: lista}; setDados(nd); salvarNoNavegador(nd); if (aba==='epis') { if (confirm('✅ Entrega atualizada! Quer gerar o PDF agora?')) gerarTermoPDF({...lista[idx]}) } }
    else { const novo = { ...formFinal, id: Date.now().toString(), status: formFinal.status || 'Ativa' }; lista.push(novo); const nd = {...dados, [aba]: lista}; setDados(nd); salvarNoNavegador(nd); if (aba==='empresas') alert(`✅ Empresa criada!\n\nLogin: ${novo.login}\nSenha: ${novo.senha}`); if (aba==='documentos') alert(`✅ Salvo na pasta ${novo.pasta}!`); if (aba==='funcionarios') alert(`✅ Funcionário cadastrado!\n\n👷 ${novo.nome}\n🔑 PIN dele: ${novo.pin}`); if (aba==='clinicas') alert(`✅ Clínica ${novo.nome} cadastrada!`); if (aba==='exames') alert(`✅ Exame agendado!\n\n👷 ${novo.nome}\n🩺 ${novo.tipo}\n📅 ${formatarDataExame(novo.data)}\n🏥 ${novo.clinica}`); if (aba==='epis') { const querPDF = confirm(`✅ Entrega CONFIRMADA com ${novo.metodo || 'PIN'}!`); if (querPDF) gerarTermoPDF(novo) } }
    setModal(false); setForm({}); setEditando(null); setArquivoNome(''); setBuscaEPI(''); setBuscaFunc(''); setPinDigitado(''); setFuncSelecionado(null); setAssinatura(''); setTemAssinatura(false); setDigitalOk(false); setDigitalMsg('')
  }
  async function excluir(item:any) { if (!confirm(`Excluir ${item.nome || item.titulo || 'esse registro'}?`)) return; const id = item.id || item._id; try { await fetch(`/api/${aba}/${id}`, { method:'DELETE' }) } catch {}; const novaLista = (dados[aba]||[]).filter((x:any)=>(x.id||x._id)!==id); const nd = {...dados, [aba]: novaLista}; setDados(nd); salvarNoNavegador(nd) }
  function dadosFiltradosPorEmpresa(lista:any[]) { if (!usuario) return []; if (usuario.tipo === 'admin') return lista; return lista.filter((it:any)=>{ if (!it.empresa) return false; const empItem = it.empresa.toLowerCase(); const empUser = usuario.empresa.toLowerCase(); if (empItem.includes('geral')) return false; if (empItem === empUser) return true; if (empItem.includes(empUser.split(' ')[0].toLowerCase()) && empUser.split(' ')[0].length > 3) return true; if (empUser.includes(empItem.split(' ')[0].toLowerCase()) && empItem.split(' ')[0].length > 3) return true; return false }) }
  function iniciais(nome:string) { if (!nome) return '??'; const p = nome.split(' ').filter(Boolean); if (p.length===1) return p[0].slice(0,2).toUpperCase(); return (p[0][0]+p[1][0]).toUpperCase() }
  function hojeISO() { return new Date().toISOString().split('T')[0] }
  function statusExame(dataStr:string) { const d = limparDataExame(dataStr); if (!d) return 'sem-data'; const hoje = hojeISO(); if (d === hoje) return 'hoje'; if (d < hoje) return 'vencido'; const diff = (new Date(d).getTime() - new Date(hoje).getTime()) / (1000*60*60*24); if (diff <= 7) return 'proximo'; return 'futuro' }
  const btn = { padding:'8px 14px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:700, fontSize:13 } as any
  const input = { width:'100%', padding:'12px', borderRadius:12, border:'1px solid #cbd5e1', fontSize:14, boxSizing:'border-box' as any }
  if (carregando) return <div style={{padding:40, textAlign:'center'}}>Carregando PREVIX...</div>
  if (!usuario) { return (<div style={{minHeight:'100vh', background:'linear-gradient(135deg,#0d9488,#2563eb)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, fontFamily:'Arial, sans-serif'}}><div style={{background:'white', borderRadius:24, padding:32, width:'100%', maxWidth:420, boxShadow:'0 20px 50px rgba(0,0,0,0.3)'}}><div style={{textAlign:'center'}}><img src="/logo.png" alt="PREVIX" style={{width:80,height:80,objectFit:'contain',background:'white',borderRadius:16,padding:8, border:'1px solid #e2e8f0'}} /><h1 style={{fontSize:32, fontWeight:900, margin:'12px 0 0', letterSpacing:1, color:'#0f172a'}}>PREVIX</h1><p style={{color:'#0d9488', fontWeight:800, fontSize:11, letterSpacing:2, margin:'4px 0 0'}}>PREVENÇÃO QUE PROTEGE</p><p style={{color:'#64748b', marginTop:16}}>Acesse seu painel SST</p></div><div style={{display:'flex', flexDirection:'column', gap:12, marginTop:20}}><div><label style={{fontSize:13, fontWeight:700}}>👤 Login</label><input value={loginForm.login} onChange={e=>setLoginForm({...loginForm, login:e.target.value})} placeholder="Ex: solnascente" style={{...input, marginTop:4}} /></div><div><label style={{fontSize:13, fontWeight:700}}>🔐 Senha</label><input type="password" value={loginForm.senha} onChange={e=>setLoginForm({...loginForm, senha:e.target.value})} onKeyDown={e=>{if(e.key==='Enter') fazerLogin()}} placeholder="Sua senha única" style={{...input, marginTop:4}} /></div>{erroLogin && <div style={{background:'#fee2e2', color:'#b91c1c', padding:10, borderRadius:10, fontSize:13, fontWeight:700}}>{erroLogin}</div>}<button onClick={fazerLogin} style={{...btn, background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:14, fontSize:15, borderRadius:12}}>Entrar →</button></div></div></div>) }
  const isAdmin = usuario.tipo === 'admin'
  const menuBase = [{id:'inicio',label:'Início',icone:'🏠'},{id:'funcionarios',label:'Funcionários',icone:'👷'},{id:'epis',label:"EPI's",icone:'🦺'},{id:'extintores',label:'Extintores',icone:'🧯'},{id:'inspecoes',label:'Inspeções',icone:'📋'},{id:'documentos',label:'Documentos',icone:'📄'},{id:'exames',label:'Exames',icone:'🩺'},{id:'clinicas',label:'Clínicas',icone:'🏥'}]
  const menu = isAdmin ? [...menuBase, {id:'empresas',label:'Empresas',icone:'🏢'}] : menuBase
  const funcs = dadosFiltradosPorEmpresa(dados.funcionarios||[])
  const episF = dadosFiltradosPorEmpresa(dados.epis||[])
  const extF = dadosFiltradosPorEmpresa(dados.extintores||[])
  const inspF = dadosFiltradosPorEmpresa(dados.inspecoes||[])
  const docF = dadosFiltradosPorEmpresa(dados.documentos||[])
  const examesF = dadosFiltradosPorEmpresa(dados.exames||[])
  const clinicasF = dadosFiltradosPorEmpresa(dados.clinicas||[])
  const clinicaAtual = (dados.clinicas||[]).find((c:any)=>c.nome===clinicaSelecionada) || (dados.clinicas||[])[0] || { nome:'Sol Nascente', status:'Ativa', convenio:'Vigente' }
  const docsComArquivo = docF.filter((d:any)=>d.arquivoData).length
  const contarPasta = (p:string) => docF.filter((d:any)=>(d.pasta||d.tipo||'Outros')===p).length
  const episJaUsados = Array.from(new Set((dados.epis||[]).map((e:any)=>e.nome).filter(Boolean)))
  const todosEPIs = Array.from(new Set([...EPIS_PRONTOS, ...episJaUsados]))
  const episFiltrados = todosEPIs.filter((e:any)=> e.toLowerCase().includes(buscaEPI.toLowerCase())).slice(0,8)
  const funcsParaBusca = (dados.funcionarios||[]).filter((f:any)=>{ if (usuario?.tipo==='empresa') { if (!f.empresa) return true; return f.empresa.toLowerCase().includes(usuario.empresa.toLowerCase().split(' ')[0].toLowerCase()) } return true })
  const funcsFiltrados = funcsParaBusca.filter((f:any)=>{ if (!buscaFunc) return true; const termo = buscaFunc.toLowerCase(); return (f.nome||'').toLowerCase().includes(termo) || (f.cpf||'').replace(/\D/g,'').includes(termo.replace(/\D/g,'')) || (f.cargo||'').toLowerCase().includes(termo) }).slice(0,6)
  const funcsAgendamentoFiltrados = funcsParaBusca.filter((f:any)=>{ if (!buscaFuncAgendamento) return true; const t=buscaFuncAgendamento.toLowerCase(); return (f.nome||'').toLowerCase().includes(t) || (f.cpf||'').includes(t) }).slice(0,5)
  const cards = [{ titulo:'Funcionários', valor:funcs.length, sub:'Cadastrados', icone:'👷', cor:'linear-gradient(135deg,#14b8a6,#06b6d4)', aba:'funcionarios' },{ titulo:"EPI's", valor:episF.length, sub:'Entregues', icone:'🦺', cor:'linear-gradient(135deg,#22c55e,#84cc16)', aba:'epis' },{ titulo:'Exames', valor:examesF.length, sub:'Agendados', icone:'🩺', cor:'linear-gradient(135deg,#0d9488,#2563eb)', aba:'exames' },{ titulo:'Clínicas', valor:clinicasF.length, sub:'Parceiras', icone:'🏥', cor:'linear-gradient(135deg,#2563eb,#22d3ee)', aba:'clinicas' },{ titulo:'Documentos', valor:docF.length, sub:`${docsComArquivo} com PDF`, icone:'📄', cor:'linear-gradient(135deg,#2563eb,#22d3ee)', aba:'documentos' },]
  const anoCal = mesCalendario.getFullYear(); const mesCal = mesCalendario.getMonth(); const nomeMes = mesCalendario.toLocaleDateString('pt-BR', { month:'long', year:'numeric' }); const primeiroDiaSemana = new Date(anoCal, mesCal, 1).getDay(); const diasNoMes = new Date(anoCal, mesCal+1, 0).getDate()
  const examesHoje = examesF.filter((e:any)=>limparDataExame(e.data)===hojeISO()).length
  const examesVencidos = examesF.filter((e:any)=>{ const d=limparDataExame(e.data); return d && d < hojeISO() }).length
  const examesSemana = examesF.filter((e:any)=>{ const d=limparDataExame(e.data); if(!d) return false; const diff=(new Date(d).getTime()-new Date(hojeISO()).getTime())/(1000*60*60*24); return diff>=0 && diff<=7 }).length
  const listaBase = dados[aba]||[]; const listaPorEmpresa = dadosFiltradosPorEmpresa(listaBase)
  let listaFiltrada = listaPorEmpresa.filter((it:any)=> JSON.stringify(it).toLowerCase().includes(busca.toLowerCase()))
  if (aba==='documentos' && pastaAtual!=='Todas') listaFiltrada = listaFiltrada.filter((it:any)=>(it.pasta||it.tipo||'Outros')===pastaAtual)
  if (aba==='exames') { if (filtroExame==='hoje') listaFiltrada = listaFiltrada.filter((it:any)=>limparDataExame(it.data)===hojeISO()); if (filtroExame==='vencido') listaFiltrada = listaFiltrada.filter((it:any)=>{ const d=limparDataExame(it.data); return d && d < hojeISO() }); if (filtroExame==='semana') listaFiltrada = listaFiltrada.filter((it:any)=>{ const d=limparDataExame(it.data); if(!d) return false; const diff=(new Date(d).getTime()-new Date(hojeISO()).getTime())/(1000*60*60*24); return diff>=0 && diff<=7 }); listaFiltrada = [...listaFiltrada].sort((a:any,b:any)=>limparDataExame(a.data).localeCompare(limparDataExame(b.data))) }

  return (
    <div style={{minHeight:'100vh', background:'#ecfeff', fontFamily:'Arial, sans-serif'}}>
      <header style={{background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:'12px 16px', position:'sticky', top:0, zIndex:50}}>
        <div style={{maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}><div style={{display:'flex', alignItems:'center', gap:12}}><img src="/logo.png" alt="PREVIX" style={{width:44,height:44,objectFit:'contain',background:'white',borderRadius:12,padding:4}} /><div><div style={{fontWeight:900,fontSize:20,letterSpacing:1,lineHeight:1}}>PREVIX <span style={{fontSize:12, fontWeight:700, background:'rgba(255,255,255,0.2)', padding:'2px 8px', borderRadius:20}}>SST</span></div><div style={{fontSize:10,letterSpacing:2,color:'#a7f3d0',fontWeight:700}}>PREVENÇÃO QUE PROTEGE</div></div></div><div style={{display:'flex', gap:8, alignItems:'center'}}><span style={{fontSize:12, background: isAdmin ? '#f97316' : '#22c55e', padding:'6px 12px', borderRadius:20, fontWeight:700}}>{isAdmin ? '👨‍💼 SUPER ADMIN' : `🏢 ${usuario.empresa}`}</span><button onClick={sair} style={{...btn, background:'white', color:'#0f172a', borderRadius:20}}>Sair</button></div></div>
        <div style={{maxWidth:1200, margin:'12px auto 0', display:'flex', gap:8, overflowX:'auto', paddingBottom:4}}>{menu.map(m=>(<button key={m.id} onClick={()=>{setAba(m.id); setBusca(''); setPastaAtual('Todas'); setFiltroExame('todos')}} style={{whiteSpace:'nowrap', padding:'8px 16px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:14, background: aba===m.id?'white':'rgba(255,255,255,0.15)', color: aba===m.id?'#0f766e':'white'}}>{m.icone} {m.label}</button>))}</div>
      </header>
      <main style={{maxWidth:1200, margin:'0 auto', padding:16}}>
        {aba==='inicio' && (<><div style={{background:'linear-gradient(135deg,#ffffff,#ecfeff)', borderRadius:24, padding:24, display:'flex', justifyContent:'space-between', gap:16, flexWrap:'wrap', border:'1px solid #a7f3d0'}}><div><div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:'#0d9488'}}>{isAdmin ? 'SUPER ADMIN • VOCÊ ESTÁ VENDO TUDO' : `EMPRESA • VOCÊ ESTÁ VENDO SÓ: ${usuario.empresa.toUpperCase()}`}</div><h2 style={{fontSize:32,fontWeight:900,margin:'8px 0 0', color:'#0f172a'}}>Olá, {usuario.nome}! 👋</h2><p style={{color:'#64748b'}}>Bem-vindo ao seu painel SST • <b style={{color:'#0f766e'}}>{isAdmin ? 'Todas as empresas' : usuario.empresa}</b></p></div><span style={{background:'#dcfce7',color:'#15803d',padding:'8px 16px',borderRadius:20,fontSize:14,fontWeight:800,height:'fit-content'}}>✅ PREVIX Completo!</span></div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:16,marginTop:20}}>{cards.map(c=>(<button key={c.titulo} onClick={()=>setAba(c.aba)} style={{background:c.cor,borderRadius:24,padding:20,textAlign:'left',border:'none',cursor:'pointer', color:'white'}}><div style={{width:48,height:48,background:'rgba(255,255,255,0.25)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{c.icone}</div><div style={{color:'rgba(255,255,255,0.9)',fontSize:14,marginTop:16, fontWeight:700}}>{c.titulo}</div><div style={{fontSize:38,fontWeight:900, lineHeight:1}}>{c.valor}</div><div style={{fontSize:12,color:'rgba(255,255,255,0.85)'}}>{c.sub} • Clique para abrir →</div></button>))}</div>{examesF.length>0 && (<div style={{background:'white',borderRadius:24,padding:20,border:'1px solid #facc15',marginTop:20}}><h3 style={{margin:'0 0 12px',fontWeight:900,color:'#854d0e'}}>🩺📅 Exames - Resumo</h3><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><span style={{background:'#fee2e2',color:'#b91c1c',padding:'8px 14px',borderRadius:20,fontWeight:800,fontSize:13}}>🔴 {examesVencidos} vencido(s)</span><span style={{background:'#dcfce7',color:'#15803d',padding:'8px 14px',borderRadius:20,fontWeight:800,fontSize:13}}>🟢 {examesHoje} hoje</span><span style={{background:'#fef9c3',color:'#854d0e',padding:'8px 14px',borderRadius:20,fontWeight:800,fontSize:13}}>🟡 {examesSemana} nos próximos 7 dias</span><button onClick={()=>setAba('exames')} style={{...btn, background:'#0d9488',color:'white',borderRadius:20}}>Ver calendário →</button></div></div>)}</>)}

        {/* ===== EXAMES - MODELO DA FOTO ===== */}
        {aba==='exames' && (
          <div>
            {/* BANNER CLINICA PARCEIRA */}
            <div style={{background:'linear-gradient(90deg,#a5d8e6,#7cc4d8)', borderRadius:20, padding:'18px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:16}}>
              <div style={{display:'flex', gap:14, alignItems:'center'}}>
                <div style={{width:64,height:64,background:'rgba(255,255,255,0.5)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,border:'1px solid #0d9488'}}>🏥</div>
                <div><div style={{fontSize:13,color:'#334155'}}>Clínica parceira</div><div style={{fontSize:24,fontWeight:900,color:'#0f172a',lineHeight:1.1}}>{clinicaAtual.nome}</div><div style={{fontSize:12,color:'#475569'}}>{clinicaAtual.telefone||''} {clinicaAtual.endereco ? `• ${clinicaAtual.endereco}` : ''}</div></div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                <select value={clinicaSelecionada} onChange={e=>setClinicaSelecionada(e.target.value)} style={{padding:'10px 12px',borderRadius:20,border:'1px solid #0d9488',fontWeight:800,background:'white',cursor:'pointer'}}>
                  {(dados.clinicas||[]).map((c:any)=><option key={c.id} value={c.nome}>{c.nome}</option>)}
                </select>
                <span style={{background:'#0d9488',color:'white',padding:'8px 14px',borderRadius:20,fontWeight:800,fontSize:13}}>✅ {clinicaAtual.status||'Ativa'} • Convênio {clinicaAtual.convenio||'vigente'}</span>
                <button onClick={abrirNovaClinica} style={{...btn, background:'white', color:'#0f172a', borderRadius:20}}>＋ Cadastrar Clínica</button>
                <button onClick={()=>{ if(clinicaAtual) abrirEditarClinica(clinicaAtual) }} style={{...btn, background:'white', color:'#0f172a', borderRadius:20}}>✏️ Editar</button>
              </div>
            </div>

            {/* CLINICAS LISTA RAPIDA */}
            {(dados.clinicas||[]).length>1 && (
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
                {(dados.clinicas||[]).map((c:any)=>(<button key={c.id} onClick={()=>setClinicaSelecionada(c.nome)} style={{padding:'8px 14px',borderRadius:20,border: clinicaSelecionada===c.nome ? '2px solid #0d9488' : '1px solid #e2e8f0',background: clinicaSelecionada===c.nome ? '#ccfbf1' : 'white',fontWeight:800,cursor:'pointer',fontSize:13}}>🏥 {c.nome} {clinicaSelecionada===c.nome ? '✅' : ''}</button>))}
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:16,alignItems:'start'}}>
              {/* ESQUERDA - CALENDARIO */}
              <div style={{background:'white',borderRadius:24,padding:20,border:'1px solid #e2e8f0'}}>
                <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:16}}><span style={{fontSize:32}}>🗓️</span><h2 style={{margin:0,fontSize:22,fontWeight:900}}>Calendário - {nomeMes}</h2></div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><button onClick={()=>setMesCalendario(new Date(anoCal, mesCal-1, 1))} style={{...btn, background:'#f1f5f9', borderRadius:20, fontSize:18, padding:'6px 14px'}}>‹‹</button><div style={{fontWeight:900,fontSize:18,textTransform:'capitalize'}}>{nomeMes}</div><button onClick={()=>setMesCalendario(new Date(anoCal, mesCal+1, 1))} style={{...btn, background:'#f1f5f9', borderRadius:20, fontSize:18, padding:'6px 14px'}}>››</button></div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6,textAlign:'center',fontWeight:700,fontSize:13,color:'#64748b',marginBottom:6}}><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span></div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>
                  {Array.from({length: (primeiroDiaSemana+6)%7 }).map((_,i)=><div key={'v'+i}></div>)}
                  {Array.from({length: diasNoMes}).map((_,i)=>{ const dia=i+1; const dataISO=`${anoCal}-${String(mesCal+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`; const examesDia=examesF.filter((e:any)=>limparDataExame(e.data)===dataISO); const isSel=dataISO===diaSelecionado; const isHoje=dataISO===hojeISO(); return (<button key={dia} onClick={()=>setDiaSelecionado(dataISO)} style={{minHeight:52,borderRadius:12,border: isSel ? '2px solid #0d9488' : '1px solid #e2e8f0',background: isSel ? '#0d9488' : isHoje ? '#dcfce7' : 'white',color: isSel ? 'white' : '#0f172a',cursor:'pointer',fontWeight:800,fontSize:15,position:'relative'}}>{dia} {examesDia.length>0 && <div style={{fontSize:9, fontWeight:800, color: isSel ? 'white' : '#2563eb'}}>{examesDia.length} exame(s)</div>} {isSel && <span style={{position:'absolute',top:-4,right:-4,background:'#22c55e',color:'white',borderRadius:20,width:18,height:18,fontSize:12,display:'flex',alignItems:'center',justifyContent:'center'}}>✓</span>}</button>) })}
                </div>
                <div style={{display:'flex',gap:16,marginTop:14,fontSize:12,color:'#64748b',justifyContent:'center'}}><span>🟢 Data selecionada</span><span>⚪ Disponível</span></div>
                <div style={{display:'flex',gap:8,marginTop:14,flexWrap:'wrap'}}><button onClick={()=>{setFiltroExame('hoje');}} style={{...btn, background:'#dcfce7',color:'#15803d',borderRadius:20}}>🟢 Hoje ({examesHoje})</button><button onClick={()=>setFiltroExame('semana')} style={{...btn, background:'#fef9c3',color:'#854d0e',borderRadius:20}}>🟡 7 dias ({examesSemana})</button><button onClick={()=>setFiltroExame('vencido')} style={{...btn, background:'#fee2e2',color:'#b91c1c',borderRadius:20}}>🔴 Vencidos ({examesVencidos})</button><button onClick={()=>{setFiltroExame('todos')}} style={{...btn, background:'#f1f5f9',borderRadius:20}}>📅 Todos ({examesF.length})</button></div>
              </div>

              {/* DIREITA - TIPOS DE EXAME */}
              <div style={{background:'white',borderRadius:24,padding:20,border:'1px solid #e2e8f0'}}>
                <div style={{display:'flex',gap:10,alignItems:'center'}}><span style={{fontSize:32}}>📋</span><div><h2 style={{margin:0,fontSize:22,fontWeight:900}}>Tipos de exame - {diaSelecionado ? formatarDataExame(diaSelecionado) : 'Selecione o dia'}</h2><p style={{margin:'2px 0 0',fontSize:13,color:'#64748b'}}>Selecione os exames necessários para o funcionário</p></div></div>
                <div style={{marginTop:16,position:'relative'}}><label style={{fontSize:13,fontWeight:800}}>👷 Funcionário</label><input value={buscaFuncAgendamento} onChange={e=>{setBuscaFuncAgendamento(e.target.value); setFuncAgendamento(null)}} placeholder="Digita o nome do funcionário..." style={{...input, marginTop:4}} />{buscaFuncAgendamento && (<div style={{border:'1px solid #ccfbf1',borderRadius:12,marginTop:6,overflow:'hidden',background:'white',position:'relative',zIndex:5}}>{funcsAgendamentoFiltrados.map((f:any)=>(<button key={f.id} type="button" onClick={()=>{setFuncAgendamento(f); setBuscaFuncAgendamento(f.nome)}} style={{display:'block',width:'100%',textAlign:'left',padding:'10px 12px',background:'white',border:'none',borderBottom:'1px solid #f0fdfa',cursor:'pointer'}}><div style={{fontWeight:800}}>👷 {f.nome}</div><div style={{fontSize:12,color:'#64748b'}}>{f.cargo||''} • CPF: {f.cpf||'-'}</div></button>))}</div>)} {funcAgendamento && <div style={{fontSize:12,color:'#15803d',fontWeight:800,marginTop:6}}>✅ {funcAgendamento.nome} selecionado</div>}</div>
                <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:2}}>
                  {TIPOS_EXAME.map(t=>{ const checked = tiposSelecionados.includes(t.nome); return (
                    <label key={t.nome} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 8px',borderRadius:12,background: checked ? '#f0fdfa' : 'white',cursor:'pointer',border: checked ? '1px solid #ccfbf1' : '1px solid transparent'}}>
                      <input type="checkbox" checked={checked} onChange={()=>toggleTipoExame(t.nome)} style={{width:20,height:20,accentColor:'#0d9488'}} />
                      <div style={{flex:1}}><div style={{fontWeight:800,fontSize:15}}>{t.nome}</div>{t.desc && <div style={{fontSize:12,color:'#64748b'}}>{t.desc}</div>}</div>
                      {t.tag && <span style={{fontSize:11,fontWeight:800,padding:'4px 10px',borderRadius:20,background: t.tag==='Obrigatório' ? '#ccfbf1' : '#e2e8f0',color: t.tag==='Obrigatório' ? '#0f766e' : '#475569'}}>{t.tag}</span>}
                    </label>
                  )})}
                </div>
                <div style={{background:'#e0f2fe',borderRadius:14,padding:'12px 14px',marginTop:16,display:'flex',gap:10,alignItems:'center'}}><span style={{background:'#2563eb',color:'white',borderRadius:20,width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,flexShrink:0}}>i</span><div style={{fontSize:13,color:'#1e40af'}}>Você selecionou o dia <b>{formatarDataExame(diaSelecionado)}</b>.<br/>Escolha os exames para confirmar o agendamento.</div></div>
                <div style={{display:'flex',gap:10,marginTop:16}}><button onClick={()=>{setTiposSelecionados([]); setFuncAgendamento(null); setBuscaFuncAgendamento('')}} style={{...btn, flex:1, background:'white', border:'1px solid #cbd5e1', padding:14, borderRadius:12}}>Limpar seleção</button><button onClick={confirmarAgendamentoFoto} style={{...btn, flex:2, background:'#0d9488', color:'white', padding:14, borderRadius:12, fontSize:15}}>✅ Confirmar agendamento</button></div>
                {funcAgendamento && tiposSelecionados.length>0 && <div style={{marginTop:12,fontSize:13,background:'#dcfce7',padding:'10px 12px',borderRadius:12,color:'#15803d',fontWeight:700}}>👷 {funcAgendamento.nome} • 📅 {formatarDataExame(diaSelecionado)} • 🏥 {clinicaSelecionada} • 🩺 {tiposSelecionados.length} exame(s)</div>}
              </div>
            </div>

            {/* LISTA DE EXAMES AGENDADOS */}
            <div style={{background:'white',borderRadius:24,padding:20,border:'1px solid #a7f3d0',marginTop:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}><h3 style={{margin:0,fontSize:18,fontWeight:900}}>📋 Exames agendados • {listaFiltrada.length}</h3><div style={{display:'flex',gap:8}}><button onClick={limparExamesComErro} style={{...btn, background:'#fee2e2', color:'#b91c1c', borderRadius:20}}>🧹 Limpar com erro</button><input placeholder="🔍 Buscar exame..." value={busca} onChange={e=>setBusca(e.target.value)} style={{padding:'8px 12px',borderRadius:20,border:'1px solid #cbd5e1',fontSize:13}} /></div></div>
              <div style={{marginTop:14,display:'flex',flexDirection:'column',gap:10}}>
                {listaFiltrada.map((item:any)=>{ const st=statusExame(item.data); return (<div key={item.id} style={{border: st==='vencido' ? '2px solid #fca5a5' : st==='hoje' ? '2px solid #86efac' : '1px solid #e2e8f0',borderRadius:16,padding:14,display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap',background: st==='vencido' ? '#fef2f2' : st==='hoje' ? '#f0fdf4' : '#f8fafc'}}><div><div style={{fontWeight:900}}>{item.nome} {st==='vencido' && <span style={{fontSize:11,background:'#ef4444',color:'white',padding:'2px 8px',borderRadius:20}}>🔴 VENCIDO</span>} {st==='hoje' && <span style={{fontSize:11,background:'#22c55e',color:'white',padding:'2px 8px',borderRadius:20}}>🟢 HOJE</span>}</div><div style={{fontSize:13,color:'#64748b'}}>🩺 {item.tipo} • 📅 {formatarDataExame(item.data)} • 🏥 {item.clinica||'-'} • Resultado: {item.resultado||'-'}</div></div><div style={{display:'flex',gap:8}}><button onClick={()=>abrirEditar(item)} style={{...btn, background:'#dbeafe', color:'#1e40af'}}>✏️ Editar</button><button onClick={()=>excluir(item)} style={{...btn, background:'#fee2e2', color:'#b91c1c'}}>🗑️ Excluir</button></div></div>) })}
                {listaFiltrada.length===0 && <p style={{color:'#94a3b8',textAlign:'center',padding:16}}>Nenhum exame ainda. Escolhe o dia, o funcionário e marca os tipos pra agendar!</p>}
              </div>
            </div>
          </div>
        )}

        {aba!=='inicio' && aba!=='exames' && (
          <div style={{background:'white',borderRadius:24,padding:24,border:'1px solid #a7f3d0',marginTop: aba==='clinicas' ? 0 : 0}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}><div><h2 style={{fontSize:24,fontWeight:900,textTransform:'capitalize',margin:0}}>{aba} {!isAdmin && <span style={{fontSize:13,fontWeight:400,color:'#0d9488'}}>- só {usuario.empresa}</span>}</h2><p style={{color:'#64748b',fontSize:14,margin:'4px 0 0'}}>Total: {listaFiltrada.length} registros</p></div><button onClick={abrirNovo} style={{...btn, background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:'12px 20px', borderRadius:20}}>{aba==='documentos' ? `📎 Subir em ${pastaAtual==='Todas' ? 'PGR' : pastaAtual}` : aba==='epis' ? '🦺 Nova Entrega' : aba==='funcionarios' ? '👷 Novo Funcionário + PIN' : aba==='clinicas' ? '🏥 Nova Clínica' : '＋ Adicionar'}</button></div>
            {aba==='epis' && (<div style={{background:'#fef9c3', border:'2px dashed #facc15', borderRadius:16, padding:14, marginTop:16, textAlign:'center', fontSize:13, color:'#854d0e'}}>🔑 PIN OU ✍️ Assinatura OU 👆 Digital + 📄 PDF</div>)}
            {aba==='clinicas' && (<div style={{background:'#e0f2fe', borderRadius:16, padding:14, marginTop:16, fontSize:13, color:'#1e40af'}}>🏥 Cadastra aqui as clínicas parceiras. Elas aparecem no banner da tela de Exames. A que tu deixar selecionada vai ser usada no agendamento.</div>)}
            {aba==='documentos' && (<div style={{marginTop:16}}><div style={{fontSize:13, fontWeight:800, color:'#0f766e', marginBottom:8}}>📁 PASTAS</div><div style={{display:'flex', gap:8, flexWrap:'wrap'}}><button onClick={()=>setPastaAtual('Todas')} style={{...btn, background: pastaAtual==='Todas' ? '#0f766e' : '#f1f5f9', color: pastaAtual==='Todas' ? 'white' : '#0f172a', borderRadius:20}}>📂 Todas ({docF.length})</button>{PASTAS.map(p=>(<button key={p.id} onClick={()=>setPastaAtual(p.id)} style={{...btn, background: pastaAtual===p.id ? p.cor : '#f1f5f9', color: pastaAtual===p.id ? 'white' : '#0f172a', borderRadius:20}}>{p.icone} {p.nome} ({contarPasta(p.id)})</button>))}</div></div>)}
            <input placeholder={`🔍 Buscar em ${aba}...`} value={busca} onChange={e=>setBusca(e.target.value)} style={{...input, marginTop:16, background:'#f0fdfa'}} />
            <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:12}}>
              {listaFiltrada.map((item:any,i:number)=>{ const corAvatar = CORES_CARDS[aba] || 'linear-gradient(135deg,#0d9488,#2563eb)'; const pastaItem = item.pasta || item.tipo || 'Outros'; return (<div key={item.id||item._id||i} style={{border:'1px solid #e0f2fe',borderRadius:20,padding:16,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap', background:'linear-gradient(135deg,#ffffff,#f0fdfa)'}}><div style={{display:'flex', gap:14, alignItems:'center', flex:1, minWidth:220}}><div style={{width:52,height:52,borderRadius:16,background:corAvatar, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:16}}>{aba==='documentos' ? '📄' : aba==='epis' ? '🦺' : aba==='clinicas' ? '🏥' : iniciais(item.nome || item.titulo || '??')}</div><div style={{flex:1}}><div style={{fontWeight:900, fontSize:16}}>{item.nome || item.titulo || 'Registro'}</div><div style={{fontSize:13,color:'#64748b'}}>{aba==='empresas' ? `${item.responsavel||''} • ${item.telefone||''}` : aba==='clinicas' ? `📞 ${item.telefone||'-'} • 📍 ${item.endereco||'-'} • Convênio: ${item.convenio||'-'} • Status: ${item.status||'-'}` : aba==='documentos' ? `Pasta: ${pastaItem} • Empresa: ${item.empresa||'-'}` : aba==='epis' ? `👷 ${item.funcionario||'-'} • 📅 ${item.data_entrega||'-'} • ${item.tipo||''}` : aba==='funcionarios' ? `${item.cargo||''} • CPF: ${item.cpf||'-'} • ${item.telefone||''}` : CAMPOS[aba]?.slice(1,4).map((c:any)=> item[c.k] ? `${c.l}: ${item[c.k]} • ` : '').join('')}</div>{aba==='funcionarios' && (<div style={{display:'flex',gap:8,marginTop:8}}><span style={{background:'#fef9c3',padding:'5px 12px',borderRadius:20,fontSize:13,fontWeight:900}}>🔑 PIN: {item.pin||'----'}</span><button onClick={()=>copiarPIN(item.pin||'', item.nome)} style={{...btn, background:'#f1f5f9', fontSize:12}}>{pinCopiado===item.nome ? '✅ Copiado!' : '📋 Copiar PIN'}</button></div>)}{aba==='documentos' && item.arquivoData && (<div style={{display:'flex',gap:8,marginTop:10}}><button onClick={()=>verArquivo(item)} style={{...btn, background:'#dbeafe', color:'#1e40af'}}>👁️ Ver PDF</button><button onClick={()=>baixarArquivo(item)} style={{...btn, background:'#dcfce7', color:'#15803d'}}>⬇️ Baixar</button></div>)}</div></div><div style={{display:'flex',gap:8}}>{aba==='epis' && <button onClick={()=>gerarTermoPDF(item)} style={{...btn, background:'#0f172a', color:'white'}}>📄 PDF</button>}{aba==='clinicas' && <button onClick={()=>setClinicaSelecionada(item.nome)} style={{...btn, background:'#ccfbf1', color:'#0f766e'}}>✅ Usar nos exames</button>}<button onClick={()=>abrirEditar(item)} style={{...btn, background:'#dbeafe', color:'#1e40af'}}>✏️ Editar</button><button onClick={()=>excluir(item)} style={{...btn, background:'#fee2e2', color:'#b91c1c'}}>🗑️ Excluir</button></div></div>) })}
              {listaFiltrada.length===0 && <p style={{color:'#94a3b8', textAlign:'center', padding:20}}>Nenhum registro ainda.</p>}
            </div>
          </div>
        )}
      </main>

      {modalClinica && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16}}>
          <div style={{background:'white', borderRadius:24, padding:24, width:'100%', maxWidth:500, maxHeight:'92vh', overflowY:'auto'}}>
            <h3 style={{margin:'0 0 4px', fontSize:20, fontWeight:900, color:'#0f766e'}}>🏥 {editandoClinica ? 'Editar Clínica' : 'Cadastrar Clínica Parceira'}</h3>
            <p style={{fontSize:13,color:'#64748b',margin:'0 0 16px'}}>Essa clínica vai aparecer no banner da tela de Exames.</p>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div><label style={{fontSize:13,fontWeight:700}}>🏥 Nome da Clínica *</label><input value={formClinica.nome||''} onChange={e=>setFormClinica({...formClinica, nome:e.target.value})} placeholder="Ex: Sol Nascente" style={{...input, marginTop:4}} /></div>
              <div><label style={{fontSize:13,fontWeight:700}}>📄 CNPJ</label><input value={formClinica.cnpj||''} onChange={e=>setFormClinica({...formClinica, cnpj:e.target.value})} placeholder="00.000.000/0001-00" style={{...input, marginTop:4}} /></div>
              <div style={{display:'flex',gap:10}}><div style={{flex:1}}><label style={{fontSize:13,fontWeight:700}}>📞 Telefone / WhatsApp</label><input value={formClinica.telefone||''} onChange={e=>setFormClinica({...formClinica, telefone:e.target.value})} placeholder="(82) 99999-0000" style={{...input, marginTop:4}} /></div><div style={{flex:1}}><label style={{fontSize:13,fontWeight:700}}>📧 E-mail</label><input value={formClinica.email||''} onChange={e=>setFormClinica({...formClinica, email:e.target.value})} placeholder="contato@clinica.com" style={{...input, marginTop:4}} /></div></div>
              <div><label style={{fontSize:13,fontWeight:700}}>📍 Endereço</label><input value={formClinica.endereco||''} onChange={e=>setFormClinica({...formClinica, endereco:e.target.value})} placeholder="Rua, bairro, cidade" style={{...input, marginTop:4}} /></div>
              <div><label style={{fontSize:13,fontWeight:700}}>👤 Responsável na clínica</label><input value={formClinica.responsavel||''} onChange={e=>setFormClinica({...formClinica, responsavel:e.target.value})} placeholder="Nome de quem te atende" style={{...input, marginTop:4}} /></div>
              <div><label style={{fontSize:13,fontWeight:700}}>🤝 Convênio</label><div style={{display:'flex',gap:8,marginTop:6}}>{['Vigente','Vencido','Sem convênio'].map(s=>(<button key={s} type="button" onClick={()=>setFormClinica({...formClinica, convenio:s})} style={{flex:1,padding:'10px',borderRadius:12,border: formClinica.convenio===s ? '2px solid #0d9488' : '1px solid #e2e8f0',background: formClinica.convenio===s ? '#ccfbf1' : 'white',fontWeight:800,cursor:'pointer',fontSize:12}}>{s}</button>))}</div></div>
              <div><label style={{fontSize:13,fontWeight:700}}>Status</label><div style={{display:'flex',gap:8,marginTop:6}}>{['Ativa','Inativa'].map(s=>(<button key={s} type="button" onClick={()=>setFormClinica({...formClinica, status:s})} style={{flex:1,padding:'10px',borderRadius:12,border: formClinica.status===s ? '2px solid #22c55e' : '1px solid #e2e8f0',background: formClinica.status===s ? '#dcfce7' : 'white',fontWeight:800,cursor:'pointer'}}>{s}</button>))}</div></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}><button onClick={()=>setModalClinica(false)} style={{...btn, flex:1, background:'#f1f5f9', padding:12}}>Cancelar</button><button onClick={salvarClinica} style={{...btn, flex:1, background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:12}}>💾 Salvar Clínica</button></div>
          </div>
        </div>
      )}

      {modal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16}}>
          <div style={{background:'white', borderRadius:24, padding:24, width:'100%', maxWidth:540, maxHeight:'92vh', overflowY:'auto'}}>
            <h3 style={{margin:'0 0 16px', fontSize:20, fontWeight:900, color:'#0f766e'}}>{editando ? '✏️ Editar' : '＋ Adicionar'} - {aba}</h3>
            {aba==='epis' ? (
              <div style={{display:'flex', flexDirection:'column', gap:14}}>
                <div><label style={{fontSize:13, fontWeight:800}}>🦺 Qual EPI?</label><input value={buscaEPI} onChange={e=>{setBuscaEPI(e.target.value); setForm({...form, nome: e.target.value})}} style={{...input, marginTop:4}} />{buscaEPI.length>=1 && (<div style={{border:'1px solid #ccfbf1', borderRadius:12, marginTop:6, overflow:'hidden'}}>{episFiltrados.map((epi:any)=>(<button key={epi} type="button" onClick={()=>{setBuscaEPI(epi); setForm({...form, nome: epi})}} style={{display:'block', width:'100%', textAlign:'left', padding:'10px 12px', background:'white', border:'none', cursor:'pointer'}}>🦺 {epi}</button>))}</div>)}</div>
                <div><label style={{fontSize:13, fontWeight:800}}>📦 Tipo</label><input value={form.tipo||''} onChange={e=>setForm({...form, tipo: e.target.value})} style={{...input, marginTop:4}} /></div>
                <div><label style={{fontSize:13, fontWeight:800}}>🔢 Quantidade</label><div style={{display:'flex', gap:8, marginTop:4}}>{['1','2','3','5','10'].map(q=>(<button key={q} type="button" onClick={()=>setForm({...form, quantidade: q})} style={{flex:1, padding:'10px', borderRadius:12, border: form.quantidade===q ? '2px solid #22c55e' : '1px solid #e2e8f0', background: form.quantidade===q ? '#dcfce7' : 'white', fontWeight:800, cursor:'pointer'}}>{q}</button>))}</div></div>
                <div><label style={{fontSize:13, fontWeight:800}}>👷 Funcionário</label><input value={buscaFunc} onChange={e=>{setBuscaFunc(e.target.value); setForm({...form, funcionario: e.target.value}); setMostrarSugestoesFunc(true); setFuncSelecionado(null)}} placeholder="Digita nome..." style={{...input, marginTop:4}} />{mostrarSugestoesFunc && (<div style={{border:'1px solid #ccfbf1', borderRadius:12, marginTop:6}}>{funcsFiltrados.map((f:any)=>(<button key={f.id} type="button" onClick={()=>{setBuscaFunc(f.nome); setForm({...form, funcionario: f.nome, funcionarioCpf: f.cpf, empresa: f.empresa || form.empresa}); setFuncSelecionado(f); setMostrarSugestoesFunc(false)}} style={{display:'block', width:'100%', textAlign:'left', padding:'10px 12px', background:'white', border:'none', cursor:'pointer'}}>👷 {f.nome}</button>))}</div>)}</div>
                <div><label style={{fontSize:13, fontWeight:800}}>📅 Data</label><input type="date" value={form.data_entrega||''} onChange={e=>setForm({...form, data_entrega: e.target.value})} style={{...input, marginTop:4}} /></div>
                {funcSelecionado && (<><div style={{background:'#fef9c3', borderRadius:16, padding:14}}><label style={{fontWeight:900}}>🔑 PIN de {funcSelecionado.nome.split(' ')[0]}</label><div style={{display:'flex',gap:8,marginTop:8}}><input type="password" maxLength={4} value={pinDigitado} onChange={e=>setPinDigitado(e.target.value.replace(/\D/g,'').slice(0,4))} style={{...input, flex:1, textAlign:'center', fontSize:20, fontWeight:900}} /><button type="button" onClick={()=>{ if (pinDigitado===(funcSelecionado.pin||'')) setPinErro('✅ PIN correto!'); else setPinErro('❌ PIN incorreto!') }} style={{...btn, background:'#854d0e', color:'white'}}>Verificar</button></div>{pinErro && <div style={{marginTop:8,fontWeight:800}}>{pinErro}</div>}</div><div style={{background:'#e0f2fe', borderRadius:16, padding:14, textAlign:'center'}}><button type="button" onClick={confirmarComDigital} style={{...btn, width:'100%', background:'#2563eb', color:'white', padding:12}}>👆 Confirmar com Digital</button>{digitalMsg && <div style={{marginTop:8,fontWeight:800}}>{digitalMsg}</div>}</div><div style={{background:'#f0fdfa', borderRadius:16, padding:14}}><label style={{fontWeight:900}}>✍️ Assinatura</label><canvas ref={canvasRef} width={460} height={140} onMouseDown={iniciarAssinatura} onMouseMove={desenharAssinatura} onMouseUp={terminarAssinatura} onMouseLeave={terminarAssinatura} onTouchStart={iniciarAssinatura} onTouchMove={desenharAssinatura} onTouchEnd={terminarAssinatura} style={{width:'100%', height:140, background:'white', borderRadius:12, border:'1px solid #cbd5e1', touchAction:'none', marginTop:8}} /><button type="button" onClick={limparAssinatura} style={{...btn, marginTop:8, background:'#fee2e2', color:'#b91c1c'}}>🧹 Limpar</button></div></>)}
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:12}}>{(CAMPOS[aba]||[]).map((c:any)=>{ if (c.k==='empresa' && usuario?.tipo==='empresa') return null; if (c.k==='senha') return (<div key={c.k}><label style={{fontSize:13, fontWeight:700}}>🔐 {c.l}</label><input type={verSenha ? 'text' : 'password'} value={form[c.k]||''} onChange={e=>setForm({...form, [c.k]: e.target.value})} style={{...input, marginTop:4}} /></div>); return (<div key={c.k}><label style={{fontSize:13, fontWeight:700}}>{c.l}</label><input type={c.k==='vencimento' || c.k==='data' ? 'date' : 'text'} value={c.k==='data' ? (limparDataExame(form[c.k])||'') : (form[c.k]||'')} onChange={e=>setForm({...form, [c.k]: e.target.value})} style={{...input, marginTop:4}} /></div>) })}{aba==='funcionarios' && (<div style={{background:'#fef9c3', borderRadius:16, padding:14}}><label style={{fontWeight:900}}>🔑 PIN</label><input value={form.pin||''} onChange={e=>setForm({...form, pin: e.target.value.replace(/\D/g,'').slice(0,4)})} style={{...input, marginTop:8, textAlign:'center', fontWeight:900}} /></div>)}{aba==='documentos' && (<><div><label style={{fontWeight:800}}>📁 Pasta</label><div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:8}}>{PASTAS.map(p=>(<button key={p.id} type="button" onClick={()=>setPastaSelecionadaForm(p.id)} style={{padding:'10px 6px', borderRadius:12, border: pastaSelecionadaForm===p.id ? `2px solid ${p.cor}` : '1px solid #e2e8f0', background: pastaSelecionadaForm===p.id ? '#f0fdfa' : 'white', cursor:'pointer', fontWeight:800, fontSize:12}}>{p.icone} {p.nome}</button>))}</div></div><div style={{background:'#f0fdfa', border:'2px dashed #5eead4', borderRadius:16, padding:16, textAlign:'center'}}><label style={{display:'block', background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:'12px', borderRadius:12, fontWeight:800, cursor:'pointer'}}>{arquivoNome ? `✅ ${arquivoNome}` : '📎 Escolher arquivo'}<input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleArquivo} style={{display:'none'}} /></label></div></>)}</div>
            )}
            <div style={{display:'flex', gap:10, marginTop:20}}><button onClick={()=>setModal(false)} style={{...btn, flex:1, background:'#f1f5f9', padding:12}}>Cancelar</button><button onClick={salvar} style={{...btn, flex:1, background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:12}}>💾 Salvar</button></div>
          </div>
        </div>
      )}
    </div>
  )
}