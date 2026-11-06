import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const dados = await prisma.empresa.findMany({ orderBy: { nome: 'asc' } })
  return NextResponse.json(dados)
}

export async function POST(req: Request) {
  const { nome, cnpj, email, senha } = await req.json()
  if (!nome || !email || !senha) return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios' }, { status: 400 })
  const existe = await prisma.empresa.findUnique({ where: { email } })
  if (existe) return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 })
  const nova = await prisma.empresa.create({ data: { nome, cnpj: cnpj || '', email, senha } })
  return NextResponse.json(nova, { status: 201 })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Sem id' }, { status: 400 })
  await prisma.empresa.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
