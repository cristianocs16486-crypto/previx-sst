import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const lista = await prisma.epi.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(lista)
}

export async function POST(req: Request) {
  try {
    const b = await req.json()

    if (!b.nome) {
      return NextResponse.json({ error: 'Preencha o nome do EPI' }, { status: 400 })
    }

    const novo = await prisma.epi.create({
      data: {
        nome: b.nome,
        descricao: b.descricao || '',
        quantidade: Number(b.quantidade) || 0
      }
    })

    return NextResponse.json(novo)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}