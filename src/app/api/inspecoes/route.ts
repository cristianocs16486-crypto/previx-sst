import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const lista = await prisma.inspecao.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(lista)
}

export async function POST(req: Request) {
  try {
    const b = await req.json()

    if (!b.titulo && !b.local) {
      return NextResponse.json({ error: 'Preencha título e local' }, { status: 400 })
    }

    const novo = await prisma.inspecao.create({
      data: {
        titulo: b.titulo || b.local || 'Inspeção',
        local: b.local || '',
        data: b.data || '',
        status: b.status || 'Pendente',
        observacao: b.observacao || ''
      }
    })

    return NextResponse.json(novo)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}