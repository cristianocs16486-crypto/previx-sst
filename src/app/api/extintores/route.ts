import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const lista = await prisma.extintor.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(lista)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.localizacao) {
      return NextResponse.json({ error: 'Preencha a localização' }, { status: 400 })
    }

    const novo = await prisma.extintor.create({
      data: {
        capacidade: body.capacidade || '6kg',
        localizacao: body.localizacao,
        ultimaRecarga: body.ultimaRecarga || '',
        vencimento: body.vencimento || body.validade || '',
        status: 'OK'
      }
    })

    return NextResponse.json(novo)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}