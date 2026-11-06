import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const lista = await prisma.funcionario.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(lista)
}

export async function POST(req: Request) {
  try {
    const b = await req.json()

    if (!b.nome) {
      return NextResponse.json({ error: 'Preencha o nome' }, { status: 400 })
    }

    const novo = await prisma.funcionario.create({
      data: {
        nome: b.nome,
        cargo: b.cargo || '',
        empresa: b.empresa || 'Sol Nascente',
        cpf: b.cpf || ''
      }
    })

    return NextResponse.json(novo)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}