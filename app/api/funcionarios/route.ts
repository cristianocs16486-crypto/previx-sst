export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await prisma.funcionario.findMany({ include: { epis: true }, orderBy: { nome: 'asc' } })
    return NextResponse.json(data)
  } catch (e:any) {
    return NextResponse.json({error: e.message}, {status:500})
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Recebido:', body)
    const data = await prisma.funcionario.create({ 
      data: { 
        nome: body.nome, 
        funcao: body.funcao 
      } 
    })
    return NextResponse.json(data)
  } catch (e:any) {
    console.error(e)
    return NextResponse.json({error: e.message}, {status:500})
  }
}
