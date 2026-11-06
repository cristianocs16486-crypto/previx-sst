import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() {
  const lista = await prisma.epi.findMany({ include: { funcionario: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(lista)
}
export async function POST(req: Request) {
  try {
    const b = await req.json()
    if (!b.funcionarioId || !b.nomeEpi || !b.ca) return NextResponse.json({ error: 'Selecione funcionário, nome do EPI e CA' }, { status: 400 })
    const novo = await prisma.epi.create({
      data: { funcionarioId: b.funcionarioId, funcionarioNome: b.funcionarioNome || null, nomeEpi: b.nomeEpi, ca: b.ca, data: b.data || new Date().toISOString().slice(0, 10), pinAssinatura: b.pinAssinatura || null }
    })
    return NextResponse.json(novo)
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Sem id' }, { status: 400 })
  await prisma.epi.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}