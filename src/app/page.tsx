'use client'
import { useEffect, useRef, useState } from 'react'

const CAMPOS: any = {
  funcionarios: [{k:'nome',l:'Nome'},{k:'cargo',l:'Cargo'},{k:'empresa',l:'Empresa'},{k:'cpf',l:'CPF'},{k:'telefone',l:'Telefone'}],
  epis: [{k:'nome',l:'Nome do EPI'},{k:'tipo',l:'Tipo'},{k:'quantidade',l:'Quantidade'},{k:'funcionario',l:'Funcionário'},{k:'data_entrega',l:'Data Entrega'}],
  extintores: [{k:'localizacao',l:'Localização'},{k:'tipo',l:'Tipo'},{k:'capacidade',l:'Capacidade'},{k:'vencimento',l:'Vencimento'},{k:'status',l:'Status'}],
  inspecoes: [{k:'titulo',l:'Título'},{k:'local',l:'Local'},{k:'responsavel',l:'Responsável'},{k:'data',l:'Data'},{k:'status',l:'Status'}],
  documentos: [{k:'titulo',l:'Título'},{k:'empresa',l:'Empresa'},{k:'vencimento',l:'Vencimento'}],
  exames: [{k:'nome',l:'Funcionário'},{k:'tipo',l:'Tipo Exame'},{k:'data',l:'Data'},{k:'resultado',l:'Resultado'},{k:'clinica',l:'Clínica'}],
  empresas: [{k:'nome',l:'Nome da Empresa'},{k:'cnpj',l:'CNPJ'},{k:'responsavel',l:'Responsável'},{k:'telefone',l:'Telefone'},{k:'email',l:'E-mail da Empresa'},{k:'login',l:'Login de Acesso'},{k:'senha',l:'Senha Única'}],
}

const EPIS_PRONTOS = [
  'Capacete de Segurança','Capacete com Jugular','Óculos de Proteção','Óculos de Proteção Incolor','Protetor Auricular Tipo Concha','Protetor Auricular Tipo Plug','Máscara PFF2','Respirador PFF2','Luva de Vaqueta','Luva de Borracha','Luva de Raspa','Luva Nitrílica','Bota de Segurança','Botina de Segurança','Sapato de Segurança','Cinto de Segurança Paraquedista','Talabarte','Trava Quedas','Colete Refletivo','Uniforme / Fardamento','Capa de Chuva','Protetor Solar','Creme de Proteção','Avental de Raspa','Perneira de Raspa','Mangote','Abafador de Ruído'
]

const PASTAS = [
  { id:'PGR', nome:'PGR', icone:'📁', cor:'#0d9488' },
  { id:'PCMSO', nome:'PCMSO', icone:'📁', cor:'#2563eb' },
  { id:'ASO', nome:'ASO / Exames', icone:'🩺', cor:'#22c55e' },
  { id:'Laudos', nome:'Laudos', icone:'📋', cor:'#f59e0b' },
  { id:'Treinamentos', nome:'Treinamentos', icone:'🎓', cor:'#8b5cf6' },
  { id:'Outros', nome:'Outros', icone:'📦', cor:'#64748b' },
]

const CORES_CARDS: any = {
  funcionarios: 'linear-gradient(135deg,#14b8a6,#06b6d4)',
  epis: 'linear-gradient(135deg,#22c55e,#84cc16)',
  extintores: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
  inspecoes: 'linear-gradient(135deg,#10b981,#14b8a6)',
  documentos: 'linear-gradient(135deg,#2563eb,#22d3ee)',
}

function gerarSenhaForte() {
  const letras = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
  const nums = '23456789'
  const simb = '@!#'
  let s = ''
  for(let i=0;i<4;i++) s += letras[Math.floor(Math.random()*letras.length)]
  for(let i=0;i<3;i++) s += nums[Math.floor(Math.random()*nums.length)]
  s += simb[Math.floor(Math.random()*simb.length)]
  return 'Previx' + s
}
function gerarPIN() { return Math.floor(1000 + Math.random()*9000).toString() }
const ADMIN = { login: 'cristiano', senha: 'previx123', nome: 'Cristiano', tipo: 'admin', empresa: 'Todas' }

