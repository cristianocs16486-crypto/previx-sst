export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export default async function ExtintoresPage() {
  const extintores = await prisma.extintor.findMany({ orderBy: { createdAt: 'desc' } })

  async function deletar(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await prisma.extintor.delete({ where: { id } })
    revalidatePath('/extintores')
  }

  return (
    <div style={{padding:24, fontFamily:'Inter, sans-serif', background:'#f8fafc', minHeight:'100vh'}}>
      <div style={{maxWidth:1100, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
          <div>
            <h1 style={{fontSize:24, fontWeight:800, margin:0}}>NR-23 - ProteÃ§Ã£o contra IncÃªndios</h1>
            <p style={{margin:'4px 0 0', color:'#64748b'}}>{extintores.length} extintor(es) â€¢ GestÃ£o de validade automÃ¡tica</p>
          </div>
          <Link href="/extintores/novo" style={{padding:'10px 20px', background:'#dc2626', color:'white', borderRadius:8, textDecoration:'none', fontWeight:600}}>+ Novo Extintor</Link>
        </div>

        <div style={{background:'white', borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,0.1)', overflow:'hidden'}}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#fef2f2', textAlign:'left', fontSize:12, color:'#991b1b'}}>
                <th style={{padding:12}}>NÃšMERO</th>
                <th style={{padding:12}}>TIPO</th>
                <th style={{padding:12}}>CAPACIDADE</th>
                <th style={{padding:12}}>LOCAL</th>
                <th style={{padding:12}}>VENCIMENTO</th>
                <th style={{padding:12}}>STATUS</th>
                <th style={{padding:12, textAlign:'right'}}>AÃ‡ÃƒO</th>
              </tr>
            </thead>
            <tbody>
              {extintores.map((e) => (
                <tr key={e.id} style={{borderTop:'1px solid #f1f5f9'}}>
                  <td style={{padding:14, fontWeight:600}}>{e.numero}</td>
                  <td style={{padding:14}}>{e.tipo}</td>
                  <td style={{padding:14}}>{e.capacidade}</td>
                  <td style={{padding:14}}>{e.localizacao}</td>
                  <td style={{padding:14}}>{new Date(e.vencimento).toLocaleDateString('pt-BR')}</td>
                  <td style={{padding:14}}><span style={{
                    padding:'4px 8px', borderRadius:6, fontSize:11, fontWeight:700,
                    background: e.status==='VENCIDO' ? '#fee2e2' : e.status==='A VENCER' ? '#fef9c3' : '#dcfce7',
                    color: e.status==='VENCIDO' ? '#dc2626' : e.status==='A VENCER' ? '#ca8a04' : '#16a34a'
                  }}>{e.status}</span></td>
                  <td style={{padding:14, textAlign:'right'}}>
                    <form action={deletar}><input type="hidden" name="id" value={e.id} /><button style={{border:'1px solid #e2e8f0', padding:'6px 10px', borderRadius:6, cursor:'pointer', color:'#ef4444'}}>Excluir</button></form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
