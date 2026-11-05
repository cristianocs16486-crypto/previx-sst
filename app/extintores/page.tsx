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
    <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>NR-23 - Protecao contra Incendios</h1>
            <p style={{ margin: '4px 0', color: '#64748b' }}>{extintores.length} extintor(es) - Gestao de validade automatica</p>
          </div>
          <Link href="/extintores/novo" style={{ padding: '10px 20px', background: '#dc2626', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>+ Novo Extintor</Link>
        </div>

        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fef2f2', textAlign: 'left', fontSize: 12, color: '#991b1b' }}>
                <th style={{ padding: 12 }}>NUMERO</th>
                <th style={{ padding: 12 }}>TIPO</th>
                <th style={{ padding: 12 }}>CAPACIDADE</th>
                <th style={{ padding: 12 }}>LOCAL</th>
                <th style={{ padding: 12 }}>VENCIMENTO</th>
                <th style={{ padding: 12 }}>STATUS</th>
                <th style={{ padding: 12 }}>ACAO</th>
              </tr>
            </thead>
            <tbody>
              {extintores.map((e: any) => (
                <tr key={e.id} style={{ borderTop: '1px solid #f1f5f9', fontSize: 14 }}>
                  <td style={{ padding: 12, fontWeight: 700 }}>{e.numero}</td>
                  <td style={{ padding: 12 }}>{e.tipo}</td>
                  <td style={{ padding: 12 }}>{e.capacidade}</td>
                  <td style={{ padding: 12 }}>{e.localizacao}</td>
                  <td style={{ padding: 12 }}>{new Date(e.vencimento).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: 12, color: '#047857', fontWeight: 700 }}>OK</td>
                  <td style={{ padding: 12 }}>
                    <form action={deletar}><input type="hidden" name="id" value={e.id} /><button style={{ background: '#fee2e2', color: '#dc2626', border: 0, padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Excluir</button></form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {extintores.length === 0 && <p style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>Nenhum extintor cadastrado ainda.</p>}
        </div>
      </div>
    </div>
  )
}