export default function Home() {
  const [dados, setDados] = useState<any>({ funcionarios: [], epis: [], extintores: [], inspecoes: [], documentos: [], exames: [], empresas: [] })
  const [aba, setAba] = useState('inicio')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<any>(null)
  const [form, setForm] = useState<any>({})
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

  useEffect(() => {
    const sess = localStorage.getItem('previx_session')
    if (sess) { try { setUsuario(JSON.parse(sess)) } catch {} }
    carregar()
    setCarregando(false)
  }, [])

  async function carregar() {
    const urls = ['funcionarios','epis','extintores','inspecoes','documentos','exames','empresas']
    const res: any = {}
    for (const u of urls) {
      try { const r = await fetch(`/api/${u}`); const j = await r.json(); res[u] = Array.isArray(j) ? j : j.data || [] } catch { res[u] = [] }
    }
    try {
      const localEmp = JSON.parse(localStorage.getItem('previx_empresas')||'[]')
      if (localEmp.length) res.empresas = localEmp
      if (!localEmp.find((e:any)=>e.login==='solnascente')) {
        const sol = { id: 'sol1', nome: 'Solnascente LTDA', cnpj: '', responsavel: 'Ronaldo', telefone: '82994145622', email: 'Lojas.cs16486@gmail.com', login: 'solnascente', senha: '12345678', status: 'Ativa' }
        if (!res.empresas.find((e:any)=>e.login==='solnascente')) res.empresas.push(sol)
        localStorage.setItem('previx_empresas', JSON.stringify(res.empresas))
      }
    } catch {}
    try {
      const localDados = JSON.parse(localStorage.getItem('previx_dados')||'{}')
      if (localDados.funcionarios) res.funcionarios = localDados.funcionarios
      if (localDados.documentos) res.documentos = localDados.documentos.map((d:any)=>({...d, pasta: d.pasta || d.tipo || 'Outros', tipo: d.pasta || d.tipo || 'Outros'}))
      if (localDados.empresas) res.empresas = localDados.empresas
      if (localDados.epis) res.epis = localDados.epis
    } catch {}
    if (res.funcionarios) {
      let mudou = false
      res.funcionarios = res.funcionarios.map((f:any)=>{
        if (!f.pin) { mudou = true; return {...f, pin: gerarPIN()} }
        return f
      })
      if (mudou) { try { const ld = JSON.parse(localStorage.getItem('previx_dados')||'{}'); ld.funcionarios = res.funcionarios; localStorage.setItem('previx_dados', JSON.stringify(ld)) } catch {} }
    }
    setDados(res)
  }

  function salvarNoNavegador(novosDados:any) {
    try { localStorage.setItem('previx_empresas', JSON.stringify(novosDados.empresas||[])); localStorage.setItem('previx_dados', JSON.stringify(novosDados)) } catch(e) { alert('⚠️ Arquivo muito grande! Tenta um PDF menor que 4MB.') }
  }

  // ===== DIGITAL - BIOMETRIA DO CELULAR (WebAuthn) =====
  function celularTemDigital() {
    return typeof window !== 'undefined' && !!window.PublicKeyCredential
  }
  function bufParaBase64(buf:any) {
    let s = ''
    const bytes = new Uint8Array(buf)
    for (let i=0;i<bytes.length;i++) s += String.fromCharCode(bytes[i])
    return btoa(s)
  }
  function base64ParaBuf(b64:string) {
    const s = atob(b64)
    const bytes = new Uint8Array(s.length)
    for (let i=0;i<s.length;i++) bytes[i] = s.charCodeAt(i)
    return bytes.buffer
  }
  async function confirmarComDigital() {
    if (!funcSelecionado) { setDigitalMsg('⚠️ Primeiro escolhe o funcionário!'); return }
    if (!celularTemDigital()) { setDigitalMsg('❌ Esse aparelho não tem digital / Face ID. Usa PIN ou assinatura.'); return }
    setDigitalCarregando(true); setDigitalMsg('👆 Encosta o dedo / mostra o rosto agora...')
    try {
      const chaveFunc = (funcSelecionado.cpf || funcSelecionado.nome || '').toString()
      const salvas: any = JSON.parse(localStorage.getItem('previx_digital') || '{}')
      const idSalvo = salvas[chaveFunc]
      const challenge = new Uint8Array(32)
      window.crypto.getRandomValues(challenge)

      if (idSalvo) {
        try {
          const cred: any = await navigator.credentials.get({
            publicKey: {
              challenge,
              timeout: 60000,
              userVerification: 'required',
              allowCredentials: [{ id: base64ParaBuf(idSalvo), type: 'public-key', transports: ['internal'] }]
            }
          } as any)
          if (cred) {
            setDigitalOk(true)
            setDigitalMsg('✅ Digital confirmada! Pode salvar sem PIN e sem assinatura.')
            setPinErro('')
            setDigitalCarregando(false)
            return
          }
        } catch (e:any) {
          console.log('Falhou ler, vai criar nova', e)
        }
      }

      setDigitalMsg('👆 Primeira vez! Vai aparecer pra criar a chave. Encosta o dedo...')
      const userId = new TextEncoder().encode(chaveFunc.slice(0, 32))
      const nova: any = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'PREVIX SST', id: window.location.hostname },
          user: { id: userId, name: funcSelecionado.nome || 'funcionario', displayName: funcSelecionado.nome || 'Funcionario' },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
          authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', requireResidentKey: true },
          timeout: 60000,
          attestation: 'none'
        }
      } as any)

      if (nova) {
        salvas[chaveFunc] = bufParaBase64(nova.rawId)
        localStorage.setItem('previx_digital', JSON.stringify(salvas))
        setDigitalOk(true)
        setDigitalMsg('✅ Digital cadastrada e confirmada! Da próxima vez já vai direto.')
        setPinErro('')
      } else {
        setDigitalMsg('❌ Não confirmou. Tenta de novo.')
      }
    } catch (err: any) {
      console.log(err)
      if (err?.name === 'NotAllowedError') setDigitalMsg('❌ Cancelado / tempo acabou. Tenta de novo ou usa PIN / assinatura.')
      else if (err?.name === 'NotSupportedError') setDigitalMsg('❌ Aparelho sem biometria. Usa PIN ou assinatura.')
      else if (err?.name === 'InvalidStateError') setDigitalMsg('⚠️ Essa digital já tá cadastrada. Tenta de novo.')
      else setDigitalMsg('❌ Não deu pra ler a digital. Tenta de novo ou usa PIN / assinatura.')
    }
    setDigitalCarregando(false)
  }

  // ===== ASSINATURA NO CANVAS =====
  function iniciarAssinatura(e:any) {
    const canvas = canvasRef.current; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
    const ctx = canvas.getContext('2d'); ctx.beginPath(); ctx.moveTo(x,y); ctx.lineWidth = 2.5; ctx.strokeStyle = '#0f172a'; ctx.lineCap = 'round'
    setDesenhando(true)
  }
  function desenharAssinatura(e:any) {
    if (!desenhando) return
    const canvas = canvasRef.current; const rect = canvas.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
    const ctx = canvas.getContext('2d'); ctx.lineTo(x,y); ctx.stroke()
    setTemAssinatura(true)
  }
  function terminarAssinatura() {
    if (!desenhando) return
    setDesenhando(false)
    const canvas = canvasRef.current
    if (canvas) setAssinatura(canvas.toDataURL('image/png'))
  }
  function limparAssinatura() {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height)
    setAssinatura(''); setTemAssinatura(false)
  }

  // ===== GERAR PDF DO TERMO =====
  function gerarTermoPDF(entrega:any) {
    const func = (dados.funcionarios||[]).find((f:any)=>f.nome===entrega.funcionario) || {}
    const empresaNome = entrega.empresa || func.empresa || usuario?.empresa || 'PREVIX SST'
    const dataFmt = entrega.data_entrega ? entrega.data_entrega.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR')
    const hojeFmt = new Date().toLocaleDateString('pt-BR')
    const assinaturaImg = entrega.assinatura || assinatura || ''
    const metodo = entrega.metodo || (entrega.assinatura ? 'Assinatura' : entrega.pinConfirmado ? 'PIN / Digital' : 'PIN')
    const html = `
    <html><head><meta charset="utf-8"><title>Termo de Entrega EPI - ${entrega.funcionario}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:40px;color:#0f172a;max-width:800px;margin:0 auto}
      .topo{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0d9488;padding-bottom:16px}
      .logo{font-size:28px;font-weight:900;letter-spacing:1px}.logo span{color:#0d9488}
      .sub{font-size:11px;letter-spacing:2px;color:#0d9488;font-weight:800}
      h1{text-align:center;font-size:20px;margin:28px 0 8px;text-transform:uppercase}
      .subtitulo{text-align:center;color:#64748b;font-size:13px;margin-bottom:24px}
      .caixa{border:1px solid #cbd5e1;border-radius:12px;padding:16px;margin:12px 0}
      .linha{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #e2e8f0;font-size:14px}
      .linha b{color:#0f172a}.linha span{color:#334155}
      .termo{font-size:14px;line-height:1.7;text-align:justify;margin:20px 0}
      .assinatura{margin-top:40px;text-align:center}
      .assinatura img{max-width:280px;max-height:100px}
      .linha-ass{border-top:1px solid #0f172a;width:320px;margin:8px auto 4px}
      .rodape{margin-top:30px;border-top:1px solid #e2e8f0;padding-top:12px;font-size:11px;color:#64748b;text-align:center}
      .selo{display:inline-block;background:#dcfce7;color:#15803d;padding:6px 14px;border-radius:20px;font-weight:800;font-size:12px}
      @media print{button{display:none}}
    </style></head><body>
      <div class="topo"><div><div class="logo">PREVIX <span>SST</span></div><div class="sub">PREVENÇÃO QUE PROTEGE</div></div><div style="text-align:right;font-size:12px;color:#64748b">Termo de Entrega de EPI<br><b style="color:#0f172a">Nº ${entrega.id?.toString().slice(-6) || '000001'}</b></div></div>
      <h1>Termo de Entrega de Equipamento de Proteção Individual</h1>
      <p class="subtitulo">Conforme NR-06 - Portaria 3.214/78 - Ministério do Trabalho</p>
      <div style="text-align:center"><span class="selo">✅ ENTREGA CONFIRMADA • MÉTODO: ${metodo.toUpperCase()}</span></div>
      <div class="caixa">
        <div class="linha"><b>🏢 Empresa:</b><span>${empresaNome}</span></div>
        <div class="linha"><b>👷 Funcionário:</b><span>${entrega.funcionario || '-'}</span></div>
        <div class="linha"><b>📄 CPF:</b><span>${func.cpf || entrega.funcionarioCpf || '-'}</span></div>
        <div class="linha"><b>💼 Cargo:</b><span>${func.cargo || entrega.funcionarioCargo || '-'}</span></div>
        <div class="linha"><b>📞 Telefone:</b><span>${func.telefone || '-'}</span></div>
      </div>
      <div class="caixa">
        <div class="linha"><b>🦺 EPI Entregue:</b><span>${entrega.nome || '-'}</span></div>
        <div class="linha"><b>📦 Tipo / Modelo / CA:</b><span>${entrega.tipo || '-'}</span></div>
        <div class="linha"><b>🔢 Quantidade:</b><span>${entrega.quantidade || '1'}</span></div>
        <div class="linha"><b>📅 Data da Entrega:</b><span>${dataFmt}</span></div>
        <div class="linha"><b>🔑 Confirmação:</b><span>${metodo} validado no sistema PREVIX</span></div>
      </div>
      <p class="termo">Declaro que recebi nesta data o Equipamento de Proteção Individual acima descrito, em perfeito estado de conservação e funcionamento, comprometendo-me a utilizá-lo apenas para a finalidade a que se destina, a conservá-lo em perfeitas condições de uso, a comunicar ao meu empregador qualquer alteração que o torne impróprio para uso e a devolvê-lo quando solicitado. Estou ciente de que o uso incorreto ou a recusa injustificada do EPI constitui ato faltoso, conforme Art. 158 da CLT e NR-06.</p>
      <div class="assinatura">
        ${assinaturaImg ? `<img src="${assinaturaImg}" />` : `<div style="height:60px"></div>`}
        <div class="linha-ass"></div>
        <div style="font-weight:800">${entrega.funcionario || ''}</div>
        <div style="font-size:12px;color:#64748b">CPF: ${func.cpf || entrega.funcionarioCpf || '-'} • ${metodo === 'Digital' ? 'Confirmado por biometria do celular' : 'Assinatura do Funcionário'}</div>
      </div>
      <div style="margin-top:36px;display:flex;justify-content:space-between">
        <div style="text-align:center;flex:1"><div style="border-top:1px solid #0f172a;width:220px;margin:0 auto"></div><div style="font-size:12px;margin-top:4px">Responsável SST / PREVIX<br><b>Cristiano</b></div></div>
        <div style="text-align:center;flex:1"><div style="font-size:12px">Data: ${hojeFmt}</div><div style="font-size:11px;color:#64748b">Gerado pelo sistema PREVIX SST</div></div>
      </div>
      <div class="rodape">PREVIX - Prevenção que Protege • Documento gerado automaticamente após PIN OU assinatura OU biometria • Validade conforme NR-06</div>
      <div style="text-align:center;margin-top:20px"><button onclick="window.print()" style="background:#0d9488;color:white;border:none;padding:14px 28px;border-radius:20px;font-weight:800;cursor:pointer;font-size:14px">🖨️ Imprimir / Salvar como PDF</button></div>
    </body></html>`
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() }
    else { alert('Libera o pop-up do navegador pra abrir o PDF!') }
  }

  function handleArquivo(e:any) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) { alert('⚠️ Arquivo muito grande! Máximo 4MB.'); return }
    setSubindoArquivo(true); setArquivoNome(file.name)
    const reader = new FileReader()
    reader.onload = () => { setForm((prev:any)=>({...prev, arquivoNome: file.name, arquivoTipo: file.type || 'application/pdf', arquivoTamanho: file.size, arquivoData: reader.result, titulo: prev.titulo || file.name.replace('.pdf','').replace(/_/g,' ') })); setSubindoArquivo(false) }
    reader.readAsDataURL(file)
  }
  function baixarArquivo(item:any) {
    if (!item.arquivoData) { alert('Esse documento não tem arquivo anexado.'); return }
    const a = document.createElement('a'); a.href = item.arquivoData; a.download = item.arquivoNome || `${item.titulo || 'documento'}.pdf`; a.click()
  }
  function verArquivo(item:any) {
    if (!item.arquivoData) { alert('Esse documento não tem arquivo anexado.'); return }
    const w = window.open(); if (w) { w.document.write(`<iframe src="${item.arquivoData}" style="width:100%;height:100vh;border:none"></iframe>`) } else baixarArquivo(item)
  }
  function moverPasta(item:any, novaPasta:string) {
    const lista = [...(dados.documentos||[])]
    const idx = lista.findIndex((x:any)=>(x.id||x._id)===(item.id||item._id))
    if (idx>=0) { lista[idx] = {...lista[idx], pasta: novaPasta, tipo: novaPasta}; const nd={...dados, documentos: lista}; setDados(nd); salvarNoNavegador(nd) }
  }
  function fazerLogin() {
    setErroLogin('')
    const login = loginForm.login.trim().toLowerCase(); const senha = loginForm.senha.trim()
    if (login === ADMIN.login && senha === ADMIN.senha) { setUsuario(ADMIN); localStorage.setItem('previx_session', JSON.stringify(ADMIN)); setAba('inicio'); return }
    if (login === 'admin' && senha === 'admin') { setUsuario(ADMIN); localStorage.setItem('previx_session', JSON.stringify(ADMIN)); setAba('inicio'); return }
    const emp = (dados.empresas||[]).find((e:any)=> (e.login||'').toLowerCase() === login && (e.senha||'') === senha)
    if (emp) { const u = { login: emp.login, senha: emp.senha, nome: emp.responsavel || emp.nome, tipo: 'empresa', empresa: emp.nome, empresaId: emp.id }; setUsuario(u); localStorage.setItem('previx_session', JSON.stringify(u)); setAba('inicio'); return }
    setErroLogin('Login ou senha incorretos! Confere e tenta de novo.')
  }
  function sair() { setUsuario(null); localStorage.removeItem('previx_session'); setLoginForm({login:'',senha:''}); setAba('inicio'); setPastaAtual('Todas') }

  function abrirNovo() {
    setEditando(null); setArquivoNome(''); setPastaSelecionadaForm(pastaAtual!=='Todas' ? pastaAtual : 'PGR')
    setBuscaEPI(''); setBuscaFunc(''); setMostrarSugestoesFunc(false); setPinDigitado(''); setPinErro(''); setFuncSelecionado(null); setVerPIN(false); setAssinatura(''); setTemAssinatura(false); setDigitalOk(false); setDigitalMsg(''); setDigitalCarregando(false)
    if (aba === 'empresas') setForm({ senha: gerarSenhaForte(), status: 'Ativa', plano: 'Mensal' })
    else if (aba === 'funcionarios') { const pinNovo = gerarPIN(); if (usuario?.tipo === 'empresa') setForm({ empresa: usuario.empresa, pin: pinNovo }); else setForm({ pin: pinNovo }) }
    else if (aba === 'epis') { const hoje = new Date().toISOString().split('T')[0]; if (usuario?.tipo === 'empresa') setForm({ empresa: usuario.empresa, data_entrega: hoje, quantidade: '1' }); else setForm({ data_entrega: hoje, quantidade: '1' }) }
    else if (usuario?.tipo === 'empresa') setForm({ empresa: usuario.empresa, pasta: pastaAtual!=='Todas' ? pastaAtual : 'PGR', tipo: pastaAtual!=='Todas' ? pastaAtual : 'PGR' })
    else setForm({ pasta: pastaAtual!=='Todas' ? pastaAtual : 'PGR', tipo: pastaAtual!=='Todas' ? pastaAtual : 'PGR', empresa: '' })
    setVerSenha(false); setModal(true)
    setTimeout(()=>{ const c = canvasRef.current; if (c) { const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height) } }, 100)
  }
  function abrirEditar(item:any) {
    setEditando(item); setForm(item); setArquivoNome(item.arquivoNome||''); setPastaSelecionadaForm(item.pasta||item.tipo||'Outros')
    setBuscaEPI(item.nome||''); setBuscaFunc(item.funcionario||''); setPinDigitado(''); setPinErro('')
    const f = (dados.funcionarios||[]).find((x:any)=>x.nome===item.funcionario); setFuncSelecionado(f||null)
    setAssinatura(item.assinatura||''); setTemAssinatura(!!item.assinatura)
    setDigitalOk(item.metodo==='Digital'); setDigitalMsg(item.metodo==='Digital' ? '✅ Digital já confirmada nessa entrega' : '')
    setVerSenha(false); setModal(true)
    setTimeout(()=>{ if (item.assinatura) { const c = canvasRef.current; if (c) { const img = new Image(); img.onload=()=>{ const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height); ctx.drawImage(img,0,0,c.width,c.height) }; img.src=item.assinatura } } }, 200)
  }
  function copiar(texto:string, id:string) { navigator.clipboard.writeText(texto); setSenhaCopiada(id); setTimeout(()=>setSenhaCopiada(''), 2000) }
  function copiarPIN(pin:string, nome:string) { navigator.clipboard.writeText(`Olá ${nome}! Seu PIN de entrega de EPI no PREVIX é: ${pin}. Não passa pra ninguém!`); setPinCopiado(nome); setTimeout(()=>setPinCopiado(''), 2000) }

  async function salvar() {
    if (!aba || aba==='inicio') return
    let formFinal = {...form}
    if (aba==='funcionarios') { if (!formFinal.pin) formFinal.pin = gerarPIN(); if (!formFinal.nome) { alert('⚠️ Coloca o nome do funcionário!'); return } }
    if (aba==='epis') {
      if (!formFinal.nome) { alert('⚠️ Escolhe o EPI!'); return }
      if (!formFinal.funcionario) { alert('⚠️ Escolhe o funcionário!'); return }
      if (!formFinal.data_entrega) formFinal.data_entrega = new Date().toISOString().split('T')[0]
      if (!editando) {
        const funcReal = (dados.funcionarios||[]).find((f:any)=> f.nome === formFinal.funcionario) || funcSelecionado
        const pinOk = !funcReal?.pin || (pinDigitado && pinDigitado === funcReal.pin)
        const assinaturaOk = temAssinatura || !!assinatura
        const digitalOkFinal = digitalOk
        if (funcReal?.pin && pinDigitado && pinDigitado !== funcReal.pin && !assinaturaOk && !digitalOkFinal) {
          setPinErro('❌ PIN incorreto! Tenta de novo OU pede pra assinar OU usa a digital.');
          return
        }
        if (!pinOk && !assinaturaOk && !digitalOkFinal) {
          setPinErro('⚠️ Digita o PIN OU pede pra assinar OU usa a digital!');
          return
        }
        formFinal.assinatura = assinatura || formFinal.assinatura || ''
        formFinal.pinConfirmado = true
        if (digitalOkFinal) formFinal.metodo = 'Digital'
        else if (assinaturaOk) formFinal.metodo = 'Assinatura'
        else if (pinOk) formFinal.metodo = 'PIN'
        else formFinal.metodo = 'PIN'
        formFinal.entregueParaCpf = funcReal?.cpf || ''
      } else {
        if (assinatura) formFinal.assinatura = assinatura
        if (digitalOk) formFinal.metodo = 'Digital'
      }
    }
    if (aba==='documentos') {
      formFinal.pasta = pastaSelecionadaForm || formFinal.pasta || 'Outros'; formFinal.tipo = formFinal.pasta
      if (!formFinal.titulo) { alert('⚠️ Coloca o título!'); return }
      if (usuario?.tipo === 'admin' && !formFinal.empresa) { const empEscolhida = prompt('Qual empresa é dona desse arquivo? Ex: Solnascente LTDA'); if (empEscolhida) formFinal.empresa = empEscolhida; else formFinal.empresa = 'GERAL - Só Admin' }
      if (usuario?.tipo === 'empresa') formFinal.empresa = usuario.empresa
    }
    if (aba==='empresas') { if (!formFinal.login && formFinal.nome) formFinal.login = formFinal.nome.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,12); if (!formFinal.senha) formFinal.senha = gerarSenhaForte() }
    if (usuario?.tipo==='empresa') formFinal.empresa = usuario.empresa
    const lista = [...(dados[aba]||[])]
    if (editando) {
      const id = editando.id || editando._id; const idx = lista.findIndex((x:any)=>(x.id||x._id)===id)
      if (idx>=0) lista[idx] = {...lista[idx], ...formFinal}
      const nd = {...dados, [aba]: lista}; setDados(nd); salvarNoNavegador(nd)
      if (aba==='epis') { if (confirm('✅ Entrega atualizada! Quer gerar o PDF do termo agora?')) gerarTermoPDF({...lista[idx]}) }
    } else {
      const novo = { ...formFinal, id: Date.now().toString(), status: formFinal.status || 'Ativa' }
      lista.push(novo); const nd = {...dados, [aba]: lista}; setDados(nd); salvarNoNavegador(nd)
      if (aba==='empresas') alert(`✅ Empresa criada!\n\nLogin: ${novo.login}\nSenha: ${novo.senha}`)
      if (aba==='documentos') alert(`✅ Salvo na pasta ${novo.pasta}!`)
      if (aba==='funcionarios') alert(`✅ Funcionário cadastrado!\n\n👷 ${novo.nome}\n🔑 PIN dele: ${novo.pin}`)
      if (aba==='epis') { 
        const querPDF = confirm(`✅ Entrega CONFIRMADA com ${novo.metodo || 'PIN'}!\n\n🦺 ${novo.nome}\n👷 ${novo.funcionario}\n📅 ${novo.data_entrega}\n\nQuer gerar o PDF do Termo de Entrega agora?`)
        if (querPDF) gerarTermoPDF(novo)
      }
    }
    setModal(false); setForm({}); setEditando(null); setArquivoNome(''); setBuscaEPI(''); setBuscaFunc(''); setPinDigitado(''); setFuncSelecionado(null); setAssinatura(''); setTemAssinatura(false); setDigitalOk(false); setDigitalMsg('')
  }

  async function excluir(item:any) {
    if (!confirm(`Excluir ${item.nome || item.titulo || 'esse registro'}?`)) return
    const id = item.id || item._id; try { await fetch(`/api/${aba}/${id}`, { method:'DELETE' }) } catch {}
    const novaLista = (dados[aba]||[]).filter((x:any)=>(x.id||x._id)!==id); const nd = {...dados, [aba]: novaLista}; setDados(nd); salvarNoNavegador(nd)
  }

  function dadosFiltradosPorEmpresa(lista:any[]) {
    if (!usuario) return []
    if (usuario.tipo === 'admin') return lista
    return lista.filter((it:any)=>{ if (!it.empresa) return false; const empItem = it.empresa.toLowerCase(); const empUser = usuario.empresa.toLowerCase(); if (empItem.includes('geral')) return false; if (empItem === empUser) return true; if (empItem.includes(empUser.split(' ')[0].toLowerCase()) && empUser.split(' ')[0].length > 3) return true; if (empUser.includes(empItem.split(' ')[0].toLowerCase()) && empItem.split(' ')[0].length > 3) return true; return false })
  }
  function iniciais(nome:string) { if (!nome) return '??'; const p = nome.split(' ').filter(Boolean); if (p.length===1) return p[0].slice(0,2).toUpperCase(); return (p[0][0]+p[1][0]).toUpperCase() }

  const btn = { padding:'8px 14px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:700, fontSize:13 } as any
  const input = { width:'100%', padding:'12px', borderRadius:12, border:'1px solid #cbd5e1', fontSize:14, boxSizing:'border-box' as any }

  if (carregando) return <div style={{padding:40, textAlign:'center'}}>Carregando PREVIX...</div>
  if (!usuario) {
    return (
      <div style={{minHeight:'100vh', background:'linear-gradient(135deg,#0d9488,#2563eb)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, fontFamily:'Arial, sans-serif'}}>
        <div style={{background:'white', borderRadius:24, padding:32, width:'100%', maxWidth:420, boxShadow:'0 20px 50px rgba(0,0,0,0.3)'}}>
          <div style={{textAlign:'center'}}><img src="/logo.png" alt="PREVIX" style={{width:80,height:80,objectFit:'contain',background:'white',borderRadius:16,padding:8, border:'1px solid #e2e8f0'}} /><h1 style={{fontSize:32, fontWeight:900, margin:'12px 0 0', letterSpacing:1, color:'#0f172a'}}>PREVIX</h1><p style={{color:'#0d9488', fontWeight:800, fontSize:11, letterSpacing:2, margin:'4px 0 0'}}>PREVENÇÃO QUE PROTEGE</p><p style={{color:'#64748b', marginTop:16}}>Acesse seu painel SST</p></div>
          <div style={{display:'flex', flexDirection:'column', gap:12, marginTop:20}}>
            <div><label style={{fontSize:13, fontWeight:700}}>👤 Login</label><input value={loginForm.login} onChange={e=>setLoginForm({...loginForm, login:e.target.value})} placeholder="Ex: solnascente" style={{...input, marginTop:4}} /></div>
            <div><label style={{fontSize:13, fontWeight:700}}>🔐 Senha</label><input type="password" value={loginForm.senha} onChange={e=>setLoginForm({...loginForm, senha:e.target.value})} onKeyDown={e=>{if(e.key==='Enter') fazerLogin()}} placeholder="Sua senha única" style={{...input, marginTop:4}} /></div>
            {erroLogin && <div style={{background:'#fee2e2', color:'#b91c1c', padding:10, borderRadius:10, fontSize:13, fontWeight:700}}>{erroLogin}</div>}
            <button onClick={fazerLogin} style={{...btn, background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:14, fontSize:15, borderRadius:12}}>Entrar →</button>
          </div>
        </div>
      </div>
    )
  }

  const isAdmin = usuario.tipo === 'admin'
  const menuBase = [{id:'inicio',label:'Início',icone:'🏠'},{id:'funcionarios',label:'Funcionários',icone:'👷'},{id:'epis',label:"EPI's",icone:'🦺'},{id:'extintores',label:'Extintores',icone:'🧯'},{id:'inspecoes',label:'Inspeções',icone:'📋'},{id:'documentos',label:'Documentos',icone:'📄'},{id:'exames',label:'Exames',icone:'🩺'}]
  const menu = isAdmin ? [...menuBase, {id:'empresas',label:'Empresas',icone:'🏢'}] : menuBase
  const funcs = dadosFiltradosPorEmpresa(dados.funcionarios||[])
  const episF = dadosFiltradosPorEmpresa(dados.epis||[])
  const extF = dadosFiltradosPorEmpresa(dados.extintores||[])
  const inspF = dadosFiltradosPorEmpresa(dados.inspecoes||[])
  const docF = dadosFiltradosPorEmpresa(dados.documentos||[])
  const docsComArquivo = docF.filter((d:any)=>d.arquivoData).length
  const contarPasta = (p:string) => docF.filter((d:any)=>(d.pasta||d.tipo||'Outros')===p).length
  const episJaUsados = Array.from(new Set((dados.epis||[]).map((e:any)=>e.nome).filter(Boolean)))
  const todosEPIs = Array.from(new Set([...EPIS_PRONTOS, ...episJaUsados]))
  const episFiltrados = todosEPIs.filter((e:any)=> e.toLowerCase().includes(buscaEPI.toLowerCase())).slice(0,8)
  const funcsParaBusca = (dados.funcionarios||[]).filter((f:any)=>{ if (usuario?.tipo==='empresa') { if (!f.empresa) return true; return f.empresa.toLowerCase().includes(usuario.empresa.toLowerCase().split(' ')[0].toLowerCase()) } return true })
  const funcsFiltrados = funcsParaBusca.filter((f:any)=>{ if (!buscaFunc) return true; const termo = buscaFunc.toLowerCase(); return (f.nome||'').toLowerCase().includes(termo) || (f.cpf||'').replace(/\D/g,'').includes(termo.replace(/\D/g,'')) || (f.cargo||'').toLowerCase().includes(termo) }).slice(0,6)
  const cards = [
    { titulo:'Funcionários', valor:funcs.length, sub:'Cadastrados', icone:'👷', cor:'linear-gradient(135deg,#14b8a6,#06b6d4)', aba:'funcionarios' },
    { titulo:"EPI's", valor:episF.length, sub:'Entregues', icone:'🦺', cor:'linear-gradient(135deg,#22c55e,#84cc16)', aba:'epis' },
    { titulo:'Extintores', valor:extF.length, sub:'Cadastrados', icone:'🧯', cor:'linear-gradient(135deg,#3b82f6,#06b6d4)', aba:'extintores' },
    { titulo:'Inspeções', valor:inspF.length, sub:'Realizadas', icone:'📋', cor:'linear-gradient(135deg,#10b981,#14b8a6)', aba:'inspecoes' },
    { titulo:'Documentos', valor:docF.length, sub:`${docsComArquivo} com PDF`, icone:'📄', cor:'linear-gradient(135deg,#2563eb,#22d3ee)', aba:'documentos' },
  ]
  const listaBase = dados[aba]||[]
  const listaPorEmpresa = dadosFiltradosPorEmpresa(listaBase)
  let listaFiltrada = listaPorEmpresa.filter((it:any)=> JSON.stringify(it).toLowerCase().includes(busca.toLowerCase()))
  if (aba==='documentos' && pastaAtual!=='Todas') listaFiltrada = listaFiltrada.filter((it:any)=>(it.pasta||it.tipo||'Outros')===pastaAtual)

  return (
    <div style={{minHeight:'100vh', background:'#ecfeff', fontFamily:'Arial, sans-serif'}}>
      <header style={{background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:'12px 16px', position:'sticky', top:0, zIndex:50}}>
        <div style={{maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}><img src="/logo.png" alt="PREVIX" style={{width:44,height:44,objectFit:'contain',background:'white',borderRadius:12,padding:4}} /><div><div style={{fontWeight:900,fontSize:20,letterSpacing:1,lineHeight:1}}>PREVIX <span style={{fontSize:12, fontWeight:700, background:'rgba(255,255,255,0.2)', padding:'2px 8px', borderRadius:20}}>SST</span></div><div style={{fontSize:10,letterSpacing:2,color:'#a7f3d0',fontWeight:700}}>PREVENÇÃO QUE PROTEGE</div></div></div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}><span style={{fontSize:12, background: isAdmin ? '#f97316' : '#22c55e', padding:'6px 12px', borderRadius:20, fontWeight:700}}>{isAdmin ? '👨‍💼 SUPER ADMIN' : `🏢 ${usuario.empresa}`}</span><button onClick={sair} style={{...btn, background:'white', color:'#0f172a', borderRadius:20}}>Sair</button></div>
        </div>
        <div style={{maxWidth:1200, margin:'12px auto 0', display:'flex', gap:8, overflowX:'auto', paddingBottom:4}}>{menu.map(m=>(<button key={m.id} onClick={()=>{setAba(m.id); setBusca(''); setPastaAtual('Todas')}} style={{whiteSpace:'nowrap', padding:'8px 16px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:14, background: aba===m.id?'white':'rgba(255,255,255,0.15)', color: aba===m.id?'#0f766e':'white'}}>{m.icone} {m.label}</button>))}</div>
      </header>
      <main style={{maxWidth:1200, margin:'0 auto', padding:16}}>
        {aba==='inicio' && (<>
          <div style={{background:'linear-gradient(135deg,#ffffff,#ecfeff)', borderRadius:24, padding:24, display:'flex', justifyContent:'space-between', gap:16, flexWrap:'wrap', border:'1px solid #a7f3d0'}}><div><div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:'#0d9488'}}>{isAdmin ? 'SUPER ADMIN • VOCÊ ESTÁ VENDO TUDO' : `EMPRESA • VOCÊ ESTÁ VENDO SÓ: ${usuario.empresa.toUpperCase()}`}</div><h2 style={{fontSize:32,fontWeight:900,margin:'8px 0 0', color:'#0f172a'}}>Olá, {usuario.nome}! 👋</h2><p style={{color:'#64748b'}}>Bem-vindo ao seu painel SST • <b style={{color:'#0f766e'}}>{isAdmin ? 'Todas as empresas' : usuario.empresa}</b></p></div><span style={{background:'#dcfce7',color:'#15803d',padding:'8px 16px',borderRadius:20,fontSize:14,fontWeight:800,height:'fit-content'}}>✅ PREVIX Completo!</span></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:16,marginTop:20}}>{cards.map(c=>(<button key={c.titulo} onClick={()=>setAba(c.aba)} style={{background:c.cor,borderRadius:24,padding:20,textAlign:'left',border:'none',cursor:'pointer', color:'white'}}><div style={{width:48,height:48,background:'rgba(255,255,255,0.25)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{c.icone}</div><div style={{color:'rgba(255,255,255,0.9)',fontSize:14,marginTop:16, fontWeight:700}}>{c.titulo}</div><div style={{fontSize:38,fontWeight:900, lineHeight:1}}>{c.valor}</div><div style={{fontSize:12,color:'rgba(255,255,255,0.85)'}}>{c.sub} • Clique para abrir →</div></button>))}</div>
          <div style={{background:'white',borderRadius:24,padding:20,border:'1px solid #a7f3d0',marginTop:20}}><h3 style={{margin:'0 0 4px',fontWeight:900, color:'#0f766e'}}>📁 Pastas de Documentos • {usuario.empresa}</h3><p style={{margin:'0 0 12px', fontSize:13, color:'#64748b'}}>PIN OU Assinatura OU Digital + PDF = prova completa!</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}>{PASTAS.map(p=>(<button key={p.id} onClick={()=>{setAba('documentos'); setPastaAtual(p.id)}} style={{textAlign:'left', background:'#f0fdfa', border:'1px solid #ccfbf1', borderRadius:16, padding:14, cursor:'pointer'}}><div style={{fontSize:22}}>{p.icone}</div><div style={{fontWeight:900, color:'#0f172a', marginTop:6}}>{p.nome}</div><div style={{fontSize:12, color:'#64748b'}}>{contarPasta(p.id)} arquivo(s)</div></button>))}</div></div>
        </>)}
        {aba!=='inicio' && (
          <div style={{background:'white',borderRadius:24,padding:24,border:'1px solid #a7f3d0'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}><div><h2 style={{fontSize:24,fontWeight:900,textTransform:'capitalize',margin:0, color:'#0f172a'}}>{aba} {aba==='documentos' && pastaAtual!=='Todas' && <span style={{fontSize:14, color:'#0d9488'}}>• 📁 {pastaAtual}</span>} {!isAdmin && <span style={{fontSize:13, fontWeight:400, color:'#0d9488'}}>- só {usuario.empresa}</span>}</h2><p style={{color:'#64748b',fontSize:14,margin:'4px 0 0'}}>Total: {listaFiltrada.length} registros {aba==='documentos' && `• ${docsComArquivo} com PDF 📄`}</p></div><button onClick={abrirNovo} style={{...btn, background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:'12px 20px', borderRadius:20, fontSize:14}}>{aba==='documentos' ? `📎 Subir em ${pastaAtual==='Todas' ? 'PGR' : pastaAtual}` : aba==='epis' ? '🦺 Nova Entrega' : aba==='funcionarios' ? '👷 Novo Funcionário + PIN' : '＋ Adicionar'}</button></div>
            {aba==='epis' && (<div style={{background:'#fef9c3', border:'2px dashed #facc15', borderRadius:16, padding:14, marginTop:16, textAlign:'center', fontSize:13, color:'#854d0e'}}>🔑 <b>PIN OU ✍️ Assinatura OU 👆 Digital + 📄 PDF:</b> Seleciona, pede PIN OU assinatura OU digital, salva e gera o termo em PDF!</div>)}
            {aba==='funcionarios' && (<div style={{background:'#f0fdfa', border:'2px dashed #5eead4', borderRadius:16, padding:14, marginTop:16, textAlign:'center', fontSize:13, color:'#64748b'}}>🔑 Cada funcionário tem um PIN de 4 dígitos. Clica em <b>📋 Copiar PIN</b> e manda no WhatsApp dele.</div>)}
            {aba==='documentos' && (<div style={{marginTop:16}}><div style={{fontSize:13, fontWeight:800, color:'#0f766e', marginBottom:8}}>📁 PASTAS • Clique para abrir:</div><div style={{display:'flex', gap:8, flexWrap:'wrap'}}><button onClick={()=>setPastaAtual('Todas')} style={{...btn, background: pastaAtual==='Todas' ? '#0f766e' : '#f1f5f9', color: pastaAtual==='Todas' ? 'white' : '#0f172a', borderRadius:20, padding:'8px 16px'}}>📂 Todas ({docF.length})</button>{PASTAS.map(p=>(<button key={p.id} onClick={()=>setPastaAtual(p.id)} style={{...btn, background: pastaAtual===p.id ? p.cor : '#f1f5f9', color: pastaAtual===p.id ? 'white' : '#0f172a', borderRadius:20, padding:'8px 16px'}}>{p.icone} {p.nome} ({contarPasta(p.id)})</button>))}</div></div>)}
            <input placeholder={`🔍 Buscar em ${aba}...`} value={busca} onChange={e=>setBusca(e.target.value)} style={{...input, marginTop:16, background:'#f0fdfa'}} />
            <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:12}}>
              {listaFiltrada.map((item:any,i:number)=>{
                const corAvatar = CORES_CARDS[aba] || 'linear-gradient(135deg,#0d9488,#2563eb)'
                const pastaItem = item.pasta || item.tipo || 'Outros'
                return (
                <div key={item.id||item._id||i} style={{border:'1px solid #e0f2fe',borderRadius:20,padding:16,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap', background:'linear-gradient(135deg,#ffffff,#f0fdfa)'}}>
                  <div style={{display:'flex', gap:14, alignItems:'center', flex:1, minWidth:220}}>
                    <div style={{width:52,height:52,borderRadius:16,background:corAvatar, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:16, flexShrink:0}}>{aba==='documentos' ? '📄' : aba==='epis' ? '🦺' : iniciais(item.nome || item.titulo || item.localizacao || '??')}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:900, fontSize:16, color:'#0f172a'}}>{item.nome || item.titulo || item.localizacao || 'Registro'}</div>
                      <div style={{fontSize:13,color:'#64748b', marginTop:2}}>{aba==='empresas' ? `${item.responsavel||''} • ${item.telefone||''} • ${item.email||''}` : aba==='documentos' ? `Pasta: ${pastaItem} • Empresa: ${item.empresa||'-'} • Venc: ${item.vencimento||'-'}` : aba==='epis' ? `👷 ${item.funcionario||'-'} • 📅 ${item.data_entrega||'-'} • Qtd: ${item.quantidade||'1'} • ${item.tipo||''} ${item.pinConfirmado ? '• 🔑 PIN ✅' : ''} ${item.assinatura ? '• ✍️ Assinado' : ''} ${item.metodo ? `• ${item.metodo==='Digital' ? '👆 Digital' : item.metodo==='Assinatura' ? '✍️ Assinatura' : '🔑 PIN'}` : ''}` : aba==='funcionarios' ? `${item.cargo||''} • CPF: ${item.cpf||'-'} • ${item.telefone||''} • ${item.empresa||''}` : CAMPOS[aba]?.slice(1,4).map((c:any)=> item[c.k] ? `${c.l}: ${item[c.k]} • ` : '').join('')}</div>
                      {aba==='epis' && item.assinatura && <div style={{marginTop:8}}><img src={item.assinatura} style={{height:36, border:'1px solid #e2e8f0', borderRadius:8, background:'white', padding:2}} alt="assinatura" /><span style={{fontSize:11, color:'#64748b', marginLeft:8}}>Assinatura salva</span></div>}
                      {aba==='funcionarios' && (<div style={{display:'flex', gap:8, marginTop:8, flexWrap:'wrap', alignItems:'center'}}><span style={{background:'#fef9c3', color:'#854d0e', padding:'5px 12px', borderRadius:20, fontSize:13, fontWeight:900}}>🔑 PIN: {item.pin || '----'}</span><button onClick={()=>copiarPIN(item.pin||'', item.nome)} style={{...btn, background:'#f1f5f9', fontSize:12}}>{pinCopiado===item.nome ? '✅ Copiado!' : '📋 Copiar PIN p/ WhatsApp'}</button><button onClick={()=>{ const novoPin = gerarPIN(); const lista = [...(dados.funcionarios||[])]; const idx = lista.findIndex((x:any)=>(x.id||x._id)===(item.id||item._id)); if (idx>=0) { lista[idx] = {...lista[idx], pin: novoPin}; const nd={...dados, funcionarios: lista}; setDados(nd); salvarNoNavegador(nd); alert(`🔑 Novo PIN de ${item.nome}: ${novoPin}`) } }} style={{...btn, background:'#fee2e2', color:'#b91c1c', fontSize:12}}>🔄 Trocar PIN</button></div>)}
                      {aba==='documentos' && <span style={{display:'inline-block', marginTop:6, background:'#e0f2fe', color:'#1e40af', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:800}}>📁 {pastaItem} • 🏢 {item.empresa||'-'}</span>}
                      {aba==='documentos' && item.arquivoNome && <div style={{fontSize:12, color:'#0f766e', fontWeight:700, marginTop:6}}>📎 {item.arquivoNome}</div>}
                      {aba==='documentos' && item.arquivoData && (<div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}><button onClick={()=>verArquivo(item)} style={{...btn, background:'#dbeafe', color:'#1e40af'}}>👁️ Ver PDF</button><button onClick={()=>baixarArquivo(item)} style={{...btn, background:'#dcfce7', color:'#15803d'}}>⬇️ Baixar</button><select value={pastaItem} onChange={e=>moverPasta(item, e.target.value)} style={{padding:'6px 10px', borderRadius:10, border:'1px solid #cbd5e1', fontSize:12, fontWeight:700}}>{PASTAS.map(p=><option key={p.id} value={p.id}>Mover p/ {p.nome}</option>)}</select></div>)}
                      {aba==='empresas' && (<div style={{marginTop:8, display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}><span style={{background:'#e0f2fe',color:'#1d4ed8',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:700}}>Login: {item.login}</span><span style={{background:'#fef9c3',color:'#854d0e',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:700}}>Senha: {item.senha}</span><button onClick={()=>copiar(`Login: ${item.login} | Senha: ${item.senha}`, item.id)} style={{...btn, background:'#f1f5f9', fontSize:12}}>{senhaCopiada===item.id ? '✅ Copiado!' : '📋 Copiar Acesso'}</button></div>)}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8, flexWrap:'wrap'}}>
                    {aba==='epis' && <button onClick={()=>gerarTermoPDF(item)} style={{...btn, background:'#0f172a', color:'white'}}>📄 Gerar PDF</button>}
                    <button onClick={()=>abrirEditar(item)} style={{...btn, background:'#dbeafe', color:'#1e40af'}}>✏️ Editar</button>
                    <button onClick={()=>excluir(item)} style={{...btn, background:'#fee2e2', color:'#b91c1c'}}>🗑️ Excluir</button>
                  </div>
                </div>)
              })}
              {listaFiltrada.length===0 && <p style={{color:'#94a3b8', textAlign:'center', padding:20}}>{aba==='epis' ? '🦺 Nenhuma entrega ainda. Clica em 🦺 Nova Entrega!' : 'Nenhum registro ainda.'}</p>}
            </div>
          </div>
        )}
      </main>

      {modal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16}}>
          <div style={{background:'white', borderRadius:24, padding:24, width:'100%', maxWidth:540, maxHeight:'92vh', overflowY:'auto'}}>
            <h3 style={{margin:'0 0 4px', fontSize:20, fontWeight:900, color:'#0f766e'}}>{editando ? '✏️ Editar' : aba==='documentos' ? '📎 Subir Documento' : aba==='epis' ? '🦺 Nova Entrega de EPI' : aba==='funcionarios' ? '👷 Novo Funcionário' : '＋ Adicionar'} - {aba}</h3>
            {aba==='epis' && <p style={{fontSize:13, color:'#64748b', margin:'0 0 16px'}}>PIN OU Assinatura OU Digital + PDF = prova completa!</p>}
            {aba==='epis' ? (
              <div style={{display:'flex', flexDirection:'column', gap:14}}>
                <div style={{position:'relative'}}><label style={{fontSize:13, fontWeight:800}}>🦺 Qual EPI?</label><input value={buscaEPI} onChange={e=>{setBuscaEPI(e.target.value); setForm({...form, nome: e.target.value})}} placeholder="Ex: digita 'cap'..." style={{...input, marginTop:4}} />{buscaEPI.length>=1 && (<div style={{border:'1px solid #ccfbf1', borderRadius:12, marginTop:6, overflow:'hidden', background:'white', boxShadow:'0 8px 20px rgba(0,0,0,0.08)'}}>{episFiltrados.map((epi:any)=>(<button key={epi} type="button" onClick={()=>{setBuscaEPI(epi); setForm({...form, nome: epi})}} style={{display:'block', width:'100%', textAlign:'left', padding:'10px 12px', background:'white', border:'none', borderBottom:'1px solid #f0fdfa', cursor:'pointer', fontWeight:600}}>🦺 {epi}</button>))}</div>)} {form.nome && <div style={{fontSize:12, color:'#15803d', fontWeight:700, marginTop:6}}>✅ Selecionado: {form.nome}</div>}</div>
                <div><label style={{fontSize:13, fontWeight:800}}>📦 Tipo / Modelo</label><input value={form.tipo||''} onChange={e=>setForm({...form, tipo: e.target.value})} placeholder="Ex: CA 12345, Tamanho G" style={{...input, marginTop:4}} /></div>
                <div><label style={{fontSize:13, fontWeight:800}}>🔢 Quantidade</label><div style={{display:'flex', gap:8, marginTop:4}}>{['1','2','3','5','10'].map(q=>(<button key={q} type="button" onClick={()=>setForm({...form, quantidade: q})} style={{flex:1, padding:'10px', borderRadius:12, border: form.quantidade===q ? '2px solid #22c55e' : '1px solid #e2e8f0', background: form.quantidade===q ? '#dcfce7' : 'white', fontWeight:800, cursor:'pointer'}}>{q}</button>))}</div></div>
                <div style={{position:'relative'}}><label style={{fontSize:13, fontWeight:800}}>👷 Funcionário - digita nome OU CPF</label><input value={buscaFunc} onChange={e=>{setBuscaFunc(e.target.value); setForm({...form, funcionario: e.target.value}); setMostrarSugestoesFunc(true); setFuncSelecionado(null); setPinDigitado(''); setPinErro('')}} onFocus={()=>setMostrarSugestoesFunc(true)} placeholder="Ex: Maria ou 123.456..." style={{...input, marginTop:4}} />{mostrarSugestoesFunc && (<div style={{border:'1px solid #ccfbf1', borderRadius:12, marginTop:6, overflow:'hidden', background:'white', boxShadow:'0 8px 20px rgba(0,0,0,0.08)'}}><div style={{padding:'8px 12px', fontSize:11, fontWeight:800, color:'#0f766e', background:'#f0fdfa'}}>{funcsFiltrados.length} FUNCIONÁRIO(S) - CLICA</div>{funcsFiltrados.map((f:any)=>(<button key={f.id||f.cpf} type="button" onClick={()=>{setBuscaFunc(f.nome); setForm({...form, funcionario: f.nome, funcionarioCpf: f.cpf, funcionarioCargo: f.cargo, empresa: f.empresa || form.empresa}); setFuncSelecionado(f); setMostrarSugestoesFunc(false); setPinDigitado(''); setPinErro('')}} style={{display:'block', width:'100%', textAlign:'left', padding:'10px 12px', background:'white', border:'none', borderBottom:'1px solid #f0fdfa', cursor:'pointer'}}><div style={{fontWeight:800}}>👷 {f.nome}</div><div style={{fontSize:12, color:'#64748b'}}>CPF: {f.cpf||'-'} • {f.cargo||''} • 🔑 PIN: {f.pin||'----'}</div></button>))}</div>)} {funcSelecionado && <div style={{fontSize:12, color:'#15803d', fontWeight:700, marginTop:6}}>✅ {funcSelecionado.nome} • CPF: {funcSelecionado.cpf}</div>}</div>
                <div><label style={{fontSize:13, fontWeight:800}}>📅 Data da Entrega</label><div style={{display:'flex', gap:8, marginTop:4}}><input type="date" value={form.data_entrega||''} onChange={e=>setForm({...form, data_entrega: e.target.value})} style={{...input, flex:1}} /><button type="button" onClick={()=>setForm({...form, data_entrega: new Date().toISOString().split('T')[0]})} style={{...btn, background:'#dcfce7', color:'#15803d', whiteSpace:'nowrap'}}>📅 Hoje</button></div></div>
                {funcSelecionado && (<div style={{background:'#fef9c3', border:'2px solid #facc15', borderRadius:16, padding:16}}><label style={{fontSize:14, fontWeight:900, color:'#854d0e'}}>🔑 PIN de {funcSelecionado.nome.split(' ')[0]} - OU digital OU assinatura</label><p style={{fontSize:12, color:'#854d0e', margin:'4px 0 10px'}}>Escolhe UM: digita o PIN, OU encosta o dedo, OU assina embaixo.</p><div style={{display:'flex', gap:8}}><input type="password" inputMode="numeric" maxLength={4} value={pinDigitado} onChange={e=>{setPinDigitado(e.target.value.replace(/\D/g,'').slice(0,4)); setPinErro('')}} placeholder="• • • •" style={{...input, flex:1, textAlign:'center', fontSize:22, fontWeight:900, letterSpacing:8}} /><button type="button" onClick={()=>{ if (pinDigitado === (funcSelecionado.pin||'')) { setPinErro('✅ PIN correto! Pode salvar.'); } else { setPinErro('❌ PIN incorreto! Tenta de novo OU usa digital / assinatura.'); } }} style={{...btn, background:'#854d0e', color:'white', whiteSpace:'nowrap', padding:'12px 16px'}}>Verificar PIN</button></div>{pinErro && <div style={{fontSize:13, fontWeight:800, marginTop:8, color: pinErro.includes('✅') ? '#15803d' : '#b91c1c'}}>{pinErro}</div>}<div style={{display:'flex', gap:6, marginTop:10}}>{['1','2','3','4','5','6','7','8','9','0'].map(n=>(<button key={n} type="button" onClick={()=>setPinDigitado((pinDigitado+n).slice(0,4))} style={{flex:1, padding:'8px 0', borderRadius:10, border:'1px solid #facc15', background:'white', fontWeight:900, cursor:'pointer'}}>{n}</button>))}<button type="button" onClick={()=>setPinDigitado('')} style={{padding:'8px 12px', borderRadius:10, border:'1px solid #facc15', background:'#fee2e2', fontWeight:900, cursor:'pointer'}}>⌫</button></div></div>)}
                {funcSelecionado && (
                  <div style={{background:'#e0f2fe', border:'2px solid #2563eb', borderRadius:16, padding:16, textAlign:'center'}}>
                    <label style={{fontSize:14, fontWeight:900, color:'#1e40af'}}>👆 Digital de {funcSelecionado.nome.split(' ')[0]}</label>
                    <p style={{fontSize:12, color:'#475569', margin:'4px 0 12px'}}>Entrega o celular pra ele e pede pra encostar o dedo / rosto. Se der certo, não precisa de PIN nem assinatura.</p>
                    <button type="button" onClick={confirmarComDigital} disabled={digitalCarregando} style={{...btn, width:'100%', background: digitalOk ? '#22c55e' : '#2563eb', color:'white', padding:14, fontSize:15, borderRadius:12}}>
                      {digitalCarregando ? '⏳ Aguardando digital...' : digitalOk ? '✅ Digital Confirmada!' : '👆 Confirmar com Digital do Celular'}
                    </button>
                    {digitalMsg && <div style={{fontSize:13, fontWeight:800, marginTop:10, color: digitalMsg.includes('✅') ? '#15803d' : digitalMsg.includes('👆') ? '#854d0e' : '#b91c1c'}}>{digitalMsg}</div>}
                    <div style={{fontSize:11, color:'#64748b', marginTop:8}}>Funciona no celular com digital ou Face ID • Precisa estar no site com HTTPS (Vercel já é)</div>
                  </div>
                )}
                {funcSelecionado && (
                  <div style={{background:'#f0fdfa', border:'2px dashed #0d9488', borderRadius:16, padding:16}}>
                    <label style={{fontSize:14, fontWeight:900, color:'#0f766e'}}>✍️ Assinatura de {funcSelecionado.nome.split(' ')[0]} - SÓ SE NÃO USAR PIN NEM DIGITAL</label>
                    <p style={{fontSize:12, color:'#64748b', margin:'4px 0 10px'}}>Se já usou PIN ou Digital, não precisa assinar.</p>
                    <canvas ref={canvasRef} width={460} height={140} onMouseDown={iniciarAssinatura} onMouseMove={desenharAssinatura} onMouseUp={terminarAssinatura} onMouseLeave={terminarAssinatura} onTouchStart={iniciarAssinatura} onTouchMove={desenharAssinatura} onTouchEnd={terminarAssinatura} style={{width:'100%', height:140, background:'white', borderRadius:12, border:'1px solid #cbd5e1', touchAction:'none', cursor:'crosshair'}} />
                    <div style={{display:'flex', gap:8, marginTop:10}}><button type="button" onClick={limparAssinatura} style={{...btn, flex:1, background:'#fee2e2', color:'#b91c1c'}}>🧹 Limpar e assinar de novo</button><span style={{flex:1, textAlign:'center', fontSize:12, fontWeight:800, color: temAssinatura ? '#15803d' : '#94a3b8', padding:'8px 0'}}>{temAssinatura ? '✅ Assinatura pronta!' : 'Aguardando assinatura...'}</span></div>
                  </div>
                )}
                <div><label style={{fontSize:13, fontWeight:700}}>🏢 Empresa</label><input value={form.empresa||''} onChange={e=>setForm({...form, empresa: e.target.value})} placeholder="Empresa do funcionário" style={{...input, marginTop:4}} disabled={usuario?.tipo==='empresa'} /></div>
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                {(CAMPOS[aba]||[]).map((c:any)=>{
                  if (c.k==='empresa' && usuario?.tipo==='empresa') return null
                  if (c.k==='empresa' && usuario?.tipo==='admin' && aba==='documentos') return (<div key={c.k}><label style={{fontSize:13, fontWeight:700}}>🏢 {c.l}</label><input value={form[c.k]||''} onChange={e=>setForm({...form, [c.k]: e.target.value})} placeholder="Ex: Solnascente LTDA" style={{...input, marginTop:4}} /></div>)
                  if (c.k==='senha') return (<div key={c.k}><label style={{fontSize:13, fontWeight:700}}>🔐 {c.l}</label><div style={{display:'flex', gap:8, marginTop:4}}><input type={verSenha ? 'text' : 'password'} value={form[c.k]||''} onChange={e=>setForm({...form, [c.k]: e.target.value})} placeholder="Senha única" style={{...input, flex:1}} /><button onClick={()=>setVerSenha(!verSenha)} style={{...btn, background:'#f1f5f9'}}>{verSenha ? '🙈' : '👁️'}</button></div><button onClick={()=>setForm({...form, senha: gerarSenhaForte()})} style={{...btn, background:'#fef9c3', color:'#854d0e', marginTop:8, width:'100%', padding:10}}>🎲 Gerar senha forte automática</button></div>)
                  if (c.k==='login') return (<div key={c.k}><label style={{fontSize:13, fontWeight:700}}>👤 {c.l}</label><input value={form[c.k]||''} onChange={e=>setForm({...form, [c.k]: e.target.value.toLowerCase().replace(/[^a-z0-9]/g,'')})} placeholder="ex: solnascente" style={{...input, marginTop:4}} /></div>)
                  return (<div key={c.k}><label style={{fontSize:13, fontWeight:700}}>{c.l}</label><input type={c.k==='vencimento' || c.k==='data' ? 'date' : 'text'} value={form[c.k]||''} onChange={e=>setForm({...form, [c.k]: e.target.value})} placeholder={c.l} style={{...input, marginTop:4}} /></div>)
                })}
                {aba==='funcionarios' && (<div style={{background:'#fef9c3', border:'2px solid #facc15', borderRadius:16, padding:14}}><label style={{fontSize:13, fontWeight:900, color:'#854d0e'}}>🔑 PIN de Entrega - Individual!</label><div style={{display:'flex', gap:8, marginTop:8}}><input type={verPIN ? 'text' : 'password'} value={form.pin||''} onChange={e=>setForm({...form, pin: e.target.value.replace(/\D/g,'').slice(0,4)})} placeholder="4 dígitos" style={{...input, flex:1, textAlign:'center', fontSize:18, fontWeight:900, letterSpacing:4}} /><button type="button" onClick={()=>setVerPIN(!verPIN)} style={{...btn, background:'white'}}>{verPIN ? '🙈' : '👁️'}</button><button type="button" onClick={()=>setForm({...form, pin: gerarPIN()})} style={{...btn, background:'#854d0e', color:'white', whiteSpace:'nowrap'}}>🎲 Novo PIN</button></div></div>)}
                {aba==='documentos' && (<><div><label style={{fontSize:13, fontWeight:800, color:'#0f766e'}}>📁 Escolha a PASTA</label><div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:8}}>{PASTAS.map(p=>(<button key={p.id} type="button" onClick={()=>setPastaSelecionadaForm(p.id)} style={{padding:'10px 6px', borderRadius:12, border: pastaSelecionadaForm===p.id ? `2px solid ${p.cor}` : '1px solid #e2e8f0', background: pastaSelecionadaForm===p.id ? '#f0fdfa' : 'white', cursor:'pointer', fontWeight:800, fontSize:12}}>{p.icone} {p.nome}</button>))}</div></div><div style={{background:'#f0fdfa', border:'2px dashed #5eead4', borderRadius:16, padding:16, textAlign:'center'}}><div style={{fontWeight:800, color:'#0f766e', marginBottom:8}}>📁 Subir arquivo</div><label style={{display:'block', background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:'12px', borderRadius:12, fontWeight:800, cursor:'pointer'}}>{subindoArquivo ? '⏳ Subindo...' : arquivoNome ? `✅ ${arquivoNome}` : '📎 Clique para escolher PDF / Imagem / Word'}<input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleArquivo} style={{display:'none'}} /></label></div></>)}
              </div>
            )}
            <div style={{display:'flex', gap:10, marginTop:20}}><button onClick={()=>setModal(false)} style={{...btn, flex:1, background:'#f1f5f9', padding:12}}>Cancelar</button><button onClick={salvar} style={{...btn, flex:1, background:'linear-gradient(90deg,#0d9488,#2563eb)', color:'white', padding:12}}>{aba==='epis' ? '✅ Confirmar Entrega + Gerar PDF' : '💾 Salvar'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}