import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const lista = await prisma.exame.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(lista)
}

export async function POST(req: Request) {
  try {
    const b = await req.json()
    if (!b.funcionario || !b.tipo) return NextResponse.json({ error: 'Preencha funcionário e tipo' }, { status: 400 })
    const novo = await prisma.exame.create({
      data: {
        funcionario: b.funcionario,
        tipo: b.tipo,
        data: b.data ? new Date(b.data) : new Date(),
        resultado: b.resultado || 'Apto',
      }
    })
    return NextResponse.json(novo)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Sem id' }, { status: 400 })
  await prisma.exame.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}