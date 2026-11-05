'use client'
import { useEffect, useState } from 'react'
import jsPDF from 'jspdf'

export default function RelatorioPage() {
  const [extintores, setExtintores] = useState<any[]>([])
  const [logoPrevix, setLogoPrevix] = useState<string | null>(null)
  const [logoCliente, setLogoCliente] = useState<string | null>(null)
  const [nomeCliente, setNomeCliente] = useState('ESCRITORIO - CLIENTE DEMO')

  useEffect(() => {
    fetch('/api/extintores').then(r=>r.json()).then(setExtintores)
  }, [])

  function handleLogo(e: any, setLogo: any) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogo(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function gerarPDF() {
    const doc = new jsPDF()
    
    // Fundo vermelho
    doc.setFillColor(220,38,38)
    doc.rect(0,0,210,35,'F')
    
    // Logos se tiver
    if (logoPrevix) {
      try { doc.addImage(logoPrevix, 'PNG', 10, 5, 25, 25) } catch {}
    }
    if (logoCliente) {
      try { doc.addImage(logoCliente, 'PNG', 175, 5, 25, 25) } catch {}
    }

    doc.setTextColor(255,255,255)
    doc.setFontSize(16)
    doc.setFont('helvetica','bold')
    doc.text('PREVIX SST - RELATORIO NR-23', logoPrevix ? 40 : 10, 18)
    doc.setFontSize(9)
    doc.setFont('helvetica','normal')
    doc.text('Protecao contra Incendios - NBR 12693 e NR-23', logoPrevix ? 40 : 10, 24)
    doc.text(`Cliente: ${nomeCliente}`, logoPrevix ? 40 : 10, 29)

    doc.setTextColor(0,0,0)
    doc.setFontSize(11)
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')} - Total: ${extintores.length} extintores`, 10, 45)

    let y=55
    doc.setFontSize(9)
    extintores.forEach((e:any)=>{
      if(y>280){ doc.addPage(); y=20 }
      const linha = `${e.numero} | ${e.tipo} ${e.capacidade} | ${e.localizacao} | Venc: ${new Date(e.vencimento).toLocaleDateString('pt-BR')} | ${e.status}`
      doc.text(linha, 10, y)
      y+=7
    })
    
    y+=10
    doc.setFontSize(10)
    doc.setFont('helvetica','bold')
    doc.text('Declaracao de Conformidade NR-23', 10, y)
    y+=6
    doc.setFont('helvetica','normal')
    doc.setFontSize(9)
    doc.text('Atestamos que os extintores acima estao em conformidade com a NR-23 e NBR 12693.', 10, y)
    y+=5
    doc.text('Validade do laudo: 1 ano apos recarga. Proxima inspecao conforme NBR 12962.', 10, y)
    y+=15
    doc.text('_______________________________________', 10, y)
    y+=5
    doc.text('Responsavel Tecnico - Previx SST', 10, y)
    doc.text('_______________________________________', 120, y-5)
    doc.text('Cliente - Ciente', 130, y)

    doc.save(`Relatorio-NR23-${nomeCliente}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div style={{padding:24, maxWidth:900, margin:'0 auto', fontFamily:'sans-serif'}}>
      <h1 style={{fontSize:22, fontWeight:800}}>Relatório NR-23 - Premium com Logos</h1>
      
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:20, background:'#f9fafb', padding:16, borderRadius:12, border:'1px solid #e5e7eb'}}>
        <div>
          <label style={{fontWeight:700, fontSize:14}}>Nome do Cliente:</label>
          <input value={nomeCliente} onChange={e=>setNomeCliente(e.target.value)} style={{width:'100%', padding:10, marginTop:6, borderRadius:8, border:'1px solid #ccc'}} />
        </div>
        <div>
          <label style={{fontWeight:700, fontSize:14}}>Qtd:</label>
          <div style={{padding:10, fontWeight:800}}>{extintores.length} extintores</div>
        </div>
        <div>
          <label style={{fontWeight:700, fontSize:14}}>Logo Previx (sua):</label>
          <input type="file" accept="image/*" onChange={e=>handleLogo(e, setLogoPrevix)} style={{width:'100%', marginTop:6}} />
          {logoPrevix && <img src={logoPrevix} style={{height:50, marginTop:8, border:'1px solid #ddd'}} />}
        </div>
        <div>
          <label style={{fontWeight:700, fontSize:14}}>Logo Cliente:</label>
          <input type="file" accept="image/*" onChange={e=>handleLogo(e, setLogoCliente)} style={{width:'100%', marginTop:6}} />
          {logoCliente && <img src={logoCliente} style={{height:50, marginTop:8, border:'1px solid #ddd'}} />}
        </div>
      </div>

      <button onClick={gerarPDF} style={{marginTop:20, padding:'14px 28px', background:'#dc2626', color:'white', border:'none', borderRadius:10, fontWeight:800, fontSize:16, cursor:'pointer', width:'100%'}}>
        📄 Baixar PDF Premium com Logos
      </button>

      <div style={{marginTop:16, fontSize:13, color:'#6b7280'}}>
        Dica: Use PNG com fundo transparente. Pega logo no Google ou Canva.
      </div>
    </div>
  )
}