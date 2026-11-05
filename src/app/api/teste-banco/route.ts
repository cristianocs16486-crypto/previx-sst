import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const teste = await prisma.exame.create({
      data: { funcionario: "TESTE-BANCO", tipo: "Periódico", resultado: "Apto" }
    });
    const total = await prisma.exame.count();
    return Response.json({ ok: true, salvou: teste, total_no_banco: total });
  } catch (e: any) {
    return Response.json({ ok: false, erro: String(e.message) }, { status: 500 });
  }
}