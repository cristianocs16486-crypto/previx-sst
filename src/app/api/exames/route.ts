import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const exames = await prisma.exame.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(exames);
}

export async function POST(req: Request) {
  const { funcionario, tipo, resultado } = await req.json();
  const novo = await prisma.exame.create({
    data: { funcionario, tipo, resultado }
  });
  return Response.json(novo);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Sem id" }, { status: 400 });
  await prisma.exame.delete({ where: { id } });
  return Response.json({ ok: true });
}