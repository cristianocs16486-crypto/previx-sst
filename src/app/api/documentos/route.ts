import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const lista = await prisma.documento.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(lista)
}

export async function POST(req: Request) {
  try {
    const b = await req.json()

    if (!b.nome || !b.vencimento) {
      return NextResponse.json({ error: 'Preencha nome e vencimento' }, { status: 400 })
    }

    const novo = await prisma.documento.create({
      data: {
        nome: b.nome,
        empresa: b.empresa || 'Sol Nascente',
        vencimento: b.vencimento
      }
    })

    return NextResponse.json(novo)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}