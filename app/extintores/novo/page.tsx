export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default function NovoExtintor() {
  async function criar(formData: FormData) {
    'use server'
    const numero = formData.get('numero') as string
    const tipo = formData.get('tipo') as string
    const capacidade = formData.get('capacidade') as string
    const localizacao = formData.get('localizacao') as string
    const ultimaRecarga = new Date(formData.get('ultimaRecarga') as string)
    const vencimento = new Date(formData.get('vencimento') as string)
    
    const diff = vencimento.getTime() - new Date().getTime()
    const status = diff < 0 ? 'VENCIDO' : diff < 1000*60*60*24*30 ? 'A VENCER' : 'VÃLIDO'

    await prisma.extintor.create({
      data: { numero, tipo, capacidade, localizacao, ultimaRecarga, vencimento, status }
    })
    redirect('/extintores')
  }

  return (
    <div style={{padding:24, background:'#f8fafc', minHeight:'100vh', fontFamily:'Inter, sans-serif'}}>
      <div style={{maxWidth:500, margin:'0 auto', background:'white', padding:24, borderRadius:12}}>
        <h1 style={{fontSize:20, fontWeight:800}}>Novo Extintor - NR-23</h1>
        <form action={criar} style={{display:'flex', flexDirection:'column', gap:12, marginTop:16}}>
          <input name="numero" placeholder="NÃºmero (ex: EXT 02)" required style={input} />
          <select name="tipo" required style={input}>
            <option>PQS</option>
            <option>CO2</option>
            <option>ÃGUA</option>
            <option>ESPUMA</option>
          </select>
          <input name="capacidade" placeholder="Capacidade (ex: 6KG, 4KG)" required style={input} />
          <input name="localizacao" placeholder="LocalizaÃ§Ã£o (ex: ESCRITÃ“RIO)" required style={input} />
          <label style={{fontSize:12, fontWeight:600}}>Ãšltima Recarga</label>
          <input type="date" name="ultimaRecarga" required style={input} defaultValue={new Date().toISOString().split('T')[0]} />
          <label style={{fontSize:12, fontWeight:600}}>Vencimento (1 ano depois)</label>
          <input type="date" name="vencimento" required style={input} />
          <button type="submit" style={{padding:12, background:'#dc2626', color:'white', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer'}}>Salvar Extintor</button>
        </form>
      </div>
    </div>
  )
}

const input = {padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:8} as const
