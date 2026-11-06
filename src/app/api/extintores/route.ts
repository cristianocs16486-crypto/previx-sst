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
    const local = body.local || ''
    const tipo = body.tipo || ''
    // a página manda "validade", o banco chama "vencimento"
    const validade = body.validade || body.vencimento || ''

    if (!local || !tipo || !validade) {
      return NextResponse.json({ error: 'Preencha local, tipo e validade' }, { status: 400 })
    }

    const criado = await prisma.extintor.create({
      data: {
        local,
        tipo,
        vencimento: new Date(validade + 'T12:00:00'),
      }
    })
    return NextResponse.json(criado, { status: 201 })
  } catch (e: any) {
    console.log('ERRO POST EXTINTOR:', e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}