export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
export async function GET() {
  const data = await prisma.extintor.findMany({ orderBy: { vencimento: 'asc' } })
  return NextResponse.json(data)
}
