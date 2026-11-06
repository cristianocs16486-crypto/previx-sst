import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await prisma.extintor.findMany({ orderBy: { vencimento: 'asc' } })
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // a página manda "local" e "validade", o banco chama "localizacao" e "vencimento"
    const localizacao = body.localizacao || body.local || ''
    const tipo = body.tipo || ''
    const validade = body.validade || body.vencimento || ''

    if (!localizacao || !tipo || !validade) {
      return NextResponse.json({ error: 'Preencha local, tipo e validade' }, { status: 400 })
    }

    const criado = await prisma.extintor.create({
      data: {
        numero: body.numero || '1',
        tipo,
        capacidade: body.capacidade || '6kg',
        localizacao,
        ultimaRecarga: body.ultimaRecarga ? new Date(body.ultimaRecarga) : new Date(),
        vencimento: new Date(validade + 'T12:00:00'),
        status: 'OK',
      }
    })
    return NextResponse.json(criado, { status: 201 })
  } catch (e: any) {
    console.log('ERRO POST EXTINTOR:', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id') || url.pathname.split('/').pop()
    if (id) await prisma.extintor.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}