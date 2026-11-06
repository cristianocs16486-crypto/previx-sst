import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const lista = await prisma.funcionario.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(lista)
}

export async function POST(req: Request) {
  try {
    const b = await req.json()
    if (!b.nome || !b.funcao || !b.cpf) return NextResponse.json({ error: 'Preencha nome, função e CPF' }, { status: 400 })
    const novo = await prisma.funcionario.create({
      data: {
        nome: b.nome,
        funcao: b.funcao,
        cargo: b.cargo || null,
        cpf: b.cpf,
        telefone: b.telefone || null,
        whatsapp: b.whatsapp || null,
        salario: b.salario || null,
        pin: b.pin || '1234',
      }
    })
    return NextResponse.json(novo)
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'CPF já cadastrado' }, { status: 400 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Sem id' }, { status: 400 })
  await prisma.epi.deleteMany({ where: { funcionarioId: id } })
  await prisma.funcionario.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}