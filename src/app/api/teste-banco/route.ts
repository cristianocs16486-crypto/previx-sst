import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const total = await prisma.funcionario.count()
    return NextResponse.json({ ok: true, mensagem: 'Banco conectado!', funcionarios: total })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}